import mongoose, { Document } from "mongoose";

interface SessionRecord {
  sessionID: string;
  status: string;
}

interface SubscriptionDocument extends Document {
  userID: mongoose.Types.ObjectId;
  sessionRecords: SessionRecord[];
  requestCount: number;
  lastRequestTimestamp: Date;
  addOnCount: number;
  subscriptionType: string | null; // New field for subscription type
  // usageLimit: number; // New field for usage limit in basic subscription
  // addOnCharge: number; // New field for add-on charge in pro subscription
  resetRequestCountIfMonthPassed: () => void;
}

const sessionRecordSchema = new mongoose.Schema({
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

const subscriptionSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
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

subscriptionSchema.methods.resetRequestCountIfMonthPassed = function (
  this: SubscriptionDocument
) {
  const now = new Date();
  const lastMonth = new Date(this.lastRequestTimestamp);
  lastMonth.setMonth(lastMonth.getMonth() + 1); // Add one month
  if (now > lastMonth) {
    this.requestCount = 0;
    this.lastRequestTimestamp = new Date(); // Assigning current date
  }
};

const Subscription = mongoose.model<SubscriptionDocument>(
  "Subscription",
  subscriptionSchema
);

export { Subscription };
