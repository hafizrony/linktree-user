"use client";
import { useUser, useUpdateUser } from "@/hook/useUser";
import { useState, useEffect, useRef } from "react";
import { 
  Camera, 
  Check, 
  ImageIcon, 
  LayoutTemplate, 
  Loader2, 
  Palette, 
  Save, 
  User,
  Type
} from "lucide-react";

// Helper for storage URL
const STORAGE_URL = process.env.NEXT_PUBLIC_IMAGE || "http://192.168.100.64:8000/storage/";

// --- TYPES ---
interface ThemeSettings {
  backgroundType: 'solid' | 'gradient';
  backgroundColor: string;
  backgroundGradient: string;
  textColor: string;
  fontFamily: 'sans' | 'serif' | 'mono';
  buttonStyle: 'rounded-none' | 'rounded-lg' | 'rounded-full';
}

const PRESET_GRADIENTS = [
  { name: 'Sunset', class: 'from-indigo-500 via-purple-500 to-pink-500' },
  { name: 'Ocean', class: 'from-cyan-500 to-blue-500' },
  { name: 'Forest', class: 'from-green-400 to-emerald-600' },
  { name: 'Midnight', class: 'from-slate-900 via-purple-900 to-slate-900' },
  { name: 'Peach', class: 'from-orange-400 to-rose-400' },
  { name: 'Blush', class: 'from-pink-300 via-purple-300 to-indigo-400' },
];

