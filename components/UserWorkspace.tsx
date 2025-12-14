
import React, { useState, useRef, useEffect } from 'react';
import { FormData, GeneratedContent, Tone, ContentFormat, Language } from '../types';
import { generateMarketingContent, analyzeProductImage, getTrendInsights, generateAutofill } from '../services/geminiService';
import { ImageUploader } from './ImageUploader';
import { OutputSection } from './OutputSection';
import { AutofillNotice } from './AutofillNotice';
import { ContentFormatSelector } from './ContentFormatSelector';
import { ConfirmationModal } from './ConfirmationModal';
import { WalletModal } from './WalletModal';
import { UserGuideModal } from './UserGuideModal';
import { HistoryModal } from './HistoryModal';
import { AffiliateModal } from './AffiliateModal';
import { ImageStudio } from './ImageStudio';
import { VideoStudio } from './VideoStudio';
import { TutorialTab } from './TutorialTab';
import { Sparkles, Zap, PenTool, Wand2, Loader2, LogOut, AlertTriangle, Shield, Crown, Database, Share2, Copy, Save, Key, Megaphone, X, Gift, RotateCcw, Image as ImageIcon, BookOpen, DollarSign, Film, User, TrendingUp, BrainCircuit, Box, ChevronRight, Lock, CreditCard, Info, Construction } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface UserWorkspaceProps {
  licenseKey: string;
  initialCredits: number;
  config: { costPerGen: number; autofillCost: number; imageGenCost?: number; videoGenCost?: number };
  onLogout: () => void;
  onShowAbout: () => void;
}

// Internal Tooltip Component
const Tooltip = ({ text, children, className = "" }: { text: string, children?: React.ReactNode, className?: string }) => (
  <div className={`group relative flex items-center ${className}`}>
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900/95 backdrop-blur text-white text-[10px] leading-tight rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 text-center shadow-xl border border-gray-700">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900/95"></div>
    </div>
  </div>
);

