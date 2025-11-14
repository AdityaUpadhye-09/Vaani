import mongoose from "mongoose";

const quoteSchema = new mongoose.Schema({
  verse: {
    type: String,
    required: true,
  },
  chapter: {
    type: Number,
  },
  verseNumber: {
    type: Number,
  },
  meaning: {
    type: String,
  },
});

const Quote = mongoose.model("Quote", quoteSchema);

export default Quote;
