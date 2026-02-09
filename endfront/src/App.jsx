import { Route, Routes } from "react-router-dom"
import Home from "./pages/Home.jsx"
import Create from "./pages/Create.jsx"
import Edit from "./pages/Edit.jsx"

// Main App component that defines the routes for the application
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-new" element={<Create />} /> 
        <Route path="/edit/:id" element={<Edit />} />
      </Routes>
    </>
  )
}

export default App
