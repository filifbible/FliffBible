import React from 'react';

interface HomeButtonProps {
    onClick: () => void;
    className?: string;
    label?: string;
}

const HomeButton: React.FC<HomeButtonProps> = ({ onClick, className = '', label = 'Início' }) => {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 font-black px-6 py-3 rounded-2xl shadow-md border border-indigo-50 dark:border-gray-700 hover:scale-105 active:scale-95 transition-all ${className}`}
        >
            <span className="text-lg">🏠</span>
            <span>{label}</span>
        </button>
    );
};

export default HomeButton;
