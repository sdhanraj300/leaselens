import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { X, CreditCard, Sparkles, ShieldCheck, AlertCircle, Wand2 } from 'lucide-react-native';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { API_URL } from '../lib/api';
import { useAuth } from '../context/auth';

interface TopUpModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function TopUpModal({ visible, onClose, onSuccess }: TopUpModalProps) {
    const { session } = useAuth();
    const [packages, setPackages] = useState<PurchasesPackage[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

    useEffect(() => {
        if (visible) {
            fetchOfferings();
        }
    }, [visible]);

    const fetchOfferings = async () => {
        if (isExpoGo) {
            setFetching(false);
            return;
        }

        try {
            setFetching(true);
            const offerings = await Purchases.getOfferings();
            if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
                setPackages(offerings.current.availablePackages);
            }
        } catch (e: any) {
            console.error("Error fetching offerings:", e);
            Alert.alert("Error", "Could not fetch payment options. Please try again later.");
        } finally {
            setFetching(false);
        }
    };

    const handlePurchase = async (pack: PurchasesPackage) => {
        try {
            setLoading(true);
            const { customerInfo } = await Purchases.purchasePackage(pack);
            Alert.alert("Success", "Your purchase was successful! Credits will appear in your account shortly.");
            if (onSuccess) onSuccess();
            onClose();
        } catch (e: any) {
            if (!e.userCancelled) {
                console.error("Purchase error:", e);
                Alert.alert("Error", e.message || "Purchase failed");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleMockPurchase = async () => {
        if (!session?.user?.id) return;
        
        try {
            setLoading(true);
            // We call our own backend webhook directly to simulate a successful purchase
            const response = await fetch(`${API_URL}/api/payments/webhook`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event: {
                        type: 'NON_RENEWING_PURCHASE',
                        app_user_id: session.user.id,
                        product_id: 'leaselens_10_scans'
                    }
                })
            });

            if (response.ok) {
                Alert.alert("Test Success", "Mock purchase successful! Credits have been added to your local account.");
                if (onSuccess) onSuccess();
                onClose();
            } else {
                throw new Error("Mock payment failed");
            }
        } catch (e) {
            console.error("Mock purchase error:", e);
            Alert.alert("Error", "Could not process mock payment.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/50">
                <View className="bg-white rounded-t-[40px] p-8 pb-12 shadow-2xl">
                    <View className="flex-row justify-between items-center mb-6">
                        <View>
                            <Text className="text-2xl font-black text-slate-900">Buy Credits</Text>
                            <Text className="text-slate-500">Pick a package to get started</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} className="bg-slate-100 p-2 rounded-full">
                            <X size={20} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    {fetching ? (
                        <View className="py-20 items-center">
                            <ActivityIndicator size="large" color="#2563EB" />
                            <Text className="mt-4 text-slate-400 font-medium">Fetching options...</Text>
                        </View>
                    ) : isExpoGo ? (
                        <View>
                            <View className="bg-amber-50 rounded-3xl border border-amber-100 p-6 mb-6">
                                <View className="flex-row items-center mb-2">
                                    <AlertCircle color="#D97706" size={20} />
                                    <Text className="text-amber-800 font-bold ml-2">Developer Test Mode</Text>
                                </View>
                                <Text className="text-amber-600 text-xs">
                                    Native IAP is disabled in Expo Go. You can use this mock button to test your backend credit system locally.
                                </Text>
                            </View>

                            <TouchableOpacity
                                onPress={handleMockPurchase}
                                disabled={loading}
                                className="bg-blue-600 p-6 rounded-3xl flex-row items-center shadow-lg shadow-blue-200"
                            >
                                <View className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center mr-4">
                                    <Wand2 color="white" size={24} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-white text-lg font-bold">10 Test Scans (MOCK)</Text>
                                    <Text className="text-blue-100 text-sm">Add credits instantly for testing</Text>
                                </View>
                                <View className="bg-white/20 px-4 py-2 rounded-xl">
                                    <Text className="text-white font-bold">FREE</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <ScrollView className="max-h-[400px]" showsVerticalScrollIndicator={false}>
                            {packages.length === 0 ? (
                                <View className="py-10 items-center">
                                    <Text className="text-slate-400 text-center">No packages available at the moment.</Text>
                                </View>
                            ) : (
                                packages.map((pkg) => (
                                    <TouchableOpacity
                                        key={pkg.identifier}
                                        onPress={() => handlePurchase(pkg)}
                                        disabled={loading}
                                        className="bg-slate-50 border border-slate-100 p-5 rounded-3xl mb-4 flex-row items-center active:bg-blue-50 transition-colors"
                                    >
                                        <View className="w-12 h-12 bg-blue-100 rounded-2xl items-center justify-center mr-4">
                                            <Sparkles color="#2563EB" size={24} />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-lg font-bold text-slate-900">{pkg.product.title}</Text>
                                            <Text className="text-slate-500 text-sm" numberOfLines={1}>{pkg.product.description}</Text>
                                        </View>
                                        <View className="bg-blue-600 px-4 py-2 rounded-xl">
                                            <Text className="text-white font-bold">{pkg.product.priceString}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))
                            )}
                        </ScrollView>
                    )}

                    <View className="mt-8 pt-6 border-t border-slate-100 flex-row justify-center items-center">
                        <ShieldCheck size={16} color="#94a3b8" />
                        <Text className="ml-2 text-slate-400 text-xs text-center">
                            {isExpoGo ? "Currently in local development mode." : "Secured by App Store / Google Play. One-time purchase."}
                        </Text>
                    </View>

                    {loading && (
                        <View className="absolute inset-0 bg-white/80 items-center justify-center rounded-t-[40px]">
                            <ActivityIndicator size="large" color="#2563EB" />
                            <Text className="mt-4 font-bold text-slate-900">Processing...</Text>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}
