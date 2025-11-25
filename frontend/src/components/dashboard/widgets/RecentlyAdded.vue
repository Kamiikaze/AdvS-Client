<template>
  <div class="widget-content">
    <v-card-title>Kürzlich hinzugefügt </v-card-title>
    <v-card-subtitle>
      {{ recentlyAdded.length }} neue Titel wurden in den letzten 30 Tagen
      hinzugefügt
    </v-card-subtitle>
    <v-card-text class="widget-table-container">
      <v-data-table-virtual
        id="recent-table"
        :height="tableHeight"
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
          <v-tooltip :text="item.createdAt.toLocaleString()" location="top">
            <template #activator="{ props }">
              <v-list-item v-bind="props" class="pa-0">
                {{ dateFromNow(item.createdAt) }}
              </v-list-item>
            </template>
          </v-tooltip>
        </template>
      </v-data-table-virtual>
    </v-card-text>
  </div>
</template>

<script lang="ts">
import type { Show } from '@/lib/electron';
import { useShowStore } from '@/store/show';
import moment from 'moment';
import { mapState } from 'pinia';
import { defineComponent } from 'vue';
import type { ItemSlotBase } from 'vuetify/lib/components/VDataTable/types';

export default defineComponent({
  name: 'RecentlyAdded',
  data: () => ({
    headers: [
      { title: 'Index', key: 'index', width: 0 },
      { title: 'show_name', key: 'show_name' },
      { title: 'Created', key: 'createdAt', width: 150 },
    ],
    tableHeight: 520,
  }),
  mounted() {
    this.updateTableHeight();
    window.addEventListener('resize', this.updateTableHeight);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateTableHeight);
  },
  methods: {
    updateTableHeight() {
      // Calculate dynamic height based on parent container
      const container = this.$el?.closest('.vgl-item');

      if (container) {
        const containerHeight = container.offsetHeight;
        // Subtract space for title, subtitle, and padding
        this.tableHeight = Math.max(200, containerHeight - 110);
      }
    },
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
    openShow(ev: PointerEvent, val: ItemSlotBase<Show>) {
      console.log('openshow', ev, val);
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
});
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
