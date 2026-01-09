"use client";

import React, { useEffect, useState, useRef } from "react";
import { QRCode } from "react-qrcode-logo"; 
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Zap,
  BarChart2,
  Star,
  Upload,
  X,
  Plus,
  Lock,
  Share2,
  Eye,
  CheckCircle,
  AlertCircle,
  Copy,
  Download,
} from "lucide-react";

import { useLink, useEditLink, useDeleteLink, useCreateLink } from "@/hook/useLink";
import { useUser } from "@/hook/useUser";
import { Link as LinkType } from "@/interface/link.interface";

const STORAGE_URL = process.env.NEXT_PUBLIC_IMAGE || "http://192.168.100.64:8000/storage/";

// ==========================================
// 1. HELPER COMPONENTS
// ==========================================

function Toast({ message, onClose }: { message: string | null; onClose: () => void }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#000000]/80 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl z-200 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <CheckCircle size={18} className="text-[#01d49f]" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

// --- SHARE MODAL (UPDATED: NO AVATAR, ADD LABEL) ---
interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
}

function ShareModal({ isOpen, onClose, username }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const profileUrl = typeof window !== "undefined" ? `${window.location.origin}/${username}` : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const canvas = document.getElementById("react-qrcode-logo") as HTMLCanvasElement;
    if (canvas) {
        try {
            // Create a new canvas to add the label
            const newCanvas = document.createElement("canvas");
            const ctx = newCanvas.getContext("2d");
            
            // Add padding for the label at the bottom
            const labelHeight = 40;
            newCanvas.width = canvas.width;
            newCanvas.height = canvas.height + labelHeight;
            
            if (ctx) {
                // Fill white background
                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
                
                // Draw the original QR code
                ctx.drawImage(canvas, 0, 0);
                
                // Draw the "LinkTree" label
                ctx.font = "bold 24px sans-serif";
                ctx.fillStyle = "#000000";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("LinkTree", newCanvas.width / 2, canvas.height + (labelHeight / 2));
                
                const url = newCanvas.toDataURL("image/png");
                const a = document.createElement("a");
                a.href = url;
                a.download = `${username}-LinkTree-QR.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        } catch (err) {
            alert("Could not generate QR Code image.");
        }
    } else {
        alert("QR Code generation incomplete. Please wait a moment.");
    }
  };

  return (
    <div className="fixed inset-0 bg-[#000000]/30 flex items-center justify-center z-100 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-[#ebf5ee] flex flex-col items-center relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-[#000000]/40 hover:text-[#000000]">
            <X size={24} />
        </button>
        
        <h3 className="text-xl font-bold text-[#000000] mb-1">Share LinkTree</h3>
        <p className="text-sm text-[#000000]/50 mb-6">Scan to visit @{username}</p>

        {/* QR Code Container */}
        <div className="bg-white p-4 rounded-xl mb-6 border-2 border-[#ebf5ee] shadow-sm flex items-center justify-center">
            <QRCode
                value={profileUrl}
                // Avatar/Logo removed as requested
                size={220} 
                qrStyle="dots" 
                eyeRadius={0}  
                ecLevel="H"    
                fgColor="#000000"
                bgColor="#FFFFFF"
                id="react-qrcode-logo" 
            />
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-2 gap-3 w-full mb-4">
             <button 
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#ebf5ee] hover:bg-[#d4eadd] text-[#000000] font-bold rounded-xl transition-colors text-sm"
            >
                <Download size={18} />
                Save QR
            </button>
            <button 
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#000000] hover:bg-[#333333] text-white font-bold rounded-xl transition-colors text-sm"
            >
                {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                {copied ? "Copied" : "Copy Link"}
            </button>
        </div>

        <div className="flex items-center gap-2 text-[#000000]/40 text-xs bg-[#f5f5f5] px-3 py-1.5 rounded-full max-w-full">
            <Share2 size={12} />
            <span className="truncate">{profileUrl}</span>
        </div>
      </div>
    </div>
  );
}

// --- ALERT MODAL ---
function AlertModal({ isOpen, onClose, title, message }: { isOpen: boolean; onClose: () => void; title: string; message: string }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-[#000000]/20 flex items-center justify-center z-100 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl border border-[#ebf5ee] text-center">
        <div className="w-12 h-12 bg-[#ebf5ee] rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-[#000000]/50" size={24} />
        </div>
        <h3 className="text-lg font-bold text-[#000000] mb-2">{title}</h3>
        <p className="text-[#000000]/70 mb-6 text-sm">{message}</p>
        <button onClick={onClose} className="w-full bg-[#000000] text-white py-2.5 rounded-lg font-bold hover:bg-[#333333] transition-colors">
            Got it
        </button>
      </div>
    </div>
  );
}

// --- EDIT MODAL ---
interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
  initialValue: string;
  field: string;
}

function EditModal({ isOpen, onClose, onSave, initialValue, field }: EditModalProps) {
  const [value, setValue] = useState(initialValue);
  useEffect(() => { if (isOpen) setValue(initialValue); }, [isOpen, initialValue]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(value);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#000000]/20 flex items-center justify-center z-100 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl border border-[#ebf5ee]">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-[#000000] capitalize">Edit {field}</h3>
            <button onClick={onClose}><X size={20} className="text-[#000000]/40 hover:text-[#000000]" /></button>
        </div>
        <form onSubmit={handleSave}>
            {field === 'description' ? (
                <textarea autoFocus className="w-full p-3 bg-[#ebf5ee]/30 border border-[#ebf5ee] rounded-lg focus:ring-2 focus:ring-[#01d49f] outline-none text-[#000000] min-h-25 resize-none" value={value} onChange={(e) => setValue(e.target.value)} />
            ) : (
                <input autoFocus type="text" className="w-full p-3 bg-[#ebf5ee]/30 border border-[#ebf5ee] rounded-lg focus:ring-2 focus:ring-[#01d49f] outline-none text-[#000000]" value={value} onChange={(e) => setValue(e.target.value)} />
            )}
            <div className="flex gap-3 mt-6 justify-end">
                <button type="button" onClick={onClose} className="px-4 py-2 text-[#000000]/70 font-medium hover:bg-[#ebf5ee] rounded-lg">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-[#01d49f] text-white font-bold rounded-lg hover:bg-[#00b88a]">Save</button>
            </div>
        </form>
      </div>
    </div>
  );
}

// --- DELETE MODAL ---
interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

function DeleteModal({ isOpen, onClose, onConfirm, isDeleting }: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#000000]/20 flex items-center justify-center z-100 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl border border-[#ebf5ee]">
        <h3 className="text-lg font-bold text-[#000000] mb-2 text-center">Delete Link?</h3>
        <p className="text-[#000000]/70 mb-6 text-sm text-center">Are you sure you want to delete this link?</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 text-[#000000] font-medium hover:bg-[#ebf5ee] rounded-lg transition-colors border border-transparent">Cancel</button>
          <button onClick={onConfirm} disabled={isDeleting} className="flex-1 px-4 py-2.5 bg-[#fa444a] text-white font-bold rounded-lg hover:bg-[#ff8f92] transition-colors disabled:opacity-70 shadow-sm">{isDeleting ? "Deleting..." : "Delete"}</button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. CREATE MODAL
// ==========================================

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  nextOrder: number;
}

function CreateLinkModal({ isOpen, onClose, nextOrder }: CreateModalProps) {
  const createMutation = useCreateLink();
  const [formData, setFormData] = useState({ title: "", url: "", description: "", icon: null as File | null });

  useEffect(() => { if (isOpen) setFormData({ title: "", url: "", description: "", icon: null }); }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ title: formData.title, url: formData.url, description: formData.description, order: nextOrder, icon: formData.icon, is_active: true }, { onSuccess: onClose });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#000000]/20 flex items-center justify-center z-100 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl border border-[#ebf5ee] animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#000000]">Create New Link</h2>
          <button onClick={onClose}><X size={24} className="text-[#000000] hover:text-[#ffa0a3]" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#000000] mb-1">Title</label>
            <input required type="text" placeholder="e.g. My Portfolio" className="w-full p-2.5 bg-[#ebf5ee]/30 border border-[#ebf5ee] rounded-lg focus:ring-2 focus:ring-[#01d49f] outline-none text-[#000000]" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#000000] mb-1">URL</label>
            <input required type="url" placeholder="https://..." className="w-full p-2.5 bg-[#ebf5ee]/30 border border-[#ebf5ee] rounded-lg focus:ring-2 focus:ring-[#01d49f] outline-none text-[#000000]" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#000000] mb-1">Description</label>
            <textarea rows={2} placeholder="Short bio..." className="w-full p-2.5 bg-[#ebf5ee]/30 border border-[#ebf5ee] rounded-lg focus:ring-2 focus:ring-[#01d49f] outline-none resize-none text-[#000000]" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#000000] mb-1">Thumbnail</label>
            <div className="border-2 border-dashed border-[#ebf5ee] rounded-lg p-4 text-center relative hover:bg-[#ebf5ee]/50 transition-colors">
              <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={(e) => setFormData({ ...formData, icon: e.target.files?.[0] || null })} />
              <div className="flex flex-col items-center pointer-events-none">
                <Upload className={`mb-2 ${formData.icon ? 'text-[#01d49f]' : 'text-[#000000]'}`} size={20} />
                <span className="text-sm text-[#000000]">{formData.icon ? formData.icon.name : "Click to upload"}</span>
              </div>
            </div>
          </div>
          <button type="submit" disabled={createMutation.isPending} className="w-full bg-[#01d49f] text-white py-3 rounded-lg font-bold hover:bg-[#00b88a] transition-all mt-2 shadow-sm">
            {createMutation.isPending ? "Creating..." : "Add Link"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 3. SORTABLE ITEM
// ==========================================

interface SortableLinkItemProps {
  item: LinkType;
  onToggle: (item: LinkType) => void;
  onEdit: (item: LinkType, field: "title" | "url" | "description") => void;
  onDelete: (item: LinkType) => void;
  onIconUpload: (item: LinkType, file: File) => void;
}

function SortableLinkItem({ item, onToggle, onEdit, onDelete, onIconUpload }: SortableLinkItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : "auto", opacity: isDragging ? 0.8 : 1 };
  const handleIconClick = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) onIconUpload(item, file); };

  return (
    <div ref={setNodeRef} style={style} className={`bg-white border rounded-xl shadow-sm flex items-stretch overflow-hidden transition-all ${isDragging ? "ring-2 ring-[#01d49f] shadow-xl" : "border-[#ebf5ee]"}`}>
      <div {...attributes} {...listeners} className="flex items-center justify-center w-10 border-r border-[#ebf5ee] bg-white hover:bg-[#ebf5ee]/30 cursor-grab active:cursor-grabbing touch-none">
        <GripVertical className="text-[#000000]/50 w-5 h-5" />
      </div>

      <div className="grow p-4 flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2 group w-full max-w-[85%]">
            <h3 onClick={() => onEdit(item, "title")} className="font-bold text-[#000000] text-sm md:text-base cursor-pointer hover:bg-[#ebf5ee]/50 px-1 rounded truncate">
              {item.title}
            </h3>
            <button onClick={() => onEdit(item, "title")} className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Pencil className="w-3.5 h-3.5 text-[#000000]" />
            </button>
          </div>
          <button onClick={() => onToggle(item)} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${item.is_active ? "bg-[#01d49f]" : "bg-[#ebf5ee]"}`}>
            <span className={`pointer-events-none mt-0.5 inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${item.is_active ? "translate-x-5.5" : "translate-x-0.5"}`} />
          </button>
        </div>

        <div className="flex gap-4">
            <div className="relative w-12 h-12 shrink-0 group/icon cursor-pointer rounded-lg bg-[#ebf5ee]/50 border border-[#ebf5ee] flex items-center justify-center overflow-hidden" onClick={handleIconClick}>
                {item.icon ? (
                    <img src={item.icon.startsWith("http") ? item.icon : `${STORAGE_URL}${item.icon}`} alt="icon" className="w-full h-full object-cover" />
                ) : (
                    <ImageIcon className="text-[#000000]/50 w-6 h-6" />
                )}
                <div className="absolute inset-0 bg-[#000000]/40 flex items-center justify-center opacity-0 group-hover/icon:opacity-100 transition-opacity">
                    <Pencil className="w-4 h-4 text-white" />
                </div>
            </div>

            <div className="flex flex-col justify-center overflow-hidden w-full gap-1">
                <div className="flex items-center gap-2 group/link">
                    <p onClick={() => onEdit(item, "url")} className="text-sm text-[#000000]/80 truncate cursor-pointer hover:underline">
                        {item.url}
                    </p>
                    <button onClick={() => onEdit(item, "url")} className="opacity-0 group-hover/link:opacity-100 transition-opacity">
                        <Pencil className="w-3 h-3 text-[#000000]" />
                    </button>
                </div>
                <div className="flex items-center gap-2 group/desc">
                    {item.description ? (
                         <p onClick={() => onEdit(item, "description")} className="text-xs text-[#000000]/60 truncate cursor-pointer hover:text-[#000000]">{item.description}</p>
                    ) : (
                         <span onClick={() => onEdit(item, "description")} className="text-xs text-[#000000]/40 italic cursor-pointer hover:text-[#000000]">Add description...</span>
                    )}
                    <button onClick={() => onEdit(item, "description")} className="opacity-0 group-hover/desc:opacity-100 transition-opacity">
                        <Pencil className="w-3 h-3 text-[#000000]/50" />
                    </button>
                </div>
            </div>
        </div>

        <div className="flex justify-between items-end mt-1 pt-2 border-t border-[#ebf5ee]">
          <div className="flex gap-4">
            <button onClick={handleIconClick} className="text-[#000000]/60 hover:text-[#01d49f] relative"><ImageIcon className="w-4 h-4" />
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </button>
          </div>
          <button onClick={() => onDelete(item)} className="text-[#ff2d34] p-1 rounded hover:bg-[#ffa0a3]/10"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. MAIN CONTROLLER
// ==========================================

export default function LinkManager() {
  const { data: serverLinks, isLoading } = useLink();
  const { data: user } = useUser();
  const updateMutation = useEditLink();
  const deleteMutation = useDeleteLink();
  
  // States
  const [items, setItems] = useState<LinkType[]>([]);
  
  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Alert/Toast States
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [alertInfo, setAlertInfo] = useState<{ isOpen: boolean; title: string; message: string }>({ isOpen: false, title: "", message: "" });
  
  // Edit Modal States
  const [editState, setEditState] = useState<{ isOpen: boolean; item: LinkType | null; field: string }>({ isOpen: false, item: null, field: "" });

  useEffect(() => {
    if (serverLinks) {
      const sorted = [...serverLinks].sort((a, b) => a.order - b.order);
      setItems(sorted);
    }
  }, [serverLinks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const linkLimit = user?.link_limit || 0;
  const currentCount = items.length;
  const canCreate = currentCount < linkLimit;

  // HANDLERS
  const handleShareClick = () => {
    if (user?.username) {
        setIsShareModalOpen(true);
    }
  };

  const handleCreateClick = () => {
    if (canCreate) {
      setIsCreateModalOpen(true);
    } else {
      setAlertInfo({ 
        isOpen: true, 
        title: "Limit Reached", 
        message: `You have used ${currentCount} / ${linkLimit} links. Please upgrade your plan to add more.` 
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        newItems.forEach((item, index) => {
          if (item.order !== index) {
             updateMutation.mutate({ id: String(item.id), data: { order: index } });
          }
        });
        return newItems;
      });
    }
  };

  const handleEditClick = (item: LinkType, field: string) => {
    setEditState({ isOpen: true, item, field });
  };

  const saveEdit = (newValue: string) => {
    if (editState.item && newValue !== editState.item[editState.field as keyof LinkType]) {
        updateMutation.mutate({
            id: String(editState.item.id),
            data: { [editState.field]: newValue }
        });
    }
  };

  const handleIconUpload = (item: LinkType, file: File) => {
    updateMutation.mutate({ id: String(item.id), data: { icon: file } });
  };

  const handleDeleteClick = (item: LinkType) => {
    setDeleteId(String(item.id));
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
    }
  };

  if (isLoading) return <div className="p-10 text-center text-[#000000] animate-pulse">Loading links...</div>;

  return (
    <div className="w-full space-y-6">
      <CreateLinkModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} nextOrder={items.length} />
      <DeleteModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={confirmDelete} isDeleting={deleteMutation.isPending} />
      <AlertModal isOpen={alertInfo.isOpen} onClose={() => setAlertInfo({ ...alertInfo, isOpen: false })} title={alertInfo.title} message={alertInfo.message} />
      
      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        username={user?.username || ""} 
      />
      
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      
      <EditModal 
        isOpen={editState.isOpen} 
        onClose={() => setEditState({ ...editState, isOpen: false })} 
        onSave={saveEdit} 
        initialValue={editState.item ? String(editState.item[editState.field as keyof LinkType] || "") : ""} 
        field={editState.field}
      />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#ebf5ee] pb-4">
        <div>
            <h2 className="text-2xl font-bold text-[#000000] tracking-tight">My Links</h2>
            {user && (
                <p className={`text-xs font-semibold mt-1 ${!canCreate ? 'text-[#ffa0a3]' : 'text-[#000000]/40'}`}>
                    {currentCount} / {linkLimit} links used
                </p>
            )}
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex gap-2 mr-2">
                <a href={user?.username ? `/${user.username}` : '#'} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold text-[#000000]/70 hover:text-[#000000] hover:bg-[#ebf5ee] transition-colors" title="Preview Profile">
                    <Eye size={16} />
                    <span className="hidden sm:inline">Preview</span>
                </a>
            </div>
            <button onClick={handleCreateClick} disabled={!canCreate} className={`flex items-center gap-2 px-5 py-2 rounded-full font-bold text-sm transition-all shadow-sm active:scale-95 ml-auto sm:ml-0 ${canCreate ? 'bg-[#01d49f] text-white hover:bg-[#00b88a]' : 'bg-[#ebf5ee] text-[#fe4e54] cursor-not-allowed'}`}>
                {canCreate ? <Plus size={18} /> : <Lock size={16} />}
                {canCreate ? "Add Link" : "Limited"}
            </button>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <SortableLinkItem
                key={item.id}
                item={item}
                onToggle={(i) => updateMutation.mutate({ id: String(i.id), data: { is_active: !i.is_active } })}
                onEdit={(item, field) => handleEditClick(item, field)}
                onDelete={handleDeleteClick}
                onIconUpload={handleIconUpload}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}