import j from 'jscodeshift'

export function exportHandler(astCollection: j.Collection) {
  astCollection.find(j.ExportDefaultDeclaration).forEach((path) => {
    path.value.declaration = j.callExpression(
      j.identifier('createStore'),
      [path.value.declaration as j.Identifier],
    )
  })
  const keyIds = [j.importSpecifier(j.identifier('createStore'))]
  const imports = j.importDeclaration(keyIds, j.literal('vuex'));
  // insert `import { createStore } from "vuex";`
  (astCollection.nodes()[0] as j.File).program.body.splice(0, 0, imports)
}
