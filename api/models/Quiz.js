const mongoose = require("mongoose");
const QuestionSchema = require("./Question").schema;

const QuizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Quiz title is required"],
      trim: true,
    },
    timer: {
      type: Number,
      required: true,
      min: [1, "Timer must be at least 1 minute"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "Quiz must have an owner"],
    },
    questions: [QuestionSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Quiz", QuizSchema);
