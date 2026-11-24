# 🪷 Loy Krathong Digital (ลอยกระทงออนไลน์เสมือนจริง)

เว็บแอปพลิเคชันสำหรับการ "ลอยกระทงออนไลน์" แบบเรียลไทม์ (Real-time Shared River Canvas) ดีไซน์สไตล์มินิมอล สงบ และเรียบหรู (Clean, Serene Night Atmosphere) พัฒนาตามข้อกำหนดใน **Software Requirement Specification (SRS)** และ Mockup ต้นแบบครอบคลุมทั้ง Laptop, Tablet (iPad), และ Smartphone

---

## 🌟 จุดเด่นและฟังก์ชันการทำงาน (Core Features)

### 1. การรองรับทุกอุปกรณ์และการเข้าถึงแบบส่วนตัว (Access Control & Compatibility)
- **Responsive Layout:** รองรับหน้าจอคอมพิวเตอร์ (Desktop), แท็บเล็ต (iPad), และสมาร์ทโฟน (Mobile View แบบมีแถบล่าง "ดูบนสายน้ำ")
- **Private Room Link:** รองรับการสร้างห้องส่วนตัวผ่าน URL Parameter เช่น `http://localhost:3000/?room=my-family` พร้อมทั้งกำหนด `<meta name="robots" content="noindex, nofollow" />` เพื่อความเป็นส่วนตัว

### 2. แบบฟอร์มลอยกระทง & ตกแต่งตามใจ (User Input & Customization Form)
- **ชื่อผู้ลอย (Sender Name):** กำหนดชื่อตนเองหรือกลุ่ม
- **สถานที่ลอยกระทง (Location Selection):** เลือกสถานที่สำคัญในไทย (แม่น้ำเจ้าพระยา หน้าวัดอรุณฯ, ยอดอ่าวเชียงใหม่ แม่น้ำปิง, สุโขทัย, จุฬาฯ, ร้อยเอ็ด) หรือเลือกกำหนดสถานที่เอง (Specify Own)
- **คำอวยพร (Wish Message):** ระบบจำกัด 150 ตัวอักษร พร้อมปุ่มตัวอย่างคำอวยพรมงคลด่วน

### 3. รูปแบบกระทง 3D & ระบบสแกนกระทงจากโลกจริง (3D Models & Camera Scanner)
- **Preset Krathong Styles:**
  - **แบบ A:** กระทงใบตองโบราณ & ดอกดาวเรืองสีทอง
  - **แบบ B:** กระทงดอกบัวสัตตบุษย์ ซ้อน 3 ชั้น
  - **แบบ C:** กระทงกะลามะพร้าวธรรมชาติ & กล้วยไม้
  - **แบบ D:** กระทงโคมทองมินิมอล
- **3D Real-World Camera Scanner (AR/Photogrammetry Fallback):**
  - เปิดกล้องมือถือ/เว็บแคม เพื่อสแกนวัตถุหรือกระทงจริงพร้อมเส้นเลเซอร์ AR
  - รองรับการอัปโหลดไฟล์รูปภาพหากไม่สะดวกเปิดกล้อง
  - แปลงภาพถ่ายจริงเป็นโมเดลกระทง 3D พร้อมแสดง **Interactive 3D Preview หมุนดูได้ 360 องศา** ก่อนกดยืนยันใช้งาน

### 4. ระบบเสียงดนตรีบรรเลง & สายน้ำ (Audio System)
- **Loy Krathong Ambient Melody:** บทเพลงลอยกระทงบรรเลงด้วยโทนระนาด/กระดิ่งไทยนุ่มนวลผ่าน Web Audio API ไม่ต้องพึ่งพาการโหลดไฟล์ภายนอก
- **River Waves Sound:** เสียงคลื่นน้ำแผ่วเบาเพิ่มบรรยากาศผ่อนคลายยามค่ำคืน
- **Sound Control:** ตัวควบคุมเพลง (Play/Pause/Mute/Equalizer) ลอยอยู่มุมขวาบนเสมอ

