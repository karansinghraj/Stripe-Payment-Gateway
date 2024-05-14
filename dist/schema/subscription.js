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
        enum: ["success", "fail"],
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});
const subscriptionSchema = new mongoose_1.default.Schema({
    userID: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User", // Reference to the User collection
        required: true,
    },
    sessionRecords: [sessionRecordSchema], // Array of session records
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
        type: String || null,
        enum: ["basic", "pro"],
        required: true,
    },
    // usageLimit: {
    //   type: Number,
    //   default: 100, // Change this to your desired default limit for basic subscription
    // },
    // addOnCharge: {
    //   type: Number,
    //   default: 10, // Change this to your desired add-on charge for pro subscription
    // },
});
subscriptionSchema.methods.resetRequestCountIfMonthPassed = function () {
    const now = new Date();
    const lastMonth = new Date(this.lastRequestTimestamp);
    lastMonth.setMonth(lastMonth.getMonth() + 1); // Add one month
    if (now > lastMonth) {
        this.requestCount = 0;
        this.lastRequestTimestamp = new Date(); // Assigning current date
    }
};
const Subscription = mongoose_1.default.model("Subscription", subscriptionSchema);
exports.Subscription = Subscription;
