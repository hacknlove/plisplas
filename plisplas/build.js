#!/usr/bin/env node
require('./build/index')().then(() => {
    const child_process = require('child_process');
    const { join } = require('path');
    const fs = require('fs');
    
    child_process.execSync('tsc', {stdio:[0,1,2]});
    child_process.execSync('tsc-alias', {stdio:[0,1,2]});
    
    const tsconfig = require(join(process.cwd(), './tsconfig.json'));
    
    try {
        fs.copyFileSync(join(process.cwd(), 'plisplas/schema.graphql'), join(process.cwd(), tsconfig.compilerOptions?.outDir ?? 'dist', 'plisplas', 'schema.graphql'));
    } catch (e) {}
});
