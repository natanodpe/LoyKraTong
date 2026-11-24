import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'krathongs.json');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Ensure data folder & file exist
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

function loadKrathongs() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading krathongs:', err);
  }
  return [];
}

function saveKrathongs(krathongs) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(krathongs, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving krathongs:', err);
  }
}

let krathongs = loadKrathongs();

// API Endpoints
app.get('/api/krathongs', (req, res) => {
  const room = (req.query.room || 'default').toString().trim().toLowerCase();
  // Filter by room, or if private room has no items yet, show empty or room's own items
  const roomKrathongs = krathongs.filter(k => (k.room || 'default').toLowerCase() === room);
  res.json({
    success: true,
    room,
    total: roomKrathongs.length,
    data: roomKrathongs
  });
});

app.post('/api/krathongs', (req, res) => {
  const {
    sender_name,
    wish_message,
    location_type = 'preset',
    location_name = 'แม่น้ำเจ้าพระยา',
    krathong_model_type = 'preset_a',
    color = '#15803d',
    scanned_texture = null,
    room = 'default'
  } = req.body;

  if (!sender_name || !wish_message) {
    return res.status(400).json({ success: false, error: 'กรุณากรอกชื่อและคำอวยพร' });
  }

  const roomClean = (room || 'default').toString().trim().toLowerCase();

  // Create new Krathong item matching SRS Section 5 Data Model Structure
  const newKrathong = {
    krathong_id: 'k-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    sender_name: sender_name.slice(0, 50),
    wish_message: wish_message.slice(0, 150),
    location_type,
    location_name: location_name.slice(0, 100),
    krathong_model_type,
    color,
    scanned_texture: scanned_texture || null,
    created_at: new Date().toISOString(),
    likes: 0,
    position: {
      x: (Math.random() - 0.5) * 8, // Near center river spawn
      y: 0,
      z: -4 - Math.random() * 3
    },
    speed: 0.05 + Math.random() * 0.05,
    room: roomClean
  };

  krathongs.unshift(newKrathong);
  // Keep up to 300 krathongs
  if (krathongs.length > 300) {
    krathongs = krathongs.slice(0, 300);
  }
  saveKrathongs(krathongs);

  // Broadcast to all clients in the room via Socket.io
  io.to(roomClean).emit('new_krathong', newKrathong);

  res.status(201).json({
    success: true,
    data: newKrathong
  });
});

app.post('/api/krathongs/:id/like', (req, res) => {
  const { id } = req.params;
  const target = krathongs.find(k => k.krathong_id === id);
  if (!target) {
    return res.status(404).json({ success: false, error: 'Krathong not found' });
  }

  target.likes = (target.likes || 0) + 1;
  saveKrathongs(krathongs);

  const room = (target.room || 'default').toLowerCase();
  io.to(room).emit('krathong_liked', {
    krathong_id: id,
    likes: target.likes
  });

  res.json({
    success: true,
    krathong_id: id,
    likes: target.likes
  });
});

// Socket.io Real-time connection handler
io.on('connection', (socket) => {
  let currentRoom = 'default';

  socket.on('join_room', (roomName) => {
    const room = (roomName || 'default').toString().trim().toLowerCase();
    socket.leave(currentRoom);
    socket.join(room);
    currentRoom = room;

    const count = io.sockets.adapter.rooms.get(room)?.size || 1;
    io.to(room).emit('user_count', { count, room });
  });

  socket.on('float_krathong', (data) => {
    const room = (data.room || currentRoom || 'default').toLowerCase();
    io.to(room).emit('new_krathong', data);
  });

  socket.on('disconnect', () => {
    const count = io.sockets.adapter.rooms.get(currentRoom)?.size || 0;
    io.to(currentRoom).emit('user_count', { count, room: currentRoom });
  });
});

// Serve frontend dist if available (Production build)
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

server.listen(PORT, () => {
  console.log(`✨ Loy Krathong Digital Server running on http://localhost:${PORT}`);
});
