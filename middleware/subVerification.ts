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
    console.log(userId, req.query);
    let subscription = await Subscription.findOne({ userID: userId });
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
    } else {
      subscription.addOnCount += 1;
      console.log("Subscription request limit reached ");
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
