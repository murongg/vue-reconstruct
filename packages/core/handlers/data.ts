import { findProperty } from '@vue-reconstruct/shared'
import j from 'jscodeshift'
import type { Collector } from '../types'
export function dataHandler(astCollection: j.Collection, collector: Collector): j.Collection {
  const dataOptionCollection = findProperty(astCollection, 'data')
  const dataOption = dataOptionCollection.nodes()[0]
  let objectProperties: j.ObjectProperty[] = []
  if (dataOption.value.type === 'FunctionExpression') {
    const returnStatement = dataOptionCollection
      .find(j.ReturnStatement, {
        argument: {
          type: 'ObjectExpression',
        },
      })
      .filter(path => path.parent.parent.parent.value.key.name === 'data').nodes()[0]

    if (!j.ReturnStatement.check(returnStatement))
      throw new Error('No return statement found in data option')

    /**
     * Except for ReturnStatement
      data() {
        const host = xxx;
        function a() {};
        ...
      }
     */
    dataOptionCollection.find(j.FunctionExpression).forEach((path) => {
      path.value.body.body.forEach((body) => {
        if (body.type !== 'ReturnStatement')
          collector.setupFn.body.body.push(body)
      })
    })
    /*
      data () {
        return 'not return an object'
      }
    */
    if (!j.ObjectExpression.check(returnStatement.argument))
      throw new Error('Return statement not a ObjectExpression')

    objectProperties = returnStatement.argument?.properties as j.ObjectProperty[]
  }
  else if (dataOption.value.type === 'ObjectExpression') {
    /*
      data: {}
    */
    const dataObjectCollection = dataOptionCollection
      .find(j.ObjectExpression)
      .filter(path => path.parent.value.key.name === 'data').nodes()[0]
    objectProperties = dataObjectCollection.properties as j.ObjectProperty[]
  }
  else {
    return astCollection
  }

  const dataProperties: { name: string; value: j.Property['value']; state: boolean }[]
    = objectProperties.map(node => ({
      name: (node.key as j.Identifier).name,
      value: node.value,
      // state: hasComplexType(node.value),
      // default ref
      state: false,
    }))

  if (dataProperties.length) {
    if (dataProperties.some(p => !p.state))
      collector.newImports.vue.push('ref')

    if (dataProperties.some(p => p.state))
      collector.newImports.vue.push('reactive')

    for (const property of dataProperties) {
      collector.setupFn.body.body.push(
        j.variableDeclaration('const', [
          j.variableDeclarator(
            j.identifier(property.name),
            j.callExpression(
              j.identifier(property.state ? 'reactive' : 'ref'),
              [property.value as j.Identifier],
            ),
          ),
        ]),
      );
      (collector.returnStatement.argument as j.ObjectExpression).properties.push(
        j.property('init', j.identifier(property.name), j.identifier(property.name)),
      )
      collector.variables.push(property.name)
      if (!property.state)
        collector.valueWrappers.push(property.name)
    }
  }

  dataOptionCollection.remove()
  return astCollection
}
