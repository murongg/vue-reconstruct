import j from 'jscodeshift'
import type { Collector } from '../types'

export function refsHandler(astCollection: j.Collection, collector: Collector): j.Collection {
  astCollection
    .find(j.MemberExpression)
    .filter((path) => {
      return (path.value.property as j.Identifier).name === '$refs'
    })
    .forEach((path) => {
      if (j.ThisExpression.check(path.value.object)) {
        const property = path.parent.value.property
        // Remove this
        const parentObject: j.Identifier | j.MemberExpression = j.memberExpression(property, j.identifier('value'))
        path.parent.parent.replace(parentObject)

        collector.setupFn.body.body.push(
          j.variableDeclaration('const', [
            j.variableDeclarator(
              j.identifier(property.name),
              j.callExpression(
                j.identifier('ref'),
                [j.identifier('null')],
              ),
            ),
          ]),
        );
        (collector.returnStatement.argument as j.ObjectExpression).properties.push(
          j.property('init', j.identifier(property.name), j.identifier(property.name)),
        )
      }
    })
  return astCollection
}
