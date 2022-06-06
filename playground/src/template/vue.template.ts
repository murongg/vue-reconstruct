import { convertScript as compositionConvertScript } from '@vue-reconstruct/composition-api'
import { convertScript as sfcConvertScript } from '@vue-reconstruct/sfc'

export const vueTemplateCode = `
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
    this.$emit('change6', this.a)
  },
  created() {
    console.log(this.a)
    this.b + this.c
  },
  filters: {
    capitalize: function (value) {
      if (!value) return ''
      value = value.toString()
      return value.charAt(0).toUpperCase() + value.slice(1)
    }
  },  
  methods: {
    ...mapActions([
      'increment',
      'increment2'
    ]),
    ...mapMutations([
      'increment3',
    ]),
    teatActions() {
      this.increment(123)
      this.increment3(123)
    },
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
    testEmit() {
      this.$emit('change1', 'test msg')
      this.$emit('change2', {})
      this.$emit('change3', [])
      this.$emit('change4', this.host)
      this.$emit('change5', this.a)
    }
  },
};
`.trim()

export const vueTemplateTypes = {
  'composition-api': compositionConvertScript,
  'sfc': sfcConvertScript
}

export const vueTemplate = {
  template: vueTemplateCode,
  types: vueTemplateTypes
}
