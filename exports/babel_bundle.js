'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

require({
  'http://localhost/a.js': function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(require, __filename) {
      var _ref2, _ref3, b, c;

      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return Promise.all([require('./b.js'), require('./c.js')]);

            case 2:
              _ref2 = _context.sent;
              _ref3 = _slicedToArray(_ref2, 2);
              b = _ref3[0];
              c = _ref3[1];

              b.b();
              c.c();

            case 8:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function httpLocalhostAJs(_x, _x2) {
      return _ref.apply(this, arguments);
    }

    return httpLocalhostAJs;
  }(),
  'http://localhost/b.js': function () {
    var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(require, __filename) {
      var c;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return require('./c.js');

            case 2:
              c = _context2.sent;

              c.c();
              return _context2.abrupt('return', {
                b: function b() {
                  console.log('b');
                  c.c();
                }
              });

            case 5:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    function httpLocalhostBJs(_x3, _x4) {
      return _ref4.apply(this, arguments);
    }

    return httpLocalhostBJs;
  }(),
  'http://localhost/c.js': function () {
    var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(require, __filename) {
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              return _context3.abrupt('return', {
                c: function c() {
                  console.log('c');
                  // c.c();
                },
                d: function d() {
                  console.log('d');
                }
              });

            case 1:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    function httpLocalhostCJs(_x5, _x6) {
      return _ref5.apply(this, arguments);
    }

    return httpLocalhostCJs;
  }()
});