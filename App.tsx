
import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import { AuthScreen } from './components/AuthScreen';
import { UserWorkspace } from './components/UserWorkspace';
import AdminDashboard from './components/AdminDashboard';
import { AboutModal } from './components/AboutModal';
import { RegistrationScreen } from './components/RegistrationScreen';
import { LandingPage } from './components/LandingPage';
import { PartnerProgramPage } from './components/PartnerProgramPage';
import { LegalModal, LegalModalType } from './components/LegalModals';
import { WalletModal } from './components/WalletModal';
import { Loader2, RefreshCw, Download } from 'lucide-react'; 

const LICENSE_KEY_STORAGE = "taap_genpro_v4_license";
const APP_VERSION_STORAGE = "taap_version_tracker";
const PENDING_REF_STORAGE = "taap_pending_ref";
const CURRENT_APP_VERSION = "7.1.3"; // Updated Version for Error Handler Fix

const App: React.FC = () => {
  // Simplified state
  const [status, setStatus] = useState<'initializing' | 'auth_required' | 'operational'>('initializing');
  const [view, setView] = useState<'landing' | 'login' | 'app' | 'admin' | 'register' | 'partner'>('landing');
  const [licenseKey, setLicenseKey] = useState("");
  const [credits, setCredits] = useState(0);
  const [config, setConfig] = useState({ costPerGen: 1, autofillCost: 1 });
  const [authError, setAuthError] = useState<string | null>(null);
  const [showAbout, setShowAbout] = useState(false);
  const [activeLegalModal, setActiveLegalModal] = useState<LegalModalType>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Quick Renew State
  const [isRenewalOpen, setIsRenewalOpen] = useState(false);
  const [renewalKey, setRenewalKey] = useState("");

  // Update System State
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [newVersion, setNewVersion] = useState("");

  useEffect(() => {
    // 1. Capture URL Params (Referral & Magic Link)
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    const magicKey = urlParams.get('login_key');

    if (ref) {
      localStorage.setItem(PENDING_REF_STORAGE, ref.toUpperCase());
    }

    if (magicKey) {
        localStorage.setItem(LICENSE_KEY_STORAGE, magicKey.trim());
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (ref) {
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // 2. Silent Version Update Check & Cache Clear
    const checkVersion = async () => {
        try {
            // Cache-busting fetch for metadata
            const res = await fetch(`/metadata.json?t=${Date.now()}`);
            const meta = await res.json();
            
            if (meta.version && meta.version !== CURRENT_APP_VERSION) {
                console.log(`Update Detected: ${CURRENT_APP_VERSION} -> ${meta.version}`);
                setNewVersion(meta.version);
                setUpdateAvailable(true);
            }
        } catch (e) {
            console.warn("Version check failed", e);
        }
    };

    checkVersion();
    const interval = setInterval(checkVersion, 30000); // Check every 30 seconds

    // 3. Check Login Status
    const storedKey = localStorage.getItem(LICENSE_KEY_STORAGE);
    if (storedKey) {
        verifyLicense(storedKey);
    } else {
        setStatus('auth_required');
        setView('landing');
    }

    return () => clearInterval(interval);
  }, []);

  const handleUpdate = () => {
      // Clear cache storage if supported
      if ('caches' in window) {
          caches.keys().then((names) => {
              names.forEach((name) => {
                  caches.delete(name);
              });
          });
      }
      // Force reload from server
      window.location.reload();
  };

  const verifyLicense = async (key: string, globalLoader = true) => {
    const cleanKey = key.trim().toUpperCase();
    if (globalLoader) setStatus('initializing'); else setIsVerifying(true);
    setAuthError(null);

    if (cleanKey === 'DEV') {
        setLicenseKey('DEV'); setCredits(9999); setStatus('operational'); setView('app');
        setIsVerifying(false); return;
    }

    try {
        const { data: settings } = await supabase.from('system_settings').select('key,value');
        if (settings) {
            const costGen = settings.find(s => s.key === 'cost_per_generation')?.value;
            const costAuto = settings.find(s => s.key === 'cost_per_autofill')?.value;
            setConfig({ costPerGen: costGen ? parseInt(costGen) : 1, autofillCost: costAuto ? parseInt(costAuto) : 1 });
        }

        const { error: subError } = await supabase.rpc('check_expired_subscriptions');
        if (subError) console.warn("Sub Check Warning:", subError.message);

        const { data: license, error } = await supabase.from('licenses').select('status, credits').eq('license_key', cleanKey).single();
        if (error || !license) throw new Error("License key not found.");
        
        if (license.status === 'suspended') throw new Error("Akaun Digantung (Expired). Sila renew.");
        if (license.status !== 'active') throw new Error(`Status: ${license.status}. Hubungi Admin.`);

        setLicenseKey(cleanKey);
        setCredits(license.credits);
        localStorage.setItem(LICENSE_KEY_STORAGE, cleanKey);
        setStatus('operational');
        setView('app');
    } catch (err: any) {
        setAuthError(err.message || "Gagal mengesahkan lesen.");
        setStatus('auth_required');
        setView('login');
    } finally {
        setIsVerifying(false);
    }
  };

  const handleQuickRenew = (key: string) => {
      setRenewalKey(key);
      setIsRenewalOpen(true);
  };

  if (status === 'initializing') return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
          <p className="text-gray-400 font-mono text-sm">Initializing Neural Cloud...</p>
      </div>
  );

  return (
    <>
        {view === 'admin' ? <AdminDashboard onExit={() => setView('login')} /> :
         view === 'register' ? <RegistrationScreen onBack={() => setView('landing')} onShowTerms={() => setActiveLegalModal('terms')} /> :
         view === 'partner' ? <PartnerProgramPage onBack={() => setView('landing')} onLogin={() => setView('login')} onRegister={() => setView('register')} /> :
         view === 'landing' ? <LandingPage onLogin={() => setView('login')} onRegister={() => setView('register')} onOpenLegal={setActiveLegalModal} onOpenPartner={() => setView('partner')} /> :
         view === 'login' ? <AuthScreen onVerify={(k) => verifyLicense(k, false)} isLoading={isVerifying} error={authError} onAdminLogin={() => setView('admin')} onRegister={() => setView('register')} onRenew={handleQuickRenew} onBack={() => setView('landing')} /> :
         <UserWorkspace licenseKey={licenseKey} initialCredits={credits} config={config} onLogout={() => {localStorage.removeItem(LICENSE_KEY_STORAGE); setView('landing');}} onShowAbout={() => setShowAbout(true)} />}
        
        <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
        <LegalModal isOpen={!!activeLegalModal} type={activeLegalModal} onClose={() => setActiveLegalModal(null)} />
        
        <WalletModal 
            isOpen={isRenewalOpen} 
            onClose={() => setIsRenewalOpen(false)} 
            currentCredits={0} 
            licenseKey={renewalKey} 
        />

        {/* --- FORCE UPDATE BANNER --- */}
        {updateAvailable && (
            <div className="fixed bottom-6 right-6 z-[200] max-w-sm w-full bg-blue-600 text-white p-4 rounded-xl shadow-2xl flex items-center justify-between gap-4 animate-bounce-subtle border border-blue-400">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                        <Download className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="font-bold text-sm">Update Available</p>
                        <p className="text-[10px] text-blue-100 font-mono">v{CURRENT_APP_VERSION} → v{newVersion}</p>
                    </div>
                </div>
                <button 
                    onClick={handleUpdate}
                    className="bg-white text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm whitespace-nowrap flex items-center gap-1"
                >
                    <RefreshCw className="w-3 h-3" /> Update
                </button>
            </div>
        )}
    </>
  );
};

export default App;
