import type { Collection } from 'jscodeshift'
import j from 'jscodeshift'
import type { SetupState } from '..'
import { LIFECYCLE_HOOKS, ROUTER_HOOKS, computedHandler, dataHandler, importHandler, lifecyclesHandler, methodsHandler, transformThis, watchHandler } from '..'

export function createVueConvert(code: string, methods: boolean, isSfc?: boolean): Collection {
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
  methodsHandler(astCollection, setupState)

  lifecyclesHandler(astCollection, setupState.setupFn, LIFECYCLE_HOOKS, setupState.newImports.vue)
  lifecyclesHandler(astCollection, setupState.setupFn, ROUTER_HOOKS, setupState.newImports['vue-router'])
  importHandler(astCollection, setupState)

  if (setupState.setupFn.body.body.length) {
    if (isSfc) {
      astCollection.find(j.ExportDefaultDeclaration).remove().insertBefore(setupState.setupFn.body.body)
    }
    else {
      setupState.setupFn.body.body.push(setupState.returnStatement);
      (componentDefinition.declaration as j.ObjectExpression).properties.push(
        j.methodDefinition(
          'method',
          j.identifier('setup'),
          setupState.setupFn,
        ) as unknown as j.ObjectProperty,
      )
    }
    // Remove `this`
    transformThis(astCollection, setupState.variables, setupState.valueWrappers, isSfc)
  }
  return astCollection
}
