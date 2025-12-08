<template>
  <v-container>
    <v-row>
      <v-col cols="6">
        <SettingsGeneral disabled />
      </v-col>
      <v-col cols="6">
        <SettingsIntegrations />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import SettingsGeneral from '@/components/settings/general.vue';
import SettingsIntegrations from '@/components/settings/integrations.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Settings',
  components: { SettingsIntegrations, SettingsGeneral },
  data: () => ({
    userConfig: {},
  }),
  methods: {},
  computed: {},
});
</script>

<style scoped></style>
