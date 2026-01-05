
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
  relaxationMethod: string; 
  imageUrl?: string; 
  category?: '生活態度' | '情緒共處' | '放鬆練習';
  styleHint?: 'warm' | 'fresh' | 'calm' | 'energetic' | 'dreamy'; 
}

export interface FullSoulContent {
  analysis: GeminiAnalysisResult;
  card: EnergyCardData;
}

export interface CommunityLog {
  id: string;
  moodLevel: number;
  text: string;
  timestamp: string;
  localTimestamp: number; // 跨裝置同步的關鍵排序鍵
  theme: string;
  tags: string[];
  authorSignature?: string; 
  authorColor?: string;     
  deviceType?: string;      
  stationId?: string;       
  fullCard?: EnergyCardData;
  replyMessage?: string;
}

export interface MascotOptions {
  role: 'youth' | 'worker';
  baseColor: string;
}
