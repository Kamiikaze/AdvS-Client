/* eslint-disable prettier/prettier, @typescript-eslint/no-unused-vars */

/// <reference types="vite/client" />

import { ComponentCustomProperties } from 'vue';
import type { ContextMenuItem } from '@/components/contextMenu.vue';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $openContextMenu: (
      e: MouseEvent,
      context: string,
      payload: ContextMenuItem[],
      options?: {
        closeOnContentClick?: boolean;
        density?: 'default' | 'comfortable' | 'compact';
        minWidth?: number;
      }
    ) => void;
    $setContextMenuInstance: (instance: any) => void;
  }
}
