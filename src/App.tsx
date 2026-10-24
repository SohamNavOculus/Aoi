import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Header } from './components/Header';
import { MessageItem } from './components/MessageItem';
import { TypingIndicator } from './components/TypingIndicator';
import { Composer } from './components/Composer';
import { BreakdownModal } from './components/BreakdownModal';
import { SettingsModal } from './components/SettingsModal';
import { AoiProfileModal } from './components/AoiProfileModal';
import { StartersModal } from './components/StartersModal';
import { ClearChatModal } from './components/ClearChatModal';
import {
  ChatMessage,
  JapaneseBreakdownItem,
  StickerItem,
  MemorySummary,
  UserProfile,
  UserSettings,
} from './types/chat';
import {
  clearChatHistoryStorage,
  DEFAULT_MEMORY,
  INITIAL_AOI_MESSAGE,
  loadChatHistory,
  loadMemorySummary,
  loadUserProfile,
  loadUserSettings,
  saveChatHistory,
  saveMemorySummary,
  saveUserProfile,
  saveUserSettings,
} from './utils/storage';
import { soundManager } from './utils/sound';
import { speakJapanese } from './utils/speech';
import { ChevronDown, AlertCircle } from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadChatHistory());
  const [settings, setSettings] = useState<UserSettings>(() => loadUserSettings());
  const [profile, setProfile] = useState<UserProfile>(() => loadUserProfile());
  const [memorySummary, setMemorySummary] = useState<MemorySummary>(() => loadMemorySummary());
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isStartersOpen, setIsStartersOpen] = useState(false);
  const [isClearChatOpen, setIsClearChatOpen] = useState(false);
  const [breakdownData, setBreakdownData] = useState<{
    items: JapaneseBreakdownItem[];
    fullText: string;
  } | null>(null);

  // Scroll state
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolledUp, setIsScrolledUp] = useState(false);

  // Sync state to local-first storage
  useEffect(() => {
    saveChatHistory(messages);
  }, [messages]);

  useEffect(() => {
    saveUserSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveUserProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveMemorySummary(memorySummary);
  }, [memorySummary]);

  // Register Service Worker for proactive web push notifications
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('Service worker registration:', err);
      });
    }
  }, []);

  // Handle Theme (light/dark/system)
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [settings.theme]);

  // Track scroll position to show/hide "scroll to bottom" button
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;
    setIsScrolledUp(distanceToBottom > 150);
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (!isScrolledUp) {
      scrollToBottom('smooth');
    }
  }, [messages, isLoading]);

  // Count learned words from chat history
  const learnedWordsCount = useMemo(() => {
    const set = new Set<string>();
    messages.forEach((m) => {
      if (m.breakdown) {
        m.breakdown.forEach((b) => set.add(b.japanese));
      }
    });
    return set.size;
  }, [messages]);

  // Send message to Gemini server endpoint
  const handleSendMessage = async (text: string, sticker?: StickerItem) => {
    setApiError(null);

    const userMsgId = `msg_user_${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: sticker ? sticker.text : text,
      timestamp: Date.now(),
      status: 'sending',
      isSticker: Boolean(sticker),
      stickerId: sticker?.id,
      stickerLabel: sticker?.text,
      stickerEmoji: sticker?.emoji,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    if (settings.soundEffects) {
      soundManager.playSend();
    }

    setIsLoading(true);

    try {
      const payloadMessages = newMessages.map((m) => ({
        sender: m.sender,
        text: m.isSticker ? `[Sent Sticker: ${m.text}]` : m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: payloadMessages,
          settings,
          userProfile: profile,
          conversationSummary: memorySummary?.summary || '',
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      const responseJson = await res.json();
      if (!responseJson.success || !responseJson.data) {
        throw new Error(responseJson.error || 'Invalid response from Aoi.');
      }

      const { reply, rubyText, romajiText, codeWordTip, translation, breakdown, correction } = responseJson.data;

      // Update user message status to sent
      setMessages((prev) =>
        prev.map((m) => (m.id === userMsgId ? { ...m, status: 'sent' } : m))
      );

      // Create Aoi's response message
      const aoiMessage: ChatMessage = {
        id: `msg_aoi_${Date.now()}`,
        sender: 'aoi',
        text: reply,
        rubyText: rubyText || undefined,
        romajiText: romajiText || undefined,
        timestamp: Date.now(),
        status: 'sent',
        translation,
        isTranslated: settings.translationDisplay === 'always',
        breakdown,
        correction,
        ...(codeWordTip ? { codeWordTip } : {}),
      } as ChatMessage;

      const finalMessages = [...newMessages, aoiMessage];
      setMessages((prev) => [...prev, aoiMessage]);

      if (settings.soundEffects) {
        soundManager.playReceive();
      }

      if (settings.autoSpeakJapanese) {
        speakJapanese(reply);
      }

      // Check if background conversation summarization should be triggered
      // If we have >= 10 messages and it's been at least 6 messages since the last summary
      const lastSummaryCount = memorySummary.messageCountAtLastSummary || 0;
      if (finalMessages.length >= 10 && finalMessages.length - lastSummaryCount >= 6) {
        fetch('/api/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: finalMessages.map((m) => ({ sender: m.sender, text: m.text })),
            currentSummary: memorySummary.summary,
          }),
        })
          .then((r) => r.json())
          .then((summaryRes) => {
            if (summaryRes.success && summaryRes.data) {
              setMemorySummary({
                summary: summaryRes.data.summary,
                keyFacts: summaryRes.data.keyFacts || [],
                learnedWords: summaryRes.data.learnedWords || [],
                updatedAt: Date.now(),
                messageCountAtLastSummary: finalMessages.length,
              });
            }
          })
          .catch((err) => console.warn('Background summarization skipped:', err));
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      setApiError(error.message || 'Could not connect to Aoi. Please check your internet or retry.');
      // Mark user message as error
      setMessages((prev) =>
        prev.map((m) => (m.id === userMsgId ? { ...m, status: 'error' } : m))
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger a spontaneous slice-of-life proactive message from Aoi
  const handleTriggerProactiveMessage = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await fetch('/api/proactive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings,
          userProfile: profile,
          conversationSummary: memorySummary?.summary || '',
        }),
      });

      if (!res.ok) {
        throw new Error('Could not trigger proactive message.');
      }

      const json = await res.json();
      if (!json.success || !json.data) {
        throw new Error(json.error || 'Invalid response from Aoi.');
      }

      const { reply, rubyText, romajiText, codeWordTip, translation, breakdown } = json.data;

      const proactiveMsg: ChatMessage = {
        id: `msg_aoi_${Date.now()}`,
        sender: 'aoi',
        text: reply,
        rubyText: rubyText || undefined,
        romajiText: romajiText || undefined,
        timestamp: Date.now(),
        status: 'sent',
        translation,
        isTranslated: settings.translationDisplay === 'always',
        breakdown,
        ...(codeWordTip ? { codeWordTip } : {}),
      };

      setMessages((prev) => [...prev, proactiveMsg]);

      if (settings.soundEffects) {
        soundManager.playReceive();
      }

      if (settings.autoSpeakJapanese) {
        speakJapanese(reply);
      }
    } catch (err: any) {
      console.error('Proactive message error:', err);
      setApiError('Aoi is busy right now, try again in a bit!');
    } finally {
      setIsLoading(false);
    }
  };

  // Retry a failed message
  const handleRetry = (failedMsg: ChatMessage) => {
    // Remove the failed message and resend its text
    setMessages((prev) => prev.filter((m) => m.id !== failedMsg.id));
    handleSendMessage(failedMsg.text);
  };

  // Toggle inline translation
  const handleToggleTranslate = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, isTranslated: !m.isTranslated } : m))
    );
  };

  // Add emoji reaction
  const handleAddReaction = (msgId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId) return m;
        const currentReactions = { ...(m.reactions || {}) };
        const userHasReacted = m.userReaction === emoji;

        if (userHasReacted) {
          // Remove reaction
          currentReactions[emoji] = Math.max(0, (currentReactions[emoji] || 1) - 1);
          if (currentReactions[emoji] === 0) delete currentReactions[emoji];
          return {
            ...m,
            reactions: currentReactions,
            userReaction: undefined,
          };
        } else {
          // Add or replace reaction
          if (m.userReaction && currentReactions[m.userReaction]) {
            currentReactions[m.userReaction] = Math.max(0, currentReactions[m.userReaction] - 1);
            if (currentReactions[m.userReaction] === 0) delete currentReactions[m.userReaction];
          }
          currentReactions[emoji] = (currentReactions[emoji] || 0) + 1;
          return {
            ...m,
            reactions: currentReactions,
            userReaction: emoji,
          };
        }
      })
    );
  };

  // Clear chat handler
  const handleClearChat = () => {
    clearChatHistoryStorage();
    setMessages([INITIAL_AOI_MESSAGE]);
    setMemorySummary(DEFAULT_MEMORY);
    saveMemorySummary(DEFAULT_MEMORY);
  };

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 flex flex-col justify-center items-center p-0 sm:py-4 transition-colors">
      {/* Mobile Device Frame Container (Instagram DM / LINE aesthetic) */}
      <div className="w-full sm:max-w-md md:max-w-lg h-[100dvh] sm:h-[92vh] sm:max-h-[880px] bg-stone-50 dark:bg-stone-900 sm:rounded-3xl shadow-xl sm:border border-stone-200/90 dark:border-stone-800 flex flex-col overflow-hidden relative">
        {/* Header */}
        <Header
          isTyping={isLoading}
          settings={settings}
          onUpdateSettings={(newSettings) => setSettings((s) => ({ ...s, ...newSettings }))}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenClearChat={() => setIsClearChatOpen(true)}
          onOpenStarters={() => setIsStartersOpen(true)}
          learnedWordsCount={learnedWordsCount}
        />

        {/* Global Error Banner if API failed */}
        {apiError && (
          <div className="px-4 py-2 bg-rose-50 dark:bg-rose-950/60 border-b border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-1.5 flex-1 pr-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
              <span className="truncate">{apiError}</span>
            </div>
            <button
              onClick={() => setApiError(null)}
              className="text-[11px] font-semibold text-rose-800 dark:text-rose-200 hover:underline flex-shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Scrollable Conversation View */}
        <main
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto chat-scrollbar py-3 px-1 sm:px-2 flex flex-col relative"
        >
          {/* Subtle Date Divider */}
          <div className="flex items-center justify-center my-3">
            <span className="px-3 py-0.5 rounded-full bg-stone-200/60 dark:bg-stone-800 text-[11px] font-medium text-stone-500 dark:text-stone-400">
              Today
            </span>
          </div>

          {/* Messages List */}
          {messages.map((message, index) => {
            const prevMsg = messages[index - 1];
            const nextMsg = messages[index + 1];
            const isFirstInGroup = !prevMsg || prevMsg.sender !== message.sender;
            const isLastInGroup = !nextMsg || nextMsg.sender !== message.sender;

            return (
              <MessageItem
                key={message.id}
                message={message}
                settings={settings}
                isFirstInGroup={isFirstInGroup}
                isLastInGroup={isLastInGroup}
                onToggleTranslate={handleToggleTranslate}
                onOpenBreakdown={(items, fullText) => setBreakdownData({ items, fullText })}
                onRetry={handleRetry}
                onAddReaction={handleAddReaction}
                onChangeReadingMode={(mode) => setSettings((s) => ({ ...s, readingMode: mode }))}
              />
            );
          })}

          {/* Typing Indicator */}
          {isLoading && <TypingIndicator />}

          {/* Anchor for auto-scroll */}
          <div ref={messagesEndRef} className="h-1" />
        </main>

        {/* Floating "Scroll to Bottom" button */}
        {isScrolledUp && (
          <button
            onClick={() => scrollToBottom('smooth')}
            className="absolute bottom-16 right-4 z-20 p-2 rounded-full bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 shadow-md border border-stone-200 dark:border-stone-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-1 text-xs"
            title="Scroll to latest message"
          >
            <ChevronDown className="w-4 h-4 text-emerald-500" />
            <span className="text-[11px] font-medium pr-1">Latest</span>
          </button>
        )}

        {/* Fixed Bottom Message Composer */}
        <Composer
          onSendMessage={(text) => handleSendMessage(text)}
          onSendSticker={(sticker) => handleSendMessage('', sticker)}
          isLoading={isLoading}
          onOpenStarters={() => setIsStartersOpen(true)}
        />
      </div>

      {/* Interactive Modals */}
      <BreakdownModal
        isOpen={Boolean(breakdownData)}
        onClose={() => setBreakdownData(null)}
        items={breakdownData?.items || []}
        fullText={breakdownData?.fullText}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        profile={profile}
        memorySummary={memorySummary}
        onSaveSettings={(s) => setSettings(s)}
        onSaveProfile={(p) => setProfile(p)}
        onTriggerCheckIn={handleTriggerProactiveMessage}
      />

      <AoiProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onStartTopic={(prompt) => handleSendMessage(prompt)}
      />

      <StartersModal
        isOpen={isStartersOpen}
        onClose={() => setIsStartersOpen(false)}
        onSelectPrompt={(prompt) => handleSendMessage(prompt)}
      />

      <ClearChatModal
        isOpen={isClearChatOpen}
        onClose={() => setIsClearChatOpen(false)}
        onConfirm={handleClearChat}
      />
    </div>
  );
}
