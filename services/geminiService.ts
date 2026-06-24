import { ProfileType, QuizQuestion, BibleVerse } from "../types";
import { supabase } from "./supabase";

const getRandomVerse = async () => {
  if (!supabase) throw new Error("Supabase não configurado.");

  const { count, error: countError } = await supabase
    .from('verse')
    .select('*', { count: 'exact', head: true });

  if (countError || !count) throw new Error("Erro ao buscar total de versículos.");

  const randomOffset = Math.floor(Math.random() * count);

  const { data: verseData, error: verseError } = await supabase
    .from('verse')
    .select(`
      text,
      chapter,
      verse,
      book:book_id ( name )
    `)
    .range(randomOffset, randomOffset)
    .single();

  if (verseError || !verseData) throw new Error("Erro ao buscar versículo aleatório.");

  const bookData = Array.isArray(verseData.book) ? verseData.book[0] : verseData.book;
  const bookName = bookData?.name || "Desconhecido";
  const ref = `${bookName} ${verseData.chapter}:${verseData.verse}`;

  return { ref, text: verseData.text };
};

export const generateDailyDevotional = async (profile: ProfileType) => {
  if (profile !== ProfileType.ADULTS) {
    throw new Error("Essa funcionalidade só está disponível no perfil do adulto.");
  }

  const { ref, text } = await getRandomVerse();

  return {
    verseRef: ref,
    verseText: text,
    reflection: "Que a palavra de Deus seja luz para o seu caminho e traga paz ao seu coração neste dia.",
    challenge: "Reflita sobre esta palavra, pratique a gratidão e busque compartilhar o amor de Deus com alguém hoje."
  };
};

export const generateKidVerse = async () => {
  const { ref, text } = await getRandomVerse();
  return { ref, text };
};

export const getBibleChapter = async (book: string, chapter: number): Promise<BibleVerse[]> => {
  return [
    { book, chapter, verse: 1, text: "No princípio criou Deus os céus e a terra." }
  ];
};

export const generateQuiz = async (profile: ProfileType) => {
  return [
    {
      question: "Quem construiu a arca?",
      options: ["Moisés", "Noé", "Abraão"],
      correctIndex: 1
    },
    {
      question: "Quantos dias e noites choveu no dilúvio?",
      options: ["10", "40", "7"],
      correctIndex: 1
    },
    {
      question: "O que Deus colocou no céu como sinal de sua aliança?",
      options: ["Uma estrela", "Um arco-íris", "O sol"],
      correctIndex: 1
    }
  ] as QuizQuestion[];
};
