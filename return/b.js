require({
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
});