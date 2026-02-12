
import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { Message } from "../types";

const MAX_RETRIES = 2;
const INITIAL_RETRY_DELAY = 1000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Removed the manual declare global for Window.aistudio as it conflicts with pre-existing environment types.
// We will use (window as any).aistudio instead for safety.

export const getGeminiResponse = async (
  messages: Message[],
  location: string,
  currentImage?: { data: string; mimeType: string },
  retryCount = 0
): Promise<string> => {
  try {
    // Create a new instance every time to get the most up-to-date API key
    // The key is injected via process.env.API_KEY automatically after selection
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    
    // Using gemini-3-pro-preview for "Ultimate" high-intelligence tasks
    const modelName = 'gemini-3-pro-preview';

    const systemInstruction = `You are Gemigroq Ultimate, a world-class AI assistant powered by ${modelName}.
    Current User Location: ${location}.
    Capabilities: High-intelligence reasoning, vision-based analysis, and professional communication.
    Guidelines: 
    - Provide dense, high-value information.
    - Be concise unless the user asks for detail.
    - If images are provided, analyze them deeply in the context of the conversation.
    - Maintain a helpful, sophisticated, and expert persona.`;

    const contents = messages.map(msg => {
      const parts: Part[] = [];
      parts.push({ text: msg.content });
      
      if (msg.image) {
        parts.push({
          inlineData: {
            data: msg.image.data,
            mimeType: msg.image.mimeType
          }
        });
      }
      
      return {
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts
      };
    });

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.8,
        // gemini-3-pro-preview requires thinking mode to be active. 
        // A budget of 0 is invalid for this specific model.
        thinkingConfig: { thinkingBudget: 32768 } 
      }
    });

    // Access .text property directly (not a method) as per GenerateContentResponse definition
    const text = response.text;
    if (!text) {
      throw new Error("Model returned an empty response.");
    }
    
    return text;

  } catch (error: any) {
    console.error(`Gemini API Error (Attempt ${retryCount + 1}):`, error);
    
    // If the request fails with "Requested entity was not found", it often means a key issue.
    // We prompt the user to select a key again via openSelectKey() as per guidelines.
    if (error?.message?.includes("Requested entity was not found") || error?.status === 404) {
       const aistudio = (window as any).aistudio;
       if (aistudio) {
         await aistudio.openSelectKey();
         // Proceeding assuming key selection was successful as per guidelines to mitigate race conditions
         if (retryCount < MAX_RETRIES) {
           return getGeminiResponse(messages, location, currentImage, retryCount + 1);
         }
       }
       throw new Error("API Key or Project not found. Please select a valid paid project API key.");
    }

    const status = error?.status;
    const isTransient = status === 429 || (status >= 500 && status <= 599);
    
    if (isTransient && retryCount < MAX_RETRIES) {
      await delay(INITIAL_RETRY_DELAY * Math.pow(2, retryCount));
      return getGeminiResponse(messages, location, currentImage, retryCount + 1);
    }

    if (status === 429) {
      throw new Error("Rate limit exceeded. Try again in a few seconds.");
    }
    
    throw new Error(error.message || "An error occurred with the Gemini API.");
  }
};
