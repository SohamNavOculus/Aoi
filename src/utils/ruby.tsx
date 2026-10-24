import React from 'react';
import { JapaneseBreakdownItem, ReadingMode } from '../types/chat';

/**
 * Parses text containing <ruby>Kanji<rt>reading</rt></ruby> into React elements
 */
export function parseRubyString(text: string, isRomaji = false): React.ReactNode[] {
  if (!text) return [];
  if (!text.includes('<ruby>')) {
    return [text];
  }

  const parts: React.ReactNode[] = [];
  const regex = /<ruby>(.*?)<rt>(.*?)<\/rt><\/ruby>/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const base = match[1];
    const reading = match[2];
    parts.push(
      <ruby key={match.index} className="inline-flex flex-col items-center mx-0.5 group/ruby align-bottom">
        <rt className={`text-[10px] leading-tight select-none font-medium px-0.5 rounded ${
          isRomaji ? 'text-amber-600 dark:text-amber-400 font-mono' : 'text-emerald-600 dark:text-emerald-400 font-jp'
        }`}>
          {reading}
        </rt>
        <span className="font-medium text-stone-900 dark:text-stone-100">{base}</span>
      </ruby>
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}

/**
 * Automatically annotates plain text using breakdown items if rubyText was not provided
 */
export function autoAnnotateWithBreakdown(
  text: string,
  breakdown: JapaneseBreakdownItem[] | undefined,
  mode: ReadingMode
): React.ReactNode {
  if (mode === 'none' || !breakdown || breakdown.length === 0) {
    return text;
  }

  // Sort breakdown items by length descending so longer phrases match first
  const sorted = [...breakdown].sort((a, b) => b.japanese.length - a.japanese.length);

  let annotated = text;
  for (const item of sorted) {
    if (!item.japanese || !annotated.includes(item.japanese)) continue;
    const reading = mode === 'romaji' ? item.romaji : item.reading;
    const replacement = `<ruby>${item.japanese}<rt>${reading}</rt></ruby>`;
    annotated = annotated.replaceAll(item.japanese, replacement);
  }

  return parseRubyString(annotated, mode === 'romaji');
}
