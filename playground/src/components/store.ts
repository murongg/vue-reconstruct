import { reactive, watch } from 'vue'
import { convertScript as compositionConvertScript } from '@vue-reconstruct/composition-api'
import { convertScript as sfcConvertScript } from '@vue-reconstruct/sfc'

const welcomeCode = `
import searchBar from 'xxx'
export default {
  props: {
    a: Boolean,
    b: {
      type: String,
      default: ''
    },
    c: {
      type: String,
      required: true
    }
  },
  components: {
    searchBar,
  },
  data() {
    const host =
      workEnv === "local"
        ? "local"
        : "xxx";
    return {
      host,
      scrollTop: 0,
      bannerList: [],
    };
  },
  async mounted() {
    await this.fetchBannerList();
  },
  created() {
    console.log(this.a)
    this.b + this.c
  },
  methods: {
    async fetchBannerList() {
      await this.$http
        .post("xxxx")
        .then((res) => {
          if (res.body.code == 200) {
            const result = res.body;
            this.bannerList = result.data;
          }
        })
        .catch((err) => {
          console.log("err", err);
        });
    },
  },
};
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
  type: string
}

export class ReplStore {
  state: StoreState

  constructor() {
    this.state = reactive({
      code: welcomeCode,
      convertedCode: '',
      type: 'composition-api'
    })


    watch(
      () => this.state.code,
      () => {
        this.changeCode()
      },
      {
        immediate: true,
      },
    )
  }

  changeCode() {
    try {
      switch (this.state.type) {
        case 'composition-api':
          this.state.convertedCode = compositionConvertScript(this.state.code)
          break;
        case 'sfc':
          this.state.convertedCode = sfcConvertScript(this.state.code)
          break;
        default:
          break;
      }
    }
    catch (err) {
      console.log(err)
    }
  }
}
