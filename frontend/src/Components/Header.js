import React from "react";

function Header({ userEmail, onLogout}) {
  return (
    <header className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 shadow-lg">
      <nav className="flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="bg-green-600 p-2 rounded-full shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-8 h-8 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.375 4.5l8.25 6.75-8.25 6.75V4.5zM14.625 4.5l8.25 6.75-8.25 6.75V4.5z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">Event Booking</h1>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex space-x-6 text-gray-300">
          <a
            href="/my-tickets"
            className="hover:text-white transition duration-300 text-lg"
          >
            My Tickets
          </a>
          <a
            href="/events"
            className="hover:text-white transition duration-300 text-lg"
          >
            Events
          </a>
          <a
            href="/about-us"
            className="hover:text-white transition duration-300 text-lg"
          >
            About Us
          </a>
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          <span className="hidden md:block text-lg text-gray-300">
            <span className="font-semibold">Welcome, </span>
            {userEmail}
          </span>
          <button
            onClick={() => { window.location.href = `/profile`; }}
            className="px-4 py-2 bg-green-600 text-white rounded-full shadow hover:bg-green-700 hover:shadow-lg transition duration-300"
          >
            Profile
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-full shadow hover:bg-red-700 hover:shadow-lg transition duration-300"
          >
            Logout
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Header;
