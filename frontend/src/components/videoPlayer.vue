<template>
  <span v-if="loading">Loading. Please wait!</span>
  <iframe
    v-if="showIframe"
    :src="resolvedStream.redirect || selectedEpisodeHost.hoster_redirect"
    allowfullscreen
    style="width: 50%; transform: translateX(50%)"
  />
  <media-player
    ref="player"
    :title="getEpisodeChapter || ''"
    :src="resolvedStream?.mediaLink || ''"
    storage="video-key"
    data-controls="true"
    :autoplay="enableAutoplay"
  >
    <media-provider>
      <v-btn
        id="nextEpisode"
        class="hide"
        @click="nextEpisode"
      >
        Nächste Episode >
      </v-btn>
    </media-provider>
    <media-video-layout />
  </media-player>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import 'vidstack/bundle';
import 'vidstack/icons';
import type { EpisodeHoster, ScraperLink } from '@/lib/electron';
import { mapActions, mapState } from 'pinia';
import { useShowStore } from '@/store/show';
import { splitEpisodeTitle, useInactivityTracker } from '@/lib/utils';
import type { MediaPlayerElement } from 'vidstack/elements';
// import {MEDIA_KEY_SHORTCUTS} from "vidstack";

export default defineComponent({
  name: 'VideoPlayer',
  data: () => ({
    progressInterval: 0,
    showIframe: false,
    resolvedStream: {} as ScraperLink,
    loading: true,
    enableAutoplay: false,
    throttleTimeout: null as ReturnType<typeof setTimeout> | null,
    tracker: null as ReturnType<typeof useInactivityTracker> | null,
  }),
  methods: {
    ...mapActions(useShowStore, ['fetchEpisodeHosters']),
    nextEpisode() {
      this.selections.episode = (
        Number(this.selections.episode) + 1
      ).toString();
      this.fetchEpisodeHosters();
    },
  },
  computed: {
    ...mapState(useShowStore, [
      'episodeHosters',
      'selections',
      'currentEpisode',
    ]),
    selectedEpisodeHost() {
      const selectedLang = this.selections.language;
      return this.episodeHosters.find(
        (hoster) =>
          hoster.hoster_language === selectedLang &&
          hoster.hoster_key === this.selections.hoster &&
          hoster.episode_id === this.currentEpisode?.e_id
      ) as EpisodeHoster;
    },
    getEpisodeTitles() {
      return this.currentEpisode
        ? splitEpisodeTitle(this.currentEpisode)
        : { german: '', english: '' };
    },
    getEpisodeChapter() {
      return `S${this.selections.season}E${this.selections.episode} • ${this.getEpisodeTitles.german}`;
    },
  },
  mounted() {
    const player = this.$refs.player as MediaPlayerElement;

    player.addEventListener('controls-change', (ev) => {
      console.log('controls-change', ev);

      const nextEpisodeButtonEl = document.getElementById('nextEpisode');
      const controlsVisible = ev.detail;

      if (controlsVisible) {
        nextEpisodeButtonEl?.classList.remove('hide');
      } else {
        nextEpisodeButtonEl?.classList.add('hide');
      }
    });

    player.addEventListener('time-update', (ev) => {
      if (this.throttleTimeout) return;
      this.enableAutoplay = false;

      this.throttleTimeout = setTimeout(() => {
        console.log('time-update', ev);
        this.throttleTimeout = null;

        const nextEpisodeButtonEl = document.getElementById('nextEpisode');
        const progress = ev.target.currentTime / (ev.target.duration - 1);
        console.log('progress', progress);

        if (!nextEpisodeButtonEl) return;

        if (progress > 0.9) {
          nextEpisodeButtonEl.style.display = 'block';
        } else {
          nextEpisodeButtonEl.style.display = 'none';
        }

        if (progress > 0.99 && ev.target.state.playing) {
          console.log('Autoplay - Starting next episode');
          this.enableAutoplay = true;
          this.nextEpisode();
        }
      }, 1000);
    });

    this.tracker = useInactivityTracker(
      1000 * 60 * 60, // 1h
      () => {
        this.enableAutoplay = false;
        console.log('💤 User is inactive');
      },
      () => {
        this.enableAutoplay = false;
        console.log('🧍 User is active again');
      }
    );
    this.tracker.start();

    this.$watch(
      () => this.resolvedStream,
      () => {
        console.log('resolvedStream changed', this.resolvedStream);
      },
      { deep: true }
    );
  },
  watch: {
    async selectedEpisodeHost(val: EpisodeHoster) {
      console.log('selectedEpisodeHost', val);
      if (!val) return;
      this.loading = true;
      // this.resolvedStream = {} as ScraperLink
      this.showIframe = false;

      const streamUrl: ScraperLink = await window.glxApi.invoke(
        'get-stream-url',
        val.e_id
      );
      console.log('getStreamUrl', streamUrl);
      if (streamUrl) {
        this.resolvedStream = streamUrl;
      } else {
        this.showIframe = true;
      }
      this.loading = false;
    },
  },
  beforeUnmount() {
    this.tracker?.stop();
  },
});
</script>

<style scoped>
#nextEpisode {
  display: none;
  position: absolute;
  right: 20px;
  bottom: 90px;
  opacity: 1;
  transition: opacity 0.3s ease-in-out;
}

#nextEpisode.hide {
  opacity: 0;
}
</style>
