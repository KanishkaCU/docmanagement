const express = require("express");
const upload = require("../middleware/upload");

const {
  uploadDocument,
  getDocuments,
} = require("../controller/documentController");

const router = express.Router();

// Upload document
router.post("/upload", upload.single("file"), uploadDocument);

// Get all documents
router.get("/", getDocuments);

module.exports = router;