export const UserWorkspace: React.FC<UserWorkspaceProps> = ({ licenseKey, initialCredits, config: initialConfig, onLogout, onShowAbout }) => {
  const [credits, setCredits] = useState(initialCredits);
  const [userPlan, setUserPlan] = useState<string>('Starter');
  const [userName, setUserName] = useState<string>('User'); // Added state for User Name
  const [planMaxCredits, setPlanMaxCredits] = useState(200); // Default fallback
  const [dynamicConfig, setDynamicConfig] = useState(initialConfig);
  const [proPackageId, setProPackageId] = useState<number | null>(null);
  
  // Feature Flags
  const [featureFlags, setFeatureFlags] = useState({
      enable_text: true,
      enable_image: true,
      enable_video: true,
      enable_autofill: true
  });

  const [inputMode, setInputMode] = useState<'auto' | 'manual' | 'image-studio' | 'video-studio' | 'tutorial'>('tutorial');
  const [magicInput, setMagicInput] = useState("");
  const [isMagicFilling, setIsMagicFilling] = useState(false);
  const [showAutofillNotice, setShowAutofillNotice] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    productName: '', coreBenefits: '', targetAudience: '', language: Language.MALAY_CASUAL,
    tone: Tone.KAKAK_VIBE, contentFormat: ContentFormat.INSTAGRAM_POST, image: null, useThinking: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0); 
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [useTrends, setUseTrends] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false); 
  const [isAffiliateOpen, setIsAffiliateOpen] = useState(false);
  const [showConfirmGen, setShowConfirmGen] = useState(false);
  const [showConfirmAuto, setShowConfirmAuto] = useState(false);
  const [activeBroadcast, setActiveBroadcast] = useState<{title: string, message: string, type: string} | null>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const outputRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);

  // Track mounting state
  useEffect(() => {
      isMountedRef.current = true;
      return () => { isMountedRef.current = false; };
  }, []);
  
  // Plan Logic
  const isPro = userPlan === 'TAAP PRO' || licenseKey === 'DEV';

  // Capacity Logic (Dynamic)
  const capacityPercent = Math.min(100, Math.max(0, (credits / planMaxCredits) * 100));
  const isLowBalance = capacityPercent < 15;

  useEffect(() => {
    if(licenseKey !== 'DEV') {
        const fetchLatestData = async () => {
            if (!isMountedRef.current) return;
            try {
                // 1. Fetch User Data
                const { data: userData } = await supabase.from('licenses').select('credits, plan_type, status, user_name').eq('license_key', licenseKey).single();
                if(userData && isMountedRef.current) {
                    if(userData.status !== 'active') { onLogout(); return; }
                    setCredits(userData.credits);
                    setUserPlan(userData.plan_type || 'Starter');
                    setUserName(userData.user_name || 'User');
                    
                    // 2. Fetch Package Max Credits Dynamically
                    if (userData.plan_type) {
                        const { data: pkg } = await supabase.from('packages').select('credits').eq('name', userData.plan_type).single();
                        if (pkg) setPlanMaxCredits(pkg.credits);
                    }
                }

                // 3. Find PRO Package ID for Upgrade Flow
                const { data: proPkg } = await supabase.from('packages').select('id').eq('name', 'TAAP PRO').single();
                if (proPkg) setProPackageId(proPkg.id);

                // 4. Fetch System Settings (Costs & Flags)
                const { data: settings } = await supabase.from('system_settings').select('key,value');
                if (settings && isMountedRef.current) {
                    const costGen = settings.find(s => s.key === 'cost_per_generation')?.value;
                    const costAuto = settings.find(s => s.key === 'cost_per_autofill')?.value;
                    const costImage = settings.find(s => s.key === 'cost_per_image_generation')?.value;
                    const costVideo = settings.find(s => s.key === 'cost_per_video_generation')?.value;
                    
                    setDynamicConfig({
                        costPerGen: costGen ? parseInt(costGen) : 1,
                        autofillCost: costAuto ? parseInt(costAuto) : 1,
                        imageGenCost: costImage ? parseInt(costImage) : 2,
                        videoGenCost: costVideo ? parseInt(costVideo) : 10
                    });

                    // Update Feature Flags
                    const flags = settings.find(s => s.key === 'feature_flags')?.value;
                    if (flags) {
                        try {
                            const parsedFlags = JSON.parse(flags);
                            setFeatureFlags(prev => ({...prev, ...parsedFlags}));
                        } catch {}
                    }
                }

                const { data: broadcasts } = await supabase.from('broadcasts').select('*').eq('is_active', true).gt('expires_at', new Date().toISOString()).limit(1);
                if (broadcasts && broadcasts.length > 0 && isMountedRef.current) setActiveBroadcast(broadcasts[0]);
            } catch (e) {
                console.warn("Sync failed", e);
            }
        };
        
        fetchLatestData();
        const interval = setInterval(fetchLatestData, 30000); // 30s Poll
        return () => clearInterval(interval);
    } else {
        setUserPlan('TAAP PRO');
        setUserName('Developer');
        setPlanMaxCredits(10000);
    }
  }, [licenseKey, onLogout]);

  const handleInputChange = (e: React.ChangeEvent<any>) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const saveToVault = (content: GeneratedContent, currentFormData: FormData) => {
      try {
          const newItem = { id: Date.now().toString(), timestamp: Date.now(), productName: currentFormData.productName, tone: currentFormData.tone, format: currentFormData.contentFormat, content: content };
          const history = localStorage.getItem('taap_neural_vault') ? JSON.parse(localStorage.getItem('taap_neural_vault')!) : [];
          localStorage.setItem('taap_neural_vault', JSON.stringify([newItem, ...history].slice(0, 50)));
      } catch (e) { console.warn("Vault full", e); }
  };

  const handleRestoreFromHistory = (item: any) => {
      setFormData(prev => ({ ...prev, productName: item.productName, tone: item.tone as Tone, contentFormat: item.format as ContentFormat }));
      setGeneratedContent(item.content);
      setInputMode('manual');
      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
  };

  const refreshConfigBeforeAction = async () => {
       return dynamicConfig;
  };

  const handleRequestGenerate = async () => {
      const currentConfig = await refreshConfigBeforeAction();
      const totalCost = currentConfig.costPerGen + (useTrends ? 2 : 0); // Hardcoded trend cost fallback
      if (credits >= totalCost) setShowConfirmGen(true); else setIsWalletOpen(true);
  };

  const handleRequestAutofill = async () => {
      const currentConfig = await refreshConfigBeforeAction();
      if (credits >= currentConfig.autofillCost) setShowConfirmAuto(true); else setIsWalletOpen(true);
  };

  const _executeAutofill = async () => {
      setShowConfirmAuto(false);
      setIsMagicFilling(true); setLoadingProgress(10); setError(null);
      try {
          const { data, newBalance } = await generateAutofill(magicInput, licenseKey, dynamicConfig.autofillCost);
          if (!isMountedRef.current) return;
          setCredits(newBalance);
          setFormData(prev => ({ ...prev, productName: magicInput, coreBenefits: data.coreBenefits || prev.coreBenefits, targetAudience: data.targetAudience || prev.targetAudience, tone: (data.tone as Tone) || prev.tone, contentFormat: (data.contentFormat as ContentFormat) || prev.contentFormat }));
          setInputMode('manual'); setShowAutofillNotice(true);
      } catch (err: any) { 
          if (isMountedRef.current) setError(err.message || String(err)); 
      } finally { 
          if (isMountedRef.current) { setIsMagicFilling(false); setLoadingProgress(0); }
      }
  };

  const _executeGenerate = async (isHumanize = false) => {
      setShowConfirmGen(false);
      setIsLoading(true); setLoadingProgress(5); setError(null);
      if (!isHumanize) setGeneratedContent(null);
      
      try {
          let trends = "";
          let currentBalance = credits;

          // 1. Handle Trends Cost (Separate Transaction)
          if (useTrends && !isHumanize) {
              setLoadingStep("Scanning Viral Trends (Live Data)..."); 
              setLoadingProgress(20);
              
              // Explicitly deduct for Trend Search
              const { data: newBal, error } = await supabase.rpc('deduct_credits', { 
                  p_license_key: licenseKey, 
                  p_amount: 2, // 2 Credits for Search Grounding
                  p_type: 'trend_search' 
              });
              
              if (error) throw new Error("Not enough credits for Trend Search.");
              currentBalance = newBal;
              setCredits(newBal); // Update local state immediately

              // Actual API Call
              trends = await getTrendInsights(`${formData.productName} trends`);
          }

          if (!isMountedRef.current) return;
          setLoadingStep("Neural Engine Writing...");
          
          // 2. Main Generation Call
          const { content, newBalance } = await generateMarketingContent(formData, trends, isHumanize, licenseKey, dynamicConfig.costPerGen);
          
          if (!isMountedRef.current) return;
          if (newBalance !== undefined) setCredits(newBalance);
          setGeneratedContent(content);
          if (!isHumanize) saveToVault(content, formData);
          setLoadingProgress(100); await wait(300);
          if (!isHumanize && isMountedRef.current) setTimeout(() => outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      } catch (err: any) { 
          if (isMountedRef.current) setError(err.message || String(err)); 
      } finally { 
          if (isMountedRef.current) { setIsLoading(false); setLoadingStep(""); setLoadingProgress(0); }
      }
  };

  const handleImageAnalyze = async () => {
      if (!formData.image) return;
      setIsAnalyzing(true); setLoadingProgress(10);
      try {
          const analysis = await analyzeProductImage(formData.image);
          if (!isMountedRef.current) return;
          setFormData(prev => ({ ...prev, ...analysis }));
          setInputMode('manual'); setShowAutofillNotice(true);
      } catch (err: any) { 
          if (isMountedRef.current) setError(err.message || String(err)); 
      } finally { 
          if (isMountedRef.current) setIsAnalyzing(false); 
      }
  };

  // Plan Enforcement Handlers
  const handleRestrictedAccess = () => {
      setUpgradeModalOpen(true);
  };

  const ProgressBar = ({ progress, text, height = "h-12", colorClass = "from-orange-600 to-amber-600" }: { progress: number, text: string, height?: string, colorClass?: string }) => (
      <div className={`w-full bg-gray-200 rounded-xl ${height} relative overflow-hidden shadow-inner`}>
          <div className={`h-full bg-gradient-to-r ${colorClass} transition-all duration-500 ease-out flex items-center justify-end pr-3`} style={{ width: `${Math.max(progress, 5)}%` }}></div>
          <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-800 gap-2">
               <Loader2 className="w-4 h-4 animate-spin" /><span>{text} ({progress}%)</span>
          </div>
      </div>
  );

  // --- NEURAL CAPACITY BAR COMPONENT ---
  const NeuralCapacityBar = () => {
      let colorClass = "bg-white shadow-[0_0_15px_rgba(255,255,255,0.6)]";
      if (capacityPercent < 20) colorClass = "bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-pulse";

      return (
          <div onClick={() => setIsWalletOpen(true)} className="cursor-pointer group mt-4 w-full max-w-md select-none px-4 md:px-0">
              <div className="flex justify-between items-end mb-1 px-1">
                  <span className="text-[10px] font-bold text-orange-100 uppercase tracking-widest flex items-center gap-1 group-hover:text-white transition-colors">
                      <Zap className="w-3 h-3 fill-current" /> Neural Capacity
                  </span>
                  <span className="text-[10px] font-mono font-bold text-white">{Math.round(capacityPercent)}%</span>
              </div>
              <div className="w-full h-3 bg-black/40 rounded-full border border-white/20 overflow-hidden backdrop-blur-sm relative">
                  <div 
                      className={`h-full ${colorClass} transition-all duration-1000 ease-out relative`} 
                      style={{ width: `${capacityPercent}%` }}
                  >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/30 to-transparent animate-[shimmer_2s_infinite]"></div>
                  </div>
              </div>
              {isLowBalance && <p className="text-[9px] text-red-200 mt-1 font-bold text-center animate-pulse">Low Energy - Recharge Required</p>}
          </div>
      );
  };

  return (
    <div className="min-h-[100dvh] bg-gray-50 pb-40 font-sans">
      <header className="relative bg-gradient-to-br from-orange-600 to-amber-500 text-white overflow-hidden pb-12 pt-4 md:pt-6 shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
           <div className="flex justify-between items-start mb-4">
               <div className="pt-2 flex items-center gap-2 md:gap-3">
                   <div className="w-12 h-12 md:w-14 md:h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
                        <Shield className="w-6 h-6 md:w-7 md:h-7 text-white" />
                   </div>
                   <div className="flex flex-col">
                       <span className="text-[9px] text-orange-100 uppercase font-bold tracking-widest opacity-80">Welcome, {userName}</span>
                       <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-xs font-bold ${isPro ? 'bg-purple-600 text-white border-purple-300' : 'bg-blue-600 text-white border-blue-400'}`}>
                           {isPro ? <Crown className="w-3 h-3 text-yellow-300" /> : <User className="w-3 h-3" />} {userPlan}
                       </div>
                   </div>
               </div>
               <div className="flex items-center gap-2 pt-2">
                  <button onClick={() => setIsWalletOpen(true)} className="flex items-center px-3 py-1.5 rounded-full bg-green-600 hover:bg-green-700 border border-white/5 shadow-sm">
                      <CreditCard className="w-4 h-4 text-white" /><span className="text-[10px] font-bold text-white hidden md:inline ml-2">TOP UP</span>
                  </button>
                  <button onClick={() => setIsHistoryOpen(true)} className="flex items-center px-3 py-1.5 rounded-full bg-black/20 hover:bg-black/30 border border-white/5"><Database className="w-4 h-4 text-white/80" /><span className="text-[10px] font-bold text-white/90 hidden md:inline ml-2">VAULT</span></button>
                  <button onClick={onLogout} className="flex items-center px-3 py-1.5 rounded-full bg-black/20 hover:bg-red-500/80 border border-white/5"><LogOut className="w-4 h-4 text-white/80" /></button>
               </div>
           </div>
           
           <div className="flex flex-col items-center text-center pb-4">
               <div className="flex flex-col items-center leading-none select-none mb-8 transform hover:scale-[1.02] transition-transform duration-500">
                    <div className="flex items-center gap-3 mb-2 opacity-90">
                        <div className="h-[1px] w-8 md:w-12 bg-gradient-to-r from-transparent to-yellow-300/70"></div>
                        <span className="text-[10px] md:text-xs font-bold text-yellow-300 tracking-[0.6em] uppercase drop-shadow-sm">GENPRO</span>
                        <div className="h-[1px] w-8 md:w-12 bg-gradient-to-l from-transparent to-yellow-300/70"></div>
                    </div>
                    <span className="text-7xl md:text-9xl font-black text-white tracking-tighter drop-shadow-2xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">TAAP</span>
               </div>

               <NeuralCapacityBar />

               <div className="mt-6 flex flex-col items-center w-full max-w-md gap-3 px-4 md:px-0">
                   <button onClick={() => setIsAffiliateOpen(true)} className="w-full bg-white text-orange-600 hover:bg-orange-50 font-bold py-2.5 rounded-xl shadow-lg border border-white/50 flex items-center justify-center gap-2 text-sm transition-transform active:scale-95 group"><DollarSign className="w-4 h-4 group-hover:animate-bounce" /> Affiliate Dashboard</button>
               </div>
           </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 md:px-8 relative z-20 -mt-8 space-y-8">
          {activeBroadcast && <div className="flex justify-center -mt-6 animate-fade-in"><div className="bg-blue-50 border border-blue-300 rounded-xl p-4 flex gap-3 text-blue-900 shadow-lg"><Megaphone className="w-5 h-5" /><div><h4 className="font-bold text-sm uppercase">{activeBroadcast.title}</h4><p className="text-xs">{activeBroadcast.message}</p></div><button onClick={() => setActiveBroadcast(null)}><X className="w-4 h-4"/></button></div></div>}
          
          <div className="flex justify-center z-40 my-4 px-0 md:px-2">
             <div className="w-full max-w-4xl bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-gray-200/60 relative">
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/90 to-transparent pointer-events-none rounded-r-2xl z-10 md:hidden"></div>
                
                <div className="flex gap-1 overflow-x-auto no-scrollbar snap-x pr-4 md:pr-0">
                    <button onClick={() => setInputMode('tutorial')} className={`flex-1 min-w-[90px] py-3 rounded-xl text-xs md:text-sm font-bold flex flex-col items-center gap-1 transition-all snap-center shrink-0 ${inputMode === 'tutorial' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}><BookOpen className="w-4 h-4" /><span>Tutorial</span></button>
                    
                    {featureFlags.enable_autofill && (
                        <button onClick={() => setInputMode('auto')} className={`flex-1 min-w-[90px] py-3 rounded-xl text-xs md:text-sm font-bold flex flex-col items-center gap-1 transition-all snap-center shrink-0 ${inputMode === 'auto' ? 'bg-orange-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}><Wand2 className="w-4 h-4" /><span>Auto-Fill</span></button>
                    )}
                    
                    <button onClick={() => setInputMode('manual')} className={`flex-1 min-w-[90px] py-3 rounded-xl text-xs md:text-sm font-bold flex flex-col items-center gap-1 transition-all snap-center shrink-0 ${inputMode === 'manual' ? 'bg-orange-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}><PenTool className="w-4 h-4" /><span>Manual</span></button>
                    
                    {featureFlags.enable_image && (
                        <button 
                            onClick={() => isPro ? setInputMode('image-studio') : handleRestrictedAccess()} 
                            className={`relative flex-1 min-w-[110px] py-3 rounded-xl text-xs md:text-sm font-bold flex flex-col items-center gap-1 transition-all snap-center shrink-0 ${inputMode === 'image-studio' ? 'bg-purple-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            {!isPro && <div className="absolute top-1 right-1 bg-gray-900 rounded-full p-0.5"><Lock className="w-3 h-3 text-white" /></div>}
                            <ImageIcon className="w-4 h-4" /><span>Image Gen</span>
                        </button>
                    )}
                    
                    {featureFlags.enable_video && (
                        <button 
                            onClick={() => isPro ? setInputMode('video-studio') : handleRestrictedAccess()} 
                            className={`relative flex-1 min-w-[110px] py-3 rounded-xl text-xs md:text-sm font-bold flex flex-col items-center gap-1 transition-all snap-center shrink-0 ${inputMode === 'video-studio' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            {!isPro && <div className="absolute top-1 right-1 bg-red-600 rounded-full p-0.5"><Lock className="w-3 h-3 text-white" /></div>}
                            <Film className="w-4 h-4" /><span>Video Gen</span>
                        </button>
                    )}
                </div>
             </div>
          </div>

          {inputMode === 'tutorial' && <TutorialTab />}
          
          {isPro && (
              <>
                <div className={inputMode === 'video-studio' ? 'block animate-fade-in' : 'hidden'}>
                    <VideoStudio licenseKey={licenseKey} costPerGen={dynamicConfig.videoGenCost || 10} onBalanceUpdate={(newBal) => setCredits(newBal)} />
                </div>
                <div className={inputMode === 'image-studio' ? 'block animate-fade-in' : 'hidden'}>
                    <div className="text-center mb-6"><h2 className="text-2xl font-black text-gray-900 flex items-center justify-center gap-2"><ImageIcon className="w-6 h-6 text-purple-600" /> TAAP GenPro Studio</h2></div>
                    <ImageStudio licenseKey={licenseKey} costPerGen={dynamicConfig.imageGenCost || 2} onBalanceUpdate={(newBal) => setCredits(newBal)} />
                </div>
              </>
          )}
          
          {inputMode === 'auto' && (
            <div className="bg-white rounded-3xl shadow-xl border border-indigo-100 p-8 text-center animate-fade-in max-w-2xl mx-auto mt-8">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Wand2 className="w-10 h-10 text-indigo-600" />
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                    <h2 className="text-3xl font-extrabold text-gray-900">Magic Auto-Fill</h2>
                    <Tooltip text="Automatically searches the web for your product details to fill in the form.">
                        <Info className="w-5 h-5 text-gray-400 hover:text-indigo-600 cursor-help" />
                    </Tooltip>
                </div>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">Enter product name, and let the Neural Engine find sales details for you.</p>
                
                <div className="relative max-w-lg mx-auto">
                    <input 
                        value={magicInput} 
                        onChange={(e) => setMagicInput(e.target.value)} 
                        placeholder="Ex: Sambal Nyet Berapi, iPhone 15 Pro..." 
                        className="w-full p-5 border-2 border-indigo-100 rounded-2xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-lg font-medium text-center shadow-sm transition-all" 
                    />
                </div>

                <button 
                    onClick={() => handleRequestAutofill()} 
                    disabled={!magicInput.trim()}
                    className="w-full max-w-lg bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:shadow-orange-500/30 mt-6 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-1 active:scale-95"
                >
                    {isMagicFilling ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    {isMagicFilling ? "Generating Details..." : (
                        <span className="flex items-center gap-1">TAAP-NOW (Generate) <span className="opacity-80 ml-1 text-xs bg-white/20 px-2 py-0.5 rounded flex items-center gap-1"><Zap className="w-3 h-3 fill-current text-yellow-300" /> Neural Energy</span></span>
                    )}
                </button>
            </div>
          )}
          
          {inputMode === 'manual' && (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 md:p-8 animate-fade-in">
                {showAutofillNotice && <AutofillNotice onAcknowledge={() => setShowAutofillNotice(false)} />}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                    <Box className="w-5 h-5 text-orange-600" /> Product Information
                    </h3>
                    
                    <ImageUploader currentImage={formData.image} onImageChange={(img) => setFormData(prev => ({...prev, image: img}))} />
                    {formData.image && featureFlags.enable_image && (
                    <Tooltip text="Uses computer vision to extract product features, colors, and text from your uploaded image automatically." className="w-full">
                        <button 
                            type="button" 
                            onClick={handleImageAnalyze} 
                            disabled={isAnalyzing}
                            className="w-full py-3 bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-700 rounded-xl hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                        >
                            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4"/>}
                            AI Image Analysis
                        </button>
                    </Tooltip>
                    )}

                    <div className="space-y-4">
                        <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Product Name</label>
                        <input name="productName" value={formData.productName} onChange={handleInputChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500" placeholder="Example: Sambal Nyet Berapi" />
                        </div>
                        
                        <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Key Benefits (Core Benefits)</label>
                        <textarea name="coreBenefits" value={formData.coreBenefits} onChange={handleInputChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 min-h-[100px]" placeholder="- Super spicy&#10;- Long shelf life&#10;- Affordable price" />
                        </div>

                        <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Target Audience</label>
                        <input name="targetAudience" value={formData.targetAudience} onChange={handleInputChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500" placeholder="Example: University Students, Housewives" />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-orange-600" /> Marketing Strategy
                    </h3>

                    <ContentFormatSelector value={formData.contentFormat} onChange={(v) => setFormData(prev => ({...prev, contentFormat: v}))} />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Language</label>
                            <select name="language" value={formData.language} onChange={handleInputChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm font-bold">
                                {Object.values(Language).map((lang) => <option key={lang} value={lang}>{lang}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tone of Voice</label>
                            <select name="tone" value={formData.tone} onChange={handleInputChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm font-bold">
                                {Object.values(Tone).map((tone) => <option key={tone} value={tone}>{tone}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <Tooltip text="Connects to Google Search to find real-time viral topics in Malaysia related to your product." className="w-full">
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded-lg ${useTrends ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}><TrendingUp className="w-4 h-4" /></div>
                                    <span className="text-sm font-bold text-gray-700">Find Viral Trends (Live)</span>
                                </div>
                                <button onClick={() => setUseTrends(!useTrends)} className={`w-12 h-6 rounded-full p-1 transition-colors ${useTrends ? 'bg-green-50' : 'bg-gray-300'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${useTrends ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </button>
                            </div>
                        </Tooltip>
                        
                        <Tooltip text="Enables chain-of-thought processing. The AI analyzes customer psychology and pain points before writing the copy." className="w-full">
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded-lg ${formData.useThinking ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-500'}`}><BrainCircuit className="w-4 h-4" /></div>
                                    <span className="text-sm font-bold text-gray-700">Deep Reasoning (Think First)</span>
                                </div>
                                <button onClick={() => setFormData(prev => ({...prev, useThinking: !prev.useThinking}))} className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.useThinking ? 'bg-purple-600' : 'bg-gray-300'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${formData.useThinking ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </button>
                            </div>
                        </Tooltip>
                    </div>

                    <div className="pt-4">
                        {isLoading ? (
                            <ProgressBar progress={loadingProgress} text={loadingStep} height="h-16" />
                        ) : (
                            <button 
                                onClick={() => handleRequestGenerate()} 
                                disabled={!featureFlags.enable_text}
                                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 hover:scale-[1.02] ${featureFlags.enable_text ? 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white hover:shadow-orange-500/30' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                            >
                                {featureFlags.enable_text ? <><Sparkles className="w-5 h-5 fill-white animate-pulse" /> TAAP-NOW (Generate)</> : <><Construction className="w-5 h-5"/> System Maintenance</>}
                            </button>
                        )}
                    </div>
                </div>
                </div>
            </div>
          )}
          
          <div ref={outputRef}>
              {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 mb-6 animate-fade-in"><AlertTriangle className="w-5 h-5" /><span>{error}</span></div>}
              {generatedContent && inputMode !== 'image-studio' && inputMode !== 'video-studio' && inputMode !== 'tutorial' && (
                  <OutputSection 
                    content={generatedContent} 
                    onHumanize={() => _executeGenerate(true)} 
                    isHumanizing={isLoading && loadingStep.includes("Scanning")} 
                    format={formData.contentFormat as ContentFormat}
                  />
              )}
          </div>
      </main>
      
      <WalletModal isOpen={isWalletOpen} onClose={() => setIsWalletOpen(false)} currentCredits={credits} licenseKey={licenseKey} />
      <WalletModal isOpen={upgradeModalOpen} onClose={() => setUpgradeModalOpen(false)} currentCredits={credits} licenseKey={licenseKey} initialPackageId={proPackageId} />
      
      <UserGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} config={dynamicConfig} />
      <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} onRestore={handleRestoreFromHistory} />
      <AffiliateModal isOpen={isAffiliateOpen} onClose={() => setIsAffiliateOpen(false)} licenseKey={licenseKey} />
      <ConfirmationModal isOpen={showConfirmGen} onClose={() => setShowConfirmGen(false)} onConfirm={() => _executeGenerate(false)} title="Confirm Generation" message="This action will use Neural Energy. Proceed?" confirmText="Yes, Proceed" />
      <ConfirmationModal isOpen={showConfirmAuto} onClose={() => setShowConfirmAuto(false)} onConfirm={_executeAutofill} title="Confirm Auto-Fill" message="This action will use Neural Energy. Proceed?" confirmText="Yes, Auto-Fill" />
    
    </div>
  );
};
