import { Request, Response } from "express";
import { Subscription } from "../schema/subscription";
import stripe from "stripe";
import dotenv from "dotenv";
import { sendEmail } from "../utilis/helperFunction";
import { User } from "../schema/user";
import { Invoice } from "../schema/invoice";
dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
const stripeInstance = new stripe(stripeSecretKey);
// Assuming you have different price IDs for basic and pro subscriptions
const basicPriceId = process.env.BASIC_SUBSCRIPTION_PRODUCT_ID;
const proPriceId = process.env.PRO_SUBSCRIPTION_PRODUCT_ID;
const addOnPriceId = process.env.ADDON_PRODUCT_ID;

async function checkoutPaymentSession(req: Request, model: any) {
  try {
    const { userId, subscriptionType } = model;
    let lineItems;
    let customerId;

    // Check if user exists in your User collection and has a Stripe customer ID
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return {
        status: 404,
        message: "User not found",
        data: null,
      };
    }
    if (user && user.stripeCustomerId) {
      customerId = user.stripeCustomerId;
    } else {
      // Create a new customer in Stripe
      const customer = await stripeInstance.customers.create({
        email: user.email, // Make sure you have the user's email in your User collection
        name: user.username, // And the user's name
      });
      if (!customer) {
        return {
          status: 400,
          message: "Payment server down",
          data: null,
        };
      }
      user.stripeCustomerId = customer.id;
      await user.save();

      customerId = customer.id;

      // Save the Stripe customer ID in your database
    }

    const subDetail = await Subscription.findOne({ userID: userId });
    if (subDetail) {
      if (subDetail.addOnCount > 0) {
        // If add-on count is greater than 0, include add-on charges
        lineItems = [
          {
            price: subscriptionType === "basic" ? basicPriceId : proPriceId,
            quantity: 1,
          },
          { price: addOnPriceId, quantity: subDetail.addOnCount },
        ];
      } else {
        // If no add-on charges, include only the subscription price
        lineItems = [
          {
            price: subscriptionType === "basic" ? basicPriceId : proPriceId,
            quantity: 1,
          },
        ];
      }
    } else {
      // If no subscription found, include only the subscription price
      lineItems = [
        {
          price: subscriptionType === "basic" ? basicPriceId : proPriceId,
          quantity: 1,
        },
      ];
    }

    const session: any = await stripeInstance.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer: customerId,
      metadata: { userId: userId, subscriptionType: subscriptionType },
      line_items: lineItems,
      success_url: `http://localhost:5300/success.html`,
      cancel_url: "http://localhost:5300/cancel.html",
    });
    return {
      status: 200,
      message: "Payment session initiated successfully",
      data: { url: session.url },
    };
    // res.redirect(session.url);
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
      case "invoice.payment_succeeded":
        try {
          const invoiceDetail = event.data.object as stripe.Invoice;
          const invoice = new Invoice({
            // userID: userId,
            invoiceId: invoiceDetail.id,
            stripeCustomerId: invoiceDetail.customer,
            invoiceUrl: invoiceDetail.hosted_invoice_url,
            invoicePDF: invoiceDetail.invoice_pdf,
            amountPaid: invoiceDetail.amount_paid,
            currency: invoiceDetail.currency,
            customerName: invoiceDetail.customer_name,
            customerEmail: invoiceDetail.customer_email,
            invoiceNo: invoiceDetail.number,
            paymentIntent: invoiceDetail.payment_intent,
            subscription: invoiceDetail.subscription,
            subscriptionDetails: invoiceDetail.subscription_details,
            total: invoiceDetail.total,
            totalExcludingTax: invoiceDetail.total_excluding_tax,
          });
          await invoice.save();
          console.log("Invoice saved successfully:", invoiceDetail.id);
        } catch (error) {
          console.error("Error processing invoice payment:", error);
        }

        break;

      case "checkout.session.completed":
        try {
          const sessionDetail = event.data.object;
          // console.log(sessionDetail);
          const sessionId = sessionDetail.id;
          const metadata = sessionDetail.metadata;
          if (!metadata) {
            console.log("Validate the session userId required", sessionId);
          }
          const userId = metadata?.userId;
          const subscriptionType = metadata?.subscriptionType || null;
          let subscription = await Subscription.findOne({ userID: userId });
          if (!subscription) {
            subscription = new Subscription({ userID: userId });
            console.log("New subscription created for userID:", userId);
          } else {
            console.log("Subscription already exists for userID:", userId);
          }
          subscription.resetRequestCountIfMonthPassed();

          let sessionStatus;
          const paymentStatus = sessionDetail.payment_status;
          // if (paymentStatus === "paid") {
          //   sessionStatus = "success";
          //   const amountPaid = sessionDetail.amount_total;
          //   const availableRequest = 5; // Change this to your logic
          //   subscription.requestCount = availableRequest;
          //   subscription.subscriptionType = subscriptionType || "";
          //   // Determine the subscription type based on the user's plan or any other criteria
          //   if (subscriptionType === "pro") {
          //     const availableRequest = 5; // Change this to your pro logic
          //     subscription.requestCount = availableRequest;
          //   } else if (subscriptionType === "basic") {
          //     subscription.requestCount = availableRequest;
          //   }

          if (paymentStatus === "paid") {
            sessionStatus = "success";
            const amountPaid = sessionDetail.amount_total || 0;
            let availableRequest = 5; // Default request count for both basic and pro
            subscription.subscriptionType = subscriptionType || "";
            if (
              (subscriptionType === "pro" && amountPaid >= 10000) ||
              (subscriptionType === "basic" && amountPaid >= 2000)
            ) {
              subscription.requestCount = availableRequest;

              let baseAmount = subscriptionType === "pro" ? 10000 : 2000;

              if (amountPaid > baseAmount) {
                const excessAmount = amountPaid - baseAmount;
                // const addonUsage = Math.floor(
                //   excessAmount / addonChargePerRequest
                // );
                const addonUsage = Math.floor(excessAmount);
                console.log(
                  subscription.addOnCount,
                  "     addon    ",
                  addonUsage
                );
                subscription.addOnCount -= addonUsage;
                if (subscription.addOnCount < 0) {
                  subscription.addOnCount = 0; // Ensure addonCount doesn't go negative
                }
              }
            }

            let emailObj = {
              heading: "Welcome to AI SQUAD",
              html: `<p>Dear User,</p><p>Thank you for your payment! Your subscription payment was successful, and your account is now activated.</p><p>You have been subscribed to our service, and you are now able to make requests and fully utilize our platform.</p><p>Amount Paid: ¢ ${amountPaid} cent</p><p>Subscription Status: Active</p><p>If you have any questions or need assistance, feel free to contact us at support@aisquad.com.</p><p>Best regards,<br/>AI SQUAD Team</p>`,
              host: "https://aisquad.com",
              recipient: sessionDetail?.customer_details?.email,
              subject: "Payment Successful - Subscription Activated",
            };
            await sendEmail(emailObj);
          } else {
            subscription.subscriptionType = null;
            sessionStatus = "fail";
          }

          subscription.sessionRecords.push({
            sessionID: sessionId,
            status: sessionStatus,
            subscriptionType: subscriptionType,
            paymentAmount: sessionDetail.amount_total || 0,
            paymentStatus: sessionDetail.payment_status,
            invoiceDetail:
              typeof sessionDetail.invoice === "object"
                ? JSON.stringify(sessionDetail.invoice)
                : sessionDetail.invoice,
            invoiceID:
              typeof sessionDetail.invoice === "string"
                ? sessionDetail.invoice
                : sessionDetail.invoice?.id,
            stripeCustomerId:
              typeof sessionDetail.customer === "string"
                ? sessionDetail.customer
                : sessionDetail.customer?.id,
            amountTotal: sessionDetail.amount_total || 0,
            currency: sessionDetail.currency,
            customerName: sessionDetail.customer_details?.name,
            customerEmail: sessionDetail.customer_details?.email,
          });
          // Update lastRequestTimestamp and reset requestCount if necessary
          subscription.stripeCustomerId =
            typeof sessionDetail.customer === "string"
              ? sessionDetail.customer
              : null;
          subscription.lastRequestTimestamp = new Date();
          await subscription.save();

          const invoiceId = sessionDetail.invoice;
          console.log(invoiceId);
          if (invoiceId) {
            await Invoice.findOneAndUpdate(
              { invoiceId: invoiceId },
              {
                userID: userId,
                stripeCustomerId: subscription.stripeCustomerId,
                sessionId: sessionId,
                subscriptionId: subscription._id,
              },
              { new: true }
            );
          }
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
  id: "cs_test_a1WLpwCPQRzDdRInCFNnwg7Kb3fsQHO1N1RJiVQCO8FIUaJ2AHaC1O",
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
  customer: "cus_Q6A1qez2hs3B",
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
  invoice: "in_1PFxhDSJLtEp0w1ehcFGG",
  invoice_creation: null,
  livemode: false,
  locale: null,
  metadata: { userId: "663a32bd9842614f34fe" },
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
  subscription: "sub_1PFxhDSJLeEp0FyqZj44W",
  success_url: "http://localhost:5300/success.html",
  total_details: { amount_discount: 0, amount_shipping: 0, amount_tax: 0 },
  ui_mode: "hosted",
  url: null,
};

