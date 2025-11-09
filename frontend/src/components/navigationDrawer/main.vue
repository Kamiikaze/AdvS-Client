<template>
  <v-navigation-drawer
    theme="dark"
    permanent
    rail
  >
    <v-list
      density="compact"
      nav
    >
      <v-tooltip text="Dashboard">
        <template #activator="{ props }">
          <v-list-item
            tabindex="1"
            v-bind="props"
            prepend-icon="mdi-view-dashboard"
            to="/"
          />
        </template>
      </v-tooltip>

      <v-tooltip text="Suche">
        <template #activator="{ props }">
          <v-list-item
            tabindex="2"
            v-bind="props"
            prepend-icon="mdi-magnify"
            :active="showSearch"
            @click="showSearch = true"
          />
        </template>
      </v-tooltip>

      <v-tooltip text="Verlauf">
        <template #activator="{ props }">
          <v-list-item
            tabindex="3"
            v-bind="props"
            prepend-icon="mdi-history"
            :active="showExtendedDrawer.history"
            @click="toggleDrawer('history')"
          />
        </template>
      </v-tooltip>
    </v-list>

    <template #append>
      <v-divider />
      <v-list
        density="compact"
        nav
      >
        <v-tooltip text="In Github öffnen">
          <template
            #activator="{ props }"
          >
            <ExternalLink
              url="https://github.com/Kamiikaze/AdvS-Client"
              no-text
            >
              <v-list-item link>
                <v-avatar
                  image="@/assets/github.svg"
                  v-bind="props"
                />
              </v-list-item>
            </ExternalLink>
          </template>
        </v-tooltip>
        <v-tooltip text="Einstellungen">
          <template #activator="{ props }">
            <v-list-item
              tabindex="4"
              v-bind="props"
              prepend-icon="mdi-cog"
              to="/settings"
            />
          </template>
        </v-tooltip>
      </v-list>
    </template>
  </v-navigation-drawer>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { mapActions, mapState, mapWritableState } from 'pinia';
import { useAppStore } from '@/store/app';
import ExternalLink from '@/components/externalLink.vue';

export default defineComponent({
  name: 'NavDrawerMain',
  components: { ExternalLink },
  data: () => ({}),
  methods: {
    ...mapActions(useAppStore, ['toggleDrawer']),
  },
  computed: {
    ...mapState(useAppStore, ['showExtendedDrawer']),
    ...mapWritableState(useAppStore, ['showSearch']),
  },
});
</script>
