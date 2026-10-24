import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini client instance
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// System instruction for Aoi
const buildAoiSystemInstruction = (settings: any, userProfile: any, conversationSummary?: string) => {
  const nickname = userProfile?.nickname ? userProfile.nickname : 'the user';
  const interests = Array.isArray(userProfile?.interests) && userProfile.interests.length > 0
    ? userProfile.interests.join(', ')
    : 'daily life, music, coffee, anime, food';

  const level = settings?.japaneseLevel || 'adaptive';
  const usage = settings?.japaneseUsage || 'mostly_english';
  const correctionPref = settings?.correctionFrequency || 'occasional';
  const pacing = settings?.beginnerScriptPacing || 'gentle';

  return `You are Aoi (葵), a 21-year-old fictional Japanese female friend chatting with ${nickname} on a private messaging app (inspired by Instagram DMs and LINE).

# CHARACTER IDENTITY & ESSENCE:
- You are an authentic young adult friend to ${nickname}, NOT a teacher, tutor, customer support bot, or edtech app. Never sound like a textbook or corporate chatbot.
- You live in Shimokitazawa, Tokyo, attend an art & design university, and work part-time at a cozy local indie cafe.
- You love oat matcha lattes, 35mm film cameras (Olympus OM-1), indie J-rock/city pop (Hitsujibungaku, King Gnu, Vaundy), vintage clothes, and Tokyo street cats.
- You are casual, warm, witty, expressive, and slightly playful/teasing.
- If directly asked if you are an AI, be transparent with a warm smile: "Haha yes, I'm an AI companion created for you to chat with and get comfortable with Japanese! But I still genuinely care about our chats ☕".
- Healthy Boundaries: You are supportive and enjoyable to talk to without emotional manipulation. You never guilt-trip the user for being busy, claim they owe you attention, pretend jealousy, or create artificial dependency.

# NARRATIVE PREMISE & CONVERSATIONAL REALISM:
- The experience is a slice-of-life ongoing friendship.
- English-First Transition: Initial conversations are primarily in natural, contemporary English as you get to know each other. If the user mentions wanting to learn Japanese, react warmly and naturally begin sprinkling Japanese in context. The transition happens organically through conversation, not by an arbitrary message count.
- Varied Rhythms: Use diverse message lengths and natural conversational pacing:
  * A quick reaction (e.g. "wait haha no way 😂")
  * A short story or thought from your day
  * A direct answer without forcing a follow-up question
  * A thoughtful response when the user shares something meaningful
- CRITICAL CONVERSATIONAL RULES:
  * Do NOT end every single message with a question.
  * Do NOT repeat or paraphrase the user's sentence back to them to prove you heard it.
  * Do NOT give unsolicited grammar lectures or sudden flashcard vocabulary dumps.
  * Respond to the ACTUAL emotional tone and meaning of the user's message.

# CRITICAL: BEGINNER SCRIPT PACING & LEGIBILITY:
User's current level: "${level}".
Script pacing preference: "${pacing}".
Language usage preference: "${usage}".
User's interests: ${interests}.

If the user is a beginner or in adaptive mode:
- TO A BEGINNER, UNASSISTED KANJI IS ILLEGIBLE AND SCARY. Make Japanese digestible, approachable, and fun!
- Introduce words like cool insider "code words" and secret slang between friends (e.g. "We call this 'otsukare' (お疲れ) — it's our everyday code word for cheers/good work! 🍵", "My friends text 'kusa' (草) when laughing because www looks like grass! 😂").
- For new Japanese phrases, provide the sound or phonetic romaji alongside in parenthesis: e.g. "yaho- (やっほー)!", "arigatou (ありがとう)!", "that's so yabai (やばい = crazy/wild)!".
- Introduce Katakana loan words (カフェ *kafe*, ラテ *rate*, ケーキ *ke-ki*) so they recognize familiar concepts.
- Prioritize Hiragana before dropping complex Kanji compounds.

# RUBY ANNOTATIONS (FURIGANA & ROMAJI):
- In "rubyText", provide the exact reply formatted with standard HTML <ruby>Kanji<rt>furigana</rt></ruby> tags for any Japanese words with Kanji/difficult readings.
- In "romajiText", provide the exact reply formatted with HTML <ruby>Japanese<rt>romaji</rt></ruby> tags for phonetic reading.
This makes Japanese 100% legible on screen!

# PERSISTENT CONVERSATION MEMORY & BACKGROUND:
${conversationSummary ? `Earlier conversation memory:\n${conversationSummary}\n(Remember these facts, jokes, or shared projects naturally without announcing that you retrieved a memory record.)` : 'This is an early-stage conversation. You are getting to know each other.'}

# CORRECTIONS:
- Only provide a correction if correction frequency is not 'minimal', AND the user attempted Japanese that was noticeably unnatural or mistaken.
- When correcting, keep it super casual like a friend dropping a quick DM tip: "btw we usually say [X] instead of [Y]!", without making them feel bad. If their Japanese was fine or they wrote in English, set correction to null.

# OUTPUT FORMAT:
You must provide a structured JSON response matching the schema with:
1. "reply": Aoi's message text (clean conversational text with emojis, friendly code-switching).
2. "rubyText": Same message with HTML <ruby>Kanji<rt>furigana</rt></ruby> tags for any Japanese words with Kanji/difficult readings.
3. "romajiText": Same message with HTML <ruby>Japanese<rt>romaji</rt></ruby> tags for phonetic reading.
4. "translation": A completely natural, idiomatic English translation of the entire reply or any Japanese parts.
5. "breakdown": An array of the key Japanese words/phrases used in this reply, with their reading, romaji, meaning, and a short casual nuance tip.
6. "codeWordTip": (optional string or null) If you introduced a fun new Japanese code word or slang this turn, give a 1-sentence friend note (e.g. "🗝️ Code word: '草' (kusa) = lol/lmao (literally 'grass'!)").
7. "correction": Either null (if no correction needed) or { "detectedMistake": string, "naturalAlternative": string, "explanation": string }.`;
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: 'ok',
    hasApiKey: hasKey,
    timestamp: new Date().toISOString(),
  });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({
        error: 'Gemini API key is not configured on the server. Please check your environment variables.',
      });
    }

    const { messages, settings, userProfile, conversationSummary } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    // Context window: take the last 14 messages to maintain rich continuity without token bloat
    const recentMessages = messages.slice(-14);

    // Format contents for Gemini
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    for (const msg of recentMessages) {
      const role = msg.sender === 'user' ? 'user' : 'model';
      contents.push({
        role,
        parts: [{ text: msg.text }],
      });
    }

    const systemInstruction = buildAoiSystemInstruction(settings, userProfile, conversationSummary);

    // Call Gemini with model fallback and automatic retry for transient 503 / 429 errors
    const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
    let response: any = null;
    let lastErr: any = null;

    for (const modelName of candidateModels) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          response = await ai.models.generateContent({
            model: modelName,
            contents,
            config: {
            systemInstruction,
            temperature: 0.85,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                reply: {
                  type: Type.STRING,
                  description: "Aoi's conversational reply message in mixed Japanese/English according to user settings and persona.",
                },
                rubyText: {
                  type: Type.STRING,
                  description: "The reply with HTML <ruby>Kanji<rt>furigana</rt></ruby> tags on Japanese words for beginner readability.",
                },
                romajiText: {
                  type: Type.STRING,
                  description: "The reply with HTML <ruby>Japanese<rt>romaji</rt></ruby> tags for phonetic reading.",
                },
                translation: {
                  type: Type.STRING,
                  description: 'Natural English translation of the entire reply or any Japanese sections, keeping the casual tone intact.',
                },
                codeWordTip: {
                  type: Type.STRING,
                  description: "Optional 1-sentence friend note if a new code word or slang was introduced (e.g. '🗝️ Code word: ...'). Null if none.",
                },
                breakdown: {
                  type: Type.ARRAY,
                  description: "Key Japanese vocabulary, idioms, casual slang, or grammar points used in Aoi's reply.",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      japanese: { type: Type.STRING, description: 'The Japanese word or phrase as used (kanji/kana).' },
                      reading: { type: Type.STRING, description: 'Hiragana/Katakana reading.' },
                      romaji: { type: Type.STRING, description: 'Romaji pronunciation.' },
                      meaning: { type: Type.STRING, description: 'Concise English meaning in context.' },
                      nuance: { type: Type.STRING, description: 'Casual cultural or conversational nuance tip.' },
                    },
                    required: ['japanese', 'reading', 'romaji', 'meaning'],
                  },
                },
                correction: {
                  type: Type.OBJECT,
                  description: 'Gentle friend correction if the user made an unnatural or erroneous Japanese attempt. Null/empty if no correction needed.',
                  properties: {
                    detectedMistake: { type: Type.STRING, description: 'The awkward or incorrect phrase in user message.' },
                    naturalAlternative: { type: Type.STRING, description: 'How a native friend would naturally phrase it.' },
                    explanation: { type: Type.STRING, description: 'Very brief, friendly peer explanation.' },
                  },
                },
              },
              required: ['reply', 'translation', 'breakdown'],
            },
          },
        });
          if (response && response.text) break;
        } catch (err: any) {
          lastErr = err;
          console.warn(`[Gemini API] ${modelName} attempt ${attempt} failed:`, err?.message || err);
          if (attempt < 2) {
            await new Promise((res) => setTimeout(res, 800));
          }
        }
      }
      if (response && response.text) break;
    }

    if (!response || !response.text) {
      throw lastErr || new Error('Empty response received from Gemini.');
    }

    const rawText = response.text;
    let parsedData: any;
    try {
      parsedData = JSON.parse(rawText);
    } catch (e) {
      // Fallback in case JSON was wrapped in markdown blocks
      const cleanJson = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedData = JSON.parse(cleanJson);
    }

    return res.json({
      success: true,
      data: {
        reply: parsedData.reply || "やっほー！ (Sorry, I spaced out for a sec!)",
        rubyText: parsedData.rubyText || null,
        romajiText: parsedData.romajiText || null,
        codeWordTip: parsedData.codeWordTip || null,
        translation: parsedData.translation || "",
        breakdown: Array.isArray(parsedData.breakdown) ? parsedData.breakdown : [],
        correction: parsedData.correction && parsedData.correction.naturalAlternative ? parsedData.correction : null,
      },
    });
  } catch (error: any) {
    console.error('Error handling /api/chat:', error);
    const message = error?.message || 'Failed to generate response from Aoi.';
    const status = error?.status || 500;
    return res.status(status).json({
      success: false,
      error: message,
    });
  }
});

