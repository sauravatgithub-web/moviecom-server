import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.ADMIN_EMAIL,
      pass: process.env.ADMIN_PATH,
    }
});

class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

const returnFn = (res, data) => {
    return res.status(200).json({ success: true, ...data});
}

const sendEmail = (email, subject, sharedToken) => {
    return new Promise((resolve, reject) => {
      const mailOptions = {
        from: process.env.ADMIN_EMAIL,
        to: email,
        subject: subject,
        text: `Your OTP for email verification for Code Forge is ${sharedToken}`
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
          reject(error);
        } 
        else {
          resolve(info);
        }
      });
    });
  }

export  { ErrorHandler, returnFn, sendEmail };