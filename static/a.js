require({
  'http://localhost/a.js': async function(require, __filename) {
    // const b = await require('./b.js');
    // const c = await require('./c.js');
    // console.log(require);
    const [b, c] = await Promise.all([require('./b.js'), require('./c.js')]);
    b.b();
    c.c();
  },
});