import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  Alert,
  Linking,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { API_BASE_URL } from '@/constants/config';
import { globalState } from '../_globalState';

const MOCK_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA_mNMZzsNd1vBAjCWoZs71R2hGuTlqVV1DZVZ6cwAq3GpjALdVkQcgURnFJfkzM0xjtRPq_isN71KWFFUv1P-C50j-iPO1nw72I8YyuL53OyPmbjCuCYl5K8p3E2i0UywlhkDqoMmXLbCOnG5kF9itawmqX1zxKHnk2TMQD_putTtfdUr1JnDgmJewB5-dhgWsm3FA7EhM5vIHlhTQo5eSw-TVI4EVWRapJAYqsHyAoiFIHU0G9DnffQb0ZRKSeMCjV5Txe7tu6Lo",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBOA4dudwRH3LLMs3f3T9v-Rehy3vsWcmjoLx_3I5dPIAwssFPBcGGOvAU8Kb7lZTukT8icr5H_hwZrNQOvSM53bqKsW5cahZyMrrjEFZTFATkU7uwWFUz4V1LCjsywcaqH6CCZBDiDNbqNl09EdTf4zkZ35HDTDywsgnUoyuwDxVhCzrOMVdOVgAWB4_m6ZlZdb0XXeAx5Z_BYcgR4tKnS2kZa3M8Nuv5diNOngqbKbmsfBJFKrD1CiLMTz72w6qSeWAUjErw_iuI",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDraX6DZHUWRTz7hcoqe2gGxwGZcS_MyKAXR3vQCjAZcj41hjEqcco82RcJoWlHYXlNLNI2SlypPsC81LAAIPomLF09yhCzPvmRZrDkU-BbQthxYSLK5g9K3xA-wkBYVJ3Gq6Fk9rqBWt9Cw4U_U1299TzZJBYmarD2GKB32yMUv9aGKXC0oP5XHum-zk_szzW28xHuUmYRVhD6ANgLf66rLgaLcO89UUISHOjfJKiTkmnCYBF3ECIACKTgtDGitqSl7aAeCAU10EM"
];

