"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const emailTemplate_1 = require("./emailTemplate");
// Sample obj dataOBJ
const emailData = {
    heading: "Welcome to AI SQUAD",
    html: "<p>Welcome to our platform!</p>",
    host: "https://aisquad.com",
    recipient: "recipient@example.com",
    subject: "Welcome Email",
};
const sendEmail = (dataObj) => __awaiter(void 0, void 0, void 0, function* () {
    let transporter = nodemailer_1.default.createTransport({
        // Specify your email service provider SMTP details here
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_FROM, // your email
            pass: process.env.EMAIL_PASS, // Your password
        },
    });
    let mailOptions = {
        from: process.env.EMAIL_FROM, // Sender address
        to: dataObj.recipient, // List of recipients
        subject: dataObj.subject, // Subject line
        html: (0, emailTemplate_1.generalFormat)(dataObj), // HTML content generated from your template function
    };
    // Send email
    try {
        let info = yield transporter.sendMail(mailOptions);
        console.log("Email sent: " + info.response);
        return true; // Return true if email is sent successfully
    }
    catch (error) {
        console.error("Error sending email: ", error);
        return false; // Return false if there's an error sending the email
    }
});
exports.sendEmail = sendEmail;
