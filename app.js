const axios = require("axios");
require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

let isLimit = false;

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const message = msg.text;
  console.log(message);

  if (message === "/start") {
    await bot.sendMessage(
      chatId,
      `*Привет, это бот с помощью которого ты сдашь топку, просто спроси у меня, что тебя интересует. Вопросы пиши как можно подробнее, если ответ не устраивает переформулируй вопрос или уточни что именно нужно узнать. Удачи! \n P.S как сдашь экзамен пиши как все прошло сюда  https://t.me\/+fetuA_naWFBmZjky *`,
      { parse_mode: "Markdown" }
    );
    return;
  }

  if (!message && message === "/start") {
    // Ignore non-text or empty messages
    return;
  }
  // Send the input message to ChatGPT API and get the response
  if (!isLimit) {
    const outputMessage = await getChatGPTResponse(message);

    // Send the output message back to the user
    await bot.sendMessage(chatId, outputMessage);
  } else {
    await bot.sendMessage(chatId, "слишком много вопросов возвращайтесь через 3 минуты");
  }
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
    if (error instanceof OpenAIError) {
      if (error.response && error.response.status === 402) {
        console.log("ChatGPT API call failed due to model expiration.");
        return "ChatGPT API call failed due to model expiration.";
        // Handle the expired model error here
      } else if (error.response && error.response.status === 429) {
        console.log("ChatGPT API call failed due to rate limit exceeded.");
        isLimit = true;
        setTimeout(() => {
          isLimit = false;
        }, 180000);
        return "слишком много вопросов возвращайтесь через 3 минуты";
      } else {
        console.log("ChatGPT API call failed with an error:", error.message);
        return "Простите что-то пошло не так, пишите об ошибках сюда @iziTopkaSupport";
      }
    }
    console.error("Error:", error.response ? error.response.data : error.message);
    return "Простите что-то пошло не так, пишите об ошибках сюда @iziTopkaSupport";
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
