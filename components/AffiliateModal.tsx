
import React, { useState, useEffect, useRef } from 'react';
import { X, Trophy, Users, TrendingUp, Share2, Wallet, AlertCircle, Loader2, Crown, CreditCard, User, Clock, RefreshCw, AlertTriangle, CheckCircle2, Phone, Link as LinkIcon, Banknote, FileText, ArrowDownLeft, ArrowUpRight, Percent, LayoutGrid, ChevronRight, QrCode, Calculator, Info, Search, Filter, Lock, BookOpen, ShieldCheck, Target, Zap } from 'lucide-react';
import { CopyToClipboard } from './CopyToClipboard';
import { supabase } from '../services/supabaseClient';
import { License, AffiliateLog } from '../types';

interface AffiliateModalProps {
  isOpen: boolean;
  onClose: () => void;
  licenseKey: string;
}

interface LeaderboardEntry {
    masked_key: string;
    affiliate_tier: string;
    total_earnings: number;
    user_name: string;
}

interface ReferralEntry {
    joined_at: string;
    user_name: string;
    affiliate_code?: string; // Updated to include affiliate_code
    plan_type: string;
    status: string;
    commission_earned: number; 
    snapshot_discount: number; 
    snapshot_commission_rate: number; 
    commission_processed: boolean;
}

const safeDate = (date: string) => {
    try {
        return new Date(date).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return '-'; }
};

const extractErrorMessage = (error: any): string => {
    if (!error) return "Unknown Error";
    if (typeof error === 'string') return error;
    
    // Supabase / Postgrest Error Standard Fields
    if (error.code && error.message) return `System Error (${error.code}): ${error.message}`;
    if (error.message) return error.message;
    if (error.error_description) return error.error_description;
    if (error.details) return error.details;
    
    try {
        const json = JSON.stringify(error);
        if (json !== '{}') return json;
    } catch {
        // Ignore JSON stringify errors
    }
    
    // Fallback
    return "An unexpected network or server error occurred.";
};

