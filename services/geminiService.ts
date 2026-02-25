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

export const generatePhotoshootImage = async (productImageBase64: string, angle: string): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key not found");
  }

  const model = "gemini-2.5-flash-image";
  const modelDescription = "A beautiful Indian model with long straight dark hair, warm skin tone, and elegant features. She is the official model for Kurti Times.";

  const prompt = `Perform a professional fashion photoshoot. 
  Take the clothing item from the provided product image and place it perfectly on the model described below.
  
  Model Description: ${modelDescription}
  
  Angle/Shot Type: ${angle}
  
  Requirements:
  1. The clothing item (kurti/coord set/tunic) must maintain its exact color, pattern, and fabric texture from the product image.
  2. The fit on the model should be realistic and flattering.
  3. The background should be a high-end, minimalist studio setting with soft, warm lighting.
  4. Ensure the model's face and features are consistent with the description.
  5. Output ONLY the generated image.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: productImageBase64.split(',')[1] || productImageBase64,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("No image generated");
  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    throw error;
  }
};