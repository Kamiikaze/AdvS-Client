<template>
  <div v-for="(alert, index) in alerts" :key="index">
    <v-alert
      class="ma-2 py-2"
      :color="alert.code"
      :closable="alert.closeable"
      :title="alert.title"
      >{{ alert.message }}</v-alert
    >
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AppAlerts',
  data: () => ({
    alerts: [
      {
        code: 'warning',
        closeable: true,
        title: 'Hinweis: S.to hat seine Webseiten geändert.',
        message:
          'Die App funktioniert größtenteils wieder, aber einige Features könnten noch nicht korrekt laufen. Ich arbeite bereits an weiteren Fixes – danke für eure Geduld 💙',
      },
    ],
  }),
  methods: {},
  computed: {},
});
</script>
