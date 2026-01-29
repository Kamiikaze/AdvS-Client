<template>
  <div v-for="(alert, index) in alerts" :key="index">
    <v-alert class="ma-2 py-2" :color="alert.code">{{ alert.message }}</v-alert>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AppAlerts',
  data: () => ({
    alerts: [
      {
        code: 'error',
        message:
          'Die Seite S.to hatte ein Update, weshalb Serien aktuell nicht funktionieren. Wird schnellstmöglich behoben!',
      },
    ],
  }),
  methods: {},
  computed: {},
});
</script>
