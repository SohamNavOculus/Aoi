// Speech Synthesis helper for Japanese pronunciation

export function isJapaneseText(text: string): boolean {
  // Check for Hiragana, Katakana, or Kanji
  return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text);
}

// Extract Japanese segments from mixed text for clearer speech
export function extractJapaneseSegments(text: string): string {
  // If text is primarily Japanese, speak the whole thing
  // If mixed, extract Japanese sentences/phrases or speak entire message if short
  return text;
}

export function speakJapanese(text: string, onEnd?: () => void, onError?: (err: any) => void): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.95; // Slightly relaxed, natural pace
    utterance.pitch = 1.08; // Friendly, warm young female tone

    // Try to find a Japanese voice
    const voices = window.speechSynthesis.getVoices();
    const jaVoice = voices.find(
      (v) => v.lang.startsWith('ja') || v.lang.replace('_', '-').startsWith('ja-JP')
    );

    if (jaVoice) {
      utterance.voice = jaVoice;
    }

    if (onEnd) utterance.onend = () => onEnd();
    if (onError) utterance.onerror = (e) => onError(e);

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error('Speech synthesis error:', err);
    if (onError) onError(err);
    return false;
  }
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
