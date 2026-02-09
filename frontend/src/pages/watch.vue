<template>
  <v-container>
    <v-row>
      <v-col>
        <h1
          style="text-wrap: balance"
          :data-alternative-title="
            currentShow?.show_meta?.alternativeTitles || ''
          "
        >
          {{ currentShow?.show_name }}
        </h1>
      </v-col>
      <v-col cols="1">
        <v-menu scroll-strategy="close">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              class="ma-2"
              icon="mdi-dots-vertical"
              variant="text"
              density="compact"
              @click="showMenu = !showMenu"
            />
          </template>

          <v-list class="py-0" density="compact" slim>
            <v-list-item prepend-icon="mdi-refresh" @click="setShow($props.id)">
              Re-fetch Show
            </v-list-item>

            <v-divider />

            <v-list-item prepend-icon="mdi-refresh" @click="refreshHosters">
              Re-fetch Hosters
            </v-list-item>

            <v-divider />

            <v-list-item prepend-icon="mdi-refresh" @click="toggleIframe">
              {{ showIframe ? 'Hide' : 'Show' }} Iframe
            </v-list-item>

            <v-divider />
          </v-list>
        </v-menu>
      </v-col>
    </v-row>

    <v-divider />

    <v-row
      class="text-subtitle-2 font-weight-thin text-medium-emphasis mt-n1 mb-3"
    >
      <v-col cols="auto">
        {{ currentShow?.show_category }}
      </v-col>
      <v-col cols="auto">
        {{ currentShow?.show_start_year }} -
        {{ currentShow?.show_end_year ?? 'Heute' }}
      </v-col>
      <v-col v-if="currentShow?.show_meta?.imdbId" cols="auto">
        <ExternalLink
          :url="`https://imdb.com/title/${currentShow?.show_meta.imdbId}`"
        >
          IMDB
        </ExternalLink>
      </v-col>
      <v-col cols="auto">
        <ExternalLink :url="externalSource.url">
          {{ externalSource.title }}
        </ExternalLink>
      </v-col>
    </v-row>

    <WatchNav
      ref="watch-nav"
      :episodes
      :unique-hosters="getEpisodeHosters.uniqueHosters"
      :unique-languages="getEpisodeHosters.uniqueLanguages"
      @next-episode="nextEpisode"
    />

    <div ref="iframe-wrapper" class="iframe-wrapper w-100 h-100" />

    <VideoPlayerV2
      v-if="playerOptions.sources"
      ref="videoPlayer"
      :options="playerOptions"
      @next-episode="nextEpisode"
    />
  </v-container>
</template>

<script lang="ts">
import ExternalLink from '@/components/externalLink.vue';
import type { VideoPlayerOptions } from '@/components/videoPlayerV2/index.vue';
import VideoPlayerV2 from '@/components/videoPlayerV2/index.vue';
import WatchNav from '@/components/watchNav.vue';
import type { Episode, EpisodeHoster, ScraperLink, Show } from '@/lib/electron';
import { splitEpisodeTitle } from '@/lib/utils';
import { useShowStore } from '@/store/show';
import { mapActions, mapState, mapWritableState } from 'pinia';
import type { ComponentInstance } from 'vue';

