
import React, { useState, useRef, useEffect } from 'react';
import { AudioRecording } from '../types';
import { generateKidVerse } from '../services/geminiService';

interface BibleReadingKidsProps {
  onSaveRecording: (audio: string, ref: string) => void;
  recordings: AudioRecording[];
  onBack: () => void;
}

const BibleReadingKids: React.FC<BibleReadingKidsProps> = ({ onSaveRecording, recordings, onBack }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [currentAudioBlob, setCurrentAudioBlob] = useState<Blob | null>(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [verse, setVerse] = useState<{ ref: string, text: string } | null>(null);
  const [loadingVerse, setLoadingVerse] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const fetchVerse = async () => {
    setLoadingVerse(true);
    const newVerse = await generateKidVerse();
    setVerse(newVerse);
    setLoadingVerse(false);
  };

  useEffect(() => {
    fetchVerse();
    return () => {
      if (currentAudioUrl) URL.revokeObjectURL(currentAudioUrl);
    };
  }, []);

  const startRecording = async () => {
    try {
      if (currentAudioUrl) URL.revokeObjectURL(currentAudioUrl);
      setCurrentAudioBlob(null);
      setCurrentAudioUrl(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Ordem de preferência de codecs para garantir compatibilidade máxima (iOS/Android/Desktop)
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
        'audio/wav'
      ];

      const supportedType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || '';
      console.log("Usando codec:", supportedType);

      const mediaRecorder = new MediaRecorder(stream, { mimeType: supportedType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: supportedType || 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setCurrentAudioBlob(blob);
        setCurrentAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Erro ao gravar:", err);
      alert("Precisamos de permissão para usar o microfone!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playRecording = async (audioSource: string, id: string) => {
    if (!audioPlayerRef.current) return;

    if (isPlaying === id) {
      audioPlayerRef.current.pause();
      setIsPlaying(null);
    } else {
      try {
        audioPlayerRef.current.src = audioSource;
        audioPlayerRef.current.currentTime = 0;

        const playPromise = audioPlayerRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
          setIsPlaying(id);
          audioPlayerRef.current.onended = () => setIsPlaying(null);
        }
      } catch (e) {
        console.error("Erro de reprodução:", e);
        // Fallback: Tentar recarregar o elemento
        audioPlayerRef.current.load();
        audioPlayerRef.current.play().then(() => setIsPlaying(id)).catch(err => {
          alert("Seu navegador bloqueou o áudio. Tente clicar no play novamente.");
        });
      }
    }
  };

  const handleSave = () => {
    if (currentAudioBlob && verse) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        onSaveRecording(base64data, verse.ref);
        if (currentAudioUrl) URL.revokeObjectURL(currentAudioUrl);
        setCurrentAudioBlob(null);
        setCurrentAudioUrl(null);
        fetchVerse(); // Carrega novo versículo após salvar
      };
      reader.readAsDataURL(currentAudioBlob);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto mb-24 animate-in fade-in duration-500">
      <audio ref={audioPlayerRef} className="hidden" />

      <div className="text-center mb-8 relative">
        <button
          onClick={onBack}
          className="absolute left-0 top-1/2 -translate-y-1/2 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-md text-xl hover:scale-105 transition-transform"
        >
          ⬅️
        </button>
        <h2 className="text-3xl font-bold font-outfit text-indigo-900 dark:text-indigo-400">Voz da Fé 🎤</h2>
        <p className="text-gray-500 dark:text-gray-400">Leia o versículo e ouça sua voz!</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-10 shadow-xl border-4 border-indigo-50 dark:border-indigo-900/50 text-center mb-10 relative overflow-hidden min-h-[220px] flex flex-col justify-center items-center">
        {loadingVerse ? (
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400 font-bold">Inspirando novo versículo...</p>
          </div>
        ) : verse ? (
          <>
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-full translate-x-10 -translate-y-10"></div>
            <p className="text-indigo-600 dark:text-indigo-400 font-bold mb-4 uppercase tracking-widest text-xs">{verse.ref}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white leading-relaxed italic animate-in slide-in-from-bottom-2">"{verse.text}"</p>
          </>
        ) : null}
      </div>

      <div className="flex flex-col items-center space-y-6 mb-12">
        {!currentAudioUrl ? (
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={loadingVerse}
            className={`w-28 h-28 rounded-full flex items-center justify-center text-5xl shadow-2xl transition-all active:scale-95 disabled:opacity-30 ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-indigo-600 hover:scale-105'}`}
          >
            {isRecording ? '⏹️' : '🎤'}
          </button>
        ) : (
          <div className="flex flex-wrap justify-center gap-4 animate-in zoom-in-95 duration-300">
            <button
              onClick={() => playRecording(currentAudioUrl!, 'preview')}
              className="px-8 py-5 bg-emerald-500 text-white font-bold rounded-2xl shadow-lg flex items-center gap-3 hover:bg-emerald-600 active:scale-95 transition-all"
            >
              <span className="text-2xl">{isPlaying === 'preview' ? '⏸️' : '▶️'}</span>
              <span>{isPlaying === 'preview' ? 'Parar' : 'Ouvir Agora'}</span>
            </button>
            <button
              onClick={handleSave}
              className="px-8 py-5 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:bg-indigo-700 active:scale-95 transition-all"
            >
              💾 Salvar e Outro
            </button>
            <button
              onClick={() => {
                if (currentAudioUrl) URL.revokeObjectURL(currentAudioUrl);
                setCurrentAudioBlob(null);
                setCurrentAudioUrl(null);
              }}
              className="p-5 bg-gray-100 dark:bg-gray-700 text-gray-400 rounded-2xl"
            >
              🗑️
            </button>
          </div>
        )}
        <div className="text-center">
          <p className={`font-bold transition-colors ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>
            {isRecording ? "Estamos gravando... Leia com amor!" : !currentAudioUrl ? "Aperte o microfone e leia o versículo" : "Escute como sua voz ficou linda!"}
          </p>
        </div>
      </div>

      <div className="mt-12">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Minhas Leituras Gravadas</h3>

        {recordings.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-200 dark:border-gray-700 p-10 rounded-3xl text-center text-gray-400">
            Nenhuma gravação ainda. Vamos ler um versículo?
          </div>
        ) : (
          <div className="space-y-3">
            {[...recordings].reverse().map((rec) => (
              <div key={rec.id} className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between hover:border-indigo-200 transition-all group">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => playRecording(rec.audio, rec.id)}
                    className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center"
                  >
                    <span className="text-xl">{isPlaying === rec.id ? '⏸️' : '▶️'}</span>
                  </button>
                  <div>
                    <p className="font-bold text-gray-800 dark:text-white">{rec.ref}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{rec.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BibleReadingKids;
