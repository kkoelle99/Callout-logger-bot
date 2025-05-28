require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const mongoose = require("mongoose");
const { logCallout } = require("./src/bot");
const SpreadsheetLink = require("./models/SpreadsheetLink");
const Callout = require("./models/callout");

// Initialize Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Bot Ready Event
client.once("ready", () => {
  console.log(`${client.user.tag} is online!`);
});

// Command Handling
client.on("messageCreate", async (message) => {
  if (!message.content.startsWith("!") || message.author.bot) return;

  const [command, ...args] = message.content.slice(1).split(" ");

  // Handle !linkspreadsheet command
  if (command === "linkspreadsheet") {
    if (!message.guild) {
      return message.reply(
        "This command can only be used in a server, not in a DM."
      );
    }

    const [spreadsheetId] = args;

    if (!spreadsheetId) {
      return message.reply(
        "Please provide a spreadsheet ID. Usage: `!linkspreadsheet <spreadsheetId>`"
      );
    }

    try {
      // Save or update the server's spreadsheet link
      await SpreadsheetLink.findOneAndUpdate(
        { guildId: message.guild.id },
        { spreadsheetId },
        { upsert: true, new: true }
      );

      message.reply(
        `The spreadsheet for this server has been linked successfully! Spreadsheet ID: \`${spreadsheetId}\``
      );
    } catch (error) {
      console.error("Error linking spreadsheet:", error.message);
      message.reply(
        "An error occurred while linking the spreadsheet. Please try again later."
      );
    }
    return;
  }

  // Handle !callout command
  if (command === "callout") {
    if (args.length < 3) {
      return message.reply(
        "Please provide the first name, last name, and reason. Usage: `!callout <firstName> <lastName> <reason>`"
      );
    }

    const [firstName, lastName, ...reasonParts] = args;
    const reason = reasonParts.join(" ");
    const date = new Date();

    // Extract username and nickname
    const username = message.author.username;
    const nickname = message.member?.nickname || "No Nickname";

    try {
      if (!message.guild) {
        return message.reply(
          "This command can only be used in a server, not in a DM."
        );
      }

      // Retrieve the server's linked spreadsheet ID
      const serverLink = await SpreadsheetLink.findOne({
        guildId: message.guild.id,
      });

      if (!serverLink) {
        return message.reply(
          "This server hasn't linked a spreadsheet yet. Use `!linkspreadsheet <spreadsheetId>` to link one."
        );
      }

      const spreadsheetId = serverLink.spreadsheetId;

      // Log callout to Google Sheets
      await logCallout(
        spreadsheetId,
        firstName,
        lastName,
        reason,
        date,
        username,
        nickname
      );

      // Save the callout to the database
      await saveCalloutToDatabase(
        firstName,
        lastName,
        reason,
        date,
        username,
        nickname
      );

      message.reply(
        `Callout for ${firstName} ${lastName} (Username: ${username}, Nickname: ${nickname}) logged successfully.`
      );
    } catch (error) {
      console.error("Error logging callout:", error.message);
      message.reply(
        "An error occurred while logging the callout. Please try again later."
      );
    }
  }
});

// Save callout to database
async function saveCalloutToDatabase(
  firstName,
  lastName,
  reason,
  date,
  username,
  nickname
) {
  try {
    const callout = new Callout({
      firstName,
      lastName,
      reason,
      date,
      username,
      nickname,
    });
    await callout.save();
    console.log(`Saved call-out for ${firstName} ${lastName} to the database.`);
  } catch (error) {
    console.error("Error saving call-out to database:", error.message);
    throw new Error("Failed to save callout to database.");
  }
}

// Connect to MongoDB and start bot
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    client.login(process.env.DISCORD_TOKEN);
  })
  .catch((err) => console.error("Failed to connect to MongoDB:", err));
