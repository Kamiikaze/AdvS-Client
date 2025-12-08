/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Components
import Dashboard from '@/pages/index.vue';
import Settings from '@/pages/settings.vue';
import Watch from '@/pages/watch.vue';

// Composables
import { createRouter, createWebHistory } from 'vue-router';

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
  if (to.path === '/watch' && !('id' in to.params)) {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
window.glxApi.on('tab-open', (event: any, data: any) =>
  router.isReady().then(async () => {
    console.log('tab-open', event, data);
    const requestUrl = data.path.split('/');
    console.log(requestUrl);
    const path = requestUrl[1];

    if (path == 'watch') {
      const requestType = (data.search as Map<string, string>).get('type');

      if (requestType == 'raw') {
        const [, , showId, episodeId] = requestUrl;
        let urlBuilder = '/watch';
        urlBuilder += `/` + showId;
        if (episodeId) urlBuilder += `/` + episodeId;

        router.push(urlBuilder);
      }

      // if (requestType == 'slug') {
      //   const [, , slug, season, episode] = requestUrl;
      //   const show = useShowStore().shows.find((s) => (s.show_slug = slug));
      //
      //   if (!show) return;
      //
      //   let urlBuilder = '/watch';
      //   urlBuilder += `/` + show.e_id;
      //
      //   if (season && episode) {
      //     await useShowStore().fetchShowDetails(show.e_id);
      //     const reqEp = useShowStore().episodes.find(
      //       (e) => e.season_number == season && e.episode_number == episode
      //     );
      //     reqEp ? (urlBuilder += `/ ` + reqEp.e_id) : (urlBuilder += '');
      //   }
      //
      //   router.push(urlBuilder);
      // }
    }
  })
);

export default router;
