import React, { useState, useEffect } from 'react';
import { DesignResult } from './components/DesignResult';
import { ApiKeyPrompt } from './components/ApiKeyPrompt';
import { generateDesign } from './services/geminiService';
import { AppState, DesignConfig } from './types';
import { Wand2, Loader2, Shuffle, Image as ImageIcon, Sparkles, X, Maximize2 } from 'lucide-react';
import { ImagePreviewModal } from './components/ImagePreviewModal';

import { Login } from './components/Login';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('site_auth') === 'true';
  });
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Design Configuration State
  const [prompt, setPrompt] = useState('');
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "4:3" | "1:1" | "3:4" | "9:16">("16:9");
  const [resolution, setResolution] = useState<"1K" | "2K">("2K");

  // Generated Result
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [activePreviewUrl, setActivePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      checkKeyStatus();
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('site_auth', 'true');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  useEffect(() => {
    if (referenceImages.length === 0) {
      setPreviewUrls([]);
      return;
    }
    const urls = referenceImages.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [referenceImages]);

  const checkKeyStatus = async () => {
    try {
      const apiKey = import.meta.env.VITE_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
      if (apiKey) {
        setHasKey(true);
        return;
      }
      if (window.aistudio) {
        const status = await window.aistudio.hasSelectedApiKey();
        setHasKey(status);
      }
    } catch (e) {
      console.error("Failed to check API key status", e);
    }
  };

  const handleSelectKey = async () => {
    try {
      await window.aistudio.openSelectKey();
      setHasKey(true);
    } catch (e) {
      console.error("Failed to select API key", e);
      setHasKey(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setAppState(AppState.GENERATING);
    setError(null);

    try {
      const config: DesignConfig = {
        prompt,
        referenceImages,
        aspectRatio,
        resolution
      };

      const imageUrl = await generateDesign(config);
      setGeneratedImageUrl(imageUrl);
      setAppState(AppState.COMPLETE);

    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes("Requested entity was not found")) {
        setHasKey(false);
        setError("API Key verification failed. Please select your key again.");
      } else {
        setError(err.message || "Something went wrong while generating the design.");
      }
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setGeneratedImageUrl(null);
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      console.log("Files selected:", e.target.files.length);
      const newFiles = Array.from(e.target.files);
      setReferenceImages(prev => {
        console.log("Adding files to state. Previous count:", prev.length);
        return [...prev, ...newFiles];
      });
      // Reset input value to allow selecting the same file again if needed
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setReferenceImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-salmon flex flex-col items-center justify-center p-4 selection:bg-black selection:text-white overflow-hidden">
      <ImagePreviewModal imageUrl={activePreviewUrl} onClose={() => setActivePreviewUrl(null)} />
      {!hasKey && <ApiKeyPrompt onSelectKey={handleSelectKey} />}

      <div className="max-w-4xl w-full flex flex-col items-center relative z-10">

        {/* Title Section */}
        <h1 className="text-6xl md:text-8xl font-display text-white text-stroke tracking-tighter text-center mb-8 transform -rotate-2">
          ✦ free
        </h1>



        {/* Main Card */}
        {appState === AppState.COMPLETE && generatedImageUrl ? (
          <DesignResult
            imageUrl={generatedImageUrl}
            prompt={prompt}
            referenceImages={referenceImages}
            onReset={handleReset}
            onRegenerate={() => handleSubmit({ preventDefault: () => { } } as React.FormEvent)}
          />
        ) : (
          <form onSubmit={handleSubmit} className="w-full relative">
            <div className="bg-white neo-border neo-shadow-lg p-0 flex flex-col md:flex-row min-h-[250px]">

              {/* Input Area */}
              <div className="flex-1 p-6 relative flex flex-col">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the image you want to generate... (e.g. A cyberpunk city at night)"
                  className="w-full h-full min-h-[150px] resize-none outline-none text-xl font-bold font-mono text-gray-700 placeholder-gray-300 bg-transparent mb-4"
                />

                {/* Config Controls */}
                <div className="flex flex-wrap gap-4 mb-2">
                  <div className="flex bg-white neo-border">
                    {(["16:9", "4:3", "1:1", "3:4", "9:16"] as const).map((ratio) => (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => setAspectRatio(ratio)}
                        className={`px-3 py-1 font-bold text-xs border-r last:border-r-0 border-black transition-colors ${aspectRatio === ratio ? 'bg-black text-white' : 'text-black hover:bg-gray-100'
                          }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>

                  <div className="flex bg-white neo-border">
                    {(["1K", "2K"] as const).map((res) => (
                      <button
                        key={res}
                        type="button"
                        onClick={() => setResolution(res)}
                        className={`px-3 py-1 font-bold text-xs border-r last:border-r-0 border-black transition-colors ${resolution === res ? 'bg-black text-white' : 'text-black hover:bg-gray-100'
                          }`}
                      >
                        {res}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 mt-4">
                  <div className="relative group">
                    <button type="button" className={`relative flex items-center justify-center bg-white neo-border hover:bg-gray-100 transition-colors font-bold text-sm uppercase text-black overflow-hidden h-12 ${previewUrls.length > 0 ? 'pl-2 pr-10 min-w-[140px]' : 'min-w-[120px]'}`}>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        title={referenceImages.length > 0 ? "Add more images" : "Upload images"}
                      />

                      {previewUrls.length > 0 ? (
                        <div className="flex items-center gap-2 h-full py-1 overflow-x-auto no-scrollbar max-w-[200px]">
                          {previewUrls.map((url, idx) => (
                            <div key={idx} className="relative w-8 h-8 border border-black overflow-hidden bg-gray-100 flex-shrink-0 group/item z-20 cursor-pointer">
                              <img
                                src={url}
                                alt={`Preview ${idx}`}
                                className="w-full h-full object-cover"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setActivePreviewUrl(url);
                                }}
                              />
                              <div
                                onClick={handleRemoveImage(idx)}
                                className="absolute top-0 right-0 w-4 h-4 bg-red-500/80 flex items-center justify-center hidden group-hover/item:flex cursor-pointer z-30"
                              >
                                <X className="w-2.5 h-2.5 text-white" />
                              </div>
                            </div>
                          ))}
                          <div className="w-8 h-8 flex items-center justify-center border border-dashed border-gray-400 text-gray-400 bg-gray-50 flex-shrink-0">
                            <span className="text-xs">+</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-4">
                          <ImageIcon className="w-4 h-4" />
                          <span>Upload</span>
                        </div>
                      )}

                      {/* Clear All Button - Only if images exist */}
                      {previewUrls.length > 0 && (
                        <div
                          role="button"
                          onClick={() => setReferenceImages([])}
                          className="absolute right-0 top-0 bottom-0 w-8 flex items-center justify-center bg-red-50 hover:bg-red-100 border-l border-black z-20 transition-colors"
                          title="Clear all images"
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </div>
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 bg-white neo-border hover:bg-gray-100 transition-colors font-bold text-sm uppercase text-black h-12"
                    onClick={() => {
                      const prompts = [
                        "Futuristic city skyline at sunset",
                        "Serene mountain lake with reflection",
                        "Cyberpunk street food vendor in rain",
                        "Minimalist zen garden with stones"
                      ];
                      setPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
                    }}
                  >
                    <Shuffle className="w-4 h-4" />
                    Random
                  </button>
                </div>
              </div>

              {/* Generate Button */}
              <button
                type="submit"
                disabled={!prompt.trim() || appState === AppState.GENERATING}
                className="w-full md:w-48 bg-black hover:bg-gray-900 text-white font-display text-xl uppercase tracking-wider flex flex-col items-center justify-center p-6 border-l-0 md:border-l-4 border-t-4 md:border-t-0 border-black transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {appState === AppState.GENERATING ? (
                  <>
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <span>Working...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                    <span>Generate</span>
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="absolute -bottom-16 left-0 right-0 bg-red-100 neo-border p-3 text-red-600 font-bold text-center">
                {error}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default App;