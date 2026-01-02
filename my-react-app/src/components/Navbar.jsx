import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const handleNavClick = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      try {
        window.history.pushState(null, "", `#${id}`);
      } catch (err) {}
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? isDark
            ? "scrolled bg-slate-900/90 backdrop-blur-md shadow-lg border-b border-slate-700/50 py-4"
            : "scrolled bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200/50 py-4"
          : "bg-transparent py-6"
      }`}
      style={{ WebkitBackdropFilter: isScrolled ? "blur(8px)" : "none" }}
    >
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex items-center justify-between">
          {/* Logo - Left side */}
          <div className="flex items-center gap-3">
            {/* Compass SVG Logo - Light Blue */}
            <div
              className={`transition-all duration-300 ${
                isScrolled ? "w-10 h-10" : "w-12 h-12"
              }`}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Outer circle - Light Blue */}
                <circle cx="50" cy="50" r="45" fill="#60a5fa" opacity="0.9" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                />

                {/* Compass points */}
                <g stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  {/* North */}
                  <line x1="50" y1="15" x2="50" y2="30" />
                  <polygon points="50,10 45,20 50,18 55,20" fill="white" />

                  {/* South */}
                  <line x1="50" y1="70" x2="50" y2="85" />

                  {/* East */}
                  <line x1="70" y1="50" x2="85" y2="50" />

                  {/* West */}
                  <line x1="15" y1="50" x2="30" y2="50" />

                  {/* Diagonal lines */}
                  <line x1="68" y1="32" x2="78" y2="22" opacity="0.7" />
                  <line x1="68" y1="68" x2="78" y2="78" opacity="0.7" />
                  <line x1="32" y1="32" x2="22" y2="22" opacity="0.7" />
                  <line x1="32" y1="68" x2="22" y2="78" opacity="0.7" />
                </g>

                {/* Center dot */}
                <circle cx="50" cy="50" r="5" fill="white" />
              </svg>
            </div>

            {/* Brand Name */}
            <span
              className={`font-bold transition-all duration-300 ${
                isScrolled 
                  ? isDark ? "text-white text-xl" : "text-slate-900 text-xl"
                  : isDark ? "text-white text-2xl" : "text-slate-900 text-2xl"
              }`}
            >
              JobCompass
            </span>
          </div>

          {/* Navigation Links - Center */}
          <div className="hidden md:flex items-center gap-12">
            <a
              href="#home"
              className={`nav-link font-semibold transition-all duration-300 ${
                isDark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"
              } ${isScrolled ? "text-base" : "text-2xl"}`}
              onClick={(e) => handleNavClick(e, "home")}
            >
              Home
            </a>
            <a
              href="#about"
              className={`nav-link font-semibold transition-all duration-300 ${
                isDark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"
              } ${isScrolled ? "text-base" : "text-2xl"}`}
              onClick={(e) => handleNavClick(e, "about")}
            >
              About Us
            </a>
            <a
              href="#jobs"
              className={`nav-link font-semibold transition-all duration-300 ${
                isDark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"
              } ${isScrolled ? "text-base" : "text-2xl"}`}
              onClick={(e) => handleNavClick(e, "jobs")}
            >
              Jobs
            </a>
            <a
              href="#features"
              className={`nav-link font-semibold transition-all duration-300 ${
                isDark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"
              } ${isScrolled ? "text-base" : "text-2xl"}`}
              onClick={(e) => handleNavClick(e, "features")}
            >
              Features
            </a>
          </div>

          {/* Buttons - Right side */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-3 rounded-full transition-all duration-300 ${
                isDark
                  ? "bg-slate-700 hover:bg-slate-600 text-yellow-400"
                  : "bg-gray-200 hover:bg-gray-300 text-slate-700"
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {/* Login button - styled like Get Started with hover shadow */}
            <Link
              to="/login"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
