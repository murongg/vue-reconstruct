import j from 'jscodeshift'
import type { Collector } from '../types'

export function importHandler(astCollection: j.Collection, collector: Collector): j.Collection {
  function importInsert(key: string, importKeys: string[]) {
    if (!importKeys.length)
      return

    const keyIds = importKeys.map(key => j.importSpecifier(j.identifier(key)))
    const imports = j.importDeclaration(keyIds, j.literal(key))
    astCollection.find(j.ExportDefaultDeclaration).insertBefore(imports)
  }

  importInsert('vue', [...new Set(collector.newImports.vue)])
  importInsert('vue-router', [...new Set(collector.newImports['vue-router'])])

  return astCollection
}

