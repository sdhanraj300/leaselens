import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useRouter, Stack } from 'expo-router';
import { Upload, FileText, CheckCircle } from 'lucide-react-native';
import { useScanLeaseMutation } from '../../lib/query';

export default function Scan() {
  const router = useRouter();
  const [loadingStep, setLoadingStep] = useState(0);

  const scanMutation = useScanLeaseMutation(
    (data) => {
      router.push({ pathname: "/results", params: { result: JSON.stringify(data) } });
    },
    (error) => {
      alert("Error: " + error.message);
    }
  );

  const steps = [
    { title: "Reading PDF...", icon: "file-text" },
    { title: "Checking London Laws...", icon: "shield-check" },
    { title: "Analyzing Risk Factors...", icon: "alert-triangle" },
    { title: "Generating Report...", icon: "clipboard-list" }
  ];

  useEffect(() => {
    if (!scanMutation.isPending) {
      setLoadingStep(0);
    }
  }, [scanMutation.isPending]);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      
      const file = result.assets[0];
      const base64 = await FileSystem.readAsStringAsync(file.uri, {
        encoding: 'base64',
      });    
      
      console.log(`Uploading PDF: ${file.name} (${Math.round(base64.length / 1024)}KB)`);
      
      scanMutation.mutate({ 
        fileBase64: base64, 
        fileName: file.name,
        onProgress: (step, message) => {
          setLoadingStep(step);
          console.log(`Progress: Step ${step} - ${message}`);
        }
      });
    } catch (err) {
      console.error(err);
      alert("Failed to upload file.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 justify-center items-center p-6">
      <Stack.Screen options={{ headerShown: false }} />
      
      {!scanMutation.isPending ? (
        <>
          <View className="mb-10 items-center">
            <View className="w-20 h-20 bg-blue-600 rounded-3xl items-center justify-center mb-6 shadow-xl shadow-blue-200">
               <FileText color="white" size={40} />
            </View>
            <Text className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">LeaseLens</Text>
            <Text className="text-slate-500 text-center text-lg px-4">
              AI-powered protection for London renters.
            </Text>
          </View>
          
          <TouchableOpacity 
            onPress={pickDocument}
            className="w-full bg-white border border-slate-200 p-8 rounded-3xl shadow-sm items-center active:scale-95 transition-transform"
          >
            <View className="w-16 h-16 bg-blue-50 rounded-full items-center justify-center mb-4">
                <Upload color="#2563EB" size={28} />
            </View>
            <Text className="text-xl font-bold text-slate-900 mb-1">Upload Contract</Text>
            <Text className="text-slate-400 text-sm">Select PDF file to scan</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View className="w-full items-center">
          <View className="w-32 h-32 bg-blue-50 rounded-full items-center justify-center mb-8">
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
          
          <Text className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
            Analyzing Lease
          </Text>
          
          <View className="bg-white border border-slate-100 px-6 py-4 rounded-2xl shadow-sm items-center">
            <Text className="text-blue-600 font-bold text-lg mb-1">
              {steps[loadingStep].title}
            </Text>
            <Text className="text-slate-400 text-xs font-semibold uppercase tracking-widest">
              Step {loadingStep + 1} of {steps.length}
            </Text>
          </View>

          <View className="mt-10 w-full px-6">
            <View className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
               <View 
                className="h-full bg-blue-600 rounded-full" 
                style={{ width: `${((loadingStep + 1) / steps.length) * 100}%` }}
               />
            </View>
          </View>
        </View>
      )}
      
      <View className="mt-12 flex-row space-x-6"> 
        <View className="flex-row items-center">
          <CheckCircle size={16} color="#16a34a" />
          <Text className="ml-2 text-slate-600 font-medium">Instant Analysis</Text>
        </View>
        <View className="flex-row items-center">
          <CheckCircle size={16} color="#16a34a" />
          <Text className="ml-2 text-slate-600 font-medium">London Laws</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
