"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
// Define the user schema
const userSchema = new mongoose_1.default.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    stripeCustomerId: {
        type: String,
        default: null,
    },
}, {
    timestamps: true, // Automatically add createdAt and updatedAt fields
});
// Create a User model based on the user schema
const User = mongoose_1.default.model("User", userSchema);
exports.User = User;
