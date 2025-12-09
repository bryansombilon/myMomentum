import { GoogleGenAI } from "@google/genai";
import { Task } from "../types";

const getAiClient = () => {
  let apiKey: string | undefined;

  // Try standard Vite/Module environment (Vercel default)
  try {
    // @ts-ignore
    if (import.meta && import.meta.env) {
      // @ts-ignore
      apiKey = import.meta.env.VITE_API_KEY || import.meta.env.API_KEY;
    }
  } catch (e) {
    // Ignore error if import.meta is not available
  }

  // Fallback to process.env for Node-like environments or custom webpack configs
  if (!apiKey) {
    try {
      if (typeof process !== 'undefined' && process.env) {
        apiKey = process.env.API_KEY || process.env.REACT_APP_API_KEY;
      }
    } catch (e) {
       // Ignore error if process is not defined
    }
  }
  
  if (!apiKey) {
    console.error("API_KEY is missing. Ensure the environment is configured correctly.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateTaskSummaryOrAdvice = async (task: Task, query: string, contextUpdates: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Configuration Error: API Key not found. Please check your environment settings.";

  const prompt = `
    You are a helpful AI project assistant. 
    Task Context:
    Title: ${task.title}
    Description: ${task.description}
    Project: ${task.project}
    Current Status: ${task.status}
    Recent Updates: ${contextUpdates}

    User Query: ${query}

    Provide a concise, professional, and actionable response. If the user asks for a summary, summarize the updates. If they ask for advice, provide steps.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error communicating with the AI service.";
  }
};