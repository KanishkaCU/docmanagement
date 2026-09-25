const fs = require("fs");
const path = require("path");
const Document = require("../models/document");

const extractText = (filePath) => {
  const extension = path.extname(filePath).toLowerCase();

  if ([".txt", ".md", ".json"].includes(extension)) {
    return fs.readFileSync(filePath, "utf-8");
  }

  return "";
};

// Upload document
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const extractedText = extractText(req.file.path);

    const document = await Document.create({
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      fileType: path.extname(req.file.originalname).toLowerCase(),
      fileSize: req.file.size,
      extractedText,
    });

    res.status(201).json({
      message: "Document uploaded successfully",
      document,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to upload document",
      error: error.message,
    });
  }
};

// Get all documents
const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find()
      .sort({ createdAt: -1 })
      .select("-extractedText");

    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch documents",
      error: error.message,
    });
  }
};

// Download document
const downloadDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({
        message: "File not found",
      });
    }

    res.download(document.filePath, document.originalName);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid document ID",
      });
    }

    res.status(500).json({
      message: "Failed to download document",
      error: error.message,
    });
  }
};

// Delete document
const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    await Document.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Document deleted successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid document ID",
      });
    }

    res.status(500).json({
      message: "Failed to delete document",
      error: error.message,
    });
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  downloadDocument,
  deleteDocument,
};