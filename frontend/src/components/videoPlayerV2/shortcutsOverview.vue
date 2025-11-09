<template>
  <div>
    <v-list-item
      link
      prepend-icon="mdi-keyboard-outline"
      @click="show = true"
    >
      Tastenkombinationen
    </v-list-item>

    <v-dialog
      v-model="show"
      width="600"
      max-width="80%"
    >
      <v-card>
        <v-card-title class="d-flex flex-row align-center">
          Tastenkombinationen
          <v-spacer />
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="show = false"
          />
        </v-card-title>

        <v-divider />

        <v-card-text>
          <v-data-table
            :items="keyMappings.playback"
            :headers="[
              { title: 'Wiederegabe', value: 'description' },
              { title: '', value: 'hotkey', align: 'end' },
            ]"
            class="mb-8"
            hide-default-footer
            density="compact"
          >
            <template #[`item.hotkey`]="{ item }">
              <VHotkey
                :keys="item.hotkey"
                variant="elevated"
                display-mode="icon"
                platform="auto"
              />
            </template>
          </v-data-table>

          <v-data-table
            :items="keyMappings.general"
            :headers="[
              { title: 'Allgemein', value: 'description' },
              { title: '', value: 'hotkey', align: 'end' },
            ]"
            class="mb-8"
            hide-default-footer
            density="compact"
          >
            <template #[`item.hotkey`]="{ item }">
              <VHotkey
                :keys="item.hotkey"
                variant="elevated"
                display-mode="icon"
                platform="auto"
              />
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { VHotkey } from 'vuetify/labs/VHotkey';

export default defineComponent({
  name: 'ShortcutsOverview',
  components: {
    VHotkey,
  },
  data: () => ({
    show: false,
    keyMappings: {
      playback: [
        { description: 'Wiedergabe fortsetzen/pausieren', hotkey: 'Space' },
        { description: 'Vorlauf 10 Sekunden', hotkey: 'arrowRight' },
        { description: 'Vorlauf 30 Sekunden', hotkey: 'shift+arrowRight' },
        { description: 'Vorlauf 85 Sekunden', hotkey: 'ctrl+arrowRight' },
        { description: 'Rücklauf 10 Sekunden', hotkey: 'arrowLeft' },
        { description: 'Rücklauf 30 Sekunden', hotkey: 'shift+arrowLeft' },
        { description: 'Rücklauf 85 Sekunden', hotkey: 'ctrl+arrowLeft' },
      ],
      general: [
        { description: 'Lautstärke erhöhen', hotkey: 'arrowUp' },
        { description: 'Lautstärke verringern', hotkey: 'arrowDown' },
        { description: 'Stummschalten ein/aus', hotkey: 'M' },
        { description: 'Vollbild ein/aus', hotkey: 'F' },
        { description: 'Picture-in-Picture ein/aus', hotkey: 'P' },
      ],
    },
  }),
  methods: {},
  computed: {},
});
</script>

<style scoped></style>
