import React, { useState } from 'react';
import { X, Heart, MapPin, Sparkles, Clock, Share2 } from 'lucide-react';

export default function KrathongDetailModal({ krathong, onClose, onLike }) {
  const [hasLiked, setHasLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(krathong?.likes || 0);

  if (!krathong) return null;

  const handleLike = () => {
    if (!hasLiked) {
      setHasLiked(true);
      setLikeCount(prev => prev + 1);
      onLike(krathong.krathong_id);
    }
  };

  const formattedTime = (() => {
    try {
      const date = new Date(krathong.created_at);
      return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
    } catch {
      return 'เมื่อสักครู่';
    }
  })();

  const getStyleTitle = (type) => {
    switch (type) {
      case 'preset_a': return 'กระทงใบตองโบราณ';
      case 'preset_b': return 'กระทงดอกบัวสัตตบุษย์';
      case 'preset_c': return 'กระทงกะลามะพร้าว';
      case 'preset_d': return 'กระทงโคมทองมินิมอล';
      case 'user_scanned': return 'กระทง 3D จากกล้องสแกน';
      default: return 'กระทงมงคล';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/70 backdrop-blur-md animate-in fade-in">
      <div className="glass-panel rounded-3xl w-full max-w-md overflow-hidden border border-gold-500/30 p-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Sender Name & Badge */}
        <div className="flex items-start space-x-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-400 to-amber-600 flex items-center justify-center text-2xl shadow-lg shadow-gold-500/20">
            🪷
          </div>
          <div>
            <div className="text-lg font-bold font-display text-slate-100 flex items-center space-x-2">
              <span>{krathong.sender_name}</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
              <span className="text-gold-300 font-medium">{getStyleTitle(krathong.krathong_model_type)}</span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>{formattedTime}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Location Badge */}
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-700/60 text-xs text-amber-200/90 mb-4">
          <MapPin className="w-3.5 h-3.5 text-gold-400" />
          <span className="truncate max-w-[280px]">{krathong.location_name}</span>
        </div>

        {/* Wish Message */}
        <div className="bg-slate-900/70 rounded-2xl p-4 border border-slate-800/80 mb-5 relative">
          <div className="text-xs text-slate-400 mb-1 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>คำอวยพร & ขอขมาพระแม่คงคา</span>
          </div>
          <p className="text-sm md:text-base text-slate-100 font-light leading-relaxed whitespace-pre-wrap">
            "{krathong.wish_message}"
          </p>
        </div>

        {/* Action Buttons: Bless / Like */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition border ${
              hasLiked
                ? 'bg-rose-950/60 border-rose-500 text-rose-300'
                : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:text-rose-300 hover:border-rose-500/40'
            }`}
          >
            <Heart className={`w-4 h-4 ${hasLiked ? 'fill-rose-500 text-rose-500' : 'text-rose-400'}`} />
            <span>ร่วมอนุโมทนาบุญ</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-slate-800 text-[11px] font-bold">
              {likeCount}
            </span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl text-xs font-medium bg-slate-800/60 hover:bg-slate-800 text-slate-300 transition"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
