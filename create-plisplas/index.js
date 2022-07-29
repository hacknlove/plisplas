#!/usr/bin/env node
const fs = require('fs')
const { join } = require('path')

const child_process = require('child_process');

const name = process.argv[2]

if (!name) {
    console.log('Usage: npm init plisplas <name>')
    process.exit(1)
}

if (!fs.existsSync(name)) {
    fs.mkdirSync(name);
} else if (!fs.lstatSync(name).isDirectory()) {
    console.error(name, 'exists and it is not a directory')
    process.exit(1)
} else if (fs.lstatSync(join(name, 'package.json')).isFile()) {
    console.error(name, 'exists and it is a package.json')
    process.exit(1)
}

process.chdir(name)

fs.writeFileSync(`package.json`, `
{
  "name": "${name}",
  "version": "1.0.0",
  "scripts": {
    "dev": "nodemon --exec \\\"plisplas-build && npm run start\\\"",
    "build": "plisplas-build",
    "start": "node dist/plisplas/start.js",
    "lint": "eslint --fix "
  },
  "devDependencies": {
    "plisplas": "^1.0.1"
  }
}
`)

fs.copyFileSync(join(__dirname, `plisplas.config.js`), './plisplas.config.js')
fs.copyFileSync(join(__dirname, `.eslintrc.json`), './.eslintrc.json')
fs.copyFileSync(join(__dirname, `nodemon.json`), './nodemon.json')
fs.copyFileSync(join(__dirname, `tsconfig.json`), './tsconfig.json')

fs.mkdirSync('domains')

fs.copyFileSync(join(__dirname, `liveness.get.js`), './domains/liveness.get.js')

child_process.execSync('npm i', {stdio:[0,1,2]});