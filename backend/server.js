const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const path = require("path");
const Account = require("./models/account");

const app = express();

app.use(cors());

app.use(express.json());

app.get("/api/data", (req, res) => {
  var data = ["item1", "item2", "item3"];
  res.json(data);
  console.log("Sent list of items");
});

app.post("/login", async (req, res) => {
  try {
    const account = await Account.create(req.body);
    res.status(200).json(account);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/login1", async (req, res) => {
  try {
    const accounts = await Account.find({});
    res.status(200).json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/login1/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const account = await Account.findById(id);
    res.status(200).json(account);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// connect to mongoDB
const dbURI =
  "mongodb+srv://aleksakovacevic712:4Ozm0Zt8OTmGcIaK@bookingevent.kzck53c.mongodb.net/Node?retryWrites=true&w=majority&appName=BookingEvent";

mongoose
  .connect(dbURI)
  .then(() => {
    app.listen(8080, () => {
      console.log("Listening");
    });
    console.log("connected to db");
  })
  .catch((err) => console.log(err));
