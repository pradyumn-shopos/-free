import React, { useState, useEffect } from 'react';
import { generateDesign } from './services/geminiService';
import { saveHistoryItem, getHistoryItems, clearHistory, HistoryItem } from './services/historyService';
import { AppState, DesignConfig, GeminiModel, GEMINI_MODELS } from './types';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { 
  Loader2, Shuffle, Image as ImageIcon, Sparkles, X, Maximize2, 
  Layers, Zap, Save, Download, ArrowRight, Menu, Check, Trash2, History,
  Archive, ChevronLeft, ChevronRight, ArrowDown
} from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "2:3">("16:9");
  const [resolution, setResolution] = useState<"1K" | "2K" | "4K">("2K");
  const [model, setModel] = useState<GeminiModel>('gemini-2.5-flash-image');
  
  const [isBatchMode, setIsBatchMode] = useState<boolean>(false);
  const [batchCount, setBatchCount] = useState<number>(4);
  const [batchPrompts, setBatchPrompts] = useState<string[]>(['', '', '', '']);
  const [batchImages, setBatchImages] = useState<{ prompt: string; images: File[] }[]>([]);
  const [smartBatchText, setSmartBatchText] = useState<string>('');
  
  const [prompt, setPrompt] = useState('');
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  const [generatedImageUrls, setGeneratedImageUrls] = useState<string[]>([]);
  const [generatedImagePrompts, setGeneratedImagePrompts] = useState<string[]>([]);
  const [activePreviewIndex, setActivePreviewIndex] = useState<number | null>(null);
  const [activePreviewPrompt, setActivePreviewPrompt] = useState<string | null>(null);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  // Pastel Light Theme Colors (from your provided HTML)
  const theme = {
    bg: '#fef9f1',
    text: '#1d1c17',
    muted: '#7f7663',
    surface: '#f2ede5',
    border: '#d1c5af',
    primary: '#755b00',
    primaryLight: '#c9a227',
    onPrimary: '#ffffff'
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activePreviewIndex === null) return;
      if (e.key === 'ArrowRight' && activePreviewIndex < generatedImageUrls.length - 1) {
        setActivePreviewIndex(prev => prev! + 1);
        setActivePreviewPrompt(isBatchMode ? batchPrompts[activePreviewIndex + 1] : prompt);
      } else if (e.key === 'ArrowLeft' && activePreviewIndex > 0) {
        setActivePreviewIndex(prev => prev! - 1);
        setActivePreviewPrompt(isBatchMode ? batchPrompts[activePreviewIndex - 1] : prompt);
      } else if (e.key === 'Escape') {
        setActivePreviewIndex(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePreviewIndex, generatedImageUrls, isBatchMode, batchPrompts, prompt]);

  useEffect(() => {
    if (batchImages.length !== batchCount) {
      setBatchImages(Array(batchCount).fill(null).map((_, i) => batchImages[i] || { prompt: '', images: [] }));
    }
  }, [batchCount]);

  useEffect(() => {
    if (referenceImages.length === 0) {
      setPreviewUrls([]);
      return;
    }
    const urls = referenceImages.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [referenceImages]);

  useEffect(() => {
    getHistoryItems().then(setHistoryItems);
  }, []);

  // Persist draft prompt across page refreshes
  useEffect(() => {
    const saved = localStorage.getItem('draft_prompt');
    if (saved) setPrompt(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem('draft_prompt', prompt);
  }, [prompt]);

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Refresh history when reconnecting — may have partial saves from before the drop
      getHistoryItems().then(setHistoryItems);
    };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleBatchCountChange = (newCount: number) => {
    if (newCount < 1 || newCount > 20) return;
    setBatchCount(newCount);
    setBatchPrompts(prev => {
      const updated = [...prev];
      while (updated.length < newCount) updated.push('');
      return updated.slice(0, newCount);
    });
  };

  const handleSmartSplit = () => {
    if (!smartBatchText.trim()) return;
    
    let blocks = [];
    const listStarterRegex = /(?=^\s*(?:#+\s*)?(?:\**\d+\**[\.\)]|[-*])\s)/m;

    if (listStarterRegex.test(smartBatchText)) {
      blocks = smartBatchText.split(listStarterRegex);
    } else if (/\n\s*\n/.test(smartBatchText)) {
      blocks = smartBatchText.split(/\n\s*\n/);
    } else {
      blocks = smartBatchText.split('\n');
    }

    const parsedPrompts = blocks
      .map(block => {
        let b = block.trim();
        // Remove list numbering at the very beginning of the block (e.g. "### 1. ", "1. ", "- ")
        b = b.replace(/^\s*(?:#+\s*)?(?:\**\d+\**[\.\)]|[-*])\s*/, '');
        // Remove LLM prefix text like "> **Prompt:**" or "Prompt:" anywhere in the block
        b = b.replace(/(?:^|\n)[>\s]*\**Prompt:\**\s*/gi, ' ');
        // Remove LLM placeholders like "[Link to Ref Image]"
        b = b.replace(/`?\[Link to [^\]]+\]`?\s*/gi, '');
        // Join newlines within the same prompt so they aren't split
        b = b.replace(/\s*\n\s*/g, ' ');
        // Cleanup extra spaces
        b = b.replace(/\s{2,}/g, ' ');
        return b.trim();
      })
      .filter(b => b.length > 0);

    if (parsedPrompts.length === 0) return;

    const limitedPrompts = parsedPrompts.slice(0, 20);
    
    setBatchCount(limitedPrompts.length);
    setBatchPrompts(prev => {
      const newPrompts = [...limitedPrompts];
      while (newPrompts.length < limitedPrompts.length) newPrompts.push('');
      return newPrompts;
    });
    
    setSmartBatchText('');
  };

  const updateBatchPrompt = (index: number, value: string) => {
    const newPrompts = [...batchPrompts];
    newPrompts[index] = value;
    setBatchPrompts(newPrompts);
  };

  const handleBatchImageUpload = (index: number, files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    setBatchImages(prev => {
      const updated = [...prev];
      if (!updated[index]) updated[index] = { prompt: batchPrompts[index], images: [] };
      updated[index].images = [...(updated[index].images || []), ...newFiles];
      return updated;
    });
  };

  const removeBatchImage = (batchIndex: number, imageIndex: number) => {
    setBatchImages(prev => {
      const updated = [...prev];
      if (updated[batchIndex]) {
        updated[batchIndex].images = updated[batchIndex].images.filter((_, i) => i !== imageIndex);
      }
      return updated;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setReferenceImages(prev => [...prev, ...newFiles]);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    setReferenceImages(prev => prev.filter((_, i) => i !== index));
  };

  // Fixed Base Image Logic
  const useAsBaseImage = async (imageUrl: string) => {
    try {
      // Convert base64 data URL to a Blob
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const file = new File([blob], `base-${Date.now()}.png`, { type: 'image/png' });
      
      setReferenceImages(prev => [...prev, file]);
      
      // Close modal if open
      setActivePreviewIndex(null);
      setIsHistoryOpen(false);
      
      // Scroll to top so user sees the reference was added to the sidebar
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      console.error("Failed to load base image", e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let prompts: string[] = [];
    let allImages: File[][] = [];
    
    if (isBatchMode) {
      prompts = batchPrompts.slice(0, batchCount).filter(p => p.trim());
      allImages = batchImages.slice(0, batchCount).map(b => b.images || []);
      // Prepend shared references
      allImages = allImages.map(imgs => [...referenceImages, ...imgs]);
    } else {
      prompts = [prompt];
      allImages = [referenceImages];
    }
    
    if (prompts.length === 0 || !prompts[0].trim()) return;

    setAppState(AppState.GENERATING);
    setError(null);

    // Hoist results outside try so partial batch saves are accessible on failure
    const results: string[] = [];

    try {
      const config: DesignConfig = {
        prompt: prompt,
        referenceImages: [],
        aspectRatio,
        resolution,
        model,
        batchPrompts: prompts
      };

      const promptsWithImages = prompts.map((p, i) => ({
        prompt: p,
        images: allImages[i] || []
      }));

      for (const { prompt: p, images: imgs } of promptsWithImages) {
        const imgConfig = { ...config, prompt: p, referenceImages: imgs, batchPrompts: undefined };
        const urls = await generateDesign(imgConfig);

        for (const url of urls) {
          const item: HistoryItem = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            prompt: p,
            url: url,
            timestamp: Date.now()
          };
          await saveHistoryItem(item);
          results.push(url);
        }
      }

      setGeneratedImageUrls(results);
      setGeneratedImagePrompts(prompts);
      setAppState(AppState.COMPLETE);
      getHistoryItems().then(setHistoryItems);

    } catch (err: any) {
      console.error(err);
      // Always refresh history — partial saves from before the failure are already in IndexedDB
      getHistoryItems().then(setHistoryItems);

      if (results.length > 0) {
        // Show whatever was generated before the failure
        setGeneratedImageUrls(results);
        setGeneratedImagePrompts(prompts.slice(0, results.length));
        setAppState(AppState.COMPLETE);
        setError(`${results.length} of ${prompts.length} images generated. ${err.message || 'Remaining failed.'}`);
      } else {
        setError(err.message || "Something went wrong.");
        setAppState(AppState.ERROR);
      }
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setGeneratedImageUrls([]);
    setGeneratedImagePrompts([]);
    setError(null);
  };

  const downloadAll = async () => {
    if (generatedImageUrls.length === 0) return;
    
    if (generatedImageUrls.length === 1) {
      downloadImage(generatedImageUrls[0], 0);
      return;
    }

    setAppState(AppState.GENERATING); // Re-use spinner for ZIP
    try {
      const zip = new JSZip();
      
      // Fetch all images and add to ZIP
      for (let i = 0; i < generatedImageUrls.length; i++) {
        const response = await fetch(generatedImageUrls[i]);
        const blob = await response.blob();
        
        // Create descriptive filename from prompt
        const promptText = generatedImagePrompts[i] || prompt;
        const sanitizedPrompt = promptText.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase();
        
        const folderName = `variation_${String(i + 1).padStart(2, '0')}`;
        zip.file(`${folderName}/image_${sanitizedPrompt}.png`, blob);
        
        // Also save the prompt as a text file for reference
        zip.file(`${folderName}/prompt.txt`, promptText);
      }
      
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `shopos-batch-${Date.now()}.zip`);
    } catch (err) {
      console.error('Error creating ZIP:', err);
      setError('Failed to create ZIP file.');
    }
    setAppState(AppState.COMPLETE);
  };

  const downloadImage = (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `shopos-${Date.now()}-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearHistory = async () => {
    await clearHistory();
    setHistoryItems([]);
  };

  const getAspectRatioClass = (ratio: string) => {
    switch(ratio) {
      case '1:1': return 'aspect-square';
      case '16:9': return 'aspect-video';
      case '9:16': return 'aspect-[9/16]';
      case '4:3': return 'aspect-[4/3]';
      case '3:4': return 'aspect-[3/4]';
      case '2:3': return 'aspect-[2/3]';
      default: return 'aspect-square';
    }
  };

  return (
    <div className="min-h-screen font-['Manrope',_sans-serif] selection:bg-[#755b00] selection:text-[#ffffff]" style={{ backgroundColor: theme.bg, color: theme.text }}>
      
      {/* Top Navigation Bar */}
      <header className="fixed top-0 z-40 w-full border-b backdrop-blur-xl" style={{ backgroundColor: `${theme.bg}e6`, borderColor: `${theme.border}80` }}>
        <div className="flex justify-between items-center w-full px-8 py-5 max-w-[1440px] mx-auto font-['Noto_Serif',_serif] antialiased tracking-tight">
          <div className="text-2xl font-serif lowercase" style={{ color: theme.text }}>
            ✧ Way Better ShopOS
          </div>
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border transition-colors font-sans text-xs uppercase tracking-widest font-bold"
              style={{ borderColor: theme.border, color: theme.muted, backgroundColor: theme.surface }}
            >
              <History className="w-4 h-4" />
              History
            </button>
          </div>
        </div>
      </header>

      {/* Offline Banner */}
      {!isOnline && (
        <div className="fixed top-[72px] inset-x-0 z-30 flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-widest" style={{ backgroundColor: '#1d1c17', color: '#fef9f1' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          You're offline — generations will resume when connection is restored. History is safe.
        </div>
      )}

      {/* Main Workspace */}
      <main className={`pb-12 px-6 lg:px-12 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 ${isOnline ? 'pt-28' : 'pt-40'}`}>
        
        {/* Sidebar Controls */}
        <aside className="lg:col-span-3 space-y-10">
          
          {/* Generation Mode */}
          <div className="space-y-4">
              <label className="text-[0.6875rem] uppercase tracking-[0.15rem] font-bold" style={{ color: theme.muted }}>Mode</label>
            <div className="flex p-1 rounded-lg border" style={{ backgroundColor: theme.surface, borderColor: `${theme.border}80` }}>
              <button 
                onClick={() => setIsBatchMode(false)}
                className="flex-1 py-2.5 px-4 text-xs font-bold rounded shadow-sm transition-all"
                style={{ 
                  backgroundColor: !isBatchMode ? theme.primary : 'transparent', 
                  color: !isBatchMode ? theme.onPrimary : theme.muted 
                }}
              >
                SINGLE
              </button>
              <button 
                onClick={() => setIsBatchMode(true)}
                className="flex-1 py-2.5 px-4 text-xs font-bold rounded transition-all flex items-center justify-center gap-2"
                style={{ 
                  backgroundColor: isBatchMode ? theme.primary : 'transparent', 
                  color: isBatchMode ? theme.onPrimary : theme.muted 
                }}
              >
                BATCH <span className="opacity-70 text-[10px]" style={{ backgroundColor: isBatchMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: '999px' }}>({batchCount})</span>
              </button>
            </div>

            {isBatchMode && (
              <div className="flex items-center justify-between px-2 pt-2 pb-1">
                <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: theme.muted }}>Variations</span>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => handleBatchCountChange(batchCount - 1)} className="w-6 h-6 flex items-center justify-center rounded-full border text-xs font-bold hover:opacity-70" style={{ borderColor: theme.border, color: theme.text }}>-</button>
                  <span className="text-sm font-bold w-4 text-center">{batchCount}</span>
                  <button type="button" onClick={() => handleBatchCountChange(batchCount + 1)} className="w-6 h-6 flex items-center justify-center rounded-full border text-xs font-bold hover:opacity-70" style={{ borderColor: theme.border, color: theme.text }}>+</button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-8">
            {/* Aspect Ratio */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-[0.6875rem] uppercase tracking-[0.15rem] font-bold" style={{ color: theme.muted }}>Aspect Ratio</label>
                <span className="text-[10px] font-bold" style={{ color: theme.primary }}>{aspectRatio}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(["1:1", "16:9", "9:16", "4:3", "3:4", "2:3"] as const).map(ratio => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className="py-2.5 border rounded text-xs font-bold tracking-widest transition-colors"
                    style={{ 
                      borderColor: aspectRatio === ratio ? theme.primaryLight : theme.border, 
                      backgroundColor: aspectRatio === ratio ? `${theme.primaryLight}20` : 'transparent',
                      color: aspectRatio === ratio ? theme.primary : theme.text 
                    }}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* Model Architecture */}
            <div className="space-y-4">
              <label className="text-[0.6875rem] uppercase tracking-[0.15rem] font-bold" style={{ color: theme.muted }}>Model</label>
              <div className="space-y-2">
                {GEMINI_MODELS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setModel(m.id)}
                    className="w-full flex justify-between items-center px-4 py-3 border rounded-lg transition-all"
                    style={{ 
                      backgroundColor: model === m.id ? `${theme.primaryLight}15` : theme.surface, 
                      borderColor: model === m.id ? theme.primaryLight : `${theme.border}80`,
                      color: model === m.id ? theme.primary : theme.text
                    }}
                  >
                    <span className="text-sm font-medium">✦ {m.name}</span>
                    {model === m.id && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Output Quality */}
            <div className="space-y-4">
              <label className="text-[0.6875rem] uppercase tracking-[0.15rem] font-bold" style={{ color: theme.muted }}>Quality</label>
              <div className="flex gap-2">
                {(["1K", "2K", "4K"] as const).map(res => (
                  <button
                    key={res}
                    onClick={() => setResolution(res)}
                    className="flex-1 py-2 border rounded text-xs font-bold transition-colors"
                    style={{ 
                      borderColor: resolution === res ? theme.primaryLight : theme.border, 
                      backgroundColor: resolution === res ? `${theme.primaryLight}20` : 'transparent',
                      color: resolution === res ? theme.primary : theme.text 
                    }}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>

            {/* Global Visual Reference */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-[0.6875rem] uppercase tracking-[0.15rem] font-bold" style={{ color: theme.muted }}>Base images</label>
                {previewUrls.length > 0 && <span className="text-[10px] font-bold" style={{ color: theme.primary }}>{previewUrls.length} Files</span>}
              </div>
              
              <label className="group relative aspect-video border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
                <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                <ImageIcon className="w-8 h-8 mb-2 transition-colors" style={{ color: theme.muted }} />
                <span className="text-[10px] uppercase tracking-widest transition-colors font-bold" style={{ color: theme.muted }}>Upload Base Image</span>
              </label>

              {previewUrls.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {previewUrls.map((url, idx) => (
                    <div key={idx} className="relative w-14 h-14 rounded-lg overflow-hidden border group/ref" style={{ borderColor: theme.border }}>
                      <img src={url} alt="Ref" className="w-full h-full object-cover" />
                      <button onClick={handleRemoveImage(idx)} className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover/ref:opacity-100 transition-opacity">
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </aside>

        {/* Main Workspace (lg:col-span-9) */}
        <section className="lg:col-span-9 space-y-12">
          
          {error && (
            <div className="px-6 py-4 rounded-xl text-sm font-medium flex items-center gap-3" style={{ backgroundColor: '#ffdad6', color: '#93000a', border: '1px solid #ffb3b3' }}>
              {error}
            </div>
          )}

          {/* Prompt Section */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {isBatchMode ? (
              <div className="space-y-6">
                <div className="border rounded-2xl p-6 shadow-sm relative overflow-hidden" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: theme.primary }}>Bulk Prompt Splitter (Optional)</span>
                    <span className="text-[10px] font-bold" style={{ color: theme.muted }}>Paste a list of prompts to instantly create multiple variations</span>
                  </div>
                  <textarea
                    value={smartBatchText}
                    onChange={(e) => setSmartBatchText(e.target.value)}
                    className="w-full bg-transparent border focus:ring-0 text-sm font-serif p-4 min-h-[120px] rounded-xl resize-y leading-relaxed outline-none transition-colors"
                    placeholder="1. A minimalist Tokyo home office with neon lighting\n2. A cyberpunk alleyway cafe\n3. A brutalist concrete studio"
                    style={{ borderColor: `${theme.border}80`, color: theme.text }}
                  />
                  <div className="flex justify-end mt-4">
                    <button 
                      type="button" 
                      onClick={handleSmartSplit}
                      disabled={!smartBatchText.trim()}
                      className="px-4 py-2 rounded-lg font-bold uppercase tracking-wider text-[10px] shadow-sm transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2 active:scale-95 hover:brightness-110"
                      style={{ backgroundColor: theme.primary, color: theme.onPrimary }}
                    >
                      Split into Variations <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array(batchCount).fill(null).map((_, idx) => (
                  <div key={idx} className="border rounded-2xl p-6 transition-colors flex flex-col shadow-sm" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: theme.muted }}>Variation {idx + 1}</span>
                    </div>
                    <textarea
                      value={batchPrompts[idx] || ''}
                      onChange={(e) => updateBatchPrompt(idx, e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 text-lg font-serif min-h-[120px] resize-none leading-relaxed outline-none"
                      placeholder="Describe this variation..."
                      style={{ color: theme.text }}
                    />
                    
                    <div className="mt-auto pt-4 flex items-center gap-3 border-t" style={{ borderColor: `${theme.border}80` }}>
                      <label className="text-[10px] uppercase tracking-widest cursor-pointer flex items-center gap-1.5 font-bold transition-colors hover:opacity-70" style={{ color: theme.muted }}>
                        <input type="file" accept="image/*" multiple onChange={(e) => handleBatchImageUpload(idx, e.target.files)} className="hidden" />
                        <ImageIcon className="w-3.5 h-3.5" /> 
                        {batchImages[idx]?.images?.length > 0 ? `Refs (${batchImages[idx].images.length})` : 'Add Ref'}
                      </label>

                      {batchImages[idx]?.images && batchImages[idx].images.length > 0 && (
                        <div className="flex gap-1.5 ml-auto">
                          {batchImages[idx].images.map((f, i) => (
                            <div key={i} className="w-8 h-8 rounded overflow-hidden relative group/img border" style={{ borderColor: theme.border }}>
                              <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                              <button type="button" onClick={() => removeBatchImage(idx, i)} className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover/img:opacity-100"><X className="w-3 h-3 text-white" /></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              </div>
            ) : (
              <div className="relative">
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full border focus:ring-0 text-xl md:text-2xl font-serif p-8 pb-10 min-h-[180px] rounded-2xl resize-none leading-relaxed outline-none shadow-sm transition-colors" 
                  placeholder="Describe your ideal workspace (e.g., A minimalist Tokyo home office with neon lighting and lots of plants)..."
                  style={{ 
                    backgroundColor: theme.surface, 
                    borderColor: prompt ? theme.primaryLight : theme.border,
                    color: theme.text 
                  }}
                />
              </div>
            )}

            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={!isOnline || appState === AppState.GENERATING || (!isBatchMode && !prompt.trim()) || (isBatchMode && !batchPrompts.some(p => p.trim()))}
                className="px-10 py-4 rounded-full font-bold uppercase tracking-[0.2rem] text-sm shadow-xl transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-3 active:scale-95"
                style={{ backgroundColor: theme.primary, color: theme.onPrimary }}
              >
                {appState === AppState.GENERATING ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</> : <>{isBatchMode ? `Generate ${batchCount} Variations ✧` : 'Generate Design ✧'}</>}
              </button>
            </div>
          </form>

          {/* Results Area */}
          {appState === AppState.COMPLETE && generatedImageUrls.length > 0 && (
            <div className="space-y-8 pt-8 border-t" style={{ borderColor: theme.border }}>
              <div className="flex justify-between items-end pb-4 border-b" style={{ borderColor: `${theme.border}80` }}>
                <h2 className="font-serif text-2xl tracking-tight" style={{ color: theme.text }}>Your Design Variations</h2>
                {isBatchMode && generatedImageUrls.length > 1 && (
                  <button onClick={downloadAll} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1d1c17] text-[#fef9f1] text-[10px] font-bold uppercase tracking-widest hover:bg-[#ecc246] transition-colors shadow-sm">
                    <Archive className="w-3.5 h-3.5" /> Download all (.ZIP)
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {generatedImageUrls.map((url, idx) => (
                  <div key={idx} className="relative group overflow-hidden rounded-xl border shadow-md" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                    <div className={getAspectRatioClass(aspectRatio)}>
                      <img 
                        src={url} 
                        alt={`Generated ${idx}`} 
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 cursor-zoom-in"
                        onClick={() => { setActivePreviewIndex(idx); setActivePreviewPrompt(isBatchMode ? batchPrompts[idx] : prompt); }}
                      />
                    </div>
                    
                    {/* The problem: the gradient overlay was catching clicks and preventing them from reaching the image underneath. Add pointer-events-none so clicks pass through to the image */}
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                      <div className="flex justify-between items-center pointer-events-auto">
                        <div className="flex space-x-2">
                          <button onClick={(e) => { e.stopPropagation(); downloadImage(url, idx); }} className="bg-white/20 backdrop-blur-sm text-white p-2.5 rounded-full hover:bg-white/40 transition-colors" title="Download">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); useAsBaseImage(url); }} 
                          className="bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase px-4 py-2.5 rounded-full tracking-widest hover:bg-white/40 transition-colors flex items-center gap-2 text-white border border-white/30"
                        >Use as Reference</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </section>
      </main>

      {/* History Side Drawer */}
      <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isHistoryOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsHistoryOpen(false)} />
        <div className={`absolute top-0 right-0 h-full w-full sm:w-[400px] border-l shadow-2xl flex flex-col transform transition-transform duration-300 ${isHistoryOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{ backgroundColor: theme.bg, borderColor: theme.border }}>
          <div className="p-6 border-b flex justify-between items-center" style={{ borderColor: theme.border }}>
            <h3 className="font-serif text-xl tracking-wide" style={{ color: theme.text }}>Library</h3>
            <div className="flex items-center gap-4">
              <button onClick={handleClearHistory} className="text-red-600 hover:text-red-800 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Clear History
              </button>
              <button onClick={() => setIsHistoryOpen(false)} className="hover:opacity-70 transition-colors" style={{ color: theme.text }}>
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ scrollbarWidth: 'none' }}>
            {historyItems.length === 0 ? (
              <div className="text-center py-20" style={{ color: theme.muted }}>
                <History className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-sm font-bold uppercase tracking-widest">Your gallery is empty</p>\n                <p className="text-xs mt-2 opacity-70">Generate your first design to see it here.</p>
              </div>
            ) : (
              historyItems.map((item) => (
                <div key={item.id} className="border rounded-xl overflow-hidden group shadow-sm" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                  <div className="aspect-video relative">
                    <img src={item.url} className="w-full h-full object-cover" alt="History" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button onClick={() => { setActivePreviewIndex(historyItems.findIndex(i => i.id === item.id)); setActivePreviewPrompt(item.prompt); setIsHistoryOpen(false); }} className="bg-white/90 hover:bg-white text-black p-2.5 rounded-full transition-colors shadow-lg">
                        <Maximize2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => useAsBaseImage(item.url)} className="bg-white/90 hover:bg-white text-black p-2.5 rounded-full transition-colors shadow-lg" title="Use as Base">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-xs line-clamp-2 italic font-serif opacity-90 mb-2" style={{ color: theme.text }}>"{item.prompt}"</p>
                    <p className="text-[9px] uppercase tracking-widest font-bold" style={{ color: theme.muted }}>
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Preview Modal (Light Theme Glass) */}
      {activePreviewIndex !== null && (
        <div 
          className="fixed inset-0 z-[100] backdrop-blur-2xl flex items-center justify-center p-4 sm:p-8 opacity-0 animate-[fadeIn_0.3s_ease-out_forwards]" 
          style={{ backgroundColor: 'rgba(254, 249, 241, 0.85)' }} 
          onClick={() => setActivePreviewIndex(null)}
        >
          <div 
            className="max-w-[1600px] w-full h-[90vh] grid grid-cols-1 lg:grid-cols-12 rounded-[2rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.15)] border transform scale-95 animate-[scaleIn_0.4s_cubic-bezier(0.16,1,0.3,1)_forwards] relative" 
            style={{ backgroundColor: theme.surface, borderColor: theme.border }} 
            onClick={e => e.stopPropagation()}
          >
            
            <div className="lg:col-span-8 flex items-center justify-center relative p-8 bg-[#f8f5f0] h-[90vh] overflow-hidden group">
              <img 
                src={generatedImageUrls[activePreviewIndex] || historyItems[activePreviewIndex]?.url} 
                alt="Preview" 
                className="w-full h-full object-contain filter drop-shadow-2xl transition-transform duration-[1.5s] ease-out hover:scale-[1.02]" 
              />
              <button 
                onClick={() => setActivePreviewIndex(null)} 
                className="absolute top-8 left-8 bg-white/70 hover:bg-white p-3 rounded-full backdrop-blur-xl transition-all duration-300 shadow-md text-black hover:scale-110 hover:rotate-90 z-10"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Arrow Controls */}
              {isBatchMode && activePreviewIndex > 0 && (
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setActivePreviewIndex(activePreviewIndex - 1); 
                    setActivePreviewPrompt(batchPrompts[activePreviewIndex - 1]);
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-4 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                >
                  <ChevronLeft className="w-8 h-8 text-black" />
                </button>
              )}
              {isBatchMode && activePreviewIndex < generatedImageUrls.length - 1 && (
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setActivePreviewIndex(activePreviewIndex + 1); 
                    setActivePreviewPrompt(batchPrompts[activePreviewIndex + 1]);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-4 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                >
                  <ChevronRight className="w-8 h-8 text-black" />
                </button>
              )}
            </div>
            
            <div className="lg:col-span-4 p-10 flex flex-col justify-between border-l h-full overflow-y-auto" style={{ backgroundColor: theme.bg, borderColor: theme.border }}>
              <div className="space-y-10">
                <div className="space-y-4">
                  <label className="text-[0.6875rem] uppercase tracking-[0.2em] font-bold" style={{ color: theme.primary }}>Prompt</label>
                  <p className="font-serif text-xl italic leading-relaxed" style={{ color: theme.text }}>
                    "{activePreviewPrompt}"
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-8 pt-8 border-t" style={{ borderColor: theme.border }}>
                  <div>
                    <label className="text-[0.6875rem] uppercase tracking-widest font-bold block mb-2" style={{ color: theme.muted }}>Model</label>
                    <span className="text-base font-bold uppercase tracking-wider" style={{ color: theme.text }}>{GEMINI_MODELS.find(m => m.id === model)?.name || 'Nano'}</span>
                  </div>
                  <div>
                    <label className="text-[0.6875rem] uppercase tracking-widest font-bold block mb-2" style={{ color: theme.muted }}>Quality</label>
                    <span className="text-base font-bold uppercase tracking-wider" style={{ color: theme.text }}>{resolution}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-4 mt-12 pt-8 border-t" style={{ borderColor: theme.border }}>
                <button onClick={() => downloadImage(generatedImageUrls[activePreviewIndex] || historyItems[activePreviewIndex]?.url, 0)} className="w-full py-5 font-bold uppercase tracking-widest text-xs rounded-2xl transition-all duration-300 shadow-lg flex justify-center items-center gap-3 hover:-translate-y-1 hover:shadow-xl" style={{ backgroundColor: theme.primary, color: theme.onPrimary }}>
                  <Download className="w-5 h-5" /> Download
                </button>
                <button onClick={() => { useAsBaseImage(generatedImageUrls[activePreviewIndex] || historyItems[activePreviewIndex]?.url); setActivePreviewIndex(null); }} className="w-full border-2 py-5 font-bold uppercase tracking-widest text-xs rounded-2xl transition-all duration-300 flex justify-center items-center gap-3 hover:bg-[#1d1c17] hover:text-[#fef9f1] hover:border-[#1d1c17]" style={{ borderColor: theme.text, color: theme.text }}>
                  <ArrowRight className="w-5 h-5" /> Use as base
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
