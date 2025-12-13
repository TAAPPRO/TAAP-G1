import React, { useState } from 'react';
import { BookOpen, Wand2, PenTool, Image as ImageIcon, Lightbulb, CheckCircle, Languages, ChevronRight, Star, AlertCircle, Film, Zap } from 'lucide-react';

type Lang = 'MY' | 'EN';
type Section = 'autofill' | 'manual' | 'studio' | 'veo' | 'tips';

export const TutorialTab: React.FC = () => {
  const [language, setLanguage] = useState<Lang>('MY');
  const [activeSection, setActiveSection] = useState<Section>('autofill');

  const content = {
    MY: {
      autofill: {
        title: "Panduan: Magic Auto-Fill",
        desc: "Cara terpantas untuk dapatkan hasil. Biarkan Neural Engine mengimbas produk anda.",
        steps: [
          "Klik tab 'Auto-Fill' di bahagian atas.",
          "Masukkan Nama Produk anda (Contoh: 'Sambal Nyet' atau 'iPhone 15 Pro').",
          "Klik butang 'Jana Butiran'.",
          "Sistem akan mencari maklumat produk secara automatik dan mengisi borang untuk anda.",
          "Semak hasil di mod 'Manual' dan tekan 'Generate'."
        ],
        bestPractices: [
           "Gunakan nama produk yang spesifik (bukan umum).",
           "Semak semula 'Core Benefits' selepas auto-fill untuk pastikan ketepatan.",
           "Sesuai untuk produk yang sudah terkenal atau mempunyai data di internet."
        ]
      },
      manual: {
        title: "Panduan: Manual Input",
        desc: "Kawalan penuh untuk hasil yang spesifik dan strategi pemasaran mendalam.",
        steps: [
          "Pilih tab 'Manual'.",
          "Isi 'Nama Produk' dan 'Sasaran Audiens' (Siapa pelanggan anda?).",
          "Di bahagian 'Core Benefits', senaraikan kelebihan produk dalam bentuk point.",
          "Pilih 'Bahasa' dan 'Nada Suara' (Tone) yang sesuai (Contoh: Kakak Vibe).",
          "Pilih 'Format Kandungan' (Contoh: TikTok Script atau FB Post).",
          "Aktifkan 'Deep Reasoning' jika mahu ayat yang menyentuh emosi.",
          "Tekan butang 'Generate' dan tunggu 30 saat."
        ],
        bestPractices: [
           "Semakin banyak info di 'Core Benefits', semakin padu hasil tulisan.",
           "Gunakan nada 'Loghat' untuk engagement tempatan yang tinggi.",
           "Tukar format kepada 'WhatsApp Broadcast' untuk ayat closing di WhatsApp."
        ]
      },
      studio: {
        title: "Panduan: GenPro Studio",
        desc: "Jana visual produk bertaraf studio tanpa jurufoto profesional.",
        steps: [
          "Buka tab 'GENPRO STUDIO'.",
          "Muat naik 1-5 gambar produk anda (Sudut berbeza digalakkan).",
          "Muat naik gambar Model Wajah (Optional) jika mahu kekalkan identiti model.",
          "Masukkan Prompt/Arahan (Contoh: 'Di atas meja kayu, pencahayaan pagi, estetik').",
          "Pilih Nisbah Aspek (1:1 untuk IG, 9:16 untuk Story/TikTok).",
          "Tekan 'Generate Now' dan tunggu proses rendering selesai."
        ],
        bestPractices: [
           "Gunakan gambar produk yang jelas dan terang.",
           "Jangan biarkan prompt kosong, berikan konteks latar belakang.",
           "Gunakan nisbah 9:16 untuk kegunaan wallpaper atau TikTok background."
        ]
      },
      veo: {
        title: "Panduan: Veo Video Gen",
        desc: "Hasilkan video sinematik menggunakan teknologi Google Veo Generative AI.",
        steps: [
          "Buka tab 'VIDEO GEN'.",
          "Masukkan Prompt Video dalam Bahasa Inggeris (Contoh: 'A cinematic drone shot of a futuristic city, neon lights, 4k').",
          "Pilih Nisbah Aspek (16:9 untuk YouTube/TV, 9:16 untuk TikTok/Reels).",
          "Muat naik Gambar Rujukan (Optional) untuk menetapkan frame permulaan video.",
          "Tekan butang 'Cipta Video AI'.",
          "Tunggu 30-60 saat untuk proses penjanaan selesai."
        ],
        bestPractices: [
           "Prompt MESTI dalam Bahasa Inggeris untuk hasil terbaik.",
           "Gunakan kata kunci seperti 'Cinematic', 'Hyper-realistic', 'Slow motion'.",
           "Video AI memakan kos 'High Energy' (10 kredit), gunakan dengan bijak."
        ]
      },
      tips: {
        title: "Rahsia & Tips Pro",
        desc: "Cara memaksimumkan penggunaan TAAP GenPro untuk jualan meletup.",
        list: [
          { title: "Neural Energy System", text: "Fahami kos tenaga: Teks (1 Kredit - Low), Gambar (2 Kredit - Medium), Video Veo (10 Kredit - High). Semak bar tenaga anda sebelum menjana video." },
          { title: "Deep Reasoning", text: "Gunakan fungsi ini untuk produk mahal (High Ticket). Ia membina kepercayaan sebelum menjual." },
          { title: "Humanizer", text: "Jika ayat rasa terlalu baku, gunakan butang 'Tukar Jadi Human' di hasil output untuk tambah slanga 'lah', 'wei', 'doh'." },
          { title: "Viral Trends", text: "Aktifkan suis 'Cari Trend Viral' untuk mengaitkan produk anda dengan isu semasa di Malaysia." },
          { title: "Neural Vault", text: "Semua hasil kerja anda disimpan di Vault. Anda boleh 'Reuse' kembali konten lama tanpa tolak kredit baru." }
        ]
      }
    },
    EN: {
      autofill: {
        title: "Guide: Magic Auto-Fill",
        desc: "The fastest way to get results. Let the Neural Engine scan your product.",
        steps: [
          "Click the 'Auto-Fill' tab at the top.",
          "Enter your Product Name (e.g., 'Sambal Nyet' or 'iPhone 15 Pro').",
          "Click the 'Generate Details' button.",
          "The system will automatically search for product info and fill the form.",
          "Review the details in 'Manual' mode and hit 'Generate'."
        ],
        bestPractices: [
           "Use specific product names (not generic categories).",
           "Double-check 'Core Benefits' after auto-fill for accuracy.",
           "Best for products that are already established or have online data."
        ]
      },
      manual: {
        title: "Guide: Manual Input",
        desc: "Full control for specific results and deep marketing strategies.",
        steps: [
          "Select the 'Manual' tab.",
          "Fill in 'Product Name' and 'Target Audience'.",
          "In 'Core Benefits', list your product's strengths in bullet points.",
          "Select 'Language' and 'Tone of Voice' (e.g., Professional, Friendly).",
          "Choose 'Content Format' (e.g., TikTok Script or FB Post).",
          "Enable 'Deep Reasoning' if you want emotionally resonant copy.",
          "Click 'Generate' and wait for ~30 seconds."
        ],
        bestPractices: [
           "The more details in 'Core Benefits', the more powerful the output.",
           "Use 'Dialect' tones for higher local engagement.",
           "Switch format to 'WhatsApp Broadcast' for direct closing scripts."
        ]
      },
      studio: {
        title: "Guide: GenPro Studio",
        desc: "Generate studio-grade product visuals without a professional photographer.",
        steps: [
          "Open the 'GENPRO STUDIO' tab.",
          "Upload 1-5 product images (Different angles recommended).",
          "Upload a Model Face image (Optional) to preserve model identity.",
          "Enter Prompt/Instructions (e.g., 'On a wooden table, morning light, aesthetic').",
          "Select Aspect Ratio (1:1 for IG, 9:16 for Story/TikTok).",
          "Click 'Generate Now' and wait for the rendering process."
        ],
        bestPractices: [
           "Use clear, well-lit product images.",
           "Don't leave the prompt empty; describe the background context.",
           "Use 9:16 ratio for wallpapers or TikTok backgrounds."
        ]
      },
      veo: {
        title: "Guide: Veo Video Gen",
        desc: "Create cinematic videos using Google Veo Generative AI technology.",
        steps: [
          "Open the 'VIDEO GEN' tab.",
          "Enter your Video Prompt in English (e.g., 'A cinematic drone shot of a futuristic city, neon lights, 4k').",
          "Select Aspect Ratio (16:9 for YouTube/TV, 9:16 for TikTok/Reels).",
          "Upload a Reference Image (Optional) to set the starting frame.",
          "Click the 'Create AI Video' button.",
          "Wait 30-60 seconds for the generation process to complete."
        ],
        bestPractices: [
           "Prompt MUST be in English for best results.",
           "Use keywords like 'Cinematic', 'Hyper-realistic', 'Slow motion'.",
           "AI Video consumes 'High Energy' (10 credits), use wisely."
        ]
      },
      tips: {
        title: "Secrets & Pro Tips",
        desc: "How to maximize TAAP GenPro for explosive sales.",
        list: [
          { title: "Neural Energy System", text: "Understand energy costs: Text (1 Credit - Low), Image (2 Credits - Medium), Veo Video (10 Credits - High). Check your energy bar before generating video." },
          { title: "Deep Reasoning", text: "Use this for High Ticket products. It builds trust before selling." },
          { title: "Humanizer", text: "If the output feels too formal, use the 'Humanize' button to add local slang and natural particles." },
          { title: "Viral Trends", text: "Toggle 'Viral Trends' to connect your product with current hot topics in Malaysia." },
          { title: "Neural Vault", text: "All your work is saved in the Vault. You can 'Reuse' old content without deducting new credits." }
        ]
      }
    }
  };

  const currentContent = content[language];

  const renderSectionButton = (id: Section, label: string, Icon: any) => (
    <button
      onClick={() => setActiveSection(id)}
      className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-all font-bold text-sm text-left mb-2
        ${activeSection === id
          ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg transform scale-[1.02]'
          : 'bg-white text-gray-600 border border-gray-100 hover:bg-orange-50 hover:border-orange-200'
        }
      `}
    >
      <div className={`p-2 rounded-lg ${activeSection === id ? 'bg-white/20' : 'bg-gray-100'}`}>
        <Icon className="w-5 h-5" />
      </div>
      <span>{label}</span>
      {activeSection === id && <ChevronRight className="w-4 h-4 ml-auto" />}
    </button>
  );

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-5 md:p-8 animate-fade-in font-sans min-h-[600px]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-100 pb-6 gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-orange-600" />
            {language === 'MY' ? 'Panduan TAAP GenPro' : 'TAAP GenPro Guide'}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {language === 'MY' ? 'Kuasai Sistem Neural Pemasaran No.1 Malaysia.' : 'Master Malaysia\'s No.1 Neural Marketing System.'}
          </p>
        </div>

        <button 
          onClick={() => setLanguage(prev => prev === 'MY' ? 'EN' : 'MY')}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full text-xs font-bold hover:bg-black transition-colors"
        >
          <Languages className="w-4 h-4" />
          {language === 'MY' ? 'Switch to English' : 'Tukar ke Bahasa Melayu'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="md:col-span-4 lg:col-span-3">
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 h-full">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">Menu Tutorial</p>
            {renderSectionButton('autofill', 'Magic Auto-Fill', Wand2)}
            {renderSectionButton('manual', 'Manual Input', PenTool)}
            {renderSectionButton('studio', 'GenPro Studio', ImageIcon)}
            {renderSectionButton('veo', 'Veo Video Gen', Film)}
            {renderSectionButton('tips', 'Pro Tips & Tricks', Lightbulb)}
          </div>
        </div>

        {/* Content Area */}
        <div className="md:col-span-8 lg:col-span-9">
          <div className="bg-white h-full">
            
            {/* Dynamic Content */}
            {activeSection !== 'tips' ? (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900 mb-2">{currentContent[activeSection].title}</h3>
                  <p className="text-gray-600 text-lg">{currentContent[activeSection].desc}</p>
                </div>

                {/* Steps */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-2">
                    {language === 'MY' ? 'Langkah Demi Langkah' : 'Step-by-Step Instructions'}
                  </h4>
                  {/* @ts-ignore */}
                  {currentContent[activeSection].steps.map((step, idx) => (
                    <div key={idx} className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all">
                      <div className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                      </div>
                      <p className="text-gray-700 font-medium leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>

                {/* Best Practices */}
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                  <h4 className="text-blue-900 font-bold flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 fill-current" />
                    {language === 'MY' ? 'Amalan Terbaik (Best Practices)' : 'Best Practices'}
                  </h4>
                  <ul className="space-y-3">
                    {/* @ts-ignore */}
                    {currentContent[activeSection].bestPractices.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-blue-800 text-sm">
                        <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              // Tips Section Layout
              <div className="space-y-8">
                 <div>
                  <h3 className="text-2xl font-extrabold text-gray-900 mb-2">{currentContent.tips.title}</h3>
                  <p className="text-gray-600 text-lg">{currentContent.tips.desc}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* @ts-ignore */}
                  {currentContent.tips.list.map((item, idx) => (
                    <div key={idx} className="p-6 rounded-2xl border border-gray-200 hover:shadow-lg hover:border-orange-300 transition-all bg-white group">
                      <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-600 transition-colors">
                        <Lightbulb className="w-6 h-6 text-orange-600 group-hover:text-white" />
                      </div>
                      <h4 className="font-bold text-lg text-gray-900 mb-2">{item.title}</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
                   <AlertCircle className="w-5 h-5 text-yellow-700 mt-0.5" />
                   <div>
                      <h5 className="font-bold text-yellow-800 text-sm">{language === 'MY' ? 'Nota Penting' : 'Important Note'}</h5>
                      <p className="text-xs text-yellow-700 mt-1">
                        {language === 'MY' 
                          ? 'TAAP GenPro bukan sekadar alat, ia adalah "Partner" pemasaran anda. Semakin kerap anda gunakannya, semakin anda faham cara mendapatkan hasil terbaik.' 
                          : 'TAAP GenPro is not just a tool, it is your marketing "Partner". The more you use it, the better you will understand how to get the best results.'}
                      </p>
                   </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};