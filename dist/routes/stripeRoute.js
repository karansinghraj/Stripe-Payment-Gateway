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
