<template>
  <div class="widget-content">
    <v-card-title>Statistik</v-card-title>
    <v-card-subtitle>Einträge in der Datenbank</v-card-subtitle>
    <v-card-text>
      <v-row dense>
        <v-col> <h3>Shows</h3> </v-col>
      </v-row>
      <v-row dense>
        <v-col> Serien: </v-col>
        <v-col>
          {{ showCount.serien }}
        </v-col>
      </v-row>
      <v-row dense>
        <v-col> Animes: </v-col>
        <v-col>
          {{ showCount.animes }}
        </v-col>
      </v-row>
      <v-row dense>
        <v-col> <h3>Verlauf</h3> </v-col>
      </v-row>
      <v-row dense>
        <v-col> Shows gesehen: </v-col>
        <v-col>
          {{ watchHistoryCount.shows }}
        </v-col>
      </v-row>
      <v-row dense>
        <v-col> Episoden gesehen: </v-col>
        <v-col>
          {{ watchHistoryCount.episodes }}
        </v-col>
      </v-row>
    </v-card-text>
  </div>
</template>

<script lang="ts">
import type { Show } from '@/lib/electron';
import { useShowStore } from '@/store/show';
import { mapState } from 'pinia';

export default {
  name: 'DatabaseStats',
  data: () => ({}),
  computed: {
    ...mapState(useShowStore, ['shows', 'watchHistory']),
    showCount() {
      return {
        animes: this.shows.filter((show: Show) => show.show_type === 'anime')
          .length,
        serien: this.shows.filter((show: Show) => show.show_type === 'serie')
          .length,
      };
    },
    watchHistoryCount() {
      const uniqueShows = new Set(
        this.watchHistory.map((episode) => episode.show_id)
      );
      const uniqueEpisodes = new Set(
        this.watchHistory.map((episode) => episode.episode_id)
      );
      return {
        shows: uniqueShows.size,
        episodes: uniqueEpisodes.size,
      };
    },
  },
};
</script>
