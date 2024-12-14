import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function ChangePassword() {
  // State for form fields
  const [formData, setFormData] = useState({
    id: "",
    email: "",
    password: "",
    code: "",
  });

  // State for error handling
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  // Generic input handler
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  // Handle password change submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    // Destructure form data
    const { id, email, password, code } = formData;

    // Basic validation
    if (!id || !email || !password || !code) {
      setError("All fields are required.");
      return;
    }

    try {
      // Send password change request
      const response = await fetch("http://localhost:8081/edit/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, email, password, code }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update password.");
      }

      // Success handling
      alert("Password updated successfully.");
      setSuccess(true);

      // Redirect to login page
      navigate("/login");
    } catch (error) {
      setError(error.message || "An error occurred while updating the password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-800">
      <div className="w-full max-w-md bg-gray-900 text-white rounded-lg shadow-lg p-6">
        <h1 className="text-xl font-bold mb-6 text-center text-green-500">
          Change Your Password
        </h1>

        {/* Error message */}
        {error && (
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        {/* Password Reset Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="id" className="block mb-2 text-sm font-medium text-gray-300">
              Account ID
            </label>
            <input
              type="text"
              id="id"
              value={formData.id}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white"
              placeholder="Enter your account ID"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-300">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-300">
              New Password
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white"
              placeholder="Enter new password"
              required
            />
          </div>

          <div>
            <label htmlFor="code" className="block mb-2 text-sm font-medium text-gray-300">
              Verification Code
            </label>
            <input
              type="text"
              id="code"
              value={formData.code}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white"
              placeholder="Enter verification code"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-500 transition duration-300 ease-in-out"
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;
