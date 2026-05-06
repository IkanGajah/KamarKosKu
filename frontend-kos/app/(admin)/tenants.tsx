import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE_URL } from '@/constants/config';
import { globalState } from '../_globalState';

export default function AdminTenantsScreen() {
  const [tenants, setTenants] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [adminProfile, setAdminProfile] = React.useState<any>(null);

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const profileRes = await fetch(`${API_BASE_URL}/users/profile`, {
        headers: { 'Authorization': `Bearer ${globalState.token}` }
      });
      const profileJson = await profileRes.json();
      setAdminProfile(profileJson.data || {});

      // Fetch transactions (already filtered by backend for Admin's branch)
      const response = await fetch(`${API_BASE_URL}/transaksi`, {
        headers: { 'Authorization': `Bearer ${globalState.token}` }
      });
      const json = await response.json();
      if (json.data) {
        const mapped = json.data.map((t: any) => ({
          id: t.idTransaksi.toString(),
          name: t.penyewa?.nama || 'Penyewa Tidak Diketahui',
          room: `Kamar ${t.kamar?.nomorKamar || '?'}`,
          rentAmount: `Rp ${(t.hargaDeal || 0).toLocaleString('id-ID')}`,
          date: t.tanggalTransaksi || '-',
          status: t.statusBayar === 'LUNAS' ? 'Lunas' : 'Menunggu',
          rawStatus: t.statusBayar,
          image: null,
          initials: (t.penyewa?.nama || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        }));
        setTenants(mapped);
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
    } finally {
      setLoading(false);
    }
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
    t.room.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const userInitials = (globalState.namaLengkap || globalState.email || 'A')
    .split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <SafeAreaView className="flex-1 bg-surface pt-4" edges={['top', 'left', 'right']}>
      
      {/* Top App Bar */}
      <View className="px-6 pb-4 flex-row justify-between items-center z-50">
        <View className="flex-row items-center gap-3">
          {globalState.foto ? (
            <Image 
              source={{ uri: globalState.foto }}
              className="w-10 h-10 rounded-full shadow-sm"
            />
          ) : (
            <View className="w-10 h-10 rounded-full bg-primary-container items-center justify-center border border-outline-variant/30">
              <Text className="text-on-primary-container font-bold text-xs">{userInitials}</Text>
            </View>
          )}
          <Text className="font-black text-2xl text-black tracking-tighter">Admin Cabang</Text>
        </View>

        <TouchableOpacity className="p-2 rounded-xl text-indigo-600 active:scale-95">
          <MaterialIcons name="notifications" size={24} color="#4f46e5" />
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
          <Text className="text-[15px] text-on-surface-variant">Kelola penyewa aktif, pantau tagihan, dan validasi pembayaran masuk.</Text>
        </View>

        {/* Search */}
        <View className="flex-row gap-3 mb-8">
          <View className="flex-1 relative justify-center">
            <View className="absolute left-4 z-10">
              <MaterialIcons name="search" size={20} color="#777587" />
            </View>
            <TextInput
              className="w-full pl-12 pr-4 h-[52px] bg-surface-container-highest rounded-xl text-on-surface"
              placeholder="Cari nama atau nomor kamar..."
              placeholderTextColor="#777587"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Tenant Cards */}
        <View className="flex-col gap-6">
          {loading ? (
            <View className="py-20 items-center">
              <ActivityIndicator size="large" color="#4f46e5" />
              <Text className="mt-4 text-on-surface-variant font-medium">Memuat data penyewa...</Text>
            </View>
          ) : filteredTenants.length > 0 ? (
            filteredTenants.map((tenant, index) => (
              <View key={tenant.id || index} className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10 overflow-hidden relative">
                
                {/* Header: User Info & Status */}
                <View className="flex-row items-start justify-between mb-6 z-10 relative">
                  <View className="flex-row items-center gap-3">
                    {tenant.image ? (
                      <Image 
                        source={{ uri: tenant.image }} 
                        className="w-14 h-14 rounded-full border-2 border-surface"
                      />
                    ) : (
                      <View className="w-14 h-14 rounded-full bg-primary-container items-center justify-center border-2 border-surface">
                        <Text className="font-bold text-xl text-on-primary-container">{tenant.initials}</Text>
                      </View>
                    )}
                    <View>
                      <Text className="font-bold text-[18px] text-on-surface">{tenant.name}</Text>
                      <View className="flex-row items-center gap-1 mt-0.5">
                        <MaterialIcons name="bed" size={16} color="#464555" />
                        <Text className="text-[13px] text-on-surface-variant">{tenant.room}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Status Badge */}
                  <View className={`px-3 py-1 rounded-full flex-row items-center gap-1 ${
                    tenant.status === 'Menunggu' ? 'bg-[#ffdad6]' : 'bg-[#e7f3ef]'
                  }`}>
                    {tenant.status === 'Lunas' && <MaterialIcons name="check-circle" size={14} color="#006b5f" />}
                    <Text className={`text-[12px] font-bold tracking-wide ${
                      tenant.status === 'Menunggu' ? 'text-[#93000a]' : 'text-[#006b5f]'
                    }`}>
                      {tenant.status}
                    </Text>
                  </View>
                </View>

                {/* Rent Info Block */}
                <View className="bg-surface-container-low rounded-xl p-4 mb-6 flex-row justify-between items-end">
                  <View>
                    <Text className="text-[11px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">Total Biaya</Text>
                    <Text className="font-extrabold text-[20px] text-on-surface">{tenant.rentAmount}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-[11px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">Tanggal Transaksi</Text>
                    <Text className="font-semibold text-[15px] text-on-surface">{tenant.date}</Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row gap-3">
                  {tenant.status === 'Menunggu' ? (
                    <TouchableOpacity 
                      onPress={() => handleKonfirmasiPembayaran(tenant.id)}
                      className="flex-1 h-[44px] rounded-xl flex-row items-center justify-center gap-2 active:scale-95 bg-primary"
                    >
                      <MaterialIcons name="verified" size={20} color="#ffffff" />
                      <Text className="font-bold text-white">Konfirmasi Lunas</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity className="flex-1 h-[44px] rounded-xl flex-row items-center justify-center gap-2 active:scale-95 bg-surface-container-highest">
                      <MaterialIcons name="receipt-long" size={20} color="#191c1e" />
                      <Text className="font-semibold text-on-surface">Lihat Detail</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity className="w-[44px] h-[44px] rounded-xl border border-outline-variant/20 items-center justify-center bg-surface-container-lowest active:scale-95">
                    <MaterialIcons name="more-horiz" size={20} color="#464555" />
                  </TouchableOpacity>
                </View>

              </View>
            ))
          ) : (
            <View className="py-20 items-center">
              <MaterialIcons name="person-off" size={48} color="#777587" />
              <Text className="mt-4 text-on-surface-variant font-medium">Tidak ada penyewa / transaksi ditemukan</Text>
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
