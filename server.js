import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
  console.error("❌ MONGO_URL is missing in .env file!");
  process.exit(1); // Stop the server if no DB URL
}

// Middleware
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(MONGO_URL, {
    // These options are not needed in new mongoose, but kept safe
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1); // Stop if DB connection fails
  });

// Simple test route
app.get("/", (req, res) => {
  res.send("🚀 Backend is running & MongoDB connection is OK!");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
