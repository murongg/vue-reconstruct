import j from 'jscodeshift'
import type { Collector, Imports } from '../types'

export function importHandler(astCollection: j.Collection, collector: Collector): j.Collection {
  function importInsert(key: string, importKeys: string[]) {
    if (!importKeys.length)
      return
    const keyIds = importKeys.map(key => j.importSpecifier(j.identifier(key)))
    const imports = j.importDeclaration(keyIds, j.literal(key))
    astCollection.find(j.ExportDefaultDeclaration).insertBefore(imports)
  }

  Object.keys(collector.newImports).forEach((key) => {
    importInsert(key, [...collector.newImports[key as Imports]])
  })
  return astCollection
}

