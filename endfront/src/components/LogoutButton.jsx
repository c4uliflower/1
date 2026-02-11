import { useState } from "react";
import api from "../api/api";

export default function LogoutButton() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const logout = async () => {
    try {
      await api.post("/logout");
    } catch (e) {
      // Even if API fails, still logout locally
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <>
      <button 
        onClick={() => setShowLogoutModal(true)}
        style={{
          padding: "10px 20px",
          backgroundColor: "#f44336",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        Logout
      </button>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
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
            <h3 style={{ marginTop: 0, color: "#333" }}>Confirm Logout</h3>
            <p style={{ color: "#666", lineHeight: "1.6" }}>
              Are you sure you want to logout? You'll need to login again to access your account.
            </p>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button
                onClick={() => setShowLogoutModal(false)}
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
                onClick={logout}
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
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}