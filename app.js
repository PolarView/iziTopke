const axios = require("axios");
require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const message = msg.text;
  console.log(message);

  if (!message && message === "/start") {
    // Ignore non-text or empty messages
    return;
  }
  // Send the input message to ChatGPT API and get the response
  const outputMessage = await getChatGPTResponse(message);

  // Send the output message back to the user
  bot.sendMessage(chatId, outputMessage);
});

async function getChatGPTResponse(message) {
  const apiUrl = "https://api.openai.com/v1/chat/completions";
  const apiKey = process.env.OPENAI_API_KEY; // Replace with your OpenAI API key

  try {
    const response = await axios.post(
      apiUrl,
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: message }
        ]
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

// Example usage
// const userInput = "Hello!";
// getChatGPTResponse(userInput)
//   .then((response) => {
//     console.log("Response:", response);
//   })
//   .catch((error) => {
//     console.error("Error:", error);
//   });
