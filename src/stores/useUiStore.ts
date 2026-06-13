import { create } from 'zustand';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme, type ThemeColors } from '../theme/colors';
import { translations, type Language, type TranslationKey } from '../i18n/translations';

export type ColorSchemeSetting = 'system' | 'light' | 'dark';

interface UiState {
  selectedTrackerId: number | null;
  isAddTransactionOpen: boolean;
  colorSchemeSetting: ColorSchemeSetting;
  language: Language;
  setSelectedTrackerId: (id: number | null) => void;
  openAddTransaction: (trackerId: number) => void;
  closeAddTransaction: () => void;
  setColorSchemeSetting: (setting: ColorSchemeSetting) => void;
  setLanguage: (lang: Language) => void;
}

export const useUiStore = create<UiState>((set) => ({
  selectedTrackerId: null,
  isAddTransactionOpen: false,
  colorSchemeSetting: 'system',
  language: 'en',
  setSelectedTrackerId: (id) => set({ selectedTrackerId: id }),
  openAddTransaction: (trackerId) =>
    set({ selectedTrackerId: trackerId, isAddTransactionOpen: true }),
  closeAddTransaction: () =>
    set({ isAddTransactionOpen: false }),
  setColorSchemeSetting: (setting) => set({ colorSchemeSetting: setting }),
  setLanguage: (lang) => set({ language: lang }),
}));

export function useT(): (key: TranslationKey, params?: Record<string, string | number>) => string {
  const lang = useUiStore((s) => s.language);
  return (key: TranslationKey, params?: Record<string, string | number>) => {
    let text = translations[lang][key] ?? translations.en[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(`{{${k}}}`, String(v));
      }
    }
    return text;
  };
}

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
