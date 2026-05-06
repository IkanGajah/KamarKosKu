import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '@/constants/config';
import { Kamar } from '@/types/types';

const MOCK_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDxqro65wdqMJCGELbpTK2HPlNmzKiEwWj-175Ry_62ZyjHbh69ufz3Ui3mdnwCZ-wf2rD3csCqmLrvpdAQK5qrs8EFmKY63gUJWw09rdFdgembiQCkdBqIdEIMYb5Cnr-_FLQvaLKcN2Cxduy839CZ11uXEHIjX9gJQZQo9KXtlKm16o2xDAOzzOWdw8z2hBAxHEK0MswcAu6-tbgt7VAQcIgkquHOQHTER2LcngeE3Gw868DmomyNNSk0Ny7lWizBVAJRygj_LC8",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCnaIDLGyfCnAhE6WcKF-nnmJyZZEtdT8SPEF9rAl906E8AvQhSRWALAS2xqnzpC4TufkgssCQ_uz55-X9rgfIvTknB9tRcIzBRc4GliNDvsBelN2tTSXCyrXZJMUlFPrVWTSbjsGMCzRvqsXSi8b3UCG9eQxnv3ZERTgjCqVFMIe1ywpJZcNAfRiuLoxt7w7g1XOVlNMM1HwcCkgdztoVkLthHRKQodThFKxPNAdYtjhY0tQRh9PCelKqWb8YE9Wxx8KisGRyqN_I",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBzBZ-XRGDxmwRJAiOwBJJxiKFYOF3zKNO6yb5FwojhMAa3G2jZCn018YL1_aMbLtTJWphhfBXUq3ZoHOMfAJi6vTASJzuvPa142aScLBJpUyWq6UQZN1mppNP45l7h_95qr-k3P_pS6xVl58_lT66f0PIrWsemwQoBYSMmfNytJrEilYtdF2iFlHD7fZDPgx6vcl8tWVdG14bOzQdsoPFZLwV0h6aTu21KlgStWh8i-0BCYrVp-npXAuW2JMwYlu9Lvg8AzxsOeFQ"
];

