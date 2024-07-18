import {
  checkoutPaymentSession,
  stripeWebhook,
  userPaymentSession,
  invoiceDetail,
} from "../services/stripeService";
import { Request, Response } from "express";

async function StripePaymentSession(req: Request, res: Response) {
  const model = req.body;
  const response = await checkoutPaymentSession(req, model);
  res.status(response.status).json(response);
}

async function StripeWebhook(req: Request, res: Response) {
  const response = await stripeWebhook(req, res);
  res.status(response.status).json(response);
}

async function userPaymentSessions(req: Request, res: Response) {
  const model = req.body;
  const response = await userPaymentSession(model);
  res.status(response.status).json(response);
}

async function invoiceDetails(req: Request, res: Response) {
  const model = req.body;
  const response = await invoiceDetail(model);
  res.status(response.status).json(response);
}

export {
  StripePaymentSession,
  StripeWebhook,
  userPaymentSessions,
  invoiceDetails,
};
