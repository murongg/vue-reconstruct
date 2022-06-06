import j from 'jscodeshift'

export function findProperty(astCollection: j.Collection, propertyName: string) {
  return astCollection.find(j.Property, { key: { name: propertyName } }).filter(path => path.parent.parent.value.type === 'ExportDefaultDeclaration')
}
