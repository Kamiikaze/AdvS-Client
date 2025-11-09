<template>
  <span
    class="external-link"
    @click="openExternalConfirm = true"
  >
    {{ text }}
  </span>
  <sup><v-icon size="8"> mdi-open-in-new </v-icon></sup>
  <v-dialog
    v-model="openExternalConfirm"
    max-width="500px"
  >
    <v-card>
      <v-card-text>
        You are about to open an external link:<br>
        <v-code>{{ url }}</v-code>
        <br><br>
        Do you want to proceed?
      </v-card-text>
      <v-card-actions>
        <v-btn
          color="success"
          @click="openExternal()"
        >
          Open
        </v-btn>
        <v-btn
          color="warning"
          @click="copyToClipboard()"
        >
          Copy
        </v-btn>

        <v-spacer />

        <v-btn
          color="error"
          @click="openExternalConfirm = false"
        >
          Cancel
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
    text: {
      type: String,
      required: true,
    },
  },
  name: 'ExternalLink',
  data: () => ({
    openExternalConfirm: false,
  }),
  methods: {
    openExternal() {
      console.log('openExternal', this.text, this.url);
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
