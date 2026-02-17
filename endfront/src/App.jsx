import { Route, Routes } from "react-router-dom"
import Home from "./pages/Home.jsx"
import Create from "./pages/Create.jsx"
import Edit from "./pages/Edit.jsx"
import Login from "./pages/Login.jsx"
import Register from "./pages/Register.jsx";  
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ManageUsers from "./pages/ManageUsers.jsx";
import ActivityLogs from "./pages/ActivityLogs.jsx";

// Main App component that defines the routes for the application
function App() {
  return (
    <>
      <Routes>
        <Route path="/activity-logs" element={<ActivityLogs />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-new"
          element={
            <ProtectedRoute>
              <Create />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit/:id"
          element={
            <ProtectedRoute>
              <Edit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-users"
          element={
            <ProtectedRoute>
              <ManageUsers />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </>
  )
}

export default App
