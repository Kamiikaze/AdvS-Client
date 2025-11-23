<template>
  <v-card color="#643bc9">
    <v-card-title>Kürzlich hinzugefügt</v-card-title>
    <v-card-subtitle>
      {{ recentlyAdded.length }} neue Titel wurden in den letzten 30 Tagen
      hinzugefügt
    </v-card-subtitle>
    <v-card-text>
      <v-data-table-virtual
        id="recent-table"
        :height="300"
        :items="recentlyAdded"
        :headers="headers"
        :row-props="{ class: 'list-item' }"
        @click:row="openShow"
      >
        <template #headers />

        <template #[`item.index`]="{ index }">
          {{ index + 1 }}
        </template>

        <template #[`item.createdAt`]="{ item }">
          <v-tooltip
            :text="item.createdAt.toLocaleString()"
            location="top"
          >
            <template #activator="{ props }">
              <v-list-item
                v-bind="props"
                class="pa-0"
              >
                {{ dateFromNow(item.createdAt) }}
              </v-list-item>
            </template>
          </v-tooltip>
        </template>
      </v-data-table-virtual>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { mapState } from 'pinia';
import { useShowStore } from '@/store/show';
import moment from "moment";

export default {
  name: 'RecentlyAdded',
  data: () => ({
    headers: [
      { title: 'Index', key: 'index', width: 0 },
      { title: 'show_name', key: 'show_name' },
      { title: 'Created', key: 'createdAt', width: 150 },
    ],
  }),
  methods: {
    dateFromNow(date: Date) {
      return moment(date).calendar(null, {
        sameDay: '[Heute]',
        lastDay: '[Gestern]',
        lastWeek: () => {
          const days = moment().diff(moment(date), 'days');
          return `[vor ${days} Tagen]`;
        },
        sameElse: () => {
          const days = moment().diff(moment(date), 'days');
          return `[vor ${days} Tagen]`;
        },
      });
    },
    openShow(ev: any, val: any) {
      this.$router.push(`/watch/${val.item.e_id}`);
    },
  },
  computed: {
    ...mapState(useShowStore, ['shows']),
    recentlyAdded() {
      // show if createdAt is past 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentShows = this.shows.filter(
        (show) => new Date(show.createdAt) > thirtyDaysAgo
      );
      return recentShows.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
    },
  },
};
</script>

<style>
#recent-table .list-item {
  color: white;
  text-decoration: none;
}
#recent-table .list-item td:nth-child(2):hover {
  text-decoration: underline;
}

#recent-table .list-item:nth-child(odd) {
  background-color: #46239c !important;
}
#recent-table .list-item:nth-child(even) {
  background-color: #5221bc;
}
</style>
