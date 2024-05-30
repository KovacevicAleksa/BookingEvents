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
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
        <Card />
        <Card />
        <Card />
      </div>
      <Data />
    </div>
  );
}

export default App;
