import j from 'jscodeshift'
import type { Collector } from '../types'

export function propsHandler(astCollection: j.Collection, collector: Collector): j.Collection {
  const propsOptionCollection = astCollection
    .find(j.Property, {
      key: {
        name: 'props',
      },
    }).filter(path => path.parent.parent.value.type === 'ExportDefaultDeclaration')

  const propsOption = propsOptionCollection.nodes()[0]
  if (propsOption) {
    const propsCollection = propsOptionCollection
      .find(j.ObjectExpression)
      .filter(path => path.parent.value.key.name === 'props').nodes()[0]
    const propsProperties = propsCollection.properties as j.ObjectProperty[]
    for (const property of propsProperties) {
      const node = property.key as j.Identifier
      // collections reactive variables
      collector.variables.push(node.name)
      // variables to be use `props` wrapper
      collector.propVariables.push(node.name)
    }
    if (collector.isSfc) {
      collector.setupFn.body.body.push(j.variableDeclaration('const', [
        j.variableDeclarator(
          j.identifier('props'),
          j.callExpression(
            j.identifier('defineProps'),
            [propsCollection],
          ),
        ),
      ]))
    }
  }
  return astCollection
}
