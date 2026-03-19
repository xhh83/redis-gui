import { create } from 'zustand';
import type { RedisKey, KeyTreeNode, RedisValue } from '@/types/redis';
import { redisService } from '@/services/redisService';

interface DataState {
  keys: string[];
  selectedKey: string | null;
  selectedKeyType: string | null;
  selectedKeyValue: RedisValue | null;
  selectedKeyTTL: number;
  searchPattern: string;
  isLoading: boolean;
  error: string | null;

  // Actions
  setKeys: (keys: string[]) => void;
  setSearchPattern: (pattern: string) => void;
  selectKey: (key: string) => Promise<void>;
  refreshKeys: () => Promise<void>;
  refreshSelectedKey: () => Promise<void>;
  deleteKey: (key: string) => Promise<boolean>;
  renameKey: (oldKey: string, newKey: string) => Promise<boolean>;
  clearSelection: () => void;
}

export const useDataStore = create<DataState>((set, get) => ({
  keys: [],
  selectedKey: null,
  selectedKeyType: null,
  selectedKeyValue: null,
  selectedKeyTTL: -1,
  searchPattern: '*',
  isLoading: false,
  error: null,

  setKeys: (keys) => set({ keys }),

  setSearchPattern: (pattern) => set({ searchPattern: pattern }),

  selectKey: async (key) => {
    set({ isLoading: true, error: null });

    try {
      const [type, value, ttl] = await Promise.all([
        redisService.getKeyType(key),
        redisService.getValue(key),
        redisService.getTTL(key),
      ]);

      set({
        selectedKey: key,
        selectedKeyType: type,
        selectedKeyValue: value,
        selectedKeyTTL: ttl,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '加载失败',
        isLoading: false,
      });
    }
  },

  refreshKeys: async () => {
    const { searchPattern } = get();
    set({ isLoading: true, error: null });

    try {
      const keys = await redisService.getAllKeys(searchPattern, 1000);
      set({ keys, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '加载失败',
        isLoading: false,
      });
    }
  },

  refreshSelectedKey: async () => {
    const { selectedKey } = get();
    if (!selectedKey) return;

    set({ isLoading: true, error: null });

    try {
      const [type, value, ttl] = await Promise.all([
        redisService.getKeyType(selectedKey),
        redisService.getValue(selectedKey),
        redisService.getTTL(selectedKey),
      ]);

      set({
        selectedKeyType: type,
        selectedKeyValue: value,
        selectedKeyTTL: ttl,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '刷新失败',
        isLoading: false,
      });
    }
  },

  renameKey: async (oldKey: string, newKey: string) => {
    try {
      const success = await redisService.renameKey(oldKey, newKey);
      if (success) {
        set((state) => ({
          keys: state.keys.map((k) => (k === oldKey ? newKey : k)),
          selectedKey: state.selectedKey === oldKey ? newKey : state.selectedKey,
        }));
      }
      return success;
    } catch {
      return false;
    }
  },

  deleteKey: async (key) => {
    try {
      const success = await redisService.deleteKey(key);
      if (success) {
        set((state) => ({
          keys: state.keys.filter((k) => k !== key),
          selectedKey: state.selectedKey === key ? null : state.selectedKey,
          selectedKeyValue: state.selectedKey === key ? null : state.selectedKeyValue,
        }));
      }
      return success;
    } catch {
      return false;
    }
  },

  clearSelection: () =>
    set({
      selectedKey: null,
      selectedKeyType: null,
      selectedKeyValue: null,
      selectedKeyTTL: -1,
    }),
}));