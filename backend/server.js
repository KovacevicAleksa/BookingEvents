const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());

app.get("/api/data", (req, res) => {
  return res.json({ data: "Stranica za ezs" });
});

app.get("/registration", (req, res) => {
  return res.json({ data: "Stranica za registraciju" });
});

app.get("/prijava", (req, res) => {
  return res.send("Strana za prijavu");
});

app.listen(8081, () => {
  console.log("Listening");
});
