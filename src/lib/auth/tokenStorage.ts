const CUSTOMER_TOKEN_KEY = "meatng-auth-token";
const ADMIN_TOKEN_KEY = "meatng-admin-auth-token";

export const tokenStorage = {
  getCustomerToken: () => localStorage.getItem(CUSTOMER_TOKEN_KEY),
  setCustomerToken: (token: string) => localStorage.setItem(CUSTOMER_TOKEN_KEY, token),
  clearCustomerToken: () => localStorage.removeItem(CUSTOMER_TOKEN_KEY),

  getAdminToken: () => localStorage.getItem(ADMIN_TOKEN_KEY),
  setAdminToken: (token: string) => localStorage.setItem(ADMIN_TOKEN_KEY, token),
  clearAdminToken: () => localStorage.removeItem(ADMIN_TOKEN_KEY),
};

