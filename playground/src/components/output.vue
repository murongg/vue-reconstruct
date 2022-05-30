<script setup lang="ts">
import { inject } from 'vue'
import CodeMirror from './codemirror/CodeMirror.vue'
import type { ReplStore } from './store'

const store = inject('store') as ReplStore
</script>

<template>
  <div class="editor-container">
    <CodeMirror
      :readonly="true"
      mode="javascript"
      :value="store.state.convertedCode"
    />
  </div>
</template>

<style scoped>
.editor-container {
  height: calc(100% - var(--header-height));
  overflow: hidden;
  position: relative;
}
</style>
