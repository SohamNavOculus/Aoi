import { ChatMessage, MemorySummary, UserProfile, UserSettings } from '../types/chat';

const CHAT_STORAGE_KEY = 'aoi_chat_history_v1';
const SETTINGS_STORAGE_KEY = 'aoi_user_settings_v1';
const PROFILE_STORAGE_KEY = 'aoi_user_profile_v1';

// Initial opening message from Aoi - beginner friendly & introducing first friend code word
export const INITIAL_AOI_MESSAGE: ChatMessage = {
  id: 'msg_welcome_aoi',
  sender: 'aoi',
  text: "yaho-! やっほー ☕ finally got a break between design classes!\nwhat're you up to today? (by the way, 'yaho-' is our casual Japanese code word for 'hey!' between friends ✨)",
  rubyText: "yaho-! <ruby>やっほー<rt>yaho-</rt></ruby> ☕ finally got a break between design classes!\nwhat're you up to today? (by the way, 'yaho-' is our casual Japanese code word for 'hey!' between friends ✨)",
  romajiText: "yaho-! <ruby>やっほー<rt>yaho-</rt></ruby> ☕ finally got a break between design classes!\nwhat're you up to today? (by the way, 'yaho-' is our casual Japanese code word for 'hey!' between friends ✨)",
  timestamp: Date.now() - 1000 * 60 * 5,
  status: 'sent',
  translation: "Hey! (yaho-!) ☕ finally got a break between design classes! what are you up to today? (by the way, 'yaho-' is our casual Japanese code word for 'hey!' between friends ✨)",
  isTranslated: false,
  breakdown: [
    {
      japanese: 'やっほー',
      reading: 'やっほー',
      romaji: 'yaho-',
      meaning: 'hey! / yo! / hi!',
      nuance: 'Casual, friendly greeting used by young Japanese people with close friends. Cheerful and warm!',
    },
  ],
  reactions: { '🍵': 1 },
};

export const DEFAULT_SETTINGS: UserSettings = {
  japaneseLevel: 'beginner',
  japaneseUsage: 'mostly_english',
  translationDisplay: 'on_request',
  correctionFrequency: 'occasional',
  readingMode: 'furigana',
  beginnerScriptPacing: 'gentle',
  highlightVocabulary: true,
  theme: 'light',
  soundEffects: true,
  autoSpeakJapanese: false,
  proactiveMessages: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
};

export const DEFAULT_PROFILE: UserProfile = {
  nickname: 'Friend',
  interests: ['coffee', 'music', 'travel', 'anime'],
  bio: 'Learning Japanese naturally through fun conversations.',
};

const MEMORY_STORAGE_KEY = 'aoi_memory_summary_v1';

export const DEFAULT_MEMORY: MemorySummary = {
  summary: '',
  keyFacts: [],
  learnedWords: [],
  updatedAt: Date.now(),
};

// Safe local storage helpers with fallback and base64 obfuscation for local privacy
function safeEncrypt(data: any): string {
  try {
    const jsonStr = JSON.stringify(data);
    return btoa(encodeURIComponent(jsonStr));
  } catch (e) {
    return JSON.stringify(data);
  }
}

function safeDecrypt(encoded: string, fallback: any): any {
  if (!encoded) return fallback;
  try {
    const jsonStr = decodeURIComponent(atob(encoded));
    return JSON.parse(jsonStr);
  } catch (e) {
    try {
      return JSON.parse(encoded);
    } catch {
      return fallback;
    }
  }
}

export function loadChatHistory(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) {
      return [INITIAL_AOI_MESSAGE];
    }
    const parsed = safeDecrypt(raw, [INITIAL_AOI_MESSAGE]);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return [INITIAL_AOI_MESSAGE];
  } catch (e) {
    console.error('Failed to load chat history from storage:', e);
    return [INITIAL_AOI_MESSAGE];
  }
}

export function saveChatHistory(messages: ChatMessage[]): void {
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, safeEncrypt(messages));
  } catch (e) {
    console.error('Failed to save chat history to storage:', e);
  }
}

export function clearChatHistoryStorage(): void {
  try {
    localStorage.removeItem(CHAT_STORAGE_KEY);
    localStorage.removeItem(MEMORY_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear chat history storage:', e);
  }
}

export function loadMemorySummary(): MemorySummary {
  try {
    const raw = localStorage.getItem(MEMORY_STORAGE_KEY);
    if (!raw) return DEFAULT_MEMORY;
    return { ...DEFAULT_MEMORY, ...safeDecrypt(raw, DEFAULT_MEMORY) };
  } catch (e) {
    return DEFAULT_MEMORY;
  }
}

export function saveMemorySummary(memory: MemorySummary): void {
  try {
    localStorage.setItem(MEMORY_STORAGE_KEY, safeEncrypt(memory));
  } catch (e) {
    console.error('Failed to save memory summary:', e);
  }
}

export function clearMemorySummaryStorage(): void {
  try {
    localStorage.removeItem(MEMORY_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear memory summary:', e);
  }
}

export function loadUserSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...safeDecrypt(raw, DEFAULT_SETTINGS) };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function saveUserSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, safeEncrypt(settings));
  } catch (e) {
    console.error('Failed to save user settings:', e);
  }
}

export function loadUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...safeDecrypt(raw, DEFAULT_PROFILE) };
  } catch (e) {
    return DEFAULT_PROFILE;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, safeEncrypt(profile));
  } catch (e) {
    console.error('Failed to save user profile:', e);
  }
}
