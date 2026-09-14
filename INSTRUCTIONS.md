# INSTRUCTIONS

## Projeto escolhido

**Opção A — CineDash (Filmes):** dashboard de curadoria e descoberta de filmes consumindo a API do TMDB.

## Stack utilizada

React 18 + TypeScript (strict) + Vite, TanStack Query, Zustand, TanStack Router, TanStack Table, Shadcn/ui + TailwindCSS, React Hook Form + Zod, Vitest + React Testing Library — exatamente a stack obrigatória do desafio, sem substituições.

## Como rodar

### 1. Pré-requisitos

- Node.js 18+
- Uma API Read Access Token do TMDB (gratuita): crie uma conta em [themoviedb.org](https://www.themoviedb.org/) e gere o token em **Configurações → API**.

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite `.env` e preencha:

```
TMDB_API_READ_TOKEN=<seu-token-aqui>
```

Sem prefixo `VITE_` de propósito: o token é lido só pelo proxy server-side (`api/tmdb.ts` em produção, middleware do `vite.config.ts` em dev) e nunca chega ao código do client — ver [ARCHITECTURE.md](./ARCHITECTURE.md#token-do-tmdb-nunca-no-bundle-do-client). As demais variáveis (`VITE_TMDB_BASE_URL`, `VITE_TMDB_IMAGE_BASE_URL`) já têm defaults corretos e não precisam ser alteradas.

### 4. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse `http://localhost:5173`.

### 5. Login

Não há backend — a autenticação é simulada no client. Use **qualquer e-mail válido** e **senha com 6+ caracteres** (ex.: `voce@exemplo.com` / `123456`) na tela de login.

### 6. Outros comandos

```bash
npm run build         # build de produção (tsc -b && vite build)
npm run preview        # serve o build de produção localmente
npm test               # roda a suíte de testes (Vitest)
npm run test:watch     # testes em modo watch
npm run test:coverage  # testes com relatório de cobertura
npm run lint            # ESLint
```

## Funcionalidades implementadas

- **Autenticação simulada** — formulário com validação Zod (e-mail válido, senha 6+ caracteres), token fictício persistido em `localStorage`, guarda de rota que redireciona usuários não autenticados para `/login`, sessão sobrevive a reload.
- **Dashboard de descoberta** (`/discover`) — listagem trending/popular com paginação, busca com debounce (300ms), filtros por gênero, ano e nota mínima, skeletons de loading e estado vazio.
- **Minha lista / Watchlist** (`/watchlist`) — adicionar/remover filmes (botão presente no card e na página de detalhes), tabela com TanStack Table (colunas Título, Gênero, Data de Lançamento, Rating, Ações), ordenação por Título/Gênero/Rating, persistida via `localStorage`.
- **Detalhes do filme** (`/movie/:id`) — sinopse, elenco, trailer do YouTube (quando disponível), botão de adicionar/remover da watchlist.
- **Tema Dark/Light** — alternável pela navbar, persistido via Zustand.

## Deploy

**Live: [cinedash-five.vercel.app](https://cinedash-five.vercel.app)**

Feito via Vercel CLI:

```bash
npx vercel login                                       # autenticação (device flow)
npx vercel                                              # link do projeto + primeiro deploy
npx vercel env add TMDB_API_READ_TOKEN production      # variável de ambiente server-side (também em preview)
npx vercel env add TMDB_API_READ_TOKEN preview
npx vercel --prod                                       # redeploy em produção já com a env var
```

`TMDB_API_READ_TOKEN` (sem prefixo `VITE_`) fica marcado como "Secret" pela própria Vercel — só a serverless function em `api/tmdb.ts` o lê, o client nunca o vê.

Repositório GitHub conectado ao projeto na Vercel — pushes em `main` disparam deploy de produção automaticamente, e branches/PRs geram preview deployments.

`vercel.json` já traz o rewrite de SPA necessário (ver seção "Deploy" do [README.md](./README.md)).

## O que ficou de fora / próximos passos

- Testes de acessibilidade automatizados (axe) não foram incluídos — a acessibilidade básica (labels, `aria-*`, navegação por teclado nos cards) foi tratada manualmente.
- Code-splitting por rota não foi feito; o bundle de produção passa do aviso de 500kb do Vite. Para um projeto maior, valeria `React.lazy` por página.
- Sem paginação/scroll infinito na listagem de elenco na página de detalhes (limitada aos 10 primeiros nomes) — decisão deliberada de escopo, não uma limitação técnica.

## Estrutura de pastas

Ver `ARCHITECTURE.md` para a explicação detalhada da organização (Feature-Sliced Design) e das decisões técnicas.
