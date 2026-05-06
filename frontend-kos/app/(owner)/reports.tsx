import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal
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
  
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  // Details State
  const [incomeDetails, setIncomeDetails] = useState<any[]>([]);
  const [expenseDetails, setExpenseDetails] = useState<any[]>([]);
  const [isIncomeModalVisible, setIsIncomeModalVisible] = useState(false);
  const [isExpenseModalVisible, setIsExpenseModalVisible] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const MONTHS = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const fetchData = async (m = selectedMonth, y = selectedYear) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/laporan/keuangan?bulan=${m}&tahun=${y}`, { 
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

  const fetchIncomeDetails = async () => {
    setIsLoadingDetails(true);
    setIsIncomeModalVisible(true);
    try {
      const response = await fetch(`${API_BASE_URL}/transaksi`, { 
        headers: { 'Authorization': `Bearer ${globalState.token}` } 
      });
      const data = await response.json();
      if (data.data) {
        // Filter by selectedMonth and selectedYear
        const filtered = data.data.filter((item: any) => {
          if (!item.tanggalTransaksi) return false;
          const [y, m] = item.tanggalTransaksi.split('-').map(Number);
          return y === selectedYear && m === selectedMonth && item.statusBayar === 'LUNAS';
        });
        setIncomeDetails(filtered);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const fetchExpenseDetails = async () => {
    setIsLoadingDetails(true);
    setIsExpenseModalVisible(true);
    try {
      const response = await fetch(`${API_BASE_URL}/pengeluaran`, { 
        headers: { 'Authorization': `Bearer ${globalState.token}` } 
      });
      const data = await response.json();
      if (data.data) {
        const filtered = data.data.filter((item: any) => {
          if (!item.tanggal) return false;
          const [y, m] = item.tanggal.split('-').map(Number);
          return y === selectedYear && m === selectedMonth;
        });
        setExpenseDetails(filtered);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(number);
  };

  const netProfit = laporan.totalPemasukan - laporan.totalPengeluaran;

  const userInitials = (globalState.namaLengkap || globalState.email || 'O')
    .split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <SafeAreaView className="flex-1 bg-surface pt-4" edges={['top', 'left', 'right']}>
      
      {/* Top App Bar */}
      <View className="px-6 pb-4 flex-row justify-between items-center z-50">
        <View className="flex-row items-center">
          {globalState.foto ? (
            <Image
              source={{ uri: globalState.foto }}
              className="w-10 h-10 rounded-full shadow-sm mr-3"
            />
          ) : (
            <View className="w-10 h-10 rounded-full bg-primary-container items-center justify-center border border-outline-variant/30 mr-3">
              <Text className="text-on-primary-container font-bold text-xs">{userInitials}</Text>
            </View>
          )}
          <Text className="font-black text-2xl text-black tracking-tighter">Owner</Text>
        </View>

        <TouchableOpacity 
          onPress={() => router.push('/notifications' as any)}
          className="p-2 rounded-xl text-indigo-600 active:scale-95"
        >
          <MaterialIcons name="notifications" size={28} color="#464555" />
        </TouchableOpacity>
      </View>
      <View className="bg-surface-container-high/50 h-[1px] w-full" />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        className="px-6 flex-1 mt-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        
        {/* Page Header */}
        <View className="mb-6">
          <Text className="font-black text-[28px] text-on-surface tracking-tight">Laporan Keuangan</Text>
          <Text className="text-on-surface-variant mt-2 text-[15px]">Ringkasan analitik performa finansial kos secara menyeluruh.</Text>
        </View>

        {/* Year Filter (Input Style) */}
        <View className="mb-6">
          <Text className="text-xs font-bold text-primary uppercase tracking-widest mb-3 ml-1">Ketik Tahun</Text>
          <View className="relative justify-center">
            <View className="absolute left-4 z-10">
              <MaterialIcons name="calendar-today" size={20} color="#777587" />
            </View>
            <TextInput
              className="w-full pl-12 pr-4 h-[52px] bg-surface-container-highest rounded-xl text-on-surface font-bold text-lg"
              placeholder="Contoh: 2025"
              keyboardType="numeric"
              maxLength={4}
              value={selectedYear.toString()}
              onChangeText={(text) => {
                const val = parseInt(text);
                if (!isNaN(val)) {
                  setSelectedYear(val);
                } else if (text === '') {
                  setSelectedYear(0); 
                }
              }}
            />
          </View>
        </View>

        {/* Month Filter */}
        <View className="mb-8">
          <Text className="text-xs font-bold text-primary uppercase tracking-widest mb-3 ml-1">Pilih Bulan</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {MONTHS.map((month, index) => {
              const monthNum = index + 1;
              const isActive = selectedMonth === monthNum;
              return (
                <TouchableOpacity
                  key={month}
                  onPress={() => setSelectedMonth(monthNum)}
                  className={`px-5 py-2.5 rounded-full mr-3 border ${isActive ? 'bg-primary border-primary shadow-md' : 'bg-surface-container-low border-outline-variant/30'}`}
                >
                  <Text className={`font-bold text-sm ${isActive ? 'text-white' : 'text-on-surface-variant'}`}>
                    {month}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#4f46e5" className="mt-10" />
        ) : (
          <View className="flex-col mb-8">
            
            {/* Total Revenue */}
            <TouchableOpacity 
              onPress={fetchIncomeDetails}
              activeOpacity={0.8}
              className="bg-surface-container-lowest rounded-xl p-6 relative overflow-hidden shadow-sm border border-outline-variant/20 mb-6"
            >
              <View className="flex-row justify-between items-start mb-4">
                <Text className="text-[15px] text-on-surface-variant font-medium">Total Pemasukan</Text>
                <MaterialIcons name="account-balance-wallet" size={24} color="#4f46e5" />
              </View>
              <Text className="font-extrabold text-[24px] text-on-surface tracking-tight">{formatRupiah(laporan.totalPemasukan)}</Text>
              <View className="mt-2 flex-row justify-between items-center">
                <Text className="text-on-surface-variant text-xs">{MONTHS[selectedMonth-1]} {selectedYear}</Text>
                <Text className="text-primary text-[10px] font-bold uppercase tracking-widest">Lihat Detail →</Text>
              </View>
            </TouchableOpacity>

            {/* Total Expenses */}
            <TouchableOpacity 
              onPress={fetchExpenseDetails}
              activeOpacity={0.8}
              className="bg-surface-container-lowest rounded-xl p-6 relative overflow-hidden shadow-sm border border-outline-variant/20 mb-6"
            >
              <View className="flex-row justify-between items-start mb-4">
                <Text className="text-[15px] text-on-surface-variant font-medium">Total Pengeluaran</Text>
                <MaterialIcons name="receipt-long" size={24} color="#ba1a1a" />
              </View>
              <Text className="font-extrabold text-[24px] text-on-surface tracking-tight">{formatRupiah(laporan.totalPengeluaran)}</Text>
              <View className="mt-2 flex-row justify-between items-center">
                <Text className="text-on-surface-variant text-xs">{MONTHS[selectedMonth-1]} {selectedYear}</Text>
                <Text className="text-[#ba1a1a] text-[10px] font-bold uppercase tracking-widest">Lihat Detail →</Text>
              </View>
            </TouchableOpacity>

            {/* Net Profit */}
            <View className="rounded-xl overflow-hidden shadow-sm">
              <LinearGradient
                colors={['#4f46e5', '#3525cd']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                className="p-6 relative"
              >
                <View className="flex-row justify-between items-start mb-4">
                  <Text className="text-[15px] text-white/80 font-medium">Laba Bersih</Text>
                  <MaterialIcons name="trending-up" size={24} color="#ffffff" />
                </View>
                <Text className="font-extrabold text-[24px] text-white tracking-tight">{formatRupiah(netProfit)}</Text>
                <View className="mt-2 flex-row items-center">
                  <Text className="text-white/70 text-xs ml-1">{MONTHS[selectedMonth-1]} {selectedYear}</Text>
                </View>
              </LinearGradient>
            </View>

          </View>
        )}

      </ScrollView>

      {/* Modal Detail Pemasukan */}
      <Modal visible={isIncomeModalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-surface rounded-t-3xl p-6 shadow-xl h-[80%]">
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="text-xl font-black text-on-surface">Detail Pemasukan</Text>
                <Text className="text-xs text-on-surface-variant mt-1">{MONTHS[selectedMonth-1]} {selectedYear}</Text>
              </View>
              <TouchableOpacity onPress={() => setIsIncomeModalVisible(false)} className="p-2">
                <MaterialIcons name="close" size={24} color="#777587" />
              </TouchableOpacity>
            </View>

            {isLoadingDetails ? (
              <ActivityIndicator color="#4f46e5" size="large" className="mt-10" />
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {incomeDetails.length > 0 ? (
                  incomeDetails.map((item, index) => (
                    <View key={index} className="bg-surface-container-low p-4 rounded-xl mb-3 border border-outline-variant/10">
                      <View className="flex-row justify-between items-center mb-1">
                        <Text className="font-bold text-on-surface">{item.penyewa?.nama || 'Penyewa'}</Text>
                        <Text className="font-black text-primary">{formatRupiah(item.nominal)}</Text>
                      </View>
                      <View className="flex-row justify-between items-center">
                        <Text className="text-[11px] text-on-surface-variant">Kamar {item.kamar?.nomorKamar} • {item.kamar?.cabang?.namaCabang}</Text>
                        <Text className="text-[11px] text-on-surface-variant">{item.tanggalTransaksi}</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <View className="items-center py-10">
                    <MaterialIcons name="money-off" size={48} color="#777587" />
                    <Text className="text-on-surface-variant mt-4 font-medium">Tidak ada data pemasukan</Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal Detail Pengeluaran */}
      <Modal visible={isExpenseModalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-surface rounded-t-3xl p-6 shadow-xl h-[80%]">
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="text-xl font-black text-on-surface">Detail Pengeluaran</Text>
                <Text className="text-xs text-on-surface-variant mt-1">{MONTHS[selectedMonth-1]} {selectedYear}</Text>
              </View>
              <TouchableOpacity onPress={() => setIsExpenseModalVisible(false)} className="p-2">
                <MaterialIcons name="close" size={24} color="#777587" />
              </TouchableOpacity>
            </View>

            {isLoadingDetails ? (
              <ActivityIndicator color="#4f46e5" size="large" className="mt-10" />
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {expenseDetails.length > 0 ? (
                  expenseDetails.map((item, index) => (
                    <View key={index} className="bg-surface-container-low p-4 rounded-xl mb-3 border border-outline-variant/10">
                      <View className="flex-row justify-between items-center mb-1">
                        <Text className="font-bold text-on-surface">{item.kategori}</Text>
                        <Text className="font-black text-[#ba1a1a]">{formatRupiah(item.nominal)}</Text>
                      </View>
                      <Text className="text-xs text-on-surface-variant mb-2">{item.deskripsi}</Text>
                      <View className="flex-row justify-between items-center">
                        <Text className="text-[11px] text-on-surface-variant">{item.cabang?.namaCabang}</Text>
                        <Text className="text-[11px] text-on-surface-variant">{item.tanggal}</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <View className="items-center py-10">
                    <MaterialIcons name="receipt" size={48} color="#777587" />
                    <Text className="text-on-surface-variant mt-4 font-medium">Tidak ada data pengeluaran</Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
