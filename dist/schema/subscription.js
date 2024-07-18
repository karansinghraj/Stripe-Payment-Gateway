"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscription = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const sessionRecordSchema = new mongoose_1.default.Schema({
    sessionID: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["success", "fail", "complete"],
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    subscriptionType: {
        type: String,
        enum: ["basic", "pro"],
        default: null,
    },
    paymentAmount: {
        type: Number,
        default: 0,
    },
    paymentStatus: {
        type: String,
        enum: ["paid", "unpaid"],
    },
    invoiceDetail: {
        type: String,
    },
    invoiceID: {
        type: String,
    },
    stripeCustomerId: {
        type: String,
    },
    amountTotal: {
        type: Number,
        default: 0,
    },
    currency: {
        type: String,
    },
    customerName: {
        type: String,
    },
    customerEmail: {
        type: String,
    },
});
const subscriptionSchema = new mongoose_1.default.Schema({
    userID: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    sessionRecords: [sessionRecordSchema],
    requestCount: {
        type: Number,
        default: 0,
    },
    lastRequestTimestamp: {
        type: Date,
        default: Date.now,
    },
    addOnCount: {
        type: Number,
        default: 0,
    },
    subscriptionType: {
        type: String,
        enum: ["basic", "pro"],
        required: true,
    },
    stripeCustomerId: {
        type: String,
        default: null,
    },
});
subscriptionSchema.methods.resetRequestCountIfMonthPassed = function () {
    const now = new Date();
    const lastMonth = new Date(this.lastRequestTimestamp);
    lastMonth.setMonth(lastMonth.getMonth() + 1); // Add one month
    if (now > lastMonth) {
        this.requestCount = 0;
        this.lastRequestTimestamp = now;
        this.subscriptionType = null; // Set subscriptionType to null
    }
};
const Subscription = mongoose_1.default.model("Subscription", subscriptionSchema);
exports.Subscription = Subscription;
