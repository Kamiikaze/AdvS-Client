import type { CoreDBUpdate } from '@grandlinex/e-kernel';
import { StoreGlobal } from '@grandlinex/e-kernel';
import type SQLCon from '@grandlinex/bundle-sqlight';
import path from 'node:path';
import fs from 'node:fs';

export default class CloneDB {
  static async clone<T extends CoreDBUpdate<SQLCon>>(
    update: T
  ): Promise<boolean> {
    try {
      const db = update.getDb();
      const module = db.getModule();
      const modName = module.getName();
      const dbPath = module
        .getKernel()
        .getConfigStore()
        .get(StoreGlobal.GLOBAL_PATH_DB)!;

      const sourcePath = path.join(dbPath, `${modName}.db`);
      const backupPath = path.join(
        dbPath,
        `${modName}_backup_${update.getSource()}.db`
      );
      await fs.promises.cp(sourcePath, backupPath);
      return true;
    } catch (e) {
      update.getDb().error(e);
      return false;
    }
  }
}
