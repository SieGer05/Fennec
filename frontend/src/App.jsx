import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Agents from "./pages/Agents";
import Audit from "./pages/Audit";
import NotFound from "./components/NotFound";
import Guide from "./pages/Guide";

function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        <Route 
          path="/guide" 
          element={
            <ProtectedRoute>
              <Guide />
            </ProtectedRoute>
          } 
        />

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

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;