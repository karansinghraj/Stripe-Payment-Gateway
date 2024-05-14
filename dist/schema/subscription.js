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
    addOnCount: {
        type: Number,
        default: 0,
    },
});
const Subscription = mongoose_1.default.model("Subscription", subscriptionSchema);
exports.Subscription = Subscription;
