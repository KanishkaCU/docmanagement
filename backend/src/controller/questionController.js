const Document = require("../models/document");
const { generateAnswer } = require("../services/aiService");

const askQuestion = async (req, res) => {
  try {
    const { question } = req.body;

    // Check if question exists
    if (!question || !question.trim()) {
      return res.status(400).json({
        message: "Question is required",
      });
    }

    // Get all uploaded documents
    const documents = await Document.find();

    // Convert question into keywords
    const keywords = question
      .toLowerCase()
      .split(/\W+/)
      .filter((word) => word.length > 2);

    // Calculate relevance score
    const scoredDocuments = documents.map((doc) => {
      const text = (doc.extractedText || "").toLowerCase();

      let score = 0;

      keywords.forEach((keyword) => {
        if (text.includes(keyword)) {
          score++;
        }
      });

      return {
        document: doc,
        score,
      };
    });

    // Sort highest relevance first
    scoredDocuments.sort((a, b) => b.score - a.score);

    // Select top 3 relevant documents
    const relevantDocuments = scoredDocuments
      .filter((item) => item.score > 0)
      .slice(0, 3);

    // If nothing relevant was found
    if (relevantDocuments.length === 0) {
      return res.status(200).json({
        answer:
          "I could not find relevant information in the uploaded documents.",
        sources: [],
      });
    }

    // Build context for AI
    const context = relevantDocuments
      .map(
        (item) =>
          `Document: ${item.document.originalName}\n${item.document.extractedText}`
      )
      .join("\n\n");

    // Generate answer
    const answer = await generateAnswer(question, context);

    // Return source documents
    const sources = relevantDocuments.map((item) => ({
      _id: item.document._id,
      originalName: item.document.originalName,
    }));

    res.status(200).json({
      answer,
      sources,
    });
  } catch (error) {
    console.error("Question error:", error);

    res.status(500).json({
      message: "Failed to process question",
      error: error.message,
    });
  }
};

module.exports = {
  askQuestion,
};