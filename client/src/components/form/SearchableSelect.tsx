import { useEffect, useMemo, useRef, useState } from "react";

export interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// A single-select combobox with a type-to-filter search box, styled to match the plain
// `rounded-lg border px-4 py-2` <select> convention used throughout the app's forms. Meant as
// a drop-in replacement wherever a native <select> would force scrolling through a long list
// (branches, suppliers, products, categories, provinces/municipalities/barangays, roles...).
export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className = "",
  disabled = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedLabel = useMemo(
    () => options.find((option) => option.value === value)?.label ?? "",
    [options, value]
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term ? options.filter((option) => option.label.toLowerCase().includes(term)) : options;
  }, [options, query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setHighlighted(0);
  }, [query, isOpen]);

  const openDropdown = () => {
    if (disabled) return;
    setIsOpen(true);
    setQuery("");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const select = (option: SearchableSelectOption) => {
    onChange(option.value);
    setIsOpen(false);
    setQuery("");
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlighted((current) => Math.min(current + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((current) => Math.max(current - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (filtered[highlighted]) select(filtered[highlighted]);
    } else if (event.key === "Escape") {
      setIsOpen(false);
      setQuery("");
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {isOpen ? (
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={selectedLabel || placeholder}
          className="w-full rounded-lg border px-4 py-2 dark:border-white/10 dark:bg-gray-900 dark:text-white"
        />
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={openDropdown}
          className={`flex w-full items-center justify-between rounded-lg border px-4 py-2 text-left disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 ${selectedLabel ? "dark:text-white" : "text-gray-400"}`}
        >
          <span className="truncate">{selectedLabel || placeholder}</span>
          <svg className="ml-2 h-4 w-4 shrink-0 text-gray-400" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.79175 7.39551L10.0001 12.6038L15.2084 7.39551" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border bg-white shadow-lg dark:border-white/10 dark:bg-gray-900">
          {filtered.length ? (
            filtered.map((option, index) => (
              <button
                type="button"
                key={option.value}
                onClick={() => select(option)}
                className={`block w-full px-4 py-2 text-left text-sm ${
                  index === highlighted ? "bg-brand-50 dark:bg-white/5" : ""
                } ${option.value === value ? "font-medium text-brand-600" : "text-gray-700 dark:text-gray-300"} hover:bg-brand-50 dark:hover:bg-white/5`}
              >
                {option.label}
              </button>
            ))
          ) : (
            <p className="px-4 py-2 text-sm text-gray-400">No matches found.</p>
          )}
        </div>
      )}
    </div>
  );
}
