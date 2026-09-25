const express = require("express");

const { askQuestion } = require("../controller/questionController");

const router = express.Router();

router.post("/ask", askQuestion);

module.exports = router;