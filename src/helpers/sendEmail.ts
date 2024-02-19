import nodemailer from "nodemailer";
import { EmailData } from "../interface";
import 'dotenv/config';

const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASSWORD,
    },
});


export const sendEmail = async(emailData: EmailData) => {
    if (!emailData.to) {
        return "Reciever is required!";
    }
    try {
        await transporter.sendMail({
            from: emailData.from,
            to: emailData.to,
            subject: emailData.subject,
            html: emailData.html,
        });
        return true;
    } catch (error: any) {
        return error.message;
    }
}
     

