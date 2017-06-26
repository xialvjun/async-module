const path = require('path');
const fs = require('fs');
function read_file(filename, encoding='utf-8') {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, encoding, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}

const babel = require("babel-core");

const Koa = require('koa');

const app = new Koa();

app.use(async function serve(ctx, next) {
    const filename = path.resolve(__dirname, '../js', ctx.path);
    const content = await read_file(filename);
    const origin_code = `;(async function(){\n${content}\n})();\n`;
    const { ast, code, map } = babel.transform(origin_code, { presets: ['react', 'latest', 'stage-0'] });
    
});

modules = {
    [file]: {
        exports: {}
    }
}

// window.modules=Object.assign({},window.modules);
// function import(file) {
    
// }

(function() {
    const module = { exports: {} };
    const base = 'https://www.a.com/';
    window.__IMPORT_MODULES__[base+'index'] = module;
    const url = /^https?:\/\//;
    const import = window.__IMPORT__.bind(undefined, base);
    (async function() {
        
    })(module)
})()