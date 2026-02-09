<template>
  <v-container class="player-wrapper pa-0 mb-4">
    <div class="player-overlay">
      <div v-if="!controlsHidden" class="dim"></div>

      <div ref="player-controls-top" class="player-controls-top px-2 py-2">
        <div class="video-title">
          <span class="text-subtitle-2 text-disabled">{{
            options.showName
          }}</span>
          <span>{{ options.videoTitle }}</span>
        </div>

        <div ref="player-volume-hint" class="player-volume-hint">
          {{ parseFloat((volume * 100).toFixed(2)) }} %
        </div>
      </div>

      <div ref="player-controls-bottom" class="player-controls-bottom">
        <div ref="player-progress" class="player-progress mx-2">
          <v-progress-linear
            color="purple-dark"
            height="15px"
            :model-value="currentTime"
            :max="duration"
            :buffer-value="buffered"
            @click="goTo"
            @mousemove="goToTooltip"
            @mouseenter="toggleProgressTooltip(true)"
            @mouseleave="toggleProgressTooltip(false)"
          />
          <div id="player-progress-tooltip" ref="player-progress-tooltip">
            Hover Time
          </div>
        </div>

        <div class="player-controls ma-2">
          <PlayerButton
            :icon="isPlaying ? 'mdi-pause' : 'mdi-play'"
            @click="playPause"
          />
          <PlayerButton
            class="mr-4"
            icon="mdi-skip-next"
            @click="nextUpAction"
          />

          <VolumeControl
            ref="volumeControl"
            class="mr-4"
            @volume-change="updateVolume"
          />

          <div class="player-time mx-2">
            <span>{{ timeDisplay.current }}</span> /
            <span>{{ timeDisplay.duration }}</span>
          </div>

          <v-spacer />

          <v-tooltip text="Autoplay" location="top" offset="35px">
            <template #activator="{ props }">
              <v-switch
                v-bind="props"
                v-model="autoplay"
                class="autoplay-toggle mx-4"
                color="rgb(var(--v-theme-purple-dark))"
                density="compact"
                false-icon="mdi-pause"
                true-icon="mdi-play"
                hide-details
                @update:model-value="toggleAutoplay"
              />
            </template>
          </v-tooltip>

          <v-menu location="top center" offset="25px">
            <template #activator="{ props }">
              <v-badge
                class="sleeptimer-badge mr-2 pa-1 v-btn v-btn--icon"
                location="top right"
                offset-x="4"
                offset-y="4"
                :content="sleeptimer.current > 0 ? sleeptimer.current : ''"
                v-bind="props"
              >
                <v-icon
                  icon="mdi-power-sleep"
                  size="22"
                  :color="sleeptimer.enabled ? '#c7b764' : 'grey'"
                />
              </v-badge>
            </template>

            <v-list density="compact">
              <v-list-item @click="toggleSleeptimer(60)">
                <v-list-item-title>60 Minuten</v-list-item-title>
              </v-list-item>
              <v-list-item @click="toggleSleeptimer(30)">
                <v-list-item-title>30 Minuten</v-list-item-title>
              </v-list-item>
              <v-list-item @click="toggleSleeptimer(15)">
                <v-list-item-title>15 Minuten</v-list-item-title>
              </v-list-item>
              <v-list-item @click="toggleSleeptimer(2)">
                <v-list-item-title>2 Minuten</v-list-item-title>
              </v-list-item>
              <v-list-item @click="toggleSleeptimer(0)">
                <v-list-item-title>Aus</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>

          <v-btn
            class="mr-4"
            icon="mdi-cog"
            variant="plain"
            size="30"
            @click="toggleSettings"
          />

          <PlayerButton
            :icon="
              isPiP
                ? 'mdi-picture-in-picture-bottom-right-outline'
                : 'mdi-picture-in-picture-bottom-right'
            "
            @click="togglePiP"
          />
          <PlayerButton
            :icon="isFullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'"
            @click="toggleFullscreen"
          />
        </div>
      </div>

      <div ref="player-settings-sidebar" class="player-settings-sidebar">
        <v-list>
          <v-list-item density="compact">
            Einstellungen
            <template #append>
              <v-btn
                icon="mdi-close"
                variant="text"
                size="30"
                @click="toggleSettings"
              />
            </template>
          </v-list-item>

          <v-divider />

          <v-divider />

          <v-list-item
            prepend-icon="mdi-keyboard-outline"
            link
            @click="showKeybinds = true"
          >
            Tastenkombinationen
          </v-list-item>
        </v-list>
      </div>

      <ShortcutsOverview
        :is-fullscreen="isFullscreen"
        :show="showKeybinds"
        @hide="showKeybinds = false"
      />

      <div v-show="sleeptimer.show" class="player-sleeptimer-hint">
        {{ sleeptimer.text }}
        <v-btn
          v-if="sleeptimer.duration"
          class="ml-4 mr-3 text-subtitle-2 text-disabled"
          variant="text"
          size="20"
          @click="toggleSleeptimer(15)"
        >
          +15m
        </v-btn>
      </div>

      <v-list-item
        ref="player-next-up"
        class="player-next-up"
        link
        @click="nextUpAction"
      >
        <v-list-item-title> Nächste Episode </v-list-item-title>
        <v-list-item-subtitle>
          {{ options.nextEpisodeTitle }}
        </v-list-item-subtitle>

        <template #append>
          <v-progress-circular
            v-if="autoplay && remaining < 10"
            v-model="autoPlayCountdown"
            size="34"
            width="2"
          >
            <template #default> {{ remaining.toFixed() }}s </template>
          </v-progress-circular>
          <v-icon v-else icon="mdi-play" variant="text" size="30" />
        </template>
      </v-list-item>

      <v-list-item
        v-show="
          lastPosition > 10 &&
          currentTime < 10 &&
          (lastPosition / duration) * 100 < 95
        "
        ref="player-continue-playback"
        class="player-continue-playback"
        :rounded="true"
        link
        @click="
          () => {
            player.currentTime = lastPosition;
            player.play();
          }
        "
      >
        Wiedergabe bei
        <span>{{ convertSecToMin(lastPosition) }}</span> fortsetzen?
      </v-list-item>

      <media-player
        id="media-player"
        ref="player"
        aspect-ratio="16/9"
        :src="options.sources[0].src || ''"
        key-disabled
        @click="playPause"
      >
        <media-provider>
          <Spinner v-show="isLoading.player" />
        </media-provider>
      </media-player>
    </div>
  </v-container>
