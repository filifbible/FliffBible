
import React, { useRef, useState, useEffect } from 'react';

interface PhotoCaptureProps {
  onCapture: (base64: string) => void;
  onCancel: () => void;
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    async function setupCamera() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' }, 
          audio: false 
        });
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
        setHasPermission(true);
      } catch (err) {
        setHasPermission(false);
      }
    }
    setupCamera();
    return () => stream?.getTracks().forEach(track => track.stop());
  }, []);

  const resizeAndCapture = (source: HTMLVideoElement | HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        // Redimensionar para no máximo 1024px para economizar memória
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        let width = source instanceof HTMLVideoElement ? source.videoWidth : source.width;
        let height = source instanceof HTMLVideoElement ? source.videoHeight : source.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        context.drawImage(source, 0, 0, width, height);
        setPreview(canvas.toDataURL('image/jpeg', 0.7)); // Qualidade 0.7 é ideal
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const img = new Image();
      img.onload = () => resizeAndCapture(img);
      img.src = URL.createObjectURL(file);
    }
  };

  if (preview) {
    return (
      <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
        <h3 className="text-center font-bold text-indigo-900">Ficou bom?</h3>
        <div className="relative rounded-3xl overflow-hidden bg-gray-100 aspect-[3/4] shadow-lg border-4 border-white">
          <img src={preview} className="w-full h-full object-cover" alt="Preview" />
        </div>
        <div className="flex gap-3">
          <button onClick={() => setPreview(null)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold">Voltar</button>
          <button onClick={() => onCapture(preview)} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg">Sim, enviar! ✨</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative rounded-3xl overflow-hidden bg-black aspect-[3/4] shadow-inner border-2 border-indigo-100">
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        <div className="absolute inset-0 border-[16px] border-white/20 pointer-events-none flex items-center justify-center">
          <div className="w-48 h-48 border-2 border-dashed border-white/50 rounded-xl"></div>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
      <div className="grid grid-cols-1 gap-3">
        <button onClick={() => videoRef.current && resizeAndCapture(videoRef.current)} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl flex items-center justify-center space-x-2"><span className="text-2xl">📸</span><span>Tirar Foto Agora</span></button>
        <div className="flex gap-3">
          <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-4 bg-white border-2 border-indigo-100 text-indigo-600 rounded-2xl font-bold flex items-center justify-center space-x-2"><span>🖼️</span><span>Galeria</span></button>
          <button onClick={onCancel} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold">Cancelar</button>
        </div>
      </div>
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
    </div>
  );
};

export default PhotoCapture;
