import React, { useState } from 'react';
import { View, Text, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { AlertTriangle, ShieldAlert, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react-native';
import { cn } from '../lib/utils';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
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
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const borderColor = severity === 'high' ? 'border-red-500' : severity === 'medium' ? 'border-yellow-500' : 'border-green-500';
  const bgColor = severity === 'high' ? 'bg-red-50/50' : severity === 'medium' ? 'bg-yellow-50/50' : 'bg-green-50/50';
  const iconColor = severity === 'high' ? '#ef4444' : severity === 'medium' ? '#eab308' : '#22c55e';
  const Icon = severity === 'high' ? ShieldAlert : severity === 'medium' ? AlertTriangle : CheckCircle;

  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={toggleExpand}
      className={cn(
        "p-4 mb-4 rounded-2xl border-l-[6px] border border-gray-100 shadow-sm",
        borderColor, 
        bgColor
      )}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 pr-2">
          <View className={cn("p-2 rounded-xl bg-white mr-3 shadow-sm")}>
            <Icon color={iconColor} size={22} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-slate-900 leading-tight pr-2">{title}</Text>
            {!isExpanded && (
               <View className="flex-row items-center mt-1">
                 <View className={cn("px-2 py-0.5 rounded-full", severity === 'high' ? 'bg-red-100' : severity === 'medium' ? 'bg-yellow-100' : 'bg-green-100')}>
                   <Text className={cn("text-[10px] font-black uppercase", severity === 'high' ? 'text-red-700' : severity === 'medium' ? 'text-yellow-700' : 'text-green-700')}>
                     {severity}
                   </Text>
                 </View>
               </View>
            )}
          </View>
        </View>
        {isExpanded ? <ChevronUp size={20} color="#64748b" /> : <ChevronDown size={20} color="#64748b" />}
      </View>

      {isExpanded && (
        <View className="mt-4 pt-4 border-t border-slate-200/50">
          {lawViolated && (
            <View className="flex-row items-center mb-2 bg-white/60 self-start px-2 py-1 rounded-lg border border-slate-100">
              <Text className="text-[10px] font-bold text-slate-600 uppercase">
                Law: {lawViolated}
              </Text>
            </View>
          )}
          <Text className="text-[14px] text-slate-700 leading-[22px] font-medium">
            {description}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

