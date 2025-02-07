import React, { useState } from "react";
import { useAuth } from  "../context/AuthContext.js"
import config from "../config/config.js";
import Card from "./Card.js";
import konferencija from "./assets/Konferencija.jpg";

import hoverPhoto from "./assets/hoverPhoto.gif";

// Data component to display events
function CardData() {
    const [eventData, setEventData] = React.useState([]);
    const { user, checkTokenExpiration, logout } = useAuth();
  
    React.useEffect(() => {
      const fetchData = async () => {
        if (!checkTokenExpiration()) {
          return;
        }
  
        try {
          const response = await fetch(
            `${config.api.baseURL}${config.api.endpoints.viewevents}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user.token}`,
              },
            }
          );
  
          if (!response.ok) {
            if (response.status === 401) {
              logout();
              return;
            }
            throw new Error("Network problem");
          }
  
          const data = await response.json();
          setEventData(data);
        } catch (error) {
          console.error("Error:", error);
        }
      };
  
      if (user && user.token) {
        fetchData();
      }
    }, [user, checkTokenExpiration, logout]);
  
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900">
        {Array.isArray(eventData) &&
          eventData.map((event) => (
            <Card
              key={event._id}
              price={event.price}
              title={event.title}
              description={event.description}
              location={event.location}
              photo={konferencija || "https://github.com/user-attachments/assets/f59f4fde-c4c6-4118-bf26-755064981064"}
              hoverPhoto={hoverPhoto || "https://github.com/user-attachments/assets/a181e3fa-f86f-418e-8286-6f533e93c6c5"}
              attendees={`/${event.maxPeople}`}
              date={event.date}
              eventId={event._id}
              totalPeople={event.totalPeople}
            />
          ))}
      </div>
    );
  }

export default CardData