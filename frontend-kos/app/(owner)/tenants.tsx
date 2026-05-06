import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { API_BASE_URL } from '@/constants/config';
import { globalState } from '../_globalState';
import { useRouter } from 'expo-router';

export default function OwnerTenantsScreen() {
  const router = useRouter();
  const [tenants, setTenants] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');

  const [selectedTenant, setSelectedTenant] = React.useState<any>(null);
  const [isDetailVisible, setIsDetailVisible] = React.useState(false);

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/transaksi`, {
        headers: { 'Authorization': `Bearer ${globalState.token}` }
      });
      const json = await response.json();
      if (json.data) {
        const mapped = json.data.map((t: any) => ({
          id: t.idTransaksi.toString(),
          name: t.penyewa?.nama || 'Penyewa Tidak Diketahui',
          email: t.penyewa?.email || '-',
          phone: t.penyewa?.noTelepon || '-',
          room: `Kamar ${t.kamar?.nomorKamar || '?'}`,
          cabang: t.kamar?.cabang?.namaCabang || 'Cabang Tidak Diketahui',
          nominal: t.nominal || 0,
          rentAmount: `Rp ${(t.nominal || 0).toLocaleString('id-ID')}`,
          date: t.tanggalTransaksi || '-',
          jatuhTempo: t.jatuhTempo || '-',
          metode: t.metodePembayaran || 'TUNAI',
          status: t.statusBayar === 'LUNAS' ? 'Lunas' : 'Menunggu',
          rawStatus: t.statusBayar,
          image: null,
          initials: (t.penyewa?.nama || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        }));
        mapped.sort((a: any, b: any) => {
          if (a.rawStatus === 'PENDING' && b.rawStatus !== 'PENDING') return -1;
          if (a.rawStatus !== 'PENDING' && b.rawStatus === 'PENDING') return 1;
          
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          if (!isNaN(dateA) && !isNaN(dateB) && dateA !== dateB) {
            return dateB - dateA;
          }
          return parseInt(b.id) - parseInt(a.id);
        });
        
        setTenants(mapped);
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowDetail = (tenant: any) => {
    setSelectedTenant(tenant);
    setIsDetailVisible(true);
  };

  const handleKonfirmasiPembayaran = async (idTransaksi: string) => {
    Alert.alert(
      "Konfirmasi Pembayaran",
      "Apakah Anda yakin ingin mengonfirmasi pembayaran ini secara manual?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Konfirmasi",
          onPress: async () => {
            try {
              const res = await fetch(`${API_BASE_URL}/transaksi/${idTransaksi}/konfirmasi-manual`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${globalState.token}` }
              });

              if (res.ok) {
                Alert.alert("Sukses", "Pembayaran berhasil dikonfirmasi.");
                setIsDetailVisible(false);
                fetchData();
              } else {
                const json = await res.json();
                Alert.alert("Gagal", json.message || "Gagal mengonfirmasi pembayaran.");
              }
            } catch (error) {
              Alert.alert("Error", "Gagal menghubungi server.");
            }
          }
        }
      ]
    );
  };

  const filteredTenants = tenants.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.cabang.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      >
        <View className="mb-8">
          <Text className="font-black text-[28px] text-on-surface leading-tight tracking-tight mb-2">Transaksi & Penyewa</Text>
          <Text className="text-[15px] text-on-surface-variant">Pantau seluruh transaksi dan penyewa dari semua cabang kos Anda.</Text>
        </View>

        {/* Search */}
        <View className="flex-row gap-3 mb-8">
          <View className="flex-1 relative justify-center">
            <View className="absolute left-4 z-10">
              <MaterialIcons name="search" size={20} color="#777587" />
            </View>
            <TextInput
              className="w-full pl-12 pr-4 h-[52px] bg-surface-container-highest rounded-xl text-on-surface font-semibold"
              placeholder="Cari penyewa, kamar, atau cabang..."
              placeholderTextColor="#777587"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Tenant Cards */}
        <View className="flex-col mb-4">
          {loading ? (
            <View className="py-20 items-center">
              <ActivityIndicator size="large" color="#4f46e5" />
              <Text className="mt-4 text-on-surface-variant font-medium">Memuat data transaksi...</Text>
            </View>
          ) : filteredTenants.length > 0 ? (
            filteredTenants.map((tenant, index) => (
              <View key={tenant.id || index} className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/10 overflow-hidden relative mb-5">

                {/* Header: User Info & Status */}
                <View className="flex-row items-start justify-between mb-4 z-10 relative">
                  <View className="flex-row items-center flex-1 pr-2">
                    {tenant.image ? (
                      <Image
                        source={{ uri: tenant.image }}
                        className="w-12 h-12 rounded-full border border-surface mr-3"
                      />
                    ) : (
                      <View className="w-12 h-12 rounded-full bg-primary-container items-center justify-center border border-surface mr-3">
                        <Text className="font-bold text-lg text-on-primary-container">{tenant.initials}</Text>
                      </View>
                    )}
                    <View className="flex-1">
                      <Text className="font-bold text-[18px] text-on-surface" numberOfLines={1}>{tenant.name}</Text>
                      <View className="flex-row items-center mt-1">
                        <MaterialIcons name="location-city" size={14} color="#464555" style={{ marginRight: 4 }} />
                        <Text className="text-[12px] text-on-surface-variant font-medium" numberOfLines={1}>{tenant.cabang}</Text>
                      </View>
                      <View className="flex-row items-center mt-0.5">
                        <MaterialIcons name="meeting-room" size={14} color="#464555" style={{ marginRight: 4 }} />
                        <Text className="text-[12px] text-on-surface-variant">{tenant.room}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Status Badge */}
                  <View className={`px-3 py-1.5 rounded-full flex-row items-center ${tenant.status === 'Menunggu' ? 'bg-[#ffdad6]' : 'bg-[#e7f3ef]'}`}>
                    {tenant.status === 'Lunas' && <MaterialIcons name="check-circle" size={12} color="#006b5f" style={{ marginRight: 4 }} />}
                    <Text className={`text-[11px] font-extrabold tracking-wide uppercase ${tenant.status === 'Menunggu' ? 'text-[#93000a]' : 'text-[#006b5f]'}`}>
                      {tenant.status}
                    </Text>
                  </View>
                </View>

                {/* Rent Info Block */}
                <View className="bg-surface-container-low rounded-xl p-3.5 mb-4 flex-row justify-between items-center border border-outline-variant/10">
                  <View>
                    <Text className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">Total Biaya</Text>
                    <Text className="font-extrabold text-[18px] text-primary">{tenant.rentAmount}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">Tanggal</Text>
                    <Text className="font-semibold text-[14px] text-on-surface">{tenant.date}</Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row mt-1">
                  {tenant.status === 'Menunggu' ? (
                    <TouchableOpacity
                      onPress={() => handleKonfirmasiPembayaran(tenant.id)}
                      className="flex-1 h-[44px] rounded-xl flex-row items-center justify-center bg-primary"
                    >
                      <MaterialIcons name="verified" size={18} color="#ffffff" style={{ marginRight: 6 }} />
                      <Text className="font-bold text-white text-[14px]">Konfirmasi Lunas</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleShowDetail(tenant)}
                      className="flex-1 h-[44px] rounded-xl flex-row items-center justify-center bg-surface-container-highest"
                    >
                      <MaterialIcons name="receipt-long" size={18} color="#191c1e" style={{ marginRight: 6 }} />
                      <Text className="font-bold text-on-surface text-[14px]">Lihat Detail</Text>
                    </TouchableOpacity>
                  )}
                </View>

              </View>
            ))
          ) : (
            <View className="py-20 items-center">
              <MaterialIcons name="receipt-long" size={48} color="#cbd5e1" />
              <Text className="mt-4 text-on-surface-variant font-medium">Tidak ada transaksi ditemukan</Text>
            </View>
          )}
        </View>

      </ScrollView>

      {/* Tenant Detail Modal */}
      <Modal visible={isDetailVisible} animationType="fade" transparent>
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-surface rounded-t-3xl p-6 shadow-2xl">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-black text-on-surface">Detail Transaksi</Text>
              <TouchableOpacity onPress={() => setIsDetailVisible(false)} className="p-2 -mr-2">
                <MaterialIcons name="close" size={24} color="#777587" />
              </TouchableOpacity>
            </View>

            {selectedTenant && (
              <View className="space-y-4">
                <View className="flex-row items-center bg-surface-container-low p-4 rounded-2xl mb-4 border border-outline-variant/10">
                  <View className="w-12 h-12 rounded-full bg-primary-container items-center justify-center mr-4">
                    <Text className="font-bold text-lg text-on-primary-container">{selectedTenant.initials}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-lg text-on-surface">{selectedTenant.name}</Text>
                    <Text className="text-sm text-on-surface-variant">{selectedTenant.email}</Text>
                    <Text className="text-sm text-on-surface-variant">{selectedTenant.phone}</Text>
                  </View>
                </View>

                <View className="bg-surface-container-highest p-5 rounded-2xl space-y-4 mb-6">
                  <View className="flex-row justify-between items-center border-b border-outline-variant/10 pb-3">
                    <Text className="text-on-surface-variant font-medium">Cabang</Text>
                    <Text className="font-bold text-on-surface">{selectedTenant.cabang}</Text>
                  </View>
                  <View className="flex-row justify-between items-center border-b border-outline-variant/10 pb-3">
                    <Text className="text-on-surface-variant font-medium">Kamar</Text>
                    <Text className="font-bold text-on-surface">{selectedTenant.room}</Text>
                  </View>
                  <View className="flex-row justify-between items-center border-b border-outline-variant/10 pb-3">
                    <Text className="text-on-surface-variant font-medium">Nominal</Text>
                    <Text className="font-bold text-primary text-[16px]">{selectedTenant.rentAmount}</Text>
                  </View>
                  <View className="flex-row justify-between items-center border-b border-outline-variant/10 pb-3">
                    <Text className="text-on-surface-variant font-medium">Metode</Text>
                    <Text className="font-bold text-on-surface">{selectedTenant.metode}</Text>
                  </View>
                  <View className="flex-row justify-between items-center border-b border-outline-variant/10 pb-3">
                    <Text className="text-on-surface-variant font-medium">Tgl Transaksi</Text>
                    <Text className="font-bold text-on-surface">{selectedTenant.date}</Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-on-surface-variant font-medium">Jatuh Tempo</Text>
                    <Text className="font-bold text-error">{selectedTenant.jatuhTempo}</Text>
                  </View>
                </View>

                {selectedTenant.rawStatus === 'PENDING' && (
                  <TouchableOpacity
                    onPress={() => handleKonfirmasiPembayaran(selectedTenant.id)}
                    className="bg-primary h-14 rounded-2xl items-center justify-center flex-row mb-3 shadow-md"
                  >
                    <MaterialIcons name="verified" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text className="text-white font-bold text-lg">Konfirmasi Sekarang</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => setIsDetailVisible(false)}
                  className="bg-surface-container-high h-14 rounded-2xl items-center justify-center"
                >
                  <Text className="text-on-surface font-bold text-lg">Tutup</Text>
                </TouchableOpacity>
              </View>
            )}
            <View className="h-4" />
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
