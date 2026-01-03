'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('london');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = isSignUp 
      ? await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              city: city
            }
          }
        })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(isSignUp ? 'Account created successfully!' : 'Signed in successfully!');
      router.push('/');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex flex-col">


      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 pb-12">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="w-full max-w-md"
        >
          {/* Header */}
          <motion.div variants={fadeInUp} className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-slate-500 text-lg">
              {isSignUp 
                ? 'Start protecting your rental rights today.' 
                : 'Sign in to analyze your lease agreements.'}
            </p>
          </motion.div>

          {/* Form Card */}
          <motion.div variants={fadeInUp}>
            <Card className="bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-3xl">
              <CardContent className="p-8">
                <form onSubmit={handleAuth} className="space-y-5">
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm font-medium"
                    >
                      {error}
                    </motion.div>
                  )}
                  
                  <div>
                    <label className="block mb-2 font-semibold text-slate-700 text-sm">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <Input
                        type="email"
                        className="w-full pl-12 pr-4 py-6 bg-slate-50 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block mb-2 font-semibold text-slate-700 text-sm">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <Input
                        type="password"
                        className="w-full pl-12 pr-4 py-6 bg-slate-50 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  {isSignUp && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-2"
                    >
                      <label className="block mb-2 font-semibold text-slate-700 text-sm">
                        Select Your City
                      </label>
                      <div className="relative">
                        <select
                          className="w-full pl-4 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 appearance-none font-medium"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                        >
                          <option value="london">London</option>
                          <option value="new-york">New York</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <ArrowRight className="rotate-90 text-slate-400" size={18} />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6 rounded-xl shadow-lg shadow-blue-200/50 font-bold text-lg transition-all hover:shadow-xl disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 animate-spin" size={20} />
                        Processing...
                      </>
                    ) : (
                      <>
                        {isSignUp ? 'Create Account' : 'Sign In'}
                        <ArrowRight className="ml-2" size={20} />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Toggle */}
          <motion.div variants={fadeInUp} className="mt-6 text-center">
            <button 
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-slate-500 hover:text-slate-700 transition-colors"
            >
              {isSignUp ? (
                <>Already have an account? <span className="font-semibold text-blue-600">Sign In</span></>
              ) : (
                <>Don&apos;t have an account? <span className="font-semibold text-blue-600">Sign Up</span></>
              )}
            </button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div variants={fadeInUp} className="mt-8 flex justify-center gap-6 text-slate-400 text-xs">
            <span>🔒 Secure Connection</span>
            <span>🚀 Instant Access</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-slate-400 text-sm">
        <p>© {new Date().getFullYear()} LeaseLens. All rights reserved.</p>
      </footer>
    </div>
  );
}
