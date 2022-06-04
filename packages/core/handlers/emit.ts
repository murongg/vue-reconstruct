import { hasEmptyArrar } from '@vue-reconstruct/shared'
import j from 'jscodeshift'
import type { Collector } from '../types'

export function emitHandler(astCollection: j.Collection, collector: Collector): j.Collection {
  const emits: string[] = []
  // Remove this
  astCollection
    .find(j.MemberExpression)
    .filter((path) => {
      return (path.value.property as j.Identifier).name === '$emit'
    })
    .forEach((path) => {
      if (j.ThisExpression.check(path.value.object)) {
        const emitName = path.parent.value.arguments[0].value
        emits.push(emitName)
        // Remove this
        const parentObject: j.Identifier | j.MemberExpression = j.identifier('emit')
        path.replace(parentObject)
      }
    })
  const emitArguments = j.arrayExpression(emits.map(emit => j.stringLiteral(emit)))
  if (collector.isSfc) {
    /**
      const emits = defineEmits(['xxx', 'xxx'])
     */
    collector.setupFn.body.body.push(j.variableDeclaration('const', [
      j.variableDeclarator(
        j.identifier('emit'),
        j.callExpression(
          j.identifier('defineEmits'),
          [emitArguments],
        ),
      ),
    ]))
  }
  else {
    /**
      emits: ['xxx', 'xxx']
     */
    const exportBody = astCollection.find(j.ExportDefaultDeclaration).nodes()[0].declaration as j.ObjectExpression
    exportBody.properties.push(
      j.property('init', j.identifier('emits'), emitArguments),
    )
  }

  if (!hasEmptyArrar(emits))
    collector.setupContext.push('emit')

  return astCollection
}
