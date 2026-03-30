export interface GeneratedImage {
  url: string;
  prompt: string;
}

export enum AppState {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export type GeminiModel = 'gemini-2.5-flash-image' | 'gemini-3.1-flash-image-preview' | 'gemini-3-pro-image-preview';

export const GEMINI_MODELS: { id: GeminiModel; name: string; description: string }[] = [
  { id: 'gemini-2.5-flash-image', name: 'Nano', description: 'Fast & affordable' },
  { id: 'gemini-3.1-flash-image-preview', name: 'Nano 2', description: 'Latest & better' },
  { id: 'gemini-3-pro-image-preview', name: 'Pro', description: 'Highest quality' }
];

export interface DesignConfig {
  prompt: string;
  referenceImages: File[];
  aspectRatio: "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "2:3" | "21:9" | "9:21";
  resolution: "1K" | "2K" | "4K";
  model?: GeminiModel;
  batchPrompts?: string[];
}

export interface GlobalPromptSession {
  prompt: string;
  referenceImages: File[];
  aspectRatio: "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "2:3" | "21:9" | "9:21";
  resolution: "1K" | "2K" | "4K";
  model: GeminiModel;
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio: AIStudio;
  }
}
