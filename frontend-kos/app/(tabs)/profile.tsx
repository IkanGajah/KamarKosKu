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
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '@/constants/config';

import { globalState } from '../_globalState';

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState({
    nama: globalState.namaLengkap || (globalState.email ? globalState.email.split('@')[0] : 'User'),
    email: globalState.email || 'user@example.com',
    foto: '',
    noTelepon: globalState.noTelepon || ''
  });

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isContactModalVisible, setIsContactModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({
    nama: '',
    noTelepon: ''
  });

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/penyewa/profil`, {
        headers: {
          'Authorization': `Bearer ${globalState.token}`
        }
      });
      const json = await res.json();
      if (json.data) {
        const newName = json.data.nama || globalState.namaLengkap || globalState.email.split('@')[0];
        const newFoto = json.data.foto || '';
        const newPhone = json.data.noTelepon || '';

        globalState.namaLengkap = newName;
        globalState.foto = newFoto;
        globalState.noTelepon = newPhone;

        setProfile({
          nama: newName,
          email: json.data.email || globalState.email,
          foto: newFoto,
          noTelepon: newPhone
        });
        
        setEditData(prev => ({
          ...prev,
          nama: newName,
          noTelepon: newPhone
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (globalState.token) {
      fetchProfile();
    }
  }, []);

  const handleOpenEdit = () => {
    setEditData({
      nama: profile.nama,
      noTelepon: profile.noTelepon
    });
    setIsEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!editData.nama || !editData.noTelepon) {
      Alert.alert("Error", "Nama dan Nomor Telepon tidak boleh kosong.");
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = {
        nama: editData.nama,
        noTelepon: editData.noTelepon
      };

      const res = await fetch(`${API_BASE_URL}/penyewa/profil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${globalState.token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        Alert.alert("Sukses", "Profil berhasil diperbarui.");
        setIsEditModalVisible(false);
        fetchProfile();
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

  const contactAdmin = (method: 'whatsapp' | 'call' | 'email') => {
    const adminPhone = "+6281234567890"; // Ganti dengan nomor admin asli
    const adminEmail = "support@kosku.com";
    
    switch (method) {
      case 'whatsapp':
        const message = `Halo Admin KosKu, saya ${profile.nama}. Ingin bertanya mengenai...`;
        Linking.openURL(`whatsapp://send?phone=${adminPhone}&text=${encodeURIComponent(message)}`)
          .catch(() => Alert.alert("Error", "WhatsApp tidak terpasang di perangkat Anda."));
        break;
      case 'call':
        Linking.openURL(`tel:${adminPhone}`);
        break;
      case 'email':
        Linking.openURL(`mailto:${adminEmail}?subject=Bantuan Aplikasi KosKu&body=Halo Admin...`);
        break;
    }
    setIsContactModalVisible(false);
  };

  const handleAction = (actionName: string) => {
    if (actionName === 'Edit Profile') {
      handleOpenEdit();
    } else if (actionName === 'Contact Admin') {
      setIsContactModalVisible(true);
    } else {
      Alert.alert("Fitur", `Fitur ${actionName} sedang dalam pengembangan.`);
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
            router.replace('/login' as any);
          }
        }
      ]
    );
  };

  const userInitials = profile.nama.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <SafeAreaView className="flex-1 bg-surface pt-4" edges={['top', 'left', 'right']}>
      
      {/* Support Center Sheet (Modal) */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isContactModalVisible}
        onRequestClose={() => setIsContactModalVisible(false)}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={() => setIsContactModalVisible(false)}
          className="flex-1 justify-end bg-black/50"
        >
          <View className="bg-surface rounded-t-3xl p-6 shadow-xl">
            <View className="w-12 h-1.5 bg-surface-container-high rounded-full self-center mb-6" />
            
            <Text className="text-2xl font-black text-on-surface mb-2">Hubungi Admin</Text>
            <Text className="text-on-surface-variant text-base mb-8">Pilih cara yang paling nyaman untuk Anda menghubungi tim bantuan kami.</Text>

            <View className="space-y-4">
              <TouchableOpacity 
                onPress={() => contactAdmin('whatsapp')}
                className="flex-row items-center bg-[#e7f3ef] p-4 rounded-2xl border border-[#25d366]/20 active:scale-[0.98] mb-4"
              >
                <View className="w-12 h-12 bg-[#25d366] rounded-full items-center justify-center mr-4">
                  <MaterialIcons name="chat" size={24} color="#ffffff" />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-lg text-[#075e54]">WhatsApp Chat</Text>
                  <Text className="text-[#075e54]/70 text-sm">Respon cepat via pesan teks</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#075e54" />
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => contactAdmin('call')}
                className="flex-row items-center bg-[#e8eaf6] p-4 rounded-2xl border border-[#3f51b5]/20 active:scale-[0.98] mb-4"
              >
                <View className="w-12 h-12 bg-[#3f51b5] rounded-full items-center justify-center mr-4">
                  <MaterialIcons name="call" size={24} color="#ffffff" />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-lg text-[#1a237e]">Telepon Langsung</Text>
                  <Text className="text-[#1a237e]/70 text-sm">Bicara langsung dengan admin</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#1a237e" />
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => contactAdmin('email')}
                className="flex-row items-center bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 active:scale-[0.98]"
              >
                <View className="w-12 h-12 bg-surface-container-high rounded-full items-center justify-center mr-4">
                  <MaterialIcons name="email" size={24} color="#464555" />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-lg text-on-surface">Kirim Email</Text>
                  <Text className="text-on-surface-variant text-sm">Untuk laporan formal/keluhan</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#777587" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              onPress={() => setIsContactModalVisible(false)}
              className="mt-8 py-4 items-center justify-center"
            >
              <Text className="text-primary font-bold text-lg">Batal</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

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
            className="bg-surface rounded-t-3xl p-6 shadow-xl"
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-black text-on-surface">Edit Profile</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#777587" />
              </TouchableOpacity>
            </View>

            <View className="space-y-5 mb-8">
              {/* Field Nama */}
              <View>
                <Text className="text-xs font-bold text-primary uppercase tracking-widest mb-2 ml-1">Nama Lengkap</Text>
                <View className="flex-row items-center bg-surface-container-highest rounded-2xl px-4 h-[56px] border border-outline-variant/20">
                  <MaterialIcons name="person" size={22} color="#3525cd" />
                  <TextInput
                    className="flex-1 ml-3 text-on-surface font-semibold text-base"
                    placeholder="Masukkan nama lengkap"
                    placeholderTextColor="#777587"
                    value={editData.nama}
                    onChangeText={(text) => setEditData({...editData, nama: text})}
                  />
                </View>
              </View>

              {/* Field No HP */}
              <View>
                <Text className="text-xs font-bold text-primary uppercase tracking-widest mb-2 ml-1">Nomor Telepon</Text>
                <View className="flex-row items-center bg-surface-container-highest rounded-2xl px-4 h-[56px] border border-outline-variant/20">
                  <MaterialIcons name="phone" size={22} color="#3525cd" />
                  <TextInput
                    className="flex-1 ml-3 text-on-surface font-semibold text-base"
                    placeholder="Contoh: 0812..."
                    placeholderTextColor="#777587"
                    keyboardType="phone-pad"
                    value={editData.noTelepon}
                    onChangeText={(text) => setEditData({...editData, noTelepon: text})}
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity 
              onPress={handleSaveProfile}
              disabled={isSaving}
              className="bg-primary h-14 rounded-xl items-center justify-center shadow-lg active:scale-95"
            >
              {isSaving ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white font-bold text-lg">Simpan Perubahan</Text>
              )}
            </TouchableOpacity>
            
            <View className="h-8" /> 
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Top App Bar */}
      <View className="px-6 pb-4 flex-row justify-between items-center z-50">
        <View className="flex-row items-center gap-4">
          {profile.foto ? (
            <Image
              source={{ uri: profile.foto }}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <View className="w-10 h-10 rounded-full bg-primary-container items-center justify-center border border-outline-variant/30">
              <Text className="text-on-primary-container font-bold text-xs">{userInitials}</Text>
            </View>
          )}
          <Text className="text-primary font-black text-2xl tracking-tight">Profile Saya</Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/notifications' as any)}
          className="hover:opacity-80 active:scale-95"
        >
          <MaterialIcons name="notifications" size={24} color="#777587" />
          <View className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#ba1a1a] rounded-full border-2 border-surface" />
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
            {profile.foto ? (
              <Image
                source={{ uri: profile.foto }}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover shadow-lg border-4 border-surface-container-lowest"
              />
            ) : (
              <View className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-primary-container items-center justify-center shadow-lg border-4 border-surface-container-lowest">
                <Text className="text-on-primary-container font-black text-4xl">{userInitials}</Text>
              </View>
            )}
          </View>
          <Text className="font-black text-3xl text-on-surface mb-2 text-center">{profile.nama}</Text>
          <View className="items-center space-y-1">
            <Text className="text-on-surface-variant text-lg">{profile.email}</Text>
            {profile.noTelepon ? (
              <View className="flex-row items-center gap-1.5">
                <MaterialIcons name="phone" size={16} color="#777587" />
                <Text className="text-on-surface-variant text-base font-medium">{profile.noTelepon}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Settings List */}
        <View className="bg-surface-container-lowest rounded-2xl p-2 mb-8 shadow-sm">
          <TouchableOpacity onPress={() => handleAction('Edit Profile')} className="flex-row items-center justify-between p-4 rounded-xl active:bg-surface-container-low mb-1">
            <View className="flex-row items-center gap-4">
              <View className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center">
                <MaterialIcons name="person" size={22} color="#3525cd" />
              </View>
              <Text className="font-medium text-lg text-on-surface">Edit Profile</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#777587" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleAction('Contact Admin')} className="flex-row items-center justify-between p-4 rounded-xl active:bg-surface-container-low">
            <View className="flex-row items-center gap-4">
              <View className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center">
                <MaterialIcons name="support-agent" size={22} color="#3525cd" />
              </View>
              <Text className="font-medium text-lg text-on-surface">Hubungi Admin</Text>
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
    </SafeAreaView>
  );
}
