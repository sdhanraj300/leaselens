'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, CheckCircle, AlertTriangle, ClipboardList, ShieldCheck } from 'lucide-react';
import { useScanLeaseMutation, useUser } from '@/lib/query';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function Scan() {
  const router = useRouter();
  const { data: user } = useUser();
  const [loadingStep, setLoadingStep] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  const scanMutation = useScanLeaseMutation(
    (data) => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      // Store result in session storage to pass to results page
      sessionStorage.setItem('lastScanResult', JSON.stringify(data));
      toast.success('Lease analysis complete!');
      router.push("/results");
    },
    (error) => {
      toast.error(error.message || 'Scan failed. Please try again.');
    }
  );

  const userCity = user?.city || "london";
  const cityName = userCity === 'london' ? 'London' : 'New York';

  const steps = [
    { title: "Reading PDF...", icon: <FileText size={24} /> },
    { title: `Checking ${cityName} Laws...`, icon: <ShieldCheck size={24} /> },
    { title: "Analyzing Risk Factors...", icon: <AlertTriangle size={24} /> },
    { title: "Generating Report...", icon: <ClipboardList size={24} /> }
  ];

  const hasCredits = (user?.credits ?? 0) > 0;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!hasCredits) {
      toast.error("You have no scan credits left. Please top up.");
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error("Please upload a PDF file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      setLoadingStep(0);
      
      scanMutation.mutate({ 
        fileBase64: base64, 
        fileName: file.name,
        onProgress: (step, message) => {
          setLoadingStep(step);
          if (message) setStatusMessage(message);
        }
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6">
      {!scanMutation.isPending ? (
        <div className="w-full max-w-md">
          <div className="mb-10 text-center">
             <h1 className="text-3xl font-black text-slate-900 mb-2">New Scan</h1>
             <p className="text-slate-500 font-medium">Upload your contract to begin analysis</p>
          </div>
          
          <button 
            onClick={() => hasCredits ? fileInputRef.current?.click() : toast.error("Please top up your credits to scan.")}
            disabled={!hasCredits}
            className={`w-full bg-white border border-slate-200 p-12 rounded-3xl shadow-sm flex flex-col items-center transition-all group ${
              hasCredits ? 'hover:border-blue-400 hover:bg-blue-50' : 'opacity-60 grayscale cursor-not-allowed'
            }`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${
              hasCredits ? 'bg-blue-50 group-hover:bg-blue-100' : 'bg-slate-100'
            }`}>
                <Upload className={hasCredits ? "text-blue-600" : "text-slate-400"} size={28} />
            </div>
            <p className="text-xl font-bold text-slate-900 mb-1">
              {hasCredits ? "Upload Contract" : "No Credits Left"}
            </p>
            <p className="text-slate-400 text-sm">
              {hasCredits ? "Select PDF file to scan" : "Top up to begin new analysis"}
            </p>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="application/pdf" 
              className="hidden" 
            />
          </button>
          
          {!hasCredits && (
            <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex flex-col items-center text-center">
               <AlertTriangle className="text-blue-600 mb-2" size={20} />
               <p className="text-sm font-bold text-slate-800">You need scan credits to proceed</p>
               <button 
                onClick={() => window.dispatchEvent(new CustomEvent('open-topup'))} 
                className="mt-2 text-blue-600 font-extrabold text-xs uppercase tracking-widest hover:underline"
               >
                 Top Up Now
               </button>
            </div>
          )}
          
          <button 
            onClick={() => router.back()}
            className="w-full mt-6 text-slate-500 font-medium hover:text-slate-700"
          >
            Go Back
          </button>
        </div>
      ) : (
        <div className="w-full max-w-md text-center">
          <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mb-8 mx-auto">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          
          <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">
            Analyzing Lease
          </h2>

          <div className="space-y-4 text-left">
            {steps.map((step, index) => (
              <div 
                key={index}
                className={`flex items-center p-4 rounded-2xl transition-all duration-500 ${
                  index <= loadingStep ? 'bg-white shadow-sm border border-slate-100' : 'opacity-40'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                  index < loadingStep ? 'bg-green-100 text-green-600' : 
                  index === loadingStep ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
                }`}>
                  {index < loadingStep ? <CheckCircle size={20} /> : step.icon}
                </div>
                <p className={`font-bold ${
                  index <= loadingStep ? 'text-slate-800' : 'text-slate-400'
                }`}>
                  {index === loadingStep && statusMessage ? statusMessage : step.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
