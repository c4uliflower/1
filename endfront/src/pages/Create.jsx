import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Create() {
  // Navigation
  const navigate = useNavigate();

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    status: "",
    content: ""
  });

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowCreateModal(true);
  };

  const confirmCreate = async () => {
    setIsSubmitting(true);
    setError(null);
    
    // Send form data to the backend
    try {
      const response = await axios.post('http://localhost:8000/api/create-new', formData, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      setShowCreateModal(false);
      navigate('/');
      
    } catch (error) {
      console.error("Error submitting form:", error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors || 
                          'Failed to create post';
      
      setError(errorMessage);
      setShowCreateModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    setShowCancelModal(false);
    navigate('/');
  };

  return (
    // Main container
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "30px", color: "#333" }}>Create New Post</h1>
      
      {error && (
        <div style={{ 
          color: 'white', 
          backgroundColor: '#f44336',
          padding: '15px',
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          Error: {JSON.stringify(error)}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ backgroundColor: "white", padding: "30px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="title" style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#333" }}>
            Title *
          </label>
          <input
            id="title"
            type="text"
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
            Author *
          </label>
          <input
            id="author"
            type="text"
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
            Category *
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
            <option value="">Select category</option>
            <option value="Blog">Blog</option>
            <option value="News">News</option>
            <option value="Tech">Tech</option>
            <option value="Lifestyle">Lifestyle</option>
            <option value="Infographic">Infographic</option>
            <option value="Review">Review</option>
            <option value="Guide">Guide</option>
            <option value="Analysis">Analysis</option>
            <option value="Announcement">Announcement</option>
            <option value="Tutorial">Tutorial</option>
            <option value="Opinion">Opinion</option>
          </select>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="status" style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#333" }}>
            Status *
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
            <option value="">Select status</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        <div style={{ marginBottom: "25px" }}>
          <label htmlFor="content" style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#333" }}>
            Content *
          </label>
          <textarea
            id="content"
            name="content"
            rows="10"
            value={formData.content}
            onChange={handleChange}
            required
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
          ></textarea>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            type="button" 
            onClick={handleCancel}
            disabled={isSubmitting}
            style={{
              flex: 1,
              padding: "12px",
              backgroundColor: "#f5f5f5",
              color: "#333",
              border: "1px solid #ddd",
              borderRadius: "5px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: "bold",
              opacity: isSubmitting ? 0.6 : 1
            }}
          >
            Cancel
          </button>
          
          <button 
            type="submit"
            disabled={isSubmitting}
            style={{
              flex: 1,
              padding: "12px",
              backgroundColor: isSubmitting ? "#ccc" : "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: "bold"
            }}
          >
            {isSubmitting ? "Creating..." : "Create Post"}
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
              Are you sure you want to cancel? All entered data will be lost.
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

      {/* Create Confirmation Modal */}
      {showCreateModal && (
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
            <h3 style={{ marginTop: 0, color: "#333" }}>Confirm Create</h3>
            <p style={{ color: "#666", lineHeight: "1.6" }}>
              Are you sure you want to create this post?
            </p>
            <div style={{ marginTop: "15px", padding: "10px", backgroundColor: "#f9f9f9", borderRadius: "5px" }}>
              <p style={{ margin: "5px 0", fontSize: "14px" }}><strong>Title:</strong> {formData.title}</p>
              <p style={{ margin: "5px 0", fontSize: "14px" }}><strong>Author:</strong> {formData.author}</p>
              <p style={{ margin: "5px 0", fontSize: "14px" }}><strong>Category:</strong> {formData.category}</p>
              <p style={{ margin: "5px 0", fontSize: "14px" }}><strong>Status:</strong> {formData.status}</p>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#f5f5f5",
                  color: "#333",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  opacity: isSubmitting ? 0.6 : 1
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmCreate}
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: isSubmitting ? "#ccc" : "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: "bold"
                }}
              >
                {isSubmitting ? "Creating..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}