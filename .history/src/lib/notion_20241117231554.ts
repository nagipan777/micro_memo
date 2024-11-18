import { Client } from '@notionhq/client';
import { z } from 'zod';

// Schema validation for environment variables
const envSchema = z.object({
  VITE_NOTION_KEY: z.string(),
  VITE_NOTION_DATABASE_ID: z.string(),
});

// Validate environment variables
const validateEnv = () => {
  try {
    const parsed = envSchema.parse(import.meta.env);
    return {
      VITE_NOTION_KEY: parsed.VITE_NOTION_KEY || '',
      VITE_NOTION_DATABASE_ID: parsed.VITE_NOTION_DATABASE_ID || '',
    };
  } catch (error) {
    console.error('環境変数の検証に失敗:', error);
    throw new Error('環境変数 VITE_NOTION_KEY または VITE_NOTION_DATABASE_ID が不足しています。');
  }
};

// Initialize Notion client
const getNotionClient = () => {
  const env = validateEnv();
  return new Client({ auth: env.VITE_NOTION_KEY });
};

export interface DiaryEntry {
  id: string;
  title?: string;
  content: string;
  date: Date;
  mood?: string;
  tags: string[];
}

// Convert Notion page to DiaryEntry
const notionToEntry = (page: any): DiaryEntry => {
  if (!page || !page.properties) {
    throw new Error('Invalid Notion page data');
  }

  return {
    id: page.id,
    title: page.properties?.タイトル?.title?.[0]?.plain_text || '',
content: page.properties?.内容?.rich_text?.[0]?.plain_text || '',
date: new Date(page.properties?.日付?.date?.start || new Date()),
mood: page.properties?.気分タグ?.multi_select?.[0]?.name || '',
tags: page.properties?.気分タグ?.multi_select?.map((tag: any) => tag.name) || [],
  };
};

// Create a new diary entry
export async function createEntry(entry: Omit<DiaryEntry, 'id'>): Promise<DiaryEntry> {
  const notion = getNotionClient();
  const env = validateEnv();

  try {
    const response = await notion.pages.create({
      parent: { database_id: env.VITE_NOTION_DATABASE_ID },
      properties: {
        タイトル: {
          title: entry.title ? [{ text: { content: entry.title } }] : [],
        },
        内容: {
          rich_text: [{ text: { content: entry.content } }],
        },
        日付: {
          date: { start: entry.date.toISOString().split('T')[0] },
        },
        気分タグ: {
          multi_select: [
            ...(entry.mood ? [{ name: entry.mood }] : []),
            ...entry.tags.map((tag) => ({ name: tag })),
          ],
        },
      },
    });
    return notionToEntry(response);
  } catch (error) {
    console.error('Failed to create entry:', error);
    throw new Error('Failed to create diary entry');
  }
}

// Fetch diary entries
export async function fetchEntries(): Promise<DiaryEntry[]> {
  const notion = getNotionClient();
  const env = validateEnv();

  try {
    const response = await notion.databases.query({
      database_id: env.VITE_NOTION_DATABASE_ID,
    });

    console.log('Full API Response:', response);

    if (!response.results || response.results.length === 0) {
      console.warn('No entries found in the database.');
      return [];
    }

    return response.results.map((page) => {
      try {
        return notionToEntry(page);
      } catch (error) {
        console.error('Failed to map entry:', page, error);
        throw error;
      }
    });
  } catch (error) {
    console.error('Failed to fetch entries:', error);
    throw error;
  }
}
// Update a diary entry
export async function updateEntry(
  id: string,
  entry: Partial<Omit<DiaryEntry, 'id'>>
): Promise<DiaryEntry> {
  const notion = getNotionClient();

  try {
    const response = await notion.pages.update({
      page_id: id,
      properties: {
        ...(entry.title !== undefined && {
          タイトル: {
            title: [{ text: { content: entry.title } }],
          },
        }),
        ...(entry.content !== undefined && {
          内容: {
            rich_text: [{ text: { content: entry.content } }],
          },
        }),
        ...(entry.date && {
          日付: {
            date: { start: entry.date.toISOString().split('T')[0] },
          },
        }),
        ...((entry.mood !== undefined || entry.tags !== undefined) && {
          気分タグ: {
            multi_select: [
              ...(entry.mood ? [{ name: entry.mood }] : []),
              ...(entry.tags?.map((tag) => ({ name: tag })) || []),
            ],
          },
        }),
      },
    });
    return notionToEntry(response);
  } catch (error) {
    console.error('Failed to update entry:', error);
    throw new Error('Failed to update diary entry');
  }
}

// Delete (archive) a diary entry
export async function deleteEntry(id: string): Promise<void> {
  const notion = getNotionClient();

  try {
    await notion.pages.update({
      page_id: id,
      archived: true,
    });
  } catch (error) {
    console.error('Failed to delete entry:', error);
    throw new Error('Failed to delete diary entry');
  }
}