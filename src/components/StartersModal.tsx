import React from 'react';
import { X, Sparkles, MessageSquare, Coffee, Utensils, Music, Compass } from 'lucide-react';

interface StartersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: string) => void;
}

interface PromptCategory {
  category: string;
  icon: React.ReactNode;
  prompts: Array<{
    japanese: string;
    english: string;
  }>;
}

const STARTER_CATEGORIES: PromptCategory[] = [
  {
    category: 'Beginner Words & Secret "Code Words"',
    icon: <Sparkles className="w-4 h-4 text-emerald-500" />,
    prompts: [
      {
        japanese: '日本の若者が使う「合言葉」やスラング教えて！',
        english: 'Teach me some cool Japanese friend "code words" and everyday slang!',
      },
      {
        japanese: '「お疲れ (otsukare)」ってどういう時に使うの？',
        english: "What does 'otsukare' mean and when should I use it?",
      },
      {
        japanese: 'なんで笑う時に「草 (kusa)」って書くの？笑',
        english: "Why do Japanese people text 'kusa' (草) when laughing? lol",
      },
      {
        japanese: '友達同士でカジュアルに「こんにちは」って何て言う？',
        english: "How do close friends say 'hey / what's up' casually in Tokyo?",
      },
    ],
  },
  {
    category: 'Daily Life & Banter',
    icon: <MessageSquare className="w-4 h-4 text-emerald-500" />,
    prompts: [
      {
        japanese: '今日何してたの？ (kyou nani shiteta no?)',
        english: 'What did you do today? How was your day?',
      },
      {
        japanese: '今日のバイトどうだった？ (kyou no baito doudatta?)',
        english: 'How was your cafe shift today?',
      },
      {
        japanese: '最近めっちゃ忙しくて疲れた〜 (metcha tsukareta~)',
        english: "I've been super busy lately and so exhausted~",
      },
      {
        japanese: '週末何か予定ある？ (shuumatsu nani ka yotei aru?)',
        english: 'Got any plans for the weekend?',
      },
    ],
  },
  {
    category: 'Tokyo & Cafe Culture',
    icon: <Coffee className="w-4 h-4 text-amber-500" />,
    prompts: [
      {
        japanese: '下北沢のおすすめカフェ教えて！',
        english: 'Tell me your favorite cafe in Shimokitazawa!',
      },
      {
        japanese: '日本のカフェでよく頼むものは何？',
        english: 'What do you usually order at Japanese cafes?',
      },
      {
        japanese: 'おすすめの日本のコンビニお菓子ある？',
        english: 'Any Japanese convenience store snacks you recommend?',
      },
    ],
  },
  {
    category: 'Japanese Slang & Fun Questions',
    icon: <Sparkles className="w-4 h-4 text-pink-500" />,
    prompts: [
      {
        japanese: '最近の若者言葉って何かある？',
        english: 'What are some trendy Japanese slang words lately?',
      },
      {
        japanese: '「それな」ってどんな時に使うの？',
        english: "When do people use 'Sorena' (That's so true)?",
      },
      {
        japanese: '今日一番美味しかったご飯は何？',
        english: 'What was the tastiest meal you ate today?',
      },
    ],
  },
  {
    category: 'Music & Vibes',
    icon: <Music className="w-4 h-4 text-violet-500" />,
    prompts: [
      {
        japanese: '最近よく聴いてる日本の曲ある？',
        english: 'Any Japanese songs you have on repeat lately?',
      },
      {
        japanese: 'シティポップでおすすめのアーティスト教えて！',
        english: 'Recommend me some classic or modern City Pop artists!',
      },
    ],
  },
];

export const StartersModal: React.FC<StartersModalProps> = ({
  isOpen,
  onClose,
  onSelectPrompt,
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
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
                Conversation Starters
              </h3>
              <p className="text-[11px] text-stone-500">
                Natural Japanese topics to chat about with Aoi
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

        {/* Content */}
        <div className="p-5 overflow-y-auto chat-scrollbar flex flex-col gap-5">
          {STARTER_CATEGORIES.map((cat, idx) => (
            <div key={idx} className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300">
                {cat.icon}
                <span>{cat.category}</span>
              </div>

              <div className="flex flex-col gap-2">
                {cat.prompts.map((p, pIdx) => (
                  <button
                    key={pIdx}
                    onClick={() => {
                      onSelectPrompt(`${p.japanese} (${p.english})`);
                      onClose();
                    }}
                    className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-stone-200/80 dark:border-stone-700/80 hover:border-emerald-300 dark:hover:border-emerald-700 text-left transition-all group"
                  >
                    <div className="font-jp font-semibold text-sm text-stone-900 dark:text-stone-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                      {p.japanese}
                    </div>
                    <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      {p.english}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-medium hover:bg-stone-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
