require({
  'http://localhost/a.js': async function(require, __filename) {
    // const b = await require('./b.js');
    // const c = await require('./c.js');
    // console.log(require);
    const [b, c] = await Promise.all([require('./b.js'), require('./c.js')]);
    b.b();
    c.c();
  },
  'http://localhost/b.js': async function(require, __filename) {
    const c = await require('./c.js');
    c.c();
    return {
      b: function() {
        console.log('b');
        c.c();
      }
    }
  },
  'http://localhost/c.js': async function(require, __filename) {
    // const c = await require('./c.js');
    // c.c();
    return {
      c: function() {
        console.log('c');
        // c.c();
      }
    }
  },
});