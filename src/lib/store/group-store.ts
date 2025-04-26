import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type GroupState = {
  selectedGroupId: string | null;
  setSelectedGroupId: (groupId: string) => void;
};

// Create the store
export const useGroupStore = create<GroupState>()(
  persist(
    (set) => ({
      selectedGroupId: null,
      setSelectedGroupId: (groupId) => {
        console.log("Setting selected group ID:", groupId);
        set({ selectedGroupId: groupId });
      },
    }),
    {
      name: "budget-group-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedGroupId: state.selectedGroupId,
      }),
    },
  ),
);

// --- Convenience hooks for selecting state ---
export const useSelectedGroupId = () => useGroupStore((state) => state.selectedGroupId);
export const useSetSelectedGroupId = () => useGroupStore((state) => state.setSelectedGroupId);
