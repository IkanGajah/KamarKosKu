import React, { useState } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE_URL } from '@/constants/config';

export default function RegisterScreen() {
  const router = useRouter();

  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [noTelepon, setNoTelepon] = useState('');
  const [noKtp, setNoKtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    // Validasi sederhana
    if (!nama || !email || !noTelepon || !noKtp || !password || !confirmPassword) {
      Alert.alert("Error", "Semua kolom wajib diisi!");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Password dan Konfirmasi Password tidak cocok!");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Error", "Password minimal 8 karakter!");
      return;
    }
    if (noTelepon.length < 11 || noTelepon.length > 13) {
      Alert.alert("Error", "Nomor telepon harus antara 11-13 digit!");
      return;
    }
    if (noKtp.length !== 16) {
      Alert.alert("Error", "Nomor KTP harus 16 digit!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama, email, noTelepon, password, noKtp })
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Sukses", "Akun berhasil dibuat! Silakan login.");
        router.replace('/login');
      } else {
        Alert.alert("Registrasi Gagal", data.message || "Gagal membuat akun");
      }

    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Gagal menghubungi server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#f7f9fb]">
      {/* Background Gradient */}
      <LinearGradient
        colors={['#3525cd', '#3d37a9', '#4f46e5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute inset-0 w-full h-full"
      />

      {/* Ambient Blobs (Simplified for React Native) */}
      <View className="absolute inset-0 overflow-hidden opacity-30">
        <View className="absolute -top-20 -left-10 w-64 h-64 rounded-full bg-[#6df5e1] opacity-40 blur-3xl" />
        <View className="absolute top-1/2 -right-10 w-64 h-64 rounded-full bg-[#c3c0ff] opacity-40 blur-3xl" />
      </View>

      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16 }}
            showsVerticalScrollIndicator={false}
          >

            {/* Registration Card */}
            <View
              className="rounded-2xl p-6 sm:p-8 border border-white/10 shadow-xl mx-auto w-full max-w-md"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)' }}
            >
              {/* Header Section */}
              <View className="items-center mb-8">
                <View className="flex-row items-center justify-center gap-2 mb-2">
                  <MaterialIcons name="domain" size={32} color="#3525cd" />
                  <Text className="font-black text-2xl text-primary tracking-tighter">KKK</Text>
                </View>
                <Text className="font-extrabold text-[28px] text-on-surface mb-1">Buat Akun</Text>
                <Text className="text-[15px] text-on-surface-variant text-center">Mulai kelola atau cari properti impianmu.</Text>
              </View>

              <View className="space-y-5">

                {/* Nama Lengkap Field */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-on-surface-variant ml-1 mb-2">Nama Lengkap</Text>
                  <View className="relative justify-center">
                    <View className="absolute left-3 z-10">
                      <MaterialIcons name="person" size={20} color="#777587" />
                    </View>
                    <TextInput
                      className="w-full pl-11 pr-4 py-3 bg-surface-container-highest rounded-xl text-on-surface h-[50px]"
                      placeholder="Masukkan nama lengkap"
                      placeholderTextColor="#777587"
                      value={nama}
                      onChangeText={setNama}
                    />
                  </View>
                </View>

                {/* Email Field */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-on-surface-variant ml-1 mb-2">Email</Text>
                  <View className="relative justify-center">
                    <View className="absolute left-3 z-10">
                      <MaterialIcons name="mail" size={20} color="#777587" />
                    </View>
                    <TextInput
                      className="w-full pl-11 pr-4 py-3 bg-surface-container-highest rounded-xl text-on-surface h-[50px]"
                      placeholder="contoh@email.com"
                      placeholderTextColor="#777587"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                    />
                  </View>
                </View>

                {/* No KTP Field */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-on-surface-variant ml-1 mb-2">Nomor KTP (16 Digit)</Text>
                  <View className="relative justify-center">
                    <View className="absolute left-3 z-10">
                      <MaterialIcons name="badge" size={20} color="#777587" />
                    </View>
                    <TextInput
                      className="w-full pl-11 pr-4 py-3 bg-surface-container-highest rounded-xl text-on-surface h-[50px]"
                      placeholder="Masukkan 16 digit NIK"
                      placeholderTextColor="#777587"
                      keyboardType="number-pad"
                      maxLength={16}
                      value={noKtp}
                      onChangeText={(text) => setNoKtp(text.replace(/[^0-9]/g, ''))}
                    />
                  </View>
                </View>

                {/* No HP Field */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-on-surface-variant ml-1 mb-2">No. HP</Text>
                  <View className="relative justify-center">
                    <View className="absolute left-3 z-10">
                      <MaterialIcons name="call" size={20} color="#777587" />
                    </View>
                    <TextInput
                      className="w-full pl-11 pr-4 py-3 bg-surface-container-highest rounded-xl text-on-surface h-[50px]"
                      placeholder="08xxxxxxxxxx"
                      placeholderTextColor="#777587"
                      keyboardType="phone-pad"
                      value={noTelepon}
                      onChangeText={setNoTelepon}
                    />
                  </View>
                </View>

                {/* Password Field */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-on-surface-variant ml-1 mb-2">Password</Text>
                  <View className="relative justify-center">
                    <View className="absolute left-3 z-10">
                      <MaterialIcons name="lock" size={20} color="#777587" />
                    </View>
                    <TextInput
                      className="w-full pl-11 pr-12 py-3 bg-surface-container-highest rounded-xl text-on-surface h-[50px]"
                      placeholder="Minimal 8 karakter"
                      placeholderTextColor="#777587"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                    />
                    <TouchableOpacity
                      className="absolute right-3 z-10 p-1"
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <MaterialIcons
                        name={showPassword ? "visibility" : "visibility-off"}
                        size={20}
                        color="#777587"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm Password Field */}
                <View className="mb-6">
                  <Text className="text-sm font-medium text-on-surface-variant ml-1 mb-2">Konfirmasi Password</Text>
                  <View className="relative justify-center">
                    <View className="absolute left-3 z-10">
                      <MaterialIcons name="lock-reset" size={20} color="#777587" />
                    </View>
                    <TextInput
                      className="w-full pl-11 pr-12 py-3 bg-surface-container-highest rounded-xl text-on-surface h-[50px]"
                      placeholder="Ulangi password"
                      placeholderTextColor="#777587"
                      secureTextEntry={!showConfirmPassword}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                    />
                    <TouchableOpacity
                      className="absolute right-3 z-10 p-1"
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <MaterialIcons
                        name={showConfirmPassword ? "visibility" : "visibility-off"}
                        size={20}
                        color="#777587"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={handleRegister}
                  disabled={isLoading}
                  className="w-full h-[52px] rounded-xl overflow-hidden shadow-md active:scale-[0.98] mt-2"
                >
                  <LinearGradient
                    colors={['#4f46e5', '#3525cd']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="w-full h-full justify-center items-center flex-row"
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text className="text-white font-bold text-[16px] tracking-wide">Daftar</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

              </View>

              {/* Login Link */}
              <View className="mt-8 flex-row justify-center items-center">
                <Text className="text-sm text-on-surface-variant">Sudah punya akun? </Text>
                <TouchableOpacity onPress={() => router.push('/login' as any)}>
                  <Text className="font-semibold text-primary">Masuk</Text>
                </TouchableOpacity>
              </View>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
