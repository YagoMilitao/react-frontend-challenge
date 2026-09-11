import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, X } from "lucide-react";
import type { Movie } from "@/entities/movie";
import { useGenres } from "@/entities/movie";
import { useWatchlistStore } from "@/features/watchlist";
import { Button } from "@/shared/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

type WatchlistRow = Movie & { genreLabel: string };

function formatReleaseDate(releaseDate: string) {
  if (!releaseDate) return "—";
  return new Date(`${releaseDate}T00:00:00`).toLocaleDateString("pt-BR");
}

interface SortableHeaderProps {
  label: string;
  isSorted: false | "asc" | "desc";
  onClick: () => void;
}

function SortableHeader({ label, isSorted, onClick }: SortableHeaderProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8"
      onClick={onClick}
      aria-label={`Ordenar por ${label}`}
    >
      {label}
      <ArrowUpDown className={isSorted ? "ml-2 h-3.5 w-3.5 opacity-100" : "ml-2 h-3.5 w-3.5 opacity-40"} />
    </Button>
  );
}

export function WatchlistTable() {
  const movies = useWatchlistStore((state) => state.movies);
  const removeMovie = useWatchlistStore((state) => state.removeMovie);
  const { data: genres } = useGenres();
  const [sorting, setSorting] = useState<SortingState>([]);

  const genreNameById = useMemo(() => {
    const map = new Map<number, string>();
    genres?.forEach((genre) => map.set(genre.id, genre.name));
    return map;
  }, [genres]);

  // O gênero é resolvido aqui, nos próprios dados da tabela, e não em um accessorFn:
  // o TanStack Table faz cache do valor computado por linha e só invalida quando a
  // referência de `data` muda — um accessorFn que lê `genreNameById` de fora ficaria
  // preso ao mapa vazio da primeira renderização (antes dos gêneros carregarem).
  const rows = useMemo<WatchlistRow[]>(
    () =>
      movies.map((movie) => ({
        ...movie,
        genreLabel:
          movie.genre_ids.map((id) => genreNameById.get(id)).filter(Boolean).join(", ") || "—",
      })),
    [movies, genreNameById],
  );

  const columns = useMemo<ColumnDef<WatchlistRow>[]>(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => (
          <SortableHeader
            label="Título"
            isSorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ getValue, row }) => (
          <Link
            to="/movie/$id"
            params={{ id: String(row.original.id) }}
            className="font-medium hover:underline"
          >
            {getValue<string>()}
          </Link>
        ),
      },
      {
        accessorKey: "genreLabel",
        header: ({ column }) => (
          <SortableHeader
            label="Gênero"
            isSorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ getValue }) => getValue<string>(),
      },
      {
        accessorKey: "release_date",
        header: "Data de lançamento",
        cell: ({ getValue }) => formatReleaseDate(getValue<string>()),
      },
      {
        accessorKey: "vote_average",
        header: ({ column }) => (
          <SortableHeader
            label="Rating"
            isSorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ getValue }) => getValue<number>().toFixed(1),
      },
      {
        id: "actions",
        header: "Ações",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Remover ${row.original.title} da minha lista`}
            onClick={() => removeMovie(row.original.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    [removeMovie],
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-center">
        <p className="text-sm font-medium">Sua lista está vazia</p>
        <p className="text-sm text-muted-foreground">
          Adicione filmes pela tela de descoberta para vê-los aqui.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
