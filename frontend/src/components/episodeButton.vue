<template>
  <v-tooltip
    location="bottom"
    close-delay="0"
    open-delay="300"
    :disabled="!getEpisodeWatchState"
  >
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        :class="[
          episodeIndex === index ? 'episode-selected' : '',
          getEpisodeWatchState ? 'episode-seen' : '',
        ]"
        @click="$emit('nextEpisode')"
      >
        {{ episode.episode_number }}
      </v-btn>
    </template>
    <span
      ><b>Zuletzt gesehen:</b>
      {{ getEpisodeWatchState?.updatedAt.toLocaleString() }}</span
    >
  </v-tooltip>
</template>

<script lang="ts">
import type { Episode } from '@/lib/electron';
import { useShowStore } from '@/store/show';
import { mapState } from 'pinia';
import { defineComponent, type PropType } from 'vue';

export default defineComponent({
  name: 'EpisodeButton',
  props: {
    episode: {
      type: Object as PropType<Episode>,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    episodeIndex: {
      type: Number,
      required: true,
    },
  },
  emits: ['nextEpisode'],
  data: () => ({
    //
  }),
  methods: {},
  computed: {
    ...mapState(useShowStore, ['watchHistory']),
    getEpisodeWatchState() {
      return this.watchHistory.find(
        (wl) => wl.episode_id === this.episode.e_id
      );
    },
  },
});
</script>

<style scoped></style>
