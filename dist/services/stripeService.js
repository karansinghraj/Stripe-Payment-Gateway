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
//   "/create-checkout-session",
// bodyParser.json(),
function checkoutPaymentSession(req, model) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { userId } = model;
            console.log(userId);
            const yourPriceId = process.env.SubcriptionproductId || "";
            const addOnPriceId = process.env.addonProductId || "";
            const subDetail = yield subscription_1.Subscription.findOne({
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
            }
            else {
                lineItems = [{ price: yourPriceId, quantity: 1 }];
            }
            const session = yield stripeInstance.checkout.sessions.create({
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
// = middleware  fro webHOOK
//   bodyParser.raw({ type: "application/json" }),
// cmd command to lusten
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
                        console.log(sessionDetail);
                        const sessionId = sessionDetail.id;
                        const metadata = sessionDetail.metadata;
                        if (!metadata) {
                            console.log("Validate the session userId required", sessionId);
                        }
                        const userId = metadata === null || metadata === void 0 ? void 0 : metadata.userId;
                        let subscription = yield subscription_1.Subscription.findOne({ userID: userId });
                        if (!subscription) {
                            subscription = new subscription_1.Subscription({ userID: userId });
                            yield subscription.save();
                            console.log("New subscription created for userID:", userId);
                        }
                        else {
                            console.log("Subscription already exists for userID:", userId);
                        }
                        let sessionStatus;
                        const paymentStatus = sessionDetail.payment_status;
                        if (paymentStatus === "paid") {
                            sessionStatus = "success";
                            // calculation logic request are avaiable according to payment made
                            const amountPaid = sessionDetail.amount_total;
                            const availableRequest = 5; // Change this to your logic
                            subscription.requestCount = availableRequest;
                            emailObj.heading = "AI SQUAD";
                            emailObj.html =
                                "<p>Dear User,</p><p>Thank you for your payment! Your subscription payment was successful, and your account is now activated.</p><p>You have been subscribed to our service, and you are now able to make requests and fully utilize our platform.</p><p>Amount Paid: $XX.XX</p><p>Subscription Status: Active</p><p>If you have any questions or need assistance, feel free to contact us at support@aisquad.com.</p><p>Best regards,<br/>AI SQUAD Team</p>";
                            emailObj.host = "https://aisquad.com";
                            emailObj.recipient =
                                ((_a = sessionDetail === null || sessionDetail === void 0 ? void 0 : sessionDetail.customer_details) === null || _a === void 0 ? void 0 : _a.email) || "xyz@example.com";
                            emailObj.subject = "Payment Successful - Subscription Activated";
                            const notificationMail = yield (0, helperFunction_1.sendEmail)(emailObj);
                        }
                        else {
                            sessionStatus = "fail";
                        }
                        subscription.sessionRecords.push({
                            sessionID: sessionId,
                            status: sessionStatus,
                        });
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
