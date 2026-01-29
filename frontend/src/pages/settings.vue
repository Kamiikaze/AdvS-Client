<template>
  <v-container>
    <v-row>
      <v-col cols="6">
        <SettingsGeneral disabled class="mb-4" />
        <SettingsDev />
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
import SettingsDev from '@/components/settings/development.vue';
import SettingsDiscord from '@/components/settings/discord.vue';
import SettingsGeneral from '@/components/settings/general.vue';
import SettingsIntegrations from '@/components/settings/integrations.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Settings',
  components: {
    SettingsDev,
    SettingsDiscord,
    SettingsIntegrations,
    SettingsGeneral,
  },
  data: () => ({
    userConfig: {},
  }),
  methods: {},
  computed: {},
});
</script>

<style scoped></style>
