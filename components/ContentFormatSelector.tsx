
import React from 'react';
import { ContentFormat } from '../types';
import { Instagram, Video, Mail, List, Megaphone, MessageCircle, ShoppingBag, Linkedin, Radio, Smartphone, AtSign } from 'lucide-react';

interface ContentFormatSelectorProps {
  value: string;
  onChange: (value: ContentFormat) => void;
}

// Custom Threads Icon (Meta) style using SVG to match Lucide style
const ThreadsIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M19 12c0-3.5-3-6-6-6a6 6 0 1 0 6 6v3" />
    <path d="M15.5 12a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" />
    <path d="M21.5 12v3a9 9 0 0 1-18 0v-3a9 9 0 0 1 9-9c2.2 0 4.2.8 5.7 2.1" />
  </svg>
);

// Updated options with correct icons and descriptions
const formatOptions = [
  { 
    id: ContentFormat.INSTAGRAM_POST, 
    name: "Instagram/FB Post", 
    description: "Standard caption with Hook-Body-CTA structure.",
    icon: <Instagram className="w-5 h-5" /> 
  },
  { 
    id: ContentFormat.TIKTOK_SCRIPT, 
    name: "Short Video Script", 
    description: "TikTok/Reels: Visual cues + Audio.",
    icon: <Video className="w-5 h-5" /> 
  },
  { 
    id: ContentFormat.WHATSAPP_BROADCAST, 
    name: "WhatsApp Broadcast", 
    description: "Personal, short & direct messaging.",
    icon: <MessageCircle className="w-5 h-5" /> 
  },
  { 
    id: ContentFormat.SHOPEE_DESC, 
    name: "E-Commerce Desc", 
    description: "Shopee/Lazada: Bullet points & SEO.",
    icon: <ShoppingBag className="w-5 h-5" /> 
  },
  { 
    id: ContentFormat.FACEBOOK_AD, 
    name: "Paid Ads (FB/IG)", 
    description: "High-conversion copy for paid campaigns.",
    icon: <Megaphone className="w-5 h-5" /> 
  },
  { 
    id: ContentFormat.TWITTER_THREAD, 
    name: "X Thread (Twitter)", 
    description: "Connected tweets series (Storytelling).",
    icon: <ThreadsIcon className="w-5 h-5" /> 
  },
  { 
    id: ContentFormat.TIKTOK_LIVE, 
    name: "Live Selling Script", 
    description: "Flow and structure for live streams.",
    icon: <Radio className="w-5 h-5" /> 
  },
  { 
    id: ContentFormat.LINKEDIN_ARTICLE, 
    name: "LinkedIn Post", 
    description: "Professional, Thought Leadership style.",
    icon: <Linkedin className="w-5 h-5" /> 
  },
  { 
    id: ContentFormat.FACEBOOK_STORY, 
    name: "IG/FB Story", 
    description: "Very short, suitable for text-overlays.",
    icon: <Smartphone className="w-5 h-5" /> 
  },
  { 
    id: ContentFormat.EMAIL_MARKETING, 
    name: "Email Newsletter", 
    description: "Catchy subject line & body content.",
    icon: <Mail className="w-5 h-5" /> 
  },
  { 
    id: ContentFormat.LISTICLE_ARTICLE, 
    name: "Blog/Listicle", 
    description: "'Top 5' or 'Tips' list format.",
    icon: <List className="w-5 h-5" /> 
  },
];

export const ContentFormatSelector: React.FC<ContentFormatSelectorProps> = ({ value, onChange }) => {
  return (
    <div>
        <label className="block text-sm font-bold text-gray-800 mb-2">
            Select Content Format (Strategy)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
            {formatOptions.map((format) => {
                const isSelected = value === format.id;
                return (
                    <button
                        key={format.id}
                        type="button"
                        onClick={() => onChange(format.id)}
                        className={`
                            p-3 rounded-lg border text-left transition-all duration-200
                            flex flex-col justify-between h-full min-h-[100px]
                            ${isSelected 
                                ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-300 shadow-md' 
                                : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50/30'
                            }
                        `}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`p-1.5 rounded-md ${isSelected ? 'bg-orange-200 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                                {format.icon}
                            </div>
                            <h4 className={`text-xs font-extrabold leading-tight ${isSelected ? 'text-orange-900' : 'text-gray-800'}`}>{format.name}</h4>
                        </div>
                        <p className="text-[10px] text-gray-500 leading-snug">{format.description}</p>
                    </button>
                );
            })}
        </div>
    </div>
  );
};
