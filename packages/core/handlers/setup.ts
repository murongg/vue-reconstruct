import { hasEmptyArrar } from '@vue-reconstruct/shared'
import type { ASTPath } from 'jscodeshift'
import j from 'jscodeshift'
import type { Collector } from '..'

export function setupHandler(astCollection: j.Collection, collector: Collector) {
  const { variables, valueWrappers, propVariables, isSfc, setupContext, setupFn, vuexMap } = collector

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

    // store mapActions wrapper
    if (vuexMap.actions.includes(name)) {
      const pathCaller = j.callExpression(j.identifier('store.dispatch'), [j.stringLiteral(name), ...path.parentPath.value.arguments])
      path.parentPath.replace(pathCaller)
      return
    }

    // store mapActions wrapper
    if (vuexMap.mutations.includes(name)) {
      const pathCaller = j.callExpression(j.identifier('store.commit'), [j.stringLiteral(name), ...path.parentPath.value.arguments])
      path.parentPath.replace(pathCaller)
      return
    }

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
  const componentDefinition = astCollection.find(j.ExportDefaultDeclaration).nodes()[0];
  // set return object `shorthand`
  (collector.returnStatement.argument as j.ObjectExpression).properties.forEach((prop) => {
    (prop as j.Property).shorthand = true
  })
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

    const returnStatementIndex = setupFn.body.body.findIndex(path => path.type === 'ReturnStatement')
    if (returnStatementIndex !== -1)
      setupFn.body.body.splice(returnStatementIndex, 1)

    astCollection.find(j.ExportDefaultDeclaration)
      .remove()
      .insertBefore(setupFn.body.body)
  }

  // when variables are assigned
  astCollection.find(j.Identifier).filter(path => path.name === 'left').forEach((path) => {
    const name = path.value.name
    if (variables.includes(name))
      joinValue(name, path)
  })
}

