import React from 'react';
import { Key, ExternalLink } from 'lucide-react';

interface ApiKeyPromptProps {
  onSelectKey: () => Promise<void>;
}

export const ApiKeyPrompt: React.FC<ApiKeyPromptProps> = ({ onSelectKey }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white neo-border neo-shadow-lg p-8 max-w-md w-full">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-salmon neo-border flex items-center justify-center transform -rotate-3">
            <Key className="w-8 h-8 text-black" />
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-display text-black uppercase tracking-wider">Unlock Design Studio</h2>
            <p className="text-gray-600 font-bold font-mono text-sm leading-relaxed">
              Connect your Google Cloud Project to access the Gemini 3 Pro model.
            </p>
          </div>

          <button
            onClick={onSelectKey}
            className="w-full py-4 px-6 bg-black hover:bg-gray-800 text-white font-display text-lg uppercase tracking-wider neo-border border-black transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-none hover:shadow-lg flex items-center justify-center gap-2"
          >
            Select API Key
          </button>

          <a
            href="https://ai.google.dev/gemini-api/docs/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black flex items-center gap-1 transition-colors border-b-2 border-transparent hover:border-black"
          >
            Billing Info <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};