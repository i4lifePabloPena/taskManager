const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // New
    role: {type: String, default: "user"},
    name: {type: String},
    email: {type: String, required: true, unique: true},
    createdAt: {type: Date}
});
// Hashear la contraseña antes de guardar
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
        this.password = await bcrypt.hash(this.password, 10);
    });
module.exports = mongoose.model('User', UserSchema);