### 5. แม่น้ำ 3D แสดงผลร่วมกันแบบเรียลไทม์ (Real-time Shared River Canvas)
- **Three.js WebGL Engine:**
  - พื้นผิวน้ำสะท้อนแสงจันทร์และระลอกคลื่นสมจริง
  - เจดีย์และปรางค์วัดอรุณฯ ส่องสว่างริมฝั่งแม่น้ำยามราตรี
  - โคมลอย (Sky Lanterns) ลอยขึ้นสู่ท้องฟ้าอย่างนุ่มนวล
  - กระทงลอยบนน้ำพร้อมแสงเทียนวูบวาบ (Candle Light & Smoke) และป้ายชื่อผู้ลอย
- **Multi-user Real-Time Synchronization:**
  - ขับเคลื่อนด้วย Socket.io เมื่อมีผู้ใช้ลอยกระทง กระทงจะลอยลงสู่แม่น้ำทันทีบนทุกหน้าจอ
  - คลิกที่กระทงของผู้อื่นเพื่ออ่านคำอวยพร และกดปุ่ม **"ร่วมอนุโมทนาบุญ 🙏 / หัวใจ ❤️"** เพื่อส่งกำลังใจแบบสดๆ

---

## 🚀 วิธีการติดตั้งและรันโปรเจกต์ (Getting Started)

โฟลเดอร์โปรเจกต์อยู่ที่: `D:\LoyKraTong`

### 1. รันเซิร์ฟเวอร์แบบพร้อมใช้งาน (Production / Standalone Mode)
```bash
cd D:\LoyKraTong
npm start
```
เปิดเว็บเบราว์เซอร์ไปที่: `http://localhost:3000`

### 2. รันในโหมดพัฒนา (Development Mode with Hot Reload)
- **Backend:**
  ```bash
  npm run dev:backend
  ```
- **Frontend (Vite):**
  ```bash
  npm run dev:frontend
  ```
เปิดเว็บเบราว์เซอร์ไปที่: `http://localhost:5173`

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```
D:\LoyKraTong\
├── data\
│   └── krathongs.json          # ฐานข้อมูลกระทงที่ถูกลอยและบันทึก
├── dist\                       # ไฟล์คอมไพล์ Production พร้อมใช้งาน
├── src\
│   ├── components\
│   │   ├── Header.jsx          # แถบบน: โลโก้, ตัวเล่นเพลง, เมนูนำทาง
│   │   ├── CreateKrathongCard.jsx # การ์ดสร้างกระทงและเลือกรูปแบบ
│   │   ├── KrathongScanModal.jsx  # สแกนกล้อง 3D และพรีวิวหมุน 360°
│   │   ├── KrathongDetailModal.jsx # ป๊อปอัปอ่านคำอวยพรและกดอนุโมทนาบุญ
│   │   ├── MyKrathongsDrawer.jsx   # ลิสต์กระทงของฉัน + ซูมกล้องไปยังกระทง
│   │   ├── RiverListDrawer.jsx     # ลิสต์ดูบนสายน้ำ
│   │   ├── SettingsModal.jsx       # ตั้งค่าเสียง, กราฟิก และแชร์ห้องส่วนตัว
│   │   └── River3DCanvas.jsx       # เอนจิน 3D แม่น้ำ, วัดอรุณ, โคมลอย, กระทง
│   ├── utils\
│   │   ├── audio.js            # ระบบเสียงบรรเลงเพลงลอยกระทง & เสียงคลื่นน้ำ
│   │   ├── socket.js           # ระบบการเชื่อมต่อ Real-time Socket.io
│   │   └── threeModels.js      # ตัวสร้างโมเดล 3D กระทง, เทียน, ธูป, โคมลอย
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── server.js                   # Node.js + Express + Socket.io Server
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```
