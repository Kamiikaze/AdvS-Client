import { app, BrowserWindow, Rectangle, screen } from 'electron';
import { IKernel, isDev, KernelWindowName } from '@grandlinex/e-kernel';
import SQLCon from '@grandlinex/bundle-sqlight';
import urlWhitelist from '../util/urlWhitelist';

interface WindowConfig {
  bounds: Rectangle;
  isMaximized: boolean;
}

export default async function createWindow(kernel: IKernel) {
  const baseDb = kernel.getModule().getDb() as SQLCon;
  const savedConfig = await baseDb.getConfig('window-config');
  const displays = screen.getAllDisplays();

  let config: WindowConfig = {
    bounds: { x: 0, y: 0, width: 1000, height: 800 },
    isMaximized: false,
  };

  if (savedConfig) {
    config = JSON.parse(savedConfig.c_value);
  }

  const window = kernel
    .getWindowManager()
    .create(KernelWindowName.MAIN, (w) => {
      const mainWindow = new BrowserWindow({
        ...w,
        ...config.bounds,
        minWidth: 600,
        minHeight: 500,
        backgroundColor: '#2e2c29',
        frame: false,
        roundedCorners: false,
        webPreferences: {
          ...w.webPreferences,
          additionalArguments: [isDev() ? '1' : '0', app.getVersion()],
        },
      });
      mainWindow.setMenu(null);
      return mainWindow;
    });

  if (config.isMaximized) {
    window.maximize();
  } else {
    window.unmaximize();
  }

  let lastBounds = window.getBounds();

  const saveWindowConfig = () => {
    const windowConfig: WindowConfig = {
      bounds: window.getBounds(),
      isMaximized: window.isMaximized(),
    };

    lastBounds = windowConfig.bounds;
    baseDb.setConfig('window-config', JSON.stringify(windowConfig));
  };

  const checkWindowBounds = () => {
    setInterval(() => {
      if (window.isDestroyed()) return;

      const currentBounds = window.getBounds();

      if (
        currentBounds.x !== lastBounds.x ||
        currentBounds.y !== lastBounds.y
      ) {
        // Moved
        saveWindowConfig();
      }

      if (
        currentBounds.width !== lastBounds.width ||
        currentBounds.height !== lastBounds.height
      ) {
        // Resized
        saveWindowConfig();
      }

      lastBounds = currentBounds;
    }, 5000);
  };

  // Check if window is on a unplugged display
  if (
    displays.length === 1 &&
    (config.bounds.x > displays[0].bounds.width ||
      config.bounds.y > displays[0].bounds.height)
  ) {
    kernel.log(
      'Windows out of bounds. Resetting position.',
      config.bounds,
      displays[0].bounds,
    );
    window.setBounds({
      x: 0,
      y: 0,
    });
    saveWindowConfig();
  }

  window.on('resized', () => {
    saveWindowConfig();
  });

  window.on('moved', () => {
    saveWindowConfig();
  });

  window.on('maximize', () => {
    saveWindowConfig();
  });

  window.on('unmaximize', () => {
    saveWindowConfig();
  });

  window.webContents.setWindowOpenHandler((details) => {
    const reqUrl = new URL(details.url.toLowerCase());
    kernel.log('setWindowOpenHandler', details);
    if (urlWhitelist.includes(reqUrl.host.toString())) {
      kernel.log('Allowing URL', reqUrl.host.toString());
      return { action: 'allow' };
    }
    return { action: 'deny' };
  });

  checkWindowBounds();

  try {
    if (kernel.getDevMode()) {
      await window.loadURL('http://localhost:9000');
      kernel.getMainWindow()?.webContents.openDevTools({ mode: 'bottom' });
    } else {
      await window.loadFile(kernel.getAppRoot());
    }
  } catch (e) {
    kernel.error(e);
  }
}
