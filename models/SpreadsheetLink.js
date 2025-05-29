const mongoose = require("mongoose");

const SpreadsheetLinkSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    unique: true,
  },
  spreadsheetId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model("SpreadsheetLink", SpreadsheetLinkSchema);
module.exports = SpreadsheetLinkSchema;
