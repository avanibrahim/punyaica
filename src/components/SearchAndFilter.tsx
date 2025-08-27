import React, { memo, useCallback, useEffect, useRef, useState, startTransition } from "react";
import { Search } from "lucide-react";

interface SearchAndFilterProps {
  searchQuery: string;
  /** kategori dihapus; biar kompatibel kalau masih dipassing dari parent */
  selectedType?: string;
  onSearchChange: (query: string) => void;
  onTypeChange?: (type: string) => void;
}

/**
 * Performa fix:
 * - Debounce 250ms biar filter berat gak jalan di tiap ketik.
 * - startTransition untuk tandai update non-urgent.
 * - IME-safe (composition events).
 * - Kategori dihapus.
 */
export const SearchAndFilter = memo(({ searchQuery, onSearchChange }: SearchAndFilterProps) => {
  const [value, setValue] = useState(searchQuery ?? "");
  const [isComposing, setIsComposing] = useState(false);
  const tRef = useRef<number | null>(null);

  // Sinkron kalau parent reset/ubah dari luar
  useEffect(() => {
    if (!isComposing && searchQuery !== value) setValue(searchQuery ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]); // sengaja tidak memasukkan `value` utk hindari loop

  const flush = useCallback(
    (next: string) => {
      startTransition(() => onSearchChange(next));
    },
    [onSearchChange]
  );

  const schedule = useCallback(
    (next: string) => {
      if (tRef.current) clearTimeout(tRef.current);
      tRef.current = window.setTimeout(() => flush(next), 250);
    },
    [flush]
  );

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value;
      setValue(next);
      if (!isComposing) schedule(next);
    },
    [isComposing, schedule]
  );

  const onCompStart = useCallback(() => setIsComposing(true), []);
  const onCompEnd = useCallback(
    (e: React.CompositionEvent<HTMLInputElement>) => {
      setIsComposing(false);
      schedule((e.target as HTMLInputElement).value);
    },
    [schedule]
  );

  useEffect(() => {
    return () => {
      if (tRef.current) clearTimeout(tRef.current);
    };
  }, []);

  return (
    <div className="bg-journal-card border border-journal-border rounded-2xl p-4 md:p-6 shadow-xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="search"
          aria-label="Cari Jurnal atau nama file"
          placeholder="Cari Jurnal atau nama file…"
          value={value}
          onChange={onChange}
          onCompositionStart={onCompStart}
          onCompositionEnd={onCompEnd}
          autoComplete="off"
          spellCheck={false}
          inputMode="search"
          enterKeyHint="search"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-journal-border bg-journal-bg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
        />
      </div>
    </div>
  );
});
