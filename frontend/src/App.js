/* eslint-disable jsx-a11y/anchor-has-content */
import { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Header from "./Components/Header";
import Card from "./Components/Card";
import konferencija from "./Components/assets/Konferencija.jpg";
import Login from "./routes/Login";
import Registration from "./routes/Registration";

import PrivateRoute from "./Components/PrivateRoute";

function Data() {
  const [eventData, setEventData] = useState([]);

  //ispisivanje svih eventa na sajtu
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:8081/view/events", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error("Network problem");
        }

        const data = await response.json();
        setEventData(data);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData();
  }, []); //ne prati zavisnost

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
        {Array.isArray(eventData) &&
          eventData.map((event, index) => (
            <Card
              key={event.id}
              price={event.price}
              title={event.title}
              description={event.description}
              location={event.location}
              photo={konferencija}
              attendees={`${event.totalPeople}/${event.maxPeople}`}
              date={event.date}
              eventId={event._id}
              totalPeople={event.totalPeople}
            />
          ))}
      </div>
    </div>
  );
}
function Events() {
  return (
    <div>
      <Header />
      <Data />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/registration" element={<Registration />} />

      <Route
        path="/events"
        element={
          <PrivateRoute>
            <Events />
          </PrivateRoute>
        }
      />
      <Route path="/" element={<Login />} />
    </Routes>
  );
}

export default App;
