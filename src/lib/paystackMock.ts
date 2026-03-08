export interface PaystackMockSessionInput {
  email: string;
  amountKobo: number;
  reference: string;
  customerName?: string;
  metadata?: Record<string, unknown>;
}

export interface PaystackMockSession {
  accessCode: string;
  authorizationUrl: string;
  reference: string;
  amountKobo: number;
  email: string;
  customerName?: string;
  metadata?: Record<string, unknown>;
  createdAtIso: string;
}

const randomId = (prefix: string): string => {
  const suffix = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `${prefix}_${suffix}`;
};

export const initializePaystackMock = async (
  input: PaystackMockSessionInput
): Promise<PaystackMockSession> => {
  await new Promise((resolve) => setTimeout(resolve, 350));

  return {
    accessCode: randomId("PSKTEST"),
    authorizationUrl: `https://checkout.paystack.mock/authorize/${input.reference}`,
    reference: input.reference,
    amountKobo: input.amountKobo,
    email: input.email,
    customerName: input.customerName,
    metadata: input.metadata,
    createdAtIso: new Date().toISOString(),
  };
};
