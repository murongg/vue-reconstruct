import j from 'jscodeshift'
import { exportHandler } from './handler/export'
import { stateHandler } from './handler/state'

export function convertScript(code: string) {
  const astCollection = j(code)
  stateHandler(astCollection)
  exportHandler(astCollection)
  return astCollection.toSource()
}
