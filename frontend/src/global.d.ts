import type { Route, Router } from 'vue-router';
import type { Ref } from 'vue';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $router: Router;
    $route: Route;
    $ref: Ref;
  }
}
