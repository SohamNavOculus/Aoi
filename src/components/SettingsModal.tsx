import React, { useState } from 'react';
import { X, Sliders, Sparkles, User, Globe, Moon, Sun, Check, Bell, Brain, ChevronDown, ChevronUp } from 'lucide-react';
import { CorrectionFrequency, JapaneseLevel, JapaneseUsage, MemorySummary, TranslationDisplay, UserProfile, UserSettings } from '../types/chat';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  profile: UserProfile;
  memorySummary?: MemorySummary;
  onSaveSettings: (settings: UserSettings) => void;
  onSaveProfile: (profile: UserProfile) => void;
  onTriggerCheckIn?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  profile,
  memorySummary,
  onSaveSettings,
  onSaveProfile,
  onTriggerCheckIn,
}) => {
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  const [localProfile, setLocalProfile] = useState<UserProfile>(profile);
  const [newInterest, setNewInterest] = useState('');
  const [showMemory, setShowMemory] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(localSettings);
    onSaveProfile(localProfile);
    onClose();
  };

  const handleAddInterest = () => {
    const trimmed = newInterest.trim().toLowerCase();
    if (trimmed && !localProfile.interests.includes(trimmed)) {
      setLocalProfile({
        ...localProfile,
        interests: [...localProfile.interests, trimmed],
      });
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setLocalProfile({
      ...localProfile,
      interests: localProfile.interests.filter((i) => i !== interest),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
                Chat & Learning Settings
              </h3>
              <p className="text-[11px] text-stone-500">
                Personalize Aoi&apos;s language pacing and focus
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto chat-scrollbar flex flex-col gap-5 text-xs">
          {/* Section: Japanese Level */}
          <div>
            <label className="font-semibold text-stone-900 dark:text-stone-100 mb-1.5 flex items-center justify-between">
              <span>Japanese Comfort Level</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">
                (Adaptive adjusts dynamically)
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'adaptive', label: 'Adaptive (Recommended)', desc: 'Grows with your comprehension' },
                { id: 'beginner', label: 'Beginner (N5)', desc: 'Mostly greetings & simple words' },
                { id: 'intermediate', label: 'Intermediate (N3-N4)', desc: 'Casual grammar & daily life' },
                { id: 'advanced', label: 'Advanced (N1-N2)', desc: 'Complex topics & natural slang' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() =>
                    setLocalSettings({ ...localSettings, japaneseLevel: opt.id as JapaneseLevel })
                  }
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    localSettings.japaneseLevel === opt.id
                      ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-stone-900 dark:text-stone-100 ring-1 ring-emerald-500'
                      : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-300 hover:border-stone-300'
                  }`}
                >
                  <div className="font-medium text-xs flex items-center justify-between">
                    <span>{opt.label}</span>
                    {localSettings.japaneseLevel === opt.id && (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                  </div>
                  <div className="text-[10px] text-stone-400 dark:text-stone-400 mt-0.5">
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section: Language Usage */}
          <div>
            <label className="font-semibold text-stone-900 dark:text-stone-100 mb-1.5 block">
              Japanese Ratio in Chat
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'mostly_english', label: 'Mostly English', ratio: '80% EN / 20% JA' },
                { id: 'balanced', label: 'Balanced Banter', ratio: '50% EN / 50% JA' },
                { id: 'mostly_japanese', label: 'Mostly Japanese', ratio: '20% EN / 80% JA' },
                { id: 'japanese_only', label: 'Japanese Only', ratio: '100% JA immersion' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() =>
                    setLocalSettings({ ...localSettings, japaneseUsage: opt.id as JapaneseUsage })
                  }
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    localSettings.japaneseUsage === opt.id
                      ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-stone-900 dark:text-stone-100 ring-1 ring-emerald-500'
                      : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-300 hover:border-stone-300'
                  }`}
                >
                  <div className="font-medium text-xs flex items-center justify-between">
                    <span>{opt.label}</span>
                    {localSettings.japaneseUsage === opt.id && (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                  </div>
                  <div className="text-[10px] text-stone-400 mt-0.5 font-mono">{opt.ratio}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Section: Reading Guide & Furigana */}
          <div>
            <label className="font-semibold text-stone-900 dark:text-stone-100 mb-1.5 flex items-center justify-between">
              <span>Reading Guide (Pronunciation over Script)</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">
                Makes Japanese 100% legible
              </span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'furigana', label: 'ふ Furigana', desc: 'Hiragana over Kanji' },
                { id: 'romaji', label: 'Ro Romaji', desc: 'English phonetics' },
                { id: 'none', label: '文 Clean', desc: 'No annotations' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() =>
                    setLocalSettings({ ...localSettings, readingMode: opt.id as any })
                  }
                  className={`p-2 rounded-xl border text-left transition-all ${
                    localSettings.readingMode === opt.id
                      ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-stone-900 dark:text-stone-100 ring-1 ring-emerald-500'
                      : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-300 hover:border-stone-300'
                  }`}
                >
                  <div className="font-semibold text-xs flex items-center justify-between">
                    <span>{opt.label}</span>
                    {localSettings.readingMode === opt.id && (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                  </div>
                  <div className="text-[10px] text-stone-400 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Section: Beginner Script Pacing */}
          <div>
            <label className="font-semibold text-stone-900 dark:text-stone-100 mb-1.5 flex items-center justify-between">
              <span>Script & Word Introduction Pacing</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'gentle', label: 'Gentle Pacing', desc: 'Code words + sounds first, kana step-by-step' },
                { id: 'standard', label: 'Standard', desc: 'Natural balanced Japanese script' },
                { id: 'immersion', label: 'Immersion', desc: 'Pure Japanese characters' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() =>
                    setLocalSettings({ ...localSettings, beginnerScriptPacing: opt.id as any })
                  }
                  className={`p-2 rounded-xl border text-left transition-all ${
                    localSettings.beginnerScriptPacing === opt.id
                      ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-stone-900 dark:text-stone-100 ring-1 ring-emerald-500'
                      : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-300 hover:border-stone-300'
                  }`}
                >
                  <div className="font-semibold text-xs flex items-center justify-between">
                    <span>{opt.label}</span>
                    {localSettings.beginnerScriptPacing === opt.id && (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                  </div>
                  <div className="text-[9.5px] text-stone-400 mt-0.5 leading-tight">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Section: Translations & Corrections */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-stone-900 dark:text-stone-100 mb-1 block">
                Translation Display
              </label>
              <select
                value={localSettings.translationDisplay}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    translationDisplay: e.target.value as TranslationDisplay,
                  })
                }
                className="w-full p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="on_request">On Request (Tap Translate)</option>
                <option value="always">Always Visible</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-stone-900 dark:text-stone-100 mb-1 block">
                Correction Behavior
              </label>
              <select
                value={localSettings.correctionFrequency}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    correctionFrequency: e.target.value as CorrectionFrequency,
                  })
                }
                className="w-full p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="occasional">Occasional (Natural tips)</option>
                <option value="frequent">Frequent (Active feedback)</option>
                <option value="minimal">Minimal (Conversational only)</option>
              </select>
            </div>
          </div>

          {/* Section: User Profile & Topics */}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
            <h4 className="font-semibold text-stone-900 dark:text-stone-100 mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-500" />
              <span>Your Profile & Banter Topics</span>
            </h4>

            <div className="flex flex-col gap-2">
              <div>
                <label className="text-[11px] text-stone-500 mb-1 block">Your Name / Nickname</label>
                <input
                  type="text"
                  value={localProfile.nickname}
                  onChange={(e) => setLocalProfile({ ...localProfile, nickname: e.target.value })}
                  placeholder="e.g. Alex, Sam"
                  className="w-full p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-stone-500 mb-1 block">
                  Topics Aoi can casually ask you about:
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {localProfile.interests.map((interest) => (
                    <span
                      key={interest}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px]"
                    >
                      <span>{interest}</span>
                      <button
                        onClick={() => handleRemoveInterest(interest)}
                        className="hover:text-rose-500 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
                    placeholder="Add topic (e.g. photography, cooking, J-pop)"
                    className="flex-1 p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    onClick={handleAddInterest}
                    className="px-3 py-2 bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 rounded-xl font-medium text-xs"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-stone-500 mb-1 block">Your Japanese Goal (Optional)</label>
                <input
                  type="text"
                  value={localProfile.statedJapaneseGoal || ''}
                  onChange={(e) => setLocalProfile({ ...localProfile, statedJapaneseGoal: e.target.value })}
                  placeholder="e.g. Traveling to Tokyo, reading manga, JLPT N4"
                  className="w-full p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section: Proactive Check-ins & Reminders */}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-500" />
                <span>Occasional Check-ins & Push</span>
              </label>
              <input
                type="checkbox"
                checked={localSettings.proactiveMessages}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, proactiveMessages: e.target.checked })
                }
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
            </div>
            <p className="text-[10px] text-stone-400 mb-2 leading-relaxed">
              When enabled, Aoi can occasionally initiate a casual chat (like a quick thought from her cafe shift or a photo). No spam, no guilt-trips.
            </p>

            {localSettings.proactiveMessages && (
              <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex flex-col gap-2 animate-in fade-in">
                <div className="flex items-center justify-between text-[11px] text-stone-600 dark:text-stone-300">
                  <span>Quiet hours (Do not disturb):</span>
                  <div className="flex items-center gap-1 font-mono text-[10px]">
                    <input
                      type="time"
                      value={localSettings.quietHoursStart || '22:00'}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, quietHoursStart: e.target.value })
                      }
                      className="p-1 rounded bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700"
                    />
                    <span>-</span>
                    <input
                      type="time"
                      value={localSettings.quietHoursEnd || '08:00'}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, quietHoursEnd: e.target.value })
                      }
                      className="p-1 rounded bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700"
                    />
                  </div>
                </div>

                {onTriggerCheckIn && (
                  <button
                    type="button"
                    onClick={() => {
                      onTriggerCheckIn();
                      onClose();
                    }}
                    className="w-full py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
                  >
                    Send test spontaneous check-in now ✨
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Section: Aoi's Memory Notebook */}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
            <button
              type="button"
              onClick={() => setShowMemory(!showMemory)}
              className="w-full flex items-center justify-between font-semibold text-stone-900 dark:text-stone-100 hover:opacity-80"
            >
              <div className="flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-indigo-500" />
                <span>Aoi&apos;s Memory Notebook</span>
              </div>
              {showMemory ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
            </button>

            {showMemory && (
              <div className="mt-2 p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs flex flex-col gap-2 animate-in fade-in">
                {memorySummary && memorySummary.summary ? (
                  <>
                    <p className="text-stone-700 dark:text-stone-200 leading-relaxed text-[11.5px] italic">
                      &ldquo;{memorySummary.summary}&rdquo;
                    </p>
                    {memorySummary.keyFacts && memorySummary.keyFacts.length > 0 && (
                      <div>
                        <span className="font-semibold text-stone-500 text-[10px] uppercase block mb-1">
                          Key facts remembered:
                        </span>
                        <ul className="list-disc list-inside text-stone-600 dark:text-stone-300 text-[11px] space-y-0.5">
                          {memorySummary.keyFacts.map((fact, idx) => (
                            <li key={idx}>{fact}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-stone-400 dark:text-stone-500 text-[11px]">
                    No long-term memories condensed yet. As your chat grows beyond 12 messages, Aoi will automatically note important topics and facts here!
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 flex items-center justify-between">
          <button
            onClick={() => {
              const newTheme = localSettings.theme === 'dark' ? 'light' : 'dark';
              setLocalSettings({ ...localSettings, theme: newTheme });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            {localSettings.theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-500" />
                <span>Dark Mode</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-stone-500 hover:text-stone-700 text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-sm transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
