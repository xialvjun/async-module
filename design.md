
export 同步导出很容易，异步导出则要困难很多。。。但是正好概念很好，一个模块就是一个单次运行的 async 函数。。。我们可以让函数返回值为模块导出值。。。不过循环依赖有点问题。。。a b 互相依赖，entry为a。于是先运行a，运行过程中运行b，b中尝试运行a，但是a尚未运行结束，于是b得到undefined。。。到此为止都没有问题，但是我们希望b在回调中能得到完整的a。。。可是已经得到的是一个undefined引用。。。

于是我们可以使用exports.a_value=123。。。于是b一开始得到的a模块是exports即{}，里面没有a_value，之后回调中该对像已被修改，内部有a_value。。。

但是，如果a模块不想使用exports.a_value，而是用module.exports=123呢。。。这就出问题了。。。

不过esmodule里也仅仅是弄个exports.default来糊弄，倒也无所谓了。。。

还有个问题，esmodule最大的优势是可以静态分析，原本如果是async函数返回值，那就可以采取静态分析，但是如果是把module作为参数传给async函数，让它修改，则难以静态分析（其实也可以，只要要求只使用exports.a_value的形式，并且只在函数最外层使用，函数没有return语句）。。。只要满足这三个要求，则与esmodule的导出没有区别了


不过暂时不想着静态分析，因为babel认为那是语法错误，暂时没能力去改。。。可以思考下return导出和exports导出的区别。。。return可以是任何类型，exports只能是对象。return不能提前import，因为js是传递引用，提前import得到undefined，之后也不能修改，毫无意义；exports可以提前import，得到对象，虽然对象内部没有需要的值，但是在之后的函数内部，就可以得到完整的模块值。。。但是这并非return模式的硬伤。。。因为此时import仅仅是一个普通异步方法，本就不该在尚不需要模块值时就import，应该在之后的函数内部，开始需要模块值时才import，也就是说提前import并没有多大优势。另外，两者在实现上有细微差别，export在首次import时就立即生成空对象，之后的import只要拿这个对象的引用就好；但是return，则要设置模块的import状态，，，，不对不对不对，return在import时立即返回一个promise，之后就耐心等promise resolve了，但是循环依赖将会造成死锁。。。

然后，一个模块是一个async函数，而且里面有io操作import，所以可能出错，于是给用户递归调用模块工厂方法的可能。。。用户可以在模块最外层包裹trycatch，catch里self()或者await import(self)。。。推荐用import(self)，因为import方法保证了模块只成功运行一次，而且self作为路径可能比作为函数更有用。。。。这也是使用eval的原因，如果不使用eval，就无法手动掌握模块工厂方法调用
不过eval会导致代码运行慢，google clojure compiler也无法分析，因为代码打包是把每个模块作为一个字符串存起来了的。。。所以考虑不用eval，但是不用eval，又想主动控制工厂方法运行，则服务端返回的是一个函数，而不是函数调用，由客户端提供参数。。。可以把函数名字用http地址的base64生成。。。另外为了避免window对象上有太多全局方法，可以让服务端返回 window.__ASYNC_MODULES__[BASE64_URL]=async function(require, __filename){xxx} 这种代码
，甚至还可以类似webpack.require.ensure的方法产生的分离包 webpackJsonp([1], {1454:(function(module, exports, webpackrequire){use strict; xxx})});
