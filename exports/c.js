require({
  'http://localhost/c.js': async function(exports, require, __filename) {
    // const c = await require('./c.js');
    // c.c();
    exports.c = function() {
      console.log('c');
      // c.c();
    }
  },
});