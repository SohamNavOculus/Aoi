import React from 'react';
import aoiAvatar from '../assets/aoi_avatar.jpg';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex w-full mb-3 px-3 justify-start items-end animate-in fade-in duration-200">
      <div className="w-8 mr-2 flex-shrink-0">
        <img
          src={aoiAvatar}
          alt="Aoi"
          className="w-7 h-7 rounded-full object-cover ring-1 ring-stone-200 dark:ring-stone-700 shadow-sm"
        />
      </div>

      <div className="bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700/80 px-4 py-2.5 rounded-2xl rounded-bl-xs shadow-xs flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
        <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500 ml-1.5">
          typing...
        </span>
      </div>
    </div>
  );
};
