import { acceptHMRUpdate, defineStore } from 'pinia';

/**
 * Interface representing the layout settings for a widget in a grid system.
 *
 * Each widget is defined by its position, dimensions, and optional constraints within a grid structure.
 * @prop {string} i - Unique identifier for the widget
 * @prop {number} x - X-axis position in grid units (horizontal position)
 * @prop {number} y - Y-axis position in grid units (vertical position)
 * @prop {number} w - Width of the widget in grid units
 * @prop {number} [minW] - Minimum allowed width in grid units
 * @prop {number} [maxW] - Maximum allowed width in grid units
 * @prop {number} h - Height of the widget in grid units
 * @prop {number} [minH] - Minimum allowed height in grid units
 * @prop {number} [maxH] - Maximum allowed height in grid units
 */
export interface WidgetLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  minW?: number;
  maxW?: number;
  h: number;
  minH?: number;
  maxH?: number;
}

const defaultLayout: WidgetLayout[] = [
  {
    i: 'database-stats',
    x: 0,
    y: 0,
    w: 2,
    minW: 1,
    maxW: 2,
    h: 4,
    minH: 4,
    maxH: 5,
  },
  {
    i: 'last-seen',
    x: 2,
    y: 0,
    w: 2,
    minW: 2,
    maxW: 5,
    h: 6,
    minH: 5,
    maxH: 8,
  },
  {
    i: 'recently-added',
    x: 0,
    y: 5,
    w: 6,
    minW: 6,
    h: 12,
    minH: 7,
  },
];

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    layout: [] as WidgetLayout[],
    isEditMode: false,
  }),
  getters: {
    currentLayout: (state) => state.layout,
  },
  actions: {
    loadLayout() {
      const saved = localStorage.getItem('dashboard-layout');
      if (saved) {
        try {
          this.layout = JSON.parse(saved);
          console.log('Loaded layout from localStorage', this.layout);
        } catch (e) {
          console.error('Failed to load layout from localStorage', e);
          this.layout = [...defaultLayout];
        }
      } else {
        this.layout = [...defaultLayout];
      }
    },
    saveLayout(newLayout: WidgetLayout[]) {
      this.layout = newLayout;
      localStorage.setItem('dashboard-layout', JSON.stringify(newLayout));
      console.log('Saved layout to localStorage', newLayout);
    },
    resetLayout() {
      this.layout = [...defaultLayout];
      localStorage.setItem('dashboard-layout', JSON.stringify(defaultLayout));
    },
    toggleEditMode() {
      this.isEditMode = !this.isEditMode;
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDashboardStore, import.meta.hot));
}
