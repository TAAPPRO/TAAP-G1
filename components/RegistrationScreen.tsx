
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { CheckCircle, Loader2, User, Mail, Phone, LogOut, ArrowRight, Wifi, ImageOff, Crown, Check, X, ShieldCheck, CreditCard, ArrowLeft, Globe, Server, Lock, Download, AlertTriangle, Zap } from 'lucide-react';
import { CopyToClipboard } from './CopyToClipboard';
import { Package } from '../types';

interface RegistrationScreenProps {
  onBack: () => void;
  onShowTerms: () => void;
}

// --- CONFIGURATION ---
const LOCAL_QR_URL = "/maybank-qr.jpg";
const PENDING_REF_STORAGE = "taap_pending_ref";

const COUNTRIES = [
    { name: 'Malaysia', code: 'MY', status: 'online', flag: '🇲🇾' },
    { name: 'Indonesia', code: 'ID', status: 'offline', flag: '🇮🇩' },
    { name: 'Singapore', code: 'SG', status: 'offline', flag: '🇸🇬' },
    { name: 'Thailand', code: 'TH', status: 'offline', flag: '🇹🇭' },
];

type Step = 'packages' | 'payment' | 'form' | 'success';

export const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ onBack, onShowTerms }) => {
  // Wizard State
  const [currentStep, setCurrentStep] = useState<Step>('packages');
  const [packages, setPackages] = useState<Package[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [adminPhone, setAdminPhone] = useState("60176162761");
  
  // Data State
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', referralCode: '' });
  const [licenseKey, setLicenseKey] = useState<string>('');
  
  // Referral State
  const [referralCodeInput, setReferralCodeInput] = useState('');
  const [verifiedDiscount, setVerifiedDiscount] = useState<number>(0); // Percentage
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [codeMessage, setCodeMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrSrc, setQrSrc] = useState(LOCAL_QR_URL);
  const [imgError, setImgError] = useState(false);

  // Auto-fill and AUTO-VERIFY effect
  useEffect(() => {
    const savedRef = localStorage.getItem(PENDING_REF_STORAGE);
    if (savedRef) {
      setReferralCodeInput(savedRef);
      // Auto trigger verification if code exists
      setTimeout(() => verifyReferral(savedRef), 500); 
    }
    fetchDynamicData();
  }, []);

  const fetchDynamicData = async () => {
      setLoadingPackages(true);
      try {
          // 1. Fetch Packages
          const { data: pkgData, error: pkgError } = await supabase
              .from('packages')
              .select('*')
              .eq('is_active', true)
              .order('price', { ascending: true });
          
          if (!pkgError && pkgData) {
              const safeData = pkgData.map((p: any) => ({
                  ...p,
                  features: Array.isArray(p.features) ? p.features : (typeof p.features === 'string' ? JSON.parse(p.features) : [])
              }));
              setPackages(safeData);
          } else {
              setPackages([]); // Ensure no outdated data
          }

          // 2. Fetch Admin Phone & QR
          const { data: settings } = await supabase.from('system_settings').select('key,value');
          if (settings) {
              const phone = settings.find(s => s.key === 'admin_whatsapp');
              if (phone) setAdminPhone(phone.value);

              const qr = settings.find(s => s.key === 'payment_qr_url');
              if (qr && qr.value.startsWith('http')) {
                  setQrSrc(qr.value);
              } else {
                  setQrSrc(LOCAL_QR_URL);
              }
          }

      } catch (err) {
          console.error("Failed to fetch dynamic data:", err);
      } finally {
          setLoadingPackages(false);
      }
  };

  // --- HANDLERS ---

  const verifyReferral = async (code: string) => {
      if (!code.trim()) return;
      setIsVerifyingCode(true);
      setCodeMessage(null);
      setVerifiedDiscount(0);

      try {
          // 1. Check if code exists
          const { data: exists, error } = await supabase.rpc('check_affiliate_code', { p_code: code.trim().toUpperCase() });
          
          if (!exists) {
              setCodeMessage({ type: 'error', text: 'Invalid Code' });
              return;
          }

          // 2. Fetch Discount % from system settings
          const { data: settings } = await supabase.from('system_settings').select('value').eq('key', 'referral_discount_percent').single();
          const discount = settings ? parseInt(settings.value) : 0;

          if (discount > 0) {
              setVerifiedDiscount(discount);
              setCodeMessage({ type: 'success', text: `Success! ${discount}% Discount Applied (Locked for 12 Months).` });
              setFormData(prev => ({ ...prev, referralCode: code.trim().toUpperCase() }));
          } else {
              setCodeMessage({ type: 'error', text: 'Code valid but no discount active.' });
          }

      } catch (e) {
          console.error(e);
          setCodeMessage({ type: 'error', text: 'Verification Failed' });
      } finally {
          setIsVerifyingCode(false);
      }
  };

  const handleVerifyReferral = () => verifyReferral(referralCodeInput);

  const getDiscountedPrice = (price: number) => {
      if (!verifiedDiscount) return price;
      return price - (price * (verifiedDiscount / 100));
  };

  // --- STEP 1: SELECT PACKAGE ---
  const handleSelectPackage = (pkg: Package) => {
      setSelectedPackage(pkg);
      setCurrentStep('payment');
      window.scrollTo(0,0);
  };

  // --- STEP 2: CONFIRM PAYMENT ---
  const handlePaymentDone = () => {
      setCurrentStep('form');
      window.scrollTo(0,0);
  };

  // --- STEP 3: SUBMIT REGISTRATION ---
  const generateKey = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const p1 = Array(4).fill(0).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    const p2 = Array(4).fill(0).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    return `TAAP-${p1}-${p2}-2025`;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const newKey = generateKey();

    // FAILSAFE: Use input value if verified value is missing
    const finalReferralCode = formData.referralCode || referralCodeInput.trim().toUpperCase() || null;

    try {
      const { data, error: rpcError } = await supabase.rpc('register_new_user', {
        p_license_key: newKey,
        p_name: formData.name,
        p_email: formData.email,
        p_phone: formData.phone,
        p_plan: selectedPackage?.name || 'Basic Plan', // Use dynamic name
        p_referral_code: finalReferralCode,
        p_snapshot_discount: verifiedDiscount // VITAL: Pass the discount to lock it in DB
      });

      if (rpcError) throw rpcError;
      if (data && data.status === 'error') throw new Error(data.message || "Registration failed");

      setLicenseKey(newKey);
      setCurrentStep('success');
      window.scrollTo(0,0);
    } catch (err: any) {
      if (err.message.includes('Email already registered')) {
          setError("Emel ini telah didaftarkan. Sila log masuk atau hubungi admin.");
      } else {
          setError(err.message || "Pendaftaran gagal. Sila cuba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 4: WHATSAPP ADMIN ---
  const handleWhatsAppAdmin = () => {
      if (!selectedPackage) return;
      
      const finalPrice = getDiscountedPrice(selectedPackage.price);

      let message = `*NEW SUBSCRIBER REGISTRATION*\n\n`;
      message += `Nama: ${formData.name}\n`;
      message += `Emel: ${formData.email}\n`;
      message += `Phone: ${formData.phone}\n`;
      message += `Package: *${selectedPackage.name}*\n`;
      message += `Original Price: RM ${selectedPackage.price}\n`;
      
      const appliedCode = formData.referralCode || referralCodeInput.trim().toUpperCase();

      if (appliedCode) {
          message += `Referral Code: ${appliedCode} (${verifiedDiscount}% OFF)\n`;
      }
      
      message += `Final Paid: *RM ${finalPrice.toFixed(2)}*\n`;
      message += `License Key: *${licenseKey}*\n`;
      message += `\n[Payment Receipt Attached]\n`;
      message += `Please approve my account. Thank you!`;

      window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleDownloadKey = () => {
      const content = `TAAP GENPRO LICENSE KEY\n\nNAME: ${formData.name}\nEMAIL: ${formData.email}\nKEY: ${licenseKey}\n\nIMPORTANT: Keep this key safe. Do not share it.`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TAAP-LICENSE-${formData.name.replace(/\s+/g, '-')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };

  // --- RENDER HELPERS ---
  const ProgressBar = () => {
      const steps = ['Plan', 'Payment', 'Details', 'Done'];
      const currentIdx = ['packages', 'payment', 'form', 'success'].indexOf(currentStep);
      
      return (
          <div className="flex items-center justify-center mb-8 w-full max-w-lg mx-auto">
              {steps.map((label, idx) => (
                  <div key={idx} className="flex items-center">
                      <div className={`
                          flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-colors
                          ${idx <= currentIdx ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-500'}
                      `}>
                          {idx + 1}
                      </div>
                      <span className={`ml-2 text-xs font-medium mr-4 hidden sm:block ${idx <= currentIdx ? 'text-orange-600' : 'text-gray-400'}`}>{label}</span>
                      {idx < steps.length - 1 && <div className={`h-0.5 w-8 mr-4 ${idx < currentIdx ? 'bg-orange-600' : 'bg-gray-200'}`}></div>}
                  </div>
              ))}
          </div>
      );
  };

  const handleQrError = () => {
      if (qrSrc !== LOCAL_QR_URL) {
          console.warn("Remote QR failed, reverting to local.");
          setQrSrc(LOCAL_QR_URL);
      } else {
          setImgError(true);
      }
  };

  return (
    <div className="min-h-[100dvh] bg-gray-50 py-12 px-4 font-sans flex flex-col items-center">
        
        {/* Navigation / Header */}
        <div className="w-full max-w-5xl flex justify-between items-center mb-8">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold text-sm transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back Home
            </button>
            <div className="flex flex-col items-end leading-none select-none">
                <span className="text-[9px] font-bold text-orange-500 tracking-[0.4em] uppercase">G E N P R O</span>
                <span className="text-2xl font-black text-gray-900 tracking-tighter">TAAP</span>
            </div>
        </div>

        <ProgressBar />

        <div className="max-w-5xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 min-h-[500px]">
            
            {/* --- STEP 1: PACKAGES & REFERRAL --- */}
            {currentStep === 'packages' && (
                <div className="p-8 md:p-12">
                    <div className="text-center mb-10">
                        <h3 className="text-3xl font-extrabold text-gray-900">Pilih Pakej Langganan</h3>
                        <p className="text-gray-500 mt-2">Pilih plan yang sesuai dengan bisnes anda. Naik taraf bila-bila masa.</p>
                    </div>

                    {/* REFERRAL CODE SECTION (UPDATED UI) */}
                    <div className="max-w-md mx-auto mb-10 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-xl p-5 shadow-sm">
                        <label className="block text-xs font-bold text-purple-800 uppercase mb-2 flex items-center gap-2 tracking-wide">
                            <Crown className="w-4 h-4 text-purple-600 fill-current" /> Invited by Super Member?
                        </label>
                        <div className="flex gap-2">
                            <input 
                                value={referralCodeInput}
                                onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                                placeholder="ENTER CODE"
                                className="flex-1 p-2.5 rounded-lg border border-purple-200 text-sm font-mono uppercase focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                                disabled={verifiedDiscount > 0}
                            />
                            <button 
                                onClick={verifiedDiscount > 0 ? () => { setVerifiedDiscount(0); setReferralCodeInput(''); setCodeMessage(null); setFormData(p => ({...p, referralCode: ''})) } : handleVerifyReferral}
                                disabled={isVerifyingCode || (!referralCodeInput && verifiedDiscount === 0)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm ${verifiedDiscount > 0 ? 'bg-red-50 text-white' : 'bg-purple-900 text-white hover:bg-black disabled:opacity-50'}`}
                            >
                                {isVerifyingCode ? <Loader2 className="w-4 h-4 animate-spin"/> : (verifiedDiscount > 0 ? 'Remove' : 'Apply')}
                            </button>
                        </div>
                        {codeMessage && (
                            <div className={`text-xs font-bold mt-2 flex items-center gap-1 ${codeMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {codeMessage.type === 'success' ? <Check className="w-3 h-3"/> : <X className="w-3 h-3"/>}
                                {codeMessage.text}
                            </div>
                        )}
                        <p className="text-[10px] text-purple-400 mt-2 italic">Masukkan kod ahli untuk dapatkan harga istimewa.</p>
                    </div>

                    {loadingPackages ? (
                        <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-orange-500"/></div>
                    ) : packages.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <AlertTriangle className="w-12 h-12 text-orange-400 mx-auto mb-3" />
                            <h3 className="font-bold text-gray-700">Plans Unavailable</h3>
                            <p className="text-sm text-gray-500 mt-1">Please check back later or contact support.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            {packages.map((pkg) => {
                                const discountedPrice = getDiscountedPrice(pkg.price);
                                return (
                                    <div 
                                        key={pkg.id} 
                                        className={`
                                            relative border-2 rounded-2xl p-6 flex flex-col hover:shadow-xl transition-all cursor-pointer group
                                            ${pkg.is_popular ? 'border-orange-500 bg-orange-50/10' : 'border-gray-200 hover:border-blue-300'}
                                        `}
                                        onClick={() => handleSelectPackage(pkg)}
                                    >
                                        {pkg.is_popular && <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-lg">BEST VALUE</div>}
                                        
                                        <div className="mb-4">
                                            <h4 className="text-xl font-bold text-gray-900">{pkg.name}</h4>
                                            <div className="flex flex-col mt-2">
                                                {/* Price Display Logic */}
                                                {verifiedDiscount > 0 ? (
                                                    <div className="flex flex-col items-start gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-lg text-gray-400 line-through decoration-red-500 decoration-2">RM {pkg.price}</span>
                                                            <span className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-bold">12 MONTHS DEAL</span>
                                                        </div>
                                                        <span className="text-3xl font-black text-green-600">RM {discountedPrice.toFixed(2)}</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-baseline gap-1">
                                                        {pkg.old_price && <span className="text-sm text-gray-400 line-through decoration-red-500 decoration-2">RM {pkg.old_price}</span>}
                                                        <span className="text-3xl font-black text-gray-900">RM {pkg.price}</span>
                                                    </div>
                                                )}
                                                <span className="text-xs text-gray-500">{pkg.period}</span>
                                            </div>
                                            
                                            {/* DYNAMIC CREDIT VALUE */}
                                            <span className={`inline-flex items-center gap-1 mt-2 px-3 py-1.5 text-xs font-bold rounded-lg border ${pkg.is_popular ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                                <Zap className="w-3 h-3 fill-current"/> {pkg.credits} Neural Credits
                                            </span>
                                        </div>

                                        <ul className="space-y-3 mb-8 flex-1">
                                            {pkg.features.map((f, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                                                    <CheckCircle className={`w-4 h-4 mt-0.5 ${pkg.is_popular ? 'text-orange-500' : 'text-blue-500'}`} />
                                                    <span className="leading-tight">{f}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <button className={`w-full py-3 rounded-xl font-bold text-sm transition-colors ${pkg.is_popular ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
                                            Choose {pkg.name}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* --- STEP 2: PAYMENT (FINTECH TERMINAL STYLE) --- */}
            {currentStep === 'payment' && selectedPackage && (
                <div className="flex flex-col md:flex-row h-full min-h-[600px]">
                    
                    {/* LEFT PANEL: DARK QR TERMINAL */}
                    <div className="w-full md:w-5/12 bg-gray-900 text-white p-8 flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-gray-800/50 to-black/80 pointer-events-none"></div>
                        
                        <div className="relative z-10 w-full max-w-sm">
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-[10px] font-bold uppercase tracking-widest mb-3 animate-pulse">
                                    <Wifi className="w-3 h-3" /> Secure Gateway Active
                                </div>
                                <h3 className="text-2xl font-bold text-white tracking-tight">Scan to Pay</h3>
                                <p className="text-gray-400 text-xs mt-2">DuitNow QR / E-Wallet Supported</p>
                            </div>

                            <div className="bg-white p-5 rounded-3xl shadow-2xl mx-auto w-72 h-72 flex items-center justify-center relative group">
                                <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
                                <div className="relative w-full h-full bg-white rounded-2xl flex items-center justify-center overflow-hidden">
                                    {imgError ? (
                                        <div className="text-center p-4 text-gray-500">
                                            <ImageOff className="w-8 h-8 mx-auto mb-2" />
                                            <p className="text-xs font-bold">QR Load Failed</p>
                                        </div>
                                    ) : (
                                        <img src={qrSrc} alt="DuitNow QR" className="w-full h-full object-contain" onError={handleQrError} />
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 bg-gray-800/50 backdrop-blur-md rounded-xl p-4 border border-gray-700 text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">Payment Reference Code</p>
                                <p className="text-xl font-mono font-bold text-white tracking-widest">{selectedPackage.ref_code}</p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL: DETAILS & SUMMARY */}
                    <div className="w-full md:w-7/12 p-8 flex flex-col bg-white overflow-y-auto">
                        <button onClick={() => setCurrentStep('packages')} className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-800 mb-8 w-fit group transition-colors">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> CANCEL TRANSACTION
                        </button>

                        <div className="space-y-8 flex-1">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900">Order Summary</h2>
                                <p className="text-gray-500 text-sm mt-1">Please confirm details before proceeding.</p>
                            </div>

                            {/* REGIONAL STATUS GRID */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                        <Globe className="w-3 h-3" /> Regional Gateway Status
                                    </h4>
                                    <span className="text-[10px] text-gray-400 flex items-center gap-1"><Server className="w-3 h-3"/> Asia-Pacific Node</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {COUNTRIES.map(c => (
                                        <div key={c.code} className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${c.status === 'online' ? 'bg-green-50/50 border-green-200 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-60 grayscale'}`}>
                                            <span className="text-lg">{c.flag}</span>
                                            <div className="flex flex-col">
                                                <span className={`text-[10px] font-bold ${c.status === 'online' ? 'text-gray-900' : 'text-gray-500'}`}>{c.code}</span>
                                                <div className={`w-1.5 h-1.5 rounded-full ${c.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ORDER BREAKDOWN */}
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 font-medium">Subtotal ({selectedPackage.name})</span>
                                        <span className="text-gray-900 font-bold">RM {selectedPackage.price.toFixed(2)}</span>
                                    </div>
                                    {verifiedDiscount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Referral Discount</span>
                                            <span className="text-green-600 font-bold">- RM {(selectedPackage.price - getDiscountedPrice(selectedPackage.price)).toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="h-px bg-gray-200 my-2"></div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm font-bold text-gray-500">Total Payable</span>
                                        <span className="text-4xl font-black text-gray-900 tracking-tight">RM {getDiscountedPrice(selectedPackage.price).toFixed(2)}</span>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={handlePaymentDone}
                                    className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-green-500/30 transition-all flex items-center justify-center gap-3 transform active:scale-[0.99]"
                                >
                                    I Have Made Payment <ArrowRight className="w-5 h-5" />
                                </button>
                                <p className="text-[10px] text-center text-gray-400 mt-3 flex items-center justify-center gap-1">
                                    <Lock className="w-3 h-3" /> 256-bit SSL Secure Transaction
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- STEP 3: DETAILS FORM --- */}
            {currentStep === 'form' && (
                <div className="p-8 md:p-12 max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-gray-900">Lengkapkan Pendaftaran</h3>
                        <p className="text-gray-500 text-sm mt-1">Masukkan butiran untuk akaun baru anda.</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm flex items-start gap-2">
                                <X className="w-5 h-5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nama Penuh</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Ali Bin Abu" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Alamat Emel</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" placeholder="ali@gmail.com" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">No. Telefon (WhatsApp)</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                    <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" placeholder="0123456789" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-500 flex items-start gap-3">
                            <input type="checkbox" required className="mt-1 w-4 h-4 text-orange-600 rounded focus:ring-orange-500" />
                            <span>
                                Saya bersetuju dengan <button type="button" onClick={onShowTerms} className="text-orange-600 underline font-bold">Terma & Syarat</button>. 
                                Saya faham bahawa akaun perlu diaktifkan oleh admin selepas bayaran disahkan.
                            </span>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Hantar Pendaftaran"}
                        </button>
                    </form>
                </div>
            )}

            {/* --- STEP 4: SUCCESS --- */}
            {currentStep === 'success' && (
                <div className="p-8 md:p-12 text-center h-full flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 mb-2">Pendaftaran Berjaya!</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-8">
                        Tahniah! Akaun anda telah dicipta. Sila simpan <strong>License Key</strong> anda dan hantar resit kepada Admin untuk pengaktifan segera.
                    </p>

                    <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6 max-w-sm w-full mb-4 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-orange-500"></div>
                        <p className="text-xs font-bold text-orange-800 uppercase tracking-widest mb-2">Your License Key</p>
                        <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-orange-100 shadow-inner">
                            <code className="text-lg font-mono font-bold text-gray-900 tracking-wider">{licenseKey}</code>
                            <CopyToClipboard text={licenseKey} className="bg-orange-100 text-orange-700 hover:bg-orange-200" />
                        </div>
                        <p className="text-[10px] text-orange-600 mt-2 italic">*Simpan kunci ini. Ia diperlukan untuk Login.*</p>
                    </div>

                    <button 
                        onClick={handleDownloadKey}
                        className="mb-6 text-xs font-bold text-gray-500 hover:text-orange-600 flex items-center gap-1 underline"
                    >
                        <Download className="w-3 h-3"/> Download Key Backup (.txt)
                    </button>

                    <button 
                        onClick={handleWhatsAppAdmin}
                        className="w-full max-w-sm bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-600/30 transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1"
                    >
                        <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-6 h-6" alt="WA" />
                        Hantar Resit & Key (WhatsApp)
                    </button>
                    
                    <button onClick={onBack} className="mt-6 text-gray-400 hover:text-gray-600 text-sm font-bold flex items-center gap-2">
                        <LogOut className="w-4 h-4" /> Kembali ke Halaman Utama
                    </button>
                </div>
            )}

        </div>
    </div>
  );
};
