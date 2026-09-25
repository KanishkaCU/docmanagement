const generateAnswer = async (question, context) => {
  if (!context) {
    return "I could not find relevant information in the uploaded documents.";
  }

  // Mock response for now.
  // This can later be replaced with an actual LLM call.
  return `Based on the uploaded documents: ${context}`;
};

module.exports = {
  generateAnswer,
};