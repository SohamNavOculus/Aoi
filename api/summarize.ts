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

    const { messages, currentSummary } = req.body || {};
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
    return res.status(200).json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error handling /api/summarize (Vercel):', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
