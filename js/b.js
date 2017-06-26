// __dirname 在 http 中已经无用。。。 __filename 代表自己的路径，可以在自己这个模块初始化失败之后尝试再次初始化。。。无 IO 代码初始化失败那之后就一定失败，但是这里 require 是有 IO 代码
(async function(exports, require, module, __filename, __dirname) {
  try {
    const c = await require('./c.js');
    exports.b = 'bbbb';
    console.log(exports.b, c);
  } catch (error) {
    require(__filename);
  }
})();


(async function(require, __filename) {
  try {
    const c = await require('./c.js');
    const b = 'bbbb';
    console.log(exports.b, c);
    return { b };
  } catch (error) {
    await delay(10);
    return require(__filename);
  }
// })(function(relative_or_absolute) {
//   if (relative_or_absolute.startsWith('http')) {
//     return require(relative_or_absolute);
//   }
//   return require(path(ctx.path, relative_or_absolute))
// }, ctx.path);
})(require.bind(undefined, ctx.path), ctx.path)


window.__ASYNC_MODULES__ = {};
// function require(file) {
//   return window.__ASYNC_MODULES__[file] || fetch(file).then(res => res.text()).then(code => eval(code))
// }

function path(base, file) {
  file = file.split('/').filter(str => str)
  base = base.split('/').filter(str => str)
  const host = base.slice(0, 2).join('//')
  base = base.slice(2)
  
  file.forEach(function(f) {
    if (f==='.') {
      return;
    }
    if (f==='..') {
      if (base.length>0) {
        return base = base.slice(0, -1);
      }
      throw new Error('Cannot find this file!');
    }
    return base = base.concat(f)
  }, this);
  
  return host + '/' + base.join('/');
}

function require(base, file) {
  if (!file) {
    file = base;
    base = location.origin;
  }
  if (!file.startsWith('http')) {
    file = path(base, file);
  }
  // // 下面两行会多次下载代码
  // window.__ASYNC_MODULES__[file] = window.__ASYNC_MODULES__[file] || fetch(file).then(res => res.text()).then(code => eval(code));
  // return window.__ASYNC_MODULES__[file];
  // // 下面两行会多次运行工厂方法
  // window.__ASYNC_MODULES__[file] = window.__ASYNC_MODULES__[file] || fetch(file).then(res => res.text());
  // return window.__ASYNC_MODULES__[file].then(code => eval(code));
  // // 要求只下载一次代码，只成功运行一次工厂方法
  const module = window.__ASYNC_MODULES__[file] = window.__ASYNC_MODULES__[file] || { code: undefined, value: undefined };
  // 上面设置 value 为 undefined 而不是 code_promise.then(code => eval(code)) 是因为要保证一次 require 只**尝试**运行一次工厂方法
  
  // // 这段代码 OK
  // if (module.value) {
  //   // 工厂方法运行中或运行失败
  //   return module.value.catch(err => {
  //     console.error(err);
  //     module.value = module.code.then(code => eval(code));
  //     return module.value;
  //   });
  // }
  // if (module.code) {
  //   // 代码下载中或下载失败
  //   return module.code.catch(err => {
  //     console.error(err);
  //     module.code = fetch(file).then(res => res.text());
  //     return module.code.then(code => {
  //       module.value = module.code.then(code => eval(code));
  //       return module.value;
  //     });
  //   })
  // }
  // module.code = fetch(file).then(res => res.text());
  // return module.code.then(code => {
  //   module.value = module.code.then(code => eval(code));
  //   return module.value;
  // });

  // // 这段代码是上面的代码的重构... 不过，仅仅是从 24 行代码缩减为 21 行代码，感觉好无用
  function get_value() {
    module.value = module.code.then(code => eval(code));
    return module.value;
  }
  function get_code_value() {
    module.code = fetch(file).then(res => res.text());
    return module.code.then(code => get_value());
  }
  if (module.value) {
    return module.value.catch(err => {
      console.error(err);
      return get_value();
    });
  }
  if (module.code) {
    return module.code.catch(err => {
      console.error(err);
      return get_code_value();
    });
  }
  return get_code_value();
}

