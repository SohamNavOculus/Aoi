export interface JapaneseBreakdownItem {
  japanese: string;
  reading: string;
  romaji: string;
  meaning: string;
  nuance?: string;
}

export interface JapaneseCorrection {
  detectedMistake: string;
  naturalAlternative: string;
  explanation: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'aoi';
  text: string;
  timestamp: number;
  status?: 'sending' | 'sent' | 'error';
  translation?: string;
  isTranslated?: boolean;
  breakdown?: JapaneseBreakdownItem[];
  correction?: JapaneseCorrection | null;
  rubyText?: string;
  romajiText?: string;
  reactions?: Record<string, number>;
  userReaction?: string;
  isSticker?: boolean;
  stickerId?: string;
  stickerLabel?: string;
  stickerEmoji?: string;
}

export type JapaneseLevel = 'adaptive' | 'beginner' | 'intermediate' | 'advanced';
export type JapaneseUsage = 'mostly_english' | 'balanced' | 'mostly_japanese' | 'japanese_only';
export type TranslationDisplay = 'on_request' | 'always';
export type CorrectionFrequency = 'minimal' | 'occasional' | 'frequent';
export type ReadingMode = 'furigana' | 'romaji' | 'none';
export type ScriptPacing = 'gentle' | 'standard' | 'immersion';

export interface MemorySummary {
  summary: string;
  keyFacts: string[];
  learnedWords: string[];
  lastSummarizedMessageId?: string;
  messageCountAtLastSummary?: number;
  updatedAt: number;
}

export interface UserSettings {
  japaneseLevel: JapaneseLevel;
  japaneseUsage: JapaneseUsage;
  translationDisplay: TranslationDisplay;
  correctionFrequency: CorrectionFrequency;
  readingMode: ReadingMode;
  beginnerScriptPacing: ScriptPacing;
  highlightVocabulary: boolean;
  proactiveMessages: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  theme: 'light' | 'dark' | 'system';
  soundEffects: boolean;
  autoSpeakJapanese: boolean;
}

export interface UserProfile {
  nickname: string;
  interests: string[];
  bio?: string;
  statedJapaneseGoal?: string;
}

export interface StickerItem {
  id: string;
  text: string;
  reading: string;
  english: string;
  emoji: string;
  category: 'reaction' | 'greeting' | 'slang';
  bgGradient: string;
}
