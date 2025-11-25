<template>
  <v-card>
    <v-card-title>Sync</v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="4"> MyAnimeList </v-col>
        <v-col>
          <span v-if="connected">Verbunden</span>
          <span v-else>
            <v-btn
              append-icon="mdi-open-in-new"
              color="primary"
              density="comfortable"
              >Link now</v-btn
            >
          </span>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="4"> TMDB </v-col>
        <v-col>
          <span v-if="connected2">
            <span> Username </span>
            <v-btn
              class="ma-2"
              color="red-lighten-1"
              icon="mdi-logout"
              variant="text"
              density="compact"
            />
          </span>
          <span v-else>Link now</span>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="4">
          File Sync<br />
          (Will additionally save your watch history into a file, to sync with
          cloud storage)
        </v-col>
        <v-col>
          <v-switch v-model="connected3" color="primary" hide-details />
          <v-text-field
            v-if="connected3"
            disabled
            style="font-size: 10px"
            density="compact"
            variant="outlined"
          >
            G:\Drive\AdvS\watch-history.json
          </v-text-field>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SettingsIntegrations',
  data: () => ({
    connected: false,
    connected2: true,
    connected3: true,
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
