import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Edit() {

  // Router data
  const { id } = useParams();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    status: "",
    content: ""
  });
  
  // Modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // Dropdown options
  const statusOptions = ["Draft", "Published", "Archived"];
  const categoryOptions = ["Blog", "News", "Tech", "Lifestyle", "Infographic", "Review", "Guide", "Analysis", "Announcement", "Tutorial", "Opinion"];

  // Fetch post from API
  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/api/posts/${id}`)
      .then(res => setFormData(res.data))
      .catch(err => console.error(err));
  }, [id]);

  // Form handlers
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowUpdateModal(true);
  };

  const confirmUpdate = async () => {
    try {
      await axios.put(`http://127.0.0.1:8000/api/posts/${id}`, formData);
      setShowUpdateModal(false);
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Failed to update post");
    }
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    setShowCancelModal(false);
    navigate("/");
  };

  return (
    // Main container
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "30px", color: "#333" }}>Edit Post</h1>
    
      {/* Form */}
      <form onSubmit={handleSubmit} style={{ backgroundColor: "white", padding: "30px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="title" style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#333" }}>
            Title:
          </label>
          <input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ddd",
              borderRadius: "5px",
              fontSize: "14px",
              boxSizing: "border-box"
            }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="author" style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#333" }}>
            Author:
          </label>
          <input
            id="author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ddd",
              borderRadius: "5px",
              fontSize: "14px",
              boxSizing: "border-box"
            }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="category" style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#333" }}>
            Category:
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ddd",
              borderRadius: "5px",
              fontSize: "14px",
              boxSizing: "border-box"
            }}
          >
            <option value="">-- Select Category --</option>
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="status" style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#333" }}>
            Status:
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ddd",
              borderRadius: "5px",
              fontSize: "14px",
              boxSizing: "border-box"
            }}
          >
            <option value="">-- Select Status --</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "25px" }}>
          <label htmlFor="content" style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#333" }}>
            Content:
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            rows="10"
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ddd",
              borderRadius: "5px",
              fontSize: "14px",
              resize: "vertical",
              boxSizing: "border-box",
              fontFamily: "Arial, sans-serif"
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            type="button" 
            onClick={handleCancel}
            style={{
              flex: 1,
              padding: "12px",
              backgroundColor: "#f5f5f5",
              color: "#333",
              border: "1px solid #ddd",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold"
            }}
          >
            Cancel
          </button>
          <button 
            type="submit"
            style={{
              flex: 1,
              padding: "12px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold"
            }}
          >
            Update Post
          </button>
        </div>
      </form>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "10px",
            maxWidth: "400px",
            width: "90%",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
          }}>
            <h3 style={{ marginTop: 0, color: "#333" }}>Confirm Cancel</h3>
            <p style={{ color: "#666", lineHeight: "1.6" }}>
              Are you sure you want to cancel? All unsaved changes will be lost.
            </p>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button
                onClick={() => setShowCancelModal(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#f5f5f5",
                  color: "#333",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                Stay
              </button>
              <button
                onClick={confirmCancel}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#FF9800",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "bold"
                }}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Confirmation Modal */}
      {showUpdateModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "10px",
            maxWidth: "400px",
            width: "90%",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
          }}>
            <h3 style={{ marginTop: 0, color: "#333" }}>Confirm Update</h3>
            <p style={{ color: "#666", lineHeight: "1.6" }}>
              Are you sure you want to update this post with the new changes?
            </p>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button
                onClick={() => setShowUpdateModal(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#f5f5f5",
                  color: "#333",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmUpdate}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "bold"
                }}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}