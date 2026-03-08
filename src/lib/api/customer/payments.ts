import { apiRequest } from "@/lib/api/client";

export interface PaymentVerificationResult {
  reference: string;
  status?: string;
  paid?: boolean;
  amount?: number;
  raw: unknown;
}

export interface StartPaymentInput {
  userId: string;
  amount: number;
  callbackUrl?: string;
  reference?: string;
}

const getNested = (value: unknown, path: string): unknown =>
  path.split(".").reduce<unknown>((acc, part) => {
    if (!acc || typeof acc !== "object") return undefined;
    return (acc as Record<string, unknown>)[part];
  }, value);

const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim().length > 0 ? value : undefined;

const asNumber = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

const asBoolean = (value: unknown): boolean | undefined =>
  typeof value === "boolean" ? value : undefined;

const asObject = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

export const startPayment = async (
  input: StartPaymentInput,
  token?: string | null,
): Promise<{ authorizationUrl?: string; reference?: string; raw: unknown }> => {
  const candidates: Record<string, unknown>[] = [
    {
      user_id: input.userId,
      amount: input.amount,
      callback_url: input.callbackUrl,
      reference: input.reference,
    },
    { user_id: input.userId, amount: input.amount, reference: input.reference },
    { user_id: input.userId, amount: input.amount },
  ];

  let lastError: unknown = null;
  for (const candidate of candidates) {
    const body = asObject(candidate);
    Object.keys(body).forEach((key) => {
      const val = body[key];
      if (val === undefined || val === null || val === "") delete body[key];
    });

    try {
      const response = await apiRequest<unknown>("/payment", {
        method: "POST",
        token,
        body,
      });
      const authorizationUrl =
        asString(getNested(response, "authorization_url")) ??
        asString(getNested(response, "authorizationUrl")) ??
        asString(getNested(response, "data.authorization_url")) ??
        asString(getNested(response, "data.authorizationUrl")) ??
        asString(getNested(response, "data.data.authorization_url")) ??
        asString(getNested(response, "data.data.authorizationUrl"));
      const reference =
        asString(getNested(response, "reference")) ??
        asString(getNested(response, "data.reference")) ??
        asString(getNested(response, "data.data.reference")) ??
        asString(getNested(response, "data.attributes.reference"));

      return { authorizationUrl, reference, raw: response };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
};

export const verifyPaymentReference = async (
  reference: string,
  token?: string | null,
): Promise<PaymentVerificationResult> => {
  const encoded = encodeURIComponent(reference);
  const response = await apiRequest<unknown>(`/payment/verify?reference=${encoded}`, {
    method: "GET",
    token,
  });

  return {
    reference:
      asString(getNested(response, "reference")) ??
      asString(getNested(response, "data.reference")) ??
      asString(getNested(response, "data.attributes.reference")) ??
      reference,
    status:
      asString(getNested(response, "status")) ??
      asString(getNested(response, "data.status")) ??
      asString(getNested(response, "data.attributes.status")),
    paid:
      asBoolean(getNested(response, "paid")) ??
      asBoolean(getNested(response, "data.paid")) ??
      asBoolean(getNested(response, "data.attributes.paid")),
    amount:
      asNumber(getNested(response, "amount")) ??
      asNumber(getNested(response, "data.amount")) ??
      asNumber(getNested(response, "data.attributes.amount")),
    raw: response,
  };
};
