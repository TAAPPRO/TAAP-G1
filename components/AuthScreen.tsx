
import React, { useState } from 'react';
import { Shield, Key, Loader2, AlertTriangle, UserPlus, ArrowLeft, Lock, RefreshCw, CreditCard, HelpCircle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface AuthScreenProps {
  onVerify: (key: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  onAdminLogin: () => void;
  onRegister: () => void;
  onRenew: (key: string) => void;
  onBack?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onVerify, isLoading, error, onAdminLogin, onRegister, onRenew, onBack }) => {
  const [inputKey, setInputKey] = useState("");
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [adminError, setAdminError] = useState("");
  const [verifyingAdmin, setVerifyingAdmin] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // SECRET BACKDOOR: Type this to access Admin Panel Login Screen
    if (inputKey.trim().toUpperCase() === 'TAAP_ADMIN') {
        setShowAdminAuth(true);
        return;
    }

    if (inputKey.trim()) onVerify(inputKey.trim());
  };

  const handleAdminVerify = async (e: React.FormEvent) => {
      e.preventDefault();
      setVerifyingAdmin(true);
      setAdminError("");

      try {
          const { data, error } = await supabase.rpc('verify_admin_password', { p_password: adminPass });
          
          if (error) throw error;
          
          if (data === true) {
              onAdminLogin();
          } else {
              setAdminError("Invalid Admin Password");
          }
      } catch (err: any) {
          console.error("Admin Auth Error:", err);
          // Fallback for hardcoded if DB fails or rpc missing (legacy support)
          if (adminPass === 'admin123') onAdminLogin();
          else setAdminError("Authentication Failed. Check Database Connection.");
      } finally {
          setVerifyingAdmin(false);
      }
  };

  const handleForceUpdate = () => {
      if(window.confirm("Ini akan membersihkan 'Cache' aplikasi untuk membaiki masalah paparan lama. Teruskan?")) {
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = window.location.pathname + '?force_refresh=' + Date.now();
      }
  };

  const handleLostKey = () => {
      const message = "Hi Admin, saya kehilangan License Key TAAP GenPro saya. Email saya ialah: ";
      window.open(`https://wa.me/60176162761?text=${encodeURIComponent(message)}`, '_blank');
  };

  // ADMIN PASSWORD SCREEN
  if (showAdminAuth) {
      return (
        <div className="min-h-[100dvh] bg-black flex items-center justify-center p-4 font-sans">
            <div className="max-w-md w-full bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
                <button onClick={() => { setShowAdminAuth(false); setInputKey(""); }} className="absolute top-4 left-4 text-gray-500 hover:text-white"><ArrowLeft className="w-5 h-5"/></button>
                
                <div className="text-center mb-8 mt-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/20 text-red-500 mb-4 border border-red-900/50">
                        <Shield className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Admin Access</h2>
                    <p className="text-gray-500 text-sm mt-1">Restricted Area. Authorized Personnel Only.</p>
                </div>

                <form onSubmit={handleAdminVerify} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Security Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-600" />
                            <input 
                                type="password" 
                                value={adminPass}
                                onChange={(e) => setAdminPass(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-black border border-gray-700 rounded-xl text-white focus:border-red-600 outline-none transition-colors"
                                placeholder="Enter Password..."
                                autoFocus
                            />
                        </div>
                    </div>

                    {adminError && (
                        <div className="bg-red-900/20 border border-red-900/50 text-red-500 p-3 rounded-lg text-sm flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4"/> {adminError}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={verifyingAdmin || !adminPass}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {verifyingAdmin ? <Loader2 className="w-5 h-5 animate-spin"/> : "Verify Credentials"}
                    </button>
                </form>
            </div>
        </div>
      );
  }

  // STANDARD LOGIN SCREEN
  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in relative">
        {onBack && (
            <button 
                onClick={onBack}
                className="absolute top-4 left-4 z-20 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                title="Back to Landing Page"
            >
                <ArrowLeft className="w-5 h-5" />
            </button>
        )}
        
        <div className="bg-gradient-to-r from-orange-600 to-amber-500 p-10 text-center relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
           
           {/* NEW STACKED LOGO FOR AUTH HEADER */}
           <div className="relative z-10 flex flex-col items-center leading-none select-none mb-2">
                <span className="text-xs font-bold text-yellow-300 tracking-[0.5em] uppercase drop-shadow-sm mb-1">G E N P R O</span>
                <span className="text-6xl font-black text-white tracking-tighter drop-shadow-md">TAAP</span>
           </div>
           
           <p className="text-orange-100 font-medium mt-3 tracking-wide text-xs relative z-10">V7.0 ENTERPRISE EDITION</p>
        </div>

        <div className="p-6 md:p-8">
           <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                 <div className="flex justify-between items-center mb-2 px-1">
                    <label className="text-sm font-bold text-gray-700">License Access Key</label>
                    <button type="button" onClick={handleLostKey} className="text-[10px] font-bold text-orange-600 hover:underline flex items-center gap-1">
                        <HelpCircle className="w-3 h-3"/> Lost your key?
                    </button>
                 </div>
                 <div className="relative group">
                    <Key className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                    <input 
                      type="text" 
                      value={inputKey}
                      onChange={(e) => setInputKey(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all font-mono text-base uppercase placeholder-gray-400"
                      placeholder="XXXX-XXXX-XXXX"
                      autoFocus
                    />
                 </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex flex-col gap-2">
                  <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700 font-medium leading-tight">{error}</p>
                  </div>
                  {/* Smart Action: Show renewal button if error is about expiry */}
                  {error.includes("Renew") || error.includes("Expired") || error.includes("Digantung") ? (
                      <button 
                        type="button"
                        onClick={() => onRenew(inputKey)}
                        className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2"
                      >
                          <CreditCard className="w-3 h-3" /> Renew License Now
                      </button>
                  ) : null}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading || !inputKey.trim()}
                className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-base transform active:scale-95 duration-200"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Access"}
              </button>

              <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase font-bold">Or</span>
                  <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button" 
                    onClick={onRegister}
                    className="w-full bg-white border-2 border-orange-100 hover:border-orange-200 text-orange-600 font-bold py-3 rounded-xl hover:bg-orange-50 transition-all flex items-center justify-center gap-2 text-xs active:scale-95 duration-200"
                  >
                    <UserPlus className="w-4 h-4" />
                    New Account
                  </button>
                  <button 
                    type="button" 
                    onClick={() => onRenew(inputKey)}
                    className="w-full bg-white border-2 border-green-100 hover:border-green-200 text-green-600 font-bold py-3 rounded-xl hover:bg-green-50 transition-all flex items-center justify-center gap-2 text-xs active:scale-95 duration-200"
                  >
                    <CreditCard className="w-4 h-4" />
                    Renew/Topup
                  </button>
              </div>

              <div className="pt-4 flex flex-col gap-3 items-center">
                  <button 
                    type="button"
                    onClick={handleForceUpdate}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-orange-600/70 hover:text-orange-600 transition-colors bg-orange-50 px-3 py-1.5 rounded-full"
                  >
                      <RefreshCw className="w-3 h-3" /> Force Update / Clear Cache
                  </button>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
};
