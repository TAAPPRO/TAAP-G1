
import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, BrainCircuit, MessageCircle, CheckCircle, ArrowRight, Star, TrendingUp, Users, ShieldCheck, Globe, Rocket, Database, Cpu, Share2, ChevronDown, Image as ImageIcon, Layers, Lock, PlayCircle, Smartphone, X, Menu, XCircle, CheckCircle2, Clock, DollarSign, BarChart3, Search, PenTool, Wand2, FileText, Monitor, MoreHorizontal, Film, Server } from 'lucide-react';
import { LegalModalType } from './LegalModals';

interface LandingPageProps {
  onLogin: () => void;
  onRegister: () => void;
  onOpenLegal: (type: LegalModalType) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onRegister, onOpenLegal }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleManualReset = () => {
      if(window.confirm("Reset App Cache?")) {
          localStorage.clear();
          sessionStorage.clear();
          window.location.reload();
      }
  };

  const scrollToSection = (id: string) => {
      setMobileMenuOpen(false);
      document.getElementById(id)?.scrollIntoView({behavior: 'smooth'});
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden selection:bg-orange-500 selection:text-white">
      
      {/* --- NAVIGATION (Smart Glass) --- */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-xl border-b border-gray-200/50 py-3 shadow-sm' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo(0,0)}>
             {/* NEW NAV LOGO */}
             <div className="flex flex-col items-start leading-none select-none">
                <span className="text-[9px] font-bold text-orange-500 tracking-[0.4em] uppercase">G E N P R O</span>
                <span className="text-3xl font-black text-gray-900 tracking-tighter">TAAP</span>
             </div>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
             <button onClick={() => scrollToSection('features')} className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">Ciri-Ciri</button>
             <button onClick={() => scrollToSection('studio')} className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">GenPro Studio</button>
             <button onClick={() => scrollToSection('pricing')} className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">Harga</button>
             
             <div className="h-5 w-px bg-gray-200"></div>
             
             <button 
                onClick={onLogin}
                className="text-sm font-bold text-gray-900 hover:text-orange-600 transition-colors"
             >
                Login Ahli
             </button>
             <button 
                onClick={onRegister}
                className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-full transition-all shadow-lg hover:shadow-orange-500/30 transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2 group relative overflow-hidden"
             >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]"></div>
                Mula Sekarang <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
             </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-gray-200 p-6 flex flex-col gap-4 shadow-2xl animate-fade-in-up">
                <button onClick={() => scrollToSection('features')} className="text-sm font-bold text-gray-600 py-2 border-b border-gray-100 text-left">Ciri-Ciri Utama</button>
                <button onClick={() => scrollToSection('studio')} className="text-sm font-bold text-gray-600 py-2 border-b border-gray-100 text-left">GenPro Studio (Veo)</button>
                <button onClick={() => scrollToSection('pricing')} className="text-sm font-bold text-gray-600 py-2 border-b border-gray-100 text-left">Pakej Harga</button>
                
                <button onClick={onLogin} className="w-full py-4 bg-gray-50 rounded-2xl text-base font-bold text-gray-900 border border-gray-100 active:scale-95 transition-transform mt-2">Member Login</button>
                <button onClick={onRegister} className="w-full py-4 bg-orange-600 text-white rounded-2xl text-base font-bold shadow-lg shadow-orange-500/30 active:scale-95 transition-transform">Subscribe Now</button>
            </div>
        )}
      </nav>

      {/* --- HERO SECTION (World Class) --- */}
      <header className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-white">
         {/* Dynamic Background */}
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
         <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-orange-200/30 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
         <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-200/30 rounded-full blur-[120px] pointer-events-none"></div>

         <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
            <div className="text-center max-w-5xl mx-auto mb-16">
                
                {/* Announcement Pill */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-700 text-[10px] md:text-xs font-bold uppercase tracking-wide mb-8 hover:bg-white hover:shadow-md transition-all cursor-default animate-fade-in-up">
                   <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                   </span>
                   <span>New V7.0: Veo Video Engine Live</span>
                </div>
                
                {/* HERO HEADLINE */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-gray-900 mb-8 leading-[1] md:leading-[0.95] animate-fade-in-up delay-100 drop-shadow-sm">
                   BINA AYAT JUALAN & <br className="hidden md:block" />
                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 animate-gradient-x">VIDEO AI</span> <br className="hidden md:block" />
                   DALAM 60 SAAT!
                </h1>
                
                {/* HERO SUBHEADLINE */}
                <p className="text-lg md:text-2xl text-gray-500 max-w-3xl mx-auto mb-10 leading-relaxed font-medium animate-fade-in-up delay-200">
                   Marketing Intelligence, Yang Memahami <span className="text-gray-900 font-bold border-b-2 border-orange-200">Jiwa Malaysia.</span> <br className="hidden md:block"/>
                   Dari "Ayat Pukau" ke "Visual Studio" (Veo & Imagen).
                </p>
                
                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
                   <button 
                      onClick={onRegister}
                      className="group w-full sm:w-auto px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg rounded-2xl shadow-xl shadow-orange-600/30 transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1 active:scale-95"
                   >
                      <Rocket className="w-5 h-5 group-hover:animate-bounce" />
                      Mula Sekarang
                   </button>
                   <button 
                      onClick={onLogin}
                      className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-gray-100 hover:border-gray-300 text-gray-700 font-bold text-lg rounded-2xl transition-all flex items-center justify-center gap-2 hover:shadow-lg"
                   >
                      <Lock className="w-5 h-5 text-gray-400" /> Member Login
                   </button>
                </div>
                
                {/* Trust Strip */}
                <div className="mt-12 flex flex-col items-center gap-3 animate-fade-in delay-500">
                    <div className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-all group cursor-default">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center group-hover:bg-orange-50 transition-colors">
                                    <Users className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
                                </div>
                            ))}
                        </div>
                        <div className="h-4 w-px bg-gray-300 mx-2"></div>
                        <p className="text-xs md:text-sm font-bold text-gray-600">
                            Digunakan Oleh <span className="text-gray-900 font-black">2,500+</span> Usahawan Malaysia
                        </p>
                    </div>
                </div>
            </div>

            {/* --- STATIC MOCKUP (REPLACED ANIMATION FOR STABILITY) --- */}
            <div className="relative mx-auto max-w-4xl mt-16 animate-fade-in-up delay-500 hover:scale-[1.01] transition-transform duration-500">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-purple-600 rounded-[2.5rem] blur-xl opacity-20"></div>
                
                <div className="relative bg-[#0F172A] rounded-[2rem] shadow-2xl border border-gray-800 overflow-hidden text-left h-auto min-h-[350px]">
                    <div className="flex items-center px-6 py-4 border-b border-gray-800/80 bg-[#1E293B]/80 backdrop-blur">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
                        </div>
                        <div className="flex-1 text-center">
                            <span className="font-mono text-xs text-gray-500 font-medium">TAAP_Engine_V7.0_Ready</span>
                        </div>
                    </div>

                    <div className="p-8 md:p-12 font-mono text-sm md:text-lg leading-relaxed space-y-6 text-gray-300">
                        <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-4">
                            <span className="text-green-400 font-bold shrink-0">➜  Input:</span>
                            <span className="text-white">Sambal Nyet Berapi</span>
                        </div>
                        <div className="pl-4 border-l-2 border-orange-500/50 text-white italic bg-white/5 p-4 rounded-r-xl">
                            "Demo jange duk nunggu lamo boh! 🔥 Stok kalini sikit jah, lambat tinggal habuk. Pedas dia toksoh kato, make nasi putih sajo pun nambah 3 pingge! 🌶️"
                        </div>
                        <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
                            <span className="text-yellow-400 font-bold">➜  Status:</span>
                            <span className="text-green-400 bg-green-400/10 border border-green-400/20 px-3 py-1 rounded-md text-xs md:text-sm font-bold w-fit">Viral Hook Generated Successfully.</span>
                        </div>
                    </div>
                </div>
            </div>
         </div>
      </header>

      {/* --- LOGO STRIP (Greyscale to Color) --- */}
      <div className="py-10 border-y border-gray-100 bg-gray-50/30">
          <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-center md:text-left">Powering Campaigns On</span>
              <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 hover:opacity-100 transition-opacity duration-500 grayscale hover:grayscale-0">
                  <div className="flex items-center gap-2 font-bold text-gray-800 text-sm"><img src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png" className="w-5 h-5"/> TikTok</div>
                  <div className="flex items-center gap-2 font-bold text-gray-800 text-sm"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" className="w-5 h-5"/> Instagram</div>
                  <div className="flex items-center gap-2 font-bold text-gray-800 text-sm"><img src="https://cdn-icons-png.flaticon.com/512/5968/5968764.png" className="w-5 h-5"/> Facebook</div>
                  <div className="flex items-center gap-2 font-bold text-gray-800 text-sm"><img src="https://cdn-icons-png.flaticon.com/512/2504/2504937.png" className="w-5 h-5"/> Shopee</div>
                  <div className="flex items-center gap-2 font-bold text-gray-800 text-sm"><img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-5 h-5"/> WhatsApp</div>
              </div>
          </div>
      </div>

      {/* --- COMPARISON SECTION --- */}
      <section id="comparison" className="py-24 bg-white relative">
          <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
              <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">Stop Guessing. <span className="text-orange-600">Start Dominating.</span></h2>
                  <p className="text-gray-500 text-lg">Perbezaan antara "Posting Kosong" dan "Posting Profit".</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                  
                  {/* THE HARD WAY */}
                  <div className="p-10 rounded-3xl bg-gray-50 border border-gray-100 opacity-80 hover:opacity-100 transition-all hover:shadow-lg">
                      <div className="flex items-center gap-4 mb-8">
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                              <XCircle className="w-6 h-6" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-500">Cara Lama</h3>
                      </div>
                      <ul className="space-y-6">
                          <li className="flex items-start gap-4">
                              <div className="mt-1"><X className="w-5 h-5 text-red-400" /></div>
                              <span className="text-gray-600 font-medium text-lg">Kos Copywriter & Designer (RM 3,000+/bulan).</span>
                          </li>
                          <li className="flex items-start gap-4">
                              <div className="mt-1"><X className="w-5 h-5 text-red-400" /></div>
                              <span className="text-gray-600 font-medium text-lg">Tunggu 3-5 hari untuk siap satu design.</span>
                          </li>
                          <li className="flex items-start gap-4">
                              <div className="mt-1"><X className="w-5 h-5 text-red-400" /></div>
                              <span className="text-gray-600 font-medium text-lg">Ayat skema macam robot (ChatGPT biasa).</span>
                          </li>
                          <li className="flex items-start gap-4">
                              <div className="mt-1"><X className="w-5 h-5 text-red-400" /></div>
                              <span className="text-gray-600 font-medium text-lg">Main teka trend & hashtag secara manual.</span>
                          </li>
                      </ul>
                  </div>

                  {/* THE TAAP WAY */}
                  <div className="relative p-10 rounded-3xl bg-white border-2 border-orange-500 shadow-2xl shadow-orange-200 transform md:-translate-y-6 md:scale-105 z-10">
                      <div className="absolute top-0 right-0 bg-orange-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl rounded-tr-xl uppercase tracking-wider">
                          Pilihan Bijak
                      </div>
                      <div className="flex items-center gap-4 mb-8">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg">
                              <CheckCircle2 className="w-7 h-7" />
                          </div>
                          <h3 className="text-2xl font-black text-gray-900">Cara Neural TAAP</h3>
                      </div>
                      <ul className="space-y-6">
                          <li className="flex items-start gap-4">
                              <div className="mt-1 p-1 bg-green-100 rounded-full"><CheckCircle className="w-4 h-4 text-green-600" /></div>
                              <span className="text-gray-900 font-bold text-lg">Kos serendah <span className="text-green-600 underline decoration-green-300">RM 0.60 sehari</span>.</span>
                          </li>
                          <li className="flex items-start gap-4">
                              <div className="mt-1 p-1 bg-green-100 rounded-full"><CheckCircle className="w-4 h-4 text-green-600" /></div>
                              <span className="text-gray-900 font-bold text-lg">Siap dalam 60 saat (Video + Gambar).</span>
                          </li>
                          <li className="flex items-start gap-4">
                              <div className="mt-1 p-1 bg-green-100 rounded-full"><CheckCircle className="w-4 h-4 text-green-600" /></div>
                              <span className="text-gray-900 font-bold text-lg">Faham Loghat, Manglish & Psikologi Tempatan.</span>
                          </li>
                          <li className="flex items-start gap-4">
                              <div className="mt-1 p-1 bg-green-100 rounded-full"><CheckCircle className="w-4 h-4 text-green-600" /></div>
                              <span className="text-gray-900 font-bold text-lg">Database Trend Viral (Live Update).</span>
                          </li>
                      </ul>
                  </div>
              </div>
          </div>
      </section>

      {/* --- FEATURES --- */}
      <section id="features" className="py-24 bg-gray-50 border-t border-gray-200">
         <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center mb-20">
               <span className="text-orange-600 font-extrabold tracking-widest text-xs uppercase mb-3 block">Technology Stack</span>
               <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6">Built Different.</h2>
               <p className="text-xl text-gray-500 max-w-2xl mx-auto">Satu-satunya sistem yang menggabungkan Text AI, Image Gen (Imagen), dan Video Gen (Veo) dalam satu dashboard.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               
               <div className="md:col-span-2 bg-white rounded-[2rem] p-10 border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden relative">
                   <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-700">
                       <BrainCircuit className="w-80 h-80 text-gray-900" />
                   </div>
                   <div className="relative z-10">
                       <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-8 group-hover:rotate-6 transition-transform">
                           <Database className="w-7 h-7" />
                       </div>
                       <h3 className="text-3xl font-bold text-gray-900 mb-4">Deep Reasoning Technology™</h3>
                       <p className="text-gray-600 text-lg leading-relaxed max-w-lg">
                           AI biasa hanya "meneka" ayat. TAAP <span className="font-bold text-orange-600 bg-orange-50 px-1">berfikir</span> tentang psikologi pelanggan, ketakutan (pain points), dan impian mereka sebelum menulis satu patah perkataan pun.
                       </p>
                   </div>
               </div>

               <div className="md:row-span-2 bg-gray-900 rounded-[2rem] p-10 border border-gray-800 shadow-2xl relative overflow-hidden group">
                   <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90 z-10"></div>
                   <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-1000 grayscale group-hover:grayscale-0" alt="Data" />
                   <div className="relative z-20 h-full flex flex-col justify-end">
                       <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-8 border border-white/10">
                           <TrendingUp className="w-7 h-7" />
                       </div>
                       <h3 className="text-3xl font-bold text-white mb-4">Viral Trend Injection</h3>
                       <p className="text-gray-300 text-lg leading-relaxed">
                           Sambungan terus ke Live Data untuk mengesan isu panas di Malaysia. "Ride the wave" serta-merta.
                       </p>
                   </div>
               </div>

               <div className="bg-white rounded-[2rem] p-10 border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                   <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-8 group-hover:scale-110 transition-transform">
                       <MessageCircle className="w-7 h-7" />
                   </div>
                   <h3 className="text-2xl font-bold text-gray-900 mb-3">30+ Local Personas</h3>
                   <p className="text-gray-600">
                       Dari "Mak Cik Bawang" ke "Rempit", hingga "Profesional Korporat". Kami pakar bahasa rojak.
                   </p>
               </div>

               <div className="bg-white rounded-[2rem] p-10 border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                   <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-8 group-hover:scale-110 transition-transform">
                       <Layers className="w-7 h-7" />
                   </div>
                   <h3 className="text-2xl font-bold text-gray-900 mb-3">Omnichannel Ready</h3>
                   <p className="text-gray-600">
                       Satu klik untuk jana Instagram Caption, TikTok Script, Email, dan Shopee Description serentak.
                   </p>
               </div>

            </div>
         </div>
      </section>

      {/* --- GENPRO STUDIO SHOWCASE --- */}
      <section id="studio" className="py-32 bg-black text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
          <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <div className="space-y-8">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-900/50 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-widest">
                          <Film className="w-4 h-4" /> Veo & Imagen Enabled
                      </div>
                      <h2 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                          Stop Using Boring <br/>
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Stock Assets.</span>
                      </h2>
                      <p className="text-gray-400 text-xl leading-relaxed">
                          Ayat padu tapi gambar hambar? Sales takkan masuk. <br/>
                          Dengan <strong>GenPro Studio (Veo)</strong>, anda boleh jana video sinematik dan visual produk bertaraf studio antarabangsa dalam saat.
                      </p>
                      
                      <div className="flex gap-8 border-t border-white/10 pt-8">
                           <div><div className="text-4xl font-black text-white mb-1">30s</div><div className="text-xs text-gray-500 uppercase font-bold tracking-widest">Video Turnaround</div></div>
                           <div><div className="text-4xl font-black text-white mb-1">99%</div><div className="text-xs text-gray-500 uppercase font-bold tracking-widest">Cost Savings</div></div>
                           <div><div className="text-4xl font-black text-white mb-1">4K</div><div className="text-xs text-gray-500 uppercase font-bold tracking-widest">Max Resolution</div></div>
                      </div>

                      <div className="pt-4">
                        <button onClick={onRegister} className="px-8 py-4 bg-white text-black font-bold text-lg rounded-2xl hover:bg-gray-200 transition-colors flex items-center gap-3">
                            Cuba GenPro Studio <ArrowRight className="w-5 h-5"/>
                        </button>
                      </div>
                  </div>

                  <div className="relative group perspective-1000">
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
                      <div className="relative bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden shadow-2xl aspect-[16/9] flex items-center justify-center">
                          <div className="text-center">
                              <ImageIcon className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                              <h3 className="text-xl font-bold">Neural Render Engine</h3>
                              <p className="text-gray-500 text-sm">Waiting for input...</p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-gray-100 py-12">
         <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3 select-none">
               <div className="flex flex-col items-start leading-none">
                  <span className="text-[8px] font-bold text-orange-500 tracking-[0.4em] uppercase">G E N P R O</span>
                  <span className="text-xl font-black text-gray-900 tracking-tighter">TAAP</span>
               </div>
            </div>
            
            <div className="flex flex-col items-center gap-2">
                <div className="text-sm text-gray-500 font-medium">
                   &copy; 2025 TAAP Neural Technologies. Kuala Lumpur, Malaysia.
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                    </span>
                    System Online
                </div>
            </div>

            <div className="flex gap-8 text-sm text-gray-500 items-center font-bold">
               <button onClick={() => onOpenLegal('privacy')} className="hover:text-orange-600 transition-colors">Privacy</button>
               <button onClick={() => onOpenLegal('terms')} className="hover:text-orange-600 transition-colors">Terms</button>
               <button onClick={handleManualReset} className="text-[10px] bg-gray-100 px-3 py-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                   v7.0.0 (Stable)
               </button>
            </div>
         </div>
      </footer>
    </div>
  );
};
