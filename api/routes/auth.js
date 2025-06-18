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
    // Check User
    const { email, username } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    const user = await User.findOne({ $or: [{ email }, { username }] });

    if (user) {
      return res.status(400).json({ error: "User already exists 🙄🧐" });
    } else {
      const hashPassword = await bcrypt.hash(req.body.password, 10);

      const newUser = new User({ ...req.body, password: hashPassword });
      await newUser.save();

      if (newUser) {
        generateTokenAndSetCookie(newUser._id, res);

        res.status(200).json({
          _id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          quizResults: newUser.quizResults || [],
          completedQuizzes: newUser.completedQuizzes || [],
        });
      } else res.status(400).json({ error: "Invalid user data 😥" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(400).json({ error: "User Not Found 🙄🧐" });
    } else {
      const validatePassword = bcrypt.compareSync(
        req.body.password,
        user.password
      );
      if (!validatePassword) {
        return res.status(404).json({ error: "Wrong Password 😥" });
      } else {
        generateTokenAndSetCookie(user._id, res);

        res.status(200).json({
          _id: user._id,
          username: user.username,
          email: user.email,
          quizResults: user.quizResults || [],
          completedQuizzes: user.completedQuizzes || [],
        });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Current User
router.get("/me", protectedRoute, async (req, res) => {
  try {
    // Get the full user data with populated quiz references
    const user = await User.findById(req.user._id)
      .populate("quizResults.quizId", "title description")
      .populate("completedQuizzes.quizId", "title description");

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      quizResults: user.quizResults || [],
      completedQuizzes: user.completedQuizzes || [],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout
router.post("/logout", (req, res) => {
  try {
    res.cookie("access_token", "", { maxAge: 1 });
    res.status(200).json({ message: "User logged out successfully 😍" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
