const router = require("express").Router();
const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const User = require("../models/User");
const { protectedRoute } = require("../utils/protectedRoute");

// Create ((Quiz)) With ((Questions))
router.post("/create", protectedRoute, async (req, res) => {
  try {
    const { title, questions, timer } = req.body;
    const userId = req.user.id;

    const questionPromises = questions.map(async (question) => {
      const newQuestion = new Question(question);
      return await newQuestion.save();
    });
    const savedQuestions = await Promise.all(questionPromises);
    const newQuiz = new Quiz({
      user: userId,
      title,
      timer,
      questions: savedQuestions,
    });

    const savedQuiz = await newQuiz.save();
    res.status(200).json(savedQuiz);
  } catch (error) {
    res.status(400).json(error);
  }
});

// Get All Quizzes
router.get("/get/all/quizzes", protectedRoute, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const quizzes = await Quiz.find({})
      .populate("user", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Quiz.countDocuments({});

    res.status(200).json({
      quizzes,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalQuizzes: total,
        hasNextPage: skip + quizzes.length < total,
        hasPrevPage: parseInt(page) > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// Get a single quiz
router.get("/get/:quizId", protectedRoute, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId).populate(
      "user",
      "username email"
    );
    if (!quiz) {
      return res.status(404).json("Quiz not found");
    }
    res.status(200).json(quiz);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get Quizzes for Specific User
router.get("/get/user/:userId", protectedRoute, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const quizzes = await Quiz.find({ user: userId })
      .populate("user", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Quiz.countDocuments({ user: userId });

    res.status(200).json({
      quizzes,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalQuizzes: total,
        hasNextPage: skip + quizzes.length < total,
        hasPrevPage: parseInt(page) > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// Delete quiz (only by owner)
router.delete("/delete/:quizId", protectedRoute, async (req, res) => {
  try {
    const userId = req.user.id;
    const quiz = await Quiz.findById(req.params.quizId);

    if (!quiz) {
      return res.status(404).json("Quiz not found");
    }

    if (quiz.user.toString() !== userId) {
      return res.status(403).json("You can only delete your own quizzes");
    }

    await Quiz.findByIdAndDelete(req.params.quizId);
    await Question.deleteMany({ _id: { $in: quiz.questions } });

    res.status(200).json("Deleted Successfully 🤩");
  } catch (error) {
    res.status(500).json(error);
  }
});

// Update quiz
router.put("/update/:quizId", protectedRoute, async (req, res) => {
  const quizId = req.params.quizId;
  const { title, questions, timer } = req.body;
  const userId = req.user.id;

  try {
    // Find the quiz by ID
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json("Quiz not found");
    }

    // Check if user owns the quiz
    if (quiz.user.toString() !== userId) {
      return res.status(403).json("You can only update your own quizzes");
    }

    if (!title || !Array.isArray(questions) || questions.length === 0) {
      return res
        .status(400)
        .json({ message: "Title and questions are required" });
    }

    questions.forEach((question) => {
      const { question: q, options, answer } = question;
      if (!q || !Array.isArray(options) || options.length === 0 || !answer) {
        throw new Error(
          "Each question must have a question, options, and answer"
        );
      }
    });

    // Delete old questions
    await Question.deleteMany({ _id: { $in: quiz.questions } });

    // Create new questions
    const questionPromises = questions.map(async (question) => {
      const newQuestion = new Question(question);
      return await newQuestion.save();
    });
    const savedQuestions = await Promise.all(questionPromises);

    // Update the quiz
    quiz.title = title;
    quiz.timer = timer || quiz.timer;
    quiz.questions = savedQuestions;

    // Save the updated quiz
    await quiz.save();
    res.status(200).json("Quiz updated successfully");
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating quiz", error: error.message });
  }
});

// Submit quiz results for ((User))
router.post("/submit", protectedRoute, async (req, res) => {
  const { quizId, answers } = req.body;
  const userId = req.user.id; // Get from protected route instead of body

  try {
    const user = await User.findById(userId);
    const quiz = await Quiz.findById(quizId).populate("questions");

    if (!quiz) {
      return res.status(404).json("Quiz not found");
    }

    // Check if user has already completed the quiz
    if (
      user.completedQuizzes.some(
        (completedQuiz) => completedQuiz.quizId.toString() === quizId
      )
    ) {
      return res.status(400).json("You have already completed this quiz.");
    }

    // Calculate score
    let score = 0;
    quiz.questions.forEach((question, index) => {
      if (question.answer === answers[index]) {
        score += 1;
      }
    });

    // Update user's quiz results
    user.quizResults.push({
      quizId,
      score,
      title: quiz.title,
      totalQuestions: quiz.questions.length,
      completedAt: new Date(),
    });

    user.completedQuizzes.push({
      quizId,
      completedAt: new Date(),
    });

    await user.save();

    res.status(200).json({
      message: "Quiz submitted successfully",
      score,
      totalQuestions: quiz.questions.length,
      percentage: Math.round((score / quiz.questions.length) * 100),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
