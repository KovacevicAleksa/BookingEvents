/* eslint-disable jsx-a11y/anchor-has-content */
import { useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Header from "./Components/Header";
import Card from "./Components/Card";
import konferencija from "./Components/assets/Konferencija.jpg";
import Login from "./routes/Login";
import Registration from "./routes/Registration";

import PrivateRoute from "./Components/PrivateRoute";

function Data() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8080/events")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div>
      <h1 className="mt-6 text-gray-500 dark:text-gray-400">
        {data ? (
          <ul>
            {data.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        ) : (
          "Loading..."
        )}
      </h1>
    </div>
  );
}

function Events() {
  return (
    <div>
      <Header />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
        <Card
          price="$$$"
          title="Bitcoin meetup"
          description="Bitcoin je jedina prava decentralizovana kriptovaluta. Kroz ovu grupu mi stvaramo bitcoin-only zajednicu kojom utičemo i motivišemo ljude da, kroz bitcoin, menjaju svet.
          Ovaj meetup je stvoren sa tim ciljem, imamo slobodnu diskusiju i planiramo projekte (edukacija, filozofija, ekonomija, startup ideje itd.)"
          location="Belgrade, Serbia"
          photo={konferencija}
          attendees="190/220"
          date="2025-05-11"
        />
        <Card
          price="$$"
          title="Ethereum Workshop"
          description="Bitcoin je jedina prava decentralizovana kriptovaluta. Kroz ovu grupu mi stvaramo bitcoin-only zajednicu kojom utičemo i motivišemo ljude da, kroz bitcoin, menjaju svet. Ovaj meetup je stvoren sa tim ciljem, imamo slobodnu diskusiju i planiramo projekte (edukacija, filozofija, ekonomija, startup ideje itd.)"
          location="Novi Sad, Serbia"
          photo={konferencija}
          attendees="98/220"
          date="2025-05-10"
        />
        <Card
          price="FREE"
          title="Crypto Basics"
          description="Bitcoin je jedina prava decentralizovana kriptovaluta. Kroz ovu grupu mi stvaramo bitcoin-only zajednicu kojom utičemo i motivišemo ljude da, kroz bitcoin, menjaju svet. Ovaj meetup je stvoren sa tim ciljem, imamo slobodnu diskusiju i planiramo projekte (edukacija, filozofija, ekonomija, startup ideje itd.)"
          location="Niš, Serbia"
          photo={konferencija}
          attendees="220/220"
          date="2022-05-10"
        />
      </div>
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
