<template>
  <v-container>
    <v-row>
      <v-col cols="6">
        <SettingsGeneral disabled />
      </v-col>
      <v-col cols="6">
        <SettingsIntegrations class="mb-4" />
        <SettingsDiscord />
      </v-col>
      <v-col cols="6"> </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import SettingsDiscord from '@/components/settings/discord.vue';
import SettingsGeneral from '@/components/settings/general.vue';
import SettingsIntegrations from '@/components/settings/integrations.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Settings',
  components: { SettingsDiscord, SettingsIntegrations, SettingsGeneral },
  data: () => ({
    userConfig: {},
  }),
  methods: {},
  computed: {},
});
</script>

<style scoped></style>
