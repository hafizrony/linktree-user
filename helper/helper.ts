// --- Types & Interfaces ---
import Cookies from "js-cookie";

export interface LinkData {
  id: number;
  user_id: number;
  title: string;
  url: string;
  icon: string | null;
  order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  description?: string | null;
}

export interface UserData {
  id: number;
  name: string;
  email: string;
  username: string;
  avatar: string | null;
  bio: string | null;
  is_active: boolean;
  link_limit: number;
  created_at: string;
  links: LinkData[];
}

// --- Helper Functions ---
export const getHeaders = (isMultipart = false) => {
  const token = Cookies.get('token') || '';
  
  const headers: any = {
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
};