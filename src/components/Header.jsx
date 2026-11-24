import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music, Home, Sparkles, Settings, Share2, Menu, X } from 'lucide-react';
import { audioSystem } from '../utils/audio';

export default function Header({
  activeTab,
  setActiveTab,
  onOpenMyKrathongs,
  myKrathongsCount,
  onOpenSettings,
  currentRoom
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = audioSystem.subscribe((state) => {
      setIsPlaying(state.isPlaying);
      setIsMuted(state.volume === 0);
    });
    return unsubscribe;
  }, []);

  const handleToggleMusic = () => {
    audioSystem.toggle();
  };

  const handleShareRoom = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-4 py-3 md:px-8 flex items-center justify-between pointer-events-none">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-3 pointer-events-auto">
        <div className="relative group cursor-pointer flex items-center space-x-2.5 bg-midnight-900/60 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-gold-500/20 hover:border-gold-500/40 transition">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-400 to-amber-700 flex items-center justify-center shadow-lg shadow-gold-500/20">
            <span className="text-xl">🪷</span>
          </div>
          <div>
            <div className="text-sm md:text-base font-bold tracking-wide bg-gradient-to-r from-amber-200 via-gold-300 to-amber-400 bg-clip-text text-transparent font-display">
              Loy Krathong Digital
            </div>
            <div className="text-[10px] text-slate-400 flex items-center space-x-1.5">
              <span>ลอยกระทงออนไลน์</span>
              {currentRoom !== 'default' && (
                <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono text-[9px] border border-amber-500/30">
                  #{currentRoom}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Share Link Pill */}
        <button
          onClick={handleShareRoom}
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-midnight-900/50 backdrop-blur-md border border-slate-700/60 text-xs text-slate-300 hover:text-gold-300 hover:border-gold-500/40 transition pointer-events-auto"
          title="คัดลอกลิงก์ห้องนี้เพื่อชวนเพื่อนมาลอยด้วยกัน"
        >
          <Share2 className="w-3.5 h-3.5 text-gold-400" />
          <span>{copied ? 'คัดลอกลิงก์แล้ว! ✨' : 'แชร์ห้อง'}</span>
        </button>
      </div>

      {/* Center/Right Nav Controls */}
      <div className="flex items-center space-x-2.5 pointer-events-auto">
        {/* Loy Krathong Song Player Pill (Matching Screenshot Top Right) */}
        <div
          onClick={handleToggleMusic}
          className={`flex items-center space-x-2.5 px-3 py-1.5 md:px-4 md:py-2 rounded-full cursor-pointer transition border backdrop-blur-md ${
            isPlaying
              ? 'bg-amber-950/60 border-gold-500/40 shadow-lg shadow-gold-500/10 text-amber-200'
              : 'bg-midnight-900/60 border-slate-700/60 text-slate-300 hover:text-gold-300 hover:border-gold-500/30'
          }`}
          title={isPlaying ? 'คลิกเพื่อหยุดเพลง' : 'คลิกเพื่อเปิดเพลงบรรเลงลอยกระทง'}
        >
          {isPlaying ? (
            <div className="flex items-center space-x-0.5 h-3.5">
              <span className="w-0.5 bg-gold-400 rounded-full animate-pulse h-3"></span>
              <span className="w-0.5 bg-gold-300 rounded-full animate-pulse h-4" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-0.5 bg-gold-400 rounded-full animate-pulse h-2.5" style={{ animationDelay: '0.4s' }}></span>
            </div>
          ) : (
            <Music className="w-3.5 h-3.5 text-slate-400" />
          )}

          <div className="text-xs font-medium flex items-center space-x-1.5">
            <span className="hidden sm:inline text-slate-400">Playing:</span>
            <span className="text-gold-300 font-medium">Loy Krathong Song 🎵</span>
          </div>

          <div className="text-slate-400 hover:text-gold-300">
            {isPlaying ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 bg-midnight-900/60 backdrop-blur-md px-2 py-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition ${
              activeTab === 'home'
                ? 'bg-gold-500/20 text-gold-300 border border-gold-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          <button
            onClick={onOpenMyKrathongs}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/40 transition relative"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>My Krathong</span>
            {myKrathongsCount > 0 && (
              <span className="bg-gold-500 text-midnight-950 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                {myKrathongsCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/40 transition"
            title="การตั้งค่า"
          >
            <Settings className="w-4 h-4" />
          </button>
        </nav>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center space-x-1">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-midnight-900/60 backdrop-blur-md border border-slate-700/60 text-slate-300 hover:text-gold-300"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-16 right-4 w-60 bg-midnight-900/95 backdrop-blur-xl border border-gold-500/20 rounded-2xl p-3 shadow-2xl flex flex-col space-y-1.5 pointer-events-auto md:hidden animate-in fade-in slide-in-from-top-2">
          <button
            onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
            className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-slate-800"
          >
            <Home className="w-4 h-4 text-gold-400" />
            <span>Home</span>
          </button>
          <button
            onClick={() => { onOpenMyKrathongs(); setMobileMenuOpen(false); }}
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-slate-800"
          >
            <div className="flex items-center space-x-2.5">
              <Sparkles className="w-4 h-4 text-gold-400" />
              <span>My Krathong</span>
            </div>
            {myKrathongsCount > 0 && (
              <span className="bg-gold-500 text-midnight-950 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                {myKrathongsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => { onOpenSettings(); setMobileMenuOpen(false); }}
            className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-slate-800"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings</span>
          </button>
        </div>
      )}
    </header>
  );
}
