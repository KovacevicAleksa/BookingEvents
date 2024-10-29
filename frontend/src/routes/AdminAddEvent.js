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

  const [deleteAccountId, setDeleteAccountId] = useState("");
  const [deleteEventId, setDeleteEventId] = useState("");

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

  const handleDeleteEvent = async () => {
    if (!deleteEventId.trim()) {
      alert("Please enter a valid event ID");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8081/delete/events/${deleteEventId.trim()}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }

      const data = await response.json();
      console.log(data.message);
      alert("Event deleted successfully");

      setDeleteEventId(""); // Clear the input after successful deletion
      fetchEvents(); // Refresh the events list
      fetchAccounts(); // Refresh the accounts list
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Error deleting event. Please try again.");
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteAccountId.trim()) {
      alert("Please enter a valid user account ID");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8081/delete/users/${deleteAccountId.trim()}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete user account");
      }

      const data = await response.json();
      console.log(data.message);
      alert("User account successfully deleted");

      setDeleteAccountId(""); // Clear input after successful deletion
      fetchAccounts(); // Refresh the accounts list
    } catch (error) {
      console.error("Error deleting user account:", error);
      alert(`Error deleting user account: ${error.message}`);
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
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Accounts
            </h2>

            <textarea
              readOnly
              value={accountsData}
              className="w-full h-80 lg:h-96 p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-300 resize-none mb-4"
            ></textarea>

            <input
              type="text"
              value={deleteAccountId}
              onChange={(e) => setDeleteAccountId(e.target.value)}
              placeholder="Enter Account ID to delete"
              className="w-full p-2 mb-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-300"
            />

            <button
              onClick={handleDeleteUser}
              className="w-full text-white bg-red-600 hover:bg-red-700 font-medium py-2 rounded-md shadow-md transition duration-300"
            >
              Delete User Account
            </button>
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
                  rows="4"
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
              <div className="m-2 mt-5 mb-5">
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
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Events
            </h2>

            <textarea
              readOnly
              value={eventsData}
              className="w-full h-80 lg:h-96 p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-300 resize-none mb-4"
            ></textarea>

            <input
              type="text"
              value={deleteEventId}
              onChange={(e) => setDeleteEventId(e.target.value)}
              placeholder="Enter event ID to delete"
              className="w-full p-2 mb-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-300"
            />

            <button
              onClick={handleDeleteEvent}
              className="w-full text-white bg-red-600 hover:bg-red-700 font-medium py-2 rounded-md shadow-md transition duration-300"
            >
              Delete Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default AdminAddEvent;
