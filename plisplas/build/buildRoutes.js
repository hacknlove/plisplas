const { appendFile } = require('fs/promises')

const glob = require('util').promisify(require('glob'))

const parseRegex =/domains\/(.*\/_root_\/)?((?<route>.*)\/)?(?<filename>.*)\.(?<type>.*?)\.m?[tj]s$/

function getRoute (route, filename) {
  return filename === 'index'
    ? route
    : route
    ? `${route}\/${filename}`
    : filename
}

const bracketRouteRegexp = /\/\[[a-z_]+\]/gi
function toExpressRoute (bracketRoute) {
  return `/:${bracketRoute.substring(2, bracketRoute.length - 1)}`
}

const routesFileName = './plisplas/routes.js'

module.exports = async function buildResolvers () {
  const files = await glob('./domains/**/*.{get,post,delete,put,patch,all}.{js,ts,mjs,mts}')
  if (files.length === 0) {
    return false
  }
  const routes = []

  files.sort((a, b) => {
    const lastA = a.replace(/\/\[/g, '/￿'); // unicode ffff last character
    const lastB = b.replace(/\/\[/g, '/￿');
    return lastA < lastB ? -1 : 1;
  });

  for (const path of files) {
    const parse = path.match(parseRegex)

    if (!parse) {
      console.error('Unexpected file:', path)
      process.exit(1)
    }

    const { route = '', filename, type } = parse.groups
    const importName = `${route.replace(/\//g, '·')}_${filename}_${type}`

    routes.push({
      route: getRoute(route, filename).replace(bracketRouteRegexp, toExpressRoute),
      type: type.toUpperCase(),
      importName,
    })

    await appendFile(routesFileName, `import ${importName} from '.${path}';\n`);
  }

  await appendFile(routesFileName, `\nexport default [\n`);

  for (const route of routes) {   
    await appendFile(routesFileName, 
`\t{
\t\troute: "/${route.route}",
\t\ttype: "${route.type}",
\t\tcontroller: ${route.importName},
\t},
`)
  }

  await appendFile(routesFileName, `]\n`)
  return true
}