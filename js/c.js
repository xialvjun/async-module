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



(function() {
  var __ASYNC_MODULES__ = {};

  function memoize(func, resolver) {
    if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
      throw new TypeError('Expected a function');
    }
    function memoized(...args) {
      var key = resolver ? resolver.apply(this, args) : args[0];
      var cache = memoized.cache;
      if (cache.has(key)) {
        return cache.get(key);
      }
      var result = func.apply(this, args);
      cache.set(key, result);
      return result;
    }
    memoized.cache = new Map;
    memoized.func = func;
    memoized.resolver = resolver;
    return memoized;
  }

  function retry(memoized, on_error) {
    if (typeof memoized != 'function' || (on_error != null && typeof on_error != 'function')) {
      throw new TypeError('Expected a function');
    }
    function retried(...args) {
      var self = this;
      var key = memoized.resolver ? memoized.resolver.apply(self, args) : args[0];
      // // 下面这种是：有缓存则获取并catch后再次尝试，这一步没有问题；但是没有则运行，失败后再次尝试运行，即初次会运行两次，这有问题
      // return memoized.apply(self, args).catch(function(err) {
      //   console.error(err);
      //   memoized.cache.delete(key);
      //   return memoized.apply(self, args);
      // });
      var p = memoized.cache.get(key);
      if (p) {
        return p.catch(function(err) {
          console.error(err);
          on_error && on_error.apply(self, args);
          memoized.cache.delete(key);
          return memoized.apply(self, args);
        });
      }
      return memoized.apply(self, args); 
    }
    return retried;
  }

  var download = retry(memoize(function(file) {
    var resolve, reject, promise = new Promise(function(res, rej) {
      resolve = res;
      reject = rej;
    });

    var script = document.createElement('script');
    script.addEventListener('load', resolve);
    script.addEventListener('error', reject);
    script.async = true;
    script.src = file;
    document.body.appendChild(script);
    return promise;
  }), function(file) {
    var scripts = document.querySelectorAll('script');
    for (var key in scripts) {
      if (scripts.hasOwnProperty(key)) {
        var script = scripts[key];
        if (script.src===file) {
          script.remove();
        }
      }
    }
  });

  var path = function(base, file) {
    if (!file) {
      file = base;
      base = location.origin;
    }
    if (!file.startsWith('http')) {
      // 加上个 ['..'].concat 是因为  http://www.xia.com/aaa/bbb/ccc.js 下的 ./ddd.js 路径应是 http://www.xia.com/aaa/bbb/ddd.js 而不是 http://www.xia.com/aaa/bbb/ccc.js/ddd.js
      var file_tokens = ['..'].concat(file.split('/').filter(function(n) { return n; }));
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
  };

  window.require = function require(base, file) {
    if (typeof base === 'object') {
      for (var key in base) {
        if (base.hasOwnProperty(key)) {
          __ASYNC_MODULES__[key] = retry(memoize(base[key], function() {
            // memoize 加上返回固定值的 resolver，等同于 once，只运行一次的方法
            return 'once';
          }));
        }
      }
      return;
    }
    
    file = path(base, file);
    if (__ASYNC_MODULES__[file]) {
      return __ASYNC_MODULES__[file](require.bind(undefined, file), file);
    }
    return download(file).then(function(script_load) {
      return __ASYNC_MODULES__[file](require.bind(undefined, file), file);
    });
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
  const module = window.__ASYNC_MODULES__[file] = window.__ASYNC_MODULES__[file] || { factory: undefined, value: undefined };
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

