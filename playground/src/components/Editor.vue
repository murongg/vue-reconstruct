<script setup lang="ts">
import { inject } from 'vue'
import CodeMirror from './codemirror/CodeMirror.vue'
import { debounce } from './utils'
import type { ReplStore } from './store'

const store = inject('store') as ReplStore

const onChange = debounce((code: string) => {
  store.state.code = code
}, 250)
</script>

<template>
  <div class="editor-container">
    <CodeMirror
      mode="javascript"
      :value="store.state.code"
      @change="onChange"
    />
  </div>
</template>

<style scoped>
.editor-container {
  height: 100%;
  overflow: hidden;
  position: relative;
}
</style>
