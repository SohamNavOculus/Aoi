import React, { useState } from 'react';
import {
  Languages,
  Volume2,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Key,
  Eye,
} from 'lucide-react';
import { ChatMessage, JapaneseBreakdownItem, ReadingMode, UserSettings } from '../types/chat';
import aoiAvatar from '../assets/aoi_avatar.jpg';
import { isJapaneseText, speakJapanese } from '../utils/speech';
import { autoAnnotateWithBreakdown, parseRubyString } from '../utils/ruby';

interface MessageItemProps {
  message: ChatMessage;
  settings: UserSettings;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  onToggleTranslate: (id: string) => void;
  onOpenBreakdown: (items: JapaneseBreakdownItem[], fullText: string) => void;
  onRetry: (message: ChatMessage) => void;
  onAddReaction: (id: string, emoji: string) => void;
  onChangeReadingMode?: (mode: ReadingMode) => void;
}

const QUICK_REACTIONS = ['❤️', '😂', '😮', '🥺', '🍵', '👏'];

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  settings,
  isFirstInGroup,
  isLastInGroup,
  onToggleTranslate,
  onOpenBreakdown,
  onRetry,
  onAddReaction,
  onChangeReadingMode,
}) => {
  const isAoi = message.sender === 'aoi';
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showCorrectionDetails, setShowCorrectionDetails] = useState(false);

  const containsJapanese = isJapaneseText(message.text);
  const showTranslation =
    isAoi &&
    message.translation &&
    (settings.translationDisplay === 'always' || message.isTranslated);

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleAudioPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    speakJapanese(
      message.text,
      () => setIsPlayingAudio(false),
      () => setIsPlayingAudio(false)
    );
  };

  const handleReactionClick = (emoji: string) => {
    onAddReaction(message.id, emoji);
    setShowReactionPicker(false);
  };

  // Render message text with Furigana / Romaji / Clean annotations
  const renderMessageContent = () => {
    if (!isAoi || settings.readingMode === 'none') {
      return message.text;
    }

    if (settings.readingMode === 'furigana') {
      if (message.rubyText) {
        return parseRubyString(message.rubyText, false);
      }
      return autoAnnotateWithBreakdown(message.text, message.breakdown, 'furigana');
    }

    if (settings.readingMode === 'romaji') {
      if (message.romajiText) {
        return parseRubyString(message.romajiText, true);
      }
      return autoAnnotateWithBreakdown(message.text, message.breakdown, 'romaji');
    }

    return message.text;
  };

  // Sticker Message Display
  if (message.isSticker) {
    return (
      <div
        className={`flex w-full mb-3 px-3 ${
          isAoi ? 'justify-start' : 'justify-end'
        }`}
      >
        {isAoi && isFirstInGroup && (
          <img
            src={aoiAvatar}
            alt="Aoi"
            className="w-7 h-7 rounded-full object-cover mr-2 self-end mb-1 ring-1 ring-stone-200 dark:ring-stone-700"
          />
        )}
        {isAoi && !isFirstInGroup && <div className="w-9" />}

        <div className="flex flex-col items-end max-w-[260px] relative group">
          <div
            className="p-4 rounded-3xl shadow-sm border border-stone-200/60 dark:border-stone-800 bg-gradient-to-br from-white to-stone-50 dark:from-stone-800 dark:to-stone-900 flex flex-col items-center text-center cursor-pointer transition-transform hover:scale-102"
            onClick={() => setShowReactionPicker(!showReactionPicker)}
          >
            <span className="text-4xl mb-1.5 filter drop-shadow-sm">{message.stickerEmoji || '✨'}</span>
            <span className="font-jp font-bold text-lg text-stone-900 dark:text-stone-100">
              {message.stickerLabel || message.text}
            </span>
            <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
              LINE Sticker
            </span>
          </div>

          <span className="text-[10px] text-stone-400 mt-1 px-1">
            {formatTime(message.timestamp)}
          </span>

          {/* Reaction Picker on Sticker */}
          {showReactionPicker && (
            <div className="absolute -top-9 z-20 flex items-center gap-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-full px-2 py-1 shadow-lg animate-in fade-in zoom-in-95">
              {QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReactionClick(emoji)}
                  className="hover:scale-125 transition-transform text-sm p-1"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Regular Text Message Display
  return (
    <div
      className={`flex w-full mb-2 px-3 group relative ${
        isAoi ? 'justify-start' : 'justify-end'
      }`}
    >
      {/* Aoi Avatar in cluster */}
      {isAoi && (
        <div className="w-8 mr-2 flex-shrink-0 self-end mb-1">
          {isLastInGroup ? (
            <img
              src={aoiAvatar}
              alt="Aoi"
              className="w-7 h-7 rounded-full object-cover ring-1 ring-stone-200 dark:ring-stone-700 shadow-sm"
            />
          ) : (
            <div className="w-7 h-7" />
          )}
        </div>
      )}

      {/* Bubble Container */}
      <div className={`flex flex-col ${isAoi ? 'items-start' : 'items-end'} max-w-[88%] sm:max-w-[78%]`}>
        {/* Main Bubble */}
        <div
          onDoubleClick={() => setShowReactionPicker(!showReactionPicker)}
          className={`relative px-4 py-3 text-[14.5px] leading-relaxed transition-all shadow-xs ${
            isAoi
              ? 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 border border-stone-200/80 dark:border-stone-700/80 rounded-2xl rounded-bl-xs'
              : 'bg-[#06c755] dark:bg-[#059669] text-white rounded-2xl rounded-br-xs font-normal'
          }`}
        >
          {/* Reading Mode Helper Pill for Aoi's Japanese messages */}
          {isAoi && containsJapanese && (
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-stone-100 dark:border-stone-700/60 text-[10px]">
              <span className="text-stone-400 font-medium flex items-center gap-1">
                <span>Reading guide:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
                  {settings.readingMode === 'furigana' ? 'Furigana (ふ)' : settings.readingMode === 'romaji' ? 'Romaji (Ro)' : 'Original'}
                </span>
              </span>

              {onChangeReadingMode && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onChangeReadingMode('furigana')}
                    className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${
                      settings.readingMode === 'furigana'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold'
                        : 'text-stone-400 hover:text-stone-600'
                    }`}
                    title="Show Hiragana over Kanji"
                  >
                    ふ
                  </button>
                  <button
                    onClick={() => onChangeReadingMode('romaji')}
                    className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${
                      settings.readingMode === 'romaji'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold font-mono'
                        : 'text-stone-400 hover:text-stone-600'
                    }`}
                    title="Show Romaji reading"
                  >
                    Ro
                  </button>
                  <button
                    onClick={() => onChangeReadingMode('none')}
                    className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${
                      settings.readingMode === 'none'
                        ? 'bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold'
                        : 'text-stone-400 hover:text-stone-600'
                    }`}
                    title="Clean native script"
                  >
                    Off
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Message Text with preserved whitespace and ruby support */}
          <div className="whitespace-pre-wrap break-words font-jp">
            {renderMessageContent()}
          </div>

          {/* Insider Code Word Card if Aoi shared one */}
          {isAoi && (message as any).codeWordTip && (
            <div className="mt-2.5 p-2 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-1.5">
              <Key className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
              <div className="text-[11.5px] leading-snug">
                {(message as any).codeWordTip}
              </div>
            </div>
          )}

          {/* Inline Translation Accordion */}
          {showTranslation && (
            <div className="mt-2.5 pt-2 border-t border-stone-100 dark:border-stone-700/70 text-[13px] text-stone-600 dark:text-stone-300 font-sans italic flex flex-col gap-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 not-italic uppercase tracking-wider">
                <Languages className="w-3 h-3" />
                <span>Translation</span>
              </div>
              <p className="not-italic text-stone-700 dark:text-stone-200">
                {message.translation}
              </p>
            </div>
          )}

          {/* Friendly Correction Card if Aoi gave a natural Japanese tip */}
          {isAoi && message.correction && (
            <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200">
              <button
                onClick={() => setShowCorrectionDetails(!showCorrectionDetails)}
                className="w-full flex items-center justify-between font-semibold text-[11px] text-amber-800 dark:text-amber-300 hover:opacity-80"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Aoi&apos;s Friendly Tip</span>
                </span>
                {showCorrectionDetails ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              <div className="mt-1.5 flex flex-col gap-1">
                <div className="flex items-baseline gap-1 text-[12px]">
                  <span className="text-stone-400 line-through text-[11px]">
                    {message.correction.detectedMistake}
                  </span>
                  <span className="text-stone-400">➔</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-jp">
                    {message.correction.naturalAlternative}
                  </span>
                </div>
                {showCorrectionDetails && (
                  <p className="text-[11.5px] text-stone-600 dark:text-stone-300 mt-1 leading-snug">
                    {message.correction.explanation}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Quick Reaction Pill if present on the message */}
          {message.reactions && Object.keys(message.reactions).length > 0 && (
            <div
              className={`absolute -bottom-2.5 ${
                isAoi ? 'left-3' : 'right-3'
              } flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm cursor-pointer hover:scale-105 transition-transform`}
              onClick={() => setShowReactionPicker(!showReactionPicker)}
            >
              {Object.entries(message.reactions).map(([emoji, count]) => (
                <span key={emoji} className="flex items-center gap-0.5">
                  <span>{emoji}</span>
                  {count > 1 && <span className="text-[10px] text-stone-500">{count}</span>}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Small contextual controls beneath Aoi message */}
        {isAoi && (
          <div className="flex items-center gap-2 mt-1 px-1 text-[11px] text-stone-400 dark:text-stone-500">
            {/* Translate Button */}
            {containsJapanese && message.translation && (
              <button
                onClick={() => onToggleTranslate(message.id)}
                className={`flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors ${
                  message.isTranslated ? 'text-emerald-600 dark:text-emerald-400' : ''
                }`}
                title={message.isTranslated ? 'Hide translation' : 'Translate to English'}
              >
                <Languages className="w-3 h-3" />
                <span>{message.isTranslated ? 'Hide' : 'Translate'}</span>
              </button>
            )}

            {/* Breakdown Button if Japanese vocabulary exists */}
            {message.breakdown && message.breakdown.length > 0 && (
              <button
                onClick={() => onOpenBreakdown(message.breakdown!, message.text)}
                className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors"
                title="View vocabulary & phrases"
              >
                <BookOpen className="w-3 h-3" />
                <span>{message.breakdown.length} phrases</span>
              </button>
            )}

            {/* Audio Speech Button */}
            {containsJapanese && (
              <button
                onClick={handleAudioPlay}
                disabled={isPlayingAudio}
                className={`flex items-center gap-1 hover:text-stone-700 dark:hover:text-stone-300 transition-colors ${
                  isPlayingAudio ? 'text-emerald-500 animate-pulse' : ''
                }`}
                title="Pronounce Japanese"
              >
                <Volume2 className="w-3 h-3" />
                <span>{isPlayingAudio ? 'Playing...' : 'Audio'}</span>
              </button>
            )}

            {/* Reaction picker trigger */}
            <button
              onClick={() => setShowReactionPicker(!showReactionPicker)}
              className="opacity-0 group-hover:opacity-100 hover:text-stone-600 dark:hover:text-stone-300 transition-opacity"
              title="React"
            >
              React
            </button>

            {/* Timestamp */}
            <span className="text-[10px] ml-1">{formatTime(message.timestamp)}</span>
          </div>
        )}

        {/* User Message Footer */}
        {!isAoi && (
          <div className="flex items-center gap-1.5 mt-1 px-1 text-[10px] text-stone-400">
            <span>{formatTime(message.timestamp)}</span>
            {message.status === 'sending' && (
              <span className="inline-block w-2.5 h-2.5 border-2 border-stone-300 border-t-emerald-500 rounded-full animate-spin" />
            )}
            {message.status === 'sent' && (
              <Check className="w-3 h-3 text-emerald-500 inline-block" />
            )}
            {message.status === 'error' && (
              <button
                onClick={() => onRetry(message)}
                className="flex items-center gap-1 text-rose-500 hover:text-rose-600 font-medium underline"
                title="Retry sending"
              >
                <AlertCircle className="w-3 h-3" />
                <span>Failed • Tap to retry</span>
              </button>
            )}
          </div>
        )}

        {/* Floating Quick Reaction Picker */}
        {showReactionPicker && (
          <div
            className={`absolute z-30 -top-8 ${
              isAoi ? 'left-4' : 'right-4'
            } flex items-center gap-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-full px-2 py-1 shadow-lg animate-in fade-in zoom-in-95`}
          >
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReactionClick(emoji)}
                className="hover:scale-130 transition-transform text-sm p-1 focus:outline-none"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
