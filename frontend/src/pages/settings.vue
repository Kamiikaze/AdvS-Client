<template>
  <v-container>
    <v-alert class="mb-4" type="warning"> Noch in Arbeit! </v-alert>
    <v-row>
      <v-col>
        <SettingsGeneral disabled />
      </v-col>
      <v-col>
        <SettingsIntegrations disabled />
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
