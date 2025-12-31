import { useMutation } from '@tanstack/react-query';
import { scanLease } from './fetch';
import { LeaseScan } from '@/types';

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
