import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Direct MongoDB URL (from your Atlas)
const MONGO_URL =
  "mongodb+srv://karthik:karthik123@cluster0.lh1nfog.mongodb.net/memoryleaf?retryWrites=true&w=majority&appName=Cluster0";

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

/* ---------------------------
   MongoDB Schemas & Models
----------------------------*/
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const vaultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  site: String,
  username: String,
  password: String, // (in real apps, encrypt this!)
});

const User = mongoose.model("User", userSchema);
const Vault = mongoose.model("Vault", vaultSchema);

/* ---------------------------
   Auth Routes
----------------------------*/

// Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    res.json({ message: "Login successful", userId: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------------------------
   Vault Routes
----------------------------*/

// Save password
app.post("/api/vault", async (req, res) => {
  try {
    const { userId, site, username, password } = req.body;

    if (!userId || !site || !username || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    const newEntry = new Vault({ userId, site, username, password });
    await newEntry.save();

    res.json({ message: "Password saved successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get passwords for a user
app.get("/api/vault/:userId", async (req, res) => {
  try {
    const entries = await Vault.find({ userId: req.params.userId });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------------------------
   Test Route
----------------------------*/
app.get("/", (req, res) => {
  res.send("🚀 Backend is running & MongoDB connection is OK!");
});

/* ---------------------------
   Start Server
----------------------------*/
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
