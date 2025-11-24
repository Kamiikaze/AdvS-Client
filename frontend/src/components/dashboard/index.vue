<template>
  <div id="dashboard">
    <v-container class="header">
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

    <v-container fluid>
      <v-row class="mb-4">
        <v-col>
          <h2>Dashboard</h2>
        </v-col>
        <v-col
          class="d-flex justify-end ga-2"
          @click="updateTableChildComponent"
        >
          <v-btn
            :color="isEditMode ? 'success' : 'rgb(100, 59, 201)'"
            :prepend-icon="isEditMode ? 'mdi-check' : 'mdi-pencil'"
            @click="toggleEditMode"
          >
            {{ isEditMode ? 'Fertig' : 'Bearbeiten' }}
          </v-btn>
          <v-btn
            v-if="isEditMode"
            color="warning"
            prepend-icon="mdi-restore"
            @click="resetLayout"
          >
            Zurücksetzen
          </v-btn>
        </v-col>
      </v-row>

      <grid-layout
        v-model:layout="layout"
        :class="
          (isEditMode ? 'vgl-layout--edit-mode' : '') + ` ${currentBreakpoint}`
        "
        :col-num="12"
        :row-height="30"
        :is-draggable="isEditMode"
        :is-resizable="isEditMode"
        :vertical-compact="true"
        :use-css-transforms="true"
        :responsive="true"
        :margin="[16, 16]"
        :auto-size="true"
        :use-style-cursor="true"
        @layout-updated="onLayoutUpdated"
        @breakpoint-changed="onBreakpointChanged"
      >
        <grid-item
          v-for="item in layout"
          :key="item.i"
          :x="item.x"
          :y="item.y"
          :w="item.w"
          :h="item.h"
          :i="item.i"
          :min-w="item.minW"
          :min-h="item.minH"
          :max-w="item.maxW"
          :max-h="item.maxH"
          drag-allow-from=".drag-handle"
          @resized="onResized"
        >
          <WidgetWrapper :is-edit-mode="isEditMode">
            <DatabaseStats v-if="item.i === 'database-stats'" />
            <LastSeen v-else-if="item.i === 'last-seen'" />
            <RecentlyAdded
              v-else-if="item.i === 'recently-added'"
              ref="recentlyAdded"
            />
          </WidgetWrapper>
        </grid-item>
      </grid-layout>
    </v-container>
  </div>
</template>

<script lang="ts">
import { type ComponentInstance, defineComponent } from 'vue';
import { GridLayout, GridItem } from 'grid-layout-plus';
import { mapState, mapActions } from 'pinia';
import { useDashboardStore, type WidgetLayout } from '@/store/dashboard';
import DatabaseStats from '@/components/dashboard/widgets/DatabaseStats.vue';
import RecentlyAdded from './widgets/RecentlyAdded.vue';
import LastSeen from './widgets/LastSeen.vue';
import WidgetWrapper from './WidgetWrapper.vue';

export default defineComponent({
  name: 'Dashboard',
  components: {
    DatabaseStats,
    RecentlyAdded,
    LastSeen,
    WidgetWrapper,
    GridLayout,
    GridItem,
  },
  data: () => ({
    currentBreakpoint: '',
  }),
  computed: {
    ...mapState(useDashboardStore, ['currentLayout', 'isEditMode']),
    layout: {
      get() {
        return this.currentLayout;
      },
      set(value: WidgetLayout[]) {
        this.saveLayout(value);
      },
    },
  },
  methods: {
    ...mapActions(useDashboardStore, [
      'loadLayout',
      'saveLayout',
      'resetLayout',
      'toggleEditMode',
    ]),
    updateTableChildComponent() {
      this.$nextTick(() => {
        const refs = this.$refs.recentlyAdded;
        const component: ComponentInstance<typeof RecentlyAdded> =
          Array.isArray(refs) ? refs[0] : refs;

        if (component && typeof component.updateTableHeight === 'function') {
          component.updateTableHeight();
        }
      });
    },
    onLayoutUpdated(newLayout: WidgetLayout[]) {
      this.updateTableChildComponent();
      if (this.isEditMode) {
        this.saveLayout(newLayout);
      }
    },
    onBreakpointChanged(breakpoint: 'lg' | 'md' | 'sm' | 'xs' | 'xxs') {
      this.currentBreakpoint = breakpoint;
    },
    onResized() {
      this.updateTableChildComponent();
    },
  },
  created() {
    this.loadLayout();
  },
});
</script>

<style>
#dashboard {
  .header {
    max-width: 700px;
  }
}

.vgl-layout {
  &.lg {
    --colNum: 12;
  }
  &.md {
    --colNum: 10;
  }
  &.sm {
    --colNum: 6;
  }
  &.xs {
    --colNum: 4;
  }
  &.xxs {
    --colNum: 2;
  }

  .vgl-item--placeholder {
    background: rgba(124, 77, 255, 0.6);
    border-radius: 4px;
    transition: all 200ms ease;
    z-index: 2;
  }

  .vgl-item {
    touch-action: none;

    .vgl-item__resizer::before {
      z-index: 20;
      border-color: #fff;
      border-radius: 0 0 4px 0;
    }
  }
}

.vgl-layout--edit-mode::before {
  overflow: hidden;
  position: absolute;
  width: calc(100% - 15px);
  height: calc(100% - 15px);
  margin: 8px;
  content: '';
  background-image:
    linear-gradient(to right, lightgrey 1px, transparent 1px),
    linear-gradient(to bottom, lightgrey 1px, transparent 1px);
  background-repeat: repeat;
  background-size: calc(calc(100% - 1px) / var(--colNum)) 46px;
}
</style>
