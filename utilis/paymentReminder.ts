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
  // 30 6 * * * : everyday 6:30 PM
  const job = schedule.scheduleJob("0 0 * * *", async () => {
    try {
      // Find all active subscriptions
      const subscriptions = await Subscription.find({
        subscriptionType: { $ne: null }, // it will get all value after from null subscriptionType
      });

      // Get today's date
      const today = new Date();

      // Iterate through each subscription
      subscriptions.forEach(async (subscription) => {
        // Calculate the reminder date (5 days before the last payment date)
        const reminderDate = new Date(subscription.lastRequestTimestamp);
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
