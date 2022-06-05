import j from 'jscodeshift'
import { describe, expect, it } from 'vitest'
import type { Collector } from '..'
import { dataHandler, propsHandler, watchHandler } from '..'
describe('test vue', () => {
  const collector: Collector = {
    newImports: {
      'vue': [],
      'vue-router': [],
    },
    returnStatement: j.returnStatement(
      j.objectExpression([]),
    ),
    setupFn: j.functionExpression(
      null,
      [],
      j.blockStatement([]),
    ),
    valueWrappers: [],
    variables: [],
    propVariables: [],
    setupContext: [],
    methods: false,
    isSfc: false,
  }
  const code = `
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
  watch: {
    a(newVal, oldVal) {
      // do someting...
    }
  },
  async mounted() {
    await this.fetchBannerList();
    this.$emit('change6', this.a)
  },
  created({so,sk}) {
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
  const ast = j(code)
  it('property: data test', () => {
    dataHandler(ast, collector)
    expect(collector.variables).toEqual(['host', 'scrollTop', 'bannerList'])
    const properties = (collector.returnStatement.argument as j.ObjectExpression).properties.map(path => ((path as j.Property).value as j.Identifier).name)
    expect(collector.variables).toEqual(properties)
  })
  it('property: props', () => {
    propsHandler(ast, collector)
    expect(collector.propVariables).toEqual(['a', 'b', 'c'])
  })
  it('property: watch', () => {
    watchHandler(ast, collector)
    expect(collector.newImports.vue).toContain('watch')
  })
})
