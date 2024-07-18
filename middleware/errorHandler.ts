import { NextFunction, Request, Response } from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

class CustomError extends Error {
  public statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // Replace with your SMTP host
  port: 587, // Replace with your SMTP port
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_FROM, // your email
    pass: process.env.EMAIL_PASS, // Replace with your email password
  },
});

// Function to send error email
const sendErrorEmail = async (err: CustomError) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.USER_MAIL,
      subject: "Application Error Occurred",
      text: `An error occurred: ${err.message}\nStatus Code: ${err.statusCode}\nStack: ${err.stack}`,
    });
  } catch (emailError) {
    console.error("Failed to send error email:", emailError);
  }
};

function errorHandler(
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) {
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

export { errorHandler, CustomError };
