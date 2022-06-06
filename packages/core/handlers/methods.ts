import j from 'jscodeshift'
import { buildArrowFunctionExpression, buildFunctionDeclaration, findProperty } from '@vue-reconstruct/shared'
import type { Collector } from '../types'

export function methodsHandler(astCollection: j.Collection, collector: Collector): j.Collection {
  const methodsOptionCollection = findProperty(astCollection, 'methods')
  const methodsOption = methodsOptionCollection.nodes()[0]

  if (!methodsOption)
    return astCollection

  const methodsProperties = (methodsOption.value as j.ObjectExpression).properties as j.Property[]
  methodsProperties.forEach((property) => {
    if ((property as any).type === 'SpreadElement') {
      const argument = (property as unknown as j.SpreadElement).argument
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
            collector.vuexMap.actions.push(propertyName)
          else if (calleeName === 'mapMutations')
            collector.vuexMap.mutations.push(propertyName)

          collector.variables.push(propertyName)
        })
      }
      return
    }
    const propertyName = (property.key as j.Identifier).name
    const propertyValue = property.value as j.FunctionExpression
    if (collector.methods) {
      collector.setupFn.body.body.push(j.variableDeclaration('const', [
        j.variableDeclarator(
          j.identifier(propertyName),
          buildArrowFunctionExpression(propertyValue),
        ),
      ]))
    }
    else {
      collector.setupFn.body.body.push(buildFunctionDeclaration(
        propertyName,
        propertyValue,
      ))
    }
    (collector.returnStatement.argument as j.ObjectExpression).properties.push(
      j.property('init', j.identifier(propertyName), j.identifier(propertyName)),
    )
    collector.variables.push(propertyName)
  })

  methodsOptionCollection.remove()
  return astCollection
}
