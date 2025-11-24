<template>
  <div
    v-if="lastSeenEpisode"
    class="widget-content"
  >
    <v-card-title>Zuletzt gesehen </v-card-title>
    <v-card-subtitle>
      {{ getRelativeTime(lastSeenEpisode.updatedAt) }}
    </v-card-subtitle>
    <v-card-text>
      <v-row dense>
        <v-col style="text-wrap: balance">
          <h3>{{ lastSeenEpisode.showName }}</h3>
        </v-col>
      </v-row>
      <v-row dense>
        <v-col>Staffel {{ lastSeenEpisode.seasonNum }}</v-col>
        <v-col>Episode {{ lastSeenEpisode.episodeNum }}</v-col>
        <v-col>
          {{ convertSecToMin(Number(lastSeenEpisode.progressSeconds)) }}
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions>
      <v-btn
        class="w-100"
        variant="outlined"
        density="comfortable"
        append-icon="mdi-play"
        @click="openShow(lastSeenEpisode.show_id, lastSeenEpisode.episode_id)"
      >
        Weiter anschauen
      </v-btn>
    </v-card-actions>
  </div>
</template>

<script lang="ts">
import { mapState } from 'pinia';
import { useShowStore } from '@/store/show';
import { convertSecToMin, getRelativeTime } from '@/lib/utils';

export default {
  name: 'DatabaseStats',
  methods: {
    convertSecToMin,
    getRelativeTime,
    openShow(showId: string, episodeId: string) {
      this.$router.push(`/watch/${showId}/${episodeId}`);
    },
  },
  computed: {
    ...mapState(useShowStore, ['watchHistory']),
    lastSeenEpisode() {
      return this.watchHistory[0];
    },
  },
};
</script>

<style scoped>
.widget-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
