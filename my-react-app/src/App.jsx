import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import TopNavbar from "./components/TopNavbar.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import HRDashboard from "./pages/HRDashboard.jsx";
import MatchedCandidates from "./pages/MatchedCandidates.jsx";
// Skills page removed
import Jobs from "./pages/Jobs.jsx";
import JobDetails from "./pages/JobDetails.jsx";
import Interview from "./pages/Interview.jsx";
import Profile from "./pages/Profile.jsx";
import HRProfile from "./pages/HRProfile.jsx";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const redirectPath =
      user.role === "hr" ? "/hr/dashboard" : "/employee/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Landing Page */}
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Home />
            </>
          }
        />

        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ========== EMPLOYEE ROUTES ========== */}
        <Route
          path="/employee/dashboard"
          element={
            <ProtectedRoute allowedRoles={["employee", "user"]}>
              <TopNavbar />
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/profile"
          element={
            <ProtectedRoute allowedRoles={["employee", "user"]}>
              <TopNavbar />
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/jobs"
          element={
            <ProtectedRoute allowedRoles={["employee", "user"]}>
              <TopNavbar />
              <Jobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/jobs/:jobId"
          element={
            <ProtectedRoute allowedRoles={["employee", "user"]}>
              <TopNavbar />
              <JobDetails />
            </ProtectedRoute>
          }
        />
        {/* /employee/skills removed */}
        {/* /employee/learning removed */}
        <Route
          path="/employee/interview"
          element={
            <ProtectedRoute allowedRoles={["employee", "user"]}>
              <TopNavbar />
              <Interview />
            </ProtectedRoute>
          }
        />

        {/* ========== HR ROUTES ========== */}
        <Route
          path="/hr/dashboard"
          element={
            <ProtectedRoute allowedRoles={["hr"]}>
              <TopNavbar />
              <HRDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/matched-candidates"
          element={
            <ProtectedRoute allowedRoles={["hr"]}>
              <TopNavbar />
              <MatchedCandidates />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/profile"
          element={
            <ProtectedRoute allowedRoles={["hr"]}>
              <TopNavbar />
              <HRProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/jobs"
          element={
            <ProtectedRoute allowedRoles={["hr"]}>
              <TopNavbar />
              <Jobs />
            </ProtectedRoute>
          }
        />

        {/* Redirect old routes to new structure */}
        <Route
          path="/dashboard"
          element={<Navigate to="/employee/dashboard" replace />}
        />
        <Route
          path="/hr-dashboard"
          element={<Navigate to="/hr/dashboard" replace />}
        />
        <Route
          path="/profile"
          element={<Navigate to="/employee/profile" replace />}
        />
        <Route
          path="/jobs"
          element={<Navigate to="/employee/jobs" replace />}
        />
        {/* /skills redirect removed */}
        {/* /learning redirect removed */}
        <Route
          path="/interview"
          element={<Navigate to="/employee/interview" replace />}
        />
      </Routes>
    </Router>
  );
}
