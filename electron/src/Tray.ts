import { app, Menu, Tray } from 'electron';
import { ElectronGlobals, IKernel } from '@grandlinex/e-kernel';
import createWindow from './window/createWindow';

export default function InitTray(kernel: IKernel) {
  app.whenReady().then(async () => {
    const store = kernel.getConfigStore();
    const path = store.get(ElectronGlobals.GLX_IMG_THUMP);

    const tray = new Tray(path as string);

    const rows: Electron.MenuItemConstructorOptions[] = [
      {
        label: 'Öffnen',
        type: 'normal',
        click: () => {
          kernel.closeAllWindows();
          createWindow(kernel);
        },
      },
    ];

    rows.push({
      label: 'Dev Tools',
      type: 'normal',
      click: () => {
        kernel.getMainWindow()?.webContents.openDevTools({ mode: 'bottom' });
      },
    });

    rows.push({
      label: 'Schließen',
      type: 'normal',
      click: () => {
        process.exit(0);
      },
    });

    const contextMenu = Menu.buildFromTemplate(rows);

    tray.setToolTip(kernel.getAppName() + (kernel.getDevMode() ? '-DEV' : ''));
    tray.setContextMenu(contextMenu);
    tray.on('double-click', () => {
      const win = kernel.getMainWindow();
      if (win) {
        if (win.isVisible()) {
          win.hide();
        } else {
          win.show();
        }
      } else {
        createWindow(kernel);
      }
    });
    kernel.setTray(tray);
  });
}
