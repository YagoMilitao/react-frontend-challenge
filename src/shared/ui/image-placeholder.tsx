import { Film } from "lucide-react";
import { cn } from "@/shared/lib/utils";

/**
 * Preenchimento visual para quando a API do TMDB não tem imagem (comum em
 * lançamentos futuros/pouco populares — não é um caso raro). Antes disso, o
 * <img> apontava para um arquivo estático que nem existia no projeto, então
 * a imagem quebrava silenciosamente e só sobrava o fundo cinza do container.
 */
export function ImagePlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/60",
        className,
      )}
    >
      <Film className="h-1/4 w-1/4 min-h-6 min-w-6 text-muted-foreground/40" strokeWidth={1.5} />
    </div>
  );
}
