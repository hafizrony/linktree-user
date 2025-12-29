"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Link from "next/link";
import { User, Lock, Mail, ArrowRight } from "lucide-react";
// import { ENDPOINTS } from "@/lib/endpoint"; // Uncomment if you use endpoints file

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Ensure this URL matches your backend
      const res = await fetch("http://192.168.100.64:8000/api/register", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json" 
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      if (data.token) {
          Cookies.set("token", data.token, { expires: 7, path: '/' });
          router.push("/dashboard");
      } else {
          router.push("/login");
      }

    } catch (err: any) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#ebf5ee] p-4">
      {/* Brand Logo */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-[#01d49f]">
          LinkTree
        </h1>
        <p className="text-[#000000]/60 mt-2">Create your free account today.</p>
      </div>

      <div className="bg-white p-8 shadow-xl rounded-2xl w-full max-w-md border border-[#ebf5ee]">
        {error && (
          <div className="bg-[#ffa0a3]/10 border border-[#ffa0a3]/20 text-[#ffa0a3] text-sm p-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#000000] mb-2">Display Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#000000]/40" size={18} />
              <input
                name="name"
                type="text"
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-[#ebf5ee]/30 border border-[#ebf5ee] rounded-xl focus:ring-2 focus:ring-[#01d49f] outline-none text-[#000000] placeholder-[#000000]/30 transition-all"
                placeholder="e.g. John Doe"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#000000] mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#000000]/40" size={18} />
              <input
                name="email"
                type="email"
                onChange={handleChange}
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
                name="password"
                type="password"
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-[#ebf5ee]/30 border border-[#ebf5ee] rounded-xl focus:ring-2 focus:ring-[#01d49f] outline-none text-[#000000] placeholder-[#000000]/30 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#000000] mb-2">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#000000]/40" size={18} />
              <input
                name="password_confirmation"
                type="password"
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-[#ebf5ee]/30 border border-[#ebf5ee] rounded-xl focus:ring-2 focus:ring-[#01d49f] outline-none text-[#000000] placeholder-[#000000]/30 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#01d49f] text-white font-bold py-3.5 rounded-xl hover:bg-[#00b88a] transition-all shadow-md active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2"
          >
            {loading ? "Creating account..." : (
                <>
                    Get Started <ArrowRight size={18} />
                </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-[#000000]/60">
          Already have an account?{" "}
          <Link href="/login" className="text-[#01d49f] font-bold hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}