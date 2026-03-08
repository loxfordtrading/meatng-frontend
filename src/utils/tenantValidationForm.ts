import { ZodSchema } from "zod";
import { toast } from "react-toastify";

export function tenantValidationForm<T>(
  schema: ZodSchema<T>,
  data: unknown,
  toastId?: string
): { success: true; data: T } | { success: false } {
  const result = schema.safeParse(data);

  if (!result.success) {
    const fieldErrors: Partial<Record<keyof T, string>> = {};
    result.error.errors.forEach((err) => {
      const field = err.path[0] as keyof T;
      fieldErrors[field] = err.message;
    });

    const firstError = Object.values(fieldErrors)[0];
    if (typeof firstError === "string") {
      toast.error(firstError, {
        toastId,
      });
    }

    return { success: false };
  }

  return { success: true, data: result.data };
}
