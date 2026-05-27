import React, { useEffect, useState } from 'react';
import { ProfileData, Coupon, CouponUse } from '../types';
import { ProfileService } from '../services/profileService';
import { CouponService } from '../services/couponService';
import { SHOP_ITEMS } from '../constants';
import { ShopService, ShopItemPrice } from '../services/shopService';
import HomeButton from './HomeButton';

interface AdminPanelProps {
    onBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
    const [profiles, setProfiles] = useState<ProfileData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProfile, setSelectedProfile] = useState<ProfileData | null>(null);
    const [activeTab, setActiveTab] = useState<'USERS' | 'SHOP' | 'COUPONS' | 'CREATE_USER'>('USERS');

    // Create User states
    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserIsAdmin, setNewUserIsAdmin] = useState(false);
    const [newUserIsPremium, setNewUserIsPremium] = useState(false);
    const [isCreatingUser, setIsCreatingUser] = useState(false);

    // Shop states
    const [shopPrices, setShopPrices] = useState<ShopItemPrice[]>([]);
    const [editingItem, setEditingItem] = useState<string | null>(null);
    const [tempPrice, setTempPrice] = useState<number>(0);

    // Form states
    const [editName, setEditName] = useState('');
    const [editBio, setEditBio] = useState('');
    const [editPoints, setEditPoints] = useState(0);
    const [coinAmount, setCoinAmount] = useState<number>(0);
    const [deleteConfirm, setDeleteConfirm] = useState('');

    // Coupons states
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [newCouponCode, setNewCouponCode] = useState('');
    const [newCouponDiscount, setNewCouponDiscount] = useState<number>(10);
    const [newCouponMaxUses, setNewCouponMaxUses] = useState<number>(0);

    // Coupon Report states
    const [selectedCouponForReport, setSelectedCouponForReport] = useState<Coupon | null>(null);
    const [couponUses, setCouponUses] = useState<CouponUse[]>([]);
    const [loadingReport, setLoadingReport] = useState(false);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUserName || !newUserEmail || !newUserPassword) {
            return alert('Preencha todos os campos obrigatórios.');
        }

        setIsCreatingUser(true);
        try {
            const res = await fetch('/api/admin/create-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: newUserEmail,
                    password: newUserPassword,
                    fullName: newUserName,
                    isAdmin: newUserIsAdmin,
                    isPremium: newUserIsPremium
                })
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.error || 'Erro ao criar usuário');
            
            alert('Usuário criado com sucesso!');
            setNewUserName('');
            setNewUserEmail('');
            setNewUserPassword('');
            setNewUserIsAdmin(false);
            setNewUserIsPremium(false);
            
            if (activeTab === 'USERS') {
                loadProfiles();
            }
        } catch (err: any) {
            alert(err.message || 'Erro desconhecido');
        } finally {
            setIsCreatingUser(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'USERS') {
            loadProfiles();
        } else if (activeTab === 'SHOP') {
            loadShopPrices();
        } else if (activeTab === 'COUPONS') {
            loadCoupons();
        }
    }, [activeTab]);

    const loadShopPrices = async () => {
        setLoading(true);
        const prices = await ShopService.getAllPrices();
        setShopPrices(prices);
        setLoading(false);
    };

    const loadCoupons = async () => {
        setLoading(true);
        const allCoupons = await CouponService.getAllCoupons();
        setCoupons(allCoupons);
        setLoading(false);
    };

    const handleCreateCoupon = async () => {
        if (!newCouponCode) return alert('Digite um código para o cupom.');
        if (newCouponDiscount <= 0 || newCouponDiscount > 100) return alert('Desconto deve ser entre 1 e 100.');
        
        const coupon = await CouponService.createCoupon({
            code: newCouponCode,
            discount_percent: newCouponDiscount,
            max_uses: newCouponMaxUses,
            active: true
        });

        if (coupon) {
            setCoupons([coupon, ...coupons]);
            setNewCouponCode('');
            setNewCouponDiscount(10);
            setNewCouponMaxUses(0);
            alert('Cupom criado com sucesso!');
        } else {
            alert('Erro ao criar cupom. Verifique se o código já existe.');
        }
    };

    const handleToggleCoupon = async (coupon: Coupon) => {
        const success = await CouponService.toggleCouponStatus(coupon.id, coupon.active);
        if (success) {
            setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, active: !coupon.active } : c));
        }
    };

    const handleDeleteCoupon = async (id: string) => {
        if (confirm('Tem certeza que deseja deletar este cupom?')) {
            const success = await CouponService.deleteCoupon(id);
            if (success) {
                setCoupons(prev => prev.filter(c => c.id !== id));
            }
        }
    };

    const handleViewReport = async (coupon: Coupon) => {
        setSelectedCouponForReport(coupon);
        setLoadingReport(true);
        const uses = await CouponService.getCouponUses(coupon.id);
        setCouponUses(uses);
        setLoadingReport(false);
    };

    const handleEditPrice = (itemId: string, currentPrice: number) => {
        setEditingItem(itemId);
        setTempPrice(currentPrice);
    };

    const handleSavePrice = async (itemId: string) => {
        const success = await ShopService.updatePrice(itemId, tempPrice);
        if (success) {
            setShopPrices(prev => {
                const existing = prev.find(p => p.id === itemId);
                if (existing) {
                    return prev.map(p => p.id === itemId ? { ...p, price: tempPrice } : p);
                }
                return [...prev, { id: itemId, price: tempPrice }];
            });
            setEditingItem(null);
        } else {
            alert('Erro ao salvar preço.');
        }
    };

    const loadProfiles = async () => {
        setLoading(true);
        const allProfiles = await ProfileService.getAllAllProfiles();
        setProfiles(allProfiles as unknown as ProfileData[]);
        setLoading(false);
    };

    const handleOpenManage = (profile: ProfileData) => {
        setSelectedProfile(profile);
        setEditName(profile.name);
        setEditBio(profile.bio || '');
        setEditPoints(profile.points);
        setCoinAmount(0);
        setDeleteConfirm('');
    };

    const handleSaveDetails = async () => {
        if (!selectedProfile) return;

        const success = await ProfileService.updateProfile(selectedProfile.id, {
            name: editName,
            bio: editBio,
            points: editPoints
        });

        if (success) {
            setProfiles(prev => prev.map(p => p.id === selectedProfile.id ? { ...p, name: editName, bio: editBio, points: editPoints } : p));
            alert('Dados atualizados com sucesso!');
        } else {
            alert('Erro ao atualizar dados.');
        }
    };

    const handleAddCoins = async () => {
        if (!selectedProfile || coinAmount === 0) return;

        const success = await ProfileService.addRewards(selectedProfile.id, 0, coinAmount);
        if (success) {
            alert(`Adicionado ${coinAmount} moedas com sucesso!`);
            setProfiles(prev => prev.map(p => p.id === selectedProfile.id ? { ...p, coins: (p.coins || 0) + coinAmount } : p));
            setCoinAmount(0);
        } else {
            alert("Erro ao adicionar moedas.");
        }
    };

    const handleToggleBlock = async (profile: ProfileData) => {
        const newStatus = !profile.is_blocked;
        const success = await ProfileService.updateProfileStatus(profile.id, { is_blocked: newStatus });
        if (success) {
            setProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, is_blocked: newStatus } : p));
        } else {
            alert("Erro ao atualizar status.");
        }
    };

    const handleTogglePremium = async (profile: ProfileData) => {
        const currentPremium = profile.account?.is_premium || false;
        const newPremium = !currentPremium;
        
        // AccountService is used to update account-level data
        const { AccountService } = await import('../services/accountService');
        const success = await AccountService.updatePremium(profile.account_id, newPremium);
        
        if (success) {
            setProfiles(prev => prev.map(p => {
                if (p.id === profile.id) {
                    return { ...p, account: { ...p.account, is_premium: newPremium } };
                }
                // Update all profiles belonging to the same account
                if (p.account_id === profile.account_id) {
                     return { ...p, account: { ...p.account, is_premium: newPremium } };
                }
                return p;
            }));

            // If the modal is open for this profile or another profile of the same account, update it too
            if (selectedProfile && selectedProfile.account_id === profile.account_id) {
                setSelectedProfile(prev => prev ? { ...prev, account: { ...prev.account, is_premium: newPremium } } : null);
            }

            alert(`Acesso Premium ${newPremium ? 'concedido' : 'removido'} com sucesso!`);
        } else {
            alert("Erro ao atualizar status premium.");
        }
    };

    const handleDeleteProfile = async () => {
        if (!selectedProfile) return;
        if (deleteConfirm !== 'DELETAR') {
            alert('Digite DELETAR para confirmar.');
            return;
        }

        if (confirm(`Tem certeza absoluta que deseja excluir o perfil de ${selectedProfile.name}? Esta ação é irreversível.`)) {
            const success = await ProfileService.deleteProfile(selectedProfile.id);
            if (success) {
                setProfiles(prev => prev.filter(p => p.id !== selectedProfile.id));
                setSelectedProfile(null);
                alert('Perfil excluído com sucesso.');
            } else {
                alert('Erro ao excluir perfil.');
            }
        }
    };

    return (
        <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-32 font-outfit relative">

            {/* Background Blobs */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 bg-blob-indigo opacity-50 fixed pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 bg-blob-pink opacity-50 fixed pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-8 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl p-6 rounded-[2rem] shadow-lg border border-white/50 dark:border-gray-800/50">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-gray-800 dark:text-white tracking-tight">Painel Administrativo</h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Gerenciamento Geral</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-xl backdrop-blur-sm">
                            <button
                                onClick={() => setActiveTab('USERS')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'USERS' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                            >
                                Usuários
                            </button>
                            <button
                                onClick={() => setActiveTab('SHOP')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'SHOP' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                            >
                                Loja
                            </button>
                            <button
                                onClick={() => setActiveTab('COUPONS')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'COUPONS' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                            >
                                Cupons
                            </button>
                            <button
                                onClick={() => setActiveTab('CREATE_USER')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'CREATE_USER' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                            >
                                Criar Usuário
                            </button>
                        </div>
                        <HomeButton onClick={onBack} label="Voltar" className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-none border-none hover:bg-gray-200 dark:hover:bg-gray-700" />
                    </div>
                </div>

                {
                    activeTab === 'USERS' ? (
                        <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl rounded-[2rem] p-6 shadow-xl border border-white/50 dark:border-gray-800/50 overflow-hidden">
                            {loading ? (
                                <div className="p-20 text-center text-gray-500 flex flex-col items-center">
                                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                                    <p className="font-bold">Carregando perfis...</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-100 dark:border-gray-700">
                                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Avatar</th>
                                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Nome/ID</th>
                                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Estatísticas</th>
                                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Plano</th>
                                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Status</th>
                                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {profiles.map(profile => (
                                                <tr key={profile.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors">
                                                    <td className="p-4">
                                                        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden flex items-center justify-center text-2xl shadow-sm border-2 border-white dark:border-gray-700">
                                                            {profile.avatar?.startsWith('data:') ? <img src={profile.avatar} className="w-full h-full object-cover" /> : (profile.avatar || '👤')}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                                                {profile.name}
                                                                {profile.is_admin && <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 px-1.5 py-0.5 rounded text-[9px] uppercase font-black tracking-wider">Admin</span>}
                                                            </span>
                                                            <span className="text-[10px] text-gray-400 font-mono mt-1 select-all">{profile.id}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex gap-3 text-xs font-bold">
                                                            <span className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg border border-amber-100 dark:border-amber-900/30">🪙 {profile.coins}</span>
                                                            <span className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg border border-blue-100 dark:border-blue-900/30">⭐ {profile.points}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex flex-col gap-1">
                                                            {profile.account?.is_premium ? (
                                                                <span className="w-max bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider uppercase border border-indigo-200 dark:border-indigo-800">
                                                                    Premium
                                                                </span>
                                                            ) : (
                                                                <span className="w-max bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider uppercase border border-gray-200 dark:border-gray-700">
                                                                    Gratuito
                                                                </span>
                                                            )}
                                                            <button 
                                                                onClick={() => handleTogglePremium(profile)}
                                                                className="w-max text-[9px] font-bold text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-widest"
                                                            >
                                                                Mudar Plano
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        {profile.is_blocked ? (
                                                            <span className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-xs font-bold border border-red-200 dark:border-red-900/30">BLOQUEADO</span>
                                                        ) : (
                                                            <span className="bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-900/30">ATIVO</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleToggleBlock(profile)}
                                                                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors border ${profile.is_blocked ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900/30 dark:text-emerald-400' : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400'}`}
                                                                title={profile.is_blocked ? "Desbloquear" : "Bloquear"}
                                                            >
                                                                {profile.is_blocked ? '🔓' : '🔒'}
                                                            </button>
                                                            <button
                                                                onClick={() => handleOpenManage(profile)}
                                                                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold shadow-lg shadow-indigo-500/20 dark:shadow-none transition-transform active:scale-95"
                                                            >
                                                                Gerenciar
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ) : activeTab === 'SHOP' ? (
                        <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl rounded-[2rem] p-6 shadow-xl border border-white/50 dark:border-gray-800/50 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-100 dark:border-gray-700">
                                            <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Item</th>
                                            <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Categoria</th>
                                            <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Preço Padrão</th>
                                            <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Preço Atual</th>
                                            <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {SHOP_ITEMS.map(item => {
                                            const customPrice = shopPrices.find(p => p.id === item.id)?.price;
                                            const currentPrice = customPrice !== undefined ? customPrice : item.price;
                                            const isEditing = editingItem === item.id;

                                            return (
                                                <tr key={item.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors">
                                                    <td className="p-4 flex items-center gap-3">
                                                        <span className="text-2xl drop-shadow-sm">{item.icon}</span>
                                                        <span className="font-bold text-gray-800 dark:text-white">{item.name}</span>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md text-gray-500 font-bold border border-gray-200 dark:border-gray-700">{item.category}</span>
                                                    </td>
                                                    <td className="p-4 text-gray-400 font-mono text-sm font-bold opacity-70">
                                                        {item.price}
                                                    </td>
                                                    <td className="p-4">
                                                        {isEditing ? (
                                                            <input
                                                                type="number"
                                                                value={tempPrice}
                                                                onChange={e => setTempPrice(Number(e.target.value))}
                                                                className="w-24 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-1 font-bold text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-500"
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <span className={`font-bold ${customPrice !== undefined ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                                                {currentPrice}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        {isEditing ? (
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleSavePrice(item.id)}
                                                                    className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                                                                >
                                                                    Salvar
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingItem(null)}
                                                                    className="px-3 py-1 bg-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-300"
                                                                >
                                                                    Cancelar
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleEditPrice(item.id, currentPrice)}
                                                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-xs font-bold uppercase tracking-wider"
                                                            >
                                                                Editar
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : activeTab === 'COUPONS' ? (
                        <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl rounded-[2rem] p-6 shadow-xl border border-white/50 dark:border-gray-800/50 overflow-hidden">
                            <div className="mb-8 bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                                <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-400 mb-4">Gerar Novo Cupom</h3>
                                <div className="flex flex-wrap gap-4 items-end">
                                    <div className="flex-1 min-w-[200px]">
                                        <label className="block text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1 uppercase tracking-wider">Código do Cupom</label>
                                        <input type="text" value={newCouponCode} onChange={e => setNewCouponCode(e.target.value.toUpperCase())} placeholder="Ex: PROMO50" className="w-full bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-800 rounded-lg px-4 py-2 font-bold text-gray-800 dark:text-white uppercase" />
                                    </div>
                                    <div className="w-32">
                                        <label className="block text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1 uppercase tracking-wider">Desconto (%)</label>
                                        <input type="number" min="1" max="100" value={newCouponDiscount} onChange={e => setNewCouponDiscount(Number(e.target.value))} className="w-full bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-800 rounded-lg px-4 py-2 font-bold text-gray-800 dark:text-white text-center" />
                                    </div>
                                    <div className="w-32">
                                        <label className="block text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1 uppercase tracking-wider">Lim. Usos (0=∞)</label>
                                        <input type="number" min="0" value={newCouponMaxUses} onChange={e => setNewCouponMaxUses(Number(e.target.value))} className="w-full bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-800 rounded-lg px-4 py-2 font-bold text-gray-800 dark:text-white text-center" />
                                    </div>
                                    <button onClick={handleCreateCoupon} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all h-[42px]">
                                        Criar
                                    </button>
                                </div>
                            </div>

                            {loading ? (
                                <div className="p-10 text-center text-gray-500">Carregando cupons...</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-100 dark:border-gray-700">
                                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Código</th>
                                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Desconto</th>
                                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Usos</th>
                                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Status</th>
                                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 text-right">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {coupons.map(coupon => (
                                                <tr key={coupon.id} className={`border-b border-gray-50 dark:border-gray-800/50 transition-colors ${!coupon.active ? 'opacity-50' : 'hover:bg-white/50 dark:hover:bg-gray-800/50'}`}>
                                                    <td className="p-4 font-black text-indigo-700 dark:text-indigo-400">{coupon.code}</td>
                                                    <td className="p-4 font-bold text-gray-800 dark:text-gray-200">{coupon.discount_percent}%</td>
                                                    <td className="p-4 font-medium text-gray-600 dark:text-gray-400">
                                                        {coupon.times_used} / {coupon.max_uses === 0 ? '∞' : coupon.max_uses}
                                                    </td>
                                                    <td className="p-4">
                                                        {coupon.active ? (
                                                            <span className="bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black tracking-wider border border-emerald-200 dark:border-emerald-900/30">ATIVO</span>
                                                        ) : (
                                                            <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-3 py-1 rounded-full text-[10px] font-black tracking-wider border border-gray-200 dark:border-gray-700">INATIVO</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-right flex items-center justify-end gap-2">
                                                        <button onClick={() => handleViewReport(coupon)} className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded text-xs font-bold">
                                                            Relatório
                                                        </button>
                                                        <button onClick={() => handleToggleCoupon(coupon)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-bold">
                                                            {coupon.active ? 'Desativar' : 'Ativar'}
                                                        </button>
                                                        <button onClick={() => handleDeleteCoupon(coupon.id)} className="px-3 py-1 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded text-xs font-bold">
                                                            Excluir
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {coupons.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="p-8 text-center text-gray-400 font-medium">Nenhum cupom gerado ainda.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ) : activeTab === 'CREATE_USER' ? (
                        <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl rounded-[2rem] p-6 shadow-xl border border-white/50 dark:border-gray-800/50 overflow-hidden">
                            <div className="max-w-md mx-auto">
                                <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-6">Cadastrar Novo Usuário</h3>
                                <form onSubmit={handleCreateUser} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Nome Completo</label>
                                        <input
                                            type="text"
                                            value={newUserName}
                                            onChange={e => setNewUserName(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 font-bold text-gray-800 dark:text-white focus:border-indigo-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">E-mail</label>
                                        <input
                                            type="email"
                                            value={newUserEmail}
                                            onChange={e => setNewUserEmail(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 font-bold text-gray-800 dark:text-white focus:border-indigo-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Senha</label>
                                        <input
                                            type="password"
                                            value={newUserPassword}
                                            onChange={e => setNewUserPassword(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 font-bold text-gray-800 dark:text-white focus:border-indigo-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 pt-2">
                                        <input
                                            type="checkbox"
                                            id="isAdminCheck"
                                            checked={newUserIsAdmin}
                                            onChange={e => setNewUserIsAdmin(e.target.checked)}
                                            className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                        />
                                        <label htmlFor="isAdminCheck" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                            Conceder acesso de Administrador
                                        </label>
                                    </div>
                                    <div className="flex items-center gap-2 pt-2">
                                        <input
                                            type="checkbox"
                                            id="isPremiumCheck"
                                            checked={newUserIsPremium}
                                            onChange={e => setNewUserIsPremium(e.target.checked)}
                                            className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                        />
                                        <label htmlFor="isPremiumCheck" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                            Conceder Acesso Premium Gratuito
                                        </label>
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={isCreatingUser}
                                        className="w-full mt-4 bg-indigo-600 text-white font-black text-lg py-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isCreatingUser ? 'Criando Usuário...' : 'Criar Usuário'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    ) : null
                }

                {/* Modal de Gerenciamento Estendido */}
                {
                    selectedProfile && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setSelectedProfile(null)}>
                            <div className="bg-white dark:bg-gray-900 rounded-[2rem] max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-white/10" onClick={e => e.stopPropagation()}>

                                {/* Header do Modal */}
                                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                                    <div>
                                        <h3 className="text-2xl font-black font-outfit text-gray-800 dark:text-white">Gerenciar Perfil</h3>
                                        <p className="text-xs text-gray-500 font-mono mt-1">{selectedProfile.id}</p>
                                    </div>
                                    <button onClick={() => setSelectedProfile(null)} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors">✕</button>
                                </div>

                                <div className="p-6 overflow-y-auto space-y-8 bg-white dark:bg-gray-900">

                                    {/* Seção 1: Dados Básicos */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 border-b border-indigo-100 dark:border-indigo-900/30 pb-2">Dados Básicos & Pontuação</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-1">Nome</label>
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={e => setEditName(e.target.value)}
                                                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 font-bold text-gray-800 dark:text-white focus:border-indigo-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-1">Pontos (XP)</label>
                                                <input
                                                    type="number"
                                                    value={editPoints}
                                                    onChange={e => setEditPoints(Number(e.target.value))}
                                                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 font-bold text-gray-800 dark:text-white focus:border-indigo-500 outline-none"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-bold text-gray-500 mb-1">Bio</label>
                                                <textarea
                                                    value={editBio}
                                                    onChange={e => setEditBio(e.target.value)}
                                                    rows={2}
                                                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 font-medium text-sm text-gray-800 dark:text-white focus:border-indigo-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end">
                                            <button onClick={handleSaveDetails} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20">
                                                Salvar Alterações
                                            </button>
                                        </div>
                                    </div>

                                    {/* Seção 2: Economia */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold uppercase tracking-widest text-amber-600 dark:text-amber-500 border-b border-amber-100 dark:border-amber-900/30 pb-2">Economia (Moedas)</h4>
                                        <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl flex flex-col md:flex-row items-center gap-4 border border-amber-100 dark:border-amber-900/30">
                                            <div className="text-center md:text-left">
                                                <div className="text-xs text-amber-800 dark:text-amber-500 font-bold uppercase">Saldo Atual</div>
                                                <div className="text-3xl font-black text-amber-600 dark:text-amber-500">{selectedProfile.coins}</div>
                                            </div>
                                            <div className="flex-1 w-full pl-0 md:pl-8 border-t md:border-t-0 md:border-l border-amber-200 dark:border-amber-800 pt-4 md:pt-0">
                                                <label className="block text-xs font-bold text-gray-500 mb-1">Adicionar / Remover</label>
                                                <div className="flex gap-2">
                                                    <button onClick={() => setCoinAmount(prev => prev - 100)} className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg font-bold text-xs hover:bg-red-200 dark:hover:bg-red-900/50">-100</button>
                                                    <button onClick={() => setCoinAmount(prev => prev - 10)} className="px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg font-bold text-xs hover:bg-red-100 dark:hover:bg-red-900/40">-10</button>
                                                    <input
                                                        type="number"
                                                        value={coinAmount}
                                                        onChange={e => setCoinAmount(Number(e.target.value))}
                                                        className="flex-1 min-w-0 bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-800 rounded-lg px-3 text-center font-bold text-gray-800 dark:text-white"
                                                    />
                                                    <button onClick={() => setCoinAmount(prev => prev + 10)} className="px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg font-bold text-xs hover:bg-emerald-100 dark:hover:bg-emerald-900/40">+10</button>
                                                    <button onClick={() => setCoinAmount(prev => prev + 100)} className="px-3 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg font-bold text-xs hover:bg-emerald-200 dark:hover:bg-emerald-900/50">+100</button>
                                                </div>
                                                <button onClick={handleAddCoins} className="w-full mt-2 bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-amber-500/20">
                                                    Confirmar Transação
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Seção Nova: Assinatura & Acesso */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 border-b border-indigo-100 dark:border-indigo-900/30 pb-2">Assinatura & Acesso</h4>
                                        <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-xl flex items-center justify-between border border-indigo-100 dark:border-indigo-900/30">
                                            <div>
                                                <div className="text-xs text-indigo-800 dark:text-indigo-400 font-bold uppercase mb-1">Plano Atual</div>
                                                {selectedProfile.account?.is_premium ? (
                                                    <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase shadow-sm">
                                                        Acesso Premium
                                                    </span>
                                                ) : (
                                                    <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase">
                                                        Conta Gratuita
                                                    </span>
                                                )}
                                            </div>
                                            <button 
                                                onClick={() => handleTogglePremium(selectedProfile)}
                                                className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-md ${selectedProfile.account?.is_premium ? 'bg-white text-red-600 hover:bg-red-50 border border-red-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/20'}`}
                                            >
                                                {selectedProfile.account?.is_premium ? 'Revogar Premium' : 'Conceder Premium'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Seção 3: Zona de Perigo */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold uppercase tracking-widest text-red-600 dark:text-red-500 border-b border-red-100 dark:border-red-900/30 pb-2">Zona de Perigo</h4>
                                        <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/30">
                                            <p className="text-sm text-red-800 dark:text-red-400 mb-4 font-medium">
                                                Para excluir este perfil permanentemente, digite <span className="font-black select-all">DELETAR</span> abaixo.
                                                Isso apagará todo o progresso, galeria e gravações.
                                            </p>
                                            <div className="flex gap-3">
                                                <input
                                                    type="text"
                                                    value={deleteConfirm}
                                                    onChange={e => setDeleteConfirm(e.target.value)}
                                                    placeholder="Digite DELETAR"
                                                    className="flex-1 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-lg px-4 font-bold text-red-600 placeholder-red-200 dark:text-white focus:border-red-500 outline-none"
                                                />
                                                <button
                                                    onClick={handleDeleteProfile}
                                                    disabled={deleteConfirm !== 'DELETAR'}
                                                    className="bg-red-600 text-white px-6 rounded-lg font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-600/20"
                                                >
                                                    Excluir Perfil
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Modal de Relatório de Cupom */}
                {
                    selectedCouponForReport && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setSelectedCouponForReport(null)}>
                            <div className="bg-white dark:bg-gray-900 rounded-[2rem] max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-white/10" onClick={e => e.stopPropagation()}>
                                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                                    <div>
                                        <h3 className="text-2xl font-black font-outfit text-gray-800 dark:text-white">Uso do Cupom: <span className="text-indigo-600 dark:text-indigo-400">{selectedCouponForReport.code}</span></h3>
                                        <p className="text-xs text-gray-500 font-medium mt-1">
                                            Utilizado {selectedCouponForReport.times_used} {selectedCouponForReport.max_uses > 0 ? `/ ${selectedCouponForReport.max_uses}` : ''} vezes
                                        </p>
                                    </div>
                                    <button onClick={() => setSelectedCouponForReport(null)} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors">✕</button>
                                </div>
                                <div className="p-6 overflow-y-auto space-y-4 bg-white dark:bg-gray-900 flex-1">
                                    {loadingReport ? (
                                        <div className="p-10 text-center text-gray-500 font-bold">Carregando relatório...</div>
                                    ) : couponUses.length === 0 ? (
                                        <div className="p-10 text-center text-gray-400 font-medium bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                                            Nenhum usuário utilizou este cupom ainda.
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {couponUses.map(use => (
                                                <div key={use.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                                    <div>
                                                        <div className="font-bold text-gray-800 dark:text-gray-200">{use.account?.full_name || 'Usuário Desconhecido'}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{use.account?.email || 'Email não disponível'}</div>
                                                    </div>
                                                    <div className="mt-2 sm:mt-0 text-xs font-bold text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 px-3 py-1 rounded-lg border border-gray-100 dark:border-gray-700">
                                                        {new Date(use.used_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                }
            </div>
        </div >
    );
};

export default AdminPanel;
