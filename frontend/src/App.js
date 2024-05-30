import "./App.css";
import React, { useEffect, useState } from "react";

function App() {
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

export default App;
