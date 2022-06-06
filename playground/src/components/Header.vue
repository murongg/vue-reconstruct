
<script lang="ts" setup>
import { inject } from 'vue'
import { ReplStore } from '../components/store'
import { templates } from '../template'

const replStore = inject('store') as ReplStore

const handleSelectChange = () => {
  replStore.changeCode()
}

const changeType = (type: string) => {
  replStore.state.type = type
  replStore.state.childType = Object.keys(templates[type].types)[0]
}

</script>

<template>
  <header class="w-screen h-13 mb-2 flex items-center justify-between px-3 box-border"
    style="background-color: #42b883">
    <img src="/icon.svg" alt="" class="h-10 w-10 bg-light-50 rounded-1">
    <nav>
      <ul class="list-none flex items-center">
        <li
          :class="['cursor-pointer', 'px-3', index === 0 ? '' : 'border-l', item === replStore.state.type ? 'text-light-50 text-lg' : 'text-light-500']"
          @click="changeType(item)" v-for="(item, index) in Object.keys(templates)" :key="item">{{ item }}</li>
      </ul>
    </nav>
    <select @change="handleSelectChange" v-model="replStore.state.childType">
      <option :value="item" v-for="item in Object.keys(templates[replStore.state.type].types)">{{ item }}</option>
    </select>
  </header>
</template>
