'use client';

import { ShieldCheck, Monitor, Zap, CreditCard, Lock, Upload, ArrowRight, CheckCircle2, Star, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

export default function Onboarding() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="px-6 pt-12 pb-20 max-w-6xl mx-auto">
        <motion.div 
          className="text-center"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Badge */}
          <motion.div 
            variants={fadeIn}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 text-blue-700 px-5 py-2.5 rounded-full text-sm font-semibold mb-8"
          >
            <Zap size={16} className="text-blue-600" />
            No App Download Required
          </motion.div>

          {/* Hero Headline */}
          <motion.h1 
            variants={fadeInUp}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight max-w-4xl mx-auto"
          >
            Spot Lease Traps
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent"> Before You Sign</span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p 
            variants={fadeInUp}
            className="text-lg sm:text-xl text-slate-500 mt-6 max-w-2xl mx-auto leading-relaxed"
          >
            Upload your rental agreement PDF and get an AI-powered legal review in seconds. 
            <span className="text-slate-700 font-medium"> No app download required.</span>
          </motion.p>

          {/* CTA Button */}
          <motion.div variants={fadeInUp} className="mt-10">
            <Link href="/login">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-7 text-lg font-bold rounded-2xl shadow-xl shadow-blue-200/50 transition-all hover:shadow-2xl hover:shadow-blue-300/50 hover:scale-[1.02]">
                <Upload className="mr-3" size={22} />
                Upload Lease PDF
                <ArrowRight className="ml-3" size={20} />
              </Button>
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div 
            variants={fadeIn}
            className="flex flex-wrap justify-center gap-6 mt-8 text-slate-500 text-sm"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-500" />
              <span>No account required to preview</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-500" />
              <span>Results in 30 seconds</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-500" />
              <span>Bank-grade security</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* "Why Web?" Section - 3 Columns */}
      <section className="px-6 py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Why Use LeaseLens?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-slate-500 text-lg max-w-xl mx-auto">
              Complex contracts deserve proper analysis. Here&apos;s why renters trust us.
            </motion.p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div variants={scaleIn}>
              <WhyWebCard
                icon={<Monitor size={32} className="text-blue-600" />}
                title="Built for Big Docs"
                highlight="Don't squint at fine print on a 6-inch screen."
                description="Review your lease comfortably on your laptop. Our side-by-side view highlights red flags right next to the original text."
              />
            </motion.div>
            <motion.div variants={scaleIn}>
              <WhyWebCard
                icon={<Zap size={32} className="text-blue-600" />}
                title="Instant Drag & Drop"
                highlight="Got a PDF in your email?"
                description="Just drag it here and drop. No downloading apps, no file permissions, no hassle. Analyze your lease in seconds."
              />
            </motion.div>
            <motion.div variants={scaleIn}>
              <WhyWebCard
                icon={<CreditCard size={32} className="text-blue-600" />}
                title="Pay Only Once"
                highlight="Moving is expensive enough."
                description="Pay £4.99 for a single scan. No monthly subscriptions, no impossible-to-cancel free trials. Just results."
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Red Flag Example Section */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                See What We Catch
              </h2>
              <p className="text-slate-500 text-lg max-w-xl mx-auto">
                Our AI scans every clause and flags potential problems instantly.
              </p>
            </motion.div>

            <motion.div variants={scaleIn}>
              <Card className="bg-white border-2 border-slate-100 shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden">
                <CardContent className="p-0">
                  {/* Mock UI Header */}
                  <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center gap-3">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <span className="text-sm text-slate-500 font-medium">LeaseLens Analysis</span>
                  </div>
                  
                  {/* Mock Content */}
                  <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Original Text Side */}
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Original Clause</p>
                      <p className="text-slate-700 text-sm leading-relaxed">
                        &quot;The Tenant agrees to pay a <span className="bg-yellow-100 text-yellow-800 px-1 rounded font-medium">non-refundable administration fee</span> of £300 upon signing this agreement, in addition to the security deposit...&quot;
                      </p>
                    </div>

                    {/* Analysis Side */}
                    <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle size={18} className="text-red-500" />
                        <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">Red Flag Detected</p>
                      </div>
                      <p className="text-slate-700 text-sm leading-relaxed mb-3">
                        <span className="font-bold text-red-700">Non-refundable fees may be illegal.</span> Under the Tenant Fees Act 2019, landlords in England cannot charge admin fees to tenants.
                      </p>
                      <p className="text-xs text-slate-500">
                        💡 This clause could save you £300 if challenged.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* No Install / Zero Commitment Section */}
      <section className="px-6 py-20 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-white mb-4">
              No App Store. No Downloads. No Clutter.
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
              Use it once, get your answer, move on. Zero commitment. For a tool you need maybe once every 1-2 years, 
              why clutter your phone with another app?
            </motion.p>
            <motion.div variants={fadeInUp}>
              <Link href="/login">
                <Button className="bg-white text-blue-600 hover:bg-blue-50 px-10 py-6 text-lg font-bold rounded-2xl shadow-xl transition-all hover:scale-[1.02]">
                  Get Instant Legal Clarity
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trust & Security Section */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            <motion.div variants={fadeInUp}>
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Lock size={16} />
                Bank-Grade Security
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Your Documents Are Safe With Us
              </h2>
              <p className="text-slate-500 text-lg leading-relaxed mb-6">
                People feel more secure handling sensitive financial documents on a secure website than a random new mobile app. 
                We use HTTPS encryption and your data is never shared with third parties.
              </p>
              <ul className="space-y-3">
                {[
                  "256-bit SSL encryption on all connections",
                  "Documents processed securely and deleted after analysis",
                  "No data sold or shared with third parties",
                  "GDPR compliant data handling"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-600">
                    <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div variants={scaleIn}>
              <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-3xl p-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
                    <Lock color="white" size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Secure by Design</h3>
                  <p className="text-slate-500">
                    Your lease never leaves our secure servers. Unlike mobile apps, 
                    your sensitive documents aren&apos;t stored on a device that can be lost or stolen.
                  </p>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="px-6 py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={scaleIn}
          >
            <Card className="bg-white border border-slate-100 shadow-xl rounded-3xl">
              <CardContent className="p-8 sm:p-12">
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={24} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-xl sm:text-2xl text-slate-700 leading-relaxed mb-8 font-medium">
                  &quot;LeaseLens saved me from signing a lease with a hidden break clause that would have cost me £2,000. 
                  The AI analysis caught what I completely missed reading it on my phone!&quot;
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    SE
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-lg">Sarah E.</p>
                    <p className="text-slate-500">London Renter, saved £2,000</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-24">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="max-w-3xl mx-auto text-center"
        >
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            Ready to Protect Your Rights?
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-slate-500 text-lg sm:text-xl mb-10 max-w-xl mx-auto">
            Don&apos;t let hidden clauses catch you off guard. Analyze your lease in seconds—no app required.
          </motion.p>
          <motion.div variants={fadeInUp}>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-12 py-7 text-xl font-bold rounded-2xl shadow-xl shadow-blue-200/50 transition-all hover:shadow-2xl hover:shadow-blue-300/50 hover:scale-[1.02]">
                Analyze Your Lease Now
                <ArrowRight className="ml-3" size={24} />
              </Button>
            </Link>
          </motion.div>
          <motion.p variants={fadeIn} className="text-slate-400 text-sm mt-6">
            Just £4.99 per scan • No subscription • Instant results
          </motion.p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="w-full py-10 border-t border-slate-100 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <ShieldCheck color="white" size={18} />
            </div>
            <span className="text-slate-500 text-sm">© {new Date().getFullYear()} LeaseLens. All rights reserved.</span>
          </div>
          <div className="flex gap-8 text-slate-500 text-sm">
            <Link href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function WhyWebCard({ 
  icon, 
  title, 
  highlight, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  highlight: string; 
  description: string; 
}) {
  return (
    <Card className="bg-white border border-slate-100 shadow-lg shadow-slate-100/50 rounded-2xl h-full hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300">
      <CardContent className="p-7">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center mb-5">
          {icon}
        </div>
        <h3 className="font-bold text-xl text-slate-900 mb-2">{title}</h3>
        <p className="text-blue-600 font-semibold text-sm mb-3">{highlight}</p>
        <p className="text-slate-500 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}
