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
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '@/constants/config';
import { globalState } from '../_globalState';

interface LaporanKeuangan {
  totalPemasukan: number;
  totalPengeluaran: number;
}

interface CabangKos {
  idCabang: number;
  namaCabang: string;
  jumlahKamar: number;
}

interface Kamar {
  id?: number;
  idKamar: number;
  cabang: CabangKos;
  statusKetersediaan: string;
  status?: string;
}

export default function OwnerOverviewScreen() {
  const router = useRouter();
  const [laporan, setLaporan] = useState<LaporanKeuangan>({ totalPemasukan: 0, totalPengeluaran: 0 });
  const [branches, setBranches] = useState<CabangKos[]>([]);
  const [kamars, setKamars] = useState<Kamar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch Laporan
      try {
        const laporanRes = await fetch(`${API_BASE_URL}/laporan/keuangan`, { headers: { 'Authorization': `Bearer ${globalState.token}` } });
        if (laporanRes.ok) {
          const lData = await laporanRes.json();
          if (lData.data) setLaporan(lData.data);
        }
      } catch (err) {
        console.error("Error fetching laporan:", err);
      }

      // Fetch Cabang
      try {
        const branchRes = await fetch(`${API_BASE_URL}/cabang`, { headers: { 'Authorization': `Bearer ${globalState.token}` } });
        if (branchRes.ok) {
          const bData = await branchRes.json();
          if (bData.data) setBranches(bData.data);
        }
      } catch (err) {
        console.error("Error fetching cabang:", err);
      }

      // Fetch Kamar
      try {
        const kamarRes = await fetch(`${API_BASE_URL}/kamar`, { headers: { 'Authorization': `Bearer ${globalState.token}` } });
        if (kamarRes.ok) {
          const kData = await kamarRes.json();
          if (kData.data) setKamars(kData.data);
        }
      } catch (err) {
        console.error("Error fetching kamar:", err);
      }

    } catch (error) {
      console.error("General fetch error:", error);
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

  const totalKamar = branches.reduce((sum, b) => sum + b.jumlahKamar, 0);
  const totalOccupied = kamars.filter(k => (k.statusKetersediaan || k.status || '').toUpperCase() === 'PENUH').length;
  const globalOccupancy = totalKamar > 0 ? Math.round((totalOccupied / totalKamar) * 100) : 0;

  const branchStats = branches.map(b => {
    const bId = b.idCabang;
    const bKamars = kamars.filter(k => k.cabang && ((k.cabang as any).idCabang === bId || (k.cabang as any).id === bId));
    const bOccupied = bKamars.filter(k => (k.statusKetersediaan || k.status || '').toUpperCase() === 'PENUH').length;
    const occRate = b.jumlahKamar > 0 ? Math.round((bOccupied / b.jumlahKamar) * 100) : 0;
    return { ...b, occRate, bOccupied };
  });

  const lowOccupancyBranches = branchStats.filter(b => b.occRate < 70 && b.jumlahKamar > 0);

  return (
    <SafeAreaView className="flex-1 bg-surface pt-4" edges={['top', 'left', 'right']}>

      {/* Top App Bar */}
      <View className="px-6 pb-4 flex-row justify-between items-center z-50">
        <Text className="font-black text-xl text-black tracking-tight">Owner</Text>
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
          <View className="mb-6">
            <Text className="font-black text-[28px] text-on-surface tracking-tight">Ringkasan</Text>
            <Text className="text-on-surface-variant mt-2 text-base">Ringkasan performa finansial dan operasional.</Text>
          </View>

          {/* High-Level Metrics (Bento Grid) */}
          <View className="flex-col gap-4 mb-8">

            {/* Revenue */}
            <View className="rounded-xl overflow-hidden shadow-sm relative">
              <LinearGradient
                colors={['#4f46e5', '#3525cd']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                className="p-6"
              >
                <View className="absolute top-[-20px] right-[-20px] opacity-20">
                  <MaterialIcons name="account-balance-wallet" size={120} color="#ffffff" />
                </View>

                <View className="flex-row justify-between items-start mb-6 relative z-10">
                  <Text className="font-semibold text-white/80 text-base">Total Pemasukan</Text>
                  <MaterialIcons name="trending-up" size={24} color="#ffffff" />
                </View>
                <View className="relative z-10">
                  <Text className="text-[32px] font-extrabold tracking-tight text-white">{formatRupiah(laporan.totalPemasukan)}</Text>
                  <Text className="text-sm mt-1 text-white/80">Bulan Ini</Text>
                </View>
              </LinearGradient>
            </View>

            {/* Occupancy */}
            <View className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/20 shadow-sm flex-col justify-between">
              <View className="flex-row justify-between items-start mb-6">
                <Text className="font-semibold text-on-surface-variant text-base">Total Penghuni</Text>
                <MaterialIcons name="hotel" size={24} color="#464555" />
              </View>
              <View>
                <Text className="text-[32px] font-extrabold text-on-surface">{globalOccupancy}%</Text>
                <View className="w-full bg-surface-container mt-3 h-2 rounded-full overflow-hidden">
                  <View className="bg-[#006b5f] h-full rounded-full" style={{ width: `${globalOccupancy}%` }} />
                </View>
                <Text className="text-sm mt-2 text-on-surface-variant">{totalOccupied} / {totalKamar} Kamar Terisi</Text>
              </View>
            </View>

            {/* Maintenance */}
            <View className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/20 shadow-sm flex-col justify-between">
              <View className="flex-row justify-between items-start mb-6">
                <Text className="font-semibold text-on-surface-variant text-base">Total Pengeluaran</Text>
                <MaterialIcons name="plumbing" size={24} color="#464555" />
              </View>
              <View>
                <Text className="text-[24px] font-extrabold text-on-surface">{formatRupiah(laporan.totalPengeluaran)}</Text>
                <View className="flex-row items-center gap-2 mt-2">
                  <Text className="text-sm text-on-surface-variant">Bulan Ini</Text>
                </View>
              </View>
            </View>

          </View>

          {/* Occupancy by Branch */}
          <View className="mb-8 flex-col gap-4">
            <View className="flex-row justify-between items-end">
              <Text className="font-bold text-[22px] text-on-surface">Okupansi per Cabang</Text>
              <TouchableOpacity onPress={() => router.push('/(owner)/branches' as any)} className="flex-row items-center gap-1">
                <Text className="text-primary text-sm font-semibold">Lihat Semua</Text>
                <MaterialIcons name="chevron-right" size={16} color="#3525cd" />
              </TouchableOpacity>
            </View>

            <View className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/20 shadow-sm flex-col gap-6">
              {branchStats.length > 0 ? branchStats.map(branch => (
                <View key={branch.idCabang}>
                  <View className="flex-row justify-between mb-2">
                    <Text className="font-semibold text-on-surface">{branch.namaCabang}</Text>
                    <Text className="font-semibold text-on-surface">{branch.occRate}%</Text>
                  </View>
                  <View className="w-full bg-surface-container h-3 rounded-full overflow-hidden">
                    <View className="bg-[#006b5f] h-full rounded-full" style={{ width: `${branch.occRate}%` }} />
                  </View>
                </View>
              )) : (
                <Text className="text-center text-on-surface-variant">Belum ada cabang</Text>
              )}
            </View>
          </View>

        </ScrollView>
      )}
    </SafeAreaView>
  );
}
