require({
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