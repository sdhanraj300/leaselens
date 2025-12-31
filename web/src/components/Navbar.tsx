'use client';

import Link from 'next/link';
import { useAuth } from '@/context/auth';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import { ShieldCheck, LogOut, Sparkles, User as UserIcon, Plus, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { User as UserType } from '@/types';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { useState } from 'react';

export function Navbar() {
  const { user, session } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [topUpVisible, setTopUpVisible] = useState(false);

  const { data: userData } = useQuery<UserType | null>({
    queryKey: ['user', user?.id],
    queryFn: async () => {
        if (!session?.access_token) return null;
        return api.getUser(session.access_token);
    },
    enabled: !!session?.access_token,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
    router.push('/login');
  };

  const isAuthPage = pathname === '/login';
  if (isAuthPage) return null;

  return (
    <>
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 px-4 py-4 pointer-events-none"
      >
        <div className="max-w-6xl mx-auto flex justify-between items-center bg-white/70 backdrop-blur-xl border border-white/20 shadow-lg shadow-slate-200/50 rounded-[28px] px-6 py-3 pointer-events-auto">
          <Link href="/" className="flex items-center gap-2 group transition-all">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
              <ShieldCheck color="white" size={20} />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg text-slate-900 leading-none">LeaseLens</span>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">AI Legal</span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <AnimatePresence mode="wait">
              {!user ? (
                <motion.div
                  key="logged-out"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center gap-2"
                >
                  <Link href="/login">
                    <Button variant="ghost" className="font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl px-5">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-5 shadow-md shadow-blue-100">
                      Get Started
                    </Button>
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  key="logged-in"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-3"
                >
                  <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl pl-4 pr-1 py-1">
                    <div className="flex items-center gap-2 mr-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Sparkles size={12} className="text-blue-600" />
                        </div>
                        <span className="text-sm font-black text-slate-700">{userData?.credits ?? 0} Credits</span>
                    </div>
                    <Button 
                        size="sm" 
                        onClick={() => setTopUpVisible(true)}
                        className="h-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] px-3 gap-1 shadow-sm"
                    >
                        <Plus size={12} /> TOP UP
                    </Button>
                  </div>

                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setTopUpVisible(true)}
                    className="sm:hidden flex items-center gap-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl px-3 font-bold text-xs"
                  >
                     <Plus size={14} /> {userData?.credits ?? 0}
                  </Button>

                  <div className="h-8 w-[1px] bg-slate-100 mx-1 hidden sm:block" />

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-blue-50 transition-all text-slate-600 data-[state=open]:bg-blue-100 data-[state=open]:text-blue-600"
                      >
                          <UserIcon size={18} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 p-2 rounded-[24px] bg-white border-slate-100 shadow-xl shadow-slate-200/50 mt-2">
                      <DropdownMenuLabel className="p-4 flex flex-col items-center">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-3">
                          <UserIcon className="text-blue-600" size={24} />
                        </div>
                        <div className="text-center">
                           <p className="text-sm font-black text-slate-900 leading-tight">Your Account</p>
                           <p className="text-xs font-medium text-slate-400 mt-0.5 truncate max-w-[200px]">{user?.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-slate-50 mx-2 mb-2" />
                      
                      <div className="px-2 py-1 space-y-1">
                        <DropdownMenuItem 
                          onClick={() => setTopUpVisible(true)}
                          className="rounded-xl p-3 font-bold text-blue-600 hover:bg-blue-50 cursor-pointer flex items-center justify-between focus:bg-blue-50 focus:text-blue-700"
                        >
                           <div className="flex items-center gap-3">
                             <CreditCard size={16} /> Top Up Credits
                           </div>
                           <Badge className="bg-blue-100 text-blue-700 border-none font-bold text-[10px]">NEW</Badge>
                        </DropdownMenuItem>
                      </div>

                      <DropdownMenuSeparator className="bg-slate-50 mx-2 my-2" />
                      
                      <DropdownMenuItem 
                        onClick={handleSignOut}
                        className="rounded-xl p-3 font-bold text-red-600 hover:bg-red-50 cursor-pointer flex items-center gap-3 focus:bg-red-50 focus:text-red-700"
                      >
                        <LogOut size={16} /> Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.nav>

      <Dialog open={topUpVisible} onOpenChange={setTopUpVisible}>
        <DialogContent className="bg-white p-0 overflow-hidden border-none rounded-[32px] max-w-sm">
          <VisuallyHidden.Root>
            <DialogHeader>
              <DialogTitle>Top Up Credits</DialogTitle>
              <DialogDescription>Add more scan credits to your account.</DialogDescription>
            </DialogHeader>
          </VisuallyHidden.Root>

          <div className="bg-blue-600 p-10 text-center text-white relative">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
             <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
                <Sparkles size={32} />
             </div>
             <h2 className="text-2xl font-black mb-2">Get More Scans</h2>
             <p className="text-blue-100 font-medium">Choose a plan to continue</p>
          </div>
          <div className="p-8 space-y-4">
            <div className="p-5 border-2 border-blue-600 bg-blue-50/50 rounded-2xl flex justify-between items-center group cursor-pointer hover:bg-blue-50 transition-colors">
              <div>
                <p className="font-black text-slate-900 text-lg">1 Analysis Credit</p>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Legal Protection</p>
              </div>
              <p className="text-2xl font-black text-slate-900">£4.99</p>
            </div>
            
            <p className="text-[10px] text-slate-400 font-bold uppercase text-center tracking-widest mt-4">SECURE CHECKOUT VIA GUMROAD</p>
            
            <div className="grid grid-cols-2 gap-4 mt-2">
              <Button variant="outline" onClick={() => setTopUpVisible(false)} className="rounded-xl h-14 border-slate-200 font-black text-slate-500">
                LATER
              </Button>
              <a
                href={`https://dhanraj376.gumroad.com/l/fpnbfj?wanted=true&user_id=${user?.id}`}
                target="_blank"
                className="flex-1 bg-blue-600 text-white flex items-center justify-center rounded-xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all h-14"
              >
                BUY NOW
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