export default function ProfileSettings() {
  const { data: user, isLoading } = useUser();
  const updateUserMutation = useUpdateUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'details' | 'appearance'>('details');
  
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [theme, setTheme] = useState<ThemeSettings>({
    backgroundType: 'gradient',
    backgroundColor: '#ffffff',
    backgroundGradient: 'from-indigo-500 via-purple-500 to-pink-500',
    textColor: '#000000',
    fontFamily: 'sans',
    buttonStyle: 'rounded-full'
  });

  // Load Initial Data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        bio: user.bio || "",
      });
      
      if (user.theme) {
        setTheme({
            backgroundType: user.theme.backgroundType || 'gradient',
            backgroundColor: user.theme.backgroundColor || '#ffffff',
            backgroundGradient: user.theme.backgroundGradient || 'from-indigo-500 via-purple-500 to-pink-500',
            textColor: user.theme.textColor || '#000000',
            fontFamily: user.theme.fontFamily || 'sans',
            buttonStyle: user.theme.buttonStyle || 'rounded-full',
        });
      }
    }
  }, [user]);

  // --- HANDLERS ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Create FormData
    const payload = new FormData();

    // 2. Add spoofing method for Laravel (PUT via POST)
    payload.append('_method', 'PUT'); 

    // 3. Add Basic Fields
    payload.append('name', formData.name);
    payload.append('bio', formData.bio || '');

    // 4. Add Avatar (only if changed)
    if (avatarFile) {
        payload.append('avatar', avatarFile);
    }

    // 5. Add Theme Fields (Flattened with Brackets [])
    // This matches the format that worked in Postman: theme[key]
    Object.keys(theme).forEach((key) => {
        const themeKey = key as keyof ThemeSettings;
        payload.append(`theme[${themeKey}]`, theme[themeKey]);
    });

    // 6. Send
    updateUserMutation.mutate(payload as any);
  };

  if (isLoading) return <div className="p-10 text-center text-gray-500"><Loader2 className="animate-spin mx-auto mb-2" /> Loading profile...</div>;

  return (
    <div className="max-w-3xl mx-auto pb-20">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#000000]">Settings</h1>
        <p className="text-gray-500 text-sm">Update your profile and customize your page.</p>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-[#ebf5ee] rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row min-h-125">
        
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-gray-50 border-b md:border-b-0 md:border-r border-[#ebf5ee] p-2 flex md:flex-col gap-1">
            <button 
                onClick={() => setActiveTab('details')}
                className={`flex-1 md:flex-none flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${activeTab === 'details' ? 'bg-white text-[#01d49f] shadow-sm border border-[#ebf5ee]' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
            >
                <User size={18} /> 
                <span>Profile Details</span>
            </button>
            <button 
                onClick={() => setActiveTab('appearance')}
                className={`flex-1 md:flex-none flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${activeTab === 'appearance' ? 'bg-white text-[#01d49f] shadow-sm border border-[#ebf5ee]' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
            >
                <Palette size={18} /> 
                <span>Appearance</span>
            </button>
        </div>

        {/* Content Area */}
        <form onSubmit={handleSubmit} className="flex-1 p-6 md:p-8">

            {/* --- TAB: DETAILS --- */}
            {activeTab === 'details' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-200">
                    <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">Profile Information</h2>
                    
                    {/* Avatar */}
                    <div className="flex items-center gap-6">
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="relative w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#01d49f] transition-colors group shrink-0"
                        >
                            {previewUrl || user?.avatar ? (
                                <img 
                                    src={previewUrl || (user?.avatar?.startsWith('http') ? user.avatar : `${STORAGE_URL}${user?.avatar}`)} 
                                    alt="Avatar" 
                                    className="w-full h-full object-cover" 
                                />
                            ) : (
                                <ImageIcon className="text-gray-400 w-8 h-8" />
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="text-white w-5 h-5" />
                            </div>
                        </div>
                        <div>
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-lg transition-colors">
                                Upload Photo
                            </button>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                            <p className="text-xs text-gray-400 mt-2">Recommended: 500x500px (JPG, PNG)</p>
                        </div>
                    </div>

                    <div className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Display Name</label>
                            <input 
                                name="name"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#01d49f] outline-none transition-all text-gray-900" 
                                placeholder="e.g. John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Bio</label>
                            <textarea 
                                name="bio"
                                value={formData.bio}
                                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                rows={4}
                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#01d49f] outline-none transition-all resize-none text-gray-900" 
                                placeholder="Tell your audience who you are..."
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* --- TAB: APPEARANCE --- */}
            {activeTab === 'appearance' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-200">
                    <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">Customize Theme</h2>

                    {/* Background */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-700 mb-3">Background Style</h3>
                        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit mb-4">
                            <button type="button" onClick={() => setTheme(p => ({...p, backgroundType: 'gradient'}))} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${theme.backgroundType === 'gradient' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Gradient</button>
                            <button type="button" onClick={() => setTheme(p => ({...p, backgroundType: 'solid'}))} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${theme.backgroundType === 'solid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Solid Color</button>
                        </div>

                        {theme.backgroundType === 'gradient' ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {PRESET_GRADIENTS.map((g) => (
                                    <button
                                        type="button"
                                        key={g.name}
                                        onClick={() => setTheme(p => ({...p, backgroundGradient: g.class}))}
                                        className={`h-16 rounded-lg bg-linear-to-br ${g.class} relative hover:scale-105 transition-transform border-2 ${theme.backgroundGradient === g.class ? 'border-gray-900' : 'border-transparent'}`}
                                    >
                                        {theme.backgroundGradient === g.class && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                <Check className="text-white w-5 h-5 drop-shadow-md" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <input 
                                    type="color" 
                                    value={theme.backgroundColor}
                                    onChange={(e) => setTheme(p => ({...p, backgroundColor: e.target.value}))}
                                    className="w-12 h-12 rounded cursor-pointer border-0 p-0"
                                />
                                <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">{theme.backgroundColor}</span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Button Shape */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-700 mb-3">Button Shape</h3>
                            <div className="space-y-2">
                                {[
                                    { id: 'rounded-none', label: 'Square' },
                                    { id: 'rounded-lg', label: 'Rounded' },
                                    { id: 'rounded-full', label: 'Pill' }
                                ].map((opt) => (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => setTheme(p => ({...p, buttonStyle: opt.id as any}))}
                                        className={`w-full py-2.5 px-4 text-sm font-medium border rounded-lg flex items-center justify-between transition-all ${theme.buttonStyle === opt.id ? 'border-[#01d49f] bg-[#01d49f]/5 text-[#01d49f]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                                    >
                                        {opt.label}
                                        {theme.buttonStyle === opt.id && <Check size={16} />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Typography */}
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-bold text-gray-700 mb-2">Font Style</h3>
                                <select 
                                    value={theme.fontFamily}
                                    onChange={(e) => setTheme(p => ({...p, fontFamily: e.target.value as any}))}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#01d49f]"
                                >
                                    <option value="sans">Modern (Sans Serif)</option>
                                    <option value="serif">Elegant (Serif)</option>
                                    <option value="mono">Technical (Monospace)</option>
                                </select>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-700 mb-2">Text Color</h3>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="color" 
                                        value={theme.textColor}
                                        onChange={(e) => setTheme(p => ({...p, textColor: e.target.value}))}
                                        className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                                    />
                                    <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">{theme.textColor}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sticky Save Button */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end sticky bottom-0 bg-white/95 backdrop-blur-sm p-4 -mx-6 -mb-6 md:p-0 md:m-0 md:bg-transparent">
                <button 
                    type="submit" 
                    disabled={updateUserMutation.isPending}
                    className="bg-[#000000] text-white font-bold py-2.5 px-6 rounded-lg hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {updateUserMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
            </div>

        </form>
      </div>
    </div>
  );
}