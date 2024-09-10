import React from "react";

function Header({ userEmail, onLogout }) {
  return (
    <div>
      <nav className="font-sans flex items-center py-4 px-6 bg-white shadow w-full">
        <div className="flex-1 text-left">
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
        <div className="flex-1 text-center">
          <p className="text-2xl no-underline text-grey-darkest hover:text-blue-dark">
            Event Booking
          </p>
        </div>
        <div className="flex-1 text-right">
          <span className="text-lg text-gray-700">
            User: <span className="font-semibold">{userEmail}</span>
          </span>
        </div>
      </nav>
    </div>
  );
}

export default Header;
