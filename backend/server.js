require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/students", require("./routes/student"));
app.use("/api/attendance", require("./routes/attendance"));
app.use("/api/marks", require("./routes/marks"));
app.use("/api/reports", require("./routes/reports"));
app.use("/api/holidays", require("./routes/holidays"));

// Test route
app.get("/", (req, res) => {
  res.json({ success: true, message: "Backend running 🚀" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: "Server Error",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));