const express = require("express");
const axios = require("axios");

const spellCheckerRouter = express.Router();

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = "gpt-4o-mini";
const MAX_TOKENS = 150;
const TEMPERATURE = 0.5;

// Helper function to build the OpenAI request payload
const createRequestPayload = (text) => ({
  model: OPENAI_MODEL,
  messages: [
    {
      role: "system",
      content:
        "You are a helpful assistant that checks and corrects spelling errors in the following text. Only return the corrected text without any additional comments or context.",
    },
    {
      role: "user",
      content: text,
    },
  ],
  max_tokens: MAX_TOKENS,
  n: 1,
  temperature: TEMPERATURE,
});

// Function to handle OpenAI API request for spell correction
const getCorrectedText = async (text) => {
  try {
    const requestPayload = createRequestPayload(text);

    const response = await axios.post(OPENAI_API_URL, requestPayload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error("OpenAI API request failed:", error.response ? error.response.data : error.message);
    throw new Error("Unable to process the text. Please try again later.");
  }
};

// POST endpoint to check and correct the spelling of the input text
spellCheckerRouter.post("/", async (req, res) => {
  const { text } = req.body;

  // Ensure the text is provided and valid
  if (!text || typeof text !== "string" || text.trim() === "") {
    return res.status(400).json({ error: "Text is required and cannot be empty." });
  }

  try {
    const correctedText = await getCorrectedText(text);
    return res.json({ correctedText });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = spellCheckerRouter;
