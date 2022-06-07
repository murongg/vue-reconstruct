import type j from 'jscodeshift'

type VuexMap = 'state' | 'getters' | 'actions' | 'mutations'
type Imports = 'vue' | 'vue-router' | 'vuex'
interface Collector {
  newImports: {
    [x in Imports]: Set<string>
  }
  returnStatement: j.ReturnStatement
  setupFn: j.FunctionExpression
  setupContext: string[]
  valueWrappers: string[]
  variables: string[]
  propVariables: string[]
  vuexMap: {
    [x in VuexMap]: Map<string, j.Literal>
  }
  methods: boolean
  isSfc: boolean
}

export {
  Collector,
  VuexMap,
  Imports,
}
