
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import HomeButton from './HomeButton';

interface VerseChallengesProps {
  onComplete: () => void;
  onGoToBible: () => void;
  lastChallengeDate?: string | null;
  unlockedItems: string[];
  onBack: () => void;
}

interface ChallengeData {
  ref: string;
  text: string;
  hint: string;
  verificationQuestion: string;
  options: string[];
  correctIndex: number;
}

const VerseChallenges: React.FC<VerseChallengesProps> = ({ onComplete, onGoToBible, lastChallengeDate, unlockedItems, onBack }) => {
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'MISSION' | 'VERIFY' | 'SUCCESS'>('MISSION');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [error, setError] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const alreadyDone = lastChallengeDate === todayStr;

  useEffect(() => {
    const fetchChallenge = async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      try {
        const prompt = `Gere um desafio bíblico para crianças. 
        1. Escolha um versículo (ex: Salmos 23:1). 
        2. Crie uma pergunta de verificação simples para garantir que a criança LEU o versículo na bíblia física.
        Retorne JSON estrito: { 
          "ref": "Livro Cap:Ver", 
          "text": "Texto completo", 
          "hint": "Dica lúdica", 
          "verificationQuestion": "Pergunta sobre uma palavra específica ou detalhe do versículo",
          "options": ["Opção 1", "Opção 2", "Opção 3"],
          "correctIndex": 0 
        }.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                ref: { type: Type.STRING },
                text: { type: Type.STRING },
                hint: { type: Type.STRING },
                verificationQuestion: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctIndex: { type: Type.NUMBER }
              },
              required: ["ref", "text", "hint", "verificationQuestion", "options", "correctIndex"]
            }
          }
        });
        setChallenge(JSON.parse(response.text));
      } catch (e) {
        setChallenge({
          ref: "Salmos 23:1",
          text: "O Senhor é o meu pastor; nada me faltará.",
          hint: "Este versículo fala sobre o nosso Pastor cuidadoso.",
          verificationQuestion: "O que não faltará para quem tem o Senhor como pastor?",
          options: ["Nada", "Dinheiro", "Comida"],
          correctIndex: 0
        });
      } finally {
        setLoading(false);
      }
    };

    if (!alreadyDone) fetchChallenge();
    else setStep('SUCCESS');
  }, [alreadyDone]);

  const handleVerify = () => {
    if (selectedOption === challenge?.correctIndex) {
      onComplete();
      setStep('SUCCESS');
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-6 text-indigo-600 font-black font-outfit animate-pulse text-xl">Sorteando sua missão secreta...</p>
      </div>
    );
  }

  if (step === 'SUCCESS') {
    return (
      <div className="p-8 text-center max-w-2xl mx-auto mt-20 bg-white dark:bg-gray-800 rounded-[3rem] shadow-xl border-4 border-emerald-100 dark:border-emerald-900 animate-in zoom-in-95">
        <div className="text-8xl mb-8">💎</div>
        <h2 className="text-4xl font-black font-outfit text-emerald-600 dark:text-emerald-400 mb-4">MISSÃO CUMPRIDA!</h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg mb-10 leading-relaxed">
          Parabéns! Você provou que leu a Palavra e ganhou sua moeda. Deus se alegra com sua dedicação!
        </p>
        <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-black p-6 rounded-2xl border-2 border-emerald-100 dark:border-emerald-800 mb-6">
          MOEDA COLETADA ✅
        </div>
        <HomeButton
          onClick={onBack}
          label="Voltar ao Início"
          className="w-full justify-center bg-indigo-600 text-white font-black hover:bg-indigo-700 shadow-xl"
        />
      </div>
    );
  }

  if (step === 'VERIFY') {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto mb-20 animate-in slide-in-from-right-10 duration-500">
        <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-10 shadow-2xl border-4 border-orange-100 dark:border-gray-700 text-center">
          <div className="text-6xl mb-6">🧐</div>
          <h3 className="text-2xl font-black text-orange-600 mb-6 font-outfit uppercase">Hora da Prova!</h3>
          <p className="text-xl font-bold text-gray-800 dark:text-white mb-8 leading-tight">{challenge?.verificationQuestion}</p>

          <div className="space-y-3 mb-10">
            {challenge?.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedOption(idx)}
                className={`w-full p-5 rounded-2xl font-bold transition-all border-4 relative overflow-hidden ${selectedOption === idx
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600'
                  : 'border-gray-50 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-400'
                  }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {error && <p className="text-red-500 font-bold mb-4 animate-bounce">Ops! Tente ler o versículo de novo... 📖</p>}

          <div className="flex gap-4">
            <button onClick={() => setStep('MISSION')} className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-400 rounded-xl font-bold">Voltar</button>
            <button
              disabled={selectedOption === null}
              onClick={handleVerify}
              className="flex-[2] py-4 bg-emerald-500 text-white font-black rounded-xl shadow-lg disabled:opacity-50"
            >
              Confirmar Resposta
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto mb-20 animate-in zoom-in-95 duration-500">
      <div className="text-center mb-10 relative">
        <HomeButton
          onClick={onBack}
          className="absolute left-0 top-1/2 -translate-y-1/2 hidden md:flex"
        />
        <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em]">
          Missão de Leitura
        </span>
        <h2 className="text-4xl font-black font-outfit text-gray-800 dark:text-white mt-4">Onde está a Palavra?</h2>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-10 shadow-2xl border-4 border-indigo-50 dark:border-gray-700 relative overflow-hidden text-center">
        <div className="text-8xl mb-6">📖</div>
        <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mb-2">Sua missão é ler:</h3>
        <p className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 font-outfit tracking-tighter">{challenge?.ref}</p>

        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-6 rounded-3xl mb-8 border border-indigo-100 dark:border-indigo-800 italic text-gray-600 dark:text-gray-300">
          "Dica: {challenge?.hint}"
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={onGoToBible}
            className="bg-indigo-100 text-indigo-600 font-black py-5 rounded-2xl border-2 border-indigo-200 hover:bg-white transition-all text-xl"
          >
            📖 Abrir Bíblia
          </button>
          <button
            onClick={() => setStep('VERIFY')}
            className="bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl hover:scale-105 transition-all text-xl flex items-center justify-center space-x-2"
          >
            <span>Já li tudo!</span>
            <span className="bg-white/20 px-2 py-1 rounded-lg text-sm">Próximo ➜</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerseChallenges;
