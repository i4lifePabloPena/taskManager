require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db.js'); 
const app = express();
const PORT = process.env.PORT || 5000;
const nodemailer = require("nodemailer"); // Mail

app.use(cors());
app.use(express.json()); // Permite recibir JSON en las solicitudes

// Image folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Conectar a MongoDB 
connectDB(); 
const taskRoutes = require('./routes/tasks.routes');
const authRoutes = require('./routes/auth.routes');
const tagRoutes = require('./routes/tag.routes.js')

app.use('/api', taskRoutes);
app.use('/api', authRoutes);
app.use('/api', tagRoutes);

app.get('/', (req, res) => { 
    res.send('¡Servidor funcionando!'); 
}); 


app.listen(PORT, () => { 
    console.log(`Servidor corriendo en http://localhost:${PORT}`); 
}); 

/*
// mail

// Transporter

// Crear una nueva cuenta de Ethereal
const testAccount = await nodemailer.createTestAccount();

// Crear un transporter con la cuenta Ethereal
const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
        user: testAccount.user,
        pass: testAccount.pass
    },
});

*/