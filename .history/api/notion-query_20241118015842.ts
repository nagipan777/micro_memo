import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.VITE_NOTION_KEY });

export interface DiaryEntry {
  id: string;
  title?: string;
  content: string;
  date: Date;
  mood?: string;
  tags: string[];
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const response = await notion.databases.query({
        database_id: process.env.VITE_NOTION_DATABASE_ID,
      });
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}