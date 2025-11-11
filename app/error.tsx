"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md space-y-4">
        <h1 className="text-4xl font-bold">Something went wrong</h1>
        <p className="text-text-secondary">An error occurred. Please try again.</p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => reset()} className="btn-primary">
            Try again
          </button>
          <Link href="/" className="btn-secondary">
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}
