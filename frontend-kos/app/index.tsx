import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

const FEATURES = [
  {
    icon: 'verified-user',
    title: 'Aman & Terpercaya',
    desc: 'Semua properti diverifikasi langsung untuk kenyamanan Anda.',
  },
  {
    icon: 'account-balance-wallet',
    title: 'Harga Jujur',
    desc: 'Tanpa biaya tersembunyi, pas di kantong mahasiswa dan pekerja.',
  },
  {
    icon: 'support-agent',
    title: 'Layanan 24/7',
    desc: 'Tim kami siap membantu Anda kapanpun dibutuhkan.',
  }
];

export default function GuestDashboardScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-surface">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header/Hero Section */}
        <Animated.View entering={FadeIn.duration(800)} className="w-full h-[55vh] relative bg-primary">
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2000&auto=format&fit=crop' }} 
            className="w-full h-full opacity-80"
            resizeMode="cover"
          />
          <View className="absolute inset-0 bg-black/40" />
          
          <SafeAreaView className="absolute inset-0 justify-between py-4 px-6" edges={['top']}>
            <View className="flex-row justify-between items-center pt-2">
              <View className="bg-white/20 px-4 py-2 rounded-full">
                <Text className="text-white font-black text-xl tracking-widest">KosKu</Text>
              </View>
              <TouchableOpacity 
                onPress={() => router.push('/login')}
                className="bg-white/90 px-5 py-2.5 rounded-full shadow-sm"
              >
                <Text className="text-primary font-bold text-sm">Masuk</Text>
              </TouchableOpacity>
            </View>

            <View className="pb-8">
              <Animated.Text entering={FadeInDown.delay(300).springify()} className="text-white font-black text-4xl mb-3 leading-[44px]">
                Temukan{'\n'}Kenyamanan{'\n'}Hidup Mandiri
              </Animated.Text>
              <Animated.Text entering={FadeInDown.delay(500).springify()} className="text-white/90 text-base font-medium leading-6 pr-4">
                Pilihan kos terbaik dengan fasilitas lengkap, aman, dan harga yang pas untukmu.
              </Animated.Text>
            </View>
          </SafeAreaView>
        </Animated.View>

        {/* Content Section */}
        <View className="px-6 pt-8 bg-surface rounded-t-[32px] -mt-8">
          
          {/* Quick Stats */}
          <Animated.View entering={FadeInDown.delay(700).springify()} className="flex-row justify-between mb-8 bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-outline-variant/10">
            <View className="items-center flex-1">
              <Text className="text-primary font-black text-2xl">50+</Text>
              <Text className="text-on-surface-variant text-[11px] mt-1 font-bold uppercase tracking-wider">Lokasi</Text>
            </View>
            <View className="w-[1px] bg-outline-variant/20 h-full" />
            <View className="items-center flex-1">
              <Text className="text-primary font-black text-2xl">10k+</Text>
              <Text className="text-on-surface-variant text-[11px] mt-1 font-bold uppercase tracking-wider">Pengguna</Text>
            </View>
            <View className="w-[1px] bg-outline-variant/20 h-full" />
            <View className="items-center flex-1">
              <Text className="text-primary font-black text-2xl">4.8</Text>
              <View className="flex-row items-center mt-1">
                <MaterialIcons name="star" size={12} color="#F59E0B" />
                <Text className="text-on-surface-variant text-[11px] font-bold uppercase tracking-wider ml-1">Rating</Text>
              </View>
            </View>
          </Animated.View>

          {/* Why Choose Us */}
          <View>
            <Text className="text-on-surface font-black text-xl mb-5">Kenapa Memilih KosKu?</Text>
            <View className="gap-4">
              {FEATURES.map((feature, index) => (
                <Animated.View 
                  key={index}
                  entering={FadeInDown.delay(800 + (index * 150)).springify()}
                  className="flex-row items-center bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-outline-variant/10"
                >
                  <View className="w-12 h-12 bg-primary-container rounded-full items-center justify-center mr-4">
                    <MaterialIcons name={feature.icon as any} size={24} color="#3525cd" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-on-surface text-base mb-0.5">{feature.title}</Text>
                    <Text className="text-on-surface-variant text-xs leading-5">{feature.desc}</Text>
                  </View>
                </Animated.View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Button */}
      <Animated.View 
        entering={FadeInDown.delay(1200).springify()}
        className="absolute bottom-0 left-0 right-0 bg-surface/95 border-t border-outline-variant/10 px-6 py-4"
        style={Platform.OS === 'ios' ? { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 10 } : { elevation: 10 }}
      >
        <SafeAreaView edges={['bottom']} className="m-0 p-0">
          <TouchableOpacity
            onPress={() => router.push('/katalog' as any)}
            className="bg-primary w-full py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/30"
          >
            <Text className="text-on-primary font-bold text-lg mr-2">Jelajahi Kamar</Text>
            <MaterialIcons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}