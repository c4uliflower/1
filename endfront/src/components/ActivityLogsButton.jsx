import { Link } from "react-router-dom";

export default function ActivityLogsButton() {
  return (
    <Link 
        to="/activity-logs"
        style={{
        padding: "10px 20px",
        backgroundColor: "#9C27B0",
        color: "white",
        textDecoration: "none",
        borderRadius: "5px",
        fontWeight: "bold"
        }}
    >
      📊 Activity Logs
    </Link>
  );
}