export default {
  name: 'Watch',
  components: {
    VideoPlayerV2,
    ExternalLink,
    WatchNav,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
    episode: {
      type: String,
      required: false,
      default: null,
    },
  },
  data: () => ({
    hosterEpisode: {},
    resolvedStream: {} as ScraperLink,
    clearResolvedCache: false,
    showIframe: false,
    showMenu: false,
    menuTarget: null,
    isNext: false,
    playerOptions: <VideoPlayerOptions>{
      controls: false,
    },
  }),
  methods: {
    ...mapState(useShowStore, ['availableLanguages']),
    ...mapActions(useShowStore, ['fetchShowDetails', 'fetchEpisodeHosters']),
    async setShow(showId: string) {
      this.currentShow = null as Show | null;
      await this.fetchShowDetails(showId);

      if (this.currentShow) {
        this.playerOptions.showName = this.currentShow.show_name;
      }
      this.playerOptions.nextEpisodeTitle = this.nextEpisodeTitle;

      const episodeParam = this.$route.params.episode;

      if (episodeParam) {
        console.log('Loading episode by param', episodeParam);
        const episode = this.episodes.find(
          (episode) => episode.e_id === episodeParam
        );
        if (episode) {
          this.selections.episode = episode.episode_number;
          this.selections.season = episode.season_number;
        }
      } else {
        this.selections.episode = '1';
        this.selections.season = '1';
      }

      await this.fetchEpisodeHosters();
      this.updateWindowTitle();
    },
    async refreshHosters() {
      const videoPlayerChildComponent = this.$refs
        .videoPlayer as ComponentInstance<typeof VideoPlayerV2>;
      videoPlayerChildComponent?.player.pause();
      this.clearResolvedCache = true;
      await this.fetchEpisodeHosters();
    },
    updateWindowTitle() {
      document.title = `S${this.selections.season}E${this.selections.episode} - ${this.currentShow?.show_name} | AdvS`;
    },
    async nextEpisode(episodeNum?: number) {
      if (this.isNext) {
        console.warn('Already getting next episode', this.isNext);
        setTimeout(() => (this.isNext = false), 10 * 1000);
        return;
      } else {
        this.isNext = true;
      }

      const videoPlayerChildComponent = this.$refs
        .videoPlayer as ComponentInstance<typeof VideoPlayerV2>;

      if (videoPlayerChildComponent) {
        if (!videoPlayerChildComponent.player.paused) {
          videoPlayerChildComponent.player.pause();
        }
        videoPlayerChildComponent.isLoading.player = true;
      }

      const nextEpisodeNum = episodeNum ?? Number(this.selections.episode) + 1;

      const nextPossibleEpisode = this.findNextEpisode(
        Number(this.selections.season),
        nextEpisodeNum
      );

      if (!nextPossibleEpisode) {
        console.log('No next episode found');
        setTimeout(() => (this.isNext = false), 2 * 1000);
        return;
      }

      this.selections.season = nextPossibleEpisode.season_number;
      this.selections.episode = nextPossibleEpisode.episode_number;

      this.playerOptions.nextEpisodeTitle = this.nextEpisodeTitle;

      await this.fetchEpisodeHosters();

      // Start playback on manual next-interaction
      if (videoPlayerChildComponent && !videoPlayerChildComponent.autoplay) {
        videoPlayerChildComponent.autoplay = true;
        videoPlayerChildComponent.toggleAutoplay();
        videoPlayerChildComponent.player.play();
        setTimeout(() => {
          videoPlayerChildComponent.autoplay = false;
          videoPlayerChildComponent.toggleAutoplay();
        }, 1000 * 2);
      }

      setTimeout(() => (this.isNext = false), 2 * 1000);
    },
    findNextEpisode(seasonNum: number, episodeNum: number): Episode | null {
      // Find current season episodes
      const seasonEpisodes = this.episodes.filter(
        (ep) => Number(ep.season_number) === seasonNum
      );

      // Check if next episode exists in current season
      const nextEpisode = seasonEpisodes.find(
        (ep) => Number(ep.episode_number) === episodeNum
      );

      if (nextEpisode) {
        return nextEpisode;
      }

      // If no next episode in current season, try next season
      const nextSeasonEpisode = this.episodes.find(
        (ep) =>
          Number(ep.season_number) === seasonNum + 1 &&
          Number(ep.episode_number) === 1
      );

      return nextSeasonEpisode || null;
    },
    toggleIframe() {
      const wrapper = this.$refs['iframe-wrapper'] as HTMLElement;

      if (this.showIframe) {
        wrapper.innerHTML = '';
        this.showIframe = false;
      } else {
        // Create Iframe
        const iframe = document.createElement('iframe');
        iframe.height = '400px';
        iframe.width = '100%';

        wrapper.appendChild(iframe);

        iframe.src =
          this.resolvedStream.redirect ||
          this.selectedEpisodeHost.hoster_redirect;

        this.showIframe = true;
      }
    },
    getEpisodeTitle(ep: Episode) {
      const langTitles = splitEpisodeTitle(ep);
      return `S${ep.season_number}E${ep.episode_number} • ${langTitles.german}`;
    },
  },
  computed: {
    ...mapState(useShowStore, [
      'episodes',
      'episodeHosters',
      'selections',
      'currentEpisode',
    ]),
    ...mapWritableState(useShowStore, ['currentShow']),
    externalSource() {
      let title, url;

      if (!this.currentShow) return { title: '', url: '' };
      if (this.currentShow.show_type === 'anime') {
        title = 'AniWorld.to';
        url = 'https://aniworld.to/anime/stream/' + this.currentShow.show_slug;
      } else {
        title = 'S.to';
        url = 'https://s.to/serie/stream/' + this.currentShow.show_slug;
      }

      return {
        title,
        url,
      };
    },
    getEpisodeHosters() {
      if (this.episodeHosters.length === 0) {
        return { uniqueHosters: [], uniqueLanguages: [] };
      }
      const hosters = this.episodeHosters.map((hoster: EpisodeHoster) => ({
        label: hoster.hoster_label,
        value: hoster.hoster_key,
      }));
      const languages = this.episodeHosters.map((hoster: EpisodeHoster) => {
        const lang = this.availableLanguages().find(
          (language) => language.value == hoster.hoster_language
        );
        return { label: lang?.label, value: hoster.hoster_language };
      });

      // return unqiue array of hosters and languages
      const uniqueHosters = Array.from(
        new Set(hosters.map((h) => h.label))
      ).map((label) => {
        return {
          label: label,
          value: hosters.find((h) => h.label === label)?.value,
        };
      });
      const uniqueLanguages = Array.from(
        new Set(languages.map((l) => l.label))
      ).map((label) => {
        return {
          label: label,
          value: languages.find((l) => l.label === label)?.value,
        };
      });

      return { uniqueHosters, uniqueLanguages };
    },
    selectedEpisodeHost() {
      const selectedLang = this.selections.language;
      return this.episodeHosters.find(
        (hoster) =>
          hoster.hoster_language === selectedLang &&
          hoster.hoster_key === this.selections.hoster &&
          hoster.episode_id === this.currentEpisode?.e_id
      ) as EpisodeHoster;
    },
    currentEpisodeTitle() {
      return this.getEpisodeTitle(this.currentEpisode as Episode);
    },
    nextEpisodeTitle() {
      const nextEpisode = this.findNextEpisode(
        Number(this.selections.season),
        Number(this.selections.episode) + 1
      );

      if (!nextEpisode) return 'Keine weitere Episode gefunden';

      return this.getEpisodeTitle(nextEpisode);
    },
  },
  created() {
    this.$watch(
      () => this.$route.params.id,
      () => {
        const showId = this.$route.params.id;
        this.setShow(showId);
      },
      { immediate: true }
    );

    this.$watch(
      () => this.selections,
      () => {
        if (this.currentShow) this.updateWindowTitle();
      },
      { deep: true }
    );

    this.$watch(
      () => this.selectedEpisodeHost,
      async (newHost, oldHost) => {
        if (!this.selectedEpisodeHost) return;
        console.log('selectedEpisodeHost', oldHost, newHost);

        this.playerOptions.videoTitle = this.currentEpisodeTitle;
        this.playerOptions.storageName = this.currentEpisode?.e_id;

        const streamUrl: ScraperLink = await window.glxApi.invoke(
          'get-stream-url',
          {
            episodeHosterId: this.selectedEpisodeHost.e_id,
            refreshCache: this.clearResolvedCache,
          }
        );
        console.log('getStreamUrl', streamUrl);

        if (streamUrl && streamUrl.mediaLink) {
          this.resolvedStream = streamUrl;
          this.clearResolvedCache = false;
          this.playerOptions.sources = [
            { type: 'application/x-mpegURL', src: streamUrl.mediaLink },
          ];
        } else {
          console.warn('No stream found');
          this.selectedEpisodeHost = oldHost;
          this.selections.hoster = oldHost.hoster_key;
          this.selections.language = oldHost.hoster_language;
        }
      },
      { deep: true }
    );
  },
};
</script>
