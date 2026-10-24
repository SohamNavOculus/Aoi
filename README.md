# Aoi (葵) - Japanese AI Friend Chat 🍵

> **A natural friendship first. Japanese immersion through conversation second.**

A mobile-first web app styled with the intimate feel of **Instagram DMs** and the cozy Japanese messaging charm of **LINE**. Rather than flashcards or textbook drills, you chat with **Aoi (葵)**, a fictional 21-year-old art student in Shimokitazawa, Tokyo who loves oat matcha lattes, 35mm film cameras, city pop, and street cats.

---

## ✨ Highlights & Features

### 1. Beginner-First Legibility & Script Pacing
- **Furigana & Romaji Reading Guides**: Instant one-tap switcher in the top bar (`ふ Furigana` / `Ro Romaji` / `文 Clean`) rendering native HTML `<ruby>` annotations. Japanese is never an intimidating wall of kanji.
- **"Code Word" System**: Aoi introduces everyday Japanese like secret insider slang between friends (e.g., *"We call this 'otsukare' (お疲れ) — it's our code word for good work/cheers!"*, *"草 (kusa) = lol/lmao because 'www' looks like grass"*).
- **Interactive Vocabulary Breakdown**: Tap any message's **Breakdown** button to view word-by-word kanji, kana, romaji, English meanings, and casual conversational nuances.
- **Organic Slice-of-Life Transition**: Chats begin naturally in English. When you show interest in Japanese, Aoi gradually blends words and phrases into real context.

### 2. Authentic Conversational Realism
- **Varied Rhythm**: Aoi responds naturally with short reactions, quick thoughts from her cafe shift, or thoughtful replies—without robotic formulas.
- **No Parroting & No Forced Questions**: She doesn't artificially end every sentence with an interrogation or repeat your statements back to you.
- **Healthy Emotional Boundaries**: Supportive and warm without manipulation, guilt-trips, or simulated jealousy.

### 3. Instagram DM × LINE Aesthetic
- **Minimal, Intimate Mobile Layout**: Focused entirely on the conversation.
- **LINE-Inspired Sticker Pack**: 10+ expressive sticker buttons (*Yaho!*, *Otsukare*, *Bikkuri*, *Nemui*, etc.) with Japanese kana, romaji, and English meanings.
- **Audio Chimes & Native Pronunciation**: Send/receive chimes (synthesized via Web Audio API, no external audio files required) and native Web Speech API audio playback for Japanese messages.
- **IME Composition Guard**: Full Japanese IME support on desktop and mobile keyboards (`isComposing` and keycode 229 guards prevent accidental submissions during kanji conversion).

### 4. Long-Term Memory & Local-First Architecture
- **Zero Account Hassle**: Messages, custom profile interests, and preferences are stored in encrypted `localStorage`.
- **Automatic Context Summarization**: Every 6–10 messages, a background summarizer condenses earlier turns into a compact 3–4 sentence memory digest. Aoi remembers your hobbies, projects, and jokes across long chats without token bloat.
- **Spontaneous Check-ins & Push**: Supports occasional unprompted check-ins from Aoi (with configurable Quiet Hours so you're never disturbed late at night).

---

## 🔒 Security & Privacy

- **Strict Server-Side API Security**: The Gemini API key (`GEMINI_API_KEY`) is stored strictly in server-side environment variables and is **never** bundled or exposed to client-side code.
- **Model Fallback Resilience**: Server handles transient network spikes with an automatic fallback chain: `gemini-3.8-flash` ➔ `gemini-3.1-flash-lite` ➔ `gemini-flash-latest`.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (Node 20 or 22 recommended)
- A Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone & Install
```bash
git clone https://github.com/your-username/aoi-japanese-friend-chat.git
cd aoi-japanese-friend-chat
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your Gemini API Key in `.env`:
```env
GEMINI_API_KEY="your-gemini-api-key-here"
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploy to Vercel

The application is structured for instant one-click deployment on **Vercel**:

1. Push your repository to GitHub.
2. Import the project in the [Vercel Dashboard](https://vercel.com/new).
3. In **Project Settings** ➔ **Environment Variables**, add:
   - `GEMINI_API_KEY`: Your Gemini API key.
4. Click **Deploy**.

Vercel automatically detects Vite and routes backend endpoints under `/api/*` to the serverless functions in the `/api` directory.

---

## 📁 Project Structure

```
├── api/                      # Vercel Serverless Functions
│   ├── _gemini.ts            # Shared Gemini SDK client & Aoi system prompt
│   ├── chat.ts               # POST /api/chat
│   ├── breakdown.ts          # POST /api/breakdown
│   ├── translate.ts          # POST /api/translate
│   ├── summarize.ts          # POST /api/summarize (long-term memory)
│   ├── proactive.ts          # POST /api/proactive
│   └── health.ts             # GET /api/health
├── public/
│   ├── sw.js                 # Service worker for Web Push notifications
│   └── assets/               # Local app assets
├── src/
│   ├── assets/               # Aoi avatar & graphics
│   ├── components/
│   │   ├── Header.tsx        # DM header with reading guide & audio toggles
│   │   ├── MessageItem.tsx   # Chat bubble with ruby tags, breakdown & reactions
│   │   ├── Composer.tsx      # Fixed bottom input with IME guard & stickers
│   │   ├── SettingsModal.tsx # Script pacing, memory notebook, quiet hours
│   │   ├── BreakdownModal.tsx# Deep linguistic and cultural phrase breakdown
│   │   ├── StartersModal.tsx # Casual conversation starters
│   │   ├── AoiProfileModal.tsx# Fictional bio, music taste, and trivia
│   │   └── ClearChatModal.tsx# Safe reset modal
│   ├── data/
│   │   └── stickers.ts       # LINE-style sticker pack data
│   ├── types/
│   │   └── chat.ts           # TypeScript interfaces & types
│   ├── utils/
│   │   ├── ruby.tsx          # Native HTML <ruby> parser for furigana & romaji
│   │   ├── sound.ts          # Web Audio synth for send/receive chimes
│   │   ├── speech.ts         # Web Speech API for ja-JP voice synthesis
│   │   └── storage.ts        # LocalStorage helpers & initial chat state
│   ├── App.tsx               # Main container & state management
│   ├── main.tsx              # React DOM root entry
│   └── index.css             # Tailwind CSS styles & Japanese typography
├── server.ts                 # Full-stack Node/Express server for local dev
├── vercel.json               # Vercel deployment configuration
└── vite.config.ts            # Vite configuration with Tailwind CSS v4
```

---

## 📜 License

Apache-2.0
