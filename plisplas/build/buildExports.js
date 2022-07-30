const { appendFile, writeFile } = require('fs/promises')
const glob = require('util').promisify(require('glob'))
const parseRegex =/domains\/(.*\/_root_\/)?((?<route>.*)\/)?(?<filename>.*)\.export\.m?[tj]s$/

const exportsFileName = './plisplas/exports.js'

function getName (route, filename) {
    return filename === 'index'
    ? route.replace(/^.*([^/]*)$/g, '$1')
    : filename
}

module.exports = async function buildResolvers () {
    const files = await glob('./domains/**/*.export.{js,ts,mjs,mts}')
    if (files.length === 0) {
        return false
    }
    
    const all = {}

    const exports = {}
    
    for (const path of files) {
        const parse = path.match(parseRegex)
        
        if (!parse) {
            console.error('Unexpected file:', path)
            process.exit(1)
        }
        
        const { route = '', filename } = parse.groups
        const importName = `${route.replace(/\//g, '#')}_${filename}`
        const name =  getName(route, filename)

        if (filename === 'index') {
            exports[`./${route}`] = `./dist/domains/${route}/index.export.js`
        } else {
            exports[`./${route}/${filename}`] = `./dist/domains/${route}/${filename}.export.js`
        }

        
        let current = all
        if (route) {
            for (const part of route.split('/')) {
                current = current[part] = current[part] ?? {}
            }
        }
        current[name] = current[name] ?? {}
        current[name].__importName = importName
        
        
        await appendFile(exportsFileName, `import ${importName} from '.${path}';\n`);
    }
    
    await appendFile(exportsFileName, `\nconst all = {}\n`);
    
    await expand(all, 'all')
    
    await appendFile(exportsFileName, `export default all\n`);
    const package = require(`${process.cwd()}/package.json`)
    package.exports = exports
    exports['.'] = './dist/plisplas/exports.js'
    await writeFile(`${process.cwd()}/package.json`, JSON.stringify(package, null, 2))
    return true;
}

async function expand (obj, name) {
    for (const key in obj) {
        if (key === '__importName') {
            continue
        }
        await appendFile(exportsFileName, `${name}.${key} = ${obj[key].__importName ?? '{}'}\n`);
        await expand(obj[key], `${name}.${key}`)
    }
}