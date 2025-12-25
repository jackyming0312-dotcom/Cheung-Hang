
export enum AppStep {
  WELCOME = 'WELCOME',
  MOOD_WATER = 'MOOD_WATER',
  VIBE_MAP = 'VIBE_MAP',
  WHISPER_HOLE = 'WHISPER_HOLE',
  REWARD = 'REWARD',
  COMMUNITY = 'COMMUNITY'
}

export interface Coordinates {
  x: number;
  y: number;
}

export interface MapZone {
  id: string;
  name: string;
  x: number; // Percentage
  y: number; // Percentage
  width: number;
  height: number;
  color: string;
}

export interface FeedbackData {
  moodLevel: number; // 0-100
  favoriteZone: string | null;
  whisperText: string;
  tags: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface GeminiAnalysisResult {
  sentiment: 'positive' | 'neutral' | 'negative';
  tags: string[];
  replyMessage: string;
}

export interface EnergyCardData {
  quote: string;
  theme: string;
  luckyItem: string;
  imageUrl?: string; // New field for the generated image
}

export interface CommunityLog {
  id: string;
  moodLevel: number;
  text: string;
  timestamp: string;
  theme: string;
  tags: string[];
}

// New Interface for detailed mascot customization
export interface MascotOptions {
  baseColor: string;
  hat: 'none' | 'party' | 'beret' | 'beanie' | 'crown';
  glasses: 'none' | 'round' | 'sunglasses';
  accessory: 'none' | 'scarf' | 'bowtie' | 'flower';
  makeup: 'none' | 'blush' | 'star';
}
