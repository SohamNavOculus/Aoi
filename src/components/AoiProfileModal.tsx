import React, { useState } from 'react';
import { X, MapPin, Coffee, Music, Camera, Heart, Volume2, Sparkles, MessageCircle } from 'lucide-react';
import aoiAvatar from '../assets/aoi_avatar.jpg';
import { speakJapanese } from '../utils/speech';

interface AoiProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTopic: (prompt: string) => void;
}

export const AoiProfileModal: React.FC<AoiProfileModalProps> = ({
  isOpen,
  onClose,
  onStartTopic,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  if (!isOpen) return null;

  const handlePlayVoice = () => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    speakJapanese(
      'やっほー！葵だよ。下北沢のカフェでバイトしてるんだ。いつでも気軽に日本語で話しかけてね！',
      () => setIsPlayingAudio(false),
      () => setIsPlayingAudio(false)
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cover Header */}
        <div className="h-28 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 relative flex justify-end p-3">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-xs transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Card Body */}
        <div className="px-5 pb-5 pt-0 relative flex flex-col items-center text-center -mt-12">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-white dark:ring-stone-900 shadow-lg relative group">
            <img src={aoiAvatar} alt="Aoi" className="w-full h-full object-cover" />
            <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-stone-900" />
          </div>

          {/* Name & Bio */}
          <div className="mt-3">
            <div className="flex items-center justify-center gap-1.5">
              <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100 tracking-tight">
                Aoi
              </h3>
              <span className="font-jp text-sm text-stone-600 dark:text-stone-300 font-semibold">
                葵
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 flex items-center justify-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>Shimokitazawa, Tokyo • 21 y/o</span>
            </p>
          </div>

          {/* Voice Intro Button */}
          <button
            onClick={handlePlayVoice}
            disabled={isPlayingAudio}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium hover:bg-emerald-100 transition-colors shadow-2xs"
          >
            <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'animate-pulse text-emerald-600' : ''}`} />
            <span>{isPlayingAudio ? 'Speaking Japanese...' : 'Hear Aoi\'s Voice 👋'}</span>
          </button>

          {/* About description */}
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-3.5 leading-relaxed text-left bg-stone-50 dark:bg-stone-800/60 p-3 rounded-2xl border border-stone-100 dark:border-stone-800">
            Design student in Tokyo & weekend barista at an indie coffee shop in Shimokitazawa.
            Loves matcha lattes, 35mm film cameras, city pop, and chatting about whatever&apos;s on your mind!
          </p>

          {/* Interests Tags */}
          <div className="mt-3.5 w-full flex flex-col gap-2 text-left">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
              Favorite Things
            </span>
            <div className="flex flex-wrap gap-1.5 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center gap-1">
                <Coffee className="w-3 h-3 text-amber-500" />
                <span>Oat Matcha Latte</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center gap-1">
                <Music className="w-3 h-3 text-violet-500" />
                <span>Hitsujibungaku (羊文学)</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center gap-1">
                <Camera className="w-3 h-3 text-sky-500" />
                <span>Olympus OM-1</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center gap-1">
                <Heart className="w-3 h-3 text-rose-500" />
                <span>Street Cats</span>
              </span>
            </div>
          </div>

          {/* Quick Chat Starters from Profile */}
          <div className="mt-4 w-full flex flex-col gap-1.5 text-left">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
              Ask Aoi About
            </span>
            <button
              onClick={() => {
                onStartTopic('下北沢のおすすめカフェ教えて！ What are your favorite cafes in Shimokita?');
                onClose();
              }}
              className="text-xs p-2 rounded-xl bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-left border border-stone-200/60 dark:border-stone-700 transition-colors flex items-center justify-between group"
            >
              <span>☕ Shimokitazawa cafe recommendations</span>
              <MessageCircle className="w-3.5 h-3.5 text-emerald-500 opacity-60 group-hover:opacity-100" />
            </button>
            <button
              onClick={() => {
                onStartTopic('最近どんな音楽聴いてる？ Any cool Japanese music recommendations?');
                onClose();
              }}
              className="text-xs p-2 rounded-xl bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-left border border-stone-200/60 dark:border-stone-700 transition-colors flex items-center justify-between group"
            >
              <span>🎵 Music and indie band recommendations</span>
              <MessageCircle className="w-3.5 h-3.5 text-emerald-500 opacity-60 group-hover:opacity-100" />
            </button>
          </div>

          {/* AI Disclosure */}
          <div className="mt-4 text-[10px] text-stone-400 dark:text-stone-500 leading-tight">
            Aoi is a fictional AI friend designed for comfortable, everyday Japanese immersion.
          </div>
        </div>
      </div>
    </div>
  );
};
