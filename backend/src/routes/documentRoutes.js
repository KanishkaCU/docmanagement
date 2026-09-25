const express = require("express");
const upload = require("../middleware/upload");

const {
  uploadDocument,
  getDocuments,
  downloadDocument,
  deleteDocument,
} = require("../controller/documentController");

const router = express.Router();

// Upload
router.post("/upload", upload.single("file"), uploadDocument);

// List
router.get("/", getDocuments);

// Download
router.get("/:id/download", downloadDocument);

// Delete
router.delete("/:id", deleteDocument);

module.exports = router;