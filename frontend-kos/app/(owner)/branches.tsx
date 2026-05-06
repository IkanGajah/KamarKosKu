import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE_URL } from '@/constants/config';
import { useRouter } from 'expo-router';
import { globalState } from '../_globalState';

const MOCK_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDxqro65wdqMJCGELbpTK2HPlNmzKiEwWj-175Ry_62ZyjHbh69ufz3Ui3mdnwCZ-wf2rD3csCqmLrvpdAQK5qrs8EFmKY63gUJWw09rdFdgembiQCkdBqIdEIMYb5Cnr-_FLQvaLKcN2Cxduy839CZ11uXEHIjX9gJQZQo9KXtlKm16o2xDAOzzOWdw8z2hBAxHEK0MswcAu6-tbgt7VAQcIgkquHOQHTER2LcngeE3Gw868DmomyNNSk0Ny7lWizBVAJRygj_LC8",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCnaIDLGyfCnAhE6WcKF-nnmJyZZEtdT8SPEF9rAl906E8AvQhSRWALAS2xqnzpC4TufkgssCQ_uz55-X9rgfIvTknB9tRcIzBRc4GliNDvsBelN2tTSXCyrXZJMUlFPrVWTSbjsGMCzRvqsXSi8b3UCG9eQxnv3ZERTgjCqVFMIe1ywpJZcNAfRiuLoxt7w7g1XOVlNMM1HwcCkgdztoVkLthHRKQodThFKxPNAdYtjhY0tQRh9PCelKqWb8YE9Wxx8KisGRyqN_I",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBzBZ-XRGDxmwRJAiOwBJJxiKFYOF3zKNO6yb5FwojhMAa3G2jZCn018YL1_aMbLtTJWphhfBXUq3ZoHOMfAJi6vTASJzuvPa142aScLBJpUyWq6UQZN1mppNP45l7h_95qr-k3P_pS6xVl58_lT66f0PIrWsemwQoBYSMmfNytJrEilYtdF2iFlHD7fZDPgx6vcl8tWVdG14bOzQdsoPFZLwV0h6aTu21KlgStWh8i-0BCYrVp-npXAuW2JMwYlu9Lvg8AzxsOeFQ"
];

interface CabangKos {
  id?: number;
  idCabang: number;
  namaCabang: string;
  alamat: string;
  jumlahKamar: number;
  status: string;
  foto?: string;
}

interface Kamar {
  id?: number;
  idKamar: number;
  nomorKamar?: string;
  hargaSewa: number;
  harga?: number;
  fasilitas?: string;
  statusKetersediaan: string;
  status?: string;
  cabang: CabangKos;
  namaPenyewa?: string;
}

