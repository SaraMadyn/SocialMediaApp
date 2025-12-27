"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailEvent = void 0;
const node_events_1 = require("node:events");
const verify_email_templete_1 = require("../email/verify.email.templete");
const send_email_1 = require("../email/send.email");
exports.emailEvent = new node_events_1.EventEmitter();
exports.emailEvent.on("sendEmail", async (data) => {
    try {
        data.subject = "confirm your email";
        data.html = (0, verify_email_templete_1.template)(data.otp, data.username, data.subject);
        await (0, send_email_1.sendEmail)(data);
    }
    catch (error) {
        console.log("fail to send email", error);
    }
});
