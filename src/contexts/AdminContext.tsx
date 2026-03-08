import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { loginWithEmail } from "@/lib/api/admin";
import { tokenStorage } from "@/lib/auth/tokenStorage";

interface AdminUser {
    name: string;
    email: string;
    role: "super_admin" | "admin" | "manager";
    avatar?: string;
}

interface AdminContextType {
    admin: AdminUser | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    loginWithResult: (user: { id?: string; name: string; email: string; role?: string }, token: string | null) => void;
    logout: () => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

const ADMIN_STORAGE_KEY = "meatng-admin";

// Demo admin accounts
const DEMO_ADMINS: Record<string, { password: string; user: AdminUser }> = {
    "olusegun@loxfordtrading.com": {
        password: "adeyinka@2002",
        user: { name: "Bamidele Tewogbade", email: "olusegun@loxfordtrading.com", role: "super_admin" },
    },
    "manager@meatng.com": {
        password: "manager123",
        user: { name: "Chioma Eze", email: "manager@meatng.com", role: "manager" },
    },
};

export function AdminProvider({ children }: { children: ReactNode }) {
    const [admin, setAdmin] = useState<AdminUser | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem(ADMIN_STORAGE_KEY);
        if (saved) {
            try {
                setAdmin(JSON.parse(saved));
            } catch {
                localStorage.removeItem(ADMIN_STORAGE_KEY);
            }
        }
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const result = await loginWithEmail({ email, password });
            const role = (result.user.role || "admin").toLowerCase();
            const normalizedRole: AdminUser["role"] =
                role === "super_admin" ? "super_admin" : role === "manager" ? "manager" : "admin";

            const user: AdminUser = {
                name: result.user.name,
                email: result.user.email || email,
                role: normalizedRole,
            };

            setAdmin(user);
            localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(user));
            if (result.token) tokenStorage.setAdminToken(result.token);
            return true;
        } catch {
            // Temporary fallback for dev/demo while backend auth contracts are being finalized.
            const entry = DEMO_ADMINS[email.toLowerCase()];
            if (entry && entry.password === password) {
                setAdmin(entry.user);
                localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(entry.user));
                return true;
            }
            return false;
        }
    };

    const loginWithResult = (
        rawUser: { id?: string; name: string; email: string; role?: string },
        token: string | null,
    ) => {
        const role = (rawUser.role || "admin").toLowerCase();
        const normalizedRole: AdminUser["role"] =
            role === "super_admin" ? "super_admin" : role === "manager" ? "manager" : "admin";

        const user: AdminUser = {
            name: rawUser.name,
            email: rawUser.email,
            role: normalizedRole,
        };
        setAdmin(user);
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(user));
        if (token) tokenStorage.setAdminToken(token);
    };

    const logout = () => {
        setAdmin(null);
        localStorage.removeItem(ADMIN_STORAGE_KEY);
        tokenStorage.clearAdminToken();
    };

    return (
        <AdminContext.Provider value={{ admin, isAuthenticated: !!admin, login, loginWithResult, logout }}>
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const ctx = useContext(AdminContext);
    if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
    return ctx;
}
