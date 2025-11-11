import { create } from "zustand"
import type { CurrentUser } from "@/lib/auth"

interface AuthStore {
  user: CurrentUser | null
  token: string | null
  setAuth: (user: CurrentUser, token: string) => void
  clearAuth: () => void
  updateUser: (user: CurrentUser) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => set({ user, token }),
  clearAuth: () => set({ user: null, token: null }),
  updateUser: (user) => set({ user }),
}))
