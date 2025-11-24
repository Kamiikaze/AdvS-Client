<template>
  <v-navigation-drawer
    v-model="showExtendedDrawer.history"
    temporary
  >
    <v-list class="pt-0">
      <v-list-item class="header">
        <span class="v-list-item-subtitle">Verlauf</span>
        <template #append>
          <v-tooltip text="Bearbeiten">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon="mdi-pencil"
                size="x-small"
                disabled
                variant="text"
                @click="editMode = !editMode"
              />
            </template>
          </v-tooltip>
          <v-tooltip text="Aktualisieren">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon="mdi-refresh"
                size="x-small"
                variant="text"
                :disabled="refreshTimeout !== null"
                @click="refreshHistory"
              />
            </template>
          </v-tooltip>
        </template>
      </v-list-item>

      <v-divider />

      <v-list-item v-if="watchHistory.length === 0">
        Kein Verlauf gefunden
      </v-list-item>

      <template
        v-for="item in watchHistory"
        v-else
        :key="item.e_id"
      >
        <v-list-item
          class="histoy-item mb-0"
          :data-type="item.showType"
          nav
          :active="false"
          @click="$router.push(`/watch/${item.show_id}/${item.episode_id}`)"
        >
          <v-list-item-title class="ml-2">
            {{ item.showName }}
          </v-list-item-title>
          <v-list-item-subtitle class="ml-2">
            Staffel {{ item.seasonNum }} • Episode {{ item.episodeNum }} •
            {{ getEpisodeProgress(item) }}<br>
            <span class="lastWatched">Gesehen {{ getRelativeTime(item.updatedAt) }}</span>
          </v-list-item-subtitle>
          <template #append>
            <v-btn
              v-show="editMode"
              icon="mdi-close"
              size="x-small"
              flat
            />
          </template>
        </v-list-item>

        <v-divider
          class="history-divider"
          inset
        />
      </template>
    </v-list>
  </v-navigation-drawer>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { mapActions, mapState, mapWritableState } from 'pinia';
import { useAppStore } from '@/store/app';
import { useShowStore } from '@/store/show';
import type { WatchHistoryListItem } from '@/lib/electron';
import { convertSecToMin, getRelativeTime } from '@/lib/utils';

export default defineComponent({
  name: 'NavDrawerExtended',
  data: () => ({
    editMode: false,
    refreshTimeout: null as NodeJS.Timeout | null,
  }),
  methods: {
    getRelativeTime,
    ...mapActions(useShowStore, ['fetchWatchHistory']),
    refreshHistory() {
      this.fetchWatchHistory();

      this.refreshTimeout = setTimeout(() => {
        this.refreshTimeout = null;
      }, 1000 * 5);
    },
    getEpisodeProgress(item: WatchHistoryListItem) {
      if (Number(item.progressPercent) > 95) return 'Abgeschlossen';
      return `${convertSecToMin(Number(item.progressSeconds))} | ${Number(item.progressPercent).toFixed(0)}%`;
    },
  },
  computed: {
    ...mapWritableState(useAppStore, ['showExtendedDrawer']),
    ...mapState(useShowStore, ['watchHistory', 'shows', 'episodes']),
  },
});
</script>

<style scoped>
.header {
  height: 50px;
}

.histoy-item {
  margin: 4px 0;
}
.histoy-item:hover .v-list-item-title {
  text-overflow: clip;
  white-space: wrap;
}
.histoy-item .v-list-item-subtitle {
  line-clamp: 2;
  -webkit-line-clamp: 2;
}

.histoy-item::before {
  content: '';
  position: absolute;
  left: 0;
  height: 66%;
  border-right: 4px solid white;
  border-radius: 0 5px 5px 0;
}
.histoy-item[data-type='serie']::before {
  border-color: indianred;
}
.histoy-item[data-type='anime']::before {
  border-color: dodgerblue;
}

.history-divider {
  margin-left: 0;
  max-width: 80%;
}

.v-list hr:last-child {
  display: none;
}
</style>
