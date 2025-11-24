<template>
  <div class="widget-content">
    <v-card-title>Statistik</v-card-title>
    <v-card-subtitle>Einträge in der Datenbank</v-card-subtitle>
    <v-card-text>
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
        <v-col> Gesamt: </v-col>
        <v-col>
          {{ showCount.animes + showCount.serien }}
        </v-col>
      </v-row>
    </v-card-text>
  </div>
</template>

<script lang="ts">
import { mapState } from 'pinia';
import { useShowStore } from '@/store/show';

export default {
  name: 'DatabaseStats',
  computed: {
    ...mapState(useShowStore, ['shows']),
    showCount() {
      return this.shows.reduce(
        (count, show) => {
          if (show.show_type === 'serie') {
            count.serien += 1;
          } else if (show.show_type === 'anime') {
            count.animes += 1;
          }
          return count;
        },
        { serien: 0, animes: 0 }
      );
    },
  },
};
</script>

<style scoped></style>
