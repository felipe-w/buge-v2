/* eslint-disable @typescript-eslint/no-explicit-any */
import { User } from "better-auth";
import { z } from "zod";

import { checkAuthSession } from "@/server/data/users";

import { FormState } from "./validations";

/**
 * A function type for validated actions without user context.
 * @template S - Zod schema type
 * @template T - Return type
 * @param data - Parsed and validated data from the schema
 * @param formData - The original FormData object
 * @returns Promise resolving to T
 */
type ValidatedActionFunction<S extends z.ZodType<any, any>, T> = (data: z.infer<S>, formData: FormData) => Promise<T>;

/**
 * Wraps an action with Zod schema validation. If validation fails, returns an error in the result.
 *
 * @template S - Zod schema type
 * @template T - Return type
 * @param schema - Zod schema to validate against
 * @param action - Action to execute if validation passes
 * @returns A function that takes previous state and FormData, returning a Promise of T
 *
 * @example
 * // Define a schema
 * const schema = z.object({ email: z.string().email() });
 *
 * // Define an action
 * async function doSomething(data, formData) {
 *   // ...
 *   return { success: 'ok' };
 * }
 *
 * // Create a validated action
 * const action = validatedAction(schema, doSomething);
 */
export function validatedAction<S extends z.ZodType<any, any>, T>(schema: S, action: ValidatedActionFunction<S, T>) {
  return async (prevState: FormState, formData: FormData): Promise<T> => {
    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return {
        success: false,
        message: "Erro ao validar os dados do grupo",
        errors: result.error.flatten().fieldErrors,
      } as T;
    }

    return action(result.data, formData);
  };
}

/**
 * A function type for validated actions with user context.
 * @template S - Zod schema type
 * @template T - Return type
 * @param data - Parsed and validated data from the schema
 * @param formData - The original FormData object
 * @param user - The authenticated user
 * @returns Promise resolving to T
 */
type ValidatedActionWithUserFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData,
  user: User & { selectedGroupId?: string | null | undefined },
) => Promise<T>;

/**
 * Wraps an action with Zod schema validation and user authentication. Throws if user is not authenticated.
 *
 * @template S - Zod schema type
 * @template T - Return type
 * @param schema - Zod schema to validate against
 * @param action - Action to execute if validation passes and user is authenticated
 * @returns A function that takes previous state and FormData, returning a Promise of T
 *
 * @example
 * // Define a schema
 * const schema = z.object({ name: z.string().min(1) });
 *
 * // Define an action
 * async function doSomething(data, formData, user) {
 *   // ...
 *   return { success: `Hello, ${user.name}` };
 * }
 *
 * // Create a validated action with user
 * const action = validatedActionWithUser(schema, doSomething);
 */
export function validatedActionWithUser<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionWithUserFunction<S, T>,
) {
  return async (prevState: FormState, formData: FormData): Promise<T> => {
    const user = await checkAuthSession();
    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return {
        success: false,
        message: "Erro ao validar os dados do grupo",
        errors: result.error.flatten().fieldErrors,
      } as T;
    }

    return action(result.data, formData, user);
  };
}

/**
 * ---
 *
 * # Usage Examples
 *
 * // Example for validatedAction
 * const schema = z.object({ email: z.string().email() });
 * async function doSomething(data, formData) {
 *   // ...
 *   return { success: 'ok' };
 * }
 * const action = validatedAction(schema, doSomething);
 *
 * // Example for validatedActionWithUser
 * const userSchema = z.object({ name: z.string().min(1) });
 * async function doSomethingWithUser(data, formData, user) {
 *   // ...
 *   return { success: `Hello, ${user.name}` };
 * }
 * const userAction = validatedActionWithUser(userSchema, doSomethingWithUser);
 */
// import { z } from "zod";

// export class ValidationError extends Error {
//   constructor(public readonly errors: Record<string, string[] | undefined>) {
//     super("Erro ao validar os dados");
//     this.name = "Validation Error";
//   }
// }

// export function validateFormData<T>(formData: FormData, schema: z.ZodSchema<T>): T {
//   const rawFormData = Object.fromEntries(formData.entries());
//   const result = schema.safeParse(rawFormData);

//   if (!result.success) {
//     throw new ValidationError(result.error.flatten().fieldErrors);
//   }

//   return result.data;
// }
