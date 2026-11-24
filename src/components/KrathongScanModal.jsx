import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, Upload, Sparkles, Layers } from 'lucide-react';
import * as THREE from 'three';
import { createKrathongMesh } from '../utils/threeModels';

export default function KrathongScanModal({ isOpen, onClose, onSaveScannedKrathong }) {
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // back camera by default
  const [capturedImage, setCapturedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const preview3dRef = useRef(null);
  const threeSceneRef = useRef(null);

  // Initialize camera when modal opens
  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('เบราว์เซอร์ไม่รองรับการเข้าถึงกล้องโดยตรง');
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn('Camera access issue:', err);
      setCameraError('ไม่สามารถเปิดกล้องได้ คุณสามารถเลือกอัปโหลดรูปภาพแทนได้ครับ');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    processImageTo3D(dataUrl);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      processImageTo3D(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const processImageTo3D = (dataUrl) => {
    stopCamera();
    setIsProcessing(true);
    setCapturedImage(dataUrl);

    // Simulate photogrammetry texture processing
    setTimeout(() => {
      setIsProcessing(false);
      setup3DPreview(dataUrl);
    }, 1200);
  };

  // Setup interactive 3D rotating preview
  const setup3DPreview = (textureUrl) => {
    const container = preview3dRef.current;
    if (!container) return;

    // Clear previous scene
    container.innerHTML = '';

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 280;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1120);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2.2, 3.8);
    camera.lookAt(0, 0.4, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffeedd, 1.5);
    dirLight.position.set(3, 5, 4);
    scene.add(dirLight);

    // 3D Scanned Krathong model with the captured texture
    const krathong = createKrathongMesh('preset_a', '#15803d', textureUrl, 'กระทงของฉัน');
    scene.add(krathong);

    let isDragging = false;
    let prevMouseX = 0;
    const dom = renderer.domElement;

    const onMouseDown = (e) => {
      isDragging = true;
      prevMouseX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    };
    const onMouseMove = (e) => {
      if (!isDragging) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const deltaX = clientX - prevMouseX;
      krathong.rotation.y += deltaX * 0.015;
      prevMouseX = clientX;
    };
    const onMouseUp = () => { isDragging = false; };

    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    dom.addEventListener('touchstart', onMouseDown);
    window.addEventListener('touchmove', onMouseMove);
    window.addEventListener('touchend', onMouseUp);

    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (!isDragging) {
        krathong.rotation.y += 0.008; // auto gentle rotate
      }
      renderer.render(scene, camera);
    };
    animate();

    threeSceneRef.current = {
      destroy: () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        window.removeEventListener('touchmove', onMouseMove);
        window.removeEventListener('touchend', onMouseUp);
        renderer.dispose();
      }
    };
  };

  const handleRetake = () => {
    if (threeSceneRef.current) {
      threeSceneRef.current.destroy();
      threeSceneRef.current = null;
    }
    setCapturedImage(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onSaveScannedKrathong({
        textureUrl: capturedImage,
        name: 'Scanned Custom Krathong'
      });
    }
    handleClose();
  };

  const handleClose = () => {
    stopCamera();
    if (threeSceneRef.current) {
      threeSceneRef.current.destroy();
      threeSceneRef.current = null;
    }
    setCapturedImage(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-panel rounded-3xl w-full max-w-lg overflow-hidden border border-gold-500/30 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gold-500/20 text-gold-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 font-display">
                3D Real-World Krathong Scanner
              </h3>
              <p className="text-[11px] text-slate-400 font-light">
                สแกนกระทงจริงผ่านกล้อง หรืออัปโหลดรูปภาพเพื่อสร้างโมเดล 3D
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Content */}
        <div className="p-4 flex-1 flex flex-col items-center justify-center min-h-[300px]">
          {!capturedImage ? (
            <div className="relative w-full aspect-[4/3] max-w-md bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner">
              {stream ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* AR Laser Scan Grid Overlay */}
                  <div className="absolute inset-0 pointer-events-none border-2 border-gold-400/40 rounded-2xl">
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent shadow-[0_0_15px_#f59e0b] animate-bounce" />
                    <div className="absolute inset-8 border border-dashed border-gold-300/30 rounded-full flex items-center justify-center">
                      <span className="text-[11px] text-gold-300/70 bg-midnight-950/70 px-2 py-0.5 rounded-full">
                        จัดตำแหน่งกระทงให้อยู่ตรงกลาง
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center p-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div className="text-xs text-slate-400 max-w-xs">
                    {cameraError || 'กำลังเริ่มการทำงานของกล้อง...'}
                  </div>
                  <label className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition">
                    <Upload className="w-4 h-4 text-gold-400" />
                    <span>เลือกรูปภาพจากเครื่อง</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              )}
            </div>
          ) : isProcessing ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-2 border-gold-400/20 border-t-gold-400 animate-spin" />
                <Sparkles className="w-8 h-8 text-gold-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-slate-200">
                  กำลังประมวลผลโมเดล 3D...
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  คำนวณพื้นผิว Photogrammetry Texture Mapping
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              <div className="relative w-full aspect-[4/3] max-w-md bg-slate-900 rounded-2xl overflow-hidden border border-gold-500/30">
                <div ref={preview3dRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
                <div className="absolute bottom-2 left-2 text-[10px] text-slate-400 bg-midnight-950/70 backdrop-blur-md px-2 py-0.5 rounded-full border border-slate-800">
                  👆 แตะหรือลากเพื่อหมุนดูแบบ 360°
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-slate-800 bg-midnight-900/60 flex items-center justify-between">
          {!capturedImage ? (
            <>
              <button
                type="button"
                onClick={() => setFacingMode(facingMode === 'environment' ? 'user' : 'environment')}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="สลับกล้องหน้า/หลัง"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleCapture}
                className="btn-gold px-6 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 shadow-lg shadow-gold-500/30"
              >
                <Camera className="w-4 h-4" />
                <span>ถ่ายภาพและแปลงเป็น 3D</span>
              </button>

              <label className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer" title="อัปโหลดรูปภาพ">
                <Upload className="w-4 h-4" />
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700 transition"
              >
                ถ่ายใหม่
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="btn-gold px-6 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>นำไปใช้กับกระทงของฉัน</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
