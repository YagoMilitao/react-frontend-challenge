# ARCHITECTURE

Este documento explica as decisões técnicas por trás do CineDash: a estrutura de pastas, como a autenticação foi resolvida sem backend, como o estado foi dividido entre TanStack Query e Zustand, e os desafios reais encontrados durante o desenvolvimento.

## Estrutura de pastas (Feature-Sliced Design)

O projeto segue [Feature-Sliced Design](https://feature-sliced.design) com seis camadas, cada uma só podendo importar das camadas abaixo dela (nunca do lado ou de cima):

```
app → pages → widgets → features → entities → shared
```

```
src/
├── app/            # bootstrap: providers (QueryClient), router, estilos globais
├── pages/          # uma pasta por rota — orquestra widgets/features, sem lógica de negócio própria
│   ├── login/
│   ├── discover/
│   ├── watchlist/
│   └── movie-details/
├── widgets/        # blocos de UI compostos, reutilizáveis entre páginas
│   ├── app-nav/         # navegação + logout + tema
│   ├── discover-header/
│   ├── movie-card/
│   ├── movie-grid/       # grid + paginação
│   └── watchlist-table/  # tabela TanStack Table
├── features/       # uma ação de negócio = estado (Zustand) + UI que a executa
│   ├── auth/             # login/logout, sessão
│   ├── discover-filter/  # filtros de gênero/ano/nota
│   ├── search-movies/    # input de busca com debounce
│   ├── theme/             # dark/light
│   └── watchlist/         # adicionar/remover/toggle
├── entities/       # conceitos de domínio — aqui só existe "movie"
│   └── movie/
│       ├── api/     # hooks do TanStack Query (useTrendingMovies, useMovieDetails, ...)
│       └── types.ts  # Movie, MovieDetails, MovieFilter, MovieGenre
└── shared/         # não sabe nada sobre o domínio "filme"
    ├── api/         # cliente HTTP genérico + tipos brutos da API do TMDB
    ├── config/      # variáveis de ambiente
    ├── lib/         # debounce, cn, getImageUrl
    └── ui/          # primitivos shadcn (Button, Card, Table, Select, ...)
```

**Por que FSD e não "components/hooks/services" plano:** com um projeto desse tamanho a diferença não é óbvia, mas o critério real é *onde uma mudança "vaza"*. Trocar a lib de tabela afeta só `widgets/watchlist-table`. Trocar a regra "o que conta como filtro ativo" afeta só `features/discover-filter` e `pages/discover`. A camada `entities/movie` existe para isolar "o que é um filme e como buscá-lo" de "como uma tela específica usa isso" — por exemplo, o `MovieCard` (widget) não sabe se está sendo alimentado por trending, busca ou resultado filtrado.

**Ajuste feito no meio do caminho:** os hooks de filme (`useTrendingMovies`, `useMovieDetails` etc.) tinham sido implementados inicialmente em `shared/hooks/`. Isso violava FSD — `shared` não deveria carregar conhecimento de domínio ("filme", "gênero", `queryKey: ["movies", ...]`). Foram movidos para `entities/movie/api/`, e `shared` ficou só com o `TMDBHttpClient` genérico.

## Autenticação sem backend

Não existe servidor de autenticação, então a "sessão" é inteiramente client-side:

- `features/auth/model/auth-store.ts` é uma store Zustand com `persist` (localStorage, chave `cinedash-auth`). `login(email)` gera um token fictício (`cinedash-${btoa(email)}-${timestamp}`) e guarda `{ token, user }`.
- A guarda de rota fica em `app/router.tsx`, num `beforeLoad` aplicado uma única vez a uma rota de layout (`appLayoutRoute`) que engloba `/`, `/discover`, `/watchlist` e `/movie/$id`. O `beforeLoad` lê `useAuthStore.getState()` diretamente (fora de um componente React) e lança `redirect({ to: "/login" })` se não houver token.
- Como é `persist`, o token sobrevive a reload — não existe re-login a cada F5, atendendo ao "diferencial" pedido no enunciado.
- Logout (no `AppNav`) limpa a store e navega para `/login` explicitamente — o `beforeLoad` só roda em transições de rota, então sem essa navegação manual o usuário ficaria numa página protegida com sessão já inválida até a próxima navegação.

Essa abordagem é deliberadamente simples porque o requisito é simulação, não segurança real. Um token fictício em `localStorage`, sem expiração nem refresh, seria uma falha grave num sistema real (XSS consegue lê-lo) — mas é proporcional ao escopo do desafio.

## Server state vs. client state

A regra usada: **se o dado vem da API do TMDB, é TanStack Query; se é preferência/estado de UI local, é Zustand.** Nunca os dois para a mesma informação.

### TanStack Query

- `entities/movie/api/movie-queries.ts` (listagens: trending, popular/discover, busca, gêneros) e `movie-details-query.ts` (detalhes, elenco, vídeos de um filme).
- **Cache keys estruturadas como array**, incluindo todos os parâmetros que afetam o resultado: `["movies", "popular", page, filters]`, `["movies", "details", movieId]`. Isso garante que trocar de página ou de filtro *não* reutiliza cache de outra combinação, e que voltar para uma combinação já vista é instantâneo (cache hit).
- `useGenres` usa `staleTime: Infinity` — a lista de gêneros do TMDB não muda em runtime, então uma única busca por sessão é suficiente.
- **`placeholderData: keepPreviousData`** nas três listagens: ao mudar de página, a tela mantém os filmes da página anterior visíveis (sem "piscar" um skeleton) enquanto a nova página carrega em background.
- Em `pages/discover/discover-page.tsx`, as três hooks de listagem (`useTrendingMovies`, `usePopularMovies`, `useSearchMovies`) são sempre chamadas (regra dos hooks do React não permite chamada condicional), mas cada uma recebe um `enabled` calculado a partir do estado atual (há busca ativa? há filtro ativo?) — só a relevante de fato dispara fetch; as outras ficam `idle`.
- `queryClient` global (`app/providers/query-client.tsx`) usa `staleTime: 5min` / `gcTime: 30min` / `refetchOnWindowFocus: false` — o catálogo do TMDB não muda minuto a minuto, então refetch agressivo só geraria requisições desnecessárias.

### Zustand

Quatro stores, cada uma com uma decisão de persistência deliberada:

| Store | Persiste? | Por quê |
|---|---|---|
| `auth-store` | Sim | é a sessão — perder no reload derrubaria o "diferencial" pedido |
| `watchlist-store` | Sim | é o requisito central da feature: "a lista deve persistir mesmo após o reload" |
| `theme-store` | Sim | preferência do usuário, deveria sobreviver a reload |
| `discover-filter-store` | **Não** | filtros de exploração — cada sessão de navegação começa limpa, propositalmente; persistir aqui misturaria "preferência" com "estado de busca efêmero" |

## TanStack Router

Rotas criadas via `createRoute` (não file-based) porque o projeto é pequeno o bastante para a árvore inteira caber legível em um arquivo (`app/router.tsx`). Uma rota de layout sem `path` (`id: "app-layout"`) concentra a guarda de autenticação e a navegação (`AppNav`) uma única vez, em vez de repetir `beforeLoad` e `<AppNav />` em cada página — `/login` fica fora desse layout, então não exibe navegação nem passa pela guarda.

## TanStack Table (watchlist)

A tabela (`widgets/watchlist-table`) usa `useReactTable` com `getCoreRowModel` + `getSortedRowModel` para ordenação client-side por Título, Gênero e Rating — a lista de favoritos do usuário nunca é grande o suficiente para justificar ordenação/paginação no servidor.

## Design system

Componentes shadcn/ui (`shared/ui/`) construídos sobre Radix primitives (`Select`, `Checkbox`, `Label`, `Dialog`) com `class-variance-authority` para variantes e `tailwind-merge` para composição segura de className. Tema dark/light via CSS custom properties em `app/styles/globals.css`, alternadas pela classe `.dark` no `<html>` (`darkMode: ["class"]` no Tailwind config) — a troca é só CSS, sem re-render de componentes.

## Testes

Vitest + React Testing Library, testes colocalizados por camada em `tests/` espelhando `src/`. Foco em:

- **Hooks e lógica de negócio**: stores Zustand (watchlist, filtros), hooks do TanStack Query (mockando `tmdbClient.get`), utilitários (`debounce`, `getImageUrl`).
- **Componentes**: renderização condicional (loading/empty/error), interações (clique, teclado, digitação com debounce usando fake timers).
- **Integração**: `discover-page.test.tsx` cobre o fluxo completo — trending por padrão → busca → filtro → paginação, incluindo o reset de página ao trocar filtro/busca; `movie-details-page.test.tsx` cobre carregamento, elenco, trailer condicional e estado de "não encontrado".

Não é 100% de cobertura por escolha — o objetivo foi cobrir regra de negócio e fluxo, não estilização ou wiring trivial.

## Desafios reais encontrados com a API do TMDB

1. **`MovieDetails` não é um superset de `Movie` na prática.** O endpoint de listagem (`/discover/movie`, `/trending/...`) retorna `genre_ids: number[]`; o endpoint de detalhes (`/movie/{id}`) retorna `genres: {id, name}[]` — **não** retorna `genre_ids`. O tipo inicial (`MovieDetails extends Movie`) afirmava que `genre_ids` sempre existia, o que é falso em runtime. Isso só apareceu ao testar manualmente: adicionar um filme à watchlist *a partir da página de detalhes* quebrava a tabela (`Cannot read properties of undefined (reading 'map')`), porque `genre_ids` vinha `undefined`. Corrigido em duas frentes: o tipo `MovieDetails` agora usa `Omit<Movie, "genre_ids">` (reflete a API real), e `watchlist-store.addMovie` normaliza qualquer filme recebido, derivando `genre_ids` a partir de `genres` quando necessário — a watchlist sempre guarda um formato consistente, não importa de onde o filme veio.
2. **Cache interno do TanStack Table por linha.** A coluna "Gênero" da watchlist usava um `accessorFn` que lia um `Map` externo (`id → nome do gênero`, vindo de `useGenres()`). Como a tabela faz cache do valor computado por linha e só invalida quando a referência de `data` muda, o valor ficava travado no cálculo feito *antes* dos gêneros carregarem da API (sempre "—", mesmo minutos depois). A correção foi pré-computar o rótulo do gênero dentro dos próprios dados passados à tabela (`rows = movies.map(...)`), para que uma mudança nos gêneros gere uma nova referência de `data` e force o recálculo.
3. **Debounce vs. paginação, sem re-fetch em cascata.** Trocar filtro/busca precisa resetar a página para 1 (a página 5 de uma busca nova quase certamente não existe), mas resetar a página não pode disparar um fetch extra por si só. Resolvido com um único `useEffect` que observa `[searchQuery, selectedGenres, year, minRating]` e chama `setPage(1)` — o próprio `page` já é dependência das queries, então o fetch acontece uma vez, não duas.
4. **`ignoreDeprecations` do TypeScript.** Não é da API do TMDB, mas vale registrar: `tsconfig.app.json` tinha `"ignoreDeprecations": "6.0"`, valor inválido para o TypeScript 5.9.3 instalado no projeto (`tsc -b` falhava com `TS5103`). Corrigido para `"5.0"`.

## Token do TMDB nunca no bundle do client

Primeira versão do deploy lia `VITE_TMDB_API_READ_TOKEN` via `import.meta.env` e chamava o TMDB direto do navegador — o Vite embute qualquer variável com prefixo `VITE_` no JS público, então o token acabava extraível do bundle de produção (a própria Vercel recusa marcar uma var `VITE_*` como "Secret" por isso, e exige classificá-la como "Config" explicitamente).

Substituído por um proxy same-origin:

- `api/tmdb.ts` — serverless function (Vercel Edge Runtime) que lê `TMDB_API_READ_TOKEN` (sem prefixo `VITE_`, só disponível no servidor), injeta o header `Authorization: Bearer` e repassa a chamada ao TMDB.
- `vercel.json` reescreve `/api/tmdb/:path*` → `/api/tmdb?path=:path*`, preservando os demais query params da chamada original.
- `vite.config.ts` tem um middleware equivalente (`tmdbDevProxy`) só para `npm run dev`, lendo o token do `.env` local via `loadEnv` — mesma URL relativa (`/api/tmdb/...`) funciona em dev e produção, sem código condicional no client.
- `src/shared/api/http-client.ts` e `src/shared/config/env.ts` não sabem mais de nenhum token; `TMDBHttpClient` só monta a URL relativa e faz o `fetch`, sem header de autenticação.

Optou-se por uma *function* fixa recebendo o caminho via query param (`?path=...`) em vez de uma rota dinâmica catch-all (`api/tmdb/[...path].ts`): o build da Vercel gerava, para esse catch-all, uma regex que só casava um único segmento de path (`([^/]+)`), quebrando qualquer endpoint do TMDB com mais de um segmento (ex.: `/trending/movie/day`, `/search/movie`). O rewrite explícito em `vercel.json` contorna isso e deixa o comportamento auditável no próprio arquivo de config, em vez de depender de inferência automática de rotas.

## O que faria diferente com mais tempo

- Code-splitting por rota (`React.lazy`) — o bundle de produção ultrapassa o aviso de 500kb do Vite.
- Testes de acessibilidade automatizados (axe-core), além da acessibilidade manual já aplicada (labels, `aria-pressed`, navegação por teclado nos cards).
- Prefetch de `/movie/:id` no hover do card (TanStack Query suporta `queryClient.prefetchQuery` facilmente) para a navegação parecer instantânea.
