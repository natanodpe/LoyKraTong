import React, { useState } from 'react';
import { Camera, Sparkles, MapPin, Send, HelpCircle, Palette } from 'lucide-react';
import confetti from 'canvas-confetti';

const PRESET_LOCATIONS = [
  'แม่น้ำเจ้าพระยา (หน้าวัดอรุณฯ - กรุงเทพฯ)',
  'ยอดอ่าวเชียงใหม่ (ริมแม่น้ำปิง)',
  'อุทยานประวัติศาสตร์สุโขทัย',
  'สระน้ำจุฬาลงกรณ์มหาวิทยาลัย',
  'บึงพลาญชัย ร้อยเอ็ด',
  'ระบุสถานที่เอง (Specify Own)'
];

const KRATHONG_STYLES = [
  { id: 'preset_a', label: 'A', name: 'กระทงใบตองโบราณ', desc: 'ใบตองพับจีบ & ดาวเรือง', defaultColor: '#15803d' },
  { id: 'preset_b', label: 'B', name: 'กระทงดอกบัวสัตตบุษย์', desc: 'กลีบบัวซ้อน 3 ชั้น', defaultColor: '#ec4899' },
  { id: 'preset_c', label: 'C', name: 'กระทงกะลามะพร้าว', desc: 'กะลาธรรมชาติ & กล้วยไม้', defaultColor: '#d97706' },
  { id: 'preset_d', label: 'D', name: 'กระทงโคมทองมินิมอล', desc: 'โคมแสงประทีปสว่างไสว', defaultColor: '#eab308' }
];

const WISH_INSPIRATIONS = [
  'ขอขมาพระแม่คงคา สุขภาพแข็งแรง มีแต่สิ่งดีๆ',
  'ปล่อยวางเรื่องร้าย ลอยไปกับสายน้ำ เริ่มต้นชีวิตใหม่',
  'ขอให้ความรักยั่งยืน ครอบครัวอบอุ่น มีความสุขตลอดปี',
  'ขอให้การงานราบรื่น สำเร็จสมหวังทุกประการ'
];

