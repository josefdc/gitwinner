import { GoogleGenAI } from "@google/genai";
import { Candidate } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAnnouncement = async (winner: Candidate, issueContext: string): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      You are an energetic game show host. 
      The user "${winner.login}" has just won a raffle from a GitHub Issue titled/related to: "${issueContext}".
      
      Write a short, punchy, and exciting congratulatory message (max 2 sentences). 
      Use emojis. Mention their username.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || `Congratulations @${winner.login}! You are the chosen one! 🎉`;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `Huge congratulations to @${winner.login}! You won! 🚀`;
  }
};