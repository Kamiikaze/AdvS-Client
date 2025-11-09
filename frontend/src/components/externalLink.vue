<template>
  <span
    class="external-link"
    @click="openExternalConfirm = true"
  >
    <slot />
    <sup v-if="!noText"><v-icon size="8"> mdi-open-in-new </v-icon></sup>
  </span>
  <v-dialog
    v-model="openExternalConfirm"
    max-width="500px"
  >
    <v-card>
      <v-card-text>
        Du bist dabei, einen externen Link zu öffnen:<br>
        <v-code>{{ url }}</v-code>
        <br><br>
        Möchtest du fortfahren?
      </v-card-text>
      <v-card-actions>
        <v-btn
          color="success"
          @click="openExternal()"
        >
          Öffnen
        </v-btn>
        <v-btn
          color="warning"
          @click="copyToClipboard()"
        >
          Kopieren
        </v-btn>

        <v-spacer />

        <v-btn
          color="error"
          @click="openExternalConfirm = false"
        >
          Abbrechen
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    url: {
      type: String,
      required: true,
    },
    noText: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  name: 'ExternalLink',
  data: () => ({
    openExternalConfirm: false,
  }),
  methods: {
    openExternal() {
      console.log('openExternal', this.url);
      this.openExternalConfirm = false;
      window.open(this.url, '_blank');
    },
    copyToClipboard() {
      navigator.clipboard.writeText(this.url);
      this.openExternalConfirm = false;
    },
  },
});
</script>

<style scoped>
.external-link {
  cursor: pointer;
}
.external-link:hover {
  color: #fff;
  text-decoration: underline;
}
</style>
