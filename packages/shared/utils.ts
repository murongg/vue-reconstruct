import j from 'jscodeshift'

export function hasComplexType(value: any) {
  return j.ObjectExpression.check(value)
    || j.ArrayExpression.check(value)
    || j.FunctionExpression.check(value)
    || j.ClassExpression.check(value)
}

export const hasEmptyArrar = (arr: any[]) => !arr.length
