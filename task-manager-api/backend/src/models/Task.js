const mongoose = require('mongoose');
const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    status: { type: Number, default: 0 },
    url: { type: String, default: '' },
    userId: { type: mongoose.Schema.Types.ObjectId},
    idTags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
    limitDate: {type: Date},
    trash: {type: Boolean, default: false},
}, { timestamps: true });
const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
