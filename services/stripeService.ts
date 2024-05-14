import express, { Request, Response } from "express";
import { Subscription } from "../schema/subscription";
import stripe from "stripe";
import dotenv from "dotenv";
import { sendEmail } from "../utilis/helperFunction";
dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
const stripeInstance = new stripe(stripeSecretKey);

//   "/create-checkout-session",
// bodyParser.json(),
async function checkoutPaymentSession(req: Request, model: any) {
  try {
    const { userId } = model;
    console.log(userId);
    const yourPriceId = process.env.SubcriptionproductId || "";
    const addOnPriceId = process.env.addonProductId || "";
    const subDetail = await Subscription.findOne({
      userID: userId,
    });

    let lineItems;

    if (subDetail) {
      if (subDetail.addOnCount > 1) {
        lineItems = [
          { price: yourPriceId, quantity: 1 },
          { price: addOnPriceId, quantity: subDetail.addOnCount },
        ];
      }
    } else {
      lineItems = [{ price: yourPriceId, quantity: 1 }];
    }

    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      metadata: { userId: userId },
      line_items: lineItems,
      success_url: "http://localhost:5300/success.html",
      cancel_url: "http://localhost:5300/cancel.html",
    });
    return {
      status: 200,
      message: "Payment session initiated successfully",
      data: { url: session.url },
    };
    // res.json({ url: session.url });
  } catch (error: any) {
    console.error(error.message);
    return {
      status: 500,
      message: "Internal server error",
      data: null,
    };
  }
}

let emailObj = {
  heading: "Welcome to AI SQUAD",
  html: "<p>Welcome to our platform!</p>",
  host: "https://aisquad.com",
  recipient: "recipient@example.com",
  subject: "Welcome Email",
};
// = middleware  fro webHOOK
//   bodyParser.raw({ type: "application/json" }),
// cmd command to lusten
// stripe listen --forward-to http://localhost:5300/api/stripe/webhook
async function stripeWebhook(req: Request, res: Response) {
  try {
    const sig = req.headers["stripe-signature"] || "";
    const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET || "";
    let event;

    try {
      event = stripeInstance.webhooks.constructEvent(
        req.body.toString(),
        sig,
        endpointSecret
      );
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return {
        status: 400,
        message: "Unauthorised webhook request",
        data: null,
      };
    }

    switch (event.type) {
      case "checkout.session.completed":
        try {
          const sessionDetail = event.data.object;
          console.log(sessionDetail);
          const sessionId = sessionDetail.id;
          const metadata = sessionDetail.metadata;
          if (!metadata) {
            console.log("Validate the session userId required", sessionId);
          }
          const userId = metadata?.userId;

          let subscription = await Subscription.findOne({ userID: userId });
          if (!subscription) {
            subscription = new Subscription({ userID: userId });
            await subscription.save();
            console.log("New subscription created for userID:", userId);
          } else {
            console.log("Subscription already exists for userID:", userId);
          }

          let sessionStatus;
          const paymentStatus = sessionDetail.payment_status;
          if (paymentStatus === "paid") {
            sessionStatus = "success";
            const amountPaid = sessionDetail.amount_total;
            const availableRequest = 5; // Change this to your logic
            subscription.requestCount = availableRequest;
            emailObj.heading = "AI SQUAD";
            emailObj.html =
              "<p>Dear User,</p><p>Thank you for your payment! Your subscription payment was successful, and your account is now activated.</p><p>You have been subscribed to our service, and you are now able to make requests and fully utilize our platform.</p><p>Amount Paid: $XX.XX</p><p>Subscription Status: Active</p><p>If you have any questions or need assistance, feel free to contact us at support@aisquad.com.</p><p>Best regards,<br/>AI SQUAD Team</p>";
            emailObj.host = "https://aisquad.com";
            emailObj.recipient =
              sessionDetail?.customer_details?.email || "xyz@example.com";
            emailObj.subject = "Payment Successful - Subscription Activated";

            const notificationMail = await sendEmail(emailObj);
          } else {
            sessionStatus = "fail";
          }

          subscription.sessionRecords.push({
            sessionID: sessionId,
            status: sessionStatus,
          });

          await subscription.save();
          console.log("Session details stored in subscription:", sessionId);
        } catch (error) {
          console.error("Error processing checkout session:", error);
        }
        break;
      // Handle other event types
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return {
      status: 200,
      message: "Webhook event handled",
      data: null,
    };
  } catch (error) {
    console.error("Error handling webhook:", error);
    return {
      status: 500,
      message: "Internal server error",
      data: null,
    };
  }
}

const samplesessionObj = {
  id: "cs_test_a1WLpwCPQRzDdRInCFNnwg7KblZcQ3fsQHO1N1RJiVQCO8FIUaJ2AHaC1O",
  object: "checkout.session",
  after_expiration: null,
  allow_promotion_codes: null,
  amount_subtotal: 10000,
  amount_total: 10000,
  automatic_tax: { enabled: false, liability: null, status: null },
  billing_address_collection: null,
  cancel_url: "http://localhost:5300/cancel.html",
  client_reference_id: null,
  client_secret: null,
  consent: null,
  consent_collection: null,
  created: 1715602114,
  currency: "usd",
  currency_conversion: null,
  custom_fields: [],
  custom_text: {
    after_submit: null,
    shipping_address: null,
    submit: null,
    terms_of_service_acceptance: null,
  },
  customer: "cus_Q6A1qbuez2hs3B",
  customer_creation: "always",
  customer_details: {
    address: {
      city: "Ohia",
      country: "US",
      line1: "street",
      line2: "cross",
      postal_code: "45613",
      state: "OH",
    },
    email: "dizouddanane-4501@yopmail.com",
    name: "wdq",
    phone: null,
    tax_exempt: "none",
    tax_ids: [],
  },
  customer_email: null,
  expires_at: 1715688514,
  invoice: "in_1PFxhDSJLtxAeEp0w1ehcFGG",
  invoice_creation: null,
  livemode: false,
  locale: null,
  metadata: { userId: "663a32bd983bf342614f34fe" },
  mode: "subscription",
  payment_intent: null,
  payment_link: null,
  payment_method_collection: "always",
  payment_method_configuration_details: null,
  payment_method_options: { card: { request_three_d_secure: "automatic" } },
  payment_method_types: ["card"],
  payment_status: "paid",
  phone_number_collection: { enabled: false },
  recovered_from: null,
  saved_payment_method_options: {
    allow_redisplay_filters: ["always"],
    payment_method_save: null,
  },
  setup_intent: null,
  shipping_address_collection: null,
  shipping_cost: null,
  shipping_details: null,
  shipping_options: [],
  status: "complete",
  submit_type: null,
  subscription: "sub_1PFxhDSJLtxAeEp0FyqZj44W",
  success_url: "http://localhost:5300/success.html",
  total_details: { amount_discount: 0, amount_shipping: 0, amount_tax: 0 },
  ui_mode: "hosted",
  url: null,
};

export { checkoutPaymentSession, stripeWebhook };
