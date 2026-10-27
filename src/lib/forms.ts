import { z } from "zod";
import type { FieldErrors } from "../../shared/types.ts";
import { ApiError } from "./api.ts";

export interface FormResult {
  message?: string;
  fieldErrors?: FieldErrors;
}

export async function readForm(request: Request): Promise<Record<string, FormDataEntryValue>> {
  return Object.fromEntries(await request.formData());
}

export async function submitForm<Schema extends z.ZodType>(
  values: unknown,
  schema: Schema,
  submit: (data: z.output<Schema>) => Promise<unknown>,
): Promise<FormResult | undefined> {
  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors as FieldErrors };
  }

  try {
    await submit(parsed.data);
    return undefined;
  } catch (error) {
    if (error instanceof ApiError) {
      return { message: error.fieldErrors ? undefined : error.message, fieldErrors: error.fieldErrors };
    }
    throw error;
  }
}

export function fieldError(result: FormResult | undefined, field: string): string | undefined {
  return result?.fieldErrors?.[field]?.[0];
}
