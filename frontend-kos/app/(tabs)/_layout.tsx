import { Tabs } from 'expo-router';
import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3525cd',
        tabBarInactiveTintColor: '#94a3b8',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 75,
          borderTopWidth: 2,
          borderTopColor: 'rgba(0,0,0,0.08)',
          elevation: 25,
          paddingBottom: 20,
          paddingTop: 12,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter',
          fontSize: 11,
          fontWeight: '500',
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Catalog',
          tabBarIcon: ({ color }) => <MaterialIcons size={24} name="grid-view" color={color} />,
        }}
      />
      <Tabs.Screen
        name="rent"
        options={{
          title: 'My Rent',
          tabBarIcon: ({ color }) => <MaterialIcons size={24} name="payments" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <MaterialIcons size={24} name="account-circle" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
