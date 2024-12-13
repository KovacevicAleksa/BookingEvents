/* eslint-disable jsx-a11y/anchor-has-content */
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import config from "../config/config";

function ChangePassword() {
  const { id: urlId } = useParams(); // Get ID from URL params
  const [email, setEmail] = useState(""); // State for user email
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState(""); // Verification code
  const [error, setError] = useState(""); // Error message state
  const [success, setSuccess] = useState(false); // Success state

  const navigate = useNavigate();

  useEffect(() => {
    if (urlId) {
      setId(urlId);
    }
  }, [urlId]);

  // Function to handle password reset request
  const handleRequestReset = async () => {
    setError("");
    if (!email) {
      setError("Please provide an email address.");
      return;
    }

    try {
      const response = await fetch(
        `${config.api.baseURL}${config.api.endpoints.getAccountId}${email}`
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to request password reset");
      }

      alert("Verification code sent to your email.");
    } catch (error) {
      setError(error.message || "An error occurred during the request.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
  
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
  
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
  
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
      );
      return;
    }
  
    try {
      const response = await fetch(
        `${config.api.baseURL}${config.api.endpoints.editpassword}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id, email, password, code }),
        }
      );
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.message || "Failed to update password.");
      }
  
      alert("Password updated successfully.");
      setSuccess(true);
      navigate("/login");
    } catch (error) {
      setError(error.message || "An error occurred while updating the password.");
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
              {error && (
                <div
                  className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800"
                  role="alert"
                >
                  {error}
                </div>
              )}
              {!success ? (
                <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                  {!id && (
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
                        placeholder="Enter your email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <button
                        type="button"
                        className="mt-2 w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                        onClick={handleRequestReset}
                      >
                        Request Reset Code
                      </button>
                    </div>
                  )}
                  {id && (
                    <>
                      <div>
                        <label
                          htmlFor="code"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Verification Code
                        </label>
                        <input
                          type="text"
                          name="code"
                          id="code"
                          className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          placeholder="Enter verification code"
                          required
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
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
                          onChange={(e) => setPassword(e.target.value)}
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
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                      >
                        Change Password
                      </button>
                    </>
                  )}
                </form>
              ) : (
                <p className="text-center text-green-600">Password successfully updated.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ChangePassword;
