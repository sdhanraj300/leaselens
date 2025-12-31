'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RedFlagCard } from '@/components/RedFlagCard';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/auth';
import { LeaseScan, Issue } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { session } = useAuth();

  const scanId = searchParams.get('id');

  const { data: result, isLoading, isError, error } = useQuery<LeaseScan | null>({
    queryKey: ['scan', scanId],
    queryFn: async () => {
      if (scanId && session?.access_token) {
        const data = await api.getScanById(scanId, session.access_token);
        if (data.error) throw new Error(data.error);
        return data.scan;
      } else if (!scanId) {
        const storedResult = sessionStorage.getItem('lastScanResult');
        if (storedResult) {
          return JSON.parse(storedResult);
        }
      }
      return null;
    },
    enabled: (!!scanId && !!session?.access_token) || !scanId,
  });

  // Show loading if query is loading OR if we have a scanId but no session yet
  const showLoading = isLoading || (!!scanId && !session?.access_token);

  if (showLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError || !result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <h1 className="text-2xl font-bold mb-2">
          {isError ? "Error Loading Scan" : "No Result Found"}
        </h1>
        <p className="text-slate-500 mb-6 text-center max-w-md">
          {isError ? (error as Error).message : "We couldn't find the scan you're looking for."}
        </p>
        <button 
          onClick={() => router.push('/')}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold"
        >
          Go Home
        </button>
      </div>
    );
  }

  const issues = result.issues || [];
  const score = result.riskScore || 0;

  const getScoreColor = (s: number) => s < 20 ? 'text-green-600' : s < 50 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto pt-10 px-6">
        <div className="flex items-center justify-between mb-8">
           <div>
              <h1 className="text-3xl font-black text-slate-900">Analysis Report</h1>
              <p className="text-slate-500 font-medium mt-1">Found {issues.length} points of interest</p>
           </div>
           <button 
             onClick={() => router.back()} 
             className="px-5 py-2 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-all font-bold text-slate-600 shadow-sm"
           >
              Go Back
           </button>
        </div>

        <div className="bg-white px-6 pt-12 pb-16 rounded-b-[40px] shadow-sm mb-8">
            <div className="flex flex-col items-center">
                <div className={cn("w-40 h-40 rounded-full flex flex-col items-center justify-center border-[10px] mb-8 shadow-xl transition-all", 
                                  score < 20 ? "bg-green-50 border-green-100" : score < 50 ? "bg-yellow-50 border-yellow-100" : "bg-red-50 border-red-100")}>
                    <span className={cn("text-6xl font-black", getScoreColor(score))}>{score}</span>
                    <span className={cn("text-[10px] font-black uppercase tracking-widest", getScoreColor(score))}>Risk Score</span>
                </div>
                
                <h2 className="text-3xl font-black text-slate-900 mb-3">
                    {score < 20 ? "Safe to Sign! ✅" : score < 50 ? "Review Required ⚠️" : "High Risk! 🛑"}
                </h2>
                
                <p className="text-center text-slate-600 leading-relaxed max-w-md font-medium">
                    We&apos;ve scanned your lease against London Tenancy Laws. Here&apos;s what you need to know.
                </p>
            </div>

            <div className="flex justify-center mt-10 gap-4">
                <div className="bg-slate-50 px-6 py-4 rounded-2xl flex flex-col items-center border border-slate-100 min-w-[100px]">
                    <span className="text-slate-400 text-[10px] font-black uppercase mb-1">Points</span>
                    <span className="text-slate-900 font-bold text-xl">{issues.length}</span>
                </div>
                <div className="bg-slate-50 px-6 py-4 rounded-2xl flex flex-col items-center border border-slate-100 min-w-[100px]">
                    <span className="text-slate-400 text-[10px] font-black uppercase mb-1">Urgent</span>
                    <span className="text-red-600 font-bold text-xl">{issues.filter((i: Issue) => i.severity === 'high').length}</span>
                </div>
                <div className="bg-slate-50 px-6 py-4 rounded-2xl flex flex-col items-center border border-slate-100 min-w-[100px]">
                    <span className="text-slate-400 text-[10px] font-black uppercase mb-1">Status</span>
                    <span className={cn("font-bold text-xl", getScoreColor(score))}>{score < 50 ? "OK" : "Warn"}</span>
                </div>
            </div>
        </div>

        <div className="px-6 pb-20">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Detailed Findings</h2>
                <div className="bg-slate-200 px-4 py-1 rounded-full">
                    <span className="text-[10px] font-bold text-slate-600 uppercase">{issues.length} items</span>
                </div>
            </div>

            <div className="space-y-4">
              {issues.map((issue: Issue, index: number) => (
                  <RedFlagCard 
                      key={index}
                      title={issue.title}
                      severity={issue.severity}
                      description={issue.description}
                      lawViolated={issue.lawViolated || issue.law}
                  />
              ))}
            </div>
            
            {issues.length === 0 && (
                <div className="bg-green-50 rounded-3xl p-12 flex flex-col items-center justify-center border border-green-100 shadow-sm mt-4">
                    <div className="bg-white p-6 rounded-full shadow-sm mb-6">
                        <ShieldCheck size={64} className="text-green-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-green-800 mb-2">No Red Flags!</h3>
                    <p className="text-center text-green-600 font-medium">Your contract appears to be fully compliant with standard housing regulations.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default function Results() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
