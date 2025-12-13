
import React, { useState, useEffect } from 'react';
import { GeneratedContent, ContentFormat } from '../types';
import { CopyToClipboard } from './CopyToClipboard';
import { Sparkles, Hash, MessageSquare, Send, UserCheck, Copy, ThumbsUp, ThumbsDown, Zap, Save, Loader2, Smartphone, Instagram, Linkedin, Mail, Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Edit2, X, Check, RotateCcw, User, MoreVertical, ShoppingBag, ShoppingCart, Globe, Plus } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface OutputSectionProps {
  content: GeneratedContent;
  onHumanize: () => void;
  isHumanizing?: boolean;
  format?: ContentFormat;
}

const RichTextRenderer = ({ text }: { text: string }) => {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5">
      {lines.map((line, lineIdx) => {
         if (!line.trim()) return <br key={lineIdx} className="content-spacer" />;
         if (line.trim() === '---' || line.trim() === '***') return <hr key={lineIdx} className="my-3 border-gray-200" />;
         
         // List detection
         if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
             return (
                 <div key={lineIdx} className="flex gap-2 pl-1">
                     <span className="text-gray-400">•</span>
                     <span className="flex-1">{parseRichText(line.substring(2))}</span>
                 </div>
             )
         }

         return (
           <p key={lineIdx} className="leading-relaxed">
             {parseRichText(line)}
           </p>
         );
      })}
    </div>
  );
};

const parseRichText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|~~.*?~~|`.*?`)/g);
    return parts.map((part, partIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) return <strong key={partIdx} className="font-extrabold text-gray-900">{part.slice(2, -2)}</strong>;
        if (part.startsWith('~~') && part.endsWith('~~')) return <s key={partIdx} className="text-gray-400 decoration-gray-400 decoration-2">{part.slice(2, -2)}</s>;
        if (part.startsWith('`') && part.endsWith('`')) return <code key={partIdx} className="bg-gray-100 text-red-600 px-1 py-0.5 rounded font-mono text-xs">{part.slice(1, -1)}</code>;
        return part;
    });
}

