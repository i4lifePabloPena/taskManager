const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const SECRET_KEY = 'DYKL+WK+SjXTEHj6RKLMsowPXqvqkdZZEW0gooPShXI=';
module.exports = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denegated' });
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const user = await User.findById(decoded.userId);
        if (!user) return res.status(401).json({ error: 'User not found' });
        req.userId = user._id;
        req.userRole = user.role
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid Token' });
    }
};
