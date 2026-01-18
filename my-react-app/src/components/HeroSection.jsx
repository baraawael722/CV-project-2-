import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";

const HeroSection = () => {
  const { isDark } = useTheme();

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden transition-colors duration-300"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`absolute top-20 left-10 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl animate-float ${
            isDark ? "bg-blue-500 opacity-20" : "bg-blue-400 opacity-30"
          }`}
          style={{ animationDelay: "0s" }}
        ></div>
        <div
          className={`absolute top-40 right-10 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl animate-float ${
            isDark ? "bg-blue-600 opacity-20" : "bg-cyan-400 opacity-30"
          }`}
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className={`absolute -bottom-32 left-1/3 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl animate-float ${
            isDark ? "bg-cyan-500 opacity-20" : "bg-blue-300 opacity-30"
          }`}
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Side: Text Content */}
        <div className="reveal" data-delay="1">
          <h1
            className={`text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Find your job{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              better
            </span>
            <br />
            and{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              faster
            </span>
          </h1>

          <p
            className={`text-lg sm:text-xl mb-8 max-w-xl leading-relaxed ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}
          >
            Find your job that makes you grow both in skills and career and in
            life.
          </p>

          {/* Search Bar */}
          <div
            className={`flex items-center gap-3 rounded-full shadow-2xl p-2 mb-8 max-w-2xl ${
              isDark
                ? "bg-slate-800 border border-slate-700"
                : "bg-white border border-gray-200"
            }`}
          >
            <svg
              className={`w-6 h-6 ml-4 ${isDark ? "text-slate-400" : "text-gray-400"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by job title or keyword"
              className={`flex-1 px-4 py-3 focus:outline-none bg-transparent ${
                isDark
                  ? "text-white placeholder-slate-400"
                  : "text-slate-900 placeholder-gray-500"
              }`}
            />
            <button className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              Search
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8 flex-wrap">
            <div>
              <div
                className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
              >
                10,000+
              </div>
              <div
                className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}
              >
                Job Listings
              </div>
            </div>
            <div>
              <div
                className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
              >
                5,000+
              </div>
              <div
                className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}
              >
                Companies
              </div>
            </div>
            <div>
              <div
                className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
              >
                1M+
              </div>
              <div
                className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}
              >
                Success Stories
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Illustration with Floating Icons */}
        <div className="relative reveal" data-delay="2">
          <div className="relative w-full h-[600px] flex items-center justify-center">
            {/* Main AI Robot Illustration */}
            <div className="relative z-10 transform hover:scale-105 transition-transform duration-500">
              <img
                src="https://illustrations.popsy.co/amber/artificial-intelligence.svg"
                alt="AI Job Matching"
                className="w-full h-auto drop-shadow-2xl"
              />
            </div>

            {/* Floating Tech Icons - Orbiting Animation */}

            {/* Figma Icon */}
            <div
              className={`absolute top-16 right-20 w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center animate-bounce-slow ${
                isDark
                  ? "bg-slate-800 border border-slate-700"
                  : "bg-white border border-gray-200"
              }`}
              style={{ animationDelay: "0s" }}
            >
              <svg viewBox="0 0 38 57" className="w-8 h-8">
                <path
                  fill="#1abcfe"
                  d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z"
                />
                <path
                  fill="#0acf83"
                  d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z"
                />
                <path fill="#ff7262" d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" />
                <path
                  fill="#f24e1e"
                  d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z"
                />
                <path
                  fill="#a259ff"
                  d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z"
                />
              </svg>
            </div>

            {/* VS Code Icon */}
            <div
              className="absolute top-32 left-5 w-14 h-14 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl flex items-center justify-center animate-bounce-slow"
              style={{ animationDelay: "0.3s" }}
            >
              <svg viewBox="0 0 100 100" className="w-8 h-8">
                <path
                  fill="#007ACC"
                  d="M95 20.3v59.4L75.4 95 24.2 53.9l-19 14.7L0 66V34l5.2-2.6 19 14.7L75.4 5 95 20.3z"
                />
                <path fill="#1F9CF0" d="M75.4 95V5l19.6 15.3v59.4L75.4 95z" />
                <path fill="#fff" d="M24.2 53.9l-19 14.7V31.4l19 14.7v7.8z" />
              </svg>
            </div>

            {/* React Icon */}
            <div
              className="absolute bottom-32 right-10 w-16 h-16 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl flex items-center justify-center animate-bounce-slow"
              style={{ animationDelay: "0.6s" }}
            >
              <svg
                viewBox="0 0 100 100"
                className="w-10 h-10 animate-spin-slow"
              >
                <circle cx="50" cy="50" r="8" fill="#61DAFB" />
                <ellipse
                  cx="50"
                  cy="50"
                  rx="45"
                  ry="17"
                  fill="none"
                  stroke="#61DAFB"
                  strokeWidth="3"
                />
                <ellipse
                  cx="50"
                  cy="50"
                  rx="45"
                  ry="17"
                  fill="none"
                  stroke="#61DAFB"
                  strokeWidth="3"
                  transform="rotate(60 50 50)"
                />
                <ellipse
                  cx="50"
                  cy="50"
                  rx="45"
                  ry="17"
                  fill="none"
                  stroke="#61DAFB"
                  strokeWidth="3"
                  transform="rotate(120 50 50)"
                />
              </svg>
            </div>

            {/* Python Icon */}
            <div
              className="absolute top-10 left-1/3 w-12 h-12 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl flex items-center justify-center animate-bounce-slow"
              style={{ animationDelay: "0.9s" }}
            >
              <svg viewBox="0 0 128 128" className="w-7 h-7">
                <path fill="#FFD845" d="M49.3 62h29.4v4.5H49.3z" />
                <path
                  fill="#3776AB"
                  d="M63.4 0c-6.4 0-12 1-16.3 2.7-12.9 5-11.4 15.4-11.4 21.7V36h32.3v4.5H35.6c-9.4 0-17.6 5.6-20.2 16.4-3 12.4-3.1 20.1 0 33 2.3 9.6 7.8 16.4 17.2 16.4h11.1V92.4c0-10.7 9.2-20.1 20.2-20.1h32.2c9 0 16.2-7.4 16.2-16.4V24.4c0-8.7-7.4-15.2-16.2-17.1C91.1.8 85.2 0 78.6 0H63.4zm-17.4 13c3.3 0 6 2.7 6 6.1s-2.7 6.1-6 6.1-6-2.7-6-6.1 2.7-6.1 6-6.1z"
                />
                <path
                  fill="#FFD845"
                  d="M92.3 40.5v13.4c0 11.2-9.5 20.5-20.2 20.5H39.9c-8.8 0-16.2 7.6-16.2 16.4v30.8c0 8.7 7.6 13.9 16.2 16.4 10.3 3 20.2 3.5 32.2 0 8-2.3 16.2-7 16.2-16.4V110H56.1v-4.5h48.5c9.4 0 12.9-6.6 16.2-16.4 3.4-10.1 3.3-19.9 0-33-2.4-9.4-6.9-16.4-16.2-16.4H92.3zM81.5 115c3.3 0 6 2.7 6 6.1s-2.7 6.1-6 6.1-6-2.7-6-6.1 2.7-6.1 6-6.1z"
                />
              </svg>
            </div>

            {/* Node.js Icon */}
            <div
              className="absolute bottom-48 left-0 w-12 h-12 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl flex items-center justify-center animate-bounce-slow"
              style={{ animationDelay: "1.2s" }}
            >
              <svg viewBox="0 0 128 128" className="w-7 h-7">
                <path
                  fill="#83CD29"
                  d="M112.8 30.3L68.4 4.5c-2.7-1.6-6.1-1.6-8.8 0L15.2 30.3C12.5 31.9 11 34.8 11 37.9v51.6c0 3.1 1.5 6 4.2 7.6l44.4 25.8c2.7 1.6 6.1 1.6 8.8 0l44.4-25.8c2.7-1.6 4.2-4.5 4.2-7.6V37.9c0-3.1-1.5-6-4.2-7.6z"
                />
                <path
                  fill="#fff"
                  d="M64 89.2L38.7 74.4V45l25.3 14.8v29.4zm3.6-33.5L42.3 40.9l25.3-14.8 25.3 14.8-25.3 14.8zm29 18.7L71.3 89.2V59.8l25.3-14.8v29.4z"
                />
              </svg>
            </div>

            {/* GitHub Icon */}
            <div
              className="absolute top-1/2 right-0 w-14 h-14 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl flex items-center justify-center animate-bounce-slow"
              style={{ animationDelay: "1.5s" }}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-8 h-8 text-white fill-current"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </div>

            {/* AWS Icon */}
            <div
              className="absolute bottom-16 right-1/3 w-14 h-14 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl flex items-center justify-center animate-bounce-slow"
              style={{ animationDelay: "1.8s" }}
            >
              <svg viewBox="0 0 128 128" className="w-8 h-8">
                <path
                  fill="#F7A80D"
                  d="M38.1 72.1c0 1.3.1 2.3.4 3.1.3.8.6 1.6 1.1 2.5.2.3.2.6.2.8 0 .3-.2.7-.6 1l-2.1 1.4c-.3.2-.6.3-.8.3-.3 0-.7-.2-1-.5-.5-.5-.9-1.1-1.2-1.7-.3-.6-.7-1.3-1.1-2.2-2.7 3.2-6.2 4.8-10.3 4.8-2.9 0-5.3-.8-7-2.5-1.7-1.7-2.6-3.9-2.6-6.7 0-3 1-5.4 3.1-7.2s4.9-2.7 8.4-2.7c1.2 0 2.4.1 3.6.3 1.3.2 2.6.5 4 .8v-2.5c0-2.6-.5-4.5-1.6-5.5-1.1-1.1-2.9-1.6-5.6-1.6-1.2 0-2.4.1-3.7.4s-2.5.7-3.7 1.1c-.6.2-1 .4-1.2.4-.3.1-.5.1-.6.1-.6 0-.8-.4-.8-1.3v-1.6c0-.7.1-1.2.3-1.4.2-.3.6-.5 1.1-.8 1.2-.6 2.6-1.1 4.3-1.5 1.7-.4 3.5-.7 5.4-.7 4.1 0 7.1 0.9 9 2.8 1.9 1.9 2.8 4.7 2.8 8.5v11.2zM25.5 76.4c1.1 0 2.3-.2 3.5-.6 1.2-.4 2.3-1.2 3.2-2.2.5-.6.9-1.4 1.1-2.2.2-.9.4-1.9.4-3.2v-1.5c-1-.3-2.1-.5-3.2-.6-1.1-.2-2.2-.2-3.2-.2-2.3 0-4 .4-5.1 1.4-1.1.9-1.7 2.2-1.7 4 0 1.6.4 2.9 1.3 3.7.9.9 2.1 1.4 3.7 1.4zm28.9 3.9c-.7 0-1.2-.1-1.5-.4-.3-.3-.5-.8-.8-1.6l-8.5-28c-.2-.8-.4-1.4-.4-1.6 0-.6.3-1 1-1h3.3c.8 0 1.3.1 1.6.4.3.3.5.8.7 1.6l6.1 24 5.7-24c.2-.8.4-1.3.7-1.6.3-.3.9-.4 1.6-.4h2.7c.8 0 1.3.1 1.6.4.3.3.5.8.7 1.6l5.7 24.3 6.3-24.3c.2-.8.5-1.3.7-1.6.3-.3.9-.4 1.6-.4h3.1c.6 0 1 .3 1 1 0 .2 0 .4-.1.6 0 .2-.1.5-.3 1l-8.7 28c-.2.8-.5 1.3-.8 1.6-.3.3-.8.4-1.5.4h-2.9c-.8 0-1.3-.1-1.6-.4-.3-.3-.5-.8-.7-1.6l-5.6-23.4-5.6 23.4c-.2.8-.4 1.3-.7 1.6-.3.3-.9.4-1.6.4h-2.9zm46.2 1c-1.8 0-3.7-.2-5.4-.6-1.8-.4-3.1-.9-4.1-1.4-.6-.3-1-.7-1.1-1-.1-.3-.2-.7-.2-1v-1.7c0-.9.3-1.3.9-1.3.2 0 .5 0 .7.1.2.1.6.2 1 .4 1.3.6 2.8 1.1 4.3 1.4 1.6.3 3.1.5 4.7.5 2.5 0 4.4-.4 5.7-1.3 1.3-.9 2-2.1 2-3.8 0-1.1-.4-2-1.1-2.8-.7-.8-2.1-1.4-4.1-2.1l-5.8-1.8c-3-0.9-5.2-2.3-6.5-4.1-1.3-1.8-2-3.8-2-6 0-1.7.4-3.3 1.1-4.6.7-1.4 1.7-2.5 2.9-3.5 1.2-1 2.7-1.7 4.3-2.2 1.7-.5 3.4-.7 5.3-.7.9 0 1.9.1 2.9.2 1 .1 1.9.3 2.8.5.9.2 1.7.5 2.5.8.8.3 1.4.6 1.8.9.5.3.8.6 1 .9.2.3.3.7.3 1.2v1.5c0 .9-.3 1.3-.9 1.3-.3 0-.8-.1-1.4-.4-2.1-1-4.5-1.5-7.1-1.5-2.3 0-4 .3-5.2 1.1-1.2.7-1.9 1.8-1.9 3.4 0 1.1.4 2.1 1.2 2.8.8.8 2.4 1.5 4.6 2.2l5.7 1.8c2.9.9 5 2.2 6.3 3.9 1.2 1.7 1.9 3.6 1.9 5.8 0 1.8-.4 3.4-1.1 4.8-.8 1.4-1.8 2.6-3.1 3.6-1.3 1-2.9 1.8-4.7 2.3-1.9.6-3.9.8-6.1.8z"
                />
                <path
                  fill="#F7A80D"
                  d="M118 92.6c-14.6 10.8-35.8 16.5-54 16.5-25.6 0-48.6-9.4-66-25.1-1.4-1.2-.1-2.9 1.5-1.9 18.8 10.9 42 17.5 66 17.5 16.2 0 34-3.4 50.4-10.3 2.5-1.1 4.6 1.6 2.1 3.3z"
                />
                <path
                  fill="#F7A80D"
                  d="M123.6 86.5c-1.9-2.4-12.3-1.1-17-0.6-1.4.2-1.6-1.1-.4-1.9 8.3-5.8 21.9-4.1 23.5-2.2 1.6 2-0.4 15.7-8.2 22.2-1.2 1-2.3.5-1.8-.8 1.7-4.4 5.8-14.2 3.9-16.7z"
                />
              </svg>
            </div>

            {/* Docker Icon */}
            <div
              className="absolute top-2/3 left-10 w-12 h-12 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl flex items-center justify-center animate-bounce-slow"
              style={{ animationDelay: "2.1s" }}
            >
              <svg viewBox="0 0 128 128" className="w-7 h-7">
                <path
                  fill="#019BC6"
                  d="M124.8 52.1c-4.3-2.5-10-2.8-14.8-1.4-.6-5.2-4-9.7-8-12.9l-1.6-1.3-1.4 1.6c-2.7 3.1-3.5 8.3-3.1 12.3.3 2.9 1.2 5.9 3 8.3-1.4.8-2.9 1.9-4.3 2.4-2.8 1-5.9 2-8.9 2H79V49H66V24H41v12H28v13H7.4l-.3 2.5c-.6 4.9-.3 10.2 1.2 15.2l.5 1.4.5 1.2c3.4 7.1 9.5 12.6 16.5 16 8 3.9 17.5 5.4 26.5 5.4 9.9 0 19.4-1.5 28.3-5.4 6.1-2.7 11.7-6.6 16.1-11.6 6.6-7.4 10.5-16.8 12.4-26.6h1.1c4.6 0 9.4-1.8 12.3-5.4l1-1.3-1.5-1.3zM28 39h10v10H28V39zm13.1 0H51v10h-9.9V39zm13 0h10v10h-10V39zm0-13h10v10h-10V26zm13 13h10v10h-10V39zM41.1 26H51v10h-9.9V26zM28 52h10v10H28V52zm13.1 0H51v10h-9.9V52zm13 0h10v10h-10V52zm13 0h10v10h-10V52z"
                />
              </svg>
            </div>

            {/* Application Accepted Card */}
            <div
              className="absolute top-8 right-5 bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl p-4 animate-float"
              style={{ animationDelay: "0.5s" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Application</div>
                  <div className="text-sm font-bold text-white">Accepted!</div>
                </div>
              </div>
            </div>

            {/* Interview Card */}
            <div
              className="absolute bottom-24 left-5 bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl p-4 animate-float"
              style={{ animationDelay: "1s" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Interview</div>
                  <div className="text-sm font-bold text-white">
                    Tomorrow 10AM
                  </div>
                </div>
              </div>
            </div>

            {/* New Jobs Counter */}
            <div
              className="absolute top-1/3 left-0 bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl p-3 animate-float"
              style={{ animationDelay: "1.5s" }}
            >
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-white">250+</div>
                <div className="text-xs text-slate-400">
                  New
                  <br />
                  Jobs
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
