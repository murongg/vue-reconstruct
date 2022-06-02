import type { ASTPath } from 'jscodeshift'
import j from 'jscodeshift'
import type { Collector } from '..'

export function setupHandler(astCollection: j.Collection, collector: Collector) {
  const { variables, valueWrappers, propVariables, isSfc } = collector

  const joinValue = (name: string, path: ASTPath) => {
    // Remove this
    let parentObject: j.Identifier | j.MemberExpression = j.identifier(name)
    // Value wrapper
    if (valueWrappers.includes(name))
      parentObject = j.memberExpression(parentObject, j.identifier('value'))
    // Props wrapper
    if (propVariables.includes(name))
      parentObject = j.memberExpression(j.identifier('props'), parentObject)

    path.replace(parentObject)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const removeThis = (path: ASTPath<j.MemberExpression>, i: number, paths: ASTPath<j.MemberExpression>[]) => {
    const name = (path.value.property as j.Identifier).name
    if (j.ThisExpression.check(path.value.object) && variables.includes(name))
      joinValue(name, path)
  }

  /**
     *
      if composition-api
      push:
      setup() {
        return {
          do someting....
        }
      }
     */
  const componentDefinition = astCollection.find(j.ExportDefaultDeclaration).nodes()[0]
  collector.setupFn.body.body.push(collector.returnStatement);
  (componentDefinition.declaration as j.ObjectExpression).properties.push(
    j.methodDefinition(
      'method',
      j.identifier('setup'),
      collector.setupFn,
    ) as unknown as j.ObjectProperty,
  )
  astCollection
    .find(j.MethodDefinition, {
      key: {
        name: 'setup',
      },
    })
    .find(j.MemberExpression)
    .forEach(removeThis)

  if (isSfc) {
    // if sfc
    // push defineProps
    // remove `export default` and `return`

    astCollection.find(j.ExportDefaultDeclaration)
      .remove()
      .insertBefore(collector.setupFn.body.body)

    astCollection.find(j.ReturnStatement)
      .remove()
  }

  // when variables are assigned
  astCollection.find(j.Identifier).filter(path => path.name === 'left').forEach((path) => {
    const name = path.value.name
    if (variables.includes(name))
      joinValue(name, path)
  })
}

