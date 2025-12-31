'use client';

import { useAuth } from '@/context/auth';
import { FileText, ChevronRight, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { LeaseScan } from '@/types';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { user, session } = useAuth();

  const { data: scansData, isLoading: loadingScans, refetch: refetchScans } = useQuery<{ scans: LeaseScan[] }>({
    queryKey: ['scans', user?.id],
    queryFn: async () => {
        if (!session?.access_token) return { scans: [] };
        return api.getScans(session.access_token);
    },
    enabled: !!session?.access_token,
  });

  const scans = scansData?.scans || [];
  const isLoading = loadingScans;

  const getRiskColor = (score: number) => {
    if (score < 30) return 'bg-emerald-500';
    if (score < 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="pb-20 px-4 pt-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <Link 
            href="/scan"
            className="w-full bg-white border-2 border-dashed border-slate-200 rounded-[40px] p-12 flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50/50 transition-all group relative overflow-hidden"
          >
            <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-blue-100 group-hover:scale-110 transition-all duration-300">
              <Plus className="text-blue-600" size={48} />
            </div>
            <p className="text-3xl font-black text-slate-900 mb-2">New Scan</p>
            <p className="text-slate-500 font-bold text-lg text-center">Analyze a new tenancy agreement</p>
            
            <Badge className="mt-6 bg-blue-100 text-blue-700 hover:bg-blue-100 border-none font-black uppercase tracking-widest text-xs px-6 py-2 rounded-xl">
              1 Credit / Scan
            </Badge>
          </Link>
        </div>

        <Card className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
          <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black text-slate-900">Recent Scans</CardTitle>
              <p className="text-slate-400 font-medium text-sm">Review your history</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => refetchScans()} 
              className="rounded-xl border-slate-200 font-bold text-slate-600 h-10"
            >
              Refresh
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50">
              {isLoading ? (
                <div className="p-20 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-slate-500 font-medium">Loading history...</p>
                </div>
              ) : scans.length === 0 ? (
                <div className="p-20 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <FileText className="text-slate-300" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No scans yet</h3>
                  <p className="text-slate-500 font-medium mb-8">Upload your first lease to get started</p>
                  <Button asChild className="bg-blue-600 hover:bg-blue-700 font-black text-white px-8 h-12 rounded-xl h-12">
                     <Link href="/scan">Start Scanning</Link>
                  </Button>
                </div>
              ) : (
                scans.map((scan, index) => (
                  <motion.div
                    key={scan.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={`/results?id=${scan.id}`}
                      className="w-full p-6 flex items-center justify-between hover:bg-slate-50/80 transition-all text-left"
                    >
                      <div className="flex items-center space-x-5">
                        <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white border-4 border-white shadow-sm font-black text-xl ${getRiskColor(scan.riskScore)}`}>
                          {scan.riskScore}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 truncate max-w-[200px] sm:max-w-md">{scan.fileName}</h3>
                          <div className="flex items-center gap-3 mt-1">
                             <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                              {new Date(scan.createdAt).toLocaleDateString()}
                            </p>
                            <span className="w-1 h-1 bg-slate-200 rounded-full" />
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                              {scan.pageCount} Pages
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-blue-600 transition-colors">
                        <ChevronRight size={20} />
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
