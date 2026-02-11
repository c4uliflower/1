import { Link } from "react-router-dom";

export default function ManageUsersButton() {
  return (
    <Link
      to="/manage-users"
      style={{
        padding: "10px 20px",
        backgroundColor: "#2196F3",
        color: "white",
        textDecoration: "none",
        borderRadius: "5px",
        fontWeight: "bold",
      }}
    >
      👤 Manage Users
    </Link>
  );
}