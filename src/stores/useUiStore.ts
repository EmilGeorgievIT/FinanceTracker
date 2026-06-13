import { create } from 'zustand';

interface UiState {
  selectedTrackerId: number | null;
  isAddTransactionOpen: boolean;
  setSelectedTrackerId: (id: number | null) => void;
  openAddTransaction: (trackerId: number) => void;
  closeAddTransaction: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  selectedTrackerId: null,
  isAddTransactionOpen: false,
  setSelectedTrackerId: (id) => set({ selectedTrackerId: id }),
  openAddTransaction: (trackerId) =>
    set({ selectedTrackerId: trackerId, isAddTransactionOpen: true }),
  closeAddTransaction: () =>
    set({ isAddTransactionOpen: false }),
}));
