type ConsoleSelectProps<T extends string> = {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
};

/** A labelled form select with one option per entry in `options`. */
export function ConsoleSelect<T extends string>({ label, value, options, onChange }: ConsoleSelectProps<T>) {
  return (
    <label>
      <span className="console-label">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
