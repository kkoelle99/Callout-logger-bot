require("dotenv").config();

const { google } = require("googleapis");

async function logCallout(
  spreadsheetId,
  firstName,
  lastName,
  reason,
  date,
  username,
  nickname
) {
  try {
    // Validate Environment Variable
    if (!process.env.GOOGLE_CREDENTIALS) {
      throw new Error("GOOGLE_CREDENTIALS environment variable is not set.");
    }

    // Parse Google Credentials
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);

    // Google Sheets API Authentication
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    // Initialize Google Sheets API
    const sheets = google.sheets({ version: "v4", auth });

    // Validate Date
    if (!(date instanceof Date) || isNaN(date)) {
      throw new Error("Invalid date provided.");
    }

    // Prepare Data for Logging
    const range = "Sheet1!A2:F"; // Adjust based on your sheet structure
    const values = [
      [firstName, lastName, reason, date.toISOString(), username, nickname],
    ];

    console.log("Logging data to Google Sheets:", {
      spreadsheetId,
      range,
      values,
    });

    // Append Data to Google Sheets
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      requestBody: { values },
    });

    console.log(`Successfully logged call-out for ${firstName} ${lastName}`);
  } catch (error) {
    console.error("Error logging callout to Google Sheets:", error.message);
    throw new Error(
      `Failed to log callout. Ensure the spreadsheet ID, tab name, and credentials are correct. Details: ${error.message}`
    );
  }
}

module.exports = { logCallout };
