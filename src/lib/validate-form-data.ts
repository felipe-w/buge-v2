import { z } from "zod";

export class ValidationError extends Error {
  constructor(public readonly errors: Record<string, string[] | undefined>) {
    super("Erro ao validar os dados");
    this.name = "Validation Error";
  }
}

export function validateFormData<T>(formData: FormData, schema: z.ZodSchema<T>): T {
  const rawFormData = Object.fromEntries(formData.entries());
  const result = schema.safeParse(rawFormData);

  if (!result.success) {
    throw new ValidationError(result.error.flatten().fieldErrors);
  }

  return result.data;
}
