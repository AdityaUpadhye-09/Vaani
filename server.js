import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Quote from "./models/quoteModel.js";
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import cron from "node-cron";
import subscribeRoutes from "./routes/subscribeRoutes.js";
import path from "path"; //for frontend
import { fileURLToPath } from "url";



dotenv.config(); // Load .env variables
connectDB(); // Connect to MongoDB

const app = express();
app.use(express.json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files (for frontend)
app.use(express.static(path.join(__dirname, "public")));


// Health check route
app.get("/", (req, res) => {
  res.send("📖 Bhagavad Gita Mailer API is running and connected to MongoDB!");
});

// Add a sample quote manually (testing)
app.get("/addQuote", async (req, res) => {
  try {
    const quote = new Quote({
      verse: "You have the right to work, but never to the fruit of work.",
      chapter: 2,
      verseNumber: 47,
      meaning:
        "Focus on your actions, not on the results. True peace lies in detachment.",
    });

    await quote.save();
    res.send("✅ Quote added successfully!");
  } catch (err) {
    res.status(500).send("❌ Error adding quote: " + err.message);
  }
});

// Mount subscription routes (handles /subscribe and /unsubscribe)
app.use("/api/subscribe", subscribeRoutes);

// Send quote email manually (testing)
app.post("/send-quote", async (req, res) => {
  try {
    const { email } = req.body;

    // Fetch a random quote from MongoDB
    const quotes = await Quote.find();
    if (!quotes.length)
      return res.status(404).json({ message: "No quotes found!" });

    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    // Create transporter (connect to Gmail)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Mail content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "🌼 Your Daily Bhagavad Gita Quote",
      text: `"${randomQuote.verse}"\n\nMeaning: ${randomQuote.meaning}\n\n— Chapter ${randomQuote.chapter}, Verse ${randomQuote.verseNumber}`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "✅ Quote sent successfully!" });
  } catch (error) {
    console.error("❌ Error sending email:", error);
    res.status(500).json({ message: "Failed to send email", error });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

import "./mailer.js";
