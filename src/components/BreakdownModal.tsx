import React from 'react';
import { X, Volume2, Sparkles, BookOpen } from 'lucide-react';
import { JapaneseBreakdownItem } from '../types/chat';
import { speakJapanese } from '../utils/speech';

interface BreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: JapaneseBreakdownItem[];
  fullText?: string;
}

export const BreakdownModal: React.FC<BreakdownModalProps> = ({
  isOpen,
  onClose,
  items,
  fullText,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
                Japanese Breakdown
              </h3>
              <p className="text-[11px] text-stone-500">
                {items.length} key {items.length === 1 ? 'phrase' : 'phrases'} from Aoi&apos;s message
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

        {/* Phrases List */}
        <div className="p-5 overflow-y-auto chat-scrollbar flex flex-col gap-3">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80 flex flex-col gap-1.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-jp font-bold text-lg text-stone-900 dark:text-stone-100">
                      {item.japanese}
                    </span>
                    <span className="font-jp text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      【{item.reading}】
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-400 font-mono">
                    {item.romaji}
                  </span>
                </div>

                <button
                  onClick={() => speakJapanese(item.japanese)}
                  className="p-2 rounded-xl text-stone-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                  title="Pronounce phrase"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-sm font-medium text-stone-700 dark:text-stone-200">
                {item.meaning}
              </div>

              {item.nuance && (
                <div className="mt-1 flex items-start gap-1.5 text-xs text-stone-500 dark:text-stone-400 bg-white/70 dark:bg-stone-900/60 p-2 rounded-xl border border-stone-100 dark:border-stone-800">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span className="leading-snug">{item.nuance}</span>
                </div>
              )}
            </div>
          ))}

          {fullText && (
            <div className="mt-2 p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-xs">
              <span className="font-semibold text-emerald-800 dark:text-emerald-300 block mb-1">
                Full Message Context:
              </span>
              <p className="font-jp text-stone-700 dark:text-stone-300 italic">
                &ldquo;{fullText}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-medium text-xs hover:opacity-90 transition-opacity"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
