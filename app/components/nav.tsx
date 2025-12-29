"use client";
import { useUser, useLogout } from "@/hook/useUser";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { LogOut, Settings,} from "lucide-react";

// --- LOGOUT ALERT MODAL ---
interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoggingOut: boolean;
}

function LogoutModal({ isOpen, onClose, onConfirm, isLoggingOut }: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#000000]/20 flex items-center justify-center z-100 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl border border-[#ebf5ee] text-center">
        <div className="w-12 h-12 bg-[#ffa0a3]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogOut className="text-[#ffa0a3]" size={24} />
        </div>
        <h3 className="text-lg font-bold text-[#000000] mb-2">Log Out?</h3>
        <p className="text-[#000000]/70 mb-6 text-sm">Are you sure you want to log out of your account?</p>
        <div className="flex gap-3 justify-center">
          <button 
            onClick={onClose} 
            className="flex-1 px-4 py-2.5 text-[#000000] font-medium hover:bg-[#ebf5ee] rounded-lg transition-colors border border-transparent"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            disabled={isLoggingOut} 
            className="flex-1 px-4 py-2.5 bg-[#ffa0a3] text-white font-bold rounded-lg hover:bg-[#ff8f92] transition-colors disabled:opacity-70 shadow-sm"
          >
            {isLoggingOut ? "Logging out..." : "Log Out"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const { data: user, isLoading } = useUser();
  const logoutMutation = useLogout();
  const imageUrl = process.env.NEXT_PUBLIC_IMAGE;
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    setShowLogoutAlert(true);
  };

  const confirmLogout = () => {
    logoutMutation.mutate(undefined, {
        onSuccess: () => setShowLogoutAlert(false)
    });
  };

  return (
    <>
      <LogoutModal 
        isOpen={showLogoutAlert} 
        onClose={() => setShowLogoutAlert(false)} 
        onConfirm={confirmLogout} 
        isLoggingOut={logoutMutation.isPending} 
      />

      <nav className="bg-white border-b border-[#ebf5ee] sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold tracking-tight text-[#01d49f]">
            LinkTree
          </Link>
          
          <div className="flex items-center gap-3">
              {isLoading ? (
                  <div className="w-8 h-8 bg-[#ebf5ee] rounded-full animate-pulse" />
              ) : (
                  <div className="relative" ref={dropdownRef}>
                      {/* Avatar Button */}
                      <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 p-1 rounded-full hover:bg-[#ebf5ee]/50 transition-colors focus:outline-none"
                      >
                          <div className="relative w-9 h-9">
                              <Image
                                  src={user?.avatar ? `${imageUrl}${user.avatar}` : "/placeholder.png"}
                                  alt="Avatar"
                                  fill
                                  className="rounded-full object-cover border border-[#ebf5ee]"
                              />
                          </div>
                      </button>

                      {/* Dropdown Menu */}
                      {isDropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-[#ebf5ee] rounded-xl shadow-xl py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-60">
                            <div className="px-4 py-2 border-b border-[#ebf5ee] mb-1">
                                <p className="font-bold text-[#000000] truncate">{user?.name || 'User'}</p>
                                <p className="text-xs text-[#000000]/50 truncate">@{user?.username || 'username'}</p>
                            </div>
                            <button 
                                onClick={handleLogoutClick}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#ffa0a3] hover:bg-[#ffa0a3]/10 transition-colors text-left"
                            >
                                <LogOut size={16} />
                                Log Out
                            </button>
                        </div>
                      )}
                  </div>
              )}
          </div>
        </div>
      </nav>
    </>
  );
}