import React from 'react';
import { X, Award, Search, BrainCircuit, Globe, Zap } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-amber-500 p-6 flex justify-between items-center z-10 shadow-md">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Mengenai TAAP GENPRO V7.0</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-8">
            {/* Intro */}
            <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-orange-600 mb-2">
                    <Award className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Ultimate Neural Copywriting Tool</h3>
                <p className="text-gray-700 leading-relaxed">
                    TAAP GENPRO V7.0 adalah sistem penulisan canggih yang dibina khas untuk usahawan dan affiliate marketer. 
                    Ia menggabungkan kuasa <span className="font-bold text-orange-600">TAAP Neural Engine</span> dengan formula copywriting yang terbukti berkesan.
                </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-white p-2 rounded-lg text-orange-600 border border-orange-100"><Search className="w-5 h-5"/></div>
                        <h4 className="font-bold text-gray-900">Viral Trends</h4>
                    </div>
                    <p className="text-sm text-gray-700">Menggunakan Carian Data Viral untuk mencari isu semasa yang boleh dikaitkan dengan produk anda.</p>
                </div>

                 <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                         <div className="bg-white p-2 rounded-lg text-orange-600 border border-orange-100"><BrainCircuit className="w-5 h-5"/></div>
                        <h4 className="font-bold text-gray-900">Deep Reasoning</h4>
                    </div>
                    <p className="text-sm text-gray-700">Engine "berfikir" dahulu tentang psikologi pelanggan sebelum menulis satu patah perkataan pun.</p>
                </div>

                 <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                         <div className="bg-white p-2 rounded-lg text-orange-600 border border-orange-100"><Globe className="w-5 h-5"/></div>
                        <h4 className="font-bold text-gray-900">Bahasa Rojak & Lokal</h4>
                    </div>
                    <p className="text-sm text-gray-700">Kepakaran menulis dalam nada "Kakak Vibe", "Abang Vibe" dan campuran Bahasa Melayu/English yang natural.</p>
                </div>

                 <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                         <div className="bg-white p-2 rounded-lg text-orange-600 border border-orange-100"><Zap className="w-5 h-5"/></div>
                        <h4 className="font-bold text-gray-900">High Conversion</h4>
                    </div>
                    <p className="text-sm text-gray-700">Menghasilkan Hook yang "Stopping Power" dan CTA yang memukau untuk jualan maksimum.</p>
                </div>
            </div>

            {/* How it works */}
            <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Cara Ia Berfungsi:</h3>
                <ol className="space-y-4">
                    <li className="flex gap-4">
                        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-orange-600 text-white font-bold text-sm">1</span>
                        <div>
                            <p className="font-bold text-gray-900">Input Data Produk</p>
                            <p className="text-sm text-gray-600">Upload gambar untuk auto-scan atau isi nama dan kelebihan produk.</p>
                        </div>
                    </li>
                    <li className="flex gap-4">
                        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-orange-600 text-white font-bold text-sm">2</span>
                        <div>
                            <p className="font-bold text-gray-900">Pilih Strategi</p>
                            <p className="text-sm text-gray-600">Tetapkan nada (Tone), gaya (Style), dan aktifkan 'Deep Reasoning' jika perlu.</p>
                        </div>
                    </li>
                    <li className="flex gap-4">
                        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-orange-600 text-white font-bold text-sm">3</span>
                        <div>
                            <p className="font-bold text-gray-900">Generate & Copy</p>
                            <p className="text-sm text-gray-600">Terima 10 Hook dan 5 Post siap dalam masa beberapa saat.</p>
                        </div>
                    </li>
                </ol>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-xl text-center border border-orange-100">
                 <p className="text-xs text-orange-800 font-medium">Versi 7.0 | Dikuasakan oleh TAAP Neural Advanced Model</p>
            </div>
        </div>
      </div>
    </div>
  );
};