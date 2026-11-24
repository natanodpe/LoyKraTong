import React, { useState, useEffect } from 'react';
import { X, Volume2, Sparkles, Lock, Share2, Copy, Check } from 'lucide-react';
import { audioSystem } from '../utils/audio';

export default function SettingsModal({
  isOpen,
  onClose,
  currentRoom,
  onSwitchRoom,
  graphicsQuality,
  onSetGraphicsQuality
}) {
  const [volume, setVolume] = useState(0.6);
  const [inputRoom, setInputRoom] = useState(currentRoom || '');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setInputRoom(currentRoom || '');
  }, [currentRoom]);

  if (!isOpen) return null;

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioSystem.setVolume(val);
  };

  const handleRoomSubmit = (e) => {
    e.preventDefault();
    if (inputRoom.trim()) {
      onSwitchRoom(inputRoom.trim().toLowerCase());
    }
  };

  const handleCopyLink = () => {
    const cleanRoom = (inputRoom || 'default').trim().toLowerCase();
    const url = `${window.location.origin}${window.location.pathname}?room=${cleanRoom}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/70 backdrop-blur-md animate-in fade-in">
      <div className="glass-panel rounded-3xl w-full max-w-md overflow-hidden border border-gold-500/30 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-base font-bold font-display text-slate-100 flex items-center space-x-2">
            <span>การตั้งค่า (Settings)</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-5">
          {/* Audio Volume */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-300 flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-gold-400" />
                <span>ระดับเสียงดนตรีบรรเลง & สายน้ำ</span>
              </label>
              <span className="text-xs text-gold-300 font-mono">
                {Math.round(volume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full accent-gold-400 cursor-pointer"
            />
          </div>

          {/* Graphics Quality */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-gold-400" />
              <span>คุณภาพกราฟิก 3D (Graphics)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['high', 'medium', 'low'].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => onSetGraphicsQuality(q)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium capitalize border transition ${
                    graphicsQuality === q
                      ? 'bg-gold-500/20 border-gold-400 text-gold-300 shadow-sm'
                      : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {q === 'high' ? 'สูง (High)' : q === 'medium' ? 'ปานกลาง' : 'ประหยัด'}
                </button>
              ))}
            </div>
          </div>

          {/* Private Room / Access Link (SRS 2.1) */}
          <div className="pt-2 border-t border-slate-800">
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-gold-400" />
                <span>ห้องสายน้ำส่วนตัว (Private Room Link)</span>
              </span>
            </label>
            <p className="text-[11px] text-slate-400 mb-3">
              สร้างหรือเข้าร่วมห้องเฉพาะกลุ่มของคุณกับเพื่อนหรือครอบครัว ไม่แสดงต่อสาธารณะ
            </p>

            <form onSubmit={handleRoomSubmit} className="flex space-x-2">
              <input
                type="text"
                value={inputRoom}
                onChange={(e) => setInputRoom(e.target.value)}
                placeholder="เช่น family, party2026..."
                className="flex-1 bg-slate-900/80 border border-slate-700/80 focus:border-gold-400 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition"
              >
                เข้าห้อง
              </button>
            </form>

            <button
              type="button"
              onClick={handleCopyLink}
              className="mt-2.5 w-full py-2 px-3 rounded-xl bg-gold-500/10 hover:bg-gold-500/20 border border-gold-500/30 text-gold-300 text-xs font-medium flex items-center justify-center space-x-1.5 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'คัดลอกลิงก์ส่วนตัวเรียบร้อย!' : 'คัดลอกลิงก์ชวนเพื่อนเข้าห้องนี้'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
