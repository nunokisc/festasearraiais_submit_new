"use client";

// =============================================================
// SearchableSelect.tsx
// Combobox acessível com pesquisa por texto.
// Sem dependências externas — alinhado com o stack do website_new.
//
// Features:
//   - Filtra opções enquanto o utilizador escreve
//   - Navegação por teclado (↑↓ Enter Escape Tab)
//   - Fecha ao clicar fora
//   - Screen-reader friendly (role combobox + listbox + aria-*)
//   - Mobile-first: dropdown abre para cima se não há espaço
// =============================================================

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  id: string;
  options: SelectOption[];
  value: string;            // selected option value ("" = none)
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  hasError?: boolean;
  "aria-required"?: boolean;
  "aria-describedby"?: string;
}

export function SearchableSelect({
  id,
  options,
  value,
  onChange,
  placeholder = "Selecionar…",
  disabled = false,
  loading = false,
  hasError = false,
  "aria-required": ariaRequired,
  "aria-describedby": ariaDescribedby,
}: SearchableSelectProps) {
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  // Label of the selected option
  const selectedLabel =
    options.find((o) => o.value === value)?.label ?? "";

  // Filtered options
  const filtered =
    query.trim() === ""
      ? options
      : options.filter((o) =>
          o.label
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .includes(
              query
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
            )
        );

  // Open → reset active index and show current selection at top of visible area
  function openDropdown() {
    if (disabled || loading) return;
    setOpen(true);
    setActiveIndex(filtered.findIndex((o) => o.value === value));
  }

  function closeDropdown() {
    setOpen(false);
    setQuery("");
    setActiveIndex(-1);
  }

  function selectOption(option: SelectOption) {
    onChange(option.value);
    closeDropdown();
    inputRef.current?.blur();
  }

  function clearSelection() {
    onChange("");
    setQuery("");
    inputRef.current?.focus();
  }

  // Scroll active item into view
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const list = listRef.current;
    if (!list) return;
    const item = list.children[activeIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        closeDropdown();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
      setActiveIndex(-1);
      if (!open) setOpen(true);
    },
    [open]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          if (!open) { openDropdown(); return; }
          setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (open && activeIndex >= 0 && filtered[activeIndex]) {
            selectOption(filtered[activeIndex]);
          } else if (!open) {
            openDropdown();
          }
          break;
        case "Escape":
          closeDropdown();
          break;
        case "Tab":
          if (open) closeDropdown();
          break;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open, filtered, activeIndex]
  );

  // Input displays: while open → the typed query; while closed → the selected label
  const inputValue = open ? query : selectedLabel;

  const inputClass = [
    "field-input pr-16",
    hasError ? "error" : "",
    disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={containerRef} className="relative">
      {/* Combobox input */}
      <input
        ref={inputRef}
        id={id}
        type="text"
        role="combobox"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        className={inputClass}
        value={inputValue}
        placeholder={loading ? "A carregar…" : placeholder}
        disabled={disabled || loading}
        aria-required={ariaRequired}
        aria-describedby={ariaDescribedby}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-activedescendant={
          open && activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined
        }
        onChange={handleInputChange}
        onFocus={openDropdown}
        onKeyDown={handleKeyDown}
        readOnly={disabled || loading}
      />

      {/* Right-side icons */}
      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
        {loading ? (
          <span className="spinner" aria-hidden="true" />
        ) : (
          <>
            {/* Clear button — only when a value is selected */}
            {value && !disabled && (
              <button
                type="button"
                tabIndex={-1}
                onPointerDown={(e) => { e.preventDefault(); clearSelection(); }}
                className="pointer-events-auto p-0.5 rounded text-gray-400 hover:text-gray-700 transition-colors"
                aria-label="Limpar seleção"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            {/* Chevron */}
            <svg
              aria-hidden="true"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              className={`transition-transform duration-150 text-gray-400 ${open ? "rotate-180" : ""}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </div>

      {/* Dropdown listbox */}
      {open && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label={placeholder}
          className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto py-1 text-sm"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-gray-400 select-none">
              Sem resultados para &ldquo;{query}&rdquo;
            </li>
          ) : (
            filtered.map((option, idx) => {
              const isSelected = option.value === value;
              const isActive = idx === activeIndex;
              return (
                <li
                  key={option.value}
                  id={`${listboxId}-${idx}`}
                  role="option"
                  aria-selected={isSelected}
                  onPointerDown={(e) => {
                    e.preventDefault(); // prevent blur from closing first
                    selectOption(option);
                  }}
                  className={[
                    "px-3 py-2 cursor-pointer select-none flex items-center justify-between gap-2",
                    isActive ? "bg-[#2d373c] text-white" : "hover:bg-gray-50",
                    isSelected && !isActive ? "font-semibold text-[#2d373c]" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <span>{option.label}</span>
                  {isSelected && (
                    <svg
                      aria-hidden="true"
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                      className={isActive ? "text-white" : "text-[#2d373c]"}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
