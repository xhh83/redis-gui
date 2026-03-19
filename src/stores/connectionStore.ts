import { create } from 'zustand';
import type { ConnectionConfig, ConnectionStatus } from '@/types/redis';
import { redisService } from '@/services/redisService';
import { generateId } from '@/lib/utils';

interface ConnectionState {
  connections: ConnectionConfig[];
  currentConnection: ConnectionConfig | null;
  connectionStatus: ConnectionStatus;
  error: string | null;
  isLoaded: boolean;

  // Actions
  loadConnections: () => Promise<void>;
  addConnection: (config: Omit<ConnectionConfig, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateConnection: (id: string, config: Partial<ConnectionConfig>) => void;
  removeConnection: (id: string) => void;
  selectConnection: (id: string) => Promise<void>;
  disconnect: () => Promise<void>;
  testConnection: (config: Omit<ConnectionConfig, 'id' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; error?: string }>;
}

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  connections: [],
  currentConnection: null,
  connectionStatus: 'disconnected',
  error: null,
  isLoaded: false,

  loadConnections: async () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      try {
        const connections = await window.electronAPI.loadConnections();
        set({ connections, isLoaded: true });
      } catch (error) {
        console.error('Failed to load connections:', error);
        set({ isLoaded: true });
      }
    }
  },

  addConnection: (config) => {
    const newConnection: ConnectionConfig = {
      ...config,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((state) => {
      const newConnections = [...state.connections, newConnection];
      // 保存到 Electron 存储
      if (typeof window !== 'undefined' && window.electronAPI) {
        window.electronAPI.saveConnections(newConnections);
      }
      return { connections: newConnections };
    });
  },

  updateConnection: (id, config) => {
    set((state) => {
      const newConnections = state.connections.map((conn) =>
        conn.id === id
          ? { ...conn, ...config, updatedAt: Date.now() }
          : conn
      );
      // 保存到 Electron 存储
      if (typeof window !== 'undefined' && window.electronAPI) {
        window.electronAPI.saveConnections(newConnections);
      }
      return { connections: newConnections };
    });
  },

  removeConnection: (id) => {
    const { currentConnection } = get();
    if (currentConnection?.id === id) {
      redisService.disconnect();
      set({ currentConnection: null, connectionStatus: 'disconnected' });
    }
    set((state) => {
      const newConnections = state.connections.filter((conn) => conn.id !== id);
      // 保存到 Electron 存储
      if (typeof window !== 'undefined' && window.electronAPI) {
        window.electronAPI.saveConnections(newConnections);
      }
      return { connections: newConnections };
    });
  },

  selectConnection: async (id) => {
    const { connections } = get();
    const connection = connections.find((conn) => conn.id === id);

    if (!connection) return;

    set({ connectionStatus: 'connecting', error: null });

    const result = await redisService.connect(connection);

    if (result.success) {
      set({
        currentConnection: connection,
        connectionStatus: 'connected',
      });
    } else {
      set({
        connectionStatus: 'error',
        error: result.error,
      });
    }
  },

  disconnect: async () => {
    await redisService.disconnect();
    set({
      currentConnection: null,
      connectionStatus: 'disconnected',
      error: null,
    });
  },

  testConnection: async (config) => {
    const testConfig: ConnectionConfig = {
      ...config,
      id: 'test',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const result = await redisService.connect(testConfig);
    // 测试后断开
    await redisService.disconnect();
    return result;
  },
}));