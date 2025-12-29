"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ApiService from "@/services/services";
import Cookies from "js-cookie";
import { useRouter } from 'next/navigation';



export const useUser = () => {
    return useQuery({
        queryKey: ['me'],
        queryFn: () =>ApiService.getInstance().fetchUser(),
    });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; bio: string; avatar?: File | null ,theme?:any}) => 
      ApiService.getInstance().updateUser(data),
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (error: any) => {
      console.error("Update failed:", error);
      alert(error.message || "Failed to update profile. Please try again.");
    }
  });
};
export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => ApiService.getInstance().logout(),

    onSuccess: () => {
      Cookies.remove('token');
      queryClient.clear();
      router.push('/login');
    },

    onError: (error: any) => {
      console.error('Logout failed:', error);
      alert(error.message || 'Logout failed. Please try again.');
    },
  });
};
