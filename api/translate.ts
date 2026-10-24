import { getGeminiClient } from './_gemini';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({ error: 'Gemini API key is not configured.' });
    }

    const { text } = req.body || {};
    if (!text) {
      return res.status(400).json({ error: 'Text is required.' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Translate the following Japanese text into natural, casual English as spoken between friends in a chat message. Preserve nuances, internet slang, and casual emotion. Only output the translation, nothing else.\n\nText: "${text}"`,
    });

    return res.status(200).json({
      success: true,
      translation: response.text?.trim() || '',
    });
  } catch (error: any) {
    console.error('Error handling /api/translate (Vercel):', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
