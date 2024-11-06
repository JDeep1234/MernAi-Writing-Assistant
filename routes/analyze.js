const express = require("express");
const axios = require("axios");

const rephraseRouter = express.Router();

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = "gpt-4o-mini";
const MAX_TOKENS = 150;
const TEMPERATURE = 0.7;
const RESPONSE_COUNT = 3;

// Helper function to build the OpenAI request payload
const createRequestPayload = (sentence) => ({
  model: OPENAI_MODEL,
  messages: [
    {
      role: "system",
      content:
        "You are a skilled assistant that specializes in rephrasing sentences. Please return only the rephrased sentences without any extra commentary or explanations.",
    },
    {
      role: "user",
      content: sentence,
    },
  ],
  max_tokens: MAX_TOKENS,
  n: RESPONSE_COUNT,
  temperature: TEMPERATURE,
});

// Function to handle OpenAI API request
const getRephrasedSentences = async (sentence) => {
  try {
    const requestPayload = createRequestPayload(sentence);
    
    const response = await axios.post(OPENAI_API_URL, requestPayload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });

    // Extracting and cleaning up the rephrased sentences from the API response
    return response.data.choices.map((choice) => choice.message.content.trim());
  } catch (error) {
    console.error("OpenAI API request failed:", error.response ? error.response.data : error.message);
    throw new Error("Unable to process the sentence. Please try again later.");
  }
};

// POST endpoint to rephrase the input sentence
rephraseRouter.post("/", async (req, res) => {
  const { sentence } = req.body;

  // Ensure the sentence is provided in the request
  if (!sentence || typeof sentence !== "string" || sentence.trim() === "") {
    return res.status(400).json({ error: "Sentence is required and cannot be empty." });
  }

  try {
    const rephrasedSentences = await getRephrasedSentences(sentence);
    return res.json({ rephrasedSentences });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = rephraseRouter;

