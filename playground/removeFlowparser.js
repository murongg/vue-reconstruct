const fs = require('fs')
const path = require('path')

fs.readdirSync('dist/assets').forEach((file) => {
  const pathname = path.join('dist/assets', file)
  if (pathname.endsWith('.js')) {
    fs.readFile(pathname, (err, data) => {
      if (err)
        return console.error(err)

      const fileContent = data.toString()
        .replace('import"flow-parser";', '')
        .replace(/import .* from"flow-parser";/, (val) => {
          const name = val.match(/(?<=import).*?(?=from"flow-parser";)/)[0]
          return `const${name}={};`
        })
      fs.writeFile(pathname, fileContent, (err) => {
        if (err)
          throw err

        console.log('build success')
      })
    })
  }
})
