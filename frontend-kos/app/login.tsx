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

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    // Validasi sederhana
    if (!email || !password) {
      Alert.alert("Error", "Email dan Password harus diisi!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const responseData = await response.json();

      if (response.ok && responseData.data) {
        const role = responseData.data.role;
        const globalState = require('./_globalState').globalState;
        globalState.email = email;
        globalState.token = responseData.data.token || '';
        globalState.role = role;
        globalState.namaLengkap = responseData.data.nama || '';
        globalState.foto = responseData.data.foto || '';
        globalState.noTelepon = responseData.data.noTelepon || '';

        if (role === 'ROLE_OWNER') {
          router.replace('/(owner)' as any);
        } else if (role === 'ROLE_ADMIN') {
          router.replace('/(admin)' as any);
        } else {
          router.replace('/(tabs)' as any);
        }
      } else {
        Alert.alert("Login Gagal", responseData.message || "Kredensial tidak valid");
      }

    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Gagal menghubungi server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#4F46E5', '#3525CD']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}
            showsVerticalScrollIndicator={false}
          >

            {/* Logo Header */}
            <View className="items-center mb-10">
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="domain" size={40} color="#ffffff" />
                <Text className="font-black text-4xl text-white tracking-tighter">KosKu</Text>
              </View>
              <Text className="text-white/80 mt-2 text-base font-medium">Manajemen Properti Premium</Text>
            </View>

            {/* Glassmorphism Login Card */}
            <View
              className="rounded-2xl p-8 border border-white/20 shadow-lg"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)' }}
            >
              <View className="mb-8">
                <Text className="font-bold text-2xl text-on-surface mb-2">Selamat Datang Kembali</Text>
                <Text className="text-on-surface-variant text-sm">Silakan masuk ke akun Anda untuk melanjutkan.</Text>
              </View>

              <View className="space-y-6">
                {/* Email Field */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-on-surface-variant mb-2">Email</Text>
                  <View className="relative justify-center">
                    <View className="absolute left-3 z-10">
                      <MaterialIcons name="mail" size={20} color="#777587" />
                    </View>
                    <TextInput
                      className="w-full pl-10 pr-4 py-3 bg-surface-container-highest rounded-xl text-on-surface h-[50px]"
                      placeholder="nama@email.com"
                      placeholderTextColor="#777587"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                    />
                  </View>
                </View>

                {/* Password Field */}
                <View className="mb-6">
                  <Text className="text-sm font-medium text-on-surface-variant mb-2">Password</Text>
                  <View className="relative justify-center">
                    <View className="absolute left-3 z-10">
                      <MaterialIcons name="lock" size={20} color="#777587" />
                    </View>
                    <TextInput
                      className="w-full pl-10 pr-12 py-3 bg-surface-container-highest rounded-xl text-on-surface h-[50px]"
                      placeholder="••••••••"
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
                  <View className="flex-row justify-end mt-2">
                    <TouchableOpacity>
                      <Text className="text-sm font-medium text-primary">Lupa password?</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={handleLogin}
                  disabled={isLoading}
                  className="w-full h-[52px] rounded-xl overflow-hidden shadow-sm active:scale-95"
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
                      <Text className="text-white font-bold text-lg">Masuk</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Register Link */}
                <View className="mt-8 flex-row justify-center items-center">
                  <Text className="text-sm text-on-surface-variant">Belum punya akun? </Text>
                  <TouchableOpacity onPress={() => router.push('/register' as any)}>
                    <Text className="font-bold text-primary">Daftar di sini</Text>
                  </TouchableOpacity>
                </View>

              </View>
            </View>

            {/* Back Link */}
            <View className="mt-8 flex-row justify-center">
              <TouchableOpacity
                className="flex-row items-center gap-2"
                onPress={() => router.replace('/' as any)}
              >
                <MaterialIcons name="arrow-back" size={16} color="rgba(255,255,255,0.8)" />
                <Text className="text-sm font-medium text-white/80">Lihat Katalog</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
