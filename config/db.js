const mongoose = require("mongoose");
module.exports = async function connectDb() {
  if (!process.env.MONGODB_URI)
    throw new Error("MONGODB_URI is not configured");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");
};
