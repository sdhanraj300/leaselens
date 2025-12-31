import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ShieldCheck, FileSearch, Scale } from 'lucide-react-native';
import { cn } from '../lib/utils';

export default function Onboarding() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-between p-6">
      <Stack.Screen options={{ headerShown: false }} />
      
      <View className="flex-1 items-center justify-center w-full mt-10">
        <View className="mb-10 w-32 h-32 bg-blue-500 rounded-[30px] items-center justify-center shadow-lg shadow-blue-300 transform rotate-3">
          <ShieldCheck color="white" size={60} />
        </View>
        
        <Text className="text-4xl font-extrabold text-slate-900 mb-4 text-center tracking-tight">
          Safe Renting{"\n"}Starts Here
        </Text>
        
        <Text className="text-center text-slate-500 text-lg px-4 mb-12 leading-7">
          LeaseLens analyzes your tenancy agreement against London housing laws to spot hidden risks instantly.
        </Text>

        <View className="w-full space-y-6"> 
          <FeatureRow 
            icon={<FileSearch color="#3b82f6" size={24} />}
            title="Smart Analysis"
            desc="AI scans every clause for you."
          />
          <FeatureRow 
            icon={<Scale color="#3b82f6" size={24} />}
            title="Legal Compliance"
            desc="Checks against latest UK laws."
          />
          <FeatureRow 
            icon={<ShieldCheck color="#3b82f6" size={24} />} 
            title="Risk Protection"
            desc="Know your rights before you sign."
          />
        </View>
      </View>

      <TouchableOpacity 
        onPress={() => router.push('/scan')}
        className="w-full bg-blue-600 p-5 rounded-2xl shadow-lg shadow-blue-200 active:bg-blue-700 active:scale-95 transition-all"
      >
        <Text className="text-white text-center font-bold text-xl">Get Started</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function FeatureRow({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <View className="flex-row items-center bg-slate-50 p-4 rounded-xl border border-slate-100 mb-3">
      <View className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-sm mr-4">
        {icon}
      </View>
      <View>
        <Text className="font-bold text-slate-800 text-base">{title}</Text>
        <Text className="text-slate-500 text-sm">{desc}</Text>
      </View>
    </View>
  )
}
