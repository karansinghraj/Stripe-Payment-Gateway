import express from "express";
import bodyParser from "body-parser";
import {
  StripePaymentSession,
  StripeWebhook,
} from "../controllers/stripeController";
const stripeRoute = express.Router();

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

stripeRoute.post("/paymentsession", StripePaymentSession);

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

stripeRoute.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  StripeWebhook
);

export { stripeRoute };
