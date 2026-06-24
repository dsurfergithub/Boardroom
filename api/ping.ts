export default function handler(req: any, res: any) {
  const appSecret = process.env.APP_SECRET;

  if (!appSecret) {
    return res.status(200).json({ ok: true });
  }

  const authHeader = req.headers.authorization as string | undefined;
  if (authHeader !== `Bearer ${appSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  res.status(200).json({ ok: true });
}
