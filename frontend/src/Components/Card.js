import React, { useState } from "react";

function Card(props) {
  const [totalPeople, setTotalPeople] = useState(props.totalPeople);

  const eventDate = new Date(props.date);
  const today = new Date();
  const isExpired = eventDate < today;

  //Da li je isetkao event
  const formattedDate = isExpired
    ? "Isteklo"
    : eventDate.toLocaleDateString("sr-Latn-RS", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  //Dodavanje eventa u bazu podataka kada se korisnik prijavi
  async function updateAccountEvent(id, eventData) {
    console.log(eventData);
    console.log(id);

    try {
      const response = await fetch(`http://localhost:8080/edit/account/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          events: eventData,
        }),
      });

      const data = await response.json();
      console.log("Response:", data);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  //update broja ljudi u bazi podataka
  const updateTotalPeople = async (
    eventId,
    newTotalPeople,
    onlyUpdateTotalPeople
  ) => {
    const accountId = localStorage.getItem("accountid");
    // accountFetchEvent za dohvaćanje eventa
    const accountFetchEvent = await fetch(
      `http://localhost:8080/accounts/${accountId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!accountFetchEvent.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await accountFetchEvent.json();
    console.log("Sadrzaj korisnikovih eventa:", data.events);

    try {
      // ažuriranje eventa ako korisnik vec nije glasao da dolazi na event
      console.log(data.events.includes(eventId));
      if (!data.events.includes(eventId)) {
        const eventUpdateTotalPeople = await fetch(
          `http://localhost:8080/edit/events/${eventId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ totalPeople: newTotalPeople }),
          }
        );

        if (!eventUpdateTotalPeople.ok) {
          throw new Error("Network response was not ok");
        }
        !onlyUpdateTotalPeople && updateAccountEvent(accountId, eventId);
        !onlyUpdateTotalPeople && alert("Uspesna prijava");
        setTotalPeople(newTotalPeople); // Update the state
      }
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  async function fetchAccountEvents(accountId, eventId) {
    try {
      const accountFetchEvent = await fetch(
        `http://localhost:8080/accounts/${accountId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!accountFetchEvent.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await accountFetchEvent.json();
      console.log("Sadrzaj korisnikovih eventa:", data.events);
      return data.events.includes(eventId);
    } catch (error) {
      console.error("Failed to fetch account events:", error);
      throw error;
    }
  }

  async function deleteEvent(UserId, eventId) {
    const url = `http://localhost:8080/remove/account/event/${UserId}`; // Ispravno korišćenje template stringa
    const data = {
      EventId: eventId,
    };
    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
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

  const handleClick = () => {
    isExpired || updateTotalPeople(props.eventId, totalPeople + 1, false); // Dodavanje ljudi za jedan ako je sve uredu
  };

  const handleDeleteEvent = async () => {
    try {
      const accountId = localStorage.getItem("accountid");
      const eventId = props.eventId;

      const eventExists = await fetchAccountEvents(accountId, eventId);

      if (eventExists) {
        console.log(eventId);
        await deleteEvent(accountId, eventId);
        await updateTotalPeople(eventId, totalPeople - 1, true);
      } else {
        console.log("Event ID not found in user's events.");
      }
    } catch (error) {
      console.error("Error handling delete event:", error);
    }
  };

  return (
    <div className="rounded overflow-hidden shadow-lg flex flex-col">
      <div className="relative">
        <a href="/api">
          <img className="w-full" src={props.photo} alt="Conference" />
          <div className="hover:bg-transparent transition duration-300 absolute bottom-0 top-0 right-0 left-0 bg-gray-900 opacity-25"></div>
        </a>
        <a href="#!">
          <div className="text-l absolute top-0 right-0 bg-indigo-600 px-4 py-2 text-white mt-3 mr-3 hover:bg-white hover:text-indigo-600 transition duration-500 ease-in-out">
            {props.price}
          </div>
          <div className="text-l absolute top-0 left-0 bg-indigo-600 px-4 py-2 text-white mt-3 hover:bg-white hover:text-indigo-600 transition duration-500 ease-in-out">
            {totalPeople}
          </div>
        </a>
      </div>
      <div className="px-6 py-4 mb-auto">
        <a
          href="/api"
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
