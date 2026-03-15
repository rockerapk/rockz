const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const JWT_SECRET = process.env.JWT_SECRET || 'rockz-secret-key';
const PORT = process.env.PORT || 3000;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('\n❌ Missing SUPABASE_URL or SUPABASE_KEY environment variables!');
  console.error('   See GLITCH_DEPLOY.md for setup instructions.\n');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// ── Auth middleware ───────────────────────────────────────
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Invalid token' }); }
}

// ── Register ──────────────────────────────────────────────
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  if (username.length < 3) return res.status(400).json({ error: 'Username must be at least 3 characters' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return res.status(400).json({ error: 'Only letters, numbers, underscores allowed' });

  const { data: existing } = await supabase.from('users').select('id').eq('username', username).single();
  if (existing) return res.status(409).json({ error: 'Username already taken' });

  const hash = bcrypt.hashSync(password, 10);
  const { error } = await supabase.from('users').insert({ username, password: hash });
  if (error) return res.status(500).json({ error: 'Could not create account' });

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, username });
});

// ── Login ─────────────────────────────────────────────────
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const { data: user } = await supabase.from('users').select('*').eq('username', username).single();
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Invalid username or password' });
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, username });
});

// ── Users ─────────────────────────────────────────────────
app.get('/api/users', authMiddleware, async (req, res) => {
  const { data } = await supabase.from('users').select('username').order('username');
  res.json((data || []).map(u => u.username));
});

// ── Messages ──────────────────────────────────────────────
app.get('/api/messages/:other', authMiddleware, async (req, res) => {
  const { username } = req.user;
  const { other } = req.params;
  const { data } = await supabase
    .from('messages')
    .select('*')
    .or(`and(from_user.eq.${username},to_user.eq.${other}),and(from_user.eq.${other},to_user.eq.${username})`)
    .order('id', { ascending: true });
  res.json(data || []);
});

// ── Sockets ───────────────────────────────────────────────
const onlineUsers = new Map();

io.use((socket, next) => {
  try {
    socket.username = jwt.verify(socket.handshake.auth.token, JWT_SECRET).username;
    next();
  } catch { next(new Error('Unauthorized')); }
});

io.on('connection', (socket) => {
  console.log('+ ' + socket.username);
  onlineUsers.set(socket.username, socket.id);
  io.emit('online_users', Array.from(onlineUsers.keys()));

  socket.on('send_message', async ({ to, content }) => {
    if (!content?.trim()) return;
    const now = new Date().toISOString();
    const msg = { from_user: socket.username, to_user: to, content: content.trim(), created_at: now };
    await supabase.from('messages').insert(msg);
    const rid = onlineUsers.get(to);
    if (rid) io.to(rid).emit('receive_message', msg);
    socket.emit('receive_message', msg);
  });

  socket.on('typing', ({ to, isTyping }) => {
    const rid = onlineUsers.get(to);
    if (rid) io.to(rid).emit('user_typing', { from: socket.username, isTyping });
  });

  socket.on('call_user',     ({ to, offer, callType }) => { const r=onlineUsers.get(to); r ? io.to(r).emit('incoming_call',{from:socket.username,offer,callType}) : socket.emit('call_failed',{reason:to+' is offline'}); });
  socket.on('call_answer',   ({ to, answer })          => { const r=onlineUsers.get(to); if(r) io.to(r).emit('call_answered',{answer}); });
  socket.on('call_rejected', ({ to })                   => { const r=onlineUsers.get(to); if(r) io.to(r).emit('call_rejected'); });
  socket.on('ice_candidate', ({ to, candidate })        => { const r=onlineUsers.get(to); if(r) io.to(r).emit('ice_candidate',{candidate}); });
  socket.on('end_call',      ({ to })                   => { const r=onlineUsers.get(to); if(r) io.to(r).emit('call_ended'); });

  socket.on('disconnect', () => {
    console.log('- ' + socket.username);
    onlineUsers.delete(socket.username);
    io.emit('online_users', Array.from(onlineUsers.keys()));
  });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));

server.listen(PORT, '0.0.0.0', () => {
  console.log('\n✅ Rockz running on port ' + PORT + '\n');
});
