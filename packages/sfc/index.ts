import { createVueConvert } from '@vue-reconstruct/core'
export function convertScript(code: string, methods?: boolean) {
  return createVueConvert(code, !!methods, true).toSource()
}
