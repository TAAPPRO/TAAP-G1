
// Type definitions for the application

export interface ImageData {
  base64: string;
  mimeType: string;
  fileName: string;
}

export interface FormData {
  productName: string;
  coreBenefits: string;
  targetAudience: string;
  language: string;
  tone: string;
  contentFormat: string; // REPLACED 'style' with 'contentFormat'
  image: ImageData | null;
  useThinking: boolean;
}

export interface ImageGenerationParams {
  productImages: ImageData[];
  modelImage: ImageData | null;
  prompt: string;
  aspectRatio: '1:1' | '16:9' | '9:16';
}

export interface VideoGenerationParams {
  prompt: string;
  aspectRatio: '16:9' | '9:16';
  image?: ImageData | null;
}

export interface GeneratedImage {
  url: string;
  seed?: number;
}

export interface GeneratedVideo {
  url: string;
  prompt: string;
}

export interface Post {
  angle: string; // NEW: Stores the strategy name (e.g., FOMO, Plot Twist)
  hook: string;
  body: string;
  cta: string;
}

export interface GeneratedContent {
  hooks: string[];
  posts: Post[];
  hashtags: string[];
  ctas: string[];
}

// --- Admin / Database Types (Enterprise Grade) ---
export interface License {
  id: number;
  created_at: string;
  license_key: string;
  user_name: string | null;
  user_email: string | null;
  phone_number: string | null;
  plan_type: string;
  credits: number;
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  subscription_end_date: string | null;
  last_used_at: string | null;
  affiliate_code: string | null;
  referred_by_code: string | null;
  affiliate_balance: number; // New: Wallet for commissions
  total_earnings: number; // New: Lifetime earnings
  affiliate_tier: 'Agent' | 'Super Agent' | 'Partner'; // New: Tiering
  successful_referrals: number;
  custom_commission_rate: number | null; // New: Override default rate
  bank_name: string | null;
  bank_details: string | null;
  bank_holder: string | null;
  snapshot_discount: number; // New: Locked discount rate at registration
  snapshot_commission_rate: number; // New: Locked commission rate for the upline
  admin_notes: string | null; // New: Internal CRM notes
}

export interface Package {
  id: number;
  name: string;
  price: number;
  credits: number;
  features: string[];
  is_active: boolean;
  is_popular: boolean;
  ref_code: string;
  period: string;
  old_price?: number;
  credit_label: string;
  color_theme?: string;
}

export interface PayoutRequest {
    id: number;
    created_at: string;
    license_key: string;
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
    bank_details: string;
    admin_note?: string;
    processed_at?: string;
}

export interface AffiliateLog {
    id: number;
    created_at: string;
    license_key: string;
    amount: number;
    type: 'commission' | 'withdrawal' | 'refund' | 'bonus' | 'deduction';
    description: string;
    from_user?: string;
}

export interface SystemSetting {
  key: string;
  value: string;
  description?: string;
}

export interface Broadcast {
    id: number;
    created_at: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success';
    is_active: boolean;
    expires_at: string;
}

export interface AuditTrail {
    id: number;
    created_at: string;
    admin_actor: string;
    action: string;
    target_license_key?: string;
    details: any;
}

export interface NewUserInput {
    user_name: string;
    user_email: string;
    phone_number: string;
    plan_type: string;
    initial_credits: number;
    status: string;
    affiliate_code: string;
    referred_by_code: string;
}

export interface DashboardMetrics {
    total_licenses: number;
    active_licenses: number;
    total_affiliates: number;
    affiliate_conversion_rate: number;
    total_lifetime_affiliate_earnings: number;
    total_payout_requests_count: number; // Placeholder for future
    pending_payouts_count: number;
    pending_payouts_amount: number;
    total_credits_consumed: number;
    total_text_generations: number;
    total_image_generations: number;
    total_video_generations: number;
    user_growth_daily: any[];
    credit_usage_daily: any[];
    plan_distribution: any;
    top_5_affiliates: any[];
}

export enum Tone {
  KAKAK_VIBE = "Kakak Vibe (Friendly)",
  ABANG_VIBE = "Abang Vibe (Macam Brader)",
  PROFESSIONAL = "Profesional & Korporat",
  HARD_SELL = "Gempak & Hard Sell",
  SOFT_SELL = "Soft Sell & Manja (Pujuk)",
  STORYTELLING = "Emosi & Storytelling",
  URGENT = "Cemas & Urgent (FOMO)",
  EDUCATIONAL = "Informatif & Cikgu",
  FUNNY = "Kelakar & Santai",
  LUXURY = "Mewah & Eksklusif",
  REMPIT = "Rempit & Sempoi",
  ISLAMIC = "Islam & Sopan (Patuh Syariah)",
  MOTIVATIONAL = "Semangat & Inspirasi",
  PARENTING = "Mak-Mak & Prihatin",
  FOODIE = "Foodie & Terliur",
  TECH_GEEK = "Tech & Gajet (Geeky)"
}

export enum ContentFormat {
  INSTAGRAM_POST = "Instagram/FB Post",
  TIKTOK_SCRIPT = "Skrip Video Pendek (TikTok/Reels)",
  WHATSAPP_BROADCAST = "WhatsApp Broadcast (Personal)",
  SHOPEE_DESC = "Shopee/Lazada Description",
  FACEBOOK_AD = "Iklan Berbayar (FB Ads)",
  TWITTER_THREAD = "Thread X (Twitter)",
  TIKTOK_LIVE = "Skrip Live Selling",
  LINKEDIN_ARTICLE = "LinkedIn Article",
  FACEBOOK_STORY = "FB/IG Story",
  EMAIL_MARKETING = "Email Marketing",
  LISTICLE_ARTICLE = "Artikel Blog/Listicle"
}

export enum Language {
  MALAY_CASUAL = "Bahasa Melayu (Santai/Harian)",
  MALAY_ROJAK = "Bahasa Rojak (Manglish/Campur)",
  MALAY_GEN_Z = "Bahasa Gen Z (Slang/Viral)",
  MALAY_BAKU = "Bahasa Melayu (Baku/Formal)",
  MALAY_UTARA = "Loghat Utara (Kedah/Penang)",
  MALAY_KELATE = "Loghat Kelate/Ganu (Pantai Timur)",
  ENGLISH_PRO = "English (Professional)",
  ENGLISH_CASUAL = "English (Malaysian/Casual)",
  INDONESIA = "Bahasa Indonesia (Gaul/Jakarta)",
  MANDARIN_MY = "Mandarin (Malaysian Style)",
  TAMIL_MY = "Tamil (Malaysian Casual)"
}
