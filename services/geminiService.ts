
import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold, Modality } from "@google/genai";
import { supabase } from "./supabaseClient";
import { FormData, GeneratedContent, Tone, ContentFormat, ImageGenerationParams, GeneratedImage, VideoGenerationParams, ImageData, Language } from "../types";

// --- SCHEMAS ---
const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    productName: { type: Type.STRING },
    coreBenefits: { type: Type.STRING },
    targetAudience: { type: Type.STRING },
  },
  required: ["productName", "coreBenefits", "targetAudience"],
};

const autofillSchema = {
  type: Type.OBJECT,
  properties: {
    coreBenefits: { type: Type.STRING },
    targetAudience: { type: Type.STRING },
    tone: { type: Type.STRING },
    contentFormat: { type: Type.STRING },
  },
  required: ["coreBenefits", "targetAudience", "tone", "contentFormat"],
};

const contentSchema = {
  type: Type.OBJECT,
  properties: {
    hooks: { type: Type.ARRAY, items: { type: Type.STRING } },
    posts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          angle: { type: Type.STRING },
          hook: { type: Type.STRING },
          body: { type: Type.STRING },
          cta: { type: Type.STRING },
        },
        required: ["angle", "hook", "body", "cta"],
      }
    },
    hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
    ctas: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["hooks", "posts", "hashtags", "ctas"],
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// --- UTILS ---
const cleanJson = (text: string): string => {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  return match ? match[1].trim() : text.trim();
};

const cleanSql = (text: string): string => {
  // Remove markdown code blocks if present
  return text.replace(/```sql/g, '').replace(/```/g, '').trim();
};

const validateApiKey = () => {
    const key = process.env.API_KEY;
    if (!key || key.length < 10) throw new Error("API Key missing.");
};

// --- LANGUAGE CONTROLLER ---
const getLanguageInstruction = (lang: string): string => {
    switch (lang) {
        case Language.MALAY_BAKU:
            return "STRICTLY use standard, formal Bahasa Melayu (Bahasa Baku/Dewan Bahasa). Grammar must be perfect. No slang, no English mix. Professional, textbook tone.";
        case Language.MALAY_CASUAL:
            return "Use conversational, everyday Bahasa Melayu (Bahasa Pasar). Friendly and approachable. Use common particles like 'je', 'ke', 'tak', 'ni'. Minimize English mixing, keep it natural for locals.";
        case Language.MALAY_ROJAK:
            return "Heavily mix Bahasa Melayu and English (Manglish). This is for a Malaysian mass market. Use terms like 'best giler', 'power', 'bossku', 'guane', 'confirm', 'steady'. Make it sound like a local chatting at a mamak.";
        case Language.MALAY_GEN_Z:
            return "Use current Gen Z / TikTok viral slang. Terms like 'healing', 'betul-betul', 'fuh', 'padu', 'mantap', 'member', 'racun', 'slay', 'vibes'. High energy, short sentences, viral style.";
        case Language.MALAY_UTARA:
            return "STRICTLY use Northern Malay Dialect (Loghat Utara - Kedah/Penang). Use words like 'hang' (awak), 'cegah', 'kupang', 'awaaat', 'depa', 'pi', 'sat', 'ketaq'.";
        case Language.MALAY_KELATE:
            return "STRICTLY use East Coast Dialect (Loghat Kelate/Ganu). Use words like 'demo', 'kawe', 'bakpo', 'guane', 'dok', 'mung', 'hok ni', 'molep'.";
        case Language.ENGLISH_PRO:
            return "STRICTLY Standard International English. Professional, grammatically correct, sophisticated vocabulary. Suitable for corporate/luxury audience.";
        case Language.ENGLISH_CASUAL:
            return "Malaysian Colloquial English (Manglish). Use 'lah', 'meh', 'can', 'one', 'got', 'walao'. Simple, direct, and local-friendly.";
        case Language.INDONESIA:
            return "Bahasa Indonesia Gaul (Jakarta style). Use 'gue', 'elo', 'banget', 'sih', 'dong', 'yuk', 'bisa', 'gimana'. Very conversational and trendy for Indonesian market.";
        case Language.MANDARIN_MY:
            return "Mandarin Chinese suited for Malaysia. Can mix slightly with Malay/English terms common in Malaysia (e.g. 'Duit', 'Saman', 'Pasar') if necessary for context, but primarily Mandarin.";
        case Language.TAMIL_MY:
            return "Tamil Language suited for Malaysia. Casual tone.";
        default:
            return "Use the primary language of the product name and description, optimized for a Malaysian audience.";
    }
};

