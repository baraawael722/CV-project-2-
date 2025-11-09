import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function TopNavbar() {
  const location = useLocation()
  
  const navItems = [
    { name: 'Home', path: '/dashboard', icon: '🏠' },
    { name: 'Skills', path: '/skills', icon: '💡' },
    { name: 'Jobs', path: '/jobs', icon: '💼' },
    { name: 'Learning', path: '/learning', icon: '📚' },
    { name: 'Interview', path: '/interview', icon: '🎯' },
    { name: 'Profile', path: '/profile', icon: '👤' }
  ]

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              JobCompass
            </div>
          </Link>

          {/* Navigation Tabs - excluding Profile */}
          <nav className="hidden md:flex space-x-1">
            {navItems.slice(0, -1).map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg font-bold text-base transition-all duration-300 flex items-center gap-2 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-900 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Profile Button - Right Side */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/profile"
              className={`px-6 py-2 rounded-full font-bold text-base transition-all duration-300 flex items-center gap-2 ${
                location.pathname === '/profile'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
              }`}
            >
              <span>👤</span>
              Profile
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100">
            <svg className="w-6 h-6 text-gray-900 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
