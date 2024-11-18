import { Client } from '@notionhq/client';
import { z } from 'zod';

// --- 環境変数のバリデーション ---
const envSchema = z.object({
  VITE_NOTION_KEY: z.string(),
  VITE_NOTION_DATABASE_ID: z.string(),
});

const validateEnv = () => {
  const env = envSchema.parse(import.meta.env);
  return {
    VITE_NOTION_KEY: env.VITE_NOTION_KEY,
    VITE_NOTION_DATABASE_ID: env.VITE_NOTION_DATABASE_ID,
  };
};

// --- Notion クライアントの初期化 ---
const env = validateEnv();
const notionClient = new Client({ auth: env.VITE_NOTION_KEY });

// --- エラーハンドリングの共通処理 ---
const handleError = (action: string, error: unknown) => {
  console.error(`Failed to ${action}:`, error);
  throw new Error(`Failed to ${action}`);
};

// --- DiaryEntry 型定義 ---
export interface DiaryEntry {
  id: string;
  title?: string;
  content: string;
  date: Date;
  mood?: string;
}

// --- 共通関数: Notion ページから DiaryEntry へ変換 ---
const notionToEntry = (page: any): DiaryEntry => {
  const properties = page.properties || {};
  return {
    id: page.id,
    title: properties?.タイトル?.title?.[0]?.plain_text || 'Untitled',
    content: properties?.内容?.rich_text?.[0]?.plain_text || 'No content',
    date: new Date(properties?.日付?.date?.start || new Date()),
    mood: properties?.気分タグ?.multi_select?.[0]?.name || 'No mood',
  };
};

// --- 日記エントリを取得 ---
export const fetchEntries = async (): Promise<DiaryEntry[]> => {
  try {
    const response = await fetch('/api/notion-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sorts: [{ property: '日付', direction: 'descending' }],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error:', error);
      return [];
    }

    const data = await response.json();
    console.log('Notion Data:', data);
    return data.results.map(notionToEntry);
  } catch (error) {
    handleError('fetch entries', error);
    return [];
  }
};

// --- 新しい日記エントリを作成 ---
export const createEntry = async (entry: Omit<DiaryEntry, 'id'>): Promise<DiaryEntry | null> => {
  try {
    const response = await fetch('/api/notion-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'create',
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
            multi_select: entry.mood ? [{ name: entry.mood }] : [],
          },
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error creating entry:', error);
      return null;
    }

    const data = await response.json();
    return notionToEntry(data);
  } catch (error) {
    handleError('create entry', error);
    return null;
  }
};

// --- 日記エントリを更新 ---
export const updateEntry = async (
  id: string,
  entry: Partial<Omit<DiaryEntry, 'id'>>
): Promise<DiaryEntry | null> => {
  try {
    const response = await fetch('/api/notion-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'update',
        page_id: id,
        properties: {
          ...(entry.title && { タイトル: { title: [{ text: { content: entry.title } }] } }),
          ...(entry.content && { 内容: { rich_text: [{ text: { content: entry.content } }] } }),
          ...(entry.date && { 日付: { date: { start: entry.date.toISOString().split('T')[0] } } }),
          ...(entry.mood && { 気分タグ: { multi_select: [{ name: entry.mood }] } }),
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error updating entry:', error);
      return null;
    }

    const data = await response.json();
    return notionToEntry(data);
  } catch (error) {
    handleError('update entry', error);
    return null;
  }
};

// --- 日記エントリを削除 (アーカイブ) ---
export const deleteEntry = async (id: string): Promise<void> => {
  try {
    const response = await fetch('/api/notion-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'delete',
        page_id: id,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error deleting entry:', error);
      return;
    }

    console.log(`Entry with ID ${id} successfully deleted.`);
  } catch (error) {
    handleError('delete entry', error);
  }
};