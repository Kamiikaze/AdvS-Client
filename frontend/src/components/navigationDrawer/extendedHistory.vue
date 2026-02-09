<template>
  <v-navigation-drawer
    id="drawer-history"
    v-model="showExtendedDrawer.history"
    :class="showExtendedDrawer.history ? 'extended' : ''"
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
        v-for="item in combinedWatchHistory"
        v-else
        :key="item.episodes.last_seen.e_id"
      >
        <v-list-item
          class="histoy-item mb-0"
          :data-type="item.showType"
          nav
          :active="false"
          @click="openEpisode($event, item)"
        >
          <v-list-item-title class="ml-2">
            {{ item.showName }}
          </v-list-item-title>

          <v-list-item-subtitle class="ml-2">
            Staffel {{ item.episodes.last_seen.seasonNum }} • Episode
            {{ item.episodes.last_seen.episodeNum }} •
            {{ getEpisodeProgress(item) }}<br />
            <span class="lastWatched"
              >Gesehen {{ getRelativeTime(item.updatedAt) }}</span
            >
          </v-list-item-subtitle>

          <template #append>
            <v-btn v-show="editMode" icon="mdi-close" size="x-small" flat />
            <v-btn
              v-show="item.episodes.all.length > 1"
              class="ml-4"
              :icon="isActive(item) ? 'mdi-chevron-up' : 'mdi-chevron-down'"
              size="x-small"
              density="comfortable"
              variant="outlined"
            />
          </template>
        </v-list-item>

        <v-card v-show="isActive(item)" flat>
          <template v-for="eps in item.episodes.all" :key="eps.e_id">
            <v-list-item
              class="histoy-sub-item mb-0 pl-6"
              nav
              :active="false"
              @click="$router.push(`/watch/${eps.show_id}/${eps.episode_id}`)"
            >
              <v-list-item-subtitle class="ml-2">
                Staffel {{ eps.seasonNum }} • Episode {{ eps.episodeNum }} •
                {{ getEpisodeProgress(eps) }}<br />
                <span class="lastWatched"
                  >Gesehen {{ getRelativeTime(eps.updatedAt) }}</span
                >
              </v-list-item-subtitle>
            </v-list-item>

            <v-divider class="history-divider sub" inset />
          </template>
        </v-card>

        <v-divider class="history-divider" inset />
      </template>
    </v-list>
  </v-navigation-drawer>
</template>
<script lang="ts">
import type { WatchHistoryListItem } from '@/lib/electron';
import { convertSecToMin, getRelativeTime } from '@/lib/utils';
import { useAppStore } from '@/store/app';
import { useShowStore } from '@/store/show';
import { mapActions, mapState, mapWritableState } from 'pinia';
import { defineComponent } from 'vue';

interface CombinedWatchHistoryItem extends WatchHistoryListItem {
  episodes: { all: WatchHistoryListItem[]; last_seen: WatchHistoryListItem };
}