</template>

<script lang="ts">
import Spinner from '@/components/spinner.vue';
import type { Episode, Show } from '@/lib/electron';
import type { DiscordConfig } from '@/lib/types';
import { convertSecToMin } from '@/lib/utils';
import { useAppStore } from '@/store/app';
import { useShowStore } from '@/store/show';
import { mapActions, mapState } from 'pinia';
import type { MediaPIPChangeEvent } from 'vidstack';
import 'vidstack/bundle';
import type { MediaPlayerElement } from 'vidstack/elements';
import {
  type ComponentPublicInstance,
  defineComponent,
  type PropType,
} from 'vue';
import PlayerButton from './controls/Button.vue';
import VolumeControl from './controls/Volume.vue';
import ShortcutsOverview from './shortcutsOverview.vue';

export interface VideoPlayerOptions {
  controls: boolean;
  sources: { src: string; type: string }[];
  videoTitle: string;
  showName: string;
  nextEpisodeTitle: string;
  storageName?: string;
}

export default defineComponent({
  name: 'VideoPlayerV2',
  components: { Spinner, ShortcutsOverview, PlayerButton, VolumeControl },
  emits: {
    nextEpisode: (episodeNumber?: number) => {
      return (
        episodeNumber === undefined ||
        (Number.isInteger(episodeNumber) && episodeNumber > 0)
      );
    },
  },
  props: {
    options: {
      type: Object as PropType<VideoPlayerOptions>,
      required: true,
    },
  },
  data: () => ({
    player: {} as HTMLVideoElement,
    isLoading: {
      player: true,
    },
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    remaining: 0,
    lastPosition: 0,
    buffered: 0,
    volume: 0.2,
    isFullscreen: false,
    isPiP: false,
    autoplay: false,
    autoPlayCountdown: 100,
    externalUpdateDone: false,
    sleeptimer: {
      enabled: false,
      duration: 0,
      current: 0,
      text: null as string | null,
      show: false,
      timer: null as {
        clear: () => void;
        getRemaining: () => number;
      } | null,
      intervalId: 0,
    },
    controlsHidden: false,
    controlsPersistent: false,
    hideControlsTimeout: 0,
    hideVolumeHintTimieout: 0,
    nextUpTimeout: 0,
    nextUpShown: false,
    saveProgressIntervalId: 0,
    showKeybinds: false,
    eventListeners: [] as [
      HTMLElement | Document,
      string,
      EventListenerOrEventListenerObject,
    ][],
    elementRefs: {
      videoPlayer: {} as HTMLVideoElement,
      controlTop: {} as HTMLElement,
      controlBottom: {} as HTMLElement,
      progressBar: {} as HTMLElement,
      progressBarTooltip: {} as HTMLElement,
      settingsSidebar: {} as HTMLElement,
      nextUp: {} as HTMLElement,
      controlVolume: {} as InstanceType<typeof VolumeControl>,
      volumeHint: {} as HTMLElement,
    },
  }),
  methods: {
    convertSecToMin,
    ...mapActions(useShowStore, ['updateWatchHistory']),
    ...mapState(useAppStore, ['linkedAccounts']),
    initPlayer() {
      this.player = this.elementRefs.videoPlayer;

      this.eventListeners = this.createEventListeners();

      // Controls mouse enter/leave
      const controls: HTMLElement[] = [
        this.elementRefs.controlTop,
        this.elementRefs.controlBottom,
      ];
      controls.forEach((control) => {
        if (!control || !control.addEventListener) return;
        this.eventListeners.push(
          [
            control,
            'mouseenter',
            () => {
              clearTimeout(this.hideControlsTimeout);
              this.hideControlsHandler('show');
            },
          ],
          [
            control,
            'mouseleave',
            () => {
              if (!this.isPlaying) return;
              clearTimeout(this.hideControlsTimeout);
              this.hideControlsTimeout = window.setTimeout(() => {
                this.hideControlsHandler('hide');
              }, 2000);
            },
          ]
        );
      });

      // Bind all listeners
      this.eventListeners.forEach(([target, type, handler]) =>
        target.addEventListener(type, handler)
      );
    },
    playPause() {
      this.player[this.player.paused ? 'play' : 'pause']();
    },
    updateVolume(volume: number) {
      this.volume = volume;
      this.player.volume = volume;
      localStorage.setItem('video-player-volume', JSON.stringify(volume));

      const volumeHint = this.elementRefs.volumeHint;
      volumeHint.style.display = 'block';
      volumeHint.style.opacity = '1';

      clearTimeout(this.hideVolumeHintTimieout);
      this.hideVolumeHintTimieout = window.setTimeout(() => {
        volumeHint.style.display = 'none';
        volumeHint.style.opacity = '0';
      }, 1000);
    },
    goTo(event: MouseEvent) {
      if (!this.player) return;
      const progressBar = event.currentTarget as HTMLElement;
      const rect = progressBar.getBoundingClientRect();
      const clickPosition = event.clientX - rect.left;
      const percentage = clickPosition / rect.width;
      const newTime = percentage * this.duration;
      this.player.currentTime = newTime;
      this.currentTime = Math.trunc(newTime);
    },
    goToTooltip(event: MouseEvent) {
      if (!this.player) return;
      const progressBar = this.elementRefs.progressBar;
      const rect = progressBar.getBoundingClientRect();
      const hoverPosition = event.clientX - rect.left;
      const percentage = hoverPosition / rect.width;
      const hoverTime = percentage * this.duration;
      const tooltip = this.elementRefs.progressBarTooltip;

      if (tooltip) {
        const tooltipXOffset = tooltip.getBoundingClientRect().width / 2 || 0;

        tooltip.style.left = `${hoverPosition - tooltipXOffset}px`;
        tooltip.innerText = this.convertSecToMin(hoverTime);
      }
    },
    toggleProgressTooltip(show: boolean) {
      const tooltip = this.elementRefs.progressBarTooltip;
      if (tooltip) {
        tooltip.style.display = show ? 'block' : 'none';
      }
    },
    toggleSettings() {
      // slide in/out the settings sidebar
      const sidebar = this.elementRefs.settingsSidebar;

      if (sidebar.style.transform === 'translateX(0%)') {
        sidebar.style.transform = 'translateX(100%)';
        sidebar.style.opacity = '0';
        this.elementRefs.videoPlayer.focus();
      } else {
        sidebar.style.transform = 'translateX(0%)';
        sidebar.style.opacity = '1';
        this.elementRefs.videoPlayer.focus();
      }
    },
    toggleAutoplay() {
      localStorage.setItem(
        'video-player-autoplay',
        JSON.stringify(this.autoplay)
      );
    },
    toggleSleeptimer(duration: number) {
      if (!this.player) return;

      // Clear existing timer if duration is 0 OR if we're setting a new duration
      if (duration === 0 || this.sleeptimer.enabled) {
        console.log('Clearing sleeptimer');

        clearInterval(this.sleeptimer.intervalId);
        this.sleeptimer.timer?.clear();
        this.sleeptimer.timer = null;

        // If duration is 0, completely reset and show "off" message
        if (duration === 0) {
          this.sleeptimer.text = `Sleeptimer off`;
          this.sleeptimer.show = true;
          this.sleeptimer.duration = 0;
          this.sleeptimer.current = 0;
          this.sleeptimer.enabled = false;

          setTimeout(() => {
            this.sleeptimer.show = false;
            this.sleeptimer.text = null;
          }, 2 * 1000);

          return;
        }
      }

      console.log(`Setting sleeptimer for ${duration} minutes`);

      // Create new timer
      this.sleeptimer.timer = this.createSleeptimer(
        () => {
          console.log('Sleeptimer triggered, pausing playback');
          clearInterval(this.sleeptimer.intervalId);
          this.player.pause();
          this.sleeptimer.text = `Good night! 🌙`;
          this.sleeptimer.show = true;
          this.sleeptimer.enabled = false;

          // Hide the message after a few seconds
          setTimeout(() => {
            this.sleeptimer.show = false;
            this.sleeptimer.text = null;
          }, 10 * 1000);
        },
        duration * 60 * 1000
      );

      this.sleeptimer.duration = duration;
      this.sleeptimer.enabled = true;

      // Update display every second
      this.sleeptimer.intervalId = window.setInterval(() => {
        if (this.sleeptimer.timer) {
          const remainingMs = this.sleeptimer.timer.getRemaining();
          const minutes = Math.floor(remainingMs / 60000);
          const seconds = Math.floor((remainingMs % 60000) / 1000);

          this.sleeptimer.show = minutes < 3;
          this.sleeptimer.text = `⏲️ ${minutes}m ${seconds}s`;
          this.sleeptimer.current = minutes; // This is just for display
        }
      }, 1000);
    },

    createSleeptimer(callback: () => void, delay: number) {
      const start = Date.now();
      const timerId = setTimeout(callback, delay);

      return {
        clear() {
          clearTimeout(timerId);
        },
        getRemaining() {
          const elapsed = Date.now() - start;
          return Math.max(delay - elapsed, 0);
        },
      };
    },
    async nextUpAction(ev: PointerEvent | MouseEvent | KeyboardEvent) {
      // Prevent spacebar trigger when element is focused
      if (ev.detail === 0) return;

      clearInterval(this.saveProgressIntervalId);
      this.elementRefs.nextUp.style.opacity = '0';
      this.elementRefs.nextUp.style.transform = 'translateX(100%)';
      this.player.pause();
      this.$emit('nextEpisode');
      this.elementRefs.videoPlayer.focus();
    },
    toggleFullscreen() {
      const fullscreenEl = document.querySelector('.player-wrapper');
      if (!fullscreenEl) return;
      if (!this.isFullscreen) {
        fullscreenEl.requestFullscreen();
        fullscreenEl.classList.add('fullscreen-active');
        this.isFullscreen = true;
      } else {
        document.exitFullscreen();
        fullscreenEl.classList.remove('fullscreen-active');
        this.isFullscreen = false;
      }
    },
    togglePiP() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const videoEl = this.elementRefs.videoPlayer as any as MediaPlayerElement;

      if (!videoEl.state.pictureInPicture) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        videoEl.enterPictureInPicture().catch((error: any) => {
          console.error('Error entering Picture-in-Picture mode:', error);
        });
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        document.exitPictureInPicture().catch((error: any) => {
          console.error('Error exiting Picture-in-Picture mode:', error);
        });
      }
    },
    hideControlsHandler(type: string) {
      const topControls = this.elementRefs.controlTop;
      const bottomControls = this.elementRefs.controlBottom;
      const nextUp = this.elementRefs.nextUp;

      if (topControls && bottomControls) {
        if (!this.controlsPersistent && type === 'hide' && this.isPlaying) {
          topControls.style.transform = 'translateY(-100%)';
          bottomControls.style.transform = 'translateY(100%)';
          this.controlsHidden = true;
          this.player.style.cursor = 'none';
          nextUp.style.opacity = '0';
          nextUp.style.transform = 'translateX(100%)';
        } else {
          topControls.style.transform = 'translateY(0%)';
          bottomControls.style.transform = 'translateY(0%)';
          this.controlsHidden = false;
          this.player.style.cursor = 'pointer';

          // if controls become visible and we're in the last 3 minutes, show next up
          if (
            nextUp &&
            this.duration > 0 &&
            this.duration - this.currentTime <= 180
          ) {
            clearTimeout(this.nextUpTimeout);
            nextUp.style.opacity = '1';
            nextUp.style.transform = 'translateX(0%)';
          }
        }
      }
    },
    keyListeners(event: KeyboardEvent) {
      if (!this.player || this.showSearch) return;
      if (
        event.key === 'Shift' ||
        event.key === 'Control' ||
        event.key === 'Alt' ||
        event.key === 'Meta' ||
        event.key === 'AltGraph' ||
        event.key === 'CapsLock' ||
        event.key === 'NumLock' ||
        event.key === 'ScrollLock'
      ) {
        return;
      }
      let goToTime = 0;

      switch (event.code) {
        case 'Space':
          event.preventDefault();
          this.playPause();
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (event.ctrlKey || event.metaKey) {
            goToTime = this.player.currentTime + 85;
          } else if (event.shiftKey) {
            goToTime = this.player.currentTime + 10;
          } else {
            goToTime = this.player.currentTime + 30;
          }
          this.currentTime = goToTime;
          this.player.currentTime = goToTime;
          break;
        case 'ArrowLeft':
          event.preventDefault();
          if (event.ctrlKey || event.metaKey) {
            goToTime = this.player.currentTime - 85;
          } else if (event.shiftKey) {
            goToTime = this.player.currentTime - 10;
          } else {
            goToTime = this.player.currentTime - 30;
          }
          this.currentTime = goToTime;
          this.player.currentTime = goToTime;
          break;
        case 'KeyF':
          event.preventDefault();
          this.toggleFullscreen();
          break;
        case 'KeyP':
          event.preventDefault();
          this.togglePiP();
          break;
        case 'KeyM':
          event.preventDefault();
          this.elementRefs.controlVolume.toggleMute();
          break;
        case 'KeyN':
          event.preventDefault();
          clearInterval(this.saveProgressIntervalId);
          this.player.pause();
          this.$emit('nextEpisode');
          break;
      }
    },
    createEventListeners(): [
      HTMLElement | Document,
      string,
      EventListenerOrEventListenerObject,
    ][] {
      return [
        [
          this.player,
          'duration-change',
          () => {
            this.duration = this.player.duration || 0;
          },
        ],

        [
          this.player,
          'time-update',
          () => {
            this.currentTime = this.player.currentTime ?? 0;
            this.remaining = this.duration - this.currentTime;

            if (this.duration > 0) {
              const nextUp = this.elementRefs.nextUp;

              // Show "next up"
              if (this.remaining <= 180 && !this.nextUpShown) {
                nextUp.style.opacity = '1';
                nextUp.style.transform = 'translateX(0%)';
                this.nextUpShown = true;

                if (this.controlsHidden) {
                  clearTimeout(this.nextUpTimeout);
                  this.nextUpTimeout = window.setTimeout(() => {
                    nextUp.style.opacity = '0';
                    nextUp.style.transform = 'translateX(100%)';
                  }, 1000 * 10);
                }
              }
              // Hide "next up" again
              else if (this.remaining > 180 && this.nextUpShown) {
                nextUp.style.opacity = '0';
                nextUp.style.transform = 'translateX(100%)';
                this.nextUpShown = false;
              }

              // Autoplay
              if (this.autoplay) {
                if (this.remaining <= 10) {
                  console.log('Autoplay active');

                  this.controlsPersistent = true;
                  this.autoPlayCountdown = Math.trunc(this.remaining) * 10;

                  if (this.remaining < 1) {
                    console.log(
                      'Going to next title..',
                      this.player.duration,
                      this.remaining
                    );
                    clearInterval(this.saveProgressIntervalId);
                    this.player.pause();
                    this.$emit('nextEpisode');
                  }
                } else {
                  this.controlsPersistent = false;
                }
              }

              // Update external WatchState
              if (this.currentTime > 120 && !this.externalUpdateDone) {
                this.externalUpdateDone = true;

                const show = this.currentShow as Show;
                const ep = this.currentEpisode as Episode;
                const provider = show.show_type == 'anime' ? 'aniworld' : 'sto';

                const linkedAccount = this.linkedAccounts().find(
                  (la) => la.provider == provider
                )!;
                const isLinked = linkedAccount.status === 0;

                if (isLinked) {
                  console.log('update external episode state', linkedAccount);
                  window.glxApi.invoke('set-external-epsiode-state', {
                    providerName: provider,
                    episodeId: ep.episode_meta.externalEpId,
                  });
                }
              }
            }
          },
        ],

        [
          this.player,
          'can-play',
          () => {
            console.log('can-play');
            const autoPlaySetting = JSON.parse(
              localStorage.getItem('video-player-autoplay') ?? 'false'
            );
            if (autoPlaySetting) {
              this.autoplay = autoPlaySetting;
              this.player.play();
            }
            this.isLoading.player = false;
            this.lastPosition = this.getLastVideoPosition();
            this.externalUpdateDone = false;
            this.updateMediaSession();
            this.updateDiscordActivity();
          },
        ],

        [
          this.player,
          'play',
          () => {
            this.isPlaying = true;
            this.isLoading.player = false;
            this.player.volume = this.volume;
            this.hideControlsTimeout = window.setTimeout(() => {
              this.hideControlsHandler('hide');
            }, 2000);
            this.updateMediaSession();
            navigator.mediaSession.playbackState = 'playing';

            this.saveProgressIntervalId = window.setInterval(
              () => this.savePlayerProgress(),
              5000
            );
          },
        ],

        [
          this.player,
          'pause',
          () => {
            this.isPlaying = false;
            clearTimeout(this.hideControlsTimeout);
            this.hideControlsHandler('show');
            clearInterval(this.saveProgressIntervalId);
            navigator.mediaSession.playbackState = 'paused';

            const storageName =
              this.options.storageName ?? this.options.videoTitle;
            localStorage.setItem(storageName, this.currentTime.toString());
          },
        ],

        [
          this.player,
          'progress',
          () => {
            const videoEl = this.elementRefs
              .videoPlayer as any as MediaPlayerElement; // eslint-disable-line @typescript-eslint/no-explicit-any
            this.buffered = Math.trunc(videoEl.state.bufferedEnd ?? 0);
          },
        ],

        [
          this.player,
          'picture-in-picture-change',
          (event: Event) => {
            const pipEvent = event as MediaPIPChangeEvent;
            this.isPiP = pipEvent.detail;
          },
        ],

        [
          document,
          'fullscreenchange',
          () => {
            this.isFullscreen = !!document.fullscreenElement;
          },
        ],

        [
          this.player,
          'mousemove',
          () => {
            if (!this.isPlaying) return;
            clearTimeout(this.hideControlsTimeout);
            this.hideControlsHandler('show');
            this.hideControlsTimeout = window.setTimeout(() => {
              this.hideControlsHandler('hide');
            }, 2000);
          },
        ],

        [
          this.player,
          'dblclick',
          (ev) => {
            ev.preventDefault();
            this.toggleFullscreen();
          },
        ],
      ];
    },
    getLastVideoPosition() {
      const storageName = this.options.storageName ?? this.options.videoTitle;
      const savedPosition = localStorage.getItem(storageName);
      return savedPosition ? parseFloat(savedPosition) : 0;
    },
    savePlayerProgress() {
      if (this.currentTime >= 120) {
        const storageName = this.options.storageName ?? this.options.videoTitle;
        localStorage.setItem(storageName, this.currentTime.toString());

        this.updateWatchHistory(
          Math.trunc(this.currentTime),
          Math.trunc(this.duration)
        );
      } else {
        console.log('Not saving below 2min');
      }
    },
    updateMediaSession() {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: this.options.videoTitle,
        artist: this.options.showName,
        //ToDo: Load artwork from database
        // artwork: [
        //   { src: `https://aniworld.to/public/img/cover/bnUCIR3g7c4tMAkhj0eQxoQYEaW2XOAP.jpg-stream-cover-Sa62dnhBSHkOW0UuIfwl5M5KahRlmIqu_800x300.jpg`, sizes: '512x512', type: 'image/png' },
        // ],
      });
    },
    async updateDiscordActivity() {
      const loadConfig = localStorage.getItem('discord-rpc');
      if (!loadConfig) return;

      const config = JSON.parse(loadConfig) as DiscordConfig;

      await window.glxApi.invoke('set-discord-rpc', {
        state: config.state,
        activity: {
          details: config.display.show
            ? `Watching | ` + this.$props.options.showName
            : null,
          detailsUrl: 'https://github.com/Kamiikaze/AdvS-Client',
          state: config.display.episode ? this.$props.options.videoTitle : null,
          stateUrl: `advs://watch/${this.currentEpisode?.show_id}/${this.currentEpisode?.e_id}`,
          largeImageKey: 'app-icon', // Must match asset name in Discord Developer Portal
          largeImageText: 'AdvS Client - by Kamikaze',
          largeImageUrl: 'https://github.com/Kamiikaze/AdvS-Client',
        },
      });
    },
  },
  computed: {
    ...mapState(useShowStore, ['currentShow', 'currentEpisode']),
    ...mapState(useAppStore, ['showSearch']),
    timeDisplay() {
      return {
        current: this.convertSecToMin(this.currentTime || 0),
        duration: this.convertSecToMin(this.duration || 0),
      };
    },
  },
  mounted() {
    this.elementRefs = {
      videoPlayer: this.$refs.player as HTMLVideoElement,
      controlTop: this.$refs['player-controls-top'] as HTMLElement,
      controlBottom: this.$refs['player-controls-bottom'] as HTMLElement,
      progressBar: this.$refs['player-progress'] as HTMLElement,
      progressBarTooltip: this.$refs['player-progress-tooltip'] as HTMLElement,
      settingsSidebar: this.$refs['player-settings-sidebar'] as HTMLElement,
      nextUp: (this.$refs['player-next-up'] as ComponentPublicInstance)
        .$el as HTMLElement,
      controlVolume: this.$refs.volumeControl as InstanceType<
        typeof VolumeControl
      >,
      volumeHint: this.$refs['player-volume-hint'] as HTMLElement,
    };

    this.initPlayer();

    navigator.mediaSession.setActionHandler('nexttrack', () => {
      this.player.pause();
      clearInterval(this.saveProgressIntervalId);
      this.$emit('nextEpisode');
    });

    // add media keys support
    document.addEventListener('keyup', this.keyListeners);
  },
  created() {
    this.$watch(
      () => this.options.sources,
      () => {
        clearTimeout(this.hideControlsTimeout);
        this.hideControlsHandler('show');
        this.updateMediaSession();
      },
      { deep: true }
    );
  },
  beforeUnmount() {
    // Clean up all listeners
    if (this.eventListeners) {
      this.eventListeners.forEach(([target, type, handler]) =>
        target.removeEventListener(type, handler)
      );
      this.eventListeners = [];
    }
    window.glxApi.invoke('set-discord-rpc', { state: true });

    // Clear timeouts/intervals
    clearTimeout(this.hideControlsTimeout);
    clearTimeout(this.nextUpTimeout);
    clearInterval(this.saveProgressIntervalId);
  },
});
</script>

