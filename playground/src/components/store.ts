import { reactive, watch } from 'vue'
import { convertScript } from '@vue-reconstruct/composition-api'

const welcomeCode = `
export default {
  data() {
    return {
      foo: 'bar',
    }
  } ,
  watch: {
    foo(newVal, oldVal) {
      // do something...
    }
  },
  computed: {
    foofoo() {
      return foo;
    },
    abs: {
      get() {
        // do something...
      },
      set(val) {
        // do someting...
      }
    }
  },
  methods: {
    change() {
      const a = 1;
    }
  },
  created() {
    foo = 1;
  },
  mounted() {
    foo = 2;
  }
}
`.trim()

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
}

export class ReplStore {
  state: StoreState

  constructor() {
    this.state = reactive({
      code: welcomeCode,
      convertedCode: '',
    })

    watch(
      () => this.state.code,
      () => {
        try {
          this.state.convertedCode = convertScript(this.state.code)
        }
        catch (err) {
          console.log(err)
        }
      },
      {
        immediate: true,
      },
    )
  }
}
