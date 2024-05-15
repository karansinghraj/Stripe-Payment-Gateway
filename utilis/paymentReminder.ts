import schedule from "node-schedule";
import { Subscription } from "../schema/subscription"; // Import your Subscription model
import { sendEmail } from "./helperFunction";
import { User } from "../schema/user";

// Function to send reminder email to a user
async function sendReminderEmail(userId: string, lastPaymentDate: Date) {
  try {
    // Fetch user details from the database
    const user = await User.findOne({ _id: userId });
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
    const emailSent = await sendEmail(emailData);
    console.log("Reminder email sent successfully.");
    return { status: 200, message: "Reminder email sent successfully" };
  } catch (error: any) {
    console.error("Error sending reminder email:", error);
    return {
      status: 500,
      message: "Error sending reminder email: " + error.message,
    };
  }
}

// Function to schedule daily reminder emails for subscriptions
function scheduleDailySubscriptionReminders() {
  // Schedule job to run at midnight every day
  // 0 0 * * * : minute hour dayOfMonth month dayOfWeek
  // 0 9 * * * : every day 9:00 AM
  // 30 18  * * * : everyday 6:30 PM
  const job = schedule.scheduleJob("48 11 * * *", async () => {
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
      const subscriptions = await Subscription.find({
        subscriptionType: { $ne: null },
        lastRequestTimestamp: {
          $gte: new Date(
            reminderStartDate.getFullYear(),
            reminderStartDate.getMonth() - 1,
            reminderStartDate.getDate()
          ),
          $lt: new Date(
            reminderEndDate.getFullYear(),
            reminderEndDate.getMonth() - 1,
            reminderEndDate.getDate()
          ),
        },
      });
      console.log("running the scheduler", subscriptions);
      // Get today's date

      // Iterate through each subscription
      subscriptions.forEach(async (subscription) => {
        // Calculate the end of the subscription month
        const endOfMonth = new Date(subscription.lastRequestTimestamp);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);

        // Calculate the reminder date (5 days before the end of the subscription month)
        const reminderDate = new Date(endOfMonth);
        reminderDate.setDate(reminderDate.getDate() - 5);
        // Check if the reminder date is today
        if (reminderDate.toDateString() === today.toDateString()) {
          // Send reminder email to user
          await sendReminderEmail(
            subscription.userID.toString(),
            subscription.lastRequestTimestamp
          );
        }
      });
    } catch (error) {
      console.error("Error scheduling daily subscription reminders:", error);
    }
  });

  // Log when the job is scheduled
  console.log(
    "Daily subscription reminder job scheduled:",
    job.nextInvocation()
  );
}

// Call the function to schedule daily subscription reminders
//scheduleDailySubscriptionReminders();

export { scheduleDailySubscriptionReminders };
