import { useId, type InputHTMLAttributes } from "react";
import { FieldError } from "./FieldError.tsx";
import { inputClasses } from "./styles.ts";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
}

export function TextField({ label, error, type = "text", ...props }: TextFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={inputClasses}
        {...props}
      />
      <FieldError id={errorId} message={error} />
    </div>
  );
}
