import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { useClickOutside } from "../../hooks/useClickOutside";

type ConsoleSelectProps<T extends string> = {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
};

/**
 * A labelled dropdown: a trigger button and a styled listbox, standing in for
 * a native <select>, whose open menu the browser draws and CSS cannot reach.
 */
export function ConsoleSelect<T extends string>({ label, value, options, onChange }: ConsoleSelectProps<T>) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const close = useCallback(() => setOpen(false), []);

  useClickOutside(rootRef, open, close);

  useEffect(() => {
    if (open) listRef.current?.focus();
  }, [open]);

  const openAt = (index: number) => {
    setActive(index);
    setOpen(true);
  };

  const choose = (index: number) => {
    onChange(options[index]);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const onTriggerKeyDown = (event: KeyboardEvent) => {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      openAt(Math.max(0, options.indexOf(value)));
    }
  };

  const onListKeyDown = (event: KeyboardEvent) => {
    const last = options.length - 1;
    const moves: Record<string, number> = {
      ArrowDown: Math.min(active + 1, last),
      ArrowUp: Math.max(active - 1, 0),
      Home: 0,
      End: last,
    };
    if (event.key in moves) {
      event.preventDefault();
      setActive(moves[event.key]);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      choose(active);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    } else if (event.key === "Tab") {
      setOpen(false);
    } else if (event.key.length === 1) {
      // Typing a letter jumps to the first option that starts with it.
      const match = options.findIndex((option) => option.startsWith(event.key.toLowerCase()));
      if (match >= 0) setActive(match);
    }
  };

  return (
    <div className="console-field console-select" ref={rootRef}>
      <span className="console-label" id={`${id}-label`}>
        {label}
      </span>
      <button
        ref={triggerRef}
        type="button"
        className="console-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${id}-label ${id}-value`}
        onClick={() => (open ? setOpen(false) : openAt(Math.max(0, options.indexOf(value))))}
        onKeyDown={onTriggerKeyDown}
      >
        <span id={`${id}-value`}>{value}</span>
        <svg className="console-select-chevron" aria-hidden="true" viewBox="0 0 16 16">
          <path d="m4 6 4 4 4-4" />
        </svg>
      </button>
      {open && (
        <ul
          ref={listRef}
          className="console-select-list"
          role="listbox"
          tabIndex={-1}
          aria-labelledby={`${id}-label`}
          aria-activedescendant={`${id}-option-${active}`}
          onKeyDown={onListKeyDown}
        >
          {options.map((option, index) => (
            <li
              key={option}
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={option === value}
              className={index === active ? "active" : undefined}
              onPointerEnter={() => setActive(index)}
              onClick={() => choose(index)}
            >
              {option}
              {option === value && (
                <svg className="console-select-check" aria-hidden="true" viewBox="0 0 16 16">
                  <path d="m3.5 8.5 3 3 6-7" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
