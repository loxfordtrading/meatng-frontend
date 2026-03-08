import { apiRequest } from "@/lib/api/client";

export type CheckoutFrequency = "weekly" | "bi-weekly" | "monthly";

export interface CheckoutLineItem {
  name: string;
  quantity: number;
  weightG?: number;
  unitPrice?: number;
  type?: string;
}

export interface CheckoutRequestInput {
  autoSubscribe: boolean;
  frequency?: CheckoutFrequency | null;
  enableAutoDebit?: boolean;
}

export interface CheckoutResponse {
  authorizationUrl?: string;
  reference?: string;
  raw: unknown;
}

const asObj = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const getNested = (value: unknown, path: string): unknown =>
  path.split(".").reduce<unknown>((acc, part) => {
    if (!acc || typeof acc !== "object") return undefined;
    return (acc as Record<string, unknown>)[part];
  }, value);

const readString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim().length > 0 ? value : undefined;

const frequencyToWeeks = (frequency?: CheckoutFrequency | null): number | undefined => {
  if (!frequency) return undefined;
  if (frequency === "weekly") return 1;
  if (frequency === "bi-weekly") return 2;
  return 4;
};

export const createCheckoutSession = async (
  input: CheckoutRequestInput,
  token?: string | null,
): Promise<CheckoutResponse> => {
  const body: Record<string, unknown> = {
    auto_subscribe: input.autoSubscribe,
    enable_auto_debit: input.enableAutoDebit ?? true,
  };

  const weeks = frequencyToWeeks(input.frequency);
  if (typeof weeks === "number") body.frequency_weeks = weeks;

  const response = await apiRequest<unknown>("/checkout", {
    method: "POST",
    body,
    token,
  });

  const reference =
    readString(getNested(response, "payment.data.reference")) ??
    readString(getNested(response, "reference")) ??
    readString(getNested(response, "data.reference")) ??
    readString(getNested(response, "data.attributes.reference")) ??
    readString(getNested(response, "data.attributes.payment.reference"));

  const authorizationUrl =
    readString(getNested(response, "payment.data.authorization_url")) ??
    readString(getNested(response, "payment.data.authorizationUrl")) ??
    readString(getNested(response, "authorization_url")) ??
    readString(getNested(response, "authorizationUrl")) ??
    readString(getNested(response, "data.authorization_url")) ??
    readString(getNested(response, "data.authorizationUrl")) ??
    readString(getNested(response, "data.attributes.authorization_url")) ??
    readString(getNested(response, "data.attributes.authorizationUrl")) ??
    readString(getNested(response, "data.attributes.payment.authorization_url")) ??
    readString(getNested(response, "data.attributes.payment.authorizationUrl"));

  return { authorizationUrl, reference, raw: response };
};