const invoiceObj = {
  id: "in_1PdrA5SJLtxEp01KTaN457",
  object: "invoice",
  account_country: "IN",
  account_name: "MindGen",
  account_tax_ids: null,
  amount_due: 10074,
  amount_paid: 10074,
  amount_remaining: 0,
  amount_shipping: 0,
  application: null,
  application_fee_amount: null,
  attempt_count: 1,
  attempted: true,
  auto_advance: false,
  automatic_tax: { enabled: false, liability: null, status: null },
  automatically_finalizes_at: null,
  billing_reason: "subscription_create",
  charge: "ch_3PdrA5SJLtxAe0pNsDxfR",
  collection_method: "charge_automatically",
  created: 1721296929,
  currency: "usd",
  custom_fields: null,
  customer: "cus_QUnapjTqBLZNdQ",
  customer_address: null,
  customer_email: "Gojo@yopmail.com",
  customer_name: "Gojo",
  customer_phone: null,
  customer_shipping: null,
  customer_tax_exempt: "none",
  customer_tax_ids: [],
  default_payment_method: null,
  default_source: null,
  default_tax_rates: [],
  description: "Thanks for the business",
  discount: null,
  discounts: [],
  due_date: null,
  effective_at: 1721296929,
  ending_balance: 0,
  footer: null,
  from_invoice: null,
  hosted_invoice_url:
    "https://invoice.stripe.com/i/acct_1PeoivslLtxAeEp0/test_YWNjdF8xUERSTjNTSkx0eEFlRXAwLaGluSU1Mblg0Q0VtamdyY3dscXlQY0MyWXpPLDExMTgzNzczNQ02007kzkpUL9?s=ap",
  invoice_pdf:
    "https://pay.stripe.com/invoice/acct_1PeoivslLtxAeEp0/test_YWNjdF8xUERSTjNTSkx0eEFlRXAwLaGluSU1Mblg0Q0VtamdyY3dscXlQY0MyWXpPLDExMTgzNzczNQ02007kzkpUL9/pdf?s=ap",
  issuer: { type: "self" },
  last_finalization_error: null,
  latest_revision: null,
  lines: {
    object: "list",
    data: [[Object], [Object]],
    has_more: false,
    total_count: 2,
    url: "/v1/invoices/in_1PdrA5SJLtxA01KTaN457/lines",
  },
  livemode: false,
  metadata: {},
  next_payment_attempt: null,
  number: "316B7FF7-0009",
  on_behalf_of: null,
  paid: true,
  paid_out_of_band: false,
  payment_intent: "pi_3PdrA5SJLtxEp00AHRhpCp",
  payment_settings: {
    default_mandate: null,
    payment_method_options: {
      acss_debit: null,
      bancontact: null,
      card: [Object],
      customer_balance: null,
      konbini: null,
      sepa_debit: null,
      us_bank_account: null,
    },
    payment_method_types: null,
  },
  period_end: 1721296929,
  period_start: 1721296929,
  post_payment_credit_notes_amount: 0,
  pre_payment_credit_notes_amount: 0,
  quote: null,
  receipt_number: null,
  rendering: { amount_tax_display: null, pdf: null },
  shipping_cost: null,
  shipping_details: null,
  starting_balance: 0,
  statement_descriptor: null,
  status: "paid",
  status_transitions: {
    finalized_at: 1721296929,
    marked_uncollectible_at: null,
    paid_at: 1721296934,
    voided_at: null,
  },
  subscription: "sub_1PdrA5SJLteEp0sWEkrnuq",
  subscription_details: { metadata: {} },
  subtotal: 10074,
  subtotal_excluding_tax: 10074,
  tax: null,
  test_clock: null,
  total: 10074,
  total_discount_amounts: [],
  total_excluding_tax: 10074,
  total_tax_amounts: [],
  transfer_data: null,
  webhooks_delivered_at: 1721296931,
};

