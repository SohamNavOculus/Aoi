import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Sparkles, ChevronUp, ChevronDown } from 'lucide-react';
import { STICKERS } from '../data/stickers';
import { StickerItem } from '../types/chat';

interface ComposerProps {
  onSendMessage: (text: string) => void;
  onSendSticker: (sticker: StickerItem) => void;
  isLoading: boolean;
  onOpenStarters: () => void;
}

const QUICK_JAPANESE_PUNCTUATION = ['「', '」', '〜', '・', '！', '？', '笑', 'w'];

export const Composer: React.FC<ComposerProps> = ({
  onSendMessage,
  onSendSticker,
  isLoading,
  onOpenStarters,
}) => {
  const [text, setText] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [showStickerDrawer, setShowStickerDrawer] = useState(false);
  const [showPunctuation, setShowPunctuation] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setShowStickerDrawer(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // CRITICAL: Prevent sending message while user is composing Japanese IME characters!
    if (isComposing || e.nativeEvent.isComposing || e.key === 'Process' || e.keyCode === 229) {
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInsertPunctuation = (symbol: string) => {
    setText((prev) => prev + symbol);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleSelectSticker = (sticker: StickerItem) => {
    onSendSticker(sticker);
    setShowStickerDrawer(false);
  };

  return (
    <footer className="sticky bottom-0 z-20 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200/80 dark:border-stone-800 transition-colors">
      {/* Sticker Drawer */}
      {showStickerDrawer && (
        <div className="max-w-xl mx-auto border-b border-stone-200 dark:border-stone-800 p-3 bg-stone-50/90 dark:bg-stone-900/90 animate-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
              <span>LINE Stickers</span>
              <span className="text-[10px] text-stone-400 font-normal">Tap to send</span>
            </span>
            <button
              onClick={() => setShowStickerDrawer(false)}
              className="text-xs text-stone-400 hover:text-stone-600"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto chat-scrollbar p-1">
            {STICKERS.map((sticker) => (
              <button
                key={sticker.id}
                onClick={() => handleSelectSticker(sticker)}
                className="flex flex-col items-center justify-center p-2 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700/80 hover:scale-105 active:scale-95 transition-all text-center shadow-2xs group"
              >
                <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">{sticker.emoji}</span>
                <span className="font-jp font-bold text-xs text-stone-800 dark:text-stone-100">
                  {sticker.text}
                </span>
                <span className="text-[9px] text-stone-400 truncate max-w-[80px]">
                  {sticker.reading}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Punctuation Bar (Optional helper for Japanese chat) */}
      {showPunctuation && (
        <div className="max-w-xl mx-auto px-4 py-1.5 flex items-center gap-1.5 overflow-x-auto border-b border-stone-100 dark:border-stone-800/80 text-xs">
          <span className="text-[10px] font-medium text-stone-400 mr-1 flex-shrink-0">Japanese symbols:</span>
          {QUICK_JAPANESE_PUNCTUATION.map((symbol) => (
            <button
              key={symbol}
              onClick={() => handleInsertPunctuation(symbol)}
              className="px-2.5 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 font-jp text-stone-700 dark:text-stone-200 transition-colors flex-shrink-0"
            >
              {symbol}
            </button>
          ))}
        </div>
      )}

      {/* Main Composer Row */}
      <div className="max-w-xl mx-auto px-3 py-2 flex items-end gap-2">
        {/* Sticker Button */}
        <button
          type="button"
          onClick={() => setShowStickerDrawer(!showStickerDrawer)}
          className={`p-2.5 rounded-full transition-colors flex-shrink-0 ${
            showStickerDrawer
              ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40'
              : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
          title="LINE Stickers"
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* Text Input Container */}
        <div className="flex-1 min-h-[40px] max-h-[120px] bg-stone-100 dark:bg-stone-800/90 rounded-2xl flex items-center px-3 py-1.5 border border-stone-200/60 dark:border-stone-700/60 focus-within:ring-2 focus-within:ring-emerald-500/30 focus-within:border-emerald-500 transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder="Message Aoi in Japanese or English..."
            className="w-full bg-transparent resize-none text-[14px] leading-5 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none max-h-[110px] chat-scrollbar font-jp"
          />

          {/* Quick symbols toggle */}
          <button
            type="button"
            onClick={() => setShowPunctuation(!showPunctuation)}
            className="ml-1 text-[11px] text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 font-jp px-1 py-0.5 rounded transition-colors"
            title="Japanese punctuation symbols"
          >
            「」
          </button>
        </div>

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim() || isLoading}
          className={`p-2.5 rounded-full flex-shrink-0 transition-all shadow-sm ${
            text.trim() && !isLoading
              ? 'bg-[#06c755] hover:bg-[#05b44c] text-white hover:scale-105 active:scale-95'
              : 'bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-600 cursor-not-allowed'
          }`}
          title="Send message (Enter)"
          aria-label="Send"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </div>
    </footer>
  );
};
