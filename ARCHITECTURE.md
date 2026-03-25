# Arquitetura do Projeto: Fliff Bible+ (Next.js 15 + CQRS/Command Pattern)

Este documento descreve a nova arquitetura unificada adotada pelo projeto Fliff Bible+. Com o objetivo de simplificar o desenvolvimento, otimizar a performance e reduzir os custos de infraestrutura, consolidamos todo o sistema em um único repositório Fullstack utilizando as capacidades do **Next.js 15 (App Router)** combinado com princípios de **Domain-Driven Design (DDD)** e **Command Pattern (CQRS)** para gestão da regra de negócios.

## Visão Geral

Adotamos o modelo Serverless através das Next.js API Routes, garantindo escalabilidade automática.

As principais integrações do sistema são:
1. **Supabase**: Responsável pelo Banco de Dados (PostgreSQL) e Autenticação (Supabase Auth).
2. **Mercado Pago**: Processamento de pagamentos, assinaturas e webhooks.

## Estrutura de Diretórios 

```text
d:\filif-bible+ Projeto\
├── app/                  # Next.js App Router (Páginas, Layouts e API Routes)
│   ├── (protected)/      # Rotas privadas protegidas por Middleware
│   └── api/              # Endpoints Serverless (Controllers que expõem a lógica)
├── commands/             
│   └── handlers/         # Command Pattern: Cada arquivo é um caso de uso específico (ex: authenticate.handler.ts)
├── entities/             # Entidades de Domínio e interfaces limpas (ex: account.entity.ts)
├── enums/                # Enumeradores de uso global (ex: subscription-interval.enum.ts)
├── services/             # Integração com serviços externos (ex: supabase.ts, mercadopagoService.ts)
├── components/           # Componentes React reutilizáveis (UI)
├── lib/                  # Utilitários e configurações (ex: rate-limit.ts, validate.ts)
└── middleware.ts         # Middleware do Next.js (Proteção de Rotas e Redirecionamentos)
```

## Princípios Adotados

### 1. Command Pattern (CQRS Lite)

Para evitar que as API Routes (nosso *entrypoint*) se tornem arquivos gigantescos, toda regra de negócios complexa foi isolada dentro da pasta `commands/handlers/`.
- **Como funciona:** Uma API Route (ex: `/api/auth/login/route.ts`) apenas recebe os dados da requisição, instila a validação de formato e os repassa para um **Handler**.
- O **Handler** contém o passo a passo da lógica de negócios, faz interações com os Services e retorna um resultado formatado.
- Isso traz facilidade em criar testes, manter a responsabilidade única de cada arquivo e deixar as rotas HTTP "burras".

### 2. Separação de Entidades e Camadas (Influência DDD)

As regras que ditam "o que é a nossa aplicação" não se misturam com Frameworks:
- **`entities/`**: Define o modelo de dados em TypeScript (ex: tipagem exata de um plano ou usuário). Assim, tanto o Frontend (React) quanto o Backend (API) compartilham exatamente o mesmo modelo.
- **`enums/`**: Concentra literais e regras constantes, evitando "Magic Strings" espalhadas pelo código.
- **`services/`**: Camada que lida diretamente com dependências externas. As regras de como o Supabase se conecta ou como o payload do Mercado Pago é montado ficam restritas a este diretório.

### 3. Middleware Inteligente

O `middleware.ts` intercepta todas as requisições antes que cheguem nas páginas, validando a sessão de autenticação.
Rotas agrupadas em `app/(protected)/` garantem que o usuário só consiga ver o conteúdo caso:
1. Tenha uma sessão ativa no Supabase.
2. Seja checada a sua situação de conta (Assinante ativo ou período Trial ativo).

## Fluxo de Autenticação e Pagamento

1. O cliente escolhe um plano na **Landing Page** (`components/LandingPage.tsx`).
2. Uma requisição busca os IDs atualizados dos planos na base via `GET /api/plans`.
3. O `CardPaymentModal.tsx` exibe o formulário. O usuário pode criar a conta no Supabase e em seguida colocar os dados do cartão de crédito.
4. O frontend aciona `POST /api/subscription`, enviando o token do cartão e o ID do plano.
5. A rota valida o Rate-Limit, repassa a requisição para o fluxo correto, gera a assinatura no Mercado Pago e grava as regras de *Premium* do usuário via Supabase Admin Client.
6. Webhooks do Mercado Pago localizados em `app/api/webhook/route.ts` atualizam periodicamente o status de pagamento de cada usuário de forma reativa.