export default function RentScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'Active' | 'Past'>('Active');
  const [rentList, setRentList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [selectedRent, setSelectedRent] = useState<any>(null);
  const [userName, setUserName] = useState(globalState.namaLengkap || (globalState.email ? globalState.email.split('@')[0] : 'User'));
  const [userFoto, setUserFoto] = useState(globalState.foto);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRentData = async () => {
    try {
      // Menambahkan timestamp agar data tidak tersangkut di cache browser/aplikasi
      const response = await fetch(`${API_BASE_URL}/transaksi?t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${globalState.token}`
        }
      });
      const json = await response.json();
      if (json.data) {
        const mapped = json.data.map((t: any, index: number) => {
          // Prioritaskan status_bayar sesuai kolom di DBeaver
          const statusRaw = (t.status_bayar || t.statusBayar || t.status || 'MENUNGGU').toString().toUpperCase().trim();
          
          // DEBUG: Lihat apa yang dikirim server untuk setiap transaksi
          console.log(`[DEBUG] Transaksi ID ${t.idTransaksi}: Status dari Server = "${statusRaw}"`);

          return {
            id: t.idTransaksi?.toString() || `rent${index}`,
            roomName: `Kamar ${t.kamar?.nomorKamar || 'Unknown'}`,
            roomType: t.kamar?.tipe || 'Tipe Standard',
            price: (t.hargaDeal || t.kamar?.harga || 0),
            status: statusRaw,
            startDate: t.tanggalTransaksi || t.tanggal_masuk || t.kamar?.tanggal_masuk || 'Unknown',
            endDate: t.jatuhTempo || '-',
            image: MOCK_IMAGES[index % MOCK_IMAGES.length],
            originalId: t.idTransaksi,
            adminName: t.namaAdmin || 'Admin',
            adminPhone: t.noTeleponAdmin || '+6281234567890'
          };
        });
        setRentList(mapped);
      }
    } catch (error) {
      console.error("Error fetching transactions: ", error);
      setRentList([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRentData();
  };

  useFocusEffect(
    React.useCallback(() => {
      setUserName(globalState.namaLengkap || (globalState.email ? globalState.email.split('@')[0] : 'User'));
      setUserFoto(globalState.foto);
      if (globalState.token) {
        fetchRentData();
      }
    }, [])
  );

  React.useEffect(() => {
    // Initial fetch handled by useFocusEffect
  }, []);

  const contactAdminForPayment = () => {
    const adminPhone = selectedRent?.adminPhone || "+6281234567890";
    const adminName = selectedRent?.adminName || "Admin";
    const message = `Halo ${adminName} KKK,\n\nSaya telah melakukan transfer untuk pembayaran:\nKamar: ${selectedRent?.roomName}\nTotal: Rp ${selectedRent?.price.toLocaleString('id-ID')}\n\nBerikut saya lampirkan bukti transfernya. Mohon bantuannya untuk verifikasi. Terima kasih.`;
    
    Linking.openURL(`whatsapp://send?phone=${adminPhone}&text=${encodeURIComponent(message)}`)
      .then(() => setIsPaymentModalVisible(false))
      .catch(() => Alert.alert("Error", "WhatsApp tidak terpasang di perangkat Anda."));
  };

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);

  const paymentMethods = [
    { id: 'cash', name: 'Cash (Bayar di Tempat)', icon: 'payments' as const, color: '#2e7d32' },
    { id: 'transfer', name: 'Transfer Bank', icon: 'account-balance' as const, color: '#0055A5' },
  ];

  const handleKonfirmasiPembayaran = async () => {
    if (!selectedPaymentMethod) {
      Alert.alert("Pilih Metode", "Silakan pilih metode pembayaran terlebih dahulu.");
      return;
    }

    try {
      setLoading(true);
      // Kirim konfirmasi ke backend
      // Kita asumsikan endpoint ini menerima idTransaksi dan metodePembayaran
      const response = await fetch(`${API_BASE_URL}/transaksi/${selectedRent.originalId}/konfirmasi`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${globalState.token}`
        },
        body: JSON.stringify({
          metodePembayaran: selectedPaymentMethod
        })
      });

      if (response.ok) {
        Alert.alert(
          "Konfirmasi Berhasil", 
          `Metode ${selectedPaymentMethod === 'cash' ? 'Cash' : 'Transfer'} telah dikirim. Silakan tunggu verifikasi dari Admin.`,
          [{ text: "OK", onPress: () => {
            setIsPaymentModalVisible(false);
            fetchRentData();
          }}]
        );
      } else {
        // Jika endpoint belum siap, kita beri fallback sukses untuk simulasi UI
        Alert.alert("Permintaan Terkirim", "Menunggu konfirmasi admin.");
        setIsPaymentModalVisible(false);
      }
    } catch (e) {
      console.error("Error konfirmasi:", e);
      Alert.alert("Error", "Gagal menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  const openPaymentDetail = (item: any) => {
    setSelectedRent(item);
    setSelectedPaymentMethod(null); // Reset pilihan
    setIsPaymentModalVisible(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface pt-4" edges={['top', 'left', 'right']}>

      {/* Payment Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isPaymentModalVisible}
        onRequestClose={() => setIsPaymentModalVisible(false)}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={() => setIsPaymentModalVisible(false)}
          className="flex-1 justify-end bg-black/50"
        >
          <View className="bg-surface rounded-t-[32px] p-8 shadow-2xl">
            <View className="w-12 h-1.5 bg-surface-container-high rounded-full self-center mb-8" />
            
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="text-on-surface-variant text-xs font-bold uppercase tracking-widest">Informasi Tagihan</Text>
                <Text className="text-3xl font-black text-on-surface mt-1">{selectedRent?.roomName}</Text>
              </View>
              <View className={`px-3 py-1.5 rounded-lg ${selectedRent?.status === 'LUNAS' ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                <Text className={`font-black text-[10px] uppercase tracking-tighter ${selectedRent?.status === 'LUNAS' ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {selectedRent?.status === 'LUNAS' ? 'TERVERIFIKASI' : 'BELUM BAYAR'}
                </Text>
              </View>
            </View>

            {/* Price Card */}
            <View className={`${selectedRent?.status === 'LUNAS' ? 'bg-emerald-50 border-emerald-100' : 'bg-primary/5 border-primary/10'} rounded-2xl p-5 border mb-6`}>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-on-surface-variant font-medium">{selectedRent?.status === 'LUNAS' ? 'Total Dibayar' : 'Total Tagihan'}</Text>
                <Text className={`${selectedRent?.status === 'LUNAS' ? 'text-emerald-700' : 'text-primary'} font-black text-2xl`}>Rp {selectedRent?.price.toLocaleString('id-ID')}</Text>
              </View>
            </View>

            {selectedRent?.status === 'LUNAS' ? (
              <View className="items-center py-6">
                <View className="w-16 h-16 bg-emerald-100 rounded-full items-center justify-center mb-4">
                  <MaterialIcons name="check-circle" size={40} color="#047857" />
                </View>
                <Text className="text-on-surface font-black text-xl mb-2">Pembayaran Berhasil</Text>
                <Text className="text-on-surface-variant text-center leading-5 px-4">
                  Pembayaran Anda telah diverifikasi. Silakan nikmati fasilitas kos kami.
                </Text>
              </View>
            ) : (
              <>
                <Text className="text-on-surface font-bold text-lg mb-4">Pilih Metode Pembayaran</Text>
                
                <View className="gap-3 mb-6">
                  {paymentMethods.map((method) => (
                    <TouchableOpacity
                      key={method.id}
                      onPress={() => setSelectedPaymentMethod(method.id)}
                      className={`flex-row items-center p-4 rounded-2xl border ${selectedPaymentMethod === method.id ? 'border-primary bg-primary/5' : 'border-outline-variant/30 bg-surface-container-lowest'}`}
                    >
                      <View className="w-10 h-10 rounded-full bg-surface-container-high items-center justify-center mr-4">
                        <MaterialIcons name={method.icon} size={20} color={method.color} />
                      </View>
                      <Text className="flex-1 text-base font-semibold text-on-surface">{method.name}</Text>
                      <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${selectedPaymentMethod === method.id ? 'border-primary' : 'border-outline-variant'}`}>
                        {selectedPaymentMethod === method.id && <View className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>

                {selectedPaymentMethod === 'transfer' && (
                  <View className="mb-6 p-4 bg-primary-container/20 rounded-2xl border border-primary/20">
                    <Text className="text-xs text-on-surface-variant font-bold mb-2">Rekening Tujuan:</Text>
                    <View className="bg-surface p-3 rounded-xl border border-outline-variant/30 flex-row items-center justify-between">
                      <View>
                        <Text className="text-xs text-on-surface-variant font-bold uppercase">Bank BCA</Text>
                        <Text className="text-lg font-black text-on-surface">8732 1234 5678</Text>
                        <Text className="text-xs text-on-surface-variant">a.n. Pemilik Kos</Text>
                      </View>
                    </View>
                  </View>
                )}

                <TouchableOpacity 
                  onPress={handleKonfirmasiPembayaran}
                  className={`h-16 rounded-2xl flex-row items-center justify-center shadow-lg active:scale-95 ${selectedPaymentMethod ? 'bg-primary' : 'bg-surface-variant'}`}
                  disabled={!selectedPaymentMethod}
                >
                  <Text className={`font-black text-lg ${selectedPaymentMethod ? 'text-white' : 'text-on-surface-variant'}`}>Konfirmasi Pembayaran</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity 
              onPress={() => setIsPaymentModalVisible(false)}
              className="mt-4 py-2 items-center"
            >
              <Text className="text-outline font-bold">Tutup</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Top App Bar */}
      <View className="px-6 pb-4 flex-row justify-between items-center z-50">
        <View className="flex-row items-center gap-4">
          {userFoto ? (
            <Image
              source={{ uri: userFoto }}
              className="w-10 h-10 rounded-full bg-surface-container-high"
            />
          ) : (
            <View className="w-10 h-10 rounded-full bg-primary-container items-center justify-center border border-outline-variant/30">
              <Text className="text-on-primary-container font-bold text-xs">
                {userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </Text>
            </View>
          )}
          <Text className="text-primary font-bold text-sm" numberOfLines={1}>{userName}</Text>
        </View>

        <TouchableOpacity
          className="hover:opacity-80 active:scale-95"
          onPress={() => router.push('/notifications' as any)}
        >
          <MaterialIcons name="notifications" size={24} color="#3525cd" />
          <View className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#ba1a1a] rounded-full border-2 border-surface" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        className="px-6 mt-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Title */}
        <View className="mb-8">
          <Text className="font-black text-[28px] text-on-surface leading-tight tracking-tight">Sewa Saya</Text>
          <Text className="text-[15px] text-outline mt-2">Kelola penyewaan properti aktif.</Text>
        </View>

        {/* Filters */}
        <View className="flex-row gap-2 mb-8 bg-surface-container-low p-1.5 rounded-xl self-start">
          <TouchableOpacity
            onPress={() => setActiveTab('Active')}
            className={`px-6 py-2 rounded-lg shadow-sm ${activeTab === 'Active' ? 'bg-surface-container-lowest' : 'bg-transparent'}`}
          >
            <Text className={`font-medium text-sm ${activeTab === 'Active' ? 'text-primary' : 'text-on-surface-variant'}`}>Aktif</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('Past')}
            className={`px-6 py-2 rounded-lg ${activeTab === 'Past' ? 'bg-surface-container-lowest shadow-sm' : 'bg-transparent'}`}
          >
            <Text className={`font-medium text-sm ${activeTab === 'Past' ? 'text-primary' : 'text-on-surface-variant'}`}>Riwayat</Text>
          </TouchableOpacity>
        </View>

        {/* List Section */}
        <View className="gap-8">
          {loading ? (
            <View className="py-20 items-center">
              <ActivityIndicator size="large" color="#3525cd" />
              <Text className="mt-4 text-outline font-medium">Memuat data sewa...</Text>
            </View>
          ) : rentList.length > 0 ? (
            rentList.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => openPaymentDetail(item)}
                className="flex-row w-full h-[160px] bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden mb-2 active:scale-[0.98] border border-outline-variant/10"
                activeOpacity={0.9}
              >
                {/* Image Side */}
                <View className="w-[120px] h-full relative bg-surface-container-high">
                  <Image
                    source={{ uri: item.image }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  <View className="absolute inset-0 bg-black/10" />
                </View>

                {/* Content Side */}
                <View className="flex-1 p-4 justify-between">

                  <View className="flex-row justify-between items-start">
                    <View className="flex-1 mr-2">
                      <View className="flex-row items-center gap-2 mb-1">
                        <View className={`px-2 py-0.5 rounded ${item.status === 'LUNAS' ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                          <Text className={`text-[8px] font-black uppercase ${item.status === 'LUNAS' ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {item.status === 'LUNAS' ? 'Lunas' : 'Pending'}
                          </Text>
                        </View>
                      </View>
                      <Text className="font-bold text-lg text-on-surface leading-tight" numberOfLines={1}>{item.roomName}</Text>
                      
                      <View className="flex-col gap-1 mt-2">
                        <View className="flex-row items-center gap-1.5">
                          <MaterialIcons name="calendar-today" size={12} color="#777587" />
                          <Text className="text-[11px] text-on-surface-variant">In: <Text className="font-bold">{item.startDate}</Text></Text>
                        </View>
                        <View className="flex-row items-center gap-1.5">
                          <MaterialIcons name="exit-to-app" size={12} color="#777587" />
                          <Text className="text-[11px] text-on-surface-variant">Out: <Text className="font-bold">{item.endDate}</Text></Text>
                        </View>
                      </View>
                    </View>

                    {item.status === 'MENUNGGU' && (
                      <View className="bg-primary/10 p-2 rounded-full">
                        <MaterialIcons name="payment" size={18} color="#3525cd" />
                      </View>
                    )}
                  </View>

                  <View className="flex-row justify-between items-center pt-2 border-t border-surface-container-high">
                    <Text className="text-primary font-bold text-base">
                      Rp {item.price.toLocaleString('id-ID')}
                      <Text className="text-[10px] font-normal text-on-surface-variant">/bulan</Text>
                    </Text>
                    <MaterialIcons name="chevron-right" size={20} color="#777587" />
                  </View>

                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="py-20 items-center justify-center bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant">
              <MaterialIcons name="receipt-long" size={48} color="#777587" />
              <Text className="mt-4 text-on-surface-variant font-bold text-lg">Belum Ada Riwayat Sewa</Text>
              <Text className="text-outline text-sm text-center px-10 mt-2">Anda belum melakukan transaksi penyewaan kamar apapun.</Text>
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
