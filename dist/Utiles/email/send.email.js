"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = require("nodemailer");
const sendEmail = async (data) => {
    const transporter = (0, nodemailer_1.createTransport)({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
        },
    });
    const info = await transporter.sendMail({
        ...data,
        from: `"Route Academy" <${process.env.EMAIL}>`,
    });
    console.log("Message sent: %s", info.messageId);
};
exports.sendEmail = sendEmail;
