'use client';

import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface RedFlagCardProps {
  severity: 'high' | 'medium' | 'low';
  title: string;
  lawViolated?: string;
  description: string;
}

export function RedFlagCard({ severity, title, lawViolated, description }: RedFlagCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const borderColor = severity === 'high' ? 'border-red-500' : severity === 'medium' ? 'border-yellow-500' : 'border-green-500';
  const bgColor = severity === 'high' ? 'bg-red-50/50' : severity === 'medium' ? 'bg-yellow-50/50' : 'bg-green-50/50';
  const iconColor = severity === 'high' ? 'text-red-500' : severity === 'medium' ? 'text-yellow-500' : 'text-green-500';
  const Icon = severity === 'high' ? ShieldAlert : severity === 'medium' ? AlertTriangle : CheckCircle;

  return (
    <div 
      onClick={toggleExpand}
      className={cn(
        "p-4 mb-4 rounded-2xl border-l-[6px] border border-gray-100 shadow-sm cursor-pointer transition-all",
        borderColor, 
        bgColor
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1 pr-2">
          <div className="p-2 rounded-xl bg-white mr-3 shadow-sm">
            <Icon className={iconColor} size={22} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-900 leading-tight pr-2">{title}</h3>
            {!isExpanded && (
               <div className="flex items-center mt-1">
                 <div className={cn("px-2 py-0.5 rounded-full", severity === 'high' ? 'bg-red-100' : severity === 'medium' ? 'bg-yellow-100' : 'bg-green-100')}>
                   <span className={cn("text-[10px] font-black uppercase", severity === 'high' ? 'text-red-700' : severity === 'medium' ? 'text-yellow-700' : 'text-green-700')}>
                     {severity}
                   </span>
                 </div>
               </div>
            )}
          </div>
        </div>
        {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-200/50 animate-in fade-in slide-in-from-top-2 duration-200">
          {lawViolated && (
            <div className="flex items-center mb-2 bg-white/60 self-start px-2 py-1 rounded-lg border border-slate-100 w-fit">
              <span className="text-[10px] font-bold text-slate-600 uppercase">
                Law: {lawViolated}
              </span>
            </div>
          )}
          <p className="text-[14px] text-slate-700 leading-[22px] font-medium">
            {description}
          </p>
        </div>
      )}
    </div>
  );
}
