import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Alert, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { globalState } from '../_globalState';
import { API_BASE_URL } from '@/constants/config';

export default function CheckoutScreen() {
  const { roomId, roomNumber, price } = useLocalSearchParams();
  const router = useRouter();
  
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const paymentMethods = [
    { id: 'cash', name: 'Cash (Bayar di Tempat)', icon: 'payments' as const, color: '#2e7d32' },
    { id: 'transfer', name: 'Transfer Bank', icon: 'account-balance' as const, color: '#0055A5' },
  ];

  const handleConfirm = async () => {
    if (!selectedPayment) {
      Alert.alert('Pilih Metode Pembayaran', 'Silakan pilih metode pembayaran terlebih dahulu.');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/transaksi/booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${globalState.token}`
        },
        body: JSON.stringify({
          kamar: { id: parseInt(roomId as string) },
          nominal: parseInt(price as string) || 0,
          metodePembayaran: selectedPayment === 'cash' ? 'TUNAI' : 'ONLINE'
        })
      });

      const text = await response.text();
      let data: any = {};
      try {
        if (text) data = JSON.parse(text);
      } catch (e) {
        console.error("JSON Parse Error:", e, "Text:", text);
      }

      if (response.ok) {
        Alert.alert(
          'Konfirmasi Berhasil',
          'Permintaan sewa dan pilihan pembayaran Anda telah dikonfirmasi. Menunggu persetujuan admin.',
          [
            {
              text: 'OK',
              onPress: () => router.push('/(tabs)' as any),
            }
          ]
        );
      } else {
        const errorMsg = data.message || (text.length < 100 ? text : `Server Error (${response.status})`);
        Alert.alert('Gagal Melakukan Booking', `Pesan dari server: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat menghubungi server.');
    } finally {
      setLoading(false);
    }
  };

  const hargaInt = parseInt(price as string) || 0;
  const totalHarga = hargaInt;

  return (
    <View className="flex-1 bg-surface">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#fdfbff" />

      {/* Top Navigation */}
      <SafeAreaView edges={['top']} className="bg-surface">
        <View className="flex-row items-center px-6 py-4 border-b border-outline-variant/30 bg-surface">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full bg-surface-container-highest/80 active:scale-95"
          >
            <MaterialIcons name="arrow-back" size={24} color="#464555" />
          </TouchableOpacity>
          <Text className="flex-1 text-center font-black text-xl text-on-surface mr-10">
            Checkout
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Order Summary */}
        <View className="px-6 py-6 mt-2">
          <Text className="text-lg font-bold text-on-surface mb-4">Ringkasan Pesanan</Text>
          <View className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-sm">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-base text-on-surface-variant font-medium">Kamar</Text>
              <Text className="text-lg font-bold text-on-surface">Kamar {roomNumber}</Text>
            </View>
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-base text-on-surface-variant font-medium">Durasi Sewa</Text>
              <Text className="text-base font-bold text-on-surface">1 Bulan</Text>
            </View>
            
            <View className="h-[1px] bg-outline-variant/30 my-3" />
            
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-base text-on-surface font-bold">Total Pembayaran</Text>
              <Text className="text-xl font-black text-primary">Rp {totalHarga.toLocaleString('id-ID')}</Text>
            </View>
          </View>
        </View>

        {/* Payment Methods */}
        <View className="px-6 py-2">
          <Text className="text-lg font-bold text-on-surface mb-4">Pilih Metode Pembayaran</Text>
          
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              activeOpacity={0.7}
              onPress={() => setSelectedPayment(method.id)}
              className={`flex-row items-center p-4 mb-3 rounded-2xl border ${selectedPayment === method.id ? 'border-primary bg-primary/5' : 'border-outline-variant/30 bg-surface-container-lowest'}`}
            >
              <View className="w-10 h-10 rounded-full bg-surface-container-high items-center justify-center mr-4">
                <MaterialIcons name={method.icon} size={20} color={method.color} />
              </View>
              <Text className="flex-1 text-base font-semibold text-on-surface">{method.name}</Text>
              <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${selectedPayment === method.id ? 'border-primary' : 'border-outline-variant'}`}>
                {selectedPayment === method.id && <View className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </View>
            </TouchableOpacity>
          ))}

          {selectedPayment === 'transfer' && (
            <View className="mt-4 p-4 bg-primary-container/20 rounded-2xl border border-primary/20">
              <Text className="text-sm text-on-surface-variant font-bold mb-2">Silakan transfer ke rekening berikut:</Text>
              <View className="bg-surface p-4 rounded-xl border border-outline-variant/30 flex-row items-center justify-between">
                <View>
                  <Text className="text-xs text-on-surface-variant font-bold uppercase mb-1">Bank BCA</Text>
                  <Text className="text-lg font-black text-on-surface tracking-widest">8732 1234 5678</Text>
                  <Text className="text-sm font-medium text-on-surface-variant mt-1">a.n. Pemilik Kos</Text>
                </View>
                <TouchableOpacity className="p-2 bg-surface-container-high rounded-full">
                  <MaterialIcons name="content-copy" size={20} color="#3525cd" />
                </TouchableOpacity>
              </View>
              <Text className="text-xs text-on-surface-variant mt-3 leading-relaxed">
                * Pembayaran akan dikonfirmasi secara manual oleh pemilik kos setelah Anda menekan tombol konfirmasi.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Fixed Bottom Action Area */}
      <View
        className="absolute bottom-0 w-full bg-surface-container-lowest border-t border-outline-variant/20 px-6 pt-4 pb-8"
        style={Platform.OS === 'android' ? { elevation: 8 } : { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 12 }}
      >
        <TouchableOpacity
          onPress={handleConfirm}
          className={`w-full h-14 rounded-xl flex-row items-center justify-center gap-2 active:scale-95 ${(selectedPayment && !loading) ? 'bg-primary' : 'bg-surface-variant'}`}
          disabled={!selectedPayment || loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Text className={`font-bold text-lg ${selectedPayment ? 'text-on-primary' : 'text-on-surface-variant'}`}>
                Konfirmasi Sewa
              </Text>
              {selectedPayment && <MaterialIcons name="check-circle" size={22} color="#ffffff" />}
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
