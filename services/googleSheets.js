const { google } = require("googleapis");
const mongoose = require("mongoose");
const credentials = require("./config/google-credentials.json");

// Google Sheets API Setup
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

async function logCallout(spreadsheetId, name, reason, date) {
  const range = "Sheet1!A2:D"; // Adjust based on your sheet structure
  const values = [[name, reason, date]];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "RAW",
    requestBody: { values },
  });

  console.log(`Logged call-out for ${name}`);
}

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || "your-mongodb-uri-here";

async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit if the connection fails
  }
}

// Callout Schema and Model
const calloutSchema = new mongoose.Schema({
  name: String,
  reason: String,
  date: Date,
});

const Callout = mongoose.model("Callout", calloutSchema);

async function saveCalloutToDatabase(name, reason, date) {
  try {
    const callout = new Callout({ name, reason, date });
    await callout.save();
    console.log(`Saved call-out for ${name} to the database.`);
  } catch (error) {
    console.error("Error saving call-out to database:", error);
  }
}

// Export Functions
module.exports = {
  logCallout,
  connectToDatabase,
  saveCalloutToDatabase,
};
