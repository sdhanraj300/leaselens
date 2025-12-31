import "../global.css";
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from "react";
import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '../context/auth';

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (session?.user) {
      const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
      
      if (!isExpoGo) {
        const REVENUECAT_API_KEY = Platform.select({
          ios: process.env.EXPO_PUBLIC_REVENUECAT_APPLE_KEY,
          android: process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY,
        });

        if (REVENUECAT_API_KEY) {
          try {
            // Purchases.configure should only be called once. 
            // We use a safe check if possible or just wrap in try/catch if the SDK throws on re-init.
            // As a best practice, we can track it globally or in a ref.
            Purchases.configure({ apiKey: REVENUECAT_API_KEY, appUserID: session.user.id });
          } catch (e) {
            console.warn("RevenueCat already configured or failed:", e);
          }
        }
      } else {
        console.log("Skipping RevenueCat in Expo Go (Native module not supported)");
      }
    }
    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && (inAuthGroup || !segments.length)) {
      router.replace('/(tabs)');
    }
  }, [session, loading, segments]);
  return <Slot />;
}

export default function Layout() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <RootLayoutNav />
      </QueryClientProvider>
    </AuthProvider>
  );
}
