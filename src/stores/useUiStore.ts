import { create } from 'zustand';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme, type ThemeColors } from '../theme/colors';

export type ColorSchemeSetting = 'system' | 'light' | 'dark';

interface UiState {
  selectedTrackerId: number | null;
  isAddTransactionOpen: boolean;
  colorSchemeSetting: ColorSchemeSetting;
  setSelectedTrackerId: (id: number | null) => void;
  openAddTransaction: (trackerId: number) => void;
  closeAddTransaction: () => void;
  setColorSchemeSetting: (setting: ColorSchemeSetting) => void;
}

export const useUiStore = create<UiState>((set) => ({
  selectedTrackerId: null,
  isAddTransactionOpen: false,
  colorSchemeSetting: 'system',
  setSelectedTrackerId: (id) => set({ selectedTrackerId: id }),
  openAddTransaction: (trackerId) =>
    set({ selectedTrackerId: trackerId, isAddTransactionOpen: true }),
  closeAddTransaction: () =>
    set({ isAddTransactionOpen: false }),
  setColorSchemeSetting: (setting) => set({ colorSchemeSetting: setting }),
}));

export function useTheme(): ThemeColors {
  const systemScheme = useColorScheme();
  const setting = useUiStore((s) => s.colorSchemeSetting);
  const resolved = setting === 'system' ? (systemScheme ?? 'light') : setting;
  return resolved === 'dark' ? darkTheme : lightTheme;
}

export function useIsDark(): boolean {
  const systemScheme = useColorScheme();
  const setting = useUiStore((s) => s.colorSchemeSetting);
  const resolved = setting === 'system' ? (systemScheme ?? 'light') : setting;
  return resolved === 'dark';
}
