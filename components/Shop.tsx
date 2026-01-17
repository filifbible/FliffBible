

import React, { useState, useEffect } from 'react';
import { SHOP_ITEMS } from '../constants';

interface ShopProps {
  coins: number;
  unlockedItems: string[];
  onBuy: (item: typeof SHOP_ITEMS[0]) => void;
  onBack: () => void;
}

const CATEGORIES = [
  { id: 'ARTE', name: 'Arte', icon: '🎨', status: 'ACTIVE' },
  { id: 'AVATAR', name: 'Avatares', icon: '👤', status: 'ACTIVE' },
  { id: 'PIXEL', name: 'Pixel Art', icon: '👾', status: 'COMING_SOON' },
  { id: 'ESPECIAL', name: 'Especial', icon: '✨', status: 'COMING_SOON' },
  { id: 'MISTÉRIO', name: 'Mistério', icon: '🎁', status: 'COMING_SOON' },
];

import { ShopService } from '../services/shopService';

const Shop: React.FC<ShopProps> = ({ coins, unlockedItems, onBuy, onBack }) => {
  const [activeTab, setActiveTab] = useState('ARTE');
  const [celebratingItem, setCelebratingItem] = useState<string | null>(null);
  const [items, setItems] = useState(SHOP_ITEMS);

  useEffect(() => {
    loadPrices();
  }, []);

  const loadPrices = async () => {
    const overrides = await ShopService.getAllPrices();
    if (overrides.length > 0) {
      setItems(currentItems => currentItems.map(item => {
        const override = overrides.find(o => o.id === item.id);
        return override ? { ...item, price: override.price } : item;
      }));
    }
  };

  const filteredItems = items.filter(item => item.category === activeTab);

  const handlePurchase = (item: typeof SHOP_ITEMS[0]) => {
    onBuy(item);
    setCelebratingItem(item.id);
    setTimeout(() => setCelebratingItem(null), 3000);
  };


  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto animate-in fade-in duration-700">
      {/* Header com Saldo */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6 bg-white dark:bg-gray-800 p-8 rounded-[3rem] shadow-xl border-4 border-indigo-50 dark:border-gray-700 relative">
        <button
          onClick={onBack}
          className="absolute top-8 left-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors hidden md:block"
        >
          ⬅️
        </button>
        <div className="text-center md:text-left md:pl-20">
          <h2 className="text-4xl md:text-5xl font-black font-outfit text-indigo-900 dark:text-indigo-400">Lojinha do FiliF</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium italic">Troque sua dedicação por tesouros incríveis!</p>
        </div>
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-8 py-5 rounded-[2rem] shadow-lg flex items-center space-x-4 transform hover:scale-105 transition-transform border-4 border-white/30">
          <span className="text-4xl drop-shadow-md">🪙</span>
          <div className="flex flex-col">
            <span className="text-3xl font-black text-white leading-none">{coins}</span>
            <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">Moedas da Fé</span>
          </div>
        </div>
      </div>

      {/* Navegação por Categorias */}
      <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar mb-8 mask-fade-right">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => cat.status === 'ACTIVE' && setActiveTab(cat.id)}
            className={`flex items-center space-x-3 px-8 py-4 rounded-2xl font-black whitespace-nowrap transition-all shadow-md active:scale-95 ${activeTab === cat.id
              ? 'bg-indigo-600 text-white scale-105'
              : cat.status === 'COMING_SOON'
                ? 'bg-gray-100 dark:bg-gray-900 text-gray-300 dark:text-gray-700 cursor-not-allowed border border-dashed border-gray-200 dark:border-gray-800'
                : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700 hover:bg-indigo-50'
              }`}
          >
            <span className={`text-2xl ${cat.status === 'COMING_SOON' ? 'grayscale opacity-50' : ''}`}>{cat.icon}</span>
            <div className="flex flex-col items-start">
              <span className="text-sm uppercase tracking-wider">{cat.name}</span>
              {cat.status === 'COMING_SOON' && <span className="text-[8px] font-bold text-gray-400 animate-pulse">EM BREVE</span>}
            </div>
          </button>
        ))}
      </div>

      {/* Grid de Itens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
        {filteredItems.map((item) => {
          const isUnlocked = unlockedItems.includes(item.id);
          const canAfford = coins >= item.price;
          const isCelebrating = celebratingItem === item.id;

          return (
            <div
              key={item.id}
              className={`group bg-white dark:bg-gray-800 rounded-[3rem] p-6 shadow-xl border-4 transition-all flex flex-col items-center text-center relative overflow-hidden ${isCelebrating ? 'animate-bounce border-yellow-400 z-50' :
                isUnlocked ? 'border-emerald-100 dark:border-emerald-900/40 opacity-90' : 'border-transparent hover:border-indigo-100 dark:hover:border-gray-600'
                }`}
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform"></div>

              <div className="w-24 h-24 rounded-[2rem] bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-6xl mb-6 shadow-inner transform group-hover:rotate-6 transition-transform relative z-10">
                {item.icon}
                {isCelebrating && <span className="absolute -top-4 -right-4 text-4xl animate-ping">✨</span>}
              </div>

              <div className="flex-1 relative z-10">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-2 block">{item.category}</span>
                <h3 className="text-xl font-black text-gray-800 dark:text-white mb-2 leading-tight">{item.name}</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-6 font-medium leading-relaxed">{item.description}</p>
              </div>

              <button
                disabled={isUnlocked || !canAfford}
                onClick={() => handlePurchase(item)}
                className={`w-full py-5 rounded-[2rem] font-black text-lg shadow-lg transition-all flex items-center justify-center space-x-3 relative z-10 ${isUnlocked
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 cursor-default'
                  : canAfford
                    ? 'bg-indigo-600 text-white hover:scale-105 active:scale-95 hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed grayscale'
                  }`}
              >
                {isUnlocked ? (
                  <><span>Adquirido</span><span className="text-xl">✓</span></>
                ) : (
                  <>
                    <span className="text-xl">🪙</span>
                    <span className="text-2xl">{item.price}</span>
                  </>
                )}
              </button>

              {!isUnlocked && !canAfford && (
                <div className="mt-4 flex items-center justify-center space-x-1 text-red-400">
                  <span className="text-[10px] font-black uppercase tracking-tighter">Faltam {item.price - coins} moedas</span>
                </div>
              )}

              {isUnlocked && (
                <div className="absolute top-4 right-4 bg-emerald-500 text-white p-2 rounded-full shadow-md">
                  <span className="text-xs font-black">✓</span>
                </div>
              )}
            </div>
          );
        })}

        {(filteredItems.length === 0 || CATEGORIES.find(c => c.id === activeTab)?.status === 'COMING_SOON') && (
          <div className="col-span-full py-20 text-center flex flex-col items-center">
            <span className="text-7xl opacity-20 grayscale mb-4">📦</span>
            <h4 className="text-gray-400 font-black text-2xl uppercase tracking-widest">Em breve!</h4>
            <p className="text-gray-400 font-bold mt-2 max-w-xs">Nossos anjos estão preparando tesouros incríveis para esta aba.</p>
          </div>
        )}
      </div>

      {/* Dicas de Ganho */}
      <div className="bg-indigo-50 dark:bg-indigo-900/10 p-10 rounded-[4rem] border-4 border-dashed border-indigo-100 dark:border-indigo-800">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-black text-indigo-900 dark:text-indigo-400">Como encher meu cofrinho? 🐖</h3>
          <p className="text-indigo-400 text-sm font-medium">Missões diárias são o segredo!</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] shadow-sm flex flex-col items-center text-center">
            <span className="text-5xl mb-4">📖</span>
            <p className="text-xs font-black text-gray-700 dark:text-white uppercase tracking-widest mb-2">Desafio do Versículo</p>
            <p className="text-[10px] text-gray-400">+1 Moeda por dia</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] shadow-sm flex flex-col items-center text-center">
            <span className="text-5xl mb-4">🧠</span>
            <p className="text-xs font-black text-gray-700 dark:text-white uppercase tracking-widest mb-2">Jogo de Memória</p>
            <p className="text-[10px] text-gray-400">Até +2 Moedas por vitória</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] shadow-sm flex flex-col items-center text-center">
            <span className="text-5xl mb-4">📸</span>
            <p className="text-xs font-black text-gray-700 dark:text-white uppercase tracking-widest mb-2">Missão Criativa</p>
            <p className="text-[10px] text-gray-400">+1 Moeda por foto salva</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
