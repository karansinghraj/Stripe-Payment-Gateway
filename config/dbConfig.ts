import mongoose from "mongoose";

async function connectToMongoDB() {
  try {
    // Connection URI
    const uri = "mongodb://127.0.0.1:27017"; // Change the URI as per your MongoDB configuration
    await mongoose.connect(uri);
    console.log("MongoDb connected successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error; // You may choose to handle the error differently
  }
}

export { connectToMongoDB };
