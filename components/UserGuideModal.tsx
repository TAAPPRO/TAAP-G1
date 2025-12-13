import React, { useState } from 'react';
import { X, BookOpen, Zap } from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: { costPerGen: number; autofillCost: number; imageGenCost?: number; videoGenCost?: number };
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose, config }) => {
  const [tab, setTab] = useState('start');

  if (!isOpen) return null;

  const renderContent = () => {
    switch (tab) {
      case 'start':
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-orange-600" /> Panduan Mula Pantas
            </h3>
            <div className="prose prose-sm text-gray-600 leading-relaxed">
              <p>Selamat datang ke <strong>TAAP GENPRO V7.0</strong>. Ini adalah alat copywriting pintar yang direka khas untuk pasaran Malaysia. Ikuti langkah mudah ini untuk menghasilkan ayat jualan pertama anda:</p>
              
              <ol className="list-decimal pl-5 space-y-4 mt-4">
                <li><strong>Masukkan Info Produk:</strong> Gunakan "Auto-Fill" untuk carian pantas atau "Manual" untuk kawalan penuh.</li>
                <li><strong>Pilih Strategi:</strong> Tentukan format (e.g. TikTok Script) dan nada suara (e.g. Kakak Vibe).</li>
                <li><strong>Generate:</strong> Tekan butang generate. Pastikan anda mempunyai kredit yang mencukupi.</li>
              </ol>
            </div>
          </div>
        );
      case 'credits':
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-500" /> Sistem Kredit (Neural Energy)
            </h3>
            <div className="space-y-4">
                <p className="text-sm text-gray-600">Setiap penjanaan menggunakan tenaga neural (kredit). Berikut adalah kos semasa:</p>
                <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="font-bold text-gray-700">Teks Copywriting</span>
                        <span className="font-mono text-orange-600 font-bold">{config.costPerGen} Kredit</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="font-bold text-gray-700">Magic Auto-Fill</span>
                        <span className="font-mono text-orange-600 font-bold">{config.autofillCost} Kredit</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="font-bold text-gray-700">Image Gen</span>
                        <span className="font-mono text-purple-600 font-bold">{config.imageGenCost || 2} Kredit</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="font-bold text-gray-700">Video Gen (Veo)</span>
                        <span className="font-mono text-red-600 font-bold">{config.videoGenCost || 10} Kredit</span>
                    </div>
                </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl h-[80vh] flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-gray-50 border-r border-gray-200 p-4 flex flex-col gap-2">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">Menu Panduan</h4>
            <button onClick={() => setTab('start')} className={`text-left px-4 py-3 rounded-lg text-sm font-bold flex items-center gap-2 ${tab === 'start' ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                <BookOpen className="w-4 h-4"/> Mula Pantas
            </button>
            <button onClick={() => setTab('credits')} className={`text-left px-4 py-3 rounded-lg text-sm font-bold flex items-center gap-2 ${tab === 'credits' ? 'bg-yellow-100 text-yellow-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                <Zap className="w-4 h-4"/> Info Kredit
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col min-w-0">
            <div className="p-4 border-b border-gray-100 flex justify-end">
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 md:p-8 overflow-y-auto">
                {renderContent()}
            </div>
        </div>
      </div>
    </div>
  );
};