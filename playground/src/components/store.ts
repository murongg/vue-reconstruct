import { reactive, watch } from 'vue'
import { convertScript as compositionConvertScript } from '@vue-reconstruct/composition-api'
import { convertScript as sfcConvertScript } from '@vue-reconstruct/sfc'
import { templates } from '../template'
export class File {
  filename: string
  code: string
  compiled = {
    js: '',
    css: '',
    ssr: '',
  }

  constructor(filename: string, code = '') {
    this.filename = filename
    this.code = code
  }
}

export interface StoreState {
  code: string
  convertedCode: string
  type: string
  childType: string
}

export class ReplStore {
  state: StoreState

  constructor() {
    this.state = reactive({
      code: '',
      convertedCode: '',
      type: 'vue',
      childType: 'composition-api'
    })
    this.state.code = templates[this.state.type].template

    watch(
      () => this.state.code,
      () => {
        this.state.code && this.changeCode()
      },
      {
        immediate: true,
      },
    )

    watch(() => this.state.type, () => {
      this.state.code = templates[this.state.type].template
    })
  }

  changeCode() {
    try {
      this.state.convertedCode = templates[this.state.type].types[this.state.childType](this.state.code)
    }
    catch (err) {
      console.log(err)
    }
  }
}
