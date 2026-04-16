const express = require('express');
const router = express.Router();
const Task = require('../models/Task.js');
const authMiddleware = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// multer config
const uploadDir = path.join(__dirname, '../../uploads');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {cb(null, uploadDir)}, //;
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extype = allowedTypes.test(path.extname(file.originalname).toLowerCase()); //toLC
        if (extype) {
            return cb(null, true);
        } else {
            cb(new Error('Solo jpeg, jpg, png, gif'));
        }
    }
});

// Obtener las tareas requiere de un query con el estado de la tarea
router.get('/tasks', authMiddleware, async (req, res) => {
    try {
        let query = { status: req.query.status };
        if (req.userRole !== 'admin') {
            query.userId = req.userId;
        }
        const tasks = await Task.find(query);
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
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la tarea'});
    }
})

// Subir archivo
router.post('/tasks/:id/upload', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.file) {
            return res.status(400).json({ error: 'No hay archivo' });
        }
        
        let query = { _id: id };
        if (req.userRole !== 'admin') {
            query.userId = req.userId;
        }
            
            const task = await Task.findOne(query);
        if (!task) return res.status(404).json({ error: "La tarea no existe" });
        
        const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        task.url = fileUrl;
        await task.save();
        
        res.json({ message: 'Archivo subido', url: fileUrl, task });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Error al subir el archivo' });
    }
});

// Marcar una tarea como completada
router.put('/tasks/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        let query = { _id: id };
        if (req.userRole !== 'admin') {
            query.userId = req.userId;
        }
        const task = await Task.findOne(query);
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
        let query = { _id: id };
        if (req.userRole !== 'admin') {
            query.userId = req.userId;
        }
        const task = await Task.findOne(query);
        if (!task) return res.status(404).json({ error: "Tarea no encontrada" });
        
        // delete imagen
        if (task.url) {
            const filePath = path.join(__dirname, '../../', task.url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        
        await Task.findByIdAndDelete(id);
        res.json({ message: "Tarea eliminada" });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la tarea'});
    }
});

// Agregar tags
router.put("/task/:id", authMiddleware, async(req, res) => {
    try{
        const {id} = req.params;
        let query = {_id: id};
        const task = await Task.findOne(query);
        if (!task) return res.status(404).json({Error: "No existe esa tarea"})
        await task.save();
        res.json(task);
    } catch{
        res.status(500).json({ Error: "Error al añadir el tag"})
    }
});
module.exports = router;