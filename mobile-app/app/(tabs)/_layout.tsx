import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { MaterialIcons } from "@expo/vector-icons";
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useUser } from '../../src/context/UserContext';

const blueTheme = {
  primary: "#195BFF",
  iconAccent: "#197BFF",
  skyBlue: "#6EA4FF",
  surface: "#EEF3F9",
  white: "#FFFFFF",
  text: "#10223F",
  subText: "#60718B",
  border: "#D8E3F2",
  inactive: "#AAB6C7",
};

// Custom Tab Bar Component
function CustomTabBar({ state, descriptors, navigation }: any) {
  const tabs = [
    { routeName: 'home', icon: 'home' },
    { routeName: 'applications', icon: 'task-alt' },
    { routeName: 'profile', icon: 'account-circle' },
  ];

  const visibleRoutes = tabs
    .map((tab) => {
      const route = state.routes.find((item: any) => item.name === tab.routeName);
      return route ? { ...route, icon: tab.icon } : null;
    })
    .filter(Boolean);

  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBarContent}>
        {visibleRoutes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.routes[state.index]?.key === route.key;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              preventDefault: false,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabButton}
              activeOpacity={0.8}
            >
              <View style={styles.iconContainer}>
                <MaterialIcons name={route.icon} size={26} color={isFocused ? blueTheme.iconAccent : blueTheme.inactive} />
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isFocused ? blueTheme.iconAccent : blueTheme.subText,
                    fontWeight: isFocused ? '800' : '600',
                  },
                ]}
              >
                {options.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: blueTheme.surface }}>
        <Text style={{ color: blueTheme.subText, fontSize: 14, fontWeight: '700' }}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: blueTheme.iconAccent,
        tabBarInactiveTintColor: blueTheme.inactive,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          display: 'none', // Hide default tab bar, we'll use custom
        },
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="applications"
        options={{
          title: 'Applications',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="apply"
        options={{
          title: "Apply",
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 10,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderWidth: 1,
    borderColor: blueTheme.border,
    shadowColor: '#8AA4C2',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 10,
  },
  tabBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 18,
    marginHorizontal: 3,
  },
  iconContainer: {
    width: 38,
    height: 34,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginBottom: 3,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
});
