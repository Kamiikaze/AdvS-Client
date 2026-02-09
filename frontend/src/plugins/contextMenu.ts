import type { ContextMenuItem } from '@/components/contextMenu.vue';
import type { App } from 'vue';

let menuInstance: any = null;

export default {
  install(app: App) {
    app.config.globalProperties.$openContextMenu = (
      e: MouseEvent,
      context: string,
      payload: ContextMenuItem[],
      options?: {
        closeOnContentClick?: boolean;
        density?: 'default' | 'comfortable' | 'compact';
        minWidth?: number;
      }
    ) => {
      if (!menuInstance) return;
      menuInstance.open(e, context, payload, options);
      console.log('cm', e, context, payload, options);
    };

    app.config.globalProperties.$setContextMenuInstance = (instance: any) => {
      menuInstance = instance;
    };
  },
};
