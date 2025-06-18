const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    semester: {
      type: String,
      required: [true, "Semester is required"],
      trim: true,
      default: "",
    },
    category: {
      type: String,
      enum: ["general", "exam", "event", "news"],
      default: "general",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("announcement", AnnouncementSchema);
