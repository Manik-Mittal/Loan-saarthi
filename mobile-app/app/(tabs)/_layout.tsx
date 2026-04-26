import { Tabs } from 'expo-router';
import React from 'react';
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Modern Blue Theme
const blueTheme = {
  primary: "#003087",
  lightBlue: "#0051BA",
  darkBlue: "#001F54",
  skyBlue: "#0066CC",
  lightSkyBlue: "#E3F2FD",
  accentBlue: "#1E88E5",
  surface: "#F8FBFF",
  white: "#FFFFFF",
  text: "#1F2937",
  subText: "#6B7280",
  border: "#D1D5DB",
  inactive: "#BFDBFE",
};

// Custom Tab Bar Component
function CustomTabBar({ state, descriptors, navigation }: any) {
  const icons = [
    { name: 'home', type: 'MaterialIcons' },
    { name: 'task-alt', type: 'MaterialIcons' },
    { name: 'account-circle', type: 'MaterialIcons' },
  ];

  // Show only first 3 tabs (index, applications, profile) - hide apply
  const visibleRoutes = state.routes.slice(0, 3);

  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBarContent}>
        {visibleRoutes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

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
              <View style={[styles.iconContainer, isFocused && styles.iconContainerActive]}>
                <MaterialIcons
                  name={icons[index]?.name}
                  size={26}
                  color={isFocused ? '#FFFFFF' : blueTheme.subText}
                />
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isFocused ? blueTheme.primary : blueTheme.subText,
                    fontWeight: isFocused ? '800' : '600',
                    fontSize: isFocused ? 12 : 11,
                  },
                ]}
              >
                {options.title}
              </Text>
              {isFocused && <View style={styles.activeDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: blueTheme.primary,
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
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
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
    backgroundColor: blueTheme.white,
    borderTopWidth: 1,
    borderTopColor: blueTheme.border,
    shadowColor: blueTheme.primary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  tabBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 6,
    paddingTop: 4,
    backgroundColor: blueTheme.white,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 3,
    borderRadius: 12,
    marginHorizontal: 6,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    marginBottom: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconContainerActive: {
    backgroundColor: blueTheme.skyBlue,
    borderColor: blueTheme.primary,
    shadowColor: blueTheme.skyBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: blueTheme.primary,
    marginTop: 3,
  },
});