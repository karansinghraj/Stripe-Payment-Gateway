import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
import { generalFormat } from "./emailTemplate";

// Sample obj dataOBJ
const emailData = {
  heading: "Welcome to AI SQUAD",
  html: "<p>Welcome to our platform!</p>",
  host: "https://aisquad.com",
  recipient: "recipient@example.com",
  subject: "Welcome Email",
};

const sendEmail = async (dataObj: any) => {
  let transporter = nodemailer.createTransport({
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
    html: generalFormat(dataObj), // HTML content generated from your template function
  };

  // Send email
  try {
    let info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return true; // Return true if email is sent successfully
  } catch (error) {
    console.error("Error sending email: ", error);
    return false; // Return false if there's an error sending the email
  }
};

// Export the sendEmail function
export { sendEmail };
