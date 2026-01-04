# Guia de Deploy na Vercel - Filif Bible+

## 📋 Pré-requisitos

- Conta na [Vercel](https://vercel.com)
- Repositório Git (GitHub, GitLab, ou Bitbucket) com o código do projeto
- Node.js instalado localmente para testes (opcional, mas recomendado)

## 🚀 Passo a Passo para Deploy

### 1. Preparação do Projeto

Certifique-se de que todas as alterações estão commitadas no Git:

```bash
git add .
git commit -m "Configuração para deploy na Vercel"
git push origin main
```

### 2. Configuração das Variáveis de Ambiente

Antes de fazer o deploy, você precisará configurar as seguintes variáveis de ambiente na Vercel:

#### Variáveis Necessárias:

- **`VITE_SUPABASE_URL`**: URL do seu projeto Supabase
- **`VITE_SUPABASE_ANON_KEY`**: Chave anônima (pública) do Supabase
- **`GEMINI_API_KEY`**: Sua chave de API do Google Gemini

> **⚠️ IMPORTANTE**: As variáveis que começam com `VITE_` ficam disponíveis no frontend. A `GEMINI_API_KEY` será exposta no bundle (por isso é recomendado migrar para API route no futuro).

### 3. Deploy na Vercel

#### Opção A: Import via Dashboard (Recomendado)

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Clique em **"Import Project"**
3. Selecione o repositório **Robertmatias23/FliffBible**
4. A Vercel detectará automaticamente que é um projeto Vite
5. Configure as variáveis de ambiente:
   - Clique em **"Environment Variables"**
   - Adicione cada variável:
     ```
     VITE_SUPABASE_URL = https://seu-projeto.supabase.co
     VITE_SUPABASE_ANON_KEY = sua_chave_anonima_aqui
     GEMINI_API_KEY = sua_chave_gemini_aqui
     ```
6. Clique em **"Deploy"**

#### Opção B: Via Vercel CLI

```bash
# Instalar Vercel CLI globalmente
npm install -g vercel

# Fazer login
vercel login

# Deploy
vercel

# Seguir as instruções interativas
# Adicionar variáveis de ambiente quando solicitado
```

### 4. Configuração de Variáveis de Ambiente Pós-Deploy

Se você esqueceu de adicionar as variáveis durante o deploy:

1. Acesse o dashboard do seu projeto na Vercel
2. Vá em **Settings** → **Environment Variables**
3. Adicione cada variável:
   - Nome: `VITE_SUPABASE_URL`
   - Value: `https://seu-projeto.supabase.co`
   - Environment: Selecione **Production**, **Preview**, e **Development**
4. Repita para `VITE_SUPABASE_ANON_KEY` e `GEMINI_API_KEY`
5. Após adicionar as variáveis, clique em **Deployments**
6. No último deployment, clique nos três pontos **"..."** → **"Redeploy"**

## 🧪 Teste Local Antes do Deploy

É altamente recomendado testar o build de produção localmente antes de fazer deploy:

```bash
# Instalar as novas dependências (Tailwind CSS)
npm install

# Criar build de produção
npm run build

# Testar o build localmente
npm run preview
```

Acesse `http://localhost:4173` e verifique se tudo funciona corretamente:
- ✅ Login/autenticação
- ✅ Leitura da Bíblia (dados do Supabase)
- ✅ Devocional diário (Gemini AI)
- ✅ Modo escuro
- ✅ Todas as telas e navegação

## 🔍 Troubleshooting

### Problema: Tela Branca

**Causas comuns:**
1. **Variáveis de ambiente não configuradas**: Verifique se todas as variáveis estão corretas no dashboard da Vercel
2. **Erro de build**: Verifique os logs do deployment na Vercel
3. **Erro de runtime**: Abra o Console do navegador (F12) e verifique os erros

**Solução:**
- Acesse os logs de build na Vercel (Deployments → selecione o deployment → clique em "Building")
- Verifique o Console do navegador na URL deployada
- Adicione/corrija as variáveis de ambiente e faça redeploy

### Problema: "Failed to load environment variables"

**Causa:** As variáveis de ambiente não foram configuradas ou estão incorretas.

**Solução:**
1. Verifique se as variáveis começam com `VITE_` (exceto `GEMINI_API_KEY`)
2. Certifique-se de que não há espaços extras
3. Faça redeploy após adicionar/corrigir

### Problema: Erro de Build - "Cannot find module 'tailwindcss'"

**Causa:** As dependências não foram instaladas corretamente.

**Solução:**
1. Delete `node_modules` e `package-lock.json` localmente
2. Execute `npm install`
3. Commit e push novamente
4. A Vercel reinstalará tudo

### Problema: API do Supabase não funciona

**Causa:** URL ou chave incorretas, ou problemas de CORS.

**Solução:**
1. Verifique no Supabase Dashboard:
   - Settings → API → URL e anon key estão corretas?
2. Verifique se as tabelas existem e têm RLS (Row Level Security) configurado corretamente
3. No Supabase, vá em Authentication → URL Configuration → adicione o domínio da Vercel em "Site URL"

### Problema: Gemini AI não funciona

**Causa:** Chave de API inválida ou limites excedidos.

**Solução:**
1. Verifique se a chave está correta em [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Verifique se há créditos/quota disponível
3. Teste a chave localmente primeiro

## 📊 Monitoramento

Após o deploy, monitore:
- **Logs de Runtime**: Vercel Dashboard → seu projeto → Logs
- **Analytics**: Vercel Dashboard → Analytics (ver tráfego e erros)
- **Performance**: Lighthouse ou Web Vitals na aba de Analytics

## 🔄 Deploys Futuros

Depois do primeiro deploy, qualquer push para a branch `main` fará um deploy automático:

```bash
git add .
git commit -m "Atualização do projeto"
git push origin main
# Deploy automático será iniciado na Vercel
```

## 🔐 Segurança - Recomendações Futuras

> **⚠️ AVISO**: Atualmente, a `GEMINI_API_KEY` é exposta no bundle frontend, o que não é ideal para produção.

**Recomendações:**
1. **Migrar para API Route**: Crie uma API route no Vercel (serverless function) para chamar o Gemini, mantendo a chave no backend
2. **Usar Edge Functions**: Implementar as chamadas ao Gemini em Edge Functions da Vercel
3. **Rate Limiting**: Implementar limitação de taxa para evitar abuso da API

## 📚 Recursos Úteis

- [Documentação Vercel - Vite](https://vercel.com/docs/frameworks/vite)
- [Documentação Vercel - Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase - Deploy to Production](https://supabase.com/docs/guides/platform/going-into-prod)

## ✅ Checklist de Deploy

Antes de considerar o deploy completo:

- [ ] Build local executado com sucesso (`npm run build`)
- [ ] Preview local funcionando (`npm run preview`)
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Deploy realizado com sucesso (sem erros de build)
- [ ] Site acessível na URL da Vercel
- [ ] Autenticação funcionando
- [ ] Dados do Supabase carregando
- [ ] Devocional diário gerando (Gemini)
- [ ] Modo escuro funcionando
- [ ] Responsividade testada (mobile/tablet/desktop)
- [ ] Console do navegador sem erros críticos

---

**Criado em:** Janeiro 2026  
**Última atualização:** Janeiro 2026  
**Framework:** Vite + React 19 + TypeScript + Tailwind CSS  
**Deploy:** Vercel
