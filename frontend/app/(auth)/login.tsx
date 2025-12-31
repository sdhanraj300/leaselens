import { useState } from 'react';
import { Alert, StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) Alert.alert(error.message);
    else Alert.alert('Check your inbox for email verification!');
    setLoading(false);
  }

  return (
    <SafeAreaView className="flex-1 bg-white justify-center p-6">
      <Stack.Screen options={{ headerShown: false }} />
      <View className="mb-10">
        <Text className="text-4xl font-extrabold text-slate-900 mb-2">Welcome</Text>
        <Text className="text-slate-500 text-lg">
          {isSignUp ? "Create an account to get started." : "Sign in to continue."}
        </Text>
      </View>

      <View className="space-y-4 mb-6">
        <View>
            <Text className="mb-2 font-medium text-slate-700">Email</Text>
            <TextInput
            className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl"
            onChangeText={setEmail}
            value={email}
            placeholder="john@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            />
        </View>
        <View>
            <Text className="mb-2 font-medium text-slate-700">Password</Text>
            <TextInput
            className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl"
            onChangeText={setPassword}
            value={password}
            secureTextEntry={true}
            placeholder="••••••••"
            autoCapitalize="none"
            />
        </View>
      </View>

      <TouchableOpacity 
        onPress={isSignUp ? signUpWithEmail : signInWithEmail}
        disabled={loading}
        className="w-full bg-blue-600 p-4 rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition-all mb-4"
      >
        {loading ? (
             <ActivityIndicator color="white" />
        ) : (
            <Text className="text-white text-center font-bold text-lg">{isSignUp ? "Sign Up" : "Sign In"}</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
          <Text className="text-center text-slate-500">
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
