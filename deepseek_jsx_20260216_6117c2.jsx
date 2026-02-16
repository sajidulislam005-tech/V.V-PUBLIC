import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  FaVideo, 
  FaSun, 
  FaMoon, 
  FaUser, 
  FaSignOutAlt,
  FaUpload,
  FaHeart,
  FaDownload
} from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <FaVideo className="text-3xl text-primary-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              StockVideo
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="nav-link">
              Home
            </Link>
            <Link to="/trending" className="nav-link">
              Trending
            </Link>
            
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {darkMode ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-gray-600" />}
            </button>

            {isAuthenticated ? (
              <>
                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <img
                      src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}`}
                      alt={user?.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-gray-700 dark:text-gray-300">{user?.name}</span>
                  </button>

                  {isOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2">
                      <Link
                        to="/profile"
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsOpen(false)}
                      >
                        <FaUser />
                        <span>Profile</span>
                      </Link>
                      <Link
                        to="/wishlist"
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsOpen(false)}
                      >
                        <FaHeart />
                        <span>Wishlist</span>
                      </Link>
                      <Link
                        to="/downloads"
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsOpen(false)}
                      >
                        <FaDownload />
                        <span>Downloads</span>
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setIsOpen(false)}
                        >
                          <MdDashboard />
                          <span>Dashboard</span>
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                      >
                        <FaSignOutAlt />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>

                {isAdmin && (
                  <Link
                    to="/admin/upload"
                    className="btn-primary flex items-center space-x-2"
                  >
                    <FaUpload />
                    <span>Upload</span>
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;