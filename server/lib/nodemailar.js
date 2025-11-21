const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
    pool: true,           
    maxConnections: 5,    
    maxMessages: 20,      
});

const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text
    });
    console.log("Email sent to:", to);
  } catch (error) {
    console.log("Email error:", error);
  }
};

module.exports = sendEmail;
