import { View, Text, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/auth';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { LogOut, CreditCard, FileText, ChevronRight } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { API_URL } from '../../lib/api';
import TopUpModal from '../../components/TopUpModal';

interface Scan {
  id: string;
  fileName: string;
  riskScore: number;
  pageCount: number;
  createdAt: string;
  issues: any[];
}

export default function Dashboard() {
  const { user, session } = useAuth();
  const router = useRouter();
  const [topUpVisible, setTopUpVisible] = useState(false);

  const { data: userData, isLoading: loadingUser, refetch: refetchUser } = useQuery({
    queryKey: ['user', user?.id],
    queryFn: async () => {
        if (!session?.access_token) return null;
        const response = await fetch(`${API_URL}/api/user`, {
            headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        return response.json(); 
    },
    enabled: !!session?.access_token,
  });

  const { data: scans = [], isLoading: loadingScans, refetch: refetchScans } = useQuery<Scan[]>({
    queryKey: ['scans', user?.id],
    queryFn: async () => {
        if (!session?.access_token) return [];
        const response = await fetch(`${API_URL}/api/scans`, {
            headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        const data = await response.json();
        return data.scans || [];
    },
    enabled: !!session?.access_token,
  });
  
  const credits = userData?.credits ?? 0;
  const isLoading = loadingUser || loadingScans;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return 'bg-green-500';
    if (score < 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const onRefresh = () => {
    refetchUser();
    refetchScans();
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView 
        className="p-6"
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
      >
      <View className="flex-row justify-between items-center mb-6">
        <View>
            <Text className="text-2xl font-bold text-slate-900">Hello,</Text>
            <Text className="text-slate-500">{user?.email}</Text>
        </View>
        <TouchableOpacity onPress={handleSignOut} className="p-2 bg-slate-200 rounded-full">
            <LogOut size={20} color="#334155" />
        </TouchableOpacity>
      </View>

      <View className="bg-blue-600 rounded-3xl p-6 shadow-lg mb-6">
        <View className="flex-row items-center justify-between mb-2">
            <Text className="text-blue-100 font-medium">Available Credits</Text>
            <CreditCard color="white" size={24} />
        </View>
        <Text className="text-5xl font-black text-white">{credits}</Text>
        <TouchableOpacity 
            onPress={() => setTopUpVisible(true)}
            className="mt-4 bg-blue-500 p-3 rounded-xl items-center"
        >
            <Text className="text-white font-bold">Top Up</Text>
        </TouchableOpacity>
      </View>

      <TopUpModal 
        visible={topUpVisible} 
        onClose={() => setTopUpVisible(false)} 
        onSuccess={() => refetchUser()}
      />

      <Text className="text-lg font-bold text-slate-900 mb-4">Recent Scans</Text>
      
      {scans.length === 0 ? (
        <View className="items-center justify-center py-10 opacity-50">
          <FileText size={48} color="#94a3b8" />
          <Text className="text-slate-400 mt-4">No scans yet.</Text>
          <Text className="text-slate-400 text-sm">Upload a contract to get started.</Text>
        </View>
      ) : (
        <View className="gap-3">
          {scans.map((scan) => (
            <TouchableOpacity 
              key={scan.id}
              onPress={() => router.push({ pathname: "/results", params: { result: JSON.stringify({ riskScore: scan.riskScore, issues: scan.issues }) } })}
              className="bg-white p-4 rounded-2xl flex-row items-center border border-slate-100"
            >
              <View className={`w-12 h-12 rounded-xl items-center justify-center ${getRiskColor(scan.riskScore)}`}>
                <Text className="text-white font-bold text-sm">{scan.riskScore}%</Text>
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-slate-900 font-semibold" numberOfLines={1}>{scan.fileName}</Text>
                <Text className="text-slate-400 text-sm">
                  {scan.pageCount} pages • {scan.issues?.length || 0} issues
                </Text>
              </View>
              <ChevronRight size={20} color="#94a3b8" />
            </TouchableOpacity>
          ))}
        </View>
      )}
      </ScrollView>
    </SafeAreaView>
  );
}
