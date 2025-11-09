<template>
  <v-card>
    <v-card-title>Allgemein</v-card-title>
    <v-card-text>
      <v-row>
        <v-col> Bevorzugte Sprache </v-col>
        <v-col>
          <v-select
            v-model="key"
            :items="['Deutsch', 'Englisch']"
            item-title="label"
            item-value="value"
            hide-details
            variant="outlined"
            density="compact"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col> Bevorzugter Hoster </v-col>
        <v-col>
          <v-select
            v-model="key2"
            :items="['Voe', 'Vidoza']"
            item-title="label"
            item-value="value"
            hide-details
            variant="outlined"
            density="compact"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SettingsGeneral',
  data: () => ({
    key: 'Deutsch',
    key2: 'Voe',
  }),
  methods: {},
  computed: {},
});
</script>

<style scoped>
.v-row .v-col:nth-child(1) {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
