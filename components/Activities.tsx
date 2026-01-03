
import React, { useState, useEffect } from 'react';
import { ProfileType, QuizQuestion } from '../types';
import { generateQuiz } from '../services/geminiService';

interface ActivitiesProps {
  profile: ProfileType;
  lastChallengeDate: string | null;
  onComplete: (points: number) => void;
}

const Activities: React.FC<ActivitiesProps> = ({ profile, lastChallengeDate, onComplete }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const alreadyDone = lastChallengeDate === todayStr;

  useEffect(() => {
    if (alreadyDone) {
      setLoading(false);
      return;
    }

    const fetchQuiz = async () => {
      const q = await generateQuiz(profile);
      setQuestions(q);
      setLoading(false);
    };
    fetchQuiz();
  }, [profile, alreadyDone]);

  const handleAnswer = (idx: number) => {
    if (idx === questions[currentIdx].correctIndex) {
      setScore(prev => prev + 1);
    }
    
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setFinished(true);
      onComplete(score * 10);
    }
  };

  if (alreadyDone) return (
    <div className="text-center bg-white p-12 rounded-[2.5rem] shadow-xl max-w-md mx-auto mt-20 border border-gray-100">
      <div className="text-7xl mb-6">🎯</div>
      <h2 className="text-3xl font-bold font-outfit text-gray-800 mb-4">Uau! Você é rápido!</h2>
      <p className="text-gray-500 leading-relaxed mb-8">
        Você já completou o desafio diário de hoje. Volte amanhã para novos conhecimentos e mais pontos!
      </p>
      <div className="bg-emerald-50 text-emerald-700 font-bold p-4 rounded-2xl border border-emerald-100">
        Recompensa Coletada ✅
      </div>
    </div>
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      <p className="mt-4 text-gray-600 font-medium">Preparando seu desafio diário...</p>
    </div>
  );

  if (finished) return (
    <div className="text-center bg-white p-10 rounded-3xl shadow-xl max-w-md mx-auto mt-20">
      <div className="text-6xl mb-4">🏆</div>
      <h2 className="text-3xl font-bold font-outfit text-gray-800 mb-2">Excelente Trabalho!</h2>
      <p className="text-gray-600 mb-6">Você completou o Quiz Bíblico de hoje.</p>
      <div className="bg-indigo-50 p-4 rounded-2xl mb-8">
        <p className="text-indigo-600 font-bold text-2xl">+{score * 10} Pontos</p>
        <p className="text-sm text-indigo-400">Total de acertos: {score}/{questions.length}</p>
      </div>
      <p className="text-gray-400 text-sm italic">Volte amanhã para pontuar novamente!</p>
    </div>
  );

  const currentQ = questions[currentIdx];

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto mb-20">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold font-outfit text-gray-800">Quiz Bíblico</h2>
          <p className="text-gray-500">Perfil: {profile}</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 font-bold text-indigo-600">
          Questão {currentIdx + 1}/{questions.length}
        </div>
      </div>

      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-8 leading-tight">{currentQ.question}</h3>
        <div className="space-y-4">
          {currentQ.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              className="w-full text-left p-5 rounded-2xl border-2 border-gray-50 hover:border-indigo-600 hover:bg-indigo-50 transition-all font-medium text-gray-700 flex justify-between items-center group"
            >
              <span className="flex-1 pr-4">{opt}</span>
              <span className="opacity-0 group-hover:opacity-100 text-indigo-600 font-bold">✓</span>
            </button>
          ))}
        </div>
      </div>

      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-indigo-600 h-full transition-all duration-500" 
          style={{ width: `${((currentIdx) / questions.length) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default Activities;
