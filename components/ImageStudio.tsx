
import React, { useState, useRef } from 'react';
import { ImageData, ImageGenerationParams, GeneratedImage } from '../types';
import { generateAIImages } from '../services/geminiService';
import { Upload, X, Image as ImageIcon, Wand2, Plus, Sparkles, Download, Maximize2, Loader2, User, Box, Zap } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

interface ImageStudioProps {
  licenseKey: string;
  onBalanceUpdate: (newBalance: number) => void;
  costPerGen: number;
}

export const ImageStudio: React.FC<ImageStudioProps> = ({ licenseKey, onBalanceUpdate, costPerGen }) => {
  // --- STATE ---
  const [productImages, setProductImages] = useState<ImageData[]>([]);
  const [modelImage, setModelImage] = useState<ImageData | null>(null);
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16'>('1:1');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Refs for file inputs
  const productInputRef = useRef<HTMLInputElement>(null);
  const modelInputRef = useRef<HTMLInputElement>(null);

  // --- HANDLERS ---

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'product' | 'model') => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = (ev.target?.result as string).split(',')[1];
        const newImage: ImageData = {
          base64,
          mimeType: file.type,
          fileName: file.name
        };

        if (type === 'product') {
          if (productImages.length < 5) {
            setProductImages([...productImages, newImage]);
          } else {
            alert("Maximum 5 product images only.");
          }
        } else {
          setModelImage(newImage);
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    e.target.value = '';
  };

  const removeProductImage = (index: number) => {
    const newImages = [...productImages];
    newImages.splice(index, 1);
    setProductImages(newImages);
  };

  const _executeGenerateImage = async () => {
    setShowConfirm(false);
    setIsGenerating(true);
    setError(null);

    const params: ImageGenerationParams = {
      productImages,
      modelImage,
      prompt,
      aspectRatio
    };

    try {
      const { images, newBalance } = await generateAIImages(params, licenseKey, costPerGen);
      setGeneratedImages(images);
      onBalanceUpdate(newBalance);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateClick = () => {
    if (productImages.length === 0 && !modelImage && !prompt) {
      setError("Please upload images or enter a prompt.");
      return;
    }
    setShowConfirm(true);
  };

  const downloadImage = (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `TAAP-GENPRO-VISUAL-${Date.now()}-${index}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to force container aspect ratio
  const getAspectRatioClass = (ratio: string) => {
      switch(ratio) {
          case '16:9': return 'aspect-[16/9]';
          case '9:16': return 'aspect-[9/16]';
          default: return 'aspect-square';
      }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-5 md:p-8 animate-fade-in font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT COLUMN: INPUTS (4 Columns) --- */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Section 1: Product Images */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span className="bg-gray-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
              Upload Product Photos (Min 1, Max 5)
            </h3>
            
            <div className="grid grid-cols-3 gap-2">
              {productImages.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                  <img src={`data:${img.mimeType};base64,${img.base64}`} className="w-full h-full object-cover" alt="Product" />
                  <button onClick={() => removeProductImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              
              {productImages.length < 5 && (
                <div 
                  onClick={() => productInputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-orange-500 hover:bg-orange-50 flex flex-col items-center justify-center cursor-pointer transition-colors text-gray-400 hover:text-orange-600"
                >
                  <Plus className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-bold">ADD</span>
                </div>
              )}
            </div>
            <input type="file" ref={productInputRef} onChange={(e) => handleImageUpload(e, 'product')} className="hidden" accept="image/*" />
          </div>

          {/* Section 2: Model Image (Optional) */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span className="bg-gray-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
              Upload Model Reference (Optional)
            </h3>
            
            {modelImage ? (
               <div className="relative rounded-lg overflow-hidden border border-gray-200 group h-32 w-full bg-gray-50 flex items-center justify-center">
                  <img src={`data:${modelImage.mimeType};base64,${modelImage.base64}`} className="h-full object-contain" alt="Model" />
                  <button onClick={() => setModelImage(null)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md">
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">
                      Model Reference
                  </div>
               </div>
            ) : (
                <div 
                  onClick={() => modelInputRef.current?.click()}
                  className="h-24 w-full rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50 flex items-center justify-center gap-3 cursor-pointer transition-colors text-gray-400 hover:text-purple-600"
                >
                  <User className="w-6 h-6" />
                  <div className="text-left">
                      <span className="block text-xs font-bold">Click to upload face/model</span>
                      <span className="block text-[10px] opacity-70">System will attempt to preserve identity.</span>
                  </div>
                </div>
            )}
            <input type="file" ref={modelInputRef} onChange={(e) => handleImageUpload(e, 'model')} className="hidden" accept="image/*" />
          </div>

          {/* Section 3: Instructions */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
             <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span className="bg-gray-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
              GenPro Prompt / Instructions
            </h3>
            <div className="relative">
                <textarea 
                    value={prompt} 
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Example: Female model holding bag in a luxury cafe, soft lighting, 8k resolution..." 
                    className="w-full p-4 pr-10 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none min-h-[100px] resize-none"
                />
                <Wand2 className="absolute right-3 bottom-3 w-5 h-5 text-orange-400" />
            </div>
          </div>

          {/* Section 4: Ratio */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
             <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span className="bg-gray-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
              Select Aspect Ratio
            </h3>
            <div className="grid grid-cols-3 gap-3">
                {['1:1', '16:9', '9:16'].map((r) => (
                    <button 
                        key={r}
                        onClick={() => setAspectRatio(r as any)}
                        className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all flex flex-col items-center gap-1 ${aspectRatio === r ? 'bg-orange-600 text-white border-orange-600 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                    >
                        <Box className={`w-4 h-4 ${r === '16:9' ? 'scale-x-125' : r === '9:16' ? 'scale-y-125' : ''}`} />
                        {r}
                    </button>
                ))}
            </div>
          </div>

          {/* GENERATE BUTTON */}
          <div className="pt-6">
              <button 
                onClick={handleGenerateClick} 
                disabled={isGenerating}
                className="w-full py-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-orange-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95"
              >
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin"/> : <Sparkles className="w-5 h-5 fill-current"/>}
                  {isGenerating ? "Generating Visuals..." : (
                      <span className="flex items-center gap-1">Generate Now <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] flex items-center gap-0.5"><Zap className="w-3 h-3 fill-current text-yellow-300" /><Zap className="w-3 h-3 fill-current text-yellow-300" /> Medium Energy</span></span>
                  )}
              </button>
          </div>

          {error && (
              <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100">
                  Error: {error}
              </div>
          )}

        </div>

        {/* --- RIGHT COLUMN: OUTPUT GALLERY (8 Columns) --- */}
        <div className="lg:col-span-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 min-h-[500px] flex flex-col p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-gray-500" /> Studio Results
                </h3>
                {generatedImages.length > 0 && (
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-200">
                        {generatedImages.length} Images Ready
                    </span>
                )}
            </div>

            {isGenerating ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4 text-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <Sparkles className="w-6 h-6 text-purple-600 animate-pulse" />
                        </div>
                    </div>
                    <div>
                        <p className="text-gray-700 font-bold text-lg animate-pulse">Rendering visuals...</p>
                        <p className="text-gray-500 text-xs mt-1">Please wait while the neural engine processes your request.</p>
                    </div>
                </div>
            ) : generatedImages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 opacity-60">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                        <Sparkles className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-lg font-bold">Empty Workspace</p>
                    <p className="text-sm max-w-xs mx-auto">Upload product images and click Generate to see TAAP GenPro magic here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {generatedImages.map((img, i) => (
                        <div key={i} className="flex flex-col">
                            <div className={`group relative rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 bg-white ${getAspectRatioClass(aspectRatio)}`}>
                                <img src={img.url} alt={`Generated ${i}`} className="w-full h-full object-cover" />
                                
                                {/* Overlay Actions */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                    <button 
                                        className="p-3 bg-white text-gray-900 rounded-full hover:bg-blue-500 hover:text-white transition-colors shadow-lg transform hover:scale-110"
                                        title="View Fullscreen"
                                        onClick={() => window.open(img.url, '_blank')}
                                    >
                                        <Maximize2 className="w-5 h-5" />
                                    </button>
                                </div>
                                
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform">
                                    <p className="text-white text-xs font-bold truncate">Variant #{i+1}</p>
                                </div>
                            </div>
                            
                            {/* DOWNLOAD BUTTON BELOW IMAGE */}
                            <button 
                                onClick={() => downloadImage(img.url, i)}
                                className="w-full mt-2 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors shadow-sm"
                            >
                                <Download className="w-3 h-3" /> Download HD
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>

      </div>

      <ConfirmationModal 
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={_executeGenerateImage}
        title="Confirm Image Generation"
        message={`This action will deduct ${costPerGen} credits from your balance. Proceed?`}
        confirmText="Yes, Generate Visuals"
      />
    </div>
  );
};