// Wrapper for visual context
const PlatformPreview = ({ children, format, angle }: { children?: React.ReactNode, format?: ContentFormat, angle?: string }) => {
    
    // 1. INSTAGRAM / FB
    if (format === ContentFormat.INSTAGRAM_POST || format === ContentFormat.FACEBOOK_AD) {
        return (
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm max-w-md mx-auto font-sans">
                <div className="p-3 flex items-center justify-between border-b border-gray-50">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[1px]">
                            <div className="w-full h-full bg-white rounded-full p-0.5">
                                <div className="w-full h-full bg-gray-200 rounded-full"></div>
                            </div>
                        </div>
                        <div className="text-xs">
                            <p className="font-bold text-gray-900">YourBrand</p>
                            <p className="text-[10px] text-gray-500">Sponsored • {angle || 'Promotion'}</p>
                        </div>
                    </div>
                    <MoreHorizontal className="w-4 h-4 text-gray-400"/>
                </div>
                <div className="bg-gray-100 aspect-square flex items-center justify-center text-gray-400">
                    <span className="text-xs">[Image/Video Placeholder]</span>
                </div>
                <div className="p-3">
                    <div className="flex justify-between mb-2">
                        <div className="flex gap-3">
                            <Heart className="w-5 h-5 text-gray-800"/>
                            <MessageCircle className="w-5 h-5 text-gray-800"/>
                            <Share2 className="w-5 h-5 text-gray-800"/>
                        </div>
                        <Bookmark className="w-5 h-5 text-gray-800"/>
                    </div>
                    <div className="text-xs text-gray-900 mb-1 font-bold">1,234 likes</div>
                    <div className="text-xs text-gray-800">
                        <span className="font-bold mr-1">YourBrand</span>
                        {children}
                    </div>
                </div>
            </div>
        )
    }
    
    // 2. WHATSAPP
    if (format === ContentFormat.WHATSAPP_BROADCAST) {
        return (
            <div className="max-w-sm mx-auto bg-[#E5DDD5] rounded-xl overflow-hidden shadow-sm border border-gray-200 font-sans">
                <div className="bg-[#075E54] text-white p-3 flex items-center gap-3 shadow-md">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><User className="w-5 h-5 text-white"/></div>
                    <div className="flex-1">
                        <p className="font-bold text-sm">Customer List</p>
                        <p className="text-[10px] opacity-80">tap here for group info</p>
                    </div>
                    <MoreVertical className="w-4 h-4"/>
                </div>
                <div className="p-4 min-h-[250px] flex flex-col gap-2 relative">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-500 to-transparent pointer-events-none"></div>
                    <div className="self-end bg-[#DCF8C6] p-3 rounded-lg rounded-tr-none shadow-sm max-w-[90%] text-sm text-gray-900 relative z-10">
                        {children}
                        <div className="text-[10px] text-gray-500 text-right mt-1 flex justify-end gap-1 items-center">
                            10:45 AM <div className="flex -space-x-1"><Check className="w-3 h-3 text-blue-500"/><Check className="w-3 h-3 text-blue-500"/></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // 3. SHOPEE / LAZADA
    if (format === ContentFormat.SHOPEE_DESC) {
        return (
            <div className="max-w-md mx-auto bg-gray-100 rounded-xl overflow-hidden border border-gray-200 font-sans shadow-sm">
                <div className="bg-[#ee4d2d] text-white p-3 flex justify-between items-center text-sm font-bold shadow-sm">
                    <span className="flex items-center gap-2"><ShoppingBag className="w-4 h-4"/> Product Preview</span>
                    <MoreHorizontal className="w-4 h-4"/>
                </div>
                <div className="bg-white p-4 pb-6">
                    <div className="flex gap-3 mb-4 border-b border-gray-100 pb-4">
                        <div className="w-20 h-20 bg-gray-200 rounded-md shrink-0 animate-pulse"></div>
                        <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                            <div className="text-[#ee4d2d] font-bold text-lg">RM 49.90</div>
                        </div>
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 text-sm mb-2 bg-gray-50 p-2 rounded">Product Description</p>
                        <div className="text-xs text-gray-700 leading-relaxed px-2">
                            {children}
                        </div>
                    </div>
                </div>
                <div className="bg-white p-3 border-t border-gray-200 flex justify-end gap-2">
                    <button className="flex-1 py-2 bg-[#ff5722]/10 text-[#ff5722] font-bold text-xs rounded border border-[#ff5722]/30 flex items-center justify-center gap-1"><ShoppingCart className="w-3 h-3"/> Add Cart</button>
                    <button className="flex-1 py-2 bg-[#ee4d2d] text-white font-bold text-xs rounded shadow-sm">Buy Now</button>
                </div>
            </div>
        )
    }

    // 4. TWITTER / X
    if (format === ContentFormat.TWITTER_THREAD) {
        return (
            <div className="max-w-md mx-auto bg-white rounded-xl border border-gray-200 shadow-sm p-4 font-sans">
                <div className="flex gap-3">
                    <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-full bg-gray-900 shrink-0"></div>
                        <div className="w-0.5 flex-1 bg-gray-200 min-h-[50px] mt-1 mb-1"></div>
                    </div>
                    <div className="flex-1 pb-4">
                        <div className="flex items-center gap-1 mb-1">
                            <span className="font-bold text-gray-900 text-sm">Your Name</span>
                            <span className="text-gray-500 text-xs">@handle · 2h</span>
                        </div>
                        <div className="text-sm text-gray-900 leading-normal mb-3 whitespace-pre-wrap">
                            {children}
                        </div>
                        <div className="flex justify-between text-gray-500 max-w-xs pt-2">
                            <MessageCircle className="w-4 h-4 hover:text-blue-500 cursor-pointer"/>
                            <RotateCcw className="w-4 h-4 hover:text-green-500 cursor-pointer"/>
                            <Heart className="w-4 h-4 hover:text-red-500 cursor-pointer"/>
                            <Bookmark className="w-4 h-4 hover:text-blue-500 cursor-pointer"/>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // 5. LINKEDIN
    if (format === ContentFormat.LINKEDIN_ARTICLE) {
        return (
            <div className="max-w-lg mx-auto bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden font-sans">
                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-[#0077b5] flex items-center justify-center text-white font-bold shrink-0">In</div>
                    <div>
                        <p className="text-xs font-bold text-gray-900">Your Professional Profile</p>
                        <p className="text-[10px] text-gray-500">Marketing Expert • 5h • <Globe className="w-3 h-3 inline"/></p>
                    </div>
                    <button className="ml-auto text-blue-600 font-bold text-xs flex items-center gap-1"><Plus className="w-3 h-3"/> Follow</button>
                </div>
                <div className="p-4 text-sm text-gray-800 leading-relaxed">
                    {children}
                </div>
                <div className="px-4 py-3 border-t border-gray-100 flex gap-6 text-gray-500 bg-gray-50/50">
                    <span className="flex items-center gap-1.5 text-xs font-bold hover:bg-gray-100 p-1 rounded cursor-pointer transition-colors"><ThumbsUp className="w-4 h-4"/> Like</span>
                    <span className="flex items-center gap-1.5 text-xs font-bold hover:bg-gray-100 p-1 rounded cursor-pointer transition-colors"><MessageSquare className="w-4 h-4"/> Comment</span>
                    <span className="flex items-center gap-1.5 text-xs font-bold hover:bg-gray-100 p-1 rounded cursor-pointer transition-colors"><Share2 className="w-4 h-4"/> Repost</span>
                    <span className="flex items-center gap-1.5 text-xs font-bold hover:bg-gray-100 p-1 rounded cursor-pointer transition-colors"><Send className="w-4 h-4"/> Send</span>
                </div>
            </div>
        )
    }

    // 6. EMAIL
    if (format === ContentFormat.EMAIL_MARKETING) {
        return (
            <div className="border border-gray-200 rounded-xl bg-white shadow-sm p-6 max-w-2xl mx-auto font-serif">
                <div className="border-b border-gray-100 pb-4 mb-4">
                    <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                        <Mail className="w-4 h-4"/>
                        <span>To: Subscriber List</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">Subject:</p>
                    <h3 className="font-bold text-gray-900 text-lg">{angle || 'Subject Line'}</h3>
                </div>
                <div className="text-gray-800 text-sm leading-relaxed">
                    {children}
                </div>
            </div>
        )
    }

    // 7. TIKTOK SCRIPT
    if (format === ContentFormat.TIKTOK_SCRIPT || format === ContentFormat.TIKTOK_LIVE) {
        return (
            <div className="bg-gray-900 text-gray-200 rounded-xl p-6 font-mono text-xs leading-relaxed max-w-md mx-auto border-l-4 border-cyan-400 shadow-xl">
                <div className="flex items-center gap-2 mb-4 text-gray-400 uppercase font-bold tracking-widest border-b border-gray-800 pb-2">
                    <Smartphone className="w-4 h-4" /> Script Mode
                </div>
                {children}
            </div>
        )
    }

    // Default Card
    return (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm text-sm text-gray-800">
            {children}
        </div>
    );
}

export const OutputSection: React.FC<OutputSectionProps> = ({ content, onHumanize, isHumanizing = false, format }) => {
  // Local state for editing
  const [localContent, setLocalContent] = useState<GeneratedContent | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, string>>({});
  const [editingPostIndex, setEditingPostIndex] = useState<number | null>(null);
  const [editBuffer, setEditBuffer] = useState({ hook: '', body: '', cta: '' });

  // Sync props to local state when content changes (new generation)
  useEffect(() => {
      setLocalContent(content);
      setEditingPostIndex(null); // Reset edit mode on new gen
  }, [content]);

  // -- HANDLERS --

  const handleFeedback = async (id: string, type: 'positive' | 'negative', text: string) => {
    setFeedbackGiven(prev => ({ ...prev, [id]: type }));
    // Log to DB
    const key = localStorage.getItem('taap_genpro_v4_license');
    if (key) {
        await supabase.from('feedback_logs').insert({
            license_key: key,
            rating: type,
            content_snippet: text.substring(0, 100) + '...'
        });
    }
  };

  const startEditing = (index: number) => {
      if (!localContent) return;
      const post = localContent.posts[index];
      setEditBuffer({
          hook: post.hook,
          body: post.body,
          cta: post.cta
      });
      setEditingPostIndex(index);
  };

  const cancelEditing = () => {
      setEditingPostIndex(null);
      setEditBuffer({ hook: '', body: '', cta: '' });
  };

  const saveEditing = (index: number) => {
      if (!localContent) return;
      const updatedPosts = [...localContent.posts];
      updatedPosts[index] = {
          ...updatedPosts[index],
          hook: editBuffer.hook,
          body: editBuffer.body,
          cta: editBuffer.cta
      };
      
      setLocalContent({
          ...localContent,
          posts: updatedPosts
      });
      setEditingPostIndex(null);
  };
  
  const getAllContentText = () => {
    if (!localContent) return "";
    const { hooks = [], posts = [], hashtags = [], ctas = [] } = localContent;
    const separator = "--------------------------------------------------";
    let text = `🔥 TAAP GENPRO V7.0 OUTPUT 🔥\n\n`;
    text += `${separator}\n10 VIRAL HOOKS\n${separator}\n`;
    hooks.forEach((hook, i) => text += `${i + 1}. ${hook}\n`);
    text += "\n";
    text += `${separator}\n5 STRATEGIC POSTS\n${separator}\n`;
    posts.forEach((post, i) => {
      const safeAngle = post.angle ? post.angle.toUpperCase() : `STRATEGY ${i+1}`;
      text += `\n[POST ${i + 1}: ${safeAngle}]\n`;
      text += `HOOK: ${post.hook}\n`;
      text += `BODY:\n${post.body}\n`;
      text += `CTA: ${post.cta}\n`;
    });
    text += "\n";
    text += `${separator}\nHASHTAGS\n${separator}\n`;
    text += hashtags.join(" ") + "\n\n";
    text += `${separator}\nVARIASI CTA\n${separator}\n`;
    ctas.forEach(cta => text += `- ${cta}\n`);
    return text;
  };

  const allContent = getAllContentText();

  // Safety check
  if (!localContent) return null;

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      
      {/* Top Actions */}
      <div className="flex flex-col gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between text-xs md:text-sm text-green-800 shadow-sm">
            <div className="flex items-center gap-2">
                <div className="bg-green-100 p-1.5 rounded-full"><Save className="w-4 h-4 text-green-600"/></div>
                <span className="font-bold">Output saved to Neural Vault. Edit Mode Active.</span>
            </div>
            <span className="text-green-600 opacity-70 font-mono">Auto-Save On</span>
        </div>

        <CopyToClipboard 
            text={allContent}
            label="COPY ALL (EDITED VERSION)"
            copiedLabel="COPIED ALL!"
            className="w-full py-4 text-base font-bold bg-gray-900 hover:bg-black text-white shadow-xl rounded-xl flex items-center justify-center gap-2 transform transition-transform active:scale-95 border-2 border-transparent"
        />

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-full text-orange-600 border border-orange-100">
                <UserCheck className="w-5 h-5" />
                </div>
                <div>
                <h4 className="font-bold text-gray-900 text-sm md:text-base">Sound too robotic?</h4>
                <p className="text-xs md:text-sm text-gray-600">Adjust tone to be more "human", natural & authentic.</p>
                </div>
            </div>
            <button 
                onClick={onHumanize}
                disabled={isHumanizing}
                className="w-full md:w-auto px-6 py-3 md:py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed border border-transparent active:scale-95"
            >
                {isHumanizing ? <><Loader2 className="w-4 h-4 animate-spin"/> Processing...</> : <><UserCheck className="w-4 h-4" /> Humanize It</>}
            </button>
        </div>
      </div>

      {/* 1. HOOKS SECTION - Improved Card Layout */}
      <div>
        <div className="flex items-center gap-2 mb-4 px-2">
            <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><Sparkles className="w-5 h-5" /></div>
            <h3 className="text-xl font-black text-gray-900">10 Viral Hooks</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {localContent.hooks?.map((hook, index) => (
                <div key={index} className="group relative bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-orange-300 transition-all duration-200 flex flex-col justify-between">
                    <div className="flex gap-3 mb-2">
                        <span className="text-orange-500 font-black text-lg select-none opacity-50">{index + 1}</span>
                        <div className="text-gray-800 font-medium text-sm leading-relaxed w-full">
                            <RichTextRenderer text={hook} />
                        </div>
                    </div>
                    <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <CopyToClipboard text={hook} label="Copy" className="text-[10px] py-1 px-3 h-auto" />
                    </div>
                </div>
            )) || <div className="p-4 text-gray-500 text-sm">No hooks generated.</div>}
        </div>
      </div>

      {/* 2. POSTS SECTION - Platform Specific Preview & EDITING */}
      <div className="space-y-8">
        <div className="flex items-center gap-3 px-2 border-b border-gray-200 pb-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><MessageSquare className="w-5 h-5" /></div>
            <div>
                <h3 className="text-xl font-black text-gray-900">5 High-Impact Posts</h3>
                <p className="text-xs text-gray-500 font-medium">Review and Edit before copying.</p>
            </div>
        </div>
        
        {localContent.posts?.map((post, index) => {
          const isEditing = editingPostIndex === index;

          return (
            <div key={index} className="space-y-3">
               {/* Post Header Action Bar */}
               <div className="flex items-center justify-between px-2">
                   <div className="flex items-center gap-2">
                       <span className="bg-gray-900 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                          <Zap className="w-3 h-3 text-yellow-400" /> {post.angle || `Angle ${index+1}`}
                       </span>
                       {isEditing && <span className="text-xs text-orange-600 font-bold animate-pulse flex items-center gap-1">● Editing Mode</span>}
                   </div>
                   <div className="flex items-center gap-2">
                       {!isEditing ? (
                           <>
                               <button onClick={() => startEditing(index)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors" title="Edit Post">
                                   <Edit2 className="w-4 h-4" />
                               </button>
                               <div className="h-4 w-px bg-gray-200 mx-1"></div>
                               <button onClick={() => handleFeedback(`post-${index}`, 'positive', post.hook)} className={`p-1.5 rounded hover:bg-green-50 ${feedbackGiven[`post-${index}`] === 'positive' ? 'text-green-600' : 'text-gray-400'}`}><ThumbsUp className="w-4 h-4" /></button>
                               <button onClick={() => handleFeedback(`post-${index}`, 'negative', post.hook)} className={`p-1.5 rounded hover:bg-red-50 ${feedbackGiven[`post-${index}`] === 'negative' ? 'text-red-600' : 'text-gray-400'}`}><ThumbsDown className="w-4 h-4" /></button>
                           </>
                       ) : (
                           <div className="flex gap-2">
                               <button onClick={() => cancelEditing()} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-bold flex items-center gap-1">
                                   <X className="w-3 h-3" /> Cancel
                               </button>
                               <button onClick={() => saveEditing(index)} className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm">
                                   <Check className="w-3 h-3" /> Save Changes
                               </button>
                           </div>
                       )}
                   </div>
               </div>
  
               {/* PREVIEW WRAPPER */}
               <PlatformPreview format={format} angle={post.angle}>
                   {isEditing ? (
                       <div className="space-y-4">
                           <div>
                               <label className="text-[10px] font-bold text-gray-400 uppercase">Hook / Headline</label>
                               <input 
                                   value={editBuffer.hook} 
                                   onChange={(e) => setEditBuffer({...editBuffer, hook: e.target.value})}
                                   className="w-full p-2 bg-gray-50 border border-gray-200 rounded font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" 
                               />
                           </div>
                           <div>
                               <label className="text-[10px] font-bold text-gray-400 uppercase">Body Content</label>
                               <textarea 
                                   value={editBuffer.body} 
                                   onChange={(e) => setEditBuffer({...editBuffer, body: e.target.value})}
                                   className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-gray-800 text-sm h-48 resize-y focus:ring-2 focus:ring-blue-500 outline-none font-sans leading-relaxed" 
                               />
                           </div>
                           <div>
                               <label className="text-[10px] font-bold text-gray-400 uppercase">Call To Action</label>
                               <input 
                                   value={editBuffer.cta} 
                                   onChange={(e) => setEditBuffer({...editBuffer, cta: e.target.value})}
                                   className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                               />
                           </div>
                       </div>
                   ) : (
                       <div className="space-y-4 cursor-text" onClick={() => startEditing(index)} title="Click to Edit">
                          {format !== ContentFormat.EMAIL_MARKETING && (
                              <div className="font-bold mb-2">
                                  <RichTextRenderer text={post.hook} />
                              </div>
                          )}
                          
                          <div className="opacity-90">
                              <RichTextRenderer text={post.body} />
                          </div>
                          
                          {post.cta && (
                              <div className="mt-4 pt-4 border-t border-dashed border-gray-300/50">
                                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1">Call to Action</p>
                                  <RichTextRenderer text={post.cta} />
                              </div>
                          )}
                       </div>
                   )}
               </PlatformPreview>
  
               {!isEditing && (
                   <div className="flex justify-end px-2">
                       <CopyToClipboard text={`${post.hook}\n\n${post.body}\n\n${post.cta}`} label="Copy Post Content" className="bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 border border-gray-200" />
                   </div>
               )}
            </div>
          );
        }) || <div className="p-4 text-gray-500 text-sm">No posts generated.</div>}
      </div>

      {/* 3. HASHTAGS & CTA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-3">
                <Hash className="w-5 h-5 text-orange-600" />
                <h3 className="text-base md:text-lg font-bold text-gray-900">Hashtag Bank</h3>
            </div>
            <div className="flex flex-wrap gap-2">
                {localContent.hashtags?.map((tag, i) => (
                    <CopyToClipboard key={i} text={tag} className="!p-0 !bg-transparent !shadow-none hover:!bg-transparent">
                         <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-orange-50 text-orange-700 hover:bg-orange-600 hover:text-white transition-all cursor-pointer border border-orange-100 shadow-sm active:scale-95">
                            {tag}
                        </span>
                    </CopyToClipboard>
                ))}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 text-right">
                <CopyToClipboard text={(localContent.hashtags || []).join(' ')} label="Copy All Hashtags" className="text-xs bg-gray-50 text-gray-600 border border-gray-200" />
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-3">
                <Send className="w-5 h-5 text-orange-600" />
                <h3 className="text-base md:text-lg font-bold text-gray-900">Alternative CTAs</h3>
            </div>
            <ul className="space-y-2">
                {localContent.ctas?.map((cta, i) => (
                    <li key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-colors group">
                        <span className="text-gray-800 text-xs font-medium"><RichTextRenderer text={cta} /></span>
                        <CopyToClipboard text={cta} className="opacity-0 group-hover:opacity-100 transition-opacity scale-90 h-8 w-8 !p-0 !bg-white border border-gray-200 text-gray-500 hover:!text-orange-600" label="" />
                    </li>
                ))}
            </ul>
        </div>
      </div>
    </div>
  );
};
