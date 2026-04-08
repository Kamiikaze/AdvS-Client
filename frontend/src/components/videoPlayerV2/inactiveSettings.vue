<template>
  <v-dialog
    v-model="showDialog"
    width="400"
    max-width="80%"
    :contained="isFullscreen"
    :class="isFullscreen ? 'fullscreen-active' : ''"
  >
    <v-card>
      <v-card-title class="d-flex flex-row align-center">
        Inaktivitäts Einstellungen
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" @click="$emit('hide')" />
      </v-card-title>
      <v-card-subtitle> </v-card-subtitle>

      <v-divider />

      <v-card-text class="d-flex flex-column align-center">
        <p class="px-0 mb-4 wrap-text text-disabled text-subtitle-2">
          Pausiert automatisch die Wiedergabe wenn du in der eingestellten Zeit
          nichts machst.
        </p>
        <v-checkbox
          v-model="inactiveSettings.enabled"
          label="Aktiv"
          @update:model-value="emitState"
        />
        <v-slider
          v-show="inactiveSettings.enabled"
          v-model="inactiveSettings.timeout"
          class="mt-4"
          control-variant="stacked"
          density="compact"
          :step="1"
          :min="1"
          :max="6"
          thumb-label="always"
          width="80%"
          hide-details
          @update:model-value="emitState(true)"
        >
          <template #thumb-label="{ modelValue }">
            {{
              modelValue > 1
                ? `${modelValue}&nbsp;Stunden`
                : `${modelValue}&nbsp;Stunde`
            }}
          </template>
        </v-slider>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { useAppStore } from '@/store/app';
import { mapState } from 'pinia';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'InactiveSettings',
  emits: ['hide', 'start', 'stop'],
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    isFullscreen: {
      type: Boolean,
      required: true,
    },
  },
  data: () => ({}),
  methods: {
    emitState(state: boolean | null) {
      if (state) {
        this.$emit('start');
      } else {
        this.$emit('stop');
      }
    },
  },
  computed: {
    ...mapState(useAppStore, ['inactiveSettings']),
    showDialog: {
      get() {
        return this.show;
      },
      set(value: boolean) {
        if (!value) {
          this.$emit('hide');
        }
      },
    },
  },
});
</script>

<style scoped></style>