// --- PROMPT ENGINEERING ENGINE ---
const enhancePrompt = (type: 'image' | 'video' | 'text', baseInput: string, context?: any): string => {
    if (type === 'image') {
        return `
Professional commercial photography of ${baseInput}.
Style: High-end product showcase, commercial advertising aesthetic.
Details: 8k resolution, highly detailed, razor-sharp focus, cinematic studio lighting, depth of field, photorealistic texture.
Negative Prompt: Blurry, distorted, low quality, watermark, text, bad anatomy, ugly, pixelated.
        `.trim();
    }
    
    if (type === 'video') {
        return `
Cinematic 4k video shot: ${baseInput}.
Style: Photorealistic, highly detailed, movie-quality rendering.
Movement: Smooth camera motion, professional stabilization.
Lighting: Volumetric lighting, high dynamic range.
        `.trim();
    }

    if (type === 'text') {
        // Context: { productName, coreBenefits, targetAudience, tone, trends, isHuman, language }
        const { productName, coreBenefits, targetAudience, tone, trends, isHuman, language } = context;
        
        const languageRule = getLanguageInstruction(language);
        let personaInstruction = "";
        
        if (isHuman) {
            personaInstruction = `
CRITICAL PERSONA: You are a professional Malaysian Copywriter ("Sifu Marketing") who is a master of local dialects and slang.
LANGUAGE STYLE: Natural, conversational, and authentic.
TONE: ${tone} (Make it sound exactly like this persona).
            `;
        } else {
            personaInstruction = `
PERSONA: Expert Marketing Strategist.
LANGUAGE: Professional, persuasive, and high-conversion standard language.
TONE: ${tone}.
            `;
        }

        return `
${personaInstruction}

CRITICAL LANGUAGE INSTRUCTION:
${languageRule}
(Verify your output matches this language style strictly. Do not deviate.)

TASK: Generate high-impact social media content for:
Product: ${productName}
Benefits: ${coreBenefits}
Audience: ${targetAudience}
Viral Context (Trending Now): ${trends}

REQUIREMENTS:
1. 10 Viral Hooks: Short, punchy, "stopping power" headlines.
2. 5 Posts: Each with a specific angle (e.g., FOMO, Storytelling, Hard Sell).
3. Hashtags: High volume local hashtags.
4. CTAs: Clear instructions for users to buy/click.

Output MUST be strictly strictly in valid JSON format matching the schema.
        `.trim();
    }

    return baseInput;
};

// --- TRANSACTION ---
async function secureDeduct(licenseKey: string, cost: number, activity: string = 'generation'): Promise<number> {
    if (licenseKey === "DEV") return 9999;
    
    const { data, error } = await supabase.rpc('deduct_credits', { 
        p_license_key: licenseKey, 
        p_amount: cost,
        p_type: activity 
    });
    
    if (error) {
        console.error("Deduct Error:", error);
        throw new Error(error.message.includes("Insufficient") ? "Baki Kredit Tidak Mencukupi" : "Ralat Sistem Kredit (DB).");
    }

    if (typeof data === 'number') return data;
    const { data: user } = await supabase.from('licenses').select('credits').eq('license_key', licenseKey).single();
    return user?.credits ?? 0;
}

async function secureRefund(licenseKey: string, cost: number) {
    if (licenseKey !== "DEV") supabase.rpc('refund_credits', { p_license_key: licenseKey, p_amount: cost }).then();
}

// --- PUBLIC API ---

export const pingGemini = async (): Promise<boolean> => {
    try { 
        const key = process.env.API_KEY;
        if (!key) return false; 
        const ai = new GoogleGenAI({ apiKey: key });
        await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: 'ping' }); 
        return true; 
    } 
    catch { return false; }
};

export const fixSqlScript = async (currentSql: string, errorMsg: string): Promise<string> => {
    try {
        validateApiKey();
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        
        const prompt = `
        I am running a PostgreSQL script in Supabase and getting an error.
        
        ERROR MESSAGE:
        "${errorMsg}"

        CURRENT SQL:
        \`\`\`sql
        ${currentSql}
        \`\`\`

        TASK:
        1. Analyze the error and the SQL.
        2. Fix the SQL to resolve the error. 
        3. If the error is about "unterminated dollar-quoted string" or buffer truncation, MINIFY the SQL by removing comments and unnecessary whitespace to make it shorter.
        4. Return ONLY the fixed, valid SQL string. Do not include markdown formatting or explanations.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

        return cleanSql(response.text || currentSql);
    } catch (err: any) {
        throw new Error("AI Fix Failed: " + err.message);
    }
};

export const analyzeProductImage = async (image: { base64: string; mimeType: string }): Promise<Partial<FormData>> => {
  try {
    validateApiKey();
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ inlineData: { mimeType: image.mimeType, data: image.base64 } }, { text: "Analyze this image. Output JSON with: productName (guess), coreBenefits (bullet points), targetAudience." }] },
      config: { responseMimeType: "application/json", responseSchema: analysisSchema, safetySettings }
    });
    return JSON.parse(cleanJson(response.text || "{}"));
  } catch (err) { throw new Error("Gagal mengimbas gambar."); }
};

export const generateAutofill = async (input: string, key: string, cost: number) => {
    const newBalance = await secureDeduct(key, cost, 'autofill');
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze: "${input}". Output JSON coreBenefits, targetAudience, tone, contentFormat. Based on Malaysian market context.`,
            config: { responseMimeType: "application/json", responseSchema: autofillSchema }
        });
        return { data: JSON.parse(cleanJson(response.text || "{}")), newBalance };
    } catch (e) { await secureRefund(key, cost); throw e; }
};

