import type { Collection } from 'jscodeshift'
import j from 'jscodeshift'
import type { SetupState } from '@vue-reconstruct/core'
import { LIFECYCLE_HOOKS, ROUTER_HOOKS, computedHandler, dataHandler, importHandler, lifecyclesHandler, methodsHandler, transformThis, watchHandler } from '@vue-reconstruct/core'

export function createConvert(code: string, methods: boolean): Collection {
  const setupState: SetupState = {
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
    methods,
  }
  const astCollection = j(code)
  // ObjectExpression
  const componentDefinition = astCollection.find(j.ExportDefaultDeclaration).nodes()[0]

  if (!componentDefinition)
    throw new Error('Default export not found')

  // Data
  dataHandler(astCollection, setupState)
  // Computed
  computedHandler(astCollection, setupState)
  // Watch
  watchHandler(astCollection, setupState)
  // Methods
  // Methods
  methodsHandler(astCollection, setupState)

  lifecyclesHandler(astCollection, setupState.setupFn, LIFECYCLE_HOOKS, setupState.newImports.vue)
  lifecyclesHandler(astCollection, setupState.setupFn, ROUTER_HOOKS, setupState.newImports['vue-router'])
  importHandler(astCollection, setupState)

  if (setupState.setupFn.body.body.length) {
    // Group statements heuristically
    // setupState.setupFn.body.body = groupStatements(setupState.setupFn.body.body, setupState.variables)
    setupState.setupFn.body.body.push(setupState.returnStatement);

    (componentDefinition.declaration as j.ObjectExpression).properties.push(
      j.methodDefinition(
        'method',
        j.identifier('setup'),
        setupState.setupFn,
      ) as unknown as j.ObjectProperty,
    )

    // Remove `this`
    transformThis(astCollection, setupState.variables, setupState.valueWrappers)
  }
  return astCollection
}

export function convertScript(code: string, methods?: boolean) {
  return createConvert(code, !!methods).toSource()
}