export default function OwnerBranchesScreen() {
  const router = useRouter();
  const [branches, setBranches] = useState<CabangKos[]>([]);
  const [kamars, setKamars] = useState<Kamar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBranch, setEditingBranch] = useState<CabangKos | null>(null);

  // Form State
  const [namaCabang, setNamaCabang] = useState('');
  const [alamat, setAlamat] = useState('');
  const [jumlahKamar, setJumlahKamar] = useState('');
  const [admins, setAdmins] = useState<any[]>([]);
  const [selectedAdminId, setSelectedAdminId] = useState<string>('');

  // Room Form State
  const [nomorKamar, setNomorKamar] = useState('');
  const [hargaKamar, setHargaKamar] = useState('');
  const [fasilitasKamar, setFasilitasKamar] = useState('AC');
  const [editingRoom, setEditingRoom] = useState<Kamar | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Cabang
      const branchRes = await fetch(`${API_BASE_URL}/cabang?t=${Date.now()}`, {
        headers: { 'Authorization': `Bearer ${globalState.token}` }
      });
      if (branchRes.ok) {
        const branchData = await branchRes.json();
        if (branchData.data) setBranches(branchData.data);
      }

      // 2. Fetch Kamar
      let fetchedKamars: Kamar[] = [];
      const kamarRes = await fetch(`${API_BASE_URL}/kamar?t=${Date.now()}`, {
        headers: { 'Authorization': `Bearer ${globalState.token}` }
      });
      if (kamarRes.ok) {
        const kamarData = await kamarRes.json();
        if (kamarData.data) fetchedKamars = kamarData.data;
      }

      // 3. Fetch Transaksi (untuk memetakan nama penyewa)
      let tenantMap: Record<number, string> = {};
      try {
        const transRes = await fetch(`${API_BASE_URL}/transaksi?t=${Date.now()}`, {
          headers: { 'Authorization': `Bearer ${globalState.token}` }
        });
        if (transRes.ok) {
          const transData = await transRes.json();
          if (transData.data) {
            // Kita ambil transaksi terbaru untuk setiap kamar
            transData.data.forEach((t: any) => {
              if (t.kamar && t.penyewa) {
                const kId = t.kamar.id || t.kamar.idKamar;
                tenantMap[kId] = t.penyewa.nama;
              }
            });
          }
        }
      } catch (err) {
        console.error("Gagal memuat transaksi", err);
      }

      // 4. Gabungkan data kamar dengan nama penyewa
      const enrichedKamars = fetchedKamars.map(k => ({
        ...k,
        namaPenyewa: k.namaPenyewa || tenantMap[k.idKamar || (k as any).id] || undefined
      }));
      setKamars(enrichedKamars);

      // 5. Fetch Admins
      const adminRes = await fetch(`${API_BASE_URL}/users/admin`, {
        headers: { 'Authorization': `Bearer ${globalState.token}` }
      });
      if (adminRes.ok) {
        const adminData = await adminRes.json();
        if (adminData.data) setAdmins(adminData.data);
      }
    } catch (error) {
      console.error("General fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!namaCabang || !alamat || !jumlahKamar) {
      Alert.alert("Error", "Semua field harus diisi");
      return;
    }

    try {
      const url = editingBranch
        ? `${API_BASE_URL}/cabang/${editingBranch.idCabang}`
        : `${API_BASE_URL}/cabang`;
      const method = editingBranch ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${globalState.token}`
        },
        body: JSON.stringify({
          namaCabang,
          alamat,
          jumlahKamar: parseInt(jumlahKamar, 10),
          status: 'Aktif'
        })
      });

      if (response.ok) {
        let branchId = editingBranch?.idCabang;
        if (!editingBranch) {
          const savedBranchData = await response.json();
          branchId = savedBranchData.data.idCabang;
        }

        if (selectedAdminId && branchId) {
          await fetch(`${API_BASE_URL}/users/admin/${selectedAdminId}/cabang`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${globalState.token}`
            },
            body: JSON.stringify({ cabang: { idCabang: branchId } })
          });
        }

        Alert.alert("Sukses", `Cabang berhasil ${editingBranch ? 'diperbarui' : 'ditambahkan'}`);
        setIsModalVisible(false);
        fetchData();
      } else {
        const err = await response.json();
        Alert.alert("Error", err.message || "Gagal menyimpan cabang");
      }
    } catch (error) {
      Alert.alert("Error", "Terjadi kesalahan server");
    }
  };

  const handleAddKamar = async () => {
    if (!editingBranch) return;
    const branchKamars = kamars.filter(k => k.cabang && (k.cabang.idCabang === editingBranch.idCabang || k.cabang.id === editingBranch.idCabang));
    const limit = parseInt(jumlahKamar, 10) || 0;

    if (!editingRoom && branchKamars.length >= limit) {
      Alert.alert("Limit Tercapai", `Jumlah kamar sudah mencapai total kapasitas (${limit}). Harap tingkatkan total kamar cabang terlebih dahulu.`);
      return;
    }

    if (!nomorKamar || !hargaKamar) {
      Alert.alert("Error", "Nomor kamar dan harga harus diisi");
      return;
    }

    try {
      const url = editingRoom
        ? `${API_BASE_URL}/kamar/${editingRoom.idKamar || editingRoom.id}`
        : `${API_BASE_URL}/kamar`;
      const method = editingRoom ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${globalState.token}`
        },
        body: JSON.stringify({
          nomorKamar,
          harga: parseInt(hargaKamar, 10),
          fasilitas: fasilitasKamar,
          status: editingRoom ? (editingRoom.statusKetersediaan || editingRoom.status) : 'TERSEDIA',
          cabang: { idCabang: editingBranch.idCabang }
        })
      });

      if (response.ok) {
        Alert.alert("Sukses", `Kamar berhasil ${editingRoom ? 'diperbarui' : 'ditambahkan'}`);
        setNomorKamar('');
        setHargaKamar('');
        setFasilitasKamar('AC');
        setEditingRoom(null);
        fetchData();
      } else {
        Alert.alert("Error", `Gagal ${editingRoom ? 'memperbarui' : 'menambahkan'} kamar`);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Terjadi kesalahan server");
    }
  };

  const handleDeleteKamar = (id: number) => {
    Alert.alert("Konfirmasi", "Hapus kamar ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await fetch(`${API_BASE_URL}/kamar/${id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${globalState.token}` }
            });
            if (response.ok) {
              Alert.alert("Sukses", "Kamar dihapus");
              fetchData();
            }
          } catch (error) { }
        }
      }
    ]);
  };

  const handleDelete = (id: number) => {
    Alert.alert("Konfirmasi", "Apakah Anda yakin ingin menonaktifkan cabang ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await fetch(`${API_BASE_URL}/cabang/${id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${globalState.token}` }
            });
            if (response.ok) {
              Alert.alert("Sukses", "Cabang berhasil dinonaktifkan");
              fetchData();
            } else {
              Alert.alert("Error", "Gagal menghapus cabang");
            }
          } catch (error) {
            Alert.alert("Error", "Terjadi kesalahan server");
          }
        }
      }
    ]);
  };

  const openModal = (branch: CabangKos | null = null) => {
    if (branch) {
      setEditingBranch(branch);
      setNamaCabang(branch.namaCabang);
      setAlamat(branch.alamat);
      setJumlahKamar(branch.jumlahKamar.toString());
      const assignedAdmin = admins.find(a => a.cabang && a.cabang.idCabang === branch.idCabang);
      setSelectedAdminId(assignedAdmin ? assignedAdmin.idUser.toString() : '');
    } else {
      setEditingBranch(null);
      setNamaCabang('');
      setAlamat('');
      setJumlahKamar('');
      setSelectedAdminId('');
    }
    // Reset room form when opening branch modal
    setNomorKamar('');
    setHargaKamar('');
    setFasilitasKamar('AC');
    setEditingRoom(null);
    setIsModalVisible(true);
  };

  const getBranchStats = (branchId: number, totalRooms: number) => {
    const branchKamars = kamars.filter(k => k.cabang && (k.cabang.idCabang === branchId || k.cabang.id === branchId));
    const occupiedKamars = branchKamars.filter(k => (k.statusKetersediaan || k.status || '').toUpperCase() === 'PENUH').length;
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedKamars / totalRooms) * 100) : 0;

    let statusText = "Stabil";
    if (occupancyRate >= 90) statusText = "Penuh";
    else if (occupancyRate < 50) statusText = "Banyak Kosong";

    return { occupiedKamars, occupancyRate, statusText };
  };

  return (
    <SafeAreaView className="flex-1 bg-surface pt-4" edges={['top', 'left', 'right']}>

      {/* Top App Bar */}
      <View className="px-6 pb-4 flex-row justify-between items-center z-50">
        <Text className="font-black text-xl text-black tracking-tight">KosKu Owner</Text>
        <TouchableOpacity
          onPress={() => router.push('/notifications' as any)}
          className="hover:opacity-80 active:scale-95"
        >
          <MaterialIcons name="notifications" size={28} color="#464555" />
          <View className="absolute top-0 right-0 w-3 h-3 bg-[#ba1a1a] rounded-full border-2 border-surface" />
        </TouchableOpacity>
      </View>
      <View className="bg-surface-container-high/50 h-[1px] w-full" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        className="px-6 flex-1 mt-4"
      >

        {/* Page Header */}
        <View className="mb-6 flex-col gap-4">
          <View>
            <Text className="font-black text-[28px] text-on-surface leading-tight tracking-tight">Daftar Cabang</Text>
            <Text className="text-[15px] text-on-surface-variant mt-2">Kelola portofolio properti Anda dan pantau ketersediaan kamar di seluruh lokasi.</Text>
          </View>
          <TouchableOpacity
            onPress={() => openModal()}
            className="rounded-xl overflow-hidden shadow-sm active:scale-95"
          >
            <LinearGradient
              colors={['#4f46e5', '#3525cd']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              className="h-[52px] flex-row items-center justify-center gap-2"
            >
              <MaterialIcons name="add" size={20} color="#ffffff" />
              <Text className="text-white font-bold text-[15px]">Tambah Cabang Baru</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Branches Grid */}
        {isLoading ? (
          <ActivityIndicator size="large" color="#4f46e5" className="mt-10" />
        ) : (
          <View className="flex-col gap-6">
            {branches.map((branch, index) => {
              const stats = getBranchStats(branch.idCabang, branch.jumlahKamar);

              return (
                <View key={branch.idCabang} className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/20 flex-col">

                  {/* Image Section */}
                  <View className="h-48 relative overflow-hidden bg-surface-container-highest">
                    <Image
                      source={{ uri: branch.foto || MOCK_IMAGES[index % MOCK_IMAGES.length] }}
                      className="w-full h-full object-cover"
                    />

                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.5)']}
                      className="absolute bottom-0 left-0 w-full h-1/2"
                    />
                  </View>

                  {/* Content Section */}
                  <View className="p-6 flex-col">
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1 pr-2">
                        <Text className="font-black text-[22px] text-on-surface">{branch.namaCabang}</Text>
                        <View className="flex-row items-center gap-1 mt-1">
                          <MaterialIcons name="location-on" size={16} color="#464555" />
                          <Text className="text-[15px] text-on-surface-variant">{branch.alamat}</Text>
                        </View>
                      </View>
                    </View>

                    <View className="mt-6 mb-6">
                      <View className="bg-surface-container-low p-3 rounded-xl flex-row justify-between items-center">
                        <Text className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Kamar Terisi</Text>
                        <Text className="font-extrabold text-[16px] text-on-surface">
                          {stats.occupiedKamars}<Text className="text-sm font-normal text-on-surface-variant ml-1">/ {branch.jumlahKamar}</Text>
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => openModal(branch)}
                      className="w-full h-[52px] rounded-xl bg-[#e0e3ff] active:bg-[#c6cbff] flex-row items-center justify-center gap-2"
                    >
                      <MaterialIcons name="edit" size={20} color="#3525cd" />
                      <Text className="text-[#3525cd] font-semibold text-[15px]">Edit Cabang</Text>
                    </TouchableOpacity>
                  </View>

                </View>
              );
            })}
            {branches.length === 0 && (
              <Text className="text-center text-on-surface-variant mt-4">Belum ada data cabang.</Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Modal Form */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-surface rounded-t-3xl p-6 h-[70%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="font-bold text-xl text-on-surface">
                {editingBranch ? 'Edit Cabang' : 'Tambah Cabang Baru'}
              </Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#464555" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="mb-4">
                <Text className="text-sm font-medium text-on-surface-variant mb-2">Nama Cabang</Text>
                <TextInput
                  className="w-full px-4 py-3 bg-surface-container-highest rounded-xl text-on-surface h-[50px]"
                  placeholder="Misal: Kos Ku Sudirman"
                  value={namaCabang}
                  onChangeText={setNamaCabang}
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-on-surface-variant mb-2">Alamat Lengkap</Text>
                <TextInput
                  className="w-full px-4 py-3 bg-surface-container-highest rounded-xl text-on-surface h-[80px]"
                  placeholder="Alamat lengkap..."
                  multiline
                  textAlignVertical="top"
                  value={alamat}
                  onChangeText={setAlamat}
                />
              </View>

              <View className="mb-6">
                <Text className="text-sm font-medium text-on-surface-variant mb-2">Maksimal Kamar</Text>
                <TextInput
                  className="w-full px-4 py-3 bg-surface-container-highest rounded-xl text-on-surface h-[50px]"
                  placeholder="Misal: 50"
                  keyboardType="numeric"
                  value={jumlahKamar}
                  onChangeText={setJumlahKamar}
                />
              </View>

              <View className="mb-6">
                <Text className="text-sm font-medium text-on-surface-variant mb-2">Pilih Admin Bertugas</Text>
                <View className="flex-row flex-wrap gap-2">
                  {admins.map(admin => (
                    <TouchableOpacity
                      key={admin.idUser}
                      onPress={() => setSelectedAdminId(admin.idUser.toString())}
                      className={`px-4 py-2 rounded-lg border ${selectedAdminId === admin.idUser.toString() ? 'border-[#3525cd] bg-[#e0e3ff]' : 'border-outline-variant/30 bg-surface-container-lowest'}`}
                    >
                      <Text className={selectedAdminId === admin.idUser.toString() ? 'text-[#3525cd] font-bold text-xs' : 'text-on-surface text-xs'}>
                        {admin.nama}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {admins.length === 0 && (
                    <Text className="text-xs text-on-surface-variant">Belum ada akun admin.</Text>
                  )}
                </View>
              </View>

              {editingBranch && (
                <View className="mb-8 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20">
                  <Text className="font-bold text-lg text-on-surface mb-4">Kelola Kamar</Text>

                  {/* Current Rooms List */}
                  <View className="mb-4 gap-2">
                    {kamars.filter(k => k.cabang && (k.cabang.idCabang === editingBranch.idCabang || (k.cabang as any).id === editingBranch.idCabang)).map(k => {
                      const isOccupied = (k.statusKetersediaan || k.status || '').toUpperCase() === 'PENUH';
                      return (
                        <View key={k.idKamar || k.id} className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/10 mb-2">
                          <View className="flex-row justify-between items-center mb-2">
                            <View className="flex-row items-center gap-2">
                              <Text className="font-bold text-on-surface">Kamar {k.nomorKamar}</Text>
                              <View className={`px-2 py-0.5 rounded-full`} style={{ backgroundColor: isOccupied ? '#ffdad6' : '#dbf4e9' }}>
                                <Text className={`text-[10px] font-black uppercase tracking-wider`} style={{ color: isOccupied ? '#ba1a1a' : '#006b5f' }}>
                                  {isOccupied ? 'Terisi' : 'Kosong'}
                                </Text>
                              </View>
                            </View>
                            <View className="flex-row gap-2">
                              <TouchableOpacity 
                                onPress={() => {
                                  setEditingRoom(k);
                                  setNomorKamar(k.nomorKamar || '');
                                  setHargaKamar((k.hargaSewa || k.harga || 0).toString());
                                  setFasilitasKamar(k.fasilitas || 'AC');
                                }}
                                className="p-1.5 bg-primary-container rounded-md"
                              >
                                <MaterialIcons name="edit" size={14} color="#000" />
                              </TouchableOpacity>
                              <TouchableOpacity 
                                onPress={() => handleDeleteKamar(k.idKamar || (k as any).id)}
                                className="p-1.5 bg-error-container rounded-md"
                              >
                                <MaterialIcons name="delete" size={14} color="#ba1a1a" />
                              </TouchableOpacity>
                            </View>
                          </View>
                          
                          {isOccupied && (
                            <View className="flex-row items-center gap-1.5 mb-2 bg-surface-container-low p-2 rounded-lg">
                              <MaterialIcons name="person" size={14} color="#464555" />
                              <Text className="text-xs font-bold text-on-surface">
                                Penyewa: {k.namaPenyewa || '(Data tidak ditemukan)'}
                              </Text>
                            </View>
                          )}

                          <View className="flex-row justify-between items-center">
                            <Text className="text-xs text-on-surface-variant">{k.fasilitas || 'AC'}</Text>
                            <Text className="text-xs font-bold text-primary">Rp {(k.hargaSewa || k.harga || 0).toLocaleString()}</Text>
                          </View>
                        </View>
                      );
                    })}
                    {kamars.filter(k => k.cabang && (k.cabang.idCabang === editingBranch.idCabang || (k.cabang as any).id === editingBranch.idCabang)).length === 0 && (
                      <Text className="text-xs text-on-surface-variant italic text-center py-2">Belum ada kamar.</Text>
                    )}
                  </View>

                  {/* Add/Edit Room Form */}
                  <View className="border-t border-outline-variant/20 pt-4 gap-3">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-sm font-bold text-on-surface">{editingRoom ? 'Edit Kamar' : 'Tambah Kamar Baru'}</Text>
                      {editingRoom && (
                        <TouchableOpacity onPress={() => {
                          setEditingRoom(null);
                          setNomorKamar('');
                          setHargaKamar('');
                          setFasilitasKamar('AC');
                        }}>
                          <Text className="text-xs text-primary font-bold">Batal Edit</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <TextInput
                      className="w-full px-4 py-2 bg-surface-container-highest rounded-lg text-on-surface h-[40px]"
                      placeholder="Nomor Kamar (misal: 101)"
                      value={nomorKamar}
                      onChangeText={setNomorKamar}
                    />
                    <TextInput
                      className="w-full px-4 py-2 bg-surface-container-highest rounded-lg text-on-surface h-[40px]"
                      placeholder="Harga Sewa (Rp)"
                      keyboardType="numeric"
                      value={hargaKamar}
                      onChangeText={setHargaKamar}
                    />

                    <View>
                      <Text className="text-xs text-on-surface-variant mb-2">Fasilitas</Text>
                      <View className="flex-row gap-2">
                        {['AC', 'NON_AC'].map(opt => (
                          <TouchableOpacity
                            key={opt}
                            onPress={() => setFasilitasKamar(opt)}
                            className={`flex-1 h-[40px] rounded-lg items-center justify-center border ${fasilitasKamar === opt ? 'bg-primary border-primary' : 'border-outline-variant/30'}`}
                          >
                            <Text className={`font-bold ${fasilitasKamar === opt ? 'text-on-primary' : 'text-on-surface'}`}>{opt}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={handleAddKamar}
                      className="bg-primary h-[45px] rounded-lg items-center justify-center shadow-sm"
                    >
                      <Text className="text-on-primary font-bold">{editingRoom ? 'Simpan Perubahan Kamar' : 'Tambah Kamar'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {editingBranch && (
                <TouchableOpacity
                  onPress={() => {
                    setIsModalVisible(false);
                    handleDelete(editingBranch.idCabang);
                  }}
                  className="w-full h-[52px] rounded-xl overflow-hidden shadow-sm active:scale-95 mb-3 bg-[#ffdad6] flex-row items-center justify-center gap-2"
                >
                  <MaterialIcons name="delete" size={20} color="#93000a" />
                  <Text className="text-[#93000a] font-bold text-[15px]">Hapus Cabang</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={handleSave}
                className="w-full h-[52px] rounded-xl overflow-hidden shadow-sm active:scale-95 mb-10"
              >
                <LinearGradient
                  colors={['#4f46e5', '#3525cd']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  className="w-full h-full justify-center items-center flex-row gap-2"
                >
                  <MaterialIcons name="save" size={20} color="#ffffff" />
                  <Text className="text-white font-bold text-[15px]">Simpan Cabang</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

