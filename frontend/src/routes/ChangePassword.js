/* eslint-disable jsx-a11y/anchor-has-content */
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function ChangePassword() {
  // State variables for storing ID and new password input values
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Hook for navigation to different routes
  const navigate = useNavigate();

  // Get the user ID from the URL params
  const { id: routeId } = useParams();

  // Function to handle form submission for password change
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission behavior

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      // Make a PATCH request to the change-password endpoint with the new password
      const response = await fetch(
        `http://localhost:8081/edit/password/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        }
      );

      // Parse the response JSON
      const result = await response.json();

      // Check if the response was successful
      if (!response.ok) {
        throw new Error(
          result.message || "An error occurred while updating your password"
        );
      }

      // If the password change was successful
      alert("Password updated successfully");
      navigate("/login"); // Navigate to the login page
    } catch (error) {
      console.error("Change password error:", error); // Log the error to the console
      alert(error.message || "An error occurred while updating your password"); // Display the error to the user
    }
  };

  return (
    <div>
      <section className="bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                Change Your Password
              </h1>
              <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="id"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    ID
                  </label>
                  <input
                    type="text"
                    name="id"
                    id="id"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Enter your ID"
                    required
                    value={routeId}
                    onChange={(e) => setId(e.target.value)} // Update ID state on change
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    New Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="********"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} // Update password state on change
                  />
                </div>
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="********"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)} // Update confirm password state on change
                  />
                </div>
                <button
                  type="submit"
                  className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                >
                  Change Password
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ChangePassword;
