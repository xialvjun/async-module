(async function(exports, require, module) {
  const b = await require('./b.js');
  const c = await require('./c.js');
  console.log(b, c);
})();