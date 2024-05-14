import { Request, Response, NextFunction } from "express";
import { Subscription } from "../schema/subscription"; // Import the Subscription model

async function requestCountMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.query.userId; // Assuming user ID is available in req.user from authentication middleware
    // Find the subscription for the user
    const subscription = await Subscription.findOne({ userID: userId });

    if (!subscription) {
      // If subscription is not found, return subscription required error
      return res.status(400).json({ error: "Subscription required" });
    }

    if (subscription.subscriptionType === "pro") {
      // If subscription is of type pro, deduct request count
      if (subscription.requestCount > 0) {
        subscription.requestCount -= 1;
      } else {
        // If request count is less than 1, start adding to add-on charges
        subscription.addOnCount += 1;
        console.log("Subscription request limit reached");
      }
    } else if (subscription.subscriptionType === "basic") {
      // If subscription is of type basic and request count is less than 1, return subscription expired error
      if (subscription.requestCount < 1) {
        return res.status(400).json({ error: "Subscription expired" });
      }
      // Deduct request count for basic subscription
      subscription.requestCount -= 1;
    }

    // Save the subscription document
    await subscription.save();

    next(); // Move to the next middleware or route handler
  } catch (error) {
    console.error("Error updating request count:", error);
    // You may choose to send an error response or handle it differently
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export { requestCountMiddleware };
