import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key is missing!");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateBirthdayWish = async (
  name: string,
  tone: string,
  language: string
): Promise<string> => {
  const client = getClient();
  if (!client) return "Happy Birthday! (API Key missing)";

  try {
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
    return "Wishing you a fantastic birthday filled with joy!";
  }
};
