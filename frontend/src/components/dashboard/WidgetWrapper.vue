<template>
  <v-card
    color="#643bc9"
    class="widget-card"
    :class="{ 'edit-mode': isEditMode }"
  >
    <div
      v-if="isEditMode"
      class="drag-handle"
    >
      <v-icon size="small">
        mdi-drag
      </v-icon>
    </div>
    <slot />
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'WidgetWrapper',
  props: {
    isEditMode: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style scoped>
.widget-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.widget-card.edit-mode {
  border: 2px dashed rgba(124, 77, 255, 0.5);
}

.drag-handle {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  padding: 4px;
  cursor: grab;
}

.drag-handle:active {
  cursor: grabbing;
}
</style>
