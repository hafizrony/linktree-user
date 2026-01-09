"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Link from "next/link";
import { Lock, Mail } from "lucide-react";
import { ENDPOINTS } from "@/lib/endpoint"; // Ensure this path is correct

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Use your API Endpoint
      const res = await fetch(`${ENDPOINTS.AUTH.LOGIN}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid credentials");
      }
      
      // Save token
      Cookies.set("token", data.token, { 
        expires: 7, 
        path: '/',
        sameSite: 'lax' 
      });

      // Redirect to Dashboard
      router.push("/dashboard");
      router.refresh();
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <header><title>Login - Elinks</title></header>
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#ebf5ee] p-4">
      {/* Brand Logo */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-[#01d49f]">
          LinkTree
        </h1>
        <p className="text-[#000000]/60 mt-2">Welcome back! Please login to your account.</p>
      </div>

      <div className="bg-white p-8 shadow-xl rounded-2xl w-full max-w-md border border-[#ebf5ee]">
        {/* Error Alert */}
        {error && (
          <div className="bg-[#ffa0a3]/10 border border-[#ffa0a3]/20 text-[#ffa0a3] text-sm p-3 rounded-lg mb-6 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-[#000000] mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#000000]/40" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#ebf5ee]/30 border border-[#ebf5ee] rounded-xl focus:ring-2 focus:ring-[#01d49f] outline-none text-[#000000] placeholder-[#000000]/30 transition-all"
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#000000] mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#000000]/40" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#ebf5ee]/30 border border-[#ebf5ee] rounded-xl focus:ring-2 focus:ring-[#01d49f] outline-none text-[#000000] placeholder-[#000000]/30 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#01d49f] text-white font-bold py-3.5 rounded-xl hover:bg-[#00b88a] transition-all shadow-md active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-[#000000]/60">
              <Link href="/Support" className="text-[#01d49f] font-bold hover:underline">
                FORGOT PASSWORD?
              </Link>
        </div>
        <div className="mt-8 text-center text-sm text-[#000000]/60">
          Don't have an account?{" "}
          <Link href="/register" className="text-[#01d49f] font-bold hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}