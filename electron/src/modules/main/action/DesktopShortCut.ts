import type {
  IBaseKernelModule,
  InMemCache,
  XActionEvent,
} from '@grandlinex/e-kernel';
import { OsRelease, StoreGlobal, BaseAction } from '@grandlinex/e-kernel';
import { app, shell } from 'electron';
import * as path from 'path';
import type MainDB from '../db/MainDB';
import type MainClient from '../client/MainClient';

function validArgs(args: unknown): args is [string, string] {
  return (
    Array.isArray(args) &&
    args.length === 2 &&
    typeof args[0] === 'string' &&
    typeof args[1] === 'string'
  );
}

export default class DesktopShortCut extends BaseAction {
  constructor(module: IBaseKernelModule<MainDB, MainClient, InMemCache>) {
    super('create-shortcut', module);
    this.handler = this.handler.bind(this);
  }

  async handler({ args }: XActionEvent<unknown>): Promise<boolean> {
    if (!validArgs(args)) {
      return false;
    }
    this.log(args);
    const store = this.getConfigStore();
    const [link, name] = args;
    if (store.get(StoreGlobal.GLOBAL_OS) !== OsRelease.WIN32) {
      return false;
    }

    const linkPath = path.join(
      app.getPath('desktop'),
      `${name || 'Unknown-Shortcut'}.lnk`
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
