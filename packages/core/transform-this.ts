import j, { ASTPath } from 'jscodeshift'

export function transformThis(astCollection: j.Collection, variables: string[], valueWrappers: string[], isSfc?: boolean) {
  const removeThis = (path: ASTPath<j.MemberExpression>, i: number, paths: ASTPath<j.MemberExpression>[]) => {
    const property = path.value.property as j.Identifier
    if (j.ThisExpression.check(path.value.object)
      && variables.includes(property.name)) {
      // Remove this
      let parentObject: j.Identifier | j.MemberExpression = j.identifier(property.name)
      // Value wrapper
      if (valueWrappers.includes(property.name))
        parentObject = j.memberExpression(parentObject, j.identifier('value'))

      path.replace(parentObject)
    }
  }
  if (isSfc) {
    astCollection
      .find(j.MemberExpression)
      .forEach(removeThis)
  } else {
    astCollection
      .find(j.MethodDefinition, {
        key: {
          name: 'setup',
        },
      })
      .find(j.MemberExpression)
      .forEach(removeThis)
  }

  astCollection.find(j.Identifier).filter(path => path.name === 'left').forEach((path) => {
    const name = path.value.name
    if (variables.includes(name)) {
      // Remove this
      let parentObject: j.Identifier | j.MemberExpression = j.identifier(name)
      // Value wrapper
      if (valueWrappers.includes(name))
        parentObject = j.memberExpression(parentObject, j.identifier('value'))
      path.replace(parentObject)
    }
  })
}