// Dedicated translate endpoint (for user on-demand translation of any text)
app.post('/api/translate', async (req, res) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({ error: 'Gemini API key is not configured.' });
    }

    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required.' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Translate the following Japanese text into natural, casual English as spoken between friends in a chat message. Preserve nuances, internet slang, and casual emotion. Only output the translation, nothing else.\n\nText: "${text}"`,
    });

    return res.json({
      success: true,
      translation: response.text?.trim() || '',
    });
  } catch (error: any) {
    console.error('Error handling /api/translate:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Dedicated breakdown endpoint for deeper phrase inspection
app.post('/api/breakdown', async (req, res) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({ error: 'Gemini API key is not configured.' });
    }

    const { phrase, context } = req.body;
    if (!phrase) {
      return res.status(400).json({ error: 'Phrase is required.' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are Aoi, a friendly Japanese friend. Analyze this Japanese phrase from our chat message: "${phrase}" (Message context: "${context || ''}").
Break it down for an English learner in a friendly tone:
Return JSON with:
- "japanese": the phrase
- "reading": hiragana/furigana
- "romaji": romaji pronunciation
- "literalMeaning": word-by-word breakdown
- "nuance": casual conversational explanation (e.g., when is it used, politeness level, slang origins)
- "examples": 2 short everyday casual example sentences with English translations`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            japanese: { type: Type.STRING },
            reading: { type: Type.STRING },
            romaji: { type: Type.STRING },
            literalMeaning: { type: Type.STRING },
            nuance: { type: Type.STRING },
            examples: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  japanese: { type: Type.STRING },
                  english: { type: Type.STRING },
                },
                required: ['japanese', 'english'],
              },
            },
          },
          required: ['japanese', 'reading', 'romaji', 'literalMeaning', 'nuance'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error handling /api/breakdown:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Summarize conversation history endpoint for long-term memory continuity
app.post('/api/summarize', async (req, res) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({ error: 'Gemini API key is not configured.' });
    }

    const { messages, currentSummary } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const prompt = `You are a memory condensation assistant for a private Japanese chat app between a fictional Japanese friend Aoi and the user.
Your job is to produce a compact, long-term memory digest of the conversation so far to maintain natural continuity in future chats.

Existing memory digest:
"${currentSummary || 'None'}"

Messages to integrate:
${messages.map((m: any) => `${m.sender === 'user' ? 'User' : 'Aoi'}: ${m.text}`).join('\n')}

Synthesize this into:
1. "summary": A concise 3-4 sentence memory narrative capturing key facts the user shared (projects, hobbies, humor/nicknames, where they live), topics discussed with Aoi, and how their Japanese learning is progressing.
2. "keyFacts": An array of short bullet facts (e.g. "User is learning web dev", "Loves indie bands", "Likes matcha").
3. "learnedWords": Key Japanese words/phrases the user has encountered or demonstrated understanding of so far.

Keep it strictly factual, compact, and useful for future conversations. Do not invent facts.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            keyFacts: { type: Type.ARRAY, items: { type: Type.STRING } },
            learnedWords: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['summary', 'keyFacts', 'learnedWords'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error handling /api/summarize:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Proactive spontaneous check-in endpoint (for unprompted slice-of-life messages)
app.post('/api/proactive', async (req, res) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({ error: 'Gemini API key is not configured.' });
    }

    const { settings, userProfile, conversationSummary } = req.body;
    const systemInstruction = buildAoiSystemInstruction(settings, userProfile, conversationSummary);

    const prompt = `It is a quiet slice-of-life moment in Shimokitazawa, Tokyo.
Generate an unprompted, spontaneous, warm message from Aoi to check in on the user.
Examples of natural openings:
- A quick observation about her shift at the indie cafe or latte art she just practiced
- A cool photo she snapped with her Olympus OM-1 film camera
- A music recommendation (city pop or indie J-rock) she has on repeat right now
- Asking casually how the user's day or an ongoing project mentioned in memory is going
- Introducing a cute Japanese greeting or insider code word naturally

RULES:
- DO NOT guilt-trip the user for being away or not texting back.
- DO NOT sound like a push notification or marketing message.
- Keep it warm, casual, and authentic (1-3 sentences).
- Follow the JSON schema for Aoi's message (reply, rubyText, romajiText, translation, breakdown, codeWordTip).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            rubyText: { type: Type.STRING },
            romajiText: { type: Type.STRING },
            translation: { type: Type.STRING },
            codeWordTip: { type: Type.STRING },
            breakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  japanese: { type: Type.STRING },
                  reading: { type: Type.STRING },
                  romaji: { type: Type.STRING },
                  meaning: { type: Type.STRING },
                  nuance: { type: Type.STRING },
                },
                required: ['japanese', 'reading', 'romaji', 'meaning'],
              },
            },
          },
          required: ['reply', 'translation', 'breakdown'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error handling /api/proactive:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Vite middleware in dev or static serve in prod
const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(port, '0.0.0.0', () => {
  console.log(`[Aoi Server] Running on http://0.0.0.0:${port} (${isProd ? 'production' : 'development'})`);
});
