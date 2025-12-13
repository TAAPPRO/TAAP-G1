import React from 'react';
import { X, Shield, FileText } from 'lucide-react';

export type LegalModalType = 'privacy' | 'terms' | null;

interface LegalModalProps {
  isOpen: boolean;
  type: LegalModalType;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, type, onClose }) => {
  if (!isOpen || !type) return null;

  const getContent = () => {
    switch (type) {
      case 'privacy':
        return {
          title: "Dasar Privasi Data (Data Privacy Policy)",
          icon: <Shield className="w-6 h-6 text-orange-600" />,
          color: "bg-orange-100",
          content: (
            <div className="space-y-5 text-gray-700 text-sm leading-relaxed font-sans">
              <p className="text-xs text-gray-400 font-mono">Dikemaskini: 1 Januari 2025 | Ref: TAAP-PRIV-V7</p>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <p className="text-blue-800 font-medium">Di TAAP GENPRO, data perniagaan anda adalah sulit. Kami menggunakan infrastruktur penyulitan gred perusahaan (Enterprise Encryption) untuk melindungi maklumat produk anda.</p>
              </div>
              <p>Kami tidak akan berkongsi, menjual, atau mendedahkan input produk anda kepada pihak ketiga.</p>
            </div>
          )
        };
      case 'terms':
        return {
          title: "Terma & Syarat Penggunaan (Terms of Service)",
          icon: <FileText className="w-6 h-6 text-blue-600" />,
          color: "bg-blue-100",
          content: (
            <div className="space-y-5 text-gray-700 text-sm leading-relaxed font-sans">
              <p className="text-xs text-gray-400 font-mono">Dikemaskini: 1 Januari 2025 | Ref: TAAP-TOS-V7</p>
              <p>Dengan menggunakan TAAP GENPRO, anda bersetuju dengan syarat-syarat berikut:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Lesen adalah untuk kegunaan peribadi atau perniagaan sendiri sahaja. Berkongsi akaun adalah dilarang.</li>
                <li>Kami tidak bertanggungjawab atas sebarang kerugian yang dialami akibat penggunaan hasil janaan AI ini.</li>
                <li>Penggunaan untuk tujuan haram atau menyalahi undang-undang Malaysia adalah dilarang keras.</li>
              </ul>
            </div>
          )
        };
      default:
        return null;
    }
  };

  const data = getContent();
  if (!data) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${data.color}`}>
              {data.icon}
            </div>
            <h3 className="text-lg font-bold text-gray-900">{data.title}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {data.content}
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50 text-right">
          <button onClick={onClose} className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-black transition-colors">
            Tutup / Close
          </button>
        </div>
      </div>
    </div>
  );
};