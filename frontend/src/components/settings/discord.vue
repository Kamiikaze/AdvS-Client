<template>
  <v-card>
    <v-card-title>Discord Rich Presence</v-card-title>
    <v-card-subtitle class="text-wrap"
      >Zeige in Discord was du gerade schaust</v-card-subtitle
    >
    <v-card-text>
      <v-row dense>
        <v-col> Discord RPC </v-col>
        <v-col>
          <v-checkbox
            v-model="enabled"
            hide-details
            variant="outlined"
            density="compact"
            @update:model-value="toggleDiscordRPC"
          />
        </v-col>
      </v-row>
      <div v-if="enabled">
        <v-row dense>
          <v-col> Zeige aktuelle Serie/Anime </v-col>
          <v-col>
            <v-checkbox
              v-model="display.show"
              :disabled="display.episode"
              hide-details
              density="compact"
            />
          </v-col>
        </v-row>
        <v-row dense>
          <v-col> Zeige aktuelle Episode </v-col>
          <v-col>
            <v-checkbox
              v-model="display.episode"
              hide-details
              variant="outlined"
              density="compact"
            />
          </v-col>
        </v-row>
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import type { DiscordConfig } from '@/lib/types';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SettingsDiscord',
  data: () => ({
    enabled: false,
    display: {
      show: true,
      episode: true,
    },
  }),
  methods: {
    async toggleDiscordRPC(state: boolean | null) {
      const result = await window.glxApi.invoke('set-discord-rpc', {
        state: state ?? false,
      });
      console.log('D rpc', state, result);

      localStorage.setItem(
        'discord-rpc',
        JSON.stringify(<DiscordConfig>{ state, display: this.display })
      );
    },
  },
  computed: {},
  mounted() {
    const configItem = localStorage.getItem('discord-rpc');

    if (!configItem) return;

    const config = JSON.parse(configItem) as DiscordConfig;
    console.log(config);
    this.enabled = config.state;
    this.display = config.display;
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
