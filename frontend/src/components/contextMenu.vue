<template>
  <v-menu
    v-model="isOpen"
    :style="menuStyle"
    :close-on-content-click="closeOnContentClick"
    location-strategy="static"
    absolute
  >
    <v-list :density="density" :min-width="minWidth">
      <template v-for="(item, index) in computedItems" :key="index">
        <v-divider v-if="item.type == 'divider'" />

        <v-list-item
          v-else-if="item.type == 'copy'"
          :disabled="item.disabled"
          :prepend-icon="item.icon"
          class="text-disabled"
          @click="handleItemClick(item)"
        >
          {{ item.text }}
        </v-list-item>

        <v-list-item
          v-else
          :disabled="item.disabled"
          :prepend-icon="item.icon"
          :title="item.title"
          :subtitle="item.subtitle"
          @click="handleItemClick(item)"
        >
          {{ item.text }}
          <template v-if="item.shortcut" #append>
            <span class="text-caption text-medium-emphasis">
              {{ item.shortcut }}
            </span>
          </template>
        </v-list-item>
      </template>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import { c2c } from '@/lib/utils';
import { defineComponent, type CSSProperties } from 'vue';

export interface ContextMenuItem {
  type: 'divider' | 'link' | 'copy';
  title?: string;
  subtitle?: string;
  icon?: string;
  shortcut?: string;
  text?: string;
  disabled?: boolean;
  action?: (data: any, item: ContextMenuItem) => void;
}

export default defineComponent({
  name: 'ContextMenu',
  data: () => ({
    isOpen: false,
    x: 0,
    y: 0,
    contextData: null as any,
    items: [] as ContextMenuItem[] | ((data: any) => ContextMenuItem[]),
    closeOnContentClick: true,
    density: 'compact' as 'default' | 'comfortable' | 'compact',
    minWidth: 200,
  }),
  methods: {
    open(
      event: MouseEvent,
      context: string,
      items: ContextMenuItem[] | ((data: any) => ContextMenuItem[]),
      options?: {
        closeOnContentClick?: boolean;
        density?: 'default' | 'comfortable' | 'compact';
        minWidth?: number;
      }
    ) {
      event.preventDefault();
      this.x = event.clientX;
      this.y = event.clientY;
      this.contextData = context;
      this.items = items;

      if (options) {
        this.closeOnContentClick = options.closeOnContentClick ?? true;
        this.density = options.density ?? 'compact';
        this.minWidth = options.minWidth ?? 200;
      }

      this.isOpen = true;
    },

    handleItemClick(item: ContextMenuItem) {
      if (item.action) {
        item.action(this.contextData, item);
      }
      if (item.type == 'copy') {
        c2c(item.text!);
      }
    },
  },
  computed: {
    menuStyle(): CSSProperties {
      return {
        position: 'fixed' as const,
        left: `${this.x}px`,
        top: `${this.y}px`,
        zIndex: 9999,
      };
    },
    computedItems(): ContextMenuItem[] {
      if (typeof this.items === 'function') {
        return this.items(this.contextData);
      }
      return this.items;
    },
  },
  watch: {
    isOpen(newVal: boolean) {
      if (!newVal) {
        this.contextData = null;
      }
    },
  },
});
</script>
