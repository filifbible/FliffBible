

import React, { useState, useEffect } from 'react';
import BibleSupabaseService, { BibleBook, Verse } from '../services/bibleSupabaseService';
import HomeButton from './HomeButton';

interface BibleReaderProps {
  onFavorite: (ref: string) => void;
  favorites: string[];
  onBack: () => void;
}

const BibleReader: React.FC<BibleReaderProps> = ({ onFavorite, favorites, onBack }) => {
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [chapterVerses, setChapterVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [activeTestament, setActiveTestament] = useState<'Old' | 'New'>('Old');


  // Carregar livros quando o testamento mudar
  useEffect(() => {
    const loadBooks = async () => {
      setLoadingBooks(true);
      try {
        const booksData = await BibleSupabaseService.getBooksForReader(activeTestament);
        setBooks(booksData);
      } catch (error) {
        console.error('Erro ao carregar livros:', error);
        setBooks([]);
      } finally {
        setLoadingBooks(false);
      }
    };
    loadBooks();
  }, [activeTestament]);

  // Carregar versículos quando livro e capítulo forem selecionados
  useEffect(() => {
    if (selectedBook && selectedChapter) {
      const fetchVerses = async () => {
        setLoading(true);
        const cacheKey = `bible_cache_${selectedBook.id}_${selectedChapter}`;
        const cached = localStorage.getItem(cacheKey);

        if (cached) {
          setChapterVerses(JSON.parse(cached));
          setLoading(false);
          return;
        }

        try {
          const verses = await BibleSupabaseService.getChapterVerses(selectedBook.id, selectedChapter);
          setChapterVerses(verses);
          localStorage.setItem(cacheKey, JSON.stringify(verses));
        } catch (error) {
          console.error('Erro ao buscar versículos:', error);
          setChapterVerses([]);
        } finally {
          setLoading(false);
        }
      };
      fetchVerses();
    }
  }, [selectedBook, selectedChapter]);

  const filteredBooks = books.filter(b =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const reset = () => {
    setSelectedBook(null);
    setSelectedChapter(null);
    setChapterVerses([]);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto mb-20 md:mb-0 animate-in fade-in duration-700">
      {/* Header Aconchegante */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h2 className="text-4xl font-black font-outfit text-indigo-950 dark:text-white">
            {selectedBook ? (selectedChapter ? `${selectedBook.name} ${selectedChapter}` : selectedBook.name) : 'Bíblia Sagrada'}
          </h2>
          <p className="text-indigo-400 dark:text-indigo-300 font-medium">A Palavra de Deus alimenta a nossa alma. ✨</p>
        </div>
        {selectedBook ? (
          <button
            onClick={selectedChapter ? () => { setSelectedChapter(null); setChapterVerses([]); } : reset}
            className="self-start md:self-center bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 font-black px-6 py-3 rounded-2xl shadow-md border border-indigo-50 dark:border-gray-700 hover:scale-105 active:scale-95 transition-all"
          >
            ← Voltar
          </button>
        ) : (
          <HomeButton onClick={onBack} className="self-start md:self-center" />
        )}
      </div>

      {!selectedBook ? (
        <div className="space-y-8">
          {/* Barra de Busca e Tabs */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-[3rem] shadow-xl border border-indigo-50 dark:border-gray-700">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Seletor de Testamento */}
              <div className="flex bg-indigo-50 dark:bg-gray-900 p-2 rounded-2xl md:w-80">
                <button
                  onClick={() => setActiveTestament('Old')}
                  className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTestament === 'Old' ? 'bg-white dark:bg-gray-800 text-indigo-600 shadow-sm' : 'text-gray-400'}`}
                >
                  Antigo
                </button>
                <button
                  onClick={() => setActiveTestament('New')}
                  className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTestament === 'New' ? 'bg-white dark:bg-gray-800 text-indigo-600 shadow-sm' : 'text-gray-400'}`}
                >
                  Novo
                </button>
              </div>

              {/* Busca */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder={`Buscar no ${activeTestament === 'Old' ? 'Antigo' : 'Novo'} Testamento...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-indigo-200 rounded-2xl px-6 py-4 pl-12 text-gray-800 dark:text-white outline-none"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl opacity-40">🔍</span>
              </div>
            </div>
          </div>

          {/* Grid de Livros com Estilo de Biblioteca */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-in slide-in-from-bottom-4 duration-500">
            {filteredBooks.map(book => (
              <button
                key={book.name}
                onClick={() => setSelectedBook(book)}
                className="group bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] shadow-sm border border-transparent hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-xl transition-all text-center relative overflow-hidden"
              >
                <div className={`absolute top-0 left-0 w-2 h-full ${activeTestament === 'Old' ? 'bg-amber-400' : 'bg-blue-400'} opacity-40 group-hover:w-full group-hover:opacity-5 transition-all`}></div>
                <p className="font-black text-gray-800 dark:text-white text-lg relative z-10">{book.name}</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 font-black uppercase tracking-tighter relative z-10">{book.chapters} capítulos</p>
              </button>
            ))}
          </div>
        </div>
      ) : !selectedChapter ? (
        <div className="bg-white dark:bg-gray-800 p-10 rounded-[3rem] shadow-xl border border-indigo-50 dark:border-gray-700 animate-in zoom-in-95 duration-300">
          <h3 className="text-xl font-black text-indigo-900 dark:text-indigo-400 mb-8 text-center uppercase tracking-widest">Escolha o Capítulo</h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(ch => (
              <button
                key={ch}
                onClick={() => setSelectedChapter(ch)}
                className="aspect-square bg-gray-50 dark:bg-gray-900 flex items-center justify-center rounded-2xl font-black text-gray-600 dark:text-gray-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95"
              >
                {ch}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-[#FFFDF9] dark:bg-gray-900 rounded-[3rem] p-8 md:p-14 shadow-xl border border-amber-100/30 dark:border-gray-800 space-y-8 relative overflow-hidden min-h-[500px]">
          {/* Decoração interna Ajustada: Quase invisível no modo escuro para não atrapalhar a leitura */}
          <div className="absolute -top-16 -right-16 text-[22rem] text-amber-500/5 dark:text-white-[0.02] dark:opacity-[0.02] pointer-events-none rotate-12 select-none z-0">📖</div>

          {loading ? (
            <div className="py-32 flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-indigo-50 dark:border-gray-700 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="mt-6 text-gray-400 font-black animate-pulse uppercase tracking-widest text-xs">Abrindo pergaminhos...</p>
            </div>
          ) : (
            <div className="animate-in fade-in duration-1000 relative z-10">
              <div className="max-w-3xl mx-auto space-y-12">
                {chapterVerses.map(v => {
                  const ref = `${selectedBook!.name} ${selectedChapter}:${v.verse}`;
                  const isFav = favorites.includes(ref);
                  return (
                    <div key={v.id} className="group relative">
                      <p className="text-2xl leading-[1.7] text-gray-800 dark:text-gray-200 font-serif">
                        <span className="text-indigo-600 dark:text-indigo-400 font-black mr-4 text-sm select-none align-top italic opacity-80">{v.verse}</span>
                        {v.text}
                      </p>
                      <button
                        onClick={() => onFavorite(ref)}
                        className={`mt-4 inline-flex items-center text-[10px] font-black px-4 py-2 rounded-xl transition-all ${isFav ? 'bg-amber-100 text-amber-700' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 opacity-0 group-hover:opacity-100 border dark:border-gray-700'}`}
                      >
                        {isFav ? '⭐ NO MEU CORAÇÃO' : '☆ GUARDAR NO CORAÇÃO'}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="mt-20 pt-12 flex justify-center border-t border-amber-50 dark:border-gray-800">
                <button
                  onClick={() => {
                    if (selectedChapter < selectedBook.chapters) {
                      setSelectedChapter(selectedChapter + 1);
                      window.scrollTo(0, 0);
                    } else {
                      reset();
                    }
                  }}
                  className="bg-indigo-900 dark:bg-indigo-600 text-white font-black px-12 py-5 rounded-[2rem] shadow-2xl hover:scale-105 active:scale-95 transition-all text-lg uppercase tracking-widest"
                >
                  {selectedChapter < selectedBook.chapters ? 'Próximo Capítulo ➜' : 'Finalizar Leitura'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BibleReader;
