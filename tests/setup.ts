import "@testing-library/jest-dom/vitest";

// jsdom não implementa scrollTo; o TanStack Router chama isso na restauração de
// scroll entre navegações, o que só gera ruído nos testes.
window.scrollTo = () => {};