export const generateAIImages = async (params: ImageGenerationParams, key: string, cost: number) => {
    const newBalance = await secureDeduct(key, cost, 'image_generation');
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        
        // Construct prompt with images
        const parts: any[] = [];
        
        // 1. Add Product Images (Reference)
        if (params.productImages && params.productImages.length > 0) {
            params.productImages.forEach(img => {
                parts.push({ inlineData: { mimeType: img.mimeType, data: img.base64 } });
            });
        }

        // 2. Add Model Image (Optional Reference)
        if (params.modelImage) {
            parts.push({ inlineData: { mimeType: params.modelImage.mimeType, data: params.modelImage.base64 } });
        }

        // 3. Add Enhanced Prompt
        const finalPrompt = enhancePrompt('image', params.prompt);
        parts.push({ text: finalPrompt });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: parts },
            config: { responseModalities: [Modality.IMAGE] }
        });
        
        const outputParts = response.candidates?.[0]?.content?.parts || [];
        const images = outputParts
            .filter(p => p.inlineData)
            .map(p => ({ url: `data:${p.inlineData.mimeType};base64,${p.inlineData.data}` }));

        if (images.length === 0) {
            await secureRefund(key, cost);
            throw new Error("Sistem AI menolak permintaan ini (Safety Filter/Copyright). Kredit telah dikembalikan.");
        }

        return { images, newBalance };
    } catch (e) { await secureRefund(key, cost); throw e; }
};

export const generateAIVideo = async (params: VideoGenerationParams, key: string, cost: number, onProgress: (m: string) => void) => {
  const newBalance = await secureDeduct(key, cost, 'video_generation');
  try {
    onProgress("Connecting to Neural Nodes...");
    const currentKey = process.env.API_KEY!;
    
    if (!currentKey) {
        throw new Error("System configuration error: API Key missing.");
    }

    const aiVideo = new GoogleGenAI({ apiKey: currentKey });
    
    const finalPrompt = enhancePrompt('video', params.prompt);
    
    // Prepare Video Request
    const request: any = {
      model: 'veo-3.1-fast-generate-preview',
      prompt: finalPrompt,
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio: params.aspectRatio }
    };

    // Attach Image if exists (Image-to-Video)
    if (params.image) {
        request.image = {
            imageBytes: params.image.base64,
            mimeType: params.image.mimeType
        };
    }

    onProgress("Submitting to Veo Engine...");
    let operation = await aiVideo.models.generateVideos(request);

    // Polling Loop
    let attempts = 0;
    while (!operation.done) {
      if (attempts > 30) throw new Error("Video generation timed out."); // 30 * 5s = 150s max
      await new Promise(r => setTimeout(r, 5000));
      attempts++;
      onProgress(`Neural Nodes Rendering... (${attempts * 5}s)`);
      operation = await aiVideo.operations.getVideosOperation({ operation: operation });
    }

    const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) throw new Error("Video generation completed but returned no output.");

    onProgress("Downloading Stream...");
    
    // HYBRID FETCH STRATEGY:
    // 1. Try to fetch as blob (Best for user experience, hides API key)
    // 2. If fetch fails (CORS), return the URI directly so the <video> tag can load it.
    try {
        const body = await fetch(`${uri}&key=${currentKey}`);
        if (!body.ok) throw new Error("Fetch failed");
        const blob = await body.blob();
        return { videoUrl: URL.createObjectURL(blob), newBalance, type: 'blob' };
    } catch (fetchError) {
        console.warn("Direct video fetch failed (likely CORS), falling back to remote URL.", fetchError);
        // Fallback: Return the raw signed URL. 
        // NOTE: This exposes the API key in the HTML source of the <video> tag, 
        // but it is the only way to make it work if CORS blocks the fetch.
        return { videoUrl: `${uri}&key=${currentKey}`, newBalance, type: 'remote' };
    }

  } catch (e) { 
      await secureRefund(key, cost); 
      console.error("Video Gen Error:", e);
      throw e; 
  }
};

export const generateMarketingContent = async (formData: FormData, trends: string, isHuman: boolean, key: string, cost: number) => {
  let newBalance;
  if (!isHuman) newBalance = await secureDeduct(key, cost, 'text_generation');
  
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    const config: any = { 
        responseMimeType: "application/json", 
        responseSchema: contentSchema 
    };

    if (formData.useThinking) {
        config.thinkingConfig = { thinkingBudget: 1024 };
    }

    // Use the enhanced prompt generator
    const finalPrompt = enhancePrompt('text', '', { ...formData, trends, isHuman });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: finalPrompt,
      config: config
    });
    return { content: JSON.parse(cleanJson(response.text || "{}")), newBalance };
  } catch (e) { if(!isHuman) await secureRefund(key, cost); throw e; }
};

export const getTrendInsights = async (topic: string) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `What are the trending viral marketing strategies for ${topic} in Malaysia right now? Be specific.`,
            config: { tools: [{ googleSearch: {} }] }
        });
        return response.text || "";
    } catch { return ""; }
};
