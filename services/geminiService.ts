
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

// Added generateSOPContent to fix error in SOPApp.tsx
export const generateSOPContent = async (title: string, context: string): Promise<{ toolsUsed: string[], steps: string[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Generate a Standard Operating Procedure (SOP) for the task: "${title}".
    Context and Requirements:
    ${context}
    
    The response must be a JSON object with:
    - toolsUsed: array of strings listing tools, software or resources.
    - steps: array of strings containing the procedure steps.
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
            toolsUsed: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of tools and resources used."
            },
            steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Sequential steps of the SOP."
            }
          },
          required: ["toolsUsed", "steps"],
          propertyOrdering: ["toolsUsed", "steps"]
        }
      }
    });

    const jsonText = response.text || '{"toolsUsed":[], "steps":[]}';
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Gemini API Error (SOP Generation):", error);
    return {
      toolsUsed: [],
      steps: ["Error generating AI content. Please add steps manually."]
    };
  }
};
