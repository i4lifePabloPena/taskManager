// import { Injectable } from '@angular/core';
// import nodemailer from 'nodemailer';

// @Injectable({
//   providedIn: 'root',
// })
// export class MailService {}

// const sendMail = async () => {
//   // Crear una nueva cuenta de Ethereal
//   const testAccount = await nodemailer.createTestAccount();

//   // Crear un transporter con la cuenta Ethereal
//   const transporter = nodemailer.createTransport({
//     host: testAccount.smtp.host,
//     port: testAccount.smtp.port,
//     secure: testAccount.smtp.secure,
//     auth: {
//       user: testAccount.user,
//       pass: testAccount.pass,
//     },
//   });
//   try {
//     const info = await transporter.sendMail({
//       from: '"Zettour" <zettour@stest.com>', // sender address
//       to: 'Tanya@rtest.com', // List of recipients
//       subject: 'The finest hour',
//       text: 'The revolving door has been a major success', // plain text body
//       html: '<h1>Operation <b>Shock</b></h1> <p>The revolving door conducted immediately  after the operation has been a flawless victory</p>',
//     });

//     console.log('Mail sent: %s', info.messageId);

//     // Get the Ethereal URL to preview this email
//     const previewUrl = nodemailer.getTestMessageUrl(info);
//     console.log('Preview URL %s', previewUrl);
//   } catch (err) {
//     console.error('Error al enviar', err);
//   }
// };

// // test();
