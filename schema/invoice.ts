import mongoose from "mongoose";
import { isNumberObject } from "util/types";

// Define the user schema
const invoiceSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: String,
      required: true,
    },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    sessionId: {
      type: String,
    },
    stripeCustomerId: {
      type: String,
    },
    invoiceUrl: {
      type: String,
      default: null,
    },
    invoicePDF: {
      type: String,
      default: null,
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    curreny: {
      type: String,
      default: "usd",
    },
    customerName: {
      type: String,
      default: null,
    },
    customerEmail: {
      type: String,
      default: null,
    },
    invoiceNo: {
      type: String,
      default: null,
    },
    paymentIntent: {
      type: String,
      default: null,
    },
    subscription: {
      type: String,
    },
    subscriptionDetails: {
      type: Object,
    },
    total: {
      type: Number,
    },
    totalExcludingTax: {
      type: Number,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Create a User model based on the user schema
const Invoice = mongoose.model("Invoice", invoiceSchema);

export { Invoice };
