import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useT } from '../../src/stores/useUiStore';

export default function TabLayout() {
  const theme = useTheme();
  const t = useT();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.headerBg },
        headerTitleStyle: { color: theme.text },
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.tabBarBorder,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textTertiary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          headerTitle: t('financeTracker'),
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="trackers"
        options={{
          title: t('trackers'),
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="wallet-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: t('transactions'),
          headerTitle: t('transactions'),
          tabBarIcon: ({ color, size }) => <Ionicons name="swap-horizontal-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: t('categories'),
          headerTitle: t('categories'),
          tabBarIcon: ({ color, size }) => <Ionicons name="list-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: t('more'),
          headerTitle: t('more'),
          tabBarIcon: ({ color, size }) => <Ionicons name="ellipsis-horizontal-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
