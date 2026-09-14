import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/shared/ui/button";
import { logger } from "@/shared/lib/logger";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Rede de segurança para crashes de renderização que escapam do tratamento de
 * erro do TanStack Query (ex.: um dado com formato inesperado quebrando um
 * componente). Sem isso, um erro assim derruba a árvore inteira do React e o
 * usuário vê uma tela em branco, sem nenhuma pista do que houve.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error("Erro não tratado capturado pelo ErrorBoundary:", error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-4 text-center">
          <h1 className="text-2xl font-semibold">Algo deu errado</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            Ocorreu um erro inesperado nesta tela. Tente recarregar a página.
          </p>
          <Button onClick={() => window.location.reload()}>Recarregar página</Button>
        </div>
      );
    }

    return this.props.children;
  }
}
