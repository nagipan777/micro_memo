import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const NOTION_API_URL = 'https://api.notion.com/v1/';
  const NOTION_API_KEY = process.env.VITE_NOTION_API_KEY || '';
  const DATABASE_ID = process.env.VITE_NOTION_DATABASE_ID || '';

  if (!NOTION_API_KEY || !DATABASE_ID) {
    res.status(500).json({ error: 'Missing API key or database ID in environment variables.' });
    return;
  }

  const { action, ...body } = req.body;

  // Determine the Notion API endpoint
  let endpoint = '';
  switch (action) {
    case 'query':
      endpoint = `databases/${DATABASE_ID}/query`;
      break;
    case 'create':
      endpoint = `pages`;
      break;
    case 'update':
    case 'delete':
      endpoint = `pages/${body.page_id}`;
      break;
    default:
      res.status(400).json({ error: 'Invalid action' });
      return;
  }

  try {
    const response = await fetch(`${NOTION_API_URL}${endpoint}`, {
      method: action === 'query' || action === 'create' ? 'POST' : 'PATCH',
      headers: {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
      res.status(response.status).json(data);
      return;
    }

    res.status(200).json(data);
  } catch (error: unknown) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}