import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { cx } from "../../helpers/cx";
import { useClickOutside } from "../../hooks/useClickOutside";
import { consoleControl, consoleField, consoleLabel } from "../../styles/classes";

type ConsoleSelectProps<T extends string> = {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
};

const ICON = "size-4 flex-none fill-none stroke-current stroke-[1.6] [stroke-linecap:round] [stroke-linejoin:round]";

/**
 * The trigger's border turns blue while it is focused or open, unless the
 * pointer is over it: hovering shows its own, darker grey border.
 */
const TRIGGER = cx(
  consoleControl,
  "group flex cursor-pointer items-center justify-between gap-2 text-left transition-[border-color,box-shadow] duration-150 ease-[ease]",
  "hover:border-[rgba(8,11,13,0.24)]",
  "focus-visible:not-hover:border-bay-deep focus-visible:[outline:none] focus-visible:ring-3 focus-visible:ring-info-soft",
  "aria-expanded:not-hover:border-bay-deep aria-expanded:[outline:none] aria-expanded:ring-3 aria-expanded:ring-info-soft",
);

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
    <div className={cx("relative", consoleField)} ref={rootRef}>
      <span className={consoleLabel} id={`${id}-label`}>
        {label}
      </span>
      <button
        ref={triggerRef}
        type="button"
        className={TRIGGER}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${id}-label ${id}-value`}
        onClick={() => (open ? setOpen(false) : openAt(Math.max(0, options.indexOf(value))))}
        onKeyDown={onTriggerKeyDown}
      >
        <span id={`${id}-value`}>{value}</span>
        <svg
          className={cx(
            ICON,
            "text-muted transition-[transform] duration-150 ease-[ease] group-aria-expanded:transform-[rotate(180deg)]",
          )}
          aria-hidden="true"
          viewBox="0 0 16 16"
        >
          <path d="m4 6 4 4 4-4" />
        </svg>
      </button>
      {open && (
        <ul
          ref={listRef}
          className={cx(
            "absolute inset-x-0 top-[calc(100%+6px)] z-10 rounded-xl border border-line bg-surface p-1 [outline:none]",
            "shadow-[0_10px_30px_-10px_rgba(8,11,13,0.25),0_2px_6px_rgba(8,11,13,0.06)] animate-console-pop motion-reduce:animate-none",
          )}
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
              className={cx(
                "flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-ink aria-selected:font-semibold",
                index === active && "bg-subtle",
              )}
              onPointerEnter={() => setActive(index)}
              onClick={() => choose(index)}
            >
              {option}
              {option === value && (
                <svg className={ICON} aria-hidden="true" viewBox="0 0 16 16">
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
