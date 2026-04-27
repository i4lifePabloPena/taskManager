const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const Tag = require("../models/tagModel");


// Crear nueva tag
router.post('/tag', authMiddleware, async(req, res) => {
    try{
        const { nameTag } = req.body;
        if (!nameTag) return res.status(400).json({Error: "Name tag required"});
        const tag = new Tag({nameTag});
        await tag.save();
        res.json(tag);
    } catch (error) {
        res.status(400).json({Error: "Name tag already exists"});
    }
});
module.exports = router;

// Lee las tags existentes
router.get('/tag', authMiddleware, async (req, res) =>{
    try{
        const tags = await Tag.find();
        res.json(tags);
    }catch (error){
        res.status(500).json({ Error: "Error to obtain tags"});
    }
});

// Delete tag
router.delete('/tag/:id', authMiddleware, async(req, res) =>{
    try{
        if (req.userRole != "admin") {
            return res.status(401).json({ error: "Access denegated" });
        }
        const {id} = req.params;
        let query ={_id: id};
        const tag = await Tag.findOne(query);
        if (!tag){return res.status(404).json({ Error: "Tag not found" })};
        await Tag.findByIdAndDelete(id);
        res.json({response: "Tag deleted successfully"})
    }catch{
        res.status(500).json({Error: "Error to delete tag"});
    }
});