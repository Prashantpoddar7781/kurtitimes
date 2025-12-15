import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { PRODUCTS } from "../constants";

const apiKey = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

// System instruction to guide the AI's behavior
const SYSTEM_INSTRUCTION = `
You are 'Mira', an expert AI Fashion Stylist for 'Kurti Times', a trendy ethnic wear brand.
We sell: Kurti Sets, Indo Western wear, Co-ord Sets, and Tunics.

Your goal is to help customers choose outfits based on their needs (weddings, office, casual, festivals).
Be friendly, professional, and knowledgeable about Indian fashion trends.
Keep responses concise (under 100 words unless asked for more details).

Here is a summary of some products we have (use this to recommend items if they fit):
${PRODUCTS.map(p => `- ${p.name} (${p.category}): ₹${p.price}`).join('\n')}

When recommending, try to mention the specific product name from our catalog if applicable.
If the user asks about something we don't sell (like shoes or electronics), politely steer them back to our clothing collection.
`;

let chatSession: Chat | null = null;

export const getChatResponseStream = async (message: string): Promise<AsyncIterable<GenerateContentResponse>> => {
  if (!apiKey) {
    throw new Error("API Key not found");
  }

  if (!chatSession) {
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
  }

  try {
    const response = await chatSession.sendMessageStream({ message });
    return response;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const resetChat = () => {
  chatSession = null;
};