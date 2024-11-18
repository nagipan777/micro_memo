const express = require('express');
const { Client } = require('@notionhq/client');

const app = express();
const notion = new Client({ auth: process.env.NOTION_API_KEY });

app.use(express.json());

app.post('/api/query-database', async (req, res) => {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
    });
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 5173;
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});