import j from 'jscodeshift'
import { buildArrowFunctionExpression, findProperty } from '@vue-reconstruct/shared'
import type { Collector } from '../types'

export function computedHandler(astCollection: j.Collection, collector: Collector): j.Collection {
  const computedOptionCollection = findProperty(astCollection, 'computed')

  const computedOption = computedOptionCollection.nodes()[0]

  if (computedOption) {
    collector.newImports.vue.add('computed')
    if (!j.ObjectExpression.check(computedOption.value))
      throw new Error('No return statement found in computed option')

    computedOptionCollection.forEach((path) => {
      let args: any
      const properties = (path.value.value as j.ObjectExpression).properties as j.Property[]

      properties.forEach((property) => {
        if (j.FunctionExpression.check(property.value)) {
          args = [j.arrowFunctionExpression([], property.value.body)]
        }
        else if (j.ObjectExpression.check(property.value)) {
          const properties = property.value.properties as j.Property []
          const getFn = properties.find(p => (p.key as j.Identifier).name === 'get')
          const setFn = properties.find(p => (p.key as j.Identifier).name === 'set')
          /**
            computed({
              get: xxx,
              set: xxx
            })
           */
          args = [j.objectExpression([])]
          if (getFn)
            args[0].properties.push(j.property('init', j.identifier('get'), buildArrowFunctionExpression(getFn.value as j.FunctionExpression)))

          if (setFn)
            args[0].properties.push(j.property('init', j.identifier('set'), buildArrowFunctionExpression(setFn.value as j.FunctionExpression)))
        }

        const name = (property.key as j.Identifier).name
        collector.setupFn.body.body.push(
          j.variableDeclaration('const', [
            j.variableDeclarator(
              j.identifier(name),
              j.callExpression(
                j.identifier('computed'),
                args,
              ),
            ),
          ]),
        );

        (collector.returnStatement.argument as j.ObjectExpression).properties.push(
          j.property('init', j.identifier(name), j.identifier(name)),
        )
        collector.variables.push(name)
        collector.valueWrappers.push(name)
      })
    })
  }

  computedOptionCollection.remove()
  return astCollection
}
