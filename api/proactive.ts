import { getGeminiClient, buildAoiSystemInstruction, Type } from './_gemini';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({ error: 'Gemini API key is not configured.' });
    }

    const { settings, userProfile, conversationSummary } = req.body || {};
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
    return res.status(200).json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error handling /api/proactive (Vercel):', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
