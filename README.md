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
│   ├── command-bus.ts    # Singleton que registra e despacha handlers
│   └── handlers/         # Um arquivo por caso de uso (CompleteArtChallenge, etc.)
├── entities/             # Entidades de Domínio com regras de negócio puras
├── enums/                # Enumeradores de uso global
├── services/             # Integração com serviços externos (Supabase, Gemini, MP)
├── components/           # Componentes React reutilizáveis (UI)
├── lib/                  # Utilitários e configurações
├── types.ts              # ❤️ Fonte única de verdade para todos os tipos compartilhados
└── middleware.ts         # Middleware do Next.js (Proteção de Rotas e Redirecionamentos)
```

## Princípios Adotados

### 1. Command Pattern (CQRS Lite)

Para evitar que as API Routes e componentes se tornem arquivos gigantescos, toda regra de negócios complexa é isolada dentro da pasta `commands/handlers/`.

#### Como funciona

```
Componente / API Route
    ↓ new CompleteArtChallengeCommand({ profileId, artDataUrl })
    ↓ commandBus.execute(command)
    ↓ CompleteArtChallengeHandler.execute()
         1. galleryService.uploadImage()     ← upload ao Storage
         2. ProfileService.updateLastActivity()  ← marca missão concluída
         3. ProfileService.addRewards()          ← concede moedas
         4. return { path }                      ← retorna resultado
```

#### Regras obrigatórias

- **Um Handler = Um caso de uso.** Não misture lógicas diferentes num mesmo handler.
- **Componentes UI nunca chamam services diretamente** para operações que envolvam múltiplas etapas. Devem usar o `commandBus`.
- **Handlers são registrados no `CommandBus`** durante sua instanciação (singleton).
- **Handlers retornam dados tipados**, nunca `void` quando o resultado é relevante para o chamador.

#### Handlers existentes

| Arquivo | Caso de Uso |
|---|---|
| `complete-art-challenge.handler.ts` | Upload de arte + atualizar perfil + conceder moedas |
| `complete-verse-challenge.handler.ts` | Concluir desafio de versículo |
| `authenticate.handler.ts` | Registro e login de usuário |
| `select-profile.handler.ts` | Seleção de perfil ativo |
| `buy-item.handler.ts` | Compra de item na loja |
| `game-win.handler.ts` | Conclusão de jogo e pontuação |
| `logout.handler.ts` | Logout e limpeza de sessão |

#### Como adicionar um novo Handler

```typescript
// 1. Crie o arquivo commands/handlers/meu-caso.handler.ts
import { Command, CommandHandler } from '../command-bus';

export class MeuCasoCommand implements Command {
  readonly type = 'MeuCasoCommand';
  constructor(public payload: { /* dados necessários */ }) {}
}

export class MeuCasoHandler implements CommandHandler<MeuCasoCommand> {
  async execute(command: MeuCasoCommand): Promise<{ /* resultado */ }> {
    // lógica de negócio aqui
  }
}

// 2. Registre no constructor do CommandBus (command-bus.ts)
this.register('MeuCasoCommand', new MeuCasoHandler());

// 3. Dispare do componente ou API Route
const result = await commandBus.execute(new MeuCasoCommand({ ... }));
```

### 2. Contrato de Tipos Centralizado (`types.ts`)

O arquivo `types.ts` na raiz é a **fonte única de verdade** para todas as interfaces e tipos compartilhados entre o Frontend e o Backend.

#### Regra DRY obrigatória

> **Nenhum arquivo de `services/`, `components/` ou `app/` deve declarar uma `interface` ou `type` que já exista ou que possa ser reutilizada em mais de um lugar. Todo tipo compartilhado deve viver em `types.ts`.**

#### Organização por domínio

| Domínio | Tipos |
|---|---|
| **Perfil / Usuário** | `ProfileType`, `UserType`, `ProfileData`, `UserState`, `AudioRecording`, `ArtMissionTheme` |
| **Bíblia** | `Testament`, `BibleBook`, `BibleVerse`, `QuizQuestion` |
| **Galeria** | `GalleryImage` |
| **Loja** | `ShopItem` (aliases `@deprecated`: `ShopItemOverride`, `ShopItemPrice`) |
| **Assinaturas** | `SubscriptionPlan`, `CardData` |
| **Conta** | `AccountData` |
| **Navegação** | `AppScreen` |

#### Tipos locais permitidos (exceções justificadas)

Alguns tipos podem permanecer locais ao seu arquivo se forem puramente auxiliares e não reutilizáveis:
- `AuthResult` em `authService.ts` — encapsula objetos internos do Supabase Auth.
- `ProfileData` (snake_case) em `profileService.ts` — representa o schema do banco antes do mapeamento para a UI.

### 3. Separação de Entidades e Camadas (DDD)

- **`entities/`**: Entidades de domínio com regras de negócio puras (ex: `ProfileEntity.spendCoins()`). Não dependem de Supabase nem React.
- **`enums/`**: Concentra literais e regras constantes, evitando "Magic Strings" espalhadas pelo código.
- **`services/`**: Camada que lida diretamente com dependências externas (Supabase, Mercado Pago, Gemini). Importam tipos de `types.ts`.

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
