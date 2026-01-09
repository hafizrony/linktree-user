"use client";

import { useState } from "react";
import Navbar from "@/app/components/nav";
import Footer from "@/app/components/footer";
import LinkManager from "@/app/components/LinkManager";
import ProfileSettings from "@/app/components/ProfileSetting";
import { cn } from "@/lib/untils";
import { Link as LinkIcon, User } from "lucide-react";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"links" | "profile">("links");

  return (
    <>
    <header><title>Dashboard - Elinks</title></header>
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="grow w-full max-w-4xl mx-auto px-4 py-8">
        <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm mb-8 w-fit mx-auto">
            <button
                onClick={() => setActiveTab("links")}
                className={cn(
                    "flex items-center gap-2 px-6 py-2 rounded-md text-sm font-medium transition-all",
                    activeTab === "links" 
                        ? "bg-gray-100 text-gray-900 shadow-sm" 
                        : "text-gray-500 hover:text-gray-700"
                )}
            >
                <LinkIcon size={16} />
                Links
            </button>
            <button
                onClick={() => setActiveTab("profile")}
                className={cn(
                    "flex items-center gap-2 px-6 py-2 rounded-md text-sm font-medium transition-all",
                    activeTab === "profile" 
                        ? "bg-gray-100 text-gray-900 shadow-sm" 
                        : "text-gray-500 hover:text-gray-700"
                )}
            >
                <User size={16} />
                Settings
            </button>
        </div>
        <div className="animate-in fade-in duration-300">
            {activeTab === "links" ? <LinkManager /> : <ProfileSettings />}
        </div>

      </main>
      <Footer />
    </div>
    </>
  );
}