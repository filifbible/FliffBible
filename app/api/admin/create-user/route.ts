import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(request: Request) {
  try {
    const { email, password, fullName, isAdmin, isPremium } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 });
    }

    // Cria o usuário no Auth (sem logar o admin out)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message || 'Erro ao criar usuário' }, { status: 400 });
    }

    const userId = authData.user.id;

    // Cria a conta (account) para o usuário
    const { error: accountError } = await supabaseAdmin.from('accounts').insert({
      id: userId,
      email: email.toLowerCase().trim(),
      full_name: fullName || null,
      is_premium: isPremium || false,
      subscription_status: isPremium ? 'authorized' : null,
      theme: 'light',
      is_admin: isAdmin || false,
    });

    if (accountError) {
       console.error("Account error: ", accountError);
       // Ignore duplicate errors for now, as trigger might handle it
    }

    // Cria o perfil principal
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      account_id: userId,
      name: fullName || 'Novo Usuário',
      profile_type: 'ADULTS',
      user_type: 'adult',
      is_admin: isAdmin || false,
      points: 0,
      coins: 0,
      streak: 1,
      unlocked_items: ['coloring_book', 'pixel_free'],
      favorites: [],
      recordings: [],
      paintings: [],
    });

    if (profileError) {
      console.error("Profile error: ", profileError);
      return NextResponse.json({ error: 'Erro ao criar perfil' }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: authData.user });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Erro interno do servidor' }, { status: 500 });
  }
}
