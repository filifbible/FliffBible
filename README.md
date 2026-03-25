# Arquitetura do Projeto: Fliff Bible+ (Next.js 15 + CQRS/Command Pattern)

Este documento descreve a nova arquitetura unificada adotada pelo projeto Fliff Bible+. Com o objetivo de simplificar o desenvolvimento, otimizar a performance e reduzir os custos de infraestrutura, consolidamos todo o sistema em um único repositório Fullstack utilizando as capacidades do **Next.js 15 (App Router)** combinado com princípios de **Domain-Driven Design (DDD)** e **Command Pattern (CQRS)** para gestão da regra de negócios.

## Visão Geral

Adotamos o modelo Serverless através das Next.js API Routes, garantindo escalabilidade automática.

As principais integrações do sistema são:
1. **Supabase**: Responsável pelo Banco de Dados (PostgreSQL) e Autenticação (Supabase Auth).
2. **Mercado Pago**: Processamento de pagamentos, assinaturas e webhooks.

## Estrutura de Diretórios

```text
filif-bible+ Projeto/
├── app/                  # Next.js App Router (Páginas, Layouts e API Routes)
│   ├── (protected)/      # Rotas privadas protegidas por Middleware
│   └── api/              # Endpoints Serverless (Controllers que expõem a lógica)
├── commands/
│   └── handlers/         # Command Pattern: Cada arquivo é um caso de uso específico
├── entities/             # Entidades de Domínio e interfaces limpas
├── enums/                # Enumeradores de uso global
├── services/             # Integração com serviços externos
├── components/           # Componentes React reutilizáveis (UI)
├── lib/                  # Utilitários e configurações
└── middleware.ts         # Middleware do Next.js (Proteção de Rotas e Redirecionamentos)
```

## Princípios Adotados

### 1. Command Pattern (CQRS Lite)

Para evitar que as API Routes se tornem arquivos gigantescos, toda regra de negócios complexa foi isolada dentro da pasta `commands/handlers/`.
- **Como funciona:** Uma API Route apenas recebe os dados da requisição, valida o formato e os repassa para um **Handler**.
- O **Handler** contém o passo a passo da lógica de negócios, faz interações com os Services e retorna um resultado formatado.
- Isso traz facilidade em criar testes e manter a responsabilidade única de cada arquivo.

### 2. Separação de Entidades e Camadas (DDD)

- **`entities/`**: Define o modelo de dados em TypeScript. Tanto o Frontend (React) quanto o Backend (API) compartilham exatamente o mesmo modelo.
- **`enums/`**: Concentra literais e regras constantes, evitando "Magic Strings" espalhadas pelo código.
- **`services/`**: Camada que lida diretamente com dependências externas (Supabase, Mercado Pago).

### 3. Middleware Inteligente

O `middleware.ts` intercepta todas as requisições antes que cheguem nas páginas, validando:
1. Sessão ativa no Supabase.
2. Situação da conta (Assinante ativo ou período Trial ativo).

## Fluxo de Autenticação e Pagamento

1. O cliente escolhe um plano na **Landing Page** (`components/LandingPage.tsx`).
2. Uma requisição busca os IDs atualizados dos planos via `GET /api/plans`.
3. O `CardPaymentModal.tsx` coleta o cadastro e os dados do cartão de crédito.
4. O frontend aciona `POST /api/subscription`, enviando o token do cartão e o ID do plano.
5. A rota valida o Rate-Limit, gera a assinatura no Mercado Pago e grava as regras de *Premium* via Supabase Admin.
6. Webhooks em `app/api/webhook/route.ts` atualizam o status de pagamento de forma reativa.

## Como Rodar Localmente

**Pré-requisitos:** Node.js 18+

1. Clone o repositório e instale as dependências:
   ```bash
   npm install
   ```
2. Crie o arquivo `.env.local` na raiz com suas chaves (veja `.env.local.example`).
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Acesse `http://localhost:3000`.
