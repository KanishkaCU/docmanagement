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

module.exports = {
  uploadDocument,
  getDocuments,
};