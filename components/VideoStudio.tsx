
import React, { useState, useRef } from 'react';
import { ImageData, VideoGenerationParams, GeneratedVideo } from '../types';
import { generateAIVideo } from '../services/geminiService';
import { Upload, X, Film, Sparkles, Download, Loader2, Maximize2, RefreshCw, AlertCircle, Wand2, Monitor, Zap } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

interface VideoStudioProps {
  licenseKey: string;
  onBalanceUpdate: (newBalance: number) => void;
  costPerGen: number;
}

export const VideoStudio: React.FC<VideoStudioProps> = ({ licenseKey, onBalanceUpdate, costPerGen }) => {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [startImage, setStartImage] = useState<ImageData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = (ev.target?.result as string).split(',')[1];
        setStartImage({ base64, mimeType: file.type, fileName: file.name });
      };
      reader.readAsDataURL(file);
    }
  };

  const _executeGenerateVideo = async () => {
    setShowConfirm(false);
    setIsGenerating(true);
    setError(null);
    setProgressMsg("Requesting credits and initializing session...");

    try {
      const { videoUrl, newBalance } = await generateAIVideo(
        { prompt, aspectRatio, image: startImage },
        licenseKey,
        costPerGen,
        (msg) => setProgressMsg(msg)
      );

      setGeneratedVideos([{ url: videoUrl, prompt }, ...generatedVideos]);
      onBalanceUpdate(newBalance);
    } catch (err: any) {
      setError(err.message || "Failed to generate video. Please try again.");
    } finally {
      setIsGenerating(false);
      setProgressMsg("");
    }
  };

  const handleGenerateClick = () => {
    if (!prompt.trim()) {
      setError("Please enter a video prompt description.");
      return;
    }
    setShowConfirm(true);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 md:p-8 animate-fade-in font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* INPUTS COLUMN */}
        <div className="lg:col-span-4 space-y-6">
          <div className="text-left border-b border-gray-100 pb-4">
             <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <Film className="w-6 h-6 text-orange-600" /> Neural Video Studio
             </h2>
             <p className="text-xs text-gray-500 mt-1">Create cinematic videos in 60-90 seconds.</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex flex-col gap-2">
             <div className="flex items-start gap-2 text-blue-800 text-xs font-bold">
               <Sparkles className="w-4 h-4 shrink-0" />
               Enterprise Mode Active
             </div>
             <p className="text-[10px] text-blue-600">
               Generating via TAAP System Node. High-performance rendering enabled.
             </p>
          </div>

          {/* Prompt */}
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase mb-2">Video Prompt (English)</label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: A futuristic cinematic shot of a drone delivering a package over a neon city, 4k..."
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none min-h-[120px] resize-none"
            />
          </div>

          {/* Start Image */}
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase mb-2">Reference Image (Optional)</label>
            <div 
              onClick={() => !startImage && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 transition-all cursor-pointer flex flex-col items-center justify-center ${startImage ? 'border-orange-200 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}
            >
              {startImage ? (
                <div className="relative w-full">
                  <img src={`data:${startImage.mimeType};base64,${startImage.base64}`} className="w-full h-32 object-cover rounded-lg" alt="Ref" />
                  <button onClick={(e) => { e.stopPropagation(); setStartImage(null); }} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"><X className="w-3 h-3"/></button>
                </div>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-gray-400 mb-2" />
                  <span className="text-[10px] font-bold text-gray-400">UPLOAD START FRAME</span>
                </>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
          </div>

          {/* Aspect Ratio */}
          <div>
             <label className="block text-xs font-black text-gray-500 uppercase mb-2">Select Aspect Ratio</label>
             <div className="grid grid-cols-2 gap-2">
               {['16:9', '9:16'].map((r) => (
                 <button 
                  key={r} 
                  onClick={() => setAspectRatio(r as any)}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${aspectRatio === r ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'}`}
                 >
                   {r} {r === '16:9' ? '(Landscape)' : '(Portrait)'}
                 </button>
               ))}
             </div>
          </div>

          {/* GENERATE BUTTON */}
          <div className="pt-2">
              <button 
                onClick={handleGenerateClick} 
                disabled={isGenerating}
                className="w-full py-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-orange-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95"
              >
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin"/> : <Sparkles className="w-5 h-5 fill-current"/>}
                  {isGenerating ? "Processing..." : (
                      <span className="flex items-center gap-1">TAAP-NOW (Generate) <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] flex items-center gap-0.5"><Zap className="w-3 h-3 fill-current text-yellow-300" /><Zap className="w-3 h-3 fill-current text-yellow-300" /> High Energy</span></span>
                  )}
              </button>
          </div>

          {error && (
              <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {error}
              </div>
          )}
          
          {progressMsg && (
              <div className="p-3 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100 flex items-center gap-2 animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" /> {progressMsg}
              </div>
          )}

        </div>

        {/* --- RIGHT COLUMN: OUTPUT GALLERY (8 Columns) --- */}
        <div className="lg:col-span-8 bg-gray-900 rounded-2xl border border-gray-800 min-h-[500px] flex flex-col p-6 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            
            <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-gray-400" /> Rendered Output
                </h3>
                {generatedVideos.length > 0 && (
                    <span className="bg-green-900/30 text-green-400 text-xs font-bold px-3 py-1 rounded-full border border-green-500/30">
                        {generatedVideos.length} Videos Ready
                    </span>
                )}
            </div>

            {isGenerating ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4 text-center relative z-10">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-orange-900/30 border-t-orange-500 rounded-full animate-spin"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <Film className="w-8 h-8 text-orange-500 animate-pulse" />
                        </div>
                    </div>
                    <div>
                        <p className="text-white font-bold text-lg animate-pulse">Processing Neural Video...</p>
                        <p className="text-gray-500 text-xs mt-1 max-w-xs mx-auto">Rendering on Enterprise Nodes. This takes about 60-90 seconds.</p>
                    </div>
                </div>
            ) : generatedVideos.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-600 opacity-60 relative z-10">
                    <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-4 border border-gray-700">
                        <Film className="w-12 h-12 text-gray-600" />
                    </div>
                    <p className="text-lg font-bold">No Videos Yet</p>
                    <p className="text-sm max-w-xs mx-auto">Enter a prompt and generate your first cinematic video.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    {generatedVideos.map((vid, i) => (
                        <div key={i} className="flex flex-col bg-black rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
                            <div className="relative aspect-video bg-black group">
                                <video 
                                    src={vid.url} 
                                    controls 
                                    playsInline
                                    loop
                                    className="w-full h-full object-contain" 
                                    poster="https://via.placeholder.com/640x360.png?text=Video+Ready"
                                />
                            </div>
                            <div className="p-3 bg-gray-900">
                                <p className="text-[10px] text-gray-400 line-clamp-2 mb-2 font-mono">{vid.prompt}</p>
                                <a 
                                    href={vid.url} 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-2 bg-white text-black rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                                >
                                    <Download className="w-3 h-3" /> Open / Download MP4
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

      </div>

      <ConfirmationModal 
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={_executeGenerateVideo}
        title="Confirm Video Generation"
        message="Video generation requires significant computing power. This action will use Neural Energy."
        confirmText="Yes, Create Video"
      />
    </div>
  );
};
