import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

function AdminAddEvent() {
  const { user } = useAuth();
  const [eventData, setEventData] = useState({
    price: "",
    title: "",
    description: "",
    location: "",
    maxPeople: "",
    totalPeople: "",
    date: "",
  });
  const [accountsData, setAccountsData] = useState("");
  const [eventsData, setEventsData] = useState("");

  const fetchAccounts = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:8081/admin/accounts", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch accounts");
      const data = await response.json();
      setAccountsData(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Error fetching accounts:", error);
      setAccountsData("Error fetching accounts");
    }
  }, [user.token]);

  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:8081/view/events", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();
      setEventsData(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Error fetching events:", error);
      setEventsData("Error fetching events");
    }
  }, [user.token]);

  useEffect(() => {
    fetchAccounts();
    fetchEvents();
  }, [fetchAccounts, fetchEvents]);

  const handleChange = (e) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8081/admin/add/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error("Failed to add event");
      }

      const result = await response.json();
      console.log("Event added successfully:", result);
      alert("Event added successfully!");
      fetchEvents(); // Refresh events after adding a new one
    } catch (error) {
      console.error("Error adding event:", error);
      alert("Failed to add event. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Admin Add Event
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Accounts Section */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2 text-gray-700">
              Accounts
            </h2>
            <textarea
              readOnly
              value={accountsData}
              className="w-full h-64 lg:h-96 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-200 resize-none"
            ></textarea>
          </div>

          {/* Form Section */}
          <div className="bg-white p-4 rounded-lg shadow">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={eventData.title}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={eventData.description}
                  onChange={handleChange}
                  rows="3"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  required
                ></textarea>
              </div>
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700"
                >
                  Price
                </label>
                <input
                  type="text"
                  id="price"
                  name="price"
                  value={eventData.price}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700"
                >
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={eventData.location}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="maxPeople"
                  className="block text-sm font-medium text-gray-700"
                >
                  Max People
                </label>
                <input
                  type="number"
                  id="maxPeople"
                  name="maxPeople"
                  value={eventData.maxPeople}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="totalPeople"
                  className="block text-sm font-medium text-gray-700"
                >
                  Total People
                </label>
                <input
                  type="number"
                  id="totalPeople"
                  name="totalPeople"
                  value={eventData.totalPeople}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700"
                >
                  Date
                </label>
                <input
                  type="datetime-local"
                  id="date"
                  name="date"
                  value={eventData.date}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  required
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Event
                </button>
              </div>
            </form>
          </div>

          {/* Events Section */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2 text-gray-700">Events</h2>
            <textarea
              readOnly
              value={eventsData}
              className="w-full h-64 lg:h-96 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-200 resize-none"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  );
}
export default AdminAddEvent;
