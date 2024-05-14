import mongoose from "mongoose";

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
  addOnCount: {
    type: Number,
    default: 0,
  },
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export { Subscription };
