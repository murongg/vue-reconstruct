import type j from 'jscodeshift'

interface Collector {
  newImports: {
    vue: string[]
    'vue-router': string[]
  }
  returnStatement: j.ReturnStatement
  setupFn: j.FunctionExpression
  setupContext: string[]
  valueWrappers: string[]
  variables: string[]
  propVariables: string[]
  methods: boolean
  isSfc: boolean
}

export {
  Collector,
}
