import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import LogoutButton from "../components/LogoutButton";
import ExportButton from "../components/ExportButton";
import ManageUsersButton from "../components/ManageUsersButton";
import CreateNewButton from "../components/CreateNewButton";
 import PostsKPIDashboard from "../components/PostsKPIDashboard";

export default function Home() {
  // Data states
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  
  // Search & Filter states (sent to backend)
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  
  // Sorting state (sent to backend)
  const [sortBy, setSortBy] = useState("date"); 
  const [sortOrder, setSortOrder] = useState("desc"); 
  
  // Pagination state (sent to backend)
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(10);
  
  // Filter options from backend
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [postToDelete, setPostToDelete] = useState(null);

  // Get user data from localStorage
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const role = user?.role;

  // Fetch posts from API with filters, sorting, and pagination
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Build query parameters for backend
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterCategory) params.append('category', filterCategory);
      if (filterStatus) params.append('status', filterStatus);
      params.append('sort_by', sortBy);
      params.append('sort_order', sortOrder);
      params.append('per_page', postsPerPage);
      params.append('page', currentPage);

      const res = await axios.get(`http://localhost:8000/api/posts?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      // Laravel pagination response
      setPosts(res.data.data); // Posts are in 'data' property
      setTotalPages(res.data.last_page);
      setTotalPosts(res.data.total);
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch filter options
  const fetchFilters = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/posts/filters/options");
      setCategories(res.data.categories);
      setStatuses(res.data.statuses);
    } catch (err) {
      console.error("Failed to fetch filters:", err);
    }
  };

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8000/api/me", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUserName(res.data.name);
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      if (user?.name) {
        setUserName(user.name);
      }
    }
  };

  // Handle post deletion
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8000/api/posts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setShowDeleteModal(false);
      setPostToDelete(null);
      
      // Refresh posts
      fetchPosts();
      
      // Show success message
      setSuccessMessage("Post deleted successfully!");
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 2000);
      
    } catch (err) {
      console.error(err);
      alert("Failed to delete post");
    }
  };

  // Open modals
  const openDeleteModal = (post) => {
    setPostToDelete(post);
    setShowDeleteModal(true);
  };

  const openViewModal = (post) => {
    setSelectedPost(post);
    setShowViewModal(true);
  };

  // Fetch data on mount and when filters/sorting/pagination change
  useEffect(() => {
    fetchPosts();
  }, [searchTerm, filterCategory, filterStatus, sortBy, sortOrder, currentPage]);

  useEffect(() => {
    fetchUserProfile();
    fetchFilters();
  }, []);

  // Reset to page 1 when filters change
  const handleFilterChange = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <header className="mb-8 border-b-2 border-gray-800 pb-2 grid grid-cols-3 items-start">
        <div className="flex flex-col">
          <p className="text-gray-500 mt-1 text-sm">
            Logged in as: <span className="font-medium text-gray-700">{userName || "User"}</span>
          </p>
        </div>

        <div className="text-center">
          <h1 className="m-0 text-gray-800 text-4xl leading-tight">
            Bulletin
          </h1>
        </div>

        <div className="flex justify-end">
          <LogoutButton />
        </div>
      </header>

      <main>

        {/*KPI Dashboard */}
        <PostsKPIDashboard />
        
        {/* All Posts Section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: "0" }}>All Posts</h2>
          
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {role === "admin" && (
              <>
                <ManageUsersButton />
                <ExportButton />
              </>
            )}
            <CreateNewButton />
          </div>
        </div>

        {/* Search and Filter Section */}
        <div style={{ 
          backgroundColor: "#f5f5f5", 
          padding: "20px", 
          borderRadius: "8px", 
          marginBottom: "20px",
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr",
          gap: "15px"
        }}>
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Search:
            </label>
            <input
              type="text"
              placeholder="Search by title, author, or category..."
              value={searchTerm}
              onChange={(e) => handleFilterChange(setSearchTerm)(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                fontSize: "14px"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Category:
            </label>
            <select
              value={filterCategory}
              onChange={(e) => handleFilterChange(setFilterCategory)(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                fontSize: "14px"
              }}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Status:
            </label>
            <select
              value={filterStatus}
              onChange={(e) => handleFilterChange(setFilterStatus)(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                fontSize: "14px"
              }}
            >
              <option value="">All Statuses</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sorting Section */}
        <div style={{ 
          display: "flex", 
          gap: "15px", 
          marginBottom: "20px",
          alignItems: "center"
        }}>
          <div>
            <label style={{ marginRight: "8px", fontWeight: "bold" }}>Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                fontSize: "14px"
              }}
            >
              <option value="date">Date</option>
              <option value="title">Title</option>
              <option value="author">Author</option>
            </select>
          </div>

          <div>
            <label style={{ marginRight: "8px", fontWeight: "bold" }}>Order:</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              style={{
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                fontSize: "14px"
              }}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>

          <div style={{ marginLeft: "auto", color: "#666" }}>
            Showing {posts.length} of {totalPosts} posts (Page {currentPage} of {totalPages})
          </div>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {/* Table - keeping existing structure */}
            <table style={{ 
              width: "100%", 
              borderCollapse: "collapse", 
              backgroundColor: "white",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
              {/* Table header and body same as before */}
              <thead>
                <tr style={{ backgroundColor: "#333", color: "white" }}>
                  <th style={{ padding: "15px", textAlign: "left", width: "50px" }}>#</th>
                  <th style={{ padding: "15px", textAlign: "left" }}>Title</th>
                  <th style={{ padding: "15px", textAlign: "left" }}>Author</th>
                  <th style={{ padding: "15px", textAlign: "left" }}>Category</th>
                  <th style={{ padding: "15px", textAlign: "left" }}>Status</th>
                  <th style={{ padding: "15px", textAlign: "left" }}>Date</th>
                  <th style={{ padding: "15px", textAlign: "center", width: "200px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post, index) => (
                  <tr key={post.id} style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={{ padding: "15px" }}>{((currentPage - 1) * postsPerPage) + index + 1}</td>
                    <td style={{ padding: "15px" }}>{post.title}</td>
                    <td style={{ padding: "15px" }}>{post.author}</td>
                    <td style={{ padding: "15px" }}>
                      <span style={{
                        padding: "4px 8px",
                        backgroundColor: "#e3f2fd",
                        borderRadius: "4px",
                        fontSize: "12px"
                      }}>
                        {post.category}
                      </span>
                    </td>
                    <td style={{ padding: "15px" }}>
                      <span style={{
                        padding: "4px 8px",
                        backgroundColor: post.status === "Published" ? "#c8e6c9" : post.status === "Draft" ? "#fff9c4" : "#ffccbc",
                        borderRadius: "4px",
                        fontSize: "12px"
                      }}>
                        {post.status}
                      </span>
                    </td>
                    <td style={{ padding: "15px" }}>{new Date(post.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: "15px", textAlign: "center" }}>
                      <button
                        onClick={() => openViewModal(post)}
                        style={{
                          padding: "6px 12px",
                          marginRight: "5px",
                          backgroundColor: "#2196F3",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px"
                        }}
                      >
                        View
                      </button>
                      {(role === "editor" || role === "admin") && (
                      <Link
                        to={`/edit/${post.id}`}
                        style={{
                          padding: "6px 12px",
                          marginRight: "5px",
                          backgroundColor: "#FF9800",
                          color: "white",
                          textDecoration: "none",
                          borderRadius: "4px",
                          fontSize: "12px",
                          display: "inline-block"
                        }}
                      >
                        Edit
                      </Link>
                      )}
                      {role === "admin" && (
                      <button
                        onClick={() => openDeleteModal(post)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#f44336",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px"
                        }}
                      >
                        Delete
                      </button>
                      )}
                    </td>
                  </tr>
                ))}
                {posts.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ padding: "30px", textAlign: "center", color: "#666" }}>
                      No posts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ 
                marginTop: "30px", 
                display: "flex", 
                justifyContent: "center", 
                gap: "8px",
                alignItems: "center"
              }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: "10px 15px",
                    backgroundColor: currentPage === 1 ? "#ccc" : "#333",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    fontSize: "14px"
                  }}
                >
                  Previous
                </button>

                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => setCurrentPage(index + 1)}
                    style={{
                      padding: "10px 15px",
                      backgroundColor: currentPage === index + 1 ? "#4CAF50" : "#f5f5f5",
                      color: currentPage === index + 1 ? "white" : "#333",
                      border: "1px solid #ddd",
                      borderRadius: "5px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: currentPage === index + 1 ? "bold" : "normal"
                    }}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: "10px 15px",
                    backgroundColor: currentPage === totalPages ? "#ccc" : "#333",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                    fontSize: "14px"
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Success Toast */}
      {showSuccessModal && (
        <div style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          backgroundColor: "#4CAF50",
          color: "white",
          padding: "15px 25px",
          borderRadius: "5px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          zIndex: 10000
        }}>
          <strong>✓ {successMessage}</strong>
        </div>
      )}

      {/* View Modal - keeping existing */}
      {showViewModal && selectedPost && (
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
            maxWidth: "600px",
            width: "90%",
            maxHeight: "80vh",
            overflow: "auto",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, color: "#333" }}>Post Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#666"
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <strong style={{ color: "#666", display: "block", marginBottom: "5px" }}>Title:</strong>
              <p style={{ margin: 0, fontSize: "18px", color: "#333" }}>{selectedPost.title}</p>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <strong style={{ color: "#666", display: "block", marginBottom: "5px" }}>Author:</strong>
              <p style={{ margin: 0, color: "#333" }}>{selectedPost.author}</p>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <strong style={{ color: "#666", display: "block", marginBottom: "5px" }}>Category:</strong>
              <span style={{
                padding: "6px 12px",
                backgroundColor: "#e3f2fd",
                borderRadius: "4px",
                fontSize: "14px"
              }}>
                {selectedPost.category}
              </span>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <strong style={{ color: "#666", display: "block", marginBottom: "5px" }}>Status:</strong>
              <span style={{
                padding: "6px 12px",
                backgroundColor: selectedPost.status === "Published" ? "#c8e6c9" : selectedPost.status === "Draft" ? "#fff9c4" : "#ffccbc",
                borderRadius: "4px",
                fontSize: "14px"
              }}>
                {selectedPost.status}
              </span>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <strong style={{ color: "#666", display: "block", marginBottom: "5px" }}>Date Created:</strong>
              <p style={{ margin: 0, color: "#333" }}>{new Date(selectedPost.created_at).toLocaleString()}</p>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <strong style={{ color: "#666", display: "block", marginBottom: "5px" }}>Content:</strong>
              <div style={{
                padding: "15px",
                backgroundColor: "#f9f9f9",
                borderRadius: "5px",
                lineHeight: "1.6",
                color: "#333",
                whiteSpace: "pre-wrap"
              }}>
                {selectedPost.content}
              </div>
            </div>

            <button
              onClick={() => setShowViewModal(false)}
              style={{
                padding: "10px 20px",
                backgroundColor: "#333",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "14px",
                width: "100%"
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Modal - keeping existing */}
      {showDeleteModal && postToDelete && (
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
            <h3 style={{ marginTop: 0, color: "#333" }}>Confirm Delete</h3>
            <p style={{ color: "#666", lineHeight: "1.6" }}>
              Are you sure you want to delete the post "<strong>{postToDelete.title}</strong>"?
              This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPostToDelete(null);
                }}
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
                onClick={() => handleDelete(postToDelete.id)}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "bold"
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}