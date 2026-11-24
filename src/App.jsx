import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CreateKrathongCard from './components/CreateKrathongCard';
import KrathongScanModal from './components/KrathongScanModal';
import KrathongDetailModal from './components/KrathongDetailModal';
import MyKrathongsDrawer from './components/MyKrathongsDrawer';
import SettingsModal from './components/SettingsModal';
import River3DCanvas from './components/River3DCanvas';
import { socketService } from './utils/socket';
import { Sparkles, PlusCircle, X, ChevronUp, ChevronDown } from 'lucide-react';

export default function App() {
  const [krathongs, setKrathongs] = useState([]);
  const [myKrathongs, setMyKrathongs] = useState([]);
  const [selectedKrathong, setSelectedKrathong] = useState(null);
  const [focusKrathongId, setFocusKrathongId] = useState(null);

  // Modals & Drawers state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isMyKrathongsOpen, setIsMyKrathongsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [mobileFormOpen, setMobileFormOpen] = useState(true);

  // Custom 3D Scanned Krathong Data
  const [scannedData, setScannedData] = useState(null);
  const [isFloating, setIsFloating] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [graphicsQuality, setGraphicsQuality] = useState('high');

  // Room management for private links
  const [currentRoom, setCurrentRoom] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return (params.get('room') || 'default').toLowerCase().trim();
  });

  // Real-time floating notification
  const [toastNotification, setToastNotification] = useState(null);

  // Load initial Krathongs from API
  useEffect(() => {
    const fetchKrathongs = async () => {
      try {
        const res = await fetch(`/api/krathongs?room=${currentRoom}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setKrathongs(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch krathongs:', err);
      }
    };

    fetchKrathongs();

    // Socket.io Real-time listeners
    socketService.joinRoom(currentRoom);

    const unsubNew = socketService.onNewKrathong((newKrathong) => {
      setKrathongs((prev) => {
        // Prevent duplicate
        if (prev.some((k) => k.krathong_id === newKrathong.krathong_id)) return prev;
        return [newKrathong, ...prev];
      });

      // Show real-time notification
      setToastNotification(`คุณ ${newKrathong.sender_name} เพิ่งลอยกระทงลงสู่สายน้ำ ✨`);
      setTimeout(() => setToastNotification(null), 4000);
    });

    const unsubLiked = socketService.onKrathongLiked(({ krathong_id, likes }) => {
      setKrathongs((prev) =>
        prev.map((k) => (k.krathong_id === krathong_id ? { ...k, likes } : k))
      );
      setMyKrathongs((prev) =>
        prev.map((k) => (k.krathong_id === krathong_id ? { ...k, likes } : k))
      );
    });

    return () => {
      unsubNew();
      unsubLiked();
    };
  }, [currentRoom]);

  // Handle Floating a new Krathong
  const handleFloatKrathong = async (formData) => {
    setIsFloating(true);
    try {
      const res = await fetch('/api/krathongs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          room: currentRoom
        })
      });
      const result = await res.json();

      if (result.success && result.data) {
        const created = result.data;
        setMyKrathongs((prev) => [created, ...prev]);
        setFocusKrathongId(created.krathong_id);

        // Hide mobile form to show 3D river animation
        if (window.innerWidth < 768) {
          setMobileFormOpen(false);
        }

        // Clear scanned model after float
        setScannedData(null);
      }
    } catch (err) {
      console.error('Failed to float krathong:', err);
    } finally {
      setIsFloating(false);
    }
  };

  // Handle Like/Bless Krathong
  const handleLikeKrathong = async (id) => {
    try {
      await fetch(`/api/krathongs/${id}/like`, { method: 'POST' });
    } catch (err) {
      console.error('Failed to like krathong:', err);
    }
  };

  // Switch Room (Private Links)
  const handleSwitchRoom = (roomName) => {
    const clean = (roomName || 'default').toLowerCase().trim();
    setCurrentRoom(clean);
    const newUrl = `${window.location.origin}${window.location.pathname}?room=${clean}`;
    window.history.pushState({}, '', newUrl);
    setIsSettingsOpen(false);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-midnight-950 font-thai text-slate-100 select-none">
      {/* 3D River Canvas Layer (Background) */}
      <River3DCanvas
        krathongs={krathongs}
        onSelectKrathong={(k) => setSelectedKrathong(k)}
        focusKrathongId={focusKrathongId}
        graphicsQuality={graphicsQuality}
      />

      {/* Floating Header UI */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenMyKrathongs={() => setIsMyKrathongsOpen(true)}
        myKrathongsCount={myKrathongs.length}
        onOpenSettings={() => setIsSettingsOpen(true)}
        currentRoom={currentRoom}
      />

      {/* Real-time Toast Notification */}
      {toastNotification && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-40 bg-midnight-900/90 backdrop-blur-md border border-gold-500/40 text-amber-200 text-xs md:text-sm px-4 py-2 rounded-full shadow-2xl flex items-center space-x-2 animate-in fade-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4 text-gold-400 animate-spin" />
          <span>{toastNotification}</span>
        </div>
      )}

      {/* Main UI Container: Responsive Layout matching Laptop, Tablet, Smartphone */}
      <main className="fixed inset-0 pointer-events-none pt-20 pb-4 px-4 md:px-8 flex flex-col md:flex-row items-start justify-between z-10">
        {/* Left Side: Create Krathong Card (Desktop/Tablet/Mobile collapsible) */}
        <div className="pointer-events-auto w-full md:w-auto flex flex-col items-start">
          {/* Mobile Collapse/Expand Toggle Button */}
          <div className="md:hidden w-full flex justify-between items-center mb-2">
            <button
              onClick={() => setMobileFormOpen(!mobileFormOpen)}
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-midnight-900/80 backdrop-blur-md border border-gold-500/30 text-xs text-gold-300 shadow-lg"
            >
              <span>{mobileFormOpen ? 'ซ่อนแบบฟอร์มลอยกระทง' : '✨ เปิดแบบฟอร์มลอยกระทง'}</span>
              {mobileFormOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className={`${mobileFormOpen ? 'block' : 'hidden'} md:block w-full max-w-sm max-h-[calc(100vh-120px)] overflow-y-auto pr-1`}>
            <CreateKrathongCard
              onFloatKrathong={handleFloatKrathong}
              onOpenScanner={() => setIsScannerOpen(true)}
              scannedData={scannedData}
              onClearScannedData={() => setScannedData(null)}
              isFloating={isFloating}
            />
          </div>
        </div>
      </main>

      {/* Modals & Drawers */}
      <KrathongScanModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSaveScannedKrathong={(data) => {
          setScannedData(data);
          setIsScannerOpen(false);
        }}
      />

      <KrathongDetailModal
        krathong={selectedKrathong}
        onClose={() => setSelectedKrathong(null)}
        onLike={handleLikeKrathong}
      />

      <MyKrathongsDrawer
        isOpen={isMyKrathongsOpen}
        onClose={() => setIsMyKrathongsOpen(false)}
        krathongs={myKrathongs}
        onFocusKrathong={(k) => {
          setFocusKrathongId(k.krathong_id);
          setSelectedKrathong(k);
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentRoom={currentRoom}
        onSwitchRoom={handleSwitchRoom}
        graphicsQuality={graphicsQuality}
        onSetGraphicsQuality={setGraphicsQuality}
      />
    </div>
  );
}
