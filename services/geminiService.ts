
import { GoogleGenAI, Type } from "@google/genai";
import { ProfileType, QuizQuestion, BibleVerse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDailyDevotional = async (profile: ProfileType) => {
  const challengeContext = profile === ProfileType.KIDS 
    ? "O desafio deve ser algo lúdico: desenhar uma cena bíblica ou fazer uma oração simples."
    : "O desafio deve ser prático: um exercício de gratidão, uma leitura específica ou uma ação de bondade.";

  const prompt = `Gere devocional cristão para ${profile}. 
  ${challengeContext}
  Responda estritamente JSON: { "verseRef": "string", "verseText": "string", "reflection": "string", "challenge": "string" }.
  Use Português Brasil.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verseRef: { type: Type.STRING },
            verseText: { type: Type.STRING },
            reflection: { type: Type.STRING },
            challenge: { type: Type.STRING }
          },
          required: ["verseRef", "verseText", "reflection", "challenge"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error fetching devotional:", error);
    return null;
  }
};

export const generateKidVerse = async () => {
  const themes = ["animais", "natureza", "amor", "coragem", "alegria", "família", "criação", "estrelas", "proteção"];
  const randomTheme = themes[Math.floor(Math.random() * themes.length)];
  
  const prompt = `Gere um versículo bíblico curto, alegre e de fácil leitura para crianças sobre o tema: ${randomTheme}. 
  Varie os livros da bíblia (Gênesis, Salmos, Mateus, João, etc).
  Retorne JSON: { "ref": "string", "text": "string" }. Use Português Brasil.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ref: { type: Type.STRING },
            text: { type: Type.STRING }
          },
          required: ["ref", "text"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    return { ref: "Salmos 23:1", text: "O Senhor é o meu pastor; nada me faltará." };
  }
};

export const getBibleChapter = async (book: string, chapter: number): Promise<BibleVerse[]> => {
  const prompt = `Return JSON array of verses for ${book} ${chapter} (Portuguese ARA). Format: [{ "book": "${book}", "chapter": ${chapter}, "verse": number, "text": "string" }]`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              book: { type: Type.STRING },
              chapter: { type: Type.NUMBER },
              verse: { type: Type.NUMBER },
              text: { type: Type.STRING }
            },
            required: ["book", "chapter", "verse", "text"]
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error fetching Bible chapter:", error);
    return [];
  }
};

export const generateQuiz = async (profile: ProfileType) => {
  const prompt = `3 biblia quiz ${profile}. JSON array: {question, options, correctIndex}.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctIndex: { type: Type.NUMBER }
            },
            required: ["question", "options", "correctIndex"]
          }
        }
      }
    });

    return JSON.parse(response.text) as QuizQuestion[];
  } catch (error) {
    console.error("Error generating quiz:", error);
    return [];
  }
};
