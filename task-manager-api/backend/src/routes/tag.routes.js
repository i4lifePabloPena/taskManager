const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const Tag = require("../models/tagModel");


// Crear nueva tag
router.post('/tag', authMiddleware, async(req, res) => {
    try{
        const{nameTag} = req.query
        if (!nameTag) return res.status(400).json({Error: "nameTag requerida"});
        const tag = new Tag({nameTag});
        await tag.save();
        res.json(tag);
    }catch (error){
        res.status(400).json({Error: "Ya existe esa tag"});
    }
});
module.exports = router;

// Lee las tags existentes
router.get('/tag', async (req, res) =>{
    try{
        const tags = await Tag.find();
        res.json(tags);
    }catch (error){
        res.status(500).json({ Error: "Error al obtener los tags"});
    }
});

// Delete tag
router.delete('/tag/:id', authMiddleware, async(req, res) =>{
    try{
        const {id} = req.params;
        let query ={_id: id};
        const tag = await Tag.findOne(query);
        if (!tag){return res.status(404).json({ Error: "La tag no existe" })};
        await Tag.findByIdAndDelete(id);
        res.json({response: "Tag eliminada"})
    }catch{
        res.status(500).json({Error: "Error al eleminar el tag"});
    }
});