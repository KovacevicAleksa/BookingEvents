/* eslint-disable jsx-a11y/anchor-has-content */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  // State variable for storing email input value
  const [email, setEmail] = useState("");

  // Hook for navigation to different routes
  const navigate = useNavigate();

  // Function to handle form submission for forgot password
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission behavior

    try {
      // Make a GET request to the forgot-password endpoint with the email
      const response = await fetch(
        `http://localhost:8081/edit/password/${email}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Parse the response JSON
      const result = await response.json();

      // Check if the response was successful
      if (!response.ok) {
        throw new Error(
          result.message || "An error occurred while processing your request"
        );
      }

      // If the forgot-password process was successful
      if (result.message === "Password reset link sent") {
        alert("A password reset link has been sent to your email.");
        navigate("/login"); // Navigate to the login page
      } else {
        alert(result.message || "An unexpected error occurred"); // Show an error message if the process fails
      }
    } catch (error) {
      console.error("Forgot password error:", error); // Log the error to the console
      alert(error.message || "An error occurred while processing your request"); // Display the error to the user
    }
  };

  return (
    <div>
      <section className="bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                Reset Your Password
              </h1>
              <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="name@company.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} // Update email state on change
                  />
                </div>
                <button
                  type="submit"
                  className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                >
                  Send Reset Link
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ForgotPassword;
