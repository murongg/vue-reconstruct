import j from 'jscodeshift'
import { findProperty } from '@vue-reconstruct/shared'
import type { Collector } from '../types'

export function vuexHandler(astCollection: j.Collection, collector: Collector): j.Collection {
  const methodsOptionCollection = findProperty(astCollection, 'methods').find(j.SpreadElement)

  methodsOptionCollection.forEach((property) => {
    if (property.value.type === 'SpreadElement') {
      const argument = property.value.argument
      if (argument.type === 'CallExpression' && argument.arguments[0].type === 'ArrayExpression') {
        // fix: multiple add useStore
        if (!collector.newImports.vuex.has('useStore')) {
          collector.setupFn.body.body.push(
            j.variableDeclaration('const', [
              j.variableDeclarator(
                j.identifier('store'),
                j.callExpression(
                  j.identifier('useStore'),
                  [],
                ),
              ),
            ]),
          )
        }
        collector.newImports.vuex.add('useStore')
        // const store = useStore();
        // collect `vuex` helper function property
        // mapMutations / mapActions
        argument.arguments[0].elements.forEach((el) => {
          const calleeName = (argument.callee as j.Identifier).name
          const propertyName = (el as any).value
          if (calleeName === 'mapActions')
            collector.vuexMap.actions.set(propertyName, el as any)
          else if (calleeName === 'mapMutations')
            collector.vuexMap.mutations.set(propertyName, el as any)

          collector.variables.push(propertyName)
        })
      }
    }
  })
  return astCollection
}
