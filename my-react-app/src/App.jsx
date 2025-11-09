import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import TopNavbar from "./components/TopNavbar.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Skills from "./pages/Skills.jsx";
import Jobs from "./pages/Jobs.jsx";
import Learning from "./pages/Learning.jsx";
import Interview from "./pages/Interview.jsx";
import Profile from "./pages/Profile.jsx";

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

        {/* Dashboard Pages with Top Navigation */}
        <Route
          path="/dashboard"
          element={
            <>
              <TopNavbar />
              <Dashboard />
            </>
          }
        />
        <Route
          path="/skills"
          element={
            <>
              <TopNavbar />
              <Skills />
            </>
          }
        />
        <Route
          path="/jobs"
          element={
            <>
              <TopNavbar />
              <Jobs />
            </>
          }
        />
        <Route
          path="/learning"
          element={
            <>
              <TopNavbar />
              <Learning />
            </>
          }
        />
        <Route
          path="/interview"
          element={
            <>
              <TopNavbar />
              <Interview />
            </>
          }
        />
        <Route
          path="/profile"
          element={
            <>
              <TopNavbar />
              <Profile />
            </>
          }
        />
      </Routes>
    </Router>
  );
}
