<template>
  <v-dialog
    id="search-dialog"
    v-model="showSearch"
    transition="dialog-top-transition"
    content-class="flex-start"
    @click:outside="((showSearch = false), clearSearch)"
  >
    <v-card class="overflow-hidden">
      <v-card-title class="pa-0" style="padding-top: 1rem">
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
        <div v-if="search.length >= 3">
          <v-row>
            <v-col class="pb-0">
              <h3 v-show="filterSeries.length > 0">
                Serien ({{ filterSeries.length }})
              </h3>
            </v-col>
            <v-col v-show="filterAnimes.length > 0" class="pb-0">
              <h3>Animes ({{ filterAnimes.length }})</h3>
            </v-col>
          </v-row>

          <v-row>
            <v-col
              v-show="filterSeries.length > 0"
              style="max-height: 500px; overflow-y: auto"
            >
              <v-list class="ml-4">
                <v-list-item
                  v-for="item in filterSeries.slice(0, 20)"
                  :key="item.show_slug"
                  class="search-item"
                  :value="item.show_slug"
                  density="compact"
                  @click.prevent="openShow(item)"
                >
                  {{ item.show_name }}
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
                  class="search-item"
                  :value="item.show_slug"
                  density="compact"
                  @click.prevent="openShow(item)"
                >
                  <span>{{ item.show_name }}</span>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </div>

        <div v-if="search.length < 3 && history">
          <v-row>
            <v-col class="pb-0">
              <h3>Zuletzt gesucht:</h3>
            </v-col>
          </v-row>

          <v-row>
            <v-col v-show="history" style="max-height: 500px; overflow-y: auto">
              <v-list class="ml-4">
                <v-list-item
                  v-for="item in history"
                  :key="item.show_slug"
                  class="search-item"
                  :value="item.show_slug"
                  density="compact"
                  @click.prevent="openShow(item)"
                >
                  <v-row>
                    <v-col cols="2" class="d-flex justify-end">
                      {{ item.show_type === 'anime' ? 'Anime' : 'Serie' }}
                    </v-col>
                    <v-col cols="10">
                      {{ item.show_name }}
                    </v-col>
                  </v-row>
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
                  class="search-item"
                  :value="item.show_slug"
                  density="compact"
                  @click.prevent="openShow(item)"
                >
                  <span>{{ item.show_name }}</span>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import type { Show } from '@/lib/electron';
import { useAppStore } from '@/store/app'; // noinspection JSUnusedGlobalSymbols
import { useShowStore } from '@/store/show';
import { mapState, mapWritableState } from 'pinia';
import { defineComponent } from 'vue';
import type { VTextField } from 'vuetify/components';

// noinspection JSUnusedGlobalSymbols
export default defineComponent({
  name: 'SearchDialog',
  data: () => ({
    search: '',
    showDialog: false,
    history: null as Show[] | null,
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
    openShow(show: Show) {
      this.showSearch = false;
      this.clearSearch();
      this.saveToHistory(show);
      this.$router.push(`/watch/${show.e_id}`);
    },
    saveToHistory(show: Show) {
      const stored = localStorage.getItem('search-history');

      if (!stored) {
        localStorage.setItem('search-history', JSON.stringify([show]));
      } else {
        const storedItems = JSON.parse(stored) as Show[];
        const duplicate = storedItems.find((d) => d.e_id === show.e_id);
        if (duplicate) {
          storedItems.splice(storedItems.indexOf(duplicate), 1);
        }
        localStorage.setItem(
          'search-history',
          JSON.stringify([show, ...storedItems].slice(0, 10))
        );
      }
    },
    getSearchHistory() {
      const history = localStorage.getItem('search-history');
      this.history = history ? (JSON.parse(history) as Show[]) : null;
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
      if (val) this.getSearchHistory();
      this.showDialog = val;
      this.focusInput();
    },
  },
  mounted() {},
});
</script>

<style lang="scss">
#search-dialog {
  .v-overlay__content {
    min-width: 520px;
    width: 60%;
    max-width: 800px;
  }

  .search-item {
    padding: 10px 0;

    &:after {
      content: '';
      opacity: 1;
      border: none;
      border-radius: unset;
      border-bottom: 1px inset grey;
      width: 75%;
      right: 0;
      margin-left: auto;
    }
    &:last-child:after {
      opacity: 0;
    }
  }
}
</style>
