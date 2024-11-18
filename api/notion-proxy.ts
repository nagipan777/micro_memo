export default async function handler(req, res) {
    const response = await fetch('https://api.notion.com/v1/databases/YOUR_DATABASE_ID/query', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer YOUR_NOTION_API_KEY`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify(req.body),
    });
  
    const data = await response.json();
    res.status(200).json(data);
  }