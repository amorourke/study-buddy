import { Form, Link, useActionData } from "react-router";
import { Card } from "../../components/ui/Card.tsx";
import { FormError } from "../../components/ui/FormError.tsx";
import { SubmitButton } from "../../components/ui/SubmitButton.tsx";
import { TextField } from "../../components/ui/TextField.tsx";
import { fieldError, type FormResult } from "../../lib/forms.ts";

export function RegisterPage() {
  const result = useActionData<FormResult>();

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-center text-2xl font-semibold tracking-tight">Create an account</h1>
      <Card>
        <Form method="post" noValidate className="space-y-5">
          <FormError message={result?.message} />
          <TextField
            label="Username"
            name="username"
            autoComplete="username"
            maxLength={30}
            autoFocus
            error={fieldError(result, "username")}
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            error={fieldError(result, "email")}
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            error={fieldError(result, "password")}
          />
          <TextField
            label="Confirm password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            error={fieldError(result, "confirmPassword")}
          />
          <p className="text-xs text-slate-500">
            At least 8 characters, with an uppercase letter, a lowercase letter and one of ! * . ?
          </p>
          <SubmitButton pendingText="Registering…">Register</SubmitButton>
        </Form>
      </Card>
      <p className="mt-4 text-center text-sm text-slate-500">
        Already registered?{" "}
        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
          Log in
        </Link>
      </p>
    </div>
  );
}
