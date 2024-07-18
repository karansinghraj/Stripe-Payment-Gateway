"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Invoice = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
// Define the user schema
const invoiceSchema = new mongoose_1.default.Schema({
    invoiceId: {
        type: String,
        required: true,
    },
    userID: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
    },
    subscriptionId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
    },
    sessionId: {
        type: String,
    },
    stripeCustomerId: {
        type: String,
    },
    invoiceUrl: {
        type: String,
        default: null,
    },
    invoicePDF: {
        type: String,
        default: null,
    },
    amountPaid: {
        type: Number,
        default: 0,
    },
    curreny: {
        type: String,
        default: "usd",
    },
    customerName: {
        type: String,
        default: null,
    },
    customerEmail: {
        type: String,
        default: null,
    },
    invoiceNo: {
        type: String,
        default: null,
    },
    paymentIntent: {
        type: String,
        default: null,
    },
    subscription: {
        type: String,
    },
    subscriptionDetails: {
        type: Object,
    },
    total: {
        type: Number,
    },
    totalExcludingTax: {
        type: Number,
    },
}, {
    timestamps: true, // Automatically add createdAt and updatedAt fields
});
// Create a User model based on the user schema
const Invoice = mongoose_1.default.model("Invoice", invoiceSchema);
exports.Invoice = Invoice;
