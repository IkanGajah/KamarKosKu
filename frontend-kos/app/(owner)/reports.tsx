import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE_URL } from '@/constants/config';
import { useRouter } from 'expo-router';
import { globalState } from '../_globalState';

interface LaporanKeuangan {
  totalPemasukan: number;
  totalPengeluaran: number;
}

export default function OwnerReportsScreen() {
  const router = useRouter();
  const [laporan, setLaporan] = useState<LaporanKeuangan>({ totalPemasukan: 0, totalPengeluaran: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/laporan/keuangan`, { 
        headers: { 'Authorization': `Bearer ${globalState.token}` } 
      });
      const data = await response.json();
      if (data.data) {
        setLaporan(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(number);
  };

  const netProfit = laporan.totalPemasukan - laporan.totalPengeluaran;

  return (
    <SafeAreaView className="flex-1 bg-surface pt-4" edges={['top', 'left', 'right']}>
      
      {/* Top App Bar */}
      <View className="px-6 pb-4 flex-row justify-between items-center z-50">
        <Text className="font-black text-xl text-black tracking-tight">KKK Owner</Text>
        <TouchableOpacity 
          onPress={() => router.push('/notifications' as any)}
          className="hover:opacity-80 active:scale-95"
        >
          <MaterialIcons name="notifications" size={28} color="#464555" />
          <View className="absolute top-0 right-0 w-3 h-3 bg-[#ba1a1a] rounded-full border-2 border-surface" />
        </TouchableOpacity>
      </View>
      <View className="bg-surface-container-high/50 h-[1px] w-full" />

      {isLoading ? (
        <ActivityIndicator size="large" color="#4f46e5" className="mt-10" />
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          className="px-6 flex-1 mt-4"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          
          {/* Page Header */}
          <View className="mb-8">
            <Text className="font-black text-[28px] text-on-surface tracking-tight">Laporan Keuangan</Text>
            <Text className="text-on-surface-variant mt-2 text-[15px]">Ringkasan analitik performa finansial kos secara menyeluruh.</Text>
          </View>

          {/* Metric Cards */}
          <View className="flex-col gap-6 mb-8">
            
            {/* Total Revenue */}
            <View className="bg-surface-container-lowest rounded-xl p-6 relative overflow-hidden shadow-sm border border-outline-variant/20">
              <View className="flex-row justify-between items-start mb-4">
                <Text className="text-[15px] text-on-surface-variant">Total Pemasukan</Text>
                <MaterialIcons name="account-balance-wallet" size={24} color="#4f46e5" />
              </View>
              <Text className="font-extrabold text-[20px] text-on-surface tracking-tight">{formatRupiah(laporan.totalPemasukan)}</Text>
              <View className="mt-2 flex-row items-center">
                <Text className="text-on-surface-variant text-xs ml-1">Bulan Ini</Text>
              </View>
            </View>

            {/* Total Expenses */}
            <View className="bg-surface-container-lowest rounded-xl p-6 relative overflow-hidden shadow-sm border border-outline-variant/20">
              <View className="flex-row justify-between items-start mb-4">
                <Text className="text-[15px] text-on-surface-variant">Total Pengeluaran</Text>
                <MaterialIcons name="receipt-long" size={24} color="#ba1a1a" />
              </View>
              <Text className="font-extrabold text-[20px] text-on-surface tracking-tight">{formatRupiah(laporan.totalPengeluaran)}</Text>
              <View className="mt-2 flex-row items-center">
                <Text className="text-on-surface-variant text-xs ml-1">Bulan Ini</Text>
              </View>
            </View>

            {/* Net Profit */}
            <View className="rounded-xl overflow-hidden shadow-sm">
              <LinearGradient
                colors={['#4f46e5', '#3525cd']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                className="p-6 relative"
              >
                <View className="flex-row justify-between items-start mb-4">
                  <Text className="text-[15px] text-white/80">Laba Bersih</Text>
                  <MaterialIcons name="trending-up" size={24} color="#ffffff" />
                </View>
                <Text className="font-extrabold text-[20px] text-white tracking-tight">{formatRupiah(netProfit)}</Text>
                <View className="mt-2 flex-row items-center">
                  <Text className="text-white/70 text-xs ml-1">Bulan Ini</Text>
                </View>
              </LinearGradient>
            </View>

          </View>

        </ScrollView>
      )}
    </SafeAreaView>
  );
}
