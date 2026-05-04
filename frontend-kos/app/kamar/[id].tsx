import React, { useState, useEffect } from 'react';
import { Text, View, ActivityIndicator, TouchableOpacity, StatusBar, Image, ScrollView, Dimensions, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

import { Kamar } from '@/types/types';
import { API_BASE_URL } from '@/constants/config';

const { width } = Dimensions.get('window');

const MOCK_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBXZq1QRrbtKy3jJiqPi_DvjSSD7s6HUKuaN0C36Nvh5t6zqxmDkF3lKkFN2a_ND_cfhozQpGzztth9NCgGPpR_w4Gv_9lE0cLuaW-pSvJxD8p3YmXriK7-Nl28W6gaFpIriU9J6lUIU_NNKNU0u-nfIhn0ZhCW8U9jFQkUkY96tNrcth4xJH-90i-SNwvYt96wjY1U70Tb7hBCC-hqC4-l-zSXS7dbgs1lz5VgczJSVbEMvGfyC0Qb1SOsAZl9k7TM8NeDeqwbGP8",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCK2USxE6VKzFXonzNOEaHTH8iZU7qchm9dLjLzUrM1nklP-nfTP_77QS8m23MIdMWGWdpAkpYz-sLdXfgftrXrvHA-G_7P7Y5YPk65QL_0rE6GixEK4zknpSOgSpjaXyjFiyn7d6rOvjF4nqa1tuc1YBLl0DM3pXRPluGaU4HjSMf2IjKW_tHWCQ1jgiCQdhruHGE9Ev9w8o0oz9ovtoeaQkn9Ce_BlMmpdoOyEiN87XNLkX2U64hEkOKAxWhsZVJorS0j7_TM4W0"
];
export default function DetailKamarScreen() {
  const { id, guest } = useLocalSearchParams();
  const router = useRouter();

  const [kamar, setKamar] = useState<Kamar | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const FALLBACK_LIST: Kamar[] = [
    { id: 1, nomorKamar: "101", status: "Tersedia", fasilitas: "AC, WiFi, KM Dalam, Lemari, Meja Belajar, Kasur Queen Size", harga: 1200000 },
    { id: 2, nomorKamar: "102", status: "Tersedia", fasilitas: "Kipas Angin, KM Luar, Lemari, Meja Belajar", harga: 800000 },
    { id: 3, nomorKamar: "201", status: "Penuh", fasilitas: "AC, WiFi, KM Dalam, Balkon Pribadi", harga: 1500000 },
  ];

  const API_URL = `${API_BASE_URL}/kamar/${id}`;

  useEffect(() => {
    fetchDetailKamar();
  }, [id]);

  const fetchDetailKamar = async () => {
    try {
      const response = await fetch(API_URL);
      const json = await response.json();
      if (json.data) {
        setKamar(json.data);
      } else {
        const dummy = FALLBACK_LIST.find(k => k.id === Number(id)) || FALLBACK_LIST[0];
        setKamar(dummy);
      }
    } catch (error) {
      console.error(error);
      const dummy = FALLBACK_LIST.find(k => k.id === Number(id)) || FALLBACK_LIST[0];
      setKamar(dummy);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setActiveImageIndex(Math.round(index));
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-surface">
        <ActivityIndicator size="large" color="#3525cd" />
        <Text className="mt-4 text-on-surface-variant font-medium">Memuat data kamar...</Text>
      </View>
    );
  }

  if (!kamar) {
    return (
      <View className="flex-1 justify-center items-center bg-surface">
        <Text className="text-error font-bold text-lg">Kamar tidak ditemukan</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-primary px-6 py-2 rounded-xl">
          <Text className="text-on-primary font-bold">Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isAvailable = kamar.status?.toUpperCase() === 'TERSEDIA';

  const handleSewa = () => {
    if (guest === 'true') {
      import('react-native').then(({ Alert }) => {
        Alert.alert("Belum Login", "Anda harus login terlebih dahulu untuk menyewa kamar.", [
          { text: "Batal", style: "cancel" },
          { text: "Login", onPress: () => router.push('/login') }
        ]);
      });
    } else {
      router.push({
        pathname: '/kamar/checkout',
        params: {
          roomId: kamar.id,
          roomNumber: kamar.nomorKamar,
          price: kamar.harga
        }
      });
    }
  };

  return (
    <View className="flex-1 bg-surface">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Top Navigation */}
      <View
        className="absolute top-0 w-full z-50 flex-row justify-between items-center px-6 pt-12 pb-4"
        style={{ backgroundColor: 'rgba(255,255,255,0.6)' }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-surface-container-highest/80 backdrop-blur-md active:scale-95"
        >
          <MaterialIcons name="arrow-back" size={24} color="#464555" />
        </TouchableOpacity>
        <Text className="font-black text-xl text-primary tracking-tight">KosKu</Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Image Gallery */}
        <View className="w-full h-[400px] relative">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            className="w-full h-full"
          >
            {MOCK_IMAGES.map((img, index) => (
              <View key={index} style={{ width, height: 400 }}>
                <Image
                  source={{ uri: img }}
                  className="w-full h-full object-cover"
                />
              </View>
            ))}
          </ScrollView>
          {/* Pagination Dots */}
          <View className="absolute bottom-8 left-0 w-full flex-row justify-center gap-2">
            {MOCK_IMAGES.map((_, index) => (
              <View
                key={index}
                className={`h-2 rounded-full transition-all ${index === activeImageIndex ? 'w-4 bg-primary' : 'w-2 bg-surface-container-highest opacity-70'}`}
              />
            ))}
          </View>
        </View>

        {/* Room Header & Status */}
        <View className="px-6 py-6 bg-surface-container-lowest rounded-t-3xl -mt-6 relative z-10 shadow-sm">
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-3xl font-black text-on-surface tracking-tight">
              Kamar {kamar.nomorKamar}
            </Text>
            <View className={`px-3 py-1.5 rounded-full flex-row items-center gap-1 ${isAvailable ? 'bg-secondary-container' : 'bg-surface-variant'}`}>
              <MaterialIcons name={isAvailable ? "check-circle" : "event-busy"} size={16} color={isAvailable ? "#006f64" : "#464555"} />
              <Text className={`text-sm font-bold ${isAvailable ? 'text-on-secondary-container' : 'text-on-surface-variant'}`}>
                {kamar.status}
              </Text>
            </View>
          </View>

          {/* Price Display */}
          <View className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/30 flex-row items-center justify-between">
            <View>
              <Text className="text-xs text-on-surface-variant font-bold uppercase tracking-wider mb-1">Harga Sewa</Text>
              <Text className="text-2xl font-extrabold text-on-surface tracking-tight">
                Rp {(kamar?.harga || 0).toLocaleString('id-ID')} <Text className="text-sm font-medium text-on-surface-variant">/ bulan</Text>
              </Text>
            </View>
          </View>

          {/* If Rented (Not Available) */}
          {!isAvailable && (
            <View className="bg-error-container/30 p-5 rounded-2xl border border-error/10 mt-4">
              <View className="mb-3">
                <Text className="text-xs text-on-surface-variant font-bold uppercase mb-1">Disewa Oleh</Text>
                <Text className="text-base font-bold text-on-surface">
                  {kamar.namaPenyewa ? kamar.namaPenyewa : "Data tidak tersedia"}
                </Text>
              </View>
              <View>
                <Text className="text-xs text-on-surface-variant font-bold uppercase mb-1">Jatuh Tempo Bayar</Text>
                <Text className="text-base font-bold text-error">
                  {kamar.tempoBayar ? kamar.tempoBayar : "-"}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Fasilitas Section (Bento Style) */}
        <View className="px-6 py-4">
          <Text className="text-xl font-bold text-on-surface mb-4">Fasilitas Kamar</Text>
          <View className="flex-row flex-wrap justify-between">
            {/* Box 1 - Dynamic AC/Non-AC */}
            <View className="w-[31%] aspect-square bg-surface-container-lowest p-3 rounded-2xl flex-col items-center justify-center border border-outline-variant/30 shadow-sm mb-3">
              <MaterialIcons
                name={kamar.fasilitas && /\bAC\b/i.test(kamar.fasilitas) ? "ac-unit" : "air"}
                size={28}
                color="#3525cd"
                className="mb-2"
              />
              <Text className="text-xs font-semibold text-on-surface-variant text-center">
                {kamar.fasilitas && /\bAC\b/i.test(kamar.fasilitas) ? 'AC' : 'Non-AC'}
              </Text>
            </View>
            {/* Box 2 */}
            <View className="w-[31%] aspect-square bg-surface-container-lowest p-3 rounded-2xl flex-col items-center justify-center border border-outline-variant/30 shadow-sm mb-3">
              <MaterialIcons name="wifi" size={28} color="#3525cd" className="mb-2" />
              <Text className="text-xs font-semibold text-on-surface-variant text-center">WiFi</Text>
            </View>
            {/* Box 3 */}
            <View className="w-[31%] aspect-square bg-surface-container-lowest p-3 rounded-2xl flex-col items-center justify-center border border-outline-variant/30 shadow-sm mb-3">
              <MaterialIcons name="shower" size={28} color="#3525cd" className="mb-2" />
              <Text className="text-[10px] font-semibold text-on-surface-variant text-center">K. Mandi Dalam</Text>
            </View>
            {/* Box 4 */}
            <View className="w-[31%] aspect-square bg-surface-container-lowest p-3 rounded-2xl flex-col items-center justify-center border border-outline-variant/30 shadow-sm mb-3">
              <MaterialIcons name="bed" size={28} color="#3525cd" className="mb-2" />
              <Text className="text-[10px] font-semibold text-on-surface-variant text-center">Kasur Springbed</Text>
            </View>
            {/* Box 5 */}
            <View className="w-[31%] aspect-square bg-surface-container-lowest p-3 rounded-2xl flex-col items-center justify-center border border-outline-variant/30 shadow-sm mb-3">
              <MaterialIcons name="kitchen" size={28} color="#3525cd" className="mb-2" />
              <Text className="text-[10px] font-semibold text-on-surface-variant text-center">Lemari Pakaian</Text>
            </View>
            {/* Box 6 */}
            <View className="w-[31%] aspect-square bg-surface-container-lowest p-3 rounded-2xl flex-col items-center justify-center border border-outline-variant/30 shadow-sm mb-3">
              <MaterialIcons name="desk" size={28} color="#3525cd" className="mb-2" />
              <Text className="text-xs font-semibold text-on-surface-variant text-center">Meja Belajar</Text>
            </View>
          </View>
        </View>

        {/* Deskripsi Tambahan */}
        <View className="px-6 py-2 mb-8">
          <Text className="text-xl font-bold text-on-surface mb-3">Deskripsi</Text>
          <View className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-sm">
            <Text className="text-base text-on-surface-variant leading-relaxed">
              Kamar luas dan nyaman dengan pencahayaan alami yang baik. Terletak di lantai 1 sehingga mudah diakses. Cocok untuk mahasiswa atau karyawan yang mencari ketenangan. Fasilitas tambahan: {kamar.fasilitas}.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Action Area */}
      <View
        className="absolute bottom-0 w-full bg-surface-container-lowest border-t border-outline-variant/20 px-6 pt-4 pb-8"
        style={Platform.OS === 'android' ? { elevation: 8 } : { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 12 }}
      >
        <TouchableOpacity
          onPress={handleSewa}
          className={`w-full h-14 rounded-xl flex-row items-center justify-center gap-2 active:scale-95 ${isAvailable ? 'bg-primary' : 'bg-surface-variant'}`}
          disabled={!isAvailable}
        >
          <Text className={`font-bold text-lg ${isAvailable ? 'text-on-primary' : 'text-on-surface-variant'}`}>
            {isAvailable ? 'Sewa Kamar Ini' : 'Kamar Tidak Tersedia'}
          </Text>
          {isAvailable && <MaterialIcons name="arrow-forward" size={22} color="#ffffff" />}
        </TouchableOpacity>
      </View>
    </View>
  );
}