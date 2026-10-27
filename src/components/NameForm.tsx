import { Form, useActionData } from "react-router";
import { fieldError, type FormResult } from "../lib/forms.ts";
import { ButtonLink } from "./ui/Button.tsx";
import { Card } from "./ui/Card.tsx";
import { FormError } from "./ui/FormError.tsx";
import { SubmitButton } from "./ui/SubmitButton.tsx";
import { TextField } from "./ui/TextField.tsx";

interface NameFormProps {
  label: string;
  submitLabel: string;
  cancelTo: string;
  defaultValue?: string;
}

export function NameForm({ label, submitLabel, cancelTo, defaultValue }: NameFormProps) {
  const result = useActionData<FormResult>();

  return (
    <Card className="max-w-lg">
      <Form method="post" noValidate className="space-y-5">
        <FormError message={result?.message} />
        <TextField
          label={label}
          name="name"
          defaultValue={defaultValue}
          maxLength={30}
          autoFocus
          error={fieldError(result, "name")}
        />
        <div className="flex gap-3">
          <SubmitButton>{submitLabel}</SubmitButton>
          <ButtonLink to={cancelTo} variant="secondary">
            Cancel
          </ButtonLink>
        </div>
      </Form>
    </Card>
  );
}