async function userPaymentSession(model: any) {
  try {
    const { userId } = model;
    const subscription = await Subscription.findOne({ userID: userId }).exec();

    if (!subscription) {
      return { status: 404, message: "Subscription not found", data: null };
    }

    const sessionDetails = subscription.sessionRecords.map((session) => ({
      sessionID: session.sessionID,
      paymentStatus: session.paymentStatus,
      paymentAmount: session.paymentAmount,
      subscriptionType: session.subscriptionType,
      invoiceID: session.invoiceID,
      timestamp: session.timestamp?.toISOString().split("T")[0], // Only keep the date part
    }));

    return {
      status: 200,
      message: "All session fetched successfully",
      data: sessionDetails,
    };
  } catch (error) {
    console.error("Error fetching session details:", error);
    return {
      status: 500,
      message: "Internal server error",
      data: null,
    };
  }
}

async function invoiceDetail(model: any) {
  try {
    const { invoiceID } = model;
    const sessionDetail = await Invoice.findOne({ invoiceId: invoiceID });
    if (!sessionDetail) {
      return {
        status: 404,
        message: "invoice detail not found",
        data: null,
      };
    }
    const result = {
      invoiceNo: sessionDetail.invoiceNo,
      customerName: sessionDetail.customerName,
      customerEmail: sessionDetail.customerEmail,
      invoiceURL: sessionDetail.invoiceUrl,
      invoicePDF: sessionDetail.invoicePDF,
      amountPaid: sessionDetail.amountPaid,
    };

    return {
      status: 200,
      message: "All session fetched successfully",
      data: result,
    };
  } catch (error) {
    console.error("Error fetching session details:", error);
    return {
      status: 500,
      message: "Internal server error",
      data: null,
    };
  }
}

export {
  checkoutPaymentSession,
  stripeWebhook,
  userPaymentSession,
  invoiceDetail,
};
