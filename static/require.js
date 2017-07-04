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
      base = location.origin + '/index';
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
    return download(file).then(function() {
      // 有可能 require('./jquery.min.js') 这样运行了 download('./jquery') 但是不存在 __ASYNC_MODULES__['./jquery']
      return __ASYNC_MODULES__[file] && __ASYNC_MODULES__[file](require.bind(undefined, file), file);
    });
  };
})();