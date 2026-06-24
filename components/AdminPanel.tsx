import React, { useEffect, useState } from 'react';
import { ProfileData, Coupon, CouponUse } from '../types';
import { ProfileService } from '../services/profileService';
import { CouponService } from '../services/couponService';
import { SHOP_ITEMS } from '../constants';
import { ShopService, ShopItemPrice } from '../services/shopService';
import { NoticeService } from '../services/noticeService';
import { Notice } from '../types';
import { AdminLogService, AdminLog } from '../services/adminLogService';
import { MaintenanceService, MaintenanceSettings } from '../services/maintenanceService';
import { ArtMissionDbService, ArtMissionDb } from '../services/artMissionDbService';
import { ReadingMissionDbService, ReadingMissionDb } from '../services/readingMissionDbService';
import HomeButton from './HomeButton';

interface AdminPanelProps {
    onBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
    const [profiles, setProfiles] = useState<ProfileData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProfile, setSelectedProfile] = useState<ProfileData | null>(null);
    const [activeTab, setActiveTab] = useState<'USERS' | 'SHOP' | 'COUPONS' | 'CREATE_USER' | 'FATURAMENTO' | 'AVISOS' | 'LOGS' | 'MANUTENCAO' | 'MISSOES' | 'MISSAO_LEITURA'>('USERS');

    // Reading Missions states
    const [readingMissions, setReadingMissions] = useState<ReadingMissionDb[]>([]);
    const [loadingReadingMissions, setLoadingReadingMissions] = useState(false);
    const [newReadingMissionRef, setNewReadingMissionRef] = useState('');
    const [newReadingMissionText, setNewReadingMissionText] = useState('');
    const [newReadingMissionHint, setNewReadingMissionHint] = useState('');
    const [newReadingMissionQuestion, setNewReadingMissionQuestion] = useState('');
    const [newReadingMissionOptionsStr, setNewReadingMissionOptionsStr] = useState('');
    const [newReadingMissionCorrectIndex, setNewReadingMissionCorrectIndex] = useState<number>(0);
    const [isCreatingReadingMission, setIsCreatingReadingMission] = useState(false);
    // Logs states
    const [logs, setLogs] = useState<AdminLog[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    // Admin identity (for logs)
    const [adminName, setAdminName] = useState('Admin');
    const [adminProfileId, setAdminProfileId] = useState('');

    // Avisos states
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loadingNotices, setLoadingNotices] = useState(false);
    const [newNoticeTitle, setNewNoticeTitle] = useState('');
    const [newNoticeContent, setNewNoticeContent] = useState('');
    const [isCreatingNotice, setIsCreatingNotice] = useState(false);

    // Create User states
    const [newUserName, setNewUserName] = useState('');

    // Missions states
    const [missions, setMissions] = useState<ArtMissionDb[]>([]);
    const [loadingMissions, setLoadingMissions] = useState(false);
    const [newMissionTitle, setNewMissionTitle] = useState('');
    const [newMissionInstruction, setNewMissionInstruction] = useState('');
    const [newMissionIcon, setNewMissionIcon] = useState('🎨');
    const [isCreatingMission, setIsCreatingMission] = useState(false);
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

    // Revenue states
    const [revenueData, setRevenueData] = useState<{ totalRevenue: number; transactionsCount: number; items: any[] } | null>(null);
    const [revenueMonth, setRevenueMonth] = useState<number>(new Date().getMonth() + 1);
    const [revenueYear, setRevenueYear] = useState<number>(new Date().getFullYear());
    const [loadingRevenue, setLoadingRevenue] = useState(false);

    // Maintenance states
    const [maintenanceSettings, setMaintenanceSettings] = useState<MaintenanceSettings>({
        is_active: false,
        message: 'Estamos realizando melhorias para oferecer uma experiência ainda melhor. Voltaremos em breve!',
        title: 'Sistema em Manutenção',
        estimated_return: null,
    });
    const [loadingMaintenance, setLoadingMaintenance] = useState(false);
    const [savingMaintenance, setSavingMaintenance] = useState(false);

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
        } else if (activeTab === 'FATURAMENTO') {
            loadRevenue();
        } else if (activeTab === 'AVISOS') {
            loadNotices();
        } else if (activeTab === 'LOGS') {
            loadLogs();
        } else if (activeTab === 'MANUTENCAO') {
            loadMaintenance();
        } else if (activeTab === 'MISSOES') {
            loadMissions();
        } else if (activeTab === 'MISSAO_LEITURA') {
            loadReadingMissions();
        }
    }, [activeTab, revenueMonth, revenueYear]);

    const loadMaintenance = async () => {
        setLoadingMaintenance(true);
        try {
            const settings = await MaintenanceService.getSettings();
            setMaintenanceSettings(settings);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingMaintenance(false);
        }
    };

    const handleSaveMaintenance = async () => {
        setSavingMaintenance(true);
        try {
            const success = await MaintenanceService.updateSettings(maintenanceSettings);
            if (success) {
                alert(`Modo de manutenção ${maintenanceSettings.is_active ? 'ATIVADO' : 'DESATIVADO'} com sucesso!`);
            } else {
                alert('Erro ao salvar configurações. Verifique se a tabela "app_settings" existe no Supabase.');
            }
        } catch (e) {
            console.error(e);
            alert('Erro inesperado ao salvar.');
        } finally {
            setSavingMaintenance(false);
        }
    };

    const loadLogs = async () => {
        setLoadingLogs(true);
        try {
            const data = await AdminLogService.getLogs(200);
            setLogs(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingLogs(false);
        }
    };

    const loadNotices = async () => {
        setLoadingNotices(true);
        try {
            const data = await NoticeService.getAllNotices();
            setNotices(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingNotices(false);
        }
    };

    const loadMissions = async () => {
        setLoadingMissions(true);
        try {
            const data = await ArtMissionDbService.getAllMissions();
            setMissions(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingMissions(false);
        }
    };

    const loadReadingMissions = async () => {
        setLoadingReadingMissions(true);
        try {
            const data = await ReadingMissionDbService.getAllMissions();
            setReadingMissions(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingReadingMissions(false);
        }
    };

    const handleCreateReadingMission = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newReadingMissionRef || !newReadingMissionHint || !newReadingMissionQuestion || !newReadingMissionOptionsStr) {
            alert('Preencha os campos obrigatórios (Ref, Dica, Pergunta e Opções)!');
            return;
        }

        const optionsArray = newReadingMissionOptionsStr.split(',').map(s => s.trim()).filter(s => s);
        if (optionsArray.length < 2) {
            alert('Forneça pelo menos duas opções, separadas por vírgula.');
            return;
        }

        if (newReadingMissionCorrectIndex < 0 || newReadingMissionCorrectIndex >= optionsArray.length) {
            alert('O índice da opção correta é inválido.');
            return;
        }

        setIsCreatingReadingMission(true);
        try {
            const mission = await ReadingMissionDbService.createMission({
                ref: newReadingMissionRef,
                text: newReadingMissionText || "Ler a Bíblia",
                hint: newReadingMissionHint,
                verification_question: newReadingMissionQuestion,
                options: optionsArray,
                correct_index: newReadingMissionCorrectIndex,
                active: true
            });
            if (mission) {
                alert('Missão de Leitura criada com sucesso!');
                setNewReadingMissionRef('');
                setNewReadingMissionText('');
                setNewReadingMissionHint('');
                setNewReadingMissionQuestion('');
                setNewReadingMissionOptionsStr('');
                setNewReadingMissionCorrectIndex(0);
                loadReadingMissions();
            } else {
                alert('Erro ao criar missão. A tabela "reading_missions" existe?');
            }
        } catch (err) {
            console.error(err);
            alert('Erro inesperado ao criar missão de leitura.');
        } finally {
            setIsCreatingReadingMission(false);
        }
    };

    const toggleReadingMissionStatus = async (id: string, currentStatus: boolean) => {
        const success = await ReadingMissionDbService.toggleMissionStatus(id, !currentStatus);
        if (success) loadReadingMissions();
    };

    const handleDeleteReadingMission = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja deletar esta missão de leitura?')) return;
        const success = await ReadingMissionDbService.deleteMission(id);
        if (success) loadReadingMissions();
    };

    const handleCreateMission = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMissionTitle || !newMissionInstruction) {
            alert('Preencha título e instrução!');
            return;
        }

        setIsCreatingMission(true);
        try {
            const mission = await ArtMissionDbService.createMission({
                title: newMissionTitle,
                instruction: newMissionInstruction,
                icon: newMissionIcon,
                active: true
            });
            if (mission) {
                alert('Missão criada com sucesso!');
                setNewMissionTitle('');
                setNewMissionInstruction('');
                setNewMissionIcon('🎨');
                loadMissions();
            } else {
                alert('Erro ao criar missão. A tabela existe no banco?');
            }
        } catch (err) {
            console.error(err);
            alert('Erro inesperado ao criar missão.');
        } finally {
            setIsCreatingMission(false);
        }
    };

    const toggleMissionStatus = async (id: string, currentStatus: boolean) => {
        const success = await ArtMissionDbService.toggleMissionStatus(id, !currentStatus);
        if (success) loadMissions();
    };

    const handleDeleteMission = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja deletar esta missão?')) return;
        const success = await ArtMissionDbService.deleteMission(id);
        if (success) loadMissions();
    };

    const handleCreateNotice = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNoticeTitle || !newNoticeContent) {
            alert('Preencha título e conteúdo!');
            return;
        }

        setIsCreatingNotice(true);
        try {
            const notice = await NoticeService.createNotice({
                title: newNoticeTitle,
                content: newNoticeContent,
                active: true
            });
            if (notice) {
                alert('Aviso criado com sucesso!');
                setNewNoticeTitle('');
                setNewNoticeContent('');
                loadNotices();
            } else {
                alert('Erro ao criar aviso. Verifique se a tabela "notices" existe no Supabase.');
            }
        } catch (err) {
            console.error(err);
            alert('Erro inesperado ao criar aviso.');
        } finally {
            setIsCreatingNotice(false);
        }
    };

    const toggleNoticeStatus = async (id: string, currentStatus: boolean) => {
        const success = await NoticeService.toggleNoticeStatus(id, !currentStatus);
        if (success) loadNotices();
    };

    const handleDeleteNotice = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja deletar este aviso?')) return;
        const success = await NoticeService.deleteNotice(id);
        if (success) loadNotices();
    };

    const loadRevenue = async () => {
        setLoadingRevenue(true);
        try {
            const res = await fetch(`/api/admin/revenue?month=${revenueMonth}&year=${revenueYear}`);
            const data = await res.json();
            if (res.ok) {
                setRevenueData(data);
            } else {
                alert(data.error || 'Erro ao carregar faturamento');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingRevenue(false);
        }
    };

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
        const action = newStatus ? 'BLOCK_USER' : 'UNBLOCK_USER';
        const label = newStatus ? 'Bloqueou' : 'Desbloqueou';

        const success = await ProfileService.updateProfileStatus(profile.id, { is_blocked: newStatus });
        if (success) {
            setProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, is_blocked: newStatus } : p));
            // Log da ação
            AdminLogService.addLog({
                adminProfileId: adminProfileId || 'unknown',
                adminName: adminName,
                action,
                targetProfileId: profile.id,
                targetName: profile.name,
                details: `${label} o perfil "${profile.name}"`,
            });
        } else {
            alert('Erro ao atualizar status. Verifique se a coluna "is_blocked" existe na tabela "profiles" no Supabase.');
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
        <div className="p-4 md:p-8 max-w-[90rem] mx-auto flex flex-col md:flex-row gap-6 animate-in fade-in duration-500 pb-32 font-outfit relative">

            {/* Background Blobs */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 bg-blob-indigo opacity-50 fixed pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 bg-blob-pink opacity-50 fixed pointer-events-none"></div>

            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 lg:w-72 flex-shrink-0 relative z-10 flex flex-col gap-4">
                <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl p-6 rounded-[2rem] shadow-lg border border-white/50 dark:border-gray-800/50">
                    <h1 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight leading-tight mb-1">Painel<br/>Admin</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-sm mb-6">Gerenciamento Geral</p>

                    <div className="flex flex-col gap-1.5">
                        <div className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mt-2 mb-1 px-2">Principal</div>
                        <button
                            onClick={() => setActiveTab('USERS')}
                            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'USERS' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800/50'}`}
                        >
                            Usuários
                        </button>
                        <button
                            onClick={() => setActiveTab('CREATE_USER')}
                            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'CREATE_USER' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800/50'}`}
                        >
                            Criar Usuário
                        </button>

                        <div className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mt-4 mb-1 px-2">E-commerce</div>
                        <button
                            onClick={() => setActiveTab('SHOP')}
                            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'SHOP' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800/50'}`}
                        >
                            Loja
                        </button>
                        <button
                            onClick={() => setActiveTab('COUPONS')}
                            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'COUPONS' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800/50'}`}
                        >
                            Cupons
                        </button>
                        <button
                            onClick={() => setActiveTab('FATURAMENTO')}
                            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'FATURAMENTO' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800/50'}`}
                        >
                            Faturamento
                        </button>

                        <div className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mt-4 mb-1 px-2">Conteúdo</div>
                        <button
                            onClick={() => setActiveTab('AVISOS')}
                            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'AVISOS' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800/50'}`}
                        >
                            Avisos
                        </button>
                        <button
                            onClick={() => setActiveTab('MISSOES')}
                            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'MISSOES' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800/50'}`}
                        >
                            Missões Arte
                        </button>
                        <button
                            onClick={() => setActiveTab('MISSAO_LEITURA')}
                            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'MISSAO_LEITURA' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800/50'}`}
                        >
                            Missão Palavra
                        </button>

                        <div className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mt-4 mb-1 px-2">Sistema</div>
                        <button
                            onClick={() => setActiveTab('LOGS')}
                            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'LOGS' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800/50'}`}
                        >
                            Logs
                        </button>
                        <button
                            onClick={() => setActiveTab('MANUTENCAO')}
                            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-between ${
                                activeTab === 'MANUTENCAO'
                                    ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800/50'
                            }`}
                        >
                            Manutenção
                            {maintenanceSettings.is_active && (
                                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                            )}
                        </button>
                    </div>
                </div>
                <HomeButton onClick={onBack} label="Voltar para Home" className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-white/50 dark:border-gray-800/50 shadow-lg hover:bg-white dark:hover:bg-gray-800 w-full justify-center" />
            </div>

            {/* Content Area */}
            <div className="flex-1 min-w-0 relative z-10 space-y-6">

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
                    ) : activeTab === 'FATURAMENTO' ? (
                        <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl rounded-[2rem] p-6 shadow-xl border border-white/50 dark:border-gray-800/50 overflow-hidden">
                            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                                <h3 className="text-2xl font-black text-gray-800 dark:text-white">Faturamento Mensal</h3>
                                <div className="flex items-center gap-2">
                                    <select 
                                        value={revenueMonth} 
                                        onChange={(e) => setRevenueMonth(Number(e.target.value))}
                                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 font-bold text-gray-800 dark:text-white outline-none"
                                    >
                                        <option value={1}>Janeiro</option>
                                        <option value={2}>Fevereiro</option>
                                        <option value={3}>Março</option>
                                        <option value={4}>Abril</option>
                                        <option value={5}>Maio</option>
                                        <option value={6}>Junho</option>
                                        <option value={7}>Julho</option>
                                        <option value={8}>Agosto</option>
                                        <option value={9}>Setembro</option>
                                        <option value={10}>Outubro</option>
                                        <option value={11}>Novembro</option>
                                        <option value={12}>Dezembro</option>
                                    </select>
                                    <select 
                                        value={revenueYear} 
                                        onChange={(e) => setRevenueYear(Number(e.target.value))}
                                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 font-bold text-gray-800 dark:text-white outline-none"
                                    >
                                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {loadingRevenue ? (
                                <div className="p-20 text-center text-gray-500 flex flex-col items-center">
                                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                                    <p className="font-bold">Calculando faturamento no Mercado Pago...</p>
                                </div>
                            ) : revenueData ? (
                                <div className="space-y-6">
                                    {/* Cards de Resumo */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl shadow-lg shadow-emerald-500/20 text-white flex flex-col items-center justify-center">
                                            <span className="text-emerald-100 font-bold uppercase tracking-widest text-sm mb-2">Total Recebido</span>
                                            <span className="text-4xl font-black">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(revenueData.totalRevenue)}
                                            </span>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 rounded-2xl shadow-sm text-gray-800 dark:text-gray-200 flex flex-col items-center justify-center">
                                            <span className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-2">Transações Aprovadas</span>
                                            <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400">
                                                {revenueData.transactionsCount}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Lista de Transações */}
                                    <div className="mt-8 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden bg-white/50 dark:bg-gray-800/20">
                                        <h4 className="font-bold text-gray-700 dark:text-gray-300 p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">Últimas Transações do Mês</h4>
                                        {revenueData.items.length === 0 ? (
                                            <div className="p-8 text-center text-gray-400 font-medium">Nenhuma transação registrada neste mês.</div>
                                        ) : (
                                            <div className="max-h-96 overflow-y-auto">
                                                <table className="w-full text-left border-collapse text-sm">
                                                    <thead>
                                                        <tr className="border-b border-gray-100 dark:border-gray-800 text-xs text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-gray-900/50">
                                                            <th className="p-3">Data</th>
                                                            <th className="p-3">Email do Pagador</th>
                                                            <th className="p-3">Método</th>
                                                            <th className="p-3 text-right">Valor</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {revenueData.items.map((item, idx) => (
                                                            <tr key={idx} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/80 dark:hover:bg-gray-800/50">
                                                                <td className="p-3 text-gray-600 dark:text-gray-400">
                                                                    {new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                                </td>
                                                                <td className="p-3 font-medium text-gray-800 dark:text-gray-200">
                                                                    {item.email}
                                                                </td>
                                                                <td className="p-3 text-gray-500 font-bold uppercase text-[10px]">
                                                                    {item.payment_method}
                                                                </td>
                                                                <td className="p-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.amount)}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    ) : activeTab === 'AVISOS' ? (
                        <div className="space-y-8 animate-in fade-in">
                            <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl rounded-[2rem] p-8 shadow-xl border border-white/50 dark:border-gray-800/50">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
                                    <span className="text-3xl">📢</span> Novo Aviso
                                </h2>
                                <form onSubmit={handleCreateNotice} className="space-y-6 max-w-2xl">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Título do Aviso</label>
                                        <input
                                            type="text"
                                            value={newNoticeTitle}
                                            onChange={(e) => setNewNoticeTitle(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                            placeholder="Ex: Nova atualização chegou!"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Conteúdo / Mensagem</label>
                                        <textarea
                                            value={newNoticeContent}
                                            onChange={(e) => setNewNoticeContent(e.target.value)}
                                            rows={4}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                                            placeholder="Descreva as novidades..."
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isCreatingNotice}
                                        className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto shadow-lg shadow-indigo-500/20"
                                    >
                                        {isCreatingNotice ? 'Criando...' : 'Publicar Aviso'}
                                    </button>
                                </form>
                            </div>

                            <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl rounded-[2rem] p-8 shadow-xl border border-white/50 dark:border-gray-800/50">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Avisos Publicados</h2>
                                {loadingNotices ? (
                                    <div className="text-center py-10 text-gray-500">Carregando avisos...</div>
                                ) : notices.length === 0 ? (
                                    <div className="text-center py-10 text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                                        Nenhum aviso publicado ainda.
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {notices.map(notice => (
                                            <div key={notice.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">{notice.title}</h3>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${notice.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                                                            {notice.active ? 'Ativo (Visível)' : 'Inativo'}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-600 dark:text-gray-300">{notice.content}</p>
                                                    {notice.created_at && (
                                                        <p className="text-xs text-gray-400 mt-2 font-mono">
                                                            Criado em: {new Date(notice.created_at).toLocaleString('pt-BR')}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 w-full md:w-auto">
                                                    <button
                                                        onClick={() => toggleNoticeStatus(notice.id, notice.active)}
                                                        className={`flex-1 md:flex-none px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                                                            notice.active 
                                                                ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/40' 
                                                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40'
                                                        }`}
                                                    >
                                                        {notice.active ? 'Desativar' : 'Ativar'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteNotice(notice.id)}
                                                        className="flex-1 md:flex-none px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/40 rounded-lg font-bold text-sm transition-all"
                                                    >
                                                        Excluir
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : activeTab === 'MANUTENCAO' ? (
                        <div className="space-y-8 animate-in fade-in">
                            {/* Status Banner */}
                            <div className={`p-6 rounded-[2rem] border-2 flex items-center gap-5 transition-all duration-500 ${
                                maintenanceSettings.is_active
                                    ? 'bg-orange-500/10 border-orange-500/40 dark:bg-orange-500/10'
                                    : 'bg-emerald-500/10 border-emerald-500/40 dark:bg-emerald-500/10'
                            }`}>
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 ${
                                    maintenanceSettings.is_active ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'
                                }`}>
                                    {maintenanceSettings.is_active ? '🔧' : '✅'}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-xl font-black ${
                                        maintenanceSettings.is_active ? 'text-orange-600 dark:text-orange-400' : 'text-emerald-600 dark:text-emerald-400'
                                    }`}>
                                        {maintenanceSettings.is_active ? 'Modo de Manutenção ATIVO' : 'Sistema Operacional'}
                                    </p>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-0.5">
                                        {maintenanceSettings.is_active
                                            ? 'Todos os usuários estão sendo redirecionados para a página de manutenção.'
                                            : 'O sistema está funcionando normalmente. Nenhum usuário está sendo bloqueado.'}
                                    </p>
                                    {maintenanceSettings.updated_at && (
                                        <p className="text-xs text-gray-400 mt-1 font-mono">
                                            Última atualização: {new Date(maintenanceSettings.updated_at).toLocaleString('pt-BR')}
                                        </p>
                                    )}
                                </div>
                                {/* Master Toggle */}
                                <button
                                    onClick={() => setMaintenanceSettings(prev => ({ ...prev, is_active: !prev.is_active }))}
                                    className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none flex-shrink-0 ${
                                        maintenanceSettings.is_active ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                                    title={maintenanceSettings.is_active ? 'Desativar manutenção' : 'Ativar manutenção'}
                                >
                                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                                        maintenanceSettings.is_active ? 'translate-x-9' : 'translate-x-1'
                                    }`} />
                                </button>
                            </div>

                            {/* Configuration Panel */}
                            <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl rounded-[2rem] p-8 shadow-xl border border-white/50 dark:border-gray-800/50">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
                                    <span className="text-3xl">⚙️</span> Configurar Mensagem
                                </h2>

                                {loadingMaintenance ? (
                                    <div className="flex justify-center items-center gap-3 py-10 text-gray-400">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-400" />
                                        <span className="font-bold">Carregando configurações...</span>
                                    </div>
                                ) : (
                                    <div className="space-y-6 max-w-2xl">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                                Título da Página de Manutenção
                                            </label>
                                            <input
                                                type="text"
                                                value={maintenanceSettings.title}
                                                onChange={(e) => setMaintenanceSettings(prev => ({ ...prev, title: e.target.value }))}
                                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all font-bold"
                                                placeholder="Ex: Sistema em Manutenção"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                                Mensagem para os Usuários
                                            </label>
                                            <textarea
                                                value={maintenanceSettings.message}
                                                onChange={(e) => setMaintenanceSettings(prev => ({ ...prev, message: e.target.value }))}
                                                rows={4}
                                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none"
                                                placeholder="Explique o motivo da manutenção e quando o sistema voltará..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                                Previsão de Retorno <span className="text-gray-400 font-normal">(opcional)</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={maintenanceSettings.estimated_return ?? ''}
                                                onChange={(e) => setMaintenanceSettings(prev => ({ ...prev, estimated_return: e.target.value || null }))}
                                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                                                placeholder="Ex: 08/06/2026 às 18h00"
                                            />
                                            <p className="text-xs text-gray-400 mt-1.5">Este texto é exibido na página de manutenção como previsão de retorno.</p>
                                        </div>

                                        {/* Preview */}
                                        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
                                            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Pré-visualização</p>
                                            <p className="text-white font-black text-lg">{maintenanceSettings.title || '—'}</p>
                                            <p className="text-gray-300 text-sm mt-1">{maintenanceSettings.message || '—'}</p>
                                            {maintenanceSettings.estimated_return && (
                                                <div className="mt-3 inline-block bg-indigo-900/40 border border-indigo-700/50 px-4 py-2 rounded-xl">
                                                    <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest">Previsão de Retorno</p>
                                                    <p className="text-white font-black">{maintenanceSettings.estimated_return}</p>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={handleSaveMaintenance}
                                            disabled={savingMaintenance}
                                            className={`w-full py-4 rounded-xl font-black text-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] ${
                                                maintenanceSettings.is_active
                                                    ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/30'
                                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/30'
                                            }`}
                                        >
                                            {savingMaintenance
                                                ? 'Salvando...'
                                                : maintenanceSettings.is_active
                                                    ? '🔧 Salvar e Ativar Manutenção'
                                                    : '✅ Salvar e Manter Sistema Online'
                                            }
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Warning box */}
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-5 flex gap-4 items-start">
                                <span className="text-2xl flex-shrink-0">⚠️</span>
                                <div>
                                    <p className="font-bold text-amber-800 dark:text-amber-300 mb-1">Importante</p>
                                    <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1 list-disc list-inside">
                                        <li>Quando ativo, <strong>todos os usuários</strong> serão redirecionados para a página de manutenção.</li>
                                        <li>O <strong>Painel Admin</strong> permanece acessível mesmo com manutenção ativa.</li>
                                        <li>A página de manutenção é acessível diretamente em <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">/manutencao</code>.</li>
                                        <li>Clique em <strong>Salvar</strong> para aplicar as alterações imediatamente.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ) : null
                }

                {activeTab === 'LOGS' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl rounded-[2rem] p-8 shadow-xl border border-white/50 dark:border-gray-800/50">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                                    <span className="text-3xl">📜</span> Logs de Atividade
                                </h2>
                                <button
                                    onClick={loadLogs}
                                    className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-all"
                                >
                                    Atualizar
                                </button>
                            </div>
                            {loadingLogs ? (
                                <div className="flex justify-center items-center gap-3 py-16 text-gray-400">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-400"></div>
                                    <span className="font-bold">Carregando logs...</span>
                                </div>
                            ) : logs.length === 0 ? (
                                <div className="text-center py-16 text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                                    <span className="text-4xl block mb-3">💭</span>
                                    Nenhuma atividade registrada ainda.
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                                    {logs.map(log => {
                                        const actionConfig: Record<string, { icon: string; color: string; label: string }> = {
                                            BLOCK_USER:    { icon: '🔒', color: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800/30', label: 'Bloqueou usuário' },
                                            UNBLOCK_USER:  { icon: '🔓', color: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/30', label: 'Desbloqueou usuário' },
                                            CREATE_NOTICE: { icon: '📢', color: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/30', label: 'Criou aviso' },
                                            DELETE_NOTICE: { icon: '🗑️', color: 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800/30', label: 'Removeu aviso' },
                                        };
                                        const cfg = actionConfig[log.action] ?? { icon: 'ℹ️', color: 'bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700', label: log.action };
                                        return (
                                            <div key={log.id} className={`flex items-start gap-4 p-4 rounded-2xl border ${cfg.color}`}>
                                                <span className="text-2xl mt-0.5">{cfg.icon}</span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-bold text-gray-800 dark:text-white">{log.admin_name || 'Admin'}</span>
                                                        <span className="text-gray-500 dark:text-gray-400 text-sm">{cfg.label}</span>
                                                        {log.target_name && (
                                                            <span className="font-bold text-indigo-600 dark:text-indigo-400">{log.target_name}</span>
                                                        )}
                                                    </div>
                                                    {log.details && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{log.details}</p>
                                                    )}
                                                </div>
                                                <span className="text-xs text-gray-400 font-mono whitespace-nowrap">
                                                    {new Date(log.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'MISSAO_LEITURA' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl rounded-[2rem] p-6 shadow-xl border border-white/50 dark:border-gray-800/50 overflow-hidden">
                            <div className="mb-8 bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                                <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-400 mb-4">Nova Missão da Palavra (Leitura)</h3>
                                <div className="flex flex-col gap-4">
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1 uppercase">Referência Bíblica</label>
                                            <input type="text" value={newReadingMissionRef} onChange={e => setNewReadingMissionRef(e.target.value)} placeholder="Ex: Salmos 23:1" className="w-full bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-800 rounded-lg px-4 py-2 font-bold text-gray-800 dark:text-white" />
                                        </div>
                                        <div className="flex-[2]">
                                            <label className="block text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1 uppercase">Dica</label>
                                            <input type="text" value={newReadingMissionHint} onChange={e => setNewReadingMissionHint(e.target.value)} placeholder="Ex: Este versículo fala sobre o nosso Pastor..." className="w-full bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-800 rounded-lg px-4 py-2 font-medium text-gray-800 dark:text-white" />
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-[2]">
                                            <label className="block text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1 uppercase">Pergunta de Verificação</label>
                                            <input type="text" value={newReadingMissionQuestion} onChange={e => setNewReadingMissionQuestion(e.target.value)} placeholder="Ex: O que não faltará para quem tem o Senhor como pastor?" className="w-full bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-800 rounded-lg px-4 py-2 font-medium text-gray-800 dark:text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1 uppercase">Índice da Opção Correta</label>
                                            <input type="number" value={newReadingMissionCorrectIndex} onChange={e => setNewReadingMissionCorrectIndex(Number(e.target.value))} min="0" className="w-full bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-800 rounded-lg px-4 py-2 font-medium text-gray-800 dark:text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1 uppercase">Opções (Separadas por vírgula)</label>
                                        <input type="text" value={newReadingMissionOptionsStr} onChange={e => setNewReadingMissionOptionsStr(e.target.value)} placeholder="Ex: Nada, Dinheiro, Comida" className="w-full bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-800 rounded-lg px-4 py-2 font-medium text-gray-800 dark:text-white" />
                                        <p className="text-xs text-gray-500 mt-1">Lembre-se que o Índice da Opção Correta começa em 0 (Ex: se a correta for "Nada", o índice é 0).</p>
                                    </div>
                                    <div className="flex justify-end mt-2">
                                        <button onClick={handleCreateReadingMission} disabled={isCreatingReadingMission} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50">
                                            {isCreatingReadingMission ? 'Criando...' : 'Criar Missão de Leitura'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {loadingReadingMissions ? (
                                <div className="p-10 text-center text-gray-500 font-bold">Carregando missões...</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-100 dark:border-gray-700">
                                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Referência</th>
                                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Pergunta / Opções</th>
                                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Status</th>
                                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 text-right">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {readingMissions.map(mission => (
                                                <tr key={mission.id} className={`border-b border-gray-50 dark:border-gray-800/50 transition-colors ${!mission.active ? 'opacity-50' : 'hover:bg-white/50 dark:hover:bg-gray-800/50'}`}>
                                                    <td className="p-4">
                                                        <div className="font-bold text-gray-800 dark:text-white text-lg">{mission.ref}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">Dica: {mission.hint}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="font-bold text-gray-700 dark:text-gray-300 text-sm">{mission.verification_question}</div>
                                                        <div className="flex gap-1 mt-2 flex-wrap">
                                                            {mission.options.map((opt, i) => (
                                                                <span key={i} className={`text-[10px] px-2 py-0.5 rounded-md border ${i === mission.correct_index ? 'bg-emerald-100 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400 font-bold' : 'bg-gray-100 border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'}`}>
                                                                    {opt}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${mission.active ? 'bg-emerald-100 border-emerald-200 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 border-gray-200 text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'}`}>
                                                            {mission.active ? 'ATIVA' : 'INATIVA'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex gap-2 justify-end">
                                                            <button onClick={() => toggleReadingMissionStatus(mission.id!, mission.active)} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700">
                                                                {mission.active ? 'Desativar' : 'Ativar'}
                                                            </button>
                                                            <button onClick={() => handleDeleteReadingMission(mission.id!)} className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/40">
                                                                Excluir
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {readingMissions.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="p-10 text-center text-gray-400 font-bold">
                                                        Nenhuma Missão da Palavra cadastrada.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'MISSOES' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl rounded-[2rem] p-6 shadow-xl border border-white/50 dark:border-gray-800/50 overflow-hidden">
                            <div className="mb-8 bg-pink-50 dark:bg-pink-900/20 p-6 rounded-2xl border border-pink-100 dark:border-pink-900/30">
                                <h3 className="text-lg font-bold text-pink-900 dark:text-pink-400 mb-4">Nova Missão de Arte</h3>
                                <div className="flex flex-wrap gap-4 items-end">
                                    <div className="flex-1 min-w-[200px]">
                                        <label className="block text-xs font-bold text-pink-600 dark:text-pink-400 mb-1 uppercase tracking-wider">Título da Missão</label>
                                        <input type="text" value={newMissionTitle} onChange={e => setNewMissionTitle(e.target.value)} placeholder="Ex: A Arca de Noé" className="w-full bg-white dark:bg-gray-800 border border-pink-200 dark:border-pink-800 rounded-lg px-4 py-2 font-bold text-gray-800 dark:text-white" />
                                    </div>
                                    <div className="flex-[2] min-w-[250px]">
                                        <label className="block text-xs font-bold text-pink-600 dark:text-pink-400 mb-1 uppercase tracking-wider">Instrução</label>
                                        <input type="text" value={newMissionInstruction} onChange={e => setNewMissionInstruction(e.target.value)} placeholder="Ex: Desenhe um barco com muitos animais..." className="w-full bg-white dark:bg-gray-800 border border-pink-200 dark:border-pink-800 rounded-lg px-4 py-2 font-medium text-gray-800 dark:text-white" />
                                    </div>
                                    <div className="w-24">
                                        <label className="block text-xs font-bold text-pink-600 dark:text-pink-400 mb-1 uppercase tracking-wider">Ícone</label>
                                        <input type="text" value={newMissionIcon} onChange={e => setNewMissionIcon(e.target.value)} placeholder="🚢" className="w-full bg-white dark:bg-gray-800 border border-pink-200 dark:border-pink-800 rounded-lg px-4 py-2 text-center text-xl" />
                                    </div>
                                    <button onClick={handleCreateMission} disabled={isCreatingMission} className="px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-bold shadow-lg shadow-pink-500/20 active:scale-95 transition-all h-[42px] disabled:opacity-50">
                                        {isCreatingMission ? 'Criando...' : 'Criar Missão'}
                                    </button>
                                </div>
                            </div>

                            {loadingMissions ? (
                                <div className="p-10 text-center text-gray-500 font-bold">Carregando missões...</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-100 dark:border-gray-700">
                                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 w-16">Ícone</th>
                                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Missão</th>
                                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Status</th>
                                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 text-right">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {missions.map(mission => (
                                                <tr key={mission.id} className={`border-b border-gray-50 dark:border-gray-800/50 transition-colors ${!mission.active ? 'opacity-50' : 'hover:bg-white/50 dark:hover:bg-gray-800/50'}`}>
                                                    <td className="p-4 text-3xl">{mission.icon}</td>
                                                    <td className="p-4">
                                                        <div className="font-bold text-gray-800 dark:text-white text-lg">{mission.title}</div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">{mission.instruction}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${mission.active ? 'bg-emerald-100 border-emerald-200 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 border-gray-200 text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'}`}>
                                                            {mission.active ? 'ATIVA' : 'INATIVA'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex gap-2 justify-end">
                                                            <button onClick={() => toggleMissionStatus(mission.id!, mission.active)} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700">
                                                                {mission.active ? 'Desativar' : 'Ativar'}
                                                            </button>
                                                            <button onClick={() => handleDeleteMission(mission.id!)} className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/40">
                                                                Excluir
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {missions.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="p-10 text-center text-gray-400 font-bold">
                                                        Nenhuma missão cadastrada ainda.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

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
        </div>
    );
};

export default AdminPanel;
