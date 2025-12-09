<template>
  <div class="spinner">
    <div class="spinner-backgdrop"></div>
    <div class="spinner-spin first"></div>
    <div class="spinner-spin second"></div>
    <v-img class="spinner-logo" src="@/assets/icon-transparent.png" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Spinner',
  data: () => ({
    key: 'string',
  }),
  methods: {},
  computed: {},
});
</script>

<style lang="scss" scoped>
* {
  --spinner-size: min(10vw, 100px);
  --spinner-img-size: calc(var(--spinner-size) - 10px);
}

.spinner,
.spinner-backgdrop,
.spinner-logo,
.spinner-spin {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
}

.spinner {
  height: var(--spinner-size);
  width: var(--spinner-size);
  z-index: 999;

  .spinner-backgdrop {
    background-color: rgba(var(--v-theme-purple-dark), 0.5);
    backdrop-filter: blur(3px);
    border-radius: 50%;
  }

  .spinner-logo {
    top: 5px;
    height: var(--spinner-img-size);
    width: var(--spinner-img-size);
  }

  .spinner-spin {
    display: inline-block;
    border-radius: 50%;
    animation: spinToWin 1s linear infinite;

    &.first {
      box-shadow: inset 0 -3px 5px rgb(var(--v-theme-logo-pink));
    }

    &.second {
      box-shadow: inset 0 3px 5px rgb(var(--v-theme-logo-blue));
    }
  }
}

@keyframes spinToWin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