export default function GuestHomeScreen() {
  const router = useRouter();
  const [kamar, setKamar] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Re-fetch kamar saat cabang dipilih atau di-reset (skip saat initial load)
  useEffect(() => {
    if (isInitialLoad) return;
    const branchId = selectedBranch ? (selectedBranch.idCabang || selectedBranch.id) : undefined;
    fetchKamar(branchId);
  }, [selectedBranch]);

  const fetchInitialData = async () => {
    setLoading(true);
    setBranchesLoading(true);
    await fetchBranches();
    await fetchKamar();
    setIsInitialLoad(false);
    setLoading(false);
  };

  const fetchBranches = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cabang`);
      console.log("[Cabang] HTTP Status:", response.status);
      if (!response.ok) {
        console.error("[Cabang] Gagal fetch, status:", response.status);
        return;
      }
      const text = await response.text();
      if (!text || text.trim() === "") return;
      const json = JSON.parse(text);
      console.log("[Cabang] Data:", json);
      if (json.data && Array.isArray(json.data)) {
        setBranches(json.data);
      }
    } catch (e) {
      console.error("[Cabang] Error:", e);
    } finally {
      setBranchesLoading(false);
    }
  };

  const fetchKamar = async (branchId?: number) => {
    try {
      const url = branchId ? `${API_BASE_URL}/kamar/cabang/${branchId}` : `${API_BASE_URL}/kamar`;
      const response = await fetch(url);
      const text = await response.text();
      if (!text || text.trim() === "") return;

      const json = JSON.parse(text);
      if (json.data && Array.isArray(json.data)) {
        setKamar(json.data);
      }
    } catch (error) {
      console.error("[Kamar] Error:", error);
    }
  };

  const handleBranchSelect = (branch: any) => {
    const branchId = branch.idCabang || branch.id;
    const currentSelectedId = selectedBranch ? (selectedBranch.idCabang || selectedBranch.id) : null;

    if (branchId === currentSelectedId) {
      setSelectedBranch(null);
    } else {
      setSelectedBranch(branch);
    }
  };

  // Map Kamar API to display format
  const getDisplayData = (k: any, index: number) => {
    const rawHarga = k.harga ?? k.hargaSewa ?? 0;
    const numHarga = Number(rawHarga);

    return {
      id: (k.id || k.idKamar)?.toString(),
      name: `Kamar ${k.nomorKamar || ''}`,
      price: isNaN(numHarga) ? 'Rp 0.0jt' : `Rp ${(numHarga / 1000000).toFixed(1)}jt`,
      location: k.cabang?.alamat || 'Lokasi Kos',
      rating: 4.8,
      image: MOCK_IMAGES[index % MOCK_IMAGES.length],
      facilities: k.fasilitas ? k.fasilitas.split(',').slice(0, 3) : [],
      available: (k.status || k.statusKetersediaan) === 'TERSEDIA' ? 1 : 0,
      type: k.cabang?.namaCabang,
      originalHarga: numHarga
    };
  };

  const filteredKamar = kamar.filter(item => {
    // 1. Branch Filter (Client-side fallback)
    if (selectedBranch) {
      const selectedId = selectedBranch.idCabang || selectedBranch.id;
      const itemId = item.cabang?.idCabang || item.cabang?.id;
      if (itemId !== selectedId) return false;
    }

    // 2. Search Filter
    const matchesSearch = item.nomorKamar?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.fasilitas && item.fasilitas.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.cabang?.namaCabang && item.cabang.namaCabang.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.cabang?.alamat && item.cabang.alamat.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // 3. Category Filter
    if (activeFilter === 'Semua') return true;
    if (activeFilter === 'Tersedia') return (item.status || item.statusKetersediaan)?.toUpperCase() === 'TERSEDIA';
    if (activeFilter === '< 1jt') return (item.harga || item.hargaSewa || 0) < 1000000;
    if (activeFilter === 'AC') return item.fasilitas && /\bAC\b/i.test(item.fasilitas);

    return true;
  });

  const filteredBranches = branches.filter(branch =>
    branch.namaCabang?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    branch.alamat?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayData = filteredKamar.map((k, index) => getDisplayData(k, index));
  const REKOMENDASI = displayData.slice(0, 2);
  const JELAJAHI = displayData.slice(2);

  return (
    <SafeAreaView className="flex-1 bg-surface pt-4" edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />

      {/* Header Section for Guest */}
      <View className="px-6 pb-4 flex-row justify-between items-center z-50">
        <View>
          <Text className="text-primary font-black text-2xl tracking-tight">Kamar Kos Ku</Text>
          <Text className="text-on-surface-variant text-xs font-medium">Temukan hunian impianmu</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/login')}
          className="bg-primary px-4 py-2 rounded-full shadow-sm"
        >
          <Text className="text-on-primary font-bold text-xs">Masuk</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >

        {/* Search & Filters */}
        <View className="px-4 mt-2">
          <View className="flex-row gap-3">
            <View className="flex-1 relative justify-center">
              <View className="absolute left-4 z-10">
                <MaterialIcons name="search" size={22} color="#777587" />
              </View>
              <TextInput
                className="w-full h-[52px] pl-12 pr-4 rounded-xl bg-surface-container-highest text-on-surface"
                placeholder="Cari lokasi, nama kos..."
                placeholderTextColor="#777587"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* Cabang Section */}
          <View className="mt-6">
            <View className="flex-row justify-between items-end mb-4">
              <View>
                <Text className="text-on-surface font-bold text-lg">Pilih Cabang</Text>
                <Text className="text-outline text-xs">Lokasi kos yang tersedia</Text>
              </View>
              {selectedBranch && (
                <TouchableOpacity onPress={() => setSelectedBranch(null)}>
                  <Text className="text-primary font-bold text-xs">Lihat Semua</Text>
                </TouchableOpacity>
              )}
            </View>

            {branchesLoading ? (
              // Skeleton loading untuk cabang
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingRight: 20 }}>
                {[1, 2, 3].map((i) => (
                  <View key={i} className="w-40 bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant/10">
                    <View className="h-24 bg-surface-container-high" />
                    <View className="p-3 gap-2">
                      <View className="h-3 bg-surface-container-high rounded w-3/4" />
                      <View className="h-2 bg-surface-container-high rounded w-1/2" />
                    </View>
                  </View>
                ))}
              </ScrollView>
            ) : branches.length === 0 ? (
              // Fallback jika API cabang tidak bisa diakses
              <View className="py-4 px-2">
                <Text className="text-outline text-sm">Data cabang tidak tersedia saat ini.</Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingRight: 20 }}>
                {filteredBranches.map((branch, index) => {
                  const bId = branch.idCabang || branch.id;
                  const isSelected = selectedBranch && (selectedBranch.idCabang || selectedBranch.id) === bId;

                  const availableCount = kamar.filter(k =>
                    (k.cabang?.idCabang === bId || k.cabang?.id === bId) &&
                    (k.status || k.statusKetersediaan) === 'TERSEDIA'
                  ).length;

                  return (
                    <TouchableOpacity
                      key={bId || index}
                      onPress={() => handleBranchSelect(branch)}
                      className={`w-40 bg-surface-container-low rounded-2xl overflow-hidden border ${isSelected ? 'border-primary' : 'border-outline-variant/10'}`}
                    >
                      <View className="h-24 bg-surface-container-high relative">
                        <Image
                          source={{ uri: branch.foto || MOCK_IMAGES[index % MOCK_IMAGES.length] }}
                          className="w-full h-full"
                        />
                        <View className="absolute inset-0 bg-black/10" />
                        <View className="absolute top-2 left-2 px-2 py-1 bg-error-container rounded-full flex-row items-center">
                          <Text className="text-on-error-container text-[10px] font-bold">Sisa {availableCount} Kamar</Text>
                        </View>
                      </View>
                      <View className="p-3">
                        <Text className="font-bold text-on-surface text-sm" numberOfLines={1}>{branch.namaCabang}</Text>
                        <View className="flex-row items-center gap-1 mt-1">
                          <MaterialIcons name="location-on" size={12} color="#777587" />
                          <Text className="text-[10px] text-outline flex-1" numberOfLines={1}>{branch.alamat}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>

          {/* Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4" contentContainerStyle={{ gap: 12, paddingRight: 20 }}>
            <TouchableOpacity
              onPress={() => setActiveFilter('Semua')}
              className={`px-5 py-2.5 rounded-full shadow-sm ${activeFilter === 'Semua' ? 'bg-tertiary-container' : 'bg-surface-container-lowest border border-outline-variant/20'}`}
            >
              <Text className={`font-medium text-sm ${activeFilter === 'Semua' ? 'text-on-tertiary-container' : 'text-on-surface-variant'}`}>Semua</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveFilter('Tersedia')}
              className={`px-5 py-2.5 rounded-full shadow-sm ${activeFilter === 'Tersedia' ? 'bg-tertiary-container' : 'bg-surface-container-lowest border border-outline-variant/20'}`}
            >
              <Text className={`font-medium text-sm ${activeFilter === 'Tersedia' ? 'text-on-tertiary-container' : 'text-on-surface-variant'}`}>Tersedia</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveFilter('< 1jt')}
              className={`px-5 py-2.5 rounded-full shadow-sm ${activeFilter === '< 1jt' ? 'bg-tertiary-container' : 'bg-surface-container-lowest border border-outline-variant/20'}`}
            >
              <Text className={`font-medium text-sm ${activeFilter === '< 1jt' ? 'text-on-tertiary-container' : 'text-on-surface-variant'}`}>&lt; 1jt</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveFilter('AC')}
              className={`px-5 py-2.5 rounded-full shadow-sm ${activeFilter === 'AC' ? 'bg-tertiary-container' : 'bg-surface-container-lowest border border-outline-variant/20'}`}
            >
              <Text className={`font-medium text-sm ${activeFilter === 'AC' ? 'text-on-tertiary-container' : 'text-on-surface-variant'}`}>AC</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#3525cd" className="mt-10" />
        ) : (
          <>
            {REKOMENDASI.length > 0 && (
              <View className="mt-8 px-4">
                <View className="bg-surface-container-low rounded-[24px] p-5 relative overflow-hidden">
                  <Text className="font-bold text-[22px] text-on-surface mb-5">
                    {selectedBranch ? `Rekomendasi di ${selectedBranch.namaCabang}` : 'Rekomendasi Untukmu'}
                  </Text>

                  <View className="gap-5">
                    {REKOMENDASI.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => router.push(`/kamar/${item.id}?guest=true` as any)}
                        className={`bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm flex-row h-[160px] ${!item.available ? 'opacity-80' : ''}`}
                      >
                        <View className="w-[140px] h-full relative">
                          <Image source={{ uri: item.image }} className="w-full h-full" resizeMode="cover" />
                          {!item.available && (
                            <View className="absolute inset-0 bg-black/50 w-full h-full flex items-center justify-center">
                              <View className="bg-black/80 px-4 py-2 rounded-md border border-white/20">
                                <Text className="text-white font-bold text-xs uppercase tracking-widest">Penuh</Text>
                              </View>
                            </View>
                          )}
                          <View className="absolute top-2 left-2 px-2 py-1 bg-white/90 rounded-full flex-row items-center gap-1">
                            <MaterialIcons name="star" size={12} color="#3525cd" />
                            <Text className="text-primary text-[10px] font-bold">{item.rating}</Text>
                          </View>
                        </View>

                        <View className="flex-1 p-3 justify-between">
                          <View>
                            <View className="flex-row justify-between items-start mb-1">
                              <View className="px-1.5 py-0.5 bg-surface-container rounded">
                                <Text className="text-[8px] font-bold text-on-surface-variant uppercase">{item.type}</Text>
                              </View>
                            </View>
                            <Text className="font-bold text-base text-on-surface mb-1" numberOfLines={1}>{item.name}</Text>
                            <Text className="text-xs text-on-surface-variant mb-2">
                              <MaterialIcons name="location-on" size={12} /> {item.location}
                            </Text>
                            <View className="flex-row flex-wrap gap-1">
                              {item.facilities.map((fac: string, i: number) => (
                                <View key={i} className="px-1.5 py-0.5 bg-surface-container rounded flex-row items-center gap-1">
                                  <Text className="text-[9px] text-on-surface-variant">{fac.trim()}</Text>
                                </View>
                              ))}
                            </View>
                          </View>

                          <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-surface-container-high">
                            <Text className="text-on-surface font-bold text-sm">Rp {(item.originalHarga).toLocaleString('id-ID')}<Text className="text-[9px] font-normal text-on-surface-variant">/bln</Text></Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {JELAJAHI.length > 0 && (
              <View className="mt-8 px-4">
                <Text className="font-bold text-[22px] text-on-surface mb-5">Jelajahi Lebih Banyak</Text>
                <View className="flex-row flex-wrap justify-between">
                  {JELAJAHI.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => router.push(`/kamar/${item.id}?guest=true` as any)}
                      className={`w-[48%] bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm mb-4 border border-outline-variant/20 ${!item.available ? 'opacity-80' : ''}`}
                    >
                      <View className="h-32 relative">
                        <Image source={{ uri: item.image }} className="w-full h-full" resizeMode="cover" />
                        {!item.available && (
                          <View className="absolute inset-0 bg-black/50 w-full h-full flex items-center justify-center">
                            <View className="bg-black/80 px-4 py-2 rounded-md border border-white/20">
                              <Text className="text-white font-bold text-xs uppercase tracking-widest">Penuh</Text>
                            </View>
                          </View>
                        )}
                      </View>
                      <View className="p-3">
                        <View className="flex-row justify-between items-start mb-2">
                          <View className="px-1.5 py-0.5 bg-surface-container rounded">
                            <Text className="text-[8px] font-bold text-on-surface-variant uppercase">{item.type}</Text>
                          </View>
                          <View className="flex-row items-center gap-0.5">
                            <MaterialIcons name="star" size={10} color="#3525cd" />
                            <Text className="text-[10px] font-bold text-on-surface">{item.rating}</Text>
                          </View>
                        </View>
                        <Text className="font-bold text-sm text-on-surface mb-1" numberOfLines={1}>{item.name}</Text>
                        <Text className="text-[11px] text-on-surface-variant mb-3">
                          <MaterialIcons name="location-on" size={10} /> {item.location}
                        </Text>

                        <View className="h-[1px] bg-surface-container-high mb-3" />

                        <View className="flex-row justify-between items-center">
                          <Text className="text-on-surface font-bold text-sm">Rp {(item.originalHarga).toLocaleString('id-ID')}<Text className="text-[9px] font-normal text-on-surface-variant">/bln</Text></Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity className="mt-4 px-8 py-3 rounded-xl bg-surface-container-lowest border border-outline-variant/20 items-center">
                  <Text className="font-medium text-on-surface">Muat Lebih Banyak</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Empty State */}
            {filteredKamar.length === 0 && (
              <View className="mt-16 px-6 items-center justify-center">
                <MaterialIcons name="event-busy" size={64} color="#777587" />
                <Text className="mt-4 text-lg font-bold text-on-surface text-center">Belum Ada Kamar</Text>
                <Text className="mt-2 text-sm text-on-surface-variant text-center">Data kamar kosong.</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}