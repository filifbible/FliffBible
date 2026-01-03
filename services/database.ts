
import { UserState } from "../types";

const ACCOUNTS_KEY = 'filif_accounts_v3';
const USER_DATA_PREFIX = 'filif_user_v3_';
const SESSION_KEY = 'filif_session_v3';

export const Database = {
  _getAccounts: (): Record<string, string> => {
    try {
      const data = localStorage.getItem(ACCOUNTS_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  },

  register: async (email: string, password: string): Promise<boolean> => {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail || !password) return false;

    try {
      const accounts = Database._getAccounts();
      if (accounts[cleanEmail]) return false;
      
      accounts[cleanEmail] = password;
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
      
      const initialData: UserState = {
        email: cleanEmail,
        isAuthenticated: true,
        isPremium: false,
        theme: 'light',
        profiles: [],
        currentProfileId: null
      };
      
      localStorage.setItem(`${USER_DATA_PREFIX}${cleanEmail}`, JSON.stringify(initialData));
      localStorage.setItem(SESSION_KEY, cleanEmail);
      return true;
    } catch (e) {
      alert("Erro ao criar conta. Talvez o armazenamento do seu navegador esteja cheio.");
      return false;
    }
  },

  login: async (email: string, password: string): Promise<boolean> => {
    const cleanEmail = email.toLowerCase().trim();
    const accounts = Database._getAccounts();
    const isValid = accounts[cleanEmail] !== undefined && accounts[cleanEmail] === password;
    
    if (isValid) {
      try {
        localStorage.setItem(SESSION_KEY, cleanEmail);
        if (!localStorage.getItem(`${USER_DATA_PREFIX}${cleanEmail}`)) {
          const recoverData: UserState = {
            email: cleanEmail,
            isAuthenticated: true,
            isPremium: false,
            theme: 'light',
            profiles: [],
            currentProfileId: null
          };
          localStorage.setItem(`${USER_DATA_PREFIX}${cleanEmail}`, JSON.stringify(recoverData));
        }
      } catch (e) {}
    }
    return isValid;
  },

  getUserData: (email: string): UserState | null => {
    const cleanEmail = email.toLowerCase().trim();
    try {
      const data = localStorage.getItem(`${USER_DATA_PREFIX}${cleanEmail}`);
      if (data) return { ...JSON.parse(data), isAuthenticated: true };
    } catch (e) {}
    return null;
  },

  saveUserData: (state: UserState) => {
    if (state.email && state.isAuthenticated) {
      try {
        const cleanEmail = state.email.toLowerCase().trim();
        localStorage.setItem(`${USER_DATA_PREFIX}${cleanEmail}`, JSON.stringify(state));
        localStorage.setItem(SESSION_KEY, cleanEmail);
      } catch (e) {
        console.error("Erro ao salvar dados:", e);
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
          alert("Memória cheia! Tente apagar alguns desenhos antigos para salvar novos.");
        }
      }
    }
  },

  getLastSession: (): UserState | null => {
    try {
      const lastEmail = localStorage.getItem(SESSION_KEY);
      if (lastEmail && Database._getAccounts()[lastEmail]) {
        return Database.getUserData(lastEmail);
      }
    } catch (e) {}
    return null;
  },

  clearSession: () => {
    localStorage.removeItem(SESSION_KEY);
  }
};
