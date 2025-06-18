const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");
const { protectedRoute } = require("../utils/protectedRoute");
const {
  generateTokenAndSetCookie,
} = require("../utils/generateTokenAndSetCookie");

// Register
router.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Input validation
    if (!email || !username || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists 🙄🧐" });
    }

    // Hash password
    const saltRounds = 10;
    const hashPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      email: email.toLowerCase(),
      username,
      password: hashPassword,
    });

    const savedUser = await newUser.save();

    // Generate token
    generateTokenAndSetCookie(savedUser._id, res);

    res.status(201).json({
      _id: savedUser._id,
      username: savedUser.username,
      email: savedUser.email,
      quizResults: savedUser.quizResults || [],
      completedQuizzes: savedUser.completedQuizzes || [],
    });
  } catch (error) {
    if (
      error.name === "MongooseError" &&
      error.message.includes("buffering timed out")
    ) {
      return res
        .status(503)
        .json({ error: "Database connection issue. Please try again." });
    }
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Validate password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate token
    generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      quizResults: user.quizResults || [],
      completedQuizzes: user.completedQuizzes || [],
    });
  } catch (error) {
    if (
      error.name === "MongooseError" &&
      error.message.includes("buffering timed out")
    ) {
      return res
        .status(503)
        .json({ error: "Database connection issue. Please try again." });
    }
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// Get Current User
router.get("/me", protectedRoute, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: "quizResults.quizId",
        select: "title description",
        options: { maxTimeMS: 5000 },
      })
      .populate({
        path: "completedQuizzes.quizId",
        select: "title description",
        options: { maxTimeMS: 5000 },
      });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      quizResults: user.quizResults || [],
      completedQuizzes: user.completedQuizzes || [],
    });
  } catch (error) {
    if (
      error.name === "MongooseError" &&
      error.message.includes("buffering timed out")
    ) {
      return res
        .status(503)
        .json({ error: "Database connection issue. Please try again." });
    }
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});

// Logout
router.post("/logout", protectedRoute, (req, res) => {
  try {
    // Clear the cookie
    res.cookie("access_token", "", {
      maxAge: 1,
    });

    res.status(200).json({ message: "User logged out successfully 😍" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Logout failed" });
  }
});

module.exports = router;
