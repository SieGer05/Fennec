import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Agents from "./pages/Agents";
import Audit from "./pages/Audit";

function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/agents" 
          element={
            <ProtectedRoute>
              <Agents />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/audit/:agentId" 
          element={
            <ProtectedRoute>
              <Audit />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;