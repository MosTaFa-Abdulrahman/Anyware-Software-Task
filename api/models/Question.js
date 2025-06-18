const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, "Question is required"],
  },
  options: {
    type: [String],
    validate: {
      validator: (options) => options.length > 0,
      message: "At least one option is required",
    },
    required: [true, "Options are required"],
  },
  answer: {
    type: String,
    required: [true, "Answer is required"],
  },
});

module.exports = mongoose.model("Question", QuestionSchema);
