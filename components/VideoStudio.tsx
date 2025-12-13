
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
      setPrompt("");
      setStartImage(null);
    } catch (err: any) {
      setError(err.message);
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
             <p className="text-xs text-gray-500 mt-1">Create cinematic videos in 30-60 seconds.</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex flex-col gap-2">
             <div className="flex items-start gap-2 text-blue-800 text-xs font-bold">
               <Sparkles className="w-4 h-4 shrink-0" />
               Enterprise Mode Active
             </div>
             <p className="text-[10px] text-blue-600">
               Generating via TAAP Enterprise Node. No personal API key required.
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

          <button 
            onClick={handleGenerateClick} 
            disabled={isGenerating}
            className="w-full py-4 bg-gradient-to-r from-gray-900 to-black hover:bg-black text-white font-bold rounded-xl shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98] transition-all"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin"/> : <Sparkles className="w-5 h-5"/>}
            {isGenerating ? "Neural Engine Processing..." : (
                <span className="flex items-center gap-1">Generate AI Video <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] flex items-center gap-0.5"><Zap className="w-3 h-3 fill-current text-yellow-300" /><Zap className="w-3 h-3 fill-current text-yellow-300" /><Zap className="w-3 h-3 fill-current text-yellow-300" /> High Energy</span></span>
            )}
          </button>
          <p className="text-center text-[10px] text-gray-400">Powered by Veo 3.1 Neural Network.</p>
        </div>

        {/* OUTPUT COLUMN */}
        <div className="lg:col-span-8 bg-gray-900 rounded-3xl p-6 min-h-[500px] flex flex-col relative overflow-hidden">
            {/* HUD Decoration */}
            <div className="absolute top-4 left-4 flex gap-1.5 opacity-40">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
            </div>
            <div className="absolute top-4 right-4 text-[10px] text-gray-500 font-mono flex items-center gap-2">
                <Monitor className="w-3 h-3"/> VEO_OUTPUT_RENDERER_LIVE
            </div>

            <div className="flex-1 mt-6 flex flex-col">
                {isGenerating ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 animate-fade-in">
                        <div className="relative">
                            <div className="w-24 h-24 border-b-2 border-orange-500 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Film className="w-8 h-8 text-orange-400 animate-pulse" />
                            </div>
                        </div>
                        <div className="space-y-2">
                           <h3 className="text-white font-bold text-lg">{progressMsg}</h3>
                           <p className="text-gray-500 text-xs max-w-xs mx-auto">Neural nodes are syncing frames. Please do not close this window.</p>
                        </div>
                    </div>
                ) : generatedVideos.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-600 opacity-60">
                        <Film className="w-16 h-16 mb-4" />
                        <p className="text-sm font-bold">No Videos Generated Yet</p>
                        <p className="text-xs">Fill the prompt and start rendering.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {generatedVideos.map((video, idx) => (
                            <div key={idx} className="bg-black rounded-xl overflow-hidden shadow-lg border border-gray-800">
                                <video controls className="w-full aspect-video bg-black">
                                    <source src={video.url} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                                <div className="p-4 flex justify-between items-center">
                                    <p className="text-white text-xs truncate max-w-[70%]">{video.prompt}</p>
                                    <a href={video.url} download className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                                        <Download className="w-3 h-3" /> Save MP4
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

      </div>

      <ConfirmationModal 
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={_executeGenerateVideo}
        title="Confirm Video Generation"
        message={`This action will deduct ${costPerGen} credits to create a high-quality AI video. Proceed?`}
        confirmText="Yes, Create Video"
      />
    </div>
  );
};
