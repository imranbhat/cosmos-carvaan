import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { colors, shadows } from '@/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          ...shadows.md,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'house.fill', android: 'home', web: 'home' }}
              tintColor={color}
              size={22}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
              tintColor={color}
              size={22}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="sell"
        options={{
          title: 'Sell',
          tabBarIcon: () => (
            <View style={tabStyles.sellButton}>
              <SymbolView
                name={{ ios: 'plus', android: 'add', web: 'add' }}
                tintColor="#FFFFFF"
                size={20}
              />
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'bubble.left.fill', android: 'chat_bubble', web: 'chat_bubble' }}
              tintColor={color}
              size={22}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'person.fill', android: 'person', web: 'person' }}
              tintColor={color}
              size={22}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const tabStyles = StyleSheet.create({
  sellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    ...shadows.md,
  },
});
