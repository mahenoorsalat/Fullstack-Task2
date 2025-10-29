
import { GoogleGenAI } from "@google/genai";

// FIX: Per API guidelines, assume API_KEY is always available in the environment.
// This removes the need for conditional initialization and runtime checks.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const boostResume = async (resumeText: string): Promise<string> => {
  try {
    const prompt = `You are an expert career coach. Rewrite the following resume experience summary to be more professional, impactful, and tailored for Applicant Tracking Systems (ATS). Use strong action verbs and quantify achievements where possible. Keep it concise, under 150 words. \n\nOriginal text: "${resumeText}"`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    // FIX: Per API guidelines, directly access the .text property for the response.
    return response.text;
  } catch (error) {
    console.error("Error boosting resume:", error);
    return "An error occurred while enhancing your resume. Please try again.";
  }
};