<style lang="scss">
.player-wrapper {
  position: relative;
  width: 100%;
  height: auto;
  overflow: hidden;
  aspect-ratio: 16/9;
}

#media-player {
  cursor: pointer;
  background-color: #000;
}

.player-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
/* noinspection CssUnusedSymbol */
.player-overlay .v-btn--icon:hover {
  background-color: rgba(var(--v-theme-pink-light), 0.25);
}

.player-overlay .dim {
  position: absolute;
  width: 100%;
  height: 100%;
  background: #000;
  background: linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.1) 30%,
    rgba(0, 0, 0, 0.2) 60%,
    rgba(0, 0, 0, 0.8) 100%
  );
  cursor: pointer;
  pointer-events: none;
  z-index: 15;
}

.player-controls-top {
  position: absolute;
  top: 0;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: center;
  width: 100%;
  z-index: 20;
  transform: translateY(0%);
  transition: transform 0.5s;
}

.video-title {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: center;
  font-size: 1.2em;
  padding: 16px;
}
.player-wrapper.fullscreen-active .video-title {
  font-size: 2em;
}

.player-volume-hint,
.player-sleeptimer-hint {
  position: absolute;
  top: 100px;
  left: 0;
  right: 0;
  display: none;
  width: fit-content;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 2px 4px;
  margin: 10px auto;
  border-radius: 2px;
  z-index: 30;
  opacity: 0;
  transition:
    opacity 0.3s ease-in-out 0.1s,
    display 0.3s ease-in-out;
}

