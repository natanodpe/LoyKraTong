import React from 'react';
import { X, Sparkles, MapPin, Eye, Heart, Compass } from 'lucide-react';

export default function MyKrathongsDrawer({ isOpen, onClose, krathongs, onFocusKrathong }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm glass-panel p-5 border-l border-gold-500/30 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gold-500/20 text-gold-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold font-display text-slate-100">
              My Krathong
            </h3>
            <p className="text-[11px] text-slate-400 font-light">
              กระทงที่คุณลอยในสายน้ำ ({krathongs.length})
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {krathongs.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-xs">
            <div className="text-3xl mb-3">🪷</div>
            <p>คุณยังไม่ได้ลอยกระทงในรอบนี้</p>
            <p className="text-[11px] text-slate-600 mt-1">
              สร้างกระทงและกด "ลอยกระทง" ทางด้านซ้ายเพื่อเริ่มต้น
            </p>
          </div>
        ) : (
          krathongs.map((k) => (
            <div
              key={k.krathong_id}
              className="bg-slate-900/70 border border-slate-800/80 hover:border-gold-500/30 rounded-2xl p-3.5 transition group"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-sm font-semibold text-slate-100 flex items-center space-x-1.5">
                    <span>{k.sender_name}</span>
                    <span className="text-[10px] text-gold-400 bg-gold-500/10 px-1.5 py-0.2 rounded">
                      {k.krathong_model_type === 'user_scanned' ? '3D Scan' : 'โมเดลมงคล'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-gold-500" />
                    <span className="truncate max-w-[180px]">{k.location_name}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-rose-400 text-xs">
                  <Heart className="w-3 h-3 fill-rose-500" />
                  <span>{k.likes || 0}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 font-light line-clamp-2 mb-3 bg-slate-950/40 p-2 rounded-xl">
                "{k.wish_message}"
              </p>

              <button
                onClick={() => {
                  onFocusKrathong(k);
                  onClose();
                }}
                className="w-full py-1.5 px-3 rounded-xl bg-gold-500/15 hover:bg-gold-500/25 border border-gold-500/30 text-gold-300 text-xs font-medium flex items-center justify-center space-x-1.5 transition"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>ซูมดูกระทงนี้ในสายน้ำ</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
