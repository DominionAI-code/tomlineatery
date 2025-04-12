import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes, FaUserCircle, FaGlobe } from "react-icons/fa";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState("en");

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleLanguage = () => setLanguage(language === "en" ? "es" : "en");

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Section 1: Logo */}
        <div className="flex items-center space-x-2">
          <Link to="/" className="text-xl font-extrabold tracking-wide">
            <img src="src/assets/tomlin-logo.png" alt="Logo" className="h-15 w-20 rounded-b-full" />
          </Link>
        </div>

        {/* Section 2: App Name */}
        <div className="hidden md:block text-2xl font-bold tracking-wider text-white text-center">
          <h1>TomlinEatery</h1>
        </div>

        {/* Section 3: User + Language + Toggle */}
        <div className="flex items-center space-x-4">
          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="hover:text-gray-300 flex items-center"
          >
            <FaGlobe className="mr-1" />
            {language === "en" ? "ES" : "EN"}
          </button>

          {/* User Profile Dropdown */}
          <div className="relative group">
            <FaUserCircle className="text-2xl cursor-pointer" />
            <div className="absolute right-0 mt-2 w-40 bg-white text-gray-800 shadow-lg rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
              <ul className="py-2">
                <li>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Settings
                  </Link>
                </li>
                <li>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100">
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden" onClick={toggleMenu}>
            {isOpen ? (
              <FaTimes className="text-2xl" />
            ) : (
              <FaBars className="text-2xl" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <ul className="md:hidden bg-blue-700 text-white text-center py-4 space-y-4">
          <li>
            <Link to="/dashboard" onClick={toggleMenu}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/menu" onClick={toggleMenu}>
              Menu
            </Link>
          </li>
          <li>
            <Link to="/inventory" onClick={toggleMenu}>
              Inventory
            </Link>
          </li>
          <li>
            <Link to="/employees" onClick={toggleMenu}>
              Employees
            </Link>
          </li>
          <li>
            <Link to="/reports" onClick={toggleMenu}>
              Reports
            </Link>
          </li>
          <li>
            <Link to="/leases" onClick={toggleMenu}>
              Leases
            </Link>
          </li>
        </ul>
      )}
    </nav>
  );
};

export default Navbar;
