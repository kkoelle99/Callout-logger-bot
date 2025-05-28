const mongoose = require("mongoose");

const calloutSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  reason: { type: String, required: true },
  date: { type: Date, required: true },
  username: { type: String, required: true },
  nickname: { type: String, required: true },
});

module.exports = mongoose.model("Callout", calloutSchema);
