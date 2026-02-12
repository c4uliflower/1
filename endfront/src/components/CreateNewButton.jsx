import { Link } from "react-router-dom";

export default function CreateNewButton() {
  return (
    <Link 
        to="/create-new" 
        style={{ 
        padding: "10px 20px", 
        backgroundColor: "#4CAF50", 
        color: "white", 
        textDecoration: "none", 
        borderRadius: "5px",
        fontWeight: "bold"
        }}
    >
        + Create New
    </Link>
  );
}