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

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(API_URL);
      setDocuments(response.data);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load documents");
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setMessage("");

      await axios.post(`${API_URL}/upload`, formData);

      setMessage("Document uploaded successfully.");
      setFile(null);

      document.getElementById("fileInput").value = "";

      await fetchDocuments();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Upload failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);

      setMessage("Document deleted successfully.");
      await fetchDocuments();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Delete failed"
      );
    }
  };

  const handleDownload = (id) => {
    window.open(
      `${API_URL}/${id}/download`,
      "_blank"
    );
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      setMessage("Please enter a question.");
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
      setMessage(
        error.response?.data?.message ||
          "Failed to process question"
      );
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="app">

      {/* Sidebar */}
      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon">D</div>

          <div>
            <h1>DocuMind</h1>
            <span>AI Document Workspace</span>
          </div>
        </div>

        <div className="sidebar-section">

          <div className="section-title">
            <span>MY DOCUMENTS</span>

            <span className="count">
              {documents.length}
            </span>
          </div>

          <label
            htmlFor="fileInput"
            className="upload-button"
          >
            + Add document
          </label>

          <input
            id="fileInput"
            type="file"
            accept=".txt,.md,.json"
            onChange={(e) => {
              setFile(e.target.files[0]);
              setMessage("");
            }}
            hidden
          />

          {file && (
            <div className="selected-file">
              <span>{file.name}</span>

              <button onClick={handleUpload}>
                {loading ? "..." : "Upload"}
              </button>
            </div>
          )}

          <div className="sidebar-documents">

            {documents.length === 0 ? (
              <div className="empty-documents">
                <div>📁</div>
                <p>No documents yet</p>
                <span>
                  Upload a document to get started
                </span>
              </div>
            ) : (
              documents.map((doc) => (
                <div
                  className="sidebar-document"
                  key={doc._id}
                >

                  <div className="file-icon">
                    📄
                  </div>

                  <div className="file-details">
                    <strong>
                      {doc.originalName}
                    </strong>

                    <span>
                      {doc.fileType} •{" "}
                      {(doc.fileSize / 1024).toFixed(1)} KB
                    </span>
                  </div>

                  <div className="file-actions">

                    <button
                      title="Download"
                      onClick={() =>
                        handleDownload(doc._id)
                      }
                    >
                      ↓
                    </button>

                    <button
                      title="Delete"
                      onClick={() =>
                        handleDelete(doc._id)
                      }
                    >
                      ×
                    </button>

                  </div>

                </div>
              ))
            )}

          </div>

        </div>

        <div className="sidebar-footer">
          <span className="status-dot"></span>
          Local workspace
        </div>

      </aside>

      {/* Main workspace */}
      <main className="workspace">

        <div className="workspace-header">

          <div>
            <span className="eyebrow">
              DOCUMENT INTELLIGENCE
            </span>

            <h2>
              Ask anything about your documents.
            </h2>

            <p>
              Search your uploaded files and get
              answers with document sources.
            </p>
          </div>

          <div className="header-badge">
            ✦ AI Assistant
          </div>

        </div>

        {/* Question area */}
        <section className="question-area">

          <div className="question-label">
            <span>ASK A QUESTION</span>
          </div>

          <div className="question-input">

            <textarea
              value={question}
              placeholder="What would you like to know?"
              rows="3"
              onChange={(e) => {
                setQuestion(e.target.value);
                setMessage("");
              }}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey
                ) {
                  e.preventDefault();

                  if (!chatLoading) {
                    handleAskQuestion();
                  }
                }
              }}
            />

            <button
              className="ask-button"
              onClick={handleAskQuestion}
              disabled={chatLoading}
            >
              {chatLoading ? "Thinking..." : "Ask AI →"}
            </button>

          </div>

          <span className="input-hint">
            Press Enter to ask • Shift + Enter for a new line
          </span>

        </section>

        {/* Message */}
        {message && (
          <div className="notification">
            {message}
          </div>
        )}

        {/* Answer */}
        {answer ? (
          <section className="answer-area">

            <div className="answer-header">

              <div className="answer-title">
                <div className="ai-icon">✦</div>

                <div>
                  <span>AI RESPONSE</span>
                  <h3>Here's what I found</h3>
                </div>
              </div>

              <button
                className="clear-button"
                onClick={() => {
                  setQuestion("");
                  setAnswer("");
                  setSources([]);
                }}
              >
                Clear
              </button>

            </div>

            <div className="answer-content">
              {answer}
            </div>

            {sources.length > 0 && (
              <div className="sources-area">

                <div className="sources-heading">
                  <span>Sources used</span>
                  <span>
                    {sources.length}
                  </span>
                </div>

                <div className="sources-list">

                  {sources.map((source) => (
                    <div
                      className="source-card"
                      key={source._id}
                    >
                      <div className="source-icon">
                        📄
                      </div>

                      <span>
                        {source.originalName}
                      </span>
                    </div>
                  ))}

                </div>

              </div>
            )}

          </section>
        ) : (
          <section className="welcome-area">

            <div className="welcome-icon">
              ✦
            </div>

            <h3>
              Your documents, ready to explore.
            </h3>

            <p>
              Upload a document from the left and ask
              questions about its content here.
            </p>

            <div className="example-question">
              <span>Try asking:</span>
              <button
                onClick={() =>
                  setQuestion(
                    "How many days of annual leave are employees entitled to?"
                  )
                }
              >
                "How many days of annual leave are employees entitled to?"
              </button>
            </div>

          </section>
        )}

      </main>

    </div>
  );
}

export default App;