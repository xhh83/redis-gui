const { app, BrowserWindow, ipcMain } = require('electron');
const Redis = require('ioredis');
const path = require('path');
const fs = require('fs');

let mainWindow;
let redisClient = null;
let currentConfig = null;

// 连接配置存储路径
const getConfigPath = () => {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'connections.json');
};

// 加载保存的连接配置
const loadConnections = () => {
  try {
    const configPath = getConfigPath();
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load connections:', error);
  }
  return [];
};

// 保存连接配置
const saveConnections = (connections) => {
  try {
    const configPath = getConfigPath();
    fs.writeFileSync(configPath, JSON.stringify(connections, null, 2));
  } catch (error) {
    console.error('Failed to save connections:', error);
  }
};

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // 开发模式加载 Next.js 开发服务器
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // 生产模式加载打包后的文件
    mainWindow.loadFile(path.join(__dirname, '../out/index.html'));
  }
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ============== IPC Handlers ==============

// 连接配置管理
ipcMain.handle('connections:load', () => {
  return loadConnections();
});

ipcMain.handle('connections:save', (event, connections) => {
  saveConnections(connections);
  return { success: true };
});

// Redis 连接
ipcMain.handle('redis:connect', async (event, config) => {
  try {
    // 先断开现有连接
    if (redisClient) {
      await redisClient.quit();
      redisClient = null;
    }

    currentConfig = config;

    if (config.type === 'cluster') {
      redisClient = new Redis.Cluster(
        config.nodes || [{ host: '127.0.0.1', port: 6379 }],
        {
          redisOptions: {
            password: config.password,
            username: config.username,
          },
        }
      );
    } else {
      redisClient = new Redis({
        host: config.host || '127.0.0.1',
        port: config.port || 6379,
        password: config.password,
        username: config.username,
        db: config.db || 0,
      });
    }

    // 测试连接
    await redisClient.ping();

    return { success: true };
  } catch (error) {
    redisClient = null;
    return {
      success: false,
      error: error.message,
    };
  }
});

// 断开连接
ipcMain.handle('redis:disconnect', async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    currentConfig = null;
  }
  return { success: true };
});

// 获取键列表
ipcMain.handle('redis:scanKeys', async (event, pattern, limit) => {
  if (!redisClient) {
    return { error: '未连接' };
  }

  try {
    const keys = [];
    let cursor = '0';

    do {
      const result = await redisClient.scan(cursor, 'MATCH', pattern || '*', 'COUNT', 100);
      cursor = result[0];
      keys.push(...result[1]);
      if (keys.length >= (limit || 1000)) break;
    } while (cursor !== '0');

    return { keys: keys.slice(0, limit || 1000) };
  } catch (error) {
    return { error: error.message };
  }
});

// 获取键类型
ipcMain.handle('redis:getType', async (event, key) => {
  if (!redisClient) {
    return { error: '未连接' };
  }

  try {
    const type = await redisClient.type(key);
    return { type };
  } catch (error) {
    return { error: error.message };
  }
});

// 获取 TTL
ipcMain.handle('redis:getTTL', async (event, key) => {
  if (!redisClient) {
    return { error: '未连接' };
  }

  try {
    const ttl = await redisClient.ttl(key);
    return { ttl };
  } catch (error) {
    return { error: error.message };
  }
});

// 获取值
ipcMain.handle('redis:getValue', async (event, key) => {
  if (!redisClient) {
    return { error: '未连接' };
  }

  try {
    const type = await redisClient.type(key);

    let value;
    switch (type) {
      case 'string':
        value = await redisClient.get(key);
        break;
      case 'hash':
        value = await redisClient.hgetall(key);
        break;
      case 'list':
        value = await redisClient.lrange(key, 0, -1);
        break;
      case 'set':
        value = Array.from(await redisClient.smembers(key));
        break;
      case 'zset':
        const members = await redisClient.zrange(key, 0, -1, 'WITHSCORES');
        value = [];
        for (let i = 0; i < members.length; i += 2) {
          value.push({ member: members[i], score: parseFloat(members[i + 1]) });
        }
        break;
      default:
        value = null;
    }

    return { type, value };
  } catch (error) {
    return { error: error.message };
  }
});

// 删除键
ipcMain.handle('redis:deleteKey', async (event, key) => {
  if (!redisClient) {
    return { error: '未连接' };
  }

  try {
    const result = await redisClient.del(key);
    return { success: result > 0 };
  } catch (error) {
    return { error: error.message };
  }
});

// 设置 String 值
ipcMain.handle('redis:setString', async (event, key, value, ttl) => {
  if (!redisClient) {
    return { error: '未连接' };
  }

  try {
    if (ttl) {
      await redisClient.set(key, value, 'EX', ttl);
    } else {
      await redisClient.set(key, value);
    }
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
});

// Hash 操作
ipcMain.handle('redis:hset', async (event, key, field, value) => {
  if (!redisClient) {
    return { error: '未连接' };
  }

  try {
    await redisClient.hset(key, field, value);
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('redis:hdel', async (event, key, field) => {
  if (!redisClient) {
    return { error: '未连接' };
  }

  try {
    await redisClient.hdel(key, field);
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
});

// List 操作
ipcMain.handle('redis:lpush', async (event, key, value) => {
  if (!redisClient) {
    return { error: '未连接' };
  }

  try {
    await redisClient.lpush(key, value);
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('redis:rpush', async (event, key, value) => {
  if (!redisClient) {
    return { error: '未连接' };
  }

  try {
    await redisClient.rpush(key, value);
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('redis:lset', async (event, key, index, value) => {
  if (!redisClient) {
    return { error: '未连接' };
  }

  try {
    await redisClient.lset(key, index, value);
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('redis:lrem', async (event, key, count, value) => {
  if (!redisClient) {
    return { error: '未连接' };
  }

  try {
    await redisClient.lrem(key, count, value);
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
});

// Set 操作
ipcMain.handle('redis:sadd', async (event, key, member) => {
  if (!redisClient) {
    return { error: '未连接' };
  }

  try {
    await redisClient.sadd(key, member);
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('redis:srem', async (event, key, member) => {
  if (!redisClient) {
    return { error: '未连接' };
  }

  try {
    await redisClient.srem(key, member);
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
});

// ZSet 操作
ipcMain.handle('redis:zadd', async (event, key, member, score) => {
  if (!redisClient) {
    return { error: '未连接' };
  }

  try {
    await redisClient.zadd(key, score, member);
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('redis:zrem', async (event, key, member) => {
  if (!redisClient) {
    return { error: '未连接' };
  }

  try {
    await redisClient.zrem(key, member);
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
});

// 设置 TTL
ipcMain.handle('redis:expire', async (event, key, ttl) => {
  if (!redisClient) {
    return { error: '未连接' };
  }

  try {
    await redisClient.expire(key, ttl);
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
});

// 重命名键
ipcMain.handle('redis:rename', async (event, oldKey, newKey) => {
  if (!redisClient) {
    return { error: '未连接' };
  }

  try {
    await redisClient.rename(oldKey, newKey);
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
});

// 获取数据库信息
ipcMain.handle('redis:info', async (event, section) => {
  if (!redisClient) {
    return { error: '未连接' };
  }

  try {
    const info = await redisClient.info(section);
    return { info };
  } catch (error) {
    return { error: error.message };
  }
});

// 获取数据库大小
ipcMain.handle('redis:dbsize', async () => {
  if (!redisClient) {
    return { error: '未连接' };
  }

  try {
    const size = await redisClient.dbsize();
    return { size };
  } catch (error) {
    return { error: error.message };
  }
});