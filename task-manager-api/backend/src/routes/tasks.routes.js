const express = require('express');
const router = express.Router();
const Task = require('../models/Task.js');
const authMiddleware = require('../middleware/auth.middleware');


// Obtener las tareas requiere de un query con el estado de la tarea
router.get('/tasks', authMiddleware, async (req, res) => {
    try {
        const tasks = await Task.find({status: req.query.status ,userId: req.userId});
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener tareas'});
    }
});

// Agregar una nueva tarea
router.post('/tasks',authMiddleware , async (req, res) => {
    try {
        const { title } = req.body;
        if (!title) return res.status(400).json({ error: "El título es obligatorio" });
        const task = new Task({ title, status: 0, userId: req.userId });
        await task.save();
        res.json(task);
        res.status(201).json(Task);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la tarea'});
    }
})

// Marcar una tarea como completada
router.put('/tasks/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findOne({ _id: id, userId: req.userId });
        if (!task) return res.status(404).json({ error: "Tarea no encontrada" });

        switch (task.status) {
            case 0:
                task.status = 1;
                break;
            case 1:
                task.status = 2;
                break;
            default:
                task.status = 0;
        }

        await task.save();
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la tarea' });
    }
});

// Eliminar una tarea
router.delete('/tasks/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findOne({ _id: id, userId: req.userId });
        if (!task) return res.status(404).json({ error: "Tarea no encontrada" });
        await Task.findByIdAndDelete(task);
        res.json({ message: "Tarea eliminada" });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la tarea'});
    }
});
module.exports = router;