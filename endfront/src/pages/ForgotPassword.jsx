import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPassword = (password) => {
    return password.length >= 6;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Clear previous errors
    setIsSubmitting(true);

    try {
      await api.post("/forgot-password", {
        email,
        password,
        password_confirmation: confirmPassword,
      });

      // Show success modal
      setShowSuccessModal(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setIsSubmitting(false);
      
      // Determine error message
      let message = "Failed to reset password. Please try again.";
      
      if (err.response) {
        if (err.response.status === 404) {
          message = "Email not found. Please check your email or register for a new account.";
        } else if (err.response.status === 422) {
          const errors = err.response.data?.errors;
          if (errors) {
            if (errors.email) {
              message = errors.email[0];
            } else if (errors.password) {
              message = errors.password[0];
            } else {
              message = Object.values(errors).flat()[0];
            }
          } else if (err.response.data?.message) {
            message = err.response.data.message;
          }
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
          margin: "0 0 10px 0",
          color: "#333",
          textAlign: "center",
          fontSize: "28px"
        }}>
          Reset Password
        </h2>
        
        <p style={{
          textAlign: "center",
          color: "#666",
          fontSize: "14px",
          marginBottom: "30px"
        }}>
          Enter your email and new password
        </p>

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

        <form onSubmit={handleSubmit}>
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
                setErrorMessage("");
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

          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
              color: "#333",
              fontSize: "14px"
            }}>
              New Password
            </label>
            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMessage("");
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
            <small style={{ color: "#666", fontSize: "12px" }}>
              At least 6 characters
            </small>
          </div>

          <div style={{ marginBottom: "25px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
              color: "#333",
              fontSize: "14px"
            }}>
              Confirm New Password
            </label>
            <input
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrorMessage(""); 
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
            {isSubmitting ? "Resetting Password..." : "Reset Password"}
          </button>

          <div style={{
            textAlign: "center",
            fontSize: "14px",
            color: "#666"
          }}>
            Remembered your password?{" "}
            <Link 
              to="/login"
              style={{
                color: "#2196F3",
                fontWeight: "bold",
                textDecoration: "none"
              }}
            >
              Login here
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
            <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>Password Reset Successful!</h3>
            <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
              Redirecting to login...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}