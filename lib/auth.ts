import { setCookie, deleteCookie } from "cookies-next";

const TOKEN_KEY = "token";
const USER_KEY = "careers_user";

export interface CurrentUser {
  user_id: string;
  email: string;
  name: string;
  company_id?: string;
}

export const authUtils = {
  setToken: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token);
      // set cookie token
      setCookie(TOKEN_KEY, token);
    }
  },

  getToken: (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  setUser: (user: CurrentUser) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  getUser: (): CurrentUser | null => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      deleteCookie(TOKEN_KEY);
    }
  },

  isAuthenticated: (): boolean => {
    return !!authUtils.getToken();
  },
};
