export interface Link {
  id: number;
  user_id: number;
  title: string;
  url: string;
  icon: string | null; 
  description: string | null; 
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateLinkInput {
  title: string;
  url: string;
  description?: string; 
  order: number;
  icon?: File | null;
  is_active?: boolean;
}

export interface UpdateLinkInput {
  title?: string;
  url?: string;
  description?: string; 
  order?: number;
  is_active?: boolean;
  icon?: File | string | null; 
}