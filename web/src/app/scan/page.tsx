'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, CheckCircle, AlertTriangle, ClipboardList, ShieldCheck } from 'lucide-react';
import { useScanLeaseMutation } from '@/lib/query';

export default function Scan() {
  const router = useRouter();
  const [loadingStep, setLoadingStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scanMutation = useScanLeaseMutation(
    (data) => {
      // Store result in session storage to pass to results page
      sessionStorage.setItem('lastScanResult', JSON.stringify(data));
      router.push("/results");
    },
    (error) => {
      alert("Error: " + error.message);
    }
  );

  const steps = [
    { title: "Reading PDF...", icon: <FileText size={24} /> },
    { title: "Checking London Laws...", icon: <ShieldCheck size={24} /> },
    { title: "Analyzing Risk Factors...", icon: <AlertTriangle size={24} /> },
    { title: "Generating Report...", icon: <ClipboardList size={24} /> }
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert("Please upload a PDF file.");
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
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-blue-200 mx-auto">
               <FileText color="white" size={40} />
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">LeaseLens</h1>
            <p className="text-slate-500 text-lg">
              AI-powered protection for London renters.
            </p>
          </div>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-white border border-slate-200 p-12 rounded-3xl shadow-sm flex flex-col items-center hover:border-blue-400 hover:bg-blue-50 transition-all group"
          >
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                <Upload className="text-blue-600" size={28} />
            </div>
            <p className="text-xl font-bold text-slate-900 mb-1">Upload Contract</p>
            <p className="text-slate-400 text-sm">Select PDF file to scan</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="application/pdf" 
              className="hidden" 
            />
          </button>
          
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
                  {step.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
