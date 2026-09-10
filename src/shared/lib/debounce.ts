/**
 * Cria uma versão "debounced" de uma função.
 * Útil para inputs de busca: evita floodar a API enquanto o usuário digita.
 *
 * @param func Função a ser executada após o delay
 * @param delayMs Delay em milissegundos (padrão 300ms)
 * @returns Função debounced que cancela pendências se chamada novamente
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- constraint precisa aceitar qualquer assinatura de função concreta
export function debounce<T extends (...args: any[]) => unknown>(
  func: T,
  delayMs = 300,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return function debounced(...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delayMs);
  };
}
