import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { API_BASE_URL } from '@/constants/config';
import { globalState } from '../_globalState';

export default function AdminExpensesScreen() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminProfile, setAdminProfile] = useState<any>(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [kategori, setKategori] = useState('LAINNYA');
  const [nominal, setNominal] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const KATEGORI_OPTIONS = ['PERBAIKAN', 'LISTRIK', 'AIR', 'LAINNYA'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Get Admin Profile for Cabang ID
      const profileRes = await fetch(`${API_BASE_URL}/users/profile`, {
        headers: { 'Authorization': `Bearer ${globalState.token}` }
      });
      const profileJson = await profileRes.json();
      setAdminProfile(profileJson.data || {});

      // Fetch Expenses
      const expensesRes = await fetch(`${API_BASE_URL}/pengeluaran`, {
        headers: { 'Authorization': `Bearer ${globalState.token}` }
      });
      const expensesJson = await expensesRes.json();
      setExpenses(expensesJson.data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveExpense = async () => {
    if (!nominal || !deskripsi) {
      Alert.alert('Error', 'Nominal dan Deskripsi wajib diisi.');
      return;
    }

    const cabangId = adminProfile?.cabang?.idCabang || adminProfile?.cabang?.id;
    if (!cabangId) {
      Alert.alert('Error', 'Data cabang tidak ditemukan. Tidak dapat menambah pengeluaran.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/pengeluaran`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${globalState.token}`
        },
        body: JSON.stringify({
          cabang: { idCabang: cabangId },
          kategori,
          nominal: parseInt(nominal),
          deskripsi
        })
      });

      if (response.ok) {
        Alert.alert('Sukses', 'Pengeluaran berhasil dicatat');
        setIsModalVisible(false);
        setKategori('LAINNYA');
        setNominal('');
        setDeskripsi('');
        fetchData();
      } else {
        const errJson = await response.json();
        Alert.alert('Gagal', errJson.message || 'Gagal menyimpan pengeluaran');
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      Alert.alert('Error', 'Terjadi kesalahan server');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface pt-4" edges={['top', 'left', 'right']}>

      {/* Top App Bar */}
      <View className="px-6 pb-4 flex-row justify-between items-center z-50">
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-primary-container items-center justify-center border border-outline-variant/30 mr-3">
            <MaterialIcons name="account-balance-wallet" size={20} color="#3525cd" />
          </View>
          <Text className="font-black text-2xl text-black tracking-tighter">Pengeluaran</Text>
        </View>
      </View>
      <View className="bg-surface-container-high/50 h-[1px] w-full" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        className="px-6 flex-1 mt-4"
      >
        <View className="mb-6">
          <Text className="font-black text-[28px] text-on-surface leading-tight tracking-tight">Catat Biaya Pengeluaran</Text>
          <Text className="text-sm text-on-surface-variant mt-1">
            {adminProfile?.cabang?.namaCabang ? `Cabang: ${adminProfile.cabang.namaCabang}` : 'Memuat data cabang...'}
          </Text>
        </View>

        {loading ? (
          <View className="py-20 items-center">
            <ActivityIndicator size="large" color="#4f46e5" />
          </View>
        ) : expenses.length > 0 ? (
          expenses.map((exp) => (
            <View key={exp.idPengeluaran} className="bg-surface-container-lowest rounded-xl p-4 mb-4 border border-outline-variant/20 shadow-sm flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="font-bold text-lg text-on-surface">{exp.kategori}</Text>
                <Text className="text-on-surface-variant text-sm mt-1">{exp.deskripsi}</Text>
                <Text className="text-xs text-outline mt-1">{exp.tanggal}</Text>
              </View>
              <Text className="font-black text-error text-lg tracking-tight">
                - Rp {(exp.nominal / 1000).toFixed(0)}k
              </Text>
            </View>
          ))
        ) : (
          <View className="py-20 items-center">
            <MaterialIcons name="receipt-long" size={48} color="#777587" />
            <Text className="mt-4 text-on-surface-variant font-medium">Belum ada pengeluaran dicatat</Text>
          </View>
        )}
      </ScrollView>

      {/* FAB: Add Expense */}
      <TouchableOpacity
        onPress={() => setIsModalVisible(true)}
        className="absolute right-6 bottom-24 w-14 h-14 rounded-xl items-center justify-center shadow-lg z-40 active:scale-95 bg-primary"
      >
        <MaterialIcons name="add" size={24} color="#ffffff" />
      </TouchableOpacity>

      {/* Add Expense Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="bg-surface rounded-t-3xl p-6 shadow-xl"
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-black text-on-surface">Tambah Pengeluaran</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#777587" />
              </TouchableOpacity>
            </View>

            <View className="space-y-4 mb-8">
              {/* Kategori */}
              <View>
                <Text className="text-xs font-bold text-primary uppercase mb-2">Kategori</Text>
                <View className="flex-row flex-wrap">
                  {KATEGORI_OPTIONS.map(opt => (
                    <TouchableOpacity
                      key={opt}
                      onPress={() => setKategori(opt)}
                      className={`px-4 py-2 rounded-full border mr-2 mb-2 ${kategori === opt ? 'bg-primary border-primary' : 'bg-surface border-outline-variant'}`}
                    >
                      <Text className={kategori === opt ? 'text-white font-bold' : 'text-on-surface font-medium'}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Nominal */}
              <View>
                <Text className="text-xs font-bold text-primary uppercase mb-2">Nominal (Rp)</Text>
                <TextInput
                  className="w-full px-4 py-3 bg-surface-container-highest rounded-xl text-on-surface h-[50px] font-bold"
                  placeholder="Misal: 150000"
                  keyboardType="numeric"
                  value={nominal}
                  onChangeText={setNominal}
                />
              </View>

              {/* Deskripsi */}
              <View>
                <Text className="text-xs font-bold text-primary uppercase mb-2">Deskripsi</Text>
                <TextInput
                  className="w-full px-4 py-3 bg-surface-container-highest rounded-xl text-on-surface h-[50px]"
                  placeholder="Misal: Beli lampu Philips 2 buah"
                  value={deskripsi}
                  onChangeText={setDeskripsi}
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSaveExpense}
              disabled={isSaving}
              className="bg-primary h-14 rounded-xl items-center justify-center flex-row"
            >
              {isSaving ? <ActivityIndicator color="#fff" /> : (
                <>
                  <MaterialIcons name="save" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text className="text-white font-bold text-lg">Simpan</Text>
                </>
              )}
            </TouchableOpacity>
            <View className="h-8" />
          </KeyboardAvoidingView>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
