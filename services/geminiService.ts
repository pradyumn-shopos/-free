import { GoogleGenAI, Part } from "@google/genai";
import { DesignConfig, GeminiModel } from "../types";

const DEFAULT_MODEL: GeminiModel = 'gemini-2.5-flash-image';

const fileToPart = async (file: File): Promise<Part> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
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

const getApiKey = (): string => {
  const envApiKey = import.meta.env.VITE_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
  if (!envApiKey) {
    throw new Error("API Key not configured");
  }
  return envApiKey;
};

const generateSingleImage = async (
  config: DesignConfig,
  model: GeminiModel,
  prompt: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  
  const parts: Part[] = [];
  
  if (config.referenceImages && config.referenceImages.length > 0) {
    for (const file of config.referenceImages) {
      const imagePart = await fileToPart(file);
      parts.push(imagePart);
    }
  }

  const enhancedPrompt = `
    Generate a photorealistic, high-quality image based on the user's request.
    
    User Request: ${prompt}
    
    ${(config.referenceImages && config.referenceImages.length > 0) ? `Use the provided reference images as visual inspiration for style, colors, and composition.` : ""}
    
    The image should be professional and high definition.
  `;

  parts.push({ text: enhancedPrompt });

  try {
    const requestConfig: any = {
      // responseMimeType: "image/png", // Removed as API complains it only accepts text/json/xml/yaml
    };
    
    // Pass image config - different versions of the SDK expect this differently.
    // Try the standard way first.
    try {
      requestConfig.imageConfig = {
        aspectRatio: config.aspectRatio,
        imageSize: config.resolution,
      };
    } catch(e) {}

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts },
      config: requestConfig,
    });

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
      console.error("Response details:", JSON.stringify(response, null, 2));
      throw new Error("No image was generated. The model may not support these exact settings.");
    }

    return imageUrl;
  } catch (error: any) {
    console.error("Gemini API Error details:", error);
    // Extract the specific Google API error message if available
    if (error.statusDetails && error.statusDetails.length > 0) {
      throw new Error(`API Error: ${error.message} - ${JSON.stringify(error.statusDetails)}`);
    }
    throw error;
  }
};

export const generateDesign = async (config: DesignConfig): Promise<string[]> => {
  const model = config.model || DEFAULT_MODEL;
  const prompts = config.batchPrompts || [config.prompt];
  
  console.group("Gemini API Request");
  console.log("Model:", model);
  console.log("Prompts:", prompts);
  console.groupEnd();

  const promises = prompts.map(p => generateSingleImage(config, model, p));
  const results = await Promise.all(promises);
  return results;
};

export const applyGlobalPrompt = (
  globalPrompt: string,
  sessionConfig: { referenceImages: File[]; aspectRatio: "16:9" | "4:3" | "1:1" | "3:4" | "9:16"; resolution: "1K" | "2K"; model: GeminiModel }
): DesignConfig => {
  return {
    prompt: globalPrompt,
    referenceImages: sessionConfig.referenceImages,
    aspectRatio: sessionConfig.aspectRatio,
    resolution: sessionConfig.resolution,
    model: sessionConfig.model
  };
};
