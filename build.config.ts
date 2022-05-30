import { defineBuildConfig } from 'unbuild'
import fg from 'fast-glob'

export default defineBuildConfig({
  entries: [
    ...fg.sync('packages/*/index.ts')
  ],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
  },
})
