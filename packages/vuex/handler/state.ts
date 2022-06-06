import j from 'jscodeshift'
import { findProperty } from '@vue-reconstruct/shared'

export function stateHandler(astCollection: j.Collection) {
  const stateOptionCollection = findProperty(astCollection, 'state')
  const stateOption = stateOptionCollection.nodes()[0]
  if (!stateOption)
    return astCollection

  const stateValue = stateOption.value
  let statePath: j.ASTPath | undefined
  let stateName = ''
  let stateReturnBody: j.ObjectExpression | undefined
  let declareName = ''
  if (stateValue.type === 'Identifier') {
    stateName = stateOption.shorthand ? stateValue.name : (stateValue.loc as any)?.identifierName
    astCollection.find(j.VariableDeclaration)
      .filter(path => path.value.declarations.some(de => (de as any).id.name === stateName))
      .forEach((path) => {
        statePath = path
        const stateBody = path.value.declarations[0] as unknown as j.VariableDeclarator
        declareName = (path.value as j.VariableDeclaration).kind
        stateReturnBody = stateBody.init as j.ObjectExpression
      })
  }
  else if (stateValue.type === 'ObjectExpression') {
    if (stateValue) {
      stateName = (stateOption.key as j.Identifier).name
      stateReturnBody = stateValue
    }
  }

  if (stateReturnBody) {
    const arrowBody = j.arrowFunctionExpression([], stateReturnBody)
    arrowBody.expression = true
    if (stateValue.type === 'Identifier') {
      const state = j.variableDeclaration(declareName as any, [
        j.variableDeclarator(
          j.identifier(stateName),
          arrowBody,
        ),
      ])
      statePath?.replace(state)
    }
    else if (stateValue.type === 'ObjectExpression') {
      stateOption.value = arrowBody
    }
  }
}
