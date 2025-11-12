"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";
import { authUtils } from "@/lib/auth";
import { useAuthStore } from "@/store/useAuthStore";

export function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const user = useAuthStore((state) => state.user);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("user", user);

    if (!user) {
      console.log("user is null", user);

      router.push("/login");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authAPI.login(email, password);
      console.log("result", result);

      authUtils.setToken(result.token);
      authUtils.setUser({
        user_id: result.user.user_id,
        email: result.user.email,
        name: result.user.name,
        company_id: result?.company?.company_id || undefined,
      });
      setAuth(
        {
          user_id: result.user.user_id,
          email: result.user.email,
          name: result.user.name,
          company_id: result?.company?.company_id || undefined,
        },
        result.token
      );

      if (!result?.company?.company_id) {
        authUtils.setCompany(result?.company);
      }

      const user = await authAPI.getUserById(result.user.user_id);
      console.log("user", user);

      if (user?.company && user?.company?.company_id) {
        console.log("inside if");

        router.push("/dashboard");
      } else {
        console.log("inside else");
        router.push("/create-company");
      }
    } catch (err) {
      console.log("err", err);

      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      console.log("finally");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
          placeholder="you@example.com"
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
          placeholder="••••••••"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
