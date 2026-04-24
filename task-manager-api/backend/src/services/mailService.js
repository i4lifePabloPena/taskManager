const nodemailer = require('nodemailer');

const sendMail = async (to, subject, text, html) => {
    try {
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

        const info = await transporter.sendMail({
            from: '"Task Manager" <taskmanager@test.com>', // sender address
            to: to, // List of recipients
            subject: subject,
            text: text, // plain text body
            html: html
        });

        console.log("Mail sent: %s", info.messageId);

        // Get the Ethereal URL to preview this email
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log("Preview URL: %s", previewUrl);

        return { success: true, messageId: info.messageId, previewUrl };
    } catch (err) {
        console.error("Error al enviar correo:", err);
        return { success: false, error: err.message };
    }
};

module.exports = { sendMail };