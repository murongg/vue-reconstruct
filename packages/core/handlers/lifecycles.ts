import j from 'jscodeshift'

export const SETUP_LIFECYCLES = ['beforeCreate', 'created']

export const LIFECYCLE_HOOKS = {
  beforeCreate: 'setup',
  created: 'setup',
  beforeMount: 'onBeforeMount',
  mounted: 'onMounted',
  beforeUpdate: 'onBeforeUpdate',
  updated: 'onUpdated',
  errorCaptured: 'onErrorCaptured',
  renderTracked: 'onRenderTracked',
  renderTriggered: 'onRenderTriggered',
  beforeDestroy: 'onBeforeUnmount',
  destroyed: 'onUnmounted',
  activated: 'onActivated',
  deactivated: 'onDeactivated',
}

export const ROUTER_HOOKS = [
  'beforeRouteEnter',
  'beforeRouteUpdate',
  'beforeRouteLeave',
]

export function lifecyclesHandler(
  astCollection: j.Collection,
  setupFn: j.FunctionExpression,
  hookList: string[] | Record<string, string>,
  importList: Set<string>,
): j.Collection {
  if (Array.isArray(hookList)) {
    astCollection
      .find(j.ObjectMethod)
      .filter(path => (hookList.includes((path.value.key as j.Identifier).name)))
      .forEach((path) => {
        const name = (path.node.key as j.Identifier).name
        const hookName = `on${name.charAt(0).toUpperCase() + name.slice(1)}`
        importList.add(hookName)
        setupFn.body.body.push(j.expressionStatement(
          j.callExpression(
            j.identifier(hookName),
            [j.arrowFunctionExpression(path.node.params, path.node.body)],
          ),
        ))
      }).remove()
  }
  else {
    astCollection.find(j.Property).filter((path) => {
      return Object.keys(hookList).includes((path.value.key as j.Identifier).name)
    }).forEach((path) => {
      const name = (path.node.key as j.Identifier).name
      const nodeValue = path.node.value as j.FunctionExpression
      if (SETUP_LIFECYCLES.includes(name)) {
        nodeValue.body.body.forEach((b) => {
          setupFn.body.body.push(b)
        })
        setupFn.async = nodeValue.async
      }
      else {
        const hookName = hookList[name]
        importList.add(hookName)
        const arrowFunction = j.arrowFunctionExpression([], nodeValue.body)
        arrowFunction.async = nodeValue.async
        setupFn.body.body.push(j.expressionStatement(
          j.callExpression(
            j.identifier(hookName),
            [arrowFunction],
          ),
        ))
      }
    }).remove()
  }

  return astCollection
}
