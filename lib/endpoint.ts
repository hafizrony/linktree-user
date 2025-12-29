const API_URL = process.env.NEXT_PUBLIC_API;

export const ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_URL}/api/register`,
    LOGIN: `${API_URL}/api/login`,
    LOGOUT: `${API_URL}/api/logout`,
  },
  USER: {
    ME: `${API_URL}/api/me`, // Protected
    UPDATE: `${API_URL}/api/me`, // Protected (PATCH)
    PUBLIC: (username: string) => `${API_URL}/api/users/${username}`,
  },
  LINKS: {
    BASE: `${API_URL}/api/links`, 
    BY_ID: (id: number) => `${API_URL}/api/links/${id}`, 
  }
};