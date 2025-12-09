import { GoogleGenAI } from "@google/genai";

// Initialize the client with the API key from the environment variable.
// We assume the variable is pre-configured and valid.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateBirthdayWish = async (
  name: string,
  tone: string,
  language: string
): Promise<string> => {
  try {
    const prompt = `Write a short, heartwarming birthday wish for someone named "${name}". 
    Tone: ${tone}. 
    Language: ${language}. 
    Keep it under 50 words. Do not include quotes around the text.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Happy Birthday!";
  } catch (error) {
    console.error("Error generating wish:", error);
    return "Wishing you a fantastic birthday filled with joy!";
  }
};
