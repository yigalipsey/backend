const express = require("express");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const colors = require("colors");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");
const translateRoutes = require("./routes/translateRoutes");
const dailyIntakeRoutes = require("./routes/dailyIntakeRoutes");
const cors = require("cors");
const connectDB = require("./config/db");

//te
const morgan = require("morgan");

//check

require("dotenv").config();

connectDB();

const app = express();

// Use morgan middleware for logging
app.use(morgan("dev"));

// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(
  cors({
    origin: ["https://www.yigalipsey-fittnes.com"], // תמיכה גם בלוקאל וגם בדומיין שלך
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Middleware שמאפשר לכל נתיב לקבל בקשות OPTIONS
app.options("*", cors());

// Routes
app.use("/api/translate", translateRoutes);
app.use("/api/users", userRoutes);
app.use("/api/daily_intake", dailyIntakeRoutes);

// error handling
app.use(notFound);
app.use(errorHandler);

const PORT = 8080;

console.log("Secret key:", process.env.SECRET);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`.yellow.underline);
});
