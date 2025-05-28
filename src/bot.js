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
  const auth = new google.auth.GoogleAuth({
    keyFile: "./config/google-credentials.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  try {
    const range = "Sheet1!A2:F"; // Adjust based on your sheet structure
    const values = [
      [firstName, lastName, reason, date.toISOString(), username, nickname],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      requestBody: { values },
    });

    console.log(`Logged call-out for ${firstName} ${lastName}`);
  } catch (error) {
    console.error("Error logging callout to Google Sheets:", error.message);
    throw new Error(
      "Failed to log callout. Ensure the spreadsheet ID and tab name are correct."
    );
  }
}

module.exports = { logCallout };
