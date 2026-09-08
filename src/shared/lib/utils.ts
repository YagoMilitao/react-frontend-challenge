import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina classes condicionais do clsx com o merge inteligente do tailwind-merge,
 * evitando conflitos de classes utilitárias duplicadas (ex: "p-2 p-4").
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
