const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Platform info
  platform: process.platform,

  // Connection config management
  loadConnections: () => ipcRenderer.invoke('connections:load'),
  saveConnections: (connections) => ipcRenderer.invoke('connections:save', connections),

  // Redis operations
  connect: (config) => ipcRenderer.invoke('redis:connect', config),
  disconnect: () => ipcRenderer.invoke('redis:disconnect'),

  // Key operations
  scanKeys: (pattern, limit) => ipcRenderer.invoke('redis:scanKeys', pattern, limit),
  getType: (key) => ipcRenderer.invoke('redis:getType', key),
  getTTL: (key) => ipcRenderer.invoke('redis:getTTL', key),
  getValue: (key) => ipcRenderer.invoke('redis:getValue', key),
  deleteKey: (key) => ipcRenderer.invoke('redis:deleteKey', key),
  rename: (oldKey, newKey) => ipcRenderer.invoke('redis:rename', oldKey, newKey),
  expire: (key, ttl) => ipcRenderer.invoke('redis:expire', key, ttl),

  // String operations
  setString: (key, value, ttl) => ipcRenderer.invoke('redis:setString', key, value, ttl),

  // Hash operations
  hset: (key, field, value) => ipcRenderer.invoke('redis:hset', key, field, value),
  hdel: (key, field) => ipcRenderer.invoke('redis:hdel', key, field),

  // List operations
  lpush: (key, value) => ipcRenderer.invoke('redis:lpush', key, value),
  rpush: (key, value) => ipcRenderer.invoke('redis:rpush', key, value),
  lset: (key, index, value) => ipcRenderer.invoke('redis:lset', key, index, value),
  lrem: (key, count, value) => ipcRenderer.invoke('redis:lrem', key, count, value),

  // Set operations
  sadd: (key, member) => ipcRenderer.invoke('redis:sadd', key, member),
  srem: (key, member) => ipcRenderer.invoke('redis:srem', key, member),

  // ZSet operations
  zadd: (key, member, score) => ipcRenderer.invoke('redis:zadd', key, member, score),
  zrem: (key, member) => ipcRenderer.invoke('redis:zrem', key, member),

  // Info
  info: (section) => ipcRenderer.invoke('redis:info', section),
  dbsize: () => ipcRenderer.invoke('redis:dbsize'),
});