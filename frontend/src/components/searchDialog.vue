<template>
  <v-dialog
    id="search-dialog"
    v-model="showSearch"
    max-width="60%"
    transition="dialog-top-transition"
    content-class="flex-start"
    @click:outside="showSearch = false, clearSearch"
  >
    <v-card class="overflow-hidden">
      <v-card-title
        class="pa-0"
        style="padding-top: 1rem"
      >
        <v-text-field
          ref="input"
          v-model="search"
          title="Suche"
          prepend-inner-icon="mdi-magnify"
          label="Suche nach Serien oder Animes"
          hide-details
          clearable
          @click:clear="clearSearch()"
        />
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col
            v-show="filterSeries.length > 0"
            class="pb-0"
          >
            <h3>Serien ({{ filterSeries.length }})</h3>
          </v-col>
          <v-col
            v-show="filterAnimes.length > 0"
            class="pb-0"
          >
            <h3>Animes ({{ filterAnimes.length }})</h3>
          </v-col>
        </v-row>

        <span v-if="search.length < 3" />

        <v-row v-else>
          <v-col
            v-show="filterSeries.length > 0"
            style="max-height: 500px; overflow-y: auto"
          >
            <v-list class="ml-4">
              <v-list-item
                v-for="item in filterSeries.slice(0, 20)"
                :key="item.show_slug"
                :value="item.show_slug"
                density="compact"
                @click.prevent="openShow(item.e_id)"
              >
                <span>{{ item.show_name }}</span>
              </v-list-item>
            </v-list>
          </v-col>
          <v-col
            v-show="filterAnimes.length > 0"
            style="max-height: 500px; overflow-y: auto"
          >
            <v-list class="ml-4">
              <v-list-item
                v-for="item in filterAnimes.slice(0, 20)"
                :key="item.show_slug"
                :value="item.show_slug"
                density="compact"
                @click.prevent="openShow(item.e_id)"
              >
                <span>{{ item.show_name }}</span>
              </v-list-item>
            </v-list>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapWritableState } from 'pinia';
import type { VTextField } from 'vuetify/components';
import { useShowStore } from '@/store/show';
import { useAppStore } from '@/store/app'; // noinspection JSUnusedGlobalSymbols

// noinspection JSUnusedGlobalSymbols
export default defineComponent({
  name: 'SearchDialog',
  data: () => ({
    search: '',
    showDialog: false,
  }),
  methods: {
    focusInput() {
      this.$nextTick(() => {
        const input = this.$refs.input as VTextField;
        input.focus();
      });
    },
    clearSearch() {
      this.search = '';
    },
    openShow(id: string) {
      this.showSearch = false;
      this.clearSearch();
      this.$router.push(`/watch/${id}`);
    },
  },
  computed: {
    ...mapState(useShowStore, ['shows']),
    ...mapWritableState(useAppStore, ['showSearch']),
    filterTitles() {
      const searchQuery = this.search.toLowerCase();
      if (searchQuery.length < 3) return [];
      return this.shows.filter(
        (title) =>
          title.show_name.toLowerCase().includes(searchQuery) ||
          title.show_meta.alternativeTitles
            .toLocaleLowerCase()
            .includes(searchQuery)
      );
    },
    filterAnimes() {
      if (this.search.length < 3) return [];
      return this.filterTitles.filter((title) => title.show_type === 'anime');
    },
    filterSeries() {
      if (this.search.length < 3) return [];
      return this.filterTitles.filter((title) => title.show_type === 'serie');
    },
  },
  watch: {
    showSearch(val) {
      this.showDialog = val;
      this.focusInput();
    },
  },
  mounted() {},
});
</script>

<style></style>
