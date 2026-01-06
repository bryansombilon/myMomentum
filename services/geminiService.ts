
import { GoogleGenAI } from "@google/genai";
import { Task } from "../types";

// Always obtain API key exclusively from process.env.API_KEY.
// The client is initialized directly before use to ensure it uses the latest environment configuration.
export const generateTaskSummaryOrAdvice = async (task: Task, query: string, contextUpdates: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    // Using gemini-3-flash-preview for general text tasks as per guidelines.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    // Directly access the .text property from the GenerateContentResponse object.
    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error communicating with the AI service.";
  }
};
