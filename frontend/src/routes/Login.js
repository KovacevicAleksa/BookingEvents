/* eslint-disable jsx-a11y/anchor-has-content */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import config from "../config/config";

function Login() {
  // State variables for storing email and password input values
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Hook for navigation to different routes
  const navigate = useNavigate();

  // Access the login function from the AuthContext
  const { login } = useAuth();

  // Handle form submission for login
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission behavior

    try {
      // Make a POST request to the login endpoint with email and password
      const response = await fetch(`${config.api.baseURL}${config.api.endpoints.login}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      // Parse the response JSON
      const result = await response.json();

      // Check if the response was successful
      if (!response.ok) {
        throw new Error(result.message || "An error occurred during login");
      }

      // If login was successful, store the token and navigate to the events page
      if (result.message === "Login successful") {
        const token = result.token;
        localStorage.setItem("accountid", result.account.id);
        localStorage.setItem("userEmail", email); // Store email for chat
        login(token, result.account.isAdmin); // Call the login function from AuthContext
        navigate("/events"); // Navigate to the events page
      } else {
        alert(result.message || "An unexpected error occurred"); // Show an error message if login fails
      }
    } catch (error) {
      console.error("Login error:", error); // Log the error to the console
      alert(error.message || "An error occurred during login"); // Display the error to the user
    }
  };

  return (
    <div>
      <section className="bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white text-center">
                Login
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
                <div>
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="••••••••"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} // Update password state on change
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-start">
                    <div className=" text-sm">
                      <a
                        href="/registration"
                        className="text-sm font-medium hover:underline text-gray-500 dark:text-gray-300"
                      >
                        Registration
                      </a>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <a
                      href="/forgot-password"
                      className="text-sm font-medium hover:underline text-gray-500 dark:text-gray-300"
                    >
                      Forgot Password?
                    </a>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full text-white bg-primary-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-md px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  Login
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Login;
