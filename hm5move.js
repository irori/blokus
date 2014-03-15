// Note: For maximum-speed code, see "Optimizing Code" on the Emscripten wiki, https://github.com/kripken/emscripten/wiki/Optimizing-Code
// Note: Some Emscripten settings may limit the speed of the generated code.
// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');
// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}
// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  Module['print'] = function print(x) {
    process['stdout'].write(x + '\n');
  };
  Module['printErr'] = function printErr(x) {
    process['stderr'].write(x + '\n');
  };
  var nodeFS = require('fs');
  var nodePath = require('path');
  Module['read'] = function read(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };
  Module['readBinary'] = function readBinary(filename) { return Module['read'](filename, true) };
  Module['load'] = function load(f) {
    globalEval(read(f));
  };
  Module['arguments'] = process['argv'].slice(2);
  module['exports'] = Module;
}
else if (ENVIRONMENT_IS_SHELL) {
  Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm
  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function read() { throw 'no read() available (jsc?)' };
  }
  Module['readBinary'] = function readBinary(f) {
    return read(f, 'binary');
  };
  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }
  this['Module'] = Module;
  eval("if (typeof gc === 'function' && gc.toString().indexOf('[native code]') > 0) var gc = undefined"); // wipe out the SpiderMonkey shell 'gc' function, which can confuse closure (uses it as a minified name, and it is then initted to a non-falsey value unexpectedly)
}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };
  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }
  if (typeof console !== 'undefined') {
    Module['print'] = function print(x) {
      console.log(x);
    };
    Module['printErr'] = function printErr(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }
  if (ENVIRONMENT_IS_WEB) {
    this['Module'] = Module;
  } else {
    Module['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}
function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function load(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***
// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];
// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];
// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}
// === Auto-generated preamble library stuff ===
//========================================
// Runtime code shared with compiler
//========================================
var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      return '(((' +target + ')+' + (quantum-1) + ')&' + -quantum + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        } else {
          return 0;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (vararg) return 8;
    if (!vararg && (type == 'i64' || type == 'double')) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          if (Types.types[field]) {
            alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
          } else {
            alignSize = type.alignSize || QUANTUM_SIZE;
          }
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else if (field[0] === '<') {
        // vector type
        size = alignSize = Types.types[field].flatSize; // fully aligned
      } else if (field[0] === 'i') {
        // illegal integer field, that could not be legalized because it is an internal structure field
        // it is ok to have such fields, if we just use them as markers of field size and nothing more complex
        size = alignSize = parseInt(field.substr(1))/8;
        assert(size % 1 === 0, 'cannot handle non-byte-size field ' + field);
      } else {
        assert(false, 'invalid type for calculateStructAlignment');
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    if (type.name_[0] === '[') {
      // arrays have 2 elements, so we get the proper difference. then we scale here. that way we avoid
      // allocating a potentially huge array for [999999 x i8] etc.
      type.flatSize = parseInt(type.name_.substr(1))*type.flatSize/2;
    }
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2*(1 + i);
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  getAsmConst: function (code, numArgs) {
    // code is a constant string on the heap, so we can cache these
    if (!Runtime.asmConstCache) Runtime.asmConstCache = {};
    var func = Runtime.asmConstCache[code];
    if (func) return func;
    var args = [];
    for (var i = 0; i < numArgs; i++) {
      args.push(String.fromCharCode(36) + i); // $0, $1 etc
    }
    return Runtime.asmConstCache[code] = eval('(function(' + args.join(',') + '){ ' + Pointer_stringify(code) + ' })'); // new Function does not allow upvars in node
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function dynCall_wrapper() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xFF;
      if (buffer.length == 0) {
        if ((code & 0x80) == 0x00) {        // 0xxxxxxx
          return String.fromCharCode(code);
        }
        buffer.push(code);
        if ((code & 0xE0) == 0xC0) {        // 110xxxxx
          needed = 1;
        } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
          needed = 2;
        } else {                            // 11110xxx
          needed = 3;
        }
        return '';
      }
      if (needed) {
        buffer.push(code);
        needed--;
        if (needed > 0) return '';
      }
      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var c4 = buffer[3];
      var ret;
      if (buffer.length == 2) {
        ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
      } else if (buffer.length == 3) {
        ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
      } else {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                        ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
        ret = String.fromCharCode(
          Math.floor((codePoint - 0x10000) / 0x400) + 0xD800,
          (codePoint - 0x10000) % 0x400 + 0xDC00);
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function processJSString(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+7)&-8); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = (((STATICTOP)+7)&-8); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = (((DYNAMICTOP)+7)&-8); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+((low>>>0)))+((+((high>>>0)))*(+4294967296))) : ((+((low>>>0)))+((+((high|0)))*(+4294967296)))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}
//========================================
// Runtime essentials
//========================================
var __THREW__ = 0; // Used in checking for thrown exceptions.
var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;
var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}
var globalScope = this;
// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;
// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = Module['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}
// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      value = intArrayFromString(value);
      type = 'array';
    }
    if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}
// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;
// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math_abs(tempDouble))) >= (+1) ? (tempDouble > (+0) ? ((Math_min((+(Math_floor((tempDouble)/(+4294967296)))), (+4294967295)))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+4294967296))))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;
// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;
var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;
// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }
  var singleType = typeof types === 'string' ? types : null;
  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }
  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }
  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }
  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];
    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }
    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later
    setValue(ret+i, curr, type);
    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }
  return ret;
}
Module['allocate'] = allocate;
function Pointer_stringify(ptr, /* optional */ length) {
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;
  var ret = '';
  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }
  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;
// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF16ToString(ptr) {
  var i = 0;
  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module['UTF16ToString'] = UTF16ToString;
// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16LE form. The copy will require at most (str.length*2+1)*2 bytes of space in the HEAP.
function stringToUTF16(str, outPtr) {
  for(var i = 0; i < str.length; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[(((outPtr)+(i*2))>>1)]=codeUnit;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[(((outPtr)+(str.length*2))>>1)]=0;
}
Module['stringToUTF16'] = stringToUTF16;
// Given a pointer 'ptr' to a null-terminated UTF32LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF32ToString(ptr) {
  var i = 0;
  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module['UTF32ToString'] = UTF32ToString;
// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32LE form. The copy will require at most (str.length+1)*4 bytes of space in the HEAP,
// but can use less, since str.length does not return the number of characters in the string, but the number of UTF-16 code units in the string.
function stringToUTF32(str, outPtr) {
  var iChar = 0;
  for(var iCodeUnit = 0; iCodeUnit < str.length; ++iCodeUnit) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    var codeUnit = str.charCodeAt(iCodeUnit); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++iCodeUnit);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[(((outPtr)+(iChar*4))>>2)]=codeUnit;
    ++iChar;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[(((outPtr)+(iChar*4))>>2)]=0;
}
Module['stringToUTF32'] = stringToUTF32;
function demangle(func) {
  try {
    if (typeof func === 'number') func = Pointer_stringify(func);
    if (func[0] !== '_') return func;
    if (func[1] !== '_') return func; // C function
    if (func[2] !== 'Z') return func;
    switch (func[3]) {
      case 'n': return 'operator new()';
      case 'd': return 'operator delete()';
    }
    var i = 3;
    // params, etc.
    var basicTypes = {
      'v': 'void',
      'b': 'bool',
      'c': 'char',
      's': 'short',
      'i': 'int',
      'l': 'long',
      'f': 'float',
      'd': 'double',
      'w': 'wchar_t',
      'a': 'signed char',
      'h': 'unsigned char',
      't': 'unsigned short',
      'j': 'unsigned int',
      'm': 'unsigned long',
      'x': 'long long',
      'y': 'unsigned long long',
      'z': '...'
    };
    function dump(x) {
      //return;
      if (x) Module.print(x);
      Module.print(func);
      var pre = '';
      for (var a = 0; a < i; a++) pre += ' ';
      Module.print (pre + '^');
    }
    var subs = [];
    function parseNested() {
      i++;
      if (func[i] === 'K') i++; // ignore const
      var parts = [];
      while (func[i] !== 'E') {
        if (func[i] === 'S') { // substitution
          i++;
          var next = func.indexOf('_', i);
          var num = func.substring(i, next) || 0;
          parts.push(subs[num] || '?');
          i = next+1;
          continue;
        }
        if (func[i] === 'C') { // constructor
          parts.push(parts[parts.length-1]);
          i += 2;
          continue;
        }
        var size = parseInt(func.substr(i));
        var pre = size.toString().length;
        if (!size || !pre) { i--; break; } // counter i++ below us
        var curr = func.substr(i + pre, size);
        parts.push(curr);
        subs.push(curr);
        i += pre + size;
      }
      i++; // skip E
      return parts;
    }
    var first = true;
    function parse(rawList, limit, allowVoid) { // main parser
      limit = limit || Infinity;
      var ret = '', list = [];
      function flushList() {
        return '(' + list.join(', ') + ')';
      }
      var name;
      if (func[i] === 'N') {
        // namespaced N-E
        name = parseNested().join('::');
        limit--;
        if (limit === 0) return rawList ? [name] : name;
      } else {
        // not namespaced
        if (func[i] === 'K' || (first && func[i] === 'L')) i++; // ignore const and first 'L'
        var size = parseInt(func.substr(i));
        if (size) {
          var pre = size.toString().length;
          name = func.substr(i + pre, size);
          i += pre + size;
        }
      }
      first = false;
      if (func[i] === 'I') {
        i++;
        var iList = parse(true);
        var iRet = parse(true, 1, true);
        ret += iRet[0] + ' ' + name + '<' + iList.join(', ') + '>';
      } else {
        ret = name;
      }
      paramLoop: while (i < func.length && limit-- > 0) {
        //dump('paramLoop');
        var c = func[i++];
        if (c in basicTypes) {
          list.push(basicTypes[c]);
        } else {
          switch (c) {
            case 'P': list.push(parse(true, 1, true)[0] + '*'); break; // pointer
            case 'R': list.push(parse(true, 1, true)[0] + '&'); break; // reference
            case 'L': { // literal
              i++; // skip basic type
              var end = func.indexOf('E', i);
              var size = end - i;
              list.push(func.substr(i, size));
              i += size + 2; // size + 'EE'
              break;
            }
            case 'A': { // array
              var size = parseInt(func.substr(i));
              i += size.toString().length;
              if (func[i] !== '_') throw '?';
              i++; // skip _
              list.push(parse(true, 1, true)[0] + ' [' + size + ']');
              break;
            }
            case 'E': break paramLoop;
            default: ret += '?' + c; break paramLoop;
          }
        }
      }
      if (!allowVoid && list.length === 1 && list[0] === 'void') list = []; // avoid (void)
      return rawList ? list : ret + flushList();
    }
    return parse();
  } catch(e) {
    return func;
  }
}
function demangleAll(text) {
  return text.replace(/__Z[\w\d_]+/g, function(x) { var y = demangle(x); return x === y ? x : (x + ' [' + y + ']') });
}
function stackTrace() {
  var stack = new Error().stack;
  return stack ? demangleAll(stack) : '(no stack trace available)'; // Stack trace is not available at least on IE10 and Safari 6.
}
// Memory management
var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return (x+4095)&-4096;
}
var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk
function enlargeMemory() {
  abort('Cannot enlarge memory arrays in asm.js. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', or (2) set Module.TOTAL_MEMORY before the program runs.');
}
var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;
// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'Cannot fallback to non-typed array case: Code is too specialized');
var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);
// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');
Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;
function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}
var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited
var runtimeInitialized = false;
function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}
function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}
function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}
function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;
function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;
function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;
function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;
function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;
// Tools
// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;
function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;
// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr;
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;
function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;
function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=str.charCodeAt(i);
  }
  if (!dontAddNull) HEAP8[(((buffer)+(str.length))|0)]=0;
}
Module['writeAsciiToMemory'] = writeAsciiToMemory;
function unSign(value, bits, ignore, sig) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore, sig) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}
if (!Math['imul']) Math['imul'] = function imul(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];
var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled
function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
Module['removeRunDependency'] = removeRunDependency;
Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data
var memoryInitializer = null;
// === Body ===
STATIC_BASE = 8;
STATICTOP = STATIC_BASE + 30320;
/* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } },{ func: function() { __GLOBAL__I_a() } },{ func: function() { __GLOBAL__I_a17() } },{ func: function() { __GLOBAL__I_a44() } },{ func: function() { __GLOBAL__I_a60() } });
var __ZTVN10__cxxabiv120__si_class_type_infoE;
__ZTVN10__cxxabiv120__si_class_type_infoE=allocate([0,0,0,0,16,10,0,0,14,0,0,0,32,0,0,0,20,0,0,0,34,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
var __ZTVN10__cxxabiv117__class_type_infoE;
__ZTVN10__cxxabiv117__class_type_infoE=allocate([0,0,0,0,32,10,0,0,14,0,0,0,10,0,0,0,20,0,0,0,34,0,0,0,2,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
var __ZN5ChildC1ER5Board4MovePNSt3__13mapI11BoardMapKeyNS3_4pairIiiEENS3_4lessIS5_EENS3_9allocatorINS6_IKS5_S7_EEEEEE;
var __ZN4MoveC1EPKc;
var __ZN5BoardC1Ev;
var __ZNSt12length_errorD1Ev;
/* memory initializer */ allocate([68,0,52,0,67,0,84,0,69,0,85,8,84,8,68,8,52,8,67,8,53,9,52,9,68,9,84,9,67,9,53,10,69,10,68,10,67,10,84,10,85,11,69,11,68,11,67,11,52,11,51,12,52,12,68,12,84,12,69,12,83,13,84,13,68,13,52,13,69,13,83,14,67,14,68,14,69,14,52,14,51,15,67,15,68,15,69,15,84,15,68,16,52,16,51,16,84,16,85,16,68,17,84,17,83,17,52,17,53,17,68,18,67,18,83,18,69,18,53,18,68,19,67,19,51,19,69,19,85,19,68,24,52,24,51,24,69,24,85,24,68,25,84,25,83,25,69,25,53,25,68,26,67,26,83,26,52,26,53,26,68,27,67,27,51,27,84,27,85,27,68,32,52,32,36,32,69,32,70,32,68,33,84,33,100,33,69,33,70,33,68,34,67,34,66,34,52,34,36,34,68,35,67,35,66,35,84,35,100,35,68,40,69,40,67,40,83,40,51,40,68,42,52,42,84,42,85,42,83,42,68,43,84,43,52,43,53,43,51,43,68,44,67,44,69,44,53,44,85,44,69,48,68,48,52,48,67,48,66,48,69,49,68,49,84,49,67,49,66,49,52,50,68,50,67,50,84,50,100,50,84,51,68,51,67,51,52,51,36,51,67,52,68,52,84,52,69,52,70,52,67,53,68,53,52,53,69,53,70,53,84,54,68,54,69,54,52,54,36,54,52,55,68,55,69,55,84,55,100,55,68,56,67,56,83,56,69,56,85,56,68,57,67,57,51,57,69,57,53,57,68,58,84,58,85,58,52,58,53,58,68,62,52,62,51,62,84,62,83,62,69,64,84,64,68,64,83,64,67,64,69,65,52,65,68,65,51,65,67,65,52,66,69,66,68,66,85,66,84,66,84,67,69,67,68,67,53,67,52,67,67,68,52,68,68,68,53,68,69,68,67,69,84,69,68,69,85,69,69,69,84,70,67,70,68,70,51,70,52,70,52,71,67,71,68,71,83,71,84,71,70,72,69,72,68,72,84,72,83,72,70,73,69,73,68,73,52,73,51,73,36,74,52,74,68,74,69,74,85,74,100,75,84,75,68,75,69,75,53,75,66,76,67,76,68,76,52,76,53,76,66,77,67,77,68,77,84,77,85,77,100,78,84,78,68,78,67,78,51,78,36,79,52,79,68,79,67,79,83,79,68,80,67,80,70,80,69,80,83,80,68,81,67,81,70,81,69,81,51,81,68,82,84,82,36,82,52,82,85,82,68,83,52,83,100,83,84,83,53,83,68,84,69,84,66,84,67,84,53,84,68,85,69,85,66,85,67,85,85,85,68,86,52,86,100,86,84,86,51,86,68,87,84,87,36,87,52,87,83,87,68,88,67,88,66,88,69,88,70,88,68,90,84,90,100,90,52,90,36,90,84,96,68,96,67,96,51,96,52,97,68,97,67,97,83,97,69,98,68,98,84,98,83,98,69,99,68,99,52,99,51,99,68,104,52,104,67,104,51,104,68,112,52,112,67,112,69,112,68,113,84,113,67,113,69,113,68,114,67,114,84,114,52,114,68,118,69,118,52,118,84,118,68,120,69,120,67,120,83,120,68,121,69,121,67,121,51,121,68,122,52,122,84,122,85,122,68,123,84,123,52,123,53,123,68,124,67,124,69,124,53,124,68,125,67,125,69,125,85,125,68,126,84,126,52,126,51,126,68,127,52,127,84,127,83,127,68,128,67,128,66,128,69,128,68,130,84,130,100,130,52,130,68,136,52,136,69,136,68,137,84,137,69,137,68,138,67,138,52,138,68,139,67,139,84,139,68,144,67,144,69,144,68,146,84,146,52,146,68,152,67,152,68,154,84,154,68,160,0,0,0,0,153,0,137,0,152,0,169,0,154,0,170,8,169,8,153,8,137,8,152,8,138,9,137,9,153,9,169,9,152,9,138,10,154,10,153,10,152,10,169,10,170,11,154,11,153,11,152,11,137,11,136,12,137,12,153,12,169,12,154,12,168,13,169,13,153,13,137,13,154,13,168,14,152,14,153,14,154,14,137,14,136,15,152,15,153,15,154,15,169,15,153,16,137,16,136,16,169,16,170,16,153,17,169,17,168,17,137,17,138,17,153,18,152,18,168,18,154,18,138,18,153,19,152,19,136,19,154,19,170,19,153,24,137,24,136,24,154,24,170,24,153,25,169,25,168,25,154,25,138,25,153,26,152,26,168,26,137,26,138,26,153,27,152,27,136,27,169,27,170,27,153,32,137,32,121,32,154,32,155,32,153,33,169,33,185,33,154,33,155,33,153,34,152,34,151,34,137,34,121,34,153,35,152,35,151,35,169,35,185,35,153,40,154,40,152,40,168,40,136,40,153,42,137,42,169,42,170,42,168,42,153,43,169,43,137,43,138,43,136,43,153,44,152,44,154,44,138,44,170,44,154,48,153,48,137,48,152,48,151,48,154,49,153,49,169,49,152,49,151,49,137,50,153,50,152,50,169,50,185,50,169,51,153,51,152,51,137,51,121,51,152,52,153,52,169,52,154,52,155,52,152,53,153,53,137,53,154,53,155,53,169,54,153,54,154,54,137,54,121,54,137,55,153,55,154,55,169,55,185,55,153,56,152,56,168,56,154,56,170,56,153,57,152,57,136,57,154,57,138,57,153,58,169,58,170,58,137,58,138,58,153,62,137,62,136,62,169,62,168,62,154,64,169,64,153,64,168,64,152,64,154,65,137,65,153,65,136,65,152,65,137,66,154,66,153,66,170,66,169,66,169,67,154,67,153,67,138,67,137,67,152,68,137,68,153,68,138,68,154,68,152,69,169,69,153,69,170,69,154,69,169,70,152,70,153,70,136,70,137,70,137,71,152,71,153,71,168,71,169,71,155,72,154,72,153,72,169,72,168,72,155,73,154,73,153,73,137,73,136,73,121,74,137,74,153,74,154,74,170,74,185,75,169,75,153,75,154,75,138,75,151,76,152,76,153,76,137,76,138,76,151,77,152,77,153,77,169,77,170,77,185,78,169,78,153,78,152,78,136,78,121,79,137,79,153,79,152,79,168,79,153,80,152,80,155,80,154,80,168,80,153,81,152,81,155,81,154,81,136,81,153,82,169,82,121,82,137,82,170,82,153,83,137,83,185,83,169,83,138,83,153,84,154,84,151,84,152,84,138,84,153,85,154,85,151,85,152,85,170,85,153,86,137,86,185,86,169,86,136,86,153,87,169,87,121,87,137,87,168,87,153,88,152,88,151,88,154,88,155,88,153,90,169,90,185,90,137,90,121,90,169,96,153,96,152,96,136,96,137,97,153,97,152,97,168,97,154,98,153,98,169,98,168,98,154,99,153,99,137,99,136,99,153,104,137,104,152,104,136,104,153,112,137,112,152,112,154,112,153,113,169,113,152,113,154,113,153,114,152,114,169,114,137,114,153,118,154,118,137,118,169,118,153,120,154,120,152,120,168,120,153,121,154,121,152,121,136,121,153,122,137,122,169,122,170,122,153,123,169,123,137,123,138,123,153,124,152,124,154,124,138,124,153,125,152,125,154,125,170,125,153,126,169,126,137,126,136,126,153,127,137,127,169,127,168,127,153,128,152,128,151,128,154,128,153,130,169,130,185,130,137,130,153,136,137,136,154,136,153,137,169,137,154,137,153,138,152,138,137,138,153,139,152,139,169,139,153,144,152,144,154,144,153,146,169,146,137,146,153,152,152,152,153,154,169,154,153,160,0,0,0,0,0,73,0,0,144,73,0,0,32,74,0,0,176,74,0,0,64,75,0,0,208,75,0,0,96,76,0,0,240,76,0,0,128,77,0,0,16,78,0,0,160,78,0,0,48,79,0,0,192,79,0,0,80,80,0,0,224,80,0,0,112,81,0,0,0,82,0,0,144,82,0,0,32,83,0,0,176,83,0,0,64,84,0,0,0,0,0,0,97,108,112,104,97,32,60,61,32,98,101,116,97,0,0,0,115,116,100,58,58,98,97,100,95,97,108,108,111,99,0,0,37,50,88,37,99,37,100,0,37,100,62,32,37,46,51,102,32,37,115,32,40,37,100,41,10,0,0,0,0,0,0,0,45,45,45,45,0,0,0,0,37,50,88,0,0,0,0,0,115,101,97,114,99,104,46,99,112,112,0,0,0,0,0,0,118,101,99,116,111,114,0,0,88,88,88,88,32,105,110,118,97,108,105,100,32,109,111,118,101,32,0,0,0,0,0,0,110,101,103,97,115,99,111,117,116,0,0,0,0,0,0,0,71,116,0,0,0,0,0,0,1,16,0,0,0,0,0,0,16,0,0,0,16,0,0,0,16,0,0,0,16,0,0,0,16,0,0,0,16,0,0,0,16,0,0,0,16,0,0,0,16,0,0,0,16,0,0,0,16,0,0,0,16,0,0,0,10,0,0,0,10,0,0,0,10,0,0,0,10,0,0,0,10,0,0,0,6,0,0,0,6,0,0,0,4,0,0,0,2,0,0,0,0,0,0,0,69,10,84,0,85,44,69,52,69,14,84,54,85,8,83,26,68,10,100,50,0,0,0,0,0,0,0,0,224,9,0,0,30,0,0,0,6,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,9,0,0,16,0,0,0,2,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,0,0,16,0,0,0,24,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,10,0,0,8,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,10,0,0,22,0,0,0,12,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,10,0,0,18,0,0,0,28,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,83,116,57,116,121,112,101,95,105,110,102,111,0,0,0,0,83,116,57,101,120,99,101,112,116,105,111,110,0,0,0,0,83,116,57,98,97,100,95,97,108,108,111,99,0,0,0,0,83,116,49,50,108,101,110,103,116,104,95,101,114,114,111,114,0,0,0,0,0,0,0,0,83,116,49,49,108,111,103,105,99,95,101,114,114,111,114,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,48,95,95,115,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,54,95,95,115,104,105,109,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,0,55,84,105,109,101,111,117,116,0,0,0,0,0,0,0,0,49,54,65,108,112,104,97,66,101,116,97,86,105,115,105,116,111,114,0,0,0,0,0,0,49,52,77,111,118,97,98,108,101,86,105,115,105,116,111,114,0,0,0,0,0,0,0,0,49,51,77,111,118,101,67,111,108,108,101,99,116,111,114,0,0,0,0,0,176,8,0,0,0,0,0,0,192,8,0,0,0,0,0,0,208,8,0,0,216,9,0,0,0,0,0,0,0,0,0,0,224,8,0,0,0,10,0,0,0,0,0,0,0,0,0,0,248,8,0,0,216,9,0,0,0,0,0,0,0,0,0,0,8,9,0,0,32,10,0,0,0,0,0,0,0,0,0,0,48,9,0,0,48,10,0,0,0,0,0,0,0,0,0,0,88,9,0,0,208,9,0,0,0,0,0,0,0,0,0,0,128,9,0,0,0,0,0,0,144,9,0,0,88,10,0,0,0,0,0,0,0,0,0,0,168,9,0,0,0,0,0,0,192,9,0,0,88,10,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,15,0,0,0,5,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,14,0,0,0,5,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,13,0,0,0,5,0,0,0,255,255,255,255,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,2,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,12,0,0,0,5,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,2,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,11,0,0,0,5,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,10,0,0,0,5,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,9,0,0,0,5,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,8,0,0,0,5,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,19,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,1,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,18,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,255,255,255,255,2,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,17,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,2,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,16,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,27,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,3,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,26,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,3,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,25,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,255,255,255,255,2,0,0,0,1,0,0,0,1,0,0,0,3,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,24,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,1,0,0,0,2,0,0,0,3,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,35,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,2,0,0,0,255,255,255,255,0,0,0,0,254,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,2,0,0,0,34,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,33,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,254,255,255,255,2,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,254,255,255,255,0,0,0,0,0,0,0,0,32,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,254,255,255,255,1,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,2,0,0,0,0,0,0,0,44,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,43,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,42,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,40,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,55,0,0,0,5,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,254,255,255,255,0,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,54,0,0,0,5,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,2,0,0,0,0,0,0,0,53,0,0,0,5,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,254,255,255,255,1,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,1,0,0,0,1,0,0,0,52,0,0,0,5,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,254,255,255,255,2,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,254,255,255,255,0,0,0,0,1,0,0,0,51,0,0,0,5,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,2,0,0,0,1,0,0,0,50,0,0,0,5,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,254,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,49,0,0,0,5,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,2,0,0,0,48,0,0,0,5,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,2,0,0,0,62,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,58,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,2,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,57,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,255,255,255,255,1,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,56,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,2,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,1,0,0,0,71,0,0,0,5,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,70,0,0,0,5,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,69,0,0,0,5,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,1,0,0,0,68,0,0,0,5,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,67,0,0,0,5,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,66,0,0,0,5,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,0,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,65,0,0,0,5,0,0,0].concat([0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,64,0,0,0,5,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,1,0,0,0,79,0,0,0,5,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,2,0,0,0,1,0,0,0,78,0,0,0,5,0,0,0,254,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,77,0,0,0,5,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,2,0,0,0,76,0,0,0,5,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,2,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,2,0,0,0,75,0,0,0,5,0,0,0,254,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,255,255,255,255,2,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,254,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,74,0,0,0,5,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,1,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,2,0,0,0,0,0,0,0,73,0,0,0,5,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,1,0,0,0,1,0,0,0,72,0,0,0,5,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,1,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,254,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,254,255,255,255,0,0,0,0,1,0,0,0,87,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,2,0,0,0,1,0,0,0,86,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,85,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,2,0,0,0,84,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,2,0,0,0,83,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,255,255,255,255,2,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,82,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,2,0,0,0,0,0,0,0,81,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,1,0,0,0,1,0,0,0,80,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,254,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,254,255,255,255,0,0,0,0,1,0,0,0,90,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,254,255,255,255,0,0,0,0,1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,2,0,0,0,0,0,0,0,88,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,254,255,255,255,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,2,0,0,0,99,0,0,0,4,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,98,0,0,0,4,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,1,0,0,0,97,0,0,0,4,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,96,0,0,0,4,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,104,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,118,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,114,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,113,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,1,0,0,0,112,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,127,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,126,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,125,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,1,0,0,0,124,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,123,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,122,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,121,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,120,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,1,0,0,0,130,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,254,255,255,255,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,1,0,0,0,0,0,0,0,128,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,2,0,0,0,139,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,138,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,137,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,136,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,146,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,0,0,0,0,144,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,154,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,152,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,160,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,112,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,10,0,0,0,0,0,0,0,0,0,0,112,10,0,0,0,0,0,0,0,0,0,0,112,10,0,0,0,0,0,0,0,0,0,0,112,10,0,0,0,0,0,0,0,0,0,0,112,10,0,0,0,0,0,0,0,0,0,0,112,10,0,0,0,0,0,0,0,0,0,0,112,10,0,0,0,0,0,0,0,0,0,0,112,10,0,0,0,0,0,0,8,0,0,0,5,0,0,0,240,15,0,0,64,15,0,0,144,14,0,0,224,13,0,0,48,13,0,0,128,12,0,0,208,11,0,0,32,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,15,0,0,0,0,0,0,0,0,0,0,64,15,0,0,0,0,0,0,0,0,0,0,144,14,0,0,0,0,0,0,0,0,0,0,224,13,0,0,0,0,0,0,0,0,0,0,48,13,0,0,0,0,0,0,0,0,0,0,128,12,0,0,0,0,0,0,0,0,0,0,208,11,0,0,0,0,0,0,0,0,0,0,32,11,0,0,0,0,0,0,16,0,0,0,5,0,0,0,176,18,0,0,0,18,0,0,80,17,0,0,160,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,18,0,0,0,0,0,0,0,0,0,0,0,18,0,0,0,0,0,0,0,0,0,0,80,17,0,0,0,0,0,0,0,0,0,0,160,16,0,0,0,0,0,0,0,0,0,0,176,18,0,0,0,0,0,0,0,0,0,0,0,18,0,0,0,0,0,0,0,0,0,0,80,17,0,0,0,0,0,0,0,0,0,0,160,16,0,0,0,0,0,0,24,0,0,0,5,0,0,0,112,21,0,0,192,20,0,0,16,20,0,0,96,19,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,21,0,0,0,0,0,0,0,0,0,0,192,20,0,0,0,0,0,0,0,0,0,0,16,20,0,0,0,0,0,0,0,0,0,0,96,19,0,0,0,0,0,0,0,0,0,0,96,19,0,0,0,0,0,0,0,0,0,0,16,20,0,0,0,0,0,0,0,0,0,0,192,20,0,0,0,0,0,0,0,0,0,0,112,21,0,0,0,0,0,0,32,0,0,0,5,0,0,0,48,24,0,0,128,23,0,0,208,22,0,0,32,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,24,0,0,0,0,0,0,0,0,0,0,128,23,0,0,0,0,0,0,0,0,0,0,208,22,0,0,0,0,0,0,0,0,0,0,32,22,0,0,0,0,0,0,0,0,0,0,32,22,0,0,0,0,0,0,0,0,0,0,208,22,0,0,0,0,0,0,0,0,0,0,128,23,0,0,0,0,0,0,0,0,0,0,48,24,0,0,0,0,0,0,40,0,0,0,5,0,0,0,240,26,0,0,64,26,0,0,144,25,0,0,224,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,26,0,0,0,0,0,0,0,0,0,0,240,26,0,0,0,0,0,0,0,0,0,0,64,26,0,0,0,0,0,0,0,0,0,0,144,25,0,0,0,0,0,0,0,0,0,0,224,24,0,0,0,0,0,0,0,0,0,0,224,24,0,0,0,0,0,0,0,0,0,0,144,25,0,0,0,0,0,0,0,0,0,0,64,26,0,0,0,0,0,0,48,0,0,0,5,0,0,0,112,32,0,0,192,31,0,0,16,31,0,0,96,30,0,0,176,29,0,0,0,29,0,0,80,28,0,0,160,27,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,32,0,0,0,0,0,0,0,0,0,0,192,31,0,0,0,0,0,0,0,0,0,0,16,31,0,0,0,0,0,0,0,0,0,0,96,30,0,0,0,0,0,0,0,0,0,0,176,29,0,0,0,0,0,0,0,0,0,0,0,29,0,0,0,0,0,0,0,0,0,0,80,28,0,0,0,0,0,0,0,0,0,0,160,27,0,0,0,0,0,0,56,0,0,0,5,0,0,0,48,35,0,0,128,34,0,0,208,33,0,0,32,33,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,35,0,0,0,0,0,0,0,0,0,0,128,34,0,0,0,0,0,0,0,0,0,0,208,33,0,0,0,0,0,0,0,0,0,0,208,33,0,0,0,0,0,0,0,0,0,0,128,34,0,0,0,0,0,0,0,0,0,0,48,35,0,0,0,0,0,0,0,0,0,0,32,33,0,0,0,0,0,0,0,0,0,0,32,33,0,0,0,0,0,0,64,0,0,0,5,0,0,0,176,40,0,0,0,40,0,0,80,39,0,0,160,38,0,0,240,37,0,0,64,37,0,0,144,36,0,0,224,35,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,40,0,0,0,0,0,0,0,0,0,0,0,40,0,0,0,0,0,0,0,0,0,0,80,39,0,0,0,0,0,0,0,0,0,0,160,38,0,0,0,0,0,0,0,0,0,0,240,37,0,0,0,0,0,0,0,0,0,0,64,37,0,0,0,0,0,0,0,0,0,0,144,36,0,0,0,0,0,0,0,0,0,0,224,35,0,0,0,0,0,0,72,0,0,0,5,0,0,0,48,46,0,0,128,45,0,0,208,44,0,0,32,44,0,0,112,43,0,0,192,42,0,0,16,42,0,0,96,41,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,46,0,0,0,0,0,0,0,0,0,0,128,45,0,0,0,0,0,0,0,0,0,0,208,44,0,0,0,0,0,0,0,0,0,0,32,44,0,0,0,0,0,0,0,0,0,0,112,43,0,0,0,0,0,0,0,0,0,0,192,42,0,0,0,0,0,0,0,0,0,0,16,42,0,0,0,0,0,0,0,0,0,0,96,41,0,0,0,0,0,0,80,0,0,0,5,0,0,0,176,51,0,0,0,51,0,0,80,50,0,0,160,49,0,0,240,48,0,0,64,48,0,0,144,47,0,0,224,46,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,51,0,0,0,0,0,0,0,0,0,0,0,51,0,0,0,0,0,0,0,0,0,0,80,50,0,0,0,0,0,0,0,0,0,0,160,49,0,0,0,0,0,0,0,0,0,0,240,48,0,0,0,0,0,0,0,0,0,0,64,48,0,0,0,0,0,0,0,0,0,0,144,47,0,0,0,0,0,0,0,0,0,0,224,46,0,0,0,0,0,0,88,0,0,0,5,0,0,0,16,53,0,0,96,52,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,53,0,0,0,0,0,0,0,0,0,0,16,53,0,0,0,0,0,0,0,0,0,0,96,52,0,0,0,0,0,0,0,0,0,0,96,52,0,0,0,0,0,0,0,0,0,0,16,53,0,0,0,0,0,0,0,0,0,0,16,53,0,0,0,0,0,0,0,0,0,0,96,52,0,0,0,0,0,0,0,0,0,0,96,52,0,0,0,0,0,0,96,0,0,0,4,0,0,0,208,55,0,0,32,55,0,0,112,54,0,0,192,53,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,55,0,0,0,0,0,0,0,0,0,0,32,55,0,0,0,0,0,0])
.concat([0,0,0,0,112,54,0,0,0,0,0,0,0,0,0,0,192,53,0,0,0,0,0,0,255,255,255,255,208,55,0,0,0,0,0,0,255,255,255,255,32,55,0,0,1,0,0,0,0,0,0,0,112,54,0,0,255,255,255,255,0,0,0,0,192,53,0,0,0,0,0,0,104,0,0,0,4,0,0,0,128,56,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,56,0,0,255,255,255,255,0,0,0,0,128,56,0,0,255,255,255,255,0,0,0,0,128,56,0,0,0,0,0,0,0,0,0,0,128,56,0,0,255,255,255,255,255,255,255,255,128,56,0,0,0,0,0,0,255,255,255,255,128,56,0,0,0,0,0,0,255,255,255,255,128,56,0,0,255,255,255,255,255,255,255,255,128,56,0,0,0,0,0,0,112,0,0,0,4,0,0,0,64,59,0,0,144,58,0,0,224,57,0,0,48,57,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,59,0,0,0,0,0,0,0,0,0,0,144,58,0,0,0,0,0,0,0,0,0,0,224,57,0,0,0,0,0,0,0,0,0,0,224,57,0,0,0,0,0,0,0,0,0,0,144,58,0,0,0,0,0,0,0,0,0,0,64,59,0,0,0,0,0,0,0,0,0,0,48,57,0,0,0,0,0,0,0,0,0,0,48,57,0,0,0,0,0,0,120,0,0,0,4,0,0,0,192,64,0,0,16,64,0,0,96,63,0,0,176,62,0,0,0,62,0,0,80,61,0,0,160,60,0,0,240,59,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,64,0,0,0,0,0,0,0,0,0,0,16,64,0,0,0,0,0,0,0,0,0,0,96,63,0,0,0,0,0,0,0,0,0,0,176,62,0,0,0,0,0,0,0,0,0,0,0,62,0,0,0,0,0,0,0,0,0,0,80,61,0,0,0,0,0,0,0,0,0,0,160,60,0,0,0,0,0,0,0,0,0,0,240,59,0,0,0,0,0,0,128,0,0,0,4,0,0,0,32,66,0,0,112,65,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,66,0,0,0,0,0,0,0,0,0,0,32,66,0,0,0,0,0,0,0,0,0,0,112,65,0,0,1,0,0,0,0,0,0,0,112,65,0,0,0,0,0,0,255,255,255,255,32,66,0,0,0,0,0,0,255,255,255,255,32,66,0,0,1,0,0,0,0,0,0,0,112,65,0,0,0,0,0,0,0,0,0,0,112,65,0,0,0,0,0,0,136,0,0,0,3,0,0,0,224,68,0,0,48,68,0,0,128,67,0,0,208,66,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,68,0,0,0,0,0,0,0,0,0,0,48,68,0,0,0,0,0,0,0,0,0,0,128,67,0,0,0,0,0,0,0,0,0,0,208,66,0,0,0,0,0,0,0,0,0,0,208,66,0,0,0,0,0,0,0,0,0,0,128,67,0,0,0,0,0,0,0,0,0,0,48,68,0,0,0,0,0,0,0,0,0,0,224,68,0,0,0,0,0,0,144,0,0,0,3,0,0,0,64,70,0,0,144,69,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,70,0,0,0,0,0,0,0,0,0,0,64,70,0,0,0,0,0,0,0,0,0,0,144,69,0,0,0,0,0,0,0,0,0,0,144,69,0,0,0,0,0,0,0,0,0,0,64,70,0,0,0,0,0,0,0,0,0,0,64,70,0,0,0,0,0,0,0,0,0,0,144,69,0,0,0,0,0,0,0,0,0,0,144,69,0,0,0,0,0,0,152,0,0,0,2,0,0,0,160,71,0,0,240,70,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,71,0,0,0,0,0,0,0,0,0,0,160,71,0,0,0,0,0,0,0,0,0,0,240,70,0,0,1,0,0,0,0,0,0,0,240,70,0,0,0,0,0,0,255,255,255,255,160,71,0,0,0,0,0,0,255,255,255,255,160,71,0,0,1,0,0,0,0,0,0,0,240,70,0,0,0,0,0,0,0,0,0,0,240,70,0,0,0,0,0,0,160,0,0,0,1,0,0,0,80,72,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,72,0,0,0,0,0,0,0,0,0,0,80,72,0,0,0,0,0,0,0,0,0,0,80,72,0,0,0,0,0,0,0,0,0,0,80,72,0,0,0,0,0,0,0,0,0,0,80,72,0,0,0,0,0,0,0,0,0,0,80,72,0,0,0,0,0,0,0,0,0,0,80,72,0,0,0,0,0,0,0,0,0,0,80,72,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,114,251,229,147,21,67,237,63,203,101,163,115,126,10,20,64,84,57,237,41,57,71,4,64,2,0,0,0,0,0,0,0,15,67,171,147,51,20,239,63,237,100,112,148,188,58,252,191,232,250,62,28,36,132,245,63,1,0,0,0,0,0,0,0,26,163,117,84,53,193,232,63,117,61,209,117,225,39,0,64,191,41,172,84,80,17,252,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,72,106,161,100,114,234,228,63,168,55,163,230,171,236,40,64,206,141,233,9,75,28,14,64,2,0,0,0,0,0,0,0,101,253,102,98,186,16,230,63,71,229,38,106,105,110,2,192,115,157,70,90,42,143,1,64,1,0,0,0,0,0,0,0,104,207,101,106,18,60,227,63,24,63,141,123,243,107,37,64,73,187,209,199,124,192,5,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,247,231,162,33,227,209,225,63,107,14,16,204,209,3,0,64,64,80,110,219,247,200,11,64,2,0,0,0,0,0,0,0,148,133,175,175,117,41,229,63,120,211,45,59,196,159,38,192,150,123,129,89,161,72,4,64,1,0,0,0,0,0,0,0,106,50,227,109,165,215,217,63,56,130,84,138,29,141,244,63,114,225,64,72,22,208,13,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,123,76,164,52,155,199,222,63,249,244,216,150,1,215,49,64,112,66,33,2,14,193,15,64,2,0,0,0,0,0,0,0,34,252,139,160,49,19,227,63,54,117,30,21,255,119,12,192,170,154,32,234,62,0,9,64,1,0,0,0,0,0,0,0,117,0,196,93,189,138,216,63,129,62,145,39,73,103,48,64,76,194,133,60,130,123,15,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,180,176,167,29,254,154,218,63,158,209,86,37,145,221,17,64,96,117,228,72,103,160,15,64,2,0,0,0,0,0,0,0,203,44,66,177,21,52,223,63,18,217,7,89,22,124,46,192,98,45,62,5,192,88,13,64,1,0,0,0,0,0,0,0,82,212,153,123,72,248,211,63,103,39,131,163,228,181,0,64,255,117,110,218,140,163,18,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,112,152,104,144,130,167,221,63,49,154,149,237,67,126,47,64,172,198,18,214,198,200,16,64,2,0,0,0,0,0,0,0,176,118,20,231,168,35,228,63,65,156,135,19,152,14,242,191,8,228,18,71,30,104,12,64,1,0,0,0,0,0,0,0,229,126,135,162,64,159,213,63,101,84,25,198,221,112,46,64,211,218,52,182,215,130,19,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,171,234,229,119,154,204,225,63,87,181,164,163,28,204,234,63,113,113,84,110,162,6,16,64,2,0,0,0,0,0,0,0,31,189,225,62,114,235,227,63,148,78,36,152,106,22,34,192,148,194,188,199,153,230,12,64,1,0,0,0,0,0,0,0,55,255,175,58,114,164,218,63,4,175,150,59,51,65,226,63,31,76,138,143,79,120,19,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,189,56,241,213,142,98,224,63,22,221,122,77,15,58,39,64,139,250,36,119,216,228,18,64,2,0,0,0,0,0,0,0,147,82,208,237,37,13,228,63,216,74,232,46,137,179,3,192,182,244,104,170,39,19,14,64,1,0,0,0,0,0,0,0,120,153,97,163,172,223,211,63,137,209,115,11,93,9,44,64,116,65,125,203,156,254,20,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,62,66,205,144,42,138,225,63,91,91,120,94,42,54,250,63,52,17,54,60,189,114,17,64,2,0,0,0,0,0,0,0,130,254,66,143,24,61,229,63,90,128,182,213,172,19,25,192,238,120,147,223,162,115,14,64,1,0,0,0,0,0,0,0,99,181,249,127,213,145,220,63,154,65,124,96,199,127,227,63,111,159,85,102,74,43,21,64,2,0,0,0,0,0,0,0,51,49,93,136,213,159,228,63,232,18,14,189,197,35,3,192,120,125,230,172,79,137,17,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,249,192,142,255,2,193,227,63,194,223,47,102,75,102,24,64,107,72,220,99,233,3,17,64,2,0,0,0,0,0,0,0,155,146,172,195,209,213,229,63,60,19,154,36,150,20,252,191,40,71,1,162,96,134,17,64,1,0,0,0,0,0,0,0,0,55,139,23,11,195,224,63,61,243,114,216,125,7,12,64,250,38,77,131,162,121,18,64,2,0,0,0,0,0,0,0,219,251,84,21,26,8,227,63,36,127,48,240,220,251,238,191,106,106,217,90,95,20,20,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,103,101,251,144,183,220,226,63,105,228,243,138,167,30,215,63,175,119,127,188,87,173,17,64,2,0,0,0,0,0,0,0,205,147,107,10,100,246,229,63,131,51,248,251,197,204,11,192,18,78,11,94,244,213,11,64,1,0,0,0,0,0,0,0,254,157,237,209,27,238,221,63,247,205,253,213,227,126,240,191,112,181,78,92,142,119,20,64,2,0,0,0,0,0,0,0,43,250,67,51,79,174,228,63,31,185,53,233,182,4,253,191,65,126,54,114,221,196,17,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,155,88,224,43,186,117,228,63,234,233,35,240,135,95,12,64,48,215,162,5,104,123,16,64,2,0,0,0,0,0,0,0,53,237,98,154,233,94,233,63,169,189,136,182,99,234,166,191,167,59,79,60,103,43,13,64,1,0,0,0,0,0,0,0,81,187,95,5,248,238,225,63,46,59,196,63,108,169,251,63,249,133,87,146,60,55,21,64,2,0,0,0,0,0,0,0,233,67,23,212,183,204,231,63,253,218,250,233,63,107,225,63,214,30,246,66,1,235,18,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,139,250,36,119,216,68,231,63,178,128,9,220,186,27,234,191,16,92,229,9,132,125,17,64,2,0,0,0,0,0,0,0,138,114,105,252,194,171,234,63,47,223,250,176,222,168,220,191,11,182,17,79,118,147,13,64,1,0,0,0,0,0,0,0,221,236,15,148,219,246,226,63,125,179,205,141,233,169,1,192,16,119,245,42,50,74,21,64,2,0,0,0,0,0,0,0,147,55,192,204,119,240,232,63,74,9,193,170,122,249,195,191,53,98,102,159,199,136,18,64,3,0,0,0,0,0,0,0,76,55,137,65,96,229,236,63,240,135,159,255,30,252,3,192,244,82,177,49,175,3,11,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,7,179,9,48,44,127,229,63,90,17,53,209,231,99,4,64,190,160,133,4,140,174,17,64,2,0,0,0,0,0,0,0,80,81,245,43,157,143,235,63,132,241,211,184,55,191,232,63,19,153,185,192,229,49,11,64,1,0,0,0,0,0,0,0,5,225,10,40,212,83,226,63,68,192,33,84,169,57,4,64,207,247,83,227,165,171,20,64,2,0,0,0,0,0,0,0,195,240,17,49,37,18,234,63,37,205,31,211,218,244,244,63,208,71,25,113,1,104,15,64,3,0,0,0,0,0,0,0,149,187,207,241,209,226,236,63,222,3,116,95,206,172,250,191,107,127,103,123,244,102,10,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,28,122,139,135,247,28,233,63,22,79,61,210,224,246,245,191,21,112,207,243,167,253,16,64,2,0,0,0,0,0,0,0,192,233,93,188,31,55,236,63,42,202,165,241,11,175,227,191,59,114,164,51,48,210,7,64,1,0,0,0,0,0,0,0,199,15,149,70,204,236,230,63,54,147,111,182,185,209,2,192,37,93,51,249,102,155,18,64,2,0,0,0,0,0,0,0,16,65,213,232,213,0,235,63,132,18,102,218,254,149,215,191,161,106,244,106,128,18,12,64,3,0,0,0,0,0,0,0,133,210,23,66,206,251,236,63,113,175,204,91,117,221,253,191,196,120,205,171,58,235,13,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,236,250,5,187,97,219,231,63,171,118,77,72,107,12,254,63,85,48,42,169,19,240,14,64,2,0,0,0,0,0,0,0,110,138,199,69,181,8,237,63,238,122,105,138,0,167,211,63,73,75,229,237,8,135,5,64,1,0,0,0,0,0,0,0,21,54,3,92,144,173,229,63,42,139,194,46,138,94,247,63,82,127,189,194,130,203,17,64,2,0,0,0,0,0,0,0,214,199,67,223,221,202,236,63,106,104,3,176,1,17,227,63,111,244,49,31,16,232,13,64,3,0,0,0,0,0,0,0,74,64,76,194,133,188,237,63,105,196,204,62,143,17,0,192,225,149,36,207,245,29,17,64,4,0,0,0,0,0,0,0,9,221,37,113,86,132,240,63,42,170,126,165,243,33,248,63,30,79,203,15,92,69,17,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,207,192,200,203,154,88,236,63,222,146,28,176,171,73,238,191,247,229,204,118,133,94,7,64,2,0,0,0,0,0,0,0,49,91,178,42,194,205,237,63,233,183,175,3,231,140,206,63,75,174,98,241,155,194,4,64,1,0,0,0,0,0,0,0,121,149,181,77,241,56,236,63,155,88,224,43,186,245,254,191,89,25,141,124,94,1,16,64,2,0,0,0,0,0,0,0,84,29,114,51,220,128,237,63,152,162,92,26,191,48,241,63,167,60,186,17,22,101,18,64,3,0,0,0,0,0,0,0,172,197,167,0,24,207,239,63,141,125,201,198,131,205,3,192,138,59,222,228,183,200,18,64,4,0,0,0,0,0,0,0,98,216,97,76,250,187,240,63,66,238,34,76,81,110,7,64,210,56,212,239,194,182,19,64,3,0,0,0,0,0,0,0,242,124,6,212,155,145,240,63,118,253,130,221,176,141,8,192,187,39,15,11,181,22,26,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,49,97,52,43,219,7,235,63,57,156,249,213,28,160,227,63,225,183,33,198,107,94,10,64,2,0,0,0,0,0,0,0,187,184,141,6,240,150,237,63,124,238,4,251,175,115,213,63,225,12,254,126,49,219,8,64,1,0,0,0,0,0,0,0,245,216,150,1,103,169,234,63,35,47,107,98,129,47,237,191,236,80,77,73,214,49,19,64,2,0,0,0,0,0,0,0,182,45,202,108,144,201,237,63,153,155,111,68,247,172,244,63,135,52,42,112,178,125,19,64,3,0,0,0,0,0,0,0,41,233,97,104,117,242,239,63,80,200,206,219,216,76,12,192,188,175,202,133,202,111,19,64,4,0,0,0,0,0,0,0,135,78,207,187,177,160,241,63,81,249,215,242,202,181,243,63,15,153,242,33,168,26,19,64,3,0,0,0,0,0,0,0,2,69,44,98,216,161,240,63,191,101,78,151,197,84,20,192,70,149,97,220,13,146,26,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,30,137,151,167,115,69,237,63,39,23,99,96,29,199,237,191,205,228,155,109,110,140,11,64,2,0,0,0,0,0,0,0,39,188,4,167,62,144,237,63,11,11,238,7,60,48,192,191,209,233,121,55,22,180,14,64,1,0,0,0,0,0,0,0,143,29,84,226,58,70,234,63,123,215,160,47,189,221,0,192,96,177,134,139,220,163,21,64,2,0,0,0,0,0,0,0,109,173,47,18,218,114,236,63,189,252,78,147,25,111,234,63,104,3,176,1,17,82,21,64,3,0,0,0,0,0,0,0,4,115,244,248,189,77,240,63,235,197,80,78,180,107,2,192,231,110,215,75,83,132,20,64,4,0,0,0,0,0,0,0,199,187,35,99,181,57,241,63,124,66,118,222,198,166,7,64,69,240,191,149,236,88,20,64,3,0,0,0,0,0,0,0,120,94,42,54,230,245,241,63,195,159,225,205,26,252,11,192,142,7,91,236,246,233,28,64,4,0,0,0,0,0,0,0,166,70,232,103,234,181,243,63,176,85,130,197,225,28,25,64,93,52,100,60,74,229,28,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,164,54,113,114,191,67,234,63,77,243,142,83,116,36,235,63,184,33,198,107,94,5,18,64,2,0,0,0,0,0,0,0,68,191,182,126,250,207,238,63,142,59,165,131,245,255,231,63,178,156,132,210,23,66,13,64,1,0,0,0,0,0,0,0,148,105,52,185,24,131,232,63,137,155,83,201,0,80,209,191,42,115,243,141,232,30,24,64,2,0,0,0,0,0,0,0,83,118,250,65,93,100,240,63,178,160,48,40,211,104,244,63,216,72,18,132,43,0,22,64,3,0,0,0,0,0,0,0,138,144,186,157,125,101,240,63,110,162,150,230,86,8,13,192,143,196,203,211,185,66,21,64,4,0,0,0,0,0,0,0,64,109,84,167,3,89,243,63,219,251,84,21,26,8,236,63,190,164,49,90,71,213,19,64,3,0,0,0,0,0,0,0,215,220,209,255,114,109,242,63,106,18,188,33,141,202,27,192,23,97,138,114,105,60,30,64,4,0,0,0,0,0,0,0,120,241,126,220,126,249,245,63,213,178,181,190,72,40,243,63,125,8,170,70,175,166,28,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,22,164,25,139,166,179,238,63,168,27,40,240,78,254,250,191,23,185,167,171,59,22,15,64,2,0,0,0,0,0,0,0,34,108,120,122,165,172,238,63,237,17,106,134,84,17,241,63,61,39,189,111,124,205,12,64,1,0,0,0,0,0,0,0,82,185,137,90,154,219,238,63,251,178,180,83,115,185,6,192,76,113,85,217,119,37,22,64,2,0,0,0,0,0,0,0,88,168,53,205,59,206,239,63,70,39,75,173,247,59,3,64,90,183,65,237,183,246,22,64,3,0,0,0,0,0,0,0,61,187,124,235,195,58,242,63,199,218,223,217,30,189,1,192,103,215,189,21,137,105,21,64,4,0,0,0,0,0,0,0,102,134,141,178,126,243,243,63,128,184,171,87,145,129,17,64,139,135,247,28,88,190,21,64,3,0,0,0,0,0,0,0,225,13,105,84,224,164,244,63,225,125,85,46,84,94,11,192,231,167,56,14,188,106,30,64,4,0,0,0,0,0,0,0,153,213,59,220,14,13,247,63,50,115,129,203,99,93,30,64,140,215,188,170,179,138,29,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,227,81,42,225,9,61,237,63,190,246,204,146,0,181,244,191,1,165,161,70,33,57,16,64,2,0,0,0,0,0,0,0,227,84,107,97,22,154,240,63,191,152,45,89,21,97,226,63,218,57,205,2,237,142,10,64,1,0,0,0,0,0,0,0,97,165,130,138,170,95,238,63,187,42,80,139,193,227,8,192,119,21,82,126,82,61,24,64,2,0,0,0,0,0,0,0,183,211,214,136,96,28,242,63,5,136,130,25,83,112,245,63,168,227,49,3,149,97,22,64,3,0,0,0,0,0,0,0,118,110,218,140,211,208,243,63,58,234,232,184,26,121,21,192,169,193,52,12,31,81,21,64,4,0,0,0,0,0,0,0,179,8,197,86,208,116,244,63,255,150,0,252,83,234,241,63,238,93,131,190,244,22,23,64,3,0,0,0,0,0,0,0,214,59,220,14,13,203,246,63,121,118,249,214,135,253,33,192,72,106,161,100,114,42,30,64,4,0,0,0,0,0,0,0,5,52,17,54,60,125,247,63,160,198,189,249,13,83,246,63,189,83,1,247,60,95,30,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,88,197,27,153,71,190,240,63,9,254,183,146,29,91,242,191,202,249,98,239,197,55,11,64,2,0,0,0,0,0,0,0,225,66,30,193,141,20,241,63,172,88,252,166,176,18,248,63,205,233,178,152,216,156,10,64,1,0,0,0,0,0,0,0,113,147,81,101,24,119,241,63,150,235,109,51,21,2,6,192,40,185,195,38,50,83,23,64,2,0,0,0,0,0,0,0,245,247,82,120,208,236,242,63,123,75,57,95,236,253,11,64,225,41,228,74,61,139,23,64,3,0,0,0,0,0,0,0,104,234,117,139,192,88,243,63,235,172,22,216,99,34,3,192,204,11,176,143,78,13,25,64,4,0,0,0,0,0,0,0,244,79,112,177,162,70,245,63,97,23,69,15,124,28,21,64,87,147,167,172,166,251,21,64,3,0,0,0,0,0,0,0,9,53,67,170,40,30,246,63,153,42,24,149,212,233,7,192,178,128,9,220,186,83,32,64,4,0,0,0,0,0,0,0,95,153,183,234,58,212,247,63,30,194,248,105,220,75,32,64,84,116,36,151,255,80,28,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,99,43,104,90,98,37,240,63,243,141,232,158,117,205,252,191,129,208,122,248,50,241,12,64,2,0,0,0,0,0,0,0,181,55,248,194,100,106,241,63,40,68,192,33,84,41,226,63,177,22,159,2,96,12,17,64,1,0,0,0,0,0,0,0,253,189,20,30,52,187,241,63,75,89,134,56,214,53,18,192,65,73,129,5,48,213,25,64,2,0,0,0,0,0,0,0,45,92,86,97,51,64,243,63,54,177,192,87,116,43,242,63,237,17,106,134,84,225,27,64,3,0,0,0,0,0,0,0,65,242,206,161,12,21,245,63,31,159,144,157,183,65,26,192,50,56,74,94,157,99,24,64,4,0,0,0,0,0,0,0,235,225,203,68,17,82,245,63,216,126,50,198,135,217,210,63,69,101,195,154,202,194,20,64,3,0,0,0,0,0,0,0,157,74,6,128,42,110,247,63,15,214,255,57,204,95,35,192,133,150,117,255,88,184,31,64,4,0,0,0,0,0,0,0,192,7,175,93,218,240,246,63,240,221,230,141,147,194,140,191,12,118,195,182,69,73,24,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])
, "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);
assert(tempDoublePtr % 8 == 0);
function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
}
function copyTempDouble(ptr) {
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];
  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];
  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];
  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];
}
  Module["_memcpy"] = _memcpy;var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
  function ___assert_fail(condition, filename, line, func) {
      ABORT = true;
      throw 'Assertion failed: ' + Pointer_stringify(condition) + ', at: ' + [filename ? Pointer_stringify(filename) : 'unknown filename', line, func ? Pointer_stringify(func) : 'unknown function'] + ' at ' + stackTrace();
    }
  function _clock() {
      if (_clock.start === undefined) _clock.start = Date.now();
      return Math.floor((Date.now() - _clock.start) * (1000000/1000));
    }
  function ___gxx_personality_v0() {
    }
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      Module['exit'](status);
    }function _exit(status) {
      __exit(status);
    }function __ZSt9terminatev() {
      _exit(-1234);
    }
  function _llvm_umul_with_overflow_i32(x, y) {
      x = x>>>0;
      y = y>>>0;
      return ((asm["setTempRet0"](x*y > 4294967295),(x*y)>>>0)|0);
    }
  function _llvm_uadd_with_overflow_i32(x, y) {
      x = x>>>0;
      y = y>>>0;
      return ((asm["setTempRet0"](x+y > 4294967295),(x+y)>>>0)|0);
    }
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value
      return value;
    }
  var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
      },join2:function (l, r) {
        return PATH.normalize(l + '/' + r);
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            continue;
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};
  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              result = process['stdin']['read']();
              if (!result) {
                if (process['stdin']['_readableState'] && process['stdin']['_readableState']['ended']) {
                  return null;  // EOF
                }
                return undefined;  // no data available
              }
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  var MEMFS={ops_table:null,CONTENT_OWNING:1,CONTENT_FLEXIBLE:2,CONTENT_FIXED:3,mount:function (mount) {
        return MEMFS.createNode(null, '/', 16384 | 0777, 0);
      },createNode:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            },
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.contents = [];
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },ensureFlexible:function (node) {
        if (node.contentMode !== MEMFS.CONTENT_FLEXIBLE) {
          var contents = node.contents;
          node.contents = Array.prototype.slice.call(contents);
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        }
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.contents.length;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.ensureFlexible(node);
            var contents = node.contents;
            if (attr.size < contents.length) contents.length = attr.size;
            else while (attr.size > contents.length) contents.push(0);
          }
        },lookup:function (parent, name) {
          throw FS.genericErrors[ERRNO_CODES.ENOENT];
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          old_node.parent = new_dir;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 0777 | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          var node = stream.node;
          node.timestamp = Date.now();
          var contents = node.contents;
          if (length && contents.length === 0 && position === 0 && buffer.subarray) {
            // just replace it with the new data
            if (canOwn && offset === 0) {
              node.contents = buffer; // this could be a subarray of Emscripten HEAP, or allocated from some other source.
              node.contentMode = (buffer.buffer === HEAP8.buffer) ? MEMFS.CONTENT_OWNING : MEMFS.CONTENT_FIXED;
            } else {
              node.contents = new Uint8Array(buffer.subarray(offset, offset+length));
              node.contentMode = MEMFS.CONTENT_FIXED;
            }
            return length;
          }
          MEMFS.ensureFlexible(node);
          var contents = node.contents;
          while (contents.length < position) contents.push(0);
          for (var i = 0; i < length; i++) {
            contents[position + i] = buffer[offset + i];
          }
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.contents.length;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.ensureFlexible(stream.node);
          var contents = stream.node.contents;
          var limit = offset + length;
          while (limit > contents.length) contents.push(0);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 2) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  var IDBFS={dbs:{},indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
        return MEMFS.mount.apply(null, arguments);
      },syncfs:function (mount, populate, callback) {
        IDBFS.getLocalSet(mount, function(err, local) {
          if (err) return callback(err);
          IDBFS.getRemoteSet(mount, function(err, remote) {
            if (err) return callback(err);
            var src = populate ? remote : local;
            var dst = populate ? local : remote;
            IDBFS.reconcile(src, dst, callback);
          });
        });
      },reconcile:function (src, dst, callback) {
        var total = 0;
        var create = {};
        for (var key in src.files) {
          if (!src.files.hasOwnProperty(key)) continue;
          var e = src.files[key];
          var e2 = dst.files[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create[key] = e;
            total++;
          }
        }
        var remove = {};
        for (var key in dst.files) {
          if (!dst.files.hasOwnProperty(key)) continue;
          var e = dst.files[key];
          var e2 = src.files[key];
          if (!e2) {
            remove[key] = e;
            total++;
          }
        }
        if (!total) {
          // early out
          return callback(null);
        }
        var completed = 0;
        function done(err) {
          if (err) return callback(err);
          if (++completed >= total) {
            return callback(null);
          }
        };
        // create a single transaction to handle and IDB reads / writes we'll need to do
        var db = src.type === 'remote' ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
        transaction.onerror = function transaction_onerror() { callback(this.error); };
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
        for (var path in create) {
          if (!create.hasOwnProperty(path)) continue;
          var entry = create[path];
          if (dst.type === 'local') {
            // save file to local
            try {
              if (FS.isDir(entry.mode)) {
                FS.mkdir(path, entry.mode);
              } else if (FS.isFile(entry.mode)) {
                var stream = FS.open(path, 'w+', 0666);
                FS.write(stream, entry.contents, 0, entry.contents.length, 0, true /* canOwn */);
                FS.close(stream);
              }
              done(null);
            } catch (e) {
              return done(e);
            }
          } else {
            // save file to IDB
            var req = store.put(entry, path);
            req.onsuccess = function req_onsuccess() { done(null); };
            req.onerror = function req_onerror() { done(this.error); };
          }
        }
        for (var path in remove) {
          if (!remove.hasOwnProperty(path)) continue;
          var entry = remove[path];
          if (dst.type === 'local') {
            // delete file from local
            try {
              if (FS.isDir(entry.mode)) {
                // TODO recursive delete?
                FS.rmdir(path);
              } else if (FS.isFile(entry.mode)) {
                FS.unlink(path);
              }
              done(null);
            } catch (e) {
              return done(e);
            }
          } else {
            // delete file from IDB
            var req = store.delete(path);
            req.onsuccess = function req_onsuccess() { done(null); };
            req.onerror = function req_onerror() { done(this.error); };
          }
        }
      },getLocalSet:function (mount, callback) {
        var files = {};
        function isRealDir(p) {
          return p !== '.' && p !== '..';
        };
        function toAbsolute(root) {
          return function(p) {
            return PATH.join2(root, p);
          }
        };
        var check = FS.readdir(mount.mountpoint)
          .filter(isRealDir)
          .map(toAbsolute(mount.mountpoint));
        while (check.length) {
          var path = check.pop();
          var stat, node;
          try {
            var lookup = FS.lookupPath(path);
            node = lookup.node;
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
          if (FS.isDir(stat.mode)) {
            check.push.apply(check, FS.readdir(path)
              .filter(isRealDir)
              .map(toAbsolute(path)));
            files[path] = { mode: stat.mode, timestamp: stat.mtime };
          } else if (FS.isFile(stat.mode)) {
            files[path] = { contents: node.contents, mode: stat.mode, timestamp: stat.mtime };
          } else {
            return callback(new Error('node type not supported'));
          }
        }
        return callback(null, { type: 'local', files: files });
      },getDB:function (name, callback) {
        // look it up in the cache
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        req.onupgradeneeded = function req_onupgradeneeded() {
          db = req.result;
          db.createObjectStore(IDBFS.DB_STORE_NAME);
        };
        req.onsuccess = function req_onsuccess() {
          db = req.result;
          // add to the cache
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function req_onerror() {
          callback(this.error);
        };
      },getRemoteSet:function (mount, callback) {
        var files = {};
        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);
          var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
          transaction.onerror = function transaction_onerror() { callback(this.error); };
          var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
          store.openCursor().onsuccess = function store_openCursor_onsuccess(event) {
            var cursor = event.target.result;
            if (!cursor) {
              return callback(null, { type: 'remote', db: db, files: files });
            }
            files[cursor.key] = cursor.value;
            cursor.continue();
          };
        });
      }};
  var NODEFS={isWindows:false,staticInit:function () {
        NODEFS.isWindows = !!process.platform.match(/^win/);
      },mount:function (mount) {
        assert(ENVIRONMENT_IS_NODE);
        return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
      },createNode:function (parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node;
      },getMode:function (path) {
        var stat;
        try {
          stat = fs.lstatSync(path);
          if (NODEFS.isWindows) {
            // On Windows, directories return permission bits 'rw-rw-rw-', even though they have 'rwxrwxrwx', so 
            // propagate write bits to execute bits.
            stat.mode = stat.mode | ((stat.mode & 146) >> 1);
          }
        } catch (e) {
          if (!e.code) throw e;
          throw new FS.ErrnoError(ERRNO_CODES[e.code]);
        }
        return stat.mode;
      },realPath:function (node) {
        var parts = [];
        while (node.parent !== node) {
          parts.push(node.name);
          node = node.parent;
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts);
      },flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:function (flags) {
        if (flags in NODEFS.flagsToPermissionStringMap) {
          return NODEFS.flagsToPermissionStringMap[flags];
        } else {
          return flags;
        }
      },node_ops:{getattr:function (node) {
          var path = NODEFS.realPath(node);
          var stat;
          try {
            stat = fs.lstatSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          // node.js v0.10.20 doesn't report blksize and blocks on Windows. Fake them with default blksize of 4096.
          // See http://support.microsoft.com/kb/140365
          if (NODEFS.isWindows && !stat.blksize) {
            stat.blksize = 4096;
          }
          if (NODEFS.isWindows && !stat.blocks) {
            stat.blocks = (stat.size+stat.blksize-1)/stat.blksize|0;
          }
          return {
            dev: stat.dev,
            ino: stat.ino,
            mode: stat.mode,
            nlink: stat.nlink,
            uid: stat.uid,
            gid: stat.gid,
            rdev: stat.rdev,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            blksize: stat.blksize,
            blocks: stat.blocks
          };
        },setattr:function (node, attr) {
          var path = NODEFS.realPath(node);
          try {
            if (attr.mode !== undefined) {
              fs.chmodSync(path, attr.mode);
              // update the common node structure mode as well
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              var date = new Date(attr.timestamp);
              fs.utimesSync(path, date, date);
            }
            if (attr.size !== undefined) {
              fs.truncateSync(path, attr.size);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },lookup:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          var mode = NODEFS.getMode(path);
          return NODEFS.createNode(parent, name, mode);
        },mknod:function (parent, name, mode, dev) {
          var node = NODEFS.createNode(parent, name, mode, dev);
          // create the backing node for this in the fs root as well
          var path = NODEFS.realPath(node);
          try {
            if (FS.isDir(node.mode)) {
              fs.mkdirSync(path, node.mode);
            } else {
              fs.writeFileSync(path, '', { mode: node.mode });
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return node;
        },rename:function (oldNode, newDir, newName) {
          var oldPath = NODEFS.realPath(oldNode);
          var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
          try {
            fs.renameSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },unlink:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.unlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },rmdir:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.rmdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readdir:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },symlink:function (parent, newName, oldPath) {
          var newPath = PATH.join2(NODEFS.realPath(parent), newName);
          try {
            fs.symlinkSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readlink:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        }},stream_ops:{open:function (stream) {
          var path = NODEFS.realPath(stream.node);
          try {
            if (FS.isFile(stream.node.mode)) {
              stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },close:function (stream) {
          try {
            if (FS.isFile(stream.node.mode) && stream.nfd) {
              fs.closeSync(stream.nfd);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },read:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(length);
          var res;
          try {
            res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          if (res > 0) {
            for (var i = 0; i < res; i++) {
              buffer[offset + i] = nbuffer[i];
            }
          }
          return res;
        },write:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
          var res;
          try {
            res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return res;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              try {
                var stat = fs.fstatSync(stream.nfd);
                position += stat.size;
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
              }
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.position = position;
          return position;
        }}};
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,mounts:[],devices:[null],streams:[null],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:null,genericErrors:{},handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
        return ___setErrNo(e.errno);
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.cwd(), path);
        opts = opts || { recurse_count: 0 };
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
        // start at the root
        var current = FS.root;
        var current_path = '/';
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            current = current.mount.root;
          }
          // follow symlinks
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        if (!FS.FSNode) {
          FS.FSNode = function(parent, name, mode, rdev) {
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
            this.parent = null;
            this.mount = null;
            if (!parent) {
              parent = this;  // root node sets parent to itself
            }
            this.parent = parent;
            this.mount = parent.mount;
            FS.hashAddNode(this);
          };
          // compatibility
          var readMode = 292 | 73;
          var writeMode = 146;
          FS.FSNode.prototype = {};
          // NOTE we must use Object.defineProperties instead of individual calls to
          // Object.defineProperty in order to make closure compiler happy
          Object.defineProperties(FS.FSNode.prototype, {
            read: {
              get: function() { return (this.mode & readMode) === readMode; },
              set: function(val) { val ? this.mode |= readMode : this.mode &= ~readMode; }
            },
            write: {
              get: function() { return (this.mode & writeMode) === writeMode; },
              set: function(val) { val ? this.mode |= writeMode : this.mode &= ~writeMode; }
            },
            isFolder: {
              get: function() { return FS.isDir(this.mode); },
            },
            isDevice: {
              get: function() { return FS.isChrdev(this.mode); },
            },
          });
        }
        return new FS.FSNode(parent, name, mode, rdev);
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return node.mounted;
      },isFile:function (mode) {
        return (mode & 61440) === 32768;
      },isDir:function (mode) {
        return (mode & 61440) === 16384;
      },isLink:function (mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function (mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function (mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function (mode) {
        return (mode & 61440) === 4096;
      },isSocket:function (mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 2097155;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        return FS.nodePermissions(dir, 'x');
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 2097155) !== 0 ||  // opening for write
              (flags & 512)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 1;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
          FS.FSStream = function(){};
          FS.FSStream.prototype = {};
          // compatibility
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              get: function() { return this.node; },
              set: function(val) { this.node = val; }
            },
            isRead: {
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              get: function() { return (this.flags & 1024); }
            }
          });
        }
        if (stream.__proto__) {
          // reuse the object
          stream.__proto__ = FS.FSStream.prototype;
        } else {
          var newStream = new FS.FSStream();
          for (var p in stream) {
            newStream[p] = stream[p];
          }
          stream = newStream;
        }
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },syncfs:function (populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
        var completed = 0;
        var total = FS.mounts.length;
        function done(err) {
          if (err) {
            return callback(err);
          }
          if (++completed >= total) {
            callback(null);
          }
        };
        // sync all mounts
        for (var i = 0; i < FS.mounts.length; i++) {
          var mount = FS.mounts[i];
          if (!mount.type.syncfs) {
            done(null);
            continue;
          }
          mount.type.syncfs(mount, populate, done);
        }
      },mount:function (type, opts, mountpoint) {
        var lookup;
        if (mountpoint) {
          lookup = FS.lookupPath(mountpoint, { follow: false });
          mountpoint = lookup.path;  // use the absolute path
        }
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          root: null
        };
        // create a root node for the fs
        var root = type.mount(mount);
        root.mount = mount;
        mount.root = root;
        // assign the mount info to the mountpoint's node
        if (lookup) {
          lookup.node.mount = mount;
          lookup.node.mounted = true;
          // compatibility update FS.root if we mount to /
          if (mountpoint === '/') {
            FS.root = mount.root;
          }
        }
        // add to our cached list of mounts
        FS.mounts.push(mount);
        return root;
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 0666;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 0777;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 0666;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },readlink:function (path) {
        var lookup = FS.lookupPath(path, { follow: false });
        var link = lookup.node;
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 0666 : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path === 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // check permissions
        var err = FS.mayOpen(node, flags);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512);
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            Module['printErr']('read file: ' + path);
          }
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        if (stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.errnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = '';
          var utf8 = new Runtime.UTF8Processor();
          for (var i = 0; i < length; i++) {
            ret += utf8.processCChar(buf[i]);
          }
        } else if (opts.encoding === 'binary') {
          ret = buf;
        } else {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0);
        } else {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        FS.close(stream);
      },cwd:function () {
        return FS.currentPath;
      },chdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        var err = FS.nodePermissions(lookup.node, 'x');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=stdin.fd;
        assert(stdin.fd === 1, 'invalid handle for stdin (' + stdin.fd + ')');
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=stdout.fd;
        assert(stdout.fd === 2, 'invalid handle for stdout (' + stdout.fd + ')');
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=stderr.fd;
        assert(stderr.fd === 3, 'invalid handle for stderr (' + stderr.fd + ')');
      },ensureErrnoError:function () {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno) {
          this.errno = errno;
          for (var key in ERRNO_CODES) {
            if (ERRNO_CODES[key] === errno) {
              this.code = key;
              break;
            }
          }
          this.message = ERRNO_MESSAGES[errno];
          this.stack = stackTrace();
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [ERRNO_CODES.ENOENT].forEach(function(code) {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:function () {
        FS.ensureErrnoError();
        FS.nameTable = new Array(4096);
        FS.root = FS.createNode(null, '/', 16384 | 0777, 0);
        FS.mount(MEMFS, {}, '/');
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
        FS.ensureErrnoError();
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          function LazyUint8Array() {
            this.lengthKnown = false;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = Math.floor(idx / this.chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
            this.getter = getter;
          }
          LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
              // Find length
              var xhr = new XMLHttpRequest();
              xhr.open('HEAD', url, false);
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              var datalength = Number(xhr.getResponseHeader("Content-length"));
              var header;
              var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
              var chunkSize = 1024*1024; // Chunk size in bytes
              if (!hasByteServing) chunkSize = datalength;
              // Function to get a range from the remote URL.
              var doXHR = (function(from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
                // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
                // Some hints to the browser that we want binary data.
                if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
                if (xhr.overrideMimeType) {
                  xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                  return new Uint8Array(xhr.response || []);
                } else {
                  return intArrayFromString(xhr.responseText || '', true);
                }
              });
              var lazyArray = this;
              lazyArray.setDataGetter(function(chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum+1) * chunkSize - 1; // including this byte
                end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                  lazyArray.chunks[chunkNum] = doXHR(start, end);
                }
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum];
              });
              this._length = datalength;
              this._chunkSize = chunkSize;
              this.lengthKnown = true;
          }
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function getRequest_onsuccess() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};
  var _mkport=undefined;var SOCKFS={mount:function (mount) {
        return FS.createNode(null, '/', 16384 | 0777, 0);
      },createSocket:function (family, type, protocol) {
        var streaming = type == 1;
        if (protocol) {
          assert(streaming == (protocol == 6)); // if SOCK_STREAM, must be tcp
        }
        // create our internal socket structure
        var sock = {
          family: family,
          type: type,
          protocol: protocol,
          server: null,
          peers: {},
          pending: [],
          recv_queue: [],
          sock_ops: SOCKFS.websocket_sock_ops
        };
        // create the filesystem node to store the socket structure
        var name = SOCKFS.nextname();
        var node = FS.createNode(SOCKFS.root, name, 49152, 0);
        node.sock = sock;
        // and the wrapping stream that enables library functions such
        // as read and write to indirectly interact with the socket
        var stream = FS.createStream({
          path: name,
          node: node,
          flags: FS.modeStringToFlags('r+'),
          seekable: false,
          stream_ops: SOCKFS.stream_ops
        });
        // map the new stream to the socket structure (sockets have a 1:1
        // relationship with a stream)
        sock.stream = stream;
        return sock;
      },getSocket:function (fd) {
        var stream = FS.getStream(fd);
        if (!stream || !FS.isSocket(stream.node.mode)) {
          return null;
        }
        return stream.node.sock;
      },stream_ops:{poll:function (stream) {
          var sock = stream.node.sock;
          return sock.sock_ops.poll(sock);
        },ioctl:function (stream, request, varargs) {
          var sock = stream.node.sock;
          return sock.sock_ops.ioctl(sock, request, varargs);
        },read:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          var msg = sock.sock_ops.recvmsg(sock, length);
          if (!msg) {
            // socket is closed
            return 0;
          }
          buffer.set(msg.buffer, offset);
          return msg.buffer.length;
        },write:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          return sock.sock_ops.sendmsg(sock, buffer, offset, length);
        },close:function (stream) {
          var sock = stream.node.sock;
          sock.sock_ops.close(sock);
        }},nextname:function () {
        if (!SOCKFS.nextname.current) {
          SOCKFS.nextname.current = 0;
        }
        return 'socket[' + (SOCKFS.nextname.current++) + ']';
      },websocket_sock_ops:{createPeer:function (sock, addr, port) {
          var ws;
          if (typeof addr === 'object') {
            ws = addr;
            addr = null;
            port = null;
          }
          if (ws) {
            // for sockets that've already connected (e.g. we're the server)
            // we can inspect the _socket property for the address
            if (ws._socket) {
              addr = ws._socket.remoteAddress;
              port = ws._socket.remotePort;
            }
            // if we're just now initializing a connection to the remote,
            // inspect the url property
            else {
              var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
              if (!result) {
                throw new Error('WebSocket URL must be in the format ws(s)://address:port');
              }
              addr = result[1];
              port = parseInt(result[2], 10);
            }
          } else {
            // create the actual websocket object and connect
            try {
              var url = 'ws://' + addr + ':' + port;
              // the node ws library API is slightly different than the browser's
              var opts = ENVIRONMENT_IS_NODE ? {headers: {'websocket-protocol': ['binary']}} : ['binary'];
              // If node we use the ws library.
              var WebSocket = ENVIRONMENT_IS_NODE ? require('ws') : window['WebSocket'];
              ws = new WebSocket(url, opts);
              ws.binaryType = 'arraybuffer';
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EHOSTUNREACH);
            }
          }
          var peer = {
            addr: addr,
            port: port,
            socket: ws,
            dgram_send_queue: []
          };
          SOCKFS.websocket_sock_ops.addPeer(sock, peer);
          SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
          // if this is a bound dgram socket, send the port number first to allow
          // us to override the ephemeral port reported to us by remotePort on the
          // remote end.
          if (sock.type === 2 && typeof sock.sport !== 'undefined') {
            peer.dgram_send_queue.push(new Uint8Array([
                255, 255, 255, 255,
                'p'.charCodeAt(0), 'o'.charCodeAt(0), 'r'.charCodeAt(0), 't'.charCodeAt(0),
                ((sock.sport & 0xff00) >> 8) , (sock.sport & 0xff)
            ]));
          }
          return peer;
        },getPeer:function (sock, addr, port) {
          return sock.peers[addr + ':' + port];
        },addPeer:function (sock, peer) {
          sock.peers[peer.addr + ':' + peer.port] = peer;
        },removePeer:function (sock, peer) {
          delete sock.peers[peer.addr + ':' + peer.port];
        },handlePeerEvents:function (sock, peer) {
          var first = true;
          var handleOpen = function () {
            try {
              var queued = peer.dgram_send_queue.shift();
              while (queued) {
                peer.socket.send(queued);
                queued = peer.dgram_send_queue.shift();
              }
            } catch (e) {
              // not much we can do here in the way of proper error handling as we've already
              // lied and said this data was sent. shut it down.
              peer.socket.close();
            }
          };
          function handleMessage(data) {
            assert(typeof data !== 'string' && data.byteLength !== undefined);  // must receive an ArrayBuffer
            data = new Uint8Array(data);  // make a typed array view on the array buffer
            // if this is the port message, override the peer's port with it
            var wasfirst = first;
            first = false;
            if (wasfirst &&
                data.length === 10 &&
                data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 &&
                data[4] === 'p'.charCodeAt(0) && data[5] === 'o'.charCodeAt(0) && data[6] === 'r'.charCodeAt(0) && data[7] === 't'.charCodeAt(0)) {
              // update the peer's port and it's key in the peer map
              var newport = ((data[8] << 8) | data[9]);
              SOCKFS.websocket_sock_ops.removePeer(sock, peer);
              peer.port = newport;
              SOCKFS.websocket_sock_ops.addPeer(sock, peer);
              return;
            }
            sock.recv_queue.push({ addr: peer.addr, port: peer.port, data: data });
          };
          if (ENVIRONMENT_IS_NODE) {
            peer.socket.on('open', handleOpen);
            peer.socket.on('message', function(data, flags) {
              if (!flags.binary) {
                return;
              }
              handleMessage((new Uint8Array(data)).buffer);  // copy from node Buffer -> ArrayBuffer
            });
            peer.socket.on('error', function() {
              // don't throw
            });
          } else {
            peer.socket.onopen = handleOpen;
            peer.socket.onmessage = function peer_socket_onmessage(event) {
              handleMessage(event.data);
            };
          }
        },poll:function (sock) {
          if (sock.type === 1 && sock.server) {
            // listen sockets should only say they're available for reading
            // if there are pending clients.
            return sock.pending.length ? (64 | 1) : 0;
          }
          var mask = 0;
          var dest = sock.type === 1 ?  // we only care about the socket state for connection-based sockets
            SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) :
            null;
          if (sock.recv_queue.length ||
              !dest ||  // connection-less sockets are always ready to read
              (dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {  // let recv return 0 once closed
            mask |= (64 | 1);
          }
          if (!dest ||  // connection-less sockets are always ready to write
              (dest && dest.socket.readyState === dest.socket.OPEN)) {
            mask |= 4;
          }
          if ((dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {
            mask |= 16;
          }
          return mask;
        },ioctl:function (sock, request, arg) {
          switch (request) {
            case 21531:
              var bytes = 0;
              if (sock.recv_queue.length) {
                bytes = sock.recv_queue[0].data.length;
              }
              HEAP32[((arg)>>2)]=bytes;
              return 0;
            default:
              return ERRNO_CODES.EINVAL;
          }
        },close:function (sock) {
          // if we've spawned a listen server, close it
          if (sock.server) {
            try {
              sock.server.close();
            } catch (e) {
            }
            sock.server = null;
          }
          // close any peer connections
          var peers = Object.keys(sock.peers);
          for (var i = 0; i < peers.length; i++) {
            var peer = sock.peers[peers[i]];
            try {
              peer.socket.close();
            } catch (e) {
            }
            SOCKFS.websocket_sock_ops.removePeer(sock, peer);
          }
          return 0;
        },bind:function (sock, addr, port) {
          if (typeof sock.saddr !== 'undefined' || typeof sock.sport !== 'undefined') {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already bound
          }
          sock.saddr = addr;
          sock.sport = port || _mkport();
          // in order to emulate dgram sockets, we need to launch a listen server when
          // binding on a connection-less socket
          // note: this is only required on the server side
          if (sock.type === 2) {
            // close the existing server if it exists
            if (sock.server) {
              sock.server.close();
              sock.server = null;
            }
            // swallow error operation not supported error that occurs when binding in the
            // browser where this isn't supported
            try {
              sock.sock_ops.listen(sock, 0);
            } catch (e) {
              if (!(e instanceof FS.ErrnoError)) throw e;
              if (e.errno !== ERRNO_CODES.EOPNOTSUPP) throw e;
            }
          }
        },connect:function (sock, addr, port) {
          if (sock.server) {
            throw new FS.ErrnoError(ERRNO_CODS.EOPNOTSUPP);
          }
          // TODO autobind
          // if (!sock.addr && sock.type == 2) {
          // }
          // early out if we're already connected / in the middle of connecting
          if (typeof sock.daddr !== 'undefined' && typeof sock.dport !== 'undefined') {
            var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
            if (dest) {
              if (dest.socket.readyState === dest.socket.CONNECTING) {
                throw new FS.ErrnoError(ERRNO_CODES.EALREADY);
              } else {
                throw new FS.ErrnoError(ERRNO_CODES.EISCONN);
              }
            }
          }
          // add the socket to our peer list and set our
          // destination address / port to match
          var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
          sock.daddr = peer.addr;
          sock.dport = peer.port;
          // always "fail" in non-blocking mode
          throw new FS.ErrnoError(ERRNO_CODES.EINPROGRESS);
        },listen:function (sock, backlog) {
          if (!ENVIRONMENT_IS_NODE) {
            throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
          }
          if (sock.server) {
             throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already listening
          }
          var WebSocketServer = require('ws').Server;
          var host = sock.saddr;
          sock.server = new WebSocketServer({
            host: host,
            port: sock.sport
            // TODO support backlog
          });
          sock.server.on('connection', function(ws) {
            if (sock.type === 1) {
              var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
              // create a peer on the new socket
              var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
              newsock.daddr = peer.addr;
              newsock.dport = peer.port;
              // push to queue for accept to pick up
              sock.pending.push(newsock);
            } else {
              // create a peer on the listen socket so calling sendto
              // with the listen socket and an address will resolve
              // to the correct client
              SOCKFS.websocket_sock_ops.createPeer(sock, ws);
            }
          });
          sock.server.on('closed', function() {
            sock.server = null;
          });
          sock.server.on('error', function() {
            // don't throw
          });
        },accept:function (listensock) {
          if (!listensock.server) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          var newsock = listensock.pending.shift();
          newsock.stream.flags = listensock.stream.flags;
          return newsock;
        },getname:function (sock, peer) {
          var addr, port;
          if (peer) {
            if (sock.daddr === undefined || sock.dport === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            }
            addr = sock.daddr;
            port = sock.dport;
          } else {
            // TODO saddr and sport will be set for bind()'d UDP sockets, but what
            // should we be returning for TCP sockets that've been connect()'d?
            addr = sock.saddr || 0;
            port = sock.sport || 0;
          }
          return { addr: addr, port: port };
        },sendmsg:function (sock, buffer, offset, length, addr, port) {
          if (sock.type === 2) {
            // connection-less sockets will honor the message address,
            // and otherwise fall back to the bound destination address
            if (addr === undefined || port === undefined) {
              addr = sock.daddr;
              port = sock.dport;
            }
            // if there was no address to fall back to, error out
            if (addr === undefined || port === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.EDESTADDRREQ);
            }
          } else {
            // connection-based sockets will only use the bound
            addr = sock.daddr;
            port = sock.dport;
          }
          // find the peer for the destination address
          var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
          // early out if not connected with a connection-based socket
          if (sock.type === 1) {
            if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            } else if (dest.socket.readyState === dest.socket.CONNECTING) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
          // create a copy of the incoming data to send, as the WebSocket API
          // doesn't work entirely with an ArrayBufferView, it'll just send
          // the entire underlying buffer
          var data;
          if (buffer instanceof Array || buffer instanceof ArrayBuffer) {
            data = buffer.slice(offset, offset + length);
          } else {  // ArrayBufferView
            data = buffer.buffer.slice(buffer.byteOffset + offset, buffer.byteOffset + offset + length);
          }
          // if we're emulating a connection-less dgram socket and don't have
          // a cached connection, queue the buffer to send upon connect and
          // lie, saying the data was sent now.
          if (sock.type === 2) {
            if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
              // if we're not connected, open a new connection
              if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
              }
              dest.dgram_send_queue.push(data);
              return length;
            }
          }
          try {
            // send the actual data
            dest.socket.send(data);
            return length;
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
        },recvmsg:function (sock, length) {
          // http://pubs.opengroup.org/onlinepubs/7908799/xns/recvmsg.html
          if (sock.type === 1 && sock.server) {
            // tcp servers should not be recv()'ing on the listen socket
            throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
          }
          var queued = sock.recv_queue.shift();
          if (!queued) {
            if (sock.type === 1) {
              var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
              if (!dest) {
                // if we have a destination address but are not connected, error out
                throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
              }
              else if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                // return null if the socket has closed
                return null;
              }
              else {
                // else, our socket is in a valid state but truly has nothing available
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
            } else {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
          // queued.data will be an ArrayBuffer if it's unadulterated, but if it's
          // requeued TCP data it'll be an ArrayBufferView
          var queuedLength = queued.data.byteLength || queued.data.length;
          var queuedOffset = queued.data.byteOffset || 0;
          var queuedBuffer = queued.data.buffer || queued.data;
          var bytesRead = Math.min(length, queuedLength);
          var res = {
            buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
            addr: queued.addr,
            port: queued.port
          };
          // push back any unread data for TCP connections
          if (sock.type === 1 && bytesRead < queuedLength) {
            var bytesRemaining = queuedLength - bytesRead;
            queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
            sock.recv_queue.unshift(queued);
          }
          return res;
        }}};function _send(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _write(fd, buf, len);
    }
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var bytesWritten = _write(stream, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        var streamObj = FS.getStream(stream);
        if (streamObj) streamObj.error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }
  Module["_strlen"] = _strlen;
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = HEAPF64[(((varargs)+(argIndex))>>3)];
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+8))>>2)]];
          argIndex += 8; // each 32-bit chunk is in a 64-bit block
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Math.max(Runtime.getNativeFieldSize(type), Runtime.getAlignSize(type, null, true));
        return ret;
      }
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          var flagPadSign = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              case 32:
                flagPadSign = true;
                break;
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
          // Handle precision.
          var precisionSet = false;
          if (next == 46) {
            var precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          } else {
            var precision = 6; // Standard default.
          }
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
              // Add sign if needed
              if (currArg >= 0) {
                if (flagAlwaysSigned) {
                  prefix = '+' + prefix;
                } else if (flagPadSign) {
                  prefix = ' ' + prefix;
                }
              }
              // Move sign to prefix so we zero-pad after the sign
              if (argText.charAt(0) == '-') {
                prefix = '-' + prefix;
                argText = argText.substr(1);
              }
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
                // Add sign.
                if (currArg >= 0) {
                  if (flagAlwaysSigned) {
                    argText = '+' + argText;
                  } else if (flagPadSign) {
                    argText = ' ' + argText;
                  }
                }
              }
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }function _printf(format, varargs) {
      // int printf(const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var stdout = HEAP32[((_stdout)>>2)];
      return _fprintf(stdout, format, varargs);
    }
  function ___cxa_allocate_exception(size) {
      return _malloc(size);
    }
  function _llvm_eh_exception() {
      return HEAP32[((_llvm_eh_exception.buf)>>2)];
    }
  function __ZSt18uncaught_exceptionv() { // std::uncaught_exception()
      return !!__ZSt18uncaught_exceptionv.uncaught_exception;
    }
  function ___cxa_is_number_type(type) {
      var isNumber = false;
      try { if (type == __ZTIi) isNumber = true } catch(e){}
      try { if (type == __ZTIj) isNumber = true } catch(e){}
      try { if (type == __ZTIl) isNumber = true } catch(e){}
      try { if (type == __ZTIm) isNumber = true } catch(e){}
      try { if (type == __ZTIx) isNumber = true } catch(e){}
      try { if (type == __ZTIy) isNumber = true } catch(e){}
      try { if (type == __ZTIf) isNumber = true } catch(e){}
      try { if (type == __ZTId) isNumber = true } catch(e){}
      try { if (type == __ZTIe) isNumber = true } catch(e){}
      try { if (type == __ZTIc) isNumber = true } catch(e){}
      try { if (type == __ZTIa) isNumber = true } catch(e){}
      try { if (type == __ZTIh) isNumber = true } catch(e){}
      try { if (type == __ZTIs) isNumber = true } catch(e){}
      try { if (type == __ZTIt) isNumber = true } catch(e){}
      return isNumber;
    }function ___cxa_does_inherit(definiteType, possibilityType, possibility) {
      if (possibility == 0) return false;
      if (possibilityType == 0 || possibilityType == definiteType)
        return true;
      var possibility_type_info;
      if (___cxa_is_number_type(possibilityType)) {
        possibility_type_info = possibilityType;
      } else {
        var possibility_type_infoAddr = HEAP32[((possibilityType)>>2)] - 8;
        possibility_type_info = HEAP32[((possibility_type_infoAddr)>>2)];
      }
      switch (possibility_type_info) {
      case 0: // possibility is a pointer
        // See if definite type is a pointer
        var definite_type_infoAddr = HEAP32[((definiteType)>>2)] - 8;
        var definite_type_info = HEAP32[((definite_type_infoAddr)>>2)];
        if (definite_type_info == 0) {
          // Also a pointer; compare base types of pointers
          var defPointerBaseAddr = definiteType+8;
          var defPointerBaseType = HEAP32[((defPointerBaseAddr)>>2)];
          var possPointerBaseAddr = possibilityType+8;
          var possPointerBaseType = HEAP32[((possPointerBaseAddr)>>2)];
          return ___cxa_does_inherit(defPointerBaseType, possPointerBaseType, possibility);
        } else
          return false; // one pointer and one non-pointer
      case 1: // class with no base class
        return false;
      case 2: // class with base class
        var parentTypeAddr = possibilityType + 8;
        var parentType = HEAP32[((parentTypeAddr)>>2)];
        return ___cxa_does_inherit(definiteType, parentType, possibility);
      default:
        return false; // some unencountered type
      }
    }
  function ___resumeException(ptr) {
      if (HEAP32[((_llvm_eh_exception.buf)>>2)] == 0) HEAP32[((_llvm_eh_exception.buf)>>2)]=ptr;
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";;
    }function ___cxa_find_matching_catch(thrown, throwntype) {
      if (thrown == -1) thrown = HEAP32[((_llvm_eh_exception.buf)>>2)];
      if (throwntype == -1) throwntype = HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)];
      var typeArray = Array.prototype.slice.call(arguments, 2);
      // If throwntype is a pointer, this means a pointer has been
      // thrown. When a pointer is thrown, actually what's thrown
      // is a pointer to the pointer. We'll dereference it.
      if (throwntype != 0 && !___cxa_is_number_type(throwntype)) {
        var throwntypeInfoAddr= HEAP32[((throwntype)>>2)] - 8;
        var throwntypeInfo= HEAP32[((throwntypeInfoAddr)>>2)];
        if (throwntypeInfo == 0)
          thrown = HEAP32[((thrown)>>2)];
      }
      // The different catch blocks are denoted by different types.
      // Due to inheritance, those types may not precisely match the
      // type of the thrown object. Find one which matches, and
      // return the type of the catch block which should be called.
      for (var i = 0; i < typeArray.length; i++) {
        if (___cxa_does_inherit(typeArray[i], throwntype, thrown))
          return ((asm["setTempRet0"](typeArray[i]),thrown)|0);
      }
      // Shouldn't happen unless we have bogus data in typeArray
      // or encounter a type for which emscripten doesn't have suitable
      // typeinfo defined. Best-efforts match just in case.
      return ((asm["setTempRet0"](throwntype),thrown)|0);
    }function ___cxa_throw(ptr, type, destructor) {
      if (!___cxa_throw.initialized) {
        try {
          HEAP32[((__ZTVN10__cxxabiv119__pointer_type_infoE)>>2)]=0; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv117__class_type_infoE)>>2)]=1; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv120__si_class_type_infoE)>>2)]=2; // Workaround for libcxxabi integration bug
        } catch(e){}
        ___cxa_throw.initialized = true;
      }
      HEAP32[((_llvm_eh_exception.buf)>>2)]=ptr
      HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)]=type
      HEAP32[(((_llvm_eh_exception.buf)+(8))>>2)]=destructor
      if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
        __ZSt18uncaught_exceptionv.uncaught_exception = 1;
      } else {
        __ZSt18uncaught_exceptionv.uncaught_exception++;
      }
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";;
    }
  function ___cxa_call_unexpected(exception) {
      Module.printErr('Unexpected exception thrown, this is not properly supported - aborting');
      ABORT = true;
      throw exception;
    }
  Module["_memcmp"] = _memcmp;
  function ___cxa_free_exception(ptr) {
      try {
        return _free(ptr);
      } catch(e) { // XXX FIXME
      }
    }
  var _ceil=Math_ceil;
  var _floor=Math_floor;
  function ___cxa_pure_virtual() {
      ABORT = true;
      throw 'Pure virtual function called!';
    }
  var _llvm_memcpy_p0i8_p0i8_i64=_memcpy;
  function __getFloat(text) {
      return /^[+-]?[0-9]*\.?[0-9]+([eE][+-]?[0-9]+)?/.exec(text);
    }function __scanString(format, get, unget, varargs) {
      if (!__scanString.whiteSpace) {
        __scanString.whiteSpace = {};
        __scanString.whiteSpace[32] = 1;
        __scanString.whiteSpace[9] = 1;
        __scanString.whiteSpace[10] = 1;
        __scanString.whiteSpace[11] = 1;
        __scanString.whiteSpace[12] = 1;
        __scanString.whiteSpace[13] = 1;
      }
      // Supports %x, %4x, %d.%d, %lld, %s, %f, %lf.
      // TODO: Support all format specifiers.
      format = Pointer_stringify(format);
      var soFar = 0;
      if (format.indexOf('%n') >= 0) {
        // need to track soFar
        var _get = get;
        get = function get() {
          soFar++;
          return _get();
        }
        var _unget = unget;
        unget = function unget() {
          soFar--;
          return _unget();
        }
      }
      var formatIndex = 0;
      var argsi = 0;
      var fields = 0;
      var argIndex = 0;
      var next;
      mainLoop:
      for (var formatIndex = 0; formatIndex < format.length;) {
        if (format[formatIndex] === '%' && format[formatIndex+1] == 'n') {
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getAlignSize('void*', null, true);
          HEAP32[((argPtr)>>2)]=soFar;
          formatIndex += 2;
          continue;
        }
        if (format[formatIndex] === '%') {
          var nextC = format.indexOf('c', formatIndex+1);
          if (nextC > 0) {
            var maxx = 1;
            if (nextC > formatIndex+1) {
              var sub = format.substring(formatIndex+1, nextC);
              maxx = parseInt(sub);
              if (maxx != sub) maxx = 0;
            }
            if (maxx) {
              var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
              argIndex += Runtime.getAlignSize('void*', null, true);
              fields++;
              for (var i = 0; i < maxx; i++) {
                next = get();
                HEAP8[((argPtr++)|0)]=next;
              }
              formatIndex += nextC - formatIndex + 1;
              continue;
            }
          }
        }
        // handle %[...]
        if (format[formatIndex] === '%' && format.indexOf('[', formatIndex+1) > 0) {
          var match = /\%([0-9]*)\[(\^)?(\]?[^\]]*)\]/.exec(format.substring(formatIndex));
          if (match) {
            var maxNumCharacters = parseInt(match[1]) || Infinity;
            var negateScanList = (match[2] === '^');
            var scanList = match[3];
            // expand "middle" dashs into character sets
            var middleDashMatch;
            while ((middleDashMatch = /([^\-])\-([^\-])/.exec(scanList))) {
              var rangeStartCharCode = middleDashMatch[1].charCodeAt(0);
              var rangeEndCharCode = middleDashMatch[2].charCodeAt(0);
              for (var expanded = ''; rangeStartCharCode <= rangeEndCharCode; expanded += String.fromCharCode(rangeStartCharCode++));
              scanList = scanList.replace(middleDashMatch[1] + '-' + middleDashMatch[2], expanded);
            }
            var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
            argIndex += Runtime.getAlignSize('void*', null, true);
            fields++;
            for (var i = 0; i < maxNumCharacters; i++) {
              next = get();
              if (negateScanList) {
                if (scanList.indexOf(String.fromCharCode(next)) < 0) {
                  HEAP8[((argPtr++)|0)]=next;
                } else {
                  unget();
                  break;
                }
              } else {
                if (scanList.indexOf(String.fromCharCode(next)) >= 0) {
                  HEAP8[((argPtr++)|0)]=next;
                } else {
                  unget();
                  break;
                }
              }
            }
            // write out null-terminating character
            HEAP8[((argPtr++)|0)]=0;
            formatIndex += match[0].length;
            continue;
          }
        }      
        // remove whitespace
        while (1) {
          next = get();
          if (next == 0) return fields;
          if (!(next in __scanString.whiteSpace)) break;
        }
        unget();
        if (format[formatIndex] === '%') {
          formatIndex++;
          var suppressAssignment = false;
          if (format[formatIndex] == '*') {
            suppressAssignment = true;
            formatIndex++;
          }
          var maxSpecifierStart = formatIndex;
          while (format[formatIndex].charCodeAt(0) >= 48 &&
                 format[formatIndex].charCodeAt(0) <= 57) {
            formatIndex++;
          }
          var max_;
          if (formatIndex != maxSpecifierStart) {
            max_ = parseInt(format.slice(maxSpecifierStart, formatIndex), 10);
          }
          var long_ = false;
          var half = false;
          var longLong = false;
          if (format[formatIndex] == 'l') {
            long_ = true;
            formatIndex++;
            if (format[formatIndex] == 'l') {
              longLong = true;
              formatIndex++;
            }
          } else if (format[formatIndex] == 'h') {
            half = true;
            formatIndex++;
          }
          var type = format[formatIndex];
          formatIndex++;
          var curr = 0;
          var buffer = [];
          // Read characters according to the format. floats are trickier, they may be in an unfloat state in the middle, then be a valid float later
          if (type == 'f' || type == 'e' || type == 'g' ||
              type == 'F' || type == 'E' || type == 'G') {
            next = get();
            while (next > 0 && (!(next in __scanString.whiteSpace)))  {
              buffer.push(String.fromCharCode(next));
              next = get();
            }
            var m = __getFloat(buffer.join(''));
            var last = m ? m[0].length : 0;
            for (var i = 0; i < buffer.length - last + 1; i++) {
              unget();
            }
            buffer.length = last;
          } else {
            next = get();
            var first = true;
            // Strip the optional 0x prefix for %x.
            if ((type == 'x' || type == 'X') && (next == 48)) {
              var peek = get();
              if (peek == 120 || peek == 88) {
                next = get();
              } else {
                unget();
              }
            }
            while ((curr < max_ || isNaN(max_)) && next > 0) {
              if (!(next in __scanString.whiteSpace) && // stop on whitespace
                  (type == 's' ||
                   ((type === 'd' || type == 'u' || type == 'i') && ((next >= 48 && next <= 57) ||
                                                                     (first && next == 45))) ||
                   ((type === 'x' || type === 'X') && (next >= 48 && next <= 57 ||
                                     next >= 97 && next <= 102 ||
                                     next >= 65 && next <= 70))) &&
                  (formatIndex >= format.length || next !== format[formatIndex].charCodeAt(0))) { // Stop when we read something that is coming up
                buffer.push(String.fromCharCode(next));
                next = get();
                curr++;
                first = false;
              } else {
                break;
              }
            }
            unget();
          }
          if (buffer.length === 0) return 0;  // Failure.
          if (suppressAssignment) continue;
          var text = buffer.join('');
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getAlignSize('void*', null, true);
          switch (type) {
            case 'd': case 'u': case 'i':
              if (half) {
                HEAP16[((argPtr)>>1)]=parseInt(text, 10);
              } else if (longLong) {
                (tempI64 = [parseInt(text, 10)>>>0,(tempDouble=parseInt(text, 10),(+(Math_abs(tempDouble))) >= (+1) ? (tempDouble > (+0) ? ((Math_min((+(Math_floor((tempDouble)/(+4294967296)))), (+4294967295)))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+4294967296))))))>>>0) : 0)],HEAP32[((argPtr)>>2)]=tempI64[0],HEAP32[(((argPtr)+(4))>>2)]=tempI64[1]);
              } else {
                HEAP32[((argPtr)>>2)]=parseInt(text, 10);
              }
              break;
            case 'X':
            case 'x':
              HEAP32[((argPtr)>>2)]=parseInt(text, 16)
              break;
            case 'F':
            case 'f':
            case 'E':
            case 'e':
            case 'G':
            case 'g':
            case 'E':
              // fallthrough intended
              if (long_) {
                HEAPF64[((argPtr)>>3)]=parseFloat(text)
              } else {
                HEAPF32[((argPtr)>>2)]=parseFloat(text)
              }
              break;
            case 's':
              var array = intArrayFromString(text);
              for (var j = 0; j < array.length; j++) {
                HEAP8[(((argPtr)+(j))|0)]=array[j]
              }
              break;
          }
          fields++;
        } else if (format[formatIndex].charCodeAt(0) in __scanString.whiteSpace) {
          next = get();
          while (next in __scanString.whiteSpace) {
            if (next <= 0) break mainLoop;  // End of input.
            next = get();
          }
          unget(next);
          formatIndex++;
        } else {
          // Not a specifier.
          next = get();
          if (format[formatIndex].charCodeAt(0) !== next) {
            unget(next);
            break mainLoop;
          }
          formatIndex++;
        }
      }
      return fields;
    }function _sscanf(s, format, varargs) {
      // int sscanf(const char *restrict s, const char *restrict format, ... );
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/scanf.html
      var index = 0;
      function get() { return HEAP8[(((s)+(index++))|0)]; };
      function unget() { index--; };
      return __scanString(format, get, unget, varargs);
    }
  Module["_tolower"] = _tolower;
  Module["_strcpy"] = _strcpy;
  function _snprintf(s, n, format, varargs) {
      // int snprintf(char *restrict s, size_t n, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var limit = (n === undefined) ? result.length
                                    : Math.min(result.length, Math.max(n - 1, 0));
      if (s < 0) {
        s = -s;
        var buf = _malloc(limit+1);
        HEAP32[((s)>>2)]=buf;
        s = buf;
      }
      for (var i = 0; i < limit; i++) {
        HEAP8[(((s)+(i))|0)]=result[i];
      }
      if (limit < n || (n === undefined)) HEAP8[(((s)+(i))|0)]=0;
      return result.length;
    }function _sprintf(s, format, varargs) {
      // int sprintf(char *restrict s, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      return _snprintf(s, undefined, format, varargs);
    }
  Module["_memset"] = _memset;var _llvm_memset_p0i8_i32=_memset;
  function _rand() {
      return Math.floor(Math.random()*0x80000000);
    }
  var _llvm_memset_p0i8_i64=_memset;
  function ___errno_location() {
      return ___errno_state;
    }
  function _abort() {
      Module['abort']();
    }
  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 30: return PAGE_SIZE;
        case 132:
        case 133:
        case 12:
        case 137:
        case 138:
        case 15:
        case 235:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 149:
        case 13:
        case 10:
        case 236:
        case 153:
        case 9:
        case 21:
        case 22:
        case 159:
        case 154:
        case 14:
        case 77:
        case 78:
        case 139:
        case 80:
        case 81:
        case 79:
        case 82:
        case 68:
        case 67:
        case 164:
        case 11:
        case 29:
        case 47:
        case 48:
        case 95:
        case 52:
        case 51:
        case 46:
          return 200809;
        case 27:
        case 246:
        case 127:
        case 128:
        case 23:
        case 24:
        case 160:
        case 161:
        case 181:
        case 182:
        case 242:
        case 183:
        case 184:
        case 243:
        case 244:
        case 245:
        case 165:
        case 178:
        case 179:
        case 49:
        case 50:
        case 168:
        case 169:
        case 175:
        case 170:
        case 171:
        case 172:
        case 97:
        case 76:
        case 32:
        case 173:
        case 35:
          return -1;
        case 176:
        case 177:
        case 7:
        case 155:
        case 8:
        case 157:
        case 125:
        case 126:
        case 92:
        case 93:
        case 129:
        case 130:
        case 131:
        case 94:
        case 91:
          return 1;
        case 74:
        case 60:
        case 69:
        case 70:
        case 4:
          return 1024;
        case 31:
        case 42:
        case 72:
          return 32;
        case 87:
        case 26:
        case 33:
          return 2147483647;
        case 34:
        case 1:
          return 47839;
        case 38:
        case 36:
          return 99;
        case 43:
        case 37:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 28: return 32768;
        case 44: return 32767;
        case 75: return 16384;
        case 39: return 1000;
        case 89: return 700;
        case 71: return 256;
        case 40: return 255;
        case 2: return 100;
        case 180: return 64;
        case 25: return 20;
        case 5: return 16;
        case 6: return 6;
        case 73: return 4;
        case 84: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }
  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }
  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret
      }
      return ret;
    }
  var Browser={mainLoop:{scheduler:null,shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function img_onerror(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
        // Canvas event setup
        var canvas = Module['canvas'];
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'];
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        var ctx;
        try {
          if (useWebGL) {
            var contextAttributes = {
              antialias: false,
              alpha: false
            };
            if (webGLContextAttributes) {
              for (var attribute in webGLContextAttributes) {
                contextAttributes[attribute] = webGLContextAttributes[attribute];
              }
            }
            var errorInfo = '?';
            function onContextCreationError(event) {
              errorInfo = event.statusMessage || errorInfo;
            }
            canvas.addEventListener('webglcontextcreationerror', onContextCreationError, false);
            try {
              ['experimental-webgl', 'webgl'].some(function(webglId) {
                return ctx = canvas.getContext(webglId, contextAttributes);
              });
            } finally {
              canvas.removeEventListener('webglcontextcreationerror', onContextCreationError, false);
            }
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas: ' + [errorInfo, e]);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'];
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else if (Browser.resizeCanvas){
            Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
        }
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
        }
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen();
      },requestAnimationFrame:function requestAnimationFrame(func) {
        if (typeof window === 'undefined') { // Provide fallback to setTimeout if window is undefined (e.g. in Node.js)
          setTimeout(func, 1000/60);
        } else {
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                           window['mozRequestAnimationFrame'] ||
                                           window['webkitRequestAnimationFrame'] ||
                                           window['msRequestAnimationFrame'] ||
                                           window['oRequestAnimationFrame'] ||
                                           window['setTimeout'];
          }
          window.requestAnimationFrame(func);
        }
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x, y;
          if (event.type == 'touchstart' ||
              event.type == 'touchend' ||
              event.type == 'touchmove') {
            var t = event.touches.item(0);
            if (t) {
              x = t.pageX - (window.scrollX + rect.left);
              y = t.pageY - (window.scrollY + rect.top);
            } else {
              return;
            }
          } else {
            x = event.pageX - (window.scrollX + rect.left);
            y = event.pageY - (window.scrollY + rect.top);
          }
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function xhr_onload() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        var canvas = Module['canvas'];
        this.windowedWidth = canvas.width;
        this.windowedHeight = canvas.height;
        canvas.width = screen.width;
        canvas.height = screen.height;
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      }};
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); NODEFS.staticInit(); }
__ATINIT__.push({ func: function() { SOCKFS.root = FS.mount(SOCKFS, {}, null); } });
_llvm_eh_exception.buf = allocate(12, "void*", ALLOC_STATIC);
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
staticSealed = true; // seal the static portion of memory
STACK_MAX = STACK_BASE + 5242880;
DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);
assert(DYNAMIC_BASE < TOTAL_MEMORY); // Stack must fit in TOTAL_MEMORY; allocations from here on may enlarge TOTAL_MEMORY
var Math_min = Math.min;
function invoke_viiiii(index,a1,a2,a3,a4,a5) {
  try {
    Module["dynCall_viiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_vii(index,a1,a2) {
  try {
    Module["dynCall_vii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiii(index,a1,a2,a3) {
  try {
    return Module["dynCall_iiii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_v(index) {
  try {
    Module["dynCall_v"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiiii(index,a1,a2,a3,a4,a5,a6) {
  try {
    Module["dynCall_viiiiii"](index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiii(index,a1,a2,a3,a4) {
  try {
    Module["dynCall_viiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm=(function(global,env,buffer){"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env.__ZTVN10__cxxabiv120__si_class_type_infoE|0;var n=env.__ZTVN10__cxxabiv117__class_type_infoE|0;var o=+env.NaN;var p=+env.Infinity;var q=0;var r=0;var s=0;var t=0;var u=0,v=0,w=0,x=0,y=0.0,z=0,A=0,B=0,C=0.0;var D=0;var E=0;var F=0;var G=0;var H=0;var I=0;var J=0;var K=0;var L=0;var M=0;var N=global.Math.floor;var O=global.Math.abs;var P=global.Math.sqrt;var Q=global.Math.pow;var R=global.Math.cos;var S=global.Math.sin;var T=global.Math.tan;var U=global.Math.acos;var V=global.Math.asin;var W=global.Math.atan;var X=global.Math.atan2;var Y=global.Math.exp;var Z=global.Math.log;var _=global.Math.ceil;var $=global.Math.imul;var aa=env.abort;var ab=env.assert;var ac=env.asmPrintInt;var ad=env.asmPrintFloat;var ae=env.min;var af=env.invoke_viiiii;var ag=env.invoke_vi;var ah=env.invoke_vii;var ai=env.invoke_ii;var aj=env.invoke_iiii;var ak=env.invoke_v;var al=env.invoke_viiiiii;var am=env.invoke_iii;var an=env.invoke_viiii;var ao=env._rand;var ap=env._sscanf;var aq=env.___assert_fail;var ar=env.__scanString;var as=env.___cxa_throw;var at=env.___cxa_free_exception;var au=env.__getFloat;var av=env._abort;var aw=env._fprintf;var ax=env._llvm_eh_exception;var ay=env._printf;var az=env._fflush;var aA=env.__reallyNegative;var aB=env._snprintf;var aC=env._clock;var aD=env.___setErrNo;var aE=env._fwrite;var aF=env._send;var aG=env._write;var aH=env._llvm_umul_with_overflow_i32;var aI=env._exit;var aJ=env._sprintf;var aK=env.___cxa_find_matching_catch;var aL=env.___cxa_allocate_exception;var aM=env._sysconf;var aN=env.___cxa_pure_virtual;var aO=env.__formatString;var aP=env._time;var aQ=env._llvm_uadd_with_overflow_i32;var aR=env.___cxa_does_inherit;var aS=env._ceil;var aT=env.__ZSt9terminatev;var aU=env.__ZSt18uncaught_exceptionv;var aV=env._pwrite;var aW=env._sbrk;var aX=env.___cxa_call_unexpected;var aY=env._floor;var aZ=env.___errno_location;var a_=env.___gxx_personality_v0;var a$=env.___cxa_is_number_type;var a0=env.___resumeException;var a1=env.__exit;var a2=0.0;
// EMSCRIPTEN_START_FUNCS
function bc(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+7&-8;return b|0}function bd(){return i|0}function be(a){a=a|0;i=a}function bf(a,b){a=a|0;b=b|0;if((q|0)==0){q=a;r=b}}function bg(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0]}function bh(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0];a[k+4|0]=a[b+4|0];a[k+5|0]=a[b+5|0];a[k+6|0]=a[b+6|0];a[k+7|0]=a[b+7|0]}function bi(a){a=a|0;D=a}function bj(a){a=a|0;E=a}function bk(a){a=a|0;F=a}function bl(a){a=a|0;G=a}function bm(a){a=a|0;H=a}function bn(a){a=a|0;I=a}function bo(a){a=a|0;J=a}function bp(a){a=a|0;K=a}function bq(a){a=a|0;L=a}function br(a){a=a|0;M=a}function bs(){c[628]=n+8;c[630]=n+8;c[632]=m+8;c[636]=m+8;c[640]=m+8;c[644]=m+8;c[648]=m+8;c[652]=m+8;c[656]=n+8;c[658]=m+8;c[662]=n+8;c[664]=m+8}function bt(){bu(30312,-2);return}function bu(a,b){a=a|0;b=b|0;bD(a,b);return}function bv(){bu(30264,-1);return}function bw(c,d,e){c=c|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+40|0;g=f|0;h=f+8|0;j=f+16|0;k=f+24|0;l=f+32|0;m=d;d=e;bx(c);e=100;a[29720]=1;du(g,m);b[c>>1]=b[g>>1]|0;if(!(by(c,30312)|0)){i=f;return}g=h;bx(g|0);b[g+2>>1]=0;if((bz(m)|0)<25){bS(j,m,10,(d|0)/2|0,d);d=j;j=h;b[j>>1]=b[d>>1]|0;b[j+2>>1]=b[d+2>>1]|0}else{if((bz(m)|0)<27){b_(k,m,1e3);d=k;k=h;b[k>>1]=b[d>>1]|0;b[k+2>>1]=b[d+2>>1]|0}else{b1(l,m);m=l;l=h;b[l>>1]=b[m>>1]|0;b[l+2>>1]=b[m+2>>1]|0}}b[c>>1]=b[h>>1]|0;e=b[h+2>>1]|0;i=f;return}function bx(a){a=a|0;bC(a);return}function by(a,b){a=a|0;b=b|0;return(e[a>>1]|0|0)==(e[b>>1]|0|0)|0}function bz(a){a=a|0;return c[a+196>>2]|0}function bA(d,e){d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;f=i;i=i+296|0;g=f|0;h=f+264|0;j=f+272|0;k=f+280|0;l=f+288|0;m=d;d=e;c4(g);while(1){if((a[m]|0)==0){n=26;break}c_(h,m);m=m+4|0;if((a[m]|0)==47){m=m+1|0}if(by(h,30312)|0){n=24;break}b[j>>1]=b[h>>1]|0;if(!(c6(g,j)|0)){n=24;break}b[k>>1]=b[h>>1]|0;c9(g,k)}if((n|0)==24){o=1864;p=o;i=f;return p|0}else if((n|0)==26){c[7428]=0;bw(l,g,d);o=c$(l)|0;p=o;i=f;return p|0}return 0}function bB(){return c[7428]|0}function bC(a){a=a|0;return}function bD(a,c){a=a|0;c=c|0;b[a>>1]=c;return}function bE(){bt();bv();return}function bF(){bu(30304,-2);return}function bG(){bu(30248,-1);return}function bH(d,e,f,g){d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;h=i;i=i+136|0;j=f;f=i;i=i+2|0;i=i+7&-8;b[f>>1]=b[j>>1]|0;j=h|0;k=h+8|0;l=h+16|0;m=h+24|0;n=h+32|0;o=h+40|0;p=h+48|0;q=h+56|0;r=h+64|0;s=h+128|0;t=g;g=d;b[p>>1]=b[f>>1]|0;bI(g|0,e,p);b[g+268>>1]=b[f>>1]|0;bJ(r,g|0);cA(o,t|0,r);r=n;f=o;a[r]=a[f]|0;a[r+1|0]=a[f+1|0]|0;a[r+2|0]=a[f+2|0]|0;a[r+3|0]=a[f+3|0]|0;f=m;r=n;a[f]=a[r]|0;a[f+1|0]=a[r+1|0]|0;a[f+2|0]=a[r+2|0]|0;a[f+3|0]=a[r+3|0]|0;c[q>>2]=c[m>>2];c[l>>2]=t+4;t=k;m=l;a[t]=a[m]|0;a[t+1|0]=a[m+1|0]|0;a[t+2|0]=a[m+2|0]|0;a[t+3|0]=a[m+3|0]|0;m=j;t=k;a[m]=a[t]|0;a[m+1|0]=a[t+1|0]|0;a[m+2|0]=a[t+2|0]|0;a[m+3|0]=a[t+3|0]|0;c[s>>2]=c[j>>2];if(!((c[q>>2]|0)==(c[s>>2]|0)^1)){c[g+264>>2]=bK(g|0)|0;i=h;return}s=c[(c[q>>2]|0)+80>>2]|0;j=c[(c[q>>2]|0)+84>>2]|0;do{if((s|0)>-2147483647){if((j|0)>=2147483647){u=40;break}c[g+264>>2]=((s+j|0)/2|0)-1e3}else{u=40}}while(0);if((u|0)==40){c[g+264>>2]=bK(g|0)|0}i=h;return}function bI(a,c,d){a=a|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0;e=i;i=i+8|0;f=d;d=i;i=i+2|0;i=i+7&-8;b[d>>1]=b[f>>1]|0;f=e|0;g=a;h=c;d_(g|0,h|0,264)|0;b[f>>1]=b[d>>1]|0;c9(a,f);i=e;return}function bJ(a,b){a=a|0;b=b|0;cV(a,b);return}function bK(a){a=a|0;var b=0,c=0;b=a;if(bV(b)|0){c=cU(b)|0;return c|0}else{c=-(cU(b)|0)|0;return c|0}return 0}function bL(a,d){a=a|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0;e=i;i=i+272|0;f=d;d=i;i=i+2|0;i=i+7&-8;b[d>>1]=b[f>>1]|0;f=e|0;g=e+8|0;h=a;c[7428]=(c[7428]|0)+1;a=c[h+4>>2]|0;b[f>>1]=b[d>>1]|0;bI(g,a,f);f=-(bK(g)|0)|0;do{if((f|0)>(c[h+8>>2]|0)){c[h+8>>2]=f;if((c[h+8>>2]|0)<(c[h+12>>2]|0)){break}j=0;k=j;i=e;return k|0}}while(0);j=1;k=j;i=e;return k|0}function bM(d,e,f,g,j,k,l,m){d=d|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0.0,ar=0,as=0,at=0,au=0,av=0,aw=0;n=i;i=i+3968|0;o=n|0;p=n+8|0;q=n+16|0;r=n+24|0;s=n+32|0;t=n+40|0;u=n+48|0;v=n+56|0;w=n+64|0;x=n+72|0;y=n+80|0;z=n+88|0;A=n+96|0;B=n+104|0;C=n+112|0;D=n+120|0;E=n+128|0;F=n+136|0;G=n+144|0;H=n+152|0;I=n+160|0;J=n+168|0;K=n+176|0;L=n+184|0;M=n+192|0;N=n+200|0;O=n+272|0;P=n+336|0;Q=n+344|0;R=n+352|0;S=n+360|0;T=n+368|0;U=n+384|0;V=n+392|0;W=n+464|0;X=n+536|0;Y=n+600|0;Z=n+608|0;_=n+616|0;$=n+624|0;aa=n+640|0;ab=n+3640|0;ac=n+3912|0;ad=n+3920|0;ae=n+3928|0;af=n+3936|0;ag=n+3944|0;ah=n+3952|0;ai=n+3960|0;aj=d;d=e;c[R>>2]=f;c[S>>2]=g;g=j;j=k;k=l;l=m;if((c[R>>2]|0)<=(c[S>>2]|0)){}else{aq(1760,1840,90,1888);return 0}m=(c[7428]|0)+1|0;c[7428]=m;do{if((m|0)>=(c[7580]|0)){f=c[7570]|0;if((f-(aC()|0)|0)>=0){c[7580]=(c[7580]|0)+1e4;break}a[30232]=1;ak=0;al=ak;i=n;return al|0}}while(0);if((d|0)<=1){bN(T,aj,c[R>>2]|0,c[S>>2]|0);if(df(aj,T)|0){ak=c[T+8>>2]|0;am=1}else{ak=c[T+12>>2]|0;am=1}bO(T);al=ak;i=n;return al|0}T=0;if((l|0)>0){m=j;bJ(X,aj);c[P>>2]=-2147483647;c[Q>>2]=2147483647;f=Y;c[f>>2]=c[P>>2];c[f+4>>2]=c[Q>>2];Q=O;f=X;d_(Q|0,f|0,63)|0;f=Y;Y=W;Q=Y|0;X=O;d_(Q|0,X|0,63)|0;X=f;f=Y+64|0;c[f>>2]=c[X>>2];c[f+4>>2]=c[X+4>>2];X=W;W=V;f=W|0;Y=X|0;d_(f|0,Y|0,63)|0;Y=X+64|0;X=W+64|0;c[X>>2]=c[Y>>2];c[X+4>>2]=c[Y+4>>2];Y=m|0;m=V;V=N|0;X=V|0;W=m|0;d_(X|0,W|0,63)|0;W=m+64|0;m=V+64|0;c[m>>2]=c[W>>2];c[m+4>>2]=c[W+4>>2];cu(M,Y,N);N=M;M=U;c[L>>2]=c[N>>2];Y=K;W=L;a[Y]=a[W]|0;a[Y+1|0]=a[W+1|0]|0;a[Y+2|0]=a[W+2|0]|0;a[Y+3|0]=a[W+3|0]|0;W=J;Y=K;a[W]=a[Y]|0;a[W+1|0]=a[Y+1|0]|0;a[W+2|0]=a[Y+2|0]|0;a[W+3|0]=a[Y+3|0]|0;c[M>>2]=c[J>>2];a[M+4|0]=a[N+4|0]&1;T=(c[U>>2]|0)+80|0;if(!(a[U+4|0]&1)){c[Z>>2]=c[T>>2];c[_>>2]=c[T+4>>2];if((c[_>>2]|0)<=(c[R>>2]|0)){ak=c[_>>2]|0;al=ak;i=n;return al|0}if((c[Z>>2]|0)>=(c[S>>2]|0)){ak=c[Z>>2]|0;al=ak;i=n;return al|0}if((c[Z>>2]|0)==(c[_>>2]|0)){ak=c[Z>>2]|0;al=ak;i=n;return al|0}a[H]=a[I]|0;I=R;H=Z;if((c[I>>2]|0)<(c[H>>2]|0)){an=H}else{an=I}c[R>>2]=c[an>>2];a[F]=a[G]|0;G=S;F=_;if((c[F>>2]|0)<(c[G>>2]|0)){ao=F}else{ao=G}c[S>>2]=c[ao>>2]}}ao=bP(bz(aj)|0,d)|0;if((ao|0)!=0){if((bz(aj)|0)>=15){ap=2.0}else{ap=1.6}do{if((c[S>>2]|0)<2147483647){G=~~+bQ((ap*+h[ao+24>>3]+ +(c[S>>2]|0)- +h[ao+16>>3])/+h[ao+8>>3]);F=bM(aj,c[ao>>2]|0,G-1|0,G,0,j,k,0)|0;if(a[30232]&1){ak=0;al=ak;i=n;return al|0}if((F|0)<(G|0)){break}if((T|0)!=0){a[x]=a[y]|0;G=T|0;F=S;if((c[G>>2]|0)<(c[F>>2]|0)){ar=F}else{ar=G}c[T>>2]=c[ar>>2]}ak=c[S>>2]|0;al=ak;i=n;return al|0}}while(0);do{if((c[R>>2]|0)>-2147483647){ar=~~+bQ(((-0.0-ap)*+h[ao+24>>3]+ +(c[R>>2]|0)- +h[ao+16>>3])/+h[ao+8>>3]);y=bM(aj,c[ao>>2]|0,ar,ar+1|0,0,j,k,0)|0;if(a[30232]&1){ak=0;al=ak;i=n;return al|0}if((y|0)>(ar|0)){break}if((T|0)!=0){a[t]=a[u]|0;ar=T+4|0;y=R;if((c[y>>2]|0)<(c[ar>>2]|0)){as=y}else{as=ar}c[T+4>>2]=c[as>>2]}ak=c[R>>2]|0;al=ak;i=n;return al|0}}while(0)}as=$;c[q>>2]=0;c[as>>2]=0;c[r>>2]=0;c[as+4>>2]=0;c[s>>2]=0;c[p>>2]=0;c[o>>2]=c[p>>2];c[as+8>>2]=c[o>>2];o=aa|0;as=o+3e3|0;p=o;do{bx(p);p=p+2|0;}while((p|0)!=(as|0));as=dd(aj,aa|0)|0;p=aa|0;while(1){if(p>>>0>=(aa+(as<<1)|0)>>>0){break}b[ac>>1]=b[p>>1]|0;bH(ab,aj,ac,k+12|0);o=ab;s=$;if((c[s+4>>2]|0)!=(c[s+8>>2]|0)){r=c[s+4>>2]|0;if((r|0)==0){at=0}else{q=r;r=q;u=o;d_(r|0,u|0,272)|0;at=q}q=s+4|0;c[q>>2]=(c[q>>2]|0)+272}else{cn(s,o)}p=p+2|0}c[ad>>2]=c[$>>2];c[ae>>2]=c[$+4>>2];p=C;at=ad;a[p]=a[at]|0;a[p+1|0]=a[at+1|0]|0;a[p+2|0]=a[at+2|0]|0;a[p+3|0]=a[at+3|0]|0;at=B;p=ae;a[at]=a[p]|0;a[at+1|0]=a[p+1|0]|0;a[at+2|0]=a[p+2|0]|0;a[at+3|0]=a[p+3|0]|0;p=c[C>>2]|0;C=c[B>>2]|0;a[z]=a[A]|0;cg(p,C,z);z=0;c[af>>2]=-2147483647;C=c[R>>2]|0;c[ag>>2]=c[$>>2];L179:while(1){c[ah>>2]=c[$+4>>2];if(!((c[ag>>2]|0)==(c[ah>>2]|0)^1)){au=173;break}if(z&1){c[ai>>2]=-(bM(c[ag>>2]|0,d-1|0,(-C|0)-1|0,-C|0,0,j+12|0,k+12|0,l-1|0)|0);if(a[30232]&1){au=143;break}do{if((c[ai>>2]|0)>(C|0)){if((c[ai>>2]|0)>=(c[S>>2]|0)){break}c[ai>>2]=-(bM(c[ag>>2]|0,d-1|0,-(c[S>>2]|0)|0,-(c[ai>>2]|0)|0,0,j+12|0,k+12|0,l-1|0)|0);if(a[30232]&1){au=148;break L179}}}while(0)}else{c[ai>>2]=-(bM(c[ag>>2]|0,d-1|0,-(c[S>>2]|0)|0,-C|0,0,j+12|0,k+12|0,l-1|0)|0);if(a[30232]&1){au=153;break}}if((c[ai>>2]|0)>=(c[S>>2]|0)){au=156;break}if((c[ai>>2]|0)>(c[af>>2]|0)){if((c[ai>>2]|0)>(C|0)){C=c[ai>>2]|0}if((c[ai>>2]|0)>(c[R>>2]|0)){z=1;if((g|0)!=0){b[g>>1]=b[(c[ag>>2]|0)+268>>1]|0}}c[af>>2]=c[ai>>2]}p=ag|0;c[p>>2]=(c[p>>2]|0)+272}if((au|0)==143){ak=0;am=1}else if((au|0)==148){ak=0;am=1}else if((au|0)==153){ak=0;am=1}else if((au|0)==156){if((T|0)!=0){a[D]=a[E]|0;E=T|0;D=ai;if((c[E>>2]|0)<(c[D>>2]|0)){av=D}else{av=E}c[T>>2]=c[av>>2]}ak=c[ai>>2]|0;am=1}else if((au|0)==173){if((T|0)!=0){if((c[af>>2]|0)>(c[R>>2]|0)){R=c[af>>2]|0;c[T+4>>2]=R;c[T>>2]=R}else{a[v]=a[w]|0;w=T+4|0;v=af;if((c[v>>2]|0)<(c[w>>2]|0)){aw=v}else{aw=w}c[T+4>>2]=c[aw>>2]}}ak=c[af>>2]|0;am=1}bR($);al=ak;i=n;return al|0}function bN(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;cQ(a,b,c,d);return}function bO(a){a=a|0;cO(a);return}function bP(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=a;a=b;do{if((a|0)>=3){if((a|0)>10){break}if((d|0)>24){break}b=21712+(d*320|0)+(a-3<<5)|0;if((c[b>>2]|0)==0){e=0;f=e;return f|0}else{e=b;f=e;return f|0}}}while(0);e=0;f=e;return f|0}function bQ(a){a=+a;var b=0.0,c=0.0,d=0.0;b=a;if(b<0.0){c=+_(b-.5);d=c;return+d}else{c=+N(b+.5);d=c;return+d}return 0.0}function bR(a){a=a|0;cM(a);return}function bS(d,e,f,g,j){d=d|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,E=0.0,F=0.0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0;k=i;i=i+104|0;l=k|0;m=k+8|0;n=k+16|0;o=k+24|0;p=k+32|0;q=k+40|0;r=k+48|0;s=k+56|0;t=k+64|0;u=k+88|0;v=k+96|0;w=e;e=f;f=g;bx(t);g=aC()|0;c[7570]=g+(j*1e3|0);c[7580]=(c[7428]|0)+1e4;a[30232]=0;j=e;x=aH(j|0,12)|0;y=D;z=aQ(x|0,4)|0;x=dU(y|D?-1:z)|0;c[x>>2]=j;z=x+4|0;if((j|0)!=0){x=z+(j*12|0)|0;j=z;do{a[q]=a[s]|0;a[p]=a[q]|0;ce(j|0,r);j=j+12|0;}while((j|0)!=(x|0))}x=z;z=2;while(1){if((z|0)>(e|0)){break}j=e;r=aH(j|0,12)|0;q=D;p=aQ(r|0,4)|0;r=dU(q|D?-1:p)|0;c[r>>2]=j;p=r+4|0;if((j|0)!=0){r=p+(j*12|0)|0;j=p;do{a[m]=a[o]|0;a[l]=a[m]|0;ce(j|0,n);j=j+12|0;}while((j|0)!=(r|0))}A=p;bx(u);B=bM(w,z,-2147483647,2147483647,u,A,x,8)|0;if(a[30232]&1){C=231;break}E=+((aC()|0)-g|0)/1.0e6;if(!(a[29720]&1)){r=z;F=E;j=c$(u)|0;q=B;ay(1800,(s=i,i=i+32|0,c[s>>2]=r,h[s+8>>3]=F,c[s+16>>2]=j,c[s+24>>2]=q,s)|0)|0;i=s}s=x;if((s|0)!=0){q=s-4|0;j=s+((c[q>>2]|0)*12|0)|0;if((s|0)!=(j|0)){r=j;do{r=r-12|0;bT(r);}while((r|0)!=(s|0))}dW(q)}x=A;b[t>>1]=b[u>>1]|0;if(E*1.0e3>+(f|0)){C=248;break}z=z+1|0}z=x;if((z|0)!=0){x=z-4|0;C=z+((c[x>>2]|0)*12|0)|0;if((z|0)!=(C|0)){f=C;do{f=f-12|0;bT(f);}while((f|0)!=(z|0))}dW(x)}if(!(a[30232]&1)){G=B;H=G&65535;b[v>>1]=H;I=d;J=t;K=v;L=I;M=K;N=J;O=L;P=N;Q=M;R=O;S=R|0;T=P;U=S;V=T;b[U>>1]=b[V>>1]|0;W=R+2|0;X=Q;Y=b[X>>1]|0;b[W>>1]=Y;i=k;return}x=A;if((x|0)!=0){A=x-4|0;z=x+((c[A>>2]|0)*12|0)|0;if((x|0)!=(z|0)){f=z;do{f=f-12|0;bT(f);}while((f|0)!=(x|0))}dW(A)}G=B;H=G&65535;b[v>>1]=H;I=d;J=t;K=v;L=I;M=K;N=J;O=L;P=N;Q=M;R=O;S=R|0;T=P;U=S;V=T;b[U>>1]=b[V>>1]|0;W=R+2|0;X=Q;Y=b[X>>1]|0;b[W>>1]=Y;i=k;return}function bT(a){a=a|0;cI(a);return}function bU(e,f,g,h){e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;j=i;i=i+2672|0;k=j|0;l=j+8|0;m=j+16|0;n=j+24|0;o=j+32|0;p=j+40|0;q=j+48|0;r=j+112|0;s=j+120|0;t=j+128|0;u=j+2128|0;v=j+2136|0;w=j+2400|0;x=j+2664|0;y=e;e=f;f=g;g=h;bJ(q,y);cc(p,g|0,q);h=o;z=p;a[h]=a[z]|0;a[h+1|0]=a[z+1|0]|0;a[h+2|0]=a[z+2|0]|0;a[h+3|0]=a[z+3|0]|0;z=n;h=o;a[z]=a[h]|0;a[z+1|0]=a[h+1|0]|0;a[z+2|0]=a[h+2|0]|0;a[z+3|0]=a[h+3|0]|0;c[r>>2]=c[n>>2];c[m>>2]=g+4;n=l;h=m;a[n]=a[h]|0;a[n+1|0]=a[h+1|0]|0;a[n+2|0]=a[h+2|0]|0;a[n+3|0]=a[h+3|0]|0;h=k;n=l;a[h]=a[n]|0;a[h+1|0]=a[n+1|0]|0;a[h+2|0]=a[n+2|0]|0;a[h+3|0]=a[n+3|0]|0;c[s>>2]=c[k>>2];if((c[r>>2]|0)==(c[s>>2]|0)^1){if(bV(y)|0){A=c[(c[r>>2]|0)+80>>2]|0}else{A=-(c[(c[r>>2]|0)+80>>2]|0)|0}B=A;C=B;i=j;return C|0}A=(c[7428]|0)+1|0;c[7428]=A;do{if((A|0)>=(c[7580]|0)){r=c[7570]|0;if((r-(aC()|0)|0)<0){r=aL(1)|0;as(r|0,2624,0);return 0}else{c[7580]=(c[7580]|0)+1e4;break}}}while(0);A=t|0;r=A+2e3|0;s=A;do{bx(s);s=s+2|0;}while((s|0)!=(r|0));r=dd(y,t|0)|0;do{if(bW(t|0)|0){s=bX(y)|0;if((s|0)<0){B=s;C=B;i=j;return C|0}if((s|0)!=0){break}b[u>>1]=b[t>>1]|0;bI(v,y,u);r=dd(v,t|0)|0;if(bW(t|0)|0){B=0;C=B;i=j;return C|0}else{s=1672+((bY(t|0)|0)<<2)|0;B=-(c[(d[s]|d[s+1|0]<<8|d[s+2|0]<<16|d[s+3|0]<<24)+4>>2]|0)|0;C=B;i=j;return C|0}}}while(0);v=t|0;while(1){if(v>>>0>=(t+(r<<1)|0)>>>0){break}b[x>>1]=b[v>>1]|0;bI(w,y,x);u=-(bU(w,-f|0,-e|0,g+12|0)|0)|0;if((u|0)>(e|0)){e=u;if((e|0)>0){D=306;break}if((e|0)>=(f|0)){D=306;break}}v=v+2|0}if(bV(y)|0){E=e}else{E=-e|0}c[(bZ(g,q)|0)>>2]=E;B=e;C=B;i=j;return C|0}function bV(a){a=a|0;return(c[a+196>>2]&1|0)==0|0}function bW(a){a=a|0;return(e[a>>1]|0|0)==65535|0}function bX(a){a=a|0;var b=0,c=0,d=0;b=a;a=cG(b)|0;c=cH(b)|0;if(bV(b)|0){d=a-c|0;return d|0}else{d=c-a|0;return d|0}return 0}function bY(a){a=a|0;return(e[a>>1]|0)>>11|0}function bZ(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;e=i;i=i+320|0;f=e|0;g=e+8|0;h=e+24|0;j=e+32|0;k=e+48|0;l=e+56|0;m=e+64|0;n=e+72|0;o=e+80|0;p=e+88|0;q=e+96|0;r=e+104|0;s=e+112|0;t=e+120|0;u=e+128|0;v=e+144|0;w=e+152|0;x=e+264|0;y=e+280|0;z=e+296|0;A=e+304|0;B=d;d=b;b=b5(d,x,B)|0;C=c[b>>2]|0;D=c[b>>2]|0;c[e+272>>2]=0;if((D|0)!=0){E=C;F=E+16|0;G=F|0;H=G+64|0;i=e;return H|0}b6(A,d,B);c[z>>2]=A;B=s;D=z;a[B]=a[D]|0;a[B+1|0]=a[D+1|0]|0;a[B+2|0]=a[D+2|0]|0;a[B+3|0]=a[D+3|0]|0;D=r;B=s;a[D]=a[B]|0;a[D+1|0]=a[B+1|0]|0;a[D+2|0]=a[B+2|0]|0;a[D+3|0]=a[B+3|0]|0;B=y|0;D=c[r>>2]|0;s=c[D>>2]|0;c[D>>2]=0;D=s;s=q;z=(c[r>>2]|0)+4|0;c[s>>2]=c[z>>2];c[s+4>>2]=c[z+4>>2];z=p;s=q;d_(z|0,s|0,8)|0;s=B;B=D;D=o;z=p;d_(D|0,z|0,8)|0;c[m>>2]=B;B=s;s=c[m>>2]|0;m=n;z=o;c[m>>2]=c[z>>2];c[m+4>>2]=c[z+4>>2];z=l;m=n;d_(z|0,m|0,8)|0;c[k>>2]=s;s=B;c[s>>2]=c[k>>2];k=s+4|0;s=l;c[k>>2]=c[s>>2];c[k+4>>2]=c[s+4>>2];s=A;A=c[s>>2]|0;c[s>>2]=0;if((A|0)!=0){k=A;A=s+4|0;if(a[A+5|0]&1){a[h]=a[j]|0;}if(a[A+4|0]&1){a[f]=a[g]|0;}if((k|0)!=0){dV(k)}}b7(d|0,c[x>>2]|0,b,c[y>>2]|0);b=y;x=c[b>>2]|0;c[b>>2]=0;C=x;x=y;y=c[x>>2]|0;c[x>>2]=0;if((y|0)!=0){b=y;y=x+4|0;if(a[y+5|0]&1){a[v]=a[w]|0;}if(a[y+4|0]&1){a[t]=a[u]|0;}if((b|0)!=0){dV(b)}}E=C;F=E+16|0;G=F|0;H=G+64|0;i=e;return H|0}function b_(d,e,f){d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;g=i;i=i+2832|0;h=g|0;j=g+8|0;k=g+16|0;l=g+24|0;m=g+32|0;n=g+544|0;o=g+2544|0;p=g+2552|0;q=g+2816|0;r=g+2824|0;s=e;c[7570]=(aC()|0)+(f*1e6|0);c[7580]=(c[7428]|0)+1e4;f=m|0;e=f+504|0;t=f;do{a[j]=a[l]|0;a[h]=a[j]|0;b3(t|0,k);t=t+12|0;}while((t|0)!=(e|0));c[7428]=(c[7428]|0)+1;e=-2147483647;t=2147483647;k=n|0;j=k+2e3|0;h=k;do{bx(h);h=h+2|0;}while((h|0)!=(j|0));j=dd(s,n|0)|0;bx(o);h=n|0;while(1){if(h>>>0>=(n+(j<<1)|0)>>>0){break}b[q>>1]=b[h>>1]|0;bI(p,s,q);k=-(bU(p,-t|0,-e|0,m|0)|0)|0;if((k|0)>(e|0)){e=k;b[o>>1]=b[h>>1]|0;if((e|0)>0){u=391;break}if((e|0)>=(t|0)){u=391;break}}h=h+2|0}b[r>>1]=e&65535;e=d;b[e>>1]=b[o>>1]|0;b[e+2>>1]=b[r>>1]|0;r=m|0;m=r+504|0;do{m=m-12|0;b$(m);}while((m|0)!=(r|0));i=g;return}function b$(a){a=a|0;cC(a);return}function b0(d,e,f,g,h){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;j=i;i=i+2400|0;k=j|0;l=j+8|0;m=j+16|0;n=j+24|0;o=j+32|0;p=j+40|0;q=j+48|0;r=j+112|0;s=j+120|0;t=j+128|0;u=j+2128|0;v=j+2392|0;w=d;d=e;e=f;f=g;g=h;bJ(q,w);cc(p,g|0,q);h=o;x=p;a[h]=a[x]|0;a[h+1|0]=a[x+1|0]|0;a[h+2|0]=a[x+2|0]|0;a[h+3|0]=a[x+3|0]|0;x=n;h=o;a[x]=a[h]|0;a[x+1|0]=a[h+1|0]|0;a[x+2|0]=a[h+2|0]|0;a[x+3|0]=a[h+3|0]|0;c[r>>2]=c[n>>2];c[m>>2]=g+4;n=l;h=m;a[n]=a[h]|0;a[n+1|0]=a[h+1|0]|0;a[n+2|0]=a[h+2|0]|0;a[n+3|0]=a[h+3|0]|0;h=k;n=l;a[h]=a[n]|0;a[h+1|0]=a[n+1|0]|0;a[h+2|0]=a[n+2|0]|0;a[h+3|0]=a[n+3|0]|0;c[s>>2]=c[k>>2];if((c[r>>2]|0)==(c[s>>2]|0)^1){if(bV(w)|0){y=c[(c[r>>2]|0)+80>>2]|0}else{y=-(c[(c[r>>2]|0)+80>>2]|0)|0}z=y;A=z;i=j;return A|0}c[7428]=(c[7428]|0)+1;y=t|0;r=y+2e3|0;s=y;do{bx(s);s=s+2|0;}while((s|0)!=(r|0));r=dd(w,t|0)|0;do{if(bW(t|0)|0){s=d+1|0;d=s;if((s|0)<2){break}z=bX(w)|0;A=z;i=j;return A|0}else{d=0}}while(0);s=t|0;while(1){if(s>>>0>=(t+(r<<1)|0)>>>0){B=438;break}b[v>>1]=b[s>>1]|0;bI(u,w,v);y=-(b0(u,d,-f|0,-e|0,g+12|0)|0)|0;if((y|0)>(e|0)){e=y;if((e|0)>=(f|0)){B=431;break}}s=s+2|0}if((B|0)==431){if(bV(w)|0){C=f}else{C=-f|0}c[(bZ(g,q)|0)>>2]=C;z=f;A=z;i=j;return A|0}else if((B|0)==438){if(bV(w)|0){D=e}else{D=-e|0}c[(bZ(g,q)|0)>>2]=D;z=e;A=z;i=j;return A|0}return 0}function b1(d,e){d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;f=i;i=i+2328|0;g=f|0;h=f+8|0;j=f+16|0;k=f+24|0;l=f+40|0;m=f+2040|0;n=f+2048|0;o=f+2312|0;p=f+2320|0;q=e;e=44-(bz(q)|0)|0;r=aH(e|0,12)|0;s=D;t=aQ(r|0,4)|0;r=dU(s|D?-1:t)|0;c[r>>2]=e;t=r+4|0;if((e|0)!=0){r=t+(e*12|0)|0;e=t;do{a[h]=a[k]|0;a[g]=a[h]|0;b3(e|0,j);e=e+12|0;}while((e|0)!=(r|0))}r=t;c[7428]=(c[7428]|0)+1;t=-2147483647;e=2147483647;j=l|0;h=j+2e3|0;g=j;do{bx(g);g=g+2|0;}while((g|0)!=(h|0));h=dd(q,l|0)|0;g=bW(l|0)|0;j=g?1:0;bx(m);g=l|0;while(1){if(g>>>0>=(l+(h<<1)|0)>>>0){break}b[o>>1]=b[g>>1]|0;bI(n,q,o);k=-(b0(n,j,-e|0,-t|0,r)|0)|0;if((k|0)>(t|0)){t=k;b[m>>1]=b[g>>1]|0}g=g+2|0}g=r;if((g|0)==0){u=t;v=u&65535;b[p>>1]=v;w=d;x=m;y=p;z=w;A=y;B=x;C=z;E=B;F=A;G=C;H=G|0;I=E;J=H;K=I;b[J>>1]=b[K>>1]|0;L=G+2|0;M=F;N=b[M>>1]|0;b[L>>1]=N;i=f;return}r=g-4|0;e=g+((c[r>>2]|0)*12|0)|0;if((g|0)!=(e|0)){j=e;do{j=j-12|0;b$(j);}while((j|0)!=(g|0))}dW(r);u=t;v=u&65535;b[p>>1]=v;w=d;x=m;y=p;z=w;A=y;B=x;C=z;E=B;F=A;G=C;H=G|0;I=E;J=H;K=I;b[J>>1]=b[K>>1]|0;L=G+2|0;M=F;N=b[M>>1]|0;b[L>>1]=N;i=f;return}function b2(a){a=a|0;var b=0;b=a;bO(b);dV(b);return}function b3(a,b){a=a|0;b=b|0;b4(a,b);return}function b4(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;d=i;i=i+56|0;e=d|0;f=d+16|0;g=d+40|0;h=b;c[h+4>>2]=0;a[g]=a[d+48|0]|0;a[d+32|0]=a[g]|0;c[f>>2]=0;g=c[f>>2]|0;a[d+8|0]=a[d+24|0]|0;c[e>>2]=g;c[h+8>>2]=c[e>>2];c[h>>2]=h+4;i=d;return}function b5(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0;e=i;i=i+24|0;f=e+8|0;g=e+16|0;h=b;b=d;d=a;a=c[d+4>>2]|0;c[e>>2]=0;if((a|0)==0){c[h>>2]=d+4;j=c[h>>2]|0;k=j;i=e;return k|0}while(1){if(cb(b,a+16|0)|0){d=c[a>>2]|0;c[f>>2]=0;if((d|0)==0){l=489;break}a=c[a>>2]|0}else{if(!(cb(a+16|0,b)|0)){l=496;break}d=c[a+4>>2]|0;c[g>>2]=0;if((d|0)==0){l=494;break}a=c[a+4>>2]|0}}if((l|0)==496){c[h>>2]=a;j=h;k=j;i=e;return k|0}else if((l|0)==489){c[h>>2]=a;j=c[h>>2]|0;k=j;i=e;return k|0}else if((l|0)==494){c[h>>2]=a;j=(c[h>>2]|0)+4|0;k=j;i=e;return k|0}return 0}function b6(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0;f=i;i=i+664|0;g=f|0;h=f+8|0;j=f+16|0;k=f+24|0;l=f+32|0;m=f+40|0;n=f+48|0;o=f+56|0;p=f+64|0;q=f+72|0;r=f+80|0;s=f+96|0;t=f+104|0;u=f+120|0;v=f+128|0;w=f+136|0;x=f+144|0;y=f+152|0;z=f+160|0;A=f+168|0;B=f+176|0;C=f+184|0;D=f+240|0;E=f+248|0;F=f+264|0;G=f+272|0;H=f+280|0;I=f+288|0;J=f+296|0;K=f+304|0;L=f+312|0;M=f+320|0;N=f+328|0;O=f+336|0;P=f+344|0;Q=f+352|0;R=f+368|0;S=f+376|0;T=f+392|0;U=f+400|0;V=f+416|0;W=f+424|0;X=f+440|0;Y=f+448|0;Z=f+456|0;_=f+464|0;$=f+472|0;aa=f+480|0;ab=f+488|0;ac=f+496|0;ad=f+504|0;ae=f+512|0;af=f+616|0;ag=f+632|0;ah=f+640|0;ai=f+648|0;aj=e;e=dT(1*84|0)|0;ak=ag;c[ak>>2]=d+4;a[ak+4|0]=0;a[ak+5|0]=0;ak=ae;d=ag;d_(ak|0,d|0,8)|0;d=af;ak=e;e=ad;ag=ae;d_(e|0,ag|0,8)|0;c[ab>>2]=ak;ak=d|0;d=c[ab>>2]|0;ab=ac;ag=ad;c[ab>>2]=c[ag>>2];c[ab+4>>2]=c[ag+4>>2];ag=aa;ab=ac;d_(ag|0,ab|0,8)|0;ab=ak;ak=d;d=$;ag=aa;d_(d|0,ag|0,8)|0;c[Z>>2]=ak;ak=ab;ab=c[Z>>2]|0;Z=_;ag=$;c[Z>>2]=c[ag>>2];c[Z+4>>2]=c[ag+4>>2];ag=Y;Z=_;d_(ag|0,Z|0,8)|0;c[X>>2]=ab;ab=ak;c[ab>>2]=c[X>>2];X=ab+4|0;ab=Y;c[X>>2]=c[ab>>2];c[X+4>>2]=c[ab+4>>2];ab=(c[af>>2]|0)+16|0;if((ab|0)==0){al=0}else{X=ab;ab=X;Y=aj;d_(ab|0,Y|0,63)|0;al=X}a[af+8|0]=1;X=(c[af>>2]|0)+80|0;if((X|0)==0){am=0}else{al=X;c[al>>2]=0;am=al}a[af+9|0]=1;c[F>>2]=af;al=C;am=F;a[al]=a[am]|0;a[al+1|0]=a[am+1|0]|0;a[al+2|0]=a[am+2|0]|0;a[al+3|0]=a[am+3|0]|0;am=B;al=C;a[am]=a[al]|0;a[am+1|0]=a[al+1|0]|0;a[am+2|0]=a[al+2|0]|0;a[am+3|0]=a[al+3|0]|0;al=E|0;am=c[B>>2]|0;C=c[am>>2]|0;c[am>>2]=0;am=C;C=A;F=(c[B>>2]|0)+4|0;c[C>>2]=c[F>>2];c[C+4>>2]=c[F+4>>2];F=z;C=A;d_(F|0,C|0,8)|0;C=al;al=am;am=y;F=z;d_(am|0,F|0,8)|0;c[w>>2]=al;al=C;C=c[w>>2]|0;w=x;F=y;c[w>>2]=c[F>>2];c[w+4>>2]=c[F+4>>2];F=v;w=x;d_(F|0,w|0,8)|0;c[u>>2]=C;C=al;c[C>>2]=c[u>>2];u=C+4|0;C=v;c[u>>2]=c[C>>2];c[u+4>>2]=c[C+4>>2];c[D>>2]=E;C=p;u=D;a[C]=a[u]|0;a[C+1|0]=a[u+1|0]|0;a[C+2|0]=a[u+2|0]|0;a[C+3|0]=a[u+3|0]|0;u=o;C=p;a[u]=a[C]|0;a[u+1|0]=a[C+1|0]|0;a[u+2|0]=a[C+2|0]|0;a[u+3|0]=a[C+3|0]|0;C=ai|0;u=c[o>>2]|0;p=c[u>>2]|0;c[u>>2]=0;u=p;p=n;D=(c[o>>2]|0)+4|0;c[p>>2]=c[D>>2];c[p+4>>2]=c[D+4>>2];D=m;p=n;d_(D|0,p|0,8)|0;p=C;C=u;u=l;D=m;d_(u|0,D|0,8)|0;c[j>>2]=C;C=p;p=c[j>>2]|0;j=k;D=l;c[j>>2]=c[D>>2];c[j+4>>2]=c[D+4>>2];D=h;j=k;d_(D|0,j|0,8)|0;c[g>>2]=p;p=C;c[p>>2]=c[g>>2];g=p+4|0;p=h;c[g>>2]=c[p>>2];c[g+4>>2]=c[p+4>>2];p=E;E=c[p>>2]|0;c[p>>2]=0;if((E|0)!=0){g=E;E=p+4|0;if(a[E+5|0]&1){a[s]=a[t]|0;}if(a[E+4|0]&1){a[q]=a[r]|0;}if((g|0)!=0){dV(g)}}c[ah>>2]=ai;g=O;r=ah;a[g]=a[r]|0;a[g+1|0]=a[r+1|0]|0;a[g+2|0]=a[r+2|0]|0;a[g+3|0]=a[r+3|0]|0;r=N;g=O;a[r]=a[g]|0;a[r+1|0]=a[g+1|0]|0;a[r+2|0]=a[g+2|0]|0;a[r+3|0]=a[g+3|0]|0;g=b|0;b=c[N>>2]|0;r=c[b>>2]|0;c[b>>2]=0;b=r;r=M;O=(c[N>>2]|0)+4|0;c[r>>2]=c[O>>2];c[r+4>>2]=c[O+4>>2];O=L;r=M;d_(O|0,r|0,8)|0;r=g;g=b;b=K;O=L;d_(b|0,O|0,8)|0;c[I>>2]=g;g=r;r=c[I>>2]|0;I=J;O=K;c[I>>2]=c[O>>2];c[I+4>>2]=c[O+4>>2];O=H;I=J;d_(O|0,I|0,8)|0;c[G>>2]=r;r=g;c[r>>2]=c[G>>2];G=r+4|0;r=H;c[G>>2]=c[r>>2];c[G+4>>2]=c[r+4>>2];r=ai;ai=c[r>>2]|0;c[r>>2]=0;if((ai|0)!=0){G=ai;ai=r+4|0;if(a[ai+5|0]&1){a[R]=a[S]|0;}if(a[ai+4|0]&1){a[P]=a[Q]|0;}if((G|0)!=0){dV(G)}}G=af;af=c[G>>2]|0;c[G>>2]=0;if((af|0)==0){i=f;return}Q=af;af=G+4|0;if(a[af+5|0]&1){a[V]=a[W]|0;}if(a[af+4|0]&1){a[T]=a[U]|0;}if((Q|0)!=0){dV(Q)}i=f;return}function b7(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;i=i+24|0;g=d;d=e;e=a;c[f>>2]=0;c[d>>2]=0;c[f+8>>2]=0;c[d+4>>2]=0;c[d+8>>2]=b;c[g>>2]=d;d=c[c[e>>2]>>2]|0;c[f+16>>2]=0;if((d|0)!=0){c[e>>2]=c[c[e>>2]>>2]}b8(c[e+4>>2]|0,c[g>>2]|0);g=e+8|0;c[g>>2]=(c[g>>2]|0)+1;i=f;return}function b8(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0;e=i;i=i+16|0;f=e|0;g=e+8|0;h=b;b=d;a[b+12|0]=(b|0)==(h|0)|0;while(1){if((b|0)!=(h|0)){j=a[(c[b+8>>2]|0)+12|0]&1^1}else{j=0}if(!j){k=595;break}d=c[b+8>>2]|0;if((d|0)==(c[c[d+8>>2]>>2]|0)){d=c[(c[(c[b+8>>2]|0)+8>>2]|0)+4>>2]|0;c[f>>2]=0;if((d|0)==0){k=580;break}if(a[d+12|0]&1){k=580;break}b=c[b+8>>2]|0;a[b+12|0]=1;b=c[b+8>>2]|0;a[b+12|0]=(b|0)==(h|0)|0;a[d+12|0]=1}else{d=c[c[(c[b+8>>2]|0)+8>>2]>>2]|0;c[g>>2]=0;if((d|0)==0){k=589;break}if(a[d+12|0]&1){k=589;break}b=c[b+8>>2]|0;a[b+12|0]=1;b=c[b+8>>2]|0;a[b+12|0]=(b|0)==(h|0)|0;a[d+12|0]=1}}if((k|0)==580){h=b;if((h|0)!=(c[c[h+8>>2]>>2]|0)){b=c[b+8>>2]|0;b9(b)}b=c[b+8>>2]|0;a[b+12|0]=1;b=c[b+8>>2]|0;a[b+12|0]=0;ca(b);i=e;return}else if((k|0)==589){h=b;if((h|0)==(c[c[h+8>>2]>>2]|0)){b=c[b+8>>2]|0;ca(b)}b=c[b+8>>2]|0;a[b+12|0]=1;b=c[b+8>>2]|0;a[b+12|0]=0;b9(b);i=e;return}else if((k|0)==595){i=e;return}}function b9(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0;b=i;i=i+8|0;d=a;a=c[d+4>>2]|0;c[d+4>>2]=c[a>>2];e=c[d+4>>2]|0;c[b>>2]=0;if((e|0)!=0){c[(c[d+4>>2]|0)+8>>2]=d}c[a+8>>2]=c[d+8>>2];e=d;if((e|0)==(c[c[e+8>>2]>>2]|0)){c[c[d+8>>2]>>2]=a;f=d;g=a;h=g;j=h|0;c[j>>2]=f;k=a;l=d;m=l+8|0;c[m>>2]=k;i=b;return}else{c[(c[d+8>>2]|0)+4>>2]=a;f=d;g=a;h=g;j=h|0;c[j>>2]=f;k=a;l=d;m=l+8|0;c[m>>2]=k;i=b;return}}function ca(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;b=i;i=i+8|0;d=a;a=c[d>>2]|0;c[d>>2]=c[a+4>>2];e=c[d>>2]|0;c[b>>2]=0;if((e|0)!=0){c[(c[d>>2]|0)+8>>2]=d}c[a+8>>2]=c[d+8>>2];e=d;if((e|0)==(c[c[e+8>>2]>>2]|0)){c[c[d+8>>2]>>2]=a;f=d;g=a;h=g+4|0;c[h>>2]=f;j=a;k=d;l=k+8|0;c[l>>2]=j;i=b;return}else{c[(c[d+8>>2]|0)+4>>2]=a;f=d;g=a;h=g+4|0;c[h>>2]=f;j=a;k=d;l=k+8|0;c[l>>2]=j;i=b;return}}function cb(a,b){a=a|0;b=b|0;return(d0(a|0,b|0,63)|0)<0|0}function cc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=i;i=i+16|0;f=e|0;g=e+8|0;h=d;d=b;cd(f,d,h,c[d+4>>2]|0,d+4|0);c[g>>2]=d+4;do{if((c[f>>2]|0)==(c[g>>2]|0)^1){if(cb(h,(c[f>>2]|0)+16|0)|0){break}c[a>>2]=c[f>>2];i=e;return}}while(0);c[a>>2]=d+4;i=e;return}function cd(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0;b=i;i=i+8|0;g=b|0;h=d;d=e;e=f;while(1){c[g>>2]=0;if((d|0)==0){break}if(cb(d+16|0,h)|0){d=c[d+4>>2]|0}else{e=d;d=c[d>>2]|0}}c[a>>2]=e;i=b;return}function ce(a,b){a=a|0;b=b|0;cf(a,b);return}function cf(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;d=i;i=i+56|0;e=d|0;f=d+16|0;g=d+40|0;h=b;c[h+4>>2]=0;a[g]=a[d+48|0]|0;a[d+32|0]=a[g]|0;c[f>>2]=0;g=c[f>>2]|0;a[d+8|0]=a[d+24|0]|0;c[e>>2]=g;c[h+8>>2]=c[e>>2];c[h>>2]=h+4;i=d;return}function cg(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;d=i;i=i+1632|0;e=d|0;f=d+272|0;g=d+544|0;h=d+816|0;j=d+1088|0;k=d+1360|0;l=a;a=b;b=c;L666:while(1){L668:while(1){c=(a-l|0)/272|0;switch(c|0){case 4:{m=647;break L666;break};case 0:case 1:{m=642;break L666;break};case 2:{m=643;break L666;break};case 3:{m=646;break L666;break};case 5:{m=648;break L666;break};default:{}}if((c|0)<=30){m=650;break L666}n=l;o=a;o=o-272|0;if((c|0)>=1e3){p=(c|0)/2|0;n=n+(p*272|0)|0;p=(p|0)/2|0;q=cj(l,l+(p*272|0)|0,n,n+(p*272|0)|0,o,b)|0}else{p=(c|0)/2|0;n=n+(p*272|0)|0;q=ch(l,n,o,b)|0}r=l;s=o;if(cm(r,n)|0){break}while(1){o=s-272|0;s=o;if((r|0)==(o|0)){break}if(cm(s,n)|0){m=679;break L668}}r=r+272|0;s=a;o=s-272|0;s=o;if(!(cm(l,o)|0)){while(1){if((r|0)==(s|0)){m=660;break L666}if(cm(l,r)|0){break}r=r+272|0}o=r;c=s;t=j;u=o;d_(t|0,u|0,272)|0;u=o;o=c;d_(u|0,o|0,270)|0;o=c;c=j;d_(o|0,c|0,270)|0;q=q+1|0;r=r+272|0}if((r|0)==(s|0)){m=666;break L666}while(1){while(1){if(!((cm(l,r)|0)^1)){break}r=r+272|0}do{c=s-272|0;s=c;}while(cm(l,c)|0);if(r>>>0>=s>>>0){break}c=r;o=s;u=h;t=c;d_(u|0,t|0,272)|0;t=c;c=o;d_(t|0,c|0,270)|0;c=o;o=h;d_(c|0,o|0,270)|0;q=q+1|0;r=r+272|0}l=r}if((m|0)==679){m=0;o=r;c=s;t=g;u=o;d_(t|0,u|0,272)|0;u=o;o=c;d_(u|0,o|0,270)|0;o=c;c=g;d_(o|0,c|0,270)|0;q=q+1|0}r=r+272|0;if(r>>>0<s>>>0){while(1){while(1){if(!(cm(r,n)|0)){break}r=r+272|0}do{c=s-272|0;s=c;}while((cm(c,n)|0)^1);if(r>>>0>s>>>0){break}c=r;o=s;u=f;t=c;d_(u|0,t|0,272)|0;t=c;c=o;d_(t|0,c|0,270)|0;c=o;o=f;d_(c|0,o|0,270)|0;q=q+1|0;if((n|0)==(r|0)){n=s}r=r+272|0}}do{if((r|0)!=(n|0)){if(!(cm(n,r)|0)){break}o=r;c=n;t=e;u=o;d_(t|0,u|0,272)|0;u=o;o=c;d_(u|0,o|0,270)|0;o=c;c=e;d_(o|0,c|0,270)|0;q=q+1|0}}while(0);if((q|0)==0){c=(cl(l,r,b)|0)&1;if(cl(r+272|0,a,b)|0){if(c&1){m=702;break}a=r;continue}if(c&1){c=r+272|0;r=c;l=c;continue}}if(((r-l|0)/272|0|0)<((a-r|0)/272|0|0)){cg(l,r,b);c=r+272|0;r=c;l=c}else{cg(r+272|0,a,b);a=r}}if((m|0)==702){i=d;return}else if((m|0)==666){i=d;return}else if((m|0)==647){r=a-272|0;a=r;ci(l,l+272|0,l+544|0,r,b)|0;i=d;return}else if((m|0)==642){i=d;return}else if((m|0)==643){r=a-272|0;a=r;if(cm(r,l)|0){r=l;q=a;e=k;n=r;d_(e|0,n|0,272)|0;n=r;r=q;d_(n|0,r|0,270)|0;r=q;q=k;d_(r|0,q|0,270)|0}i=d;return}else if((m|0)==646){q=a-272|0;a=q;ch(l,l+272|0,q,b)|0;i=d;return}else if((m|0)==648){q=a-272|0;a=q;cj(l,l+272|0,l+544|0,l+816|0,q,b)|0;i=d;return}else if((m|0)==660){i=d;return}else if((m|0)==650){ck(l,a,b);i=d;return}}function ch(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;d=i;i=i+1360|0;e=d|0;f=d+272|0;g=d+544|0;h=d+816|0;j=d+1088|0;k=a;a=b;b=c;c=0;if(cm(a,k)|0){if(cm(b,a)|0){l=k;m=b;n=e;o=l;d_(n|0,o|0,272)|0;o=l;l=m;d_(o|0,l|0,270)|0;l=m;m=e;d_(l|0,m|0,270)|0;c=1;p=c;q=p;i=d;return q|0}m=k;l=a;e=f;o=m;d_(e|0,o|0,272)|0;o=m;m=l;d_(o|0,m|0,270)|0;m=l;l=f;d_(m|0,l|0,270)|0;c=1;if(cm(b,a)|0){l=a;m=b;f=h;o=l;d_(f|0,o|0,272)|0;o=l;l=m;d_(o|0,l|0,270)|0;l=m;m=h;d_(l|0,m|0,270)|0;c=2}p=c;q=p;i=d;return q|0}else{if(!(cm(b,a)|0)){p=c;q=p;i=d;return q|0}m=a;l=b;b=j;h=m;d_(b|0,h|0,272)|0;h=m;m=l;d_(h|0,m|0,270)|0;m=l;l=j;d_(m|0,l|0,270)|0;c=1;if(cm(a,k)|0){l=k;k=a;a=g;m=l;d_(a|0,m|0,272)|0;m=l;l=k;d_(m|0,l|0,270)|0;l=k;k=g;d_(l|0,k|0,270)|0;c=2}p=c;q=p;i=d;return q|0}return 0}function ci(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;i=i+816|0;g=f|0;h=f+272|0;j=f+544|0;k=a;a=b;b=c;c=d;d=ch(k,a,b,e)|0;if(!(cm(c,b)|0)){l=d;i=f;return l|0}e=b;m=c;c=j;n=e;d_(c|0,n|0,272)|0;n=e;e=m;d_(n|0,e|0,270)|0;e=m;m=j;d_(e|0,m|0,270)|0;d=d+1|0;if(cm(b,a)|0){m=a;e=b;b=g;j=m;d_(b|0,j|0,272)|0;j=m;m=e;d_(j|0,m|0,270)|0;m=e;e=g;d_(m|0,e|0,270)|0;d=d+1|0;if(cm(a,k)|0){e=k;k=a;a=h;m=e;d_(a|0,m|0,272)|0;m=e;e=k;d_(m|0,e|0,270)|0;e=k;k=h;d_(e|0,k|0,270)|0;d=d+1|0}}l=d;i=f;return l|0}function cj(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;g=i;i=i+1088|0;h=g|0;j=g+272|0;k=g+544|0;l=g+816|0;m=a;a=b;b=c;c=d;d=e;e=ci(m,a,b,c,f)|0;if(!(cm(d,c)|0)){n=e;i=g;return n|0}f=c;o=d;d=l;p=f;d_(d|0,p|0,272)|0;p=f;f=o;d_(p|0,f|0,270)|0;f=o;o=l;d_(f|0,o|0,270)|0;e=e+1|0;if(cm(c,b)|0){o=b;f=c;c=j;l=o;d_(c|0,l|0,272)|0;l=o;o=f;d_(l|0,o|0,270)|0;o=f;f=j;d_(o|0,f|0,270)|0;e=e+1|0;if(cm(b,a)|0){f=a;o=b;b=h;j=f;d_(b|0,j|0,272)|0;j=f;f=o;d_(j|0,f|0,270)|0;f=o;o=h;d_(f|0,o|0,270)|0;e=e+1|0;if(cm(a,m)|0){o=m;m=a;a=k;f=o;d_(a|0,f|0,272)|0;f=o;o=m;d_(f|0,o|0,270)|0;o=m;m=k;d_(o|0,m|0,270)|0;e=e+1|0}}}n=e;i=g;return n|0}function ck(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0;d=i;i=i+272|0;e=d|0;f=a;a=b;b=f+544|0;ch(f,f+272|0,b,c)|0;c=b+272|0;while(1){if((c|0)==(a|0)){break}if(cm(c,b)|0){g=e;h=c;d_(g|0,h|0,272)|0;h=b;b=c;do{g=b;j=h;d_(g|0,j|0,270)|0;b=h;if((b|0)!=(f|0)){j=h-272|0;h=j;k=cm(e,j)|0}else{k=0}}while(k);h=b;j=e;d_(h|0,j|0,270)|0}b=c;c=c+272|0}i=d;return}function cl(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;d=i;i=i+544|0;e=d|0;f=d+272|0;g=a;a=b;b=c;switch((a-g|0)/272|0|0){case 0:case 1:{h=1;j=h;i=d;return j|0};case 2:{c=a-272|0;a=c;if(cm(c,g)|0){c=g;k=a;l=e;m=c;d_(l|0,m|0,272)|0;m=c;c=k;d_(m|0,c|0,270)|0;c=k;k=e;d_(c|0,k|0,270)|0}h=1;j=h;i=d;return j|0};case 3:{k=a-272|0;a=k;ch(g,g+272|0,k,b)|0;h=1;j=h;i=d;return j|0};case 4:{k=a-272|0;a=k;ci(g,g+272|0,g+544|0,k,b)|0;h=1;j=h;i=d;return j|0};case 5:{k=a-272|0;a=k;cj(g,g+272|0,g+544|0,g+816|0,k,b)|0;h=1;j=h;i=d;return j|0};default:{k=g+544|0;ch(g,g+272|0,k,b)|0;b=0;c=k+272|0;while(1){if((c|0)==(a|0)){n=791;break}if(cm(c,k)|0){e=f;m=c;d_(e|0,m|0,272)|0;m=k;k=c;do{e=k;l=m;d_(e|0,l|0,270)|0;k=m;if((k|0)!=(g|0)){l=m-272|0;m=l;o=cm(f,l)|0}else{o=0}}while(o);m=k;l=f;d_(m|0,l|0,270)|0;l=b+1|0;b=l;if((l|0)==8){n=787;break}}k=c;c=c+272|0}if((n|0)==787){k=c+272|0;c=k;h=(k|0)==(a|0);j=h;i=d;return j|0}else if((n|0)==791){h=1;j=h;i=d;return j|0}}}return 0}function cm(a,b){a=a|0;b=b|0;return(c[a+264>>2]|0)<(c[b+264>>2]|0)|0}function cn(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;e=i;i=i+56|0;f=e+16|0;g=e+24|0;h=e+32|0;j=d;d=b;b=d+8|0;k=d;c[f>>2]=(((c[k+4>>2]|0)-(c[k>>2]|0)|0)/272|0)+1;k=d;l=cs(k)|0;if((c[f>>2]|0)>>>0>l>>>0){dC(k)}m=k;k=((c[m+8>>2]|0)-(c[m>>2]|0)|0)/272|0;if(k>>>0>=((l>>>0)/2|0)>>>0){n=l}else{c[g>>2]=k<<1;a[e|0]=a[e+8|0]|0;k=g;g=f;if((c[k>>2]|0)>>>0<(c[g>>2]|0)>>>0){o=g}else{o=k}n=c[o>>2]|0}o=d;co(h,n,((c[o+4>>2]|0)-(c[o>>2]|0)|0)/272|0,b);b=c[h+8>>2]|0;if((b|0)==0){p=0}else{o=b;b=o;n=j;d_(b|0,n|0,272)|0;p=o}o=h+8|0;c[o>>2]=(c[o>>2]|0)+272;cp(d,h);cq(h);i=e;return}function co(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ct(a,b,c,d);return}function cp(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;d=i;i=i+24|0;e=d|0;f=d+8|0;g=d+16|0;h=b;b=a;a=c[b>>2]|0;j=h+4|0;k=((c[b+4>>2]|0)-a|0)/272|0;l=j;c[l>>2]=(c[l>>2]|0)+((-k|0)*272|0);l=c[j>>2]|0;j=a;a=k*272|0;d_(l|0,j|0,a)|0;a=b|0;j=h+4|0;c[e>>2]=c[a>>2];c[a>>2]=c[j>>2];c[j>>2]=c[e>>2];e=b+4|0;j=h+8|0;c[f>>2]=c[e>>2];c[e>>2]=c[j>>2];c[j>>2]=c[f>>2];f=b+8|0;b=h+12|0;c[g>>2]=c[f>>2];c[f>>2]=c[b>>2];c[b>>2]=c[g>>2];c[h>>2]=c[h+4>>2];i=d;return}function cq(a){a=a|0;cr(a);return}function cr(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0;d=i;i=i+40|0;e=d|0;f=d+8|0;g=b;b=g;h=c[b+4>>2]|0;a[d+24|0]=a[d+32|0]|0;j=h;h=b;while(1){if((j|0)==(c[h+8>>2]|0)){break}b=h+8|0;c[b>>2]=(c[b>>2]|0)-272;a[e]=a[f]|0;}if((c[g>>2]|0)==0){i=d;return}dV(c[g>>2]|0);i=d;return}function cs(b){b=b|0;var d=0,e=0,f=0,g=0;b=i;i=i+56|0;d=b+40|0;e=b+48|0;a[b|0]=a[b+8|0]|0;c[d>>2]=15790320;c[e>>2]=2147483647|0;a[b+24|0]=a[b+32|0]|0;f=d;d=e;if((c[d>>2]|0)>>>0<(c[f>>2]|0)>>>0){g=d}else{g=f}i=b;return c[g>>2]|0}function ct(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+32|0;g=f|0;h=f+8|0;j=b;b=a;c[f+16>>2]=0;c[h>>2]=0;c[g>>2]=c[h>>2];h=b+12|0;c[h>>2]=c[g>>2];c[h+4>>2]=e;if((j|0)!=0){k=dT(j*272|0)|0}else{c[f+24>>2]=0;k=0}c[b>>2]=k;k=(c[b>>2]|0)+(d*272|0)|0;c[b+8>>2]=k;c[b+4>>2]=k;c[b+12>>2]=(c[b>>2]|0)+(j*272|0);i=f;return}function cu(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0;f=i;i=i+240|0;g=f|0;h=f+8|0;j=f+24|0;k=f+32|0;l=f+40|0;m=f+48|0;n=f+56|0;o=f+64|0;p=f+72|0;q=f+80|0;r=f+88|0;s=f+96|0;t=f+104|0;u=f+168|0;v=f+176|0;w=f+192|0;x=f+208|0;y=f+216|0;z=f+232|0;A=e;e=d;d=cv(e,u,A)|0;B=c[d>>2]|0;a[v]=0;C=c[d>>2]|0;c[f+184>>2]=0;if((C|0)!=0){D=B;E=z;F=D;G=E;H=F;I=G;J=H;K=I;L=K|0;M=J;c[L>>2]=M;N=b;O=z;P=v;Q=N;R=P;S=O;T=Q;U=S;V=R;W=T;X=W|0;Y=U;Z=X;_=Y;c[Z>>2]=c[_>>2];$=W+4|0;aa=V;ab=a[aa]|0;ac=ab&1;ad=ac&1;a[$]=ad;i=f;return}cw(y,e,A);c[x>>2]=y;A=r;C=x;a[A]=a[C]|0;a[A+1|0]=a[C+1|0]|0;a[A+2|0]=a[C+2|0]|0;a[A+3|0]=a[C+3|0]|0;C=q;A=r;a[C]=a[A]|0;a[C+1|0]=a[A+1|0]|0;a[C+2|0]=a[A+2|0]|0;a[C+3|0]=a[A+3|0]|0;A=w|0;C=c[q>>2]|0;r=c[C>>2]|0;c[C>>2]=0;C=r;r=p;x=(c[q>>2]|0)+4|0;c[r>>2]=c[x>>2];c[r+4>>2]=c[x+4>>2];x=o;r=p;d_(x|0,r|0,8)|0;r=A;A=C;C=n;x=o;d_(C|0,x|0,8)|0;c[l>>2]=A;A=r;r=c[l>>2]|0;l=m;x=n;c[l>>2]=c[x>>2];c[l+4>>2]=c[x+4>>2];x=k;l=m;d_(x|0,l|0,8)|0;c[j>>2]=r;r=A;c[r>>2]=c[j>>2];j=r+4|0;r=k;c[j>>2]=c[r>>2];c[j+4>>2]=c[r+4>>2];r=y;y=c[r>>2]|0;c[r>>2]=0;if((y|0)!=0){j=y;if(a[r+8|0]&1){a[g]=a[h]|0;}if((j|0)!=0){dV(j)}}cx(e,c[u>>2]|0,d,c[w>>2]|0);d=w;u=c[d>>2]|0;c[d>>2]=0;B=u;a[v]=1;u=w;w=c[u>>2]|0;c[u>>2]=0;if((w|0)!=0){d=w;if(a[u+8|0]&1){a[s]=a[t]|0;}if((d|0)!=0){dV(d)}}D=B;E=z;F=D;G=E;H=F;I=G;J=H;K=I;L=K|0;M=J;c[L>>2]=M;N=b;O=z;P=v;Q=N;R=P;S=O;T=Q;U=S;V=R;W=T;X=W|0;Y=U;Z=X;_=Y;c[Z>>2]=c[_>>2];$=W+4|0;aa=V;ab=a[aa]|0;ac=ab&1;ad=ac&1;a[$]=ad;i=f;return}function cv(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0;e=i;i=i+24|0;f=e+8|0;g=e+16|0;h=b;b=d;d=a;a=c[d+4>>2]|0;c[e>>2]=0;if((a|0)==0){c[h>>2]=d+4;j=c[h>>2]|0;k=j;i=e;return k|0}while(1){if(cb(b|0,a+16|0)|0){d=c[a>>2]|0;c[f>>2]=0;if((d|0)==0){l=883;break}a=c[a>>2]|0}else{if(!(cb(a+16|0,b|0)|0)){l=890;break}d=c[a+4>>2]|0;c[g>>2]=0;if((d|0)==0){l=888;break}a=c[a+4>>2]|0}}if((l|0)==890){c[h>>2]=a;j=h;k=j;i=e;return k|0}else if((l|0)==883){c[h>>2]=a;j=c[h>>2]|0;k=j;i=e;return k|0}else if((l|0)==888){c[h>>2]=a;j=(c[h>>2]|0)+4|0;k=j;i=e;return k|0}return 0}function cw(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0;f=i;i=i+520|0;g=f|0;h=f+8|0;j=f+16|0;k=f+24|0;l=f+32|0;m=f+40|0;n=f+48|0;o=f+56|0;p=f+64|0;q=f+72|0;r=f+80|0;s=f+96|0;t=f+104|0;u=f+112|0;v=f+120|0;w=f+128|0;x=f+136|0;y=f+144|0;z=f+152|0;A=f+160|0;B=f+192|0;C=f+200|0;D=f+216|0;E=f+224|0;F=f+232|0;G=f+240|0;H=f+248|0;I=f+256|0;J=f+264|0;K=f+272|0;L=f+280|0;M=f+288|0;N=f+296|0;O=f+304|0;P=f+320|0;Q=f+328|0;R=f+344|0;S=f+352|0;T=f+360|0;U=f+368|0;V=f+376|0;W=f+384|0;X=f+392|0;Y=f+400|0;Z=f+408|0;_=f+416|0;$=f+472|0;aa=f+488|0;ab=f+496|0;ac=f+504|0;ad=e;e=dT(1*88|0)|0;ae=aa;c[ae>>2]=d+4;a[ae+4|0]=0;ae=_;d=aa;d_(ae|0,d|0,8)|0;d=$;ae=e;e=Z;aa=_;d_(e|0,aa|0,8)|0;c[X>>2]=ae;ae=d|0;d=c[X>>2]|0;X=Y;aa=Z;c[X>>2]=c[aa>>2];c[X+4>>2]=c[aa+4>>2];aa=W;X=Y;d_(aa|0,X|0,8)|0;X=ae;ae=d;d=V;aa=W;d_(d|0,aa|0,8)|0;c[T>>2]=ae;ae=X;X=c[T>>2]|0;T=U;aa=V;c[T>>2]=c[aa>>2];c[T+4>>2]=c[aa+4>>2];aa=S;T=U;d_(aa|0,T|0,8)|0;c[R>>2]=X;X=ae;c[X>>2]=c[R>>2];R=X+4|0;X=S;c[R>>2]=c[X>>2];c[R+4>>2]=c[X+4>>2];X=(c[$>>2]|0)+16|0;if((X|0)==0){af=0}else{R=X;cy(R,ad);af=R}a[$+8|0]=1;c[D>>2]=$;R=A;af=D;a[R]=a[af]|0;a[R+1|0]=a[af+1|0]|0;a[R+2|0]=a[af+2|0]|0;a[R+3|0]=a[af+3|0]|0;af=z;R=A;a[af]=a[R]|0;a[af+1|0]=a[R+1|0]|0;a[af+2|0]=a[R+2|0]|0;a[af+3|0]=a[R+3|0]|0;R=C|0;af=c[z>>2]|0;A=c[af>>2]|0;c[af>>2]=0;af=A;A=y;D=(c[z>>2]|0)+4|0;c[A>>2]=c[D>>2];c[A+4>>2]=c[D+4>>2];D=x;A=y;d_(D|0,A|0,8)|0;A=R;R=af;af=w;D=x;d_(af|0,D|0,8)|0;c[u>>2]=R;R=A;A=c[u>>2]|0;u=v;D=w;c[u>>2]=c[D>>2];c[u+4>>2]=c[D+4>>2];D=t;u=v;d_(D|0,u|0,8)|0;c[s>>2]=A;A=R;c[A>>2]=c[s>>2];s=A+4|0;A=t;c[s>>2]=c[A>>2];c[s+4>>2]=c[A+4>>2];c[B>>2]=C;A=p;s=B;a[A]=a[s]|0;a[A+1|0]=a[s+1|0]|0;a[A+2|0]=a[s+2|0]|0;a[A+3|0]=a[s+3|0]|0;s=o;A=p;a[s]=a[A]|0;a[s+1|0]=a[A+1|0]|0;a[s+2|0]=a[A+2|0]|0;a[s+3|0]=a[A+3|0]|0;A=ac|0;s=c[o>>2]|0;p=c[s>>2]|0;c[s>>2]=0;s=p;p=n;B=(c[o>>2]|0)+4|0;c[p>>2]=c[B>>2];c[p+4>>2]=c[B+4>>2];B=m;p=n;d_(B|0,p|0,8)|0;p=A;A=s;s=l;B=m;d_(s|0,B|0,8)|0;c[j>>2]=A;A=p;p=c[j>>2]|0;j=k;B=l;c[j>>2]=c[B>>2];c[j+4>>2]=c[B+4>>2];B=h;j=k;d_(B|0,j|0,8)|0;c[g>>2]=p;p=A;c[p>>2]=c[g>>2];g=p+4|0;p=h;c[g>>2]=c[p>>2];c[g+4>>2]=c[p+4>>2];p=C;C=c[p>>2]|0;c[p>>2]=0;if((C|0)!=0){g=C;if(a[p+8|0]&1){a[q]=a[r]|0;}if((g|0)!=0){dV(g)}}c[ab>>2]=ac;g=M;r=ab;a[g]=a[r]|0;a[g+1|0]=a[r+1|0]|0;a[g+2|0]=a[r+2|0]|0;a[g+3|0]=a[r+3|0]|0;r=L;g=M;a[r]=a[g]|0;a[r+1|0]=a[g+1|0]|0;a[r+2|0]=a[g+2|0]|0;a[r+3|0]=a[g+3|0]|0;g=b|0;b=c[L>>2]|0;r=c[b>>2]|0;c[b>>2]=0;b=r;r=K;M=(c[L>>2]|0)+4|0;c[r>>2]=c[M>>2];c[r+4>>2]=c[M+4>>2];M=J;r=K;d_(M|0,r|0,8)|0;r=g;g=b;b=I;M=J;d_(b|0,M|0,8)|0;c[G>>2]=g;g=r;r=c[G>>2]|0;G=H;M=I;c[G>>2]=c[M>>2];c[G+4>>2]=c[M+4>>2];M=F;G=H;d_(M|0,G|0,8)|0;c[E>>2]=r;r=g;c[r>>2]=c[E>>2];E=r+4|0;r=F;c[E>>2]=c[r>>2];c[E+4>>2]=c[r+4>>2];r=ac;ac=c[r>>2]|0;c[r>>2]=0;if((ac|0)!=0){E=ac;if(a[r+8|0]&1){a[N]=a[O]|0;}if((E|0)!=0){dV(E)}}E=$;$=c[E>>2]|0;c[E>>2]=0;if(($|0)==0){i=f;return}O=$;if(a[E+8|0]&1){a[P]=a[Q]|0;}if((O|0)!=0){dV(O)}i=f;return}function cx(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;i=i+24|0;g=d;d=e;e=a;c[f>>2]=0;c[d>>2]=0;c[f+8>>2]=0;c[d+4>>2]=0;c[d+8>>2]=b;c[g>>2]=d;d=c[c[e>>2]>>2]|0;c[f+16>>2]=0;if((d|0)!=0){c[e>>2]=c[c[e>>2]>>2]}b8(c[e+4>>2]|0,c[g>>2]|0);g=e+8|0;c[g>>2]=(c[g>>2]|0)+1;i=f;return}function cy(a,b){a=a|0;b=b|0;cz(a,b);return}function cz(a,b){a=a|0;b=b|0;var d=0,e=0;d=b|0;b=a|0;a=b|0;e=d|0;d_(a|0,e|0,63)|0;e=d+64|0;d=b+64|0;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];return}function cA(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=i;i=i+16|0;f=e|0;g=e+8|0;h=d;d=b;cB(f,d,h,c[d+4>>2]|0,d+4|0);c[g>>2]=d+4;do{if((c[f>>2]|0)==(c[g>>2]|0)^1){if(cb(h,(c[f>>2]|0)+16|0)|0){break}c[a>>2]=c[f>>2];i=e;return}}while(0);c[a>>2]=d+4;i=e;return}function cB(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0;b=i;i=i+8|0;g=b|0;h=d;d=e;e=f;while(1){c[g>>2]=0;if((d|0)==0){break}if(cb(d+16|0,h)|0){d=c[d+4>>2]|0}else{e=d;d=c[d>>2]|0}}c[a>>2]=e;i=b;return}function cC(a){a=a|0;cD(a|0);return}function cD(a){a=a|0;cE(a);return}function cE(a){a=a|0;var b=0;b=a;cF(b,c[b+4>>2]|0);return}function cF(b,d){b=b|0;d=d|0;var e=0,f=0;e=i;i=i+32|0;f=d;d=b;c[e+24>>2]=0;if((f|0)==0){i=e;return}cF(d,c[f>>2]|0);cF(d,c[f+4>>2]|0);a[e|0]=a[e+8|0]|0;dV(f);i=e;return}function cG(a){a=a|0;var b=0;b=a;return di(b,b+200|0)|0}function cH(a){a=a|0;var b=0;b=a;return di(b,b+221|0)|0}function cI(a){a=a|0;cJ(a|0);return}function cJ(a){a=a|0;cK(a);return}function cK(a){a=a|0;var b=0;b=a;cL(b,c[b+4>>2]|0);return}function cL(b,d){b=b|0;d=d|0;var e=0,f=0;e=i;i=i+32|0;f=d;d=b;c[e+24>>2]=0;if((f|0)==0){i=e;return}cL(d,c[f>>2]|0);cL(d,c[f+4>>2]|0);a[e|0]=a[e+8|0]|0;dV(f);i=e;return}function cM(a){a=a|0;cN(a);return}function cN(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0;d=i;i=i+32|0;e=d|0;f=d+8|0;g=b;b=c[g>>2]|0;c[d+24>>2]=0;if((b|0)==0){i=d;return}b=g;h=c[b>>2]|0;j=b;while(1){if((h|0)==(c[j+4>>2]|0)){break}b=j+4|0;c[b>>2]=(c[b>>2]|0)-272;a[e]=a[f]|0;}dV(c[g>>2]|0);i=d;return}function cO(a){a=a|0;cP(a);return}function cP(a){a=a|0;return}function cQ(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;f=a;cR(f);c[f>>2]=2136;c[f+4>>2]=b;c[f+8>>2]=d;c[f+12>>2]=e;return}function cR(a){a=a|0;c[a>>2]=2168;return}function cS(a){a=a|0;cP(a);return}function cT(a){a=a|0;var b=0;b=a;cS(b);dV(b);return}function cU(a){a=a|0;var b=0;b=a;a=dj(b)|0;return a+(dk(b)|0)|0}function cV(a,b){a=a|0;b=b|0;cW(b,a|0);return}function cW(a,b){a=a|0;b=b|0;var c=0;c=b;b=a+200|0;d_(c|0,b|0,63)|0;return}function cX(){bF();bG();return}function cY(){bu(30296,-2);return}function cZ(){bu(30256,-1);return}function c_(d,e){d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+8|0;g=f|0;h=e;e=d;if((a[h|0]|0)==45){b[e>>1]=-1;i=f;return}else{d=h;ap(d|0,1832,(d=i,i=i+8|0,c[d>>2]=g,d)|0)|0;i=d;d=(c[g>>2]|0)-17|0;g=d|(117-(d1(a[h+2|0]|0)|0)&31)<<11;b[e>>1]=(g|(a[h+3|0]|0)-48<<8)&65535;i=f;return}}function c$(a){a=a|0;var d=0,e=0,f=0,g=0;d=i;e=a;if(bW(e)|0){d2(30224,1824)|0;i=d;return 30224}else{a=(b[e>>1]&255)+17|0;f=117-(bY(e)|0)|0;g=c0(e)|0;aJ(30224,1792,(e=i,i=i+24|0,c[e>>2]=a,c[e+8>>2]=f,c[e+16>>2]=g,e)|0)|0;i=e;i=d;return 30224}return 0}function c0(a){a=a|0;return(e[a>>1]|0)>>8&7|0}function c1(a){a=a|0;return b[a>>1]&15|0}function c2(a){a=a|0;return(e[a>>1]|0)>>4&15|0}function c3(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;dq(a,b,c,d);return}function c4(b){b=b|0;var d=0;d=b;b=d|0;d3(b|0,0,196)|0;a[c5(d,4,4)|0]=1;a[c5(d,9,9)|0]=16;c[d+196>>2]=0;b=d+200|0;d3(b|0,0,63)|0;return}function c5(a,b,c){a=a|0;b=b|0;c=c|0;return a+(c*14|0)+b|0}function c6(e,f){e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;g=i;h=f;f=i;i=i+2|0;i=i+7&-8;b[f>>1]=b[h>>1]|0;h=e;if(bW(f)|0){j=1;k=j;i=g;return k|0}e=bY(f)|0;if((a[(c7(h)|0)+e|0]|0)!=0){j=0;k=j;i=g;return k|0}e=c0(f)|0;l=1672+((bY(f)|0)<<2)|0;m=(d[l]|d[l+1|0]<<8|d[l+2|0]<<16|d[l+3|0]<<24)+44+(e*12|0)|0;e=c2(f)|0;l=e+(c[m>>2]|0)|0;e=c1(f)|0;f=e+(c[m+4>>2]|0)|0;e=c[m+8>>2]|0;do{if((l+(c[e+160>>2]|0)|0)>=0){if((l+(c[e+168>>2]|0)|0)>=14){break}if((f+(c[e+164>>2]|0)|0)<0){break}if((f+(c[e+172>>2]|0)|0)>=14){break}if(!(c8(h,l,f,e)|0)){break}m=0;while(1){if((m|0)>=(c[e+4>>2]|0)){n=45;break}o=d[c5(h,l+(c[e+8+(m<<3)>>2]|0)|0,f+(c[e+8+(m<<3)+4>>2]|0)|0)|0]|0;p=bV(h)|0;if((o&(p?1:16)|0)!=0){n=42;break}m=m+1|0}if((n|0)==42){j=1;k=j;i=g;return k|0}else if((n|0)==45){j=0;k=j;i=g;return k|0}}}while(0);j=0;k=j;i=g;return k|0}function c7(a){a=a|0;var b=0,c=0;b=a;if(bV(b)|0){c=b+200|0;return c|0}else{c=b+221|0;return c|0}return 0}function c8(a,b,e,f){a=a|0;b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0;g=b;b=e;e=f;f=a;a=bV(f)|0;h=(a?70:100)&255;a=0;while(1){if((a|0)>=(c[e+4>>2]|0)){i=64;break}if(((d[c5(f,g+(c[e+8+(a<<3)>>2]|0)|0,b+(c[e+8+(a<<3)+4>>2]|0)|0)|0]|0)&(h&255)|0)!=0){i=61;break}a=a+1|0}if((i|0)==61){j=0;k=j;return k|0}else if((i|0)==64){j=1;k=j;return k|0}return 0}function c9(e,f){e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;g=i;h=f;f=i;i=i+2|0;i=i+7&-8;b[f>>1]=b[h>>1]|0;h=e;if(bW(f)|0){da(h);i=g;return}e=c0(f)|0;j=1672+((bY(f)|0)<<2)|0;k=(d[j]|d[j+1|0]<<8|d[j+2|0]<<16|d[j+3|0]<<24)+44+(e*12|0)|0;e=c2(f)|0;j=e+(c[k>>2]|0)|0;e=c1(f)|0;l=e+(c[k+4>>2]|0)|0;e=c[k+8>>2]|0;k=bV(h)|0;m=(k?4:64)&255;k=bV(h)|0;n=(k?2:32)&255;k=bV(h)|0;o=(k?1:16)&255;k=0;while(1){if((k|0)>=(c[e+4>>2]|0)){break}p=j+(c[e+8+(k<<3)>>2]|0)|0;q=l+(c[e+8+(k<<3)+4>>2]|0)|0;r=c5(h,p,q)|0;a[r]=(d[r]|0|m&255)&255;if(db(p-1|0,q)|0){r=c5(h,p-1|0,q)|0;a[r]=(d[r]|0|n&255)&255}if(db(p,q-1|0)|0){r=c5(h,p,q-1|0)|0;a[r]=(d[r]|0|n&255)&255}if(db(p+1|0,q)|0){r=c5(h,p+1|0,q)|0;a[r]=(d[r]|0|n&255)&255}if(db(p,q+1|0)|0){r=c5(h,p,q+1|0)|0;a[r]=(d[r]|0|n&255)&255}if(db(p-1|0,q-1|0)|0){r=c5(h,p-1|0,q-1|0)|0;a[r]=(d[r]|0|o&255)&255}if(db(p+1|0,q-1|0)|0){r=c5(h,p+1|0,q-1|0)|0;a[r]=(d[r]|0|o&255)&255}if(db(p-1|0,q+1|0)|0){r=c5(h,p-1|0,q+1|0)|0;a[r]=(d[r]|0|o&255)&255}if(db(p+1|0,q+1|0)|0){r=c5(h,p+1|0,q+1|0)|0;a[r]=(d[r]|0|o&255)&255}k=k+1|0}if(bV(h)|0){s=bY(f)|0}else{s=(bY(f)|0)+21|0}a[h+200+s|0]=((dc(f)|0)&255)+17&255;if(bV(h)|0){t=c0(f)|0}else{t=(c0(f)|0)<<4}s=h+200+((bY(f)|0)+42)|0;a[s]=(d[s]|0|t)&255;t=h+196|0;c[t>>2]=(c[t>>2]|0)+1;i=g;return}function da(a){a=a|0;var b=0;b=a+196|0;c[b>>2]=(c[b>>2]|0)+1;return}function db(a,b){a=a|0;b=b|0;var c=0,d=0;c=a;a=b;do{if((c|0)>=0){if((a|0)<0){d=0;break}if((c|0)>=14){d=0;break}d=(a|0)<14}else{d=0}}while(0);return d|0}function dc(a){a=a|0;return(e[a>>1]|0)&255|0}function dd(a,b){a=a|0;b=b|0;var d=0,e=0;d=i;i=i+16|0;e=d|0;de(e,b);df(a,e)|0;a=c[e+8>>2]|0;dg(e);i=d;return a|0}function de(a,b){a=a|0;b=b|0;dm(a,b);return}function df(e,f){e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;g=i;i=i+1264|0;h=g|0;j=g+8|0;k=g+16|0;l=g+1216|0;m=g+1248|0;n=g+1256|0;o=f;f=e;if((bz(f)|0)<2){if((bz(f)|0)==0){p=8}else{p=840}e=p|0;while(1){if((b[e>>1]|0)==0){q=126;break}bu(h,b[e>>1]|0);p=c0(h)|0;r=1672+((bY(h)|0)<<2)|0;if(dh(f,c[(d[r]|d[r+1|0]<<8|d[r+2|0]<<16|d[r+3|0]<<24)+44+(p*12|0)+8>>2]|0)|0){p=o;r=c[(c[p>>2]|0)+8>>2]|0;b[j>>1]=b[h>>1]|0;if(!(ba[r&7](p,j)|0)){q=122;break}}e=e+2|0}if((q|0)==122){s=0;t=s;i=g;return t|0}else if((q|0)==126){s=1;t=s;i=g;return t|0}}e=bV(f)|0;j=(e?71:116)&255;e=bV(f)|0;h=(e?1:16)&255;e=bV(f)|0;p=(e?2:32)&255;e=k|0;r=0;while(1){if((r|0)>=14){break}u=0;while(1){if((u|0)>=14){break}if((d[c5(f,u,r)|0]&(j&255)|0)==(h&255|0)){c[e>>2]=u;c[e+4>>2]=r;do{if((r|0)>0){if((d[c5(f,u,r-1|0)|0]&(p&255)|0)==0){q=137;break}if((u|0)>0){v=(d[c5(f,u-1|0,r)|0]&(p&255)|0)!=0}else{v=0}w=v?0:1}else{q=137}}while(0);if((q|0)==137){q=0;if((u|0)>0){x=(d[c5(f,u-1|0,r)|0]&(p&255)|0)!=0}else{x=0}w=x?2:3}c[e+8>>2]=w;e=e+12|0}u=u+1|0}r=r+1|0}c[e>>2]=-1;r=0;w=0;L170:while(1){if((w|0)>=21){break}if((a[(c7(f)|0)+w|0]|0)==0){x=1672+(w<<2)|0;p=(d[x]|d[x+1|0]<<8|d[x+2|0]<<16|d[x+3|0]<<24)+8|0;while(1){if((c[p>>2]|0)==0){break}if(dh(f,c[p>>2]|0)|0){x=l;d3(x|0,0,28)|0;e=k|0;while(1){if((c[e>>2]|0)<0){break}x=0;while(1){if((x|0)>=(c[(c[p>>2]|0)+48+(c[e+8>>2]<<2)>>2]|0)){break}v=(c[e>>2]|0)-(c[(c[p>>2]|0)+64+((c[e+8>>2]|0)*24|0)+(x<<3)>>2]|0)|0;h=(c[e+4>>2]|0)-(c[(c[p>>2]|0)+64+((c[e+8>>2]|0)*24|0)+(x<<3)+4>>2]|0)|0;do{if((h+(c[(c[p>>2]|0)+164>>2]|0)|0)<0){q=162}else{if((h+(c[(c[p>>2]|0)+172>>2]|0)|0)>=14){q=162;break}if((v+(c[(c[p>>2]|0)+160>>2]|0)|0)<0){q=162;break}if((v+(c[(c[p>>2]|0)+168>>2]|0)|0)>=14){q=162;break}if((b[l+(h<<1)>>1]&1<<v|0)!=0){q=162;break}j=l+(h<<1)|0;b[j>>1]=(b[j>>1]|1<<v)&65535;if(c8(f,v,h,c[p>>2]|0)|0){j=o;u=c[(c[j>>2]|0)+8>>2]|0;c3(m,v,h,c[c[p>>2]>>2]|0);if(!(ba[u&7](j,m)|0)){q=165;break L170}r=r+1|0}}}while(0);if((q|0)==162){q=0}x=x+1|0}e=e+12|0}}p=p+4|0}}w=w+1|0}if((q|0)==165){s=0;t=s;i=g;return t|0}if((r|0)==0){r=o;o=c[(c[r>>2]|0)+8>>2]|0;b[n>>1]=b[15128]|0;s=ba[o&7](r,n)|0;t=s;i=g;return t|0}else{s=1;t=s;i=g;return t|0}return 0}function dg(a){a=a|0;dl(a);return}function dh(a,b){a=a|0;b=b|0;var d=0,e=0;do{if((bz(a)|0)<8){if((c[b+4>>2]|0)>=5){break}d=0;e=d;return e|0}}while(0);d=1;e=d;return e|0}function di(b,e){b=b|0;e=e|0;var f=0,g=0;b=e;e=0;f=0;while(1){if((f|0)>=21){break}if((a[b+f|0]|0)!=0){g=1672+(f<<2)|0;e=e+(c[(d[g]|d[g+1|0]<<8|d[g+2|0]<<16|d[g+3|0]<<24)+4>>2]|0)|0}f=f+1|0}return e|0}function dj(a){a=a|0;var b=0,e=0;b=a;a=0;e=0;while(1){if((e|0)>=21){break}if((d[b+200+e|0]|0|0)==0){a=a-(c[1920+(e<<2)>>2]|0)|0}if((d[b+200+(e+21)|0]|0|0)==0){a=a+(c[1920+(e<<2)>>2]|0)|0}e=e+1|0}return a|0}function dk(b){b=b|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;e=i;i=i+1808|0;f=e|0;g=e+240|0;h=b;b=0;j=0;while(1){if((j|0)>14){break}a[f+j|0]=68;j=j+1|0}j=0;while(1){if((j|0)>14){break}a[f+((j*15|0)+14)|0]=68;j=j+1|0}j=0;while(1){if((j|0)>14){break}a[f+(j+225)|0]=68;j=j+1|0}j=0;while(1){if((j|0)>=2){break}k=g|0;l=0;while(1){if((l|0)>=14){break}m=0;while(1){if((m|0)>=14){break}n=d[c5(h,m,l)|0]|0;a[f+(((l+1|0)*15|0)+m)|0]=n&(d[1904+j|0]|0)&255;if((d[f+(((l+1|0)*15|0)+m)|0]|0|0)==(d[1912+j|0]|0|0)){n=k;k=n+4|0;c[n>>2]=f+(((l+1|0)*15|0)+m);b=b+1|0}m=m+1|0}l=l+1|0}c[k>>2]=0;k=g|0;l=g+784|0;while(1){if((c[k>>2]|0)==0){break}m=k;k=m+4|0;n=c[m>>2]|0;if((d[n-15|0]|0|0)==0){a[n-15|0]=1;m=l;l=m+4|0;c[m>>2]=n-15;b=b+1|0}if((d[n-1|0]|0|0)==0){a[n-1|0]=1;m=l;l=m+4|0;c[m>>2]=n-1;b=b+1|0}if((d[n+1|0]|0|0)==0){a[n+1|0]=1;m=l;l=m+4|0;c[m>>2]=n+1;b=b+1|0}if((d[n+15|0]|0|0)==0){a[n+15|0]=1;m=l;l=m+4|0;c[m>>2]=n+15;b=b+1|0}}c[l>>2]=0;k=g+784|0;l=g|0;while(1){if((c[k>>2]|0)==0){break}n=k;k=n+4|0;m=c[n>>2]|0;if((d[m-15|0]|0|0)==0){a[m-15|0]=1;n=l;l=n+4|0;c[n>>2]=m-15;b=b+1|0}if((d[m-1|0]|0|0)==0){a[m-1|0]=1;n=l;l=n+4|0;c[n>>2]=m-1;b=b+1|0}if((d[m+1|0]|0|0)==0){a[m+1|0]=1;n=l;l=n+4|0;c[n>>2]=m+1;b=b+1|0}if((d[m+15|0]|0|0)==0){a[m+15|0]=1;n=l;l=n+4|0;c[n>>2]=m+15;b=b+1|0}}c[l>>2]=0;k=g|0;while(1){if((c[k>>2]|0)==0){break}m=k;k=m+4|0;n=c[m>>2]|0;if((d[n-15|0]|0|0)==0){a[n-15|0]=1;b=b+1|0}if((d[n-1|0]|0|0)==0){a[n-1|0]=1;b=b+1|0}if((d[n+1|0]|0|0)==0){a[n+1|0]=1;b=b+1|0}if((d[n+15|0]|0|0)==0){a[n+15|0]=1;b=b+1|0}}b=-b|0;j=j+1|0}i=e;return b|0}function dl(a){a=a|0;cP(a);return}function dm(a,b){a=a|0;b=b|0;var d=0;d=a;cR(d);c[d>>2]=2200;c[d+4>>2]=b;c[d+8>>2]=0;return}function dn(a){a=a|0;var b=0;b=a;dg(b);dV(b);return}function dp(a,d){a=a|0;d=d|0;var e=0,f=0,g=0;e=i;f=d;d=i;i=i+2|0;i=i+7&-8;b[d>>1]=b[f>>1]|0;f=a;a=f+8|0;g=c[a>>2]|0;c[a>>2]=g+1;b[(c[f+4>>2]|0)+(g<<1)>>1]=b[d>>1]|0;i=e;return 1}function dq(a,c,d,e){a=a|0;c=c|0;d=d|0;e=e|0;b[a>>1]=(c<<4|d|e<<8)&65535;return}function dr(){cY();cZ();return}function ds(){bu(30288,-2);return}function dt(){bu(30240,-1);return}function du(a,c){a=a|0;c=c|0;if((bz(c)|0)==0){dv(a);return}else{b[a>>1]=b[15144]|0;return}}function dv(a){a=a|0;bu(a,b[2008+(~~(+(ao()|0)/2147483648.0*10.0)<<1)>>1]|0);return}function dw(){ds();dt();return}function dx(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;c[a>>2]=2104;d=a+4|0;if((d|0)==0){return}a=d$(b|0)|0;e=a+1|0;f=dU(a+13|0)|0;c[f+4>>2]=a;c[f>>2]=a;a=f+12|0;c[d>>2]=a;c[f+8>>2]=0;d_(a|0,b|0,e)|0;return}function dy(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=2104;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((B=c[d>>2]|0,c[d>>2]=B+ -1,B)-1|0)>=0){e=a;dV(e);return}d=(c[b>>2]|0)-12|0;if((d|0)==0){e=a;dV(e);return}dW(d);e=a;dV(e);return}function dz(a){a=a|0;var b=0;c[a>>2]=2104;b=a+4|0;a=(c[b>>2]|0)-4|0;if(((B=c[a>>2]|0,c[a>>2]=B+ -1,B)-1|0)>=0){return}a=(c[b>>2]|0)-12|0;if((a|0)==0){return}dW(a);return}function dA(a){a=a|0;return c[a+4>>2]|0}function dB(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=2104;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((B=c[d>>2]|0,c[d>>2]=B+ -1,B)-1|0)>=0){e=a;dV(e);return}d=(c[b>>2]|0)-12|0;if((d|0)==0){e=a;dV(e);return}dW(d);e=a;dV(e);return}function dC(a){a=a|0;a=aL(8)|0;dx(a,1856);c[a>>2]=2072;as(a|0,2544,26)}function dD(a){a=a|0;return}function dE(a){a=a|0;dD(a|0);return}function dF(a){a=a|0;return}function dG(a){a=a|0;return}function dH(a){a=a|0;dD(a|0);dV(a);return}function dI(a){a=a|0;dD(a|0);dV(a);return}function dJ(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0;e=i;i=i+56|0;f=e|0;if((a|0)==(b|0)){g=1;i=e;return g|0}if((b|0)==0){g=0;i=e;return g|0}h=dM(b,2608,2592,-1)|0;b=h;if((h|0)==0){g=0;i=e;return g|0}j=f;d3(j|0,0,56)|0;c[f>>2]=b;c[f+8>>2]=a;c[f+12>>2]=-1;c[f+48>>2]=1;bb[c[(c[h>>2]|0)+28>>2]&7](b,f,c[d>>2]|0,1);if((c[f+24>>2]|0)!=1){g=0;i=e;return g|0}c[d>>2]=c[f+16>>2];g=1;i=e;return g|0}function dK(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0;if((c[d+8>>2]|0)!=(b|0)){return}b=d+16|0;g=c[b>>2]|0;if((g|0)==0){c[b>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;return}if((g|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;return}e=d+24|0;if((c[e>>2]|0)!=2){return}c[e>>2]=f;return}function dL(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0;if((b|0)!=(c[d+8>>2]|0)){g=c[b+8>>2]|0;bb[c[(c[g>>2]|0)+28>>2]&7](g,d,e,f);return}g=d+16|0;b=c[g>>2]|0;if((b|0)==0){c[g>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;return}if((b|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;return}e=d+24|0;if((c[e>>2]|0)!=2){return}c[e>>2]=f;return}function dM(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;f=i;i=i+56|0;g=f|0;h=c[a>>2]|0;j=a+(c[h-8>>2]|0)|0;k=c[h-4>>2]|0;h=k;c[g>>2]=d;c[g+4>>2]=a;c[g+8>>2]=b;c[g+12>>2]=e;e=g+16|0;b=g+20|0;a=g+24|0;l=g+28|0;m=g+32|0;n=g+40|0;o=(k|0)==(d|0);d=e;d3(d|0,0,39)|0;if(o){c[g+48>>2]=1;a9[c[(c[k>>2]|0)+20>>2]&7](h,g,j,j,1,0);i=f;return((c[a>>2]|0)==1?j:0)|0}a3[c[(c[k>>2]|0)+24>>2]&7](h,g,j,1,0);j=c[g+36>>2]|0;if((j|0)==0){if((c[n>>2]|0)!=1){p=0;i=f;return p|0}if((c[l>>2]|0)!=1){p=0;i=f;return p|0}p=(c[m>>2]|0)==1?c[b>>2]|0:0;i=f;return p|0}else if((j|0)==1){do{if((c[a>>2]|0)!=1){if((c[n>>2]|0)!=0){p=0;i=f;return p|0}if((c[l>>2]|0)!=1){p=0;i=f;return p|0}if((c[m>>2]|0)==1){break}else{p=0}i=f;return p|0}}while(0);p=c[e>>2]|0;i=f;return p|0}else{p=0;i=f;return p|0}return 0}function dN(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0;h=b|0;if((h|0)==(c[d+8>>2]|0)){if((c[d+4>>2]|0)!=(e|0)){return}i=d+28|0;if((c[i>>2]|0)==1){return}c[i>>2]=f;return}if((h|0)!=(c[d>>2]|0)){h=c[b+8>>2]|0;a3[c[(c[h>>2]|0)+24>>2]&7](h,d,e,f,g);return}do{if((c[d+16>>2]|0)!=(e|0)){h=d+20|0;if((c[h>>2]|0)==(e|0)){break}c[d+32>>2]=f;i=d+44|0;if((c[i>>2]|0)==4){return}j=d+52|0;a[j]=0;k=d+53|0;a[k]=0;l=c[b+8>>2]|0;a9[c[(c[l>>2]|0)+20>>2]&7](l,d,e,e,1,g);if((a[k]&1)==0){m=0;n=393}else{if((a[j]&1)==0){m=1;n=393}}L478:do{if((n|0)==393){c[h>>2]=e;j=d+40|0;c[j>>2]=(c[j>>2]|0)+1;do{if((c[d+36>>2]|0)==1){if((c[d+24>>2]|0)!=2){n=396;break}a[d+54|0]=1;if(m){break L478}}else{n=396}}while(0);if((n|0)==396){if(m){break}}c[i>>2]=4;return}}while(0);c[i>>2]=3;return}}while(0);if((f|0)!=1){return}c[d+32>>2]=1;return}function dO(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;if((c[d+8>>2]|0)==(b|0)){if((c[d+4>>2]|0)!=(e|0)){return}g=d+28|0;if((c[g>>2]|0)==1){return}c[g>>2]=f;return}if((c[d>>2]|0)!=(b|0)){return}do{if((c[d+16>>2]|0)!=(e|0)){b=d+20|0;if((c[b>>2]|0)==(e|0)){break}c[d+32>>2]=f;c[b>>2]=e;b=d+40|0;c[b>>2]=(c[b>>2]|0)+1;do{if((c[d+36>>2]|0)==1){if((c[d+24>>2]|0)!=2){break}a[d+54|0]=1}}while(0);c[d+44>>2]=4;return}}while(0);if((f|0)!=1){return}c[d+32>>2]=1;return}function dP(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0;if((b|0)!=(c[d+8>>2]|0)){i=c[b+8>>2]|0;a9[c[(c[i>>2]|0)+20>>2]&7](i,d,e,f,g,h);return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){return}a[d+52|0]=1;f=d+16|0;h=c[f>>2]|0;if((h|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}if((h|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;a[d+54|0]=1;return}e=d+24|0;h=c[e>>2]|0;if((h|0)==2){c[e>>2]=g;j=g}else{j=h}if(!((c[d+48>>2]|0)==1&(j|0)==1)){return}a[d+54|0]=1;return}function dQ(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0;if((c[d+8>>2]|0)!=(b|0)){return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){return}a[d+52|0]=1;f=d+16|0;b=c[f>>2]|0;if((b|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}if((b|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;a[d+54|0]=1;return}e=d+24|0;b=c[e>>2]|0;if((b|0)==2){c[e>>2]=g;i=g}else{i=b}if(!((c[d+48>>2]|0)==1&(i|0)==1)){return}a[d+54|0]=1;return}function dR(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0;do{if(a>>>0<245>>>0){if(a>>>0<11>>>0){b=16}else{b=a+11&-8}d=b>>>3;e=c[7438]|0;f=e>>>(d>>>0);if((f&3|0)!=0){g=(f&1^1)+d|0;h=g<<1;i=29792+(h<<2)|0;j=29792+(h+2<<2)|0;h=c[j>>2]|0;k=h+8|0;l=c[k>>2]|0;do{if((i|0)==(l|0)){c[7438]=e&~(1<<g)}else{if(l>>>0<(c[7442]|0)>>>0){av();return 0}m=l+12|0;if((c[m>>2]|0)==(h|0)){c[m>>2]=i;c[j>>2]=l;break}else{av();return 0}}}while(0);l=g<<3;c[h+4>>2]=l|3;j=h+(l|4)|0;c[j>>2]=c[j>>2]|1;n=k;return n|0}if(b>>>0<=(c[7440]|0)>>>0){o=b;break}if((f|0)!=0){j=2<<d;l=f<<d&(j|-j);j=(l&-l)-1|0;l=j>>>12&16;i=j>>>(l>>>0);j=i>>>5&8;m=i>>>(j>>>0);i=m>>>2&4;p=m>>>(i>>>0);m=p>>>1&2;q=p>>>(m>>>0);p=q>>>1&1;r=(j|l|i|m|p)+(q>>>(p>>>0))|0;p=r<<1;q=29792+(p<<2)|0;m=29792+(p+2<<2)|0;p=c[m>>2]|0;i=p+8|0;l=c[i>>2]|0;do{if((q|0)==(l|0)){c[7438]=e&~(1<<r)}else{if(l>>>0<(c[7442]|0)>>>0){av();return 0}j=l+12|0;if((c[j>>2]|0)==(p|0)){c[j>>2]=q;c[m>>2]=l;break}else{av();return 0}}}while(0);l=r<<3;m=l-b|0;c[p+4>>2]=b|3;q=p;e=q+b|0;c[q+(b|4)>>2]=m|1;c[q+l>>2]=m;l=c[7440]|0;if((l|0)!=0){q=c[7443]|0;d=l>>>3;l=d<<1;f=29792+(l<<2)|0;k=c[7438]|0;h=1<<d;do{if((k&h|0)==0){c[7438]=k|h;s=f;t=29792+(l+2<<2)|0}else{d=29792+(l+2<<2)|0;g=c[d>>2]|0;if(g>>>0>=(c[7442]|0)>>>0){s=g;t=d;break}av();return 0}}while(0);c[t>>2]=q;c[s+12>>2]=q;c[q+8>>2]=s;c[q+12>>2]=f}c[7440]=m;c[7443]=e;n=i;return n|0}l=c[7439]|0;if((l|0)==0){o=b;break}h=(l&-l)-1|0;l=h>>>12&16;k=h>>>(l>>>0);h=k>>>5&8;p=k>>>(h>>>0);k=p>>>2&4;r=p>>>(k>>>0);p=r>>>1&2;d=r>>>(p>>>0);r=d>>>1&1;g=c[30056+((h|l|k|p|r)+(d>>>(r>>>0))<<2)>>2]|0;r=g;d=g;p=(c[g+4>>2]&-8)-b|0;while(1){g=c[r+16>>2]|0;if((g|0)==0){k=c[r+20>>2]|0;if((k|0)==0){break}else{u=k}}else{u=g}g=(c[u+4>>2]&-8)-b|0;k=g>>>0<p>>>0;r=u;d=k?u:d;p=k?g:p}r=d;i=c[7442]|0;if(r>>>0<i>>>0){av();return 0}e=r+b|0;m=e;if(r>>>0>=e>>>0){av();return 0}e=c[d+24>>2]|0;f=c[d+12>>2]|0;do{if((f|0)==(d|0)){q=d+20|0;g=c[q>>2]|0;if((g|0)==0){k=d+16|0;l=c[k>>2]|0;if((l|0)==0){v=0;break}else{w=l;x=k}}else{w=g;x=q}while(1){q=w+20|0;g=c[q>>2]|0;if((g|0)!=0){w=g;x=q;continue}q=w+16|0;g=c[q>>2]|0;if((g|0)==0){break}else{w=g;x=q}}if(x>>>0<i>>>0){av();return 0}else{c[x>>2]=0;v=w;break}}else{q=c[d+8>>2]|0;if(q>>>0<i>>>0){av();return 0}g=q+12|0;if((c[g>>2]|0)!=(d|0)){av();return 0}k=f+8|0;if((c[k>>2]|0)==(d|0)){c[g>>2]=f;c[k>>2]=q;v=f;break}else{av();return 0}}}while(0);L650:do{if((e|0)!=0){f=d+28|0;i=30056+(c[f>>2]<<2)|0;do{if((d|0)==(c[i>>2]|0)){c[i>>2]=v;if((v|0)!=0){break}c[7439]=c[7439]&~(1<<c[f>>2]);break L650}else{if(e>>>0<(c[7442]|0)>>>0){av();return 0}q=e+16|0;if((c[q>>2]|0)==(d|0)){c[q>>2]=v}else{c[e+20>>2]=v}if((v|0)==0){break L650}}}while(0);if(v>>>0<(c[7442]|0)>>>0){av();return 0}c[v+24>>2]=e;f=c[d+16>>2]|0;do{if((f|0)!=0){if(f>>>0<(c[7442]|0)>>>0){av();return 0}else{c[v+16>>2]=f;c[f+24>>2]=v;break}}}while(0);f=c[d+20>>2]|0;if((f|0)==0){break}if(f>>>0<(c[7442]|0)>>>0){av();return 0}else{c[v+20>>2]=f;c[f+24>>2]=v;break}}}while(0);if(p>>>0<16>>>0){e=p+b|0;c[d+4>>2]=e|3;f=r+(e+4)|0;c[f>>2]=c[f>>2]|1}else{c[d+4>>2]=b|3;c[r+(b|4)>>2]=p|1;c[r+(p+b)>>2]=p;f=c[7440]|0;if((f|0)!=0){e=c[7443]|0;i=f>>>3;f=i<<1;q=29792+(f<<2)|0;k=c[7438]|0;g=1<<i;do{if((k&g|0)==0){c[7438]=k|g;y=q;z=29792+(f+2<<2)|0}else{i=29792+(f+2<<2)|0;l=c[i>>2]|0;if(l>>>0>=(c[7442]|0)>>>0){y=l;z=i;break}av();return 0}}while(0);c[z>>2]=e;c[y+12>>2]=e;c[e+8>>2]=y;c[e+12>>2]=q}c[7440]=p;c[7443]=m}f=d+8|0;if((f|0)==0){o=b;break}else{n=f}return n|0}else{if(a>>>0>4294967231>>>0){o=-1;break}f=a+11|0;g=f&-8;k=c[7439]|0;if((k|0)==0){o=g;break}r=-g|0;i=f>>>8;do{if((i|0)==0){A=0}else{if(g>>>0>16777215>>>0){A=31;break}f=(i+1048320|0)>>>16&8;l=i<<f;h=(l+520192|0)>>>16&4;j=l<<h;l=(j+245760|0)>>>16&2;B=14-(h|f|l)+(j<<l>>>15)|0;A=g>>>((B+7|0)>>>0)&1|B<<1}}while(0);i=c[30056+(A<<2)>>2]|0;L698:do{if((i|0)==0){C=0;D=r;E=0}else{if((A|0)==31){F=0}else{F=25-(A>>>1)|0}d=0;m=r;p=i;q=g<<F;e=0;while(1){B=c[p+4>>2]&-8;l=B-g|0;if(l>>>0<m>>>0){if((B|0)==(g|0)){C=p;D=l;E=p;break L698}else{G=p;H=l}}else{G=d;H=m}l=c[p+20>>2]|0;B=c[p+16+(q>>>31<<2)>>2]|0;j=(l|0)==0|(l|0)==(B|0)?e:l;if((B|0)==0){C=G;D=H;E=j;break}else{d=G;m=H;p=B;q=q<<1;e=j}}}}while(0);if((E|0)==0&(C|0)==0){i=2<<A;r=k&(i|-i);if((r|0)==0){o=g;break}i=(r&-r)-1|0;r=i>>>12&16;e=i>>>(r>>>0);i=e>>>5&8;q=e>>>(i>>>0);e=q>>>2&4;p=q>>>(e>>>0);q=p>>>1&2;m=p>>>(q>>>0);p=m>>>1&1;I=c[30056+((i|r|e|q|p)+(m>>>(p>>>0))<<2)>>2]|0}else{I=E}if((I|0)==0){J=D;K=C}else{p=I;m=D;q=C;while(1){e=(c[p+4>>2]&-8)-g|0;r=e>>>0<m>>>0;i=r?e:m;e=r?p:q;r=c[p+16>>2]|0;if((r|0)!=0){p=r;m=i;q=e;continue}r=c[p+20>>2]|0;if((r|0)==0){J=i;K=e;break}else{p=r;m=i;q=e}}}if((K|0)==0){o=g;break}if(J>>>0>=((c[7440]|0)-g|0)>>>0){o=g;break}q=K;m=c[7442]|0;if(q>>>0<m>>>0){av();return 0}p=q+g|0;k=p;if(q>>>0>=p>>>0){av();return 0}e=c[K+24>>2]|0;i=c[K+12>>2]|0;do{if((i|0)==(K|0)){r=K+20|0;d=c[r>>2]|0;if((d|0)==0){j=K+16|0;B=c[j>>2]|0;if((B|0)==0){L=0;break}else{M=B;N=j}}else{M=d;N=r}while(1){r=M+20|0;d=c[r>>2]|0;if((d|0)!=0){M=d;N=r;continue}r=M+16|0;d=c[r>>2]|0;if((d|0)==0){break}else{M=d;N=r}}if(N>>>0<m>>>0){av();return 0}else{c[N>>2]=0;L=M;break}}else{r=c[K+8>>2]|0;if(r>>>0<m>>>0){av();return 0}d=r+12|0;if((c[d>>2]|0)!=(K|0)){av();return 0}j=i+8|0;if((c[j>>2]|0)==(K|0)){c[d>>2]=i;c[j>>2]=r;L=i;break}else{av();return 0}}}while(0);L748:do{if((e|0)!=0){i=K+28|0;m=30056+(c[i>>2]<<2)|0;do{if((K|0)==(c[m>>2]|0)){c[m>>2]=L;if((L|0)!=0){break}c[7439]=c[7439]&~(1<<c[i>>2]);break L748}else{if(e>>>0<(c[7442]|0)>>>0){av();return 0}r=e+16|0;if((c[r>>2]|0)==(K|0)){c[r>>2]=L}else{c[e+20>>2]=L}if((L|0)==0){break L748}}}while(0);if(L>>>0<(c[7442]|0)>>>0){av();return 0}c[L+24>>2]=e;i=c[K+16>>2]|0;do{if((i|0)!=0){if(i>>>0<(c[7442]|0)>>>0){av();return 0}else{c[L+16>>2]=i;c[i+24>>2]=L;break}}}while(0);i=c[K+20>>2]|0;if((i|0)==0){break}if(i>>>0<(c[7442]|0)>>>0){av();return 0}else{c[L+20>>2]=i;c[i+24>>2]=L;break}}}while(0);do{if(J>>>0<16>>>0){e=J+g|0;c[K+4>>2]=e|3;i=q+(e+4)|0;c[i>>2]=c[i>>2]|1}else{c[K+4>>2]=g|3;c[q+(g|4)>>2]=J|1;c[q+(J+g)>>2]=J;i=J>>>3;if(J>>>0<256>>>0){e=i<<1;m=29792+(e<<2)|0;r=c[7438]|0;j=1<<i;do{if((r&j|0)==0){c[7438]=r|j;O=m;P=29792+(e+2<<2)|0}else{i=29792+(e+2<<2)|0;d=c[i>>2]|0;if(d>>>0>=(c[7442]|0)>>>0){O=d;P=i;break}av();return 0}}while(0);c[P>>2]=k;c[O+12>>2]=k;c[q+(g+8)>>2]=O;c[q+(g+12)>>2]=m;break}e=p;j=J>>>8;do{if((j|0)==0){Q=0}else{if(J>>>0>16777215>>>0){Q=31;break}r=(j+1048320|0)>>>16&8;i=j<<r;d=(i+520192|0)>>>16&4;B=i<<d;i=(B+245760|0)>>>16&2;l=14-(d|r|i)+(B<<i>>>15)|0;Q=J>>>((l+7|0)>>>0)&1|l<<1}}while(0);j=30056+(Q<<2)|0;c[q+(g+28)>>2]=Q;c[q+(g+20)>>2]=0;c[q+(g+16)>>2]=0;m=c[7439]|0;l=1<<Q;if((m&l|0)==0){c[7439]=m|l;c[j>>2]=e;c[q+(g+24)>>2]=j;c[q+(g+12)>>2]=e;c[q+(g+8)>>2]=e;break}if((Q|0)==31){R=0}else{R=25-(Q>>>1)|0}l=J<<R;m=c[j>>2]|0;while(1){if((c[m+4>>2]&-8|0)==(J|0)){break}S=m+16+(l>>>31<<2)|0;j=c[S>>2]|0;if((j|0)==0){T=620;break}else{l=l<<1;m=j}}if((T|0)==620){if(S>>>0<(c[7442]|0)>>>0){av();return 0}else{c[S>>2]=e;c[q+(g+24)>>2]=m;c[q+(g+12)>>2]=e;c[q+(g+8)>>2]=e;break}}l=m+8|0;j=c[l>>2]|0;i=c[7442]|0;if(m>>>0<i>>>0){av();return 0}if(j>>>0<i>>>0){av();return 0}else{c[j+12>>2]=e;c[l>>2]=e;c[q+(g+8)>>2]=j;c[q+(g+12)>>2]=m;c[q+(g+24)>>2]=0;break}}}while(0);q=K+8|0;if((q|0)==0){o=g;break}else{n=q}return n|0}}while(0);K=c[7440]|0;if(o>>>0<=K>>>0){S=K-o|0;J=c[7443]|0;if(S>>>0>15>>>0){R=J;c[7443]=R+o;c[7440]=S;c[R+(o+4)>>2]=S|1;c[R+K>>2]=S;c[J+4>>2]=o|3}else{c[7440]=0;c[7443]=0;c[J+4>>2]=K|3;S=J+(K+4)|0;c[S>>2]=c[S>>2]|1}n=J+8|0;return n|0}J=c[7441]|0;if(o>>>0<J>>>0){S=J-o|0;c[7441]=S;J=c[7444]|0;K=J;c[7444]=K+o;c[K+(o+4)>>2]=S|1;c[J+4>>2]=o|3;n=J+8|0;return n|0}do{if((c[7432]|0)==0){J=aM(30)|0;if((J-1&J|0)==0){c[7434]=J;c[7433]=J;c[7435]=-1;c[7436]=-1;c[7437]=0;c[7549]=0;c[7432]=(aP(0)|0)&-16^1431655768;break}else{av();return 0}}}while(0);J=o+48|0;S=c[7434]|0;K=o+47|0;R=S+K|0;Q=-S|0;S=R&Q;if(S>>>0<=o>>>0){n=0;return n|0}O=c[7548]|0;do{if((O|0)!=0){P=c[7546]|0;L=P+S|0;if(L>>>0<=P>>>0|L>>>0>O>>>0){n=0}else{break}return n|0}}while(0);L840:do{if((c[7549]&4|0)==0){O=c[7444]|0;L842:do{if((O|0)==0){T=650}else{L=O;P=30200;while(1){U=P|0;M=c[U>>2]|0;if(M>>>0<=L>>>0){V=P+4|0;if((M+(c[V>>2]|0)|0)>>>0>L>>>0){break}}M=c[P+8>>2]|0;if((M|0)==0){T=650;break L842}else{P=M}}if((P|0)==0){T=650;break}L=R-(c[7441]|0)&Q;if(L>>>0>=2147483647>>>0){W=0;break}m=aW(L|0)|0;e=(m|0)==((c[U>>2]|0)+(c[V>>2]|0)|0);X=e?m:-1;Y=e?L:0;Z=m;_=L;T=659}}while(0);do{if((T|0)==650){O=aW(0)|0;if((O|0)==-1){W=0;break}g=O;L=c[7433]|0;m=L-1|0;if((m&g|0)==0){$=S}else{$=S-g+(m+g&-L)|0}L=c[7546]|0;g=L+$|0;if(!($>>>0>o>>>0&$>>>0<2147483647>>>0)){W=0;break}m=c[7548]|0;if((m|0)!=0){if(g>>>0<=L>>>0|g>>>0>m>>>0){W=0;break}}m=aW($|0)|0;g=(m|0)==(O|0);X=g?O:-1;Y=g?$:0;Z=m;_=$;T=659}}while(0);L862:do{if((T|0)==659){m=-_|0;if((X|0)!=-1){aa=Y;ab=X;T=670;break L840}do{if((Z|0)!=-1&_>>>0<2147483647>>>0&_>>>0<J>>>0){g=c[7434]|0;O=K-_+g&-g;if(O>>>0>=2147483647>>>0){ac=_;break}if((aW(O|0)|0)==-1){aW(m|0)|0;W=Y;break L862}else{ac=O+_|0;break}}else{ac=_}}while(0);if((Z|0)==-1){W=Y}else{aa=ac;ab=Z;T=670;break L840}}}while(0);c[7549]=c[7549]|4;ad=W;T=667}else{ad=0;T=667}}while(0);do{if((T|0)==667){if(S>>>0>=2147483647>>>0){break}W=aW(S|0)|0;Z=aW(0)|0;if(!((Z|0)!=-1&(W|0)!=-1&W>>>0<Z>>>0)){break}ac=Z-W|0;Z=ac>>>0>(o+40|0)>>>0;Y=Z?W:-1;if((Y|0)!=-1){aa=Z?ac:ad;ab=Y;T=670}}}while(0);do{if((T|0)==670){ad=(c[7546]|0)+aa|0;c[7546]=ad;if(ad>>>0>(c[7547]|0)>>>0){c[7547]=ad}ad=c[7444]|0;L882:do{if((ad|0)==0){S=c[7442]|0;if((S|0)==0|ab>>>0<S>>>0){c[7442]=ab}c[7550]=ab;c[7551]=aa;c[7553]=0;c[7447]=c[7432];c[7446]=-1;S=0;do{Y=S<<1;ac=29792+(Y<<2)|0;c[29792+(Y+3<<2)>>2]=ac;c[29792+(Y+2<<2)>>2]=ac;S=S+1|0;}while(S>>>0<32>>>0);S=ab+8|0;if((S&7|0)==0){ae=0}else{ae=-S&7}S=aa-40-ae|0;c[7444]=ab+ae;c[7441]=S;c[ab+(ae+4)>>2]=S|1;c[ab+(aa-36)>>2]=40;c[7445]=c[7436]}else{S=30200;while(1){af=c[S>>2]|0;ag=S+4|0;ah=c[ag>>2]|0;if((ab|0)==(af+ah|0)){T=682;break}ac=c[S+8>>2]|0;if((ac|0)==0){break}else{S=ac}}do{if((T|0)==682){if((c[S+12>>2]&8|0)!=0){break}ac=ad;if(!(ac>>>0>=af>>>0&ac>>>0<ab>>>0)){break}c[ag>>2]=ah+aa;ac=c[7444]|0;Y=(c[7441]|0)+aa|0;Z=ac;W=ac+8|0;if((W&7|0)==0){ai=0}else{ai=-W&7}W=Y-ai|0;c[7444]=Z+ai;c[7441]=W;c[Z+(ai+4)>>2]=W|1;c[Z+(Y+4)>>2]=40;c[7445]=c[7436];break L882}}while(0);if(ab>>>0<(c[7442]|0)>>>0){c[7442]=ab}S=ab+aa|0;Y=30200;while(1){aj=Y|0;if((c[aj>>2]|0)==(S|0)){T=692;break}Z=c[Y+8>>2]|0;if((Z|0)==0){break}else{Y=Z}}do{if((T|0)==692){if((c[Y+12>>2]&8|0)!=0){break}c[aj>>2]=ab;S=Y+4|0;c[S>>2]=(c[S>>2]|0)+aa;S=ab+8|0;if((S&7|0)==0){ak=0}else{ak=-S&7}S=ab+(aa+8)|0;if((S&7|0)==0){al=0}else{al=-S&7}S=ab+(al+aa)|0;Z=S;W=ak+o|0;ac=ab+W|0;_=ac;K=S-(ab+ak)-o|0;c[ab+(ak+4)>>2]=o|3;do{if((Z|0)==(c[7444]|0)){J=(c[7441]|0)+K|0;c[7441]=J;c[7444]=_;c[ab+(W+4)>>2]=J|1}else{if((Z|0)==(c[7443]|0)){J=(c[7440]|0)+K|0;c[7440]=J;c[7443]=_;c[ab+(W+4)>>2]=J|1;c[ab+(J+W)>>2]=J;break}J=aa+4|0;X=c[ab+(J+al)>>2]|0;if((X&3|0)==1){$=X&-8;V=X>>>3;L927:do{if(X>>>0<256>>>0){U=c[ab+((al|8)+aa)>>2]|0;Q=c[ab+(aa+12+al)>>2]|0;R=29792+(V<<1<<2)|0;do{if((U|0)!=(R|0)){if(U>>>0<(c[7442]|0)>>>0){av();return 0}if((c[U+12>>2]|0)==(Z|0)){break}av();return 0}}while(0);if((Q|0)==(U|0)){c[7438]=c[7438]&~(1<<V);break}do{if((Q|0)==(R|0)){am=Q+8|0}else{if(Q>>>0<(c[7442]|0)>>>0){av();return 0}m=Q+8|0;if((c[m>>2]|0)==(Z|0)){am=m;break}av();return 0}}while(0);c[U+12>>2]=Q;c[am>>2]=U}else{R=S;m=c[ab+((al|24)+aa)>>2]|0;P=c[ab+(aa+12+al)>>2]|0;do{if((P|0)==(R|0)){O=al|16;g=ab+(J+O)|0;L=c[g>>2]|0;if((L|0)==0){e=ab+(O+aa)|0;O=c[e>>2]|0;if((O|0)==0){an=0;break}else{ao=O;ap=e}}else{ao=L;ap=g}while(1){g=ao+20|0;L=c[g>>2]|0;if((L|0)!=0){ao=L;ap=g;continue}g=ao+16|0;L=c[g>>2]|0;if((L|0)==0){break}else{ao=L;ap=g}}if(ap>>>0<(c[7442]|0)>>>0){av();return 0}else{c[ap>>2]=0;an=ao;break}}else{g=c[ab+((al|8)+aa)>>2]|0;if(g>>>0<(c[7442]|0)>>>0){av();return 0}L=g+12|0;if((c[L>>2]|0)!=(R|0)){av();return 0}e=P+8|0;if((c[e>>2]|0)==(R|0)){c[L>>2]=P;c[e>>2]=g;an=P;break}else{av();return 0}}}while(0);if((m|0)==0){break}P=ab+(aa+28+al)|0;U=30056+(c[P>>2]<<2)|0;do{if((R|0)==(c[U>>2]|0)){c[U>>2]=an;if((an|0)!=0){break}c[7439]=c[7439]&~(1<<c[P>>2]);break L927}else{if(m>>>0<(c[7442]|0)>>>0){av();return 0}Q=m+16|0;if((c[Q>>2]|0)==(R|0)){c[Q>>2]=an}else{c[m+20>>2]=an}if((an|0)==0){break L927}}}while(0);if(an>>>0<(c[7442]|0)>>>0){av();return 0}c[an+24>>2]=m;R=al|16;P=c[ab+(R+aa)>>2]|0;do{if((P|0)!=0){if(P>>>0<(c[7442]|0)>>>0){av();return 0}else{c[an+16>>2]=P;c[P+24>>2]=an;break}}}while(0);P=c[ab+(J+R)>>2]|0;if((P|0)==0){break}if(P>>>0<(c[7442]|0)>>>0){av();return 0}else{c[an+20>>2]=P;c[P+24>>2]=an;break}}}while(0);aq=ab+(($|al)+aa)|0;ar=$+K|0}else{aq=Z;ar=K}J=aq+4|0;c[J>>2]=c[J>>2]&-2;c[ab+(W+4)>>2]=ar|1;c[ab+(ar+W)>>2]=ar;J=ar>>>3;if(ar>>>0<256>>>0){V=J<<1;X=29792+(V<<2)|0;P=c[7438]|0;m=1<<J;do{if((P&m|0)==0){c[7438]=P|m;as=X;at=29792+(V+2<<2)|0}else{J=29792+(V+2<<2)|0;U=c[J>>2]|0;if(U>>>0>=(c[7442]|0)>>>0){as=U;at=J;break}av();return 0}}while(0);c[at>>2]=_;c[as+12>>2]=_;c[ab+(W+8)>>2]=as;c[ab+(W+12)>>2]=X;break}V=ac;m=ar>>>8;do{if((m|0)==0){au=0}else{if(ar>>>0>16777215>>>0){au=31;break}P=(m+1048320|0)>>>16&8;$=m<<P;J=($+520192|0)>>>16&4;U=$<<J;$=(U+245760|0)>>>16&2;Q=14-(J|P|$)+(U<<$>>>15)|0;au=ar>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);m=30056+(au<<2)|0;c[ab+(W+28)>>2]=au;c[ab+(W+20)>>2]=0;c[ab+(W+16)>>2]=0;X=c[7439]|0;Q=1<<au;if((X&Q|0)==0){c[7439]=X|Q;c[m>>2]=V;c[ab+(W+24)>>2]=m;c[ab+(W+12)>>2]=V;c[ab+(W+8)>>2]=V;break}if((au|0)==31){aw=0}else{aw=25-(au>>>1)|0}Q=ar<<aw;X=c[m>>2]|0;while(1){if((c[X+4>>2]&-8|0)==(ar|0)){break}ax=X+16+(Q>>>31<<2)|0;m=c[ax>>2]|0;if((m|0)==0){T=765;break}else{Q=Q<<1;X=m}}if((T|0)==765){if(ax>>>0<(c[7442]|0)>>>0){av();return 0}else{c[ax>>2]=V;c[ab+(W+24)>>2]=X;c[ab+(W+12)>>2]=V;c[ab+(W+8)>>2]=V;break}}Q=X+8|0;m=c[Q>>2]|0;$=c[7442]|0;if(X>>>0<$>>>0){av();return 0}if(m>>>0<$>>>0){av();return 0}else{c[m+12>>2]=V;c[Q>>2]=V;c[ab+(W+8)>>2]=m;c[ab+(W+12)>>2]=X;c[ab+(W+24)>>2]=0;break}}}while(0);n=ab+(ak|8)|0;return n|0}}while(0);Y=ad;W=30200;while(1){ay=c[W>>2]|0;if(ay>>>0<=Y>>>0){az=c[W+4>>2]|0;aA=ay+az|0;if(aA>>>0>Y>>>0){break}}W=c[W+8>>2]|0}W=ay+(az-39)|0;if((W&7|0)==0){aB=0}else{aB=-W&7}W=ay+(az-47+aB)|0;ac=W>>>0<(ad+16|0)>>>0?Y:W;W=ac+8|0;_=ab+8|0;if((_&7|0)==0){aC=0}else{aC=-_&7}_=aa-40-aC|0;c[7444]=ab+aC;c[7441]=_;c[ab+(aC+4)>>2]=_|1;c[ab+(aa-36)>>2]=40;c[7445]=c[7436];c[ac+4>>2]=27;c[W>>2]=c[7550];c[W+4>>2]=c[7551];c[W+8>>2]=c[7552];c[W+12>>2]=c[7553];c[7550]=ab;c[7551]=aa;c[7553]=0;c[7552]=W;W=ac+28|0;c[W>>2]=7;if((ac+32|0)>>>0<aA>>>0){_=W;while(1){W=_+4|0;c[W>>2]=7;if((_+8|0)>>>0<aA>>>0){_=W}else{break}}}if((ac|0)==(Y|0)){break}_=ac-ad|0;W=Y+(_+4)|0;c[W>>2]=c[W>>2]&-2;c[ad+4>>2]=_|1;c[Y+_>>2]=_;W=_>>>3;if(_>>>0<256>>>0){K=W<<1;Z=29792+(K<<2)|0;S=c[7438]|0;m=1<<W;do{if((S&m|0)==0){c[7438]=S|m;aD=Z;aE=29792+(K+2<<2)|0}else{W=29792+(K+2<<2)|0;Q=c[W>>2]|0;if(Q>>>0>=(c[7442]|0)>>>0){aD=Q;aE=W;break}av();return 0}}while(0);c[aE>>2]=ad;c[aD+12>>2]=ad;c[ad+8>>2]=aD;c[ad+12>>2]=Z;break}K=ad;m=_>>>8;do{if((m|0)==0){aF=0}else{if(_>>>0>16777215>>>0){aF=31;break}S=(m+1048320|0)>>>16&8;Y=m<<S;ac=(Y+520192|0)>>>16&4;W=Y<<ac;Y=(W+245760|0)>>>16&2;Q=14-(ac|S|Y)+(W<<Y>>>15)|0;aF=_>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);m=30056+(aF<<2)|0;c[ad+28>>2]=aF;c[ad+20>>2]=0;c[ad+16>>2]=0;Z=c[7439]|0;Q=1<<aF;if((Z&Q|0)==0){c[7439]=Z|Q;c[m>>2]=K;c[ad+24>>2]=m;c[ad+12>>2]=ad;c[ad+8>>2]=ad;break}if((aF|0)==31){aG=0}else{aG=25-(aF>>>1)|0}Q=_<<aG;Z=c[m>>2]|0;while(1){if((c[Z+4>>2]&-8|0)==(_|0)){break}aH=Z+16+(Q>>>31<<2)|0;m=c[aH>>2]|0;if((m|0)==0){T=800;break}else{Q=Q<<1;Z=m}}if((T|0)==800){if(aH>>>0<(c[7442]|0)>>>0){av();return 0}else{c[aH>>2]=K;c[ad+24>>2]=Z;c[ad+12>>2]=ad;c[ad+8>>2]=ad;break}}Q=Z+8|0;_=c[Q>>2]|0;m=c[7442]|0;if(Z>>>0<m>>>0){av();return 0}if(_>>>0<m>>>0){av();return 0}else{c[_+12>>2]=K;c[Q>>2]=K;c[ad+8>>2]=_;c[ad+12>>2]=Z;c[ad+24>>2]=0;break}}}while(0);ad=c[7441]|0;if(ad>>>0<=o>>>0){break}_=ad-o|0;c[7441]=_;ad=c[7444]|0;Q=ad;c[7444]=Q+o;c[Q+(o+4)>>2]=_|1;c[ad+4>>2]=o|3;n=ad+8|0;return n|0}}while(0);c[(aZ()|0)>>2]=12;n=0;return n|0}function dS(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;if((a|0)==0){return}b=a-8|0;d=b;e=c[7442]|0;if(b>>>0<e>>>0){av()}f=c[a-4>>2]|0;g=f&3;if((g|0)==1){av()}h=f&-8;i=a+(h-8)|0;j=i;L1099:do{if((f&1|0)==0){k=c[b>>2]|0;if((g|0)==0){return}l=-8-k|0;m=a+l|0;n=m;o=k+h|0;if(m>>>0<e>>>0){av()}if((n|0)==(c[7443]|0)){p=a+(h-4)|0;if((c[p>>2]&3|0)!=3){q=n;r=o;break}c[7440]=o;c[p>>2]=c[p>>2]&-2;c[a+(l+4)>>2]=o|1;c[i>>2]=o;return}p=k>>>3;if(k>>>0<256>>>0){k=c[a+(l+8)>>2]|0;s=c[a+(l+12)>>2]|0;t=29792+(p<<1<<2)|0;do{if((k|0)!=(t|0)){if(k>>>0<e>>>0){av()}if((c[k+12>>2]|0)==(n|0)){break}av()}}while(0);if((s|0)==(k|0)){c[7438]=c[7438]&~(1<<p);q=n;r=o;break}do{if((s|0)==(t|0)){u=s+8|0}else{if(s>>>0<e>>>0){av()}v=s+8|0;if((c[v>>2]|0)==(n|0)){u=v;break}av()}}while(0);c[k+12>>2]=s;c[u>>2]=k;q=n;r=o;break}t=m;p=c[a+(l+24)>>2]|0;v=c[a+(l+12)>>2]|0;do{if((v|0)==(t|0)){w=a+(l+20)|0;x=c[w>>2]|0;if((x|0)==0){y=a+(l+16)|0;z=c[y>>2]|0;if((z|0)==0){A=0;break}else{B=z;C=y}}else{B=x;C=w}while(1){w=B+20|0;x=c[w>>2]|0;if((x|0)!=0){B=x;C=w;continue}w=B+16|0;x=c[w>>2]|0;if((x|0)==0){break}else{B=x;C=w}}if(C>>>0<e>>>0){av()}else{c[C>>2]=0;A=B;break}}else{w=c[a+(l+8)>>2]|0;if(w>>>0<e>>>0){av()}x=w+12|0;if((c[x>>2]|0)!=(t|0)){av()}y=v+8|0;if((c[y>>2]|0)==(t|0)){c[x>>2]=v;c[y>>2]=w;A=v;break}else{av()}}}while(0);if((p|0)==0){q=n;r=o;break}v=a+(l+28)|0;m=30056+(c[v>>2]<<2)|0;do{if((t|0)==(c[m>>2]|0)){c[m>>2]=A;if((A|0)!=0){break}c[7439]=c[7439]&~(1<<c[v>>2]);q=n;r=o;break L1099}else{if(p>>>0<(c[7442]|0)>>>0){av()}k=p+16|0;if((c[k>>2]|0)==(t|0)){c[k>>2]=A}else{c[p+20>>2]=A}if((A|0)==0){q=n;r=o;break L1099}}}while(0);if(A>>>0<(c[7442]|0)>>>0){av()}c[A+24>>2]=p;t=c[a+(l+16)>>2]|0;do{if((t|0)!=0){if(t>>>0<(c[7442]|0)>>>0){av()}else{c[A+16>>2]=t;c[t+24>>2]=A;break}}}while(0);t=c[a+(l+20)>>2]|0;if((t|0)==0){q=n;r=o;break}if(t>>>0<(c[7442]|0)>>>0){av()}else{c[A+20>>2]=t;c[t+24>>2]=A;q=n;r=o;break}}else{q=d;r=h}}while(0);d=q;if(d>>>0>=i>>>0){av()}A=a+(h-4)|0;e=c[A>>2]|0;if((e&1|0)==0){av()}do{if((e&2|0)==0){if((j|0)==(c[7444]|0)){B=(c[7441]|0)+r|0;c[7441]=B;c[7444]=q;c[q+4>>2]=B|1;if((q|0)!=(c[7443]|0)){return}c[7443]=0;c[7440]=0;return}if((j|0)==(c[7443]|0)){B=(c[7440]|0)+r|0;c[7440]=B;c[7443]=q;c[q+4>>2]=B|1;c[d+B>>2]=B;return}B=(e&-8)+r|0;C=e>>>3;L1201:do{if(e>>>0<256>>>0){u=c[a+h>>2]|0;g=c[a+(h|4)>>2]|0;b=29792+(C<<1<<2)|0;do{if((u|0)!=(b|0)){if(u>>>0<(c[7442]|0)>>>0){av()}if((c[u+12>>2]|0)==(j|0)){break}av()}}while(0);if((g|0)==(u|0)){c[7438]=c[7438]&~(1<<C);break}do{if((g|0)==(b|0)){D=g+8|0}else{if(g>>>0<(c[7442]|0)>>>0){av()}f=g+8|0;if((c[f>>2]|0)==(j|0)){D=f;break}av()}}while(0);c[u+12>>2]=g;c[D>>2]=u}else{b=i;f=c[a+(h+16)>>2]|0;t=c[a+(h|4)>>2]|0;do{if((t|0)==(b|0)){p=a+(h+12)|0;v=c[p>>2]|0;if((v|0)==0){m=a+(h+8)|0;k=c[m>>2]|0;if((k|0)==0){E=0;break}else{F=k;G=m}}else{F=v;G=p}while(1){p=F+20|0;v=c[p>>2]|0;if((v|0)!=0){F=v;G=p;continue}p=F+16|0;v=c[p>>2]|0;if((v|0)==0){break}else{F=v;G=p}}if(G>>>0<(c[7442]|0)>>>0){av()}else{c[G>>2]=0;E=F;break}}else{p=c[a+h>>2]|0;if(p>>>0<(c[7442]|0)>>>0){av()}v=p+12|0;if((c[v>>2]|0)!=(b|0)){av()}m=t+8|0;if((c[m>>2]|0)==(b|0)){c[v>>2]=t;c[m>>2]=p;E=t;break}else{av()}}}while(0);if((f|0)==0){break}t=a+(h+20)|0;u=30056+(c[t>>2]<<2)|0;do{if((b|0)==(c[u>>2]|0)){c[u>>2]=E;if((E|0)!=0){break}c[7439]=c[7439]&~(1<<c[t>>2]);break L1201}else{if(f>>>0<(c[7442]|0)>>>0){av()}g=f+16|0;if((c[g>>2]|0)==(b|0)){c[g>>2]=E}else{c[f+20>>2]=E}if((E|0)==0){break L1201}}}while(0);if(E>>>0<(c[7442]|0)>>>0){av()}c[E+24>>2]=f;b=c[a+(h+8)>>2]|0;do{if((b|0)!=0){if(b>>>0<(c[7442]|0)>>>0){av()}else{c[E+16>>2]=b;c[b+24>>2]=E;break}}}while(0);b=c[a+(h+12)>>2]|0;if((b|0)==0){break}if(b>>>0<(c[7442]|0)>>>0){av()}else{c[E+20>>2]=b;c[b+24>>2]=E;break}}}while(0);c[q+4>>2]=B|1;c[d+B>>2]=B;if((q|0)!=(c[7443]|0)){H=B;break}c[7440]=B;return}else{c[A>>2]=e&-2;c[q+4>>2]=r|1;c[d+r>>2]=r;H=r}}while(0);r=H>>>3;if(H>>>0<256>>>0){d=r<<1;e=29792+(d<<2)|0;A=c[7438]|0;E=1<<r;do{if((A&E|0)==0){c[7438]=A|E;I=e;J=29792+(d+2<<2)|0}else{r=29792+(d+2<<2)|0;h=c[r>>2]|0;if(h>>>0>=(c[7442]|0)>>>0){I=h;J=r;break}av()}}while(0);c[J>>2]=q;c[I+12>>2]=q;c[q+8>>2]=I;c[q+12>>2]=e;return}e=q;I=H>>>8;do{if((I|0)==0){K=0}else{if(H>>>0>16777215>>>0){K=31;break}J=(I+1048320|0)>>>16&8;d=I<<J;E=(d+520192|0)>>>16&4;A=d<<E;d=(A+245760|0)>>>16&2;r=14-(E|J|d)+(A<<d>>>15)|0;K=H>>>((r+7|0)>>>0)&1|r<<1}}while(0);I=30056+(K<<2)|0;c[q+28>>2]=K;c[q+20>>2]=0;c[q+16>>2]=0;r=c[7439]|0;d=1<<K;do{if((r&d|0)==0){c[7439]=r|d;c[I>>2]=e;c[q+24>>2]=I;c[q+12>>2]=q;c[q+8>>2]=q}else{if((K|0)==31){L=0}else{L=25-(K>>>1)|0}A=H<<L;J=c[I>>2]|0;while(1){if((c[J+4>>2]&-8|0)==(H|0)){break}M=J+16+(A>>>31<<2)|0;E=c[M>>2]|0;if((E|0)==0){N=977;break}else{A=A<<1;J=E}}if((N|0)==977){if(M>>>0<(c[7442]|0)>>>0){av()}else{c[M>>2]=e;c[q+24>>2]=J;c[q+12>>2]=q;c[q+8>>2]=q;break}}A=J+8|0;B=c[A>>2]|0;E=c[7442]|0;if(J>>>0<E>>>0){av()}if(B>>>0<E>>>0){av()}else{c[B+12>>2]=e;c[A>>2]=e;c[q+8>>2]=B;c[q+12>>2]=J;c[q+24>>2]=0;break}}}while(0);q=(c[7446]|0)-1|0;c[7446]=q;if((q|0)==0){O=30208}else{return}while(1){q=c[O>>2]|0;if((q|0)==0){break}else{O=q+8|0}}c[7446]=-1;return}function dT(a){a=a|0;var b=0,d=0,e=0;b=(a|0)==0?1:a;while(1){d=dR(b)|0;if((d|0)!=0){e=1029;break}a=(B=c[7568]|0,c[7568]=B+0,B);if((a|0)==0){break}a8[a&3]()}if((e|0)==1029){return d|0}d=aL(4)|0;c[d>>2]=2040;as(d|0,2528,30);return 0}function dU(a){a=a|0;return dT(a)|0}function dV(a){a=a|0;if((a|0)==0){return}dS(a);return}function dW(a){a=a|0;dV(a);return}function dX(a){a=a|0;dV(a);return}function dY(a){a=a|0;return}function dZ(a){a=a|0;return 1776}function d_(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;f=b|0;if((b&3)==(d&3)){while(b&3){if((e|0)==0)return f|0;a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function d$(b){b=b|0;var c=0;c=b;while(a[c]|0){c=c+1|0}return c-b|0}function d0(a,b,c){a=a|0;b=b|0;c=c|0;var e=0,f=0,g=0;while((e|0)<(c|0)){f=d[a+e|0]|0;g=d[b+e|0]|0;if((f|0)!=(g|0))return((f|0)>(g|0)?1:-1)|0;e=e+1|0}return 0}function d1(a){a=a|0;if((a|0)<65)return a|0;if((a|0)>90)return a|0;return a-65+97|0}function d2(b,c){b=b|0;c=c|0;var d=0;do{a[b+d|0]=a[c+d|0];d=d+1|0}while(a[c+(d-1)|0]|0);return b|0}function d3(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=b+e|0;if((e|0)>=20){d=d&255;g=b&3;h=d|d<<8|d<<16|d<<24;i=f&~3;if(g){g=b+4-g|0;while((b|0)<(g|0)){a[b]=d;b=b+1|0}}while((b|0)<(i|0)){c[b>>2]=h;b=b+4|0}}while((b|0)<(f|0)){a[b]=d;b=b+1|0}return b-e|0}function d4(){aN()}function d5(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;a3[a&7](b|0,c|0,d|0,e|0,f|0)}function d6(a,b){a=a|0;b=b|0;a4[a&63](b|0)}function d7(a,b,c){a=a|0;b=b|0;c=c|0;a5[a&3](b|0,c|0)}function d8(a,b){a=a|0;b=b|0;return a6[a&7](b|0)|0}function d9(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return a7[a&3](b|0,c|0,d|0)|0}function ea(a){a=a|0;a8[a&3]()}function eb(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;a9[a&7](b|0,c|0,d|0,e|0,f|0,g|0)}function ec(a,b,c){a=a|0;b=b|0;c=c|0;return ba[a&7](b|0,c|0)|0}function ed(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;bb[a&7](b|0,c|0,d|0,e|0)}function ee(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;aa(0)}function ef(a){a=a|0;aa(1)}function eg(a,b){a=a|0;b=b|0;aa(2)}function eh(a){a=a|0;aa(3);return 0}function ei(a,b,c){a=a|0;b=b|0;c=c|0;aa(4);return 0}function ej(){aa(5)}function ek(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;aa(6)}function el(a,b){a=a|0;b=b|0;aa(7);return 0}function em(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;aa(8)}
// EMSCRIPTEN_END_FUNCS
var a3=[ee,ee,dN,ee,dO,ee,ee,ee];var a4=[ef,ef,dB,ef,b2,ef,dX,ef,bO,ef,dH,ef,cT,ef,dE,ef,dz,ef,dg,ef,dF,ef,cS,ef,dy,ef,dz,ef,dn,ef,dY,ef,dI,ef,dG,ef,c4,ef,ef,ef,ef,ef,ef,ef,ef,ef,ef,ef,ef,ef,ef,ef,ef,ef,ef,ef,ef,ef,ef,ef,ef,ef,ef,ef];var a5=[eg,eg,c_,eg];var a6=[eh,eh,dZ,eh,dA,eh,eh,eh];var a7=[ei,ei,dJ,ei];var a8=[ej,ej,d4,ej];var a9=[ek,ek,dP,ek,dQ,ek,ek,ek];var ba=[el,el,dp,el,bL,el,el,el];var bb=[em,em,bH,em,dK,em,dL,em];return{_memcmp:d0,_strlen:d$,__GLOBAL__I_a:bE,_free:dS,__GLOBAL__I_a60:dw,_tolower:d1,_memset:d3,_hm5move:bA,_malloc:dR,__GLOBAL__I_a17:cX,_getVisitedNodes:bB,_memcpy:d_,__GLOBAL__I_a44:dr,_strcpy:d2,runPostSets:bs,stackAlloc:bc,stackSave:bd,stackRestore:be,setThrew:bf,setTempRet0:bi,setTempRet1:bj,setTempRet2:bk,setTempRet3:bl,setTempRet4:bm,setTempRet5:bn,setTempRet6:bo,setTempRet7:bp,setTempRet8:bq,setTempRet9:br,dynCall_viiiii:d5,dynCall_vi:d6,dynCall_vii:d7,dynCall_ii:d8,dynCall_iiii:d9,dynCall_v:ea,dynCall_viiiiii:eb,dynCall_iii:ec,dynCall_viiii:ed}})
// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "invoke_viiiii": invoke_viiiii, "invoke_vi": invoke_vi, "invoke_vii": invoke_vii, "invoke_ii": invoke_ii, "invoke_iiii": invoke_iiii, "invoke_v": invoke_v, "invoke_viiiiii": invoke_viiiiii, "invoke_iii": invoke_iii, "invoke_viiii": invoke_viiii, "_rand": _rand, "_sscanf": _sscanf, "___assert_fail": ___assert_fail, "__scanString": __scanString, "___cxa_throw": ___cxa_throw, "___cxa_free_exception": ___cxa_free_exception, "__getFloat": __getFloat, "_abort": _abort, "_fprintf": _fprintf, "_llvm_eh_exception": _llvm_eh_exception, "_printf": _printf, "_fflush": _fflush, "__reallyNegative": __reallyNegative, "_snprintf": _snprintf, "_clock": _clock, "___setErrNo": ___setErrNo, "_fwrite": _fwrite, "_send": _send, "_write": _write, "_llvm_umul_with_overflow_i32": _llvm_umul_with_overflow_i32, "_exit": _exit, "_sprintf": _sprintf, "___cxa_find_matching_catch": ___cxa_find_matching_catch, "___cxa_allocate_exception": ___cxa_allocate_exception, "_sysconf": _sysconf, "___cxa_pure_virtual": ___cxa_pure_virtual, "__formatString": __formatString, "_time": _time, "_llvm_uadd_with_overflow_i32": _llvm_uadd_with_overflow_i32, "___cxa_does_inherit": ___cxa_does_inherit, "_ceil": _ceil, "__ZSt9terminatev": __ZSt9terminatev, "__ZSt18uncaught_exceptionv": __ZSt18uncaught_exceptionv, "_pwrite": _pwrite, "_sbrk": _sbrk, "___cxa_call_unexpected": ___cxa_call_unexpected, "_floor": _floor, "___errno_location": ___errno_location, "___gxx_personality_v0": ___gxx_personality_v0, "___cxa_is_number_type": ___cxa_is_number_type, "___resumeException": ___resumeException, "__exit": __exit, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "NaN": NaN, "Infinity": Infinity, "__ZTVN10__cxxabiv120__si_class_type_infoE": __ZTVN10__cxxabiv120__si_class_type_infoE, "__ZTVN10__cxxabiv117__class_type_infoE": __ZTVN10__cxxabiv117__class_type_infoE }, buffer);
var _memcmp = Module["_memcmp"] = asm["_memcmp"];
var _strlen = Module["_strlen"] = asm["_strlen"];
var __GLOBAL__I_a = Module["__GLOBAL__I_a"] = asm["__GLOBAL__I_a"];
var _free = Module["_free"] = asm["_free"];
var __GLOBAL__I_a60 = Module["__GLOBAL__I_a60"] = asm["__GLOBAL__I_a60"];
var _tolower = Module["_tolower"] = asm["_tolower"];
var _memset = Module["_memset"] = asm["_memset"];
var _hm5move = Module["_hm5move"] = asm["_hm5move"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var __GLOBAL__I_a17 = Module["__GLOBAL__I_a17"] = asm["__GLOBAL__I_a17"];
var _getVisitedNodes = Module["_getVisitedNodes"] = asm["_getVisitedNodes"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var __GLOBAL__I_a44 = Module["__GLOBAL__I_a44"] = asm["__GLOBAL__I_a44"];
var _strcpy = Module["_strcpy"] = asm["_strcpy"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var dynCall_viiiii = Module["dynCall_viiiii"] = asm["dynCall_viiiii"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_vii = Module["dynCall_vii"] = asm["dynCall_vii"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_viiiiii = Module["dynCall_viiiiii"] = asm["dynCall_viiiiii"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_viiii = Module["dynCall_viiii"] = asm["dynCall_viiii"];
Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };
// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;
// === Auto-generated postamble setup entry stuff ===
if (memoryInitializer) {
  function applyData(data) {
    HEAPU8.set(data, STATIC_BASE);
  }
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    applyData(Module['readBinary'](memoryInitializer));
  } else {
    addRunDependency('memory initializer');
    Browser.asyncLoad(memoryInitializer, function(data) {
      applyData(data);
      removeRunDependency('memory initializer');
    }, function(data) {
      throw 'could not load memory initializer ' + memoryInitializer;
    });
  }
}
function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;
var initialStackTop;
var preloadStartTime = null;
var calledMain = false;
dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun'] && shouldRunNow) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}
Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');
  args = args || [];
  if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
    Module.printErr('preload time: ' + (Date.now() - preloadStartTime) + ' ms');
  }
  ensureInitRuntime();
  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);
  initialStackTop = STACKTOP;
  try {
    var ret = Module['_main'](argc, argv, 0);
    // if we're not running an evented main loop, it's time to exit
    if (!Module['noExitRuntime']) {
      exit(ret);
    }
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
      throw e;
    }
  } finally {
    calledMain = true;
  }
}
function run(args) {
  args = args || Module['arguments'];
  if (preloadStartTime === null) preloadStartTime = Date.now();
  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }
  preRun();
  if (runDependencies > 0) {
    // a preRun added a dependency, run will be called later
    return;
  }
  function doRun() {
    ensureInitRuntime();
    preMain();
    Module['calledRun'] = true;
    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }
    postRun();
  }
  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;
function exit(status) {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;
  // exit the runtime
  exitRuntime();
  // TODO We should handle this differently based on environment.
  // In the browser, the best we can do is throw an exception
  // to halt execution, but in node we could process.exit and
  // I'd imagine SM shell would have something equivalent.
  // This would let us set a proper exit status (which
  // would be great for checking test exit statuses).
  // https://github.com/kripken/emscripten/issues/1371
  // throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;
function abort(text) {
  if (text) {
    Module.print(text);
    Module.printErr(text);
  }
  ABORT = true;
  EXITSTATUS = 1;
  throw 'abort() at ' + stackTrace();
}
Module['abort'] = Module.abort = abort;
// {{PRE_RUN_ADDITIONS}}
if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}
// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}
run();
// {{POST_RUN_ADDITIONS}}
// {{MODULE_ADDITIONS}}
var hm5move = Module.cwrap('hm5move', 'string', ['string', 'number'])
var getVisitedNodes = Module.cwrap('getVisitedNodes', 'number')
function isValidPath(path) {
  return path.search(/^((----|[1-9a-e]{2}[a-u][0-7])\/?)*$/) >= 0;
}
function limit(level) {
  switch (level) {
  case 2:
    return 3000;
  case 3:
    return 10000;
  }
  return 1000;
}  
addEventListener('message', function(e) {
  var path = e.data.path;
  var level = e.data.level;
  if (isValidPath(path)) {
    var start = Date.now();
    var move = hm5move(path, limit(level));
    var elapsed = (Date.now() - start) / 1000;
    postMessage({'move': move, 'nps': getVisitedNodes() / elapsed});
  } else {
    postMessage({'move': "XXXX invalid path"});
  }
});
