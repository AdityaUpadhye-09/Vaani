import express from "express";
import Subscriber from "../models/Subscriber.js";

const router = express.Router();

// Subscribe route
router.post("/", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required!" });
    }

    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Already subscribed!" });
    }

    const newSubscriber = new Subscriber({ email });
    await newSubscriber.save();
    res.status(201).json({ message: "✅ Subscription successful!" });
  } catch (error) {
    console.error("❌ Subscription error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Unsubscribe route
router.post("/unsubscribe", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required!" });

    const deleted = await Subscriber.findOneAndDelete({ email });
    if (!deleted) {
      return res.status(404).json({ message: "Email not found!" });
    }

    res.status(200).json({ message: "🗑️ Unsubscribed successfully!" });
  } catch (error) {
    console.error("❌ Unsubscribe error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
