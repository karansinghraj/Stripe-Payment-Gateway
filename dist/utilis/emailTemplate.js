"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalFormat = void 0;
const generalFormat = function (dataObj) {
    return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Mind Gen SQUAD</title>
    <style>
      /* Add your custom CSS styles here */
      body {
        margin: 0;
        padding: 0;
        font-family: Arial, sans-serif;
        background-color: #f5f5f5;
      }
      .container {
        width: 80%;
        max-width: 600px;
        margin: 30px auto;
        background-color: #fff;
        border-radius: 100px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .header {
        background-color: #1B5147;
        color: #eee;
        text-align: center;
        padding: 5px;
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
      }
      .content {
        padding: 60px;
      }
      .footer {
        background-color: #1B5147;
        color: #fff;
        text-align: center;
        padding: 10px;
        border-bottom-left-radius: 10px;
        border-bottom-right-radius: 10px;
      }
      .footer a {
        color: #fff;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Welcome to AI SQUAD</h1>
      </div>
      <div class="content">
        <p>${dataObj.html}</p>
        <p>If you have any questions, feel free to contact us at <a href="mailto:info@mindgen.com">info@mindgen.com</a>.</p>
      </div>
      <div class="footer">
        <td align="center" bgcolor="#1B2147" style="padding: 20px; color: white;">
          <p>&copy; 2024 AI SQUAD Ltd. All rights reserved.</p>
          <p><a href="${dataObj.host}/subscription-terms-and-conditions" style="color: white; text-decoration: none;">Terms & Conditions</a> | <a href="${dataObj.host}/privacy-policy" style="color: white; text-decoration: none;">Privacy Policy</a></p>
        </td>
      </div>
    </div>
  </body>
  </html>
`;
};
exports.generalFormat = generalFormat;
