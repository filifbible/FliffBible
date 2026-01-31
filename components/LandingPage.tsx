import React from 'react';

interface LandingPageProps {
    onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
    const scrollToPlans = () => {
        const plansSection = document.getElementById('plans');
        if (plansSection) {
            plansSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-white font-outfit">

            {/* Navbar Simple */}
            <nav className="fixed w-full z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-3xl">✝️</span>
                        <span className="text-xl font-black tracking-tight text-indigo-900 dark:text-indigo-400">Filif Bible+</span>
                    </div>
                    <div>
                        <button
                            onClick={onLogin}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full font-bold transition-all shadow-lg hover:shadow-indigo-500/30"
                        >
                            Entrar
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-3xl"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <span className="inline-block py-1 px-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-xs font-black uppercase tracking-widest mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        A Plataforma Cristã Completa
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        Cresça na <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500">Fé</span> e no <br /> Conhecimento
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-100">
                        Uma experiência interativa para toda a família. Devocionais, arte, desafios bíblicos e muito mais em um ambiente seguro e inspirador.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-200">
                        <button
                            onClick={onLogin}
                            className="w-full sm:w-auto px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all"
                        >
                            Começar Agora
                        </button>
                        <button
                            onClick={scrollToPlans}
                            className="w-full sm:w-auto px-10 py-5 bg-white dark:bg-gray-800 text-indigo-900 dark:text-white border-2 border-indigo-100 dark:border-gray-700 rounded-2xl font-bold text-lg hover:border-indigo-300 dark:hover:border-gray-500 transition-all"
                        >
                            Conhecer Planos
                        </button>
                    </div>
                </div>
            </section>

            {/* Video Section */}
            <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-black mb-4 dark:text-white">Como Funciona</h2>
                        <p className="text-gray-500 dark:text-gray-400">Descubra tudo o que preparamos para você e sua família.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Video 1 Placeholder */}
                        <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-4 shadow-xl border border-gray-100 dark:border-gray-700">
                            <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-3xl relative overflow-hidden flex items-center justify-center group cursor-pointer">
                                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-2"></div>
                                </div>
                                {/* Aqui virá o iframe ou video tag posteriormente */}
                                <p className="absolute bottom-6 left-6 text-white font-bold text-lg drop-shadow-md">Tour pela Plataforma</p>
                            </div>
                        </div>

                        {/* Video 2 Placeholder */}
                        <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-4 shadow-xl border border-gray-100 dark:border-gray-700">
                            <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-3xl relative overflow-hidden flex items-center justify-center group cursor-pointer">
                                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-2"></div>
                                </div>
                                {/* Aqui virá o iframe ou video tag posteriormente */}
                                <p className="absolute bottom-6 left-6 text-white font-bold text-lg drop-shadow-md">Vídeo 1</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="plans" className="py-20 lg:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-pink-500 font-bold tracking-widest uppercase text-xs">Invista no Reino</span>
                        <h2 className="text-3xl md:text-5xl font-black mb-4 dark:text-white mt-2">Nossos Planos</h2>
                        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Escolha o plano ideal para sua jornada espiritual.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 items-start">

                        {/* Plano Gratuito */}
                        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-700 shadow-lg relative">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Básico</h3>
                            <div className="flex items-baseline mb-6">
                                <span className="text-4xl font-black text-gray-900 dark:text-white">Grátis</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                                    <span className="mr-3 text-emerald-500">✓</span> Acesso limitado a devocionais
                                </li>
                                <li className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                                    <span className="mr-3 text-emerald-500">✓</span> 1 Perfil
                                </li>
                                <li className="flex items-center text-gray-400 dark:text-gray-500 text-sm">
                                    <span className="mr-3 text-gray-300">✕</span> Missões de Arte
                                </li>
                            </ul>
                            <button onClick={onLogin} className="w-full py-4 rounded-xl font-bold bg-indigo-50 dark:bg-gray-700 text-indigo-600 dark:text-white hover:bg-indigo-100 transition-colors">
                                Começar Grátis
                            </button>
                        </div>

                        {/* Plano Família (Destaque) */}
                        <div className="bg-indigo-600 dark:bg-indigo-900 rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-indigo-500/20 transform md:-translate-y-6 relative border-[3px] border-indigo-400">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-pink-500 to-indigo-500 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                                Mais Popular
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Família +</h3>
                            <div className="flex items-baseline mb-6">
                                <span className="text-5xl font-black text-white">R$ 29,90</span>
                                <span className="text-indigo-200 ml-2">/mês</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center text-white text-sm font-medium">
                                    <span className="mr-3 bg-white/20 rounded-full w-5 h-5 flex items-center justify-center text-xs">✓</span> Até 4 Perfis
                                </li>
                                <li className="flex items-center text-white text-sm font-medium">
                                    <span className="mr-3 bg-white/20 rounded-full w-5 h-5 flex items-center justify-center text-xs">✓</span> Missões de Arte Ilimitadas
                                </li>
                                <li className="flex items-center text-white text-sm font-medium">
                                    <span className="mr-3 bg-white/20 rounded-full w-5 h-5 flex items-center justify-center text-xs">✓</span> IA Generativa de Temas
                                </li>
                                <li className="flex items-center text-white text-sm font-medium">
                                    <span className="mr-3 bg-white/20 rounded-full w-5 h-5 flex items-center justify-center text-xs">✓</span> Relatórios de Progresso
                                </li>
                            </ul>
                            <button onClick={onLogin} className="w-full py-4 rounded-xl font-black bg-white text-indigo-600 hover:bg-indigo-50 transition-colors shadow-lg">
                                Assinar Família
                            </button>
                        </div>

                        {/* Plano Premium */}
                        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-700 shadow-lg">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Anual</h3>
                            <div className="flex items-baseline mb-6">
                                <span className="text-4xl font-black text-gray-900 dark:text-white">R$ 299</span>
                                <span className="text-gray-400 ml-2">/ano</span>
                            </div>
                            <p className="text-xs text-emerald-500 font-bold mb-6 bg-emerald-50 dark:bg-emerald-900/30 inline-block px-3 py-1 rounded-lg">Economize 20%</p>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                                    <span className="mr-3 text-emerald-500">✓</span> Tudo do plano Família
                                </li>
                                <li className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                                    <span className="mr-3 text-emerald-500">✓</span> Conteúdos Exclusivos
                                </li>
                                <li className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                                    <span className="mr-3 text-emerald-500">✓</span> Suporte Prioritário
                                </li>
                            </ul>
                            <button onClick={onLogin} className="w-full py-4 rounded-xl font-bold bg-indigo-50 dark:bg-gray-700 text-indigo-600 dark:text-white hover:bg-indigo-100 transition-colors">
                                Assinar Anual
                            </button>
                        </div>

                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-50 dark:bg-gray-950 py-12 border-t border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-gray-500 dark:text-gray-500 text-sm">© 2024 Fliff Bible+. Todos os direitos reservados.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
