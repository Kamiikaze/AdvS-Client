import Path from 'path';
import ElectronKernel, {
  ElectronGlobals,
  isDev,
  KernelWindowName,
  OsRelease,
  StoreGlobal,
  XUtil,
} from '@grandlinex/e-kernel';
import { app, BrowserWindow } from 'electron';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import ELogger from '@grandlinex/bundle-elogger';
import SQLCon from '@grandlinex/bundle-sqlight';
import MainModule from './modules/main/MainModule';

import InitTray from './Tray';
import createWindow from './window/createWindow';
import resolveCommand from './util/ComandResolver';

const preload = Path.join(app.getAppPath(), 'res', 'preload.html');
const appRoot = Path.join(app.getAppPath(), 'res', 'ui', 'index.html');
const imgPath = Path.join(app.getAppPath(), 'res', 'img');

/**
 * Override config path in dev mode to current folder
 */
let config: string | undefined;
if (isDev()) {
  config = Path.join(app.getAppPath(), 'config');
} else {
  config = undefined;
}

const appName = 'ADVS-Client';
const appCode = 'advs-client';

/**
 * HANDLE advs:// protocol
 */
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('advs', process.execPath, [
      Path.resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient('advs');
}

const gotTheLock = app.requestSingleInstanceLock();

export default class Kernel extends ElectronKernel {
  constructor() {
    super({
      appName,
      appCode,
      appRoot,
      pathOverride: config,
      preloadRoot: preload,
      logger: (kernel) => {
        return new ELogger(kernel);
      },
    });

    globalThis.console.log = (...x: any[]) => this.log(x);
    globalThis.console.error = (...x: any[]) => this.error(x);

    this.openNewWindow = this.openNewWindow.bind(this);
    this.setPreload = this.setPreload.bind(this);

    this.getModule().setDb(new SQLCon(this.getModule(), '0', true));
    const store = this.getConfigStore();
    store.set(ElectronGlobals.GLX_WINDOW_FRAME, 'true');
    store.set(ElectronGlobals.GLX_WINDOW_H, '700');
    store.set(ElectronGlobals.GLX_WINDOW_W, '1024');
    store.set(StoreGlobal.GLOBAL_LOG_LEVEL, '0');
    store.set(ElectronGlobals.GLX_IMG_ICON, Path.join(imgPath, 'icon.png'));
    store.set(ElectronGlobals.GLX_IMG_THUMP, Path.join(imgPath, 'icon.png'));

    this.addModule(new MainModule(this));
    InitTray(this);

    app.whenReady().then(async () => {
      if (isDev()) {
        this.log('Install VueJS Dev Tools');
        this.setDevMode(true);
      }
      await installExtension(VUEJS_DEVTOOLS);
    });

    if (!gotTheLock && store.get(StoreGlobal.GLOBAL_OS) === OsRelease.WIN32) {
      // TODO: Handle Additional Query
      this.log('Second instance detected - shutting down');
      app.quit();
    } else {
      this.log('Second instance detected - starting');
      app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        this.log('Hello?');
        this.log(event, commandLine, workingDirectory);
        this.routePath(commandLine);
      });
    }
  }

  // OVERRIDING DEFAULT WINDOW FUNCTION
  async openNewWindow(): Promise<void> {
    await createWindow(this);
  }

  async setPreload(title: string): Promise<void> {
    let win = this.getWindowManager().get(KernelWindowName.PRELOAD);

    if (!win) {
      win = this.getWindowManager().create(KernelWindowName.PRELOAD, (conf) => {
        const preWin = new BrowserWindow({
          width: 800,
          height: 600,
          resizable: false,
          icon: conf.icon,
          frame: false,
          webPreferences: conf.webPreferences,
        });
        preWin.setTitle(this.getAppName());
        return preWin;
      });
    }
    const version = app.getVersion();
    await win.loadFile(this.getPreloadRoot(), {
      search: `${version}& ${title}`,
    });
  }

  async electronStart(): Promise<unknown> {
    await XUtil.sleep(2000);
    this.getWindowManager().hide(KernelWindowName.PRELOAD);

    await createWindow(this);
    return undefined;
  }

  async routePath(cml: string[]) {
    const cmd = cml.find((e) => e.startsWith('advs://'));

    const data = resolveCommand(cmd);
    if (!data) {
      this.error('Invalid path');
      return;
    }

    let main = this.getMainWindow();

    if (!main) {
      await createWindow(this);
      main = this.getMainWindow();
      let count = 0;
      while (main?.webContents.isLoading() && count < 10) {
        count++;
        await XUtil.sleep(1000);
      }
    }

    if (main) {
      if (main.isMinimized()) main.restore();
      if (!main.isVisible()) {
        main.show();
      }
      main.focus();

      main.webContents.send('tab-open', {
        path: data.path,
        search: data.search,
      });
    } else {
      this.error('Cant open main window');
    }
  }
}
