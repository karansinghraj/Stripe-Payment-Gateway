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
exports.stripeWebhook = exports.checkoutPaymentSession = void 0;
const subscription_1 = require("../schema/subscription");
const stripe_1 = __importDefault(require("stripe"));
const dotenv_1 = __importDefault(require("dotenv"));
const helperFunction_1 = require("../utilis/helperFunction");
dotenv_1.default.config();
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
const stripeInstance = new stripe_1.default(stripeSecretKey);
function checkoutPaymentSession(req, model) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { userId, subscriptionType } = model;
            // Assuming you have different price IDs for basic and pro subscriptions
            const basicPriceId = process.env.BASIC_SUBSCRIPTION_PRODUCT_ID;
            const proPriceId = process.env.PRO_SUBSCRIPTION_PRODUCT_ID;
            const addOnPriceId = process.env.ADDON_PRODUCT_ID;
            const subDetail = yield subscription_1.Subscription.findOne({ userID: userId });
            let lineItems;
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
                }
                else {
                    // If no add-on charges, include only the subscription price
                    lineItems = [
                        {
                            price: subscriptionType === "basic" ? basicPriceId : proPriceId,
                            quantity: 1,
                        },
                    ];
                }
            }
            else {
                // If no subscription found, include only the subscription price
                lineItems = [
                    {
                        price: subscriptionType === "basic" ? basicPriceId : proPriceId,
                        quantity: 1,
                    },
                ];
            }
            const session = yield stripeInstance.checkout.sessions.create({
                payment_method_types: ["card"],
                mode: "subscription",
                metadata: { userId: userId, subscriptionType: subscriptionType },
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
        }
        catch (error) {
            console.error(error.message);
            return {
                status: 500,
                message: "Internal server error",
                data: null,
            };
        }
    });
}
exports.checkoutPaymentSession = checkoutPaymentSession;
let emailObj = {
    heading: "Welcome to AI SQUAD",
    html: "<p>Welcome to our platform!</p>",
    host: "https://aisquad.com",
    recipient: "recipient@example.com",
    subject: "Welcome Email",
};
// stripe listen --forward-to http://localhost:5300/api/stripe/webhook
function stripeWebhook(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const sig = req.headers["stripe-signature"] || "";
            const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET || "";
            let event;
            try {
                event = stripeInstance.webhooks.constructEvent(req.body.toString(), sig, endpointSecret);
            }
            catch (err) {
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
                        const sessionId = sessionDetail.id;
                        const metadata = sessionDetail.metadata;
                        if (!metadata) {
                            console.log("Validate the session userId required", sessionId);
                        }
                        const userId = metadata === null || metadata === void 0 ? void 0 : metadata.userId;
                        const subscriptionType = (metadata === null || metadata === void 0 ? void 0 : metadata.subscriptionType) || null;
                        let subscription = yield subscription_1.Subscription.findOne({ userID: userId });
                        if (!subscription) {
                            subscription = new subscription_1.Subscription({ userID: userId });
                            console.log("New subscription created for userID:", userId);
                        }
                        else {
                            console.log("Subscription already exists for userID:", userId);
                        }
                        let sessionStatus;
                        const paymentStatus = sessionDetail.payment_status;
                        if (paymentStatus === "paid") {
                            sessionStatus = "success";
                            const amountPaid = sessionDetail.amount_total;
                            const availableRequest = 5; // Change this to your logic
                            subscription.requestCount = availableRequest;
                            subscription.subscriptionType = subscriptionType || "";
                            // Determine the subscription type based on the user's plan or any other criteria
                            if (subscriptionType === "pro") {
                                const availableRequest = 5; // Change this to your pro logic
                                subscription.requestCount = availableRequest;
                            }
                            else if (subscriptionType === "basic") {
                                subscription.requestCount = availableRequest;
                            }
                            let emailObj = {
                                heading: "Welcome to AI SQUAD",
                                html: "<p>Dear User,</p><p>Thank you for your payment! Your subscription payment was successful, and your account is now activated.</p><p>You have been subscribed to our service, and you are now able to make requests and fully utilize our platform.</p><p>Amount Paid: $XX.XX</p><p>Subscription Status: Active</p><p>If you have any questions or need assistance, feel free to contact us at support@aisquad.com.</p><p>Best regards,<br/>AI SQUAD Team</p>",
                                host: "https://aisquad.com",
                                recipient: ((_a = sessionDetail === null || sessionDetail === void 0 ? void 0 : sessionDetail.customer_details) === null || _a === void 0 ? void 0 : _a.email) || "xyz@example.com",
                                subject: "Payment Successful - Subscription Activated",
                            };
                            const notificationMail = yield (0, helperFunction_1.sendEmail)(emailObj);
                        }
                        else {
                            subscription.subscriptionType = null;
                            sessionStatus = "fail";
                        }
                        subscription.sessionRecords.push({
                            sessionID: sessionId,
                            status: sessionStatus,
                        });
                        // Update lastRequestTimestamp and reset requestCount if necessary
                        subscription.lastRequestTimestamp = new Date();
                        subscription.resetRequestCountIfMonthPassed();
                        yield subscription.save();
                        console.log("Session details stored in subscription:", sessionId);
                    }
                    catch (error) {
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
        }
        catch (error) {
            console.error("Error handling webhook:", error);
            return {
                status: 500,
                message: "Internal server error",
                data: null,
            };
        }
    });
}
exports.stripeWebhook = stripeWebhook;
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
