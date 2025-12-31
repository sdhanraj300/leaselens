'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LogOut, CreditCard, FileText, ChevronRight, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Script from 'next/script';
import { LeaseScan, User as UserType } from '@/types';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

export default function Dashboard() {
  const { user, session } = useAuth();
  const router = useRouter();
  const [topUpVisible, setTopUpVisible] = useState(false);

  const { data: userData, isLoading: loadingUser } = useQuery<UserType | null>({
    queryKey: ['user', user?.id],
    queryFn: async () => {
        if (!session?.access_token) return null;
        return api.getUser(session.access_token);
    },
    enabled: !!session?.access_token,
  });

  const { data: scansData, isLoading: loadingScans, refetch: refetchScans } = useQuery<{ scans: LeaseScan[] }>({
    queryKey: ['scans', user?.id],
    queryFn: async () => {
        if (!session?.access_token) return { scans: [] };
        return api.getScans(session.access_token);
    },
    enabled: !!session?.access_token,
  });

  const scans = scansData?.scans || [];

  const credits = userData?.credits ?? 0;
  const isLoading = loadingUser || loadingScans;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return 'bg-green-500';
    if (score < 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="pt-12">
      <Script src="https://gumroad.com/js/gumroad.js" strategy="afterInteractive" />
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
              <h1 className="text-3xl font-bold text-slate-900">Hello,</h1>
              <p className="text-slate-500">{user?.email}</p>
          </div>
          <button 
            onClick={handleSignOut} 
            className="p-3 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors"
          >
              <LogOut size={20} className="text-slate-600" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         

          <Link 
            href="/scan"
            className="md:col-span-2 bg-white border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-all group"
          >
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
              <Plus className="text-blue-600" size={40} />
            </div>
            <p className="text-2xl font-bold text-slate-900">New Scan</p>
            <p className="text-slate-500 text-center">Upload and analyze a new tenancy agreement</p>
          </Link>
           <Card className="md:col-span-1 bg-blue-600 text-white rounded-3xl shadow-lg">
  <CardHeader>
    <div className="flex items-center justify-between mb-4">
      <p className="text-blue-100 font-medium">Credits</p>
      <CreditCard color="white" size={24} />
    </div>
    <p className="text-5xl font-black mb-6">{credits}</p>
    <Button onClick={() => setTopUpVisible(true)} className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white">
      Top Up
    </Button>
  </CardHeader>
</Card>
        </div>

        <Card className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
  <CardHeader className="p-6 border-b border-slate-50 flex justify-between items-center">
    <CardTitle className="text-xl font-bold text-slate-900">Recent Scans</CardTitle>
    <Button onClick={() => refetchScans()} className="text-blue-600 border hover:bg-gray-200 border-blue-600 bg-gray-200 p-2 rounded-full text-sm font-medium hover:text-blue-800 hover:border-blue-800 transition-colors">
      Refresh
    </Button>
  </CardHeader>
  <CardContent>
    <div className="divide-y divide-slate-50">
      {isLoading ? (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500">Loading your scans...</p>
        </div>
      ) : scans.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="text-slate-300" size={32} />
          </div>
          <p className="text-slate-900 font-medium mb-1">No scans yet</p>
          <p className="text-slate-500 text-sm mb-6">Upload your first lease to get started</p>
          <Link href="/scan" className="text-blue-600 font-bold">Start Scanning</Link>
        </div>
      ) : (
        scans.map((scan) => (
          <button
            key={scan.id}
            onClick={() => router.push(`/results?id=${scan.id}`)}
            className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold ${getRiskColor(scan.riskScore)}`}>
                {scan.riskScore}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 truncate max-w-[200px] sm:max-w-md">{scan.fileName}</h3>
                <p className="text-slate-500 text-sm">
                  {new Date(scan.createdAt).toLocaleDateString()} • {scan.pageCount} pages
                </p>
              </div>
            </div>
            <ChevronRight className="text-slate-300" size={20} />
          </button>
        ))
      )}
    </div>
  </CardContent>
</Card>
      </div>
      
      {/* Simple Top Up Modal Mockup */}
      <Dialog open={topUpVisible} onOpenChange={setTopUpVisible}>
  <DialogContent className="bg-white text-black">
    <DialogHeader>
      <DialogTitle>Top Up Credits</DialogTitle>
      <DialogDescription>Choose a plan to add more scans to your account.</DialogDescription>
    </DialogHeader>
    <div className="space-y-4 mb-8">
      <div className="p-4 border-2 border-blue-600 bg-blue-50 rounded-2xl flex justify-between items-center">
        <div>
          <p className="font-bold text-slate-900">10 Scans</p>
          <p className="text-sm text-slate-500">Full legal analysis</p>
        </div>
        <p className="text-xl font-black text-blue-600">£9.99</p>
      </div>
    </div>
    <DialogFooter className="flex space-x-4">
      <Button onClick={() => setTopUpVisible(false)} className="flex-1">
        Cancel
      </Button>
      <a
        href={`https://dhanraj376.gumroad.com/l/fpnbfj?wanted=true&user_id=${user?.id}`}
        target="_blank"
        className="gumroad-button flex-1 bg-blue-600 text-white p-4 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors text-center"
      >
        Purchase
      </a>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </div>
  );
}
