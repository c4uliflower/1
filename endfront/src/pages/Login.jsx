import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(""); // Clear previous errors

    try {
      const res = await api.post("/login", {
        email,
        password,
      });
      
      // Store token & user role in localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Show success modal
      setShowSuccessModal(true);

      // Redirect after 1.5 seconds
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (err) {
      setIsSubmitting(false);
      
      // Determine error message
      let message = "An error occurred. Please try again.";
      
      if (err.response) {
        // Check for specific error messages from backend
        if (err.response.status === 401) {
          message = "Invalid email or password. Please try again.";
        } else if (err.response.status === 404) {
          message = "Account not found. Please check your email or register.";
        } else if (err.response.data?.message) {
          message = err.response.data.message;
        }
      } else if (err.request) {
        message = "Unable to connect to server. Please check your internet connection.";
      }
      
      setErrorMessage(message);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f5f5f5",
      fontFamily: "Arial, sans-serif",
      padding: "20px"
    }}>
      <div style={{
        backgroundColor: "white",
        padding: "40px",
        borderRadius: "10px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        maxWidth: "400px",
        width: "100%"
      }}>
        <h2 style={{
          margin: "0 0 30px 0",
          color: "#333",
          textAlign: "center",
          fontSize: "28px"
        }}>
          Login
        </h2>

        {/* Error Message Box */}
        {errorMessage && (
          <div style={{
            backgroundColor: "#ffebee",
            border: "1px solid #f44336",
            borderRadius: "5px",
            padding: "12px 15px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            <span style={{
              color: "#f44336",
              fontSize: "18px",
              fontWeight: "bold"
            }}>
              ⚠
            </span>
            <p style={{
              margin: 0,
              color: "#c62828",
              fontSize: "14px",
              lineHeight: "1.4"
            }}>
              {errorMessage}
            </p>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
              color: "#333",
              fontSize: "14px"
            }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMessage(""); // Clear error when user types
              }}
              required
              style={{
                width: "100%",
                padding: "12px",
                border: errorMessage ? "1px solid #f44336" : "1px solid #ddd",
                borderRadius: "5px",
                fontSize: "14px",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div style={{ marginBottom: "25px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
              color: "#333",
              fontSize: "14px"
            }}>
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMessage(""); // Clear error when user types
              }}
              required
              style={{
                width: "100%",
                padding: "12px",
                border: errorMessage ? "1px solid #f44336" : "1px solid #ddd",
                borderRadius: "5px",
                fontSize: "14px",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div style={{ textAlign: "right", marginBottom: "20px" }}>
            <Link 
              to="/forgot-password"
              style={{
                color: "#2196F3",
                fontSize: "14px",
                textDecoration: "none"
              }}
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: isSubmitting ? "#ccc" : "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              marginBottom: "15px"
            }}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>

          <div style={{
            textAlign: "center",
            fontSize: "14px",
            color: "#666"
          }}>
            Don't have an account?{" "}
            <Link 
              to="/register" 
              style={{
                color: "#2196F3",
                fontWeight: "bold",
                textDecoration: "none"
              }}
            >
              Register here
            </Link>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
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
            maxWidth: "300px",
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
          }}>
            <div style={{
              width: "60px",
              height: "60px",
              backgroundColor: "#4CAF50",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: "30px",
              color: "white"
            }}>
              ✓
            </div>
            <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>Login Successful!</h3>
            <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
              Redirecting to dashboard...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}