export default defineComponent({
  name: 'NavDrawerExtended',
  data: () => ({
    editMode: false,
    collapsed: true,
    showSubItems: [] as string[],
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
    openEpisode(ev: KeyboardEvent | MouseEvent, wh: WatchHistoryListItem) {
      const clickedEl = ev.target as HTMLElement;

      if (clickedEl.tagName === 'I') {
        const index = this.showSubItems.indexOf(wh.e_id);

        if (index !== -1) {
          // remove if exists
          this.showSubItems.splice(index, 1);
        } else {
          // insert if not exists
          this.showSubItems.push(wh.e_id);
        }
        return;
      } else {
        this.$router.push(`/watch/${wh.show_id}/${wh.episode_id}`);
      }
    },
    isActive(wh: WatchHistoryListItem) {
      return !!this.showSubItems.find((si) => si === wh.e_id);
    },
  },
  computed: {
    ...mapWritableState(useAppStore, ['showExtendedDrawer']),
    ...mapState(useShowStore, ['watchHistory', 'shows', 'episodes']),
    combinedWatchHistory() {
      // return this.watchHistory.map((wh) => {
      //   return {
      //     show_name: 'show_name',
      //     show_type: 'show_name',
      //     epiodes: {
      //       last_seen: {
      //         e_id: '87d68a79-e894-4a1e-86fe-a75e3ecb66c9',
      //         show_id: '4c2eeda4-c277-4975-b20d-9badf081b860',
      //         episode_id: '57f92347-2d71-4817-977a-8793341228c0',
      //         progressSeconds: '180',
      //         progressPercent: 'Infinity',
      //         createdAt: {
      //           _custom: {
      //             type: 'date',
      //             displayText:
      //               'Thu Jan 29 2026 23:21:17 GMT+0100 (Mitteleuropäische Normalzeit)',
      //             value: '2026-01-29T23:21:17.350',
      //           },
      //         },
      //         updatedAt: {
      //           _custom: {
      //             type: 'date',
      //             displayText:
      //               'Thu Jan 29 2026 23:29:13 GMT+0100 (Mitteleuropäische Normalzeit)',
      //             value: '2026-01-29T23:29:13.013',
      //           },
      //         },
      //         showName: 'Wer nicht fragt, stirbt dumm!',
      //         showType: 'serie',
      //         seasonNum: 1,
      //         episodeNum: 1,
      //       },
      //       all: [
      //         {
      //           e_id: '87d68a79-e894-4a1e-86fe-a75e3ecb66c9',
      //           show_id: '4c2eeda4-c277-4975-b20d-9badf081b860',
      //           episode_id: '57f92347-2d71-4817-977a-8793341228c0',
      //           progressSeconds: '180',
      //           progressPercent: 'Infinity',
      //           createdAt: {
      //             _custom: {
      //               type: 'date',
      //               displayText:
      //                 'Thu Jan 29 2026 23:21:17 GMT+0100 (Mitteleuropäische Normalzeit)',
      //               value: '2026-01-29T23:21:17.350',
      //             },
      //           },
      //           updatedAt: {
      //             _custom: {
      //               type: 'date',
      //               displayText:
      //                 'Thu Jan 29 2026 23:29:13 GMT+0100 (Mitteleuropäische Normalzeit)',
      //               value: '2026-01-29T23:29:13.013',
      //             },
      //           },
      //           showName: 'Wer nicht fragt, stirbt dumm!',
      //           showType: 'serie',
      //           seasonNum: 1,
      //           episodeNum: 1,
      //         },
      //         {
      //           e_id: '87d68a79-e894-4a1e-86fe-a75e3ecb66c9',
      //           show_id: '4c2eeda4-c277-4975-b20d-9badf081b860',
      //           episode_id: '57f92347-2d71-4817-977a-8793341228c0',
      //           progressSeconds: '180',
      //           progressPercent: 'Infinity',
      //           createdAt: {
      //             _custom: {
      //               type: 'date',
      //               displayText:
      //                 'Thu Jan 29 2026 23:21:17 GMT+0100 (Mitteleuropäische Normalzeit)',
      //               value: '2026-01-29T23:21:17.350',
      //             },
      //           },
      //           updatedAt: {
      //             _custom: {
      //               type: 'date',
      //               displayText:
      //                 'Thu Jan 29 2026 23:29:13 GMT+0100 (Mitteleuropäische Normalzeit)',
      //               value: '2026-01-29T23:29:13.013',
      //             },
      //           },
      //           showName: 'Wer nicht fragt, stirbt dumm!',
      //           showType: 'serie',
      //           seasonNum: 1,
      //           episodeNum: 1,
      //         },
      //       ],
      //     },
      //   };
      // });

      const reduced: CombinedWatchHistoryItem[] = Object.values(
        this.watchHistory.reduce(
          (acc, item) => {
            const key = `${item.showName}__${item.showType}`;

            if (!acc[key]) {
              acc[key] = {
                ...item,
                episodes: {
                  all: [],
                  last_seen: item,
                },
              };
            }

            acc[key].episodes.all.push(item);

            // compare updatedAt dates for last_seen
            const currentLast = acc[key].episodes.last_seen;
            const currentDate = new Date(currentLast.updatedAt).getTime();
            const newDate = new Date(item.updatedAt).getTime();

            if (newDate > currentDate) {
              acc[key].episodes.last_seen = item;
            }

            return acc;
          },
          {} as Record<string, any>
        )
      );

      return reduced;
    },
  },
});
</script>

<style scoped>
#drawer-history {
  width: 300px !important;
  transform: translateX(-300px) !important;
}
#drawer-history.extended {
  transform: translateX(0px) !important;
}

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
.histoy-item .v-list-item-subtitle,
.histoy-sub-item .v-list-item-subtitle {
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
.history-divider.sub {
  max-width: 60%;
}

.v-list hr:last-child {
  display: none;
}
</style>
