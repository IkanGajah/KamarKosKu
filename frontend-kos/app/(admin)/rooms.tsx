import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE_URL } from '@/constants/config';
import { globalState } from '../_globalState';
import { Kamar } from '@/types/types';

export default function AdminRoomsScreen() {
  const [rooms, setRooms] = React.useState<Kamar[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [adminProfile, setAdminProfile] = React.useState<any>(null);

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Ambil profil admin untuk mengetahui ID Cabang
      const profileRes = await fetch(`${API_BASE_URL}/users/profile`, {
        headers: { 'Authorization': `Bearer ${globalState.token}` }
      });
      const profileJson = await profileRes.json();
      const profileData = profileJson.data || {};
      setAdminProfile(profileData);

      const cabangId = profileData.cabang?.idCabang || profileData.cabang?.id;

      // 2. Fetch kamar khusus untuk cabang admin
      let roomsData = [];
      if (cabangId) {
        const roomsRes = await fetch(`${API_BASE_URL}/kamar/cabang/${cabangId}`);
        const roomsJson = await roomsRes.json();
        roomsData = roomsJson.data || [];
      } else {
        const roomsRes = await fetch(`${API_BASE_URL}/kamar`);
        const roomsJson = await roomsRes.json();
        roomsData = roomsJson.data || [];
      }
      
      setRooms(roomsData);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = rooms.filter(room => 
    room.nomorKamar?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.fasilitas?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusDisplay = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'TERSEDIA') return 'Tersedia';
    if (s === 'PENUH' || s === 'TERISI') return 'Terisi';
    if (s === 'PERBAIKAN') return 'Perbaikan';
    return 'Tersedia';
  };

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
              className="w-10 h-10 rounded-full bg-surface-container-highest"
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
        <View className="mb-6">
          <Text className="font-black text-[28px] text-on-surface leading-tight tracking-tight">Kelola Kamar</Text>
          <Text className="text-sm text-on-surface-variant mt-1">
            {adminProfile?.cabang?.namaCabang ? `Cabang: ${adminProfile.cabang.namaCabang}` : 'Memuat data cabang...'}
          </Text>
        </View>

        {/* Search and Filters */}
        <View className="bg-surface-container-low rounded-xl p-4 mb-8">
          <View className="relative justify-center mb-4">
            <View className="absolute left-4 z-10">
              <MaterialIcons name="search" size={20} color="#777587" />
            </View>
            <TextInput
              className="w-full pl-12 pr-4 h-[50px] bg-surface-container-highest rounded-xl text-on-surface"
              placeholder="Cari nomor kamar atau fasilitas..."
              placeholderTextColor="#777587"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Room Grid */}
        <View className="flex-col gap-6">
          {loading ? (
            <View className="py-20 items-center">
              <ActivityIndicator size="large" color="#4f46e5" />
              <Text className="mt-4 text-on-surface-variant font-medium">Memuat data kamar...</Text>
            </View>
          ) : filteredRooms.length > 0 ? (
            filteredRooms.map((room) => {
              const statusDisplay = getStatusDisplay(room.statusKetersediaan || room.status || '');
              const hargaStr = room.harga != null ? room.harga : (room as any).hargaSewa;
              const hargaNum = hargaStr ? Number(hargaStr) : 0;

              return (
                <View key={room.idKamar || room.id} className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/10 flex-col relative p-5">
                  <View className="flex-row justify-between items-start mb-4">
                    <View>
                      <Text className="font-black text-[22px] text-on-surface">Kamar {room.nomorKamar}</Text>
                      <Text className="text-on-surface-variant text-sm mt-1">{room.fasilitas || 'Fasilitas Standar'}</Text>
                    </View>
                    <View className={`px-3 py-1 rounded-full flex-row items-center gap-1 ${
                      statusDisplay === 'Tersedia' ? 'bg-[#e7f3ef]' : 
                      statusDisplay === 'Terisi' ? 'bg-[#ffdad6]' : 'bg-[#e2dfff]'
                    }`}>
                      <MaterialIcons 
                        name={statusDisplay === 'Tersedia' ? 'check-circle' : statusDisplay === 'Terisi' ? 'person' : 'build'} 
                        size={14} 
                        color={statusDisplay === 'Tersedia' ? '#006b5f' : statusDisplay === 'Terisi' ? '#ba1a1a' : '#3525cd'} 
                      />
                      <Text className={`text-xs font-bold ${
                        statusDisplay === 'Tersedia' ? 'text-[#006b5f]' : 
                        statusDisplay === 'Terisi' ? 'text-[#ba1a1a]' : 'text-[#3525cd]'
                      }`}>
                        {statusDisplay}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row justify-between items-end">
                    <Text className="font-extrabold text-[20px] tracking-tight text-on-surface">
                      Rp {(hargaNum / 1000).toFixed(0)}k<Text className="text-sm font-normal text-on-surface-variant">/bln</Text>
                    </Text>
                    
                    <TouchableOpacity className="bg-primary px-5 py-2.5 rounded-lg active:scale-95">
                      <Text className="text-white font-semibold text-sm">
                        Edit
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          ) : (
            <View className="py-20 items-center">
              <MaterialIcons name="search-off" size={48} color="#777587" />
              <Text className="mt-4 text-on-surface-variant font-medium">Tidak ada kamar ditemukan</Text>
            </View>
          )}
        </View>

      </ScrollView>

      {/* FAB: Add Room (Jika Admin diizinkan) */}
      <TouchableOpacity 
        className="absolute right-6 bottom-24 w-14 h-14 rounded-xl items-center justify-center shadow-lg z-40 active:scale-95 bg-primary"
      >
        <MaterialIcons name="add" size={24} color="#ffffff" />
      </TouchableOpacity>

    </SafeAreaView>
  );
}
