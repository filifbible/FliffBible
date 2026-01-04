import { supabase } from './supabase';

// ========================================
// Tipos atualizados para tabelas reais
// ========================================

export interface Testament {
  id: number;
  name: string;
}

export interface Book {
  id: number;
  book_reference_id: number;
  testament_reference_id: number;
  name: string;
  chapters?: number; // Calculado dinamicamente
}

export interface Verse {
  id: number;
  book_id: number;
  chapter: number;
  verse: number;
  text: string;
}

// ========================================
// Interface para BibleReader (compatibilidade)
// ========================================

export interface BibleBook {
  id: number;
  name: string;
  testament: 'Old' | 'New';
  chapters: number;
}

/**
 * Serviço para consultar dados bíblicos do Supabase
 */
export const BibleSupabaseService = {
  /**
   * Busca todos os testamentos
   */
  getTestaments: async (): Promise<Testament[]> => {
    const { data, error } = await supabase
      .from('testament')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) {
      console.error('Erro ao buscar testamentos:', error);
      throw error;
    }
    
    return data || [];
  },

  /**
   * Busca todos os livros de um testamento específico
   * @param testamentId - ID do testamento (1 = Antigo, 2 = Novo)
   */
  getBooksByTestament: async (testamentId: number): Promise<Book[]> => {
    const { data, error } = await supabase
      .from('book')
      .select('*')
      .eq('testament_reference_id', testamentId)
      .order('book_reference_id', { ascending: true });
    
    if (error) {
      console.error('Erro ao buscar livros:', error);
      throw error;
    }
    
    return data || [];
  },

  /**
   * Busca todos os livros (ambos testamentos)
   */
  getAllBooks: async (): Promise<Book[]> => {
    const { data, error } = await supabase
      .from('book')
      .select('*')
      .order('testament_reference_id', { ascending: true })
      .order('book_reference_id', { ascending: true });
    
    if (error) {
      console.error('Erro ao buscar livros:', error);
      throw error;
    }
    
    return data || [];
  },

  /**
   * Busca um livro específico pelo nome
   * @param name - Nome do livro
   */
  getBookByName: async (name: string): Promise<Book | null> => {
    const { data, error } = await supabase
      .from('book')
      .select('*')
      .eq('name', name)
      .single();
    
    if (error) {
      console.error('Erro ao buscar livro:', error);
      return null;
    }
    
    return data;
  },

  /**
   * Conta quantos capítulos um livro tem
   * @param bookId - ID do livro
   */
  getBookChapterCount: async (bookId: number): Promise<number> => {
    const { data, error } = await supabase
      .from('verse')
      .select('chapter')
      .eq('book_id', bookId)
      .order('chapter', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Erro ao contar capítulos:', error);
      return 0;
    }
    
    return data && data.length > 0 ? data[0].chapter : 0;
  },

  /**
   * Busca todos os versículos de um capítulo específico
   * @param bookId - ID do livro
   * @param chapter - Número do capítulo
   */
  getChapterVerses: async (bookId: number, chapter: number): Promise<Verse[]> => {
    const { data, error } = await supabase
      .from('verse')
      .select('*')
      .eq('book_id', bookId)
      .eq('chapter', chapter)
      .order('verse', { ascending: true });
    
    if (error) {
      console.error('Erro ao buscar versículos:', error);
      throw error;
    }
    
    return data || [];
  },

  /**
   * Busca um versículo específico
   * @param bookId - ID do livro
   * @param chapter - Número do capítulo
   * @param verse - Número do versículo
   */
  getVerse: async (bookId: number, chapter: number, verse: number): Promise<Verse | null> => {
    const { data, error } = await supabase
      .from('verse')
      .select('*')
      .eq('book_id', bookId)
      .eq('chapter', chapter)
      .eq('verse', verse)
      .single();
    
    if (error) {
      console.error('Erro ao buscar versículo:', error);
      return null;
    }
    
    return data;
  },

  /**
   * Busca versículos de forma aleatória
   * @param limit - Número de versículos a retornar
   */
  getRandomVerses: async (limit: number = 1): Promise<Verse[]> => {
    const { data, error } = await supabase
      .from('verse')
      .select('*')
      .limit(limit);
    
    if (error) {
      console.error('Erro ao buscar versículos aleatórios:', error);
      throw error;
    }
    
    return data || [];
  },

  /**
   * Busca versículos por texto (pesquisa)
   * @param searchTerm - Termo de busca
   * @param limit - Número máximo de resultados
   */
  searchVerses: async (searchTerm: string, limit: number = 50): Promise<Verse[]> => {
    const { data, error } = await supabase
      .from('verse')
      .select('*')
      .ilike('text', `%${searchTerm}%`)
      .limit(limit);
    
    if (error) {
      console.error('Erro ao pesquisar versículos:', error);
      throw error;
    }
    
    return data || [];
  },

  /**
   * Carrega livros formatados para o BibleReader
   * Inclui contagem de capítulos e mapeamento de testamento
   */
  getBooksForReader: async (testamentType: 'Old' | 'New'): Promise<BibleBook[]> => {
    const testamentId = testamentType === 'Old' ? 1 : 2;
    const books = await BibleSupabaseService.getBooksByTestament(testamentId);
    
    // Buscar contagem de capítulos para cada livro
    const booksWithChapters = await Promise.all(
      books.map(async (book) => {
        const chapters = await BibleSupabaseService.getBookChapterCount(book.id);
        return {
          id: book.id,
          name: book.name,
          testament: testamentType,
          chapters: chapters
        };
      })
    );
    
    return booksWithChapters;
  }
};

export default BibleSupabaseService;
