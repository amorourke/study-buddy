import { useId, type SelectHTMLAttributes } from "react";
import { FieldError } from "./FieldError.tsx";
import { inputClasses } from "./styles.ts";

export interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  name: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
}

export function SelectField({ label, options, placeholder, error, defaultValue = "", ...props }: SelectFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        id={id}
        defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={inputClasses}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldError id={errorId} message={error} />
    </div>
  );
}
