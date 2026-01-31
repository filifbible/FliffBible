
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
  gallery?: string[];
  recordings?: AudioRecording[];
  paintings?: string[];
  artMissionTheme?: ArtMissionTheme;
  is_admin?: boolean;
  is_blocked?: boolean;
}

export interface UserState {
  email: string | null;
  isAuthenticated: boolean;
  isPremium: boolean;
  userType: UserType | null;
  theme: 'light' | 'dark';
  profiles: ProfileData[];
  currentProfileId: string | null;
}

export interface BibleBook {
  name: string;
  testament: 'Old' | 'New';
  chapters: number;
}

export interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export type AppScreen = 'LANDING' | 'AUTH' | 'RESET_PASSWORD' | 'HOME' | 'BIBLE' | 'ACTIVITIES' | 'PROFILE' | 'PICKER' | 'CHALLENGES' | 'SHOP' | 'REWARDS' | 'GALLERY' | 'READING' | 'ART_MISSION' | 'CAPTURE' | 'GAMES' | 'RANKING' | 'ADMIN_PANEL';

export interface ShopItemOverride {
  id: string;
  price: number;
}

