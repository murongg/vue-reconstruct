import { hasEmptyArrar } from '@vue-reconstruct/shared'
import type { ASTPath } from 'jscodeshift'
import j from 'jscodeshift'
import type { Collector } from '..'

export function setupHandler(astCollection: j.Collection, collector: Collector) {
  const { variables, valueWrappers, propVariables, isSfc, setupContext, setupFn } = collector

  /**
    setup(props, { emit, slot, x, x })
   */
  if (!hasEmptyArrar(propVariables) && !isSfc)
    setupFn.params.push(j.identifier('props'))

  if (!hasEmptyArrar(setupContext) && !isSfc) {
    const contextPattern = setupContext.map((ctx) => {
      const property = j.property('init', j.identifier(ctx), j.identifier(ctx))
      property.shorthand = true
      return property
    })
    const objectPattern = j.objectPattern(contextPattern)
    setupFn.params[0] = j.identifier('props')
    setupFn.params[1] = objectPattern
  }

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
  setupFn.body.body.push(collector.returnStatement);
  (componentDefinition.declaration as j.ObjectExpression).properties.push(
    j.methodDefinition(
      'method',
      j.identifier('setup'),
      setupFn,
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
      .insertBefore(setupFn.body.body)

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

