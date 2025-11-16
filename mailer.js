import cron from "node-cron";
import nodemailer from "nodemailer";
import Subscriber from "./models/Subscriber.js";
import fs from "fs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

//  Load quotes safely using absolute path
const quotesPath = path.join(__dirname, "data", "gitaQuotes.json");
const quotes = JSON.parse(fs.readFileSync(quotesPath, "utf-8"));

// Setup mail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Main function: send random quote to all subscribers
async function sendDailyQuote() {
  try {
    const subscribers = await Subscriber.find();

    if (!subscribers.length) {
      console.log("⚠️ No subscribers found.");
      return;
    }

    if (!quotes.length) {
      console.log("⚠️ No quotes found.");
      return;
    }

    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    const mailContent = `
"${randomQuote.verse}"

Meaning: ${randomQuote.meaning}
— Chapter ${randomQuote.chapter}, Verse ${randomQuote.verseNumber}
`;

    for (const sub of subscribers) {
      await transporter.sendMail({
        from: `"Bhagavad Gita Daily" <${process.env.EMAIL_USER}>`,
        to: sub.email,
        subject: "🌞 Daily Bhagavad Gita Quote",
        text: mailContent,
      });
      console.log(`📨 Sent quote to: ${sub.email}`);
    }

    console.log(`✅ Daily quote sent successfully at ${new Date().toLocaleTimeString()}`);
  } catch (error) {
    console.error("❌ Error in sendDailyQuote:", error.message);
  }
}

//  Schedule cron job — everyday at 8am
cron.schedule("*/30 * * * * *", () => {
  console.log("⏰ Running scheduled job...");
  sendDailyQuote();
});

// Export if needed
export default sendDailyQuote;


