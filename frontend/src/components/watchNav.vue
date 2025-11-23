<template>
  <div>
    <!-- Dropdowns -->
    <v-row align="center">
      <v-col cols="auto">
        <v-select
          v-model="selectedSeason"
          :items="getSeasons"
          item-title="label"
          item-value="value"
          hide-details
          variant="solo"
          density="compact"
        />
      </v-col>
      <v-col cols="auto">
        <v-select
          v-model="selections.language"
          :items="uniqueLanguages"
          item-title="label"
          item-value="value"
          hide-details
          variant="solo"
          density="compact"
        />
      </v-col>
      <v-col cols="auto">
        <v-select
          v-model="selections.hoster"
          :items="uniqueHosters"
          item-title="label"
          hide-details
          variant="solo"
          density="compact"
        />
      </v-col>
    </v-row>

    <!-- Episode List -->
    <v-row
      :key="getSeasonEpisodes.length"
      align="center"
    >
      <div
        ref="episodeContainer"
        class="episode-list-wrapper"
      >
        <v-slide-group
          v-model="getEpisodeIndex"
          class="episode-list pa-4"
          :show-arrows="shouldShowArrows"
        >
          <v-slide-group-item
            v-for="(ep, index) in getSeasonEpisodes"
            :key="ep.e_id"
            :value="ep.episode_number"
          >
            <v-btn
              :class="getEpisodeIndex == index ? 'episode-selected' : ''"
              :rounded="false"
              @click="$emit('nextEpisode', Number(ep.episode_number))"
            >
              {{ ep.episode_number }}
            </v-btn>
          </v-slide-group-item>
        </v-slide-group>
      </div>
    </v-row>

    <!-- Episode Titel & Description -->
    <v-card
      v-if="episodes.length > 0"
      class="my-6"
    >
      <v-card-title>
        {{ getEpisodeTitles.german }}
        <span class="d-block text-subtitle-2 font-weight-thin text-disabled">{{
          getEpisodeTitles.english
        }}</span>
      </v-card-title>
      <v-card-text>
        <span :class="showMore ? '' : 'ellipsis-wrapper'">{{
          currentEpisode?.episode_description || 'Keine Beschreibung vorhanden'
        }}</span>
        <a
          class="text-disabled d-block mt-1"
          href="#"
          @click.prevent="showMore = !showMore"
        >[{{ showMore ? 'weninger' : 'mehr' }} Anzeigen]</a>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { type Episode } from '@/lib/electron';
import { mapActions, mapState } from 'pinia';
import { useShowStore } from '@/store/show';
import { splitEpisodeTitle } from '@/lib/utils';

export default defineComponent({
  props: {
    episodes: {
      type: Array as PropType<Episode[]>,
      required: true,
    },
  },
  emits: {
    nextEpisode: (episodeNumber?: number) => {
      return (
        episodeNumber === undefined ||
        (Number.isInteger(episodeNumber) && episodeNumber > 0)
      );
    },
  },
  name: 'WatchNav',
  data: () => ({
    showMore: false,
    containerWidth: 0,
  }),
  methods: {
    splitEpisodeTitle,
    ...mapActions(useShowStore, ['fetchEpisodeHosters', 'getEpisodeByNumber']),
    ...mapState(useShowStore, ['availableLanguages']),
    toIndex(n: string) {
      return Number(n) - 1;
    },
    nextEpisode(val: number) {
      this.selections.episode = (val + 1).toString();
      this.fetchEpisodeHosters();
    },
    updateCurrentEpisode() {
      useShowStore().$patch((state) => {
        const getEpisode = this.getEpisodeByNumber(
          state.selections.season,
          state.selections.episode
        );
        console.log('getEpisode', getEpisode);
        state.currentEpisode = getEpisode;
      });
    },
    checkContainerWidth() {
      this.$nextTick(() => {
        const container = this.$refs.episodeContainer as HTMLElement;
        if (container) {
          this.containerWidth = container.offsetWidth;
        }
      });
    },
  },
  computed: {
    ...mapState(useShowStore, [
      'episodeHosters',
      'selections',
      'currentEpisode',
    ]),
    uniqueLanguages() {
      // get unique languages in episodeHoster
      const languages = this.episodeHosters.map(
        (hoster) => hoster.hoster_language
      );

      return (
        this.availableLanguages().filter((lang) =>
          languages.includes(lang.value)
        ) || []
      );
    },
    uniqueHosters() {
      if (this.uniqueLanguages.length === 0) return [];
      // find unique hosters by language
      const hosters = this.episodeHosters.filter(
        (hoster) => hoster.hoster_language === this.selections.language
      );
      return Array.from(
        new Set(
          hosters.map((hoster) => ({
            label: hoster.hoster_label,
            value: hoster.hoster_key,
          }))
        ).values()
      );
    },
    getSeasons() {
      const seasons = this.episodes.map((episode) => episode.season_number);
      return Array.from(new Set(seasons))
        .map((season) => ({
          label: season == '0' ? 'Filme' : `Staffel ${season}`,
          value: season,
        }))
        .sort((a, b) => parseInt(a.value) - parseInt(b.value));
    },
    selectedSeason: {
      get() {
        return this.selections.season;
      },
      set(value: string) {
        this.selections.season = value;
      },
    },
    getSeasonEpisodes() {
      if (this.episodes.length === 0) return [];
      const seasonNum = this.selections.season;
      return this.episodes
        .filter((episode) => episode.season_number == seasonNum)
        .sort(
          (a, b) => parseInt(a.episode_number) - parseInt(b.episode_number)
        );
    },
    getEpisodeIndex() {
      return this.toIndex(this.selections.episode);
    },
    getEpisodeTitles() {
      return this.currentEpisode
        ? this.splitEpisodeTitle(this.currentEpisode)
        : { german: '', english: '' };
    },
    shouldShowArrows() {
      const episodeButtonWidth = 64;
      const estimatedTotalWidth =
        this.getSeasonEpisodes.length * episodeButtonWidth;

      // Add padding and some buffer
      return estimatedTotalWidth > this.containerWidth - 100;
    },
  },
  watch: {
    'selections.episode'() {
      this.updateCurrentEpisode();
    },
    'selections.season'() {
      this.updateCurrentEpisode();
      this.$nextTick(() => {
        this.checkContainerWidth();
      });
    },
    getSeasonEpisodes() {
      this.$nextTick(() => {
        this.checkContainerWidth();
      });
    },
    uniqueLanguages() {
      const isAvailable = this.uniqueLanguages.find(
        (lang) => lang.value === this.selections.language
      );

      if (!isAvailable) console.log('Selected Language is not available');
      this.selections.language = this.uniqueLanguages[0].value;
    },
  },
  mounted() {
    this.checkContainerWidth();
    window.addEventListener('resize', this.checkContainerWidth);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkContainerWidth);
  },
});
</script>

<style>
.episode-list-wrapper {
  width: 100%;
  max-width: 100%;
}

.episode-list button:first-child {
  border-radius: 5px 0 0 5px !important;
}
.episode-list button:last-child {
  border-radius: 0 5px 5px 0 !important;
}

.episode-selected {
  position: sticky;
  left: 0;
  z-index: 999;
  background-color: #643bc9;
}

.ellipsis-wrapper {
  max-width: calc(100% - 1rem);
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  display: block;
}
</style>
