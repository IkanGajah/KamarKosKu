import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '@/constants/config';
import { globalState } from '../_globalState';
import { Kamar } from '@/types/types';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [adminProfile, setAdminProfile] = React.useState<any>(null);
  const [stats, setStats] = React.useState({
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    totalTenants: 0
  });
  const [recentActivity, setRecentActivity] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 1. Ambil Profil Admin untuk mengetahui cabang tempatnya bertugas
      const profileRes = await fetch(`${API_BASE_URL}/users/profile`, {
        headers: { 'Authorization': `Bearer ${globalState.token}` }
      });
      const profileJson = await profileRes.json();
      const profileData = profileJson.data || {};
      setAdminProfile(profileData);

      const cabangId = profileData.cabang?.idCabang || profileData.cabang?.id;

      // 2. Ambil data Kamar khusus untuk cabang admin tersebut (Isolasi Data FR-006)
      let rooms = [];
      if (cabangId) {
        const roomsRes = await fetch(`${API_BASE_URL}/kamar/cabang/${cabangId}`);
        const roomsJson = await roomsRes.json();
        rooms = roomsJson.data || [];
      } else {
        // Fallback jika tidak ada cabang spesifik
        const roomsRes = await fetch(`${API_BASE_URL}/kamar`);
        const roomsJson = await roomsRes.json();
        rooms = roomsJson.data || [];
      }

      // 3. Ambil data Transaksi (Otomatis difilter oleh backend berdasarkan token admin)
      const transRes = await fetch(`${API_BASE_URL}/transaksi`, {
        headers: { 'Authorization': `Bearer ${globalState.token}` }
      });
      const transJson = await transRes.json();
      const transactions = transJson.data || [];

      // Hitung Statistik
      const available = rooms.filter((r: Kamar) => (r.statusKetersediaan || r.status || '').toUpperCase() === 'TERSEDIA').length;
      const occupied = rooms.filter((r: Kamar) => (r.statusKetersediaan || r.status || '').toUpperCase() === 'PENUH').length;

      // Hitung penyewa unik dari transaksi yang lunas atau aktif
      const uniqueTenants = new Set(transactions.map((t: any) => t.penyewa?.idUser || t.penyewa?.idPenyewa)).size;

      setStats({
        totalRooms: rooms.length,
        availableRooms: available,
        occupiedRooms: occupied,
        totalTenants: uniqueTenants || 0
      });

      // Tampilkan aktivitas transaksi terbaru
      setRecentActivity(transactions.slice(0, 4).map((t: any) => ({
        id: t.idTransaksi,
        title: `${t.penyewa?.nama || 'Seseorang'} membayar sewa Kamar ${t.kamar?.nomorKamar || '?'}`,
        time: t.tanggalTransaksi || 'Baru Saja',
        type: t.statusBayar === 'LUNAS' ? 'payment' : 'pending'
      })));

    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const userInitials = (globalState.namaLengkap || globalState.email || 'A')
    .split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface pt-4" edges={['top', 'left', 'right']}>

      {/* Top App Bar */}
      <View className="px-6 pb-4 flex-row justify-between items-center z-50">
        <View className="flex-row items-center gap-3">
          {globalState.foto ? (
            <Image
              source={{ uri: globalState.foto }}
              className="w-10 h-10 rounded-full border-2 border-surface-container-low"
            />
          ) : (
            <View className="w-10 h-10 rounded-full bg-primary-container items-center justify-center border border-outline-variant/30">
              <Text className="text-on-primary-container font-bold text-xs">{userInitials}</Text>
            </View>
          )}
          <Text className="font-black text-2xl text-black tracking-tighter">Admin Cabang</Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/notifications' as any)}
          className="p-2 rounded-xl text-indigo-600 hover:bg-indigo-50 active:scale-95"
        >
          <MaterialIcons name="notifications" size={24} color="#4f46e5" />
        </TouchableOpacity>
      </View>
      <View className="bg-surface-container-high/50 h-[1px] w-full" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        className="px-6 mt-4 flex-1"
      >

        {/* Header Section */}
        <View className="mb-8">
          <Text className="font-black text-[28px] leading-tight text-on-surface">Dashboard</Text>
          <Text className="text-[15px] text-on-surface-variant mt-1">
            {adminProfile?.cabang?.namaCabang
              ? `Ringkasan properti di ${adminProfile.cabang.namaCabang}`
              : 'Ringkasan properti yang Anda kelola hari ini.'}
          </Text>
        </View>

        {/* Summary Cards */}
        <View className="flex-row flex-wrap justify-between gap-y-4 mb-8">

          {/* Total Rooms */}
          <View className="w-[48%] bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/10">
            <View className="flex-row justify-between items-start z-10">
              <View>
                <Text className="text-[11px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">Total Kamar</Text>
                <Text className="font-extrabold text-2xl text-on-surface tracking-tight">{stats.totalRooms}</Text>
              </View>
              <View className="p-2 bg-[#e2dfff] rounded-lg">
                <MaterialIcons name="apartment" size={20} color="#3525cd" />
              </View>
            </View>
          </View>

          {/* Available */}
          <View className="w-[48%] bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/10">
            <View className="flex-row justify-between items-start z-10">
              <View>
                <Text className="text-[11px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">Tersedia</Text>
                <Text className="font-extrabold text-2xl text-on-surface tracking-tight">{stats.availableRooms}</Text>
              </View>
              <View className="p-2 bg-[#e7f3ef] rounded-lg">
                <MaterialIcons name="vpn-key" size={20} color="#006b5f" />
              </View>
            </View>
          </View>

          {/* Occupied */}
          <View className="w-[48%] bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/10">
            <View className="flex-row justify-between items-start z-10">
              <View>
                <Text className="text-[11px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">Terisi</Text>
                <Text className="font-extrabold text-2xl text-on-surface tracking-tight">{stats.occupiedRooms}</Text>
              </View>
              <View className="p-2 bg-[#ffdad6] rounded-lg">
                <MaterialIcons name="meeting-room" size={20} color="#ba1a1a" />
              </View>
            </View>
          </View>

          {/* Total Tenants */}
          <View className="w-[48%] bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/10">
            <View className="flex-row justify-between items-start z-10">
              <View>
                <Text className="text-[11px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">Penyewa</Text>
                <Text className="font-extrabold text-2xl text-on-surface tracking-tight">{stats.totalTenants}</Text>
              </View>
              <View className="p-2 bg-[#e2dfff] rounded-lg">
                <MaterialIcons name="groups" size={20} color="#3525cd" />
              </View>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/10 flex-col gap-4">
          <Text className="font-bold text-[20px] text-on-surface">Aktivitas Terbaru</Text>

          <View className="flex-col gap-0">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <View key={activity.id || index} className="flex-row gap-4 py-4 border-b border-outline-variant/15">
                  <View className={`w-10 h-10 rounded-full items-center justify-center ${activity.type === 'payment' ? 'bg-[#e7f3ef]' : 'bg-[#e2dfff]'}`}>
                    <MaterialIcons
                      name={activity.type === 'payment' ? 'payments' : 'pending-actions'}
                      size={18}
                      color={activity.type === 'payment' ? '#006b5f' : '#3525cd'}
                    />
                  </View>
                  <View className="flex-1 justify-center">
                    <Text className="text-[14px] font-semibold text-on-surface leading-snug">
                      {activity.title}
                    </Text>
                    <Text className="text-[11px] text-on-surface-variant mt-0.5">{activity.time}</Text>
                  </View>
                </View>
              ))
            ) : (
              <View className="py-10 items-center">
                <Text className="text-on-surface-variant text-sm italic">Belum ada aktivitas transaksi.</Text>
              </View>
            )}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
