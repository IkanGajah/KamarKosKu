import { Tabs } from 'expo-router';
import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function OwnerTabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4f46e5',
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
          fontWeight: '600',
          textTransform: 'uppercase',
          marginTop: 4,
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Overview',
          tabBarIcon: ({ color }) => <MaterialIcons size={24} name="dashboard" color={color} />,
        }}
      />
      <Tabs.Screen
        name="branches"
        options={{
          title: 'Branches',
          tabBarIcon: ({ color }) => <MaterialIcons size={24} name="location-city" color={color} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color }) => <MaterialIcons size={24} name="assessment" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <MaterialIcons size={24} name="person" color={color} />,
        }}
      />
      <Tabs.Screen
        name="admins"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
