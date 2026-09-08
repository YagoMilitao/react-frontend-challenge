import { useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useThemeStore } from "@/features/theme/model/theme-store";

/**
 * Aplica a classe "dark" no <html> sempre que o tema muda,
 * inclusive na primeira renderização (hidratação do valor persistido).
 */
export function useSyncThemeWithDocument() {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
  }, [theme]);
}

export function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Alternar tema"
      onClick={toggleTheme}
    >
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}
