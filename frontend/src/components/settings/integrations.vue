<template>
  <v-card>
    <v-card-title
      >Synchronisieren <span class="text-disabled">(Beta)</span></v-card-title
    >
    <v-card-subtitle class="text-wrap"
      >Snychronisiere den Status deiner gesehenen Folgen mit anderen
      Providern.</v-card-subtitle
    >
    <v-card-text v-if="linkedAccounts.length > 0">
      <v-row v-for="la in linkedAccounts" :key="la.provider">
        <v-col cols="5" class="d-flex flex-row justify-start align-center">
          <span
            class="status-indicator"
            :style="`--status-color: ${getLinkStatus(la.status).color}`"
          >
            {{ getBeautifyedName(la.provider) }}</span
          >
        </v-col>

        <v-col cols="7" class="d-flex flex-row justify-start align-center">
          <div v-if="LinkedAccountStatus().SYNCED == la.status">
            <span class="text-green font-weight-bold">
              {{ getLinkStatus(la.status).message }}
            </span>

            <v-tooltip text="Verbindung trennen" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  class="ma-2"
                  color="red-lighten-1"
                  icon="mdi-logout"
                  variant="text"
                  density="compact"
                  @click="execProviderLinkAction(la, 'unlink')"
                />
              </template>
            </v-tooltip>
          </div>

          <div v-else-if="LinkedAccountStatus().DISABLED == la.status">
            <p class="text-disabled">{{ getLinkStatus(la.status).message }}</p>
          </div>

          <div v-else>
            <p>{{ getLinkStatus(la.status).message }}</p>
            <v-btn
              append-icon="mdi-open-in-new"
              color="primary"
              density="comfortable"
              @click="execProviderLinkAction(la, 'link')"
              >Anmelden</v-btn
            >
          </div>
        </v-col>
      </v-row>

      <!--v-row>
        <v-col cols="4">
          File Sync<br />
          (Will additionally save your watch history into a file, to sync with
          cloud storage)
        </v-col>
        <v-col>
          <v-switch v-model="connected3" color="primary" hide-details disabled />
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
      </v-row-->
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { type LinkedAccount, LinkedAccountStatus } from '@/lib/electron';
import { useAppStore } from '@/store/app';
import { mapActions, mapState } from 'pinia';
import { defineComponent } from 'vue';

export type ProviderAction = 'link' | 'unlink';

export default defineComponent({
  name: 'SettingsIntegrations',
  data: () => ({
    connected: false,
    connected2: true,
    connected3: true,
  }),
  methods: {
    ...mapActions(useAppStore, ['fetchLinkedAccounts']),
    LinkedAccountStatus() {
      return LinkedAccountStatus;
    },
    getBeautifyedName(provider: string) {
      switch (provider) {
        case 'aniworld':
          return 'AniWorld.to';
          break;
        case 'sto':
          return 'S.to';
          break;
        default:
          return provider;
          break;
      }
    },
    getLinkStatus(statusCode: LinkedAccountStatus) {
      const status = { color: 'grey', message: 'Deaktiviert' };

      switch (statusCode) {
        case 0:
          status.color = 'green';
          status.message = 'Verbunden';
          break;
        case 1:
          status.color = 'orange';
          status.message = 'Nicht verbunden';
          break;
        case 2:
          status.color = 'red';
          status.message = 'Fehler';
          break;
        default:
          status.color = 'grey';
          status.message = 'Deaktiviert';
          break;
      }
      return status;
    },
    async execProviderLinkAction(la: LinkedAccount, action: ProviderAction) {
      let result;

      switch (la.provider) {
        case 'aniworld':
          console.log('Ani', la, action);
          result = await window.glxApi.invoke('set-linked-account', {
            id: la.e_id,
            action,
          });
          break;
        case 'sto':
          console.log('sto', action);
          result = await window.glxApi.invoke('set-linked-account', {
            id: la.e_id,
            action,
          });
          break;
        default:
          console.log('No action for this linkedAccount', la, action);
          break;
      }
      console.log('exec result', result);

      await this.fetchLinkedAccounts();
    },
  },
  computed: {
    ...mapState(useAppStore, ['linkedAccounts']),
  },
});
</script>

<style scoped>
.status-indicator {
  --status-color: green;
}
.status-indicator::before {
  content: '●';
  margin-right: 8px;
  font-size: 18px;
  color: var(--status-color);
  animation: pulse 2s ease-in-out infinite;
  display: inline-block;
}

@keyframes pulse {
  0%,
  100% {
    filter: drop-shadow(0 0 4px var(--status-color));
  }
  50% {
    filter: drop-shadow(0 0 6px var(--status-color))
      drop-shadow(0 0 6px var(--status-color));
  }
}
</style>
