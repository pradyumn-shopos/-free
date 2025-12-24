import React, { useEffect, useState } from 'react';
import { Download, RefreshCw, Quote, Image as ImageIcon, Sparkles } from 'lucide-react';

interface DesignResultProps {
  imageUrl: string;
  prompt: string;
  referenceImages: File[];

  onReset: () => void;
  onRegenerate: () => void;
}

export const DesignResult: React.FC<DesignResultProps> = ({
  imageUrl,
  prompt,
  referenceImages,

  onReset,
  onRegenerate
}) => {
  const [refPreviewUrls, setRefPreviewUrls] = useState<string[]>([]);
  const [refRevokeUrls, setRefRevokeUrls] = useState<string[]>([]);

  useEffect(() => {
    if (referenceImages && referenceImages.length > 0) {
      const urls = referenceImages.map(file => URL.createObjectURL(file));
      setRefPreviewUrls(urls);
      // Keep track of created URLs for cleanup
      setRefRevokeUrls(urls);
    } else {
      setRefPreviewUrls([]);
    }
  }, [referenceImages]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      refRevokeUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [refRevokeUrls]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `office-viz-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full animate-in fade-in zoom-in duration-500 space-y-8 max-w-4xl mx-auto">

      {/* Main Result */}
      <div className="relative group p-2 bg-white neo-border neo-shadow-lg transform rotate-1 transition-transform duration-300 hover:rotate-0">
        <div className="absolute -top-4 -right-4 z-10">
          <button
            onClick={handleDownload}
            className="p-3 bg-black hover:bg-gray-800 text-white font-bold transition-all shadow-none hover:shadow-lg flex items-center gap-2 neo-border border-white"
          >
            <Download className="w-5 h-5" />
            <span className="uppercase tracking-wider text-sm">Download</span>
          </button>
        </div>

        <div className="border-2 border-black">
          <img
            src={imageUrl}
            alt="Generated Office Design"
            className="w-full h-auto object-cover"
          />
        </div>
      </div>

      {/* Design Context / Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Prompt Section */}
        <div className={`bg-white neo-border p-6 ${referenceImages.length > 0 ? 'md:col-span-2' : 'md:col-span-3'}`}>
          <div className="flex items-center gap-2 mb-3 text-black">
            <Quote className="w-6 h-6 fill-salmon text-black" />
            <h3 className="font-display text-xl uppercase tracking-wide">Brief</h3>
          </div>
          <p className="font-mono font-bold text-gray-800 leading-relaxed text-sm">"{prompt}"</p>
        </div>

        {/* Reference Image Section (if present) */}
        {referenceImages.length > 0 && refPreviewUrls.length > 0 && (
          <div className="bg-white neo-border p-6 flex flex-col h-full transform -rotate-1">
            <div className="flex items-center gap-2 mb-3 text-black">
              <ImageIcon className="w-5 h-5" />
              <h3 className="font-display text-lg uppercase tracking-wide">Ref ({referenceImages.length})</h3>
            </div>

            <div className={`relative flex-1 bg-gray-100 border-2 border-black overflow-hidden ${refPreviewUrls.length > 1 ? 'overflow-y-auto' : ''}`}>
              {refPreviewUrls.length === 1 ? (
                <img
                  src={refPreviewUrls[0]}
                  alt="Inspiration Reference"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="grid grid-cols-2 gap-2 p-2">
                  {refPreviewUrls.map((url, idx) => (
                    <div key={idx} className="aspect-square relative border border-black overflow-hidden">
                      <img
                        src={url}
                        alt={`Ref ${idx}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            {refPreviewUrls.length === 1 && (
              <p className="text-xs font-bold font-mono text-gray-500 mt-2 truncate bg-gray-100 p-1 border border-black">{referenceImages[0].name}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-center gap-4 pt-8">
        <button
          onClick={onRegenerate}
          className="flex items-center gap-2 bg-black hover:bg-gray-900 text-white border-2 border-black px-8 py-4 transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase font-display tracking-widest text-lg"
        >
          <Sparkles className="w-5 h-5" />
          <span>Regenerate</span>
        </button>

        <button
          onClick={onReset}
          className="flex items-center gap-2 bg-white hover:bg-gray-50 text-black neo-border px-8 py-4 transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase font-display tracking-widest text-lg"
        >
          <RefreshCw className="w-5 h-5" />
          <span>New Design</span>
        </button>
      </div>
    </div>

  );
};
