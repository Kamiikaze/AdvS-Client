/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router/auto';
import Dashboard from '@/pages/index.vue';
import Watch from '@/pages/watch.vue';
import Settings from '@/pages/settings.vue';

const routes = [
  {
    name: 'dashboard',
    path: '/',
    component: Dashboard,
    meta: {
      title: 'Dashboard',
    },
  },
  {
    name: 'watch',
    path: '/watch/:id',
    component: Watch,
    props: true,
    meta: {
      title: 'Watch',
    },
  },
  {
    name: 'watch-episode',
    path: '/watch/:id/:episode',
    component: Watch,
    props: true,
    meta: {
      title: 'Watch',
    },
  },
  {
    name: 'settings',
    path: '/settings',
    component: Settings,
    props: true,
    meta: {
      title: 'Settings',
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  console.debug('Routing to', to);
  if (to.path === '/watch' && !to.params.id) {
    console.log('NavGuard');
    next(false);
    return;
  }
  next();
});

router.afterEach((to) => {
  const title = to.meta.title as string;
  document.title = title + ' | AdvS';
});

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (!localStorage.getItem('vuetify:dynamic-reload')) {
      console.log('Reloading page to fix dynamic import error');
      localStorage.setItem('vuetify:dynamic-reload', 'true');
      location.assign(to.fullPath);
    } else {
      console.error('Dynamic import error, reloading page did not fix it', err);
    }
  } else {
    console.error(err);
  }
});

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload');
});

window.glxApi.on('tab-open', (event: any, data: any) =>
  router.isReady().then(() => {
    console.log('tab-open', event, data);
  }),
);

export default router;
