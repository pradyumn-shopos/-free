import { GoogleGenAI, Part } from "@google/genai";
import { DesignConfig } from "../types";

const MODEL_NAME = 'gemini-3-pro-image-preview';

/**
 * Converts a File object to a base64 string.
 */
const fileToPart = async (file: File): Promise<Part> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const generateDesign = async (config: DesignConfig): Promise<string> => {
  // Ensure we have an API key selected (although the UI should enforce this)
  // Ensure we have an API key selected (although the UI should enforce this)
  // Check environment variable first
  if (process.env.API_KEY || process.env.GEMINI_API_KEY) {
    // We have a key in env, proceed.
  } else {
    const hasKey = window.aistudio ? await window.aistudio.hasSelectedApiKey() : false;
    if (!hasKey) {
      throw new Error("API Key not selected. Please select an API key to proceed.");
    }
  }

  // Create a new instance with the injected key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  console.group("Gemini API Request Debug");
  const parts: Part[] = [];
  console.log("Model:", MODEL_NAME);
  console.log("Prompt:", config.prompt);
  console.log("Reference Images Count:", config.referenceImages?.length || 0);

  // Add the user's reference images if provided
  if (config.referenceImages && config.referenceImages.length > 0) {
    for (const file of config.referenceImages) {
      console.log(`Processing image: ${file.name} (${file.type}, ${file.size} bytes)`);
      const imagePart = await fileToPart(file);
      parts.push(imagePart);
    }
  } else {
    console.log("No reference images provided.");
  }

  // Add the text prompt
  // We enhance the prompt slightly to ensure high quality interior design results
  const enhancedPrompt = `
    Generate a photorealistic, high-quality visualization based on the user's request.
    
    User Request: ${config.prompt}
    
    ${(config.referenceImages && config.referenceImages.length > 0) ? `CRITICAL INSTRUCTION: The user has provided ${config.referenceImages.length} reference image(s). You MUST use these images as strict visual inspiration for the layout, furniture style, and color palette. Analyze them carefully.` : ""}
    
    The image should be professional, well-lit, and high definition.
  `;

  console.log("Enhanced Prompt:", enhancedPrompt);
  parts.push({ text: enhancedPrompt });
  console.groupEnd();

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: parts,
      },
      config: {
        imageConfig: {
          aspectRatio: config.aspectRatio,
          imageSize: config.resolution,
        },
      },
    });

    // Parse the response to find the image
    let imageUrl: string | null = null;

    if (response.candidates && response.candidates.length > 0) {
      const content = response.candidates[0].content;
      if (content && content.parts) {
        for (const part of content.parts) {
          if (part.inlineData && part.inlineData.data) {
            imageUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      }
    }

    if (!imageUrl) {
      throw new Error("No image was generated. The model might have returned text instead.");
    }

    return imageUrl;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};