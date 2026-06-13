import { useColorScheme } from 'react-native';

export interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  primary: string;
  border: string;
  inputBg: string;
  inputText: string;
  inputPlaceholder: string;
  danger: string;
  success: string;
  tabBar: string;
  tabBarBorder: string;
  headerBg: string;
  cardBg: string;
  chartBg: string;
  fab: string;
}

export const lightTheme: ThemeColors = {
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#222222',
  textSecondary: '#666666',
  textTertiary: '#999999',
  primary: '#4A90D9',
  border: '#eeeeee',
  inputBg: '#ffffff',
  inputText: '#222222',
  inputPlaceholder: '#aaaaaa',
  danger: '#e74c3c',
  success: '#27ae60',
  tabBar: '#ffffff',
  tabBarBorder: '#eeeeee',
  headerBg: '#f8f9fa',
  cardBg: '#ffffff',
  chartBg: '#ffffff',
  fab: '#4A90D9',
};

export const darkTheme: ThemeColors = {
  background: '#121212',
  surface: '#1e1e1e',
  text: '#ffffff',
  textSecondary: '#aaaaaa',
  textTertiary: '#777777',
  primary: '#5BA0E8',
  border: '#333333',
  inputBg: '#2a2a2a',
  inputText: '#ffffff',
  inputPlaceholder: '#666666',
  danger: '#e74c3c',
  success: '#2ecc71',
  tabBar: '#1a1a1a',
  tabBarBorder: '#333333',
  headerBg: '#121212',
  cardBg: '#1e1e1e',
  chartBg: '#1e1e1e',
  fab: '#5BA0E8',
};

export function useThemeColors(): ThemeColors {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkTheme : lightTheme;
}
