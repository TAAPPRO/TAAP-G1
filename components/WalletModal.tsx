
import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Zap, Shield, Crown, ArrowLeft, ImageOff, Ticket, Loader2, Globe, Wifi, WifiOff, Lock, Server, AlertTriangle, Star } from 'lucide-react';
import { CopyToClipboard } from './CopyToClipboard';
import { supabase } from '../services/supabaseClient';
import { Package } from '../types';

// Fallback config
const LOCAL_QR_URL = "/maybank-qr.jpg";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCredits: number;
  licenseKey?: string;
  initialPackageId?: number | null; 
}

interface CouponData {
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
}

const COUNTRIES = [
    { name: 'Malaysia', code: 'MY', status: 'online', flag: '🇲🇾' },
    { name: 'Indonesia', code: 'ID', status: 'offline', flag: '🇮🇩' },
    { name: 'Singapore', code: 'SG', status: 'offline', flag: '🇸🇬' },
    { name: 'Thailand', code: 'TH', status: 'offline', flag: '🇹🇭' },
    { name: 'Philippines', code: 'PH', status: 'offline', flag: '🇵🇭' },
];

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, currentCredits, licenseKey, initialPackageId }) => {
  const [view, setView] = useState<'selection' | 'payment'>('selection');
  const [packages, setPackages] = useState<Package[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);
  const [adminPhone, setAdminPhone] = useState("60176162761");
  
  // Image Handling State
  const [qrSrc, setQrSrc] = useState(LOCAL_QR_URL);
  const [imgError, setImgError] = useState(false);

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null);
  const [isVerifyingCoupon, setIsVerifyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
        setImgError(false);
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponError(null);
        fetchDynamicData();
    }
  }, [isOpen]);

  useEffect(() => {
      if (packages.length > 0 && initialPackageId) {
          const pkg = packages.find(p => p.id === initialPackageId);
          if (pkg) {
              setSelectedPkg(pkg);
              setView('payment');
          }
      }
  }, [packages, initialPackageId]);

  const fetchDynamicData = async () => {
      setLoadingPackages(true);
      try {
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
              setPackages([]); 
          }

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

  const handleQrError = () => {
      if (qrSrc !== LOCAL_QR_URL) {
          console.warn("Remote QR failed, reverting to local.");
          setQrSrc(LOCAL_QR_URL);
      } else {
          setImgError(true);
      }
  };

  const handleVerifyCoupon = async () => {
      if (!couponCode.trim()) return;
      setIsVerifyingCoupon(true);
      setCouponError(null);
      setAppliedCoupon(null);

      try {
          const { data, error } = await supabase.rpc('verify_coupon', { p_code: couponCode.trim() });
          
          if (error || (data && data.status === 'error')) {
              throw new Error(error?.message || data?.message || "Invalid Coupon");
          }

          setAppliedCoupon(data.data);
      } catch (err: any) {
          setCouponError(err.message);
      } finally {
          setIsVerifyingCoupon(false);
      }
  };

  const calculateFinalPrice = () => {
      if (!selectedPkg) return 0;
      let price = selectedPkg.price;
      
      if (appliedCoupon) {
          if (appliedCoupon.type === 'percentage') {
              price = price - (price * (appliedCoupon.value / 100));
          } else {
              price = price - appliedCoupon.value;
          }
      }
      return Math.max(0, price); 
  };

  const handleWhatsApp = () => {
    if (!selectedPkg) return;
    
    const finalPrice = calculateFinalPrice();
    let message = `Hi Admin, saya nak langgan/renew plan TAAP GENPRO.\n\n`;
    message += `Pakej: *${selectedPkg.name}* (${selectedPkg.period})\n`;
    
    if (appliedCoupon) {
        message += `Harga Asal: RM ${selectedPkg.price}\n`;
        message += `Kupon: ${appliedCoupon.code} (-${appliedCoupon.type === 'percentage' ? appliedCoupon.value + '%' : 'RM ' + appliedCoupon.value})\n`;
        message += `Total Bayaran: *RM ${finalPrice.toFixed(2)}*\n\n`;
    } else {
        message += `Total Bayaran: *RM ${finalPrice.toFixed(2)}*\n\n`;
    }

    message += `Resit bayaran disertakan.\n`;
    if (licenseKey) message += `License Key: *${licenseKey}*`;
    
    window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const getThemeClasses = (color: string | undefined, isPopular: boolean) => {
      const base = "relative rounded-2xl border-2 p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col";
      const c = color || (isPopular ? 'orange' : 'blue'); // Fallback

      switch(c) {
          case 'purple': return `${base} border-purple-200 hover:border-purple-400 bg-purple-50/30 ring-purple-100`;
          case 'green': return `${base} border-green-200 hover:border-green-400 bg-green-50/30 ring-green-100`;
          case 'red': return `${base} border-red-200 hover:border-red-400 bg-red-50/30 ring-red-100`;
          case 'black': return `${base} border-gray-300 hover:border-gray-500 bg-gray-50 ring-gray-200`;
          case 'blue': return `${base} border-blue-200 hover:border-blue-400 bg-blue-50/30 ring-blue-100`;
          default: return `${base} border-orange-200 hover:border-orange-400 bg-orange-50/30 ring-orange-100`; // Orange default
      }
  };

  const getButtonClass = (color: string | undefined) => {
      const base = "w-full py-3 rounded-xl text-xs font-bold transition-colors shadow-lg";
      const c = color || 'blue';
      switch(c) {
          case 'purple': return `${base} bg-purple-600 text-white hover:bg-purple-700`;
          case 'green': return `${base} bg-green-600 text-white hover:bg-green-700`;
          case 'red': return `${base} bg-red-600 text-white hover:bg-red-700`;
          case 'black': return `${base} bg-gray-900 text-white hover:bg-black`;
          case 'blue': return `${base} bg-blue-600 text-white hover:bg-blue-700`;
          default: return `${base} bg-orange-600 text-white hover:bg-orange-700`;
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] md:h-auto md:max-h-[90vh] flex flex-col md:flex-row overflow-hidden relative">
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 z-50 p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors text-white md:text-gray-500"
        >
            <X className="w-5 h-5" />
        </button>

        {/* --- VIEW 1: PACKAGE SELECTION --- */}
        {view === 'selection' && (
            <div className="w-full p-6 md:p-10 overflow-y-auto">
                <div className="text-center mb-10">
                    <span className="text-orange-600 font-bold tracking-widest uppercase text-xs mb-2 block">Monthly Subscription</span>
                    <h2 className="text-3xl font-black text-gray-900 mb-3">Pilih Plan Anda</h2>
                    <p className="text-gray-500 text-sm max-w-lg mx-auto">Naik taraf had penggunaan anda. Kredit akan di-renew setiap bulan.</p>
                </div>

                {loadingPackages ? (
                    <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-orange-500"/></div>
                ) : packages.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <AlertTriangle className="w-12 h-12 text-orange-400 mx-auto mb-3" />
                        <h3 className="font-bold text-gray-700">No Packages Found</h3>
                        <p className="text-sm text-gray-500 mt-1">Please contact admin to enable subscription plans.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                        {packages.map((pkg) => {
                            const themeColor = pkg.color_theme || (pkg.is_popular ? 'orange' : 'blue');
                            return (
                                <div 
                                    key={pkg.id} 
                                    onClick={() => { setSelectedPkg(pkg); setView('payment'); }}
                                    className={getThemeClasses(themeColor, pkg.is_popular)}
                                >
                                    {pkg.is_popular && (
                                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-4 py-1 rounded-full shadow-lg flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-current" /> POPULAR
                                        </div>
                                    )}
                                    
                                    <div className="mb-4 text-center">
                                        <h3 className="font-bold text-gray-900 text-xl">{pkg.name}</h3>
                                        <div className="flex items-baseline justify-center gap-1 mt-1">
                                            {pkg.old_price && <span className="text-xs text-gray-400 line-through">{pkg.old_price}</span>}
                                            <span className="text-4xl font-black text-gray-900">{pkg.price}</span>
                                            <span className="text-xs text-gray-500 font-medium">{pkg.period}</span>
                                        </div>
                                    </div>
                                    
                                    <div className={`text-white rounded-lg p-3 text-center mb-6 shadow-md ${themeColor === 'black' ? 'bg-gray-800' : `bg-${themeColor}-600`}`}>
                                        <span className="text-xs font-bold uppercase tracking-wide">{pkg.credit_label || `${pkg.credits} Credits`}</span>
                                    </div>

                                    <ul className="space-y-3 mb-8 flex-1 px-2">
                                        {pkg.features.map((feat, i) => (
                                            <li key={i} className="flex items-start gap-3 text-xs text-gray-600">
                                                <div className={`p-0.5 rounded-full ${themeColor === 'black' ? 'bg-gray-200 text-black' : `bg-${themeColor}-100 text-${themeColor}-600`}`}>
                                                    <CheckCircle className="w-3 h-3" />
                                                </div>
                                                <span className="leading-tight pt-0.5 font-medium">{feat}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <button className={getButtonClass(themeColor)}>
                                        Langgan Plan Ini
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        )}

        {/* --- VIEW 2: PROFESSIONAL PAYMENT GATEWAY --- */}
        {view === 'payment' && selectedPkg && (
            <div className="flex flex-col md:flex-row h-full w-full bg-gray-50">
                
                {/* LEFT: DARK QR TERMINAL */}
                <div className="w-full md:w-5/12 bg-gray-900 text-white p-8 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-gray-800/50 to-black/80 pointer-events-none"></div>
                    
                    <div className="relative z-10 w-full max-w-sm">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-[10px] font-bold uppercase tracking-widest mb-3 animate-pulse">
                                <Wifi className="w-3 h-3" /> Secure Gateway Active
                            </div>
                            <h3 className="text-2xl font-bold text-white tracking-tight">DuitNow QR Payment</h3>
                            <p className="text-gray-400 text-xs mt-2">Scan using any supported banking app or e-wallet.</p>
                        </div>

                        <div className="bg-white p-5 rounded-3xl shadow-2xl mx-auto w-72 h-72 flex items-center justify-center relative group">
                            <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
                            <div className="relative w-full h-full bg-white rounded-2xl flex items-center justify-center overflow-hidden">
                                {imgError ? (
                                    <div className="text-center p-4">
                                        <ImageOff className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                                        <span className="text-xs text-gray-400 font-bold">QR Load Failed</span>
                                    </div>
                                ) : (
                                    <img src={qrSrc} alt="DuitNow QR" className="w-full h-full object-contain" onError={handleQrError} />
                                )}
                            </div>
                        </div>

                        <div className="mt-8 bg-gray-800/50 backdrop-blur-md rounded-xl p-4 border border-gray-700 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">Payment Reference Code</p>
                            <p className="text-xl font-mono font-bold text-white tracking-widest">{selectedPkg.ref_code}</p>
                        </div>
                    </div>
                </div>

                {/* RIGHT: DETAILS & STATUS */}
                <div className="w-full md:w-7/12 p-8 flex flex-col bg-white overflow-y-auto">
                    <button onClick={() => setView('selection')} className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-800 mb-8 w-fit group transition-colors">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> BACK TO PACKAGES
                    </button>

                    <div className="space-y-8 flex-1">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900">Order Summary</h2>
                            <p className="text-gray-500 text-sm mt-1">Review transaction details before confirming.</p>
                        </div>

                        {/* Package Info */}
                        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-gray-900 text-lg">{selectedPkg.name} Package</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs font-medium bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-600">{selectedPkg.credit_label}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-black text-2xl text-gray-900">RM {selectedPkg.price}</p>
                            </div>
                        </div>

                        {/* REGIONAL STATUS GRID */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                    <Globe className="w-3 h-3" /> Regional Gateway Status
                                </h4>
                                <span className="text-[10px] text-gray-400 flex items-center gap-1"><Server className="w-3 h-3"/> Asia-Pacific Node</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {COUNTRIES.map(c => (
                                    <div key={c.code} className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${c.status === 'online' ? 'bg-green-50/50 border-green-200 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-60 grayscale'}`}>
                                        <span className="text-xl shadow-sm rounded-full">{c.flag}</span>
                                        <div className="flex flex-col">
                                            <span className={`text-[11px] font-bold ${c.status === 'online' ? 'text-gray-900' : 'text-gray-500'}`}>{c.name}</span>
                                            <span className={`text-[9px] font-extrabold uppercase tracking-wide flex items-center gap-1 ${c.status === 'online' ? 'text-green-600' : 'text-gray-400'}`}>
                                                {c.status === 'online' ? <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> : <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>}
                                                {c.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* COUPON INPUT */}
                        <div className="space-y-4">
                            <label className="block text-xs font-bold text-gray-500 uppercase">Have a Promo Code?</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Ticket className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <input 
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        placeholder="ENTER CODE"
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold uppercase outline-none focus:ring-2 focus:ring-gray-200 focus:bg-white transition-all disabled:opacity-50"
                                        disabled={!!appliedCoupon}
                                    />
                                </div>
                                <button 
                                    onClick={appliedCoupon ? () => { setAppliedCoupon(null); setCouponCode(''); } : handleVerifyCoupon}
                                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 ${appliedCoupon ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-gray-900 text-white hover:bg-black'}`}
                                    disabled={isVerifyingCoupon}
                                >
                                    {isVerifyingCoupon ? <Loader2 className="w-3 h-3 animate-spin"/> : (appliedCoupon ? 'Remove' : 'Apply')}
                                </button>
                            </div>
                            
                            {couponError && (
                                <div className="flex items-center gap-2 text-red-500 text-xs font-bold bg-red-50 p-2 rounded-lg">
                                    <X className="w-3 h-3" /> {couponError}
                                </div>
                            )}
                            
                            {appliedCoupon && (
                                <div className="flex items-center justify-between bg-green-50 border border-green-200 p-3 rounded-lg text-green-700 text-xs font-bold">
                                    <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4"/> Coupon Applied: {appliedCoupon.code}</span>
                                    <span>-{appliedCoupon.type === 'percentage' ? `${appliedCoupon.value}%` : `RM${appliedCoupon.value}`}</span>
                                </div>
                            )}
                        </div>

                        {/* TOTAL & ACTION */}
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                            <div className="flex justify-between items-end mb-6">
                                <span className="text-sm font-bold text-gray-500">Total Amount Payable</span>
                                <span className="text-4xl font-black text-gray-900 tracking-tight">RM {calculateFinalPrice().toFixed(2)}</span>
                            </div>
                            
                            <button 
                                onClick={handleWhatsApp}
                                className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-green-500/30 transition-all flex items-center justify-center gap-3 transform active:scale-[0.99]"
                            >
                                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-5 h-5" alt="WA"/>
                                Verify Payment via WhatsApp
                            </button>
                            <p className="text-[10px] text-center text-gray-400 mt-3 flex items-center justify-center gap-1">
                                <Lock className="w-3 h-3" /> 256-bit SSL Secure Transaction
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