.player-sleeptimer-hint {
  top: unset;
  bottom: 120px;
  display: block;
  opacity: 1;
}

.player-controls-bottom {
  position: absolute;
  bottom: 0;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: flex-end;
  width: 100%;
  z-index: 20;
  transform: translateY(0%);
  transition: transform 0.5s;
}

/* noinspection CssUnusedSymbol */
.player-progress .v-progress-linear {
  border-radius: 2px;
  border: 1px solid rgb(var(--v-theme-purple-lighter));
}
.player-progress .v-progress-linear__background {
  background-color: black !important;
  opacity: 0.3;
}
.player-progress .v-progress-linear__buffer {
  opacity: 0.3;
}

.player-progress .v-progress-linear__determinate,
.player-progress .v-progress-linear__buffer {
  border-right: 2px solid grey;
}

.player-progress .v-progress-linear__buffer {
  background-image: linear-gradient(
    135deg,
    rgb(var(--v-theme-purple-lighter)) 25%,
    rgb(var(--v-theme-purple-dark)) 25%,
    rgb(var(--v-theme-purple-dark)) 50%,
    rgb(var(--v-theme-purple-lighter)) 50%,
    rgb(var(--v-theme-purple-lighter)) 75%,
    rgb(var(--v-theme-purple-dark)) 75%,
    rgb(var(--v-theme-purple-dark)) 100%
  );
  background-size: 20px 20px;
  animation: barberpole 10s linear infinite;
}

