import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.js";
import config from "../config/config.js";
import Card from "./Card.js";
import konferencija from "./assets/Konferencija.jpg";
import hoverPhoto from "./assets/hoverPhoto.gif";

function CardData({ sortOption }) {
  const [eventData, setEventData] = useState([]);
  const { user, checkTokenExpiration, logout } = useAuth();

  const sortByDateAsc = (a, b) => new Date(a.date) - new Date(b.date);
  const sortByDateDesc = (a, b) => new Date(b.date) - new Date(a.date);
  const sortByPriceLowHigh = (a, b) => {
    const getPriceValue = (price) => {
      if (price === "FREE") return 0;
      const numericPrice = Number(price.replace('$', ''));
      return isNaN(numericPrice) ? 0 : numericPrice;
    };
  
    const priceA = getPriceValue(a.price);
    const priceB = getPriceValue(b.price);
    
    return priceA - priceB;
  };
  
  const sortByPriceHighLow = (a, b) => {
    const getPriceValue = (price) => {
      if (price === "FREE") return 0;
      const numericPrice = Number(price.replace('$', ''));
      return isNaN(numericPrice) ? 0 : numericPrice;
    };
  
    const priceA = getPriceValue(a.price);
    const priceB = getPriceValue(b.price);
    
    return priceB - priceA;
  };
  const sortByAvailability = (a, b) => b.totalPeople - a.totalPeople;

  const getSortedEvents = () => {
    switch (sortOption) {
      case "date-asc":
        return [...eventData].sort(sortByDateAsc);
      case "date-desc":
        return [...eventData].sort(sortByDateDesc);
      case "price-low-high":
        return [...eventData].sort(sortByPriceLowHigh);
      case "price-high-low":
        return [...eventData].sort(sortByPriceHighLow);
      case "availability":
        return [...eventData].sort(sortByAvailability);
      default:
        return eventData;
    }
  };

  // Fetch data
  useEffect(() => {
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
    <div>
      {/* Display cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 p-4">
        {Array.isArray(eventData) &&
          getSortedEvents().map((event) => (
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
    </div>
  );
}

export default CardData;