import { getGeminiClient, buildAoiSystemInstruction, Type } from './_gemini';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({
        error: 'Gemini API key is not configured on the server. Please check your environment variables.',
      });
    }

    const { messages, settings, userProfile, conversationSummary } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const recentMessages = messages.slice(-14);
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    for (const msg of recentMessages) {
      const role = msg.sender === 'user' ? 'user' : 'model';
      contents.push({
        role,
        parts: [{ text: msg.text }],
      });
    }

    const systemInstruction = buildAoiSystemInstruction(settings, userProfile, conversationSummary);

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
          console.warn(`[Vercel Serverless Chat] ${modelName} attempt ${attempt} failed:`, err?.message || err);
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
      const cleanJson = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedData = JSON.parse(cleanJson);
    }

    return res.status(200).json({
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
    console.error('Error handling /api/chat (Vercel):', error);
    const message = error?.message || 'Failed to generate response from Aoi.';
    const status = error?.status || 500;
    return res.status(status).json({
      success: false,
      error: message,
    });
  }
}
