import j from 'jscodeshift'
import { buildArrowFunctionExpression, buildFunctionDeclaration, findProperty } from '@vue-reconstruct/shared'
import type { Collector } from '../types'

export function filtersHandler(astCollection: j.Collection, collector: Collector): j.Collection {
  const filtersOptionCollection = findProperty(astCollection, 'filters')
  const filtersOption = filtersOptionCollection.nodes()[0]

  if (!filtersOption)
    return astCollection

  const filtersProperties = (filtersOption.value as j.ObjectExpression).properties as j.Property[]
  filtersProperties.forEach((property) => {
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

  filtersOptionCollection.remove()
  return astCollection
}
