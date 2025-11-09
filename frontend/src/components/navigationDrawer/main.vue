<template>
  <v-navigation-drawer
    theme="dark"
    permanent
    rail
  >
    <!--v-menu
      min-width="200px"
      location="end bottom"
      origin="start bottom"
    >
      <template #activator="{ props }">
        <v-btn
          icon
          v-bind="props"
        >
          <v-avatar
            color="brown"
            size="medium"
          >
            <span class="text-h5">TK</span>
          </v-avatar>
        </v-btn>
      </template>
      <v-card class="ml-3 mt-1">
        <v-card-text>
          <div class="mx-auto text-center">
            <v-avatar
              class="mb-2"
              color="brown"
            >
              <span class="text-subtitle-1">TK</span>
            </v-avatar>
            <h4>Timo K</h4>
            <v-divider class="my-2" />
            <v-btn
              variant="text"
              density="compact"
            >
              Edit Account
            </v-btn>
            <v-divider class="my-2" />
            <v-btn
              variant="text"
              density="compact"
            >
              Logout
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-menu-->

    <!--v-divider /-->

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

export default defineComponent({
  name: 'NavDrawerMain',
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
