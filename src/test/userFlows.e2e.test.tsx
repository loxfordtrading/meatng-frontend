import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "@/App";
import { ROUTES } from "@/lib/routes";

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function setRoute(path: string): void {
  window.history.pushState({}, "", path);
}

describe("User flows (customer + admin) e2e-style", () => {
  const cartBodies: Array<Record<string, unknown>> = [];
  let checkoutSessions = 0;

  beforeEach(() => {
    localStorage.clear();
    cartBodies.length = 0;
    checkoutSessions = 0;

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        const method = (init?.method || "GET").toUpperCase();
        const body = init?.body && typeof init.body === "string" ? JSON.parse(init.body) : {};

        if (url.includes("/auth/login") && method === "POST") {
          const email = String((body as { email?: string }).email || "").toLowerCase();

          if (email.endsWith("@loxfordtrading.com") || email === "manager@meatng.com") {
            return jsonResponse({
              token: "admin-token",
              user: { id: "admin-1", name: "Admin User", email, role: "manager" },
            });
          }

          return jsonResponse({
            token: "customer-token",
            user: { id: "cust-1", name: "Customer One", email: email || "customer@example.com", role: "customer" },
          });
        }

        if (url.includes("/products") && method === "GET") {
          return jsonResponse({
            data: [
              { id: "pid-beef-bone-in", attributes: { name: "Beef Bone-In", slug: "beef-bone-in", is_active: true } },
              { id: "pid-chicken-thighs", attributes: { name: "Chicken Thighs", slug: "chicken-thighs", is_active: true } },
            ],
          });
        }
        if (url.includes("/product-categories") && method === "GET") return jsonResponse({ data: [] });
        if (url.includes("/plans/active") && method === "GET") return jsonResponse({ data: [] });
        if (url.includes("/addresses") && method === "GET") return jsonResponse({ data: [] });
        if (url.includes("/orders/my-orders") && method === "GET") return jsonResponse({ data: [] });
        if (url.includes("/orders") && method === "GET") return jsonResponse({ data: [] });
        if (url.includes("/users/me") && method === "GET") {
          return jsonResponse({
            data: {
              id: "cust-1",
              attributes: { firstName: "Customer", lastName: "One", email: "customer@example.com" },
            },
          });
        }

        if (url.includes("/carts/items") && method === "POST") {
          cartBodies.push((body || {}) as Record<string, unknown>);
          return jsonResponse({ ok: true });
        }
        if (url.includes("/carts") && method === "DELETE") return jsonResponse({});

        if (url.includes("/checkout") && method === "POST") {
          checkoutSessions += 1;
          return jsonResponse({
            payment: {
              data: {
                reference: "MN-REF-123",
              },
            },
          });
        }

        if (url.includes("/payment/verify") && method === "GET") {
          return jsonResponse({
            reference: "MN-REF-123",
            status: "success",
            paid: true,
            amount: 15000,
          });
        }

        return jsonResponse({ data: [] });
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    ROUTES.admin,
    ROUTES.adminOrders,
    ROUTES.adminCustomers,
    ROUTES.adminProducts,
    ROUTES.adminSubscriptions,
    ROUTES.adminDeliveries,
    ROUTES.adminAnalytics,
    ROUTES.adminSettings,
  ])("redirects unauthenticated admin route %s to admin login", async (adminPath) => {
    setRoute(adminPath);
    render(<App />);

    await waitFor(() => {
      expect(window.location.pathname).toBe(ROUTES.adminLogin);
    });
    expect(screen.getByText(/sign in to access the admin panel/i)).toBeInTheDocument();
  });

  it("allows admin login and navigates to admin dashboard", async () => {
    setRoute(ROUTES.adminLogin);
    render(<App />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "manager@meatng.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "manager123" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(window.location.pathname).toBe(ROUTES.admin);
    });
  });

  it("redirects staff account from customer sign in to admin", async () => {
    setRoute(ROUTES.authSignIn);
    render(<App />);

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "olusegun@loxfordtrading.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "adeyinka@2002" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(window.location.pathname).toBe(ROUTES.admin);
    });
  });

  it("redirects checkout to sign in for unauthenticated one-time cart", async () => {
    localStorage.setItem(
      "meatng-cart",
      JSON.stringify({
        deliveryFrequency: "one-time",
        items: [
          {
            id: "product-beef-bone-in",
            type: "product",
            productId: "beef-bone-in",
            name: "Beef Bone-In",
            price: 4800,
            quantity: 1,
            image: "/x.jpg",
          },
        ],
      }),
    );

    setRoute(ROUTES.checkout);
    render(<App />);

    await waitFor(() => {
      expect(window.location.pathname).toBe(ROUTES.authSignIn);
    });
  });

  it("expands gift-box contents into backend cart items and redirects to payment URL", async () => {
    localStorage.setItem("meatng-auth-token", "customer-token");
    localStorage.setItem(
      "meatng-cart",
      JSON.stringify({
        deliveryFrequency: "one-time",
        items: [
          {
            id: "gift-gift-classic",
            type: "gift-box",
            boxId: "gift-classic",
            name: "The Classic Box",
            price: 15000,
            quantity: 1,
            image: "/gift.jpg",
            items: [
              { productId: "beef-bone-in", quantity: 1 },
              { productId: "chicken-thighs", quantity: 1 },
            ],
          },
        ],
      }),
    );

    setRoute(ROUTES.cart);
    render(<App />);

    fireEvent.click(await screen.findByRole("link", { name: /proceed to checkout/i }));
    expect(await screen.findByRole("heading", { name: /one-time checkout/i })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "John" } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: "Doe" } });
    fireEvent.change(screen.getByLabelText(/^email/i), { target: { value: "john@example.com" } });
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: "08012345678" } });
    const stateSelect = screen.getByLabelText(/state/i) as HTMLSelectElement;
    const stateOptions = Array.from(stateSelect.options)
      .map((option) => option.value)
      .filter((value) => !!value);
    fireEvent.change(stateSelect, { target: { value: stateOptions[0] } });

    const areaSelect = screen.queryByLabelText(/delivery area/i);
    if (areaSelect) {
      const areaOptions = Array.from((areaSelect as HTMLSelectElement).options)
        .map((option) => option.value)
        .filter((value) => !!value);
      fireEvent.change(areaSelect, { target: { value: areaOptions[0] } });
    } else {
      fireEvent.change(screen.getByLabelText(/city \/ town/i), { target: { value: "Ikeja" } });
    }
    fireEvent.change(screen.getByLabelText(/street address/i), { target: { value: "12 Adeniyi Jones" } });

    fireEvent.click(screen.getByRole("button", { name: /^pay$/i }));

    await waitFor(() => {
      expect(checkoutSessions).toBe(1);
    });

    expect(cartBodies.length).toBeGreaterThan(0);
    expect(cartBodies.every((line) => line.productId !== "gift-classic")).toBe(true);
  });

  it("shows missing payment reference recovery state on confirmation", async () => {
    setRoute(ROUTES.confirmation);
    render(<App />);

    expect(await screen.findByText(/missing payment reference/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /return to checkout/i })).toBeInTheDocument();
  });

  it("verifies payment reference and displays confirmed state", async () => {
    setRoute(`${ROUTES.confirmation}?reference=MN-REF-123`);
    render(<App />);

    expect(await screen.findByText(/order confirmed/i)).toBeInTheDocument();
    expect(screen.getByText(/verified/i)).toBeInTheDocument();
  });
});
