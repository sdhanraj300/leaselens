import { Tabs } from 'expo-router';
import { Home, Scan, LogOut } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#2563EB' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'New Scan',
          tabBarIcon: ({ color }) => <Scan size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="results"
        options={{
            href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}
