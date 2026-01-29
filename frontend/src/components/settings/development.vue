<template>
  <v-card>
    <v-card-title>Developement</v-card-title>
    <v-card-subtitle class="text-wrap"></v-card-subtitle>
    <v-card-text>
      <v-row>
        <v-col> Ich weiß was ich tue </v-col>
        <v-col>
          <v-checkbox
            v-model="enableSettings"
            item-title="label"
            item-value="value"
            hide-details
            variant="outlined"
            density="compact"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-btn
          text="Datenbank Editor"
          class="ma-2"
          color="red-lighten-1"
          variant="outlined"
          :disabled="!enableSettings"
          @click="openEditor"
        />
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SettingsDev',
  data: () => ({
    enableSettings: false,
    key2: 'Voe',
  }),
  methods: {
    openEditor() {
      window.glxApi.invoke('em-window-open');
    },
  },
  computed: {},
  beforeUnmount() {
    this.enableSettings = false;
  },
});
</script>

<style scoped>
.v-row .v-col:nth-child(1) {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
