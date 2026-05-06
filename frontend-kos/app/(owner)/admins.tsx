import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '@/constants/config';
import { globalState } from '../_globalState';
import { LinearGradient } from 'expo-linear-gradient';

interface Admin {
  idUser: number;
  nama: string;
  email: string;
  noTelepon: string;
  cabang?: {
    idCabang: number;
    namaCabang: string;
  };
}

export default function AdminManagementScreen() {
  const router = useRouter();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [noTelepon, setNoTelepon] = useState('');

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/admin`, {
        headers: { 'Authorization': `Bearer ${globalState.token}` }
      });
      if (response.ok) {
        const json = await response.json();
        setAdmins(json.data || []);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Gagal mengambil data admin");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAddAdmin = async () => {
    if (!nama || !email || !password) {
      Alert.alert("Error", "Nama, Email, dan Password wajib diisi");
      return;
    }

    setIsSaving(true);
    try {
      // Endpoint register untuk Admin (Owner yang membuatkan)
      // Kita asumsikan ada endpoint POST /api/users/admin
      const response = await fetch(`${API_BASE_URL}/users/admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${globalState.token}`
        },
        body: JSON.stringify({
          nama,
          email,
          password,
          noTelepon
        })
      });

      if (response.ok) {
        Alert.alert("Sukses", "Akun Admin berhasil dibuat");
        setIsModalVisible(false);
        setNama('');
        setEmail('');
        setPassword('');
        setNoTelepon('');
        fetchAdmins();
      } else {
        const err = await response.json();
        Alert.alert("Gagal", err.message || "Gagal membuat akun admin");
      }
    } catch (error) {
      Alert.alert("Error", error + "Terjadi kesalahan server");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAdmin = (id: number) => {
    Alert.alert("Konfirmasi", "Hapus akun admin ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await fetch(`${API_BASE_URL}/users/admin/${id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${globalState.token}` }
            });
            if (response.ok) {
              Alert.alert("Sukses", "Admin berhasil dihapus");
              fetchAdmins();
            }
          } catch (error) {
            Alert.alert("Error", "Gagal menghapus admin");
          }
        }
      }
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f8f9fe]" edges={['top', 'left', 'right']}>

      {/* Header */}
      <View className="px-6 pb-4 flex-row items-center gap-4">
        <TouchableOpacity onPress={() => router.push('/(owner)/profile' as any)} className="p-2 -ml-2">
          <MaterialIcons name="arrow-back" size={28} color="#1a1a1a" />
        </TouchableOpacity>
        <Text className="text-2xl font-black text-black">Manajemen Admin</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>

        {/* Intro Card */}
        <View className="bg-primary rounded-3xl p-6 mb-8 shadow-lg shadow-primary/30">
          <Text className="text-white/80 font-bold text-xs uppercase tracking-[2px] mb-2">Pusat Kendali</Text>
          <Text className="text-white text-xl font-black mb-1">Kelola Tim Admin Anda</Text>
          <Text className="text-white/70 text-sm leading-5">Daftarkan akun admin untuk membantu Anda mengelola setiap cabang kos secara efisien.</Text>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          onPress={() => setIsModalVisible(true)}
          className="mb-8 rounded-2xl overflow-hidden shadow-sm active:scale-95"
        >
          <LinearGradient
            colors={['#4f46e5', '#3525cd']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            className="h-[56px] flex-row items-center justify-center gap-2"
          >
            <MaterialIcons name="person-add" size={22} color="#ffffff" />
            <Text className="text-white font-bold text-lg">Tambah Admin Baru</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Admin List */}
        <Text className="text-xs font-black text-[#777587] uppercase tracking-[2px] mb-4 ml-1">Daftar Admin Aktif</Text>

        {isLoading ? (
          <ActivityIndicator size="large" color="#3525cd" className="mt-10" />
        ) : (
          <View className="gap-4 pb-10">
            {admins.map((admin) => (
              <View key={admin.idUser} className="bg-white rounded-2xl p-5 border border-surface-variant/10 shadow-sm">
                <View className="flex-row justify-between items-start">
                  <View className="flex-row items-center gap-4">
                    <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
                      <Text className="text-primary font-black text-lg">{admin.nama.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View>
                      <Text className="font-bold text-lg text-on-surface">{admin.nama}</Text>
                      <Text className="text-on-surface-variant text-sm">{admin.email}</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteAdmin(admin.idUser)} className="p-2">
                    <MaterialIcons name="delete-outline" size={22} color="#ba1a1a" />
                  </TouchableOpacity>
                </View>

                <View className="mt-4 pt-4 border-t border-surface-variant/5 flex-row items-center justify-between">
                  <View className="flex-row items-center gap-1.5">
                    <MaterialIcons name="domain" size={16} color="#777587" />
                    <Text className="text-on-surface-variant text-xs font-medium">
                      {admin.cabang ? `Menjaga: ${admin.cabang.namaCabang}` : 'Belum ditugaskan'}
                    </Text>
                  </View>
                  {admin.noTelepon ? (
                    <View className="flex-row items-center gap-1.5">
                      <MaterialIcons name="phone" size={14} color="#777587" />
                      <Text className="text-on-surface-variant text-xs">{admin.noTelepon}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            ))}
            {admins.length === 0 && (
              <View className="items-center py-20">
                <MaterialIcons name="people-outline" size={64} color="#d0d0d0" />
                <Text className="text-[#a0a0a0] mt-4 font-medium text-lg text-center px-10">Belum ada admin yang terdaftar.</Text>
              </View>
            )}
          </View>
        )}

      </ScrollView>

      {/* Add Admin Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-black/50">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="bg-white rounded-t-[40px] p-8 shadow-xl"
          >
            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-2xl font-black text-on-surface">Tambah Admin</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <MaterialIcons name="close" size={28} color="#777587" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="mb-6">
              <View className="gap-6">
                <View>
                  <Text className="text-xs font-black text-primary uppercase tracking-[2px] mb-3 ml-1">Nama Admin</Text>
                  <View className="flex-row items-center bg-[#f0f2f9] rounded-2xl px-5 h-[60px]">
                    <MaterialIcons name="person" size={22} color="#3525cd" />
                    <TextInput
                      className="flex-1 ml-4 text-on-surface font-bold text-base"
                      placeholder="Masukkan nama lengkap"
                      value={nama}
                      onChangeText={setNama}
                    />
                  </View>
                </View>

                <View>
                  <Text className="text-xs font-black text-primary uppercase tracking-[2px] mb-3 ml-1">Email (Username)</Text>
                  <View className="flex-row items-center bg-[#f0f2f9] rounded-2xl px-5 h-[60px]">
                    <MaterialIcons name="mail" size={22} color="#3525cd" />
                    <TextInput
                      className="flex-1 ml-4 text-on-surface font-bold text-base"
                      placeholder="admin@email.com"
                      autoCapitalize="none"
                      keyboardType="email-address"
                      value={email}
                      onChangeText={setEmail}
                    />
                  </View>
                </View>

                <View>
                  <Text className="text-xs font-black text-primary uppercase tracking-[2px] mb-3 ml-1">Password</Text>
                  <View className="flex-row items-center bg-[#f0f2f9] rounded-2xl px-5 h-[60px]">
                    <MaterialIcons name="lock" size={22} color="#3525cd" />
                    <TextInput
                      className="flex-1 ml-4 text-on-surface font-bold text-base"
                      placeholder="Minimal 6 karakter"
                      secureTextEntry
                      value={password}
                      onChangeText={setPassword}
                    />
                  </View>
                </View>

                <View>
                  <Text className="text-xs font-black text-primary uppercase tracking-[2px] mb-3 ml-1">Nomor Telepon (Opsional)</Text>
                  <View className="flex-row items-center bg-[#f0f2f9] rounded-2xl px-5 h-[60px]">
                    <MaterialIcons name="phone" size={22} color="#3525cd" />
                    <TextInput
                      className="flex-1 ml-4 text-on-surface font-bold text-base"
                      placeholder="0812xxxx"
                      keyboardType="phone-pad"
                      value={noTelepon}
                      onChangeText={setNoTelepon}
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              onPress={handleAddAdmin}
              disabled={isSaving}
              className="w-full h-[60px] rounded-2xl overflow-hidden shadow-sm active:scale-95 mb-4"
            >
              <LinearGradient
                colors={['#4f46e5', '#3525cd']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                className="w-full h-full justify-center items-center"
              >
                {isSaving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-lg">Buat Akun Admin</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
