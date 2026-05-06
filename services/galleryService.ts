import { supabase } from './supabase';

export const galleryService = {
  /**
   * Faz upload de uma imagem para o storage e registra no banco de dados
   */
  async uploadImage(base64: string, profileId?: string) {
    const client = supabase;
    if (!client) throw new Error('Supabase não configurado');

    // Se não for passado profileId, tenta pegar do localStorage
    const targetProfileId = profileId || localStorage.getItem('selectedProfileId');
    if (!targetProfileId) throw new Error('Perfil não selecionado');

    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // Gerar nome único para o arquivo
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    const path = `${user.id}/${fileName}`;

    // Converter Base64 para Blob
    const base64Data = base64.split(',')[1] || base64;
    const blob = await fetch(`data:image/jpeg;base64,${base64Data}`).then(r => r.blob());

    // 1. Upload para o Storage
    const { error: uploadError } = await client.storage
      .from('user-gallery')
      .upload(path, blob, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (uploadError) throw uploadError;

    // 2. Registro na tabela gallery_images
    const { error: dbError } = await client
      .from('gallery_images')
      .insert({
        profile_id: targetProfileId,
        storage_path: path
      });

    if (dbError) throw dbError;

    return path;
  },

  /**
   * Lista as imagens de um perfil específico
   */
  async listImages(profileId?: string) {
    const client = supabase;
    if (!client) return [];

    const targetProfileId = profileId || localStorage.getItem('selectedProfileId');
    if (!targetProfileId) return [];

    // Busca os caminhos na tabela (mais eficiente que listar storage)
    const { data, error } = await client
      .from('gallery_images')
      .select('storage_path')
      .eq('profile_id', targetProfileId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar galeria:', error);
      return [];
    }

    // Gera URLs assinadas para cada imagem
    const urls = await Promise.all(
      (data || []).map(async (row) => {
        const { data: signed } = await client.storage
          .from('user-gallery')
          .createSignedUrl(row.storage_path, 3600); // URL válida por 1 hora
        return signed?.signedUrl || '';
      })
    );

    return urls.filter(Boolean);
  }
};
