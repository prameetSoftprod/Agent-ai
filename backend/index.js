import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import { ChatOllama } from "langchain/chat_models/ollama";
import { createAgentExecutor } from "langchain/agents";
import { Tool } from "langchain/tools";
import { BufferMemory } from "langchain/memory";

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

// Initialize Ollama Chat Model
const model = new ChatOllama({
  model: "mistral",  // or your Ollama model name
  temperature: 0.7,
  baseUrl: "http://localhost:11434", // Ollama server URL
});

// Example Tool: Calculator
const calculatorTool = new Tool({
  name: "Calculator",
  description: "Performs simple math calculations",
  func: async (input) => {
    try {
      return String(eval(input));
    } catch {
      return "Error: Invalid math expression";
    }
  },
});

const tools = [calculatorTool];

// Memory to keep chat context
const memory = new BufferMemory();

let agentExecutor;
async function initAgent() {
  agentExecutor = await createAgentExecutor(tools, model, {
    agentType: "chat-zero-shot-react-description",
    memory,
  });
}

await initAgent();

// Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const { input } = req.body;
    if (!input) return res.status(400).json({ error: "No input provided" });

    // Run agent with input
    const result = await agentExecutor.call({ input });

    res.json({ response: result.output });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
