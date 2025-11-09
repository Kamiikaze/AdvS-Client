<template>
  <v-card
    color="#643bc9"
  >
    <v-card-title>Stats</v-card-title>
    <v-card-text>
      <v-row
        dense
        class="stats"
      >
        <v-col> Serien: </v-col>
        <v-col>
          {{ showCount.serien }}
        </v-col>
      </v-row>
      <v-row
        dense
        class="stats"
      >
        <v-col> Animes: </v-col>
        <v-col>
          {{ showCount.animes }}
        </v-col>
      </v-row>
      <v-row
        dense
        class="stats"
      >
        <v-col> Gesamt: </v-col>
        <v-col>
          {{ showCount.animes + showCount.serien }}
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { mapState } from 'pinia';
import { useShowStore } from '@/store/show';

export default {
  name: 'DatabaseStats',
  computed: {
    ...mapState(useShowStore, ['shows', "watchHistory"]),
    showCount() {
      return this.shows.reduce(
        (count, show) => {
          if (show.show_type === 'serie') {
            count.serien++;
          } else if (show.show_type === 'anime') {
            count.animes++;
          }
          return count;
        },
        { serien: 0, animes: 0 }
      );
    },
    recentlyAdded() {
      // show if createdAt is past 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return this.shows.filter(
        (show) => new Date(show.createdAt) > thirtyDaysAgo
      );
    },
  },
};
</script>

<style scoped>
.stats .v-col {
  max-width: 80px;
}
</style>
