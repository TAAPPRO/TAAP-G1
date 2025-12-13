
import React, { useState, useEffect } from 'react';
import { X, Search, Clock, Trash2, Copy, FileText, Zap, Sparkles, AlertCircle } from 'lucide-react';
import { GeneratedContent, Tone, ContentFormat } from '../types';
import { CopyToClipboard } from './CopyToClipboard';

interface HistoryItem {
  id: string;
  timestamp: number;
  productName: string;
  tone: Tone;
  format: ContentFormat;
  content: GeneratedContent;
}

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestore: (item: HistoryItem) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, onRestore }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = () => {
    try {
      const stored = localStorage.getItem('taap_neural_vault');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
            // SAFE PARSING: Filter out corrupt items to prevent UI crashes
            const validItems = parsed.filter((item: any) => 
                item && 
                item.content && 
                Array.isArray(item.content.hooks) &&
                Array.isArray(item.content.posts)
            ).map((item: any) => ({
                ...item,
                // Backwards compatibility for V6 -> V7 (Ensure 'angle' exists)
                content: {
                    ...item.content,
                    posts: item.content.posts.map((p: any) => ({
                        ...p,
                        angle: p.angle || 'General Strategy' 
                    }))
                }
            }));
            
            setHistory(validItems.sort((a: HistoryItem, b: HistoryItem) => b.timestamp - a.timestamp));
        }
      }
    } catch (e) {
      console.error("Failed to load history", e);
      // If critical error, clear to recover
      // localStorage.removeItem('taap_neural_vault');
    }
  };

  const deleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Padam item ini dari Neural Vault?")) {
      const newHistory = history.filter(h => h.id !== id);
      setHistory(newHistory);
      localStorage.setItem('taap_neural_vault', JSON.stringify(newHistory));
    }
  };

  const clearAll = () => {
    if (window.confirm("AMARAN: Ini akan memadam semua sejarah simpanan lokal anda. Teruskan?")) {
      setHistory([]);
      localStorage.removeItem('taap_neural_vault');
    }
  };

  const filteredHistory = history.filter(item => 
    (item.productName || 'Untitled').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.format || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (ts: number) => {
    try {
        return new Date(ts).toLocaleString('en-MY', { 
          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
        });
    } catch { return 'Invalid Date'; }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden border border-gray-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-100 rounded-lg text-indigo-700">
                <Clock className="w-6 h-6" />
             </div>
             <div>
                <h3 className="text-xl font-extrabold text-gray-900">Neural Vault</h3>
                <p className="text-xs text-gray-500 font-medium">Arkib Penjanaan Terdahulu (Local Storage)</p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Disclaimer */}
        <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-800 leading-tight">
                <strong>Nota Penting:</strong> Data Vault disimpan dalam browser peranti ini sahaja (Local Storage). 
                Ia tidak akan hilang jika sistem dikemaskini, tetapi akan hilang jika anda "Clear Cache" browser anda.
            </p>
        </div>

        {/* Search & Actions */}
        <div className="p-4 border-b border-gray-100 flex gap-3 bg-white">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Cari produk..." 
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            {history.length > 0 && (
                <button 
                    onClick={clearAll}
                    className="px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                >
                    <Trash2 className="w-3 h-3" /> Clear
                </button>
            )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
            {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 opacity-60">
                    <Clock className="w-16 h-16 mb-4" />
                    <p className="text-sm font-bold">Tiada Sejarah Disimpan</p>
                    <p className="text-xs">Jana konten pertama anda untuk melihatnya di sini.</p>
                </div>
            ) : filteredHistory.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">Tiada hasil carian.</div>
            ) : (
                <div className="space-y-3">
                    {filteredHistory.map((item) => (
                        <div 
                            key={item.id} 
                            onClick={() => { onRestore(item); onClose(); }}
                            className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-bold text-gray-900 line-clamp-1">{item.productName || 'Untitled'}</h4>
                                    <span className="text-[10px] font-mono text-gray-400 flex items-center gap-1 mt-0.5">
                                        <Clock className="w-3 h-3" /> {formatDate(item.timestamp)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-[10px] font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded uppercase">
                                        {item.content?.posts?.length || 0} Posts
                                    </div>
                                    <button 
                                        onClick={(e) => deleteItem(item.id, e)}
                                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors z-10"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-3">
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-orange-50 text-orange-700 text-[10px] font-bold border border-orange-100">
                                    <Zap className="w-3 h-3" /> {item.tone || 'Auto'}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100">
                                    <FileText className="w-3 h-3" /> {item.format || 'Post'}
                                </span>
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center opacity-60 group-hover:opacity-100 transition-opacity">
                                <span className="text-xs text-gray-500 italic truncate max-w-[200px]">
                                    "{item.content?.hooks?.[0] || 'No Hook Preview'}"
                                </span>
                                <span className="text-indigo-600 text-xs font-bold flex items-center gap-1">
                                    Lihat <Sparkles className="w-3 h-3" />
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

      </div>
    </div>
  );
};
