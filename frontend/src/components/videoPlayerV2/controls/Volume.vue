<template>
  <div
    class="volume-control"
    @mouseenter="showSlider = true"
    @mouseleave="showSlider = false"
  >
    <v-tooltip
      :text="`${volume.toFixed()} %`"
      location="top"
      offset="20px"
    >
      <template #activator="{ props }">
        <v-btn
          :icon
          v-bind="props"
          variant="plain"
          size="30"
          @click="toggleMute"
        />
        <v-slider
          v-show="showSlider"
          v-model="volume"
          v-bind="props"
          height="30"
          width="100px"
          min="0"
          max="100"
          color="purple"
          thumb-size="15px"
          step="1"
        />
      </template>
    </v-tooltip>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'pinia';
import { useAppStore } from '@/store/app';

export default defineComponent({
  name: 'VolumeControl',
  emits: ['volume-change'],
  data: () => ({
    showSlider: false,
    updateDebounce: 0,
    volume: 20,
    unmutedVolume: 20,
    icon: 'mdi-volume-high',
  }),
  methods: {
    changeVolume() {
      clearTimeout(this.updateDebounce);
      this.updateDebounce = window.setTimeout(() => {
        this.$emit('volume-change', this.volume / 100);
      }, 10);
    },
    toggleMute() {
      if (this.volume > 0) {
        this.unmutedVolume = this.volume;
        this.volume = 0;
      } else {
        this.volume = this.unmutedVolume;
      }
    },
  },
  computed: {
    ...mapState(useAppStore, ['showSearch']),
  },
  mounted() {
    const volumeSettings = localStorage.getItem('video-player-volume');

    if (volumeSettings) this.volume = parseFloat(volumeSettings) * 100;

    document.addEventListener('keydown', (event) => {
      if (this.showSearch) return;
      switch (event.code) {
        case 'ArrowUp':
          event.preventDefault();
          this.volume = Math.min(100, this.volume + 5);
          this.changeVolume();
          break;
        case 'ArrowDown':
          event.preventDefault();
          this.volume = Math.max(0, this.volume - 5);
          this.changeVolume();
          break;
      }
    });
  },
  watch: {
    volume(newValue: number) {
      if (newValue === 0) {
        this.icon = 'mdi-volume-mute';
      } else if (newValue < 20) {
        this.icon = 'mdi-volume-low';
      } else if (newValue < 66) {
        this.icon = 'mdi-volume-medium';
      } else {
        this.icon = 'mdi-volume-high';
      }

      this.changeVolume();
    },
  },
});
</script>

<style scoped>
.volume-control {
  display: flex;
  flex-direction: row;
  height: 30px;
}
</style>
