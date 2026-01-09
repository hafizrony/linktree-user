import { getHeaders } from "@/helper/helper";
import { CreateLinkInput } from "@/interface/link.interface";
import { ENDPOINTS } from "@/lib/endpoint";
import Cookies from "js-cookie";

class ApiService {


    private static instance: ApiService;
    private constructor() {}

    public static getInstance() {
        if (!ApiService.instance) ApiService.instance = new ApiService();
        return ApiService.instance;
    }

    async fetchUser() {
        const url = ENDPOINTS.USER.ME;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: getHeaders(),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (e) {
            console.error("API Service fetchUser:", e);
            throw e;
        }
    }
    async getLink(){
        const url = ENDPOINTS.LINKS.BASE;
        try{
            const response = await fetch(url,{
                method:'GET',
                headers:getHeaders(),
            });
            if(!response.ok){
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (e) {
            console.error("API Service getLink:", e)
        }
    }
    async createLink(data: CreateLinkInput) {
        const url = ENDPOINTS.LINKS.BASE;

        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('url', data.url);
        formData.append('order', String(data.order));
        if (data.description) formData.append('description', data.description);
        if (data.icon instanceof File) {
            formData.append('icon', data.icon);
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${Cookies.get('token')}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw errorData;
        }

        return response.json();
    }
    async editLink(id: string | number, data: any) {
        const url = ENDPOINTS.LINKS.BY_ID(Number(id));
        const formData = new FormData();
        formData.append('_method', 'PATCH');
        if (data.title) formData.append('title', data.title);
        if (data.url) formData.append('url', data.url);
        if (data.order !== undefined) formData.append('order', String(data.order));
        if (data.description !== undefined) formData.append('description', data.description || '');
        if (data.is_active !== undefined) formData.append('is_active', data.is_active ? '1' : '0');
        if (data.icon instanceof File) {
            formData.append('icon', data.icon);
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${Cookies.get('token')}`
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw errorData; 
        }
        return response.json();
    }
    async deleteLink(id: string | number) {
        const url = ENDPOINTS.LINKS.BY_ID(Number(id));

        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${Cookies.get('token')}`
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw errorData; 
        }
        return response.json();
    }
    async updateUser(data: any) {
        const isFormData = data instanceof FormData;
        const res = await fetch(`${ENDPOINTS.USER.UPDATE}`, {
            method: 'POST',
            headers: getHeaders(isFormData), 
            body: isFormData ? data : JSON.stringify(data),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Failed to update profile");
        }

        return res.json();
    }
    async getPublicProfile(username: string) {
        const url = `${process.env.NEXT_PUBLIC_API }/api/users/${username}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            cache: 'no-store' 
        });

        if (!response.ok) {
            return null; 
        }
        
        return response.json();
    }
    async logout() {
        const url = `${ENDPOINTS.AUTH.LOGOUT}`;

        const response = await fetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${Cookies.get('token')}`,
        },
        });

        if (!response.ok) {
        throw new Error('Logout failed');
        }

        return response.json();
    }

}

export default ApiService;