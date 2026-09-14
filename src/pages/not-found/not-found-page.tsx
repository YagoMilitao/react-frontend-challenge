import { Link } from "@tanstack/react-router";
import { Film } from "lucide-react";
import { Button } from "@/shared/ui/button";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-4 text-center">
      <Film className="h-12 w-12 text-muted-foreground/40" strokeWidth={1.5} />
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Página não encontrada</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          O endereço que você acessou não existe ou foi movido.
        </p>
      </div>
      <Button asChild>
        <Link to="/discover">Voltar para Descobrir</Link>
      </Button>
    </div>
  );
}
