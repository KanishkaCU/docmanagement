import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:5000/api/documents";

function App() {
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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

      fetchDocuments();
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

      setMessage("Document deleted successfully");
      fetchDocuments();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Delete failed"
      );
    }
  };

  const handleDownload = (id) => {
    window.open(`${API_URL}/${id}/download`, "_blank");
  };

  return (
    <div className="app">
      <header>
        <h1>Document Management & AI Assistant</h1>
        <p>Upload, manage and interact with your documents</p>
      </header>

      <main>
        <section className="upload-section">
          <h2>Upload Document</h2>

          <div className="upload-box">
            <input
              id="fileInput"
              type="file"
              accept=".txt,.md,.json"
              onChange={(e) => setFile(e.target.files[0])}
            />

            <button onClick={handleUpload} disabled={loading}>
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>

          {message && <p className="message">{message}</p>}
        </section>

        <section className="documents-section">
          <h2>Uploaded Documents</h2>

          {documents.length === 0 ? (
            <p>No documents uploaded yet.</p>
          ) : (
            <div className="document-list">
              {documents.map((doc) => (
                <div className="document-card" key={doc._id}>
                  <div>
                    <h3>{doc.originalName}</h3>

                    <p>
                      Type: {doc.fileType} | Size:{" "}
                      {(doc.fileSize / 1024).toFixed(2)} KB
                    </p>

                    <p>
                      Uploaded:{" "}
                      {new Date(doc.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="actions">
                    <button
                      onClick={() => handleDownload(doc._id)}
                    >
                      Download
                    </button>

                    <button
                      className="delete-button"
                      onClick={() => handleDelete(doc._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;