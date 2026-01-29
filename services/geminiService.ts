
import { GoogleGenAI, Type } from "@google/genai";
import { Task } from "../types";

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
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error communicating with the AI service.";
  }
};

export const generateSOPContent = async (title: string, context: string): Promise<{ toolsUsed: string[], steps: string[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Create a professional Standard Operating Procedure (SOP) for: "${title}".
    Additional Context: ${context}
    
    Return the response in JSON format with two keys:
    "toolsUsed": string[]
    "steps": string[] (sequential, clear instructions)
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            toolsUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
            steps: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["toolsUsed", "steps"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    return {
      toolsUsed: data.toolsUsed || [],
      steps: data.steps || []
    };
  } catch (error) {
    console.error("Gemini SOP Error:", error);
    return { toolsUsed: [], steps: [] };
  }
};
