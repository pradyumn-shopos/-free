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

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const attemptGenerate = async (
  ai: GoogleGenAI,
  model: GeminiModel,
  parts: Part[],
  config: DesignConfig
): Promise<string> => {
  const requestConfig: any = {
    responseModalities: ['TEXT', 'IMAGE'],
    imageConfig: {
      aspectRatio: config.aspectRatio,
      imageSize: config.resolution,
    },
  };

  const response = await ai.models.generateContent({
    model,
    contents: { parts },
    config: requestConfig,
  });

  // Check for prompt-level blocks
  if (response.promptFeedback?.blockReason) {
    const reason = response.promptFeedback.blockReason;
    throw new Error(`Prompt blocked (${reason}). Try rephrasing your request.`);
  }

  const candidate = response.candidates?.[0];
  const finishReason = candidate?.finishReason as string | undefined;

  // Transient errors worth retrying
  if (finishReason === 'IMAGE_OTHER') {
    throw new RetryableError('Transient API error (IMAGE_OTHER). Retrying...');
  }

  // Safety block — not retryable, user must rephrase
  if (finishReason === 'IMAGE_SAFETY') {
    throw new Error('Image blocked by safety filter. Try a different prompt or subject.');
  }

  // Extract image from response parts
  if (candidate?.content?.parts) {
    for (const part of candidate.content.parts) {
      if (part.inlineData?.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }

  console.error("Full response:", JSON.stringify(response, null, 2));
  throw new RetryableError(`No image in response (finishReason: ${finishReason ?? 'unknown'}). Retrying...`);
};

class RetryableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RetryableError';
  }
}

const generateSingleImage = async (
  config: DesignConfig,
  model: GeminiModel,
  prompt: string,
  maxRetries = 3
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  const parts: Part[] = [];

  if (config.referenceImages && config.referenceImages.length > 0) {
    for (const file of config.referenceImages) {
      parts.push(await fileToPart(file));
    }
  }

  const enhancedPrompt = `
    Generate a photorealistic, high-quality image based on the user's request.

    User Request: ${prompt}

    ${config.referenceImages?.length > 0 ? 'Use the provided reference images as visual inspiration for style, colors, and composition.' : ''}

    The image should be professional and high definition.
  `;
  parts.push({ text: enhancedPrompt });

  let lastError: Error = new Error('Unknown error');

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await attemptGenerate(ai, model, parts, config);
    } catch (error: any) {
      lastError = error;
      console.warn(`Attempt ${attempt}/${maxRetries} failed:`, error.message);

      // Only retry on transient errors or 503s
      const isRetryable =
        error instanceof RetryableError ||
        error?.status === 503 ||
        (error?.status === 429 && attempt < maxRetries);

      if (!isRetryable || attempt === maxRetries) break;

      // Exponential backoff: 2s, 4s, 8s
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`Retrying in ${delay / 1000}s...`);
      await sleep(delay);
    }
  }

  // Surface a clean error message
  if (lastError instanceof RetryableError) {
    throw new Error('Generation failed after retries. The API may be under high load — please try again in a moment.');
  }
  throw lastError;
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
