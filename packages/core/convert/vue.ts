import type { Collection } from 'jscodeshift'
import j from 'jscodeshift'
import type { Collector } from '..'
import { LIFECYCLE_HOOKS, ROUTER_HOOKS, computedHandler, dataHandler, importHandler, lifecyclesHandler, methodsHandler, propsHandler, setupHandler, watchHandler } from '..'

export function createVueConvert(code: string, methods: boolean, isSfc?: boolean): Collection {
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
    methods,
    isSfc: !!isSfc,
  }
  const astCollection = j(code)
  // ObjectExpression
  const componentDefinition = astCollection.find(j.ExportDefaultDeclaration).nodes()[0]

  if (!componentDefinition)
    throw new Error('Default export not found')

  // Data
  dataHandler(astCollection, collector)
  // Props
  propsHandler(astCollection, collector)
  // Computed
  computedHandler(astCollection, collector)
  // Watch
  watchHandler(astCollection, collector)
  // Methods
  methodsHandler(astCollection, collector)

  lifecyclesHandler(astCollection, collector.setupFn, LIFECYCLE_HOOKS, collector.newImports.vue)
  lifecyclesHandler(astCollection, collector.setupFn, ROUTER_HOOKS, collector.newImports['vue-router'])

  importHandler(astCollection, collector)

  if (collector.setupFn.body.body.length)
    setupHandler(astCollection, collector)

  return astCollection
}
