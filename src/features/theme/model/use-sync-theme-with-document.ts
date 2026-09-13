import { useEffect } from "react";
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
