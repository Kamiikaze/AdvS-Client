<template>
  <v-system-bar
    id="system-bar"
    window
  >
    <v-btn
      icon="mdi-refresh"
      variant="text"
      @click="windowControl('refresh')"
    />

    <v-spacer />

    <div id="header-title">
      <v-avatar size="24">
        <v-img
          alt="App Icon"
          src="@/assets/icon.png"
        />
      </v-avatar>
      <span class="ml-2">AdvS-Client v{{ version }}</span>
    </div>

    <v-spacer />

    <div id="window-controls">
      <v-btn
        id="minimize"
        icon="mdi-minus"
        variant="text"
        @click="windowControl('minimize')"
      />

      <v-btn
        id="maximize"
        class="ms-2"
        icon="mdi-checkbox-blank-outline"
        variant="text"
        @click="windowControl('maximize')"
      />

      <v-btn
        id="close"
        class="ms-2"
        icon="mdi-close"
        variant="text"
        @click="windowControl('close')"
      />
    </div>
  </v-system-bar>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Toolbar',
  data: () => ({
    version: '0.0.0',
  }),
  methods: {
    windowControl(type: 'maximize' | 'minimize' | 'close' | 'refresh') {
      switch (type) {
        case 'maximize':
          window.glxApi.windowFunctions.maximize();
          break;
        case 'minimize':
          window.glxApi.windowFunctions.minimize();
          break;
        case 'close':
          window.glxApi.windowFunctions.close();
          break;
        case 'refresh':
          window.glxApi.windowFunctions.reload();
          break;
      }
    },
    async getAppVersion() {
      this.version = await window.glxApi.invoke('get-version');
    },
  },
  mounted() {
    this.getAppVersion();
  },
});
</script>

<style scoped>
#system-bar {
  overflow: hidden;
  padding-inline: 0;
  padding-inline-end: 0;
  -webkit-app-region: drag;
}
#system-bar button {
  -webkit-app-region: no-drag;
}

#header-title {
  padding-left: 160px;
}

#system-bar .v-btn {
  border-radius: 0;
}

#window-controls #close:hover {
  background-color: darkred;
}
</style>
