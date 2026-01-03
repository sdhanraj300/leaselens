import { useMutation, useQuery } from '@tanstack/react-query';
import { scanLease, getUser } from './fetch';
import { LeaseScan, User } from '@/types';

export const useUser = () => {
  return useQuery<User | null>({
    queryKey: ['user'],
    queryFn: getUser,
  });
};

export const useScanLeaseMutation = (
  onSuccess?: (data: LeaseScan) => void,
  onError?: (error: Error) => void
) => {
  return useMutation({
    mutationFn: ({ fileBase64, fileName, onProgress }: { fileBase64: string; fileName: string; onProgress?: (step: number, message: string) => void }) => 
      scanLease(fileBase64, fileName, onProgress),
    onSuccess,
    onError,
  });
};