@keyframes barberpole {
  100% {
    background-position: 100% 100%;
  }
}

.autoplay-toggle .v-switch__thumb:has(i.mdi-play) {
  color: white;
}

#player-progress-tooltip {
  position: absolute;
  top: -30px;
  background-color: #000;
  width: fit-content;
  color: #fff;
  padding: 2px 5px;
  border-radius: 3px;
  font-size: 12px;
  pointer-events: none;
  display: none;
}

.player-next-up {
  position: absolute;
  bottom: 70px;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  max-width: max(30%, 300px);
  margin: 10px 10px 10px auto;
  padding: 5px 14px;
  opacity: 0;
  z-index: 10;
  transform: translateX(100%);
  transition:
    opacity 0.5s,
    transform 0.5s;
}
/* noinspection CssUnusedSymbol */
.player-next-up .v-list-item__append {
  justify-content: center;
  width: 36px;
  margin-left: 10px;
  font-size: 0.8em;
}
/* noinspection CssUnusedSymbol */
.player-next-up .v-list-item__spacer {
  width: 0 !important;
}

.player-continue-playback {
  position: absolute;
  bottom: 70px;
  right: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 2px;
  width: fit-content;
  max-width: max(30%, 300px);
  margin: 10px auto;
  font-size: 0.9em;
  z-index: 30;
}
.player-continue-playback span {
  text-decoration: underline;
}
/* noinspection CssUnusedSymbol */
.player-continue-playback .v-list-item__append {
  justify-content: center;
  width: 36px;
  margin-left: 10px;
}
/* noinspection CssUnusedSymbol */
.player-continue-playback .v-list-item__spacer {
  width: 0 !important;
}

.player-controls {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  height: 100%;
}
/* noinspection CssUnusedSymbol */
.player-controls .v-btn--icon {
  margin: 0 4px;
  border-radius: 5px;
}

.player-settings-sidebar {
  position: absolute;
  top: 0;
  right: 0;
  width: 33%;
  min-width: 200px;
  max-width: 400px;
  height: auto;
  max-height: calc(100% - 56px);
  opacity: 0;
  z-index: 30;
  transition:
    transform 0.2s ease-in-out,
    opacity 0.3s ease-in-out;
  transform: translateX(100%);
}

.sleeptimer-badge span {
  background: transparent;
  color: white;
}
</style>
