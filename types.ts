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

export interface DesignConfig {
  prompt: string;
  referenceImages: File[];
  aspectRatio: "16:9" | "4:3" | "1:1" | "3:4" | "9:16";
  resolution: "1K" | "2K";
}

// Augment window for the AI Studio key selection
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio: AIStudio;
  }
}
