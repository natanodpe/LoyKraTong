import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.currentRoom = 'default';
  }

  init() {
    if (this.socket) return this.socket;

    // Use current origin if same host, or fallback
    const socketUrl = window.location.port === '5173'
      ? 'http://localhost:3000'
      : window.location.origin;

    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('⚡ Connected to Loy Krathong Realtime Server');
      if (this.currentRoom) {
        this.socket.emit('join_room', this.currentRoom);
      }
    });

    return this.socket;
  }

  joinRoom(room) {
    this.currentRoom = (room || 'default').toLowerCase().trim();
    if (this.socket && this.socket.connected) {
      this.socket.emit('join_room', this.currentRoom);
    }
  }

  onNewKrathong(callback) {
    this.init();
    this.socket.on('new_krathong', callback);
    return () => this.socket.off('new_krathong', callback);
  }

  onKrathongLiked(callback) {
    this.init();
    this.socket.on('krathong_liked', callback);
    return () => this.socket.off('krathong_liked', callback);
  }

  onUserCount(callback) {
    this.init();
    this.socket.on('user_count', callback);
    return () => this.socket.off('user_count', callback);
  }

  floatKrathong(krathongData) {
    this.init();
    this.socket.emit('float_krathong', {
      ...krathongData,
      room: this.currentRoom
    });
  }
}

export const socketService = new SocketService();
