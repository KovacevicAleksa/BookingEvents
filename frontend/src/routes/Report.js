import React, { useState } from "react";
import config from "../config/config";

function Report() {
  const [formData, setFormData] = useState({
    email: localStorage.getItem("userEmail") || "",
    reportText: "",
    category: "Other"
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const categories = [
    "Sexual Harassment",
    "False Information",
    "Spam",
    "Hate Speech",
    "Other"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${config.api.baseURL}/reports`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit report");
      }

      setSuccess("Report submitted successfully");
      setFormData(prev => ({ ...prev, reportText: "", category: "Other" }));
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div
      style={{
        backgroundColor: "#121212",
        color: "#fff",
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          backgroundColor: "#1f1f1f",
          padding: "30px",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "600px",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "30px" }}>Submit a Report</h2>
        
        {error && (
          <div style={{ 
            color: "#ff4444", 
            backgroundColor: "rgba(255,68,68,0.1)", 
            padding: "10px", 
            borderRadius: "5px", 
            marginBottom: "20px" 
          }}>
            {error}
          </div>
        )}
        
        {success && (
          <div style={{ 
            color: "#00C851", 
            backgroundColor: "rgba(0,200,81,0.1)", 
            padding: "10px", 
            borderRadius: "5px", 
            marginBottom: "20px" 
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label 
              htmlFor="email" 
              style={{ 
                display: "block", 
                marginBottom: "8px",
                color: "#ccc" 
              }}
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#2d2d2d",
                border: "1px solid #3d3d3d",
                borderRadius: "5px",
                color: "#fff",
                fontSize: "16px"
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label 
              htmlFor="category" 
              style={{ 
                display: "block", 
                marginBottom: "8px",
                color: "#ccc" 
              }}
            >
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#2d2d2d",
                border: "1px solid #3d3d3d",
                borderRadius: "5px",
                color: "#fff",
                fontSize: "16px"
              }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label 
              htmlFor="reportText" 
              style={{ 
                display: "block", 
                marginBottom: "8px",
                color: "#ccc" 
              }}
            >
              Report Details
            </label>
            <textarea
              id="reportText"
              name="reportText"
              value={formData.reportText}
              onChange={handleChange}
              required
              minLength={10}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#2d2d2d",
                border: "1px solid #3d3d3d",
                borderRadius: "5px",
                color: "#fff",
                fontSize: "16px",
                minHeight: "150px",
                resize: "vertical"
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              backgroundColor: "#007BFF",
              color: "#fff",
              padding: "12px 20px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              width: "100%",
              fontSize: "16px",
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              transition: "background-color 0.3s",
            }}
          >
            Submit Report
          </button>
        </form>
      </div>
    </div>
  );
}

export default Report;