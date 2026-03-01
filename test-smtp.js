
const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        const info = await transporter.sendMail({
            from: '"Test" <' + process.env.SMTP_USER + '>',
            to: process.env.SMTP_USER,
            subject: "SMTP Test",
            text: "If you see this, SMTP is working!",
        });
        console.log("Success! Message sent: " + info.messageId);
    } catch (err) {
        console.error("Failed to send email:", err);
    }
}

testEmail();
