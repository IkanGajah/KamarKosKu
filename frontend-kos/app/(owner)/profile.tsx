import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { globalState } from '../_globalState';
import { API_BASE_URL } from '@/constants/config';

export default function OwnerProfileScreen() {
  const router = useRouter();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [profileData, setProfileData] = useState({
    nama: globalState.namaLengkap || '',
    email: globalState.email || '',
    noTelepon: globalState.noTelepon || '',
    foto: globalState.foto || ''
  });
  const [editData, setEditData] = useState({
    nama: '',
    noTelepon: ''
  });

  const fetchProfile = async () => {
    try {
      if (!globalState.token) return null;
      const res = await fetch(`${API_BASE_URL}/users/profile`, {
        headers: { 'Authorization': `Bearer ${globalState.token}` }
      });
      if (res.ok) {
        const json = await res.json();
        const p = json.data;

        const newName = p.nama || globalState.namaLengkap || (globalState.email ? globalState.email.split('@')[0] : 'Owner');
        const newPhone = p.noTelepon || globalState.noTelepon || '';
        const newFoto = p.foto || globalState.foto || '';

        globalState.namaLengkap = newName;
        globalState.noTelepon = newPhone;
        globalState.foto = newFoto;

        const newProfile = {
          nama: newName,
          email: p.email || globalState.email || '',
          noTelepon: newPhone,
          foto: newFoto
        };

        setProfileData(newProfile);
        setEditData({
          nama: newName,
          noTelepon: newPhone
        });
        return newProfile;
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleOpenEdit = async () => {
    setIsFetching(true);
    const freshProfile = await fetchProfile();
    const current = freshProfile || profileData;
    setEditData({
      nama: current.nama || '',
      noTelepon: current.noTelepon || ''
    });
    setIsFetching(false);
    setIsEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!editData.nama || !editData.noTelepon) {
      Alert.alert("Error", "Nama dan Nomor Telepon tidak boleh kosong.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${globalState.token}`
        },
        body: JSON.stringify({
          nama: editData.nama,
          noTelepon: editData.noTelepon
        })
      });

      if (res.ok) {
        await fetchProfile();
        Alert.alert("Sukses", "Profil berhasil diperbarui.");
        setIsEditModalVisible(false);
      } else {
        const json = await res.json();
        Alert.alert("Gagal", json.message || "Gagal memperbarui profil.");
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Gagal menghubungi server.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Konfirmasi Logout",
      "Apakah Anda yakin ingin keluar?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            globalState.token = '';
            globalState.email = '';
            globalState.role = '';
            globalState.namaLengkap = '';
            globalState.foto = '';
            globalState.noTelepon = '';
            router.replace('/login' as any);
          }
        }
      ]
    );
  };

  const userInitials = (globalState.namaLengkap || globalState.email || 'O')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <SafeAreaView className="flex-1 bg-[#f8f9fe] pt-4" edges={['top', 'left', 'right']}>

      {/* Top App Bar */}
      <View className="px-6 pb-4 flex-row justify-between items-center z-50">
        <View className="flex-row items-center gap-4">
          {profileData.foto ? (
            <Image
              source={{ uri: profileData.foto }}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <View className="w-10 h-10 rounded-full bg-primary items-center justify-center border border-outline-variant/30">
              <Text className="text-white font-bold text-xs">{userInitials}</Text>
            </View>
          )}
          <Text className="text-black font-black text-2xl tracking-tight">Profile Saya</Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/notifications' as any)}
          className="hover:opacity-80 active:scale-95"
        >
          <MaterialIcons name="notifications" size={28} color="#464555" />
          <View className="absolute top-0 right-0 w-3 h-3 bg-[#ba1a1a] rounded-full border-2 border-[#f8f9fe]" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        className="px-6 mt-8"
      >

        {/* Profile Header Section */}
        <View className="items-center mb-12">
          <View className="relative mb-6">
            {profileData.foto ? (
              <Image
                source={{ uri: profileData.foto }}
                className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white"
              />
            ) : (
              <View className="w-32 h-32 rounded-full bg-primary items-center justify-center shadow-lg border-4 border-white">
                <Text className="text-white font-black text-4xl">{userInitials}</Text>
              </View>
            )}
          </View>
          <Text className="font-black text-3xl text-on-surface mb-2 text-center">{profileData.nama}</Text>
          <View className="items-center space-y-1">
            <Text className="text-on-surface-variant text-lg">{profileData.email}</Text>
            {profileData.noTelepon ? (
              <View className="flex-row items-center gap-1.5 mt-2">
                <MaterialIcons name="phone" size={16} color="#777587" />
                <Text className="text-on-surface-variant text-base font-medium">{profileData.noTelepon}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Settings List */}
        <View className="bg-white rounded-2xl p-2 mb-8 shadow-sm">
          <TouchableOpacity 
            onPress={handleOpenEdit} 
            disabled={isFetching || isSaving}
            className="flex-row items-center justify-between p-4 rounded-xl active:bg-surface-container-low border-b border-surface-variant/10"
          >
            <View className="flex-row items-center gap-4">
              <View className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center">
                {isFetching ? (
                  <ActivityIndicator size="small" color="#3525cd" />
                ) : (
                  <MaterialIcons name="person" size={22} color="#3525cd" />
                )}
              </View>
              <Text className="font-medium text-lg text-on-surface">Edit Profile</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#777587" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push('/(owner)/admins' as any)}
            className="flex-row items-center justify-between p-4 rounded-xl active:bg-surface-container-low"
          >
            <View className="flex-row items-center gap-4">
              <View className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center">
                <MaterialIcons name="admin-panel-settings" size={22} color="#3525cd" />
              </View>
              <Text className="font-medium text-lg text-on-surface">Manajemen Admin</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#777587" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View className="flex items-center">
          <TouchableOpacity
            onPress={handleLogout}
            className="w-full py-4 bg-[#ffdad6] rounded-xl active:scale-95 flex-row items-center justify-center gap-2"
          >
            <MaterialIcons name="logout" size={22} color="#ba1a1a" />
            <Text className="font-medium text-lg text-[#ba1a1a]">Logout</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isEditModalVisible}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="bg-white rounded-t-[40px] p-8 shadow-xl"
          >
            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-2xl font-black text-on-surface">Edit Profile</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                <MaterialIcons name="close" size={28} color="#777587" />
              </TouchableOpacity>
            </View>

            <View className="mb-10">
              <View className="mb-6">
                <Text className="text-xs font-black text-primary uppercase tracking-[2px] mb-3 ml-1">Nama Lengkap</Text>
                <View className="flex-row items-center bg-[#f0f2f9] rounded-2xl px-5 h-[64px]">
                  <MaterialIcons name="person" size={24} color="#3525cd" />
                  <TextInput
                    className="flex-1 ml-4 text-on-surface font-bold text-lg"
                    placeholderTextColor="#777587"
                    value={editData.nama}
                    onChangeText={(text) => setEditData({ ...editData, nama: text })}
                  />
                </View>
              </View>

              <View>
                <Text className="text-xs font-black text-primary uppercase tracking-[2px] mb-3 ml-1">Nomor Telepon</Text>
                <View className="flex-row items-center bg-[#f0f2f9] rounded-2xl px-5 h-[64px]">
                  <MaterialIcons name="phone" size={24} color="#3525cd" />
                  <TextInput
                    className="flex-1 ml-4 text-on-surface font-bold text-lg"
                    placeholderTextColor="#777587"
                    keyboardType="phone-pad"
                    value={editData.noTelepon}
                    onChangeText={(text) => setEditData({ ...editData, noTelepon: text })}
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSaveProfile}
              disabled={isSaving}
              className="bg-primary h-16 rounded-2xl items-center justify-center shadow-lg active:scale-95"
            >
              {isSaving ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white font-black text-xl">Simpan Perubahan</Text>
              )}
            </TouchableOpacity>

            <View className="h-10" />
          </KeyboardAvoidingView>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

