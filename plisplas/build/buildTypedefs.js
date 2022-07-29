const { readFile, appendFile } = require('fs/promises')

const glob = require('util').promisify(require('glob'))

module.exports = async function buildTypeDefs () {
  const files = await glob('./domains/**/*.graphql')
  if (files.length === 0) {
    return false
  }

  for (const path of files) {
    const content = await readFile(path, 'utf8')
    await appendFile('./plisplas/schema.graphql', `${content}\n`)
  }

  return true;
}