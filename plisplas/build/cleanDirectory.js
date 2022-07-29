const { join } = require('path')
const { rm, mkdir } = require('fs/promises')

const tsconfig = require(join(process.cwd(), './tsconfig.json'));

async function cleanDirectory (name) {
  const directoryPath = join(process.cwd(), name)

  await rm(directoryPath, { recursive: true })
    .catch(err => {
      if (err.code === 'ENOENT') {
        return
      }
      console.error(err)
      process.exit(1)
    })


  await rm(join(process.cwd(), tsconfig.compilerOptions?.outDir ?? 'dist'), { recursive: true })
  .catch(err => {
    if (err.code === 'ENOENT') {
      return
    }
    console.error(err)
    process.exit(1)
  })
  
  mkdir(directoryPath)
}

module.exports = cleanDirectory