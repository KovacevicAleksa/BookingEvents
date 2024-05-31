/* eslint-disable jsx-a11y/anchor-has-content */
import "./App.css";
import { useEffect, useState } from "react";
import Header from "./Components/Header";
import Card from "./Components/Card";

function Data() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8081/api")
      .then((res) => res.json())
      .then((data) => setData(data.message))
      .catch((err) => console.log(err));
  });

  return (
    <div>
      <h1 className="mt-6 text-gray-500 dark:text-gray-400">
        {data ? data : "Loading..."}
      </h1>
    </div>
  );
}

function App() {
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
          date="2022-05-10"
        />
        <Card
          price="$$"
          title="Ethereum Workshop"
          description="Bitcoin je jedina prava decentralizovana kriptovaluta. Kroz ovu grupu mi stvaramo bitcoin-only zajednicu kojom utičemo i motivišemo ljude da, kroz bitcoin, menjaju svet. Ovaj meetup je stvoren sa tim ciljem, imamo slobodnu diskusiju i planiramo projekte (edukacija, filozofija, ekonomija, startup ideje itd.)"
          location="Novi Sad, Serbia"
          date="2025-05-10"
        />
        <Card
          price="FREE"
          title="Crypto Basics"
          description="Bitcoin je jedina prava decentralizovana kriptovaluta. Kroz ovu grupu mi stvaramo bitcoin-only zajednicu kojom utičemo i motivišemo ljude da, kroz bitcoin, menjaju svet. Ovaj meetup je stvoren sa tim ciljem, imamo slobodnu diskusiju i planiramo projekte (edukacija, filozofija, ekonomija, startup ideje itd.)"
          location="Niš, Serbia"
          date="2022-05-10"
        />
      </div>
      <Data />
    </div>
  );
}

export default App;
