"use client";

import { useUser, useUpdateUser } from "@/hook/useUser";
import { useState, useEffect, useRef } from "react";
import {
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  Save,
  Upload,
  Palette,
  Type,
  Layout,
  CheckCircle,
  Copy,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/untils";

// Helper for storage URL
const STORAGE_URL =
  process.env.NEXT_PUBLIC_IMAGE || "http://192.168.100.64:8000/storage/";

const MAX_FILE_SIZE = 2 * 1024 * 1024; 

// --- TYPES ---
interface ThemeSettings {
  backgroundType: "solid" | "gradient" | "image";
  backgroundColor: string;
  backgroundGradient: string;
  backgroundImage: string | null;
  textColor: string;
  fontFamily: "sans" | "serif" | "mono" | "cursive" | "slab";

  // Button Theme
  buttonStyle: "rounded-none" | "rounded-lg" | "rounded-full";
  buttonType: "solid" | "outline" | "transparent";
  buttonBackgroundColor: string;
  buttonTextColor: string;
}

// --- PRESETS ---
const PRESET_GRADIENTS = [
  { name: "Sunset", class: "from-indigo-500 via-purple-500 to-pink-500" },
  { name: "Ocean", class: "from-cyan-500 to-blue-500" },
  { name: "Forest", class: "from-green-400 to-emerald-600" },
  { name: "Midnight", class: "from-slate-900 via-purple-900 to-slate-900" },
  { name: "Peach", class: "from-orange-400 to-rose-400" },
  { name: "Blush", class: "from-pink-300 via-purple-300 to-indigo-400" },
];

const SOLID_COLORS = [
  "#ffffff",
  "#000000",
  "#f3f4f6",
  "#fee2e2",
  "#e0e7ff",
  "#d1fae5",
  "#ffedd5",
];

// --- HELPER COMPONENTS ---
function AccordionItem({
  title,
  icon: Icon,
  children,
  isOpen,
  onClick,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div className="bg-white border border-[#ebf5ee] rounded-xl overflow-hidden shadow-sm transition-all duration-300">
      <button
        type="button"
        onClick={onClick}
        className="w-full flex items-center justify-between p-5 bg-white hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              isOpen
                ? "bg-[#01d49f]/10 text-[#01d49f]"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            <Icon size={20} />
          </div>
          <span className="font-bold text-gray-900 text-base">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp size={20} className="text-gray-400" />
        ) : (
          <ChevronDown size={20} className="text-gray-400" />
        )}
      </button>

      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-250 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-5 pt-0 border-t border-[#ebf5ee] bg-white">
          {children}
        </div>
      </div>
    </div>
  );
}

function ColorPickerInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <label className="block text-xs font-bold uppercase text-gray-400 mb-2">
        {label}
      </label>
      <div
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-3 cursor-pointer group"
      >
        <div
          className="w-10 h-10 rounded-lg border border-black/10 shadow-sm transition-transform group-hover:scale-105"
          style={{ backgroundColor: value }}
        />
        <span className="text-sm font-medium text-gray-600 uppercase">
          {value}
        </span>
        <input
          ref={inputRef}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="invisible absolute w-0 h-0"
        />
      </div>
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function ProfileSettings() {
  const { data: user, isLoading } = useUser();
  const updateUserMutation = useUpdateUser();

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  // --- STATE ---
  const [openSection, setOpenSection] = useState<string | null>("details");
  const [copied, setCopied] = useState(false);

  const [saved, setSaved] = useState(false);
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [bgRemoved, setBgRemoved] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [bgFile, setBgFile] = useState<File | null>(null);
  const [bgPreview, setBgPreview] = useState<string | null>(null);

  const [theme, setTheme] = useState<ThemeSettings>({
    backgroundType: "gradient",
    backgroundColor: "#ffffff",
    backgroundGradient: "from-indigo-500 via-purple-500 to-pink-500",
    backgroundImage: null,
    textColor: "#000000",
    fontFamily: "sans",
    buttonStyle: "rounded-full",
    buttonType: "solid",
    buttonBackgroundColor: "#00ff88",
    buttonTextColor: "#f5f5f0",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        bio: user.bio || "",
      });

      if (user.theme) {
        setTheme((prev) => ({
          ...prev,
          ...user.theme,
        }));
      }

      setBgRemoved(false);
    }
  }, [user]);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleCopyLink = () => {
    const profileUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/${user?.username}`
        : "";
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setErrorMessage("Avatar image is too large. Maximum size is 2MB.");
        setTimeout(() => setErrorMessage(null), 3000);
        e.target.value = "";
        return;
      }

      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setErrorMessage(null);
    }
  };

  const handleBgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
        setErrorMessage("Background image is too large. Maximum size is 2MB.");
        setTimeout(() => setErrorMessage(null), 3000);
        e.target.value = ""; 
        return;
    }

    setBgRemoved(false);
    setBgFile(file);
    setBgPreview(URL.createObjectURL(file));
    setTheme((p) => ({ ...p, backgroundType: "image" }));
    setErrorMessage(null);
  };

  const handleRemoveBg = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setBgRemoved(true);
    setBgFile(null);
    setBgPreview(null);

    setTheme((p) => ({
      ...p,
      backgroundImage: null,
      backgroundType: "gradient",
    }));

    if (bgInputRef.current) bgInputRef.current.value = "";
  };

  const selectColor = (color: string) => {
    setBgRemoved(false);
    setTheme((p) => ({ ...p, backgroundColor: color, backgroundType: "solid" }));
  };

  const selectGradient = (gradientClass: string) => {
    setBgRemoved(false);
    setTheme((p) => ({
      ...p,
      backgroundGradient: gradientClass,
      backgroundType: "gradient",
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = new FormData();
    payload.append("_method", "PATCH");
    payload.append("name", formData.name);
    payload.append("bio", formData.bio || "");

    if (avatarFile) payload.append("avatar", avatarFile);

    Object.keys(theme).forEach((key) => {
      const themeKey = key as keyof ThemeSettings;
      const value = theme[themeKey];

      if (themeKey === "backgroundImage") return;

      payload.append(`theme[${themeKey}]`, String(value ?? ""));
    });

    if (bgRemoved) {
      payload.append("theme[backgroundImage]", "");
    }

    if (bgFile) {
      payload.append("theme[backgroundImage]", bgFile);
    }

    updateUserMutation.mutate(payload as any, {
      onSuccess: () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
        setBgRemoved(false);
      },
    });
  };

  if (isLoading)
    return (
      <div className="p-10 text-center text-gray-500">
        <Loader2 className="animate-spin mx-auto mb-2" /> Loading profile...
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto pb-32">
      
      {/* UPDATE: Added Error Alert UI */}
      {errorMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#fa444a] text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-4 h-4" />
          {errorMessage}
        </div>
      )}

      {saved && (
        <div className="fixed top-6 right-6 z-50 bg-[#01d49f] text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
          <Check className="w-4 h-4" />
          Saved successfully
        </div>
      )}

      {/* --- HEADER CARD --- */}
      <div className="bg-white border border-[#ebf5ee] rounded-2xl p-6 flex items-center justify-between shadow-sm mb-6">
        <div className="flex items-center gap-5">
          <div
            onClick={() => avatarInputRef.current?.click()}
            className="relative w-20 h-20 rounded-full cursor-pointer group shrink-0"
          >
            <img
              src={
                avatarPreview ||
                (user?.avatar
                  ? user.avatar.startsWith("http")
                    ? user.avatar
                    : `${STORAGE_URL}${user.avatar}`
                  : "/placeholder.png")
              }
              alt="Avatar"
              className="w-full h-full object-cover rounded-full border-2 border-white shadow-md group-hover:opacity-80 transition-opacity"
            />
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#01d49f] rounded-full border-2 border-white flex items-center justify-center">
              <Camera size={12} className="text-white" />
            </div>
            <input
              type="file"
              ref={avatarInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleAvatarChange} 
            />
          </div>

          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {formData.name || user?.username}
            </h1>
            <p className="text-sm text-gray-400 font-medium">{user?.username}</p>
          </div>
        </div>

        <button
          onClick={handleCopyLink}
          className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors relative"
          title="Copy Profile Link"
          type="button"
        >
          <div className="relative">
            {copied ? (
              <Check size={20} className="text-green-600" />
            ) : (
              <Copy size={20} />
            )}
          </div>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* --- 1. PROFILE DETAILS --- */}
        <AccordionItem
          title="Profile Details"
          icon={Layout}
          isOpen={openSection === "details"}
          onClick={() => toggleSection("details")}
        >
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">
                Display Name
              </label>
              <input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#01d49f] outline-none font-medium text-gray-900"
                placeholder="e.g. Alex Designer"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#01d49f] outline-none resize-none font-medium text-gray-900"
                placeholder="Tell your story..."
              />
            </div>
          </div>
        </AccordionItem>

        {/* --- 2. THEME & BACKGROUND --- */}
        <AccordionItem
          title="Theme & Background"
          icon={Palette}
          isOpen={openSection === "theme"}
          onClick={() => toggleSection("theme")}
        >
          <div className="space-y-6 pt-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold uppercase text-gray-400">
                Background Style
              </span>
              <span className="text-xs font-bold text-[#01d49f] bg-[#01d49f]/10 px-2 py-1 rounded capitalize">
                {theme.backgroundType}
              </span>
            </div>

            {/* Solid */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Solid Colors
              </label>
              <div className="flex flex-wrap gap-3">
                {SOLID_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => selectColor(color)}
                    className={`w-10 h-10 rounded-full border shadow-sm transition-transform hover:scale-110 flex items-center justify-center ${
                      theme.backgroundColor === color &&
                      theme.backgroundType === "solid"
                        ? "ring-2 ring-offset-2 ring-[#01d49f]"
                        : "border-gray-200"
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {theme.backgroundColor === color &&
                      theme.backgroundType === "solid" && (
                        <Check
                          size={14}
                          className={color === "#ffffff" ? "text-black" : "text-white"}
                        />
                      )}
                  </button>
                ))}

                <div className="relative w-10 h-10 rounded-full border border-dashed border-gray-300 flex items-center justify-center hover:border-[#01d49f] cursor-pointer overflow-hidden group">
                  <input
                    type="color"
                    value={theme.backgroundColor}
                    onChange={(e) => selectColor(e.target.value)}
                    className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer opacity-0"
                  />
                  <Palette size={16} className="text-gray-400 group-hover:text-[#01d49f]" />
                </div>
              </div>
            </div>

            {/* Gradients */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Gradients
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {PRESET_GRADIENTS.map((g) => (
                  <button
                    type="button"
                    key={g.name}
                    onClick={() => selectGradient(g.class)}
                    className={`h-12 rounded-lg bg-linear-to-br ${g.class} relative hover:scale-105 transition-transform shadow-sm ${
                      theme.backgroundGradient === g.class &&
                      theme.backgroundType === "gradient"
                        ? "ring-2 ring-offset-2 ring-[#01d49f]"
                        : ""
                    }`}
                  >
                    {theme.backgroundGradient === g.class &&
                      theme.backgroundType === "gradient" && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="text-white w-4 h-4 drop-shadow-md" />
                        </div>
                      )}
                  </button>
                ))}
              </div>
            </div>

            {/* Image */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Image</label>

              <div
                onClick={() => bgInputRef.current?.click()}
                className={`relative h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors overflow-hidden ${
                  theme.backgroundType === "image"
                    ? "border-[#01d49f] bg-[#01d49f]/5"
                    : "border-gray-200"
                }`}
              >
                {/* Preview */}
                {!bgRemoved && (bgPreview || theme.backgroundImage) ? (
                  <img
                    src={
                      bgPreview ||
                      (theme.backgroundImage?.startsWith("http")
                        ? theme.backgroundImage
                        : `${STORAGE_URL}${theme.backgroundImage}`)
                    }
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                  />
                ) : null}

                {/* ✅ Trash button */}
                {!bgRemoved && (bgPreview || theme.backgroundImage) ? (
                  <button
                    type="button"
                    onClick={handleRemoveBg}
                    className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center"
                    title="Remove background"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                ) : null}

                <div className="relative z-10 flex flex-col items-center">
                  <Upload
                    className={`w-5 h-5 mb-1 ${
                      theme.backgroundType === "image" && !bgRemoved
                        ? "text-[#01d49f]"
                        : "text-gray-400"
                    }`}
                  />
                  <span className="text-xs font-medium text-gray-600">
                    Upload Image
                  </span>
                </div>

                <input
                  type="file"
                  ref={bgInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleBgChange}
                />
              </div>

              {/* Optional small hint */}
              {bgRemoved && (
                <p className="text-xs text-red-500 font-medium">
                  Background will be removed after you click “Save Changes”.
                </p>
              )}
            </div>
          </div>
        </AccordionItem>

        {/* --- 3. BUTTON STYLING --- */}
        <AccordionItem
          title="Button Styling"
          icon={CheckCircle}
          isOpen={openSection === "buttons"}
          onClick={() => toggleSection("buttons")}
        >
          <div className="space-y-8 pt-6">
            {/* Fill */}
            <section className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-gray-400">Fill</h4>
              <div className="flex justify-between gap-4">
                {["solid", "outline", "transparent"].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() =>
                      setTheme((p) => ({ ...p, buttonType: mode as any }))
                    }
                    className={cn(
                      "w-24 aspect-video rounded-xl p-2 transition-all flex items-center justify-center",
                      theme.buttonType === mode
                        ? "bg-[#01d49f]/10 ring-2 ring-[#01d49f]/30"
                        : "bg-gray-50 hover:bg-gray-100"
                    )}
                  >
                    <div
                      className={cn("w-14 aspect-video", theme.buttonStyle)}
                      style={{
                        background:
                          mode === "solid"
                            ? theme.buttonBackgroundColor
                            : mode === "transparent"
                            ? `${theme.buttonBackgroundColor}20`
                            : "transparent",
                        border:
                          mode === "outline"
                            ? `2px solid ${theme.buttonBackgroundColor}`
                            : "none",
                      }}
                    />
                  </button>
                ))}
              </div>
            </section>

            {/* Corner Radius */}
            <section className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-gray-400">
                Corner Radius
              </h4>

              <div className="flex justify-between gap-4">
                {["rounded-none", "rounded-lg", "rounded-full"].map((radius) => (
                  <button
                    key={radius}
                    type="button"
                    onClick={() =>
                      setTheme((p) => ({ ...p, buttonStyle: radius as any }))
                    }
                    className={cn(
                      "w-24 aspect-video rounded-xl p-2 flex items-center justify-center transition-all",
                      theme.buttonStyle === radius
                        ? "bg-[#01d49f]/10 ring-2 ring-[#01d49f]/30"
                        : "bg-gray-50 hover:bg-gray-100"
                    )}
                  >
                    <div className={cn("w-14 aspect-video bg-[#01d49f]/40", radius)} />
                  </button>
                ))}
              </div>
            </section>

            {/* Colors */}
            <section className="pt-5 border-t border-gray-100">
              <h4 className="text-xs font-bold uppercase text-gray-400 mb-3">
                Colors
              </h4>

              <div className="grid grid-cols-2 gap-5">
                <ColorPickerInput
                  label="Button Color"
                  value={theme.buttonBackgroundColor}
                  onChange={(val) =>
                    setTheme((p) => ({ ...p, buttonBackgroundColor: val }))
                  }
                />
                <ColorPickerInput
                  label="Text Color"
                  value={theme.buttonTextColor}
                  onChange={(val) =>
                    setTheme((p) => ({ ...p, buttonTextColor: val }))
                  }
                />
              </div>
            </section>
          </div>
        </AccordionItem>

        {/* --- 4. TYPOGRAPHY --- */}
        <AccordionItem
          title="Typography"
          icon={Type}
          isOpen={openSection === "typography"}
          onClick={() => toggleSection("typography")}
        >
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "sans", name: "Modern", class: "font-sans" },
                { id: "serif", name: "Elegant", class: "font-serif" },
                { id: "mono", name: "Technical", class: "font-mono" },
                { id: "cursive", name: "Creative", class: "font-cursive" },
                { id: "slab", name: "Retro", class: "font-slab" },
              ].map((font) => (
                <button
                  key={font.id}
                  type="button"
                  onClick={() =>
                    setTheme((p) => ({ ...p, fontFamily: font.id as any }))
                  }
                  className={`p-4 border rounded-xl text-left transition-all ${
                    theme.fontFamily === font.id
                      ? "border-[#01d49f] bg-[#01d49f]/5 ring-1 ring-[#01d49f]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span
                    className={`text-xl text-gray-900 block mb-1 ${font.class}`}
                  >
                    Aa
                  </span>
                  <span className="text-xs text-gray-700 font-medium">
                    {font.name}
                  </span>
                </button>
              ))}
            </div>

            <div className="pt-2">
              <ColorPickerInput
                label="Page Text Color"
                value={theme.textColor}
                onChange={(val) => setTheme((p) => ({ ...p, textColor: val }))}
              />
            </div>
          </div>
        </AccordionItem>

        <div className="left-0 right-0 flex justify-center z-40 px-4 pointer-events-none">
          <button
            type="submit"
            disabled={updateUserMutation.isPending}
            className="pointer-events-auto bg-[#01d49f] text-white font-bold py-3 px-8 rounded-full hover:bg-[#00b88a] transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {updateUserMutation.isPending ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}