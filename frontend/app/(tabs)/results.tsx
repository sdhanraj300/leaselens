import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { RedFlagCard } from '../../components/RedFlagCard';
import { ChevronLeft, ShieldCheck } from 'lucide-react-native';
import { cn } from '../../lib/utils';

export default function Results() {
  const { result } = useLocalSearchParams();
  const router = useRouter();
  
  const parsedResult = typeof result === 'string' ? JSON.parse(result) : null;
  const issues = parsedResult?.issues || [];
  const score = parsedResult?.riskScore || 0;

  const getScoreColor = (s: number) => s < 20 ? 'text-green-600' : s < 50 ? 'text-yellow-600' : 'text-red-600';
  const getScoreBg = (s: number) => s < 20 ? 'bg-green-100' : s < 50 ? 'bg-yellow-100' : 'bg-red-100';

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <Stack.Screen options={{ headerShown: false }} />
      
      <View className="px-6 py-4 bg-white border-b border-slate-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="p-2 bg-slate-50 rounded-xl">
            <ChevronLeft size={22} color="#1e293b" />
        </TouchableOpacity>
        <View className="flex-1 items-center mr-8">
            <Text className="font-extrabold text-lg text-slate-900">Lease Analysis</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="bg-white px-6 pt-8 pb-10 rounded-b-[40px] shadow-sm mb-6">
            <View className="items-center">
                <View className={cn("w-36 h-36 rounded-full items-center justify-center border-[10px] mb-6 shadow-xl", 
                                  score < 20 ? "bg-green-50 border-green-100" : score < 50 ? "bg-yellow-50 border-yellow-100" : "bg-red-50 border-red-100")}>
                    <Text className={cn("text-5xl font-black", getScoreColor(score))}>{score}</Text>
                    <Text className={cn("text-[10px] font-black uppercase tracking-widest", getScoreColor(score))}>Risk Score</Text>
                </View>
                
                <Text className="text-2xl font-black text-slate-900 mb-2">
                    {score < 20 ? "Safe to Sign! ✅" : score < 50 ? "Review Required ⚠️" : "High Risk! 🛑"}
                </Text>
                
                <Text className="text-center text-slate-600 leading-6 px-4 font-medium">
                    We've scanned your lease against London Tenancy Laws. Here's what you need to know.
                </Text>
            </View>

            <View className="flex-row justify-center mt-8 space-x-4">
                <View className="bg-slate-50 px-4 py-3 rounded-2xl items-center border border-slate-100">
                    <Text className="text-slate-400 text-[10px] font-black uppercase">Points</Text>
                    <Text className="text-slate-900 font-bold text-lg">{issues.length}</Text>
                </View>
                <View className="bg-slate-50 px-4 py-3 rounded-2xl items-center border border-slate-100">
                    <Text className="text-slate-400 text-[10px] font-black uppercase">Urgent</Text>
                    <Text className="text-red-600 font-bold text-lg">{issues.filter((i:any) => i.severity === 'high').length}</Text>
                </View>
                <View className="bg-slate-50 px-4 py-3 rounded-2xl items-center border border-slate-100">
                    <Text className="text-slate-400 text-[10px] font-black uppercase">Status</Text>
                    <Text className={cn("font-bold text-lg", getScoreColor(score))}>{score < 50 ? "OK" : "Warn"}</Text>
                </View>
            </View>
        </View>

        <View className="px-6 mb-12">
            <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-black text-slate-900 tracking-tight">Detailed Findings</Text>
                <View className="bg-slate-200 px-3 py-1 rounded-full">
                    <Text className="text-[10px] font-bold text-slate-600 uppercase">{issues.length} items</Text>
                </View>
            </View>

            {issues.map((issue: any, index: number) => (
                <RedFlagCard 
                    key={index}
                    title={issue.title}
                    severity={issue.severity}
                    description={issue.description}
                    lawViolated={issue.lawViolated || issue.law}
                />
            ))}
            
            {issues.length === 0 && (
                <View className="bg-green-50 rounded-3xl p-10 items-center justify-center border border-green-100 shadow-sm mt-4">
                    <View className="bg-white p-4 rounded-full shadow-sm mb-4">
                        <ShieldCheck size={48} color="#22c55e" />
                    </View>
                    <Text className="text-xl font-bold text-green-800 mb-2">No Red Flags!</Text>
                    <Text className="text-center text-green-600 font-medium">Your contract appears to be fully compliant with standard housing regulations.</Text>
                </View>
            )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
