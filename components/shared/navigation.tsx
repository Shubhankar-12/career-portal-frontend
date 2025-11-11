"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/useAuthStore"
import { authUtils } from "@/lib/auth"

export function Navigation() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)

  const handleLogout = () => {
    authUtils.logout()
    useAuthStore.setState({ user: null, token: null })
    router.push("/")
  }

  return (
    <nav className="border-b border-border py-4 px-6 sticky top-0 bg-background/95 backdrop-blur z-40">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          Careers Builder
        </Link>

        {user ? (
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-text-secondary hover:text-primary text-sm">
              Dashboard
            </Link>
            <Link href="/jobs" className="text-text-secondary hover:text-primary text-sm">
              Jobs
            </Link>
            <span className="text-text-secondary text-sm">{user.name}</span>
            <button onClick={handleLogout} className="text-text-secondary hover:text-primary text-sm">
              Sign Out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-text-secondary hover:text-primary text-sm">
              Sign In
            </Link>
            <Link href="/register" className="btn-primary text-sm">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
