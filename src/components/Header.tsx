import React, { useState, useRef, useEffect } from 'react';
import { Settings, Sparkles, Volume2, VolumeX, Trash2, Info, MoreVertical, Coffee, BookOpen } from 'lucide-react';
import aoiAvatar from '../assets/aoi_avatar.jpg';
import { UserSettings } from '../types/chat';

interface HeaderProps {
  isTyping: boolean;
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onOpenClearChat: () => void;
  onOpenStarters: () => void;
  learnedWordsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  isTyping,
  settings,
  onUpdateSettings,
  onOpenSettings,
  onOpenProfile,
  onOpenClearChat,
  onOpenStarters,
  learnedWordsCount,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 transition-colors">
      <div className="max-w-xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Friend Profile Button */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-3 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-full pr-3 py-0.5 hover:bg-stone-100/70 dark:hover:bg-stone-800/60 transition-all"
          title="View Aoi's Profile"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-emerald-500/80 dark:ring-emerald-400 p-0.5 bg-gradient-to-tr from-emerald-500 to-teal-300 shadow-sm transition-transform group-hover:scale-105">
              <img
                src={aoiAvatar}
                alt="Aoi"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            {/* Online Status Dot */}
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-stone-900 transition-colors ${
                isTyping ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'
              }`}
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-stone-900 dark:text-stone-100 text-sm tracking-tight flex items-center gap-1">
                Aoi <span className="font-jp text-xs text-stone-600 dark:text-stone-400 font-normal">葵</span>
              </span>
              <span className="inline-block px-1.5 py-0.2 text-[10px] font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-full">
                Tokyo
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-none mt-0.5">
              {isTyping ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium animate-pulse">
                  typing Japanese...
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  usually replies quickly
                </span>
              )}
            </p>
          </div>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Quick Reading Guide Toggle (Furigana / Romaji / None) */}
          <button
            onClick={() => {
              const nextMode =
                settings.readingMode === 'furigana'
                  ? 'romaji'
                  : settings.readingMode === 'romaji'
                  ? 'none'
                  : 'furigana';
              onUpdateSettings({ readingMode: nextMode });
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold transition-all ${
              settings.readingMode === 'furigana'
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30'
                : settings.readingMode === 'romaji'
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/30 font-mono'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-400 hover:text-stone-600'
            }`}
            title={`Reading Guide: ${
              settings.readingMode === 'furigana'
                ? 'Furigana (Hiragana over Kanji)'
                : settings.readingMode === 'romaji'
                ? 'Romaji (English letters)'
                : 'Off (Clean script)'
            } - Tap to switch`}
          >
            <span className="text-[11px]">
              {settings.readingMode === 'furigana' ? 'ふ Furigana' : settings.readingMode === 'romaji' ? 'Ro Romaji' : '文 Clean'}
            </span>
          </button>

          {/* Quick Voice Audio Toggle */}
          <button
            onClick={() => onUpdateSettings({ soundEffects: !settings.soundEffects })}
            className={`p-2 rounded-full transition-colors ${
              settings.soundEffects
                ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                : 'text-stone-400 dark:text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
            title={settings.soundEffects ? 'Sound effects on' : 'Sound effects off'}
            aria-label="Toggle Sound"
          >
            {settings.soundEffects ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Starters chip */}
          <button
            onClick={onOpenStarters}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-full transition-colors"
            title="Conversation topics"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Topics</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
            title="Japanese Learning Settings"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* More Menu Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
              aria-label="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white dark:bg-stone-800 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-700 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenProfile();
                  }}
                  className="w-full px-3.5 py-2 flex items-center gap-2.5 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700/60 text-left transition-colors"
                >
                  <Coffee className="w-4 h-4 text-emerald-500" />
                  <span>About Aoi (Profile)</span>
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenStarters();
                  }}
                  className="w-full px-3.5 py-2 flex items-center gap-2.5 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700/60 text-left transition-colors sm:hidden"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Conversation Topics</span>
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenSettings();
                  }}
                  className="w-full px-3.5 py-2 flex items-center gap-2.5 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700/60 text-left transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <span>Japanese Settings</span>
                </button>

                <div className="h-px bg-stone-100 dark:bg-stone-700 my-1" />

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenClearChat();
                  }}
                  className="w-full px-3.5 py-2 flex items-center gap-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear Chat History</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
