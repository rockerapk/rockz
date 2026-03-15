const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const JWT_SECRET = process.env.JWT_SECRET || 'rockz-secret-change-me';
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'chat.db');

let db;

async function initDB() {
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    db = new SQL.Database();
  }
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_user TEXT NOT NULL,
      to_user TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
  saveDB();
}

function saveDB() {
  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
}

function dbGet(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const row = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  return row;
}

function dbAll(sql, params = []) {
  const results = [];
  const stmt = db.prepare(sql);
  stmt.bind(params);
  while (stmt.step()) results.push(stmt.getAsObject());
  stmt.free();
  return results;
}

function dbRun(sql, params = []) {
  db.run(sql, params);
  saveDB();
}

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// ── Register ──────────────────────────────────────────────
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username and password required' });
  if (username.length < 3)
    return res.status(400).json({ error: 'Username must be at least 3 characters' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  if (!/^[a-zA-Z0-9_]+$/.test(username))
    return res.status(400).json({ error: 'Username: letters, numbers, underscores only' });
  if (dbGet('SELECT id FROM users WHERE username = ?', [username]))
    return res.status(409).json({ error: 'Username already taken' });

  const hash = bcrypt.hashSync(password, 10);
  dbRun('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash]);
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, username });
});

// ── Login ─────────────────────────────────────────────────
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = dbGet('SELECT * FROM users WHERE username = ?', [username]);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Invalid username or password' });
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, username });
});

// ── Auth middleware ───────────────────────────────────────
function auth(req, res, next) {
  const token = (req.headers.authorization || '').split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Invalid token' }); }
}

// ── Users list ────────────────────────────────────────────
app.get('/api/users', auth, (req, res) => {
  res.json(dbAll('SELECT username FROM users ORDER BY username').map(u => u.username));
});

// ── Message history ───────────────────────────────────────
app.get('/api/messages/:other', auth, (req, res) => {
  const { username } = req.user;
  const { other } = req.params;
  res.json(dbAll(
    `SELECT * FROM messages
     WHERE (from_user=? AND to_user=?) OR (from_user=? AND to_user=?)
     ORDER BY id ASC`,
    [username, other, other, username]
  ));
});

// ── Socket.io ─────────────────────────────────────────────
const onlineUsers = new Map();

io.use((socket, next) => {
  try {
    const payload = jwt.verify(socket.handshake.auth.token, JWT_SECRET);
    socket.username = payload.username;
    next();
  } catch { next(new Error('Invalid token')); }
});

io.on('connection', (socket) => {
  console.log('[+] ' + socket.username);
  onlineUsers.set(socket.username, socket.id);
  io.emit('online_users', Array.from(onlineUsers.keys()));

  socket.on('send_message', ({ to, content }) => {
    if (!content?.trim()) return;
    const now = new Date().toISOString();
    const msg = { from_user: socket.username, to_user: to, content: content.trim(), created_at: now };
    dbRun('INSERT INTO messages (from_user,to_user,content,created_at) VALUES (?,?,?,?)',
      [msg.from_user, msg.to_user, msg.content, now]);
    const dest = onlineUsers.get(to);
    if (dest) io.to(dest).emit('receive_message', msg);
    socket.emit('receive_message', msg);
  });

  socket.on('typing', ({ to, isTyping }) => {
    const dest = onlineUsers.get(to);
    if (dest) io.to(dest).emit('user_typing', { from: socket.username, isTyping });
  });

  socket.on('call_user', ({ to, offer, callType }) => {
    const dest = onlineUsers.get(to);
    if (dest) io.to(dest).emit('incoming_call', { from: socket.username, offer, callType });
    else socket.emit('call_failed', { reason: to + ' is offline' });
  });

  socket.on('call_answer',   ({ to, answer })    => { const d=onlineUsers.get(to); if(d) io.to(d).emit('call_answered', { answer }); });
  socket.on('call_rejected', ({ to })             => { const d=onlineUsers.get(to); if(d) io.to(d).emit('call_rejected'); });
  socket.on('ice_candidate', ({ to, candidate }) => { const d=onlineUsers.get(to); if(d) io.to(d).emit('ice_candidate', { candidate }); });
  socket.on('end_call',      ({ to })             => { const d=onlineUsers.get(to); if(d) io.to(d).emit('call_ended'); });

  socket.on('disconnect', () => {
    console.log('[-] ' + socket.username);
    onlineUsers.delete(socket.username);
    io.emit('online_users', Array.from(onlineUsers.keys()));
  });
});

app.get('*', (_, res) => res.sendFile(path.join(__dirname, '../public/index.html')));

initDB().then(() => {
  server.listen(PORT, '0.0.0.0', () => {
    console.log('Rockz running on port ' + PORT);
  });
});
