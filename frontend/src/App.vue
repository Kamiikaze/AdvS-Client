<template>
  <v-app>
    <SearchDialog />
    <Toolbar />
    <NavDrawerMain />
    <NavDrawerExtendedHistory />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import SearchDialog from '@/components/searchDialog.vue';
import NavDrawerMain from '@/components/navigationDrawer/main.vue';
import NavDrawerExtendedHistory from '@/components/navigationDrawer/extendedHistory.vue';
import Toolbar from '@/components/toolbar.vue';
import router from '@/router';
import { useShowStore } from '@/store/show';

useShowStore().fetchShows();
useShowStore().fetchWatchHistory();

router.push({ name: 'dashboard' });

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
</script>

<style scoped></style>
