const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const documentRoutes = require("./src/routes/documentRoutes");
const questionRoutes = require("./src/routes/questionRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/documents", documentRoutes);
app.use("/api/questions", questionRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "Document Management API is running",
  });
});

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(process.env.PORT, () => {
      console.log(
        `Server running on http://localhost:${process.env.PORT}`
      );
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });