
import React, { useState } from 'react';
import { 
  ArrowRight, CheckCircle2, TrendingUp, Users, ShieldCheck, 
  ArrowLeft, Zap, Calculator, Crown, Globe, Lock, Clock,
  Activity
} from 'lucide-react';

interface PartnerProgramPageProps {
  onBack: () => void;
  onLogin: () => void;
  onRegister: () => void;
}

export const PartnerProgramPage: React.FC<PartnerProgramPageProps> = ({ onBack, onLogin, onRegister }) => {
  // Calculator State
  const [activeUsers, setActiveUsers] = useState(50);
  const [userMix, setUserMix] = useState<'conservative' | 'aggressive'>('aggressive'); // Mix of Basic vs Pro users
  
  // Math Logic
  // Basic: RM69, Pro: RM199. 
  // Conservative: 80% Basic, 20% Pro. Aggressive: 40% Basic, 60% Pro.
  const avgOrderValue = userMix === 'conservative' ? 95 : 147; 
  
  // Tier Logic (Updated Rates)
  const getTier = (users: number) => {
      if (users >= 50) return { name: 'Partner', rate: 0.30, color: 'text-orange-500' };
      if (users >= 10) return { name: 'Super Agent', rate: 0.25, color: 'text-blue-400' };
      return { name: 'Agent', rate: 0.20, color: 'text-gray-400' };
  };

  const tier = getTier(activeUsers);
  const monthlyRevenue = activeUsers * avgOrderValue * tier.rate;
  const yearlyRevenue = monthlyRevenue * 12;

  return (
    <div className="min-h-screen bg-black font-sans text-gray-100 selection:bg-orange-600 selection:text-white overflow-x-hidden">
      
      {/* --- NAVIGATION --- */}
      <nav className="fixed w-full z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800 py-4 transition-all">
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors group uppercase tracking-widest">
             <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Product
          </button>
          <div className="flex items-center gap-4">
             <button onClick={onLogin} className="text-xs font-bold text-gray-300 hover:text-white transition-colors">LOGIN</button>
             <button onClick={onRegister} className="px-6 py-2 bg-white text-black text-xs font-black uppercase tracking-wider rounded hover:bg-orange-500 hover:text-white transition-all shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-orange-500/50">
                Apply for Access
             </button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
        {/* Background FX */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-orange-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          
          {/* REGIONAL STATUS PILL */}
          <div className="flex justify-center mb-8 animate-fade-in-up">
              <div className="bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-full p-1 pl-1 pr-4 flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-black/50 rounded-full px-3 py-1.5 border border-green-900/30">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      <span className="text-[10px] font-bold text-green-400 uppercase tracking-wide flex items-center gap-1">
                          🇲🇾 Malaysia: <span className="text-white">Online</span>
                      </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-bold text-gray-500 uppercase tracking-wide border-l border-gray-700 pl-4">
                      <div className="flex -space-x-1 opacity-50 grayscale">
                          <span className="text-lg">🇸🇬</span>
                          <span className="text-lg">🇮🇩</span>
                          <span className="text-lg">🇹🇭</span>
                          <span className="text-lg">🇵🇭</span>
                      </div>
                      <span>Expansion Node: Offline</span>
                  </div>
              </div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 border border-orange-500/30 rounded-full bg-orange-900/10 backdrop-blur-md animate-fade-in-up delay-75">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            <span className="text-[10px] font-bold text-orange-400 tracking-[0.2em] uppercase">Private Partner Program V7.0</span>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white mb-8 leading-[0.9] animate-fade-in-up delay-100">
            OWN THE <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-orange-400 to-orange-700">INFRASTRUCTURE.</span>
          </h1>
          
          <p className="text-lg md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed font-medium animate-fade-in-up delay-200">
            Most affiliates sell "products" and get paid once. <br className="hidden md:block"/>
            <span className="text-white">TAAP Partners build recurring digital real estate.</span><br/>
            Earn up to <span className="text-orange-500 font-bold">30% lifetime equity</span> on every business you bring to the Neural Cloud.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in-up delay-300">
            <button onClick={onRegister} className="group w-full sm:w-auto px-8 py-5 bg-orange-600 hover:bg-orange-500 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-[0_0_30px_rgba(234,88,12,0.4)] flex items-center justify-center gap-3 transform hover:-translate-y-1">
              Start Building <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                <span>Powered by TAAP-GENPRO Neural Engine</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- THE INCOME CALCULATOR (THE HOOK) --- */}
      <section className="py-20 bg-gray-900 border-y border-gray-800 relative">
          <div className="max-w-6xl mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  
                  {/* TEXT SIDE */}
                  <div className="lg:col-span-5 space-y-6">
                      <div className="inline-block p-3 rounded-xl bg-gray-800 border border-gray-700">
                          <Calculator className="w-8 h-8 text-orange-500" />
                      </div>
                      <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
                          The Mathematics of <br/><span className="text-orange-500">Recurring Wealth.</span>
                      </h2>
                      <p className="text-gray-400 text-lg leading-relaxed">
                          TAAP is a utility, not a toy. Businesses use us daily for content, video, and image generation. 
                          <br/><br/>
                          This means they <strong>renew monthly</strong>.
                          <br/>
                          You don't hunt for new clients every month. You stack them.
                      </p>
                      
                      <div className="flex gap-4 pt-4">
                          <div className="pl-4 border-l-2 border-orange-500">
                              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Churn Rate</p>
                              <p className="text-xl font-bold text-white">&lt; 3%</p>
                          </div>
                          <div className="pl-4 border-l-2 border-orange-500">
                              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">LTV (Lifetime Value)</p>
                              <p className="text-xl font-bold text-white">RM 2,400+</p>
                          </div>
                      </div>
                  </div>

                  {/* CALCULATOR SIDE */}
                  <div className="lg:col-span-7 bg-black rounded-3xl border border-gray-800 p-8 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>
                      
                      {/* SLIDER */}
                      <div className="mb-10">
                          <div className="flex justify-between mb-4">
                              <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Active Subscribers Referred</label>
                              <span className="text-2xl font-black text-white font-mono">{activeUsers}</span>
                          </div>
                          <input 
                            type="range" 
                            min="1" max="500" 
                            value={activeUsers} 
                            onChange={(e) => setActiveUsers(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                          />
                          <div className="flex justify-between mt-2 text-[10px] text-gray-600 font-mono">
                              <span>1</span>
                              <span>100</span>
                              <span>250</span>
                              <span>500+</span>
                          </div>
                      </div>

                      {/* TOGGLE */}
                      <div className="flex items-center justify-center gap-4 mb-10">
                          <span className={`text-xs font-bold uppercase ${userMix === 'conservative' ? 'text-white' : 'text-gray-600'}`}>Conservative Mix</span>
                          <button 
                            onClick={() => setUserMix(prev => prev === 'conservative' ? 'aggressive' : 'conservative')}
                            className={`w-14 h-7 rounded-full p-1 transition-colors ${userMix === 'aggressive' ? 'bg-orange-600' : 'bg-gray-700'}`}
                          >
                              <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${userMix === 'aggressive' ? 'translate-x-7' : 'translate-x-0'}`}></div>
                          </button>
                          <span className={`text-xs font-bold uppercase ${userMix === 'aggressive' ? 'text-white' : 'text-gray-600'}`}>Aggressive Mix (Pro Plans)</span>
                      </div>

                      {/* OUTPUT */}
                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 text-center">
                              <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-2">Your Tier</p>
                              <div className={`text-xl font-black ${tier.color} uppercase`}>{tier.name} ({Math.round(tier.rate * 100)}%)</div>
                          </div>
                          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 text-center relative overflow-hidden group">
                              <div className="absolute inset-0 bg-gradient-to-b from-orange-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-2">Monthly Passive Income</p>
                              <div className="text-3xl font-black text-white font-mono tracking-tight group-hover:scale-110 transition-transform">
                                  RM {monthlyRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                              </div>
                              <p className="text-[10px] text-gray-600 mt-2">RM {yearlyRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })} / year</p>
                          </div>
                      </div>
                  </div>

              </div>
          </div>
      </section>

      {/* --- WHY IT STICKS (PRODUCT SUPERIORITY) --- */}
      <section className="py-24 bg-black">
          <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Why Users <span className="text-orange-600">Never Leave.</span></h2>
                  <p className="text-gray-400 max-w-2xl mx-auto">
                      Affiliate income dies when the product sucks. TAAP GENPRO is engineered for <strong>addiction and daily utility</strong>.
                  </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-gray-900 p-8 rounded-3xl border border-gray-800 hover:border-orange-500/50 transition-colors group">
                      <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-600 transition-colors">
                          <Globe className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">Hyper-Localized Neural Engine</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">
                          Generic engines sound robotic. TAAP speaks "Manglish", "Loghat Utara", and "Bahasa Pasar". This is why local businesses switch from ChatGPT to us.
                      </p>
                  </div>

                  <div className="bg-gray-900 p-8 rounded-3xl border border-gray-800 hover:border-orange-500/50 transition-colors group">
                      <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors">
                          <Zap className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">Video & Image Studio</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">
                          We integrated Smart GenPro Neural Engine. Users generate cinematic video ads and product photos in seconds. It replaces an entire agency team.
                      </p>
                  </div>

                  <div className="bg-gray-900 p-8 rounded-3xl border border-gray-800 hover:border-orange-500/50 transition-colors group">
                      <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-600 transition-colors">
                          <TrendingUp className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">Viral Trend Injection</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">
                          Our engine scans live Malaysian trends. Users need this daily to stay relevant. It becomes part of their morning routine.
                      </p>
                  </div>
              </div>
          </div>
      </section>

      {/* --- THE TIERS (GAMIFICATION) --- */}
      <section className="py-24 bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                <div>
                    <h2 className="text-4xl font-black text-white">The Partner Ladder</h2>
                    <p className="text-gray-500 mt-2">Automatic upgrades. No negotiation needed.</p>
                </div>
                <div className="flex gap-2">
                    <span className="text-xs font-bold bg-black border border-gray-700 px-3 py-1 rounded text-gray-400">INSTANT PAYOUTS</span>
                    <span className="text-xs font-bold bg-black border border-gray-700 px-3 py-1 rounded text-gray-400">LIVE DASHBOARD</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* TIER 1 */}
                <div className="p-1 border border-gray-800 rounded-3xl">
                    <div className="bg-black rounded-[20px] p-8 h-full flex flex-col">
                        <div className="mb-6">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Level 1</span>
                            <h3 className="text-2xl font-black text-gray-300 mt-1">Agent</h3>
                        </div>
                        <div className="text-5xl font-black text-white mb-2">20%</div>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-8">Recurring Commission</p>
                        
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3 text-sm text-gray-400"><CheckCircle2 className="w-4 h-4 text-gray-600"/> Weekly Payout (Fri)</li>
                            <li className="flex items-center gap-3 text-sm text-gray-400"><CheckCircle2 className="w-4 h-4 text-gray-600"/> Standard Dashboard</li>
                        </ul>
                        
                        <div className="w-full py-3 bg-gray-900 rounded-xl text-center text-xs font-bold text-gray-500">
                            Entry Level
                        </div>
                    </div>
                </div>

                {/* TIER 2 */}
                <div className="p-1 border border-blue-900/50 rounded-3xl relative">
                    <div className="bg-black rounded-[20px] p-8 h-full flex flex-col relative z-10">
                        <div className="mb-6">
                            <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Level 2</span>
                            <h3 className="text-2xl font-black text-white mt-1">Super Agent</h3>
                        </div>
                        <div className="text-5xl font-black text-blue-400 mb-2">25%</div>
                        <p className="text-xs text-blue-900 uppercase font-bold tracking-wider mb-8">Recurring Commission</p>
                        
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3 text-sm text-gray-300"><Clock className="w-4 h-4 text-blue-500"/> 48-Hour Fast Payout</li>
                            <li className="flex items-center gap-3 text-sm text-gray-300"><CheckCircle2 className="w-4 h-4 text-blue-500"/> Unlock Logic: 10 Referrals</li>
                        </ul>
                        
                        <div className="w-full py-3 bg-blue-900/20 border border-blue-900/50 rounded-xl text-center text-xs font-bold text-blue-400">
                            Achievable in 30 Days
                        </div>
                    </div>
                </div>

                {/* TIER 3 (ELITE) */}
                <div className="p-1 bg-gradient-to-b from-orange-600 to-orange-800 rounded-3xl shadow-[0_0_50px_rgba(234,88,12,0.2)] transform md:-translate-y-4">
                    <div className="bg-gray-900 rounded-[20px] p-8 h-full flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4">
                            <Crown className="w-8 h-8 text-orange-500" />
                        </div>
                        <div className="mb-6">
                            <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">Level 3 (Elite)</span>
                            <h3 className="text-2xl font-black text-white mt-1">Partner</h3>
                        </div>
                        <div className="text-6xl font-black text-white mb-2">30%</div>
                        <p className="text-xs text-orange-200 uppercase font-bold tracking-wider mb-8">Lifetime Equity</p>
                        
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3 text-sm text-white font-bold"><Zap className="w-4 h-4 text-yellow-400"/> Instant Payout (24h)</li>
                            <li className="flex items-center gap-3 text-sm text-white font-bold"><CheckCircle2 className="w-4 h-4 text-orange-500"/> Priority Support Line</li>
                            <li className="flex items-center gap-3 text-sm text-white font-bold"><CheckCircle2 className="w-4 h-4 text-orange-500"/> Co-Marketing Events</li>
                        </ul>
                        
                        <button onClick={onRegister} className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-sm font-black uppercase tracking-widest transition-colors shadow-lg">
                            Apply for Partnership
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* --- FILTERING (WHO WE WANT) --- */}
      <section className="py-24 bg-white text-black">
          <div className="max-w-5xl mx-auto px-6">
              <div className="flex flex-col md:flex-row gap-12">
                  <div className="flex-1">
                      <h3 className="text-4xl font-black mb-6">Who Should Apply?</h3>
                      <p className="text-lg text-gray-600 mb-8 font-medium">
                          We are rigorous about who represents our brand. We are looking for builders, not spammers.
                      </p>
                      <ul className="space-y-4">
                          {[
                              "Agencies with 10+ Clients (Instant ROI)",
                              "TikTok/Content Creators (High Volume)",
                              "Software Trainers & Educators",
                              "SaaS Affiliates who understand LTV",
                              "Community Leaders"
                          ].map((item, i) => (
                              <li key={i} className="flex items-center gap-3 text-lg font-bold">
                                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600"><CheckCircle2 className="w-4 h-4"/></div>
                                  {item}
                              </li>
                          ))}
                      </ul>
                  </div>
                  <div className="flex-1 bg-gray-100 p-8 rounded-3xl border border-gray-200">
                      <h3 className="text-2xl font-black mb-6 text-gray-400">Who Should <span className="text-red-600 decoration-red-600 line-through">NOT</span> Apply?</h3>
                      <ul className="space-y-4">
                          {[
                              "Get-Rich-Quick Seekers",
                              "Coupon Scrapers",
                              "People who don't understand B2B",
                              "Spammers",
                              "Passive hopefuls"
                          ].map((item, i) => (
                              <li key={i} className="flex items-center gap-3 text-gray-500 font-medium">
                                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-600"><Users className="w-4 h-4"/></div>
                                  {item}
                              </li>
                          ))}
                      </ul>
                  </div>
              </div>
          </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <section className="py-24 bg-black border-t border-gray-800 text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="max-w-3xl mx-auto px-6 relative z-10">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">
                  Stop Trading Time for Money. <br/>
                  <span className="text-orange-600">Start Building Equity.</span>
              </h2>
              <div className="flex flex-col md:flex-row justify-center gap-4">
                  <button onClick={onRegister} className="px-10 py-5 bg-white text-black hover:bg-gray-200 font-black text-lg rounded-xl uppercase tracking-widest transition-all transform hover:scale-105 shadow-xl">
                      Join Partner Program
                  </button>
                  <button onClick={onLogin} className="px-10 py-5 bg-transparent border-2 border-gray-700 text-white hover:border-white font-bold text-lg rounded-xl uppercase tracking-widest transition-all">
                      Login to Dashboard
                  </button>
              </div>
              <div className="mt-12 pt-8 border-t border-gray-800 text-gray-500 text-xs font-medium space-y-2">
                  <p className="uppercase tracking-widest">Applications are reviewed on a rolling basis.</p>
                  <p className="opacity-50">© 2025 TAAP Neural Technologies. All rights reserved.</p>
              </div>
          </div>
      </section>

    </div>
  );
};
