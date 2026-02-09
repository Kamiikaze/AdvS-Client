<template>
  <v-app>
    <SearchDialog />
    <Toolbar />
    <NavDrawerMain />
    <NavDrawerExtendedHistory />
    <v-main>
      <AppAlerts />
      <router-view />
    </v-main>
    <ContextMenu ref="globalContextMenu" />
  </v-app>
</template>

<script lang="ts" setup>
import AppAlerts from '@/components/appAlerts.vue';
import ContextMenu from '@/components/contextMenu.vue';
import NavDrawerExtendedHistory from '@/components/navigationDrawer/extendedHistory.vue';
import NavDrawerMain from '@/components/navigationDrawer/main.vue';
import SearchDialog from '@/components/searchDialog.vue';
import Toolbar from '@/components/toolbar.vue';
import type { DiscordConfig } from '@/lib/types';
import router from '@/router';
import { useAppStore } from '@/store/app';
import { useShowStore } from '@/store/show';
import { getCurrentInstance, onMounted, ref } from 'vue';

console.log(`
                      /^--^\\     /^--^\\     /^--^\\
                      \\____/     \\____/     \\____/
                     /      \\   /      \\   /      \\
                    |        | |        | |        |
                     \\__  __/   \\__  __/   \\__  __/
|^|^|^|^|^|^|^|^|^|^|^|^\\ \\^|^|^|^/ /^|^|^|^|^\\ \\^|^|^|^|^|^|^|^|^|^|^|^|
| | | | | | | | | | | | |\\ \\| | |/ /| | | | | | \\ \\ | | | | | | | | | | |
########################/ /######\\ \\###########/ /#######################
| | | | | | | | | | | | \\/| | | | \\/| | | | | |\\/ | | | | | | | | | | | |
|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|

                   Hey o/ What you doing here? o.o
`);

const discordConfig = localStorage.getItem('discord-rpc');
if (discordConfig && (JSON.parse(discordConfig) as DiscordConfig).state) {
  window.glxApi.invoke('set-discord-rpc', {
    state: discordConfig
      ? (JSON.parse(discordConfig) as DiscordConfig).state
      : false,
  });
}

useShowStore().fetchShows();
useShowStore().fetchWatchHistory();
useAppStore().fetchLinkedAccounts();

const globalContextMenu = ref<any>(null);

onMounted(() => {
  const app = getCurrentInstance()!;
  app.appContext.config.globalProperties.$setContextMenuInstance(
    globalContextMenu.value
  );

  console.log('registered menu instance:', globalContextMenu.value);
});

router.push({ name: 'dashboard' });
</script>

<style scoped></style>
