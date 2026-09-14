import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useAuthStore } from "@/features/auth/model/auth-store";
import { ThemeToggle } from "@/features/theme/ui/theme-toggle";
import { Button } from "@/shared/ui/button";

const navLinkClass =
  "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground [&.active]:text-foreground";

export function AppNav() {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate({ to: "/login" });
  }

  return (
    <header className="border-b">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-sm font-semibold">CineDash</span>
          <nav className="flex items-center gap-4">
            <Link to="/discover" className={navLinkClass} activeProps={{ className: "text-foreground" }}>
              Descobrir
            </Link>
            <Link to="/watchlist" className={navLinkClass} activeProps={{ className: "text-foreground" }}>
              Minha lista
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" aria-label="Sair" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
