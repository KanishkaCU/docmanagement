const fs = require("fs");
const path = require("path");
const Document = require("../models/Document");

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

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({
      message: "Failed to upload document",
      error: error.message,
    });
  }
};

module.exports = {
  uploadDocument,
};