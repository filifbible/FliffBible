
export enum ProfileType {
  KIDS = 'KIDS',
  TEENS = 'TEENS',
  YOUTH = 'YOUTH',
  ADULTS = 'ADULTS'
}

export enum UserType {
  ADULT = 'adult',
  CHILD = 'child'
}

export interface AudioRecording {
  id: string;
  ref: string;
  audio: string; // Base64
  date: string;
}

export interface VideoItem {
  id: string;
  title: string;
  duration: string;
  youtubeId: string;
}

export interface ArtMissionTheme {
  title: string;
  instruction: string;
  icon: string;
  date: string;
}

export interface ProfileData {
  id: string;
  account_id: string;
  name: string;
  type: ProfileType;
  avatar?: string;
  bio?: string;
  points: number;
  coins: number;
  unlockedItems: string[];
  streak: number;
  lastChallengeDate: string | null;
  lastArtDate: string | null;
  lastVideoDate?: string | null;
  favorites: string[];
  recordings?: AudioRecording[];
  paintings?: string[];
  artMissionTheme?: ArtMissionTheme;
  is_admin?: boolean;
  is_blocked?: boolean;
  account?: {
    is_premium?: boolean;
    subscription_status?: string | null;
  };
}

export interface UserState {
  email: string | null;
  authUserId: string | null;
  isAuthenticated: boolean;
  isPremium: boolean;
  trialEndDate: string | null;
  subscriptionStatus: string | null;
  userType: UserType | null;
  theme: 'light' | 'dark';
  profiles: ProfileData[];
  currentProfileId: string | null;
}

// ── Bíblia ────────────────────────────────────────────────────────────────────

/** Testamento (tabela: testament) */
export interface Testament {
  id: number;
  name: string;
}

/** Livro bíblico (tabela: books). Unifica BibleBook + Book dos serviços. */
export interface BibleBook {
  id?: number;
  name: string;
  testament: 'Old' | 'New';
  chapters: number;
  /** Referência interna do banco */
  book_reference_id?: number;
  testament_reference_id?: number;
}

/** Versículo (tabela: verses). Unifica BibleVerse + Verse dos serviços. */
export interface BibleVerse {
  id?: number;
  book: string;
  book_id?: number;
  chapter: number;
  verse: number;
  text: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

// ── Galeria ───────────────────────────────────────────────────────────────────

/** Imagem salva pelo usuário (tabela: gallery_images) */
export interface GalleryImage {
  id: string;
  profile_id: string;
  path: string;
  created_at: string;
}

// ── Loja ─────────────────────────────────────────────────────────────────────

/** Item da loja com preço customizável (tabela: shop_items) */
export interface ShopItem {
  id: string;
  price: number;
}

/** @deprecated Use ShopItem */
export type ShopItemOverride = ShopItem;
/** @deprecated Use ShopItem */
export type ShopItemPrice = ShopItem;

// ── Cupons de Desconto ────────────────────────────────────────────────────────

/** Cupom de desconto (tabela: coupons) */
export interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  max_uses: number;
  times_used: number;
  active: boolean;
  created_by?: string;
  created_at?: string;
}

/** Uso de cupom (tabela: coupon_uses) */
export interface CouponUse {
  id: string;
  coupon_id: string;
  user_id: string;
  used_at: string;
  account?: {
    full_name: string | null;
    email: string;
  };
}

// ── Assinaturas / Mercado Pago ────────────────────────────────────────────────

/** Plano de assinatura disponível */
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'free' | 'monthly' | 'yearly';
  description: string;
}

/** Dados do cartão para tokenização no Mercado Pago */
export interface CardData {
  cardNumber: string;
  cardholderName: string;
  expirationMonth: string;
  expirationYear: string;
  securityCode: string;
  identificationType: string;
  identificationNumber: string;
}

// ── Navegação ─────────────────────────────────────────────────────────────────

export type AppScreen = 'LANDING' | 'AUTH' | 'RESET_PASSWORD' | 'HOME' | 'BIBLE' | 'ACTIVITIES' | 'PROFILE' | 'PICKER' | 'CHALLENGES' | 'SHOP' | 'REWARDS' | 'GALLERY' | 'READING' | 'ART_MISSION' | 'CAPTURE' | 'GAMES' | 'RANKING' | 'ADMIN_PANEL' | 'SUBSCRIPTION';

// ── Avisos ────────────────────────────────────────────────────────────────────

export interface Notice {
  id: string;
  title: string;
  content: string;
  active: boolean;
  created_at?: string;
}

// ── Conta ─────────────────────────────────────────────────────────────────────

/** Conta de usuário (tabela: accounts) */
export interface AccountData {
  id: string;
  email: string;
  full_name: string | null;
  is_premium: boolean;
  is_admin?: boolean;
  trial_end_date: string | null;
  subscription_status: string | null;
  theme: 'light' | 'dark';
  created_at: string;
  updated_at: string;
}


