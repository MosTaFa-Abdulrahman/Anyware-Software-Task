const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 8080;
const authRoute = require("./routes/auth");
const quizRoute = require("./routes/quiz");
const announcementRoute = require("./routes/announcement");

// Express Usages
dotenv.config();
app.use(cookieParser());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
const corsOptions = {
  origin: ["http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  exposedHeaders: ["Set-Cookie"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

// Database Config
mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("DB Work 😍"))
  .catch((err) => console.log(`Error ${err.message}`));

// MiddleWares
app.use("/api/auth", authRoute);
app.use("/api/quiz", quizRoute);
app.use("/api/announcement", announcementRoute);

app.listen(PORT, () => console.log(`Server Running on PORT ${PORT} 🥰`));
