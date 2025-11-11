import Link from "next/link"
import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-text-secondary">Join to build beautiful careers pages</p>
        </div>
        <RegisterForm />
        <p className="text-center text-text-secondary mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
