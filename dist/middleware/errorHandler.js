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
exports.CustomError = exports.errorHandler = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class CustomError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
exports.CustomError = CustomError;
const transporter = nodemailer_1.default.createTransport({
    host: "smtp.gmail.com", // Replace with your SMTP host
    port: 587, // Replace with your SMTP port
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_FROM, // your email
        pass: process.env.EMAIL_PASS, // Replace with your email password
    },
});
// Function to send error email
const sendErrorEmail = (err) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: process.env.USER_MAIL,
            subject: "Application Error Occurred",
            text: `An error occurred: ${err.message}\nStatus Code: ${err.statusCode}\nStack: ${err.stack}`,
        });
    }
    catch (emailError) {
        console.error("Failed to send error email:", emailError);
    }
});
function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error(err);
    sendErrorEmail(err).catch(console.error);
    res.status(statusCode).json({
        status: "error",
        statusCode,
        message,
    });
}
exports.errorHandler = errorHandler;