export default function CreateKrathongCard({
  onFloatKrathong,
  onOpenScanner,
  scannedData,
  onClearScannedData,
  isFloating
}) {
  const [senderName, setSenderName] = useState('');
  const [locationChoice, setLocationChoice] = useState(PRESET_LOCATIONS[0]);
  const [customLocation, setCustomLocation] = useState('');
  const [wishMessage, setWishMessage] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('preset_a');
  const [customColor, setCustomColor] = useState('#15803d');
  const [errorMsg, setErrorMsg] = useState('');

  const handleStyleChange = (style) => {
    setSelectedStyle(style.id);
    setCustomColor(style.defaultColor);
  };

  const handleSelectWish = (prompt) => {
    setWishMessage(prompt);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!senderName.trim()) {
      setErrorMsg('กรุณากรอกชื่อผู้ลอย');
      return;
    }
    if (!wishMessage.trim()) {
      setErrorMsg('กรุณากรอกคำอวยพรหรือข้อความขอขมา');
      return;
    }

    const finalLocation = locationChoice.includes('Specify Own')
      ? (customLocation.trim() || 'แม่น้ำแห่งความทรงจำ')
      : locationChoice;

    setErrorMsg('');

    // Trigger celebration sparkles
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.8 },
      colors: ['#fde047', '#f59e0b', '#d97706', '#ec4899']
    });

    onFloatKrathong({
      sender_name: senderName.trim(),
      wish_message: wishMessage.trim(),
      location_type: locationChoice.includes('Specify Own') ? 'custom' : 'preset',
      location_name: finalLocation,
      krathong_model_type: scannedData ? 'user_scanned' : selectedStyle,
      color: customColor,
      scanned_texture: scannedData ? scannedData.textureUrl : null
    });
  };

  return (
    <div className="glass-panel rounded-3xl p-5 md:p-6 text-slate-100 max-w-sm w-full transition-all duration-300">
      {/* Title */}
      <div className="mb-4">
        <h2 className="text-xl md:text-2xl font-bold font-display bg-gradient-to-r from-amber-200 via-gold-300 to-amber-400 bg-clip-text text-transparent flex items-center space-x-2">
          <span>Create Krathong</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5 font-light">
          ลอยกระทงออนไลน์ของคุณ
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* ชื่อผู้ลอย */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
            <span>ชื่อผู้ลอย</span>
            <span className="text-[10px] text-slate-400">Sender Name</span>
          </label>
          <input
            type="text"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="เช่น อาร์ม, ณภัทร, ครอบครัวใจดี..."
            maxLength={40}
            className="w-full bg-slate-900/70 border border-slate-700/80 focus:border-gold-400 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-gold-400 transition"
          />
        </div>

        {/* สถานที่ลอย */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-gold-400" />
              <span>สถานที่ลอย</span>
            </span>
            <span className="text-[10px] text-slate-400">- Choose</span>
          </label>
          <select
            value={locationChoice}
            onChange={(e) => setLocationChoice(e.target.value)}
            className="w-full bg-slate-900/70 border border-slate-700/80 focus:border-gold-400 rounded-xl px-3 py-2 text-xs md:text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-gold-400 transition cursor-pointer"
          >
            {PRESET_LOCATIONS.map((loc) => (
              <option key={loc} value={loc} className="bg-slate-900 text-slate-200">
                {loc}
              </option>
            ))}
          </select>

          {locationChoice.includes('Specify Own') && (
            <input
              type="text"
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              placeholder="พิมพ์ชื่อสถานที่ของคุณ..."
              maxLength={50}
              className="mt-2 w-full bg-slate-900/70 border border-slate-700/80 focus:border-gold-400 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
            />
          )}
        </div>

        {/* คำอวยพร */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-slate-300">คำอวยพร / ขอขมา</label>
            <span className={`text-[10px] ${wishMessage.length >= 140 ? 'text-amber-400' : 'text-slate-400'}`}>
              {wishMessage.length} / 150
            </span>
          </div>
          <textarea
            value={wishMessage}
            onChange={(e) => setWishMessage(e.target.value)}
            placeholder="ขอขมาพระแม่คงคา และขอพรเพื่อความเป็นสิริมงคล..."
            maxLength={150}
            rows={2}
            className="w-full bg-slate-900/70 border border-slate-700/80 focus:border-gold-400 rounded-xl px-3.5 py-2 text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-gold-400 transition resize-none"
          />

          {/* Quick Inspiration Chips */}
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {WISH_INSPIRATIONS.map((prompt, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => handleSelectWish(prompt)}
                className="text-[10px] bg-slate-800/60 hover:bg-gold-500/20 text-slate-400 hover:text-gold-200 px-2 py-0.5 rounded-full border border-slate-700/50 transition truncate max-w-[160px]"
                title={prompt}
              >
                + {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Krathong Styles Select (Matching Screenshot: A, B, C, +) */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
            <span>Krathong styles</span>
            <span className="text-[10px] text-slate-400">
              {scannedData ? '✨ ใช้โมเดลสแกน 3D' : KRATHONG_STYLES.find(s => s.id === selectedStyle)?.name}
            </span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {KRATHONG_STYLES.map((style) => {
              const active = !scannedData && selectedStyle === style.id;
              return (
                <button
                  type="button"
                  key={style.id}
                  onClick={() => {
                    if (scannedData) onClearScannedData();
                    handleStyleChange(style);
                  }}
                  className={`py-2 px-1 rounded-xl text-sm font-bold flex flex-col items-center justify-center transition border ${
                    active
                      ? 'bg-gold-500/25 border-gold-400 text-gold-300 shadow-md shadow-gold-500/20'
                      : 'bg-slate-900/50 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                  title={`${style.name} (${style.desc})`}
                >
                  <span className="text-base font-display">{style.label}</span>
                  <span className="text-[9px] font-normal text-slate-400 truncate max-w-[55px]">
                    {style.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3D Scan / AR Camera Button (Section 2.3) */}
        <div>
          {scannedData ? (
            <div className="bg-amber-950/40 border border-gold-500/40 rounded-2xl p-2.5 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <img
                  src={scannedData.textureUrl}
                  alt="Scanned Krathong"
                  className="w-10 h-10 object-cover rounded-lg border border-gold-400/50"
                />
                <div>
                  <div className="text-xs font-semibold text-gold-300 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-gold-400" />
                    <span>ใช้กระทง 3D จากกล้องจริง</span>
                  </div>
                  <div className="text-[10px] text-slate-400">สแกนสำเร็จเรียบร้อย</div>
                </div>
              </div>
              <button
                type="button"
                onClick={onClearScannedData}
                className="text-[10px] text-slate-400 hover:text-red-400 px-2 py-1 rounded-lg bg-slate-900/60 border border-slate-700/60"
              >
                เปลี่ยน
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenScanner}
              className="w-full py-2.5 px-3 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-gold-500/30 hover:border-gold-400 text-slate-200 hover:text-gold-200 text-xs font-medium flex items-center justify-center space-x-2 transition shadow-sm group"
            >
              <Camera className="w-4 h-4 text-gold-400 group-hover:scale-110 transition" />
              <div className="text-left">
                <span className="font-semibold">3D Scan</span>
                <span className="text-[10px] text-slate-400 ml-1.5 font-light">ถ่ายภาพกระทงจริง</span>
              </div>
            </button>
          )}
        </div>

        {/* Error message if any */}
        {errorMsg && (
          <div className="text-[11px] text-rose-400 bg-rose-950/50 border border-rose-800/60 rounded-xl px-3 py-1.5">
            {errorMsg}
          </div>
        )}

        {/* Primary Action Button: ลอยกระทง (Float Krathong) */}
        <div className="pt-1">
          <div className="text-[11px] text-slate-400 mb-1">กระทงของฉัน</div>
          <button
            type="submit"
            disabled={isFloating}
            className="w-full btn-gold py-3 px-4 rounded-2xl font-bold text-base flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isFloating ? (
              <span className="flex items-center space-x-2">
                <span className="animate-spin text-lg">🪷</span>
                <span>กำลังลอยสู่สายน้ำ...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <span>ลอยกระทง</span>
                <Send className="w-4 h-4 group-hover:translate-x-1 transition" />
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
