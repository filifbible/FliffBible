
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import PhotoCapture from './PhotoCapture';
import { ArtMissionTheme } from '../types';

interface PhysicalArtMissionProps {
  onSave: (base64: string) => void;
  onCancel: () => void;
  savedTheme?: ArtMissionTheme;
  onThemeGenerated: (theme: ArtMissionTheme) => void;
  isCompleted: boolean;
}

const PhysicalArtMission: React.FC<PhysicalArtMissionProps> = ({ onSave, onCancel, savedTheme, onThemeGenerated, isCompleted }) => {
  const [theme, setTheme] = useState<ArtMissionTheme | null>(savedTheme || null);
  const [loading, setLoading] = useState(!savedTheme);
  const [showCamera, setShowCamera] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchTheme = async () => {
      // Se já temos um tema salvo e ele é de hoje, não fazemos nada
      if (savedTheme && savedTheme.date === today) {
        setTheme(savedTheme);
        setLoading(false);
        return;
      }

      setLoading(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      try {
        const prompt = `Gere um tema criativo de desenho bíblico para crianças. 
        Retorne JSON: { "title": "O que desenhar", "instruction": "Como desenhar (curto)", "icon": "Emoji" }.`;
        
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                icon: { type: Type.STRING }
              },
              required: ["title", "instruction", "icon"]
            }
          }
        });
        
        const generated = JSON.parse(response.text);
        const newTheme: ArtMissionTheme = { ...generated, date: today };
        setTheme(newTheme);
        onThemeGenerated(newTheme);
      } catch (e) {
        const fallbackTheme: ArtMissionTheme = {
          title: "A Arca de Noé",
          instruction: "Desenhe um grande barco com muitos animais e um arco-íris!",
          icon: "🚢",
          date: today
        };
        setTheme(fallbackTheme);
        onThemeGenerated(fallbackTheme);
      } finally {
        setLoading(false);
      }
    };

    if (!isCompleted) {
      fetchTheme();
    } else {
      setLoading(false);
    }
  }, [savedTheme, today, isCompleted, onThemeGenerated]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-pink-600 font-bold animate-pulse">Buscando inspiração divina...</p>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto mb-20 animate-in zoom-in-95 duration-500">
        <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-10 shadow-2xl border-4 border-emerald-100 dark:border-emerald-900 text-center relative overflow-hidden">
          <div className="text-8xl mb-6">💎</div>
          <h2 className="text-4xl font-black font-outfit text-emerald-600 dark:text-emerald-400 mb-4">MISSÃO CONCLUÍDA!</h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-10">
            Você já registrou sua arte de hoje! Sua obra prima está guardada na galeria. Volte amanhã para um novo desafio!
          </p>
          <button 
            onClick={onCancel}
            className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all text-xl"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  if (showCamera) {
    return (
      <div className="p-4 md:p-8 max-w-xl mx-auto">
        <h2 className="text-2xl font-black text-center text-gray-800 dark:text-white mb-6 font-outfit">Registre sua Obra 📸</h2>
        <PhotoCapture 
          onCapture={onSave} 
          onCancel={() => setShowCamera(false)} 
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto mb-20 animate-in zoom-in-95 duration-500">
      <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-10 shadow-2xl border-4 border-pink-50 dark:border-gray-700 text-center relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-50 dark:bg-pink-900/10 rounded-full blur-3xl"></div>
        
        <div className="text-8xl mb-6 transform hover:rotate-12 transition-transform cursor-default">
          {theme?.icon}
        </div>
        
        <span className="bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest">
          Missão Criativa de Hoje
        </span>
        
        <h2 className="text-4xl font-black font-outfit text-gray-800 dark:text-white mt-6 mb-4">
          {theme?.title}
        </h2>
        
        <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-10">
          {theme?.instruction}
        </p>

        <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-dashed border-orange-200 dark:border-orange-800 p-6 rounded-3xl mb-10">
          <p className="text-orange-700 dark:text-orange-400 font-bold text-sm">
            💡 Pegue um papel, seus lápis de cor e mãos à obra! Quando terminar, tire uma foto para sua galeria.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={onCancel}
            className="flex-1 py-5 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-2xl font-bold transition-all"
          >
            Voltar
          </button>
          <button 
            onClick={() => setShowCamera(true)}
            className="flex-[2] py-5 bg-pink-500 text-white font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all text-xl flex items-center justify-center space-x-3"
          >
            <span>Já desenhei! 📸</span>
          </button>
        </div>
      </div>
      
      <p className="text-center text-gray-400 mt-8 text-xs font-medium">
        Lembre-se: Deus ama a sua criatividade! ✨
      </p>
    </div>
  );
};

export default PhysicalArtMission;
