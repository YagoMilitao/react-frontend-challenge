import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { Input } from "@/shared/ui/input";
import { debounce } from "@/shared/lib/debounce";

interface SearchInputProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  delayMs?: number;
}

/**
 * Input de busca com debounce para não floodar a API do TMDB a cada tecla.
 * O valor exibido atualiza imediatamente; onSearch só dispara após o delay.
 */
export function SearchInput({
  onSearch,
  placeholder = "Buscar filmes...",
  delayMs = 300,
}: SearchInputProps) {
  const [value, setValue] = useState("");
  const onSearchRef = useRef(onSearch);
  onSearchRef.current = onSearch;

  const debouncedSearch = useMemo(
    () => debounce((query: string) => onSearchRef.current(query), delayMs),
    [delayMs],
  );

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const query = event.target.value;
    setValue(query);
    debouncedSearch(query);
  }

  return (
    <Input
      type="search"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      aria-label="Buscar filmes"
    />
  );
}
