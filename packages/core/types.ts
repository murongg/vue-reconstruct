import type j from 'jscodeshift'

interface SetupState {
  newImports: {
    vue: string[]
    'vue-router': string[]
  }
  returnStatement: j.ReturnStatement
  setupFn: j.FunctionExpression
  valueWrappers: string[]
  variables: string[]
  methods: boolean
}

export {
  SetupState,
}
