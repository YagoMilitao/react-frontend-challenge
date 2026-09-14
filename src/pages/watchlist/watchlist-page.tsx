import { WatchlistTable } from "@/widgets/watchlist-table";

export function WatchlistPage() {
  return (
    <div className="container flex flex-col gap-6 py-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Minha lista</h1>
        <p className="text-sm text-muted-foreground">
          Filmes selecionados para compor o catálogo do streaming.
        </p>
      </header>

      <WatchlistTable />
    </div>
  );
}
