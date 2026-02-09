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
          v-show="uniqueLanguages.length > 0"
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
          v-show="uniqueHosters.length > 0"
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
    <v-row align="center">
      <v-col>
        <div
          ref="episodeContainer"
          class="episode-list-wrapper"
          :class="[
            showLeftArrow ? 'showLeftArrow' : '',
            showRightArrow ? 'showRightArrow' : '',
          ]"
        >
          <div class="episode-scroll-container">
            <button
              v-show="showLeftArrow"
              class="scroll-arrow scroll-arrow-left"
              @click="scrollLeft"
            >
              <v-icon>mdi-chevron-left</v-icon>
            </button>

            <div
              ref="episodeList"
              class="episode-list"
              @scroll="updateArrowVisibility"
            >
              <div
                v-for="(ep, index) in getSeasonEpisodes"
                :key="ep.e_id"
                :ref="getEpisodeIndex === index ? 'activeButton' : undefined"
                class="episode-item"
              >
                <v-btn
                  :class="getEpisodeIndex === index ? 'episode-selected' : ''"
                  @click="$emit('nextEpisode', Number(ep.episode_number))"
                >
                  {{ ep.episode_number }}
                </v-btn>
              </div>
            </div>

            <button
              v-show="showRightArrow"
              class="scroll-arrow scroll-arrow-right"
              @click="scrollRight"
            >
              <v-icon>mdi-chevron-right</v-icon>
            </button>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Episode Titel & Description -->
    <v-card v-if="episodes.length > 0" class="my-6">
      <div class="d-flex flex-row justify-space-between align-center">
        <v-card-title class="text-wrap" style="max-width: calc(100% - 200px)">
          {{ getEpisodeTitles.german }}
          <span
            class="d-block text-subtitle-2 font-weight-thin text-disabled"
            >{{ getEpisodeTitles.english }}</span
          >
        </v-card-title>
        <a
          class="text-disabled text-decoration-underline cursor-pointer px-4 py-2"
          @click.prevent="showMore = !showMore"
          >Beschreibung {{ showMore ? 'ausblenden' : 'anzeigen' }}
        </a>
      </div>
      <v-card-text v-if="showMore">
        <span>{{
          currentEpisode?.episode_description || 'Keine Beschreibung vorhanden'
        }}</span>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import { type Episode, type HosterLanguage } from '@/lib/electron';
import { splitEpisodeTitle } from '@/lib/utils';
import { useShowStore } from '@/store/show';
import { mapActions, mapState } from 'pinia';
import { defineComponent, type PropType } from 'vue';

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
    showLeftArrow: false,
    showRightArrow: false,
  }),
  methods: {
    splitEpisodeTitle,
    ...mapActions(useShowStore, ['fetchEpisodeHosters', 'getEpisodeByNumber']),
    ...mapState(useShowStore, ['availableLanguages']),
    toIndex(n: string) {
      return Number(n) - 1;
    },
    updateCurrentEpisode(seasonChanged?: boolean) {
      if (seasonChanged) {
        this.selections.episode = '1';
      }

      useShowStore().$patch((state) => {
        const getEpisode = this.getEpisodeByNumber(
          state.selections.season,
          state.selections.episode
        );
        console.log('getEpisode', getEpisode);
        state.currentEpisode = getEpisode;
      });
    },
    scrollToActiveEpisode() {
      this.$nextTick(() => {
        const activeButton = this.$refs.activeButton as HTMLElement[];
        const episodeList = this.$refs.episodeList as HTMLElement;

        if (activeButton && activeButton[0] && episodeList) {
          const button = activeButton[0];

          // Center the active button in the viewport
          const scrollLeft =
            button.offsetLeft -
            episodeList.clientWidth / 2 +
            button.clientWidth / 2;
          episodeList.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }
      });
    },
    scrollLeft() {
      const episodeList = this.$refs.episodeList as HTMLElement;
      if (episodeList) {
        episodeList.scrollBy({ left: -200, behavior: 'smooth' });
      }
    },
    scrollRight() {
      const episodeList = this.$refs.episodeList as HTMLElement;
      if (episodeList) {
        episodeList.scrollBy({ left: 200, behavior: 'smooth' });
      }
    },
    updateArrowVisibility() {
      const episodeList = this.$refs.episodeList as HTMLElement;
      if (episodeList) {
        this.showLeftArrow = episodeList.scrollLeft > 0;
        this.showRightArrow =
          episodeList.scrollLeft <
          episodeList.scrollWidth - episodeList.clientWidth - 1;
      }
    },
    checkContainerWidth() {
      this.$nextTick(() => {
        const container = this.$refs.episodeContainer as HTMLElement;
        if (container) {
          this.containerWidth = container.offsetWidth;
          this.updateArrowVisibility();
          this.scrollToActiveEpisode(); // Always scroll to active on resize
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
      if (this.uniqueLanguages.length === 0) {
        return [];
      }
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
  },
  watch: {
    'selections.episode'() {
      this.updateCurrentEpisode();
      this.scrollToActiveEpisode();
    },
    'selections.season'(oldS, newS) {
      console.log(`Season changed from ${oldS} to ${newS}`);
      this.updateCurrentEpisode(true);
      this.$nextTick(() => {
        this.checkContainerWidth();
      });
    },
    getSeasonEpisodes() {
      this.$nextTick(() => {
        this.checkContainerWidth();
        this.updateArrowVisibility();
      });
    },
    uniqueLanguages(val) {
      const isAvailable = val.find(
        (lang: HosterLanguage) => lang.value === this.selections.language
      );

      if (!isAvailable) {
        console.log('Selected Language is not available');
      }
      if (val.length === 0) return;

      this.selections.language = val[0].value;
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

.episode-list-wrapper.scroll-arrow-left {
  margin-left: 5px;
  width: calc(100% - 5px);
}
.episode-list-wrapper.scroll-arrow-right {
  margin-right: 5px;
  width: calc(100% - 5px);
}
.episode-list-wrapper.scroll-arrow-left.scroll-arrow-right {
  width: calc(100% - 10px);
}

.episode-item {
  position: relative;
}

.episode-item button {
  border-radius: 0;
}

.episode-item:not(:last-child)::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 60%;
  width: 1px;
  background-color: rgba(255, 255, 255, 0.12);
  pointer-events: none;
}

.episode-item:first-child button {
  border-radius: 5px 0 0 5px;
}

.episode-item:last-child button {
  border-radius: 0 5px 5px 0;
}

.episode-scroll-container {
  position: relative;
  width: 100%;
}

.episode-list {
  display: flex;
  overflow-x: auto;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;
  gap: 0;
}

.episode-list::-webkit-scrollbar {
  display: none;
}

.scroll-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  background: linear-gradient(
    to right,
    rgba(18, 18, 18, 0.95),
    rgba(18, 18, 18, 0.7)
  );
  border: 1px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  padding: 1rem 0.75rem;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(2px);
}

.scroll-arrow:hover {
  background: rgba(100, 59, 201, 0.6);
  border-color: rgba(100, 59, 201, 0.5);
}

.scroll-arrow-left {
  left: -5px;
  border-radius: 5px 0 0 5px;
  background: linear-gradient(
    to right,
    rgba(18, 18, 18, 0.95),
    rgba(18, 18, 18, 0.7),
    transparent
  );
}

.scroll-arrow-right {
  right: -5px;
  border-radius: 0 5px 5px 0;
  background: linear-gradient(
    to left,
    rgba(18, 18, 18, 0.95),
    rgba(18, 18, 18, 0.7),
    transparent
  );
}

.episode-selected {
  background-color: #643bc9;
}
</style>
