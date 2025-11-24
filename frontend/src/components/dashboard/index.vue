<template>
  <div id="dashboard">
    <v-container>
      <v-row>
        <v-col
          sm="12"
          md="4"
        >
          <v-img
            alt="App Icon"
            src="@/assets/icon-transparent.png"
            width="200px"
            class="mx-auto"
          />
        </v-col>
        <v-col class="d-flex text-no-wrap justify-center align-center">
          <h1 style="color: #7c4dff">
            Advanced Streaming
          </h1>
          <h2
            class="mb-4"
            style="color: #7e57c2"
          >
            Client
          </h2>
        </v-col>
      </v-row>
    </v-container>

    <v-container>
      <v-row>
        <v-col
          sm="4"
          md="4"
        >
          <DatabaseStats class="widget" />
          <LastSeen class="widget" />
        </v-col>
        <v-col
          sm="12"
          md="8"
        >
          <RecentlyAdded />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DatabaseStats from '@/components/dashboard/widgets/DatabaseStats.vue';
import RecentlyAdded from './widgets/RecentlyAdded.vue';
import LastSeen from './widgets/LastSeen.vue';

export default defineComponent({
  name: 'Dashboard',
  components: {
    DatabaseStats,
    RecentlyAdded,
    LastSeen,
  },
  data: () => ({}),
  methods: {},
  computed: {},
  created() {},
});
</script>

<style>

#dashboard {
  .widget {
    margin-bottom: 16px;
  }
}

</style>
