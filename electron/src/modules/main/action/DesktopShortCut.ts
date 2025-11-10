import {
  BaseAction,
  IBaseKernelModule,
  OsRelease,
  StoreGlobal,
  XActionEvent,
} from '@grandlinex/e-kernel';
import { app, shell } from 'electron';
import * as path from 'path';

export default class DesktopShortCut extends BaseAction {
  constructor(module: IBaseKernelModule<any, any, any>) {
    super('create-shortcut', module);
    this.handler = this.handler.bind(this);
  }

  async handler({ args }: XActionEvent<string[]>): Promise<boolean> {
    this.log(args);
    const store = this.getConfigStore();
    const [link, name] = args;
    if (
      typeof link !== 'string' ||
      store.get(StoreGlobal.GLOBAL_OS) !== OsRelease.WIN32
    ) {
      return false;
    }

    const linkPath = path.join(
      app.getPath('desktop'),
      `${name || 'Unknown-Shortcut'}.lnk`,
    );

    try {
      this.info(linkPath);
      this.info(app.getPath('exe'));
      return shell.writeShortcutLink(linkPath, 'create', {
        target: link,
        icon: app.getPath('exe'),
        iconIndex: 0,
      });
    } catch (e) {
      this.error(e);
      return false;
    }
  }
}
