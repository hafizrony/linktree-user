"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ApiService from "@/services/services"
import { CreateLinkInput, UpdateLinkInput } from "@/interface/link.interface";


export const useLink = () => {
    return useQuery({
        queryKey: ['links'],
        queryFn: () =>ApiService.getInstance().getLink(),
    });
};
export const useCreateLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
   mutationFn: (data: CreateLinkInput) => ApiService.getInstance().createLink(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
    },
    onError: (error: any) => {
      console.error("Failed to create link:", error);
      alert(error.message || "Failed to create link");
    }
  });
};

export const useEditLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLinkInput }) => 
      ApiService.getInstance().editLink(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
    },
  });
};
export const useDeleteLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ApiService.getInstance().deleteLink(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
    },
  });
};