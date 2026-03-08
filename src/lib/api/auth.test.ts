import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { loginWithEmail, signupWithEmail } from "@/lib/api/customer";

const jsonResponse = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });

describe("customer auth api", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("logs in with email/password and maps top-level token + user", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        accessToken: "token-123",
        user: {
          id: "usr-1",
          name: "Jane Doe",
          email: "jane@example.com",
          role: "customer",
        },
      }),
    );

    const result = await loginWithEmail({
      email: "jane@example.com",
      password: "secret123",
    });

    expect(result).toEqual({
      token: "token-123",
      user: {
        id: "usr-1",
        name: "Jane Doe",
        email: "jane@example.com",
        role: "customer",
      },
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/auth/login");
    expect(options?.method).toBe("POST");
    expect(options?.headers).toMatchObject({
      Accept: "application/json",
      "Content-Type": "application/json",
    });
    expect(JSON.parse(String(options?.body))).toEqual({
      email: "jane@example.com",
      password: "secret123",
    });
  });

  it("maps nested backend auth response shape", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        data: {
          attributes: {
            data: {
              token: { accessToken: "nested-token" },
              user: {
                data: {
                  id: "usr-2",
                  email: "john@example.com",
                  firstName: "John",
                  lastName: "Stone",
                  role: "customer",
                },
              },
            },
          },
        },
      }),
    );

    const result = await loginWithEmail({
      email: "john@example.com",
      password: "secret123",
    });

    expect(result).toEqual({
      token: "nested-token",
      user: {
        id: "usr-2",
        name: "John Stone",
        email: "john@example.com",
        role: "customer",
      },
    });
  });

  it("maps the customer login JSON:API response shape", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        data: {
          attributes: {
            message: "User signed in successfully",
            status: 200,
            success: true,
            data: {
              token: { accessToken: "login-access-token" },
              user: {
                _id: "699a4490662b14c6f4731e86",
                id: "699a4490662b14c6f4731e86",
                email: "bishoptewogbade@yopmail.com",
                role: "user",
              },
            },
          },
        },
      }),
    );

    const result = await loginWithEmail({
      email: "bishoptewogbade@yopmail.com",
      password: "Adeyinka@2002",
    });

    expect(result).toEqual({
      token: "login-access-token",
      user: {
        id: "699a4490662b14c6f4731e86",
        name: "bishoptewogbade",
        email: "bishoptewogbade@yopmail.com",
        role: "user",
      },
    });
  });

  it("retries signup payload variants and succeeds on fallback", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ message: "confirmPassword is required" }, 400))
      .mockResolvedValueOnce(
        jsonResponse({
          token: "signup-token",
          user: { email: "new@example.com", firstName: "New", lastName: "User" },
        }),
      );

    const result = await signupWithEmail({
      fullName: "New User",
      email: "new@example.com",
      password: "secret123",
      confirmPassword: "secret123",
    });

    expect(result).toEqual({
      token: "signup-token",
      user: {
        id: undefined,
        name: "New User",
        email: "new@example.com",
        role: undefined,
      },
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [, firstOptions] = fetchMock.mock.calls[0];
    const [, secondOptions] = fetchMock.mock.calls[1];
    expect(JSON.parse(String(firstOptions?.body))).toEqual({
      email: "new@example.com",
      password: "secret123",
      confirmPassword: "secret123",
    });
    expect(JSON.parse(String(secondOptions?.body))).toEqual({
      email: "new@example.com",
      password: "secret123",
      passwordConfirmation: "secret123",
    });
  });

  it("throws the last signup error when all payloads fail", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ message: "first failure" }, 400))
      .mockResolvedValueOnce(jsonResponse({ message: "second failure" }, 400))
      .mockResolvedValueOnce(jsonResponse({ message: "third failure" }, 400));

    await expect(
      signupWithEmail({
        fullName: "Failing User",
        email: "fail@example.com",
        password: "secret123",
        confirmPassword: "secret123",
      }),
    ).rejects.toThrow("third failure");

    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("maps the customer signup JSON:API response shape", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        data: {
          attributes: {
            message: "User created successfully",
            data: {
              token: { accessToken: "signup-access-token" },
              user: {
                data: {
                  _id: "699a4490662b14c6f4731e86",
                  email: "bishoptewogbade@yopmail.com",
                  role: "user",
                },
              },
            },
          },
        },
      }),
    );

    const result = await signupWithEmail({
      fullName: "Bishop",
      email: "bishoptewogbade@yopmail.com",
      password: "Adeyinka@2002",
      confirmPassword: "Adeyinka@2002",
    });

    expect(result).toEqual({
      token: "signup-access-token",
      user: {
        id: "699a4490662b14c6f4731e86",
        name: "bishoptewogbade",
        email: "bishoptewogbade@yopmail.com",
        role: "user",
      },
    });
  });
});
