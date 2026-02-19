'use client';

import { useState, KeyboardEvent } from 'react';

interface TagListProps {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  'data-field'?: string;
}

export function TagList({
  values,
  onChange,
  placeholder = 'Add item…',
  label,
  disabled,
  'data-field': dataField,
}: TagListProps) {
  const [input, setInput] = useState('');

  const add = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    const lower = trimmed.toLowerCase();
    if (values.some((v) => v.toLowerCase() === lower)) return;
    onChange([...values, trimmed]);
    setInput('');
  };

  const remove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add(input);
    }
  };

  return (
    <div className="w-full" data-field={dataField}>
      {label && (
        <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">{label}</label>
      )}
      <div className="flex flex-wrap gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 min-h-[42px]">
        {values.map((v, i) => (
          <span
            key={`${v}-${i}`}
            className="inline-flex items-center gap-1 rounded-full bg-[var(--muted-bg)] px-2.5 py-0.5 text-sm"
          >
            {v}
            {!disabled && (
              <button
                type="button"
                onClick={() => remove(i)}
                className="hover:text-[var(--destructive)] rounded-full p-0.5 leading-none"
                aria-label={`Remove ${v}`}
              >
                ×
              </button>
            )}
          </span>
        ))}
        {!disabled && (
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={() => add(input)}
            placeholder={values.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm placeholder:text-[var(--muted)] py-0.5"
          />
        )}
      </div>
    </div>
  );
}
