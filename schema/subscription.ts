import mongoose, { Document } from "mongoose";

interface SessionRecord {
  sessionID: string;
  status: string;
  timestamp?: Date;
  subscriptionType?: string | null; // e.g., 'basic', 'pro'
  paymentAmount?: number | 0;
  paymentStatus?: string; // e.g., 'paid', 'unpaid'
  invoiceDetail?: string;
  invoiceID?: string;
  stripeCustomerId?: string;
  amountTotal?: number | 0;
  currency?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
}

interface SubscriptionDocument extends Document {
  userID: mongoose.Types.ObjectId;
  sessionRecords: SessionRecord[];
  requestCount: number;
  lastRequestTimestamp: Date;
  addOnCount: number;
  subscriptionType: string | null;
  stripeCustomerId: string | null;
  resetRequestCountIfMonthPassed: () => void;
}

const sessionRecordSchema = new mongoose.Schema({
  sessionID: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["success", "fail", "complete"],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  subscriptionType: {
    type: String,
    enum: ["basic", "pro"],
    default: null,
  },
  paymentAmount: {
    type: Number,
    default: 0,
  },
  paymentStatus: {
    type: String,
    enum: ["paid", "unpaid"],
  },
  invoiceDetail: {
    type: String,
  },
  invoiceID: {
    type: String,
  },
  stripeCustomerId: {
    type: String,
  },
  amountTotal: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
  },
  customerName: {
    type: String,
  },
  customerEmail: {
    type: String,
  },
});

const subscriptionSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sessionRecords: [sessionRecordSchema],
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
    type: String,
    enum: ["basic", "pro"],
    required: true,
  },
  stripeCustomerId: {
    type: String,
    default: null,
  },
});

subscriptionSchema.methods.resetRequestCountIfMonthPassed = function (
  this: SubscriptionDocument
) {
  const now = new Date();
  const lastMonth = new Date(this.lastRequestTimestamp);
  lastMonth.setMonth(lastMonth.getMonth() + 1); // Add one month
  if (now > lastMonth) {
    this.requestCount = 0;
    this.lastRequestTimestamp = now;
    this.subscriptionType = null; // Set subscriptionType to null
  }
};

const Subscription = mongoose.model<SubscriptionDocument>(
  "Subscription",
  subscriptionSchema
);

export { Subscription };
