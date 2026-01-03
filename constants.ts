
import { BibleBook, ProfileType, VideoItem } from './types';

export const AVATAR_OPTIONS = [
  "🦁", "🐑", "🕊️", "⛵", "📖", "👑", "🛡️", "🔥", "🌟", "🍎", "🌈", "🐟", "🎺", "🪵", "💡"
];

export const SHOP_AVATARS: Record<string, string> = {
  'av_noah': '👴',
  'av_esther': '👸',
  'av_samson': '💪',
  'av_angel': '😇'
};

export const SHOP_ITEMS = [
  { id: 'coloring_book', name: 'Desenho Livre', description: 'Libere a tela para pintar com pincéis!', price: 0, icon: '🖍️', category: 'ARTE' },
  { id: 'pixel_free', name: 'Pixel Livre', description: 'Desenhe o que quiser em pixels!', price: 0, icon: '✨', category: 'ARTE' },
  { id: 'brush_neon', name: 'Pincel Neon', description: 'Pincéis que brilham como a luz do mundo!', price: 0, icon: '🌈', category: 'ARTE' },
  { id: 'color_gold', name: 'Paleta Real', description: 'Cores douradas e prateadas especiais!', price: 0, icon: '🎨', category: 'ARTE' },
  
  { id: 'av_noah', name: 'Noé Herói', description: 'Avatar especial do capitão da Arca!', price: 0, icon: '👴', category: 'AVATAR' },
  { id: 'av_esther', name: 'Rainha Ester', description: 'Avatar da corajosa Rainha Ester!', price: 0, icon: '👸', category: 'AVATAR' },
  { id: 'av_samson', name: 'Sansão Forte', description: 'O homem mais forte da Bíblia!', price: 0, icon: '💪', category: 'AVATAR' },
  { id: 'av_angel', name: 'Anjo da Guarda', description: 'Um mensageiro celestial no seu perfil!', price: 0, icon: '😇', category: 'AVATAR' },
];

export const PROFILE_CONFIGS = {
  [ProfileType.KIDS]: {
    label: 'Crianças',
    icon: '👶',
    color: 'bg-yellow-400',
    description: 'Histórias ilustradas e jogos divertidos!'
  },
  [ProfileType.ADULTS]: {
    label: 'Adultos',
    icon: '👵',
    color: 'bg-emerald-700',
    description: 'Planos de leitura e estudos teológicos.'
  }
};

export const BIBLE_BOOKS: BibleBook[] = [
  { name: 'Gênesis', testament: 'Old', chapters: 50 },
  { name: 'Êxodo', testament: 'Old', chapters: 40 },
  { name: 'Levítico', testament: 'Old', chapters: 27 },
  { name: 'Números', testament: 'Old', chapters: 36 },
  { name: 'Deuteronômio', testament: 'Old', chapters: 34 },
  { name: 'Josué', testament: 'Old', chapters: 24 },
  { name: 'Juízes', testament: 'Old', chapters: 21 },
  { name: 'Rute', testament: 'Old', chapters: 4 },
  { name: 'Salmos', testament: 'Old', chapters: 150 },
  { name: 'Provérbios', testament: 'Old', chapters: 31 },
  { name: 'Isaías', testament: 'Old', chapters: 66 },
  { name: 'Mateus', testament: 'New', chapters: 28 },
  { name: 'Marcos', testament: 'New', chapters: 16 },
  { name: 'Lucas', testament: 'New', chapters: 24 },
  { name: 'João', testament: 'New', chapters: 21 },
  { name: 'Atos', testament: 'New', chapters: 28 },
  { name: 'Romanos', testament: 'New', chapters: 16 },
  { name: 'Filipenses', testament: 'New', chapters: 4 },
  { name: 'Apocalipse', testament: 'New', chapters: 22 },
];

export const MOCK_VERSES = [
  { book: 'Salmos', chapter: 23, verse: 1, text: 'O Senhor é o meu pastor; nada me faltará.' },
  { book: 'Salmos', chapter: 23, verse: 2, text: 'Deitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas.' },
  { book: 'Salmos', chapter: 23, verse: 3, text: 'Refrigera a minha alma; guia-me pelas veredas da justiça, por amor do seu nome.' },
  { book: 'Salmos', chapter: 23, verse: 4, text: 'Ainda que eu andasse pelo vale da sombra da morte, não temeria mal algum, porque tu estás comigo; a tua vara e o teu cajado me consolam.' },
  { book: 'Salmos', chapter: 23, verse: 5, text: 'Preparas uma mesa perante mim na presença dos meus inimigos, unges a minha cabeça com óleo, o meu cálice transborda.' },
  { book: 'Salmos', chapter: 23, verse: 6, text: 'Certamente que a bondade e a misericórdia me seguirão todos os dias da minha vida; e habitarei na casa do Senhor por longos dias.' },
];

export const REWARD_LEVELS = [
  { points: 0, level: 1, title: 'Iniciante na Fé', icon: '🌱' },
  { points: 500, level: 2, title: 'Buscador da Verdade', icon: '🔍' },
  { points: 1500, level: 3, title: 'Pequeno Discípulo', icon: '🧒' },
  { points: 3000, level: 4, title: 'Guerreiro da Palavra', icon: '🛡️' },
  { points: 6000, level: 5, title: 'Mestre do Saber', icon: '🎓' },
  { points: 10000, level: 6, title: 'Luz do Mundo', icon: '💡' },
];

export const VIDEO_LIBRARY: Record<string, VideoItem[]> = {
  [ProfileType.KIDS]: [
    { id: 'v1', title: 'A Criação do Mundo', duration: '05:20', youtubeId: 'teu7Lxtos8Q' },
    { id: 'v2', title: 'Noé e a Grande Arca', duration: '04:45', youtubeId: 'Wmq67m4Hhps' },
    { id: 'v3', title: 'Davi e o Gigante Golias', duration: '06:10', youtubeId: 'X0vLpS0_Xks' },
  ],
  [ProfileType.TEENS]: [],
  [ProfileType.YOUTH]: [],
  [ProfileType.ADULTS]: [
    { id: 'v7', title: 'A Vida de Paulo', duration: '15:45', youtubeId: 'T8XG_Y8hU6g' },
  ]
};
