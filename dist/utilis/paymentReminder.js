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
exports.scheduleDailySubscriptionReminders = void 0;
const node_schedule_1 = __importDefault(require("node-schedule"));
const subscription_1 = require("../schema/subscription"); // Import your Subscription model
const helperFunction_1 = require("./helperFunction");
const user_1 = require("../schema/user");
// Function to send reminder email to a user
function sendReminderEmail(userId, lastPaymentDate) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Fetch user details from the database
            const user = yield user_1.User.findOne({ _id: userId });
            if (!user || !user.email) {
                console.error("User not found or email not available");
                return { status: 404, message: "User not found or email not available" };
            }
            const emailData = {
                heading: "Subscription Renewal Reminder",
                html: `<p>Dear user,</p><p>This is a reminder that your subscription payment is due in 5 days on ${lastPaymentDate}.</p><p>Please ensure that your payment is processed to avoid any interruption to your subscription.</p><p>Best regards,<br>Your Application Team</p>`,
                recipient: user.email, // Use the user's email fetched from the database
                subject: "Subscription Renewal Reminder",
            };
            // Call the sendEmail function to send the reminder email
            const emailSent = yield (0, helperFunction_1.sendEmail)(emailData);
            console.log("Reminder email sent successfully.");
            return { status: 200, message: "Reminder email sent successfully" };
        }
        catch (error) {
            console.error("Error sending reminder email:", error);
            return {
                status: 500,
                message: "Error sending reminder email: " + error.message,
            };
        }
    });
}
// Function to schedule daily reminder emails for subscriptions
function scheduleDailySubscriptionReminders() {
    // Schedule job to run at midnight every day
    // 0 0 * * * : minute hour dayOfMonth month dayOfWeek
    // 0 9 * * * : every day 9:00 AM
    // 30 18  * * * : everyday 6:30 PM
    const job = node_schedule_1.default.scheduleJob("48 11 * * *", () => __awaiter(this, void 0, void 0, function* () {
        try {
            // Get today's date at midnight
            const today = new Date();
            // Calculate the reminder start and end dates
            const reminderStartDate = new Date(today);
            reminderStartDate.setDate(reminderStartDate.getDate() + 4); // Expiring in 4 days
            console.log("Reminder Start Date:", reminderStartDate);
            const reminderEndDate = new Date(today);
            reminderEndDate.setDate(reminderEndDate.getDate() + 6); // Expiring in 6 days
            console.log("Reminder End Date:", reminderEndDate);
            // Find all active subscriptions with lastRequestTimestamp that will expire within the next 5 days
            const subscriptions = yield subscription_1.Subscription.find({
                subscriptionType: { $ne: null },
                lastRequestTimestamp: {
                    $gte: new Date(reminderStartDate.getFullYear(), reminderStartDate.getMonth() - 1, reminderStartDate.getDate()),
                    $lt: new Date(reminderEndDate.getFullYear(), reminderEndDate.getMonth() - 1, reminderEndDate.getDate()),
                },
            });
            console.log("running the scheduler", subscriptions);
            // Get today's date
            // Iterate through each subscription
            subscriptions.forEach((subscription) => __awaiter(this, void 0, void 0, function* () {
                // Calculate the end of the subscription month
                const endOfMonth = new Date(subscription.lastRequestTimestamp);
                endOfMonth.setMonth(endOfMonth.getMonth() + 1);
                // Calculate the reminder date (5 days before the end of the subscription month)
                const reminderDate = new Date(endOfMonth);
                reminderDate.setDate(reminderDate.getDate() - 5);
                // Check if the reminder date is today
                if (reminderDate.toDateString() === today.toDateString()) {
                    // Send reminder email to user
                    yield sendReminderEmail(subscription.userID.toString(), subscription.lastRequestTimestamp);
                }
            }));
        }
        catch (error) {
            console.error("Error scheduling daily subscription reminders:", error);
        }
    }));
    // Log when the job is scheduled
    console.log("Daily subscription reminder job scheduled:", job.nextInvocation());
}
exports.scheduleDailySubscriptionReminders = scheduleDailySubscriptionReminders;
