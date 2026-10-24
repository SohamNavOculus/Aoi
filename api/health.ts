export default function handler(req: any, res: any) {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  return res.status(200).json({
    status: 'ok',
    hasApiKey: hasKey,
    timestamp: new Date().toISOString(),
  });
}
