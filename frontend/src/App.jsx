import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:5000/api/documents";
const QUESTION_API_URL = "http://localhost:5000/api/questions";

function App() {
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // AI Assistant
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  // Fetch documents
  const fetchDocuments = async () => {
    try {
      const response = await axios.get(API_URL);
      setDocuments(response.data);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load documents");
    }
  };

  // Load documents when page opens
  useEffect(() => {
    fetchDocuments();
  }, []);

  // Upload document
  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setMessage("");

      await axios.post(`${API_URL}/upload`, formData);

      setMessage("Document uploaded successfully");

      setFile(null);

      document.getElementById("fileInput").value = "";

      await fetchDocuments();
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message || "Upload failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // Delete document
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);

      setMessage("Document deleted successfully");

      await fetchDocuments();
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message || "Delete failed"
      );
    }
  };

  // Download document
  const handleDownload = (id) => {
    window.open(
      `${API_URL}/${id}/download`,
      "_blank"
    );
  };

  // Ask AI
  const handleAskQuestion = async () => {
    if (!question.trim()) {
      setMessage("Please enter a question");
      return;
    }

    try {
      setChatLoading(true);
      setMessage("");

      setAnswer("");
      setSources([]);

      const response = await axios.post(
        `${QUESTION_API_URL}/ask`,
        {
          question: question.trim(),
        }
      );

      setAnswer(response.data.answer);
      setSources(response.data.sources || []);
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Failed to process question"
      );
    } finally {
      setChatLoading(false);
    }
  };

  // Clear AI answer
  const handleClearAnswer = () => {
    setQuestion("");
    setAnswer("");
    setSources([]);
  };

  return (
    <div className="app">

      {/* Header */}
      <header>
        <div className="header-content">
          <h1>Document Management & AI Assistant</h1>

          <p>
            Manage your documents and ask questions using AI
          </p>
        </div>
      </header>

      <main>

        {/* Upload Section */}
        <section className="upload-section">

          <h2>Upload Document</h2>

          <p className="upload-description">
            Upload TXT, Markdown or JSON documents.
          </p>

          <div className="upload-box">

            <input
              id="fileInput"
              type="file"
              accept=".txt,.md,.json"
              onChange={(e) => {
                setFile(e.target.files[0]);
                setMessage("");
              }}
            />

            <button
              onClick={handleUpload}
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload"}
            </button>

          </div>

          {file && (
            <p className="upload-description">
              Selected: <strong>{file.name}</strong>
            </p>
          )}

          {message && (
            <p className="message">
              {message}
            </p>
          )}

        </section>

        {/* Documents Section */}
        <section className="documents-section">

          <div className="documents-header">

            <h2>Uploaded Documents</h2>

            <span className="document-count">
              {documents.length}{" "}
              {documents.length === 1
                ? "document"
                : "documents"}
            </span>

          </div>

          {documents.length === 0 ? (

            <p>
              No documents uploaded yet.
            </p>

          ) : (

            <div className="document-list">

              {documents.map((doc) => (

                <div
                  className="document-card"
                  key={doc._id}
                >

                  <div className="document-info">

                    <div className="document-title">

                      <div className="document-icon">
                        📄
                      </div>

                      <h3>
                        {doc.originalName}
                      </h3>

                    </div>

                    <p>
                      {doc.fileType} •{" "}
                      {(doc.fileSize / 1024).toFixed(2)} KB
                      {" • "}
                      {new Date(
                        doc.createdAt
                      ).toLocaleString()}
                    </p>

                  </div>

                  <div className="actions">

                    <button
                      onClick={() =>
                        handleDownload(doc._id)
                      }
                    >
                      Download
                    </button>

                    <button
                      className="delete-button"
                      onClick={() =>
                        handleDelete(doc._id)
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

        {/* AI Assistant */}
        <section className="ai-section">

          <h2>🤖 AI Document Assistant</h2>

          <p className="ai-description">
            Ask questions about the information contained
            in your uploaded documents.
          </p>

          <div className="question-box">

            <input
              type="text"
              placeholder="e.g. How many days of annual leave are available?"
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value);
                setMessage("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !chatLoading) {
                  handleAskQuestion();
                }
              }}
            />

            <button
              onClick={handleAskQuestion}
              disabled={chatLoading}
            >
              {chatLoading ? "Thinking..." : "Ask"}
            </button>

          </div>

          {/* AI Answer */}
          {answer && (

            <div className="answer-box">

              <h3>Answer</h3>

              <p>
                {answer}
              </p>

              {/* Sources */}
              {sources.length > 0 && (

                <div className="sources">

                  <h4>Sources</h4>

                  {sources.map((source) => (

                    <div
                      className="source-item"
                      key={source._id}
                    >
                      📄 {source.originalName}
                    </div>

                  ))}

                </div>

              )}

              <button
                className="delete-button"
                onClick={handleClearAnswer}
                style={{ marginTop: "15px" }}
              >
                Clear
              </button>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default App;