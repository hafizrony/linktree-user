import { notFound } from "next/navigation";
import Image from "next/image";
import ApiService from "@/services/services";
import { Link as LinkType } from "@/interface/link.interface";
import { ExternalLink } from "lucide-react";

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
  // --- 1. THEME SETTINGS ---
  const theme = user.theme || {};
  const bgType = theme.backgroundType || 'gradient';
  const bgColor = theme.backgroundColor || '#4f46e5'; 
  const bgGradient = theme.backgroundGradient || 'from-indigo-500 via-purple-500 to-pink-500';
  const bgImage = theme.backgroundImage;
  const textColor = theme.textColor || '#ffffff';
  const fontClass = getFontClass(theme.fontFamily);
  const btnShape = theme.buttonStyle || 'rounded-full'; 
  const btnType = theme.buttonType || 'solid';
  const btnBgColor = theme.buttonBackgroundColor || '#ffffff';
  const btnTextColor = theme.buttonTextColor || '#000000';
  const btnShadow = theme.buttonShadow || false;

  // --- 2. GENERATE STYLES ---

  let containerStyle: React.CSSProperties = { color: textColor };
  let containerClass = "min-h-screen flex flex-col items-center py-16 px-4 transition-colors duration-500";

  if (bgType === 'solid') {
      containerStyle.backgroundColor = bgColor;
  } else if (bgType === 'gradient') {
      containerClass += ` bg-gradient-to-br ${bgGradient}`;
  } else if (bgType === 'image' && bgImage) {
      const imageUrl = bgImage.startsWith('http') ? bgImage : `${STORAGE_URL}${bgImage}`;
      containerStyle.backgroundImage = `url('${imageUrl}')`;
      containerStyle.backgroundSize = 'cover';
      containerStyle.backgroundPosition = 'center';
      containerStyle.backgroundAttachment = 'fixed';
      containerClass += " relative after:content-[''] after:absolute after:inset-0 after:bg-black/30 after:z-0";
  }

  const getButtonStyle = () => {
    const base = {
        color: btnTextColor,
        boxShadow: btnShadow ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : 'none',
        border: '2px solid transparent'
    };

    if (btnType === 'solid') {
        return { ...base, backgroundColor: btnBgColor, borderColor: btnBgColor };
    } else if (btnType === 'outline') {
        return { ...base, backgroundColor: 'transparent', borderColor: btnBgColor, color: btnBgColor };
    } else if (btnType === 'transparent') {
        return { ...base, backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'transparent', backdropFilter: 'blur(10px)' };
    }
    return base;
  };

  const buttonCustomStyle = getButtonStyle();

  return (
    <>
    <header><title>{`${user.name} - Elinks`}</title></header>
    <div className={`${containerClass} ${fontClass}`} style={containerStyle}>
      
      <div className="w-full max-w-xl flex flex-col items-center relative z-10">

        <div className="flex flex-col items-center text-center space-y-4 mb-10 w-full">
            
            <div className="relative group">
                <div className={`absolute -inset-1 bg-white/20 ${btnShape} blur opacity-50`}></div>
                <div className={`relative w-28 h-28 ${btnShape} overflow-hidden border-4 border-white/30 shadow-2xl`}>
                <Image
                    src={user.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${STORAGE_URL}${user.avatar}`) : "/placeholder.png"}
                    alt={user.username}
                    fill
                    className="object-cover "
                />
                </div>
            </div>

            {/* User Info */}
            <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight drop-shadow-md">{user.name}</h1>
                {user.bio && (
                    <p className="max-w-xs mx-auto font-medium opacity-90 leading-relaxed drop-shadow-sm whitespace-pre-wrap">
                        {user.bio}
                    </p>
                )}
            </div>
        </div>

        {/* --- Links List --- */}
        <div className="w-full space-y-4 pb-20">
            {activeLinks.length > 0 ? (
                activeLinks
                    .sort((a, b) => a.order - b.order)
                    .map((link) => (
                        <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={buttonCustomStyle}
                            className={`relative flex items-center w-full p-2 pr-4 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] group ${btnShape}`}
                        >
                            <div className={`shrink-0 w-12 h-12 flex items-center justify-center overflow-hidden mr-4 ${btnShape === 'rounded-full' ? 'rounded-full' : 'rounded-md'}`}
                                 style={{ backgroundColor: btnType === 'outline' ? btnBgColor : 'rgba(0,0,0,0.05)' }}
                            >
                                {link.icon ? (
                                    <img 
                                        src={link.icon.startsWith('http') ? link.icon : `${STORAGE_URL}${link.icon}`} 
                                        alt="" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <ExternalLink className="w-5 h-5 opacity-70" style={{ color: btnType === 'outline' ? '#fff' : 'inherit' }} />
                                )}
                            </div>

                            <div className="grow flex flex-col justify-center min-h-12">
                                <h3 className="font-bold text-lg leading-tight text-center pr-12">
                                    {link.title}
                                </h3>
                            </div>
                            
                            <div className="absolute right-4 opacity-0 group-hover:opacity-50 transition-opacity">
                                <ExternalLink size={16} />
                            </div>
                        </a>
                    ))
            ) : (
                <div className="text-center py-10 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
                    <p className="opacity-80">No links available yet.</p>
                </div>
            )}
        </div>
      
        <div className="fixed bottom-6 text-center z-10">
            <a href="/" className="inline-flex items-center gap-2 px-3 py-1.5 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-xs font-bold transition-all text-white border border-white/10">
                <span>LinkTree</span>
            </a>
        </div>

      </div>
    </div>
    </>
    
  );
}