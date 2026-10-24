import { getGeminiClient, Type } from './_gemini';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({ error: 'Gemini API key is not configured.' });
    }

    const { phrase, context } = req.body || {};
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
    return res.status(200).json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error handling /api/breakdown (Vercel):', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
