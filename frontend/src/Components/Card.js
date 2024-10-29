import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Card(props) {
  // State to track the total number of people registered for the event
  const [totalPeople, setTotalPeople] = useState(props.totalPeople);

  const [isHovered, setIsHovered] = useState(false);

  // Get the current logged-in user from the authentication context
  const { user } = useAuth();

  // Parse the event date from the props
  const eventDate = new Date(props.date);
  const today = new Date();
  // Check if the event has already expired
  const isExpired = eventDate < today;

  // Format the date to display either "Isteklo" if expired or the event date
  const formattedDate = isExpired
    ? "Isteklo"
    : eventDate.toLocaleDateString("sr-Latn-RS", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  // Function to update the event in the user's account
  async function updateAccountEvent(id, eventId) {
    try {
      const response = await fetch(`http://localhost:8081/edit/account/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          events: eventId,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Response:", data);
    } catch (error) {
      console.error("Error:", error);
      throw error; // Re-throw the error so it can be caught by the caller
    }
  }

  // Function to fetch user account data
  async function fetchAccountData(accountId) {
    try {
      const response = await fetch(
        `http://localhost:8081/accounts/${accountId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Network response was not ok: ${
            errorData.message || response.statusText
          }`
        );
      }

      return response.json();
    } catch (error) {
      console.error("Error fetching account data:", error);
      throw error;
    }
  }

  // Function to update the total number of people for the event
  const updateTotalPeople = async (
    eventId,
    newTotalPeople,
    onlyUpdateTotalPeople
  ) => {
    try {
      const accountId = localStorage.getItem("accountid");
      console.log(localStorage.getItem("accountid"));
      console.log(accountId);

      // Fetch the current user's events to check if they are already registered
      const data = await fetchAccountData(accountId);
      console.log("Sadrzaj korisnikovih eventa:", data.events);

      // If the user is not already registered for the event
      console.log(data.events.includes(eventId));
      if (!data.events.includes(eventId)) {
        // Update the total number of people registered for the event
        const eventUpdateTotalPeople = await fetch(
          `http://localhost:8081/edit/events/${eventId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({ totalPeople: newTotalPeople }),
          }
        );

        if (!eventUpdateTotalPeople.ok) {
          throw new Error("Network response was not ok");
        }

        // If we also want to update the user's account with this event
        if (!onlyUpdateTotalPeople) {
          await updateAccountEvent(accountId, eventId);
          alert("Uspesna prijava");
        }
        setTotalPeople(newTotalPeople);
      } else {
        alert("Vec ste se prijavili na event");
      }
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  // Function to fetch the events of a specific user account
  async function fetchAccountEvents(accountId, eventId) {
    try {
      const data = await fetchAccountData(accountId);
      console.log("Sadrzaj korisnikovih eventa:", data.events);
      return data.events.includes(eventId);
    } catch (error) {
      console.error("Failed to fetch account events:", error);
      throw error;
    }
  }

  // Function to delete an event from a user's account
  async function deleteEvent(UserId, eventId) {
    const url = `http://localhost:8081/remove/account/event/${UserId}`;
    const data = {
      EventId: eventId,
    };
    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Success:", result);
      alert("Uspesna odjava");
    } catch (error) {
      console.error("Error:", error);
    }
  }

  // Handle the click event for the "PRIJAVI SE" button
  const handleClick = () => {
    isExpired || updateTotalPeople(props.eventId, totalPeople + 1, false);
    isExpired && alert("Event je istekao");
  };

  // Handle the click event for the "ODJAVI SE" button
  const handleDeleteEvent = async () => {
    try {
      const accountId = localStorage.getItem("accountid");
      const eventId = props.eventId;

      // Check if the user is registered for the event
      const eventExists = await fetchAccountEvents(accountId, eventId);

      if (eventExists) {
        console.log(eventId);
        // Delete the event from the user's account and update the total number of people
        await deleteEvent(accountId, eventId);
        await updateTotalPeople(eventId, totalPeople - 1, true);
      } else if (!isExpired) {
        alert("Niste prijavljeni na event");
        console.log("Event ID not found in user's events.");
      } else if (isExpired) {
        alert("Event je istekao");
      } else if (totalPeople >= props.maxPeople) {
        alert("Event is fully booked");
      }
    } catch (error) {
      console.error("Error handling delete event:", error);
    }
  };

  return (
    <div className="rounded overflow-hidden shadow-lg flex flex-col">
      <div className="relative">
        <a
          href={`http://localhost:3000/chat/${props.title}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <img
            className="w-full"
            src={isHovered ? props.hoverPhoto : props.photo}
            alt="Conference"
          />
          <div className="hover:bg-transparent transition duration-300 absolute bottom-0 top-0 right-0 left-0 bg-gray-900 opacity-25"></div>
        </a>
        <a href="#!">
          <div className="text-l absolute top-0 right-0 bg-indigo-600 px-4 py-2 text-white mt-3 mr-3 hover:bg-white hover:text-indigo-600 transition duration-500 ease-in-out">
            {props.price}
          </div>
          <div className="text-l absolute top-0 left-0 bg-indigo-600 px-4 py-2 text-white mt-3 hover:bg-white hover:text-indigo-600 transition duration-500 ease-in-out">
            {totalPeople}
            {props.attendees}
          </div>
        </a>
      </div>
      <div className="px-6 py-4 mb-auto">
        <a
          href="/events"
          className="font-medium text-lg inline-block hover:text-indigo-600 transition duration-500 ease-in-out mb-2"
        >
          {props.title}
        </a>
        <br></br>
        <span>
          {props.description}{" "}
          <div className="flex justify-between items-center">
            <p
              onClick={handleDeleteEvent}
              className="font-ms text-lg text-left text-red-600 transition duration-500 ease-in-out mb-2 cursor-pointer"
            >
              ODJAVI SE
            </p>
            <p
              onClick={handleClick}
              className="font-ms text-lg text-right text-indigo-600 transition duration-500 ease-in-out mb-2 cursor-pointer"
            >
              PRIJAVI SE
            </p>
          </div>
        </span>
      </div>
      <div className="px-6 py-3 flex flex-row items-center justify-between bg-gray-100">
        <span
          href="#"
          className="py-1 text-xs font-regular text-gray-900 mr-1 flex flex-row items-center"
        >
          <span className="ml-1">{props.location}</span>
        </span>
        <span className="mr-1">{formattedDate}</span>
      </div>
    </div>
  );
}

export default Card;
