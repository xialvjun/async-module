require({
  'http://localhost/b.js': async function(exports, require, __filename) {
    var c;
    exports.b = function() {
      console.log('b');
      c.c();
    }
    c = await require('./c.js');
    c.c();
  },
});