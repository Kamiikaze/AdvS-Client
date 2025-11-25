import type { Ref } from 'vue';
import type { Route, Router } from 'vue-router';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $router: Router;
    $route: Route;
    $ref: Ref;
  }
}
