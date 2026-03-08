import { apiRequest } from "@/lib/api/client";

export interface AuthUser {
  id?: string;
  name: string;
  email: string;
  role?: string;
}

export interface AuthResult {
  token: string | null;
  user: AuthUser;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface SignupPayload extends LoginPayload {
  fullName: string;
  confirmPassword: string;
}

interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface TokenRequestPayload {
  requestId: string;
  token: string;
}

interface PasswordResetPayload extends TokenRequestPayload {
  password: string;
  confirmPassword: string;
}

const readNested = (obj: unknown, key: string): unknown => {
  if (!obj || typeof obj !== "object") return undefined;
  return (obj as Record<string, unknown>)[key];
};

const readPath = (obj: unknown, path: string): unknown => {
  return path.split(".").reduce<unknown>((acc, part) => {
    if (!acc || typeof acc !== "object") return undefined;
    return (acc as Record<string, unknown>)[part];
  }, obj);
};

const extractToken = (payload: unknown): string | null => {
  const candidates: unknown[] = [
    readNested(payload, "accessToken"),
    readNested(payload, "token"),
    readNested(payload, "jwt"),
    readNested(readNested(payload, "data"), "accessToken"),
    readNested(readNested(payload, "data"), "token"),
    readPath(payload, "data.attributes.data.token.accessToken"),
    readPath(payload, "data.attributes.data.token.token"),
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.length > 0) return candidate;
  }
  return null;
};

const extractUser = (payload: unknown, fallbackName = "User", fallbackEmail = ""): AuthUser => {
  const rawUser =
    readNested(payload, "user") ||
    readNested(readNested(payload, "data"), "user") ||
    readPath(payload, "data.attributes.data.user.data") ||
    readPath(payload, "data.attributes.data.user") ||
    payload;

  const asObj = (rawUser && typeof rawUser === "object" ? rawUser : {}) as Record<string, unknown>;
  const email = typeof asObj.email === "string" ? asObj.email : fallbackEmail;
  const firstName = typeof asObj.firstName === "string" ? asObj.firstName : "";
  const lastName = typeof asObj.lastName === "string" ? asObj.lastName : "";
  const combinedName = `${firstName} ${lastName}`.trim();

  const name =
    (typeof asObj.name === "string" && asObj.name) ||
    combinedName ||
    (email ? email.split("@")[0] : "") ||
    fallbackName;

  return {
    id:
      (typeof asObj.id === "string" && asObj.id) ||
      (typeof asObj._id === "string" && asObj._id) ||
      undefined,
    email,
    name,
    role: typeof asObj.role === "string" ? asObj.role : undefined,
  };
};

export const loginWithEmail = async ({ email, password }: LoginPayload): Promise<AuthResult> => {
  const response = await apiRequest<unknown>("/auth/login", {
    method: "POST",
    body: { email, password },
  });

  return {
    token: extractToken(response),
    user: extractUser(response, email.split("@")[0] || "User", email),
  };
};

const signupPayloadCandidates = ({ fullName, email, password, confirmPassword }: SignupPayload) => {
  return [
    // Matches swagger example contract exactly.
    {
      email,
      password,
      confirmPassword,
    },
    // Common alias fallback.
    {
      email,
      password,
      passwordConfirmation: confirmPassword,
    },
    // Legacy payload fallback.
    {
      fullName,
      email,
      password,
      confirmPassword,
    },
  ];
};

export const signupWithEmail = async (payload: SignupPayload): Promise<AuthResult> => {
  let lastError: unknown = null;

  for (const candidate of signupPayloadCandidates(payload)) {
    try {
      const response = await apiRequest<unknown>("/auth/signup", {
        method: "POST",
        body: candidate,
      });

      return {
        token: extractToken(response),
        user: extractUser(response, payload.fullName, payload.email),
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
};

export const changePassword = async (
  payload: ChangePasswordPayload,
  token?: string | null,
): Promise<void> => {
  await apiRequest<unknown>("/auth/change-password", {
    method: "PATCH",
    body: payload,
    token,
  });
};

export const verifyEmail = async ({ requestId, token }: TokenRequestPayload): Promise<void> => {
  try {
    await apiRequest<unknown>("/auth/verify-email", {
      method: "POST",
      body: {
        requestId,
        request_id: requestId,
        token,
      },
    });
  } catch {
    const query = new URLSearchParams({
      requestId,
      token,
    }).toString();

    await apiRequest<unknown>(`/auth/verify-email?${query}`, {
      method: "POST",
      body: {},
    });
  }
};

export const resetPassword = async ({
  requestId,
  token,
  password,
  confirmPassword,
}: PasswordResetPayload): Promise<void> => {
  await apiRequest<unknown>("/auth/reset-password", {
    method: "POST",
    body: {
      requestId,
      request_id: requestId,
      token,
      password,
      confirmPassword,
    },
  });
};

export const forgotPassword = async (email: string): Promise<void> => {
  await apiRequest<unknown>("/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
};

export const resendVerification = async (email: string): Promise<void> => {
  await apiRequest<unknown>("/auth/resend-verification", {
    method: "POST",
    body: { email },
  });
};

export const acceptInvitation = async ({
  requestId,
  token,
  password,
  confirmPassword,
}: PasswordResetPayload): Promise<void> => {
  await apiRequest<unknown>("/auth/accept-invitation", {
    method: "POST",
    body: {
      requestId,
      request_id: requestId,
      token,
      password,
      confirmPassword,
    },
  });
};
