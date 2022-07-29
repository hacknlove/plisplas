const cleanDirectory = require('./cleanDirectory');
const buildResolvers = require('./buildResolvers')
const buildRoutes = require('./buildRoutes')
const buildTypedefs = require('./buildTypedefs')
const { copyFile } = require('fs/promises'); 
const buildExports = require('./buildExports');
module.exports = async function main () {

  await cleanDirectory('./plisplas')

  const [hasTypedefs, hasRoutes] = await Promise.all([
    buildTypedefs(),
    buildRoutes(),
    buildExports(),
    buildResolvers(),
  ])

  if (!hasTypedefs && !hasRoutes) {
    await copyFile(__dirname + '/../start/startNothing.js', process.cwd() + '/plisplas/start.js')
  } else {
    await Promise.all([
      copyFile(__dirname + '/../start/start.js', process.cwd() + '/plisplas/start.js'),
      copyFile(__dirname + '/../start/getConfig.js', process.cwd() + '/plisplas/getConfig.js'),
      copyFile(__dirname + '/../start/useRoutes.js', process.cwd() + '/plisplas/useRoutes.js'),
    ])
  }
}
