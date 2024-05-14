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
            console.log(userId, req.query);
            let subscription = yield subscription_1.Subscription.findOne({ userID: userId });
            // If subscription is found, update the requestCount
            console.log(subscription);
            if (!subscription) {
                res.status(400).json({ error: "Subscription required" });
                return {
                    status: 400,
                    message: "Subscription required",
                    data: null,
                };
            }
            if (subscription.requestCount > 0) {
                subscription.requestCount -= 1;
            }
            else {
                subscription.addOnCount += 1;
                console.log("Subscription request limit reached ");
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
