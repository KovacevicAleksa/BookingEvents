const mongoose = require("mongoose");

const AccountSchema = mongoose.Schema(
  {
    email: {
      type: String,
      require: true,
    },
    password: {
      type: String,
      require: true,
    },
  },
  {
    timestamp: true,
  }
);

const Account = mongoose.model("Account", AccountSchema);

module.exports = Account;