export const AffiliateModal: React.FC<AffiliateModalProps> = ({ isOpen, onClose, licenseKey }) => {
  const [userData, setUserData] = useState<License | null>(null);
  const [tierConfig, setTierConfig] = useState({ 
      rates: { agent: 10, super: 15, partner: 20 },
      thresholds: { super: 10, partner: 50 }
  });
  const [referralDiscount, setReferralDiscount] = useState(5); 
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [referralLoadError, setReferralLoadError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'intro' | 'home' | 'products' | 'finance' | 'ledger'>('intro');
  const [showTierInfo, setShowTierInfo] = useState(false);
  
  // Search State
  const [referralSearch, setReferralSearch] = useState('');

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [holderName, setHolderName] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payoutHistory, setPayoutHistory] = useState<any[]>([]);
  const [ledger, setLedger] = useState<AffiliateLog[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]); 
  const [myReferrals, setMyReferrals] = useState<ReferralEntry[]>([]);
  
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadAffiliateData(true);
      intervalRef.current = window.setInterval(() => loadAffiliateData(false), 15000); 
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isOpen, licenseKey]);

  const loadAffiliateData = async (showLoader = false) => {
    if (showLoader) { setIsLoading(true); setLoadError(null); }
    else setIsRefreshing(true);
    setReferralLoadError(null);
    
    // DEV MODE
    if (licenseKey === 'DEV') {
        setUserData({
            id: 0, created_at: new Date().toISOString(), license_key: 'DEV', user_name: 'Developer Mode', user_email: 'dev@taap.local',
            status: 'active', credits: 9999, last_used_at: null, plan_type: 'TAAP PRO', affiliate_code: 'DEV-REF',
            affiliate_balance: 5000, total_earnings: 12500, affiliate_tier: 'Partner', successful_referrals: 42
        } as License);
        setMyReferrals([
            { joined_at: new Date().toISOString(), user_name: 'Big Buyer', affiliate_code: 'TAAP-G001', plan_type: 'TAAP PRO', status: 'active', commission_earned: 39.80, snapshot_discount: 5, snapshot_commission_rate: 20, commission_processed: true },
            { joined_at: new Date().toISOString(), user_name: 'Small Buyer', affiliate_code: 'TAAP-G002', plan_type: 'Starter', status: 'pending', commission_earned: 0, snapshot_discount: 0, snapshot_commission_rate: 20, commission_processed: false }
        ]);
        setPayoutHistory([]); setLedger([]); setLeaderboard([]);
        setIsLoading(false); setIsRefreshing(false);
        return;
    }

    try {
        if (!licenseKey) throw new Error("No License Key Provided");

        // 1. Load Main User Data
        const { data: user, error: userError } = await supabase.from('licenses').select('*').eq('license_key', licenseKey).single();
        
        if (userError) {
            if (userError.code === 'PGRST116') throw new Error("License key not found in system.");
            throw userError;
        }
        
        if (user) {
            setUserData(user);
            if(user.bank_name) setBankName(user.bank_name);
            if(user.bank_details) setAccountNumber(user.bank_details);
            if(user.bank_holder) setHolderName(user.bank_holder);
        }

        // 2. Load Supplementary Data (Non-Blocking)
        try {
            const { data: history } = await supabase.from('payout_requests').select('*').eq('license_key', licenseKey).order('created_at', { ascending: false });
            if (history) setPayoutHistory(history);
        } catch {}

        try {
            const { data: ledgerData } = await supabase.from('affiliate_logs').select('*').eq('license_key', licenseKey).order('created_at', { ascending: false }).limit(50);
            if (ledgerData) setLedger(ledgerData);
        } catch {}

        try {
            const { data: board } = await supabase.rpc('admin_get_affiliate_leaderboard');
            if (board) setLeaderboard(board);
        } catch {}

        try {
            const { data: refs, error: rpcErr2 } = await supabase.rpc('get_user_referrals', { p_license_key: licenseKey });
            if (rpcErr2) {
                console.warn("Referral Load Error:", rpcErr2);
                setReferralLoadError(extractErrorMessage(rpcErr2));
            } else {
                setMyReferrals(refs || []);
            }
        } catch {}

        if (showLoader) {
            try {
                const { data: settings } = await supabase.from('system_settings').select('*');
                if (settings) {
                    const sMap: any = {};
                    settings.forEach(s => sMap[s.key] = s.value);
                    setTierConfig({ 
                        rates: {
                            agent: parseInt(sMap['affiliate_commission_agent'] || '10'), 
                            super: parseInt(sMap['affiliate_commission_super'] || '15'), 
                            partner: parseInt(sMap['affiliate_commission_partner'] || '20')
                        },
                        thresholds: {
                            super: parseInt(sMap['tier_req_super_agent'] || '10'),
                            partner: parseInt(sMap['tier_req_partner'] || '50')
                        }
                    });
                    setReferralDiscount(parseInt(sMap['referral_discount_percent'] || '5'));
                }
            } catch {}
        }
    } catch (e: any) { 
        console.error("Affiliate Data Load Error:", e);
        if (showLoader) setLoadError(extractErrorMessage(e));
    } finally {
        if (showLoader) setIsLoading(false);
        else setIsRefreshing(false);
    }
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError(null); setFormSuccess(null);
      
      const amount = parseFloat(withdrawAmount);
      if (!userData || !amount || !bankName || !accountNumber || !holderName) { setFormError("Sila lengkapkan butiran bank."); return; }
      if (amount < 50) { setFormError("Min pengeluaran RM 50."); return; }
      if (amount > (userData.affiliate_balance || 0)) { setFormError("Baki tidak mencukupi."); return; }
      
      setIsSubmitting(true);
      
      try {
          await supabase.rpc('update_bank_details', { 
              p_license_key: licenseKey, 
              p_bank: bankName, 
              p_acc: accountNumber, 
              p_holder: holderName 
          });

          const { data, error } = await supabase.rpc('request_payout', { p_license_key: licenseKey, p_amount: amount, p_bank_details: `${bankName} - ${accountNumber} (${holderName})` });
          
          if (error) throw error;
          if (data && data.status === 'error') throw new Error(data.message);
          
          setFormSuccess("Permintaan Berjaya! Wang akan dikreditkan dalam masa 24 jam.");
          setWithdrawAmount(''); 
          await loadAffiliateData(true); 
      } catch (err: any) { 
          setFormError(extractErrorMessage(err)); 
      } finally { setIsSubmitting(false); }
  };

  const getRateValue = () => {
      if (userData?.custom_commission_rate) return userData.custom_commission_rate;
      const tier = userData?.affiliate_tier || 'Agent';
      if (tier === 'Partner') return tierConfig.rates.partner;
      if (tier === 'Super Agent') return tierConfig.rates.super;
      return tierConfig.rates.agent;
  };

  const calculateMonthlyProjection = () => {
      if (!myReferrals.length) return 0;
      
      return myReferrals.reduce((acc, ref) => {
          if (ref.status !== 'active') return acc;
          const rawPrice = ref.plan_type === 'TAAP PRO' ? 199 : 69;
          const discount = ref.snapshot_discount > 0 ? ref.snapshot_discount : referralDiscount;
          const netPrice = rawPrice * ((100 - discount) / 100);
          
          const effectiveRate = ref.snapshot_commission_rate > 0 
              ? Number(ref.snapshot_commission_rate) 
              : getRateValue();

          return acc + (netPrice * (effectiveRate / 100));
      }, 0);
  };

  // --- DYNAMIC TIER PROGRESS LOGIC ---
  const getNextTierInfo = () => {
      const current = userData?.successful_referrals || 0;
      if (current < tierConfig.thresholds.super) return { next: 'Super Agent', target: tierConfig.thresholds.super, current, rate: tierConfig.rates.super };
      if (current < tierConfig.thresholds.partner) return { next: 'Partner', target: tierConfig.thresholds.partner, current, rate: tierConfig.rates.partner };
      return { next: 'Max Level', target: current, current, rate: tierConfig.rates.partner };
  };
  const tierInfo = getNextTierInfo();
  const progressPercent = Math.min(100, (tierInfo.current / tierInfo.target) * 100);

  const filteredReferrals = myReferrals.filter(r => 
      (r.affiliate_code || r.user_name).toLowerCase().includes(referralSearch.toLowerCase()) || 
      r.plan_type.toLowerCase().includes(referralSearch.toLowerCase()) ||
      r.status.toLowerCase().includes(referralSearch.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-0 md:p-4 bg-black/70 backdrop-blur-md animate-fade-in font-sans tracking-tight">
      <div className="bg-white md:rounded-[2rem] shadow-2xl w-full max-w-5xl h-[100dvh] md:h-[85vh] flex flex-col overflow-hidden relative border-0 md:border border-gray-800">
        
        {/* --- GLOBAL CLOSE & REFRESH --- */}
        <div className="absolute top-3 right-3 md:top-4 md:right-4 z-50 flex gap-2">
            <button onClick={() => loadAffiliateData(true)} className="p-2 bg-white/90 hover:bg-white backdrop-blur rounded-full text-gray-500 hover:text-black shadow-sm transition-colors border border-gray-200" title="Refresh Data">
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={onClose} className="p-2 bg-white/90 hover:bg-red-50 backdrop-blur hover:text-red-500 rounded-full text-gray-500 shadow-sm transition-colors border border-gray-200">
                <X className="w-4 h-4" />
            </button>
        </div>

        {/* --- LAYOUT CONTAINER --- */}
        <div className="flex flex-col md:flex-row h-full">
            
            {/* --- SIDEBAR / MOBILE NAV --- */}
            <aside className="w-full md:w-72 bg-black text-white flex flex-col justify-between shrink-0 relative overflow-hidden transition-all duration-300">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
                
                {/* Header Section */}
                <div className="relative z-10 flex flex-col p-4 md:p-8">
                    <div className="flex items-center justify-between md:justify-start gap-3 md:gap-4 mb-4 md:mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg md:rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                                <Users className="w-4 h-4 md:w-6 md:h-6 text-white" />
                            </div>
                            <div>
                                <span className="text-[9px] md:text-[10px] font-bold text-orange-500 tracking-[0.2em] uppercase block mb-0.5 md:mb-1">Exclusive</span>
                                <h2 className="text-sm md:text-xl font-black text-white leading-none tracking-tight">PARTNER<br/>PROGRAM</h2>
                            </div>
                        </div>
                    </div>

                    {/* Member Code - Collapsible on Mobile */}
                    <div className="bg-gray-900 rounded-xl md:rounded-2xl p-3 md:p-5 mb-4 md:mb-6 border border-gray-800 text-center relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-500"></div>
                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Your Code</p>
                        <h1 className="text-lg md:text-2xl font-black text-white tracking-wider font-mono my-1 md:my-2 group-hover:text-orange-400 transition-colors">
                            {userData?.affiliate_code || '....'}
                        </h1>
                        <div className="hidden md:block">
                            <CopyToClipboard 
                                text={userData?.affiliate_code || ''} 
                                className="text-[10px] bg-gray-800 hover:bg-gray-700 text-gray-300 py-1.5 px-3 rounded-lg w-full flex justify-center border border-gray-700 font-bold"
                                label="COPY CODE"
                            />
                        </div>
                    </div>

                    {/* Navigation - Scrollable on Mobile */}
                    <nav className="flex md:flex-col gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
                        <NavButton active={activeTab === 'intro'} onClick={() => setActiveTab('intro')} icon={BookOpen} label="Guide" />
                        <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={LayoutGrid} label="Dashboard" />
                        <NavButton active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={Share2} label="Referral" />
                        <NavButton active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} icon={Wallet} label="Payout" />
                        <NavButton active={activeTab === 'ledger'} onClick={() => setActiveTab('ledger')} icon={FileText} label="Ledger" />
                    </nav>
                </div>

                {/* Footer / Profile - Hidden on Mobile to save space */}
                <div className="relative z-10 hidden md:block p-4 md:p-8 pt-0">
                    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
                                <User className="w-4 h-4 text-gray-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-white truncate">{userData?.user_name || 'Partner'}</p>
                                <p className="text-xs text-gray-500 truncate font-mono">{userData?.license_key || '****'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* --- MAIN --- */}
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50 relative">
                <div className="flex-1 overflow-y-auto p-4 md:p-10 pb-20 md:pb-10">
                    {isLoading ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-4">
                            <Loader2 className="w-10 h-10 text-black animate-spin" />
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Syncing Secure Financial Data...</p>
                        </div>
                    ) : loadError ? (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                            <div className="bg-red-50 p-4 rounded-full mb-4"><AlertTriangle className="w-8 h-8 text-red-500" /></div>
                            <h3 className="font-bold text-gray-900 mb-2">Connection Error</h3>
                            <p className="text-sm text-red-600 max-w-xs mx-auto mb-4 bg-red-50 p-2 rounded border border-red-100 break-words font-mono text-xs">{extractErrorMessage(loadError)}</p>
                            <button onClick={() => loadAffiliateData(true)} className="px-6 py-2 bg-black text-white rounded-lg text-xs font-bold hover:bg-gray-800">Retry Connection</button>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto">
                            
                            {/* --- INTRODUCTION TAB --- */}
                            {activeTab === 'intro' && (
                                <div className="space-y-8 animate-fade-in">
                                    <div className="text-center md:text-left border-b border-gray-200 pb-6">
                                        <h2 className="text-2xl md:text-4xl font-black text-gray-900 mb-2 tracking-tight">Partner <span className="text-orange-600">Ecosystem</span></h2>
                                        <p className="text-gray-600 text-sm md:text-lg max-w-2xl font-medium">
                                            Turn your network into net worth. Generate passive income by introducing TAAP GenPro.
                                        </p>
                                    </div>

                                    {/* HOW IT WORKS */}
                                    <div className="space-y-6">
                                        <h3 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                                            <Zap className="w-5 h-5 md:w-6 md:h-6 text-orange-600" /> How to Make Money
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            {[
                                                { step: 1, title: "Promote Code", desc: "Use your code " + (userData?.affiliate_code || 'TAAP-G...') + " in content. Place your referral link ONLY in 'Link Bio'." },
                                                { step: 2, title: "They Register", desc: `Users get a ${referralDiscount}% discount when they use your code to subscribe.` },
                                                { step: 3, title: "System Tracks", desc: "Our system automatically tags you as their 'Referrer' permanently." },
                                                { step: 4, title: "You Get Paid", desc: `Earn ${tierConfig.rates.agent}%-${tierConfig.rates.partner}% commission on every subscription renewal.` }
                                            ].map((item) => (
                                                <div key={item.step} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl text-gray-300">{item.step}</div>
                                                    <div className="relative z-10">
                                                        <h4 className="font-bold text-gray-900 mb-2">{item.title}</h4>
                                                        <p className="text-xs text-gray-600 leading-relaxed font-medium">{item.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* COMMISSION STRUCTURE */}
                                    <div className="space-y-6">
                                        <h3 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                                            <Target className="w-5 h-5 md:w-6 md:h-6 text-purple-600" /> Commission Tiers
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                                            <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6 flex flex-col items-center text-center">
                                                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-200 rounded-full flex items-center justify-center mb-4 font-black text-gray-600">1</div>
                                                <h4 className="text-lg font-bold text-gray-900">Agent</h4>
                                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-4">0 - {tierConfig.thresholds.super - 1} Referrals</p>
                                                <div className="text-3xl font-black text-gray-900 mb-2">{tierConfig.rates.agent}%</div>
                                                <p className="text-xs text-gray-500 font-medium">Commission Rate</p>
                                            </div>
                                            <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6 flex flex-col items-center text-center transform md:-translate-y-2 shadow-lg">
                                                <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-200 text-purple-700 rounded-full flex items-center justify-center mb-4 font-black">2</div>
                                                <h4 className="text-lg font-bold text-purple-900">Super Agent</h4>
                                                <p className="text-xs text-purple-600 font-bold uppercase tracking-widest mb-4">{tierConfig.thresholds.super} - {tierConfig.thresholds.partner - 1} Referrals</p>
                                                <div className="text-3xl font-black text-purple-900 mb-2">{tierConfig.rates.super}%</div>
                                                <p className="text-xs text-purple-600 font-medium">Commission Rate</p>
                                            </div>
                                            <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6 flex flex-col items-center text-center">
                                                <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-200 text-orange-700 rounded-full flex items-center justify-center mb-4 font-black">3</div>
                                                <h4 className="text-lg font-bold text-orange-900">Partner</h4>
                                                <p className="text-xs text-orange-600 font-bold uppercase tracking-widest mb-4">{tierConfig.thresholds.partner}+ Referrals</p>
                                                <div className="text-3xl font-black text-orange-900 mb-2">{tierConfig.rates.partner}%</div>
                                                <p className="text-xs text-orange-600 font-medium">Commission Rate</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* STRICT POLICIES */}
                                    <div className="bg-red-50 border border-red-200 rounded-xl p-5 mt-8">
                                        <h3 className="text-red-800 font-bold text-lg mb-3 flex items-center gap-2">
                                            <AlertTriangle className="w-5 h-5"/> Strict Partner Integrity Policy
                                        </h3>
                                        <ul className="list-disc pl-5 space-y-2 text-sm text-red-700">
                                            <li><strong>No Self-Referrals:</strong> You cannot use your own code to buy a subscription. Accounts detected doing this will be suspended immediately.</li>
                                            <li><strong>Real Users Only:</strong> Creating fake accounts to earn commission constitutes fraud.</li>
                                            <li><strong>Withdrawal Verification:</strong> Bank account name must match your registered profile name.</li>
                                            <li><strong>One Account Policy:</strong> Users are allowed only one affiliate account.</li>
                                        </ul>
                                    </div>

                                    <div className="flex justify-center pt-4">
                                        <button onClick={() => setActiveTab('home')} className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center gap-2 w-full md:w-auto justify-center">
                                            Go to Dashboard <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* --- HOME TAB --- */}
                            {activeTab === 'home' && (
                                <div className="space-y-6 md:space-y-8 animate-fade-in">
                                    <div className="flex flex-col lg:flex-row gap-6">
                                        {/* WALLET CARD */}
                                        <div className="flex-[1.5] bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl relative overflow-hidden group border border-gray-800 flex flex-col justify-between min-h-[220px]">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-white/10 transition-colors"></div>
                                            <div className="relative z-10">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Wallet Balance</span>
                                                        <h2 className="text-4xl md:text-5xl font-black tracking-tight flex items-baseline gap-1 font-mono tabular-nums">
                                                            <span className="text-lg md:text-2xl text-gray-500 font-sans font-bold">RM</span>
                                                            {Number(userData?.affiliate_balance || 0).toFixed(2)}
                                                        </h2>
                                                    </div>
                                                    <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/10">
                                                        <Wallet className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                                    </div>
                                                </div>
                                                <div className="flex gap-3">
                                                    <button onClick={() => setActiveTab('finance')} className="flex-1 bg-white text-black py-2.5 md:py-3 rounded-xl font-bold text-xs md:text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                                                        <ArrowDownLeft className="w-4 h-4" /> Withdraw
                                                    </button>
                                                    <button onClick={() => setActiveTab('products')} className="flex-1 bg-white/10 text-white py-2.5 md:py-3 rounded-xl font-bold text-xs md:text-sm hover:bg-white/20 transition-colors flex items-center justify-center gap-2 backdrop-blur-md border border-white/10">
                                                        <ArrowUpRight className="w-4 h-4" /> Promote
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* AFFILIATE JOURNEY CARD (RESTORED) */}
                                        <div className="flex-1 bg-black rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 border border-gray-800 relative overflow-hidden flex flex-col justify-center min-h-[220px]">
                                             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                                             
                                             <div className="relative z-10">
                                                 <div className="flex items-center gap-4 mb-6">
                                                     <div className="w-12 h-12 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center shadow-lg">
                                                         <User className="w-6 h-6 text-gray-400" />
                                                     </div>
                                                     <div className="min-w-0">
                                                         <h3 className="text-white font-bold text-lg truncate">{userData?.user_name || 'Partner'}</h3>
                                                         <p className="text-gray-500 text-xs font-mono uppercase tracking-widest">{userData?.affiliate_code}</p>
                                                     </div>
                                                 </div>

                                                 <div className="space-y-3">
                                                     <div className="flex justify-between items-end text-sm">
                                                         <span className="text-gray-400 font-medium">{userData?.affiliate_tier || 'Agent'}</span>
                                                         {tierInfo.next !== 'Max Level' && (
                                                             <span className="text-orange-500 font-bold text-xs flex items-center gap-1 cursor-help hover:text-orange-400 transition-colors" onClick={() => setShowTierInfo(true)}>
                                                                 Next: {tierInfo.next} <Info className="w-3 h-3"/>
                                                             </span>
                                                         )}
                                                     </div>
                                                     
                                                     <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden border border-gray-700 shadow-inner">
                                                         <div className="bg-gradient-to-r from-orange-600 to-amber-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(249,115,22,0.5)]" style={{ width: `${progressPercent}%` }}></div>
                                                     </div>
                                                     
                                                     <div className="text-right text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                                         {tierInfo.current} / {tierInfo.target} Referrals
                                                     </div>
                                                 </div>
                                             </div>
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                                        <StatCard label="Lifetime Earnings" value={`RM ${Number(userData?.total_earnings || 0).toFixed(0)}`} icon={Trophy} isMoney={true} />
                                        <StatCard label="Active Referrals" value={userData?.successful_referrals || 0} icon={Users} />
                                        <div onClick={() => setShowTierInfo(true)} className="cursor-pointer">
                                            <StatCard label="Commission Rate" value={`${getRateValue()}%`} icon={Percent} subtext="View Tiers" />
                                        </div>
                                        <StatCard label="Monthly Projection" value={`RM ${calculateMonthlyProjection().toFixed(0)}`} icon={TrendingUp} isMoney={true} subtext="Net Sales" />
                                    </div>

                                    {/* Leaderboard */}
                                    <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6 shadow-sm overflow-x-auto">
                                        <div className="flex items-center justify-between mb-4 md:mb-6 min-w-[300px]">
                                            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-base md:text-lg">
                                                <Crown className="w-5 h-5 text-orange-500 fill-current" /> Top Performers
                                            </h3>
                                            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full uppercase tracking-wide border border-gray-100">This Week</span>
                                        </div>
                                        <div className="space-y-1 min-w-[300px]">
                                            {leaderboard.slice(0, 5).map((l, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-orange-50 transition-colors group">
                                                    <div className="flex items-center gap-3 md:gap-4">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${i===0 ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-gray-100 text-gray-500'}`}>{i+1}</div>
                                                        <div>
                                                            <p className="text-xs md:text-sm font-bold text-gray-900 font-mono group-hover:text-black transition-colors">{l.masked_key || l.user_name}</p>
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase">{l.affiliate_tier}</p>
                                                        </div>
                                                    </div>
                                                    <span className="font-mono font-bold text-gray-900 text-xs md:text-sm tabular-nums">RM {Number(l.total_earnings).toLocaleString()}</span>
                                                </div>
                                            ))}
                                            {leaderboard.length === 0 && <div className="p-6 text-center text-gray-400 text-sm">Be the first to appear here!</div>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- MY REFERRAL TAB (NO QR) --- */}
                            {activeTab === 'products' && (
                                <div className="space-y-8 animate-fade-in">
                                    <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 border border-orange-200 rounded-2xl p-6 md:p-8 relative overflow-hidden">
                                        <div className="flex flex-col items-start gap-4">
                                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-orange-100">
                                                <Share2 className="w-6 h-6 text-orange-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-1">Your Referral Credentials</h3>
                                                <p className="text-xs md:text-sm text-gray-600 max-w-lg font-medium">
                                                    Use your unique code in your content captions. Place the link <strong>only in your social media bio</strong> (Link Bio). Do not spam the link publicly.
                                                </p>
                                            </div>
                                            
                                            <div className="w-full mt-4">
                                                {/* Code Card - Expanded */}
                                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3">Your Member Referral Code</span>
                                                    <div className="flex flex-col items-center gap-4">
                                                        <div className="text-4xl font-mono font-black text-gray-900 tracking-wider">
                                                            {userData?.affiliate_code || '....'}
                                                        </div>
                                                        <p className="text-sm text-gray-500 max-w-md mx-auto">Share this code with your audience. They get a discount, you get commission.</p>
                                                        <CopyToClipboard text={userData?.affiliate_code || ''} className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-xl font-bold text-sm" label="Copy Member Code" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* REFERRAL TABLE */}
                                    <div>
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                                            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-base md:text-lg">
                                                <Users className="w-5 h-5 text-gray-500" /> My Referrals <span className="text-gray-400 text-xs bg-gray-100 px-2 py-0.5 rounded-full font-bold">{filteredReferrals.length}</span>
                                            </h3>
                                            <div className="relative w-full md:w-64">
                                                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"/>
                                                <input 
                                                    type="text" 
                                                    placeholder="Search referral code..." 
                                                    value={referralSearch}
                                                    onChange={(e) => setReferralSearch(e.target.value)}
                                                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                                                />
                                            </div>
                                        </div>
                                        
                                        {referralLoadError ? (
                                            <div className="bg-orange-50 p-6 rounded-2xl border border-orange-200 text-center">
                                                <AlertTriangle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                                                <h4 className="font-bold text-orange-900 text-sm">System Maintenance Required</h4>
                                                <p className="text-xs text-orange-700 mt-1 mb-3">Database permissions for commission history are being updated.</p>
                                                <p className="text-[10px] text-gray-500 bg-white/50 px-2 py-1 rounded inline-block">Error: {referralLoadError.slice(0,50)}...</p>
                                            </div>
                                        ) : (
                                            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
                                                <table className="w-full text-left text-sm min-w-[600px]">
                                                    <thead className="bg-gray-50 border-b border-gray-200">
                                                        <tr>
                                                            <th className="p-5 font-bold text-gray-500 uppercase text-xs tracking-wider">Member ID</th>
                                                            <th className="p-5 font-bold text-gray-500 uppercase text-xs tracking-wider">Plan</th>
                                                            <th className="p-5 font-bold text-gray-500 uppercase text-xs tracking-wider">Date</th>
                                                            <th className="p-5 font-bold text-gray-500 uppercase text-xs tracking-wider text-right">Commission</th>
                                                            <th className="p-5 font-bold text-gray-500 uppercase text-xs tracking-wider text-right">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {filteredReferrals.length === 0 ? (
                                                            <tr><td colSpan={5} className="p-12 text-center text-gray-400 font-medium">No referrals found matching your search.</td></tr>
                                                        ) : filteredReferrals.map((r, i) => {
                                                            const isPaid = r.commission_earned > 0 || r.commission_processed;
                                                            const isPending = r.status === 'pending';
                                                            const isActive = r.status === 'active';
                                                            
                                                            let displayComm: React.ReactNode = <span className="text-gray-400 font-mono">-</span>;

                                                            if (isPaid) {
                                                                displayComm = (
                                                                    <div className="flex flex-col items-end">
                                                                        <span className="text-gray-900 font-bold font-mono bg-gray-100 px-2 py-1 rounded border border-gray-200 tabular-nums">+RM {Number(r.commission_earned).toFixed(2)}</span>
                                                                        <span className="text-[9px] text-gray-400 mt-0.5 font-bold uppercase tracking-wide">Paid</span>
                                                                    </div>
                                                                );
                                                            } else if (isActive || isPending) {
                                                                const rawPrice = r.plan_type === 'TAAP PRO' ? 199 : 69;
                                                                const discountToUse = r.snapshot_discount > 0 ? r.snapshot_discount : referralDiscount;
                                                                const netPrice = rawPrice * ((100 - discountToUse) / 100);
                                                                
                                                                let rateToUse = r.snapshot_commission_rate > 0 ? Number(r.snapshot_commission_rate) : getRateValue();
                                                                
                                                                const potentialComm = netPrice * (rateToUse / 100);

                                                                displayComm = (
                                                                    <div className="flex flex-col items-end opacity-80">
                                                                        <span className={`font-bold font-mono text-xs px-2 py-1 rounded border text-gray-900 bg-gray-50 border-gray-200 tabular-nums`}>
                                                                            Est. RM {potentialComm.toFixed(2)}
                                                                        </span>
                                                                        <span className="text-[9px] text-gray-400 font-bold mt-0.5 flex items-center gap-1">
                                                                            <Lock className="w-2 h-2"/> {discountToUse}% Off / {rateToUse}% Comm
                                                                        </span>
                                                                    </div>
                                                                );
                                                            }
                                                            
                                                            return (
                                                                <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                                    {/* Render Affiliate Code instead of Name if available, fallback to Name */}
                                                                    <td className="p-5 font-bold text-gray-900 font-mono text-xs tracking-wide">{r.affiliate_code || r.user_name}</td>
                                                                    <td className="p-5 text-gray-600 text-xs"><span className={`px-2.5 py-1 rounded-md font-bold text-[10px] uppercase tracking-wide border ${r.plan_type === 'TAAP PRO' ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200'}`}>{r.plan_type}</span></td>
                                                                    <td className="p-5 text-gray-500 text-xs font-mono">{safeDate(r.joined_at)}</td>
                                                                    <td className="p-5 text-right">
                                                                        {displayComm}
                                                                    </td>
                                                                    <td className="p-5 text-right">
                                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${r.status === 'active' ? 'text-green-700 bg-green-50' : r.status === 'pending' ? 'text-orange-700 bg-orange-50' : 'text-gray-500 bg-gray-100'}`}>
                                                                            {r.status}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* --- FINANCE TAB --- */}
                            {activeTab === 'finance' && (
                                <div className="space-y-8 animate-fade-in">
                                    <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                                            <h3 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-3">
                                                <Banknote className="w-6 h-6 md:w-8 md:h-8 text-gray-900" /> Request Withdrawal
                                            </h3>
                                            <div className="text-left md:text-right bg-gray-50 md:bg-transparent p-4 md:p-0 rounded-xl">
                                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Available to Withdraw</p>
                                                <p className="text-3xl font-black text-gray-900 tabular-nums">RM {Number(userData?.affiliate_balance || 0).toFixed(2)}</p>
                                            </div>
                                        </div>

                                        {/* WITHDRAWAL RULES INSERTED HERE */}
                                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8">
                                            <h4 className="text-blue-900 font-bold text-sm mb-3 flex items-center gap-2">
                                                <Info className="w-4 h-4"/> WITHDRAWAL RULES
                                            </h4>
                                            <ul className="space-y-2 text-xs text-blue-800 font-medium">
                                                <li className="flex items-start gap-2">
                                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span> 
                                                    Only once withdrawal per day.
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span> 
                                                    Process 24-48 hours.
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span> 
                                                    Too many requests will ban the account.
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span> 
                                                    Wait until 48 hours before ask for support.
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span> 
                                                    Minimum withdrawal is RM50.
                                                </li>
                                            </ul>
                                        </div>

                                        <form onSubmit={handleRequestPayout} className="space-y-8">
                                            <div className="bg-gray-50 p-4 md:p-6 rounded-2xl border border-gray-100 space-y-4 md:space-y-6">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-3 ml-1">Banking Details</label>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <input required value={bankName} onChange={e => setBankName(e.target.value)} className="w-full p-4 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-black outline-none transition-all" placeholder="Bank Name (e.g. Maybank)" />
                                                        <input required value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="w-full p-4 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-black outline-none transition-all" placeholder="Account Number" />
                                                    </div>
                                                    <input required value={holderName} onChange={e => setHolderName(e.target.value)} className="w-full mt-4 p-4 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-black outline-none transition-all" placeholder="Account Holder Name" />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-3 ml-1">Withdrawal Amount (Min RM 50)</label>
                                                <div className="relative">
                                                    <span className="absolute left-6 top-5 text-gray-400 font-bold text-lg">RM</span>
                                                    <input 
                                                        type="number" 
                                                        value={withdrawAmount} 
                                                        onChange={e => setWithdrawAmount(e.target.value)} 
                                                        className="w-full pl-16 p-5 bg-white border-2 border-gray-200 rounded-2xl text-2xl font-bold focus:border-black focus:ring-0 outline-none transition-all placeholder-gray-300 tabular-nums" 
                                                        placeholder="0.00" 
                                                        min="50"
                                                    />
                                                </div>
                                            </div>

                                            {formError && <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl flex items-center gap-3 border border-red-100"><AlertCircle className="w-5 h-5"/> {formError}</div>}
                                            {formSuccess && <div className="p-4 bg-green-50 text-green-600 text-sm font-bold rounded-xl flex items-center gap-3 border border-green-100"><CheckCircle2 className="w-5 h-5"/> {formSuccess}</div>}

                                            <button type="submit" disabled={isSubmitting} className="w-full bg-black hover:bg-gray-900 text-white font-bold py-5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-70 transform active:scale-[0.99] text-base">
                                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin"/> : "Confirm Withdrawal Request"}
                                            </button>
                                        </form>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-2">
                                            <h3 className="font-bold text-gray-900 text-lg">Withdrawal History</h3>
                                            <button 
                                                onClick={() => loadAffiliateData(false)} 
                                                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh Status
                                            </button>
                                        </div>
                                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100">
                                            {payoutHistory.length === 0 ? <div className="p-12 text-center text-gray-400 text-sm font-medium">No payout history.</div> : payoutHistory.map(p => (
                                                <div key={p.id} className="p-4 md:p-6 flex flex-col gap-2 hover:bg-gray-50 transition-colors">
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-3 md:gap-4">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                                                p.status === 'approved' ? 'bg-gray-200 text-gray-700' :
                                                                p.status === 'rejected' ? 'bg-gray-200 text-gray-700' :
                                                                'bg-gray-200 text-gray-700'
                                                            }`}>
                                                                {p.status === 'approved' ? <CheckCircle2 className="w-4 h-4"/> : p.status === 'rejected' ? <AlertCircle className="w-4 h-4"/> : <Clock className="w-4 h-4"/>}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-900 text-sm">Withdrawal Request</p>
                                                                <p className="text-xs text-gray-500 font-mono">{safeDate(p.created_at)}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-mono font-bold text-gray-900 text-lg tabular-nums">- RM {Number(p.amount).toFixed(2)}</p>
                                                            <p className={`text-[10px] font-bold uppercase tracking-wide ${
                                                                p.status === 'approved' ? 'text-green-600' :
                                                                p.status === 'rejected' ? 'text-red-600' :
                                                                'text-orange-600'
                                                            }`}>{p.status}</p>
                                                        </div>
                                                    </div>
                                                    {p.admin_note && <p className="text-xs text-gray-500 italic pl-12 border-l-2 border-gray-100 ml-4 font-medium">Admin Note: {p.admin_note}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* --- LEDGER TAB --- */}
                            {activeTab === 'ledger' && (
                                <div className="space-y-6 animate-fade-in">
                                    <h2 className="text-2xl font-black text-gray-900">Transaction Ledger</h2>
                                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-x-auto">
                                        <table className="w-full text-left text-sm min-w-[500px]">
                                            <thead className="bg-gray-50 border-b border-gray-200"><tr className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                <th className="p-4">Date</th><th className="p-4">Type</th><th className="p-4">Description</th><th className="p-4 text-right">Amount</th>
                                            </tr></thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {ledger.length === 0 ? (
                                                    <tr><td colSpan={4} className="p-10 text-center text-gray-400 font-medium">No transactions recorded.</td></tr>
                                                ) : ledger.map(l => (
                                                    <tr key={l.id} className="hover:bg-gray-50">
                                                        <td className="p-4 text-gray-500 text-xs font-mono">{safeDate(l.created_at)}</td>
                                                        <td className="p-4"><span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-gray-100 text-gray-600`}>{l.type}</span></td>
                                                        <td className="p-4 text-gray-600 text-xs max-w-xs truncate font-medium">{l.description}</td>
                                                        <td className={`p-4 text-right font-bold font-mono tabular-nums text-gray-900`}>
                                                            {l.amount > 0 ? '+' : ''}RM {Number(l.amount).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}
                </div>
            </main>
        </div>
        
        {/* Tier Info Modal */}
        {showTierInfo && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in" onClick={() => setShowTierInfo(false)}>
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full space-y-4" onClick={e => e.stopPropagation()}>
                    <h3 className="font-bold text-lg text-gray-900">Commission Tiers</h3>
                    <div className="space-y-3 font-medium">
                        <div className="flex justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"><span>Agent: <strong>{tierConfig.rates.agent}%</strong></span><span className="text-xs text-gray-400">0+ Refs</span></div>
                        <div className="flex justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"><span>Super Agent: <strong>{tierConfig.rates.super}%</strong></span><span className="text-xs text-gray-400">{tierConfig.thresholds.super}+ Refs</span></div>
                        <div className="flex justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"><span>Partner: <strong>{tierConfig.rates.partner}%</strong></span><span className="text-xs text-gray-400">{tierConfig.thresholds.partner}+ Refs</span></div>
                    </div>
                    <button onClick={() => setShowTierInfo(false)} className="w-full mt-4 bg-gray-900 text-white py-2 rounded-lg text-sm font-bold">Close</button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

const StatCard: React.FC<{label: string, value: string|number, icon: any, isMoney?: boolean, subtext?: string}> = ({label, value, icon: Icon, isMoney, subtext}) => (
    <div className="bg-white border border-gray-200 p-4 md:p-5 rounded-xl shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
            <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</p>
            <Icon className="w-4 h-4 text-gray-300" />
        </div>
        <p className={`text-2xl md:text-3xl font-black mt-2 text-gray-900 ${isMoney ? 'font-mono tracking-tight tabular-nums' : ''}`}>{value}</p>
        {subtext && <p className="text-[10px] text-gray-400 mt-1 font-medium">{subtext}</p>}
    </div>
);

const NavButton: React.FC<{active: boolean, onClick: () => void, icon: any, label: string}> = ({active, onClick, icon: Icon, label}) => (
    <button
        onClick={onClick}
        className={`whitespace-nowrap px-3 py-2 md:px-4 md:py-3 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 md:gap-3 transition-all tracking-tight ${
            active
            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30'
            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
        }`}
    >
        <Icon className="w-4 h-4 shrink-0" />
        <span className="">{label}</span>
    </button>
);
