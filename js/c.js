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



(function(global) {
  var __ASYNC_MODULES__ = {};

  function download(file) {
    var resolve, reject, promise = new Promise(function(res, rej) {
      resolve = res;
      reject = rej;
    });
    var script = document.createElement('script');
    script.addEventListener('load', resolve);
    script.addEventListener('error', reject);
    script.src = file;
    document.body.appendChild(script);
    return promise;
  }

  function path(base, file) {
    if (!file) {
      file = base;
      base = location.origin;
    }
    if (!file.startsWith('http')) {
      var file_tokens = file.split('/').filter(function(n) { return n; });
      var base_tokens = base.split('/').filter(function(n) { return n; });
      var host = base_tokens.slice(0, 2).join('//');
      base_tokens = base_tokens.slice(2);
      file_tokens.forEach(function(f) {
        if (f==='..') {
          if (base_tokens.length>0) {
            return base_tokens = base_tokens.slice(0, -1);
          }
          throw new Error('Cannot find file: ' + file + ' on base ' + base);
        }
        if (f==='.') {
          return;
        }
        return base_tokens = base_tokens.concat(f);
      });
      file = host + '/' + base_tokens.join('/');
    }
    return file;
  }

  window.require = function require(base, file) {
    if (typeof base === 'object') {
      return Object.assign(__ASYNC_MODULES__, base);
    }
    
    file = path(base, file);

  };
})();

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

