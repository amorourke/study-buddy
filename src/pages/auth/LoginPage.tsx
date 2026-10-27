import { Form, Link, useActionData } from "react-router";
import { Card } from "../../components/ui/Card.tsx";
import { FormError } from "../../components/ui/FormError.tsx";
import { SubmitButton } from "../../components/ui/SubmitButton.tsx";
import { TextField } from "../../components/ui/TextField.tsx";
import { fieldError, type FormResult } from "../../lib/forms.ts";

export function LoginPage() {
  const result = useActionData<FormResult>();

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-center text-2xl font-semibold tracking-tight">Log in</h1>
      <Card>
        <Form method="post" noValidate className="space-y-5">
          <FormError message={result?.message} />
          <TextField
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            error={fieldError(result, "username")}
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            error={fieldError(result, "password")}
          />
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="rememberMe"
              className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
            />
            Remember me
          </label>
          <SubmitButton pendingText="Logging in…">Log in</SubmitButton>
        </Form>
      </Card>
      <p className="mt-4 text-center text-sm text-slate-500">
        No account yet?{" "}
        <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
          Register
        </Link>
      </p>
    </div>
  );
}
