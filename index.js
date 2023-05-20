const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
require("dotenv").config();

// Set your API key
const apiKey = "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";

// Create an instance of the OpenAI class

// Replace 'YOUR_BOT_TOKEN' with your own Telegram Bot token
const bot = new TelegramBot("6081240965:AAG4psQrfilzRwhlss3bSggodZLKlwvauRw", { polling: true });

// Handle incoming messages
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const message = msg.text;
  console.log(message);

  if (!message) {
    // Ignore non-text or empty messages
    return;
  }
  // Send the input message to ChatGPT API and get the response
  const outputMessage = await getChatGPTResponse(message);

  // Send the output message back to the user
  bot.sendMessage(chatId, outputMessage);
});

// Function to send the input message to ChatGPT API and get the response
async function getChatGPTResponse(message) {
  const apiUrl = "https://api.openai.com/v1/chat/completions";
  const apiKey = process.env.OPENAI_API_KEY; // Use your API key from .env file

  try {
    const response = await axios.post(
      apiUrl,
      {
        prompt: message,
        model: "gpt-3.5-turbo", // Specify the model to use
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: message }
        ],
        max_tokens: 200, // Adjust the value based on desired response length
        temperature: 0.7 // Adjust the value to control response randomness
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        }
      }
    );

    const { choices } = response.data;
    const chatGPTResponse = choices[0].message.content.trim();

    return chatGPTResponse;
  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error.message);
    return "Sorry, something went wrong.";
  }
}
