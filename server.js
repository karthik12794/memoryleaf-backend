import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;

app.use(express.json());
app.use(cors());

// MongoDB connect
mongoose
  .connect(MONGO_URL)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Error:", err.message));

// Schema & Model
const diarySchema = new mongoose.Schema({
  date: String,
  page: Number,
  content: String,
});
const Diary = mongoose.model("Diary", diarySchema);

// Routes
app.get("/", (req, res) => {
  res.send("🚀 Backend running with MongoDB");
});

// Save page
app.post("/savePage", async (req, res) => {
  const { date, page, content } = req.body;
  try {
    await Diary.findOneAndUpdate(
      { date, page },
      { content },
      { upsert: true, new: true }
    );
    res.json({ message: "✅ Page saved" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get page
app.get("/getPage", async (req, res) => {
  const { date, page } = req.query;
  try {
    const entry = await Diary.findOne({ date, page });
    res.json(entry || { content: "" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


