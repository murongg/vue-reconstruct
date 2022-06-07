import type { Collection } from 'jscodeshift'
import j from 'jscodeshift'
import type { Collector } from '..'
import { LIFECYCLE_HOOKS, ROUTER_HOOKS, computedHandler, dataHandler, emitHandler, filtersHandler, importHandler, lifecyclesHandler, methodsHandler, propsHandler, refsHandler, setupHandler, vuexHandler, watchHandler } from '..'

export function createVueConvert(code: string, methods: boolean, isSfc?: boolean): Collection {
  const collector: Collector = {
    newImports: {
      'vue': new Set(),
      'vue-router': new Set(),
      'vuex': new Set(),
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
    vuexMap: {
      state: new Map(),
      getters: new Map(),
      actions: new Map(),
      mutations: new Map(),
    },
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
  // Emit
  emitHandler(astCollection, collector)
  // Refs
  refsHandler(astCollection, collector)
  // Computed
  computedHandler(astCollection, collector)
  // Watch
  watchHandler(astCollection, collector)
  // Vuex
  // Must be before of `methods`
  vuexHandler(astCollection, collector)
  // Methods
  methodsHandler(astCollection, collector)
  // Filters
  filtersHandler(astCollection, collector)

  lifecyclesHandler(astCollection, collector.setupFn, LIFECYCLE_HOOKS, collector.newImports.vue)
  lifecyclesHandler(astCollection, collector.setupFn, ROUTER_HOOKS, collector.newImports['vue-router'])

  importHandler(astCollection, collector)

  if (collector.setupFn.body.body.length)
    setupHandler(astCollection, collector)

  return astCollection
}
