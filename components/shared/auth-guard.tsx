"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/useAuthStore"
import { authUtils } from "@/lib/auth"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const setAuth = useAuthStore((state) => state.setAuth)

  useEffect(() => {
    const token = authUtils.getToken()
    const storedUser = authUtils.getUser()

    if (!token || !storedUser) {
      router.push("/login")
      return
    }

    if (!user) {
      setAuth(storedUser, token)
    }
  }, [user, setAuth, router])

  return user ? <>{children}</> : null
}
