import { supabase } from './supabase';
import { UserType } from '../types';
import { AccountService } from './accountService';

export interface AuthResult {
  user: any;
  session: any;
}

export const AuthService = {
  /**
   * Registra um novo usuário e cria conta
   */
  async register(
    email: string,
    password: string,
    userType: UserType | null,
    fullName?: string
  ): Promise<AuthResult> {
    if (!supabase) {
      throw new Error('Supabase não está configurado. Verifique as variáveis de ambiente.');
    }

    const cleanEmail = email.toLowerCase().trim();

    console.log('📝 DEBUG REGISTER - Tentando criar conta...');
    console.log('📧 Email:', cleanEmail);
    console.log('🔑 Senha (length):', password.length, 'chars');
    console.log('🔑 Senha (primeiros 3 chars):', password.substring(0, 3));
    console.log('🔑 Senha (últimos 3 chars):', password.substring(password.length - 3));
    console.log('👤 UserType:', userType);
    console.log('📛 FullName:', fullName);

    // 1. Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
    });

    if (authError) {
      console.error('❌ ERRO NO REGISTRO:', authError);
      throw authError;
    }

    if (!authData.user) {
      throw new Error('Falha ao criar usuário');
    }

    // Debug: verificar se temos sessão após signUp
    console.log('🔍 Debug SignUp:', {
      hasUser: !!authData.user,
      hasSession: !!authData.session,
      userId: authData.user.id,
      userRole: authData.user.role,
    });

    // Verificar se a sessão está ativa
    if (!authData.session) {
      console.warn('⚠️ Sessão não criada após signUp. Email de confirmação pode estar habilitado no Supabase.');
      console.warn('👉 Para resolver: Supabase Dashboard → Authentication → Providers → Email → Desmarque "Confirm email"');
      throw new Error('Email de confirmação requerido. Verifique seu email para confirmar a conta.');
    }

    // 2. Criar conta na tabela accounts
    try {
      console.log('📝 Tentando criar conta no Supabase...');
      await AccountService.createAccount(
        authData.user.id,
        cleanEmail,
        fullName
      );
      console.log('✅ Conta criada com sucesso no Supabase');
    } catch (accountError: any) {
      console.error('❌ Erro ao criar conta:', accountError);
      
      // Se for erro de RLS, dar mensagem mais clara
      if (accountError.message?.includes('row-level security') || accountError.code === '42501') {
        throw new Error('Erro de permissão no banco de dados. Verifique se a confirmação de email está desabilitada no Supabase.');
      }
      
      throw new Error('Erro ao criar conta de usuário: ' + accountError.message);
    }

    return {
      user: authData.user,
      session: authData.session,
    };
  },

  /**
   * Faz login do usuário
   */
  async login(email: string, password: string): Promise<AuthResult> {
    if (!supabase) {
      throw new Error('Supabase não está configurado. Verifique as variáveis de ambiente.');
    }

    const cleanEmail = email.toLowerCase().trim();

    console.log('🔐 DEBUG LOGIN - Tentando fazer login...');
    console.log('📧 Email enviado:', cleanEmail);
    console.log('🔑 Senha recebida (length):', password.length, 'chars');
    console.log('🔑 Senha (primeiros 3 chars):', password.substring(0, 3));
    console.log('🔑 Senha (últimos 3 chars):', password.substring(password.length - 3));

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      console.error('❌ ERRO NO LOGIN:', {
        message: error.message,
        status: error.status,
        name: error.name,
        code: (error as any).code,
        fullError: error,
      });
      
      // Detectar erro de email não confirmado
      if (error.message?.includes('Email not confirmed') || error.message?.includes('not confirmed')) {
        throw new Error('📧 Sua conta precisa ser confirmada. Verifique seu email ou desabilite a confirmação no Supabase.\n\nPara desabilitar: Supabase Dashboard → Authentication → Providers → Email → Desmarque "Confirm email"');
      }
      
      // Erro genérico de credenciais inválidas
      if (error.message?.includes('Invalid login credentials')) {
        throw new Error('E-mail ou senha incorretos. Se você acabou de criar esta conta, pode ser necessário confirmar seu email primeiro.');
      }
      
      throw error;
    }

    console.log('✅ LOGIN BEM-SUCEDIDO!', {
      userId: data.user?.id,
      email: data.user?.email,
      hasSession: !!data.session,
    });

    if (!data.user || !data.session) {
      throw new Error('Credenciais inválidas');
    }

    return {
      user: data.user,
      session: data.session,
    };
  },

  /**
   * Faz logout do usuário
   */
  async logout(): Promise<void> {
    if (!supabase) {
      return;
    }

    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  },

  /**
   * Obtém a sessão atual do usuário
   */
  async getCurrentSession() {
    if (!supabase) {
      return null;
    }

    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Erro ao obter sessão:', error);
      return null;
    }

    return data.session;
  },

  /**
   * Verifica se há uma sessão ativa
   */
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getCurrentSession();
    return session !== null;
  },

  /**
   * Envia email de recuperação de senha
   */
  async resetPassword(email: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase não está configurado');
    }

    const cleanEmail = email.toLowerCase().trim();

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${window.location.origin}/reset-password`, // URL de redirecionamento após clicar no link
    });

    if (error) {
      console.error('❌ Erro ao enviar email de recuperação:', error);
      throw error;
    }

    console.log('✅ Email de recuperação enviado para:', cleanEmail);
  },

  /**
   * Atualiza a senha do usuário (usado após clicar no link de reset)
   */
  async updatePassword(newPassword: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase não está configurado');
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      console.error('❌ Erro ao atualizar senha:', error);
      throw error;
    }

    console.log('✅ Senha atualizada com sucesso');
  },
};
