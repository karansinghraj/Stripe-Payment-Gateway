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
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestCountMiddleware = void 0;
const subscription_1 = require("../schema/subscription"); // Import the Subscription model
function requestCountMiddleware(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.query.userId; // Assuming user ID is available in req.user from authentication middleware
            // Find the subscription for the user
            const subscription = yield subscription_1.Subscription.findOne({ userID: userId });
            if (!subscription) {
                // If subscription is not found, return subscription required error
                return res.status(400).json({ error: "Subscription required" });
            }
            if (subscription.subscriptionType === "pro") {
                // If subscription is of type pro, deduct request count
                if (subscription.requestCount > 0) {
                    subscription.requestCount -= 1;
                }
                else {
                    // If request count is less than 1, start adding to add-on charges
                    subscription.addOnCount += 1;
                    console.log("Subscription request limit reached");
                }
            }
            else if (subscription.subscriptionType === "basic") {
                // If subscription is of type basic and request count is less than 1, return subscription expired error
                if (subscription.requestCount < 1) {
                    return res.status(400).json({ error: "Subscription expired" });
                }
                // Deduct request count for basic subscription
                subscription.requestCount -= 1;
            }
            // Save the subscription document
            yield subscription.save();
            next(); // Move to the next middleware or route handler
        }
        catch (error) {
            console.error("Error updating request count:", error);
            // You may choose to send an error response or handle it differently
            res.status(500).json({ error: "Internal Server Error" });
        }
    });
}
exports.requestCountMiddleware = requestCountMiddleware;
