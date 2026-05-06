import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { API_BASE_URL } from '@/constants/config';
import { globalState } from '../_globalState';
import { Kamar } from '@/types/types';

export default function AdminRoomsScreen() {
  const [rooms, setRooms] = React.useState<Kamar[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [adminProfile, setAdminProfile] = React.useState<any>(null);

  const [selectedRoom, setSelectedRoom] = useState<Kamar | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [nomorKamar, setNomorKamar] = useState('');
  const [hargaSewa, setHargaSewa] = useState('');
  const [fasilitas, setFasilitas] = useState('LAINNYA');
  const [status, setStatus] = useState('TERSEDIA');

  const FASILITAS_OPTIONS = ['AC', 'NON_AC', 'LAINNYA'];
  const STATUS_OPTIONS = ['TERSEDIA', 'PENUH', 'PERBAIKAN'];

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const profileRes = await fetch(`${API_BASE_URL}/users/profile`, {
        headers: { 'Authorization': `Bearer ${globalState.token}` }
      });
      const profileJson = await profileRes.json();
      const profileData = profileJson.data || {};
      setAdminProfile(profileData);

      const cabangId = profileData.cabang?.idCabang || profileData.cabang?.id;

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

  const handleOpenEdit = (room: Kamar) => {
    setSelectedRoom(room);
    setNomorKamar(room.nomorKamar || '');
    setHargaSewa((room.hargaSewa || room.harga || 0).toString());
    setFasilitas(room.fasilitas || 'LAINNYA');
    setStatus(room.statusKetersediaan || room.status || 'TERSEDIA');
    setIsAddMode(false);
    setIsModalVisible(true);
  };

  const filteredRooms = rooms.filter(room => 
    room.nomorKamar?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (room.fasilitas && room.fasilitas.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalKamarLimit = adminProfile?.cabang?.jumlahKamar || 0;
  const currentRoomCount = rooms.length;
  const isAtMaxCapacity = currentRoomCount >= totalKamarLimit && totalKamarLimit > 0;

  const handleOpenAdd = () => {
    if (isAtMaxCapacity) {
      Alert.alert(
        "Batas Kamar Tercapai",
        `Maaf, cabang ini sudah mencapai batas maksimal (${totalKamarLimit} kamar). Silakan hubungi Owner jika ingin menambah kapasitas.`
      );
      return;
    }
    setSelectedRoom(null);
    setNomorKamar('');
    setHargaSewa('');
    setFasilitas('LAINNYA');
    setStatus('TERSEDIA');
    setIsAddMode(true);
    setIsModalVisible(true);
  };

  const handleSave = async () => {
    if (!nomorKamar || !hargaSewa) {
      Alert.alert('Error', 'Nomor Kamar dan Harga wajib diisi.');
      return;
    }

    const cabangId = adminProfile?.cabang?.idCabang || adminProfile?.cabang?.id;
    if (!cabangId) {
      Alert.alert('Error', 'Data cabang tidak ditemukan.');
      return;
    }

    setIsSaving(true);
    try {
      const url = isAddMode ? `${API_BASE_URL}/kamar` : `${API_BASE_URL}/kamar/${selectedRoom?.idKamar || selectedRoom?.id}`;
      const method = isAddMode ? 'POST' : 'PUT';

      const payload = {
        nomorKamar,
        hargaSewa: parseInt(hargaSewa),
        fasilitas,
        statusKetersediaan: status,
        cabang: { idCabang: cabangId }
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${globalState.token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        Alert.alert('Sukses', isAddMode ? 'Kamar berhasil ditambahkan' : 'Kamar berhasil diperbarui');
        setIsModalVisible(false);
        fetchData();
      } else {
        const errJson = await response.json();
        Alert.alert('Gagal', errJson.message || 'Terjadi kesalahan saat menyimpan data');
      }
    } catch (error) {
      console.error('Error saving room:', error);
      Alert.alert('Error', 'Gagal menghubungi server.');
    } finally {
      setIsSaving(false);
    }
  };

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
        <View className="flex-row items-center">
          {globalState.foto ? (
            <Image 
              source={{ uri: globalState.foto }}
              className="w-10 h-10 rounded-full bg-surface-container-highest mr-3"
            />
          ) : (
            <View className="w-10 h-10 rounded-full bg-primary-container items-center justify-center border border-outline-variant/30 mr-3">
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
          <Text className="text-sm text-on-surface-variant mt-1 mb-4">
            {adminProfile?.cabang?.namaCabang ? `Cabang: ${adminProfile.cabang.namaCabang}` : 'Memuat data cabang...'}
          </Text>

          {/* Room Capacity Card */}
          <View className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/20 shadow-sm">
            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-row items-center">
                <MaterialIcons name="home-work" size={20} color="#4f46e5" style={{marginRight: 8}} />
                <Text className="font-bold text-on-surface">Kapasitas Cabang</Text>
              </View>
              <Text className={`font-black ${isAtMaxCapacity ? 'text-error' : 'text-primary'}`}>
                {currentRoomCount} / {totalKamarLimit} <Text className="text-[10px] font-medium text-on-surface-variant">Kamar</Text>
              </Text>
            </View>
            
            {/* Progress Bar */}
            <View className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
              <View 
                className={`h-full rounded-full ${isAtMaxCapacity ? 'bg-error' : 'bg-primary'}`} 
                style={{ width: `${Math.min((currentRoomCount / totalKamarLimit) * 100, 100)}%` }} 
              />
            </View>

            {isAtMaxCapacity && (
              <View className="mt-3 flex-row items-center bg-error-container/30 p-2 rounded-lg">
                <MaterialIcons name="warning" size={14} color="#ba1a1a" style={{marginRight: 6}} />
                <Text className="text-[11px] text-error font-bold">Kamar telah mencapai batas maksimal!</Text>
              </View>
            )}
          </View>
        </View>

        {/* Search and Filters */}
        <View className="bg-surface-container-low rounded-xl p-4 mb-8">
          <View className="relative justify-center">
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
        <View className="flex-col">
          {loading ? (
            <View className="py-20 items-center">
              <ActivityIndicator size="large" color="#4f46e5" />
              <Text className="mt-4 text-on-surface-variant font-medium">Memuat data kamar...</Text>
            </View>
          ) : filteredRooms.length > 0 ? (
            filteredRooms.map((room) => {
              const statusDisplay = getStatusDisplay(room.statusKetersediaan || room.status || '');
              const hargaStr = room.hargaSewa != null ? room.hargaSewa : room.harga;
              const hargaNum = hargaStr ? Number(hargaStr) : 0;

              return (
                <View key={room.idKamar || room.id} className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/10 flex-col relative p-5 mb-5">
                  <View className="flex-row justify-between items-start mb-4">
                    <View>
                      <Text className="font-black text-[22px] text-on-surface">Kamar {room.nomorKamar}</Text>
                      <Text className="text-on-surface-variant text-sm mt-1">{room.fasilitas || 'Fasilitas Standar'}</Text>
                    </View>
                    <View className={`px-3 py-1 rounded-full flex-row items-center ${
                      statusDisplay === 'Tersedia' ? 'bg-[#e7f3ef]' : 
                      statusDisplay === 'Terisi' ? 'bg-[#ffdad6]' : 'bg-[#e2dfff]'
                    }`}>
                      <MaterialIcons 
                        name={statusDisplay === 'Tersedia' ? 'check-circle' : statusDisplay === 'Terisi' ? 'person' : 'build'} 
                        size={14} 
                        color={statusDisplay === 'Tersedia' ? '#006b5f' : statusDisplay === 'Terisi' ? '#ba1a1a' : '#3525cd'} 
                        style={{marginRight: 4}}
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
                    
                    <TouchableOpacity 
                      onPress={() => handleOpenEdit(room)}
                      className="bg-primary px-5 py-2.5 rounded-lg active:scale-95"
                    >
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

      {/* FAB: Add Room */}
      <TouchableOpacity 
        onPress={handleOpenAdd}
        className="absolute right-6 bottom-24 w-14 h-14 rounded-xl items-center justify-center shadow-lg z-40 active:scale-95 bg-primary"
      >
        <MaterialIcons name="add" size={24} color="#ffffff" />
      </TouchableOpacity>

      {/* Add/Edit Room Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-surface rounded-t-3xl p-6 shadow-xl">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-black text-on-surface">{isAddMode ? 'Tambah Kamar' : 'Edit Kamar'}</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#777587" />
              </TouchableOpacity>
            </View>

            <ScrollView className="space-y-5 mb-8">
              <View>
                <Text className="text-xs font-bold text-primary uppercase mb-2">Nomor Kamar</Text>
                <TextInput
                  className="w-full px-4 py-3 bg-surface-container-highest rounded-xl text-on-surface h-[50px] font-bold"
                  placeholder="Contoh: 101"
                  value={nomorKamar}
                  onChangeText={setNomorKamar}
                />
              </View>

              <View>
                <Text className="text-xs font-bold text-primary uppercase mb-2">Harga Sewa (Rp / Bulan)</Text>
                <TextInput
                  className="w-full px-4 py-3 bg-surface-container-highest rounded-xl text-on-surface h-[50px] font-bold"
                  placeholder="Contoh: 1200000"
                  keyboardType="numeric"
                  value={hargaSewa}
                  onChangeText={setHargaSewa}
                />
              </View>

              <View>
                <Text className="text-xs font-bold text-primary uppercase mb-2">Fasilitas</Text>
                <View className="flex-row flex-wrap">
                  {FASILITAS_OPTIONS.map(opt => (
                    <TouchableOpacity 
                      key={opt}
                      onPress={() => setFasilitas(opt)}
                      className={`px-4 py-2 rounded-full border mr-2 mb-2 ${fasilitas === opt ? 'bg-primary border-primary' : 'bg-surface border-outline-variant'}`}
                    >
                      <Text className={fasilitas === opt ? 'text-white font-bold' : 'text-on-surface font-medium'}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <Text className="text-xs font-bold text-primary uppercase mb-2">Status Ketersediaan</Text>
                <View className="flex-row flex-wrap">
                  {STATUS_OPTIONS.map(opt => (
                    <TouchableOpacity 
                      key={opt}
                      onPress={() => setStatus(opt)}
                      className={`px-4 py-2 rounded-full border mr-2 mb-2 ${status === opt ? 'bg-primary border-primary' : 'bg-surface border-outline-variant'}`}
                    >
                      <Text className={status === opt ? 'text-white font-bold' : 'text-on-surface font-medium'}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity 
              onPress={handleSave}
              disabled={isSaving}
              className="bg-primary h-14 rounded-xl items-center justify-center flex-row"
            >
              {isSaving ? <ActivityIndicator color="#fff" /> : (
                <>
                  <MaterialIcons name="save" size={20} color="#fff" style={{marginRight: 8}} />
                  <Text className="text-white font-bold text-lg">Simpan Kamar</Text>
                </>
              )}
            </TouchableOpacity>
            <View className="h-8" />
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
