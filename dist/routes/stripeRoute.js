"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeRoute = void 0;
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const stripeController_1 = require("../controllers/stripeController");
const stripeRoute = express_1.default.Router();
exports.stripeRoute = stripeRoute;
/**
 * @swagger
 * /api/stripe/pay/paymentsession:
 *   post:
 *     summary: Create a payment session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user initiating the payment session
 *               subscriptionType:
 *                 type: string
 *                 enum: [basic, pro]
 *                 description: The type of subscription (basic or pro)
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: The URL of the payment session
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: A description of the error that occurred
 */
stripeRoute.post("/paymentsession", stripeController_1.StripePaymentSession);
/**
 * @swagger
 * /api/stripe/webhook:
 *   post:
 *     summary: Create a payment session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: The URL of the payment session
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: A description of the error that occurred
 */
stripeRoute.post("/webhook", body_parser_1.default.raw({ type: "application/json" }), stripeController_1.StripeWebhook);
/**
 * @swagger
 * /api/stripe/pay/userpaymentsession:
 *   post:
 *     summary: Get payment session details for a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user initiating the payment session
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   sessionID:
 *                     type: string
 *                     description: The ID of the session
 *                   paymentStatus:
 *                     type: string
 *                     description: The status of the payment
 *                   paymentAmount:
 *                     type: number
 *                     description: The amount paid in the session
 *                   subscriptionType:
 *                     type: string
 *                     description: The type of subscription (basic, pro)
 *                   invoiceID:
 *                     type: string
 *                     description: The ID of the invoice
 *                   timestamp:
 *                     type: string
 *                     format: date
 *                     description: The date of the session
 *       '400':
 *         description: Invalid user ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       '404':
 *         description: Subscription not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
stripeRoute.post("/userpaymentsession", stripeController_1.userPaymentSessions);
/**
 * @swagger
 * /api/stripe/pay/invoicedetail:
 *   post:
 *     summary: Get invoice details
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               invoiceID:
 *                 type: string
 *                 description: The ID of the invoice
 *                 required: true
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 invoiceNo:
 *                   type: string
 *                   description: The number of the invoice
 *                 customerName:
 *                   type: string
 *                   description: The name of the customer
 *                 customerEmail:
 *                   type: string
 *                   description: The email of the customer
 *                 invoiceURL:
 *                   type: string
 *                   description: The URL of the invoice
 *                 invoicePDF:
 *                   type: string
 *                   description: The PDF URL of the invoice
 *                 amountPaid:
 *                   type: number
 *                   description: The amount paid in the invoice
 *       '400':
 *         description: Invalid invoice ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       '404':
 *         description: Invoice not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
stripeRoute.post("/invoicedetail", stripeController_1.invoiceDetails);
