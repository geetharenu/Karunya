import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

const getAIClient = () => {
  if (!ai) {
    // The API key must be obtained exclusively from the environment variable process.env.API_KEY.
    // Assume this variable is pre-configured, valid, and accessible in the execution context.
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

export const generateBirthdayWish = async (
  name: string,
  tone: string,
  language: string
): Promise<string> => {
  try {
    const client = getAIClient();
    
    const prompt = `Write a short, heartwarming birthday wish for someone named "${name}". 
    Tone: ${tone}. 
    Language: ${language}. 
    Keep it under 50 words. Do not include quotes around the text.`;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Happy Birthday!";
  } catch (error) {
    console.error("Error generating wish:", error);
    return "Wishing you a fantastic birthday filled with joy and laughter!";
  }
};