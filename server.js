import express from 'express';
import sqlite3 from 'sqlite3';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

const db = new sqlite3.Database(':memory:');
db.serialize(() => {
  db.run(`CREATE TABLE sites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            domain TEXT,
            da INTEGER,
            traffic INTEGER,
            niche TEXT,
            price INTEGER
          )`);
  const stmt = db.prepare("INSERT INTO sites (domain, da, traffic, niche, price) VALUES (?, ?, ?, ?, ?)");
  [
    ["techblog.com", 45, 12000, "tech", 120],
    ["healthhub.net", 60, 25000, "health", 240],
    ["lifestyle.io", 35, 8000, "lifestyle", 90]
  ].forEach(row => stmt.run(row));
  stmt.finalize();
});

app.get('/', (_, res) => res.render('index'));
app.get('/inventory', (_, res) => {
  db.all("SELECT * FROM sites", (err, rows) => res.json(rows));
});
app.post('/order', (req, res) => {
  const { domain, anchor, url } = req.body;
  res.json({ message: `Order placed for ${domain}: ${anchor} → ${url}` });
});

app.listen(PORT, () => console.log(`App live at http://localhost:${PORT}`));
