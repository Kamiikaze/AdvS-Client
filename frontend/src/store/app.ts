import { acceptHMRUpdate, defineStore } from 'pinia';

export const useAppStore = defineStore('app', {
  state: () => ({
    showSearch: false,
    showExtendedDrawer: {
      history: false,
      watchlist: false,
      subscribed: false,
    },
  }),
  getters: {},
  actions: {
    toggleDrawer(name: keyof typeof this.showExtendedDrawer) {
      const wasOpen = this.showExtendedDrawer[name];

      for (const key in this.showExtendedDrawer) {
        this.showExtendedDrawer[key as keyof typeof this.showExtendedDrawer] =
          false;
      }

      this.showExtendedDrawer[name] = !wasOpen;
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAppStore, import.meta.hot));
}
