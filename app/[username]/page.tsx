import { notFound } from "next/navigation";
import Image from "next/image";
import ApiService from "@/services/services";
import { Link as LinkType } from "@/interface/link.interface";
import { ExternalLink } from "lucide-react";

// Helper to resolve font classes
const getFontClass = (font?: string) => {
    switch(font) {
        case 'serif': return 'font-serif';
        case 'mono': return 'font-mono';
        default: return 'font-sans';
    }
}

interface PageProps {
  params: Promise<{ username: string }>;
}

const STORAGE_URL = process.env.NEXT_PUBLIC_IMAGE || "http://192.168.100.64:8000/storage/";

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params;
  const data = await ApiService.getInstance().getPublicProfile(username);

  if (!data || !data.user) return notFound();

  const { user } = data;
  const links: LinkType[] = data.links || user.links || [];
  const activeLinks = links.filter((link) => link.is_active);

  // --- 1. EXTRACT THEME SETTINGS (With Defaults) ---
  const theme = user.theme || {};
  const bgType = theme.backgroundType || 'gradient';
  const bgColor = theme.backgroundColor || '#4f46e5'; 
  const bgGradient = theme.backgroundGradient || 'from-indigo-500 via-purple-500 to-pink-500';
  const textColor = theme.textColor || '#ffffff';
  const fontClass = getFontClass(theme.fontFamily);
  const buttonShape = theme.buttonStyle || 'rounded-full'; // 'rounded-none', 'rounded-lg', 'rounded-full'

  // Determine Background Style
  let containerStyle = {};
  let containerClass = "min-h-screen flex flex-col items-center py-16 px-4 ";

  if (bgType === 'solid') {
      containerStyle = { backgroundColor: bgColor };
  } else if (bgType === 'gradient') {
      // Assuming you store Tailwind classes for gradients. 
      // If you store CSS strings (e.g., "linear-gradient(...)"), use containerStyle instead.
      containerClass += ` bg-linear-to-br ${bgGradient}`;
  }

  return (
    <div 
        className={`${containerClass} ${fontClass}`} 
        style={{ ...containerStyle, color: textColor }} // Dynamic Text Color
    >
      
      {/* --- Profile Header --- */}
      <div className="flex flex-col items-center text-center space-y-4 mb-10 w-full max-w-lg z-10">
        
        {/* Avatar */}
        <div className="relative group">
            <div className={`absolute -inset-0.5 bg-white/30 ${buttonShape} opacity-75 blur`}></div>
            <div className={`relative w-28 h-28 ${buttonShape} overflow-hidden border-4 border-white/50 shadow-xl`}>
            <Image
                src={user.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${STORAGE_URL}${user.avatar}`) : "/placeholder.png"}
                alt={user.username}
                fill
                className="object-cover bg-white"
            />
            </div>
        </div>

        {/* User Info */}
        <div className="drop-shadow-md">
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: textColor }}>{user.name}</h1>
        </div>

        {user.bio && (
            <p className="max-w-sm font-light leading-relaxed drop-shadow-sm opacity-90" style={{ color: textColor }}>
                {user.bio}
            </p>
        )}
      </div>

      {/* --- Links List --- */}
      <div className="w-full max-w-xl space-y-4 z-10 pb-20">
        {activeLinks.length > 0 ? (
            activeLinks
                .sort((a, b) => a.order - b.order)
                .map((link) => (
                    <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        // Dynamic Button Shape
                        className={`relative flex items-center w-full min-h-18 p-2 pr-4 bg-white/95 hover:bg-white text-gray-800 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group border-2 border-transparent hover:border-indigo-100 ${buttonShape}`}
                    >
                        {/* ICON */}
                        <div className={`shrink-0 w-14 h-14 bg-gray-50 flex items-center justify-start overflow-hidden border border-gray-100 mr-4 ${buttonShape === 'rounded-full' ? 'rounded-full' : 'rounded-md'}`}>
                            {link.icon ? (
                                <img 
                                    src={link.icon.startsWith('http') ? link.icon : `${STORAGE_URL}${link.icon}`} 
                                    alt="" 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <ExternalLink className="text-gray-400 w-6 h-6 mx-auto" />
                            )}
                        </div>

                        {/* CONTENT */}
                        <div className="grow flex flex-col justify-center">
                            <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-indigo-600 transition-colors">
                                {link.title}
                            </h3>
                            {link.description && (
                                <p className="text-xs text-gray-500 font-medium mt-0.5">
                                    {link.description}
                                </p>
                            )}
                        </div>
                    </a>
                ))
        ) : (
             <div className="text-center py-10 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                <p style={{ color: textColor }}>No links available yet.</p>
            </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="fixed bottom-6 text-center z-10">
        <a href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-black/20 hover:bg-black/30 backdrop-blur-md rounded-full text-xs font-bold transition-all" style={{ color: textColor }}>
            <span>LinkTree</span>
        </a>
      </div>
    </div>
  );
}