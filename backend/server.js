const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const documentRoutes = require("./src/routes/documentRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/documents", documentRoutes);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(process.env.PORT, () => {
      console.log(`Server running on http://localhost:${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });

app.get("/", (req, res) => {
  res.json({
    message: "Document Management API is running",
  });
});