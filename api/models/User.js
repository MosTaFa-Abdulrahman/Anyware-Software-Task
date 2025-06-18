const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    quizResults: [
      {
        quizId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Quiz",
          required: true,
        },
        score: {
          type: Number,
          required: true,
          min: 0,
        },
        title: {
          type: String,
          required: true,
        },
        totalQuestions: {
          type: Number,
          required: true,
          min: 1,
        },
        completedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    completedQuizzes: [
      {
        quizId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Quiz",
          required: true,
        },
        completedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

UserSchema.index({ "completedQuizzes.quizId": 1 });
UserSchema.index({ "quizResults.quizId": 1 });

module.exports = mongoose.model("user", UserSchema);
