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
if (!Module) Module = (typeof Module !== 'undefined' ? Module : null) || {};

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
  if (!Module['print']) Module['print'] = function print(x) {
    process['stdout'].write(x + '\n');
  };
  if (!Module['printErr']) Module['printErr'] = function printErr(x) {
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
  if (!Module['print']) Module['print'] = print;
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
    if (!Module['print']) Module['print'] = function print(x) {
      console.log(x);
    };
    if (!Module['printErr']) Module['printErr'] = function printErr(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    if (!Module['print']) Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }

  if (ENVIRONMENT_IS_WEB) {
    window['Module'] = Module;
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
  if (/<?\{ ?[^}]* ?\}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
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
    if (type.name_ && type.name_[0] === '[') {
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
    var source = Pointer_stringify(code);
    if (source[0] === '"') {
      // tolerate EM_ASM("..code..") even though EM_ASM(..code..) is correct
      if (source.indexOf('"', 1) === source.length-1) {
        source = source.substr(1, source.length-2);
      } else {
        // something invalid happened, e.g. EM_ASM("..code($0)..", input)
        abort('invalid EM_ASM input |' + source + '|. Please use EM_ASM(..code..) (no quotes) or EM_ASM({ ..code($0).. }, input) (to input values)');
      }
    }
    try {
      var evalled = eval('(function(' + args.join(',') + '){ ' + source + ' })'); // new Function does not allow upvars in node
    } catch(e) {
      Module.printErr('error in executing inline EM_ASM code: ' + e + ' on: \n\n' + source + '\n\nwith args |' + args + '| (make sure to use the right one out of EM_ASM, EM_ASM_ARGS, etc.)');
      throw e;
    }
    return Runtime.asmConstCache[code] = evalled;
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
      /* TODO: use TextEncoder when present,
        var encoder = new TextEncoder();
        encoder['encoding'] = "utf-8";
        var utf8Array = encoder['encode'](aMsg.data);
      */
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  getCompilerSetting: function (name) {
    throw 'You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work';
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


Module['Runtime'] = Runtime;









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
  var subs = [];
  var first = true;
  function dump(x) {
    //return;
    if (x) Module.print(x);
    Module.print(func);
    var pre = '';
    for (var a = 0; a < i; a++) pre += ' ';
    Module.print (pre + '^');
  }
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
    if (rawList) {
      if (ret) {
        list.push(ret + '?');
      }
      return list;
    } else {
      return ret + flushList();
    }
  }
  try {
    // Special-case the entry point, since its name differs from other name mangling.
    if (func == 'Object._main' || func == '_main') {
      return 'main()';
    }
    if (typeof func === 'number') func = Pointer_stringify(func);
    if (func[0] !== '_') return func;
    if (func[1] !== '_') return func; // C function
    if (func[2] !== 'Z') return func;
    switch (func[3]) {
      case 'n': return 'operator new()';
      case 'd': return 'operator delete()';
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
  abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
}

var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;

var totalMemory = 4096;
while (totalMemory < TOTAL_MEMORY || totalMemory < 2*TOTAL_STACK) {
  if (totalMemory < 16*1024*1024) {
    totalMemory *= 2;
  } else {
    totalMemory += 16*1024*1024
  }
}
if (totalMemory !== TOTAL_MEMORY) {
  Module.printErr('increasing TOTAL_MEMORY to ' + totalMemory + ' to be more reasonable');
  TOTAL_MEMORY = totalMemory;
}

// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'JS engine does not provide full typed array support');

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

function unSign(value, bits, ignore) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore) {
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

// check for imul support, and also for correctness ( https://bugs.webkit.org/show_bug.cgi?id=126345 )
if (!Math['imul'] || Math['imul'](0xffffffff, 5) !== -5) Math['imul'] = function imul(a, b) {
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
var __ZTVN10__cxxabiv117__class_type_infoE = 42192;
var __ZTVN10__cxxabiv120__si_class_type_infoE = 42232;




STATIC_BASE = 8;

STATICTOP = STATIC_BASE + Runtime.alignMemory(43059);
/* global initializers */ __ATINIT__.push({ func: function() { __GLOBAL__I_a() } }, { func: function() { __GLOBAL__I_a17() } }, { func: function() { __GLOBAL__I_a44() } }, { func: function() { __GLOBAL__I_a60() } }, { func: function() { __GLOBAL__I_a35() } });


/* memory initializer */ allocate([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,88,88,88,32,105,110,118,97,108,105,100,32,109,111,118,101,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,97,108,112,104,97,32,60,61,32,98,101,116,97,0,0,0,115,101,97,114,99,104,46,99,112,112,0,0,0,0,0,0,110,101,103,97,115,99,111,117,116,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,100,62,32,37,46,51,102,32,37,115,32,40,37,100,41,10,0,0,0,0,0,0,0,55,84,105,109,101,111,117,116,0,0,0,0,0,0,0,0,216,164,0,0,184,0,0,0,0,0,0,0,32,1,0,0,1,0,0,0,2,0,0,0,1,0,0,0,0,0,0,0,49,54,65,108,112,104,97,66,101,116,97,86,105,115,105,116,111,114,0,0,0,0,0,0,49,52,77,111,118,97,98,108,101,86,105,115,105,116,111,114,0,0,0,0,0,0,0,0,216,164,0,0,0,1,0,0,0,165,0,0,232,0,0,0,24,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,114,251,229,147,21,67,237,63,203,101,163,115,126,10,20,64,84,57,237,41,57,71,4,64,2,0,0,0,0,0,0,0,15,67,171,147,51,20,239,63,237,100,112,148,188,58,252,191,232,250,62,28,36,132,245,63,1,0,0,0,0,0,0,0,26,163,117,84,53,193,232,63,117,61,209,117,225,39,0,64,191,41,172,84,80,17,252,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,72,106,161,100,114,234,228,63,168,55,163,230,171,236,40,64,206,141,233,9,75,28,14,64,2,0,0,0,0,0,0,0,101,253,102,98,186,16,230,63,71,229,38,106,105,110,2,192,115,157,70,90,42,143,1,64,1,0,0,0,0,0,0,0,104,207,101,106,18,60,227,63,24,63,141,123,243,107,37,64,73,187,209,199,124,192,5,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,247,231,162,33,227,209,225,63,107,14,16,204,209,3,0,64,64,80,110,219,247,200,11,64,2,0,0,0,0,0,0,0,148,133,175,175,117,41,229,63,120,211,45,59,196,159,38,192,150,123,129,89,161,72,4,64,1,0,0,0,0,0,0,0,106,50,227,109,165,215,217,63,56,130,84,138,29,141,244,63,114,225,64,72,22,208,13,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,123,76,164,52,155,199,222,63,249,244,216,150,1,215,49,64,112,66,33,2,14,193,15,64,2,0,0,0,0,0,0,0,34,252,139,160,49,19,227,63,54,117,30,21,255,119,12,192,170,154,32,234,62,0,9,64,1,0,0,0,0,0,0,0,117,0,196,93,189,138,216,63,129,62,145,39,73,103,48,64,76,194,133,60,130,123,15,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,180,176,167,29,254,154,218,63,158,209,86,37,145,221,17,64,96,117,228,72,103,160,15,64,2,0,0,0,0,0,0,0,203,44,66,177,21,52,223,63,18,217,7,89,22,124,46,192,98,45,62,5,192,88,13,64,1,0,0,0,0,0,0,0,82,212,153,123,72,248,211,63,103,39,131,163,228,181,0,64,255,117,110,218,140,163,18,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,112,152,104,144,130,167,221,63,49,154,149,237,67,126,47,64,172,198,18,214,198,200,16,64,2,0,0,0,0,0,0,0,176,118,20,231,168,35,228,63,65,156,135,19,152,14,242,191,8,228,18,71,30,104,12,64,1,0,0,0,0,0,0,0,229,126,135,162,64,159,213,63,101,84,25,198,221,112,46,64,211,218,52,182,215,130,19,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,171,234,229,119,154,204,225,63,87,181,164,163,28,204,234,63,113,113,84,110,162,6,16,64,2,0,0,0,0,0,0,0,31,189,225,62,114,235,227,63,148,78,36,152,106,22,34,192,148,194,188,199,153,230,12,64,1,0,0,0,0,0,0,0,55,255,175,58,114,164,218,63,4,175,150,59,51,65,226,63,31,76,138,143,79,120,19,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,189,56,241,213,142,98,224,63,22,221,122,77,15,58,39,64,139,250,36,119,216,228,18,64,2,0,0,0,0,0,0,0,147,82,208,237,37,13,228,63,216,74,232,46,137,179,3,192,182,244,104,170,39,19,14,64,1,0,0,0,0,0,0,0,120,153,97,163,172,223,211,63,137,209,115,11,93,9,44,64,116,65,125,203,156,254,20,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,62,66,205,144,42,138,225,63,91,91,120,94,42,54,250,63,52,17,54,60,189,114,17,64,2,0,0,0,0,0,0,0,130,254,66,143,24,61,229,63,90,128,182,213,172,19,25,192,238,120,147,223,162,115,14,64,1,0,0,0,0,0,0,0,99,181,249,127,213,145,220,63,154,65,124,96,199,127,227,63,111,159,85,102,74,43,21,64,2,0,0,0,0,0,0,0,51,49,93,136,213,159,228,63,232,18,14,189,197,35,3,192,120,125,230,172,79,137,17,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,249,192,142,255,2,193,227,63,194,223,47,102,75,102,24,64,107,72,220,99,233,3,17,64,2,0,0,0,0,0,0,0,155,146,172,195,209,213,229,63,60,19,154,36,150,20,252,191,40,71,1,162,96,134,17,64,1,0,0,0,0,0,0,0,0,55,139,23,11,195,224,63,61,243,114,216,125,7,12,64,250,38,77,131,162,121,18,64,2,0,0,0,0,0,0,0,219,251,84,21,26,8,227,63,36,127,48,240,220,251,238,191,106,106,217,90,95,20,20,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,103,101,251,144,183,220,226,63,105,228,243,138,167,30,215,63,175,119,127,188,87,173,17,64,2,0,0,0,0,0,0,0,205,147,107,10,100,246,229,63,131,51,248,251,197,204,11,192,18,78,11,94,244,213,11,64,1,0,0,0,0,0,0,0,254,157,237,209,27,238,221,63,247,205,253,213,227,126,240,191,112,181,78,92,142,119,20,64,2,0,0,0,0,0,0,0,43,250,67,51,79,174,228,63,31,185,53,233,182,4,253,191,65,126,54,114,221,196,17,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,155,88,224,43,186,117,228,63,234,233,35,240,135,95,12,64,48,215,162,5,104,123,16,64,2,0,0,0,0,0,0,0,53,237,98,154,233,94,233,63,169,189,136,182,99,234,166,191,167,59,79,60,103,43,13,64,1,0,0,0,0,0,0,0,81,187,95,5,248,238,225,63,46,59,196,63,108,169,251,63,249,133,87,146,60,55,21,64,2,0,0,0,0,0,0,0,233,67,23,212,183,204,231,63,253,218,250,233,63,107,225,63,214,30,246,66,1,235,18,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,139,250,36,119,216,68,231,63,178,128,9,220,186,27,234,191,16,92,229,9,132,125,17,64,2,0,0,0,0,0,0,0,138,114,105,252,194,171,234,63,47,223,250,176,222,168,220,191,11,182,17,79,118,147,13,64,1,0,0,0,0,0,0,0,221,236,15,148,219,246,226,63,125,179,205,141,233,169,1,192,16,119,245,42,50,74,21,64,2,0,0,0,0,0,0,0,147,55,192,204,119,240,232,63,74,9,193,170,122,249,195,191,53,98,102,159,199,136,18,64,3,0,0,0,0,0,0,0,76,55,137,65,96,229,236,63,240,135,159,255,30,252,3,192,244,82,177,49,175,3,11,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,7,179,9,48,44,127,229,63,90,17,53,209,231,99,4,64,190,160,133,4,140,174,17,64,2,0,0,0,0,0,0,0,80,81,245,43,157,143,235,63,132,241,211,184,55,191,232,63,19,153,185,192,229,49,11,64,1,0,0,0,0,0,0,0,5,225,10,40,212,83,226,63,68,192,33,84,169,57,4,64,207,247,83,227,165,171,20,64,2,0,0,0,0,0,0,0,195,240,17,49,37,18,234,63,37,205,31,211,218,244,244,63,208,71,25,113,1,104,15,64,3,0,0,0,0,0,0,0,149,187,207,241,209,226,236,63,222,3,116,95,206,172,250,191,107,127,103,123,244,102,10,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,28,122,139,135,247,28,233,63,22,79,61,210,224,246,245,191,21,112,207,243,167,253,16,64,2,0,0,0,0,0,0,0,192,233,93,188,31,55,236,63,42,202,165,241,11,175,227,191,59,114,164,51,48,210,7,64,1,0,0,0,0,0,0,0,199,15,149,70,204,236,230,63,54,147,111,182,185,209,2,192,37,93,51,249,102,155,18,64,2,0,0,0,0,0,0,0,16,65,213,232,213,0,235,63,132,18,102,218,254,149,215,191,161,106,244,106,128,18,12,64,3,0,0,0,0,0,0,0,133,210,23,66,206,251,236,63,113,175,204,91,117,221,253,191,196,120,205,171,58,235,13,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,236,250,5,187,97,219,231,63,171,118,77,72,107,12,254,63,85,48,42,169,19,240,14,64,2,0,0,0,0,0,0,0,110,138,199,69,181,8,237,63,238,122,105,138,0,167,211,63,73,75,229,237,8,135,5,64,1,0,0,0,0,0,0,0,21,54,3,92,144,173,229,63,42,139,194,46,138,94,247,63,82,127,189,194,130,203,17,64,2,0,0,0,0,0,0,0,214,199,67,223,221,202,236,63,106,104,3,176,1,17,227,63,111,244,49,31,16,232,13,64,3,0,0,0,0,0,0,0,74,64,76,194,133,188,237,63,105,196,204,62,143,17,0,192,225,149,36,207,245,29,17,64,4,0,0,0,0,0,0,0,9,221,37,113,86,132,240,63,42,170,126,165,243,33,248,63,30,79,203,15,92,69,17,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,207,192,200,203,154,88,236,63,222,146,28,176,171,73,238,191,247,229,204,118,133,94,7,64,2,0,0,0,0,0,0,0,49,91,178,42,194,205,237,63,233,183,175,3,231,140,206,63,75,174,98,241,155,194,4,64,1,0,0,0,0,0,0,0,121,149,181,77,241,56,236,63,155,88,224,43,186,245,254,191,89,25,141,124,94,1,16,64,2,0,0,0,0,0,0,0,84,29,114,51,220,128,237,63,152,162,92,26,191,48,241,63,167,60,186,17,22,101,18,64,3,0,0,0,0,0,0,0,172,197,167,0,24,207,239,63,141,125,201,198,131,205,3,192,138,59,222,228,183,200,18,64,4,0,0,0,0,0,0,0,98,216,97,76,250,187,240,63,66,238,34,76,81,110,7,64,210,56,212,239,194,182,19,64,3,0,0,0,0,0,0,0,242,124,6,212,155,145,240,63,118,253,130,221,176,141,8,192,187,39,15,11,181,22,26,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,49,97,52,43,219,7,235,63,57,156,249,213,28,160,227,63,225,183,33,198,107,94,10,64,2,0,0,0,0,0,0,0,187,184,141,6,240,150,237,63,124,238,4,251,175,115,213,63,225,12,254,126,49,219,8,64,1,0,0,0,0,0,0,0,245,216,150,1,103,169,234,63,35,47,107,98,129,47,237,191,236,80,77,73,214,49,19,64,2,0,0,0,0,0,0,0,182,45,202,108,144,201,237,63,153,155,111,68,247,172,244,63,135,52,42,112,178,125,19,64,3,0,0,0,0,0,0,0,41,233,97,104,117,242,239,63,80,200,206,219,216,76,12,192,188,175,202,133,202,111,19,64,4,0,0,0,0,0,0,0,135,78,207,187,177,160,241,63,81,249,215,242,202,181,243,63,15,153,242,33,168,26,19,64,3,0,0,0,0,0,0,0,2,69,44,98,216,161,240,63,191,101,78,151,197,84,20,192,70,149,97,220,13,146,26,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,30,137,151,167,115,69,237,63,39,23,99,96,29,199,237,191,205,228,155,109,110,140,11,64,2,0,0,0,0,0,0,0,39,188,4,167,62,144,237,63,11,11,238,7,60,48,192,191,209,233,121,55,22,180,14,64,1,0,0,0,0,0,0,0,143,29,84,226,58,70,234,63,123,215,160,47,189,221,0,192,96,177,134,139,220,163,21,64,2,0,0,0,0,0,0,0,109,173,47,18,218,114,236,63,189,252,78,147,25,111,234,63,104,3,176,1,17,82,21,64,3,0,0,0,0,0,0,0,4,115,244,248,189,77,240,63,235,197,80,78,180,107,2,192,231,110,215,75,83,132,20,64,4,0,0,0,0,0,0,0,199,187,35,99,181,57,241,63,124,66,118,222,198,166,7,64,69,240,191,149,236,88,20,64,3,0,0,0,0,0,0,0,120,94,42,54,230,245,241,63,195,159,225,205,26,252,11,192,142,7,91,236,246,233,28,64,4,0,0,0,0,0,0,0,166,70,232,103,234,181,243,63,176,85,130,197,225,28,25,64,93,52,100,60,74,229,28,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,164,54,113,114,191,67,234,63,77,243,142,83,116,36,235,63,184,33,198,107,94,5,18,64,2,0,0,0,0,0,0,0,68,191,182,126,250,207,238,63,142,59,165,131,245,255,231,63,178,156,132,210,23,66,13,64,1,0,0,0,0,0,0,0,148,105,52,185,24,131,232,63,137,155,83,201,0,80,209,191,42,115,243,141,232,30,24,64,2,0,0,0,0,0,0,0,83,118,250,65,93,100,240,63,178,160,48,40,211,104,244,63,216,72,18,132,43,0,22,64,3,0,0,0,0,0,0,0,138,144,186,157,125,101,240,63,110,162,150,230,86,8,13,192,143,196,203,211,185,66,21,64,4,0,0,0,0,0,0,0,64,109,84,167,3,89,243,63,219,251,84,21,26,8,236,63,190,164,49,90,71,213,19,64,3,0,0,0,0,0,0,0,215,220,209,255,114,109,242,63,106,18,188,33,141,202,27,192,23,97,138,114,105,60,30,64,4,0,0,0,0,0,0,0,120,241,126,220,126,249,245,63,213,178,181,190,72,40,243,63,125,8,170,70,175,166,28,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,22,164,25,139,166,179,238,63,168,27,40,240,78,254,250,191,23,185,167,171,59,22,15,64,2,0,0,0,0,0,0,0,34,108,120,122,165,172,238,63,237,17,106,134,84,17,241,63,61,39,189,111,124,205,12,64,1,0,0,0,0,0,0,0,82,185,137,90,154,219,238,63,251,178,180,83,115,185,6,192,76,113,85,217,119,37,22,64,2,0,0,0,0,0,0,0,88,168,53,205,59,206,239,63,70,39,75,173,247,59,3,64,90,183,65,237,183,246,22,64,3,0,0,0,0,0,0,0,61,187,124,235,195,58,242,63,199,218,223,217,30,189,1,192,103,215,189,21,137,105,21,64,4,0,0,0,0,0,0,0,102,134,141,178,126,243,243,63,128,184,171,87,145,129,17,64,139,135,247,28,88,190,21,64,3,0,0,0,0,0,0,0,225,13,105,84,224,164,244,63,225,125,85,46,84,94,11,192,231,167,56,14,188,106,30,64,4,0,0,0,0,0,0,0,153,213,59,220,14,13,247,63,50,115,129,203,99,93,30,64,140,215,188,170,179,138,29,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,227,81,42,225,9,61,237,63,190,246,204,146,0,181,244,191,1,165,161,70,33,57,16,64,2,0,0,0,0,0,0,0,227,84,107,97,22,154,240,63,191,152,45,89,21,97,226,63,218,57,205,2,237,142,10,64,1,0,0,0,0,0,0,0,97,165,130,138,170,95,238,63,187,42,80,139,193,227,8,192,119,21,82,126,82,61,24,64,2,0,0,0,0,0,0,0,183,211,214,136,96,28,242,63,5,136,130,25,83,112,245,63,168,227,49,3,149,97,22,64,3,0,0,0,0,0,0,0,118,110,218,140,211,208,243,63,58,234,232,184,26,121,21,192,169,193,52,12,31,81,21,64,4,0,0,0,0,0,0,0,179,8,197,86,208,116,244,63,255,150,0,252,83,234,241,63,238,93,131,190,244,22,23,64,3,0,0,0,0,0,0,0,214,59,220,14,13,203,246,63,121,118,249,214,135,253,33,192,72,106,161,100,114,42,30,64,4,0,0,0,0,0,0,0,5,52,17,54,60,125,247,63,160,198,189,249,13,83,246,63,189,83,1,247,60,95,30,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,88,197,27,153,71,190,240,63,9,254,183,146,29,91,242,191,202,249,98,239,197,55,11,64,2,0,0,0,0,0,0,0,225,66,30,193,141,20,241,63,172,88,252,166,176,18,248,63,205,233,178,152,216,156,10,64,1,0,0,0,0,0,0,0,113,147,81,101,24,119,241,63,150,235,109,51,21,2,6,192,40,185,195,38,50,83,23,64,2,0,0,0,0,0,0,0,245,247,82,120,208,236,242,63,123,75,57,95,236,253,11,64,225,41,228,74,61,139,23,64,3,0,0,0,0,0,0,0,104,234,117,139,192,88,243,63,235,172,22,216,99,34,3,192,204,11,176,143,78,13,25,64,4,0,0,0,0,0,0,0,244,79,112,177,162,70,245,63,97,23,69,15,124,28,21,64,87,147,167,172,166,251,21,64,3,0,0,0,0,0,0,0,9,53,67,170,40,30,246,63,153,42,24,149,212,233,7,192,178,128,9,220,186,83,32,64,4,0,0,0,0,0,0,0,95,153,183,234,58,212,247,63,30,194,248,105,220,75,32,64,84,116,36,151,255,80,28,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,99,43,104,90,98,37,240,63,243,141,232,158,117,205,252,191,129,208,122,248,50,241,12,64,2,0,0,0,0,0,0,0,181,55,248,194,100,106,241,63,40,68,192,33,84,41,226,63,177,22,159,2,96,12,17,64,1,0,0,0,0,0,0,0,253,189,20,30,52,187,241,63,75,89,134,56,214,53,18,192,65,73,129,5,48,213,25,64,2,0,0,0,0,0,0,0,45,92,86,97,51,64,243,63,54,177,192,87,116,43,242,63,237,17,106,134,84,225,27,64,3,0,0,0,0,0,0,0,65,242,206,161,12,21,245,63,31,159,144,157,183,65,26,192,50,56,74,94,157,99,24,64,4,0,0,0,0,0,0,0,235,225,203,68,17,82,245,63,216,126,50,198,135,217,210,63,69,101,195,154,202,194,20,64,3,0,0,0,0,0,0,0,157,74,6,128,42,110,247,63,15,214,255,57,204,95,35,192,133,150,117,255,88,184,31,64,4,0,0,0,0,0,0,0,192,7,175,93,218,240,246,63,240,221,230,141,147,194,140,191,12,118,195,182,69,73,24,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,1,0,0,3,0,0,0,4,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,50,88,0,0,0,0,0,0,0,0,0,0,0,0,0,45,45,45,45,0,0,0,0,37,50,88,37,99,37,100,0,16,0,0,0,16,0,0,0,16,0,0,0,16,0,0,0,16,0,0,0,16,0,0,0,16,0,0,0,16,0,0,0,16,0,0,0,16,0,0,0,16,0,0,0,16,0,0,0,10,0,0,0,10,0,0,0,10,0,0,0,10,0,0,0,10,0,0,0,6,0,0,0,6,0,0,0,4,0,0,0,2,0,0,0,0,0,0,0,71,116,0,0,0,0,0,0,1,16,0,0,0,0,0,0,0,0,0,0,72,33,0,0,5,0,0,0,6,0,0,0,2,0,0,0,0,0,0,0,49,51,77,111,118,101,67,111,108,108,101,99,116,111,114,0,0,165,0,0,56,33,0,0,24,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,68,0,52,0,67,0,84,0,69,0,85,8,84,8,68,8,52,8,67,8,53,9,52,9,68,9,84,9,67,9,53,10,69,10,68,10,67,10,84,10,85,11,69,11,68,11,67,11,52,11,51,12,52,12,68,12,84,12,69,12,83,13,84,13,68,13,52,13,69,13,83,14,67,14,68,14,69,14,52,14,51,15,67,15,68,15,69,15,84,15,68,16,52,16,51,16,84,16,85,16,68,17,84,17,83,17,52,17,53,17,68,18,67,18,83,18,69,18,53,18,68,19,67,19,51,19,69,19,85,19,68,24,52,24,51,24,69,24,85,24,68,25,84,25,83,25,69,25,53,25,68,26,67,26,83,26,52,26,53,26,68,27,67,27,51,27,84,27,85,27,68,32,52,32,36,32,69,32,70,32,68,33,84,33,100,33,69,33,70,33,68,34,67,34,66,34,52,34,36,34,68,35,67,35,66,35,84,35,100,35,68,40,69,40,67,40,83,40,51,40,68,42,52,42,84,42,85,42,83,42,68,43,84,43,52,43,53,43,51,43,68,44,67,44,69,44,53,44,85,44,69,48,68,48,52,48,67,48,66,48,69,49,68,49,84,49,67,49,66,49,52,50,68,50,67,50,84,50,100,50,84,51,68,51,67,51,52,51,36,51,67,52,68,52,84,52,69,52,70,52,67,53,68,53,52,53,69,53,70,53,84,54,68,54,69,54,52,54,36,54,52,55,68,55,69,55,84,55,100,55,68,56,67,56,83,56,69,56,85,56,68,57,67,57,51,57,69,57,53,57,68,58,84,58,85,58,52,58,53,58,68,62,52,62,51,62,84,62,83,62,69,64,84,64,68,64,83,64,67,64,69,65,52,65,68,65,51,65,67,65,52,66,69,66,68,66,85,66,84,66,84,67,69,67,68,67,53,67,52,67,67,68,52,68,68,68,53,68,69,68,67,69,84,69,68,69,85,69,69,69,84,70,67,70,68,70,51,70,52,70,52,71,67,71,68,71,83,71,84,71,70,72,69,72,68,72,84,72,83,72,70,73,69,73,68,73,52,73,51,73,36,74,52,74,68,74,69,74,85,74,100,75,84,75,68,75,69,75,53,75,66,76,67,76,68,76,52,76,53,76,66,77,67,77,68,77,84,77,85,77,100,78,84,78,68,78,67,78,51,78,36,79,52,79,68,79,67,79,83,79,68,80,67,80,70,80,69,80,83,80,68,81,67,81,70,81,69,81,51,81,68,82,84,82,36,82,52,82,85,82,68,83,52,83,100,83,84,83,53,83,68,84,69,84,66,84,67,84,53,84,68,85,69,85,66,85,67,85,85,85,68,86,52,86,100,86,84,86,51,86,68,87,84,87,36,87,52,87,83,87,68,88,67,88,66,88,69,88,70,88,68,90,84,90,100,90,52,90,36,90,84,96,68,96,67,96,51,96,52,97,68,97,67,97,83,97,69,98,68,98,84,98,83,98,69,99,68,99,52,99,51,99,68,104,52,104,67,104,51,104,68,112,52,112,67,112,69,112,68,113,84,113,67,113,69,113,68,114,67,114,84,114,52,114,68,118,69,118,52,118,84,118,68,120,69,120,67,120,83,120,68,121,69,121,67,121,51,121,68,122,52,122,84,122,85,122,68,123,84,123,52,123,53,123,68,124,67,124,69,124,53,124,68,125,67,125,69,125,85,125,68,126,84,126,52,126,51,126,68,127,52,127,84,127,83,127,68,128,67,128,66,128,69,128,68,130,84,130,100,130,52,130,68,136,52,136,69,136,68,137,84,137,69,137,68,138,67,138,52,138,68,139,67,139,84,139,68,144,67,144,69,144,68,146,84,146,52,146,68,152,67,152,68,154,84,154,68,160,0,0,0,0,153,0,137,0,152,0,169,0,154,0,170,8,169,8,153,8,137,8,152,8,138,9,137,9,153,9,169,9,152,9,138,10,154,10,153,10,152,10,169,10,170,11,154,11,153,11,152,11,137,11,136,12,137,12,153,12,169,12,154,12,168,13,169,13,153,13,137,13,154,13,168,14,152,14,153,14,154,14,137,14,136,15,152,15,153,15,154,15,169,15,153,16,137,16,136,16,169,16,170,16,153,17,169,17,168,17,137,17,138,17,153,18,152,18,168,18,154,18,138,18,153,19,152,19,136,19,154,19,170,19,153,24,137,24,136,24,154,24,170,24,153,25,169,25,168,25,154,25,138,25,153,26,152,26,168,26,137,26,138,26,153,27,152,27,136,27,169,27,170,27,153,32,137,32,121,32,154,32,155,32,153,33,169,33,185,33,154,33,155,33,153,34,152,34,151,34,137,34,121,34,153,35,152,35,151,35,169,35,185,35,153,40,154,40,152,40,168,40,136,40,153,42,137,42,169,42,170,42,168,42,153,43,169,43,137,43,138,43,136,43,153,44,152,44,154,44,138,44,170,44,154,48,153,48,137,48,152,48,151,48,154,49,153,49,169,49,152,49,151,49,137,50,153,50,152,50,169,50,185,50,169,51,153,51,152,51,137,51,121,51,152,52,153,52,169,52,154,52,155,52,152,53,153,53,137,53,154,53,155,53,169,54,153,54,154,54,137,54,121,54,137,55,153,55,154,55,169,55,185,55,153,56,152,56,168,56,154,56,170,56,153,57,152,57,136,57,154,57,138,57,153,58,169,58,170,58,137,58,138,58,153,62,137,62,136,62,169,62,168,62,154,64,169,64,153,64,168,64,152,64,154,65,137,65,153,65,136,65,152,65,137,66,154,66,153,66,170,66,169,66,169,67,154,67,153,67,138,67,137,67,152,68,137,68,153,68,138,68,154,68,152,69,169,69,153,69,170,69,154,69,169,70,152,70,153,70,136,70,137,70,137,71,152,71,153,71,168,71,169,71,155,72,154,72,153,72,169,72,168,72,155,73,154,73,153,73,137,73,136,73,121,74,137,74,153,74,154,74,170,74,185,75,169,75,153,75,154,75,138,75,151,76,152,76,153,76,137,76,138,76,151,77,152,77,153,77,169,77,170,77,185,78,169,78,153,78,152,78,136,78,121,79,137,79,153,79,152,79,168,79,153,80,152,80,155,80,154,80,168,80,153,81,152,81,155,81,154,81,136,81,153,82,169,82,121,82,137,82,170,82,153,83,137,83,185,83,169,83,138,83,153,84,154,84,151,84,152,84,138,84,153,85,154,85,151,85,152,85,170,85,153,86,137,86,185,86,169,86,136,86,153,87,169,87,121,87,137,87,168,87,153,88,152,88,151,88,154,88,155,88,153,90,169,90,185,90,137,90,121,90,169,96,153,96,152,96,136,96,137,97,153,97,152,97,168,97,154,98,153,98,169,98,168,98,154,99,153,99,137,99,136,99,153,104,137,104,152,104,136,104,153,112,137,112,152,112,154,112,153,113,169,113,152,113,154,113,153,114,152,114,169,114,137,114,153,118,154,118,137,118,169,118,153,120,154,120,152,120,168,120,153,121,154,121,152,121,136,121,153,122,137,122,169,122,170,122,153,123,169,123,137,123,138,123,153,124,152,124,154,124,138,124,153,125,152,125,154,125,170,125,153,126,169,126,137,126,136,126,153,127,137,127,169,127,168,127,153,128,152,128,151,128,154,128,153,130,169,130,185,130,137,130,153,136,137,136,154,136,153,137,169,137,154,137,153,138,152,138,137,138,153,139,152,139,169,139,153,144,152,144,154,144,153,146,169,146,137,146,153,152,152,152,153,154,169,154,153,160,0,0,0,0,69,10,84,0,85,44,69,52,69,14,84,54,85,8,83,26,68,10,100,50,0,0,0,0,0,0,0,0,5], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);
/* memory initializer */ allocate([8,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,114,0,0,0,0,0,0,0,0,0,0,8,114,0,0,0,0,0,0,0,0,0,0,8,114,0,0,0,0,0,0,0,0,0,0,8,114,0,0,0,0,0,0,0,0,0,0,8,114,0,0,0,0,0,0,0,0,0,0,8,114,0,0,0,0,0,0,0,0,0,0,8,114,0,0,0,0,0,0,0,0,0,0,8,114,0,0,0,0,0,0,8,0,0,0,5,0,0,0,136,108,0,0,56,109,0,0,232,109,0,0,152,110,0,0,72,111,0,0,248,111,0,0,168,112,0,0,88,113,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,108,0,0,0,0,0,0,0,0,0,0,56,109,0,0,0,0,0,0,0,0,0,0,232,109,0,0,0,0,0,0,0,0,0,0,152,110,0,0,0,0,0,0,0,0,0,0,72,111,0,0,0,0,0,0,0,0,0,0,248,111,0,0,0,0,0,0,0,0,0,0,168,112,0,0,0,0,0,0,0,0,0,0,88,113,0,0,0,0,0,0,16,0,0,0,5,0,0,0,200,105,0,0,120,106,0,0,40,107,0,0,216,107,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,105,0,0,0,0,0,0,0,0,0,0,120,106,0,0,0,0,0,0,0,0,0,0,40,107,0,0,0,0,0,0,0,0,0,0,216,107,0,0,0,0,0,0,0,0,0,0,200,105,0,0,0,0,0,0,0,0,0,0,120,106,0,0,0,0,0,0,0,0,0,0,40,107,0,0,0,0,0,0,0,0,0,0,216,107,0,0,0,0,0,0,24,0,0,0,5,0,0,0,8,103,0,0,184,103,0,0,104,104,0,0,24,105,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,103,0,0,0,0,0,0,0,0,0,0,184,103,0,0,0,0,0,0,0,0,0,0,104,104,0,0,0,0,0,0,0,0,0,0,24,105,0,0,0,0,0,0,0,0,0,0,24,105,0,0,0,0,0,0,0,0,0,0,104,104,0,0,0,0,0,0,0,0,0,0,184,103,0,0,0,0,0,0,0,0,0,0,8,103,0,0,0,0,0,0,32,0,0,0,5,0,0,0,72,100,0,0,248,100,0,0,168,101,0,0,88,102,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,100,0,0,0,0,0,0,0,0,0,0,248,100,0,0,0,0,0,0,0,0,0,0,168,101,0,0,0,0,0,0,0,0,0,0,88,102,0,0,0,0,0,0,0,0,0,0,88,102,0,0,0,0,0,0,0,0,0,0,168,101,0,0,0,0,0,0,0,0,0,0,248,100,0,0,0,0,0,0,0,0,0,0,72,100,0,0,0,0,0,0,40,0,0,0,5,0,0,0,136,97,0,0,56,98,0,0,232,98,0,0,152,99,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,97,0,0,0,0,0,0,0,0,0,0,136,97,0,0,0,0,0,0,0,0,0,0,56,98,0,0,0,0,0,0,0,0,0,0,232,98,0,0,0,0,0,0,0,0,0,0,152,99,0,0,0,0,0,0,0,0,0,0,152,99,0,0,0,0,0,0,0,0,0,0,232,98,0,0,0,0,0,0,0,0,0,0,56,98,0,0,0,0,0,0,48,0,0,0,5,0,0,0,8,92,0,0,184,92,0,0,104,93,0,0,24,94,0,0,200,94,0,0,120,95,0,0,40,96,0,0,216,96,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,92,0,0,0,0,0,0,0,0,0,0,184,92,0,0,0,0,0,0,0,0,0,0,104,93,0,0,0,0,0,0,0,0,0,0,24,94,0,0,0,0,0,0,0,0,0,0,200,94,0,0,0,0,0,0,0,0,0,0,120,95,0,0,0,0,0,0,0,0,0,0,40,96,0,0,0,0,0,0,0,0,0,0,216,96,0,0,0,0,0,0,56,0,0,0,5,0,0,0,72,89,0,0,248,89,0,0,168,90,0,0,88,91,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,89,0,0,0,0,0,0,0,0,0,0,248,89,0,0,0,0,0,0,0,0,0,0,168,90,0,0,0,0,0,0,0,0,0,0,168,90,0,0,0,0,0,0,0,0,0,0,248,89,0,0,0,0,0,0,0,0,0,0,72,89,0,0,0,0,0,0,0,0,0,0,88,91,0,0,0,0,0,0,0,0,0,0,88,91,0,0,0,0,0,0,64,0,0,0,5,0,0,0,200,83,0,0,120,84,0,0,40,85,0,0,216,85,0,0,136,86,0,0,56,87,0,0,232,87,0,0,152,88,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,83,0,0,0,0,0,0,0,0,0,0,120,84,0,0,0,0,0,0,0,0,0,0,40,85,0,0,0,0,0,0,0,0,0,0,216,85,0,0,0,0,0,0,0,0,0,0,136,86,0,0,0,0,0,0,0,0,0,0,56,87,0,0,0,0,0,0,0,0,0,0,232,87,0,0,0,0,0,0,0,0,0,0,152,88,0,0,0,0,0,0,72,0,0,0,5,0,0,0,72,78,0,0,248,78,0,0,168,79,0,0,88,80,0,0,8,81,0,0,184,81,0,0,104,82,0,0,24,83,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,78,0,0,0,0,0,0,0,0,0,0,248,78,0,0,0,0,0,0,0,0,0,0,168,79,0,0,0,0,0,0,0,0,0,0,88,80,0,0,0,0,0,0,0,0,0,0,8,81,0,0,0,0,0,0,0,0,0,0,184,81,0,0,0,0,0,0,0,0,0,0,104,82,0,0,0,0,0,0,0,0,0,0,24,83,0,0,0,0,0,0,80,0,0,0,5,0,0,0,200,72,0,0,120,73,0,0,40,74,0,0,216,74,0,0,136,75,0,0,56,76,0,0,232,76,0,0,152,77,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,72,0,0,0,0,0,0,0,0,0,0,120,73,0,0,0,0,0,0,0,0,0,0,40,74,0,0,0,0,0,0,0,0,0,0,216,74,0,0,0,0,0,0,0,0,0,0,136,75,0,0,0,0,0,0,0,0,0,0,56,76,0,0,0,0,0,0,0,0,0,0,232,76,0,0,0,0,0,0,0,0,0,0,152,77,0,0,0,0,0,0,88,0,0,0,5,0,0,0,104,71,0,0,24,72,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,71,0,0,0,0,0,0,0,0,0,0,104,71,0,0,0,0,0,0,0,0,0,0,24,72,0,0,0,0,0,0,0,0,0,0,24,72,0,0,0,0,0,0,0,0,0,0,104,71,0,0,0,0,0,0,0,0,0,0,104,71,0,0,0,0,0,0,0,0,0,0,24,72,0,0,0,0,0,0,0,0,0,0,24,72,0,0,0,0,0,0,96,0,0,0,4,0,0,0,168,68,0,0,88,69,0,0,8,70,0,0,184,70,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,68,0,0,0,0,0,0,0,0,0,0,88,69,0,0,0,0,0,0,0,0,0,0,8,70,0,0,0,0,0,0,0,0,0,0,184,70,0,0,0,0,0,0,255,255,255,255,168,68,0,0,0,0,0,0,255,255,255,255,88,69,0,0,1,0,0,0,0,0,0,0,8,70,0,0,255,255,255,255,0,0,0,0,184,70,0,0,0,0,0,0,104,0,0,0,4,0,0,0,248,67,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,67,0,0,255,255,255,255,0,0,0,0,248,67,0,0,255,255,255,255,0,0,0,0,248,67,0,0,0,0,0,0,0,0,0,0,248,67,0,0,255,255,255,255,255,255,255,255,248,67,0,0,0,0,0,0,255,255,255,255,248,67,0,0,0,0,0,0,255,255,255,255,248,67,0,0,255,255,255,255,255,255,255,255,248,67,0,0,0,0,0,0,112,0,0,0,4,0,0,0,56,65,0,0,232,65,0,0,152,66,0,0,72,67,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,65,0,0,0,0,0,0,0,0,0,0,232,65,0,0,0,0,0,0,0,0,0,0,152,66,0,0,0,0,0,0,0,0,0,0,152,66,0,0,0,0,0,0,0,0,0,0,232,65,0,0,0,0,0,0,0,0,0,0,56,65,0,0,0,0,0,0,0,0,0,0,72,67,0,0,0,0,0,0,0,0,0,0,72,67,0,0,0,0,0,0,120,0,0,0,4,0,0,0,184,59,0,0,104,60,0,0,24,61,0,0,200,61,0,0,120,62,0,0,40,63,0,0,216,63,0,0,136,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,59,0,0,0,0,0,0,0,0,0,0,104,60,0,0,0,0,0,0,0,0,0,0,24,61,0,0,0,0,0,0,0,0,0,0,200,61,0,0,0,0,0,0,0,0,0,0,120,62,0,0,0,0,0,0,0,0,0,0,40,63,0,0,0,0,0,0,0,0,0,0,216,63,0,0,0,0,0,0,0,0,0,0,136,64,0,0,0,0,0,0,128,0,0,0,4,0,0,0,88,58,0,0,8,59,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,58,0,0,0,0,0,0,0,0,0,0,88,58,0,0,0,0,0,0,0,0,0,0,8,59,0,0,1,0,0,0,0,0,0,0,8,59,0,0,0,0,0,0,255,255,255,255,88,58,0,0,0,0,0,0,255,255,255,255,88,58,0,0,1,0,0,0,0,0,0,0,8,59,0,0,0,0,0,0,0,0,0,0,8,59,0,0,0,0,0,0,136,0,0,0,3,0,0,0,152,55,0,0,72,56,0,0,248,56,0,0,168,57,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,55,0,0,0,0,0,0,0,0,0,0,72,56,0,0,0,0,0,0,0,0,0,0,248,56,0,0,0,0,0,0,0,0,0,0,168,57,0,0,0,0,0,0,0,0,0,0,168,57,0,0,0,0,0,0,0,0,0,0,248,56,0,0,0,0,0,0,0,0,0,0,72,56,0,0,0,0,0,0,0,0,0,0,152,55,0,0,0,0,0,0,144,0,0,0,3,0,0,0,56,54,0,0,232,54,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,54,0,0,0,0,0,0,0,0,0,0,56,54,0,0,0,0,0,0,0,0,0,0,232,54,0,0,0,0,0,0,0,0,0,0,232,54,0,0,0,0,0,0,0,0,0,0,56,54,0,0,0,0,0,0,0,0,0,0,56,54,0,0,0,0,0,0,0,0,0,0,232,54,0,0,0,0,0,0,0,0,0,0,232,54,0,0,0,0,0,0,152,0,0,0,2,0,0,0,216,52,0,0,136,53,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,52,0,0,0,0,0,0,0,0,0,0,216,52,0,0,0,0,0,0,0,0,0,0,136,53,0,0,1,0,0,0,0,0,0,0,136,53,0,0,0,0,0,0,255,255,255,255,216,52,0,0,0,0,0,0,255,255,255,255,216,52,0,0,1,0,0,0,0,0,0,0,136,53,0,0,0,0,0,0,0,0,0,0,136,53,0,0,0,0,0,0,160,0,0,0,1,0,0,0,40,52,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,52,0,0,0,0,0,0,0,0,0,0,40,52,0,0,0,0,0,0,0,0,0,0,40,52,0,0,0,0,0,0,0,0,0,0,40,52,0,0,0,0,0,0,0,0,0,0,40,52,0,0,0,0,0,0,0,0,0,0,40,52,0,0,0,0,0,0,0,0,0,0,40,52,0,0,0,0,0,0,0,0,0,0,40,52,0,0,0,0,0,0,0,40,0,0,144,40,0,0,32,41,0,0,176,41,0,0,64,42,0,0,208,42,0,0,96,43,0,0,240,43,0,0,128,44,0,0,16,45,0,0,160,45,0,0,48,46,0,0,192,46,0,0,80,47,0,0,224,47,0,0,112,48,0,0,0,49,0,0,144,49,0,0,32,50,0,0,176,50,0,0,64,51,0,0,0,0,0,0,160,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,154,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,144,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,146,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,0,0,0,0,136,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,137,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,138,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,139,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,128,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,2,0,0,0,130,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,254,255,255,255,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,1,0,0,0,0,0,0,0,120,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,1,0,0,0,121,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,122,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,123,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,124,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,125,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,1,0,0,0,126,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,127,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,112,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,113,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,1,0,0,0,114,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,118,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,104,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,96,0,0,0,4,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,97,0,0,0,4,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,98,0,0,0,4,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,1,0,0,0,99,0,0,0,4,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,88,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,254,255,255,255,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,2,0,0,0,90,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,254,255,255,255,0,0,0,0,1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,2,0,0,0,0,0,0,0,80,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,254,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,254,255,255,255,0,0,0,0,1,0,0,0,81,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,1,0,0,0,1,0,0,0,82,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,2,0,0,0,0,0,0,0,83,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,255,255,255,255,2,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,84,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,2,0,0,0,85,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,2,0,0,0,86,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,87,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,2,0,0,0,1,0,0,0,72,0,0,0,5,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,1,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,254,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,254,255,255,255,0,0,0,0,1,0,0,0,73,0,0,0,5,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,1,0,0,0,1,0,0,0,74,0,0,0,5,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,1,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+10240);
/* memory initializer */ allocate([255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,2,0,0,0,0,0,0,0,75,0,0,0,5,0,0,0,254,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,255,255,255,255,2,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,254,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,76,0,0,0,5,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,2,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,2,0,0,0,77,0,0,0,5,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,2,0,0,0,78,0,0,0,5,0,0,0,254,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,79,0,0,0,5,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,2,0,0,0,1,0,0,0,64,0,0,0,5,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,1,0,0,0,65,0,0,0,5,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,66,0,0,0,5,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,0,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,67,0,0,0,5,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,68,0,0,0,5,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,69,0,0,0,5,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,1,0,0,0,70,0,0,0,5,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,71,0,0,0,5,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,56,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,2,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,1,0,0,0,57,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,255,255,255,255,1,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,58,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,2,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,62,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,48,0,0,0,5,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,2,0,0,0,49,0,0,0,5,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,2,0,0,0,50,0,0,0,5,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,254,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,51,0,0,0,5,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,2,0,0,0,1,0,0,0,52,0,0,0,5,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,254,255,255,255,2,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,254,255,255,255,0,0,0,0,1,0,0,0,53,0,0,0,5,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,254,255,255,255,1,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,1,0,0,0,1,0,0,0,54,0,0,0,5,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,2,0,0,0,0,0,0,0,55,0,0,0,5,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,254,255,255,255,0,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,40,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,42,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,43,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,44,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,32,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,254,255,255,255,1,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,2,0,0,0,0,0,0,0,33,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,254,255,255,255,2,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,254,255,255,255,0,0,0,0,0,0,0,0,34,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,35,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,2,0,0,0,255,255,255,255,0,0,0,0,254,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,2,0,0,0,24,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,1,0,0,0,2,0,0,0,3,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,25,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,255,255,255,255,2,0,0,0,1,0,0,0,1,0,0,0,3,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,26,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,3,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,27,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,3,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,16,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,17,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,2,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,18,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,255,255,255,255,2,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,19,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,1,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,8,0,0,0,5,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,9,0,0,0,5,0,0,0,1,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,10,0,0,0,5,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,11,0,0,0,5,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,12,0,0,0,5,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,2,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,13,0,0,0,5,0,0,0,255,255,255,255,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,2,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,14,0,0,0,5,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,15,0,0,0,5,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,1,0,0,0,1], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+20484);
/* memory initializer */ allocate([64,119,0,0,7,0,0,0,8,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,3,0,0,0,3,0,0,0,4,0,0,0,78,83,116,51,95,95,49,49,49,95,95,115,116,100,111,117,116,98,117,102,73,119,69,69,0,0,0,0,0,0,0,0,0,165,0,0,32,119,0,0,112,125,0,0,0,0,0,0,0,0,0,0,168,119,0,0,9,0,0,0,10,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,5,0,0,0,2,0,0,0,2,0,0,0,6,0,0,0,7,0,0,0,5,0,0,0,4,0,0,0,6,0,0,0,78,83,116,51,95,95,49,49,48,95,95,115,116,100,105,110,98,117,102,73,119,69,69,0,0,165,0,0,144,119,0,0,112,125,0,0,0,0,0,0,117,110,115,117,112,112,111,114,116,101,100,32,108,111,99,97,108,101,32,102,111,114,32,115,116,97,110,100,97,114,100,32,105,110,112,117,116,0,0,0,0,0,0,0,64,120,0,0,11,0,0,0,12,0,0,0,3,0,0,0,5,0,0,0,2,0,0,0,2,0,0,0,8,0,0,0,9,0,0,0,6,0,0,0,10,0,0,0,11,0,0,0,7,0,0,0,7,0,0,0,8,0,0,0,78,83,116,51,95,95,49,49,49,95,95,115,116,100,111,117,116,98,117,102,73,99,69,69,0,0,0,0,0,0,0,0,0,165,0,0,32,120,0,0,48,125,0,0,0,0,0,0,0,0,0,0,168,120,0,0,13,0,0,0,14,0,0,0,4,0,0,0,5,0,0,0,2,0,0,0,2,0,0,0,12,0,0,0,9,0,0,0,6,0,0,0,13,0,0,0,14,0,0,0,9,0,0,0,8,0,0,0,10,0,0,0,78,83,116,51,95,95,49,49,48,95,95,115,116,100,105,110,98,117,102,73,99,69,69,0,0,165,0,0,144,120,0,0,48,125,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,95,95,115,104,97,114,101,100,95,99,111,117,110,116,69,0,0,0,0,0,0,0,0,216,164,0,0,184,120,0,0,0,0,0,0,32,121,0,0,15,0,0,0,16,0,0,0,15,0,0,0,0,0,0,0,0,0,0,0,136,121,0,0,17,0,0,0,18,0,0,0,16,0,0,0,0,0,0,0,83,116,49,49,108,111,103,105,99,95,101,114,114,111,114,0,0,165,0,0,16,121,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,121,0,0,15,0,0,0,19,0,0,0,15,0,0,0,0,0,0,0,83,116,49,50,108,101,110,103,116,104,95,101,114,114,111,114,0,0,0,0,0,0,0,0,0,165,0,0,72,121,0,0,32,121,0,0,0,0,0,0,83,116,49,51,114,117,110,116,105,109,101,95,101,114,114,111,114,0,0,0,0,0,0,0,0,165,0,0,112,121,0,0,0,0,0,0,0,0,0,0,58,32,0,0,0,0,0,0,0,0,0,0,208,121,0,0,20,0,0,0,21,0,0,0,16,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,50,115,121,115,116,101,109,95,101,114,114,111,114,69,0,0,0,165,0,0,184,121,0,0,136,121,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,101,114,114,111,114,95,99,97,116,101,103,111,114,121,69,0,0,0,0,0,0,0,0,216,164,0,0,224,121,0,0,78,83,116,51,95,95,49,49,50,95,95,100,111,95,109,101,115,115,97,103,101,69,0,0,0,165,0,0,8,122,0,0,0,122,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,98,97,115,105,99,95,115,116,114,105,110,103,0,0,0,0,0,0,0,0,48,125,0,0,22,0,0,0,23,0,0,0,5,0,0,0,5,0,0,0,2,0,0,0,2,0,0,0,12,0,0,0,9,0,0,0,6,0,0,0,10,0,0,0,11,0,0,0,7,0,0,0,8,0,0,0,10,0,0,0,0,0,0,0,112,125,0,0,24,0,0,0,25,0,0,0,6,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,5,0,0,0,2,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,3,0,0,0,4,0,0,0,6,0,0,0,8,0,0,0,0,0,0,0,168,125,0,0,26,0,0,0,27,0,0,0,248,255,255,255,248,255,255,255,168,125,0,0,28,0,0,0,29,0,0,0,8,0,0,0,0,0,0,0,240,125,0,0,30,0,0,0,31,0,0,0,248,255,255,255,248,255,255,255,240,125,0,0,32,0,0,0,33,0,0,0,4,0,0,0,0,0,0,0,56,126,0,0,34,0,0,0,35,0,0,0,252,255,255,255,252,255,255,255,56,126,0,0,36,0,0,0,37,0,0,0,4,0,0,0,0,0,0,0,128,126,0,0,38,0,0,0,39,0,0,0,252,255,255,255,252,255,255,255,128,126,0,0,40,0,0,0,41,0,0,0,105,111,115,116,114,101,97,109,0,0,0,0,0,0,0,0,117,110,115,112,101,99,105,102,105,101,100,32,105,111,115,116,114,101,97,109,95,99,97,116,101,103,111,114,121,32,101,114,114,111,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,124,0,0,42,0,0,0,43,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,112,124,0,0,44,0,0,0,45,0,0,0,105,111,115,95,98,97,115,101,58,58,99,108,101,97,114,0,78,83,116,51,95,95,49,56,105,111,115,95,98,97,115,101,55,102,97,105,108,117,114,101,69,0,0,0,0,0,0,0,0,165,0,0,40,124,0,0,208,121,0,0,0,0,0,0,78,83,116,51,95,95,49,56,105,111,115,95,98,97,115,101,69,0,0,0,0,0,0,0,216,164,0,0,88,124,0,0,78,83,116,51,95,95,49,57,98,97,115,105,99,95,105,111,115,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,0,0,0,0,0,0,165,0,0,120,124,0,0,112,124,0,0,0,0,0,0,78,83,116,51,95,95,49,57,98,97,115,105,99,95,105,111,115,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,0,0,0,0,0,0,165,0,0,184,124,0,0,112,124,0,0,0,0,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,101,97,109,98,117,102,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,0,0,0,0,0,0,216,164,0,0,248,124,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,101,97,109,98,117,102,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,0,0,0,0,0,0,216,164,0,0,56,125,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,105,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,96,165,0,0,120,125,0,0,0,0,0,0,1,0,0,0,168,124,0,0,3,244,255,255,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,105,115,116,114,101,97,109,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,96,165,0,0,192,125,0,0,0,0,0,0,1,0,0,0,232,124,0,0,3,244,255,255,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,111,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,96,165,0,0,8,126,0,0,0,0,0,0,1,0,0,0,168,124,0,0,3,244,255,255,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,111,115,116,114,101,97,109,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,96,165,0,0,80,126,0,0,0,0,0,0,1,0,0,0,232,124,0,0,3,244,255,255,0,0,0,0,224,126,0,0,46,0,0,0,47,0,0,0,17,0,0,0,1,0,0,0,9,0,0,0,10,0,0,0,2,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,57,95,95,105,111,115,116,114,101,97,109,95,99,97,116,101,103,111,114,121,69,0,0,0,0,165,0,0,192,126,0,0,32,122,0,0,0,0,0,0,0,0,0,0,8,141,0,0,48,0,0,0,49,0,0,0,50,0,0,0,1,0,0,0,3,0,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,141,0,0,51,0,0,0,52,0,0,0,50,0,0,0,2,0,0,0,4,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,145,0,0,53,0,0,0,54,0,0,0,50,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,5,0,0,0,6,0,0,0,7,0,0,0,8,0,0,0,9,0,0,0,10,0,0,0,11,0,0,0,0,0,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,97,98,99,100,101,102,65,66,67,68,69,70,120,88,43,45,112,80,105,73,110,78,0,0,0,0,0,0,0,0,37,112,0,0,0,0,0,0,0,0,0,0,120,146,0,0,55,0,0,0,56,0,0,0,50,0,0,0,12,0,0,0,13,0,0,0,14,0,0,0,15,0,0,0,16,0,0,0,17,0,0,0,18,0,0,0,19,0,0,0,20,0,0,0,21,0,0,0,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,147,0,0,57,0,0,0,58,0,0,0,50,0,0,0,3,0,0,0,4,0,0,0,23,0,0,0,5,0,0,0,24,0,0,0,1,0,0,0,2,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,147,0,0,59,0,0,0,60,0,0,0,50,0,0,0,7,0,0,0,8,0,0,0,25,0,0,0,9,0,0,0,26,0,0,0,3,0,0,0,4,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,0,0,0,0,0,0,0,37,112,0,0,0,0,0,0,0,0,0,0,248,142,0,0,61,0,0,0,62,0,0,0,50,0,0,0,18,0,0,0,27,0,0,0,28,0,0,0,29,0,0,0,30,0,0,0,31,0,0,0,1,0,0,0,248,255,255,255,248,142,0,0,19,0,0,0,20,0,0,0,21,0,0,0,22,0,0,0,23,0,0,0,24,0,0,0,25,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,72,58,37,77,58,37,83,37,109,47,37,100,47,37,121,37,89,45,37,109,45,37,100,37,73,58,37,77,58,37,83,32,37,112,0,0,0,0,0,37,72,58,37,77,0,0,0,37,72,58,37,77,58,37,83,0,0,0,0,152,143,0,0,63,0,0,0,64,0,0,0,50,0,0,0,26,0,0,0,32,0,0,0,33,0,0,0,34,0,0,0,35,0,0,0,36,0,0,0,2,0,0,0,248,255,255,255,152,143,0,0,27,0,0,0,28,0,0,0,29,0,0,0,30,0,0,0,31,0,0,0,32,0,0,0,33,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,37,0,0,0,109,0,0,0,47,0,0,0,37,0,0,0,100,0,0,0,47,0,0,0,37,0,0,0,121,0,0,0,37,0,0,0,89,0,0,0,45,0,0,0,37,0,0,0,109,0,0,0,45,0,0,0,37,0,0,0,100,0,0,0,37,0,0,0,73,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,112,0,0,0,0,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,0,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,0,0,0,0,40,144,0,0,65,0,0,0,66,0,0,0,50,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,144,144,0,0,67,0,0,0,68,0,0,0,50,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,141,0,0,69,0,0,0,70,0,0,0,50,0,0,0,34,0,0,0,35,0,0,0,7,0,0,0,8,0,0,0,9,0,0,0,10,0,0,0,36,0,0,0,11,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,141,0,0,71,0,0,0,72,0,0,0,50,0,0,0,37,0,0,0,38,0,0,0,13,0,0,0,14,0,0,0,15,0,0,0,16,0,0,0,39,0,0,0,17,0,0,0,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,142,0,0,73,0,0,0,74,0,0,0,50,0,0,0,40,0,0,0,41,0,0,0,19,0,0,0,20,0,0,0,21,0,0,0,22,0,0,0,42,0,0,0,23,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,142,0,0,75,0,0,0,76,0,0,0,50,0,0,0,43,0,0,0,44,0,0,0,25,0,0,0,26,0,0,0,27,0,0,0,28,0,0,0,45,0,0,0,29,0,0,0,30,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,148,0,0,77,0,0,0,78,0,0,0,50,0,0,0,3,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,0,0,0,0,0,0,37,76,102,0,0,0,0,0,109,111,110,101,121,95,103,101,116,32,101,114,114,111,114,0,0,0,0,0,240,148,0,0,79,0,0,0,80,0,0,0,50,0,0,0,5,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,0,0,0,0,0,0,0,0,0,0,128,149,0,0,81,0,0,0,82,0,0,0,50,0,0,0,1,0,0,0,37,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,46,48,76,102,0,0,0,0,0,0,0,16,150,0,0,83,0,0,0,84,0,0,0,50,0,0,0,2,0,0,0,38,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,144,0,0,85,0,0,0,86,0,0,0,50,0,0,0,13,0,0,0,11,0,0,0,31,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,145,0,0,87,0,0,0,88,0,0,0,50,0,0,0,14,0,0,0,12,0,0,0,32,0,0,0,0,0,0,0,0,0,0,0,118,101,99,116,111,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,67,0,0,0,0,0,0,0,0,0,0,0,224,140,0,0,89,0,0,0,90,0,0,0,50,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,137,0,0,91,0,0,0,92,0,0,0,50,0,0,0,11,0,0,0,15,0,0,0,12,0,0,0,16,0,0,0,13,0,0,0,1,0,0,0,17,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,138,0,0,93,0,0,0,94,0,0,0,50,0,0,0,1,0,0,0,2,0,0,0,4,0,0,0,46,0,0,0,47,0,0,0,5,0,0,0,48,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,144,140,0,0,95,0,0,0,96,0,0,0,50,0,0,0,49,0,0,0,50,0,0,0,33,0,0,0,34,0,0,0,35,0,0,0,0,0,0,0,184,140,0,0,97,0,0,0,98,0,0,0,50,0,0,0,51,0,0,0,52,0,0,0,36,0,0,0,37,0,0,0,38,0,0,0,116,114,117,101,0,0,0,0,116,0,0,0,114,0,0,0,117,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,102,97,108,115,101,0,0,0,102,0,0,0,97,0,0,0,108,0,0,0,115,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,109,47,37,100,47,37,121,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,0,0,0,109,0,0,0,47,0,0,0,37,0,0,0,100,0,0,0,47,0,0,0,37,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,72,58,37,77,58,37,83,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,97,32,37,98,32,37,100,32,37,72,58,37,77,58,37,83,32,37,89,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,0,0,0,97,0,0,0,32,0,0,0,37,0,0,0,98,0,0,0,32,0,0,0,37,0,0,0,100,0,0,0,32,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,89,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,73,58,37,77,58,37,83,32,37,112,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,0,0,0,73,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,112,0,0,0,0,0,0,0,108,111,99,97,108,101,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,0,0,0,0,0,0,0,240,136,0,0,99,0,0,0,100,0,0,0,50,0,0,0,0,0,0,0,78,83,116,51,95,95,49,54,108,111,99,97,108,101,53,102,97,99,101,116,69,0,0,0,0,165,0,0,216,136,0,0,216,120,0,0,0,0,0,0,0,0,0,0,128,137,0,0,99,0,0,0,101,0,0,0,50,0,0,0,18,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,14,0,0,0,19,0,0,0,15,0,0,0,20,0,0,0,16,0,0,0,5,0,0,0,21,0,0,0,6,0,0,0,0,0,0,0,78,83,116,51,95,95,49,53,99,116,121,112,101,73,119,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,48,99,116,121,112,101,95,98,97,115,101,69,0,0,0,0,216,164,0,0,96,137,0,0,96,165,0,0,72,137,0,0,0,0,0,0,2,0,0,0,240,136,0,0,2,0,0,0,120,137,0,0,2,0,0,0,78,83,116,51,95,95,49,53,99,116,121,112,101,73,99,69,69,0,0,0,0,0,0,0,96,165,0,0,160,137,0,0,0,0,0,0,2,0,0,0,240,136,0,0,2,0,0,0,120,137,0,0,2,0,0,0,0,0,0,0,80,138,0,0,99,0,0,0,102,0,0,0,50,0,0,0,3,0,0,0,4,0,0,0,7,0,0,0,53,0,0,0,54,0,0,0,8,0,0,0,55,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,99,99,49,49,95,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,50,99,111,100,101,99,118,116,95,98,97,115,101,69,0,0,216,164,0,0,48,138,0,0,96,165,0,0,8,138,0,0,0,0,0,0,2,0,0,0,240,136,0,0,2,0,0,0,72,138,0,0,2,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,119,99,49,49,95,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,96,165,0,0,112,138,0,0,0,0,0,0,2,0,0,0,240,136,0,0,2,0,0,0,72,138,0,0,2,0,0,0,0,0,0,0,16,139,0,0,99,0,0,0,103,0,0,0,50,0,0,0,5,0,0,0,6,0,0,0,9,0,0,0,56,0,0,0,57,0,0,0,10,0,0,0,58,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,68,115,99,49,49,95,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,96,165,0,0,232,138,0,0,0,0,0,0,2,0,0,0,240,136,0,0,2,0,0,0,72,138,0,0,2,0,0,0,0,0,0,0,136,139,0,0,99,0,0,0,104,0,0,0,50,0,0,0,7,0,0,0,8,0,0,0,11,0,0,0,59,0,0,0,60,0,0,0,12,0,0,0,61,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,68,105,99,49,49,95,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,96,165,0,0,96,139,0,0,0,0,0,0,2,0,0,0,240,136,0,0,2,0,0,0,72,138,0,0,2,0,0,0,0,0,0,0,0,140,0,0,99,0,0,0,105,0,0,0,50,0,0,0,7,0,0,0,8,0,0,0,11,0,0,0,59,0,0,0,60,0,0,0,12,0,0,0,61,0,0,0,78,83,116,51,95,95,49,49,54,95,95,110,97,114,114,111,119,95,116,111,95,117,116,102,56,73,76,106,51,50,69,69,69,0,0,0,0,0,0,0,0,165,0,0,216,139,0,0,136,139,0,0,0,0,0,0,0,0,0,0,104,140,0,0,99,0,0,0,106,0,0,0,50,0,0,0,7,0,0,0,8,0,0,0,11,0,0,0,59,0,0,0,60,0,0,0,12,0,0,0,61,0,0,0,78,83,116,51,95,95,49,49,55,95,95,119,105,100,101,110,95,102,114,111,109,95,117,116,102,56,73,76,106,51,50,69,69,69,0,0,0,0,0,0,0,165,0,0,64,140,0,0,136,139,0,0,0,0,0,0,78,83,116,51,95,95,49,56,110,117,109,112,117,110,99,116,73,99,69,69,0,0,0,0,0,165,0,0,120,140,0,0,240,136,0,0,0,0,0,0,78,83,116,51,95,95,49,56,110,117,109,112,117,110,99,116,73,119,69,69,0,0,0,0,0,165,0,0,160,140,0,0,240,136,0,0,0,0,0,0,78,83,116,51,95,95,49,54,108,111,99,97,108,101,53,95,95,105,109,112,69,0,0,0,0,165,0,0,200,140,0,0,240,136,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,108,108,97,116,101,73,99,69,69,0,0,0,0,0,0,165,0,0,240,140,0,0,240,136,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,108,108,97,116,101,73,119,69,69,0,0,0,0,0,0,165,0,0,24,141,0,0,240,136,0,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,99,76,98,48,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,95,98,97,115,101,69,0,0,0,0,216,164,0,0,96,141,0,0,96,165,0,0,64,141,0,0,0,0,0,0,2,0,0,0,240,136,0,0,2,0,0,0,120,141,0,0,2,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,99,76,98,49,69,69,69,0,0,0,0,0,96,165,0,0,160,141,0,0,0,0,0,0,2,0,0,0,240,136,0,0,2,0,0,0,120,141,0,0,2,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,119,76,98,48,69,69,69,0,0,0,0,0,96,165,0,0,224,141,0,0,0,0,0,0,2,0,0,0,240,136,0,0,2,0,0,0,120,141,0,0,2,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,119,76,98,49,69,69,69,0,0,0,0,0,96,165,0,0,32,142,0,0,0,0,0,0,2,0,0,0,240,136,0,0,2,0,0,0,120,141,0,0,2,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,57,116,105,109,101,95,98,97,115,101,69,0,0,0,0,0,0,216,164,0,0,168,142,0,0,78,83,116,51,95,95,49,50,48,95,95,116,105,109,101,95,103,101,116,95,99,95,115,116,111,114,97,103,101,73,99,69,69,0,0,0,0,0,0,0,216,164,0,0,200,142,0,0,96,165,0,0,96,142,0,0,0,0,0,0,3,0,0,0,240,136,0,0,2,0,0,0,192,142,0,0,2,0,0,0,240,142,0,0,0,8,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,50,48,95,95,116,105,109,101,95,103,101,116,95,99,95,115,116,111,114,97,103,101,73,119,69,69,0,0,0,0,0,0,0,216,164,0,0,104,143,0,0,96,165,0,0,32,143,0,0,0,0,0,0,3,0,0,0,240,136,0,0,2,0,0,0,192,142,0,0,2,0,0,0,144,143,0,0,0,8,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,49,48,95,95,116,105,109,101,95,112,117,116,69,0,0,0,0,216,164,0,0,8,144,0,0,96,165,0,0,192,143,0,0,0,0,0,0,2,0,0,0,240,136,0,0,2,0,0,0,32,144,0,0,0,8,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,96,165,0,0,72,144,0,0,0,0,0,0,2,0,0,0,240,136,0,0,2,0,0,0,32,144,0,0,0,8,0,0,78,83,116,51,95,95,49,56,109,101,115,115,97,103,101,115,73,99,69,69,0,0,0,0,78,83,116,51,95,95,49,49,51,109,101,115,115,97,103,101,115,95,98,97,115,101,69,0,216,164,0,0,200,144,0,0,96,165,0,0,176,144,0,0,0,0,0,0,2,0,0,0,240,136,0,0,2,0,0,0,224,144,0,0,2,0,0,0,78,83,116,51,95,95,49,56,109,101,115,115,97,103,101,115,73,119,69,69,0,0,0,0,96,165,0,0,8,145,0,0,0,0,0,0,2,0,0,0,240,136,0,0,2,0,0,0,224,144,0,0,2,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,103,101,116,73,99,69,69,0,0,0,78,83,116,51,95,95,49,49,52,95,95,110,117,109,95,103,101,116,95,98,97,115,101,69,0,0,0,0,0,0,0,0,216,164,0,0,160,145,0,0,96,165,0,0,136,145,0,0,0,0,0,0,1,0,0,0,192,145,0,0,0,0,0,0,96,165,0,0,64,145,0,0,0,0,0,0,2,0,0,0,240,136,0,0,2,0,0,0,200,145,0,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,103,101,116,73,119,69,69,0,0,0,96,165,0,0,72,146,0,0,0,0,0,0,1,0,0,0,192,145,0,0,0,0,0,0,96,165,0,0,0,146,0,0,0,0,0,0,2,0,0,0,240,136,0,0,2,0,0,0,96,146,0,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,112,117,116,73,99,69,69,0,0,0,78,83,116,51,95,95,49,49,52,95,95,110,117,109,95,112,117,116,95,98,97,115,101,69,0,0,0,0,0,0,0,0,216,164,0,0,248,146,0,0,96,165,0,0,224,146,0,0,0,0,0,0,1,0,0,0,24,147,0,0,0,0,0,0,96,165,0,0,152,146,0,0,0,0,0,0,2,0,0,0,240,136,0,0,2,0,0,0,32,147,0,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,112,117,116,73,119,69,69,0,0,0,96,165,0,0,160,147,0,0,0,0,0,0,1,0,0,0,24,147,0,0,0,0,0,0,96,165,0,0,88,147,0,0,0,0,0,0,2,0,0,0,240,136,0,0,2,0,0,0,184,147,0,0,0,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,103,101,116,73,99,69,69,0,0,0,0,0,0,0,0,216,164,0,0,56,148,0,0,96,165,0,0,240,147,0,0,0,0,0,0,2,0,0,0,240,136,0,0,2,0,0,0,88,148,0,0,0,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,103,101,116,73,119,69,69,0,0,0,0,0,0,0,0,216,164,0,0,200,148,0,0,96,165,0,0,128,148,0,0,0,0,0,0,2,0,0,0,240,136,0,0,2,0,0,0,232,148,0,0,0,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,112,117,116,73,99,69,69,0,0,0,0,0,0,0,0,216,164,0,0,88,149,0,0,96,165,0,0,16,149,0,0,0,0,0,0,2,0,0,0,240,136,0,0,2,0,0,0,120,149,0,0,0,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,112,117,116,73,119,69,69,0,0,0,0,0,0,0,0,216,164,0,0,232,149,0,0,96,165,0,0,160,149,0,0,0,0,0,0,2,0,0,0,240,136,0,0,2,0,0,0,8,150,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,65,0,0,0,77,0,0,0,0,0,0,0,0,0,0,0,80,0,0,0,77,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,65,77,0,0,0,0,0,0,80,77,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,74,0,0,0,97,0,0,0,110,0,0,0,117,0,0,0,97,0,0,0,114,0,0,0,121,0,0,0,0,0,0,0,70,0,0,0,101,0,0,0,98,0,0,0,114,0,0,0,117,0,0,0,97,0,0,0,114,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,77,0,0,0,97,0,0,0,114,0,0,0,99,0,0,0,104,0,0,0,0,0,0,0,65,0,0,0,112,0,0,0,114,0,0,0,105,0,0,0,108,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,110,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,108,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,65,0,0,0,117,0,0,0,103,0,0,0,117,0,0,0,115,0,0,0,116,0,0,0,0,0,0,0,0,0,0,0,83,0,0,0,101,0,0,0,112,0,0,0,116,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,79,0,0,0,99,0,0,0,116,0,0,0,111,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,78,0,0,0,111,0,0,0,118,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,68,0,0,0,101,0,0,0,99,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,74,0,0,0,97,0,0,0,110,0,0,0,0,0,0,0,70,0,0,0,101,0,0,0,98,0,0,0,0,0,0,0,77,0,0,0,97,0,0,0,114,0,0,0,0,0,0,0,65,0,0,0,112,0,0,0,114,0,0,0,0,0,0,0,77,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,110,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,108,0,0,0,0,0,0,0,65,0,0,0,117,0,0,0,103,0,0,0,0,0,0,0,83,0,0,0,101,0,0,0,112,0,0,0,0,0,0,0,79,0,0,0,99,0,0,0,116,0,0,0,0,0,0,0,78,0,0,0,111,0,0,0,118,0,0,0,0,0,0,0,68,0,0,0,101,0,0,0,99], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+30428);
/* memory initializer */ allocate([74,97,110,117,97,114,121,0,70,101,98,114,117,97,114,121,0,0,0,0,0,0,0,0,77,97,114,99,104,0,0,0,65,112,114,105,108,0,0,0,77,97,121,0,0,0,0,0,74,117,110,101,0,0,0,0,74,117,108,121,0,0,0,0,65,117,103,117,115,116,0,0,83,101,112,116,101,109,98,101,114,0,0,0,0,0,0,0,79,99,116,111,98,101,114,0,78,111,118,101,109,98,101,114,0,0,0,0,0,0,0,0,68,101,99,101,109,98,101,114,0,0,0,0,0,0,0,0,74,97,110,0,0,0,0,0,70,101,98,0,0,0,0,0,77,97,114,0,0,0,0,0,65,112,114,0,0,0,0,0,74,117,110,0,0,0,0,0,74,117,108,0,0,0,0,0,65,117,103,0,0,0,0,0,83,101,112,0,0,0,0,0,79,99,116,0,0,0,0,0,78,111,118,0,0,0,0,0,68,101,99,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,83,0,0,0,117,0,0,0,110,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,77,0,0,0,111,0,0,0,110,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,84,0,0,0,117,0,0,0,101,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,87,0,0,0,101,0,0,0,100,0,0,0,110,0,0,0,101,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,84,0,0,0,104,0,0,0,117,0,0,0,114,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,70,0,0,0,114,0,0,0,105,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,83,0,0,0,97,0,0,0,116,0,0,0,117,0,0,0,114,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,83,0,0,0,117,0,0,0,110,0,0,0,0,0,0,0,77,0,0,0,111,0,0,0,110,0,0,0,0,0,0,0,84,0,0,0,117,0,0,0,101,0,0,0,0,0,0,0,87,0,0,0,101,0,0,0,100,0,0,0,0,0,0,0,84,0,0,0,104,0,0,0,117,0,0,0,0,0,0,0,70,0,0,0,114,0,0,0,105,0,0,0,0,0,0,0,83,0,0,0,97,0,0,0,116,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,83,117,110,100,97,121,0,0,77,111,110,100,97,121,0,0,84,117,101,115,100,97,121,0,87,101,100,110,101,115,100,97,121,0,0,0,0,0,0,0,84,104,117,114,115,100,97,121,0,0,0,0,0,0,0,0,70,114,105,100,97,121,0,0,83,97,116,117,114,100,97,121,0,0,0,0,0,0,0,0,83,117,110,0,0,0,0,0,77,111,110,0,0,0,0,0,84,117,101,0,0,0,0,0,87,101,100,0,0,0,0,0,84,104,117,0,0,0,0,0,70,114,105,0,0,0,0,0,83,97,116,0,0,0,0,0,2,0,0,192,3,0,0,192,4,0,0,192,5,0,0,192,6,0,0,192,7,0,0,192,8,0,0,192,9,0,0,192,10,0,0,192,11,0,0,192,12,0,0,192,13,0,0,192,14,0,0,192,15,0,0,192,16,0,0,192,17,0,0,192,18,0,0,192,19,0,0,192,20,0,0,192,21,0,0,192,22,0,0,192,23,0,0,192,24,0,0,192,25,0,0,192,26,0,0,192,27,0,0,192,28,0,0,192,29,0,0,192,30,0,0,192,31,0,0,192,0,0,0,179,1,0,0,195,2,0,0,195,3,0,0,195,4,0,0,195,5,0,0,195,6,0,0,195,7,0,0,195,8,0,0,195,9,0,0,195,10,0,0,195,11,0,0,195,12,0,0,195,13,0,0,211,14,0,0,195,15,0,0,195,0,0,12,187,1,0,12,195,2,0,12,195,3,0,12,195,4,0,12,211,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,164,0,0,107,0,0,0,108,0,0,0,62,0,0,0,0,0,0,0,115,116,100,58,58,98,97,100,95,99,97,115,116,0,0,0,83,116,57,116,121,112,101,95,105,110,102,111,0,0,0,0,216,164,0,0,40,164,0,0,83,116,56,98,97,100,95,99,97,115,116,0,0,0,0,0,0,165,0,0,64,164,0,0,0,0,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,54,95,95,115,104,105,109,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,0,0,165,0,0,96,164,0,0,56,164,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,0,165,0,0,152,164,0,0,136,164,0,0,0,0,0,0,0,0,0,0,192,164,0,0,109,0,0,0,110,0,0,0,111,0,0,0,112,0,0,0,22,0,0,0,13,0,0,0,1,0,0,0,5,0,0,0,0,0,0,0,72,165,0,0,109,0,0,0,113,0,0,0,111,0,0,0,112,0,0,0,22,0,0,0,14,0,0,0,2,0,0,0,6,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,48,95,95,115,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,165,0,0,32,165,0,0,192,164,0,0,0,0,0,0,0,0,0,0,168,165,0,0,109,0,0,0,114,0,0,0,111,0,0,0,112,0,0,0,22,0,0,0,15,0,0,0,3,0,0,0,7,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,49,95,95,118,109,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,165,0,0,128,165,0,0,192,164,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,167,0,0,115,0,0,0,116,0,0,0,63,0,0,0,0,0,0,0,115,116,100,58,58,98,97,100,95,97,108,108,111,99,0,0,83,116,57,98,97,100,95,97,108,108,111,99,0,0,0,0,0,165,0,0,216,167,0,0,0,0,0,0,0,0,0,0,105,110,102,105,110,105,116,121,0,0,0,0,0,0,0,0,110,97,110,0,0,0,0,0,95,112,137,0,255,9,47,15,10,0,0,0,100,0,0,0,232,3,0,0,16,39,0,0,160,134,1,0,64,66,15,0,128,150,152,0,0,225,245,5], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+40688);




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


  
  function _atexit(func, arg) {
      __ATEXIT__.unshift({ func: func, arg: arg });
    }var ___cxa_atexit=_atexit;

  
   
  Module["_rand_r"] = _rand_r;
  
  var ___rand_seed=allocate([0x0273459b, 0, 0, 0], "i32", ALLOC_STATIC); 
  Module["_rand"] = _rand;

   
  Module["_i64Subtract"] = _i64Subtract;

   
  Module["_i64Add"] = _i64Add;

  
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
  
  
  
  var ___cxa_last_thrown_exception=0;function ___resumeException(ptr) {
      if (!___cxa_last_thrown_exception) { ___cxa_last_thrown_exception = ptr; }
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";
    }
  
  var ___cxa_exception_header_size=8;function ___cxa_find_matching_catch(thrown, throwntype) {
      if (thrown == -1) thrown = ___cxa_last_thrown_exception;
      header = thrown - ___cxa_exception_header_size;
      if (throwntype == -1) throwntype = HEAP32[((header)>>2)];
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
      var header = ptr - ___cxa_exception_header_size;
      HEAP32[((header)>>2)]=type;
      HEAP32[(((header)+(4))>>2)]=destructor;
      ___cxa_last_thrown_exception = ptr;
      if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
        __ZSt18uncaught_exceptionv.uncaught_exception = 1;
      } else {
        __ZSt18uncaught_exceptionv.uncaught_exception++;
      }
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";
    }

  function _pthread_mutex_lock() {}

  
  
  
  
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};
  
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  
  
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value;
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
        return MEMFS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
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
          var node = MEMFS.createNode(parent, newname, 511 /* 0777 */ | 40960, 0);
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
      },DB_VERSION:21,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
        // reuse all of the core MEMFS functionality
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
      },getDB:function (name, callback) {
        // check the cache first
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
  
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return callback(e);
        }
        req.onupgradeneeded = function(e) {
          var db = e.target.result;
          var transaction = e.target.transaction;
  
          var fileStore;
  
          if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
            fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
          } else {
            fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
          }
  
          fileStore.createIndex('timestamp', 'timestamp', { unique: false });
        };
        req.onsuccess = function() {
          db = req.result;
  
          // add to the cache
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function() {
          callback(this.error);
        };
      },getLocalSet:function (mount, callback) {
        var entries = {};
  
        function isRealDir(p) {
          return p !== '.' && p !== '..';
        };
        function toAbsolute(root) {
          return function(p) {
            return PATH.join2(root, p);
          }
        };
  
        var check = FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));
  
        while (check.length) {
          var path = check.pop();
          var stat;
  
          try {
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
  
          if (FS.isDir(stat.mode)) {
            check.push.apply(check, FS.readdir(path).filter(isRealDir).map(toAbsolute(path)));
          }
  
          entries[path] = { timestamp: stat.mtime };
        }
  
        return callback(null, { type: 'local', entries: entries });
      },getRemoteSet:function (mount, callback) {
        var entries = {};
  
        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);
  
          var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
          transaction.onerror = function() { callback(this.error); };
  
          var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
          var index = store.index('timestamp');
  
          index.openKeyCursor().onsuccess = function(event) {
            var cursor = event.target.result;
  
            if (!cursor) {
              return callback(null, { type: 'remote', db: db, entries: entries });
            }
  
            entries[cursor.primaryKey] = { timestamp: cursor.key };
  
            cursor.continue();
          };
        });
      },loadLocalEntry:function (path, callback) {
        var stat, node;
  
        try {
          var lookup = FS.lookupPath(path);
          node = lookup.node;
          stat = FS.stat(path);
        } catch (e) {
          return callback(e);
        }
  
        if (FS.isDir(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode });
        } else if (FS.isFile(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode, contents: node.contents });
        } else {
          return callback(new Error('node type not supported'));
        }
      },storeLocalEntry:function (path, entry, callback) {
        try {
          if (FS.isDir(entry.mode)) {
            FS.mkdir(path, entry.mode);
          } else if (FS.isFile(entry.mode)) {
            FS.writeFile(path, entry.contents, { encoding: 'binary', canOwn: true });
          } else {
            return callback(new Error('node type not supported'));
          }
  
          FS.utime(path, entry.timestamp, entry.timestamp);
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },removeLocalEntry:function (path, callback) {
        try {
          var lookup = FS.lookupPath(path);
          var stat = FS.stat(path);
  
          if (FS.isDir(stat.mode)) {
            FS.rmdir(path);
          } else if (FS.isFile(stat.mode)) {
            FS.unlink(path);
          }
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },loadRemoteEntry:function (store, path, callback) {
        var req = store.get(path);
        req.onsuccess = function(event) { callback(null, event.target.result); };
        req.onerror = function() { callback(this.error); };
      },storeRemoteEntry:function (store, path, entry, callback) {
        var req = store.put(entry, path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },removeRemoteEntry:function (store, path, callback) {
        var req = store.delete(path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },reconcile:function (src, dst, callback) {
        var total = 0;
  
        var create = [];
        Object.keys(src.entries).forEach(function (key) {
          var e = src.entries[key];
          var e2 = dst.entries[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create.push(key);
            total++;
          }
        });
  
        var remove = [];
        Object.keys(dst.entries).forEach(function (key) {
          var e = dst.entries[key];
          var e2 = src.entries[key];
          if (!e2) {
            remove.push(key);
            total++;
          }
        });
  
        if (!total) {
          return callback(null);
        }
  
        var errored = false;
        var completed = 0;
        var db = src.type === 'remote' ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= total) {
            return callback(null);
          }
        };
  
        transaction.onerror = function() { done(this.error); };
  
        // sort paths in ascending order so directory entries are created
        // before the files inside them
        create.sort().forEach(function (path) {
          if (dst.type === 'local') {
            IDBFS.loadRemoteEntry(store, path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeLocalEntry(path, entry, done);
            });
          } else {
            IDBFS.loadLocalEntry(path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeRemoteEntry(store, path, entry, done);
            });
          }
        });
  
        // sort paths in descending order so files are deleted before their
        // parent directories
        remove.sort().reverse().forEach(function(path) {
          if (dst.type === 'local') {
            IDBFS.removeLocalEntry(path, done);
          } else {
            IDBFS.removeRemoteEntry(store, path, done);
          }
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
    }var FS={root:null,mounts:[],devices:[null],streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:null,genericErrors:{},handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
        return ___setErrNo(e.errno);
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.cwd(), path);
        opts = opts || {};
  
        var defaults = {
          follow_mount: true,
          recurse_count: 0
        };
        for (var key in defaults) {
          if (opts[key] === undefined) {
            opts[key] = defaults[key];
          }
        }
  
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
            if (!islast || (islast && opts.follow_mount)) {
              current = current.mounted.root;
            }
          }
  
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
            if (!parent) {
              parent = this;  // root node sets parent to itself
            }
            this.parent = parent;
            this.mount = parent.mount;
            this.mounted = null;
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
          };
  
          FS.FSNode.prototype = {};
  
          // compatibility
          var readMode = 292 | 73;
          var writeMode = 146;
  
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
  
        var node = new FS.FSNode(parent, name, mode, rdev);
  
        FS.hashAddNode(node);
  
        return node;
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return !!node.mounted;
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
        fd_start = fd_start || 0;
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
        // clone it, so we can return an instance of FSStream
        var newStream = new FS.FSStream();
        for (var p in stream) {
          newStream[p] = stream[p];
        }
        stream = newStream;
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },getStreamFromPtr:function (ptr) {
        return FS.streams[ptr - 1];
      },getPtrForStream:function (stream) {
        return stream ? stream.fd + 1 : 0;
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
      },getMounts:function (mount) {
        var mounts = [];
        var check = [mount];
  
        while (check.length) {
          var m = check.pop();
  
          mounts.push(m);
  
          check.push.apply(check, m.mounts);
        }
  
        return mounts;
      },syncfs:function (populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
  
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= mounts.length) {
            callback(null);
          }
        };
  
        // sync all mounts
        mounts.forEach(function (mount) {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      },mount:function (type, opts, mountpoint) {
        var root = mountpoint === '/';
        var pseudo = !mountpoint;
        var node;
  
        if (root && FS.root) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        } else if (!root && !pseudo) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
          mountpoint = lookup.path;  // use the absolute path
          node = lookup.node;
  
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
          }
  
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
          }
        }
  
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          mounts: []
        };
  
        // create a root node for the fs
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
  
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          // set as a mountpoint
          node.mounted = mount;
  
          // add the new mount to the current mount's children
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
  
        return mountRoot;
      },unmount:function (mountpoint) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
        if (!FS.isMountpoint(lookup.node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
  
        // destroy the nodes for this mount, and all its child mounts
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
  
        Object.keys(FS.nameTable).forEach(function (hash) {
          var current = FS.nameTable[hash];
  
          while (current) {
            var next = current.name_next;
  
            if (mounts.indexOf(current.mount) !== -1) {
              FS.destroyNode(current);
            }
  
            current = next;
          }
        });
  
        // no longer a mountpoint
        node.mounted = null;
  
        // remove this mount from the child mounts
        var idx = node.mount.mounts.indexOf(mount);
        assert(idx !== -1);
        node.mount.mounts.splice(idx, 1);
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
        mode = mode !== undefined ? mode : 438 /* 0666 */;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 511 /* 0777 */;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 438 /* 0666 */;
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
        var lookup = FS.lookupPath(path);
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
        mode = typeof mode === 'undefined' ? 438 /* 0666 */ : mode;
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
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
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
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
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
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0, opts.canOwn);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0, opts.canOwn);
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
        HEAP32[((_stdin)>>2)]=FS.getPtrForStream(stdin);
        assert(stdin.fd === 0, 'invalid handle for stdin (' + stdin.fd + ')');
  
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=FS.getPtrForStream(stdout);
        assert(stdout.fd === 1, 'invalid handle for stdout (' + stdout.fd + ')');
  
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=FS.getPtrForStream(stderr);
        assert(stderr.fd === 2, 'invalid handle for stderr (' + stderr.fd + ')');
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
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
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
  
  
  
  
  function _mkport() { throw 'TODO' }var SOCKFS={mount:function (mount) {
        return FS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
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
              // runtimeConfig gets set to true if WebSocket runtime configuration is available.
              var runtimeConfig = (Module['websocket'] && ('object' === typeof Module['websocket']));
  
              // The default value is 'ws://' the replace is needed because the compiler replaces "//" comments with '#'
              // comments without checking context, so we'd end up with ws:#, the replace swaps the "#" for "//" again.
              var url = 'ws:#'.replace('#', '//');
  
              if (runtimeConfig) {
                if ('string' === typeof Module['websocket']['url']) {
                  url = Module['websocket']['url']; // Fetch runtime WebSocket URL config.
                }
              }
  
              if (url === 'ws://' || url === 'wss://') { // Is the supplied URL config just a prefix, if so complete it.
                url = url + addr + ':' + port;
              }
  
              // Make the WebSocket subprotocol (Sec-WebSocket-Protocol) default to binary if no configuration is set.
              var subProtocols = 'binary'; // The default value is 'binary'
  
              if (runtimeConfig) {
                if ('string' === typeof Module['websocket']['subprotocol']) {
                  subProtocols = Module['websocket']['subprotocol']; // Fetch runtime WebSocket subprotocol config.
                }
              }
  
              // The regex trims the string (removes spaces at the beginning and end, then splits the string by
              // <any space>,<any space> into an Array. Whitespace removal is important for Websockify and ws.
              subProtocols = subProtocols.replace(/^ +| +$/g,"").split(/ *, */);
  
              // The node ws library API for specifying optional subprotocol is slightly different than the browser's.
              var opts = ENVIRONMENT_IS_NODE ? {'protocol': subProtocols.toString()} : subProtocols;
  
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
    }
  
  function _fileno(stream) {
      // int fileno(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fileno.html
      stream = FS.getStreamFromPtr(stream);
      if (!stream) return -1;
      return stream.fd;
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var fd = _fileno(stream);
      var bytesWritten = _write(fd, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        var streamObj = FS.getStreamFromPtr(stream);
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
          ret = (HEAP32[((tempDoublePtr)>>2)]=HEAP32[(((varargs)+(argIndex))>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[(((varargs)+((argIndex)+(4)))>>2)],(+(HEAPF64[(tempDoublePtr)>>3])));
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+4))>>2)]];
  
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Runtime.getNativeFieldSize(type);
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
          var precisionSet = false, precision = -1;
          if (next == 46) {
            precision = 0;
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
          }
          if (precision < 0) {
            precision = 6; // Standard default.
            precisionSet = false;
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
              HEAP32[((ptr)>>2)]=ret.length;
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


  
  
  
  function _isspace(chr) {
      return (chr == 32) || (chr >= 9 && chr <= 13);
    }
  function __parseInt64(str, endptr, base, min, max, unsign) {
      var isNegative = false;
      // Skip space.
      while (_isspace(HEAP8[(str)])) str++;
  
      // Check for a plus/minus sign.
      if (HEAP8[(str)] == 45) {
        str++;
        isNegative = true;
      } else if (HEAP8[(str)] == 43) {
        str++;
      }
  
      // Find base.
      var ok = false;
      var finalBase = base;
      if (!finalBase) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            finalBase = 16;
            str += 2;
          } else {
            finalBase = 8;
            ok = true; // we saw an initial zero, perhaps the entire thing is just "0"
          }
        }
      } else if (finalBase==16) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            str += 2;
          }
        }
      }
      if (!finalBase) finalBase = 10;
      var start = str;
  
      // Get digits.
      var chr;
      while ((chr = HEAP8[(str)]) != 0) {
        var digit = parseInt(String.fromCharCode(chr), finalBase);
        if (isNaN(digit)) {
          break;
        } else {
          str++;
          ok = true;
        }
      }
  
      if (!ok) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return ((asm["setTempRet0"](0),0)|0);
      }
  
      // Set end pointer.
      if (endptr) {
        HEAP32[((endptr)>>2)]=str;
      }
  
      try {
        var numberString = isNegative ? '-'+Pointer_stringify(start, str - start) : Pointer_stringify(start, str - start);
        i64Math.fromString(numberString, finalBase, min, max, unsign);
      } catch(e) {
        ___setErrNo(ERRNO_CODES.ERANGE); // not quite correct
      }
  
      return ((asm["setTempRet0"](((HEAP32[(((tempDoublePtr)+(4))>>2)])|0)),((HEAP32[((tempDoublePtr)>>2)])|0))|0);
    }function _strtoull(str, endptr, base) {
      return __parseInt64(str, endptr, base, 0, '18446744073709551615', true);  // ULONG_MAX.
    }function _strtoull_l(str, endptr, base) {
      return _strtoull(str, endptr, base); // no locale support yet
    }

  
  function _malloc(bytes) {
      /* Over-allocate to make sure it is byte-aligned by 8.
       * This will leak memory, but this is only the dummy
       * implementation (replaced by dlmalloc normally) so
       * not an issue.
       */
      var ptr = Runtime.dynamicAlloc(bytes + 8);
      return (ptr+8) & 0xFFFFFFF8;
    }
  Module["_malloc"] = _malloc;function _snprintf(s, n, format, varargs) {
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
    }


  
  function _strtoll(str, endptr, base) {
      return __parseInt64(str, endptr, base, '-9223372036854775808', '9223372036854775807');  // LLONG_MIN, LLONG_MAX.
    }function _strtoll_l(str, endptr, base) {
      return _strtoll(str, endptr, base); // no locale support yet
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

  function _pthread_cond_broadcast() {
      return 0;
    }

  var _ceil=Math_ceil;

  
  
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      Module['exit'](status);
    }function _exit(status) {
      __exit(status);
    }function __ZSt9terminatev() {
      _exit(-1234);
    }

  function _pthread_mutex_unlock() {}

  
  function _isxdigit(chr) {
      return (chr >= 48 && chr <= 57) ||
             (chr >= 97 && chr <= 102) ||
             (chr >= 65 && chr <= 70);
    }function _isxdigit_l(chr) {
      return _isxdigit(chr); // no locale support yet
    }

  
  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.set(HEAPU8.subarray(src, src+num), dest);
      return dest;
    } 
  Module["_memcpy"] = _memcpy;

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


  function _newlocale(mask, locale, base) {
      return _malloc(4);
    }

   
  Module["_memmove"] = _memmove;

  function ___errno_location() {
      return ___errno_state;
    }

  var _BItoD=true;

  function _catclose(catd) {
      // int catclose (nl_catd catd)
      return 0;
    }

  function _fmod(x, y) {
      return x % y;
    }

  function ___cxa_guard_release() {}

  function _ungetc(c, stream) {
      // int ungetc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/ungetc.html
      stream = FS.getStreamFromPtr(stream);
      if (!stream) {
        return -1;
      }
      if (c === -1) {
        // do nothing for EOF character
        return c;
      }
      c = unSign(c & 0xFF);
      stream.ungotten.push(c);
      stream.eof = false;
      return c;
    }

  function _uselocale(locale) {
      return 0;
    }

  function _vsnprintf(s, n, format, va_arg) {
      return _snprintf(s, n, format, HEAP32[((va_arg)>>2)]);
    }

  
  
  
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
                if (next === 0) return i > 0 ? fields : fields-1; // we failed to read the full length of this field
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
              HEAP32[((argPtr)>>2)]=parseInt(text, 16);
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
                HEAPF64[((argPtr)>>3)]=parseFloat(text);
              } else {
                HEAPF32[((argPtr)>>2)]=parseFloat(text);
              }
              break;
            case 's':
              var array = intArrayFromString(text);
              for (var j = 0; j < array.length; j++) {
                HEAP8[(((argPtr)+(j))|0)]=array[j];
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
    }function _vsscanf(s, format, va_arg) {
      return _sscanf(s, format, HEAP32[((va_arg)>>2)]);
    }


  function ___assert_fail(condition, filename, line, func) {
      ABORT = true;
      throw 'Assertion failed: ' + Pointer_stringify(condition) + ', at: ' + [filename ? Pointer_stringify(filename) : 'unknown filename', line, func ? Pointer_stringify(func) : 'unknown function'] + ' at ' + stackTrace();
    }

  
  
  
  function _recv(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _read(fd, buf, len);
    }
  
  function _pread(fildes, buf, nbyte, offset) {
      // ssize_t pread(int fildes, void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.read(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _read(fildes, buf, nbyte) {
      // ssize_t read(int fildes, void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
  
  
      try {
        var slab = HEAP8;
        return FS.read(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fread(ptr, size, nitems, stream) {
      // size_t fread(void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fread.html
      var bytesToRead = nitems * size;
      if (bytesToRead == 0) {
        return 0;
      }
      var bytesRead = 0;
      var streamObj = FS.getStreamFromPtr(stream);
      if (!streamObj) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return 0;
      }
      while (streamObj.ungotten.length && bytesToRead > 0) {
        HEAP8[((ptr++)|0)]=streamObj.ungotten.pop();
        bytesToRead--;
        bytesRead++;
      }
      var err = _read(streamObj.fd, ptr, bytesToRead);
      if (err == -1) {
        if (streamObj) streamObj.error = true;
        return 0;
      }
      bytesRead += err;
      if (bytesRead < bytesToRead) streamObj.eof = true;
      return Math.floor(bytesRead / size);
    }function _fgetc(stream) {
      // int fgetc(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fgetc.html
      var streamObj = FS.getStreamFromPtr(stream);
      if (!streamObj) return -1;
      if (streamObj.eof || streamObj.error) return -1;
      var ret = _fread(_fgetc.ret, 1, 1, stream);
      if (ret == 0) {
        return -1;
      } else if (ret == -1) {
        streamObj.error = true;
        return -1;
      } else {
        return HEAPU8[((_fgetc.ret)|0)];
      }
    }

   
  Module["_memset"] = _memset;

  
  function _strerror_r(errnum, strerrbuf, buflen) {
      if (errnum in ERRNO_MESSAGES) {
        if (ERRNO_MESSAGES[errnum].length > buflen - 1) {
          return ___setErrNo(ERRNO_CODES.ERANGE);
        } else {
          var msg = ERRNO_MESSAGES[errnum];
          writeAsciiToMemory(msg, strerrbuf);
          return 0;
        }
      } else {
        return ___setErrNo(ERRNO_CODES.EINVAL);
      }
    }function _strerror(errnum) {
      if (!_strerror.buffer) _strerror.buffer = _malloc(256);
      _strerror_r(errnum, _strerror.buffer, 256);
      return _strerror.buffer;
    }

  
  
  function __isLeapYear(year) {
        return year%4 === 0 && (year%100 !== 0 || year%400 === 0);
    }
  
  function __arraySum(array, index) {
      var sum = 0;
      for (var i = 0; i <= index; sum += array[i++]);
      return sum;
    }
  
  
  var __MONTH_DAYS_LEAP=[31,29,31,30,31,30,31,31,30,31,30,31];
  
  var __MONTH_DAYS_REGULAR=[31,28,31,30,31,30,31,31,30,31,30,31];function __addDays(date, days) {
      var newDate = new Date(date.getTime());
      while(days > 0) {
        var leap = __isLeapYear(newDate.getFullYear());
        var currentMonth = newDate.getMonth();
        var daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth];
  
        if (days > daysInCurrentMonth-newDate.getDate()) {
          // we spill over to next month
          days -= (daysInCurrentMonth-newDate.getDate()+1);
          newDate.setDate(1);
          if (currentMonth < 11) {
            newDate.setMonth(currentMonth+1)
          } else {
            newDate.setMonth(0);
            newDate.setFullYear(newDate.getFullYear()+1);
          }
        } else {
          // we stay in current month 
          newDate.setDate(newDate.getDate()+days);
          return newDate;
        }
      }
  
      return newDate;
    }function _strftime(s, maxsize, format, tm) {
      // size_t strftime(char *restrict s, size_t maxsize, const char *restrict format, const struct tm *restrict timeptr);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/strftime.html
      
      var date = {
        tm_sec: HEAP32[((tm)>>2)],
        tm_min: HEAP32[(((tm)+(4))>>2)],
        tm_hour: HEAP32[(((tm)+(8))>>2)],
        tm_mday: HEAP32[(((tm)+(12))>>2)],
        tm_mon: HEAP32[(((tm)+(16))>>2)],
        tm_year: HEAP32[(((tm)+(20))>>2)],
        tm_wday: HEAP32[(((tm)+(24))>>2)],
        tm_yday: HEAP32[(((tm)+(28))>>2)],
        tm_isdst: HEAP32[(((tm)+(32))>>2)]
      };
  
      var pattern = Pointer_stringify(format);
  
      // expand format
      var EXPANSION_RULES_1 = {
        '%c': '%a %b %d %H:%M:%S %Y',     // Replaced by the locale's appropriate date and time representation - e.g., Mon Aug  3 14:02:01 2013
        '%D': '%m/%d/%y',                 // Equivalent to %m / %d / %y
        '%F': '%Y-%m-%d',                 // Equivalent to %Y - %m - %d
        '%h': '%b',                       // Equivalent to %b
        '%r': '%I:%M:%S %p',              // Replaced by the time in a.m. and p.m. notation
        '%R': '%H:%M',                    // Replaced by the time in 24-hour notation
        '%T': '%H:%M:%S',                 // Replaced by the time
        '%x': '%m/%d/%y',                 // Replaced by the locale's appropriate date representation
        '%X': '%H:%M:%S',                 // Replaced by the locale's appropriate date representation
      };
      for (var rule in EXPANSION_RULES_1) {
        pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_1[rule]);
      }
  
      var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
      function leadingSomething(value, digits, character) {
        var str = typeof value === 'number' ? value.toString() : (value || '');
        while (str.length < digits) {
          str = character[0]+str;
        }
        return str;
      };
  
      function leadingNulls(value, digits) {
        return leadingSomething(value, digits, '0');
      };
  
      function compareByDay(date1, date2) {
        function sgn(value) {
          return value < 0 ? -1 : (value > 0 ? 1 : 0);
        };
  
        var compare;
        if ((compare = sgn(date1.getFullYear()-date2.getFullYear())) === 0) {
          if ((compare = sgn(date1.getMonth()-date2.getMonth())) === 0) {
            compare = sgn(date1.getDate()-date2.getDate());
          }
        }
        return compare;
      };
  
      function getFirstWeekStartDate(janFourth) {
          switch (janFourth.getDay()) {
            case 0: // Sunday
              return new Date(janFourth.getFullYear()-1, 11, 29);
            case 1: // Monday
              return janFourth;
            case 2: // Tuesday
              return new Date(janFourth.getFullYear(), 0, 3);
            case 3: // Wednesday
              return new Date(janFourth.getFullYear(), 0, 2);
            case 4: // Thursday
              return new Date(janFourth.getFullYear(), 0, 1);
            case 5: // Friday
              return new Date(janFourth.getFullYear()-1, 11, 31);
            case 6: // Saturday
              return new Date(janFourth.getFullYear()-1, 11, 30);
          }
      };
  
      function getWeekBasedYear(date) {
          var thisDate = __addDays(new Date(date.tm_year+1900, 0, 1), date.tm_yday);
  
          var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
          var janFourthNextYear = new Date(thisDate.getFullYear()+1, 0, 4);
  
          var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
          var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
  
          if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
            // this date is after the start of the first week of this year
            if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
              return thisDate.getFullYear()+1;
            } else {
              return thisDate.getFullYear();
            }
          } else { 
            return thisDate.getFullYear()-1;
          }
      };
  
      var EXPANSION_RULES_2 = {
        '%a': function(date) {
          return WEEKDAYS[date.tm_wday].substring(0,3);
        },
        '%A': function(date) {
          return WEEKDAYS[date.tm_wday];
        },
        '%b': function(date) {
          return MONTHS[date.tm_mon].substring(0,3);
        },
        '%B': function(date) {
          return MONTHS[date.tm_mon];
        },
        '%C': function(date) {
          var year = date.tm_year+1900;
          return leadingNulls(Math.floor(year/100),2);
        },
        '%d': function(date) {
          return leadingNulls(date.tm_mday, 2);
        },
        '%e': function(date) {
          return leadingSomething(date.tm_mday, 2, ' ');
        },
        '%g': function(date) {
          // %g, %G, and %V give values according to the ISO 8601:2000 standard week-based year. 
          // In this system, weeks begin on a Monday and week 1 of the year is the week that includes 
          // January 4th, which is also the week that includes the first Thursday of the year, and 
          // is also the first week that contains at least four days in the year. 
          // If the first Monday of January is the 2nd, 3rd, or 4th, the preceding days are part of 
          // the last week of the preceding year; thus, for Saturday 2nd January 1999, 
          // %G is replaced by 1998 and %V is replaced by 53. If December 29th, 30th, 
          // or 31st is a Monday, it and any following days are part of week 1 of the following year. 
          // Thus, for Tuesday 30th December 1997, %G is replaced by 1998 and %V is replaced by 01.
          
          return getWeekBasedYear(date).toString().substring(2);
        },
        '%G': function(date) {
          return getWeekBasedYear(date);
        },
        '%H': function(date) {
          return leadingNulls(date.tm_hour, 2);
        },
        '%I': function(date) {
          return leadingNulls(date.tm_hour < 13 ? date.tm_hour : date.tm_hour-12, 2);
        },
        '%j': function(date) {
          // Day of the year (001-366)
          return leadingNulls(date.tm_mday+__arraySum(__isLeapYear(date.tm_year+1900) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, date.tm_mon-1), 3);
        },
        '%m': function(date) {
          return leadingNulls(date.tm_mon+1, 2);
        },
        '%M': function(date) {
          return leadingNulls(date.tm_min, 2);
        },
        '%n': function() {
          return '\n';
        },
        '%p': function(date) {
          if (date.tm_hour > 0 && date.tm_hour < 13) {
            return 'AM';
          } else {
            return 'PM';
          }
        },
        '%S': function(date) {
          return leadingNulls(date.tm_sec, 2);
        },
        '%t': function() {
          return '\t';
        },
        '%u': function(date) {
          var day = new Date(date.tm_year+1900, date.tm_mon+1, date.tm_mday, 0, 0, 0, 0);
          return day.getDay() || 7;
        },
        '%U': function(date) {
          // Replaced by the week number of the year as a decimal number [00,53]. 
          // The first Sunday of January is the first day of week 1; 
          // days in the new year before this are in week 0. [ tm_year, tm_wday, tm_yday]
          var janFirst = new Date(date.tm_year+1900, 0, 1);
          var firstSunday = janFirst.getDay() === 0 ? janFirst : __addDays(janFirst, 7-janFirst.getDay());
          var endDate = new Date(date.tm_year+1900, date.tm_mon, date.tm_mday);
          
          // is target date after the first Sunday?
          if (compareByDay(firstSunday, endDate) < 0) {
            // calculate difference in days between first Sunday and endDate
            var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth()-1)-31;
            var firstSundayUntilEndJanuary = 31-firstSunday.getDate();
            var days = firstSundayUntilEndJanuary+februaryFirstUntilEndMonth+endDate.getDate();
            return leadingNulls(Math.ceil(days/7), 2);
          }
  
          return compareByDay(firstSunday, janFirst) === 0 ? '01': '00';
        },
        '%V': function(date) {
          // Replaced by the week number of the year (Monday as the first day of the week) 
          // as a decimal number [01,53]. If the week containing 1 January has four 
          // or more days in the new year, then it is considered week 1. 
          // Otherwise, it is the last week of the previous year, and the next week is week 1. 
          // Both January 4th and the first Thursday of January are always in week 1. [ tm_year, tm_wday, tm_yday]
          var janFourthThisYear = new Date(date.tm_year+1900, 0, 4);
          var janFourthNextYear = new Date(date.tm_year+1901, 0, 4);
  
          var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
          var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
  
          var endDate = __addDays(new Date(date.tm_year+1900, 0, 1), date.tm_yday);
  
          if (compareByDay(endDate, firstWeekStartThisYear) < 0) {
            // if given date is before this years first week, then it belongs to the 53rd week of last year
            return '53';
          } 
  
          if (compareByDay(firstWeekStartNextYear, endDate) <= 0) {
            // if given date is after next years first week, then it belongs to the 01th week of next year
            return '01';
          }
  
          // given date is in between CW 01..53 of this calendar year
          var daysDifference;
          if (firstWeekStartThisYear.getFullYear() < date.tm_year+1900) {
            // first CW of this year starts last year
            daysDifference = date.tm_yday+32-firstWeekStartThisYear.getDate()
          } else {
            // first CW of this year starts this year
            daysDifference = date.tm_yday+1-firstWeekStartThisYear.getDate();
          }
          return leadingNulls(Math.ceil(daysDifference/7), 2);
        },
        '%w': function(date) {
          var day = new Date(date.tm_year+1900, date.tm_mon+1, date.tm_mday, 0, 0, 0, 0);
          return day.getDay();
        },
        '%W': function(date) {
          // Replaced by the week number of the year as a decimal number [00,53]. 
          // The first Monday of January is the first day of week 1; 
          // days in the new year before this are in week 0. [ tm_year, tm_wday, tm_yday]
          var janFirst = new Date(date.tm_year, 0, 1);
          var firstMonday = janFirst.getDay() === 1 ? janFirst : __addDays(janFirst, janFirst.getDay() === 0 ? 1 : 7-janFirst.getDay()+1);
          var endDate = new Date(date.tm_year+1900, date.tm_mon, date.tm_mday);
  
          // is target date after the first Monday?
          if (compareByDay(firstMonday, endDate) < 0) {
            var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth()-1)-31;
            var firstMondayUntilEndJanuary = 31-firstMonday.getDate();
            var days = firstMondayUntilEndJanuary+februaryFirstUntilEndMonth+endDate.getDate();
            return leadingNulls(Math.ceil(days/7), 2);
          }
          return compareByDay(firstMonday, janFirst) === 0 ? '01': '00';
        },
        '%y': function(date) {
          // Replaced by the last two digits of the year as a decimal number [00,99]. [ tm_year]
          return (date.tm_year+1900).toString().substring(2);
        },
        '%Y': function(date) {
          // Replaced by the year as a decimal number (for example, 1997). [ tm_year]
          return date.tm_year+1900;
        },
        '%z': function(date) {
          // Replaced by the offset from UTC in the ISO 8601:2000 standard format ( +hhmm or -hhmm ),
          // or by no characters if no timezone is determinable. 
          // For example, "-0430" means 4 hours 30 minutes behind UTC (west of Greenwich). 
          // If tm_isdst is zero, the standard time offset is used. 
          // If tm_isdst is greater than zero, the daylight savings time offset is used. 
          // If tm_isdst is negative, no characters are returned. 
          // FIXME: we cannot determine time zone (or can we?)
          return '';
        },
        '%Z': function(date) {
          // Replaced by the timezone name or abbreviation, or by no bytes if no timezone information exists. [ tm_isdst]
          // FIXME: we cannot determine time zone (or can we?)
          return '';
        },
        '%%': function() {
          return '%';
        }
      };
      for (var rule in EXPANSION_RULES_2) {
        if (pattern.indexOf(rule) >= 0) {
          pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_2[rule](date));
        }
      }
  
      var bytes = intArrayFromString(pattern, false);
      if (bytes.length > maxsize) {
        return 0;
      } 
  
      writeArrayToMemory(bytes, s);
      return bytes.length-1;
    }function _strftime_l(s, maxsize, format, tm) {
      return _strftime(s, maxsize, format, tm); // no locale support yet
    }

  function _abort() {
      Module['abort']();
    }


  function _pthread_cond_wait() {
      return 0;
    }

  
  function _isdigit(chr) {
      return chr >= 48 && chr <= 57;
    }function _isdigit_l(chr) {
      return _isdigit(chr); // no locale support yet
    }

  var _fabs=Math_abs;

  function _clock() {
      if (_clock.start === undefined) _clock.start = Date.now();
      return Math.floor((Date.now() - _clock.start) * (1000000/1000));
    }

  var _getc=_fgetc;

  var Browser={mainLoop:{scheduler:null,method:"",shouldPause:false,paused:false,queue:[],pause:function () {
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
        
        // forced aspect ratio can be enabled by defining 'forcedAspectRatio' on Module
        // Module['forcedAspectRatio'] = 4 / 3;
        
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'] ||
                                    canvas['msRequestPointerLock'] ||
                                    function(){};
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 document['msExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
  
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas ||
                                document['msPointerLockElement'] === canvas;
        }
  
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        document.addEventListener('mspointerlockchange', pointerLockChange, false);
  
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
        var errorInfo = '?';
        function onContextCreationError(event) {
          errorInfo = event.statusMessage || errorInfo;
        }
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
          GLctx = Module.ctx = ctx;
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
          var canvasContainer = canvas.parentNode;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement'] ||
               document['msFullScreenElement'] || document['msFullscreenElement'] ||
               document['webkitCurrentFullScreenElement']) === canvasContainer) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'] ||
                                      document['msExitFullscreen'] ||
                                      document['exitFullscreen'] ||
                                      function() {};
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else {
            
            // remove the full screen specific parent of the canvas again to restore the HTML structure from before going full screen
            canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
            canvasContainer.parentNode.removeChild(canvasContainer);
            
            if (Browser.resizeCanvas) Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
          Browser.updateCanvasDimensions(canvas);
        }
  
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
          document.addEventListener('MSFullscreenChange', fullScreenChange, false);
        }
  
        // create a new parent to ensure the canvas has no siblings. this allows browsers to optimize full screen performance when its parent is the full screen root
        var canvasContainer = document.createElement("div");
        canvas.parentNode.insertBefore(canvasContainer, canvas);
        canvasContainer.appendChild(canvas);
        
        // use parent of canvas as full screen root to allow aspect ratio correction (Firefox stretches the root to screen size)
        canvasContainer.requestFullScreen = canvasContainer['requestFullScreen'] ||
                                            canvasContainer['mozRequestFullScreen'] ||
                                            canvasContainer['msRequestFullscreen'] ||
                                           (canvasContainer['webkitRequestFullScreen'] ? function() { canvasContainer['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvasContainer.requestFullScreen();
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
      },getMouseWheelDelta:function (event) {
        return Math.max(-1, Math.min(1, event.type === 'DOMMouseScroll' ? event.detail : -event.wheelDelta));
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,touches:{},lastTouches:{},calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
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
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
  
          // Neither .scrollX or .pageXOffset are defined in a spec, but
          // we prefer .scrollX because it is currently in a spec draft.
          // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
          var scrollX = ((typeof window.scrollX !== 'undefined') ? window.scrollX : window.pageXOffset);
          var scrollY = ((typeof window.scrollY !== 'undefined') ? window.scrollY : window.pageYOffset);
  
          if (event.type === 'touchstart' || event.type === 'touchend' || event.type === 'touchmove') {
            var touch = event.touch;
            if (touch === undefined) {
              return; // the "touch" property is only defined in SDL
  
            }
            var adjustedX = touch.pageX - (scrollX + rect.left);
            var adjustedY = touch.pageY - (scrollY + rect.top);
  
            adjustedX = adjustedX * (cw / rect.width);
            adjustedY = adjustedY * (ch / rect.height);
  
            var coords = { x: adjustedX, y: adjustedY };
            
            if (event.type === 'touchstart') {
              Browser.lastTouches[touch.identifier] = coords;
              Browser.touches[touch.identifier] = coords;
            } else if (event.type === 'touchend' || event.type === 'touchmove') {
              Browser.lastTouches[touch.identifier] = Browser.touches[touch.identifier];
              Browser.touches[touch.identifier] = { x: adjustedX, y: adjustedY };
            } 
            return;
          }
  
          var x = event.pageX - (scrollX + rect.left);
          var y = event.pageY - (scrollY + rect.top);
  
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
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
        Browser.updateCanvasDimensions(canvas, width, height);
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },updateCanvasDimensions:function (canvas, wNative, hNative) {
        if (wNative && hNative) {
          canvas.widthNative = wNative;
          canvas.heightNative = hNative;
        } else {
          wNative = canvas.widthNative;
          hNative = canvas.heightNative;
        }
        var w = wNative;
        var h = hNative;
        if (Module['forcedAspectRatio'] && Module['forcedAspectRatio'] > 0) {
          if (w/h < Module['forcedAspectRatio']) {
            w = Math.round(h * Module['forcedAspectRatio']);
          } else {
            h = Math.round(w / Module['forcedAspectRatio']);
          }
        }
        if (((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
             document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
             document['fullScreenElement'] || document['fullscreenElement'] ||
             document['msFullScreenElement'] || document['msFullscreenElement'] ||
             document['webkitCurrentFullScreenElement']) === canvas.parentNode) && (typeof screen != 'undefined')) {
           var factor = Math.min(screen.width / w, screen.height / h);
           w = Math.round(w * factor);
           h = Math.round(h * factor);
        }
        if (Browser.resizeCanvas) {
          if (canvas.width  != w) canvas.width  = w;
          if (canvas.height != h) canvas.height = h;
          if (typeof canvas.style != 'undefined') {
            canvas.style.removeProperty( "width");
            canvas.style.removeProperty("height");
          }
        } else {
          if (canvas.width  != wNative) canvas.width  = wNative;
          if (canvas.height != hNative) canvas.height = hNative;
          if (typeof canvas.style != 'undefined') {
            if (w != wNative || h != hNative) {
              canvas.style.setProperty( "width", w + "px", "important");
              canvas.style.setProperty("height", h + "px", "important");
            } else {
              canvas.style.removeProperty( "width");
              canvas.style.removeProperty("height");
            }
          }
        }
      }};

  function _sprintf(s, format, varargs) {
      // int sprintf(char *restrict s, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      return _snprintf(s, undefined, format, varargs);
    }

  function ___ctype_b_loc() {
      // http://refspecs.freestandards.org/LSB_3.0.0/LSB-Core-generic/LSB-Core-generic/baselib---ctype-b-loc.html
      var me = ___ctype_b_loc;
      if (!me.ret) {
        var values = [
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,8195,8194,8194,8194,8194,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,24577,49156,49156,49156,
          49156,49156,49156,49156,49156,49156,49156,49156,49156,49156,49156,49156,55304,55304,55304,55304,55304,55304,55304,55304,
          55304,55304,49156,49156,49156,49156,49156,49156,49156,54536,54536,54536,54536,54536,54536,50440,50440,50440,50440,50440,
          50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,49156,49156,49156,49156,49156,
          49156,54792,54792,54792,54792,54792,54792,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,
          50696,50696,50696,50696,50696,50696,50696,49156,49156,49156,49156,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
        ];
        var i16size = 2;
        var arr = _malloc(values.length * i16size);
        for (var i = 0; i < values.length; i++) {
          HEAP16[(((arr)+(i * i16size))>>1)]=values[i];
        }
        me.ret = allocate([arr + 128 * i16size], 'i16*', ALLOC_NORMAL);
      }
      return me.ret;
    }

  
  function _free() {
  }
  Module["_free"] = _free;function _freelocale(locale) {
      _free(locale);
    }

  function ___cxa_allocate_exception(size) {
      var ptr = _malloc(size + ___cxa_exception_header_size);
      return ptr + ___cxa_exception_header_size;
    }

  var _fmodl=_fmod;

  function ___cxa_pure_virtual() {
      ABORT = true;
      throw 'Pure virtual function called!';
    }

  function _catgets(catd, set_id, msg_id, s) {
      // char *catgets (nl_catd catd, int set_id, int msg_id, const char *s)
      return s;
    }

   
  Module["_tolower"] = _tolower;

  
  function _asprintf(s, format, varargs) {
      return _sprintf(-s, format, varargs);
    }function _vasprintf(s, format, va_arg) {
      return _asprintf(s, format, HEAP32[((va_arg)>>2)]);
    }

  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret;
      }
      return ret;
    }

  function _copysign(a, b) {
      return __reallyNegative(a) === __reallyNegative(b) ? a : -a;
    }

  function ___ctype_toupper_loc() {
      // http://refspecs.freestandards.org/LSB_3.1.1/LSB-Core-generic/LSB-Core-generic/libutil---ctype-toupper-loc.html
      var me = ___ctype_toupper_loc;
      if (!me.ret) {
        var values = [
          128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,
          158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,
          188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,
          218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,
          248,249,250,251,252,253,254,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,
          33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,
          73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,
          81,82,83,84,85,86,87,88,89,90,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,
          145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,
          175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,
          205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,
          235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255
        ];
        var i32size = 4;
        var arr = _malloc(values.length * i32size);
        for (var i = 0; i < values.length; i++) {
          HEAP32[(((arr)+(i * i32size))>>2)]=values[i];
        }
        me.ret = allocate([arr + 128 * i32size], 'i32*', ALLOC_NORMAL);
      }
      return me.ret;
    }

  function ___cxa_guard_acquire(variable) {
      if (!HEAP8[(variable)]) { // ignore SAFE_HEAP stuff because llvm mixes i64 and i8 here
        HEAP8[(variable)]=1;
        return 1;
      }
      return 0;
    }

  function ___ctype_tolower_loc() {
      // http://refspecs.freestandards.org/LSB_3.1.1/LSB-Core-generic/LSB-Core-generic/libutil---ctype-tolower-loc.html
      var me = ___ctype_tolower_loc;
      if (!me.ret) {
        var values = [
          128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,
          158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,
          188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,
          218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,
          248,249,250,251,252,253,254,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,
          33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,97,98,99,100,101,102,103,
          104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,91,92,93,94,95,96,97,98,99,100,101,102,103,
          104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,
          134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,
          164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,
          194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,
          224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,
          254,255
        ];
        var i32size = 4;
        var arr = _malloc(values.length * i32size);
        for (var i = 0; i < values.length; i++) {
          HEAP32[(((arr)+(i * i32size))>>2)]=values[i];
        }
        me.ret = allocate([arr + 128 * i32size], 'i32*', ALLOC_NORMAL);
      }
      return me.ret;
    }

  
  var ___cxa_caught_exceptions=[];function ___cxa_begin_catch(ptr) {
      __ZSt18uncaught_exceptionv.uncaught_exception--;
      ___cxa_caught_exceptions.push(___cxa_last_thrown_exception);
      return ptr;
    }

   
  Module["_bitshift64Shl"] = _bitshift64Shl;


  function __ZNSt9exceptionD2Ev() {}

  var _floor=Math_floor;

  function _catopen(name, oflag) {
      // nl_catd catopen (const char *name, int oflag)
      return -1;
    }

   
  Module["_strcpy"] = _strcpy;

  var _copysignl=_copysign;

  var __ZTISt9exception=allocate([allocate([1,0,0,0,0,0,0], "i8", ALLOC_STATIC)+8, 0], "i32", ALLOC_STATIC);

  var ___dso_handle=allocate(1, "i32*", ALLOC_STATIC);



FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); NODEFS.staticInit(); }
__ATINIT__.push({ func: function() { SOCKFS.root = FS.mount(SOCKFS, {}, null); } });
_fgetc.ret = allocate([0], "i8", ALLOC_STATIC);
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

assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");

 var ctlz_i8 = allocate([8,7,6,6,5,5,5,5,4,4,4,4,4,4,4,4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_DYNAMIC);
 var cttz_i8 = allocate([8,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,7,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0], "i8", ALLOC_DYNAMIC);

var Math_min = Math.min;
function invoke_iiii(index,a1,a2,a3) {
  try {
    return Module["dynCall_iiii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiiii(index,a1,a2,a3,a4,a5,a6,a7) {
  try {
    Module["dynCall_viiiiiii"](index,a1,a2,a3,a4,a5,a6,a7);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

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

function invoke_viiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9) {
  try {
    Module["dynCall_viiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8,a9);
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

function invoke_viiiiiid(index,a1,a2,a3,a4,a5,a6,a7) {
  try {
    Module["dynCall_viiiiiid"](index,a1,a2,a3,a4,a5,a6,a7);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viii(index,a1,a2,a3) {
  try {
    Module["dynCall_viii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiid(index,a1,a2,a3,a4,a5,a6) {
  try {
    Module["dynCall_viiiiid"](index,a1,a2,a3,a4,a5,a6);
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

function invoke_iiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8) {
  try {
    return Module["dynCall_iiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiiii(index,a1,a2,a3,a4) {
  try {
    return Module["dynCall_iiiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8) {
  try {
    Module["dynCall_viiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8);
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

function invoke_iiiiii(index,a1,a2,a3,a4,a5) {
  try {
    return Module["dynCall_iiiiii"](index,a1,a2,a3,a4,a5);
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
var asm=(function(global,env,buffer){"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env.cttz_i8|0;var n=env.ctlz_i8|0;var o=env.___rand_seed|0;var p=env.__ZTISt9exception|0;var q=env.___dso_handle|0;var r=env._stderr|0;var s=env._stdin|0;var t=env._stdout|0;var u=0;var v=0;var w=0;var x=0;var y=+env.NaN,z=+env.Infinity;var A=0,B=0,C=0,D=0,E=0.0,F=0,G=0,H=0,I=0.0;var J=0;var K=0;var L=0;var M=0;var N=0;var O=0;var P=0;var Q=0;var R=0;var S=0;var T=global.Math.floor;var U=global.Math.abs;var V=global.Math.sqrt;var W=global.Math.pow;var X=global.Math.cos;var Y=global.Math.sin;var Z=global.Math.tan;var _=global.Math.acos;var $=global.Math.asin;var aa=global.Math.atan;var ba=global.Math.atan2;var ca=global.Math.exp;var da=global.Math.log;var ea=global.Math.ceil;var fa=global.Math.imul;var ga=env.abort;var ha=env.assert;var ia=env.asmPrintInt;var ja=env.asmPrintFloat;var ka=env.min;var la=env.invoke_iiii;var ma=env.invoke_viiiiiii;var na=env.invoke_viiiii;var oa=env.invoke_vi;var pa=env.invoke_vii;var qa=env.invoke_viiiiiiiii;var ra=env.invoke_ii;var sa=env.invoke_viiiiiid;var ta=env.invoke_viii;var ua=env.invoke_viiiiid;var va=env.invoke_v;var wa=env.invoke_iiiiiiiii;var xa=env.invoke_iiiii;var ya=env.invoke_viiiiiiii;var za=env.invoke_viiiiii;var Aa=env.invoke_iii;var Ba=env.invoke_iiiiii;var Ca=env.invoke_viiii;var Da=env._fabs;var Ea=env._vsscanf;var Fa=env.__ZSt9terminatev;var Ga=env.___cxa_guard_acquire;var Ha=env._sscanf;var Ia=env.___assert_fail;var Ja=env.__ZSt18uncaught_exceptionv;var Ka=env.___ctype_toupper_loc;var La=env.__addDays;var Ma=env._sbrk;var Na=env.___cxa_begin_catch;var Oa=env._emscripten_memcpy_big;var Pa=env._sysconf;var Qa=env._clock;var Ra=env._fileno;var Sa=env._fread;var Ta=env._write;var Ua=env.__isLeapYear;var Va=env.__ZNSt9exceptionD2Ev;var Wa=env.___cxa_does_inherit;var Xa=env.__exit;var Ya=env._catclose;var Za=env._send;var _a=env.___cxa_is_number_type;var $a=env.___cxa_find_matching_catch;var ab=env._isxdigit_l;var bb=env.___cxa_guard_release;var cb=env._strerror_r;var db=env.___setErrNo;var eb=env._newlocale;var fb=env._isdigit_l;var gb=env.___resumeException;var hb=env._freelocale;var ib=env._printf;var jb=env._sprintf;var kb=env._vasprintf;var lb=env._vsnprintf;var mb=env._strtoull_l;var nb=env._read;var ob=env._fwrite;var pb=env._time;var qb=env._fprintf;var rb=env._catopen;var sb=env._exit;var tb=env.___ctype_b_loc;var ub=env._fmod;var vb=env.___cxa_allocate_exception;var wb=env._floor;var xb=env._strtoll;var yb=env._pwrite;var zb=env._uselocale;var Ab=env._snprintf;var Bb=env.__scanString;var Cb=env._strtoull;var Db=env._strftime;var Eb=env._isxdigit;var Fb=env._pthread_cond_broadcast;var Gb=env._recv;var Hb=env._fgetc;var Ib=env.__parseInt64;var Jb=env.__getFloat;var Kb=env._abort;var Lb=env._ceil;var Mb=env._isspace;var Nb=env.___cxa_pure_virtual;var Ob=env._pthread_cond_wait;var Pb=env._ungetc;var Qb=env._fflush;var Rb=env._strftime_l;var Sb=env._pthread_mutex_lock;var Tb=env.__reallyNegative;var Ub=env._catgets;var Vb=env._asprintf;var Wb=env._strtoll_l;var Xb=env.__arraySum;var Yb=env.___ctype_tolower_loc;var Zb=env._pthread_mutex_unlock;var _b=env._pread;var $b=env._mkport;var ac=env.___errno_location;var bc=env._copysign;var cc=env.___cxa_throw;var dc=env._isdigit;var ec=env._strerror;var fc=env.__formatString;var gc=env._atexit;var hc=0.0;
// EMSCRIPTEN_START_FUNCS
function Ac(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+7&-8;return b|0}function Bc(){return i|0}function Cc(a){a=a|0;i=a}function Dc(a,b){a=a|0;b=b|0;if((u|0)==0){u=a;v=b}}function Ec(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0]}function Fc(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0];a[k+4|0]=a[b+4|0];a[k+5|0]=a[b+5|0];a[k+6|0]=a[b+6|0];a[k+7|0]=a[b+7|0]}function Gc(a){a=a|0;J=a}function Hc(a){a=a|0;K=a}function Ic(a){a=a|0;L=a}function Jc(a){a=a|0;M=a}function Kc(a){a=a|0;N=a}function Lc(a){a=a|0;O=a}function Mc(a){a=a|0;P=a}function Nc(a){a=a|0;Q=a}function Oc(a){a=a|0;R=a}function Pc(a){a=a|0;S=a}function Qc(){var a=0;a=i;Rc(8,-2);i=a;return}function Rc(a,d){a=a|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+16|0;f=e;g=e+4|0;c[f>>2]=a;b[g>>1]=d;_c(c[f>>2]|0,b[g>>1]|0);i=e;return}function Sc(){var a=0;a=i;Rc(16,-1);i=a;return}function Tc(d,e,f,g){d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;h=i;i=i+80|0;j=h+44|0;k=h+40|0;l=h+36|0;m=h+32|0;n=h+28|0;o=h+24|0;p=h+20|0;q=h+16|0;r=h+12|0;s=h+8|0;t=h+4|0;u=h;v=h+64|0;w=h+60|0;x=h+56|0;y=h+52|0;z=h+48|0;c[r>>2]=e;c[s>>2]=f;c[t>>2]=g;Uc(d);c[u>>2]=100;a[72]=1;hf(v,c[r>>2]|0);b[d+0>>1]=b[v+0>>1]|0;if(!(Vc(d,8)|0)){i=h;return}c[q>>2]=w;c[p>>2]=c[q>>2];q=c[p>>2]|0;Uc(q);b[q+2>>1]=0;q=(Wc(c[r>>2]|0)|0)<25;p=c[r>>2]|0;do{if(!q){v=(Wc(p)|0)<27;g=c[r>>2]|0;if(v){wd(y,g,1e3);c[j>>2]=w;c[k>>2]=y;v=c[j>>2]|0;f=c[k>>2]|0;b[v+0>>1]=b[f+0>>1]|0;b[v+2>>1]=b[(c[k>>2]|0)+2>>1]|0;break}else{zd(z,g);c[l>>2]=w;c[m>>2]=z;g=c[l>>2]|0;v=c[m>>2]|0;b[g+0>>1]=b[v+0>>1]|0;b[g+2>>1]=b[(c[m>>2]|0)+2>>1]|0;break}}else{od(x,p,c[s>>2]|0,(c[t>>2]|0)/2|0,c[t>>2]|0);c[n>>2]=w;c[o>>2]=x;g=c[n>>2]|0;v=c[o>>2]|0;b[g+0>>1]=b[v+0>>1]|0;b[g+2>>1]=b[(c[o>>2]|0)+2>>1]|0}}while(0);b[d+0>>1]=b[w+0>>1]|0;c[u>>2]=b[w+2>>1]|0;i=h;return}function Uc(a){a=a|0;var b=0,d=0;b=i;i=i+16|0;d=b;c[d>>2]=a;Zc(c[d>>2]|0);i=b;return}function Vc(a,b){a=a|0;b=b|0;var d=0,f=0,g=0;d=i;i=i+16|0;f=d+4|0;g=d;c[f>>2]=a;c[g>>2]=b;i=d;return(e[c[f>>2]>>1]|0|0)==(e[c[g>>2]>>1]|0|0)|0}function Wc(a){a=a|0;var b=0,d=0;b=i;i=i+16|0;d=b;c[d>>2]=a;i=b;return c[(c[d>>2]|0)+196>>2]|0}function Xc(d,e,f){d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;g=i;i=i+304|0;h=g+288|0;j=g+276|0;k=g+272|0;l=g+268|0;m=g+264|0;n=g;o=g+286|0;p=g+284|0;q=g+282|0;r=g+280|0;c[k>>2]=d;c[l>>2]=e;c[m>>2]=f;Ke(n);while(1){if((a[c[k>>2]|0]|0)==0){s=9;break}Ee(o,c[k>>2]|0);c[k>>2]=(c[k>>2]|0)+4;if((a[c[k>>2]|0]|0)==47){c[k>>2]=(c[k>>2]|0)+1}if(Vc(o,8)|0){s=7;break}b[p+0>>1]=b[o+0>>1]|0;b[h+0>>1]=b[p+0>>1]|0;if(!(Me(n,h)|0)){s=7;break}b[q+0>>1]=b[o+0>>1]|0;b[h+0>>1]=b[q+0>>1]|0;Pe(n,h)}if((s|0)==7){c[j>>2]=24;t=c[j>>2]|0;i=g;return t|0}else if((s|0)==9){c[16]=0;Tc(r,n,c[l>>2]|0,c[m>>2]|0);c[j>>2]=Fe(r)|0;t=c[j>>2]|0;i=g;return t|0}return 0}function Yc(){return c[16]|0}function Zc(a){a=a|0;var b=0;b=i;i=i+16|0;c[b>>2]=a;i=b;return}function _c(a,d){a=a|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+16|0;f=e;g=e+4|0;c[f>>2]=a;b[g>>1]=d;b[c[f>>2]>>1]=b[g>>1]|0;i=e;return}function $c(){var a=0;a=i;Qc();Sc();i=a;return}function ad(){var a=0;a=i;Rc(48,-2);i=a;return}function bd(){var a=0;a=i;Rc(56,-1);i=a;return}function cd(d,e,f,g){d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0;h=i;i=i+272|0;j=h+206|0;k=h+200|0;l=h+196|0;m=h+192|0;n=h+188|0;o=h+184|0;p=h+180|0;q=h+176|0;r=h+172|0;s=h+168|0;t=h+164|0;u=h+160|0;v=h+156|0;w=h+152|0;x=h+148|0;y=h+144|0;z=h+140|0;A=h+136|0;B=h+132|0;C=h+128|0;D=h+24|0;E=h+124|0;F=h+16|0;G=h+120|0;H=h+116|0;I=h+112|0;J=h+108|0;K=h+104|0;L=h+100|0;M=h+96|0;N=h+92|0;O=h+88|0;P=h+84|0;Q=h+80|0;R=h+76|0;S=h+72|0;T=h+8|0;U=h+68|0;V=h;W=h+64|0;X=h+60|0;Y=h+56|0;Z=h+52|0;_=h+48|0;$=h+44|0;aa=h+204|0;ba=h+40|0;ca=h+208|0;da=h+36|0;ea=h+32|0;fa=h+28|0;c[Z>>2]=d;c[_>>2]=e;c[$>>2]=g;g=c[Z>>2]|0;Z=c[_>>2]|0;b[aa+0>>1]=b[f+0>>1]|0;b[j+0>>1]=b[aa+0>>1]|0;dd(g,Z,j);j=g+268|0;b[j+0>>1]=b[f+0>>1]|0;f=c[$>>2]|0;ed(ca,g);c[W>>2]=f;c[X>>2]=ca;ee(Y,c[W>>2]|0,c[X>>2]|0);a[V+0|0]=a[Y+0|0]|0;a[V+1|0]=a[Y+1|0]|0;a[V+2|0]=a[Y+2|0]|0;a[V+3|0]=a[Y+3|0]|0;c[U>>2]=ba;Y=c[U>>2]|0;a[T+0|0]=a[V+0|0]|0;a[T+1|0]=a[V+1|0]|0;a[T+2|0]=a[V+2|0]|0;a[T+3|0]=a[V+3|0]|0;c[S>>2]=Y;Y=c[S>>2]|0;c[Y+0>>2]=c[T+0>>2];c[Q>>2]=c[$>>2];c[P>>2]=c[Q>>2];c[O>>2]=c[P>>2];c[N>>2]=(c[O>>2]|0)+4;c[M>>2]=c[N>>2];c[L>>2]=c[M>>2];c[K>>2]=c[L>>2];L=c[K>>2]|0;c[I>>2]=R;c[J>>2]=L;L=c[J>>2]|0;c[G>>2]=c[I>>2];c[H>>2]=L;c[c[G>>2]>>2]=c[H>>2];a[F+0|0]=a[R+0|0]|0;a[F+1|0]=a[R+1|0]|0;a[F+2|0]=a[R+2|0]|0;a[F+3|0]=a[R+3|0]|0;c[E>>2]=da;R=c[E>>2]|0;a[D+0|0]=a[F+0|0]|0;a[D+1|0]=a[F+1|0]|0;a[D+2|0]=a[F+2|0]|0;a[D+3|0]=a[F+3|0]|0;c[C>>2]=R;R=c[C>>2]|0;c[R+0>>2]=c[D+0>>2];c[A>>2]=ba;c[B>>2]=da;da=c[B>>2]|0;c[y>>2]=c[A>>2];c[z>>2]=da;da=c[z>>2]|0;c[w>>2]=c[y>>2];c[x>>2]=da;if(!((c[c[w>>2]>>2]|0)==(c[c[x>>2]>>2]|0)^1)){c[g+264>>2]=fd(g)|0;i=h;return}c[v>>2]=ba;c[u>>2]=c[v>>2];c[t>>2]=(c[c[u>>2]>>2]|0)+16;c[s>>2]=c[t>>2];c[r>>2]=c[s>>2];c[q>>2]=c[r>>2];c[ea>>2]=c[(c[q>>2]|0)+64>>2];c[p>>2]=ba;c[o>>2]=c[p>>2];c[n>>2]=(c[c[o>>2]>>2]|0)+16;c[m>>2]=c[n>>2];c[l>>2]=c[m>>2];c[k>>2]=c[l>>2];c[fa>>2]=c[(c[k>>2]|0)+68>>2];if((c[ea>>2]|0)>-2147483647?(c[fa>>2]|0)<2147483647:0){c[g+264>>2]=(((c[ea>>2]|0)+(c[fa>>2]|0)|0)/2|0)-1e3;i=h;return}c[g+264>>2]=fd(g)|0;i=h;return}function dd(a,d,e){a=a|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;i=i+16|0;g=f+6|0;h=f;j=f+4|0;c[h>>2]=d;dp(a|0,c[h>>2]|0,264)|0;b[j+0>>1]=b[e+0>>1]|0;b[g+0>>1]=b[j+0>>1]|0;Pe(a,g);i=f;return}function ed(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=i;i=i+16|0;e=d+4|0;f=d;c[e>>2]=a;c[f>>2]=b;ze(c[e>>2]|0,c[f>>2]|0);i=d;return}function fd(a){a=a|0;var b=0,d=0,e=0;b=i;i=i+16|0;d=b;c[d>>2]=a;a=c[d>>2]|0;d=rd(a)|0;e=ye(a)|0;i=b;return(d?e:0-e|0)|0}function gd(d,e){d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;f=i;i=i+288|0;g=f+274|0;h=f+276|0;j=f+268|0;k=f+264|0;l=f+272|0;m=f;c[j>>2]=d;d=c[j>>2]|0;c[16]=(c[16]|0)+1;j=c[d+4>>2]|0;b[l+0>>1]=b[e+0>>1]|0;b[g+0>>1]=b[l+0>>1]|0;dd(m,j,g);c[k>>2]=0-(fd(m)|0);if((c[k>>2]|0)>(c[d+8>>2]|0)?(c[d+8>>2]=c[k>>2],(c[d+8>>2]|0)>=(c[d+12>>2]|0)):0){a[h]=0;n=a[h]|0;o=n&1;i=f;return o|0}a[h]=1;n=a[h]|0;o=n&1;i=f;return o|0}function hd(d,e,f,g,j,k,l,m){d=d|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ja=0,Ka=0,La=0,Ma=0,Na=0,Oa=0,Pa=0,Ra=0,Sa=0,Ta=0,Ua=0,Va=0,Wa=0,Xa=0,Ya=0,Za=0,_a=0,$a=0,ab=0,bb=0,cb=0,db=0,eb=0,fb=0,gb=0,hb=0,ib=0,jb=0,kb=0,lb=0,mb=0,nb=0,ob=0,pb=0,qb=0,rb=0,sb=0,tb=0,ub=0,vb=0,wb=0,xb=0,yb=0,zb=0,Ab=0,Bb=0,Cb=0,Db=0,Eb=0,Fb=0,Gb=0,Hb=0,Ib=0,Jb=0,Kb=0,Lb=0,Mb=0,Nb=0,Ob=0,Pb=0,Qb=0,Rb=0,Sb=0,Tb=0,Ub=0,Vb=0,Wb=0,Xb=0,Yb=0,Zb=0,_b=0,$b=0,ac=0,bc=0,cc=0,dc=0,ec=0,fc=0,gc=0,hc=0,ic=0,jc=0,kc=0,lc=0,mc=0,nc=0,oc=0,pc=0,qc=0,rc=0,sc=0,tc=0,uc=0,vc=0,wc=0,xc=0,yc=0,zc=0,Ac=0,Bc=0,Cc=0,Dc=0,Ec=0,Fc=0,Gc=0,Hc=0,Ic=0,Jc=0,Kc=0,Lc=0,Mc=0,Nc=0,Oc=0,Pc=0,Qc=0,Rc=0,Sc=0,Tc=0,Vc=0,Xc=0,Yc=0,Zc=0,_c=0,$c=0,ad=0,bd=0,dd=0,fd=0,gd=0,kd=0,od=0,pd=0,qd=0,rd=0,sd=0,td=0,ud=0,vd=0,wd=0,xd=0,yd=0,zd=0,Ad=0,Bd=0,Cd=0,Dd=0,Ed=0,Fd=0,Gd=0,Hd=0,Id=0,Jd=0,Kd=0,Ld=0,Md=0,Nd=0,Pd=0,Qd=0,Rd=0,Sd=0;n=i;i=i+4592|0;o=n+4504|0;p=n+1492|0;q=n+1488|0;r=n+1484|0;s=n+1480|0;t=n+1476|0;u=n+1472|0;v=n+1468|0;w=n+1464|0;x=n+1460|0;y=n+1456|0;z=n+1452|0;A=n+1448|0;B=n+1444|0;C=n+1440|0;D=n+1436|0;E=n+1432|0;F=n+1428|0;G=n+1424|0;H=n+1420|0;I=n+1416|0;J=n+1412|0;K=n+1408|0;L=n+1404|0;M=n+1400|0;N=n+1396|0;O=n+1392|0;P=n+1388|0;Q=n+1384|0;R=n+1380|0;S=n+1376|0;T=n+1372|0;U=n+1368|0;V=n+1364|0;W=n+1360|0;X=n+1356|0;Y=n+1352|0;Z=n+1348|0;_=n+1344|0;$=n+1340|0;aa=n+1336|0;ba=n+1332|0;ca=n+1328|0;da=n+1324|0;ea=n+1320|0;fa=n+1316|0;ga=n+1312|0;ha=n+1308|0;ia=n+1304|0;ja=n+1300|0;ka=n+1296|0;la=n+1292|0;ma=n+160|0;na=n+1288|0;oa=n+1284|0;pa=n+4576|0;qa=n+1280|0;ra=n+1276|0;sa=n+1272|0;ta=n+1268|0;ua=n+1264|0;va=n+1260|0;wa=n+1256|0;xa=n+1252|0;ya=n+1248|0;za=n+1244|0;Aa=n+1240|0;Ba=n+1236|0;Ca=n+1232|0;Da=n+1228|0;Ea=n+1224|0;Fa=n+1220|0;Ga=n+1216|0;Ha=n+1212|0;Ja=n+1208|0;Ka=n+152|0;La=n+1204|0;Ma=n+1200|0;Na=n+4575|0;Oa=n+1196|0;Pa=n+1192|0;Ra=n+1188|0;Sa=n+144|0;Ta=n+1184|0;Ua=n+1180|0;Va=n+4574|0;Wa=n+1176|0;Xa=n+136|0;Ya=n+128|0;Za=n+1172|0;_a=n+1168|0;$a=n+1164|0;ab=n+1160|0;bb=n+1156|0;cb=n+1152|0;db=n+1148|0;eb=n+1144|0;fb=n+1140|0;gb=n+1136|0;hb=n+1132|0;ib=n+1128|0;jb=n+1124|0;kb=n+1120|0;lb=n+1116|0;mb=n+1112|0;nb=n+1108|0;ob=n+1104|0;pb=n+1100|0;qb=n+1096|0;rb=n+1092|0;sb=n+1088|0;tb=n+1084|0;ub=n+1080|0;vb=n+1076|0;wb=n+1072|0;xb=n+120|0;yb=n+1068|0;zb=n+1064|0;Ab=n+4573|0;Bb=n+1060|0;Cb=n+1056|0;Db=n+1052|0;Eb=n+1048|0;Fb=n+1044|0;Gb=n+1040|0;Hb=n+1036|0;Ib=n+1032|0;Jb=n+1028|0;Kb=n+112|0;Lb=n+1024|0;Mb=n+1020|0;Nb=n+4572|0;Ob=n+1016|0;Pb=n+1012|0;Qb=n+1008|0;Rb=n+1004|0;Sb=n+1e3|0;Tb=n+104|0;Ub=n+996|0;Vb=n+992|0;Wb=n+4571|0;Xb=n+988|0;Yb=n+984|0;Zb=n+980|0;_b=n+976|0;$b=n+972|0;ac=n+96|0;bc=n+968|0;cc=n+964|0;dc=n+4570|0;ec=n+960|0;fc=n+956|0;gc=n+952|0;hc=n+948|0;ic=n+944|0;jc=n+940|0;kc=n+936|0;lc=n+88|0;mc=n+932|0;nc=n+80|0;oc=n+928|0;pc=n+924|0;qc=n+920|0;rc=n+916|0;sc=n+912|0;tc=n+908|0;uc=n+904|0;vc=n+900|0;wc=n+896|0;xc=n+892|0;yc=n+888|0;zc=n+880|0;Ac=n+808|0;Bc=n+800|0;Cc=n+796|0;Dc=n+792|0;Ec=n+788|0;Fc=n+784|0;Gc=n+780|0;Hc=n+776|0;Ic=n+772|0;Jc=n+768|0;Kc=n+764|0;Lc=n+72|0;Mc=n+8|0;Nc=n+760|0;Oc=n+756|0;Pc=n+752|0;Qc=n+748|0;Rc=n+744|0;Sc=n+740|0;Tc=n+736|0;Vc=n+732|0;Xc=n+728|0;Yc=n+724|0;Zc=n+720|0;_c=n+716|0;$c=n+712|0;ad=n+708|0;bd=n+704|0;dd=n+700|0;fd=n+696|0;gd=n+680|0;kd=n+676|0;od=n+672|0;pd=n+664|0;qd=n+592|0;rd=n+520|0;sd=n+4507|0;td=n+512|0;ud=n+508|0;vd=n+504|0;wd=n+500|0;xd=n;yd=n+496|0;zd=n+492|0;Ad=n+488|0;Bd=n+484|0;Cd=n+472|0;Dd=n+1504|0;Ed=n+468|0;Fd=n+464|0;Gd=n+192|0;Hd=n+1496|0;Id=n+188|0;Jd=n+184|0;Kd=n+4506|0;Ld=n+180|0;Md=n+176|0;Nd=n+172|0;Pd=n+168|0;Qd=n+164|0;c[Yc>>2]=d;c[Zc>>2]=e;c[_c>>2]=f;c[$c>>2]=g;c[ad>>2]=j;c[bd>>2]=k;c[dd>>2]=l;c[fd>>2]=m;if((c[_c>>2]|0)>(c[$c>>2]|0)){Ia(80,96,91,112)}m=(c[16]|0)+1|0;c[16]=m;do{if((m|0)>=(c[32]|0)?a[136]&1:0){l=c[36]|0;if((l-(Qa()|0)|0)>=0){c[32]=(c[32]|0)+1e4;break}a[152]=1;c[Xc>>2]=0;Rd=c[Xc>>2]|0;i=n;return Rd|0}}while(0);if((c[Zc>>2]|0)<=1){id(gd,c[Yc>>2]|0,c[_c>>2]|0,c[$c>>2]|0);if(Ve(c[Yc>>2]|0,gd)|0){c[Xc>>2]=c[gd+8>>2];c[kd>>2]=1}else{c[Xc>>2]=c[gd+12>>2];c[kd>>2]=1}jd(gd);Rd=c[Xc>>2]|0;i=n;return Rd|0}c[od>>2]=0;do{if((c[fd>>2]|0)>0){gd=c[bd>>2]|0;ed(sd,c[Yc>>2]|0);c[Tc>>2]=-2147483647;c[Vc>>2]=2147483647;c[Qc>>2]=td;c[Rc>>2]=Tc;c[Sc>>2]=Vc;m=c[Rc>>2]|0;l=c[Sc>>2]|0;c[Nc>>2]=c[Qc>>2];c[Oc>>2]=m;c[Pc>>2]=l;l=c[Nc>>2]|0;c[l>>2]=c[c[Oc>>2]>>2];c[l+4>>2]=c[c[Pc>>2]>>2];l=Mc+0|0;m=sd+0|0;k=l+63|0;do{a[l]=a[m]|0;l=l+1|0;m=m+1|0}while((l|0)<(k|0));a[Lc+0|0]=a[td+0|0]|0;a[Lc+1|0]=a[td+1|0]|0;a[Lc+2|0]=a[td+2|0]|0;a[Lc+3|0]=a[td+3|0]|0;a[Lc+4|0]=a[td+4|0]|0;a[Lc+5|0]=a[td+5|0]|0;a[Lc+6|0]=a[td+6|0]|0;a[Lc+7|0]=a[td+7|0]|0;c[Ic>>2]=rd;c[Jc>>2]=Mc;c[Kc>>2]=Lc;j=c[Jc>>2]|0;g=c[Kc>>2]|0;c[Fc>>2]=c[Ic>>2];c[Gc>>2]=j;c[Hc>>2]=g;g=c[Fc>>2]|0;l=g+0|0;m=(c[Gc>>2]|0)+0|0;k=l+63|0;do{a[l]=a[m]|0;l=l+1|0;m=m+1|0}while((l|0)<(k|0));j=g+64|0;f=c[Hc>>2]|0;c[j+0>>2]=c[f+0>>2];c[j+4>>2]=c[f+4>>2];c[Dc>>2]=qd;c[Ec>>2]=rd;f=c[Ec>>2]|0;c[Bc>>2]=c[Dc>>2];c[Cc>>2]=f;f=c[Bc>>2]|0;l=f+0|0;m=(c[Cc>>2]|0)+0|0;k=l+63|0;do{a[l]=a[m]|0;l=l+1|0;m=m+1|0}while((l|0)<(k|0));g=f+64|0;j=(c[Cc>>2]|0)+64|0;c[g+0>>2]=c[j+0>>2];c[g+4>>2]=c[j+4>>2];c[xc>>2]=gd;c[yc>>2]=qd;j=c[xc>>2]|0;g=c[yc>>2]|0;c[vc>>2]=Ac;c[wc>>2]=g;g=c[wc>>2]|0;c[tc>>2]=c[vc>>2];c[uc>>2]=g;l=(c[tc>>2]|0)+0|0;m=(c[uc>>2]|0)+0|0;k=l+72|0;do{c[l>>2]=c[m>>2];l=l+4|0;m=m+4|0}while((l|0)<(k|0));ae(zc,j,Ac);c[rc>>2]=pd;c[sc>>2]=zc;m=c[sc>>2]|0;c[oc>>2]=c[rc>>2];c[pc>>2]=m;m=c[oc>>2]|0;l=c[pc>>2]|0;c[qc+0>>2]=c[l+0>>2];a[nc+0|0]=a[qc+0|0]|0;a[nc+1|0]=a[qc+1|0]|0;a[nc+2|0]=a[qc+2|0]|0;a[nc+3|0]=a[qc+3|0]|0;c[mc>>2]=m;l=c[mc>>2]|0;a[lc+0|0]=a[nc+0|0]|0;a[lc+1|0]=a[nc+1|0]|0;a[lc+2|0]=a[nc+2|0]|0;a[lc+3|0]=a[nc+3|0]|0;c[kc>>2]=l;l=c[kc>>2]|0;c[l+0>>2]=c[lc+0>>2];a[m+4|0]=a[(c[pc>>2]|0)+4|0]&1;c[jc>>2]=pd;c[ic>>2]=c[jc>>2];c[hc>>2]=(c[c[ic>>2]>>2]|0)+16;c[gc>>2]=c[hc>>2];c[fc>>2]=c[gc>>2];c[ec>>2]=c[fc>>2];c[od>>2]=(c[ec>>2]|0)+64;if(!(a[pd+4|0]&1)){c[ud>>2]=c[c[od>>2]>>2];c[vd>>2]=c[(c[od>>2]|0)+4>>2];if((c[vd>>2]|0)<=(c[_c>>2]|0)){c[Xc>>2]=c[vd>>2];Rd=c[Xc>>2]|0;i=n;return Rd|0}m=c[ud>>2]|0;if((c[ud>>2]|0)>=(c[$c>>2]|0)){c[Xc>>2]=m;Rd=c[Xc>>2]|0;i=n;return Rd|0}if((m|0)!=(c[vd>>2]|0)){c[bc>>2]=_c;c[cc>>2]=ud;m=c[bc>>2]|0;l=c[cc>>2]|0;a[ac+0|0]=a[dc+0|0]|0;c[_b>>2]=m;c[$b>>2]=l;l=c[_b>>2]|0;m=c[$b>>2]|0;c[Xb>>2]=ac;c[Yb>>2]=l;c[Zb>>2]=m;c[_c>>2]=c[((c[c[Yb>>2]>>2]|0)<(c[c[Zb>>2]>>2]|0)?c[$b>>2]|0:c[_b>>2]|0)>>2];c[Ub>>2]=$c;c[Vb>>2]=vd;m=c[Ub>>2]|0;l=c[Vb>>2]|0;a[Tb+0|0]=a[Wb+0|0]|0;c[Rb>>2]=m;c[Sb>>2]=l;l=c[Sb>>2]|0;m=c[Rb>>2]|0;c[Ob>>2]=Tb;c[Pb>>2]=l;c[Qb>>2]=m;c[$c>>2]=c[((c[c[Pb>>2]>>2]|0)<(c[c[Qb>>2]>>2]|0)?c[Sb>>2]|0:c[Rb>>2]|0)>>2];break}c[Xc>>2]=c[ud>>2];Rd=c[Xc>>2]|0;i=n;return Rd|0}}}while(0);ud=Wc(c[Yc>>2]|0)|0;c[wd>>2]=ld(ud,c[Zc>>2]|0)|0;if((c[wd>>2]|0)!=0){if((Wc(c[Yc>>2]|0)|0)>=15){h[xd>>3]=2.0}else{h[xd>>3]=1.6}if((c[$c>>2]|0)<2147483647){c[yd>>2]=~~+md((+h[xd>>3]*+h[(c[wd>>2]|0)+24>>3]+ +(c[$c>>2]|0)- +h[(c[wd>>2]|0)+16>>3])/+h[(c[wd>>2]|0)+8>>3]);c[zd>>2]=hd(c[Yc>>2]|0,c[c[wd>>2]>>2]|0,(c[yd>>2]|0)-1|0,c[yd>>2]|0,0,c[bd>>2]|0,c[dd>>2]|0,0)|0;if(a[152]&1){c[Xc>>2]=0;Rd=c[Xc>>2]|0;i=n;return Rd|0}if((c[zd>>2]|0)>=(c[yd>>2]|0)){if((c[od>>2]|0)!=0){c[La>>2]=c[od>>2];c[Ma>>2]=$c;yd=c[La>>2]|0;La=c[Ma>>2]|0;a[Ka+0|0]=a[Na+0|0]|0;c[Ha>>2]=yd;c[Ja>>2]=La;La=c[Ha>>2]|0;yd=c[Ja>>2]|0;c[Ea>>2]=Ka;c[Fa>>2]=La;c[Ga>>2]=yd;c[c[od>>2]>>2]=c[((c[c[Fa>>2]>>2]|0)<(c[c[Ga>>2]>>2]|0)?c[Ja>>2]|0:c[Ha>>2]|0)>>2]}c[Xc>>2]=c[$c>>2];Rd=c[Xc>>2]|0;i=n;return Rd|0}}if((c[_c>>2]|0)>-2147483647){c[Ad>>2]=~~+md((-+h[xd>>3]*+h[(c[wd>>2]|0)+24>>3]+ +(c[_c>>2]|0)- +h[(c[wd>>2]|0)+16>>3])/+h[(c[wd>>2]|0)+8>>3]);c[Bd>>2]=hd(c[Yc>>2]|0,c[c[wd>>2]>>2]|0,c[Ad>>2]|0,(c[Ad>>2]|0)+1|0,0,c[bd>>2]|0,c[dd>>2]|0,0)|0;if(a[152]&1){c[Xc>>2]=0;Rd=c[Xc>>2]|0;i=n;return Rd|0}if((c[Bd>>2]|0)<=(c[Ad>>2]|0)){if((c[od>>2]|0)!=0){c[na>>2]=(c[od>>2]|0)+4;c[oa>>2]=_c;Ad=c[na>>2]|0;na=c[oa>>2]|0;a[ma+0|0]=a[pa+0|0]|0;c[ka>>2]=Ad;c[la>>2]=na;na=c[la>>2]|0;Ad=c[ka>>2]|0;c[ha>>2]=ma;c[ia>>2]=na;c[ja>>2]=Ad;c[(c[od>>2]|0)+4>>2]=c[((c[c[ia>>2]>>2]|0)<(c[c[ja>>2]>>2]|0)?c[la>>2]|0:c[ka>>2]|0)>>2]}c[Xc>>2]=c[_c>>2];Rd=c[Xc>>2]|0;i=n;return Rd|0}}}c[W>>2]=Cd;c[V>>2]=c[W>>2];c[R>>2]=c[V>>2];V=c[R>>2]|0;c[Q>>2]=V;c[r>>2]=t;c[s>>2]=-1;Q=c[s>>2]|0;c[p>>2]=c[r>>2];c[q>>2]=Q;c[c[p>>2]>>2]=0;c[S>>2]=c[t>>2];c[u>>2]=S;c[V>>2]=0;c[x>>2]=z;c[y>>2]=-1;S=c[y>>2]|0;c[v>>2]=c[x>>2];c[w>>2]=S;c[c[v>>2]>>2]=0;c[T>>2]=c[z>>2];c[A>>2]=T;c[V+4>>2]=0;c[D>>2]=F;c[E>>2]=-1;T=c[E>>2]|0;c[B>>2]=c[D>>2];c[C>>2]=T;c[c[B>>2]>>2]=0;c[U>>2]=c[F>>2];c[G>>2]=U;c[O>>2]=V+8;c[P>>2]=0;V=c[P>>2]|0;c[M>>2]=c[O>>2];c[N>>2]=V;V=c[M>>2]|0;c[L>>2]=N;N=c[c[L>>2]>>2]|0;c[J>>2]=V;c[K>>2]=N;N=c[J>>2]|0;c[I>>2]=N;c[H>>2]=K;c[N>>2]=c[c[H>>2]>>2];H=Dd+3e3|0;N=Dd;do{Uc(N);N=N+2|0}while((N|0)!=(H|0));c[Ed>>2]=Te(c[Yc>>2]|0,Dd)|0;c[Fd>>2]=Dd;while(1){if(!((c[Fd>>2]|0)>>>0<(Dd+(c[Ed>>2]<<1)|0)>>>0)){break}H=c[Yc>>2]|0;N=c[Fd>>2]|0;b[Hd+0>>1]=b[N+0>>1]|0;N=(c[dd>>2]|0)+12|0;b[o+0>>1]=b[Hd+0>>1]|0;cd(Gd,H,o,N);c[fa>>2]=Cd;c[ga>>2]=Gd;N=c[fa>>2]|0;H=c[N+4>>2]|0;c[ea>>2]=N;c[da>>2]=(c[ea>>2]|0)+8;c[ca>>2]=c[da>>2];if((H|0)!=(c[c[ca>>2]>>2]|0)){c[ba>>2]=N;c[aa>>2]=(c[ba>>2]|0)+8;c[$>>2]=c[aa>>2];H=c[$>>2]|0;c[X>>2]=c[N+4>>2];K=c[X>>2]|0;I=c[ga>>2]|0;c[Y>>2]=H;c[Z>>2]=K;c[_>>2]=I;I=c[Z>>2]|0;if((I|0)!=0){dp(I|0,c[_>>2]|0,272)|0}I=N+4|0;c[I>>2]=(c[I>>2]|0)+272}else{Vd(N,c[ga>>2]|0)}c[Fd>>2]=(c[Fd>>2]|0)+2}c[wa>>2]=Cd;Fd=c[wa>>2]|0;wa=c[Fd>>2]|0;c[ua>>2]=Fd;c[va>>2]=wa;wa=c[va>>2]|0;c[sa>>2]=Id;c[ta>>2]=wa;wa=c[ta>>2]|0;c[qa>>2]=c[sa>>2];c[ra>>2]=wa;c[c[qa>>2]>>2]=c[ra>>2];c[Da>>2]=Cd;ra=c[Da>>2]|0;Da=c[ra+4>>2]|0;c[Ba>>2]=ra;c[Ca>>2]=Da;Da=c[Ca>>2]|0;c[za>>2]=Jd;c[Aa>>2]=Da;Da=c[Aa>>2]|0;c[xa>>2]=c[za>>2];c[ya>>2]=Da;c[c[xa>>2]>>2]=c[ya>>2];a[Ya+0|0]=a[Id+0|0]|0;a[Ya+1|0]=a[Id+1|0]|0;a[Ya+2|0]=a[Id+2|0]|0;a[Ya+3|0]=a[Id+3|0]|0;a[Xa+0|0]=a[Jd+0|0]|0;a[Xa+1|0]=a[Jd+1|0]|0;a[Xa+2|0]=a[Jd+2|0]|0;a[Xa+3|0]=a[Jd+3|0]|0;c[Wa>>2]=Ya;Ya=c[c[Wa>>2]>>2]|0;c[Oa>>2]=Xa;Xa=c[c[Oa>>2]>>2]|0;c[Ta>>2]=Ya;c[Ua>>2]=Xa;Xa=c[Ta>>2]|0;Ta=c[Ua>>2]|0;a[Sa+0|0]=a[Va+0|0]|0;c[Pa>>2]=Xa;c[Ra>>2]=Ta;Od(c[Pa>>2]|0,c[Ra>>2]|0,Sa);a[Kd]=0;c[Ld>>2]=-2147483647;c[Md>>2]=c[_c>>2];c[db>>2]=Cd;Sa=c[db>>2]|0;db=c[Sa>>2]|0;c[bb>>2]=Sa;c[cb>>2]=db;db=c[cb>>2]|0;c[$a>>2]=Nd;c[ab>>2]=db;db=c[ab>>2]|0;c[Za>>2]=c[$a>>2];c[_a>>2]=db;c[c[Za>>2]>>2]=c[_a>>2];while(1){c[kb>>2]=Cd;_a=c[kb>>2]|0;Za=c[_a+4>>2]|0;c[ib>>2]=_a;c[jb>>2]=Za;Za=c[jb>>2]|0;c[gb>>2]=Pd;c[hb>>2]=Za;Za=c[hb>>2]|0;c[eb>>2]=c[gb>>2];c[fb>>2]=Za;c[c[eb>>2]>>2]=c[fb>>2];c[pb>>2]=Nd;c[qb>>2]=Pd;Za=c[qb>>2]|0;c[nb>>2]=c[pb>>2];c[ob>>2]=Za;c[mb>>2]=c[nb>>2];Za=c[c[mb>>2]>>2]|0;c[lb>>2]=c[ob>>2];if(!((Za|0)==(c[c[lb>>2]>>2]|0)^1)){Sd=73;break}if(a[Kd]&1){c[rb>>2]=Nd;c[Qd>>2]=0-(hd(c[c[rb>>2]>>2]|0,(c[Zc>>2]|0)-1|0,0-(c[Md>>2]|0)-1|0,0-(c[Md>>2]|0)|0,0,(c[bd>>2]|0)+12|0,(c[dd>>2]|0)+12|0,(c[fd>>2]|0)-1|0)|0);if(a[152]&1){Sd=54;break}if(((c[Qd>>2]|0)>(c[Md>>2]|0)?(c[Qd>>2]|0)<(c[$c>>2]|0):0)?(c[Bb>>2]=Nd,c[Qd>>2]=0-(hd(c[c[Bb>>2]>>2]|0,(c[Zc>>2]|0)-1|0,0-(c[$c>>2]|0)|0,0-(c[Qd>>2]|0)|0,0,(c[bd>>2]|0)+12|0,(c[dd>>2]|0)+12|0,(c[fd>>2]|0)-1|0)|0),a[152]&1):0){Sd=58;break}}else{c[Db>>2]=Nd;c[Qd>>2]=0-(hd(c[c[Db>>2]>>2]|0,(c[Zc>>2]|0)-1|0,0-(c[$c>>2]|0)|0,0-(c[Md>>2]|0)|0,0,(c[bd>>2]|0)+12|0,(c[dd>>2]|0)+12|0,(c[fd>>2]|0)-1|0)|0);if(a[152]&1){Sd=60;break}}if((c[Qd>>2]|0)>=(c[$c>>2]|0)){Sd=62;break}if((c[Qd>>2]|0)>(c[Ld>>2]|0)){if((c[Qd>>2]|0)>(c[Md>>2]|0)){c[Md>>2]=c[Qd>>2]}if((c[Qd>>2]|0)>(c[_c>>2]|0)?(a[Kd]=1,(c[ad>>2]|0)!=0):0){Za=c[ad>>2]|0;c[Eb>>2]=Nd;_a=(c[c[Eb>>2]>>2]|0)+268|0;b[Za+0>>1]=b[_a+0>>1]|0}c[Ld>>2]=c[Qd>>2]}c[Cb>>2]=Nd;_a=c[Cb>>2]|0;c[_a>>2]=(c[_a>>2]|0)+272}if((Sd|0)==54){c[Xc>>2]=0;c[kd>>2]=1}else if((Sd|0)==58){c[Xc>>2]=0;c[kd>>2]=1}else if((Sd|0)==60){c[Xc>>2]=0;c[kd>>2]=1}else if((Sd|0)==62){if((c[od>>2]|0)!=0){c[Lb>>2]=c[od>>2];c[Mb>>2]=Qd;Cb=c[Lb>>2]|0;Lb=c[Mb>>2]|0;a[Kb+0|0]=a[Nb+0|0]|0;c[Ib>>2]=Cb;c[Jb>>2]=Lb;Lb=c[Ib>>2]|0;Cb=c[Jb>>2]|0;c[Fb>>2]=Kb;c[Gb>>2]=Lb;c[Hb>>2]=Cb;c[c[od>>2]>>2]=c[((c[c[Gb>>2]>>2]|0)<(c[c[Hb>>2]>>2]|0)?c[Jb>>2]|0:c[Ib>>2]|0)>>2]}c[Xc>>2]=c[Qd>>2];c[kd>>2]=1}else if((Sd|0)==73){do{if((c[od>>2]|0)!=0){if((c[Ld>>2]|0)>(c[_c>>2]|0)){Sd=c[Ld>>2]|0;c[(c[od>>2]|0)+4>>2]=Sd;c[c[od>>2]>>2]=Sd;break}else{c[yb>>2]=(c[od>>2]|0)+4;c[zb>>2]=Ld;Sd=c[yb>>2]|0;Qd=c[zb>>2]|0;a[xb+0|0]=a[Ab+0|0]|0;c[vb>>2]=Sd;c[wb>>2]=Qd;Qd=c[wb>>2]|0;Sd=c[vb>>2]|0;c[sb>>2]=xb;c[tb>>2]=Qd;c[ub>>2]=Sd;c[(c[od>>2]|0)+4>>2]=c[((c[c[tb>>2]>>2]|0)<(c[c[ub>>2]>>2]|0)?c[wb>>2]|0:c[vb>>2]|0)>>2];break}}}while(0);c[Xc>>2]=c[Ld>>2];c[kd>>2]=1}nd(Cd);Rd=c[Xc>>2]|0;i=n;return Rd|0}function id(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+16|0;g=f+12|0;h=f+8|0;j=f+4|0;k=f;c[g>>2]=a;c[h>>2]=b;c[j>>2]=d;c[k>>2]=e;ue(c[g>>2]|0,c[h>>2]|0,c[j>>2]|0,c[k>>2]|0);i=f;return}function jd(a){a=a|0;var b=0,d=0;b=i;i=i+16|0;d=b;c[d>>2]=a;se(c[d>>2]|0);i=b;return}function kd(a){a=a|0;Na(a|0)|0;Fa()}function ld(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0;d=i;i=i+16|0;e=d+12|0;f=d+8|0;g=d+4|0;h=d;c[f>>2]=a;c[g>>2]=b;if(!((c[g>>2]|0)<3|(c[g>>2]|0)>10)?(c[f>>2]|0)<=24:0){c[h>>2]=304+((c[f>>2]|0)*320|0)+((c[g>>2]|0)-3<<5);if((c[c[h>>2]>>2]|0)==0){c[e>>2]=0;j=c[e>>2]|0;i=d;return j|0}else{c[e>>2]=c[h>>2];j=c[e>>2]|0;i=d;return j|0}}c[e>>2]=0;j=c[e>>2]|0;i=d;return j|0}function md(a){a=+a;var b=0,c=0,d=0,e=0.0;b=i;i=i+16|0;c=b+8|0;d=b;h[d>>3]=a;a=+h[d>>3];if(+h[d>>3]<0.0){h[c>>3]=+ea(+(a-.5));e=+h[c>>3];i=b;return+e}else{h[c>>3]=+T(+(a+.5));e=+h[c>>3];i=b;return+e}return 0.0}function nd(a){a=a|0;var b=0,d=0;b=i;i=i+16|0;d=b;c[d>>2]=a;qe(c[d>>2]|0);i=b;return}function od(d,e,f,g,j){d=d|0;e=e|0;f=f|0;g=g|0;j=j|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0.0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0;l=i;i=i+192|0;m=l+40|0;n=l+164|0;o=l+160|0;p=l+156|0;q=l+152|0;r=l+148|0;s=l+144|0;t=l+140|0;u=l+32|0;v=l+136|0;w=l+24|0;x=l+132|0;y=l+128|0;z=l+179|0;A=l+178|0;B=l+124|0;C=l+120|0;D=l+116|0;E=l+16|0;F=l+112|0;G=l+8|0;H=l+108|0;I=l+104|0;J=l+177|0;K=l+176|0;L=l+100|0;M=l+96|0;N=l+92|0;O=l+88|0;P=l+84|0;Q=l+80|0;R=l+172|0;S=l+76|0;T=l+72|0;U=l+68|0;V=l+64|0;W=l+175|0;X=l+60|0;Y=l+174|0;Z=l+170|0;_=l;$=l+168|0;c[N>>2]=e;c[O>>2]=f;c[P>>2]=g;c[Q>>2]=j;b[R+0>>1]=b[48>>1]|0;c[T>>2]=Qa()|0;c[36]=(c[T>>2]|0)+((c[Q>>2]|0)*1e3|0);c[32]=(c[16]|0)+1e4;a[152]=0;a[136]=0;Q=c[O>>2]|0;j=Q*12|0;g=Io(Q>>>0>357913941|j>>>0>4294967291?-1:j+4|0)|0;c[g>>2]=Q;j=g+4|0;if((Q|0)!=0){g=j+(Q*12|0)|0;Q=j;do{c[L>>2]=Q;c[M>>2]=W;f=c[M>>2]|0;c[H>>2]=c[L>>2];c[I>>2]=f;f=c[H>>2]|0;a[G+0|0]=a[K+0|0]|0;c[F>>2]=J;e=c[F>>2]|0;a[E+0|0]=a[G+0|0]|0;c[D>>2]=e;Md(f,J);Q=Q+12|0}while((Q|0)!=(g|0))}c[U>>2]=j;c[X>>2]=2;while(1){if((c[X>>2]|0)>(c[O>>2]|0)){break}j=c[O>>2]|0;g=j*12|0;Q=Io(j>>>0>357913941|g>>>0>4294967291?-1:g+4|0)|0;c[Q>>2]=j;g=Q+4|0;if((j|0)!=0){Q=g+(j*12|0)|0;j=g;do{c[B>>2]=j;c[C>>2]=Y;J=c[C>>2]|0;c[x>>2]=c[B>>2];c[y>>2]=J;J=c[x>>2]|0;a[w+0|0]=a[A+0|0]|0;c[v>>2]=z;D=c[v>>2]|0;a[u+0|0]=a[w+0|0]|0;c[t>>2]=D;Md(J,z);j=j+12|0}while((j|0)!=(Q|0))}c[V>>2]=g;Uc(Z);c[S>>2]=hd(c[N>>2]|0,c[X>>2]|0,-2147483647,2147483647,Z,c[V>>2]|0,c[U>>2]|0,8)|0;if(a[152]&1){break}Q=Qa()|0;h[_>>3]=+(Q-(c[T>>2]|0)|0)/1.0e6;if(!(a[72]&1)){Q=c[X>>2]|0;aa=+h[_>>3];j=Fe(Z)|0;J=c[S>>2]|0;c[m>>2]=Q;Q=m+4|0;h[k>>3]=aa;c[Q>>2]=c[k>>2];c[Q+4>>2]=c[k+4>>2];c[m+12>>2]=j;c[m+16>>2]=J;ib(160,m|0)|0}J=c[U>>2]|0;if((J|0)!=0){j=J+ -4|0;Q=J+((c[j>>2]|0)*12|0)|0;if((J|0)!=(Q|0)){D=Q;do{D=D+ -12|0;pd(D)}while((D|0)!=(J|0))}Ko(j)}c[U>>2]=c[V>>2];b[R+0>>1]=b[Z+0>>1]|0;a[136]=1;if(+h[_>>3]*1.0e3>+(c[P>>2]|0)){break}c[X>>2]=(c[X>>2]|0)+1}X=c[U>>2]|0;if((X|0)!=0){U=X+ -4|0;P=X+((c[U>>2]|0)*12|0)|0;if((X|0)!=(P|0)){_=P;do{_=_+ -12|0;pd(_)}while((_|0)!=(X|0))}Ko(U)}if(!(a[152]&1)){ba=c[S>>2]|0;ca=ba&65535;b[$>>1]=ca;c[q>>2]=d;c[r>>2]=R;c[s>>2]=$;da=c[q>>2]|0;ea=c[s>>2]|0;fa=c[r>>2]|0;c[n>>2]=da;c[o>>2]=fa;c[p>>2]=ea;ga=c[n>>2]|0;ha=c[o>>2]|0;b[ga+0>>1]=b[ha+0>>1]|0;ia=ga+2|0;ja=c[p>>2]|0;ka=b[ja>>1]|0;b[ia>>1]=ka;i=l;return}U=c[V>>2]|0;if((U|0)==0){ba=c[S>>2]|0;ca=ba&65535;b[$>>1]=ca;c[q>>2]=d;c[r>>2]=R;c[s>>2]=$;da=c[q>>2]|0;ea=c[s>>2]|0;fa=c[r>>2]|0;c[n>>2]=da;c[o>>2]=fa;c[p>>2]=ea;ga=c[n>>2]|0;ha=c[o>>2]|0;b[ga+0>>1]=b[ha+0>>1]|0;ia=ga+2|0;ja=c[p>>2]|0;ka=b[ja>>1]|0;b[ia>>1]=ka;i=l;return}V=U+ -4|0;X=U+((c[V>>2]|0)*12|0)|0;if((U|0)!=(X|0)){_=X;do{_=_+ -12|0;pd(_)}while((_|0)!=(U|0))}Ko(V);ba=c[S>>2]|0;ca=ba&65535;b[$>>1]=ca;c[q>>2]=d;c[r>>2]=R;c[s>>2]=$;da=c[q>>2]|0;ea=c[s>>2]|0;fa=c[r>>2]|0;c[n>>2]=da;c[o>>2]=fa;c[p>>2]=ea;ga=c[n>>2]|0;ha=c[o>>2]|0;b[ga+0>>1]=b[ha+0>>1]|0;ia=ga+2|0;ja=c[p>>2]|0;ka=b[ja>>1]|0;b[ia>>1]=ka;i=l;return}function pd(a){a=a|0;var b=0,d=0;b=i;i=i+16|0;d=b;c[d>>2]=a;me(c[d>>2]|0);i=b;return}function qd(e,f,g,h){e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0;j=i;i=i+2832|0;k=j+2760|0;l=j+748|0;m=j+744|0;n=j+740|0;o=j+736|0;p=j+732|0;q=j+728|0;r=j+724|0;s=j+720|0;t=j+716|0;u=j+712|0;v=j+708|0;w=j+704|0;x=j+700|0;y=j+696|0;z=j+692|0;A=j+688|0;B=j+684|0;C=j+680|0;D=j+676|0;E=j+24|0;F=j+672|0;G=j+16|0;H=j+668|0;I=j+664|0;J=j+660|0;K=j+656|0;L=j+652|0;M=j+648|0;N=j+644|0;O=j+640|0;P=j+636|0;Q=j+632|0;R=j+628|0;S=j+624|0;T=j+620|0;U=j+8|0;V=j+616|0;W=j;X=j+612|0;Y=j+608|0;Z=j+604|0;_=j+600|0;$=j+596|0;aa=j+592|0;ba=j+588|0;ca=j+584|0;da=j+2762|0;ea=j+580|0;fa=j+576|0;ga=j+760|0;ha=j+572|0;ia=j+568|0;ja=j+754|0;ka=j+304|0;la=j+296|0;ma=j+32|0;na=j+752|0;oa=j+28|0;c[$>>2]=e;c[aa>>2]=f;c[ba>>2]=g;c[ca>>2]=h;ed(da,c[$>>2]|0);c[X>>2]=c[ca>>2];c[Y>>2]=da;Kd(Z,c[X>>2]|0,c[Y>>2]|0);a[W+0|0]=a[Z+0|0]|0;a[W+1|0]=a[Z+1|0]|0;a[W+2|0]=a[Z+2|0]|0;a[W+3|0]=a[Z+3|0]|0;c[V>>2]=ea;Z=c[V>>2]|0;a[U+0|0]=a[W+0|0]|0;a[U+1|0]=a[W+1|0]|0;a[U+2|0]=a[W+2|0]|0;a[U+3|0]=a[W+3|0]|0;c[T>>2]=Z;Z=c[T>>2]|0;c[Z+0>>2]=c[U+0>>2];c[R>>2]=c[ca>>2];c[Q>>2]=c[R>>2];c[P>>2]=c[Q>>2];c[O>>2]=(c[P>>2]|0)+4;c[N>>2]=c[O>>2];c[M>>2]=c[N>>2];c[L>>2]=c[M>>2];M=c[L>>2]|0;c[J>>2]=S;c[K>>2]=M;M=c[K>>2]|0;c[H>>2]=c[J>>2];c[I>>2]=M;c[c[H>>2]>>2]=c[I>>2];a[G+0|0]=a[S+0|0]|0;a[G+1|0]=a[S+1|0]|0;a[G+2|0]=a[S+2|0]|0;a[G+3|0]=a[S+3|0]|0;c[F>>2]=fa;S=c[F>>2]|0;a[E+0|0]=a[G+0|0]|0;a[E+1|0]=a[G+1|0]|0;a[E+2|0]=a[G+2|0]|0;a[E+3|0]=a[G+3|0]|0;c[D>>2]=S;S=c[D>>2]|0;c[S+0>>2]=c[E+0>>2];c[B>>2]=ea;c[C>>2]=fa;fa=c[C>>2]|0;c[z>>2]=c[B>>2];c[A>>2]=fa;fa=c[A>>2]|0;c[x>>2]=c[z>>2];c[y>>2]=fa;if((c[c[x>>2]>>2]|0)==(c[c[y>>2]>>2]|0)^1){if(rd(c[$>>2]|0)|0){c[w>>2]=ea;c[v>>2]=c[w>>2];c[u>>2]=(c[c[v>>2]>>2]|0)+16;c[t>>2]=c[u>>2];c[s>>2]=c[t>>2];c[r>>2]=c[s>>2];pa=c[(c[r>>2]|0)+64>>2]|0}else{c[q>>2]=ea;c[p>>2]=c[q>>2];c[o>>2]=(c[c[p>>2]>>2]|0)+16;c[n>>2]=c[o>>2];c[m>>2]=c[n>>2];c[l>>2]=c[m>>2];pa=0-(c[(c[l>>2]|0)+64>>2]|0)|0}c[_>>2]=pa;qa=c[_>>2]|0;i=j;return qa|0}pa=(c[16]|0)+1|0;c[16]=pa;do{if((pa|0)>=(c[32]|0)){l=c[36]|0;if((l-(Qa()|0)|0)<0){cc(vb(1)|0,200,0)}else{c[32]=(c[32]|0)+1e4;break}}}while(0);pa=ga+2e3|0;l=ga;do{Uc(l);l=l+2|0}while((l|0)!=(pa|0));c[ha>>2]=Te(c[$>>2]|0,ga)|0;if(sd(ga)|0){c[ia>>2]=td(c[$>>2]|0)|0;pa=c[ia>>2]|0;if((c[ia>>2]|0)<0){c[_>>2]=pa;qa=c[_>>2]|0;i=j;return qa|0}if((pa|0)==0){pa=c[$>>2]|0;b[ja+0>>1]=b[ga+0>>1]|0;b[k+0>>1]=b[ja+0>>1]|0;dd(ka,pa,k);c[ha>>2]=Te(ka,ga)|0;if(sd(ga)|0){c[_>>2]=0;qa=c[_>>2]|0;i=j;return qa|0}else{ka=13264+((ud(ga)|0)<<2)|0;c[_>>2]=0-(c[(d[ka]|d[ka+1|0]<<8|d[ka+2|0]<<16|d[ka+3|0]<<24)+4>>2]|0);qa=c[_>>2]|0;i=j;return qa|0}}}c[la>>2]=ga;while(1){if(!((c[la>>2]|0)>>>0<(ga+(c[ha>>2]<<1)|0)>>>0)){break}ka=c[$>>2]|0;pa=c[la>>2]|0;b[na+0>>1]=b[pa+0>>1]|0;b[k+0>>1]=b[na+0>>1]|0;dd(ma,ka,k);c[oa>>2]=0-(qd(ma,0-(c[ba>>2]|0)|0,0-(c[aa>>2]|0)|0,(c[ca>>2]|0)+12|0)|0);if((c[oa>>2]|0)>(c[aa>>2]|0)){c[aa>>2]=c[oa>>2];if((c[aa>>2]|0)>0){break}if((c[aa>>2]|0)>=(c[ba>>2]|0)){break}}c[la>>2]=(c[la>>2]|0)+2}la=rd(c[$>>2]|0)|0;$=c[aa>>2]|0;c[(vd(c[ca>>2]|0,da)|0)>>2]=la?$:0-$|0;c[_>>2]=c[aa>>2];qa=c[_>>2]|0;i=j;return qa|0}function rd(a){a=a|0;var b=0,d=0;b=i;i=i+16|0;d=b;c[d>>2]=a;i=b;return(c[(c[d>>2]|0)+196>>2]&1|0)==0|0}function sd(a){a=a|0;var b=0,d=0;b=i;i=i+16|0;d=b;c[d>>2]=a;i=b;return(e[c[d>>2]>>1]|0|0)==65535|0}function td(a){a=a|0;var b=0,d=0,e=0,f=0,g=0;b=i;i=i+16|0;d=b+8|0;e=b+4|0;f=b;c[d>>2]=a;a=c[d>>2]|0;c[e>>2]=ke(a)|0;c[f>>2]=le(a)|0;if(rd(a)|0){g=(c[e>>2]|0)-(c[f>>2]|0)|0;i=b;return g|0}else{g=(c[f>>2]|0)-(c[e>>2]|0)|0;i=b;return g|0}return 0}function ud(a){a=a|0;var b=0,d=0;b=i;i=i+16|0;d=b;c[d>>2]=a;i=b;return(e[c[d>>2]>>1]|0)>>11|0}function vd(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0,Ja=0,Ka=0,La=0,Ma=0,Na=0,Oa=0,Pa=0,Qa=0,Ra=0,Sa=0,Ta=0,Ua=0,Va=0,Wa=0,Xa=0,Ya=0,Za=0,_a=0,$a=0,ab=0,bb=0,cb=0,db=0,eb=0,fb=0,gb=0,hb=0,ib=0,jb=0,kb=0,lb=0,mb=0,nb=0,ob=0,pb=0,qb=0,rb=0,sb=0,tb=0,ub=0,vb=0,wb=0,xb=0,yb=0;e=i;i=i+560|0;f=e+540|0;g=e+536|0;h=e+532|0;j=e+528|0;k=e+524|0;l=e+520|0;m=e+516|0;n=e+512|0;o=e+508|0;p=e+504|0;q=e+500|0;r=e+496|0;s=e+492|0;t=e+488|0;u=e+484|0;v=e+480|0;w=e+64|0;x=e+476|0;y=e+472|0;z=e+547|0;A=e+468|0;B=e+464|0;C=e+56|0;D=e+460|0;E=e+456|0;F=e+546|0;G=e+452|0;H=e+448|0;I=e+444|0;J=e+440|0;K=e+436|0;L=e+432|0;M=e+428|0;N=e+424|0;O=e+420|0;P=e+416|0;Q=e+412|0;R=e+408|0;S=e+404|0;T=e+400|0;U=e+396|0;V=e+392|0;W=e+388|0;X=e+384|0;Y=e+380|0;Z=e+376|0;_=e+372|0;$=e+368|0;aa=e+364|0;ba=e+48|0;ca=e+360|0;da=e+356|0;ea=e+545|0;fa=e+352|0;ga=e+348|0;ha=e+40|0;ia=e+344|0;ja=e+340|0;ka=e+544|0;la=e+336|0;ma=e+332|0;na=e+328|0;oa=e+324|0;pa=e+320|0;qa=e+316|0;ra=e+312|0;sa=e+308|0;ta=e+304|0;ua=e+300|0;va=e+296|0;wa=e+292|0;xa=e+288|0;ya=e+284|0;za=e+280|0;Aa=e+276|0;Ba=e+272|0;Ca=e+268|0;Da=e+264|0;Ea=e+260|0;Fa=e+256|0;Ga=e+252|0;Ha=e+248|0;Ia=e+244|0;Ja=e+240|0;Ka=e+236|0;La=e+232|0;Ma=e+228|0;Na=e+224|0;Oa=e+220|0;Pa=e+216|0;Qa=e+212|0;Ra=e+32|0;Sa=e+208|0;Ta=e+204|0;Ua=e+200|0;Va=e+192|0;Wa=e+24|0;Xa=e+188|0;Ya=e+184|0;Za=e+16|0;_a=e+180|0;$a=e+176|0;ab=e+168|0;bb=e+8|0;cb=e+164|0;db=e;eb=e+160|0;fb=e+156|0;gb=e+152|0;hb=e+148|0;ib=e+144|0;jb=e+136|0;kb=e+128|0;lb=e+124|0;mb=e+120|0;nb=e+116|0;ob=e+112|0;pb=e+108|0;qb=e+104|0;rb=e+100|0;sb=e+96|0;tb=e+84|0;ub=e+80|0;vb=e+68|0;c[nb>>2]=b;c[ob>>2]=d;d=c[nb>>2]|0;c[qb>>2]=Dd(d,pb,c[ob>>2]|0)|0;c[rb>>2]=c[c[qb>>2]>>2];nb=c[c[qb>>2]>>2]|0;c[kb>>2]=mb;c[lb>>2]=-1;b=c[lb>>2]|0;c[jb>>2]=c[kb>>2];c[e+132>>2]=b;c[c[jb>>2]>>2]=0;c[sb>>2]=c[mb>>2];c[e+140>>2]=sb;if((nb|0)!=0){wb=c[rb>>2]|0;xb=wb+16|0;yb=xb+64|0;i=e;return yb|0}Ed(vb,d,c[ob>>2]|0);c[ib>>2]=vb;ob=c[ib>>2]|0;c[gb>>2]=ub;c[hb>>2]=ob;ob=c[hb>>2]|0;c[eb>>2]=c[gb>>2];c[fb>>2]=ob;c[c[eb>>2]>>2]=c[fb>>2];a[db+0|0]=a[ub+0|0]|0;a[db+1|0]=a[ub+1|0]|0;a[db+2|0]=a[ub+2|0]|0;a[db+3|0]=a[ub+3|0]|0;c[cb>>2]=tb;ub=c[cb>>2]|0;a[bb+0|0]=a[db+0|0]|0;a[bb+1|0]=a[db+1|0]|0;a[bb+2|0]=a[db+2|0]|0;a[bb+3|0]=a[db+3|0]|0;c[$a>>2]=ub;ub=c[$a>>2]|0;c[_a>>2]=bb;c[Fa>>2]=c[c[_a>>2]>>2];_a=c[Fa>>2]|0;c[Ea>>2]=_a;c[Da>>2]=c[Ea>>2];c[Ga>>2]=c[c[Da>>2]>>2];c[Ca>>2]=_a;c[Ba>>2]=c[Ca>>2];c[c[Ba>>2]>>2]=0;Ba=c[Ga>>2]|0;c[Ha>>2]=bb;c[Ka>>2]=c[c[Ha>>2]>>2];c[Ja>>2]=c[Ka>>2];c[Ia>>2]=c[Ja>>2];c[La>>2]=(c[Ia>>2]|0)+4;Ia=c[La>>2]|0;c[ab+0>>2]=c[Ia+0>>2];c[ab+4>>2]=c[Ia+4>>2];a[Za+0|0]=a[ab+0|0]|0;a[Za+1|0]=a[ab+1|0]|0;a[Za+2|0]=a[ab+2|0]|0;a[Za+3|0]=a[ab+3|0]|0;a[Za+4|0]=a[ab+4|0]|0;a[Za+5|0]=a[ab+5|0]|0;a[Za+6|0]=a[ab+6|0]|0;a[Za+7|0]=a[ab+7|0]|0;c[Xa>>2]=ub;c[Ya>>2]=Ba;Ba=c[Xa>>2]|0;Xa=c[Ya>>2]|0;a[Wa+0|0]=a[Za+0|0]|0;a[Wa+1|0]=a[Za+1|0]|0;a[Wa+2|0]=a[Za+2|0]|0;a[Wa+3|0]=a[Za+3|0]|0;a[Wa+4|0]=a[Za+4|0]|0;a[Wa+5|0]=a[Za+5|0]|0;a[Wa+6|0]=a[Za+6|0]|0;a[Wa+7|0]=a[Za+7|0]|0;c[Ta>>2]=Ba;c[Ua>>2]=Xa;Xa=c[Ta>>2]|0;c[Sa>>2]=Ua;Ua=c[c[Sa>>2]>>2]|0;c[Ma>>2]=Wa;Wa=c[Ma>>2]|0;c[Va+0>>2]=c[Wa+0>>2];c[Va+4>>2]=c[Wa+4>>2];a[Ra+0|0]=a[Va+0|0]|0;a[Ra+1|0]=a[Va+1|0]|0;a[Ra+2|0]=a[Va+2|0]|0;a[Ra+3|0]=a[Va+3|0]|0;a[Ra+4|0]=a[Va+4|0]|0;a[Ra+5|0]=a[Va+5|0]|0;a[Ra+6|0]=a[Va+6|0]|0;a[Ra+7|0]=a[Va+7|0]|0;c[Pa>>2]=Xa;c[Qa>>2]=Ua;Ua=c[Pa>>2]|0;c[Oa>>2]=Qa;c[Ua>>2]=c[c[Oa>>2]>>2];Oa=Ua+4|0;c[Na>>2]=Ra;Ra=c[Na>>2]|0;c[Oa+0>>2]=c[Ra+0>>2];c[Oa+4>>2]=c[Ra+4>>2];c[V>>2]=vb;c[U>>2]=c[V>>2];c[R>>2]=c[U>>2];c[S>>2]=0;U=c[R>>2]|0;c[Q>>2]=U;c[P>>2]=c[Q>>2];c[T>>2]=c[c[P>>2]>>2];P=c[S>>2]|0;c[s>>2]=U;c[r>>2]=c[s>>2];c[c[r>>2]>>2]=P;if((c[T>>2]|0)!=0){c[q>>2]=U;c[p>>2]=c[q>>2];q=c[T>>2]|0;c[N>>2]=(c[p>>2]|0)+4;c[O>>2]=q;q=c[N>>2]|0;if(a[q+5|0]&1){N=c[q>>2]|0;c[M>>2]=(c[O>>2]|0)+80;p=c[M>>2]|0;c[D>>2]=N;c[E>>2]=p;p=c[D>>2]|0;D=c[E>>2]|0;a[C+0|0]=a[F+0|0]|0;c[A>>2]=p;c[B>>2]=D}if(a[q+4|0]&1){D=c[q>>2]|0;c[t>>2]=(c[O>>2]|0)+16;B=c[t>>2]|0;c[x>>2]=D;c[y>>2]=B;B=c[x>>2]|0;x=c[y>>2]|0;a[w+0|0]=a[z+0|0]|0;c[u>>2]=B;c[v>>2]=x}if((c[O>>2]|0)!=0){x=c[O>>2]|0;c[J>>2]=c[q>>2];c[K>>2]=x;c[L>>2]=1;x=c[K>>2]|0;K=c[L>>2]|0;c[G>>2]=c[J>>2];c[H>>2]=x;c[I>>2]=K;Jo(c[H>>2]|0)}}H=c[pb>>2]|0;pb=c[qb>>2]|0;c[o>>2]=tb;c[n>>2]=c[o>>2];c[m>>2]=c[n>>2];Fd(d,H,pb,c[c[m>>2]>>2]|0);c[k>>2]=tb;m=c[k>>2]|0;c[j>>2]=m;c[h>>2]=c[j>>2];c[l>>2]=c[c[h>>2]>>2];c[g>>2]=m;c[f>>2]=c[g>>2];c[c[f>>2]>>2]=0;c[rb>>2]=c[l>>2];c[Aa>>2]=tb;c[za>>2]=c[Aa>>2];c[wa>>2]=c[za>>2];c[xa>>2]=0;za=c[wa>>2]|0;c[va>>2]=za;c[ua>>2]=c[va>>2];c[ya>>2]=c[c[ua>>2]>>2];ua=c[xa>>2]|0;c[Z>>2]=za;c[Y>>2]=c[Z>>2];c[c[Y>>2]>>2]=ua;if((c[ya>>2]|0)==0){wb=c[rb>>2]|0;xb=wb+16|0;yb=xb+64|0;i=e;return yb|0}c[X>>2]=za;c[W>>2]=c[X>>2];X=c[ya>>2]|0;c[sa>>2]=(c[W>>2]|0)+4;c[ta>>2]=X;X=c[sa>>2]|0;if(a[X+5|0]&1){sa=c[X>>2]|0;c[ra>>2]=(c[ta>>2]|0)+80;W=c[ra>>2]|0;c[ia>>2]=sa;c[ja>>2]=W;W=c[ia>>2]|0;ia=c[ja>>2]|0;a[ha+0|0]=a[ka+0|0]|0;c[fa>>2]=W;c[ga>>2]=ia}if(a[X+4|0]&1){ia=c[X>>2]|0;c[_>>2]=(c[ta>>2]|0)+16;ga=c[_>>2]|0;c[ca>>2]=ia;c[da>>2]=ga;ga=c[ca>>2]|0;ca=c[da>>2]|0;a[ba+0|0]=a[ea+0|0]|0;c[$>>2]=ga;c[aa>>2]=ca}if((c[ta>>2]|0)==0){wb=c[rb>>2]|0;xb=wb+16|0;yb=xb+64|0;i=e;return yb|0}ca=c[ta>>2]|0;c[oa>>2]=c[X>>2];c[pa>>2]=ca;c[qa>>2]=1;ca=c[pa>>2]|0;pa=c[qa>>2]|0;c[la>>2]=c[oa>>2];c[ma>>2]=ca;c[na>>2]=pa;Jo(c[ma>>2]|0);wb=c[rb>>2]|0;xb=wb+16|0;yb=xb+64|0;i=e;return yb|0}function wd(d,e,f){d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;g=i;i=i+2880|0;h=g+2872|0;j=g+860|0;k=g+856|0;l=g+852|0;m=g+848|0;n=g+844|0;o=g+840|0;p=g+836|0;q=g+8|0;r=g+832|0;s=g;t=g+828|0;u=g+824|0;v=g+2876|0;w=g+2875|0;x=g+820|0;y=g+816|0;z=g+812|0;A=g+808|0;B=g+304|0;C=g+2874|0;D=g+300|0;E=g+296|0;F=g+872|0;G=g+292|0;H=g+868|0;I=g+288|0;J=g+24|0;K=g+866|0;L=g+16|0;M=g+864|0;N=g+12|0;c[z>>2]=e;c[A>>2]=f;f=Qa()|0;c[36]=f+((c[A>>2]|0)*1e6|0);c[32]=(c[16]|0)+1e4;A=B+504|0;f=B;do{c[x>>2]=f;c[y>>2]=C;e=c[y>>2]|0;c[t>>2]=c[x>>2];c[u>>2]=e;e=c[t>>2]|0;a[s+0|0]=a[w+0|0]|0;c[r>>2]=v;O=c[r>>2]|0;a[q+0|0]=a[s+0|0]|0;c[p>>2]=O;Bd(e,v);f=f+12|0}while((f|0)!=(A|0));c[16]=(c[16]|0)+1;c[D>>2]=-2147483647;c[E>>2]=2147483647;A=F+2e3|0;f=F;do{Uc(f);f=f+2|0}while((f|0)!=(A|0));c[G>>2]=Te(c[z>>2]|0,F)|0;Uc(H);c[I>>2]=F;while(1){if(!((c[I>>2]|0)>>>0<(F+(c[G>>2]<<1)|0)>>>0)){break}A=c[z>>2]|0;f=c[I>>2]|0;b[K+0>>1]=b[f+0>>1]|0;b[h+0>>1]=b[K+0>>1]|0;dd(J,A,h);c[L>>2]=0-(qd(J,0-(c[E>>2]|0)|0,0-(c[D>>2]|0)|0,B)|0);if((c[L>>2]|0)>(c[D>>2]|0)){c[D>>2]=c[L>>2];A=c[I>>2]|0;b[H+0>>1]=b[A+0>>1]|0;if((c[D>>2]|0)>0){break}if((c[D>>2]|0)>=(c[E>>2]|0)){break}}c[I>>2]=(c[I>>2]|0)+2}b[M>>1]=c[D>>2];c[m>>2]=d;c[n>>2]=H;c[o>>2]=M;M=c[o>>2]|0;o=c[n>>2]|0;c[j>>2]=c[m>>2];c[k>>2]=o;c[l>>2]=M;M=c[j>>2]|0;j=c[k>>2]|0;b[M+0>>1]=b[j+0>>1]|0;b[M+2>>1]=b[c[l>>2]>>1]|0;c[N>>2]=1;N=B+504|0;do{N=N+ -12|0;xd(N)}while((N|0)!=(B|0));i=g;return}function xd(a){a=a|0;var b=0,d=0;b=i;i=i+16|0;d=b;c[d>>2]=a;ge(c[d>>2]|0);i=b;return}function yd(d,e,f,g,h){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0;j=i;i=i+2560|0;k=j+2488|0;l=j+480|0;m=j+476|0;n=j+472|0;o=j+468|0;p=j+464|0;q=j+460|0;r=j+456|0;s=j+452|0;t=j+448|0;u=j+444|0;v=j+440|0;w=j+436|0;x=j+432|0;y=j+428|0;z=j+424|0;A=j+420|0;B=j+416|0;C=j+412|0;D=j+408|0;E=j+24|0;F=j+404|0;G=j+16|0;H=j+400|0;I=j+396|0;J=j+392|0;K=j+388|0;L=j+384|0;M=j+380|0;N=j+376|0;O=j+372|0;P=j+368|0;Q=j+364|0;R=j+360|0;S=j+356|0;T=j+352|0;U=j+8|0;V=j+348|0;W=j;X=j+344|0;Y=j+340|0;Z=j+336|0;_=j+332|0;$=j+328|0;aa=j+324|0;ba=j+320|0;ca=j+316|0;da=j+312|0;ea=j+2490|0;fa=j+308|0;ga=j+304|0;ha=j+488|0;ia=j+300|0;ja=j+296|0;ka=j+32|0;la=j+484|0;ma=j+28|0;c[$>>2]=d;c[aa>>2]=e;c[ba>>2]=f;c[ca>>2]=g;c[da>>2]=h;ed(ea,c[$>>2]|0);c[X>>2]=c[da>>2];c[Y>>2]=ea;Kd(Z,c[X>>2]|0,c[Y>>2]|0);a[W+0|0]=a[Z+0|0]|0;a[W+1|0]=a[Z+1|0]|0;a[W+2|0]=a[Z+2|0]|0;a[W+3|0]=a[Z+3|0]|0;c[V>>2]=fa;Z=c[V>>2]|0;a[U+0|0]=a[W+0|0]|0;a[U+1|0]=a[W+1|0]|0;a[U+2|0]=a[W+2|0]|0;a[U+3|0]=a[W+3|0]|0;c[T>>2]=Z;Z=c[T>>2]|0;c[Z+0>>2]=c[U+0>>2];c[R>>2]=c[da>>2];c[Q>>2]=c[R>>2];c[P>>2]=c[Q>>2];c[O>>2]=(c[P>>2]|0)+4;c[N>>2]=c[O>>2];c[M>>2]=c[N>>2];c[L>>2]=c[M>>2];M=c[L>>2]|0;c[J>>2]=S;c[K>>2]=M;M=c[K>>2]|0;c[H>>2]=c[J>>2];c[I>>2]=M;c[c[H>>2]>>2]=c[I>>2];a[G+0|0]=a[S+0|0]|0;a[G+1|0]=a[S+1|0]|0;a[G+2|0]=a[S+2|0]|0;a[G+3|0]=a[S+3|0]|0;c[F>>2]=ga;S=c[F>>2]|0;a[E+0|0]=a[G+0|0]|0;a[E+1|0]=a[G+1|0]|0;a[E+2|0]=a[G+2|0]|0;a[E+3|0]=a[G+3|0]|0;c[D>>2]=S;S=c[D>>2]|0;c[S+0>>2]=c[E+0>>2];c[B>>2]=fa;c[C>>2]=ga;ga=c[C>>2]|0;c[z>>2]=c[B>>2];c[A>>2]=ga;ga=c[A>>2]|0;c[x>>2]=c[z>>2];c[y>>2]=ga;if((c[c[x>>2]>>2]|0)==(c[c[y>>2]>>2]|0)^1){if(rd(c[$>>2]|0)|0){c[w>>2]=fa;c[v>>2]=c[w>>2];c[u>>2]=(c[c[v>>2]>>2]|0)+16;c[t>>2]=c[u>>2];c[s>>2]=c[t>>2];c[r>>2]=c[s>>2];na=c[(c[r>>2]|0)+64>>2]|0}else{c[q>>2]=fa;c[p>>2]=c[q>>2];c[o>>2]=(c[c[p>>2]>>2]|0)+16;c[n>>2]=c[o>>2];c[m>>2]=c[n>>2];c[l>>2]=c[m>>2];na=0-(c[(c[l>>2]|0)+64>>2]|0)|0}c[_>>2]=na;oa=c[_>>2]|0;i=j;return oa|0}c[16]=(c[16]|0)+1;na=ha+2e3|0;l=ha;do{Uc(l);l=l+2|0}while((l|0)!=(na|0));c[ia>>2]=Te(c[$>>2]|0,ha)|0;if(sd(ha)|0){na=(c[aa>>2]|0)+1|0;c[aa>>2]=na;if((na|0)>=2){c[_>>2]=td(c[$>>2]|0)|0;oa=c[_>>2]|0;i=j;return oa|0}}else{c[aa>>2]=0}c[ja>>2]=ha;while(1){pa=c[$>>2]|0;if(!((c[ja>>2]|0)>>>0<(ha+(c[ia>>2]<<1)|0)>>>0)){qa=18;break}na=c[ja>>2]|0;b[la+0>>1]=b[na+0>>1]|0;b[k+0>>1]=b[la+0>>1]|0;dd(ka,pa,k);c[ma>>2]=0-(yd(ka,c[aa>>2]|0,0-(c[ca>>2]|0)|0,0-(c[ba>>2]|0)|0,(c[da>>2]|0)+12|0)|0);if((c[ma>>2]|0)>(c[ba>>2]|0)?(c[ba>>2]=c[ma>>2],(c[ba>>2]|0)>=(c[ca>>2]|0)):0){qa=16;break}c[ja>>2]=(c[ja>>2]|0)+2}if((qa|0)==16){ja=rd(c[$>>2]|0)|0;$=c[ca>>2]|0;c[(vd(c[da>>2]|0,ea)|0)>>2]=ja?$:0-$|0;c[_>>2]=c[ca>>2];oa=c[_>>2]|0;i=j;return oa|0}else if((qa|0)==18){qa=rd(pa)|0;pa=c[ba>>2]|0;c[(vd(c[da>>2]|0,ea)|0)>>2]=qa?pa:0-pa|0;c[_>>2]=c[ba>>2];oa=c[_>>2]|0;i=j;return oa|0}return 0}function zd(d,e){d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0;f=i;i=i+2384|0;g=f+2368|0;h=f+352|0;j=f+348|0;k=f+344|0;l=f+340|0;m=f+336|0;n=f+332|0;o=f+328|0;p=f+8|0;q=f+324|0;r=f;s=f+320|0;t=f+316|0;u=f+2372|0;v=f+2371|0;w=f+312|0;x=f+308|0;y=f+304|0;z=f+300|0;A=f+2370|0;B=f+296|0;C=f+292|0;D=f+368|0;E=f+288|0;F=f+284|0;G=f+360|0;H=f+280|0;I=f+16|0;J=f+358|0;K=f+12|0;L=f+356|0;c[y>>2]=e;e=44-(Wc(c[y>>2]|0)|0)|0;M=e*12|0;N=Io(e>>>0>357913941|M>>>0>4294967291?-1:M+4|0)|0;c[N>>2]=e;M=N+4|0;if((e|0)!=0){N=M+(e*12|0)|0;e=M;do{c[w>>2]=e;c[x>>2]=A;O=c[x>>2]|0;c[s>>2]=c[w>>2];c[t>>2]=O;O=c[s>>2]|0;a[r+0|0]=a[v+0|0]|0;c[q>>2]=u;P=c[q>>2]|0;a[p+0|0]=a[r+0|0]|0;c[o>>2]=P;Bd(O,u);e=e+12|0}while((e|0)!=(N|0))}c[z>>2]=M;c[16]=(c[16]|0)+1;c[B>>2]=-2147483647;c[C>>2]=2147483647;M=D+2e3|0;N=D;do{Uc(N);N=N+2|0}while((N|0)!=(M|0));c[E>>2]=Te(c[y>>2]|0,D)|0;M=sd(D)|0;c[F>>2]=M?1:0;Uc(G);c[H>>2]=D;while(1){if(!((c[H>>2]|0)>>>0<(D+(c[E>>2]<<1)|0)>>>0)){break}M=c[y>>2]|0;N=c[H>>2]|0;b[J+0>>1]=b[N+0>>1]|0;b[g+0>>1]=b[J+0>>1]|0;dd(I,M,g);c[K>>2]=0-(yd(I,c[F>>2]|0,0-(c[C>>2]|0)|0,0-(c[B>>2]|0)|0,c[z>>2]|0)|0);if((c[K>>2]|0)>(c[B>>2]|0)){c[B>>2]=c[K>>2];M=c[H>>2]|0;b[G+0>>1]=b[M+0>>1]|0}c[H>>2]=(c[H>>2]|0)+2}H=c[z>>2]|0;if((H|0)==0){Q=c[B>>2]|0;R=Q&65535;b[L>>1]=R;c[l>>2]=d;c[m>>2]=G;c[n>>2]=L;S=c[l>>2]|0;T=c[n>>2]|0;U=c[m>>2]|0;c[h>>2]=S;c[j>>2]=U;c[k>>2]=T;V=c[h>>2]|0;W=c[j>>2]|0;b[V+0>>1]=b[W+0>>1]|0;X=V+2|0;Y=c[k>>2]|0;Z=b[Y>>1]|0;b[X>>1]=Z;i=f;return}z=H+ -4|0;K=H+((c[z>>2]|0)*12|0)|0;if((H|0)!=(K|0)){C=K;do{C=C+ -12|0;xd(C)}while((C|0)!=(H|0))}Ko(z);Q=c[B>>2]|0;R=Q&65535;b[L>>1]=R;c[l>>2]=d;c[m>>2]=G;c[n>>2]=L;S=c[l>>2]|0;T=c[n>>2]|0;U=c[m>>2]|0;c[h>>2]=S;c[j>>2]=U;c[k>>2]=T;V=c[h>>2]|0;W=c[j>>2]|0;b[V+0>>1]=b[W+0>>1]|0;X=V+2|0;Y=c[k>>2]|0;Z=b[Y>>1]|0;b[X>>1]=Z;i=f;return}function Ad(a){a=a|0;var b=0,d=0;b=i;i=i+16|0;d=b;c[d>>2]=a;a=c[d>>2]|0;jd(a);Jo(a);i=b;return}function Bd(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=i;i=i+16|0;e=d+4|0;f=d;c[e>>2]=a;c[f>>2]=b;Cd(c[e>>2]|0,c[f>>2]|0);i=d;return}function Cd(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;e=i;i=i+128|0;f=e+112|0;g=e+108|0;h=e+104|0;j=e+100|0;k=e+96|0;l=e+16|0;m=e+92|0;n=e+88|0;o=e+84|0;p=e+117|0;q=e+8|0;r=e+80|0;s=e+76|0;t=e;u=e+72|0;v=e+68|0;w=e+64|0;x=e+60|0;y=e+56|0;z=e+52|0;A=e+48|0;B=e+44|0;C=e+36|0;D=e+32|0;E=e+28|0;F=e+24|0;G=e+116|0;c[F>>2]=b;c[e+20>>2]=d;d=c[F>>2]|0;c[E>>2]=d+4;c[D>>2]=c[E>>2];c[C>>2]=c[D>>2];D=c[C>>2]|0;c[e+40>>2]=D;c[B>>2]=D;c[A>>2]=c[B>>2];c[c[A>>2]>>2]=0;A=d+8|0;a[t+0|0]=a[G+0|0]|0;c[r>>2]=A;c[s>>2]=0;A=c[r>>2]|0;r=c[s>>2]|0;a[q+0|0]=a[t+0|0]|0;c[n>>2]=A;c[o>>2]=r;r=c[n>>2]|0;c[m>>2]=o;o=c[c[m>>2]>>2]|0;c[f>>2]=q;a[l+0|0]=a[p+0|0]|0;c[j>>2]=r;c[k>>2]=o;o=c[j>>2]|0;c[h>>2]=l;c[g>>2]=k;c[o>>2]=c[c[g>>2]>>2];c[y>>2]=d;c[x>>2]=(c[y>>2]|0)+4;c[w>>2]=c[x>>2];c[v>>2]=c[w>>2];c[u>>2]=c[v>>2];v=c[u>>2]|0;c[z>>2]=d;c[c[z>>2]>>2]=v;i=e;return}function Dd(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0;e=i;i=i+208|0;f=e+200|0;g=e+196|0;h=e+192|0;j=e+188|0;k=e+180|0;l=e+176|0;m=e+172|0;n=e+168|0;o=e+164|0;p=e+160|0;q=e+156|0;r=e+152|0;s=e+148|0;t=e+144|0;u=e+140|0;v=e+136|0;w=e+132|0;x=e+128|0;y=e+120|0;z=e+116|0;A=e+112|0;B=e+108|0;C=e+104|0;D=e+100|0;E=e+96|0;F=e+92|0;G=e+88|0;H=e+84|0;I=e+80|0;J=e+76|0;K=e+72|0;L=e+68|0;M=e+64|0;N=e+60|0;O=e+56|0;P=e+52|0;Q=e+48|0;R=e+44|0;S=e+40|0;T=e+36|0;U=e+32|0;V=e+28|0;W=e+24|0;X=e+20|0;Y=e+16|0;Z=e+12|0;_=e+8|0;$=e+4|0;aa=e;c[W>>2]=a;c[X>>2]=b;c[Y>>2]=d;d=c[W>>2]|0;c[U>>2]=d;c[T>>2]=c[U>>2];c[S>>2]=(c[T>>2]|0)+4;c[R>>2]=c[S>>2];c[Q>>2]=c[R>>2];c[P>>2]=c[Q>>2];c[Z>>2]=c[c[P>>2]>>2];P=c[Z>>2]|0;c[y>>2]=A;c[z>>2]=-1;Q=c[z>>2]|0;c[x>>2]=c[y>>2];c[e+124>>2]=Q;c[c[x>>2]>>2]=0;c[_>>2]=c[A>>2];c[e+184>>2]=_;if((P|0)==0){c[O>>2]=d;c[N>>2]=(c[O>>2]|0)+4;c[M>>2]=c[N>>2];c[L>>2]=c[M>>2];c[K>>2]=c[L>>2];c[c[X>>2]>>2]=c[K>>2];c[V>>2]=c[c[X>>2]>>2];ba=c[V>>2]|0;i=e;return ba|0}while(1){c[h>>2]=d;c[g>>2]=(c[h>>2]|0)+8;c[f>>2]=c[g>>2];c[j>>2]=c[f>>2];K=c[Y>>2]|0;L=(c[Z>>2]|0)+16|0;c[k>>2]=c[j>>2];c[l>>2]=K;c[m>>2]=L;if(Jd(c[l>>2]|0,c[m>>2]|0)|0){L=c[c[Z>>2]>>2]|0;c[p>>2]=r;c[q>>2]=-1;K=c[q>>2]|0;c[n>>2]=c[p>>2];c[o>>2]=K;c[c[n>>2]>>2]=0;c[$>>2]=c[r>>2];c[s>>2]=$;ca=c[Z>>2]|0;if((L|0)==0){da=5;break}c[Z>>2]=c[ca>>2];continue}c[v>>2]=d;c[u>>2]=(c[v>>2]|0)+8;c[t>>2]=c[u>>2];c[w>>2]=c[t>>2];L=(c[Z>>2]|0)+16|0;K=c[Y>>2]|0;c[B>>2]=c[w>>2];c[C>>2]=L;c[D>>2]=K;K=Jd(c[C>>2]|0,c[D>>2]|0)|0;ea=c[Z>>2]|0;if(!K){da=10;break}K=c[ea+4>>2]|0;c[G>>2]=I;c[H>>2]=-1;L=c[H>>2]|0;c[E>>2]=c[G>>2];c[F>>2]=L;c[c[E>>2]>>2]=0;c[aa>>2]=c[I>>2];c[J>>2]=aa;fa=c[Z>>2]|0;if((K|0)==0){da=9;break}c[Z>>2]=c[fa+4>>2]}if((da|0)==5){c[c[X>>2]>>2]=ca;c[V>>2]=c[c[X>>2]>>2];ba=c[V>>2]|0;i=e;return ba|0}else if((da|0)==9){c[c[X>>2]>>2]=fa;c[V>>2]=(c[c[X>>2]>>2]|0)+4;ba=c[V>>2]|0;i=e;return ba|0}else if((da|0)==10){c[c[X>>2]>>2]=ea;c[V>>2]=c[X>>2];ba=c[V>>2]|0;i=e;return ba|0}return 0}function Ed(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0,Ja=0,Ka=0,La=0,Ma=0,Na=0,Oa=0,Pa=0,Qa=0,Ra=0,Sa=0,Ta=0,Ua=0,Va=0,Wa=0,Xa=0,Ya=0,Za=0,_a=0,$a=0,ab=0,bb=0,cb=0,db=0,eb=0,fb=0,gb=0,hb=0,ib=0,jb=0,kb=0,lb=0,mb=0,nb=0,ob=0,pb=0,qb=0,rb=0,sb=0,tb=0,ub=0,vb=0,wb=0,xb=0,yb=0,zb=0,Ab=0,Bb=0,Cb=0,Db=0,Eb=0,Fb=0,Gb=0,Hb=0,Ib=0,Jb=0,Kb=0,Lb=0,Mb=0,Nb=0,Ob=0,Pb=0,Qb=0,Rb=0,Sb=0,Tb=0,Ub=0,Vb=0,Wb=0,Xb=0,Yb=0,Zb=0,_b=0,$b=0,ac=0,bc=0,cc=0,dc=0,ec=0,fc=0,gc=0,hc=0,ic=0,jc=0,kc=0,lc=0,mc=0,nc=0,oc=0,pc=0,qc=0,rc=0,sc=0,tc=0,uc=0,vc=0,wc=0,xc=0,yc=0,zc=0,Ac=0,Bc=0,Cc=0,Dc=0,Ec=0,Fc=0,Gc=0,Hc=0,Ic=0,Jc=0,Kc=0,Lc=0,Mc=0,Nc=0,Oc=0,Pc=0,Qc=0,Rc=0,Sc=0,Tc=0,Uc=0,Vc=0,Wc=0,Xc=0,Yc=0,Zc=0,_c=0,$c=0,ad=0,bd=0,cd=0,dd=0,ed=0,fd=0,gd=0,hd=0,id=0,jd=0,kd=0,ld=0,md=0,nd=0,od=0,pd=0,qd=0,rd=0,sd=0,td=0,ud=0,vd=0,wd=0,xd=0,yd=0,zd=0,Ad=0,Bd=0,Cd=0,Dd=0,Ed=0,Fd=0,Gd=0,Hd=0,Id=0,Jd=0,Kd=0,Ld=0,Md=0,Nd=0,Od=0,Pd=0,Qd=0,Rd=0,Sd=0,Td=0,Ud=0,Vd=0,Wd=0,Xd=0,Yd=0,Zd=0,_d=0,$d=0,ae=0,be=0,ce=0,de=0,ee=0,fe=0,ge=0;f=i;i=i+1264|0;g=f+1240|0;h=f+1236|0;j=f+1232|0;k=f+1228|0;l=f+1224|0;m=f+1220|0;n=f+1216|0;o=f+1212|0;p=f+1208|0;q=f+1204|0;r=f+1200|0;s=f+1196|0;t=f+1192|0;u=f+1188|0;v=f+1184|0;w=f+1180|0;x=f+1176|0;y=f+1172|0;z=f+1168|0;A=f+1164|0;B=f+1160|0;C=f+1156|0;D=f+1152|0;E=f+1148|0;F=f+1144|0;G=f+1140|0;H=f+1136|0;I=f+1132|0;J=f+200|0;K=f+1128|0;L=f+1124|0;M=f+1120|0;N=f+1112|0;O=f+192|0;P=f+1108|0;Q=f+1104|0;R=f+184|0;S=f+1100|0;T=f+1096|0;U=f+1088|0;V=f+176|0;W=f+1084|0;X=f+168|0;Y=f+1080|0;Z=f+1076|0;_=f+1072|0;$=f+1068|0;aa=f+1064|0;ba=f+1060|0;ca=f+1056|0;da=f+160|0;ea=f+1052|0;fa=f+1048|0;ga=f+1249|0;ha=f+1044|0;ia=f+1040|0;ja=f+152|0;ka=f+1036|0;la=f+1032|0;ma=f+1248|0;na=f+1028|0;oa=f+1024|0;pa=f+1020|0;qa=f+1016|0;ra=f+1012|0;sa=f+1008|0;ta=f+1004|0;ua=f+1e3|0;va=f+996|0;wa=f+992|0;xa=f+988|0;ya=f+984|0;za=f+980|0;Aa=f+976|0;Ba=f+972|0;Ca=f+968|0;Da=f+964|0;Ea=f+960|0;Fa=f+956|0;Ga=f+952|0;Ha=f+948|0;Ia=f+944|0;Ja=f+940|0;Ka=f+936|0;La=f+932|0;Ma=f+928|0;Na=f+924|0;Oa=f+920|0;Pa=f+916|0;Qa=f+912|0;Ra=f+908|0;Sa=f+904|0;Ta=f+900|0;Ua=f+896|0;Va=f+892|0;Wa=f+888|0;Xa=f+884|0;Ya=f+144|0;Za=f+880|0;_a=f+876|0;$a=f+872|0;ab=f+864|0;bb=f+136|0;cb=f+860|0;db=f+856|0;eb=f+128|0;fb=f+852|0;gb=f+848|0;hb=f+840|0;ib=f+120|0;jb=f+832|0;kb=f+112|0;lb=f+828|0;mb=f+824|0;nb=f+820|0;ob=f+816|0;pb=f+812|0;qb=f+808|0;rb=f+796|0;sb=f+792|0;tb=f+788|0;ub=f+784|0;vb=f+780|0;wb=f+776|0;xb=f+772|0;yb=f+768|0;zb=f+764|0;Ab=f+760|0;Bb=f+756|0;Cb=f+752|0;Db=f+748|0;Eb=f+744|0;Fb=f+740|0;Gb=f+736|0;Hb=f+732|0;Ib=f+728|0;Jb=f+724|0;Kb=f+720|0;Lb=f+716|0;Mb=f+712|0;Nb=f+708|0;Ob=f+104|0;Pb=f+704|0;Qb=f+700|0;Rb=f+696|0;Sb=f+688|0;Tb=f+96|0;Ub=f+684|0;Vb=f+680|0;Wb=f+88|0;Xb=f+676|0;Yb=f+672|0;Zb=f+664|0;_b=f+80|0;$b=f+656|0;ac=f+72|0;bc=f+652|0;cc=f+648|0;dc=f+644|0;ec=f+640|0;fc=f+636|0;gc=f+632|0;hc=f+628|0;ic=f+624|0;jc=f+620|0;kc=f+616|0;lc=f+64|0;mc=f+612|0;nc=f+608|0;oc=f+1247|0;pc=f+604|0;qc=f+600|0;rc=f+56|0;sc=f+596|0;tc=f+592|0;uc=f+1246|0;vc=f+588|0;wc=f+584|0;xc=f+580|0;yc=f+576|0;zc=f+572|0;Ac=f+568|0;Bc=f+564|0;Cc=f+560|0;Dc=f+556|0;Ec=f+552|0;Fc=f+548|0;Gc=f+544|0;Hc=f+540|0;Ic=f+536|0;Jc=f+532|0;Kc=f+528|0;Lc=f+524|0;Mc=f+520|0;Nc=f+516|0;Oc=f+512|0;Pc=f+508|0;Qc=f+504|0;Rc=f+500|0;Sc=f+496|0;Tc=f+48|0;Uc=f+492|0;Vc=f+488|0;Wc=f+1245|0;Xc=f+484|0;Yc=f+480|0;Zc=f+40|0;_c=f+476|0;$c=f+472|0;ad=f+1244|0;bd=f+468|0;cd=f+464|0;dd=f+460|0;ed=f+456|0;fd=f+452|0;gd=f+448|0;hd=f+444|0;id=f+440|0;jd=f+436|0;kd=f+432|0;ld=f+428|0;md=f+424|0;nd=f+420|0;od=f+416|0;pd=f+412|0;qd=f+408|0;rd=f+404|0;sd=f+400|0;td=f+396|0;ud=f+392|0;vd=f+388|0;wd=f+384|0;xd=f+380|0;yd=f+376|0;zd=f+372|0;Ad=f+32|0;Bd=f+368|0;Cd=f+364|0;Dd=f+360|0;Ed=f+352|0;Fd=f+24|0;Gd=f+344|0;Hd=f+340|0;Id=f+16|0;Jd=f+336|0;Kd=f+332|0;Ld=f+328|0;Md=f+320|0;Nd=f+8|0;Od=f+316|0;Pd=f+312|0;Qd=f;Rd=f+308|0;Sd=f+304|0;Td=f+300|0;Ud=f+296|0;Vd=f+288|0;Wd=f+280|0;Xd=f+276|0;Yd=f+272|0;Zd=f+268|0;_d=f+264|0;$d=f+260|0;ae=f+256|0;be=f+252|0;ce=f+240|0;de=f+232|0;ee=f+224|0;fe=f+212|0;ge=f+208|0;c[$d>>2]=d;c[ae>>2]=e;c[_d>>2]=c[$d>>2];c[Zd>>2]=(c[_d>>2]|0)+4;c[Yd>>2]=c[Zd>>2];c[be>>2]=c[Yd>>2];c[Wd>>2]=c[be>>2];c[Xd>>2]=1;Yd=c[Xd>>2]|0;c[f+292>>2]=c[Wd>>2];c[Vd>>2]=Yd;c[f+284>>2]=0;Yd=Ho((c[Vd>>2]|0)*84|0)|0;Vd=c[be>>2]|0;c[Td>>2]=de;c[Ud>>2]=Vd;Vd=c[Ud>>2]|0;c[Rd>>2]=c[Td>>2];c[Sd>>2]=Vd;Vd=c[Rd>>2]|0;c[Vd>>2]=c[Sd>>2];a[Vd+4|0]=0;a[Vd+5|0]=0;a[Qd+0|0]=a[de+0|0]|0;a[Qd+1|0]=a[de+1|0]|0;a[Qd+2|0]=a[de+2|0]|0;a[Qd+3|0]=a[de+3|0]|0;a[Qd+4|0]=a[de+4|0]|0;a[Qd+5|0]=a[de+5|0]|0;a[Qd+6|0]=a[de+6|0]|0;a[Qd+7|0]=a[de+7|0]|0;c[Od>>2]=ce;c[Pd>>2]=Yd;Yd=c[Od>>2]|0;Od=c[Pd>>2]|0;a[Nd+0|0]=a[Qd+0|0]|0;a[Nd+1|0]=a[Qd+1|0]|0;a[Nd+2|0]=a[Qd+2|0]|0;a[Nd+3|0]=a[Qd+3|0]|0;a[Nd+4|0]=a[Qd+4|0]|0;a[Nd+5|0]=a[Qd+5|0]|0;a[Nd+6|0]=a[Qd+6|0]|0;a[Nd+7|0]=a[Qd+7|0]|0;c[Kd>>2]=Yd;c[Ld>>2]=Od;Od=c[Kd>>2]|0;c[Jd>>2]=Ld;Ld=c[c[Jd>>2]>>2]|0;c[ud>>2]=Nd;Nd=c[ud>>2]|0;c[Md+0>>2]=c[Nd+0>>2];c[Md+4>>2]=c[Nd+4>>2];a[Id+0|0]=a[Md+0|0]|0;a[Id+1|0]=a[Md+1|0]|0;a[Id+2|0]=a[Md+2|0]|0;a[Id+3|0]=a[Md+3|0]|0;a[Id+4|0]=a[Md+4|0]|0;a[Id+5|0]=a[Md+5|0]|0;a[Id+6|0]=a[Md+6|0]|0;a[Id+7|0]=a[Md+7|0]|0;c[Gd>>2]=Od;c[Hd>>2]=Ld;Ld=c[Gd>>2]|0;Gd=c[Hd>>2]|0;a[Fd+0|0]=a[Id+0|0]|0;a[Fd+1|0]=a[Id+1|0]|0;a[Fd+2|0]=a[Id+2|0]|0;a[Fd+3|0]=a[Id+3|0]|0;a[Fd+4|0]=a[Id+4|0]|0;a[Fd+5|0]=a[Id+5|0]|0;a[Fd+6|0]=a[Id+6|0]|0;a[Fd+7|0]=a[Id+7|0]|0;c[Cd>>2]=Ld;c[Dd>>2]=Gd;Gd=c[Cd>>2]|0;c[Bd>>2]=Dd;Dd=c[c[Bd>>2]>>2]|0;c[vd>>2]=Fd;Fd=c[vd>>2]|0;c[Ed+0>>2]=c[Fd+0>>2];c[Ed+4>>2]=c[Fd+4>>2];a[Ad+0|0]=a[Ed+0|0]|0;a[Ad+1|0]=a[Ed+1|0]|0;a[Ad+2|0]=a[Ed+2|0]|0;a[Ad+3|0]=a[Ed+3|0]|0;a[Ad+4|0]=a[Ed+4|0]|0;a[Ad+5|0]=a[Ed+5|0]|0;a[Ad+6|0]=a[Ed+6|0]|0;a[Ad+7|0]=a[Ed+7|0]|0;c[yd>>2]=Gd;c[zd>>2]=Dd;Dd=c[yd>>2]|0;c[xd>>2]=zd;c[Dd>>2]=c[c[xd>>2]>>2];xd=Dd+4|0;c[wd>>2]=Ad;Ad=c[wd>>2]|0;c[xd+0>>2]=c[Ad+0>>2];c[xd+4>>2]=c[Ad+4>>2];Ad=c[be>>2]|0;c[td>>2]=ce;c[sd>>2]=c[td>>2];c[rd>>2]=c[sd>>2];c[Lc>>2]=(c[c[rd>>2]>>2]|0)+16;rd=c[Lc>>2]|0;Lc=c[ae>>2]|0;c[bc>>2]=Ad;c[cc>>2]=rd;c[dc>>2]=Lc;Lc=c[cc>>2]|0;if((Lc|0)!=0){cc=Lc+0|0;Lc=(c[dc>>2]|0)+0|0;dc=cc+63|0;do{a[cc]=a[Lc]|0;cc=cc+1|0;Lc=Lc+1|0}while((cc|0)<(dc|0))}c[s>>2]=ce;c[r>>2]=c[s>>2];c[q>>2]=c[r>>2];a[(c[q>>2]|0)+8|0]=1;q=c[be>>2]|0;c[j>>2]=ce;c[h>>2]=c[j>>2];c[g>>2]=c[h>>2];c[k>>2]=(c[c[g>>2]>>2]|0)+80;g=c[k>>2]|0;c[l>>2]=q;c[m>>2]=g;g=c[m>>2]|0;if((g|0)!=0){c[g>>2]=0}c[p>>2]=ce;c[o>>2]=c[p>>2];c[n>>2]=c[o>>2];a[(c[n>>2]|0)+9|0]=1;c[pb>>2]=ce;n=c[pb>>2]|0;c[nb>>2]=sb;c[ob>>2]=n;n=c[ob>>2]|0;c[lb>>2]=c[nb>>2];c[mb>>2]=n;c[c[lb>>2]>>2]=c[mb>>2];a[kb+0|0]=a[sb+0|0]|0;a[kb+1|0]=a[sb+1|0]|0;a[kb+2|0]=a[sb+2|0]|0;a[kb+3|0]=a[sb+3|0]|0;c[jb>>2]=rb;sb=c[jb>>2]|0;a[ib+0|0]=a[kb+0|0]|0;a[ib+1|0]=a[kb+1|0]|0;a[ib+2|0]=a[kb+2|0]|0;a[ib+3|0]=a[kb+3|0]|0;c[gb>>2]=sb;sb=c[gb>>2]|0;c[fb>>2]=ib;c[Ma>>2]=c[c[fb>>2]>>2];fb=c[Ma>>2]|0;c[La>>2]=fb;c[Ka>>2]=c[La>>2];c[Na>>2]=c[c[Ka>>2]>>2];c[Ja>>2]=fb;c[Ia>>2]=c[Ja>>2];c[c[Ia>>2]>>2]=0;Ia=c[Na>>2]|0;c[Oa>>2]=ib;c[Ra>>2]=c[c[Oa>>2]>>2];c[Qa>>2]=c[Ra>>2];c[Pa>>2]=c[Qa>>2];c[Sa>>2]=(c[Pa>>2]|0)+4;Pa=c[Sa>>2]|0;c[hb+0>>2]=c[Pa+0>>2];c[hb+4>>2]=c[Pa+4>>2];a[eb+0|0]=a[hb+0|0]|0;a[eb+1|0]=a[hb+1|0]|0;a[eb+2|0]=a[hb+2|0]|0;a[eb+3|0]=a[hb+3|0]|0;a[eb+4|0]=a[hb+4|0]|0;a[eb+5|0]=a[hb+5|0]|0;a[eb+6|0]=a[hb+6|0]|0;a[eb+7|0]=a[hb+7|0]|0;c[cb>>2]=sb;c[db>>2]=Ia;Ia=c[cb>>2]|0;cb=c[db>>2]|0;a[bb+0|0]=a[eb+0|0]|0;a[bb+1|0]=a[eb+1|0]|0;a[bb+2|0]=a[eb+2|0]|0;a[bb+3|0]=a[eb+3|0]|0;a[bb+4|0]=a[eb+4|0]|0;a[bb+5|0]=a[eb+5|0]|0;a[bb+6|0]=a[eb+6|0]|0;a[bb+7|0]=a[eb+7|0]|0;c[_a>>2]=Ia;c[$a>>2]=cb;cb=c[_a>>2]|0;c[Za>>2]=$a;$a=c[c[Za>>2]>>2]|0;c[Ta>>2]=bb;bb=c[Ta>>2]|0;c[ab+0>>2]=c[bb+0>>2];c[ab+4>>2]=c[bb+4>>2];a[Ya+0|0]=a[ab+0|0]|0;a[Ya+1|0]=a[ab+1|0]|0;a[Ya+2|0]=a[ab+2|0]|0;a[Ya+3|0]=a[ab+3|0]|0;a[Ya+4|0]=a[ab+4|0]|0;a[Ya+5|0]=a[ab+5|0]|0;a[Ya+6|0]=a[ab+6|0]|0;a[Ya+7|0]=a[ab+7|0]|0;c[Wa>>2]=cb;c[Xa>>2]=$a;$a=c[Wa>>2]|0;c[Va>>2]=Xa;c[$a>>2]=c[c[Va>>2]>>2];Va=$a+4|0;c[Ua>>2]=Ya;Ya=c[Ua>>2]|0;c[Va+0>>2]=c[Ya+0>>2];c[Va+4>>2]=c[Ya+4>>2];c[Ha>>2]=rb;Ya=c[Ha>>2]|0;c[Fa>>2]=qb;c[Ga>>2]=Ya;Ya=c[Ga>>2]|0;c[Da>>2]=c[Fa>>2];c[Ea>>2]=Ya;c[c[Da>>2]>>2]=c[Ea>>2];a[X+0|0]=a[qb+0|0]|0;a[X+1|0]=a[qb+1|0]|0;a[X+2|0]=a[qb+2|0]|0;a[X+3|0]=a[qb+3|0]|0;c[W>>2]=fe;qb=c[W>>2]|0;a[V+0|0]=a[X+0|0]|0;a[V+1|0]=a[X+1|0]|0;a[V+2|0]=a[X+2|0]|0;a[V+3|0]=a[X+3|0]|0;c[T>>2]=qb;qb=c[T>>2]|0;c[S>>2]=V;c[x>>2]=c[c[S>>2]>>2];S=c[x>>2]|0;c[w>>2]=S;c[v>>2]=c[w>>2];c[y>>2]=c[c[v>>2]>>2];c[u>>2]=S;c[t>>2]=c[u>>2];c[c[t>>2]>>2]=0;t=c[y>>2]|0;c[z>>2]=V;c[C>>2]=c[c[z>>2]>>2];c[B>>2]=c[C>>2];c[A>>2]=c[B>>2];c[D>>2]=(c[A>>2]|0)+4;A=c[D>>2]|0;c[U+0>>2]=c[A+0>>2];c[U+4>>2]=c[A+4>>2];a[R+0|0]=a[U+0|0]|0;a[R+1|0]=a[U+1|0]|0;a[R+2|0]=a[U+2|0]|0;a[R+3|0]=a[U+3|0]|0;a[R+4|0]=a[U+4|0]|0;a[R+5|0]=a[U+5|0]|0;a[R+6|0]=a[U+6|0]|0;a[R+7|0]=a[U+7|0]|0;c[P>>2]=qb;c[Q>>2]=t;t=c[P>>2]|0;P=c[Q>>2]|0;a[O+0|0]=a[R+0|0]|0;a[O+1|0]=a[R+1|0]|0;a[O+2|0]=a[R+2|0]|0;a[O+3|0]=a[R+3|0]|0;a[O+4|0]=a[R+4|0]|0;a[O+5|0]=a[R+5|0]|0;a[O+6|0]=a[R+6|0]|0;a[O+7|0]=a[R+7|0]|0;c[L>>2]=t;c[M>>2]=P;P=c[L>>2]|0;c[K>>2]=M;M=c[c[K>>2]>>2]|0;c[E>>2]=O;O=c[E>>2]|0;c[N+0>>2]=c[O+0>>2];c[N+4>>2]=c[O+4>>2];a[J+0|0]=a[N+0|0]|0;a[J+1|0]=a[N+1|0]|0;a[J+2|0]=a[N+2|0]|0;a[J+3|0]=a[N+3|0]|0;a[J+4|0]=a[N+4|0]|0;a[J+5|0]=a[N+5|0]|0;a[J+6|0]=a[N+6|0]|0;a[J+7|0]=a[N+7|0]|0;c[H>>2]=P;c[I>>2]=M;M=c[H>>2]|0;c[G>>2]=I;c[M>>2]=c[c[G>>2]>>2];G=M+4|0;c[F>>2]=J;J=c[F>>2]|0;c[G+0>>2]=c[J+0>>2];c[G+4>>2]=c[J+4>>2];c[Ca>>2]=rb;c[Ba>>2]=c[Ca>>2];c[ya>>2]=c[Ba>>2];c[za>>2]=0;Ba=c[ya>>2]|0;c[xa>>2]=Ba;c[wa>>2]=c[xa>>2];c[Aa>>2]=c[c[wa>>2]>>2];wa=c[za>>2]|0;c[$>>2]=Ba;c[_>>2]=c[$>>2];c[c[_>>2]>>2]=wa;if((c[Aa>>2]|0)!=0){c[Z>>2]=Ba;c[Y>>2]=c[Z>>2];Z=c[Aa>>2]|0;c[ua>>2]=(c[Y>>2]|0)+4;c[va>>2]=Z;Z=c[ua>>2]|0;if(a[Z+5|0]&1){ua=c[Z>>2]|0;c[ta>>2]=(c[va>>2]|0)+80;Y=c[ta>>2]|0;c[ka>>2]=ua;c[la>>2]=Y;Y=c[ka>>2]|0;ka=c[la>>2]|0;a[ja+0|0]=a[ma+0|0]|0;c[ha>>2]=Y;c[ia>>2]=ka}if(a[Z+4|0]&1){ka=c[Z>>2]|0;c[aa>>2]=(c[va>>2]|0)+16;ia=c[aa>>2]|0;c[ea>>2]=ka;c[fa>>2]=ia;ia=c[ea>>2]|0;ea=c[fa>>2]|0;a[da+0|0]=a[ga+0|0]|0;c[ba>>2]=ia;c[ca>>2]=ea}if((c[va>>2]|0)!=0){ea=c[va>>2]|0;c[qa>>2]=c[Z>>2];c[ra>>2]=ea;c[sa>>2]=1;ea=c[ra>>2]|0;ra=c[sa>>2]|0;c[na>>2]=c[qa>>2];c[oa>>2]=ea;c[pa>>2]=ra;Jo(c[oa>>2]|0)}}c[xb>>2]=fe;oa=c[xb>>2]|0;c[vb>>2]=ee;c[wb>>2]=oa;oa=c[wb>>2]|0;c[tb>>2]=c[vb>>2];c[ub>>2]=oa;c[c[tb>>2]>>2]=c[ub>>2];a[ac+0|0]=a[ee+0|0]|0;a[ac+1|0]=a[ee+1|0]|0;a[ac+2|0]=a[ee+2|0]|0;a[ac+3|0]=a[ee+3|0]|0;c[$b>>2]=b;b=c[$b>>2]|0;a[_b+0|0]=a[ac+0|0]|0;a[_b+1|0]=a[ac+1|0]|0;a[_b+2|0]=a[ac+2|0]|0;a[_b+3|0]=a[ac+3|0]|0;c[Yb>>2]=b;b=c[Yb>>2]|0;c[Xb>>2]=_b;c[Cb>>2]=c[c[Xb>>2]>>2];Xb=c[Cb>>2]|0;c[Bb>>2]=Xb;c[Ab>>2]=c[Bb>>2];c[Db>>2]=c[c[Ab>>2]>>2];c[zb>>2]=Xb;c[yb>>2]=c[zb>>2];c[c[yb>>2]>>2]=0;yb=c[Db>>2]|0;c[Eb>>2]=_b;c[Hb>>2]=c[c[Eb>>2]>>2];c[Gb>>2]=c[Hb>>2];c[Fb>>2]=c[Gb>>2];c[Ib>>2]=(c[Fb>>2]|0)+4;Fb=c[Ib>>2]|0;c[Zb+0>>2]=c[Fb+0>>2];c[Zb+4>>2]=c[Fb+4>>2];a[Wb+0|0]=a[Zb+0|0]|0;a[Wb+1|0]=a[Zb+1|0]|0;a[Wb+2|0]=a[Zb+2|0]|0;a[Wb+3|0]=a[Zb+3|0]|0;a[Wb+4|0]=a[Zb+4|0]|0;a[Wb+5|0]=a[Zb+5|0]|0;a[Wb+6|0]=a[Zb+6|0]|0;a[Wb+7|0]=a[Zb+7|0]|0;c[Ub>>2]=b;c[Vb>>2]=yb;yb=c[Ub>>2]|0;Ub=c[Vb>>2]|0;a[Tb+0|0]=a[Wb+0|0]|0;a[Tb+1|0]=a[Wb+1|0]|0;a[Tb+2|0]=a[Wb+2|0]|0;a[Tb+3|0]=a[Wb+3|0]|0;a[Tb+4|0]=a[Wb+4|0]|0;a[Tb+5|0]=a[Wb+5|0]|0;a[Tb+6|0]=a[Wb+6|0]|0;a[Tb+7|0]=a[Wb+7|0]|0;c[Qb>>2]=yb;c[Rb>>2]=Ub;Ub=c[Qb>>2]|0;c[Pb>>2]=Rb;Rb=c[c[Pb>>2]>>2]|0;c[Jb>>2]=Tb;Tb=c[Jb>>2]|0;c[Sb+0>>2]=c[Tb+0>>2];c[Sb+4>>2]=c[Tb+4>>2];a[Ob+0|0]=a[Sb+0|0]|0;a[Ob+1|0]=a[Sb+1|0]|0;a[Ob+2|0]=a[Sb+2|0]|0;a[Ob+3|0]=a[Sb+3|0]|0;a[Ob+4|0]=a[Sb+4|0]|0;a[Ob+5|0]=a[Sb+5|0]|0;a[Ob+6|0]=a[Sb+6|0]|0;a[Ob+7|0]=a[Sb+7|0]|0;c[Mb>>2]=Ub;c[Nb>>2]=Rb;Rb=c[Mb>>2]|0;c[Lb>>2]=Nb;c[Rb>>2]=c[c[Lb>>2]>>2];Lb=Rb+4|0;c[Kb>>2]=Ob;Ob=c[Kb>>2]|0;c[Lb+0>>2]=c[Ob+0>>2];c[Lb+4>>2]=c[Ob+4>>2];c[Kc>>2]=fe;c[Jc>>2]=c[Kc>>2];c[Gc>>2]=c[Jc>>2];c[Hc>>2]=0;Jc=c[Gc>>2]|0;c[Fc>>2]=Jc;c[Ec>>2]=c[Fc>>2];c[Ic>>2]=c[c[Ec>>2]>>2];Ec=c[Hc>>2]|0;c[hc>>2]=Jc;c[gc>>2]=c[hc>>2];c[c[gc>>2]>>2]=Ec;if((c[Ic>>2]|0)!=0){c[fc>>2]=Jc;c[ec>>2]=c[fc>>2];fc=c[Ic>>2]|0;c[Cc>>2]=(c[ec>>2]|0)+4;c[Dc>>2]=fc;fc=c[Cc>>2]|0;if(a[fc+5|0]&1){Cc=c[fc>>2]|0;c[Bc>>2]=(c[Dc>>2]|0)+80;ec=c[Bc>>2]|0;c[sc>>2]=Cc;c[tc>>2]=ec;ec=c[sc>>2]|0;sc=c[tc>>2]|0;a[rc+0|0]=a[uc+0|0]|0;c[pc>>2]=ec;c[qc>>2]=sc}if(a[fc+4|0]&1){sc=c[fc>>2]|0;c[ic>>2]=(c[Dc>>2]|0)+16;qc=c[ic>>2]|0;c[mc>>2]=sc;c[nc>>2]=qc;qc=c[mc>>2]|0;mc=c[nc>>2]|0;a[lc+0|0]=a[oc+0|0]|0;c[jc>>2]=qc;c[kc>>2]=mc}if((c[Dc>>2]|0)!=0){mc=c[Dc>>2]|0;c[yc>>2]=c[fc>>2];c[zc>>2]=mc;c[Ac>>2]=1;mc=c[zc>>2]|0;zc=c[Ac>>2]|0;c[vc>>2]=c[yc>>2];c[wc>>2]=mc;c[xc>>2]=zc;Jo(c[wc>>2]|0)}}c[ge>>2]=1;c[qd>>2]=ce;c[pd>>2]=c[qd>>2];c[md>>2]=c[pd>>2];c[nd>>2]=0;pd=c[md>>2]|0;c[ld>>2]=pd;c[kd>>2]=c[ld>>2];c[od>>2]=c[c[kd>>2]>>2];kd=c[nd>>2]|0;c[Pc>>2]=pd;c[Oc>>2]=c[Pc>>2];c[c[Oc>>2]>>2]=kd;if((c[od>>2]|0)==0){i=f;return}c[Nc>>2]=pd;c[Mc>>2]=c[Nc>>2];Nc=c[od>>2]|0;c[id>>2]=(c[Mc>>2]|0)+4;c[jd>>2]=Nc;Nc=c[id>>2]|0;if(a[Nc+5|0]&1){id=c[Nc>>2]|0;c[hd>>2]=(c[jd>>2]|0)+80;Mc=c[hd>>2]|0;c[_c>>2]=id;c[$c>>2]=Mc;Mc=c[_c>>2]|0;_c=c[$c>>2]|0;a[Zc+0|0]=a[ad+0|0]|0;c[Xc>>2]=Mc;c[Yc>>2]=_c}if(a[Nc+4|0]&1){_c=c[Nc>>2]|0;c[Qc>>2]=(c[jd>>2]|0)+16;Yc=c[Qc>>2]|0;c[Uc>>2]=_c;c[Vc>>2]=Yc;Yc=c[Uc>>2]|0;Uc=c[Vc>>2]|0;a[Tc+0|0]=a[Wc+0|0]|0;c[Rc>>2]=Yc;c[Sc>>2]=Uc}if((c[jd>>2]|0)==0){i=f;return}Uc=c[jd>>2]|0;c[ed>>2]=c[Nc>>2];c[fd>>2]=Uc;c[gd>>2]=1;Uc=c[fd>>2]|0;fd=c[gd>>2]|0;c[bd>>2]=c[ed>>2];c[cd>>2]=Uc;c[dd>>2]=fd;Jo(c[cd>>2]|0);i=f;return}function Fd(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0;f=i;i=i+144|0;g=f+140|0;h=f+132|0;j=f+128|0;k=f+124|0;l=f+116|0;m=f+112|0;n=f+104|0;o=f+100|0;p=f+96|0;q=f+88|0;r=f+84|0;s=f+80|0;t=f+76|0;u=f+72|0;v=f+68|0;w=f+64|0;x=f+56|0;y=f+52|0;z=f+48|0;A=f+44|0;B=f+36|0;C=f+32|0;D=f+28|0;E=f+24|0;F=f+20|0;G=f+16|0;H=f+12|0;I=f+8|0;J=f+4|0;K=f;c[E>>2]=a;c[F>>2]=b;c[G>>2]=d;c[H>>2]=e;e=c[E>>2]|0;c[B>>2]=D;c[C>>2]=-1;E=c[C>>2]|0;c[A>>2]=c[B>>2];c[f+40>>2]=E;c[c[A>>2]>>2]=0;c[I>>2]=c[D>>2];c[f+60>>2]=I;c[c[H>>2]>>2]=0;c[h>>2]=k;c[j>>2]=-1;I=c[j>>2]|0;c[g>>2]=c[h>>2];c[f+136>>2]=I;c[c[g>>2]>>2]=0;c[J>>2]=c[k>>2];c[f+120>>2]=J;c[(c[H>>2]|0)+4>>2]=0;c[(c[H>>2]|0)+8>>2]=c[F>>2];c[c[G>>2]>>2]=c[H>>2];c[l>>2]=e;H=c[c[c[l>>2]>>2]>>2]|0;c[n>>2]=p;c[o>>2]=-1;l=c[o>>2]|0;c[m>>2]=c[n>>2];c[f+108>>2]=l;c[c[m>>2]>>2]=0;c[K>>2]=c[p>>2];c[f+92>>2]=K;if((H|0)!=0){c[q>>2]=e;H=c[c[c[q>>2]>>2]>>2]|0;c[r>>2]=e;c[c[r>>2]>>2]=H}c[w>>2]=e;c[v>>2]=(c[w>>2]|0)+4;c[u>>2]=c[v>>2];c[t>>2]=c[u>>2];c[s>>2]=c[t>>2];Gd(c[c[s>>2]>>2]|0,c[c[G>>2]>>2]|0);c[z>>2]=e;c[y>>2]=(c[z>>2]|0)+8;c[x>>2]=c[y>>2];y=c[x>>2]|0;c[y>>2]=(c[y>>2]|0)+1;i=f;return}function Gd(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;e=i;i=i+96|0;f=e+80|0;g=e+76|0;h=e+72|0;j=e+68|0;k=e+64|0;l=e+60|0;m=e+56|0;n=e+52|0;o=e+48|0;p=e+44|0;q=e+40|0;r=e+36|0;s=e+32|0;t=e+28|0;u=e+24|0;v=e+20|0;w=e+16|0;x=e+12|0;y=e+8|0;z=e+4|0;A=e;c[v>>2]=b;c[w>>2]=d;a[(c[w>>2]|0)+12|0]=(c[w>>2]|0)==(c[v>>2]|0)|0;while(1){if((c[w>>2]|0)==(c[v>>2]|0)){B=17;break}if(!(a[(c[(c[w>>2]|0)+8>>2]|0)+12|0]&1^1)){B=17;break}c[u>>2]=c[(c[w>>2]|0)+8>>2];d=c[(c[(c[w>>2]|0)+8>>2]|0)+8>>2]|0;if((c[u>>2]|0)==(c[c[(c[u>>2]|0)+8>>2]>>2]|0)){c[x>>2]=c[d+4>>2];b=c[x>>2]|0;c[r>>2]=t;c[s>>2]=-1;C=c[s>>2]|0;c[p>>2]=c[r>>2];c[q>>2]=C;c[c[p>>2]>>2]=0;c[y>>2]=c[t>>2];c[o>>2]=y;if((b|0)==0){B=8;break}if(a[(c[x>>2]|0)+12|0]&1){B=8;break}c[w>>2]=c[(c[w>>2]|0)+8>>2];a[(c[w>>2]|0)+12|0]=1;c[w>>2]=c[(c[w>>2]|0)+8>>2];a[(c[w>>2]|0)+12|0]=(c[w>>2]|0)==(c[v>>2]|0)|0;a[(c[x>>2]|0)+12|0]=1;continue}else{c[z>>2]=c[d>>2];d=c[z>>2]|0;c[j>>2]=l;c[k>>2]=-1;b=c[k>>2]|0;c[g>>2]=c[j>>2];c[h>>2]=b;c[c[g>>2]>>2]=0;c[A>>2]=c[l>>2];c[m>>2]=A;if((d|0)==0){B=14;break}if(a[(c[z>>2]|0)+12|0]&1){B=14;break}c[w>>2]=c[(c[w>>2]|0)+8>>2];a[(c[w>>2]|0)+12|0]=1;c[w>>2]=c[(c[w>>2]|0)+8>>2];a[(c[w>>2]|0)+12|0]=(c[w>>2]|0)==(c[v>>2]|0)|0;a[(c[z>>2]|0)+12|0]=1;continue}}if((B|0)==8){c[f>>2]=c[w>>2];if((c[f>>2]|0)!=(c[c[(c[f>>2]|0)+8>>2]>>2]|0)){c[w>>2]=c[(c[w>>2]|0)+8>>2];Hd(c[w>>2]|0)}c[w>>2]=c[(c[w>>2]|0)+8>>2];a[(c[w>>2]|0)+12|0]=1;c[w>>2]=c[(c[w>>2]|0)+8>>2];a[(c[w>>2]|0)+12|0]=0;Id(c[w>>2]|0);i=e;return}else if((B|0)==14){c[n>>2]=c[w>>2];if((c[n>>2]|0)==(c[c[(c[n>>2]|0)+8>>2]>>2]|0)){c[w>>2]=c[(c[w>>2]|0)+8>>2];Id(c[w>>2]|0)}c[w>>2]=c[(c[w>>2]|0)+8>>2];a[(c[w>>2]|0)+12|0]=1;c[w>>2]=c[(c[w>>2]|0)+8>>2];a[(c[w>>2]|0)+12|0]=0;Hd(c[w>>2]|0);i=e;return}else if((B|0)==17){i=e;return}}function Hd(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;b=i;i=i+48|0;d=b+32|0;e=b+28|0;f=b+20|0;g=b+16|0;h=b+12|0;j=b+8|0;k=b+4|0;l=b;c[j>>2]=a;c[k>>2]=c[(c[j>>2]|0)+4>>2];c[(c[j>>2]|0)+4>>2]=c[c[k>>2]>>2];a=c[(c[j>>2]|0)+4>>2]|0;c[f>>2]=h;c[g>>2]=-1;m=c[g>>2]|0;c[e>>2]=c[f>>2];c[b+24>>2]=m;c[c[e>>2]>>2]=0;c[l>>2]=c[h>>2];c[b+36>>2]=l;if((a|0)!=0){c[(c[(c[j>>2]|0)+4>>2]|0)+8>>2]=c[j>>2]}c[(c[k>>2]|0)+8>>2]=c[(c[j>>2]|0)+8>>2];c[d>>2]=c[j>>2];a=c[k>>2]|0;l=c[(c[j>>2]|0)+8>>2]|0;if((c[d>>2]|0)==(c[c[(c[d>>2]|0)+8>>2]>>2]|0)){c[l>>2]=a;n=c[j>>2]|0;o=c[k>>2]|0;c[o>>2]=n;p=c[k>>2]|0;q=c[j>>2]|0;r=q+8|0;c[r>>2]=p;i=b;return}else{c[l+4>>2]=a;n=c[j>>2]|0;o=c[k>>2]|0;c[o>>2]=n;p=c[k>>2]|0;q=c[j>>2]|0;r=q+8|0;c[r>>2]=p;i=b;return}}function Id(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;b=i;i=i+48|0;d=b+32|0;e=b+28|0;f=b+20|0;g=b+16|0;h=b+12|0;j=b+8|0;k=b+4|0;l=b;c[j>>2]=a;c[k>>2]=c[c[j>>2]>>2];c[c[j>>2]>>2]=c[(c[k>>2]|0)+4>>2];a=c[c[j>>2]>>2]|0;c[f>>2]=h;c[g>>2]=-1;m=c[g>>2]|0;c[e>>2]=c[f>>2];c[b+24>>2]=m;c[c[e>>2]>>2]=0;c[l>>2]=c[h>>2];c[b+36>>2]=l;if((a|0)!=0){c[(c[c[j>>2]>>2]|0)+8>>2]=c[j>>2]}c[(c[k>>2]|0)+8>>2]=c[(c[j>>2]|0)+8>>2];c[d>>2]=c[j>>2];a=c[k>>2]|0;l=c[(c[j>>2]|0)+8>>2]|0;if((c[d>>2]|0)==(c[c[(c[d>>2]|0)+8>>2]>>2]|0)){c[l>>2]=a;n=c[j>>2]|0;o=c[k>>2]|0;p=o+4|0;c[p>>2]=n;q=c[k>>2]|0;r=c[j>>2]|0;s=r+8|0;c[s>>2]=q;i=b;return}else{c[l+4>>2]=a;n=c[j>>2]|0;o=c[k>>2]|0;p=o+4|0;c[p>>2]=n;q=c[k>>2]|0;r=c[j>>2]|0;s=r+8|0;c[s>>2]=q;i=b;return}}function Jd(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=i;i=i+16|0;e=d+4|0;f=d;c[e>>2]=a;c[f>>2]=b;b=(Yo(c[e>>2]|0,c[f>>2]|0,63)|0)<0;i=d;return b|0}function Kd(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0;e=i;i=i+208|0;f=e+192|0;g=e+188|0;h=e+184|0;j=e+180|0;k=e+176|0;l=e+172|0;m=e+168|0;n=e+164|0;o=e+160|0;p=e+156|0;q=e+152|0;r=e+148|0;s=e+144|0;t=e+140|0;u=e+136|0;v=e+132|0;w=e+128|0;x=e+124|0;y=e+120|0;z=e+116|0;A=e+112|0;B=e+108|0;C=e+104|0;D=e+96|0;E=e+92|0;F=e+88|0;G=e+84|0;H=e+80|0;I=e+76|0;J=e+72|0;K=e+68|0;L=e+64|0;M=e+60|0;N=e+56|0;O=e+52|0;P=e+48|0;Q=e+44|0;R=e+40|0;S=e+36|0;T=e+32|0;U=e+28|0;V=e+24|0;W=e+20|0;X=e+16|0;Y=e+12|0;Z=e+8|0;_=e+4|0;$=e;c[Y>>2]=b;c[Z>>2]=d;d=c[Y>>2]|0;Y=c[Z>>2]|0;c[X>>2]=d;c[W>>2]=c[X>>2];c[V>>2]=(c[W>>2]|0)+4;c[U>>2]=c[V>>2];c[T>>2]=c[U>>2];c[S>>2]=c[T>>2];T=c[c[S>>2]>>2]|0;c[C>>2]=d;c[B>>2]=(c[C>>2]|0)+4;c[A>>2]=c[B>>2];c[z>>2]=c[A>>2];c[y>>2]=c[z>>2];Ld(_,d,Y,T,c[y>>2]|0);c[p>>2]=d;c[o>>2]=c[p>>2];c[n>>2]=(c[o>>2]|0)+4;c[m>>2]=c[n>>2];c[l>>2]=c[m>>2];c[k>>2]=c[l>>2];l=c[k>>2]|0;c[h>>2]=$;c[j>>2]=l;l=c[j>>2]|0;c[f>>2]=c[h>>2];c[g>>2]=l;c[c[f>>2]>>2]=c[g>>2];c[s>>2]=_;c[t>>2]=$;$=c[t>>2]|0;c[q>>2]=c[s>>2];c[r>>2]=$;if((c[c[q>>2]>>2]|0)==(c[c[r>>2]>>2]|0)^1?(c[w>>2]=d,c[v>>2]=(c[w>>2]|0)+8,c[u>>2]=c[v>>2],v=c[u>>2]|0,u=c[Z>>2]|0,c[x>>2]=_,Z=(c[c[x>>2]>>2]|0)+16|0,c[F>>2]=v,c[G>>2]=u,c[H>>2]=Z,Z=c[G>>2]|0,G=c[H>>2]|0,c[e+100>>2]=c[F>>2],c[D>>2]=Z,c[E>>2]=G,!(Jd(c[D>>2]|0,c[E>>2]|0)|0)):0){c[a+0>>2]=c[_+0>>2];i=e;return}c[R>>2]=d;c[Q>>2]=c[R>>2];c[P>>2]=(c[Q>>2]|0)+4;c[O>>2]=c[P>>2];c[N>>2]=c[O>>2];c[M>>2]=c[N>>2];N=c[M>>2]|0;c[K>>2]=a;c[L>>2]=N;N=c[L>>2]|0;c[I>>2]=c[K>>2];c[J>>2]=N;c[c[I>>2]>>2]=c[J>>2];i=e;return}function Ld(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;g=i;i=i+96|0;h=g+92|0;j=g+88|0;k=g+84|0;l=g+80|0;m=g+76|0;n=g+72|0;o=g+68|0;p=g+64|0;q=g+60|0;r=g+56|0;s=g+52|0;t=g+48|0;u=g+44|0;v=g+40|0;w=g+36|0;x=g+32|0;y=g+28|0;z=g+24|0;A=g+20|0;B=g+16|0;C=g+12|0;D=g+8|0;E=g+4|0;F=g;c[B>>2]=b;c[C>>2]=d;c[D>>2]=e;c[E>>2]=f;f=c[B>>2]|0;while(1){B=c[D>>2]|0;c[y>>2]=A;c[z>>2]=-1;e=c[z>>2]|0;c[w>>2]=c[y>>2];c[x>>2]=e;c[c[w>>2]>>2]=0;c[F>>2]=c[A>>2];c[l>>2]=F;if((B|0)==0){break}c[k>>2]=f;c[j>>2]=(c[k>>2]|0)+8;c[h>>2]=c[j>>2];B=(c[D>>2]|0)+16|0;e=c[C>>2]|0;c[p>>2]=c[h>>2];c[q>>2]=B;c[r>>2]=e;e=c[q>>2]|0;B=c[r>>2]|0;c[m>>2]=c[p>>2];c[n>>2]=e;c[o>>2]=B;B=Jd(c[n>>2]|0,c[o>>2]|0)|0;e=c[D>>2]|0;if(B){c[D>>2]=c[e+4>>2];continue}else{c[E>>2]=e;c[D>>2]=c[c[D>>2]>>2];continue}}D=c[E>>2]|0;c[u>>2]=a;c[v>>2]=D;D=c[v>>2]|0;c[s>>2]=c[u>>2];c[t>>2]=D;c[c[s>>2]>>2]=c[t>>2];i=g;return}function Md(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=i;i=i+16|0;e=d+4|0;f=d;c[e>>2]=a;c[f>>2]=b;Nd(c[e>>2]|0,c[f>>2]|0);i=d;return}function Nd(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;e=i;i=i+128|0;f=e+112|0;g=e+108|0;h=e+104|0;j=e+100|0;k=e+96|0;l=e+16|0;m=e+92|0;n=e+88|0;o=e+84|0;p=e+117|0;q=e+8|0;r=e+80|0;s=e+76|0;t=e;u=e+72|0;v=e+68|0;w=e+64|0;x=e+60|0;y=e+56|0;z=e+52|0;A=e+48|0;B=e+44|0;C=e+36|0;D=e+32|0;E=e+28|0;F=e+24|0;G=e+116|0;c[F>>2]=b;c[e+20>>2]=d;d=c[F>>2]|0;c[E>>2]=d+4;c[D>>2]=c[E>>2];c[C>>2]=c[D>>2];D=c[C>>2]|0;c[e+40>>2]=D;c[B>>2]=D;c[A>>2]=c[B>>2];c[c[A>>2]>>2]=0;A=d+8|0;a[t+0|0]=a[G+0|0]|0;c[r>>2]=A;c[s>>2]=0;A=c[r>>2]|0;r=c[s>>2]|0;a[q+0|0]=a[t+0|0]|0;c[n>>2]=A;c[o>>2]=r;r=c[n>>2]|0;c[m>>2]=o;o=c[c[m>>2]>>2]|0;c[f>>2]=q;a[l+0|0]=a[p+0|0]|0;c[j>>2]=r;c[k>>2]=o;o=c[j>>2]|0;c[h>>2]=l;c[g>>2]=k;c[o>>2]=c[c[g>>2]>>2];c[y>>2]=d;c[x>>2]=(c[y>>2]|0)+4;c[w>>2]=c[x>>2];c[v>>2]=c[w>>2];c[u>>2]=c[v>>2];v=c[u>>2]|0;c[z>>2]=d;c[c[z>>2]>>2]=v;i=e;return}function Od(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0;f=i;i=i+1936|0;g=f+1924|0;h=f+1920|0;j=f+1916|0;k=f+1912|0;l=f+1908|0;m=f+1904|0;n=f+1900|0;o=f+1896|0;p=f+1624|0;q=f+1616|0;r=f+1612|0;s=f+1608|0;t=f+1604|0;u=f+1600|0;v=f+1328|0;w=f+1320|0;x=f+1316|0;y=f+1312|0;z=f+1308|0;A=f+1304|0;B=f+1300|0;C=f+1296|0;D=f+1292|0;E=f+1288|0;F=f+1284|0;G=f+1280|0;H=f+1008|0;I=f+1004|0;J=f+1e3|0;K=f+996|0;L=f+992|0;M=f+988|0;N=f+984|0;O=f+980|0;P=f+976|0;Q=f+704|0;R=f+696|0;S=f+692|0;T=f+688|0;U=f+684|0;V=f+680|0;W=f+676|0;X=f+672|0;Y=f+668|0;Z=f+664|0;_=f+660|0;$=f+656|0;aa=f+384|0;ba=f+380|0;ca=f+376|0;da=f+372|0;ea=f+368|0;fa=f+364|0;ga=f+360|0;ha=f+356|0;ia=f+352|0;ja=f+348|0;ka=f+344|0;la=f+340|0;ma=f+336|0;na=f+332|0;oa=f+328|0;pa=f+56|0;qa=f+52|0;ra=f+48|0;sa=f+44|0;ta=f+40|0;ua=f+36|0;va=f+32|0;wa=f+24|0;xa=f+20|0;ya=f+16|0;za=f+12|0;Aa=f+8|0;Ba=f+4|0;Ca=f;Da=f+1928|0;c[ta>>2]=b;c[ua>>2]=d;c[va>>2]=e;c[f+28>>2]=30;a:while(1){c[wa>>2]=((c[ua>>2]|0)-(c[ta>>2]|0)|0)/272|0;switch(c[wa>>2]|0){case 2:{Ea=3;break a;break};case 3:{Ea=5;break a;break};case 5:{Ea=7;break a;break};case 4:{Ea=6;break a;break};case 1:case 0:{Ea=49;break a;break};default:{}}Fa=c[ta>>2]|0;if((c[wa>>2]|0)<=30){Ea=9;break}c[xa>>2]=Fa;c[ya>>2]=c[ua>>2];c[ya>>2]=(c[ya>>2]|0)+ -272;e=(c[wa>>2]|0)>=1e3;c[Aa>>2]=(c[wa>>2]|0)/2|0;c[xa>>2]=(c[xa>>2]|0)+((c[Aa>>2]|0)*272|0);if(e){c[Aa>>2]=(c[Aa>>2]|0)/2|0;c[za>>2]=Rd(c[ta>>2]|0,(c[ta>>2]|0)+((c[Aa>>2]|0)*272|0)|0,c[xa>>2]|0,(c[xa>>2]|0)+((c[Aa>>2]|0)*272|0)|0,c[ya>>2]|0,c[va>>2]|0)|0}else{c[za>>2]=Pd(c[ta>>2]|0,c[xa>>2]|0,c[ya>>2]|0,c[va>>2]|0)|0}c[Ba>>2]=c[ta>>2];c[Ca>>2]=c[ya>>2];e=c[Ba>>2]|0;d=c[xa>>2]|0;c[ha>>2]=c[va>>2];c[ia>>2]=e;c[ja>>2]=d;do{if(!(Ud(c[ia>>2]|0,c[ja>>2]|0)|0)){while(1){d=c[Ba>>2]|0;e=(c[Ca>>2]|0)+ -272|0;c[Ca>>2]=e;if((d|0)==(e|0)){break}e=c[Ca>>2]|0;d=c[xa>>2]|0;c[I>>2]=c[va>>2];c[J>>2]=e;c[K>>2]=d;if(Ud(c[J>>2]|0,c[K>>2]|0)|0){Ea=28;break}}if((Ea|0)==28){Ea=0;d=c[Ca>>2]|0;c[F>>2]=c[Ba>>2];c[G>>2]=d;c[E>>2]=c[F>>2];dp(H|0,c[E>>2]|0,272)|0;d=c[F>>2]|0;c[C>>2]=c[G>>2];dp(d|0,c[C>>2]|0,270)|0;d=c[G>>2]|0;c[D>>2]=H;dp(d|0,c[D>>2]|0,270)|0;c[za>>2]=(c[za>>2]|0)+1;break}c[Ba>>2]=(c[Ba>>2]|0)+272;c[Ca>>2]=c[ua>>2];d=c[va>>2]|0;e=c[ta>>2]|0;b=(c[Ca>>2]|0)+ -272|0;c[Ca>>2]=b;c[ea>>2]=d;c[fa>>2]=e;c[ga>>2]=b;if(!(Ud(c[fa>>2]|0,c[ga>>2]|0)|0)){while(1){if((c[Ba>>2]|0)==(c[Ca>>2]|0)){Ea=49;break a}b=c[ta>>2]|0;e=c[Ba>>2]|0;c[ba>>2]=c[va>>2];c[ca>>2]=b;c[da>>2]=e;e=Ud(c[ca>>2]|0,c[da>>2]|0)|0;Ga=c[Ba>>2]|0;if(e){break}c[Ba>>2]=Ga+272}e=c[Ca>>2]|0;c[_>>2]=Ga;c[$>>2]=e;c[Z>>2]=c[_>>2];dp(aa|0,c[Z>>2]|0,272)|0;e=c[_>>2]|0;c[X>>2]=c[$>>2];dp(e|0,c[X>>2]|0,270)|0;e=c[$>>2]|0;c[Y>>2]=aa;dp(e|0,c[Y>>2]|0,270)|0;c[za>>2]=(c[za>>2]|0)+1;c[Ba>>2]=(c[Ba>>2]|0)+272}if((c[Ba>>2]|0)==(c[Ca>>2]|0)){Ea=49;break a}while(1){e=c[ta>>2]|0;b=c[Ba>>2]|0;c[U>>2]=c[va>>2];c[V>>2]=e;c[W>>2]=b;if((Ud(c[V>>2]|0,c[W>>2]|0)|0)^1){c[Ba>>2]=(c[Ba>>2]|0)+272;continue}do{b=c[va>>2]|0;e=c[ta>>2]|0;d=(c[Ca>>2]|0)+ -272|0;c[Ca>>2]=d;c[R>>2]=b;c[S>>2]=e;c[T>>2]=d}while(Ud(c[S>>2]|0,c[T>>2]|0)|0);Ha=c[Ba>>2]|0;if((c[Ba>>2]|0)>>>0>=(c[Ca>>2]|0)>>>0){break}d=c[Ca>>2]|0;c[O>>2]=Ha;c[P>>2]=d;c[N>>2]=c[O>>2];dp(Q|0,c[N>>2]|0,272)|0;d=c[O>>2]|0;c[L>>2]=c[P>>2];dp(d|0,c[L>>2]|0,270)|0;d=c[P>>2]|0;c[M>>2]=Q;dp(d|0,c[M>>2]|0,270)|0;c[za>>2]=(c[za>>2]|0)+1;c[Ba>>2]=(c[Ba>>2]|0)+272}c[ta>>2]=Ha;continue a}}while(0);c[Ba>>2]=(c[Ba>>2]|0)+272;b:do{if((c[Ba>>2]|0)>>>0<(c[Ca>>2]|0)>>>0){while(1){d=c[Ba>>2]|0;e=c[xa>>2]|0;c[z>>2]=c[va>>2];c[A>>2]=d;c[B>>2]=e;if(Ud(c[A>>2]|0,c[B>>2]|0)|0){c[Ba>>2]=(c[Ba>>2]|0)+272;continue}do{e=c[va>>2]|0;d=(c[Ca>>2]|0)+ -272|0;c[Ca>>2]=d;b=c[xa>>2]|0;c[w>>2]=e;c[x>>2]=d;c[y>>2]=b}while((Ud(c[x>>2]|0,c[y>>2]|0)|0)^1);if((c[Ba>>2]|0)>>>0>(c[Ca>>2]|0)>>>0){break b}b=c[Ca>>2]|0;c[t>>2]=c[Ba>>2];c[u>>2]=b;c[s>>2]=c[t>>2];dp(v|0,c[s>>2]|0,272)|0;b=c[t>>2]|0;c[q>>2]=c[u>>2];dp(b|0,c[q>>2]|0,270)|0;b=c[u>>2]|0;c[r>>2]=v;dp(b|0,c[r>>2]|0,270)|0;c[za>>2]=(c[za>>2]|0)+1;if((c[xa>>2]|0)==(c[Ba>>2]|0)){c[xa>>2]=c[Ca>>2]}c[Ba>>2]=(c[Ba>>2]|0)+272}}}while(0);if((c[Ba>>2]|0)!=(c[xa>>2]|0)?(b=c[xa>>2]|0,d=c[Ba>>2]|0,c[g>>2]=c[va>>2],c[h>>2]=b,c[j>>2]=d,Ud(c[h>>2]|0,c[j>>2]|0)|0):0){d=c[xa>>2]|0;c[n>>2]=c[Ba>>2];c[o>>2]=d;c[m>>2]=c[n>>2];dp(p|0,c[m>>2]|0,272)|0;d=c[n>>2]|0;c[k>>2]=c[o>>2];dp(d|0,c[k>>2]|0,270)|0;d=c[o>>2]|0;c[l>>2]=p;dp(d|0,c[l>>2]|0,270)|0;c[za>>2]=(c[za>>2]|0)+1}do{if((c[za>>2]|0)==0){a[Da]=(Td(c[ta>>2]|0,c[Ba>>2]|0,c[va>>2]|0)|0)&1;d=Td((c[Ba>>2]|0)+272|0,c[ua>>2]|0,c[va>>2]|0)|0;b=a[Da]&1;if(d){if(b){Ea=49;break a}c[ua>>2]=c[Ba>>2];continue a}else{if(!b){break}b=(c[Ba>>2]|0)+272|0;c[Ba>>2]=b;c[ta>>2]=b;continue a}}}while(0);if((((c[Ba>>2]|0)-(c[ta>>2]|0)|0)/272|0|0)<(((c[ua>>2]|0)-(c[Ba>>2]|0)|0)/272|0|0)){Od(c[ta>>2]|0,c[Ba>>2]|0,c[va>>2]|0);b=(c[Ba>>2]|0)+272|0;c[Ba>>2]=b;c[ta>>2]=b;continue}else{Od((c[Ba>>2]|0)+272|0,c[ua>>2]|0,c[va>>2]|0);c[ua>>2]=c[Ba>>2];continue}}if((Ea|0)==3){Ba=c[va>>2]|0;Da=(c[ua>>2]|0)+ -272|0;c[ua>>2]=Da;za=c[ta>>2]|0;c[qa>>2]=Ba;c[ra>>2]=Da;c[sa>>2]=za;if(!(Ud(c[ra>>2]|0,c[sa>>2]|0)|0)){i=f;return}sa=c[ua>>2]|0;c[na>>2]=c[ta>>2];c[oa>>2]=sa;c[ma>>2]=c[na>>2];dp(pa|0,c[ma>>2]|0,272)|0;ma=c[na>>2]|0;c[ka>>2]=c[oa>>2];dp(ma|0,c[ka>>2]|0,270)|0;ka=c[oa>>2]|0;c[la>>2]=pa;dp(ka|0,c[la>>2]|0,270)|0;i=f;return}else if((Ea|0)==5){la=c[ta>>2]|0;ka=(c[ta>>2]|0)+272|0;pa=(c[ua>>2]|0)+ -272|0;c[ua>>2]=pa;Pd(la,ka,pa,c[va>>2]|0)|0;i=f;return}else if((Ea|0)==6){pa=c[ta>>2]|0;ka=(c[ta>>2]|0)+272|0;la=(c[ta>>2]|0)+544|0;oa=(c[ua>>2]|0)+ -272|0;c[ua>>2]=oa;Qd(pa,ka,la,oa,c[va>>2]|0)|0;i=f;return}else if((Ea|0)==7){oa=c[ta>>2]|0;la=(c[ta>>2]|0)+272|0;ka=(c[ta>>2]|0)+544|0;pa=(c[ta>>2]|0)+816|0;ta=(c[ua>>2]|0)+ -272|0;c[ua>>2]=ta;Rd(oa,la,ka,pa,ta,c[va>>2]|0)|0;i=f;return}else if((Ea|0)==9){Sd(Fa,c[ua>>2]|0,c[va>>2]|0);i=f;return}else if((Ea|0)==49){i=f;return}}function Pd(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0;f=i;i=i+1568|0;g=f+1552|0;h=f+1548|0;j=f+1544|0;k=f+1540|0;l=f+1536|0;m=f+1532|0;n=f+1528|0;o=f+1256|0;p=f+1248|0;q=f+1244|0;r=f+1240|0;s=f+1236|0;t=f+1232|0;u=f+960|0;v=f+952|0;w=f+948|0;x=f+944|0;y=f+940|0;z=f+936|0;A=f+664|0;B=f+656|0;C=f+652|0;D=f+648|0;E=f+644|0;F=f+640|0;G=f+636|0;H=f+632|0;I=f+628|0;J=f+624|0;K=f+620|0;L=f+616|0;M=f+344|0;N=f+336|0;O=f+332|0;P=f+328|0;Q=f+324|0;R=f+320|0;S=f+48|0;T=f+44|0;U=f+40|0;V=f+36|0;W=f+28|0;X=f+24|0;Y=f+20|0;Z=f+16|0;_=f+12|0;$=f+8|0;aa=f+4|0;ba=f;c[Z>>2]=a;c[_>>2]=b;c[$>>2]=d;c[aa>>2]=e;c[ba>>2]=0;e=c[_>>2]|0;d=c[Z>>2]|0;c[f+32>>2]=c[aa>>2];c[W>>2]=e;c[X>>2]=d;d=Ud(c[W>>2]|0,c[X>>2]|0)|0;X=c[aa>>2]|0;W=c[$>>2]|0;e=c[_>>2]|0;if(d){c[f+1556>>2]=X;c[g>>2]=W;c[h>>2]=e;d=Ud(c[g>>2]|0,c[h>>2]|0)|0;h=c[Z>>2]|0;if(d){d=c[$>>2]|0;c[m>>2]=h;c[n>>2]=d;c[l>>2]=c[m>>2];dp(o|0,c[l>>2]|0,272)|0;l=c[m>>2]|0;c[j>>2]=c[n>>2];dp(l|0,c[j>>2]|0,270)|0;j=c[n>>2]|0;c[k>>2]=o;dp(j|0,c[k>>2]|0,270)|0;c[ba>>2]=1;c[Y>>2]=c[ba>>2];ca=c[Y>>2]|0;i=f;return ca|0}k=c[_>>2]|0;c[s>>2]=h;c[t>>2]=k;c[r>>2]=c[s>>2];dp(u|0,c[r>>2]|0,272)|0;r=c[s>>2]|0;c[p>>2]=c[t>>2];dp(r|0,c[p>>2]|0,270)|0;p=c[t>>2]|0;c[q>>2]=u;dp(p|0,c[q>>2]|0,270)|0;c[ba>>2]=1;q=c[$>>2]|0;p=c[_>>2]|0;c[E>>2]=c[aa>>2];c[F>>2]=q;c[G>>2]=p;if(Ud(c[F>>2]|0,c[G>>2]|0)|0){G=c[$>>2]|0;c[K>>2]=c[_>>2];c[L>>2]=G;c[J>>2]=c[K>>2];dp(M|0,c[J>>2]|0,272)|0;J=c[K>>2]|0;c[H>>2]=c[L>>2];dp(J|0,c[H>>2]|0,270)|0;H=c[L>>2]|0;c[I>>2]=M;dp(H|0,c[I>>2]|0,270)|0;c[ba>>2]=2}c[Y>>2]=c[ba>>2];ca=c[Y>>2]|0;i=f;return ca|0}else{c[T>>2]=X;c[U>>2]=W;c[V>>2]=e;if(!(Ud(c[U>>2]|0,c[V>>2]|0)|0)){c[Y>>2]=c[ba>>2];ca=c[Y>>2]|0;i=f;return ca|0}V=c[$>>2]|0;c[Q>>2]=c[_>>2];c[R>>2]=V;c[P>>2]=c[Q>>2];dp(S|0,c[P>>2]|0,272)|0;P=c[Q>>2]|0;c[N>>2]=c[R>>2];dp(P|0,c[N>>2]|0,270)|0;N=c[R>>2]|0;c[O>>2]=S;dp(N|0,c[O>>2]|0,270)|0;c[ba>>2]=1;O=c[_>>2]|0;N=c[Z>>2]|0;c[B>>2]=c[aa>>2];c[C>>2]=O;c[D>>2]=N;if(Ud(c[C>>2]|0,c[D>>2]|0)|0){D=c[_>>2]|0;c[y>>2]=c[Z>>2];c[z>>2]=D;c[x>>2]=c[y>>2];dp(A|0,c[x>>2]|0,272)|0;x=c[y>>2]|0;c[v>>2]=c[z>>2];dp(x|0,c[v>>2]|0,270)|0;v=c[z>>2]|0;c[w>>2]=A;dp(v|0,c[w>>2]|0,270)|0;c[ba>>2]=2}c[Y>>2]=c[ba>>2];ca=c[Y>>2]|0;i=f;return ca|0}return 0}function Qd(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;g=i;i=i+960|0;h=g+944|0;j=g+940|0;k=g+936|0;l=g+932|0;m=g+928|0;n=g+656|0;o=g+644|0;p=g+640|0;q=g+632|0;r=g+628|0;s=g+624|0;t=g+620|0;u=g+616|0;v=g+612|0;w=g+608|0;x=g+336|0;y=g+328|0;z=g+324|0;A=g+320|0;B=g+316|0;C=g+312|0;D=g+40|0;E=g+28|0;F=g+24|0;G=g+20|0;H=g+16|0;I=g+12|0;J=g+8|0;K=g+4|0;L=g;c[G>>2]=a;c[H>>2]=b;c[I>>2]=d;c[J>>2]=e;c[K>>2]=f;c[L>>2]=Pd(c[G>>2]|0,c[H>>2]|0,c[I>>2]|0,c[K>>2]|0)|0;f=c[J>>2]|0;e=c[I>>2]|0;c[g+32>>2]=c[K>>2];c[E>>2]=f;c[F>>2]=e;if(!(Ud(c[E>>2]|0,c[F>>2]|0)|0)){M=c[L>>2]|0;i=g;return M|0}F=c[J>>2]|0;c[B>>2]=c[I>>2];c[C>>2]=F;c[A>>2]=c[B>>2];dp(D|0,c[A>>2]|0,272)|0;A=c[B>>2]|0;c[y>>2]=c[C>>2];dp(A|0,c[y>>2]|0,270)|0;y=c[C>>2]|0;c[z>>2]=D;dp(y|0,c[z>>2]|0,270)|0;c[L>>2]=(c[L>>2]|0)+1;z=c[I>>2]|0;y=c[H>>2]|0;c[g+648>>2]=c[K>>2];c[o>>2]=z;c[p>>2]=y;if(!(Ud(c[o>>2]|0,c[p>>2]|0)|0)){M=c[L>>2]|0;i=g;return M|0}p=c[I>>2]|0;c[l>>2]=c[H>>2];c[m>>2]=p;c[k>>2]=c[l>>2];dp(n|0,c[k>>2]|0,272)|0;k=c[l>>2]|0;c[h>>2]=c[m>>2];dp(k|0,c[h>>2]|0,270)|0;h=c[m>>2]|0;c[j>>2]=n;dp(h|0,c[j>>2]|0,270)|0;c[L>>2]=(c[L>>2]|0)+1;j=c[H>>2]|0;h=c[G>>2]|0;c[g+636>>2]=c[K>>2];c[q>>2]=j;c[r>>2]=h;if(!(Ud(c[q>>2]|0,c[r>>2]|0)|0)){M=c[L>>2]|0;i=g;return M|0}r=c[H>>2]|0;c[v>>2]=c[G>>2];c[w>>2]=r;c[u>>2]=c[v>>2];dp(x|0,c[u>>2]|0,272)|0;u=c[v>>2]|0;c[s>>2]=c[w>>2];dp(u|0,c[s>>2]|0,270)|0;s=c[w>>2]|0;c[t>>2]=x;dp(s|0,c[t>>2]|0,270)|0;c[L>>2]=(c[L>>2]|0)+1;M=c[L>>2]|0;i=g;return M|0}function Rd(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0;h=i;i=i+1264|0;j=h+1248|0;k=h+1244|0;l=h+1240|0;m=h+1236|0;n=h+1232|0;o=h+1228|0;p=h+1224|0;q=h+952|0;r=h+944|0;s=h+940|0;t=h+936|0;u=h+932|0;v=h+928|0;w=h+656|0;x=h+644|0;y=h+640|0;z=h+632|0;A=h+628|0;B=h+624|0;C=h+620|0;D=h+616|0;E=h+612|0;F=h+608|0;G=h+336|0;H=h+328|0;I=h+324|0;J=h+320|0;K=h+316|0;L=h+312|0;M=h+40|0;N=h+32|0;O=h+28|0;P=h+24|0;Q=h+20|0;R=h+16|0;S=h+12|0;T=h+8|0;U=h+4|0;V=h;c[P>>2]=a;c[Q>>2]=b;c[R>>2]=d;c[S>>2]=e;c[T>>2]=f;c[U>>2]=g;c[V>>2]=Qd(c[P>>2]|0,c[Q>>2]|0,c[R>>2]|0,c[S>>2]|0,c[U>>2]|0)|0;g=c[T>>2]|0;f=c[S>>2]|0;c[h+36>>2]=c[U>>2];c[N>>2]=g;c[O>>2]=f;if(!(Ud(c[N>>2]|0,c[O>>2]|0)|0)){W=c[V>>2]|0;i=h;return W|0}O=c[T>>2]|0;c[K>>2]=c[S>>2];c[L>>2]=O;c[J>>2]=c[K>>2];dp(M|0,c[J>>2]|0,272)|0;J=c[K>>2]|0;c[H>>2]=c[L>>2];dp(J|0,c[H>>2]|0,270)|0;H=c[L>>2]|0;c[I>>2]=M;dp(H|0,c[I>>2]|0,270)|0;c[V>>2]=(c[V>>2]|0)+1;I=c[S>>2]|0;H=c[R>>2]|0;c[h+648>>2]=c[U>>2];c[x>>2]=I;c[y>>2]=H;if(!(Ud(c[x>>2]|0,c[y>>2]|0)|0)){W=c[V>>2]|0;i=h;return W|0}y=c[S>>2]|0;c[u>>2]=c[R>>2];c[v>>2]=y;c[t>>2]=c[u>>2];dp(w|0,c[t>>2]|0,272)|0;t=c[u>>2]|0;c[r>>2]=c[v>>2];dp(t|0,c[r>>2]|0,270)|0;r=c[v>>2]|0;c[s>>2]=w;dp(r|0,c[s>>2]|0,270)|0;c[V>>2]=(c[V>>2]|0)+1;s=c[R>>2]|0;r=c[Q>>2]|0;c[h+1252>>2]=c[U>>2];c[j>>2]=s;c[k>>2]=r;if(!(Ud(c[j>>2]|0,c[k>>2]|0)|0)){W=c[V>>2]|0;i=h;return W|0}k=c[R>>2]|0;c[o>>2]=c[Q>>2];c[p>>2]=k;c[n>>2]=c[o>>2];dp(q|0,c[n>>2]|0,272)|0;n=c[o>>2]|0;c[l>>2]=c[p>>2];dp(n|0,c[l>>2]|0,270)|0;l=c[p>>2]|0;c[m>>2]=q;dp(l|0,c[m>>2]|0,270)|0;c[V>>2]=(c[V>>2]|0)+1;m=c[Q>>2]|0;l=c[P>>2]|0;c[h+636>>2]=c[U>>2];c[z>>2]=m;c[A>>2]=l;if(!(Ud(c[z>>2]|0,c[A>>2]|0)|0)){W=c[V>>2]|0;i=h;return W|0}A=c[Q>>2]|0;c[E>>2]=c[P>>2];c[F>>2]=A;c[D>>2]=c[E>>2];dp(G|0,c[D>>2]|0,272)|0;D=c[E>>2]|0;c[B>>2]=c[F>>2];dp(D|0,c[B>>2]|0,270)|0;B=c[F>>2]|0;c[C>>2]=G;dp(B|0,c[C>>2]|0,270)|0;c[V>>2]=(c[V>>2]|0)+1;W=c[V>>2]|0;i=h;return W|0}function Sd(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;e=i;i=i+336|0;f=e+332|0;g=e+328|0;h=e+324|0;j=e+320|0;k=e+316|0;l=e+312|0;m=e+308|0;n=e+304|0;o=e+300|0;p=e+296|0;q=e+292|0;r=e+288|0;s=e+284|0;t=e+280|0;u=e+8|0;v=e;c[p>>2]=a;c[q>>2]=b;c[r>>2]=d;c[s>>2]=(c[p>>2]|0)+544;Pd(c[p>>2]|0,(c[p>>2]|0)+272|0,c[s>>2]|0,c[r>>2]|0)|0;c[t>>2]=(c[s>>2]|0)+272;while(1){if((c[t>>2]|0)==(c[q>>2]|0)){break}d=c[t>>2]|0;b=c[s>>2]|0;c[m>>2]=c[r>>2];c[n>>2]=d;c[o>>2]=b;if(Ud(c[n>>2]|0,c[o>>2]|0)|0){c[l>>2]=c[t>>2];dp(u|0,c[l>>2]|0,272)|0;c[v>>2]=c[s>>2];c[s>>2]=c[t>>2];do{b=c[s>>2]|0;c[f>>2]=c[v>>2];dp(b|0,c[f>>2]|0,270)|0;c[s>>2]=c[v>>2];if((c[s>>2]|0)==(c[p>>2]|0)){break}b=c[r>>2]|0;d=(c[v>>2]|0)+ -272|0;c[v>>2]=d;c[g>>2]=b;c[h>>2]=u;c[j>>2]=d}while(Ud(c[h>>2]|0,c[j>>2]|0)|0);d=c[s>>2]|0;c[k>>2]=u;dp(d|0,c[k>>2]|0,270)|0}c[s>>2]=c[t>>2];c[t>>2]=(c[t>>2]|0)+272}i=e;return}function Td(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;f=i;i=i+656|0;g=f+644|0;h=f+640|0;j=f+636|0;k=f+632|0;l=f+628|0;m=f+624|0;n=f+620|0;o=f+616|0;p=f+612|0;q=f+608|0;r=f+604|0;s=f+600|0;t=f+596|0;u=f+592|0;v=f+320|0;w=f+312|0;x=f+308|0;y=f+648|0;z=f+304|0;A=f+300|0;B=f+296|0;C=f+292|0;D=f+284|0;E=f+280|0;F=f+8|0;G=f;c[z>>2]=b;c[A>>2]=d;c[B>>2]=e;switch(((c[A>>2]|0)-(c[z>>2]|0)|0)/272|0|0){case 2:{e=c[B>>2]|0;d=(c[A>>2]|0)+ -272|0;c[A>>2]=d;b=c[z>>2]|0;c[f+316>>2]=e;c[w>>2]=d;c[x>>2]=b;if(Ud(c[w>>2]|0,c[x>>2]|0)|0){x=c[A>>2]|0;c[t>>2]=c[z>>2];c[u>>2]=x;c[s>>2]=c[t>>2];dp(v|0,c[s>>2]|0,272)|0;s=c[t>>2]|0;c[q>>2]=c[u>>2];dp(s|0,c[q>>2]|0,270)|0;q=c[u>>2]|0;c[r>>2]=v;dp(q|0,c[r>>2]|0,270)|0}a[y]=1;H=a[y]|0;I=H&1;i=f;return I|0};case 4:{r=c[z>>2]|0;q=(c[z>>2]|0)+272|0;v=(c[z>>2]|0)+544|0;u=(c[A>>2]|0)+ -272|0;c[A>>2]=u;Qd(r,q,v,u,c[B>>2]|0)|0;a[y]=1;H=a[y]|0;I=H&1;i=f;return I|0};case 3:{u=c[z>>2]|0;v=(c[z>>2]|0)+272|0;q=(c[A>>2]|0)+ -272|0;c[A>>2]=q;Pd(u,v,q,c[B>>2]|0)|0;a[y]=1;H=a[y]|0;I=H&1;i=f;return I|0};case 1:case 0:{a[y]=1;H=a[y]|0;I=H&1;i=f;return I|0};case 5:{q=c[z>>2]|0;v=(c[z>>2]|0)+272|0;u=(c[z>>2]|0)+544|0;r=(c[z>>2]|0)+816|0;s=(c[A>>2]|0)+ -272|0;c[A>>2]=s;Rd(q,v,u,r,s,c[B>>2]|0)|0;a[y]=1;H=a[y]|0;I=H&1;i=f;return I|0};default:{c[C>>2]=(c[z>>2]|0)+544;Pd(c[z>>2]|0,(c[z>>2]|0)+272|0,c[C>>2]|0,c[B>>2]|0)|0;c[f+288>>2]=8;c[D>>2]=0;c[E>>2]=(c[C>>2]|0)+272;while(1){if((c[E>>2]|0)==(c[A>>2]|0)){J=18;break}s=c[E>>2]|0;r=c[C>>2]|0;c[j>>2]=c[B>>2];c[k>>2]=s;c[l>>2]=r;if(Ud(c[k>>2]|0,c[l>>2]|0)|0){c[h>>2]=c[E>>2];dp(F|0,c[h>>2]|0,272)|0;c[G>>2]=c[C>>2];c[C>>2]=c[E>>2];do{r=c[C>>2]|0;c[g>>2]=c[G>>2];dp(r|0,c[g>>2]|0,270)|0;c[C>>2]=c[G>>2];if((c[C>>2]|0)==(c[z>>2]|0)){break}r=c[B>>2]|0;s=(c[G>>2]|0)+ -272|0;c[G>>2]=s;c[m>>2]=r;c[n>>2]=F;c[o>>2]=s}while(Ud(c[n>>2]|0,c[o>>2]|0)|0);s=c[C>>2]|0;c[p>>2]=F;dp(s|0,c[p>>2]|0,270)|0;s=(c[D>>2]|0)+1|0;c[D>>2]=s;if((s|0)==8){J=16;break}}c[C>>2]=c[E>>2];c[E>>2]=(c[E>>2]|0)+272}if((J|0)==16){C=(c[E>>2]|0)+272|0;c[E>>2]=C;a[y]=(C|0)==(c[A>>2]|0)|0;H=a[y]|0;I=H&1;i=f;return I|0}else if((J|0)==18){a[y]=1;H=a[y]|0;I=H&1;i=f;return I|0}}}return 0}function Ud(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=i;i=i+16|0;e=d+4|0;f=d;c[e>>2]=a;c[f>>2]=b;i=d;return(c[(c[e>>2]|0)+264>>2]|0)<(c[(c[f>>2]|0)+264>>2]|0)|0}function Vd(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;e=i;i=i+160|0;f=e+140|0;g=e+136|0;h=e+132|0;j=e+128|0;k=e+124|0;l=e+116|0;m=e+112|0;n=e+108|0;o=e+104|0;p=e;q=e+100|0;r=e+96|0;s=e+92|0;t=e+88|0;u=e+84|0;v=e+80|0;w=e+76|0;x=e+72|0;y=e+68|0;z=e+64|0;A=e+60|0;B=e+56|0;C=e+52|0;D=e+48|0;E=e+44|0;F=e+40|0;G=e+36|0;H=e+32|0;I=e+28|0;J=e+24|0;K=e+4|0;c[H>>2]=b;c[I>>2]=d;d=c[H>>2]|0;c[G>>2]=d;c[F>>2]=(c[G>>2]|0)+8;c[E>>2]=c[F>>2];c[J>>2]=c[E>>2];c[D>>2]=d;E=c[D>>2]|0;D=(((c[E+4>>2]|0)-(c[E>>2]|0)|0)/272|0)+1|0;c[y>>2]=d;c[z>>2]=D;D=c[y>>2]|0;c[A>>2]=_d(D)|0;if((c[z>>2]|0)>>>0>(c[A>>2]|0)>>>0){Hl(D)}c[w>>2]=D;c[v>>2]=c[w>>2];w=c[v>>2]|0;c[u>>2]=w;c[t>>2]=(c[u>>2]|0)+8;c[s>>2]=c[t>>2];c[B>>2]=((c[c[s>>2]>>2]|0)-(c[w>>2]|0)|0)/272|0;if((c[B>>2]|0)>>>0>=(((c[A>>2]|0)>>>0)/2|0)>>>0){c[x>>2]=c[A>>2]}else{c[C>>2]=c[B>>2]<<1;c[q>>2]=C;c[r>>2]=z;z=c[q>>2]|0;q=c[r>>2]|0;a[p+0|0]=a[e+148|0]|0;c[n>>2]=z;c[o>>2]=q;q=c[n>>2]|0;z=c[o>>2]|0;c[e+120>>2]=p;c[l>>2]=q;c[m>>2]=z;c[x>>2]=c[((c[c[l>>2]>>2]|0)>>>0<(c[c[m>>2]>>2]|0)>>>0?c[o>>2]|0:c[n>>2]|0)>>2]}n=c[x>>2]|0;c[k>>2]=d;x=c[k>>2]|0;Wd(K,n,((c[x+4>>2]|0)-(c[x>>2]|0)|0)/272|0,c[J>>2]|0);x=c[J>>2]|0;c[j>>2]=c[K+8>>2];J=c[j>>2]|0;c[h>>2]=c[I>>2];I=c[h>>2]|0;c[e+144>>2]=x;c[f>>2]=J;c[g>>2]=I;I=c[f>>2]|0;if((I|0)==0){L=K+8|0;M=c[L>>2]|0;N=M+272|0;c[L>>2]=N;Xd(d,K);Yd(K);i=e;return}dp(I|0,c[g>>2]|0,272)|0;L=K+8|0;M=c[L>>2]|0;N=M+272|0;c[L>>2]=N;Xd(d,K);Yd(K);i=e;return}function Wd(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+16|0;g=f+12|0;h=f+8|0;j=f+4|0;k=f;c[g>>2]=a;c[h>>2]=b;c[j>>2]=d;c[k>>2]=e;$d(c[g>>2]|0,c[h>>2]|0,c[j>>2]|0,c[k>>2]|0);i=f;return}function Xd(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;d=i;i=i+144|0;e=d+132|0;f=d+128|0;g=d+124|0;h=d+120|0;j=d+116|0;k=d+112|0;l=d+108|0;m=d+104|0;n=d+100|0;o=d+96|0;p=d+92|0;q=d+88|0;r=d+84|0;s=d+80|0;t=d+76|0;u=d+72|0;v=d+68|0;w=d+64|0;x=d+60|0;y=d+56|0;z=d+52|0;A=d+48|0;B=d+44|0;C=d+40|0;D=d+36|0;E=d+32|0;F=d+28|0;G=d+24|0;H=d+16|0;I=d+12|0;J=d+8|0;K=d+4|0;L=d;c[K>>2]=a;c[L>>2]=b;b=c[K>>2]|0;c[J>>2]=b;c[I>>2]=(c[J>>2]|0)+8;c[H>>2]=c[I>>2];I=c[b>>2]|0;J=c[b+4>>2]|0;K=(c[L>>2]|0)+4|0;c[d+136>>2]=c[H>>2];c[e>>2]=I;c[f>>2]=J;c[g>>2]=K;c[h>>2]=((c[f>>2]|0)-(c[e>>2]|0)|0)/272|0;f=c[g>>2]|0;c[f>>2]=(c[f>>2]|0)+((0-(c[h>>2]|0)|0)*272|0);dp(c[c[g>>2]>>2]|0,c[e>>2]|0,(c[h>>2]|0)*272|0)|0;h=(c[L>>2]|0)+4|0;c[m>>2]=b;c[n>>2]=h;c[l>>2]=c[m>>2];c[o>>2]=c[c[l>>2]>>2];c[j>>2]=c[n>>2];c[c[m>>2]>>2]=c[c[j>>2]>>2];c[k>>2]=o;c[c[n>>2]>>2]=c[c[k>>2]>>2];k=(c[L>>2]|0)+8|0;c[s>>2]=b+4;c[t>>2]=k;c[r>>2]=c[s>>2];c[u>>2]=c[c[r>>2]>>2];c[p>>2]=c[t>>2];c[c[s>>2]>>2]=c[c[p>>2]>>2];c[q>>2]=u;c[c[t>>2]>>2]=c[c[q>>2]>>2];c[x>>2]=b;c[w>>2]=(c[x>>2]|0)+8;c[v>>2]=c[w>>2];w=c[v>>2]|0;c[A>>2]=c[L>>2];c[z>>2]=(c[A>>2]|0)+12;c[y>>2]=c[z>>2];z=c[y>>2]|0;c[E>>2]=w;c[F>>2]=z;c[D>>2]=c[E>>2];c[G>>2]=c[c[D>>2]>>2];c[B>>2]=c[F>>2];c[c[E>>2]>>2]=c[c[B>>2]>>2];c[C>>2]=G;c[c[F>>2]>>2]=c[c[C>>2]>>2];c[c[L>>2]>>2]=c[(c[L>>2]|0)+4>>2];c[d+20>>2]=b;i=d;return}function Yd(a){a=a|0;var b=0,d=0;b=i;i=i+16|0;d=b;c[d>>2]=a;Zd(c[d>>2]|0);i=b;return}function Zd(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;d=i;i=i+128|0;e=d+116|0;f=d+112|0;g=d+108|0;h=d+104|0;j=d+100|0;k=d+96|0;l=d+92|0;m=d+88|0;n=d+84|0;o=d+80|0;p=d+76|0;q=d+72|0;r=d+68|0;s=d+64|0;t=d+60|0;u=d+56|0;v=d+8|0;w=d+52|0;x=d+48|0;y=d+121|0;z=d+44|0;A=d+40|0;B=d+36|0;C=d+32|0;D=d+28|0;E=d;F=d+24|0;G=d+20|0;H=d+120|0;I=d+16|0;J=d+12|0;c[J>>2]=b;b=c[J>>2]|0;c[I>>2]=b;J=c[I>>2]|0;I=c[J+4>>2]|0;c[F>>2]=J;c[G>>2]=I;I=c[F>>2]|0;F=c[G>>2]|0;a[E+0|0]=a[H+0|0]|0;c[C>>2]=I;c[D>>2]=F;F=c[C>>2]|0;while(1){if((c[D>>2]|0)==(c[F+8>>2]|0)){break}c[B>>2]=F;c[A>>2]=(c[B>>2]|0)+12;c[z>>2]=c[A>>2];C=c[(c[z>>2]|0)+4>>2]|0;I=F+8|0;H=(c[I>>2]|0)+ -272|0;c[I>>2]=H;c[s>>2]=H;H=c[s>>2]|0;c[w>>2]=C;c[x>>2]=H;H=c[w>>2]|0;C=c[x>>2]|0;a[v+0|0]=a[y+0|0]|0;c[t>>2]=H;c[u>>2]=C}if((c[b>>2]|0)==0){i=d;return}c[l>>2]=b;c[k>>2]=(c[l>>2]|0)+12;c[j>>2]=c[k>>2];k=c[(c[j>>2]|0)+4>>2]|0;j=c[b>>2]|0;c[h>>2]=b;b=c[h>>2]|0;c[g>>2]=b;c[f>>2]=(c[g>>2]|0)+12;c[e>>2]=c[f>>2];f=((c[c[e>>2]>>2]|0)-(c[b>>2]|0)|0)/272|0;c[p>>2]=k;c[q>>2]=j;c[r>>2]=f;f=c[q>>2]|0;q=c[r>>2]|0;c[m>>2]=c[p>>2];c[n>>2]=f;c[o>>2]=q;Jo(c[n>>2]|0);i=d;return}function _d(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;d=i;i=i+80|0;e=d+72|0;f=d+68|0;g=d+8|0;h=d+64|0;j=d+77|0;k=d+60|0;l=d+56|0;m=d+52|0;n=d+48|0;o=d+44|0;p=d;q=d+40|0;r=d+36|0;s=d+76|0;t=d+32|0;u=d+28|0;v=d+24|0;w=d+20|0;x=d+16|0;y=d+12|0;c[w>>2]=b;c[v>>2]=c[w>>2];c[u>>2]=(c[v>>2]|0)+8;c[t>>2]=c[u>>2];c[h>>2]=c[t>>2];t=c[h>>2]|0;a[g+0|0]=a[j+0|0]|0;c[f>>2]=t;c[e>>2]=c[f>>2];c[x>>2]=15790320;c[y>>2]=4294967295/2|0;c[q>>2]=x;c[r>>2]=y;y=c[q>>2]|0;q=c[r>>2]|0;a[p+0|0]=a[s+0|0]|0;c[n>>2]=y;c[o>>2]=q;q=c[o>>2]|0;y=c[n>>2]|0;c[k>>2]=p;c[l>>2]=q;c[m>>2]=y;i=d;return c[((c[c[l>>2]>>2]|0)>>>0<(c[c[m>>2]>>2]|0)>>>0?c[o>>2]|0:c[n>>2]|0)>>2]|0}function $d(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0;f=i;i=i+176|0;g=f+164|0;h=f+160|0;j=f+156|0;k=f+152|0;l=f+148|0;m=f+144|0;n=f+140|0;o=f+136|0;p=f+132|0;q=f+128|0;r=f+124|0;s=f+120|0;t=f+116|0;u=f+112|0;v=f+108|0;w=f+104|0;x=f+92|0;y=f+84|0;z=f+80|0;A=f+76|0;B=f+68|0;C=f+64|0;D=f+60|0;E=f+52|0;F=f+48|0;G=f+44|0;H=f+40|0;I=f+32|0;J=f+28|0;K=f+24|0;L=f+20|0;M=f+16|0;N=f+12|0;O=f+8|0;P=f+4|0;Q=f;c[L>>2]=a;c[M>>2]=b;c[N>>2]=d;c[O>>2]=e;e=c[L>>2]|0;c[I>>2]=K;c[J>>2]=-1;L=c[J>>2]|0;c[H>>2]=c[I>>2];c[f+36>>2]=L;c[c[H>>2]>>2]=0;c[P>>2]=c[K>>2];c[f+100>>2]=P;P=c[O>>2]|0;c[r>>2]=e+12;c[s>>2]=0;c[t>>2]=P;P=c[s>>2]|0;s=c[t>>2]|0;c[o>>2]=c[r>>2];c[p>>2]=P;c[q>>2]=s;s=c[o>>2]|0;c[n>>2]=p;p=c[c[n>>2]>>2]|0;c[g>>2]=c[q>>2];q=c[g>>2]|0;c[k>>2]=s;c[l>>2]=p;c[m>>2]=q;q=c[k>>2]|0;c[j>>2]=l;c[q>>2]=c[c[j>>2]>>2];c[h>>2]=c[m>>2];c[q+4>>2]=c[h>>2];if((c[M>>2]|0)!=0){c[w>>2]=e;c[v>>2]=(c[w>>2]|0)+12;c[u>>2]=c[v>>2];v=c[M>>2]|0;c[y>>2]=c[(c[u>>2]|0)+4>>2];c[z>>2]=v;v=c[z>>2]|0;c[f+96>>2]=c[y>>2];c[x>>2]=v;c[f+88>>2]=0;R=Ho((c[x>>2]|0)*272|0)|0;c[e>>2]=R;S=c[e>>2]|0;T=c[N>>2]|0;U=S+(T*272|0)|0;V=e+8|0;c[V>>2]=U;W=e+4|0;c[W>>2]=U;X=c[e>>2]|0;Y=c[M>>2]|0;Z=X+(Y*272|0)|0;c[G>>2]=e;_=c[G>>2]|0;$=_+12|0;c[F>>2]=$;aa=c[F>>2]|0;c[E>>2]=aa;ba=c[E>>2]|0;c[ba>>2]=Z;i=f;return}else{c[B>>2]=D;c[C>>2]=-1;x=c[C>>2]|0;c[A>>2]=c[B>>2];c[f+72>>2]=x;c[c[A>>2]>>2]=0;c[Q>>2]=c[D>>2];c[f+56>>2]=Q;R=0;c[e>>2]=R;S=c[e>>2]|0;T=c[N>>2]|0;U=S+(T*272|0)|0;V=e+8|0;c[V>>2]=U;W=e+4|0;c[W>>2]=U;X=c[e>>2]|0;Y=c[M>>2]|0;Z=X+(Y*272|0)|0;c[G>>2]=e;_=c[G>>2]|0;$=_+12|0;c[F>>2]=$;aa=c[F>>2]|0;c[E>>2]=aa;ba=c[E>>2]|0;c[ba>>2]=Z;i=f;return}}function ae(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0,Ja=0,Ka=0,La=0,Ma=0,Na=0,Oa=0,Pa=0,Qa=0,Ra=0,Sa=0,Ta=0,Ua=0,Va=0,Wa=0,Xa=0,Ya=0,Za=0,_a=0,$a=0,ab=0,bb=0,cb=0,db=0,eb=0,fb=0,gb=0,hb=0,ib=0,jb=0,kb=0,lb=0,mb=0,nb=0,ob=0,pb=0,qb=0,rb=0,sb=0,tb=0,ub=0,vb=0,wb=0,xb=0,yb=0,zb=0,Ab=0,Bb=0,Cb=0,Db=0,Eb=0,Fb=0,Gb=0,Hb=0,Ib=0,Jb=0;f=i;i=i+544|0;g=f+532|0;h=f+528|0;j=f+524|0;k=f+520|0;l=f+516|0;m=f+512|0;n=f+508|0;o=f+504|0;p=f+500|0;q=f+496|0;r=f+492|0;s=f+488|0;t=f+484|0;u=f+480|0;v=f+476|0;w=f+48|0;x=f+472|0;y=f+468|0;z=f+538|0;A=f+464|0;B=f+460|0;C=f+456|0;D=f+452|0;E=f+448|0;F=f+444|0;G=f+440|0;H=f+436|0;I=f+432|0;J=f+428|0;K=f+424|0;L=f+420|0;M=f+416|0;N=f+412|0;O=f+408|0;P=f+404|0;Q=f+400|0;R=f+396|0;S=f+392|0;T=f+388|0;U=f+384|0;V=f+380|0;W=f+40|0;X=f+376|0;Y=f+372|0;Z=f+537|0;_=f+368|0;$=f+364|0;aa=f+360|0;ba=f+356|0;ca=f+352|0;da=f+348|0;ea=f+344|0;fa=f+340|0;ga=f+336|0;ha=f+332|0;ia=f+328|0;ja=f+324|0;ka=f+320|0;la=f+316|0;ma=f+312|0;na=f+308|0;oa=f+304|0;pa=f+300|0;qa=f+296|0;ra=f+292|0;sa=f+288|0;ta=f+284|0;ua=f+280|0;va=f+276|0;wa=f+272|0;xa=f+268|0;ya=f+264|0;za=f+260|0;Aa=f+256|0;Ba=f+252|0;Ca=f+248|0;Da=f+244|0;Ea=f+32|0;Fa=f+240|0;Ga=f+236|0;Ha=f+232|0;Ia=f+224|0;Ja=f+24|0;Ka=f+220|0;La=f+216|0;Ma=f+16|0;Na=f+212|0;Oa=f+208|0;Pa=f+200|0;Qa=f+8|0;Ra=f+192|0;Sa=f;Ta=f+188|0;Ua=f+184|0;Va=f+180|0;Wa=f+176|0;Xa=f+172|0;Ya=f+168|0;Za=f+164|0;_a=f+160|0;$a=f+156|0;ab=f+152|0;bb=f+148|0;cb=f+144|0;db=f+140|0;eb=f+136|0;fb=f+132|0;gb=f+124|0;hb=f+116|0;ib=f+112|0;jb=f+108|0;kb=f+104|0;lb=f+100|0;mb=f+96|0;nb=f+92|0;ob=f+88|0;pb=f+536|0;qb=f+84|0;rb=f+72|0;sb=f+68|0;tb=f+56|0;ub=f+52|0;c[kb>>2]=d;c[lb>>2]=e;e=c[kb>>2]|0;c[nb>>2]=be(e,mb,c[lb>>2]|0)|0;c[ob>>2]=c[c[nb>>2]>>2];a[pb]=0;kb=c[c[nb>>2]>>2]|0;c[hb>>2]=jb;c[ib>>2]=-1;d=c[ib>>2]|0;c[gb>>2]=c[hb>>2];c[f+120>>2]=d;c[c[gb>>2]>>2]=0;c[qb>>2]=c[jb>>2];c[f+128>>2]=qb;if((kb|0)!=0){vb=c[ob>>2]|0;c[_a>>2]=ub;c[$a>>2]=vb;wb=c[_a>>2]|0;xb=c[$a>>2]|0;c[Ya>>2]=wb;c[Za>>2]=xb;yb=c[Ya>>2]|0;zb=c[Za>>2]|0;c[yb>>2]=zb;c[db>>2]=b;c[eb>>2]=ub;c[fb>>2]=pb;Ab=c[db>>2]|0;Bb=c[fb>>2]|0;Cb=c[eb>>2]|0;c[ab>>2]=Ab;c[bb>>2]=Cb;c[cb>>2]=Bb;Db=c[ab>>2]|0;Eb=c[bb>>2]|0;c[Db+0>>2]=c[Eb+0>>2];Fb=Db+4|0;Gb=c[cb>>2]|0;Hb=a[Gb]|0;Ib=Hb&1;Jb=Ib&1;a[Fb]=Jb;i=f;return}ce(tb,e,c[lb>>2]|0);c[Xa>>2]=tb;lb=c[Xa>>2]|0;c[Va>>2]=sb;c[Wa>>2]=lb;lb=c[Wa>>2]|0;c[Ta>>2]=c[Va>>2];c[Ua>>2]=lb;c[c[Ta>>2]>>2]=c[Ua>>2];a[Sa+0|0]=a[sb+0|0]|0;a[Sa+1|0]=a[sb+1|0]|0;a[Sa+2|0]=a[sb+2|0]|0;a[Sa+3|0]=a[sb+3|0]|0;c[Ra>>2]=rb;sb=c[Ra>>2]|0;a[Qa+0|0]=a[Sa+0|0]|0;a[Qa+1|0]=a[Sa+1|0]|0;a[Qa+2|0]=a[Sa+2|0]|0;a[Qa+3|0]=a[Sa+3|0]|0;c[Oa>>2]=sb;sb=c[Oa>>2]|0;c[Na>>2]=Qa;c[sa>>2]=c[c[Na>>2]>>2];Na=c[sa>>2]|0;c[ra>>2]=Na;c[qa>>2]=c[ra>>2];c[ta>>2]=c[c[qa>>2]>>2];c[pa>>2]=Na;c[oa>>2]=c[pa>>2];c[c[oa>>2]>>2]=0;oa=c[ta>>2]|0;c[ua>>2]=Qa;c[xa>>2]=c[c[ua>>2]>>2];c[wa>>2]=c[xa>>2];c[va>>2]=c[wa>>2];c[ya>>2]=(c[va>>2]|0)+4;va=c[ya>>2]|0;c[Pa+0>>2]=c[va+0>>2];c[Pa+4>>2]=c[va+4>>2];a[Ma+0|0]=a[Pa+0|0]|0;a[Ma+1|0]=a[Pa+1|0]|0;a[Ma+2|0]=a[Pa+2|0]|0;a[Ma+3|0]=a[Pa+3|0]|0;a[Ma+4|0]=a[Pa+4|0]|0;a[Ma+5|0]=a[Pa+5|0]|0;a[Ma+6|0]=a[Pa+6|0]|0;a[Ma+7|0]=a[Pa+7|0]|0;c[Ka>>2]=sb;c[La>>2]=oa;oa=c[Ka>>2]|0;Ka=c[La>>2]|0;a[Ja+0|0]=a[Ma+0|0]|0;a[Ja+1|0]=a[Ma+1|0]|0;a[Ja+2|0]=a[Ma+2|0]|0;a[Ja+3|0]=a[Ma+3|0]|0;a[Ja+4|0]=a[Ma+4|0]|0;a[Ja+5|0]=a[Ma+5|0]|0;a[Ja+6|0]=a[Ma+6|0]|0;a[Ja+7|0]=a[Ma+7|0]|0;c[Ga>>2]=oa;c[Ha>>2]=Ka;Ka=c[Ga>>2]|0;c[Fa>>2]=Ha;Ha=c[c[Fa>>2]>>2]|0;c[za>>2]=Ja;Ja=c[za>>2]|0;c[Ia+0>>2]=c[Ja+0>>2];c[Ia+4>>2]=c[Ja+4>>2];a[Ea+0|0]=a[Ia+0|0]|0;a[Ea+1|0]=a[Ia+1|0]|0;a[Ea+2|0]=a[Ia+2|0]|0;a[Ea+3|0]=a[Ia+3|0]|0;a[Ea+4|0]=a[Ia+4|0]|0;a[Ea+5|0]=a[Ia+5|0]|0;a[Ea+6|0]=a[Ia+6|0]|0;a[Ea+7|0]=a[Ia+7|0]|0;c[Ca>>2]=Ka;c[Da>>2]=Ha;Ha=c[Ca>>2]|0;c[Ba>>2]=Da;c[Ha>>2]=c[c[Ba>>2]>>2];Ba=Ha+4|0;c[Aa>>2]=Ea;Ea=c[Aa>>2]|0;c[Ba+0>>2]=c[Ea+0>>2];c[Ba+4>>2]=c[Ea+4>>2];c[P>>2]=tb;c[O>>2]=c[P>>2];c[L>>2]=c[O>>2];c[M>>2]=0;O=c[L>>2]|0;c[K>>2]=O;c[J>>2]=c[K>>2];c[N>>2]=c[c[J>>2]>>2];J=c[M>>2]|0;c[t>>2]=O;c[s>>2]=c[t>>2];c[c[s>>2]>>2]=J;if((c[N>>2]|0)!=0){c[r>>2]=O;c[q>>2]=c[r>>2];r=c[N>>2]|0;c[H>>2]=(c[q>>2]|0)+4;c[I>>2]=r;r=c[H>>2]|0;if(a[r+4|0]&1){H=c[r>>2]|0;c[G>>2]=(c[I>>2]|0)+16;q=c[G>>2]|0;c[x>>2]=H;c[y>>2]=q;q=c[x>>2]|0;x=c[y>>2]|0;a[w+0|0]=a[z+0|0]|0;c[u>>2]=q;c[v>>2]=x}if((c[I>>2]|0)!=0){x=c[I>>2]|0;c[D>>2]=c[r>>2];c[E>>2]=x;c[F>>2]=1;x=c[E>>2]|0;E=c[F>>2]|0;c[A>>2]=c[D>>2];c[B>>2]=x;c[C>>2]=E;Jo(c[B>>2]|0)}}B=c[mb>>2]|0;mb=c[nb>>2]|0;c[p>>2]=rb;c[o>>2]=c[p>>2];c[n>>2]=c[o>>2];de(e,B,mb,c[c[n>>2]>>2]|0);c[l>>2]=rb;n=c[l>>2]|0;c[k>>2]=n;c[j>>2]=c[k>>2];c[m>>2]=c[c[j>>2]>>2];c[h>>2]=n;c[g>>2]=c[h>>2];c[c[g>>2]>>2]=0;c[ob>>2]=c[m>>2];a[pb]=1;c[na>>2]=rb;c[ma>>2]=c[na>>2];c[ja>>2]=c[ma>>2];c[ka>>2]=0;ma=c[ja>>2]|0;c[ia>>2]=ma;c[ha>>2]=c[ia>>2];c[la>>2]=c[c[ha>>2]>>2];ha=c[ka>>2]|0;c[T>>2]=ma;c[S>>2]=c[T>>2];c[c[S>>2]>>2]=ha;if((c[la>>2]|0)==0){vb=c[ob>>2]|0;c[_a>>2]=ub;c[$a>>2]=vb;wb=c[_a>>2]|0;xb=c[$a>>2]|0;c[Ya>>2]=wb;c[Za>>2]=xb;yb=c[Ya>>2]|0;zb=c[Za>>2]|0;c[yb>>2]=zb;c[db>>2]=b;c[eb>>2]=ub;c[fb>>2]=pb;Ab=c[db>>2]|0;Bb=c[fb>>2]|0;Cb=c[eb>>2]|0;c[ab>>2]=Ab;c[bb>>2]=Cb;c[cb>>2]=Bb;Db=c[ab>>2]|0;Eb=c[bb>>2]|0;c[Db+0>>2]=c[Eb+0>>2];Fb=Db+4|0;Gb=c[cb>>2]|0;Hb=a[Gb]|0;Ib=Hb&1;Jb=Ib&1;a[Fb]=Jb;i=f;return}c[R>>2]=ma;c[Q>>2]=c[R>>2];R=c[la>>2]|0;c[fa>>2]=(c[Q>>2]|0)+4;c[ga>>2]=R;R=c[fa>>2]|0;if(a[R+4|0]&1){fa=c[R>>2]|0;c[ea>>2]=(c[ga>>2]|0)+16;Q=c[ea>>2]|0;c[X>>2]=fa;c[Y>>2]=Q;Q=c[X>>2]|0;X=c[Y>>2]|0;a[W+0|0]=a[Z+0|0]|0;c[U>>2]=Q;c[V>>2]=X}if((c[ga>>2]|0)==0){vb=c[ob>>2]|0;c[_a>>2]=ub;c[$a>>2]=vb;wb=c[_a>>2]|0;xb=c[$a>>2]|0;c[Ya>>2]=wb;c[Za>>2]=xb;yb=c[Ya>>2]|0;zb=c[Za>>2]|0;c[yb>>2]=zb;c[db>>2]=b;c[eb>>2]=ub;c[fb>>2]=pb;Ab=c[db>>2]|0;Bb=c[fb>>2]|0;Cb=c[eb>>2]|0;c[ab>>2]=Ab;c[bb>>2]=Cb;c[cb>>2]=Bb;Db=c[ab>>2]|0;Eb=c[bb>>2]|0;c[Db+0>>2]=c[Eb+0>>2];Fb=Db+4|0;Gb=c[cb>>2]|0;Hb=a[Gb]|0;Ib=Hb&1;Jb=Ib&1;a[Fb]=Jb;i=f;return}X=c[ga>>2]|0;c[ba>>2]=c[R>>2];c[ca>>2]=X;c[da>>2]=1;X=c[ca>>2]|0;ca=c[da>>2]|0;c[_>>2]=c[ba>>2];c[$>>2]=X;c[aa>>2]=ca;Jo(c[$>>2]|0);vb=c[ob>>2]|0;c[_a>>2]=ub;c[$a>>2]=vb;wb=c[_a>>2]|0;xb=c[$a>>2]|0;c[Ya>>2]=wb;c[Za>>2]=xb;yb=c[Ya>>2]|0;zb=c[Za>>2]|0;c[yb>>2]=zb;c[db>>2]=b;c[eb>>2]=ub;c[fb>>2]=pb;Ab=c[db>>2]|0;Bb=c[fb>>2]|0;Cb=c[eb>>2]|0;c[ab>>2]=Ab;c[bb>>2]=Cb;c[cb>>2]=Bb;Db=c[ab>>2]|0;Eb=c[bb>>2]|0;c[Db+0>>2]=c[Eb+0>>2];Fb=Db+4|0;Gb=c[cb>>2]|0;Hb=a[Gb]|0;Ib=Hb&1;Jb=Ib&1;a[Fb]=Jb;i=f;return}function be(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0;e=i;i=i+224|0;f=e+216|0;g=e+212|0;h=e+208|0;j=e+200|0;k=e+196|0;l=e+192|0;m=e+188|0;n=e+184|0;o=e+180|0;p=e+176|0;q=e+172|0;r=e+168|0;s=e+164|0;t=e+160|0;u=e+156|0;v=e+152|0;w=e+148|0;x=e+144|0;y=e+140|0;z=e+132|0;A=e+128|0;B=e+124|0;C=e+120|0;D=e+116|0;E=e+112|0;F=e+108|0;G=e+104|0;H=e+100|0;I=e+96|0;J=e+92|0;K=e+88|0;L=e+84|0;M=e+80|0;N=e+76|0;O=e+72|0;P=e+68|0;Q=e+64|0;R=e+60|0;S=e+56|0;T=e+52|0;U=e+48|0;V=e+44|0;W=e+40|0;X=e+36|0;Y=e+32|0;Z=e+28|0;_=e+24|0;$=e+20|0;aa=e+16|0;ba=e+12|0;ca=e+8|0;da=e+4|0;ea=e;c[_>>2]=a;c[$>>2]=b;c[aa>>2]=d;d=c[_>>2]|0;c[Y>>2]=d;c[X>>2]=c[Y>>2];c[W>>2]=(c[X>>2]|0)+4;c[V>>2]=c[W>>2];c[U>>2]=c[V>>2];c[T>>2]=c[U>>2];c[ba>>2]=c[c[T>>2]>>2];T=c[ba>>2]|0;c[z>>2]=B;c[A>>2]=-1;U=c[A>>2]|0;c[y>>2]=c[z>>2];c[e+136>>2]=U;c[c[y>>2]>>2]=0;c[ca>>2]=c[B>>2];c[e+204>>2]=ca;if((T|0)==0){c[S>>2]=d;c[R>>2]=(c[S>>2]|0)+4;c[Q>>2]=c[R>>2];c[P>>2]=c[Q>>2];c[O>>2]=c[P>>2];c[c[$>>2]>>2]=c[O>>2];c[Z>>2]=c[c[$>>2]>>2];fa=c[Z>>2]|0;i=e;return fa|0}while(1){c[h>>2]=d;c[g>>2]=(c[h>>2]|0)+8;c[f>>2]=c[g>>2];O=c[aa>>2]|0;P=(c[ba>>2]|0)+16|0;c[m>>2]=c[f>>2];c[n>>2]=O;c[o>>2]=P;P=c[n>>2]|0;O=c[o>>2]|0;c[j>>2]=c[m>>2];c[k>>2]=P;c[l>>2]=O;if(Jd(c[k>>2]|0,c[l>>2]|0)|0){O=c[c[ba>>2]>>2]|0;c[r>>2]=t;c[s>>2]=-1;P=c[s>>2]|0;c[p>>2]=c[r>>2];c[q>>2]=P;c[c[p>>2]>>2]=0;c[da>>2]=c[t>>2];c[u>>2]=da;ga=c[ba>>2]|0;if((O|0)==0){ha=5;break}c[ba>>2]=c[ga>>2];continue}c[x>>2]=d;c[w>>2]=(c[x>>2]|0)+8;c[v>>2]=c[w>>2];O=(c[ba>>2]|0)+16|0;P=c[aa>>2]|0;c[F>>2]=c[v>>2];c[G>>2]=O;c[H>>2]=P;P=c[G>>2]|0;O=c[H>>2]|0;c[C>>2]=c[F>>2];c[D>>2]=P;c[E>>2]=O;O=Jd(c[D>>2]|0,c[E>>2]|0)|0;ia=c[ba>>2]|0;if(!O){ha=10;break}O=c[ia+4>>2]|0;c[K>>2]=M;c[L>>2]=-1;P=c[L>>2]|0;c[I>>2]=c[K>>2];c[J>>2]=P;c[c[I>>2]>>2]=0;c[ea>>2]=c[M>>2];c[N>>2]=ea;ja=c[ba>>2]|0;if((O|0)==0){ha=9;break}c[ba>>2]=c[ja+4>>2]}if((ha|0)==5){c[c[$>>2]>>2]=ga;c[Z>>2]=c[c[$>>2]>>2];fa=c[Z>>2]|0;i=e;return fa|0}else if((ha|0)==9){c[c[$>>2]>>2]=ja;c[Z>>2]=(c[c[$>>2]>>2]|0)+4;fa=c[Z>>2]|0;i=e;return fa|0}else if((ha|0)==10){c[c[$>>2]>>2]=ia;c[Z>>2]=c[$>>2];fa=c[Z>>2]|0;i=e;return fa|0}return 0}function ce(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0,Ja=0,Ka=0,La=0,Ma=0,Na=0,Oa=0,Pa=0,Qa=0,Ra=0,Sa=0,Ta=0,Ua=0,Va=0,Wa=0,Xa=0,Ya=0,Za=0,_a=0,$a=0,ab=0,bb=0,cb=0,db=0,eb=0,fb=0,gb=0,hb=0,ib=0,jb=0,kb=0,lb=0,mb=0,nb=0,ob=0,pb=0,qb=0,rb=0,sb=0,tb=0,ub=0,vb=0,wb=0,xb=0,yb=0,zb=0,Ab=0,Bb=0,Cb=0,Db=0,Eb=0,Fb=0,Gb=0,Hb=0,Ib=0,Jb=0,Kb=0,Lb=0,Mb=0,Nb=0,Ob=0,Pb=0,Qb=0,Rb=0,Sb=0,Tb=0,Ub=0,Vb=0,Wb=0,Xb=0,Yb=0,Zb=0,_b=0,$b=0,ac=0,bc=0,cc=0,dc=0,ec=0,fc=0,gc=0,hc=0,ic=0,jc=0,kc=0,lc=0,mc=0,nc=0,oc=0,pc=0,qc=0,rc=0,sc=0,tc=0,uc=0,vc=0,wc=0,xc=0,yc=0,zc=0,Ac=0,Bc=0,Cc=0,Dc=0,Ec=0,Fc=0,Gc=0,Hc=0,Ic=0,Jc=0,Kc=0,Lc=0,Mc=0,Nc=0,Oc=0,Pc=0,Qc=0,Rc=0,Sc=0,Tc=0,Uc=0,Vc=0,Wc=0,Xc=0,Yc=0,Zc=0,_c=0,$c=0,ad=0,bd=0,cd=0,dd=0,ed=0,fd=0,gd=0,hd=0,id=0,jd=0,kd=0,ld=0,md=0,nd=0,od=0,pd=0,qd=0,rd=0,sd=0,td=0,ud=0,vd=0,wd=0,xd=0,yd=0,zd=0,Ad=0,Bd=0,Cd=0,Dd=0,Ed=0;f=i;i=i+1136|0;g=f+1124|0;h=f+1120|0;j=f+1116|0;k=f+1112|0;l=f+1108|0;m=f+1104|0;n=f+1100|0;o=f+1096|0;p=f+1092|0;q=f+1088|0;r=f+1084|0;s=f+1080|0;t=f+1076|0;u=f+1072|0;v=f+1068|0;w=f+1064|0;x=f+1060|0;y=f+1056|0;z=f+1052|0;A=f+176|0;B=f+1048|0;C=f+1044|0;D=f+1040|0;E=f+1032|0;F=f+168|0;G=f+1028|0;H=f+1024|0;I=f+160|0;J=f+1020|0;K=f+1016|0;L=f+1008|0;M=f+152|0;N=f+1e3|0;O=f+144|0;P=f+996|0;Q=f+992|0;R=f+988|0;S=f+984|0;T=f+980|0;U=f+976|0;V=f+136|0;W=f+972|0;X=f+968|0;Y=f+1130|0;Z=f+964|0;_=f+960|0;$=f+956|0;aa=f+952|0;ba=f+948|0;ca=f+944|0;da=f+940|0;ea=f+936|0;fa=f+932|0;ga=f+928|0;ha=f+924|0;ia=f+920|0;ja=f+916|0;ka=f+912|0;la=f+908|0;ma=f+904|0;na=f+900|0;oa=f+896|0;pa=f+892|0;qa=f+888|0;ra=f+884|0;sa=f+880|0;ta=f+876|0;ua=f+872|0;va=f+868|0;wa=f+864|0;xa=f+860|0;ya=f+856|0;za=f+852|0;Aa=f+848|0;Ba=f+844|0;Ca=f+840|0;Da=f+836|0;Ea=f+832|0;Fa=f+828|0;Ga=f+824|0;Ha=f+820|0;Ia=f+128|0;Ja=f+816|0;Ka=f+812|0;La=f+808|0;Ma=f+800|0;Na=f+120|0;Oa=f+796|0;Pa=f+792|0;Qa=f+112|0;Ra=f+788|0;Sa=f+784|0;Ta=f+776|0;Ua=f+104|0;Va=f+768|0;Wa=f+96|0;Xa=f+764|0;Ya=f+760|0;Za=f+756|0;_a=f+752|0;$a=f+748|0;ab=f+744|0;bb=f+732|0;cb=f+728|0;db=f+724|0;eb=f+720|0;fb=f+716|0;gb=f+712|0;hb=f+708|0;ib=f+704|0;jb=f+700|0;kb=f+696|0;lb=f+692|0;mb=f+688|0;nb=f+684|0;ob=f+680|0;pb=f+676|0;qb=f+672|0;rb=f+668|0;sb=f+664|0;tb=f+660|0;ub=f+656|0;vb=f+652|0;wb=f+648|0;xb=f+644|0;yb=f+88|0;zb=f+640|0;Ab=f+636|0;Bb=f+632|0;Cb=f+624|0;Db=f+80|0;Eb=f+620|0;Fb=f+616|0;Gb=f+72|0;Hb=f+612|0;Ib=f+608|0;Jb=f+600|0;Kb=f+64|0;Lb=f+592|0;Mb=f+56|0;Nb=f+588|0;Ob=f+584|0;Pb=f+580|0;Qb=f+576|0;Rb=f+572|0;Sb=f+568|0;Tb=f+564|0;Ub=f+560|0;Vb=f+556|0;Wb=f+48|0;Xb=f+552|0;Yb=f+548|0;Zb=f+1129|0;_b=f+544|0;$b=f+540|0;ac=f+536|0;bc=f+532|0;cc=f+528|0;dc=f+524|0;ec=f+520|0;fc=f+516|0;gc=f+512|0;hc=f+508|0;ic=f+504|0;jc=f+500|0;kc=f+496|0;lc=f+492|0;mc=f+488|0;nc=f+484|0;oc=f+480|0;pc=f+476|0;qc=f+472|0;rc=f+468|0;sc=f+464|0;tc=f+460|0;uc=f+456|0;vc=f+40|0;wc=f+452|0;xc=f+448|0;yc=f+1128|0;zc=f+444|0;Ac=f+440|0;Bc=f+436|0;Cc=f+432|0;Dc=f+428|0;Ec=f+424|0;Fc=f+420|0;Gc=f+416|0;Hc=f+412|0;Ic=f+408|0;Jc=f+404|0;Kc=f+400|0;Lc=f+396|0;Mc=f+392|0;Nc=f+388|0;Oc=f+384|0;Pc=f+380|0;Qc=f+376|0;Rc=f+372|0;Sc=f+368|0;Tc=f+364|0;Uc=f+360|0;Vc=f+356|0;Wc=f+352|0;Xc=f+348|0;Yc=f+32|0;Zc=f+344|0;_c=f+340|0;$c=f+336|0;ad=f+328|0;bd=f+24|0;cd=f+320|0;dd=f+316|0;ed=f+16|0;fd=f+312|0;gd=f+308|0;hd=f+304|0;id=f+296|0;jd=f+8|0;kd=f+292|0;ld=f+288|0;md=f;nd=f+284|0;od=f+280|0;pd=f+276|0;qd=f+272|0;rd=f+264|0;sd=f+256|0;td=f+252|0;ud=f+248|0;vd=f+244|0;wd=f+240|0;xd=f+236|0;yd=f+232|0;zd=f+228|0;Ad=f+216|0;Bd=f+208|0;Cd=f+200|0;Dd=f+188|0;Ed=f+184|0;c[xd>>2]=d;c[yd>>2]=e;c[wd>>2]=c[xd>>2];c[vd>>2]=(c[wd>>2]|0)+4;c[ud>>2]=c[vd>>2];c[zd>>2]=c[ud>>2];c[sd>>2]=c[zd>>2];c[td>>2]=1;ud=c[td>>2]|0;c[f+268>>2]=c[sd>>2];c[rd>>2]=ud;c[f+260>>2]=0;ud=Ho((c[rd>>2]|0)*88|0)|0;rd=c[zd>>2]|0;c[pd>>2]=Bd;c[qd>>2]=rd;rd=c[qd>>2]|0;c[nd>>2]=c[pd>>2];c[od>>2]=rd;rd=c[nd>>2]|0;c[rd>>2]=c[od>>2];a[rd+4|0]=0;a[md+0|0]=a[Bd+0|0]|0;a[md+1|0]=a[Bd+1|0]|0;a[md+2|0]=a[Bd+2|0]|0;a[md+3|0]=a[Bd+3|0]|0;a[md+4|0]=a[Bd+4|0]|0;a[md+5|0]=a[Bd+5|0]|0;a[md+6|0]=a[Bd+6|0]|0;a[md+7|0]=a[Bd+7|0]|0;c[kd>>2]=Ad;c[ld>>2]=ud;ud=c[kd>>2]|0;kd=c[ld>>2]|0;a[jd+0|0]=a[md+0|0]|0;a[jd+1|0]=a[md+1|0]|0;a[jd+2|0]=a[md+2|0]|0;a[jd+3|0]=a[md+3|0]|0;a[jd+4|0]=a[md+4|0]|0;a[jd+5|0]=a[md+5|0]|0;a[jd+6|0]=a[md+6|0]|0;a[jd+7|0]=a[md+7|0]|0;c[gd>>2]=ud;c[hd>>2]=kd;kd=c[gd>>2]|0;c[fd>>2]=hd;hd=c[c[fd>>2]>>2]|0;c[Sc>>2]=jd;jd=c[Sc>>2]|0;c[id+0>>2]=c[jd+0>>2];c[id+4>>2]=c[jd+4>>2];a[ed+0|0]=a[id+0|0]|0;a[ed+1|0]=a[id+1|0]|0;a[ed+2|0]=a[id+2|0]|0;a[ed+3|0]=a[id+3|0]|0;a[ed+4|0]=a[id+4|0]|0;a[ed+5|0]=a[id+5|0]|0;a[ed+6|0]=a[id+6|0]|0;a[ed+7|0]=a[id+7|0]|0;c[cd>>2]=kd;c[dd>>2]=hd;hd=c[cd>>2]|0;cd=c[dd>>2]|0;a[bd+0|0]=a[ed+0|0]|0;a[bd+1|0]=a[ed+1|0]|0;a[bd+2|0]=a[ed+2|0]|0;a[bd+3|0]=a[ed+3|0]|0;a[bd+4|0]=a[ed+4|0]|0;a[bd+5|0]=a[ed+5|0]|0;a[bd+6|0]=a[ed+6|0]|0;a[bd+7|0]=a[ed+7|0]|0;c[_c>>2]=hd;c[$c>>2]=cd;cd=c[_c>>2]|0;c[Zc>>2]=$c;$c=c[c[Zc>>2]>>2]|0;c[Tc>>2]=bd;bd=c[Tc>>2]|0;c[ad+0>>2]=c[bd+0>>2];c[ad+4>>2]=c[bd+4>>2];a[Yc+0|0]=a[ad+0|0]|0;a[Yc+1|0]=a[ad+1|0]|0;a[Yc+2|0]=a[ad+2|0]|0;a[Yc+3|0]=a[ad+3|0]|0;a[Yc+4|0]=a[ad+4|0]|0;a[Yc+5|0]=a[ad+5|0]|0;a[Yc+6|0]=a[ad+6|0]|0;a[Yc+7|0]=a[ad+7|0]|0;c[Wc>>2]=cd;c[Xc>>2]=$c;$c=c[Wc>>2]|0;c[Vc>>2]=Xc;c[$c>>2]=c[c[Vc>>2]>>2];Vc=$c+4|0;c[Uc>>2]=Yc;Yc=c[Uc>>2]|0;c[Vc+0>>2]=c[Yc+0>>2];c[Vc+4>>2]=c[Yc+4>>2];Yc=c[zd>>2]|0;c[Rc>>2]=Ad;c[Qc>>2]=c[Rc>>2];c[Pc>>2]=c[Qc>>2];c[oc>>2]=(c[c[Pc>>2]>>2]|0)+16;Pc=c[oc>>2]|0;oc=c[yd>>2]|0;c[Nb>>2]=Yc;c[Ob>>2]=Pc;c[Pb>>2]=oc;oc=c[Ob>>2]|0;if((oc|0)!=0){Ob=oc+0|0;oc=(c[Pb>>2]|0)+0|0;Pb=Ob+72|0;do{c[Ob>>2]=c[oc>>2];Ob=Ob+4|0;oc=oc+4|0}while((Ob|0)<(Pb|0))}c[j>>2]=Ad;c[h>>2]=c[j>>2];c[g>>2]=c[h>>2];a[(c[g>>2]|0)+8|0]=1;c[$a>>2]=Ad;g=c[$a>>2]|0;c[Za>>2]=cb;c[_a>>2]=g;g=c[_a>>2]|0;c[Xa>>2]=c[Za>>2];c[Ya>>2]=g;c[c[Xa>>2]>>2]=c[Ya>>2];a[Wa+0|0]=a[cb+0|0]|0;a[Wa+1|0]=a[cb+1|0]|0;a[Wa+2|0]=a[cb+2|0]|0;a[Wa+3|0]=a[cb+3|0]|0;c[Va>>2]=bb;cb=c[Va>>2]|0;a[Ua+0|0]=a[Wa+0|0]|0;a[Ua+1|0]=a[Wa+1|0]|0;a[Ua+2|0]=a[Wa+2|0]|0;a[Ua+3|0]=a[Wa+3|0]|0;c[Sa>>2]=cb;cb=c[Sa>>2]|0;c[Ra>>2]=Ua;c[wa>>2]=c[c[Ra>>2]>>2];Ra=c[wa>>2]|0;c[va>>2]=Ra;c[ua>>2]=c[va>>2];c[xa>>2]=c[c[ua>>2]>>2];c[ta>>2]=Ra;c[sa>>2]=c[ta>>2];c[c[sa>>2]>>2]=0;sa=c[xa>>2]|0;c[ya>>2]=Ua;c[Ba>>2]=c[c[ya>>2]>>2];c[Aa>>2]=c[Ba>>2];c[za>>2]=c[Aa>>2];c[Ca>>2]=(c[za>>2]|0)+4;za=c[Ca>>2]|0;c[Ta+0>>2]=c[za+0>>2];c[Ta+4>>2]=c[za+4>>2];a[Qa+0|0]=a[Ta+0|0]|0;a[Qa+1|0]=a[Ta+1|0]|0;a[Qa+2|0]=a[Ta+2|0]|0;a[Qa+3|0]=a[Ta+3|0]|0;a[Qa+4|0]=a[Ta+4|0]|0;a[Qa+5|0]=a[Ta+5|0]|0;a[Qa+6|0]=a[Ta+6|0]|0;a[Qa+7|0]=a[Ta+7|0]|0;c[Oa>>2]=cb;c[Pa>>2]=sa;sa=c[Oa>>2]|0;Oa=c[Pa>>2]|0;a[Na+0|0]=a[Qa+0|0]|0;a[Na+1|0]=a[Qa+1|0]|0;a[Na+2|0]=a[Qa+2|0]|0;a[Na+3|0]=a[Qa+3|0]|0;a[Na+4|0]=a[Qa+4|0]|0;a[Na+5|0]=a[Qa+5|0]|0;a[Na+6|0]=a[Qa+6|0]|0;a[Na+7|0]=a[Qa+7|0]|0;c[Ka>>2]=sa;c[La>>2]=Oa;Oa=c[Ka>>2]|0;c[Ja>>2]=La;La=c[c[Ja>>2]>>2]|0;c[Da>>2]=Na;Na=c[Da>>2]|0;c[Ma+0>>2]=c[Na+0>>2];c[Ma+4>>2]=c[Na+4>>2];a[Ia+0|0]=a[Ma+0|0]|0;a[Ia+1|0]=a[Ma+1|0]|0;a[Ia+2|0]=a[Ma+2|0]|0;a[Ia+3|0]=a[Ma+3|0]|0;a[Ia+4|0]=a[Ma+4|0]|0;a[Ia+5|0]=a[Ma+5|0]|0;a[Ia+6|0]=a[Ma+6|0]|0;a[Ia+7|0]=a[Ma+7|0]|0;c[Ga>>2]=Oa;c[Ha>>2]=La;La=c[Ga>>2]|0;c[Fa>>2]=Ha;c[La>>2]=c[c[Fa>>2]>>2];Fa=La+4|0;c[Ea>>2]=Ia;Ia=c[Ea>>2]|0;c[Fa+0>>2]=c[Ia+0>>2];c[Fa+4>>2]=c[Ia+4>>2];c[ra>>2]=bb;Ia=c[ra>>2]|0;c[pa>>2]=ab;c[qa>>2]=Ia;Ia=c[qa>>2]|0;c[na>>2]=c[pa>>2];c[oa>>2]=Ia;c[c[na>>2]>>2]=c[oa>>2];a[O+0|0]=a[ab+0|0]|0;a[O+1|0]=a[ab+1|0]|0;a[O+2|0]=a[ab+2|0]|0;a[O+3|0]=a[ab+3|0]|0;c[N>>2]=Dd;ab=c[N>>2]|0;a[M+0|0]=a[O+0|0]|0;a[M+1|0]=a[O+1|0]|0;a[M+2|0]=a[O+2|0]|0;a[M+3|0]=a[O+3|0]|0;c[K>>2]=ab;ab=c[K>>2]|0;c[J>>2]=M;c[o>>2]=c[c[J>>2]>>2];J=c[o>>2]|0;c[n>>2]=J;c[m>>2]=c[n>>2];c[p>>2]=c[c[m>>2]>>2];c[l>>2]=J;c[k>>2]=c[l>>2];c[c[k>>2]>>2]=0;k=c[p>>2]|0;c[q>>2]=M;c[t>>2]=c[c[q>>2]>>2];c[s>>2]=c[t>>2];c[r>>2]=c[s>>2];c[u>>2]=(c[r>>2]|0)+4;r=c[u>>2]|0;c[L+0>>2]=c[r+0>>2];c[L+4>>2]=c[r+4>>2];a[I+0|0]=a[L+0|0]|0;a[I+1|0]=a[L+1|0]|0;a[I+2|0]=a[L+2|0]|0;a[I+3|0]=a[L+3|0]|0;a[I+4|0]=a[L+4|0]|0;a[I+5|0]=a[L+5|0]|0;a[I+6|0]=a[L+6|0]|0;a[I+7|0]=a[L+7|0]|0;c[G>>2]=ab;c[H>>2]=k;k=c[G>>2]|0;G=c[H>>2]|0;a[F+0|0]=a[I+0|0]|0;a[F+1|0]=a[I+1|0]|0;a[F+2|0]=a[I+2|0]|0;a[F+3|0]=a[I+3|0]|0;a[F+4|0]=a[I+4|0]|0;a[F+5|0]=a[I+5|0]|0;a[F+6|0]=a[I+6|0]|0;a[F+7|0]=a[I+7|0]|0;c[C>>2]=k;c[D>>2]=G;G=c[C>>2]|0;c[B>>2]=D;D=c[c[B>>2]>>2]|0;c[v>>2]=F;F=c[v>>2]|0;c[E+0>>2]=c[F+0>>2];c[E+4>>2]=c[F+4>>2];a[A+0|0]=a[E+0|0]|0;a[A+1|0]=a[E+1|0]|0;a[A+2|0]=a[E+2|0]|0;a[A+3|0]=a[E+3|0]|0;a[A+4|0]=a[E+4|0]|0;a[A+5|0]=a[E+5|0]|0;a[A+6|0]=a[E+6|0]|0;a[A+7|0]=a[E+7|0]|0;c[y>>2]=G;c[z>>2]=D;D=c[y>>2]|0;c[x>>2]=z;c[D>>2]=c[c[x>>2]>>2];x=D+4|0;c[w>>2]=A;A=c[w>>2]|0;c[x+0>>2]=c[A+0>>2];c[x+4>>2]=c[A+4>>2];c[ma>>2]=bb;c[la>>2]=c[ma>>2];c[ia>>2]=c[la>>2];c[ja>>2]=0;la=c[ia>>2]|0;c[ha>>2]=la;c[ga>>2]=c[ha>>2];c[ka>>2]=c[c[ga>>2]>>2];ga=c[ja>>2]|0;c[S>>2]=la;c[R>>2]=c[S>>2];c[c[R>>2]>>2]=ga;if((c[ka>>2]|0)!=0){c[Q>>2]=la;c[P>>2]=c[Q>>2];Q=c[ka>>2]|0;c[ea>>2]=(c[P>>2]|0)+4;c[fa>>2]=Q;Q=c[ea>>2]|0;if(a[Q+4|0]&1){ea=c[Q>>2]|0;c[da>>2]=(c[fa>>2]|0)+16;P=c[da>>2]|0;c[W>>2]=ea;c[X>>2]=P;P=c[W>>2]|0;W=c[X>>2]|0;a[V+0|0]=a[Y+0|0]|0;c[T>>2]=P;c[U>>2]=W}if((c[fa>>2]|0)!=0){W=c[fa>>2]|0;c[aa>>2]=c[Q>>2];c[ba>>2]=W;c[ca>>2]=1;W=c[ba>>2]|0;ba=c[ca>>2]|0;c[Z>>2]=c[aa>>2];c[_>>2]=W;c[$>>2]=ba;Jo(c[_>>2]|0)}}c[hb>>2]=Dd;_=c[hb>>2]|0;c[fb>>2]=Cd;c[gb>>2]=_;_=c[gb>>2]|0;c[db>>2]=c[fb>>2];c[eb>>2]=_;c[c[db>>2]>>2]=c[eb>>2];a[Mb+0|0]=a[Cd+0|0]|0;a[Mb+1|0]=a[Cd+1|0]|0;a[Mb+2|0]=a[Cd+2|0]|0;a[Mb+3|0]=a[Cd+3|0]|0;c[Lb>>2]=b;b=c[Lb>>2]|0;a[Kb+0|0]=a[Mb+0|0]|0;a[Kb+1|0]=a[Mb+1|0]|0;a[Kb+2|0]=a[Mb+2|0]|0;a[Kb+3|0]=a[Mb+3|0]|0;c[Ib>>2]=b;b=c[Ib>>2]|0;c[Hb>>2]=Kb;c[mb>>2]=c[c[Hb>>2]>>2];Hb=c[mb>>2]|0;c[lb>>2]=Hb;c[kb>>2]=c[lb>>2];c[nb>>2]=c[c[kb>>2]>>2];c[jb>>2]=Hb;c[ib>>2]=c[jb>>2];c[c[ib>>2]>>2]=0;ib=c[nb>>2]|0;c[ob>>2]=Kb;c[rb>>2]=c[c[ob>>2]>>2];c[qb>>2]=c[rb>>2];c[pb>>2]=c[qb>>2];c[sb>>2]=(c[pb>>2]|0)+4;pb=c[sb>>2]|0;c[Jb+0>>2]=c[pb+0>>2];c[Jb+4>>2]=c[pb+4>>2];a[Gb+0|0]=a[Jb+0|0]|0;a[Gb+1|0]=a[Jb+1|0]|0;a[Gb+2|0]=a[Jb+2|0]|0;a[Gb+3|0]=a[Jb+3|0]|0;a[Gb+4|0]=a[Jb+4|0]|0;a[Gb+5|0]=a[Jb+5|0]|0;a[Gb+6|0]=a[Jb+6|0]|0;a[Gb+7|0]=a[Jb+7|0]|0;c[Eb>>2]=b;c[Fb>>2]=ib;ib=c[Eb>>2]|0;Eb=c[Fb>>2]|0;a[Db+0|0]=a[Gb+0|0]|0;a[Db+1|0]=a[Gb+1|0]|0;a[Db+2|0]=a[Gb+2|0]|0;a[Db+3|0]=a[Gb+3|0]|0;a[Db+4|0]=a[Gb+4|0]|0;a[Db+5|0]=a[Gb+5|0]|0;a[Db+6|0]=a[Gb+6|0]|0;a[Db+7|0]=a[Gb+7|0]|0;c[Ab>>2]=ib;c[Bb>>2]=Eb;Eb=c[Ab>>2]|0;c[zb>>2]=Bb;Bb=c[c[zb>>2]>>2]|0;c[tb>>2]=Db;Db=c[tb>>2]|0;c[Cb+0>>2]=c[Db+0>>2];c[Cb+4>>2]=c[Db+4>>2];a[yb+0|0]=a[Cb+0|0]|0;a[yb+1|0]=a[Cb+1|0]|0;a[yb+2|0]=a[Cb+2|0]|0;a[yb+3|0]=a[Cb+3|0]|0;a[yb+4|0]=a[Cb+4|0]|0;a[yb+5|0]=a[Cb+5|0]|0;a[yb+6|0]=a[Cb+6|0]|0;a[yb+7|0]=a[Cb+7|0]|0;c[wb>>2]=Eb;c[xb>>2]=Bb;Bb=c[wb>>2]|0;c[vb>>2]=xb;c[Bb>>2]=c[c[vb>>2]>>2];vb=Bb+4|0;c[ub>>2]=yb;yb=c[ub>>2]|0;c[vb+0>>2]=c[yb+0>>2];c[vb+4>>2]=c[yb+4>>2];c[nc>>2]=Dd;c[mc>>2]=c[nc>>2];c[jc>>2]=c[mc>>2];c[kc>>2]=0;mc=c[jc>>2]|0;c[ic>>2]=mc;c[hc>>2]=c[ic>>2];c[lc>>2]=c[c[hc>>2]>>2];hc=c[kc>>2]|0;c[Tb>>2]=mc;c[Sb>>2]=c[Tb>>2];c[c[Sb>>2]>>2]=hc;if((c[lc>>2]|0)!=0){c[Rb>>2]=mc;c[Qb>>2]=c[Rb>>2];Rb=c[lc>>2]|0;c[fc>>2]=(c[Qb>>2]|0)+4;c[gc>>2]=Rb;Rb=c[fc>>2]|0;if(a[Rb+4|0]&1){fc=c[Rb>>2]|0;c[ec>>2]=(c[gc>>2]|0)+16;Qb=c[ec>>2]|0;c[Xb>>2]=fc;c[Yb>>2]=Qb;Qb=c[Xb>>2]|0;Xb=c[Yb>>2]|0;a[Wb+0|0]=a[Zb+0|0]|0;c[Ub>>2]=Qb;c[Vb>>2]=Xb}if((c[gc>>2]|0)!=0){Xb=c[gc>>2]|0;c[bc>>2]=c[Rb>>2];c[cc>>2]=Xb;c[dc>>2]=1;Xb=c[cc>>2]|0;cc=c[dc>>2]|0;c[_b>>2]=c[bc>>2];c[$b>>2]=Xb;c[ac>>2]=cc;Jo(c[$b>>2]|0)}}c[Ed>>2]=1;c[Oc>>2]=Ad;c[Nc>>2]=c[Oc>>2];c[Kc>>2]=c[Nc>>2];c[Lc>>2]=0;Nc=c[Kc>>2]|0;c[Jc>>2]=Nc;c[Ic>>2]=c[Jc>>2];c[Mc>>2]=c[c[Ic>>2]>>2];Ic=c[Lc>>2]|0;c[sc>>2]=Nc;c[rc>>2]=c[sc>>2];c[c[rc>>2]>>2]=Ic;if((c[Mc>>2]|0)==0){i=f;return}c[qc>>2]=Nc;c[pc>>2]=c[qc>>2];qc=c[Mc>>2]|0;c[Gc>>2]=(c[pc>>2]|0)+4;c[Hc>>2]=qc;qc=c[Gc>>2]|0;if(a[qc+4|0]&1){Gc=c[qc>>2]|0;c[Fc>>2]=(c[Hc>>2]|0)+16;pc=c[Fc>>2]|0;c[wc>>2]=Gc;c[xc>>2]=pc;pc=c[wc>>2]|0;wc=c[xc>>2]|0;a[vc+0|0]=a[yc+0|0]|0;c[tc>>2]=pc;c[uc>>2]=wc}if((c[Hc>>2]|0)==0){i=f;return}wc=c[Hc>>2]|0;c[Cc>>2]=c[qc>>2];c[Dc>>2]=wc;c[Ec>>2]=1;wc=c[Dc>>2]|0;Dc=c[Ec>>2]|0;c[zc>>2]=c[Cc>>2];c[Ac>>2]=wc;c[Bc>>2]=Dc;Jo(c[Ac>>2]|0);i=f;return}function de(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0;f=i;i=i+144|0;g=f+140|0;h=f+132|0;j=f+128|0;k=f+124|0;l=f+116|0;m=f+112|0;n=f+104|0;o=f+100|0;p=f+96|0;q=f+88|0;r=f+84|0;s=f+80|0;t=f+76|0;u=f+72|0;v=f+68|0;w=f+64|0;x=f+56|0;y=f+52|0;z=f+48|0;A=f+44|0;B=f+36|0;C=f+32|0;D=f+28|0;E=f+24|0;F=f+20|0;G=f+16|0;H=f+12|0;I=f+8|0;J=f+4|0;K=f;c[E>>2]=a;c[F>>2]=b;c[G>>2]=d;c[H>>2]=e;e=c[E>>2]|0;c[B>>2]=D;c[C>>2]=-1;E=c[C>>2]|0;c[A>>2]=c[B>>2];c[f+40>>2]=E;c[c[A>>2]>>2]=0;c[I>>2]=c[D>>2];c[f+60>>2]=I;c[c[H>>2]>>2]=0;c[h>>2]=k;c[j>>2]=-1;I=c[j>>2]|0;c[g>>2]=c[h>>2];c[f+136>>2]=I;c[c[g>>2]>>2]=0;c[J>>2]=c[k>>2];c[f+120>>2]=J;c[(c[H>>2]|0)+4>>2]=0;c[(c[H>>2]|0)+8>>2]=c[F>>2];c[c[G>>2]>>2]=c[H>>2];c[l>>2]=e;H=c[c[c[l>>2]>>2]>>2]|0;c[n>>2]=p;c[o>>2]=-1;l=c[o>>2]|0;c[m>>2]=c[n>>2];c[f+108>>2]=l;c[c[m>>2]>>2]=0;c[K>>2]=c[p>>2];c[f+92>>2]=K;if((H|0)!=0){c[q>>2]=e;H=c[c[c[q>>2]>>2]>>2]|0;c[r>>2]=e;c[c[r>>2]>>2]=H}c[w>>2]=e;c[v>>2]=(c[w>>2]|0)+4;c[u>>2]=c[v>>2];c[t>>2]=c[u>>2];c[s>>2]=c[t>>2];Gd(c[c[s>>2]>>2]|0,c[c[G>>2]>>2]|0);c[z>>2]=e;c[y>>2]=(c[z>>2]|0)+8;c[x>>2]=c[y>>2];y=c[x>>2]|0;c[y>>2]=(c[y>>2]|0)+1;i=f;return}function ee(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0;e=i;i=i+208|0;f=e+192|0;g=e+188|0;h=e+184|0;j=e+180|0;k=e+176|0;l=e+172|0;m=e+168|0;n=e+164|0;o=e+160|0;p=e+156|0;q=e+152|0;r=e+148|0;s=e+144|0;t=e+140|0;u=e+136|0;v=e+132|0;w=e+128|0;x=e+124|0;y=e+120|0;z=e+116|0;A=e+112|0;B=e+108|0;C=e+104|0;D=e+96|0;E=e+92|0;F=e+88|0;G=e+84|0;H=e+80|0;I=e+76|0;J=e+72|0;K=e+68|0;L=e+64|0;M=e+60|0;N=e+56|0;O=e+52|0;P=e+48|0;Q=e+44|0;R=e+40|0;S=e+36|0;T=e+32|0;U=e+28|0;V=e+24|0;W=e+20|0;X=e+16|0;Y=e+12|0;Z=e+8|0;_=e+4|0;$=e;c[Y>>2]=b;c[Z>>2]=d;d=c[Y>>2]|0;Y=c[Z>>2]|0;c[X>>2]=d;c[W>>2]=c[X>>2];c[V>>2]=(c[W>>2]|0)+4;c[U>>2]=c[V>>2];c[T>>2]=c[U>>2];c[S>>2]=c[T>>2];T=c[c[S>>2]>>2]|0;c[C>>2]=d;c[B>>2]=(c[C>>2]|0)+4;c[A>>2]=c[B>>2];c[z>>2]=c[A>>2];c[y>>2]=c[z>>2];fe(_,d,Y,T,c[y>>2]|0);c[p>>2]=d;c[o>>2]=c[p>>2];c[n>>2]=(c[o>>2]|0)+4;c[m>>2]=c[n>>2];c[l>>2]=c[m>>2];c[k>>2]=c[l>>2];l=c[k>>2]|0;c[h>>2]=$;c[j>>2]=l;l=c[j>>2]|0;c[f>>2]=c[h>>2];c[g>>2]=l;c[c[f>>2]>>2]=c[g>>2];c[s>>2]=_;c[t>>2]=$;$=c[t>>2]|0;c[q>>2]=c[s>>2];c[r>>2]=$;if((c[c[q>>2]>>2]|0)==(c[c[r>>2]>>2]|0)^1?(c[w>>2]=d,c[v>>2]=(c[w>>2]|0)+8,c[u>>2]=c[v>>2],v=c[u>>2]|0,u=c[Z>>2]|0,c[x>>2]=_,Z=(c[c[x>>2]>>2]|0)+16|0,c[F>>2]=v,c[G>>2]=u,c[H>>2]=Z,Z=c[G>>2]|0,G=c[H>>2]|0,c[e+100>>2]=c[F>>2],c[D>>2]=Z,c[E>>2]=G,!(Jd(c[D>>2]|0,c[E>>2]|0)|0)):0){c[a+0>>2]=c[_+0>>2];i=e;return}c[R>>2]=d;c[Q>>2]=c[R>>2];c[P>>2]=(c[Q>>2]|0)+4;c[O>>2]=c[P>>2];c[N>>2]=c[O>>2];c[M>>2]=c[N>>2];N=c[M>>2]|0;c[K>>2]=a;c[L>>2]=N;N=c[L>>2]|0;c[I>>2]=c[K>>2];c[J>>2]=N;c[c[I>>2]>>2]=c[J>>2];i=e;return}function fe(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;g=i;i=i+96|0;h=g+92|0;j=g+88|0;k=g+84|0;l=g+80|0;m=g+76|0;n=g+72|0;o=g+68|0;p=g+64|0;q=g+60|0;r=g+56|0;s=g+52|0;t=g+48|0;u=g+44|0;v=g+40|0;w=g+36|0;x=g+32|0;y=g+28|0;z=g+24|0;A=g+20|0;B=g+16|0;C=g+12|0;D=g+8|0;E=g+4|0;F=g;c[B>>2]=b;c[C>>2]=d;c[D>>2]=e;c[E>>2]=f;f=c[B>>2]|0;while(1){B=c[D>>2]|0;c[y>>2]=A;c[z>>2]=-1;e=c[z>>2]|0;c[w>>2]=c[y>>2];c[x>>2]=e;c[c[w>>2]>>2]=0;c[F>>2]=c[A>>2];c[l>>2]=F;if((B|0)==0){break}c[k>>2]=f;c[j>>2]=(c[k>>2]|0)+8;c[h>>2]=c[j>>2];B=(c[D>>2]|0)+16|0;e=c[C>>2]|0;c[p>>2]=c[h>>2];c[q>>2]=B;c[r>>2]=e;e=c[q>>2]|0;B=c[r>>2]|0;c[m>>2]=c[p>>2];c[n>>2]=e;c[o>>2]=B;B=Jd(c[n>>2]|0,c[o>>2]|0)|0;e=c[D>>2]|0;if(B){c[D>>2]=c[e+4>>2];continue}else{c[E>>2]=e;c[D>>2]=c[c[D>>2]>>2];continue}}D=c[E>>2]|0;c[u>>2]=a;c[v>>2]=D;D=c[v>>2]|0;c[s>>2]=c[u>>2];c[t>>2]=D;c[c[s>>2]>>2]=c[t>>2];i=g;return}function ge(a){a=a|0;var b=0,d=0;b=i;i=i+16|0;d=b;c[d>>2]=a;he(c[d>>2]|0);i=b;return}function he(a){a=a|0;var b=0,d=0;b=i;i=i+16|0;d=b;c[d>>2]=a;ie(c[d>>2]|0);i=b;return}function ie(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0;b=i;i=i+32|0;d=b+24|0;e=b+20|0;f=b+16|0;g=b+12|0;h=b+8|0;j=b+4|0;k=b;c[k>>2]=a;a=c[k>>2]|0;c[j>>2]=a;c[h>>2]=c[j>>2];c[g>>2]=(c[h>>2]|0)+4;c[f>>2]=c[g>>2];c[e>>2]=c[f>>2];c[d>>2]=c[e>>2];je(a,c[c[d>>2]>>2]|0);i=b;return}function je(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;e=i;i=i+112|0;f=e+96|0;g=e+92|0;h=e+88|0;j=e+84|0;k=e+80|0;l=e+76|0;m=e;n=e+72|0;o=e+68|0;p=e+100|0;q=e+64|0;r=e+60|0;s=e+56|0;t=e+52|0;u=e+48|0;v=e+44|0;w=e+36|0;x=e+28|0;y=e+24|0;z=e+20|0;A=e+16|0;B=e+12|0;C=e+8|0;D=e+4|0;c[A>>2]=b;c[B>>2]=d;d=c[A>>2]|0;A=c[B>>2]|0;c[x>>2]=z;c[y>>2]=-1;b=c[y>>2]|0;c[w>>2]=c[x>>2];c[e+32>>2]=b;c[c[w>>2]>>2]=0;c[C>>2]=c[z>>2];c[e+40>>2]=C;if((A|0)==0){i=e;return}je(d,c[c[B>>2]>>2]|0);je(d,c[(c[B>>2]|0)+4>>2]|0);c[h>>2]=d;c[g>>2]=(c[h>>2]|0)+4;c[f>>2]=c[g>>2];c[D>>2]=c[f>>2];f=c[D>>2]|0;c[j>>2]=(c[B>>2]|0)+16;g=c[j>>2]|0;c[n>>2]=f;c[o>>2]=g;g=c[n>>2]|0;n=c[o>>2]|0;a[m+0|0]=a[p+0|0]|0;c[k>>2]=g;c[l>>2]=n;n=c[B>>2]|0;c[t>>2]=c[D>>2];c[u>>2]=n;c[v>>2]=1;n=c[u>>2]|0;u=c[v>>2]|0;c[q>>2]=c[t>>2];c[r>>2]=n;c[s>>2]=u;Jo(c[r>>2]|0);i=e;return}function ke(a){a=a|0;var b=0,d=0;b=i;i=i+16|0;d=b;c[d>>2]=a;a=c[d>>2]|0;d=Ye(a,a+200|0)|0;i=b;return d|0}function le(a){a=a|0;var b=0,d=0;b=i;i=i+16|0;d=b;c[d>>2]=a;a=c[d>>2]|0;d=Ye(a,a+221|0)|0;i=b;return d|0}function me(a){a=a|0;var b=0,d=0;b=i;i=i+16|0;d=b;c[d>>2]=a;ne(c[d>>2]|0);i=b;return}function ne(a){a=a|0;var b=0,d=0;b=i;i=i+16|0;d=b;c[d>>2]=a;oe(c[d>>2]|0);i=b;return}function oe(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0;b=i;i=i+32|0;d=b+24|0;e=b+20|0;f=b+16|0;g=b+12|0;h=b+8|0;j=b+4|0;k=b;c[k>>2]=a;a=c[k>>2]|0;c[j>>2]=a;c[h>>2]=c[j>>2];c[g>>2]=(c[h>>2]|0)+4;c[f>>2]=c[g>>2];c[e>>2]=c[f>>2];c[d>>2]=c[e>>2];pe(a,c[c[d>>2]>>2]|0);i=b;return}function pe(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;e=i;i=i+112|0;f=e+96|0;g=e+92|0;h=e+88|0;j=e+84|0;k=e+80|0;l=e+76|0;m=e;n=e+72|0;o=e+68|0;p=e+100|0;q=e+64|0;r=e+60|0;s=e+56|0;t=e+52|0;u=e+48|0;v=e+44|0;w=e+36|0;x=e+28|0;y=e+24|0;z=e+20|0;A=e+16|0;B=e+12|0;C=e+8|0;D=e+4|0;c[A>>2]=b;c[B>>2]=d;d=c[A>>2]|0;A=c[B>>2]|0;c[x>>2]=z;c[y>>2]=-1;b=c[y>>2]|0;c[w>>2]=c[x>>2];c[e+32>>2]=b;c[c[w>>2]>>2]=0;c[C>>2]=c[z>>2];c[e+40>>2]=C;if((A|0)==0){i=e;return}pe(d,c[c[B>>2]>>2]|0);pe(d,c[(c[B>>2]|0)+4>>2]|0);c[h>>2]=d;c[g>>2]=(c[h>>2]|0)+4;c[f>>2]=c[g>>2];c[D>>2]=c[f>>2];f=c[D>>2]|0;c[j>>2]=(c[B>>2]|0)+16;g=c[j>>2]|0;c[n>>2]=f;c[o>>2]=g;g=c[n>>2]|0;n=c[o>>2]|0;a[m+0|0]=a[p+0|0]|0;c[k>>2]=g;c[l>>2]=n;n=c[B>>2]|0;c[t>>2]=c[D>>2];c[u>>2]=n;c[v>>2]=1;n=c[u>>2]|0;u=c[v>>2]|0;c[q>>2]=c[t>>2];c[r>>2]=n;c[s>>2]=u;Jo(c[r>>2]|0);i=e;return}function qe(a){a=a|0;var b=0,d=0;b=i;i=i+16|0;d=b;c[d>>2]=a;re(c[d>>2]|0);i=b;return}function re(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;d=i;i=i+144|0;e=d+128|0;f=d+124|0;g=d+120|0;h=d;j=d+116|0;k=d+112|0;l=d+132|0;m=d+108|0;n=d+104|0;o=d+100|0;p=d+96|0;q=d+92|0;r=d+88|0;s=d+84|0;t=d+80|0;u=d+76|0;v=d+72|0;w=d+68|0;x=d+64|0;y=d+60|0;z=d+52|0;A=d+48|0;B=d+44|0;C=d+40|0;D=d+36|0;E=d+32|0;F=d+28|0;G=d+20|0;H=d+16|0;I=d+12|0;J=d+8|0;K=d+4|0;c[J>>2]=b;b=c[J>>2]|0;J=c[b>>2]|0;c[G>>2]=I;c[H>>2]=-1;L=c[H>>2]|0;c[F>>2]=c[G>>2];c[d+24>>2]=L;c[c[F>>2]>>2]=0;c[K>>2]=c[I>>2];c[d+56>>2]=K;if((J|0)==0){i=d;return}c[r>>2]=b;J=c[r>>2]|0;r=c[J>>2]|0;c[p>>2]=J;c[q>>2]=r;r=c[p>>2]|0;while(1){if((c[q>>2]|0)==(c[r+4>>2]|0)){break}c[o>>2]=r;c[n>>2]=(c[o>>2]|0)+8;c[m>>2]=c[n>>2];p=c[m>>2]|0;J=r+4|0;K=(c[J>>2]|0)+ -272|0;c[J>>2]=K;c[e>>2]=K;K=c[e>>2]|0;c[j>>2]=p;c[k>>2]=K;K=c[j>>2]|0;p=c[k>>2]|0;a[h+0|0]=a[l+0|0]|0;c[f>>2]=K;c[g>>2]=p}c[u>>2]=b;c[t>>2]=(c[u>>2]|0)+8;c[s>>2]=c[t>>2];t=c[s>>2]|0;s=c[b>>2]|0;c[y>>2]=b;b=c[y>>2]|0;c[x>>2]=b;c[w>>2]=(c[x>>2]|0)+8;c[v>>2]=c[w>>2];w=((c[c[v>>2]>>2]|0)-(c[b>>2]|0)|0)/272|0;c[C>>2]=t;c[D>>2]=s;c[E>>2]=w;w=c[D>>2]|0;D=c[E>>2]|0;c[z>>2]=c[C>>2];c[A>>2]=w;c[B>>2]=D;Jo(c[A>>2]|0);i=d;return}function se(a){a=a|0;var b=0,d=0;b=i;i=i+16|0;d=b;c[d>>2]=a;te(c[d>>2]|0);i=b;return}function te(a){a=a|0;var b=0;b=i;i=i+16|0;c[b>>2]=a;i=b;return}function ue(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+16|0;g=f+12|0;h=f+8|0;j=f+4|0;k=f;c[g>>2]=a;c[h>>2]=b;c[j>>2]=d;c[k>>2]=e;e=c[g>>2]|0;ve(e);c[e>>2]=216;c[e+4>>2]=c[h>>2];c[e+8>>2]=c[j>>2];c[e+12>>2]=c[k>>2];i=f;return}function ve(a){a=a|0;var b=0,d=0;b=i;i=i+16|0;d=b;c[d>>2]=a;c[c[d>>2]>>2]=8312;i=b;return}function we(a){a=a|0;var b=0,d=0;b=i;i=i+16|0;d=b;c[d>>2]=a;te(c[d>>2]|0);i=b;return}function xe(a){a=a|0;var b=0,d=0;b=i;i=i+16|0;d=b;c[d>>2]=a;a=c[d>>2]|0;we(a);Jo(a);i=b;return}function ye(a){a=a|0;var b=0,d=0,e=0;b=i;i=i+16|0;d=b;c[d>>2]=a;a=c[d>>2]|0;d=Ze(a)|0;e=d+(_e(a)|0)|0;i=b;return e|0}function ze(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=i;i=i+16|0;e=d+4|0;f=d;c[e>>2]=a;c[f>>2]=b;Ae(c[f>>2]|0,c[e>>2]|0);i=d;return}function Ae(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+16|0;f=e+4|0;g=e;c[f>>2]=b;c[g>>2]=d;d=(c[g>>2]|0)+0|0;g=(c[f>>2]|0)+200|0;f=d+63|0;do{a[d]=a[g]|0;d=d+1|0;g=g+1|0}while((d|0)<(f|0));i=e;return}function Be(){var a=0;a=i;ad();bd();i=a;return}function Ce(){var a=0;a=i;Rc(8328,-2);i=a;return}function De(){var a=0;a=i;Rc(8336,-1);i=a;return}function Ee(d,e){d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+16|0;g=f;h=f+12|0;j=f+8|0;k=f+4|0;c[h>>2]=d;c[j>>2]=e;e=c[h>>2]|0;if((a[c[j>>2]|0]|0)==45){b[e>>1]=-1;i=f;return}else{h=c[j>>2]|0;c[g>>2]=k;Ha(h|0,8344,g|0)|0;g=(c[k>>2]|0)-17|0;k=g|(117-(gp(a[(c[j>>2]|0)+2|0]|0)|0)&31)<<11;b[e>>1]=k|(a[(c[j>>2]|0)+3|0]|0)-48<<8;i=f;return}}function Fe(a){a=a|0;var d=0,e=0,f=0,g=0,h=0;d=i;i=i+16|0;e=d;f=d+12|0;c[f>>2]=a;a=c[f>>2]|0;if(sd(a)|0){ip(8352,8360)|0;i=d;return 8352}else{f=(b[a>>1]&255)+17|0;g=117-(ud(a)|0)|0;h=Ge(a)|0;c[e>>2]=f;c[e+4>>2]=g;c[e+8>>2]=h;jb(8352,8368,e|0)|0;i=d;return 8352}return 0}function Ge(a){a=a|0;var b=0,d=0;b=i;i=i+16|0;d=b;c[d>>2]=a;i=b;return(e[c[d>>2]>>1]|0)>>8&7|0}function He(a){a=a|0;var d=0,e=0;d=i;i=i+16|0;e=d;c[e>>2]=a;i=d;return b[c[e>>2]>>1]&15|0}function Ie(a){a=a|0;var b=0,d=0;b=i;i=i+16|0;d=b;c[d>>2]=a;i=b;return(e[c[d>>2]>>1]|0)>>4&15|0}function Je(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+16|0;g=f+12|0;h=f+8|0;j=f+4|0;k=f;c[g>>2]=a;c[h>>2]=b;c[j>>2]=d;c[k>>2]=e;df(c[g>>2]|0,c[h>>2]|0,c[j>>2]|0,c[k>>2]|0);i=f;return}function Ke(b){b=b|0;var d=0,e=0;d=i;i=i+16|0;e=d;c[e>>2]=b;b=c[e>>2]|0;fp(b|0,0,196)|0;a[Le(b,4,4)|0]=1;a[Le(b,9,9)|0]=16;c[b+196>>2]=0;e=b+200|0;b=e+63|0;do{a[e]=0;e=e+1|0}while((e|0)<(b|0));i=d;return}function Le(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=i;i=i+16|0;f=e+8|0;g=e+4|0;h=e;c[f>>2]=a;c[g>>2]=b;c[h>>2]=d;i=e;return(c[f>>2]|0)+((c[h>>2]|0)*14|0)+(c[g>>2]|0)|0}function Me(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;f=i;i=i+48|0;g=f+32|0;h=f+28|0;j=f+24|0;k=f+20|0;l=f+16|0;m=f+12|0;n=f+8|0;o=f+4|0;p=f;c[h>>2]=b;b=c[h>>2]|0;if(sd(e)|0){a[g]=1;q=a[g]|0;r=q&1;i=f;return r|0}h=ud(e)|0;if((a[(Ne(b)|0)+h|0]|0)!=0){a[g]=0;q=a[g]|0;r=q&1;i=f;return r|0}h=Ge(e)|0;s=13264+((ud(e)|0)<<2)|0;c[j>>2]=(d[s]|d[s+1|0]<<8|d[s+2|0]<<16|d[s+3|0]<<24)+44+(h*12|0);h=Ie(e)|0;c[k>>2]=h+(c[c[j>>2]>>2]|0);h=He(e)|0;c[l>>2]=h+(c[(c[j>>2]|0)+4>>2]|0);c[m>>2]=c[(c[j>>2]|0)+8>>2];if((((((c[k>>2]|0)+(c[(c[m>>2]|0)+160>>2]|0)|0)>=0?((c[k>>2]|0)+(c[(c[m>>2]|0)+168>>2]|0)|0)<14:0)?((c[l>>2]|0)+(c[(c[m>>2]|0)+164>>2]|0)|0)>=0:0)?((c[l>>2]|0)+(c[(c[m>>2]|0)+172>>2]|0)|0)<14:0)?Oe(b,c[k>>2]|0,c[l>>2]|0,c[m>>2]|0)|0:0){c[n>>2]=0;while(1){if((c[n>>2]|0)>=(c[(c[m>>2]|0)+4>>2]|0)){t=16;break}c[o>>2]=(c[k>>2]|0)+(c[(c[m>>2]|0)+8+(c[n>>2]<<3)>>2]|0);c[p>>2]=(c[l>>2]|0)+(c[(c[m>>2]|0)+8+(c[n>>2]<<3)+4>>2]|0);j=d[Le(b,c[o>>2]|0,c[p>>2]|0)|0]|0;h=rd(b)|0;if((j&(h?1:16)|0)!=0){t=14;break}c[n>>2]=(c[n>>2]|0)+1}if((t|0)==14){a[g]=1;q=a[g]|0;r=q&1;i=f;return r|0}else if((t|0)==16){a[g]=0;q=a[g]|0;r=q&1;i=f;return r|0}}a[g]=0;q=a[g]|0;r=q&1;i=f;return r|0}function Ne(a){a=a|0;var b=0,d=0,e=0;b=i;i=i+16|0;d=b;c[d>>2]=a;a=c[d>>2]|0;d=rd(a)|0;e=a+200|0;i=b;return(d?e:e+21|0)|0}function Oe(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;h=i;i=i+32|0;j=h+29|0;k=h+24|0;l=h+20|0;m=h+16|0;n=h+12|0;o=h+28|0;p=h+8|0;q=h+4|0;r=h;c[k>>2]=b;c[l>>2]=e;c[m>>2]=f;c[n>>2]=g;g=c[k>>2]|0;k=rd(g)|0;a[o]=k?70:100;c[p>>2]=0;while(1){if((c[p>>2]|0)>=(c[(c[n>>2]|0)+4>>2]|0)){s=6;break}c[q>>2]=(c[l>>2]|0)+(c[(c[n>>2]|0)+8+(c[p>>2]<<3)>>2]|0);c[r>>2]=(c[m>>2]|0)+(c[(c[n>>2]|0)+8+(c[p>>2]<<3)+4>>2]|0);k=d[Le(g,c[q>>2]|0,c[r>>2]|0)|0]|0;if((k&(d[o]|0)|0)!=0){s=4;break}c[p>>2]=(c[p>>2]|0)+1}if((s|0)==4){a[j]=0;t=a[j]|0;u=t&1;i=h;return u|0}else if((s|0)==6){a[j]=1;t=a[j]|0;u=t&1;i=h;return u|0}return 0}function Pe(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;f=i;i=i+48|0;g=f+32|0;h=f+28|0;j=f+24|0;k=f+20|0;l=f+16|0;m=f+38|0;n=f+37|0;o=f+36|0;p=f+12|0;q=f+8|0;r=f+4|0;s=f;c[g>>2]=b;b=c[g>>2]|0;if(sd(e)|0){Qe(b);i=f;return}g=Ge(e)|0;t=13264+((ud(e)|0)<<2)|0;c[h>>2]=(d[t]|d[t+1|0]<<8|d[t+2|0]<<16|d[t+3|0]<<24)+44+(g*12|0);g=Ie(e)|0;c[j>>2]=g+(c[c[h>>2]>>2]|0);g=He(e)|0;c[k>>2]=g+(c[(c[h>>2]|0)+4>>2]|0);c[l>>2]=c[(c[h>>2]|0)+8>>2];h=rd(b)|0;a[m]=h?4:64;h=rd(b)|0;a[n]=h?2:32;h=rd(b)|0;a[o]=h?1:16;c[p>>2]=0;while(1){if((c[p>>2]|0)>=(c[(c[l>>2]|0)+4>>2]|0)){break}c[q>>2]=(c[j>>2]|0)+(c[(c[l>>2]|0)+8+(c[p>>2]<<3)>>2]|0);c[r>>2]=(c[k>>2]|0)+(c[(c[l>>2]|0)+8+(c[p>>2]<<3)+4>>2]|0);h=d[m]|0;g=Le(b,c[q>>2]|0,c[r>>2]|0)|0;a[g]=d[g]|0|h;if(Re((c[q>>2]|0)-1|0,c[r>>2]|0)|0){h=d[n]|0;g=Le(b,(c[q>>2]|0)-1|0,c[r>>2]|0)|0;a[g]=d[g]|0|h}if(Re(c[q>>2]|0,(c[r>>2]|0)-1|0)|0){h=d[n]|0;g=Le(b,c[q>>2]|0,(c[r>>2]|0)-1|0)|0;a[g]=d[g]|0|h}if(Re((c[q>>2]|0)+1|0,c[r>>2]|0)|0){h=d[n]|0;g=Le(b,(c[q>>2]|0)+1|0,c[r>>2]|0)|0;a[g]=d[g]|0|h}if(Re(c[q>>2]|0,(c[r>>2]|0)+1|0)|0){h=d[n]|0;g=Le(b,c[q>>2]|0,(c[r>>2]|0)+1|0)|0;a[g]=d[g]|0|h}if(Re((c[q>>2]|0)-1|0,(c[r>>2]|0)-1|0)|0){h=d[o]|0;g=Le(b,(c[q>>2]|0)-1|0,(c[r>>2]|0)-1|0)|0;a[g]=d[g]|0|h}if(Re((c[q>>2]|0)+1|0,(c[r>>2]|0)-1|0)|0){h=d[o]|0;g=Le(b,(c[q>>2]|0)+1|0,(c[r>>2]|0)-1|0)|0;a[g]=d[g]|0|h}if(Re((c[q>>2]|0)-1|0,(c[r>>2]|0)+1|0)|0){h=d[o]|0;g=Le(b,(c[q>>2]|0)-1|0,(c[r>>2]|0)+1|0)|0;a[g]=d[g]|0|h}if(Re((c[q>>2]|0)+1|0,(c[r>>2]|0)+1|0)|0){h=d[o]|0;g=Le(b,(c[q>>2]|0)+1|0,(c[r>>2]|0)+1|0)|0;a[g]=d[g]|0|h}c[p>>2]=(c[p>>2]|0)+1}p=rd(b)|0;r=ud(e)|0;c[s>>2]=p?r:r+21|0;r=((Se(e)|0)&255)+17&255;a[b+200+(c[s>>2]|0)|0]=r;r=rd(b)|0;s=Ge(e)|0;p=b+200+(42+(ud(e)|0))|0;a[p]=d[p]|0|(r?s:s<<4);s=b+196|0;c[s>>2]=(c[s>>2]|0)+1;i=f;return}function Qe(a){a=a|0;var b=0,d=0;b=i;i=i+16|0;d=b;c[d>>2]=a;a=(c[d>>2]|0)+196|0;c[a>>2]=(c[a>>2]|0)+1;i=b;return}function Re(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=i;i=i+16|0;e=d+4|0;f=d;c[e>>2]=a;c[f>>2]=b;if(((c[e>>2]|0)>=0?(c[f>>2]|0)>=0:0)?(c[e>>2]|0)<14:0){g=(c[f>>2]|0)<14}else{g=0}i=d;return g|0}function Se(a){a=a|0;var b=0,d=0;b=i;i=i+16|0;d=b;c[d>>2]=a;i=b;return(e[c[d>>2]>>1]|0)&255|0}function Te(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=i;i=i+32|0;e=d+20|0;f=d+16|0;g=d+4|0;c[e>>2]=a;c[f>>2]=b;b=c[e>>2]|0;Ue(g,c[f>>2]|0);Ve(b,g)|0;b=c[g+8>>2]|0;c[d>>2]=1;We(g);i=d;return b|0}function Ue(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=i;i=i+16|0;e=d+4|0;f=d;c[e>>2]=a;c[f>>2]=b;af(c[e>>2]|0,c[f>>2]|0);i=d;return}function Ve(e,f){e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;g=i;i=i+1296|0;h=g+1288|0;j=g+1293|0;k=g+1248|0;l=g+1244|0;m=g+1240|0;n=g+1286|0;o=g+1284|0;p=g+40|0;q=g+36|0;r=g+1292|0;s=g+1291|0;t=g+1290|0;u=g+32|0;v=g+28|0;w=g+24|0;x=g+20|0;y=g+16|0;z=g+12|0;A=g+1256|0;B=g+8|0;C=g+4|0;D=g;E=g+1254|0;F=g+1252|0;c[k>>2]=e;c[l>>2]=f;f=c[k>>2]|0;if((Wc(f)|0)<2){k=(Wc(f)|0)==0;c[m>>2]=k?8552:9384;while(1){if((b[c[m>>2]>>1]|0)==0){G=8;break}Rc(n,b[c[m>>2]>>1]|0);k=Ge(n)|0;e=13264+((ud(n)|0)<<2)|0;if(Xe(f,c[(d[e]|d[e+1|0]<<8|d[e+2|0]<<16|d[e+3|0]<<24)+44+(k*12|0)+8>>2]|0)|0){k=c[l>>2]|0;e=c[(c[k>>2]|0)+8>>2]|0;b[o+0>>1]=b[n+0>>1]|0;b[h+0>>1]=b[o+0>>1]|0;if(!(xc[e&31](k,h)|0)){G=6;break}}c[m>>2]=(c[m>>2]|0)+2}if((G|0)==6){a[j]=0;H=a[j]|0;I=H&1;i=g;return I|0}else if((G|0)==8){a[j]=1;H=a[j]|0;I=H&1;i=g;return I|0}}m=rd(f)|0;a[r]=m?71:116;m=rd(f)|0;a[s]=m?1:16;m=rd(f)|0;a[t]=m?2:32;c[q>>2]=p;c[u>>2]=0;while(1){if((c[u>>2]|0)>=14){break}c[v>>2]=0;while(1){if((c[v>>2]|0)>=14){break}m=d[Le(f,c[v>>2]|0,c[u>>2]|0)|0]|0;if((m&d[r]|0)==(d[s]|0)){c[c[q>>2]>>2]=c[v>>2];c[(c[q>>2]|0)+4>>2]=c[u>>2];if((c[u>>2]|0)>0?(m=d[Le(f,c[v>>2]|0,(c[u>>2]|0)-1|0)|0]|0,(m&d[t]|0)!=0):0){if((c[v>>2]|0)>0){m=d[Le(f,(c[v>>2]|0)-1|0,c[u>>2]|0)|0]|0;J=(m&d[t]|0)!=0}else{J=0}K=J?0:1}else{if((c[v>>2]|0)>0){m=d[Le(f,(c[v>>2]|0)-1|0,c[u>>2]|0)|0]|0;L=(m&d[t]|0)!=0}else{L=0}K=L?2:3}c[(c[q>>2]|0)+8>>2]=K;c[q>>2]=(c[q>>2]|0)+12}c[v>>2]=(c[v>>2]|0)+1}c[u>>2]=(c[u>>2]|0)+1}c[c[q>>2]>>2]=-1;c[w>>2]=0;c[x>>2]=0;a:while(1){if((c[x>>2]|0)>=21){break}u=c[x>>2]|0;b:do{if((a[(Ne(f)|0)+u|0]|0)==0){v=13264+(c[x>>2]<<2)|0;c[y>>2]=d[v]|d[v+1|0]<<8|d[v+2|0]<<16|d[v+3|0]<<24;c[z>>2]=(c[y>>2]|0)+8;while(1){if((c[c[z>>2]>>2]|0)==0){break b}c:do{if(Xe(f,c[c[z>>2]>>2]|0)|0){v=A+0|0;K=v+28|0;do{b[v>>1]=0;v=v+2|0}while((v|0)<(K|0));c[q>>2]=p;while(1){if((c[c[q>>2]>>2]|0)<0){break c}c[B>>2]=0;while(1){M=c[q>>2]|0;if((c[B>>2]|0)>=(c[(c[c[z>>2]>>2]|0)+48+(c[(c[q>>2]|0)+8>>2]<<2)>>2]|0)){break}c[C>>2]=(c[M>>2]|0)-(c[(c[c[z>>2]>>2]|0)+64+((c[(c[q>>2]|0)+8>>2]|0)*24|0)+(c[B>>2]<<3)>>2]|0);c[D>>2]=(c[(c[q>>2]|0)+4>>2]|0)-(c[(c[c[z>>2]>>2]|0)+64+((c[(c[q>>2]|0)+8>>2]|0)*24|0)+(c[B>>2]<<3)+4>>2]|0);if(((((((c[D>>2]|0)+(c[(c[c[z>>2]>>2]|0)+164>>2]|0)|0)>=0?((c[D>>2]|0)+(c[(c[c[z>>2]>>2]|0)+172>>2]|0)|0)<14:0)?((c[C>>2]|0)+(c[(c[c[z>>2]>>2]|0)+160>>2]|0)|0)>=0:0)?((c[C>>2]|0)+(c[(c[c[z>>2]>>2]|0)+168>>2]|0)|0)<14:0)?(b[A+(c[D>>2]<<1)>>1]&1<<c[C>>2]|0)==0:0)?(v=A+(c[D>>2]<<1)|0,b[v>>1]=b[v>>1]|1<<c[C>>2],Oe(f,c[C>>2]|0,c[D>>2]|0,c[c[z>>2]>>2]|0)|0):0){v=c[l>>2]|0;K=c[(c[v>>2]|0)+8>>2]|0;Je(E,c[C>>2]|0,c[D>>2]|0,c[c[c[z>>2]>>2]>>2]|0);b[h+0>>1]=b[E+0>>1]|0;if(!(xc[K&31](v,h)|0)){G=42;break a}c[w>>2]=(c[w>>2]|0)+1}c[B>>2]=(c[B>>2]|0)+1}c[q>>2]=M+12}}}while(0);c[z>>2]=(c[z>>2]|0)+4}}}while(0);c[x>>2]=(c[x>>2]|0)+1}if((G|0)==42){a[j]=0;H=a[j]|0;I=H&1;i=g;return I|0}if((c[w>>2]|0)==0){w=c[l>>2]|0;l=c[(c[w>>2]|0)+8>>2]|0;b[F+0>>1]=b[8336>>1]|0;b[h+0>>1]=b[F+0>>1]|0;a[j]=(xc[l&31](w,h)|0)&1;H=a[j]|0;I=H&1;i=g;return I|0}else{a[j]=1;H=a[j]|0;I=H&1;i=g;return I|0}return 0}function We(a){a=a|0;var b=0,d=0;b=i;i=i+16|0;d=b;c[d>>2]=a;$e(c[d>>2]|0);i=b;return}function Xe(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0;e=i;i=i+16|0;f=e+8|0;g=e+4|0;h=e;c[g>>2]=b;c[h>>2]=d;if((Wc(c[g>>2]|0)|0)<8?(c[(c[h>>2]|0)+4>>2]|0)<5:0){a[f]=0;j=a[f]|0;k=j&1;i=e;return k|0}a[f]=1;j=a[f]|0;k=j&1;i=e;return k|0}function Ye(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;i=i+16|0;g=f+8|0;h=f+4|0;j=f;c[f+12>>2]=b;c[g>>2]=e;c[h>>2]=0;c[j>>2]=0;while(1){if((c[j>>2]|0)>=21){break}if((a[(c[g>>2]|0)+(c[j>>2]|0)|0]|0)!=0){e=13264+(c[j>>2]<<2)|0;c[h>>2]=(c[h>>2]|0)+(c[(d[e]|d[e+1|0]<<8|d[e+2|0]<<16|d[e+3|0]<<24)+4>>2]|0)}c[j>>2]=(c[j>>2]|0)+1}i=f;return c[h>>2]|0}function Ze(a){a=a|0;var b=0,e=0,f=0,g=0;b=i;i=i+16|0;e=b+8|0;f=b+4|0;g=b;c[e>>2]=a;a=c[e>>2]|0;c[f>>2]=0;c[g>>2]=0;while(1){if((c[g>>2]|0)>=21){break}if((d[a+200+(c[g>>2]|0)|0]|0|0)==0){c[f>>2]=(c[f>>2]|0)-(c[8376+(c[g>>2]<<2)>>2]|0)}if((d[a+200+(21+(c[g>>2]|0))|0]|0|0)==0){c[f>>2]=(c[f>>2]|0)+(c[8376+(c[g>>2]<<2)>>2]|0)}c[g>>2]=(c[g>>2]|0)+1}i=b;return c[f>>2]|0}function _e(b){b=b|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;e=i;i=i+1872|0;f=e+1616|0;g=e+1624|0;h=e+48|0;j=e+44|0;k=e+40|0;l=e+36|0;m=e+32|0;n=e+28|0;o=e+24|0;p=e+20|0;q=e+16|0;r=e+12|0;s=e+8|0;t=e+4|0;u=e;c[f>>2]=b;b=c[f>>2]|0;c[l>>2]=0;c[m>>2]=0;while(1){if((c[m>>2]|0)>14){break}a[g+(c[m>>2]|0)|0]=68;c[m>>2]=(c[m>>2]|0)+1}c[n>>2]=0;while(1){if((c[n>>2]|0)>14){break}a[g+(((c[n>>2]|0)*15|0)+14)|0]=68;c[n>>2]=(c[n>>2]|0)+1}c[o>>2]=0;while(1){if((c[o>>2]|0)>14){break}a[g+(225+(c[o>>2]|0))|0]=68;c[o>>2]=(c[o>>2]|0)+1}c[p>>2]=0;while(1){if((c[p>>2]|0)>=2){break}c[j>>2]=h;c[q>>2]=0;while(1){if((c[q>>2]|0)>=14){break}c[r>>2]=0;while(1){if((c[r>>2]|0)>=14){break}o=d[Le(b,c[r>>2]|0,c[q>>2]|0)|0]|0;a[g+((((c[q>>2]|0)+1|0)*15|0)+(c[r>>2]|0))|0]=o&(d[8464+(c[p>>2]|0)|0]|0);if((d[g+((((c[q>>2]|0)+1|0)*15|0)+(c[r>>2]|0))|0]|0|0)==(d[8472+(c[p>>2]|0)|0]|0|0)){o=g+((((c[q>>2]|0)+1|0)*15|0)+(c[r>>2]|0))|0;n=c[j>>2]|0;c[j>>2]=n+4;c[n>>2]=o;c[l>>2]=(c[l>>2]|0)+1}c[r>>2]=(c[r>>2]|0)+1}c[q>>2]=(c[q>>2]|0)+1}c[c[j>>2]>>2]=0;c[j>>2]=h;c[k>>2]=h+784;while(1){if((c[c[j>>2]>>2]|0)==0){break}o=c[j>>2]|0;c[j>>2]=o+4;c[s>>2]=c[o>>2];if((d[(c[s>>2]|0)+ -15|0]|0|0)==0){a[(c[s>>2]|0)+ -15|0]=1;o=(c[s>>2]|0)+ -15|0;n=c[k>>2]|0;c[k>>2]=n+4;c[n>>2]=o;c[l>>2]=(c[l>>2]|0)+1}if((d[(c[s>>2]|0)+ -1|0]|0|0)==0){a[(c[s>>2]|0)+ -1|0]=1;o=(c[s>>2]|0)+ -1|0;n=c[k>>2]|0;c[k>>2]=n+4;c[n>>2]=o;c[l>>2]=(c[l>>2]|0)+1}if((d[(c[s>>2]|0)+1|0]|0|0)==0){a[(c[s>>2]|0)+1|0]=1;o=(c[s>>2]|0)+1|0;n=c[k>>2]|0;c[k>>2]=n+4;c[n>>2]=o;c[l>>2]=(c[l>>2]|0)+1}if((d[(c[s>>2]|0)+15|0]|0|0)!=0){continue}a[(c[s>>2]|0)+15|0]=1;o=(c[s>>2]|0)+15|0;n=c[k>>2]|0;c[k>>2]=n+4;c[n>>2]=o;c[l>>2]=(c[l>>2]|0)+1}c[c[k>>2]>>2]=0;c[j>>2]=h+784;c[k>>2]=h;while(1){if((c[c[j>>2]>>2]|0)==0){break}o=c[j>>2]|0;c[j>>2]=o+4;c[t>>2]=c[o>>2];if((d[(c[t>>2]|0)+ -15|0]|0|0)==0){a[(c[t>>2]|0)+ -15|0]=1;o=(c[t>>2]|0)+ -15|0;n=c[k>>2]|0;c[k>>2]=n+4;c[n>>2]=o;c[l>>2]=(c[l>>2]|0)+1}if((d[(c[t>>2]|0)+ -1|0]|0|0)==0){a[(c[t>>2]|0)+ -1|0]=1;o=(c[t>>2]|0)+ -1|0;n=c[k>>2]|0;c[k>>2]=n+4;c[n>>2]=o;c[l>>2]=(c[l>>2]|0)+1}if((d[(c[t>>2]|0)+1|0]|0|0)==0){a[(c[t>>2]|0)+1|0]=1;o=(c[t>>2]|0)+1|0;n=c[k>>2]|0;c[k>>2]=n+4;c[n>>2]=o;c[l>>2]=(c[l>>2]|0)+1}if((d[(c[t>>2]|0)+15|0]|0|0)!=0){continue}a[(c[t>>2]|0)+15|0]=1;o=(c[t>>2]|0)+15|0;n=c[k>>2]|0;c[k>>2]=n+4;c[n>>2]=o;c[l>>2]=(c[l>>2]|0)+1}c[c[k>>2]>>2]=0;c[j>>2]=h;while(1){if((c[c[j>>2]>>2]|0)==0){break}o=c[j>>2]|0;c[j>>2]=o+4;c[u>>2]=c[o>>2];if((d[(c[u>>2]|0)+ -15|0]|0|0)==0){a[(c[u>>2]|0)+ -15|0]=1;c[l>>2]=(c[l>>2]|0)+1}if((d[(c[u>>2]|0)+ -1|0]|0|0)==0){a[(c[u>>2]|0)+ -1|0]=1;c[l>>2]=(c[l>>2]|0)+1}if((d[(c[u>>2]|0)+1|0]|0|0)==0){a[(c[u>>2]|0)+1|0]=1;c[l>>2]=(c[l>>2]|0)+1}if((d[(c[u>>2]|0)+15|0]|0|0)!=0){continue}a[(c[u>>2]|0)+15|0]=1;c[l>>2]=(c[l>>2]|0)+1}c[l>>2]=0-(c[l>>2]|0);c[p>>2]=(c[p>>2]|0)+1}i=e;return c[l>>2]|0}function $e(a){a=a|0;var b=0,d=0;b=i;i=i+16|0;d=b;c[d>>2]=a;te(c[d>>2]|0);i=b;return}function af(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=i;i=i+16|0;e=d+4|0;f=d;c[e>>2]=a;c[f>>2]=b;b=c[e>>2]|0;ve(b);c[b>>2]=8488;c[b+4>>2]=c[f>>2];c[b+8>>2]=0;i=d;return}function bf(a){a=a|0;var b=0,d=0;b=i;i=i+16|0;d=b;c[d>>2]=a;a=c[d>>2]|0;We(a);Jo(a);i=b;return}function cf(a,d){a=a|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+16|0;f=e;c[f>>2]=a;a=c[f>>2]|0;f=a+8|0;g=c[f>>2]|0;c[f>>2]=g+1;f=(c[a+4>>2]|0)+(g<<1)|0;b[f+0>>1]=b[d+0>>1]|0;i=e;return 1}function df(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;g=i;i=i+16|0;h=g+12|0;j=g+8|0;k=g+4|0;l=g;c[h>>2]=a;c[j>>2]=d;c[k>>2]=e;c[l>>2]=f;b[c[h>>2]>>1]=c[j>>2]<<4|c[k>>2]|c[l>>2]<<8;i=g;return}function ef(){var a=0;a=i;Ce();De();i=a;return}function ff(){var a=0;a=i;Rc(8536,-2);i=a;return}function gf(){var a=0;a=i;Rc(8544,-1);i=a;return}function hf(a,d){a=a|0;d=d|0;var e=0,f=0;e=i;i=i+16|0;f=e;c[f>>2]=d;if((Wc(c[f>>2]|0)|0)==0){jf(a);i=e;return}else{b[a+0>>1]=b[8536>>1]|0;i=e;return}}function jf(a){a=a|0;var d=0,e=0;d=i;i=i+16|0;e=d;c[e>>2]=~~(+($o()|0)/2147483648.0*10.0);Rc(a,b[10216+(c[e>>2]<<1)>>1]|0);i=d;return}function kf(){var a=0;a=i;ff();gf();i=a;return}function lf(b){b=b|0;var d=0,e=0,f=0,g=0,h=0;b=i;i=i+16|0;d=b;e=c[s>>2]|0;Hf(30080,e,30136);c[7342]=31508;c[29376>>2]=31528;c[29372>>2]=0;Kg(29376|0,30080);c[29448>>2]=0;c[29452>>2]=-1;f=c[t>>2]|0;c[7546]=31376;Nl(30188|0);c[30192>>2]=0;c[30196>>2]=0;c[30200>>2]=0;c[30204>>2]=0;c[30208>>2]=0;c[30212>>2]=0;c[7546]=30696;c[30216>>2]=f;Ol(d,30188|0);g=Ql(d,34168)|0;Pl(d);c[30220>>2]=g;c[30224>>2]=30144;a[30228|0]=(oc[c[(c[g>>2]|0)+28>>2]&63](g)|0)&1;c[7364]=31588;c[29460>>2]=31608;Kg(29460|0,30184);c[29532>>2]=0;c[29536>>2]=-1;g=c[r>>2]|0;c[7558]=31376;Nl(30236|0);c[30240>>2]=0;c[30244>>2]=0;c[30248>>2]=0;c[30252>>2]=0;c[30256>>2]=0;c[30260>>2]=0;c[7558]=30696;c[30264>>2]=g;Ol(d,30236|0);h=Ql(d,34168)|0;Pl(d);c[30268>>2]=h;c[30272>>2]=30152;a[30276|0]=(oc[c[(c[h>>2]|0)+28>>2]&63](h)|0)&1;c[7386]=31588;c[29548>>2]=31608;Kg(29548|0,30232);c[29620>>2]=0;c[29624>>2]=-1;h=c[(c[(c[7386]|0)+ -12>>2]|0)+29568>>2]|0;c[7408]=31588;c[29636>>2]=31608;Kg(29636|0,h);c[29708>>2]=0;c[29712>>2]=-1;c[(c[(c[7342]|0)+ -12>>2]|0)+29440>>2]=29456;h=(c[(c[7386]|0)+ -12>>2]|0)+29548|0;c[h>>2]=c[h>>2]|8192;c[(c[(c[7386]|0)+ -12>>2]|0)+29616>>2]=29456;tf(30280,e,30160|0);c[7430]=31548;c[29728>>2]=31568;c[29724>>2]=0;Kg(29728|0,30280);c[29800>>2]=0;c[29804>>2]=-1;c[7584]=31440;Nl(30340|0);c[30344>>2]=0;c[30348>>2]=0;c[30352>>2]=0;c[30356>>2]=0;c[30360>>2]=0;c[30364>>2]=0;c[7584]=30440;c[30368>>2]=f;Ol(d,30340|0);f=Ql(d,34176)|0;Pl(d);c[30372>>2]=f;c[30376>>2]=30168;a[30380|0]=(oc[c[(c[f>>2]|0)+28>>2]&63](f)|0)&1;c[7452]=31628;c[29812>>2]=31648;Kg(29812|0,30336);c[29884>>2]=0;c[29888>>2]=-1;c[7596]=31440;Nl(30388|0);c[30392>>2]=0;c[30396>>2]=0;c[30400>>2]=0;c[30404>>2]=0;c[30408>>2]=0;c[30412>>2]=0;c[7596]=30440;c[30416>>2]=g;Ol(d,30388|0);g=Ql(d,34176)|0;Pl(d);c[30420>>2]=g;c[30424>>2]=30176;a[30428|0]=(oc[c[(c[g>>2]|0)+28>>2]&63](g)|0)&1;c[7474]=31628;c[29900>>2]=31648;Kg(29900|0,30384);c[29972>>2]=0;c[29976>>2]=-1;g=c[(c[(c[7474]|0)+ -12>>2]|0)+29920>>2]|0;c[7496]=31628;c[29988>>2]=31648;Kg(29988|0,g);c[30060>>2]=0;c[30064>>2]=-1;c[(c[(c[7430]|0)+ -12>>2]|0)+29792>>2]=29808;g=(c[(c[7474]|0)+ -12>>2]|0)+29900|0;c[g>>2]=c[g>>2]|8192;c[(c[(c[7474]|0)+ -12>>2]|0)+29968>>2]=29808;i=b;return}function mf(a){a=a|0;a=i;ph(29456)|0;ph(29632)|0;uh(29808)|0;uh(29984)|0;i=a;return}function nf(a){a=a|0;var b=0;b=i;c[a>>2]=31440;Pl(a+4|0);i=b;return}function of(a){a=a|0;var b=0;b=i;c[a>>2]=31440;Pl(a+4|0);Jo(a);i=b;return}function pf(b,d){b=b|0;d=d|0;var e=0,f=0;e=i;oc[c[(c[b>>2]|0)+24>>2]&63](b)|0;f=Ql(d,34176)|0;c[b+36>>2]=f;a[b+44|0]=(oc[c[(c[f>>2]|0)+28>>2]&63](f)|0)&1;i=e;return}function qf(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;b=i;i=i+16|0;d=b+8|0;e=b;f=a+36|0;g=a+40|0;h=d+8|0;j=d;k=a+32|0;while(1){a=c[f>>2]|0;l=yc[c[(c[a>>2]|0)+20>>2]&15](a,c[g>>2]|0,d,h,e)|0;a=(c[e>>2]|0)-j|0;if((ob(d|0,1,a|0,c[k>>2]|0)|0)!=(a|0)){m=-1;n=5;break}if((l|0)==2){m=-1;n=5;break}else if((l|0)!=1){n=4;break}}if((n|0)==4){m=((Qb(c[k>>2]|0)|0)!=0)<<31>>31;i=b;return m|0}else if((n|0)==5){i=b;return m|0}return 0}function rf(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;a:do{if((a[b+44|0]|0)==0){if((e|0)>0){g=d;h=0;while(1){if((xc[c[(c[b>>2]|0)+52>>2]&31](b,c[g>>2]|0)|0)==-1){j=h;break a}k=h+1|0;if((k|0)<(e|0)){g=g+4|0;h=k}else{j=k;break}}}else{j=0}}else{j=ob(d|0,4,e|0,c[b+32>>2]|0)|0}}while(0);i=f;return j|0}function sf(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;e=i;i=i+32|0;f=e+16|0;g=e+8|0;h=e+4|0;j=e;k=(d|0)==-1;a:do{if(!k){c[g>>2]=d;if((a[b+44|0]|0)!=0){if((ob(g|0,4,1,c[b+32>>2]|0)|0)==1){break}else{l=-1}i=e;return l|0}c[h>>2]=f;m=g+4|0;n=b+36|0;o=b+40|0;p=f+8|0;q=f;r=b+32|0;s=g;while(1){t=c[n>>2]|0;u=tc[c[(c[t>>2]|0)+12>>2]&15](t,c[o>>2]|0,s,m,j,f,p,h)|0;if((c[j>>2]|0)==(s|0)){l=-1;v=12;break}if((u|0)==3){v=7;break}t=(u|0)==1;if(!(u>>>0<2)){l=-1;v=12;break}u=(c[h>>2]|0)-q|0;if((ob(f|0,1,u|0,c[r>>2]|0)|0)!=(u|0)){l=-1;v=12;break}if(t){s=t?c[j>>2]|0:s}else{break a}}if((v|0)==7){if((ob(s|0,1,1,c[r>>2]|0)|0)==1){break}else{l=-1}i=e;return l|0}else if((v|0)==12){i=e;return l|0}}}while(0);l=k?0:d;i=e;return l|0}function tf(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;i=i+16|0;g=f;c[b>>2]=31440;h=b+4|0;Nl(h);j=b+8|0;c[j+0>>2]=0;c[j+4>>2]=0;c[j+8>>2]=0;c[j+12>>2]=0;c[j+16>>2]=0;c[j+20>>2]=0;c[b>>2]=30552;c[b+32>>2]=d;c[b+40>>2]=e;c[b+48>>2]=-1;a[b+52|0]=0;Ol(g,h);h=Ql(g,34176)|0;e=b+36|0;c[e>>2]=h;d=b+44|0;c[d>>2]=oc[c[(c[h>>2]|0)+24>>2]&63](h)|0;h=c[e>>2]|0;a[b+53|0]=(oc[c[(c[h>>2]|0)+28>>2]&63](h)|0)&1;if((c[d>>2]|0)>8){_k(30648)}else{Pl(g);i=f;return}}function uf(a){a=a|0;var b=0;b=i;c[a>>2]=31440;Pl(a+4|0);i=b;return}function vf(a){a=a|0;var b=0;b=i;c[a>>2]=31440;Pl(a+4|0);Jo(a);i=b;return}function wf(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=i;f=Ql(d,34176)|0;d=b+36|0;c[d>>2]=f;g=b+44|0;c[g>>2]=oc[c[(c[f>>2]|0)+24>>2]&63](f)|0;f=c[d>>2]|0;a[b+53|0]=(oc[c[(c[f>>2]|0)+28>>2]&63](f)|0)&1;if((c[g>>2]|0)>8){_k(30648)}else{i=e;return}}function xf(a){a=a|0;var b=0,c=0;b=i;c=Af(a,0)|0;i=b;return c|0}function yf(a){a=a|0;var b=0,c=0;b=i;c=Af(a,1)|0;i=b;return c|0}function zf(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;e=i;i=i+32|0;f=e+16|0;g=e+8|0;h=e+4|0;j=e;k=b+52|0;l=(a[k]|0)!=0;if((d|0)==-1){if(l){m=-1;i=e;return m|0}n=c[b+48>>2]|0;a[k]=(n|0)!=-1|0;m=n;i=e;return m|0}n=b+48|0;a:do{if(l){c[h>>2]=c[n>>2];o=c[b+36>>2]|0;p=tc[c[(c[o>>2]|0)+12>>2]&15](o,c[b+40>>2]|0,h,h+4|0,j,f,f+8|0,g)|0;if((p|0)==3){a[f]=c[n>>2];c[g>>2]=f+1}else if((p|0)==1|(p|0)==2){m=-1;i=e;return m|0}p=b+32|0;while(1){o=c[g>>2]|0;if(!(o>>>0>f>>>0)){break a}q=o+ -1|0;c[g>>2]=q;if((Pb(a[q]|0,c[p>>2]|0)|0)==-1){m=-1;break}}i=e;return m|0}}while(0);c[n>>2]=d;a[k]=1;m=d;i=e;return m|0}function Af(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;e=i;i=i+32|0;f=e+16|0;g=e+8|0;h=e+4|0;j=e;k=b+52|0;if((a[k]|0)!=0){l=b+48|0;m=c[l>>2]|0;if(!d){n=m;i=e;return n|0}c[l>>2]=-1;a[k]=0;n=m;i=e;return n|0}m=c[b+44>>2]|0;k=(m|0)>1?m:1;a:do{if((k|0)>0){m=b+32|0;l=0;while(1){o=Hb(c[m>>2]|0)|0;if((o|0)==-1){n=-1;break}a[f+l|0]=o;l=l+1|0;if((l|0)>=(k|0)){break a}}i=e;return n|0}}while(0);b:do{if((a[b+53|0]|0)==0){l=b+40|0;m=b+36|0;o=g+4|0;p=b+32|0;q=k;while(1){r=c[l>>2]|0;s=r;t=c[s>>2]|0;u=c[s+4>>2]|0;s=c[m>>2]|0;v=f+q|0;w=tc[c[(c[s>>2]|0)+16>>2]&15](s,r,f,v,h,g,o,j)|0;if((w|0)==2){n=-1;x=22;break}else if((w|0)==3){x=14;break}else if((w|0)!=1){y=q;break b}w=c[l>>2]|0;c[w>>2]=t;c[w+4>>2]=u;if((q|0)==8){n=-1;x=22;break}u=Hb(c[p>>2]|0)|0;if((u|0)==-1){n=-1;x=22;break}a[v]=u;q=q+1|0}if((x|0)==14){c[g>>2]=a[f]|0;y=q;break}else if((x|0)==22){i=e;return n|0}}else{c[g>>2]=a[f]|0;y=k}}while(0);if(d){d=c[g>>2]|0;c[b+48>>2]=d;n=d;i=e;return n|0}d=b+32|0;b=y;while(1){if((b|0)<=0){break}y=b+ -1|0;if((Pb(a[f+y|0]|0,c[d>>2]|0)|0)==-1){n=-1;x=22;break}else{b=y}}if((x|0)==22){i=e;return n|0}n=c[g>>2]|0;i=e;return n|0}function Bf(a){a=a|0;var b=0;b=i;c[a>>2]=31376;Pl(a+4|0);i=b;return}function Cf(a){a=a|0;var b=0;b=i;c[a>>2]=31376;Pl(a+4|0);Jo(a);i=b;return}function Df(b,d){b=b|0;d=d|0;var e=0,f=0;e=i;oc[c[(c[b>>2]|0)+24>>2]&63](b)|0;f=Ql(d,34168)|0;c[b+36>>2]=f;a[b+44|0]=(oc[c[(c[f>>2]|0)+28>>2]&63](f)|0)&1;i=e;return}function Ef(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;b=i;i=i+16|0;d=b+8|0;e=b;f=a+36|0;g=a+40|0;h=d+8|0;j=d;k=a+32|0;while(1){a=c[f>>2]|0;l=yc[c[(c[a>>2]|0)+20>>2]&15](a,c[g>>2]|0,d,h,e)|0;a=(c[e>>2]|0)-j|0;if((ob(d|0,1,a|0,c[k>>2]|0)|0)!=(a|0)){m=-1;n=5;break}if((l|0)==2){m=-1;n=5;break}else if((l|0)!=1){n=4;break}}if((n|0)==4){m=((Qb(c[k>>2]|0)|0)!=0)<<31>>31;i=b;return m|0}else if((n|0)==5){i=b;return m|0}return 0}function Ff(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;g=i;if((a[b+44|0]|0)!=0){h=ob(e|0,1,f|0,c[b+32>>2]|0)|0;i=g;return h|0}if((f|0)>0){j=e;k=0}else{h=0;i=g;return h|0}while(1){if((xc[c[(c[b>>2]|0)+52>>2]&31](b,d[j]|0)|0)==-1){h=k;l=6;break}e=k+1|0;if((e|0)<(f|0)){j=j+1|0;k=e}else{h=e;l=6;break}}if((l|0)==6){i=g;return h|0}return 0}function Gf(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;e=i;i=i+32|0;f=e+16|0;g=e+8|0;h=e+4|0;j=e;k=(d|0)==-1;a:do{if(!k){a[g]=d;if((a[b+44|0]|0)!=0){if((ob(g|0,1,1,c[b+32>>2]|0)|0)==1){break}else{l=-1}i=e;return l|0}c[h>>2]=f;m=g+1|0;n=b+36|0;o=b+40|0;p=f+8|0;q=f;r=b+32|0;s=g;while(1){t=c[n>>2]|0;u=tc[c[(c[t>>2]|0)+12>>2]&15](t,c[o>>2]|0,s,m,j,f,p,h)|0;if((c[j>>2]|0)==(s|0)){l=-1;v=12;break}if((u|0)==3){v=7;break}t=(u|0)==1;if(!(u>>>0<2)){l=-1;v=12;break}u=(c[h>>2]|0)-q|0;if((ob(f|0,1,u|0,c[r>>2]|0)|0)!=(u|0)){l=-1;v=12;break}if(t){s=t?c[j>>2]|0:s}else{break a}}if((v|0)==7){if((ob(s|0,1,1,c[r>>2]|0)|0)==1){break}else{l=-1}i=e;return l|0}else if((v|0)==12){i=e;return l|0}}}while(0);l=k?0:d;i=e;return l|0}function Hf(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;i=i+16|0;g=f;c[b>>2]=31376;h=b+4|0;Nl(h);j=b+8|0;c[j+0>>2]=0;c[j+4>>2]=0;c[j+8>>2]=0;c[j+12>>2]=0;c[j+16>>2]=0;c[j+20>>2]=0;c[b>>2]=30808;c[b+32>>2]=d;c[b+40>>2]=e;c[b+48>>2]=-1;a[b+52|0]=0;Ol(g,h);h=Ql(g,34168)|0;e=b+36|0;c[e>>2]=h;d=b+44|0;c[d>>2]=oc[c[(c[h>>2]|0)+24>>2]&63](h)|0;h=c[e>>2]|0;a[b+53|0]=(oc[c[(c[h>>2]|0)+28>>2]&63](h)|0)&1;if((c[d>>2]|0)>8){_k(30648)}else{Pl(g);i=f;return}}function If(a){a=a|0;var b=0;b=i;c[a>>2]=31376;Pl(a+4|0);i=b;return}function Jf(a){a=a|0;var b=0;b=i;c[a>>2]=31376;Pl(a+4|0);Jo(a);i=b;return}function Kf(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=i;f=Ql(d,34168)|0;d=b+36|0;c[d>>2]=f;g=b+44|0;c[g>>2]=oc[c[(c[f>>2]|0)+24>>2]&63](f)|0;f=c[d>>2]|0;a[b+53|0]=(oc[c[(c[f>>2]|0)+28>>2]&63](f)|0)&1;if((c[g>>2]|0)>8){_k(30648)}else{i=e;return}}function Lf(a){a=a|0;var b=0,c=0;b=i;c=Of(a,0)|0;i=b;return c|0}function Mf(a){a=a|0;var b=0,c=0;b=i;c=Of(a,1)|0;i=b;return c|0}function Nf(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;e=i;i=i+32|0;f=e+16|0;g=e+4|0;h=e+8|0;j=e;k=b+52|0;l=(a[k]|0)!=0;if((d|0)==-1){if(l){m=-1;i=e;return m|0}n=c[b+48>>2]|0;a[k]=(n|0)!=-1|0;m=n;i=e;return m|0}n=b+48|0;a:do{if(l){a[h]=c[n>>2];o=c[b+36>>2]|0;p=tc[c[(c[o>>2]|0)+12>>2]&15](o,c[b+40>>2]|0,h,h+1|0,j,f,f+8|0,g)|0;if((p|0)==3){a[f]=c[n>>2];c[g>>2]=f+1}else if((p|0)==1|(p|0)==2){m=-1;i=e;return m|0}p=b+32|0;while(1){o=c[g>>2]|0;if(!(o>>>0>f>>>0)){break a}q=o+ -1|0;c[g>>2]=q;if((Pb(a[q]|0,c[p>>2]|0)|0)==-1){m=-1;break}}i=e;return m|0}}while(0);c[n>>2]=d;a[k]=1;m=d;i=e;return m|0}function Of(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;f=i;i=i+32|0;g=f+16|0;h=f+8|0;j=f+4|0;k=f;l=b+52|0;if((a[l]|0)!=0){m=b+48|0;n=c[m>>2]|0;if(!e){o=n;i=f;return o|0}c[m>>2]=-1;a[l]=0;o=n;i=f;return o|0}n=c[b+44>>2]|0;l=(n|0)>1?n:1;a:do{if((l|0)>0){n=b+32|0;m=0;while(1){p=Hb(c[n>>2]|0)|0;if((p|0)==-1){o=-1;break}a[g+m|0]=p;m=m+1|0;if((m|0)>=(l|0)){break a}}i=f;return o|0}}while(0);b:do{if((a[b+53|0]|0)==0){m=b+40|0;n=b+36|0;p=h+1|0;q=b+32|0;r=l;while(1){s=c[m>>2]|0;t=s;u=c[t>>2]|0;v=c[t+4>>2]|0;t=c[n>>2]|0;w=g+r|0;x=tc[c[(c[t>>2]|0)+16>>2]&15](t,s,g,w,j,h,p,k)|0;if((x|0)==3){y=14;break}else if((x|0)==2){o=-1;y=23;break}else if((x|0)!=1){z=r;break b}x=c[m>>2]|0;c[x>>2]=u;c[x+4>>2]=v;if((r|0)==8){o=-1;y=23;break}v=Hb(c[q>>2]|0)|0;if((v|0)==-1){o=-1;y=23;break}a[w]=v;r=r+1|0}if((y|0)==14){a[h]=a[g]|0;z=r;break}else if((y|0)==23){i=f;return o|0}}else{a[h]=a[g]|0;z=l}}while(0);do{if(!e){l=b+32|0;k=z;while(1){if((k|0)<=0){y=21;break}j=k+ -1|0;if((Pb(d[g+j|0]|0,c[l>>2]|0)|0)==-1){o=-1;y=23;break}else{k=j}}if((y|0)==21){A=a[h]|0;break}else if((y|0)==23){i=f;return o|0}}else{k=a[h]|0;c[b+48>>2]=k&255;A=k}}while(0);o=A&255;i=f;return o|0}function Pf(){var a=0;a=i;lf(0);gc(117,30072,q|0)|0;i=a;return}function Qf(a){a=a|0;return}function Rf(a){a=a|0;var b=0;b=a+4|0;c[b>>2]=(c[b>>2]|0)+1;return}function Sf(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a+4|0;e=c[d>>2]|0;c[d>>2]=e+ -1;if((e|0)!=0){f=0;i=b;return f|0}lc[c[(c[a>>2]|0)+8>>2]&255](a);f=1;i=b;return f|0}function Tf(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=i;c[a>>2]=30952;e=cp(b|0)|0;f=Io(e+13|0)|0;c[f+4>>2]=e;c[f>>2]=e;g=f+12|0;c[a+4>>2]=g;c[f+8>>2]=0;dp(g|0,b|0,e+1|0)|0;i=d;return}function Uf(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;c[a>>2]=30952;d=a+4|0;e=(c[d>>2]|0)+ -4|0;f=c[e>>2]|0;c[e>>2]=f+ -1;if((f+ -1|0)<0){Ko((c[d>>2]|0)+ -12|0)}Va(a|0);Jo(a);i=b;return}function Vf(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;c[a>>2]=30952;d=a+4|0;e=(c[d>>2]|0)+ -4|0;f=c[e>>2]|0;c[e>>2]=f+ -1;if((f+ -1|0)>=0){Va(a|0);i=b;return}Ko((c[d>>2]|0)+ -12|0);Va(a|0);i=b;return}function Wf(a){a=a|0;return c[a+4>>2]|0}function Xf(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=i;c[b>>2]=30976;if((a[d]&1)==0){f=d+1|0}else{f=c[d+8>>2]|0}d=cp(f|0)|0;g=Io(d+13|0)|0;c[g+4>>2]=d;c[g>>2]=d;h=g+12|0;c[b+4>>2]=h;c[g+8>>2]=0;dp(h|0,f|0,d+1|0)|0;i=e;return}function Yf(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=i;c[a>>2]=30976;e=cp(b|0)|0;f=Io(e+13|0)|0;c[f+4>>2]=e;c[f>>2]=e;g=f+12|0;c[a+4>>2]=g;c[f+8>>2]=0;dp(g|0,b|0,e+1|0)|0;i=d;return}function Zf(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;c[a>>2]=30976;d=a+4|0;e=(c[d>>2]|0)+ -4|0;f=c[e>>2]|0;c[e>>2]=f+ -1;if((f+ -1|0)<0){Ko((c[d>>2]|0)+ -12|0)}Va(a|0);Jo(a);i=b;return}function _f(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;c[a>>2]=30976;d=a+4|0;e=(c[d>>2]|0)+ -4|0;f=c[e>>2]|0;c[e>>2]=f+ -1;if((f+ -1|0)>=0){Va(a|0);i=b;return}Ko((c[d>>2]|0)+ -12|0);Va(a|0);i=b;return}function $f(a){a=a|0;return c[a+4>>2]|0}function ag(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;c[a>>2]=30952;d=a+4|0;e=(c[d>>2]|0)+ -4|0;f=c[e>>2]|0;c[e>>2]=f+ -1;if((f+ -1|0)<0){Ko((c[d>>2]|0)+ -12|0)}Va(a|0);Jo(a);i=b;return}function bg(a){a=a|0;return}function cg(a,b,d){a=a|0;b=b|0;d=d|0;c[a>>2]=d;c[a+4>>2]=b;return}function dg(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+16|0;f=e;qc[c[(c[a>>2]|0)+12>>2]&3](f,a,b);if((c[f+4>>2]|0)!=(c[d+4>>2]|0)){g=0;i=e;return g|0}g=(c[f>>2]|0)==(c[d>>2]|0);i=e;return g|0}function eg(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;e=i;if((c[b+4>>2]|0)!=(a|0)){f=0;i=e;return f|0}f=(c[b>>2]|0)==(d|0);i=e;return f|0}function fg(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;d=i;f=ec(e|0)|0;e=cp(f|0)|0;if(e>>>0>4294967279){lg(0)}if(e>>>0<11){a[b]=e<<1;g=b+1|0;dp(g|0,f|0,e|0)|0;h=g+e|0;a[h]=0;i=d;return}else{j=e+16&-16;k=Ho(j)|0;c[b+8>>2]=k;c[b>>2]=j|1;c[b+4>>2]=e;g=k;dp(g|0,f|0,e|0)|0;h=g+e|0;a[h]=0;i=d;return}}function gg(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;i=i+16|0;g=f;h=c[d>>2]|0;if((h|0)!=0){j=a[e]|0;if((j&1)==0){k=(j&255)>>>1}else{k=c[e+4>>2]|0}if((k|0)==0){l=h}else{vg(e,31128,2)|0;l=c[d>>2]|0}h=c[d+4>>2]|0;qc[c[(c[h>>2]|0)+24>>2]&3](g,h,l);l=a[g]|0;if((l&1)==0){m=g+1|0;n=(l&255)>>>1}else{m=c[g+8>>2]|0;n=c[g+4>>2]|0}vg(e,m,n)|0;if(!((a[g]&1)==0)){Jo(c[g+8>>2]|0)}}c[b+0>>2]=c[e+0>>2];c[b+4>>2]=c[e+4>>2];c[b+8>>2]=c[e+8>>2];c[e+0>>2]=0;c[e+4>>2]=0;c[e+8>>2]=0;i=f;return}function hg(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+32|0;g=f+12|0;h=f;j=cp(e|0)|0;if(j>>>0>4294967279){lg(0)}if(j>>>0<11){a[h]=j<<1;k=h+1|0}else{l=j+16&-16;m=Ho(l)|0;c[h+8>>2]=m;c[h>>2]=l|1;c[h+4>>2]=j;k=m}dp(k|0,e|0,j|0)|0;a[k+j|0]=0;gg(g,d,h);Xf(b,g);if(!((a[g]&1)==0)){Jo(c[g+8>>2]|0)}if(!((a[h]&1)==0)){Jo(c[h+8>>2]|0)}c[b>>2]=31144;h=d;d=c[h+4>>2]|0;g=b+8|0;c[g>>2]=c[h>>2];c[g+4>>2]=d;i=f;return}function ig(a){a=a|0;var b=0;b=i;_f(a);Jo(a);i=b;return}function jg(a){a=a|0;var b=0;b=i;_f(a);i=b;return}function kg(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=i;Sb(31280)|0;if((c[a>>2]|0)==1){do{Ob(31304,31280)|0}while((c[a>>2]|0)==1)}if((c[a>>2]|0)==0){c[a>>2]=1;Zb(31280)|0;lc[d&255](b);Sb(31280)|0;c[a>>2]=-1;Zb(31280)|0;Fb(31304)|0;i=e;return}else{Zb(31280)|0;i=e;return}}function lg(a){a=a|0;a=vb(8)|0;Tf(a,31352);c[a>>2]=31032;cc(a|0,31072,15)}function mg(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0;e=i;if((a[d]&1)==0){c[b+0>>2]=c[d+0>>2];c[b+4>>2]=c[d+4>>2];c[b+8>>2]=c[d+8>>2];i=e;return}f=c[d+8>>2]|0;g=c[d+4>>2]|0;if(g>>>0>4294967279){lg(0)}if(g>>>0<11){a[b]=g<<1;h=b+1|0}else{d=g+16&-16;j=Ho(d)|0;c[b+8>>2]=j;c[b>>2]=d|1;c[b+4>>2]=g;h=j}dp(h|0,f|0,g|0)|0;a[h+g|0]=0;i=e;return}function ng(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;if(e>>>0>4294967279){lg(0)}if(e>>>0<11){a[b]=e<<1;g=b+1|0}else{h=e+16&-16;j=Ho(h)|0;c[b+8>>2]=j;c[b>>2]=h|1;c[b+4>>2]=e;g=j}dp(g|0,d|0,e|0)|0;a[g+e|0]=0;i=f;return}function og(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;if(d>>>0>4294967279){lg(0)}if(d>>>0<11){a[b]=d<<1;g=b+1|0}else{h=d+16&-16;j=Ho(h)|0;c[b+8>>2]=j;c[b>>2]=h|1;c[b+4>>2]=d;g=j}fp(g|0,e|0,d|0)|0;a[g+d|0]=0;i=f;return}function pg(b){b=b|0;var d=0;d=i;if((a[b]&1)==0){i=d;return}Jo(c[b+8>>2]|0);i=d;return}function qg(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0;e=i;f=cp(d|0)|0;g=a[b]|0;if((g&1)==0){h=g;j=10}else{g=c[b>>2]|0;h=g&255;j=(g&-2)+ -1|0}g=(h&1)==0;if(j>>>0<f>>>0){if(g){k=(h&255)>>>1}else{k=c[b+4>>2]|0}wg(b,j,f-j|0,k,0,k,f,d);i=e;return b|0}if(g){l=b+1|0}else{l=c[b+8>>2]|0}ep(l|0,d|0,f|0)|0;a[l+f|0]=0;if((a[b]&1)==0){a[b]=f<<1;i=e;return b|0}else{c[b+4>>2]=f;i=e;return b|0}return 0}function rg(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;g=a[b]|0;h=(g&1)==0;if(h){j=(g&255)>>>1}else{j=c[b+4>>2]|0}if(j>>>0<d>>>0){sg(b,d-j|0,e)|0;i=f;return}if(h){a[b+d+1|0]=0;a[b]=d<<1;i=f;return}else{a[(c[b+8>>2]|0)+d|0]=0;c[b+4>>2]=d;i=f;return}}function sg(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;if((d|0)==0){i=f;return b|0}g=a[b]|0;if((g&1)==0){h=10;j=g}else{g=c[b>>2]|0;h=(g&-2)+ -1|0;j=g&255}if((j&1)==0){k=(j&255)>>>1}else{k=c[b+4>>2]|0}if((h-k|0)>>>0<d>>>0){xg(b,h,d-h+k|0,k,k,0,0);l=a[b]|0}else{l=j}if((l&1)==0){m=b+1|0}else{m=c[b+8>>2]|0}fp(m+k|0,e|0,d|0)|0;e=k+d|0;if((a[b]&1)==0){a[b]=e<<1}else{c[b+4>>2]=e}a[m+e|0]=0;i=f;return b|0}function tg(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;e=i;if(d>>>0>4294967279){lg(0)}f=a[b]|0;if((f&1)==0){g=10;h=f}else{f=c[b>>2]|0;g=(f&-2)+ -1|0;h=f&255}if((h&1)==0){j=(h&255)>>>1}else{j=c[b+4>>2]|0}f=j>>>0>d>>>0?j:d;if(f>>>0<11){k=10}else{k=(f+16&-16)+ -1|0}if((k|0)==(g|0)){i=e;return}do{if((k|0)!=10){f=k+1|0;if(k>>>0>g>>>0){l=Ho(f)|0}else{l=Ho(f)|0}if((h&1)==0){m=l;n=1;o=b+1|0;p=0;break}else{m=l;n=1;o=c[b+8>>2]|0;p=1;break}}else{m=b+1|0;n=0;o=c[b+8>>2]|0;p=1}}while(0);if((h&1)==0){q=(h&255)>>>1}else{q=c[b+4>>2]|0}dp(m|0,o|0,q+1|0)|0;if(p){Jo(o)}if(n){c[b>>2]=k+1|1;c[b+4>>2]=j;c[b+8>>2]=m;i=e;return}else{a[b]=j<<1;i=e;return}}function ug(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;e=i;f=a[b]|0;g=(f&1)!=0;if(g){h=(c[b>>2]&-2)+ -1|0;j=c[b+4>>2]|0}else{h=10;j=(f&255)>>>1}if((j|0)==(h|0)){xg(b,h,1,h,h,0,0);if((a[b]&1)==0){k=7}else{k=8}}else{if(g){k=8}else{k=7}}if((k|0)==7){a[b]=(j<<1)+2;l=b+1|0;m=j+1|0;n=l+j|0;a[n]=d;o=l+m|0;a[o]=0;i=e;return}else if((k|0)==8){k=c[b+8>>2]|0;g=j+1|0;c[b+4>>2]=g;l=k;m=g;n=l+j|0;a[n]=d;o=l+m|0;a[o]=0;i=e;return}}function vg(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0;f=i;g=a[b]|0;if((g&1)==0){h=10;j=g}else{g=c[b>>2]|0;h=(g&-2)+ -1|0;j=g&255}if((j&1)==0){k=(j&255)>>>1}else{k=c[b+4>>2]|0}if((h-k|0)>>>0<e>>>0){wg(b,h,e-h+k|0,k,k,0,e,d);i=f;return b|0}if((e|0)==0){i=f;return b|0}if((j&1)==0){l=b+1|0}else{l=c[b+8>>2]|0}dp(l+k|0,d|0,e|0)|0;d=k+e|0;if((a[b]&1)==0){a[b]=d<<1}else{c[b+4>>2]=d}a[l+d|0]=0;i=f;return b|0}function wg(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;l=i;if((-18-d|0)>>>0<e>>>0){lg(0)}if((a[b]&1)==0){m=b+1|0}else{m=c[b+8>>2]|0}if(d>>>0<2147483623){n=e+d|0;e=d<<1;o=n>>>0<e>>>0?e:n;if(o>>>0<11){p=11}else{p=o+16&-16}}else{p=-17}o=Ho(p)|0;if((g|0)!=0){dp(o|0,m|0,g|0)|0}if((j|0)!=0){dp(o+g|0,k|0,j|0)|0}k=f-h|0;if((k|0)!=(g|0)){dp(o+(j+g)|0,m+(h+g)|0,k-g|0)|0}if((d|0)==10){q=b+8|0;c[q>>2]=o;r=p|1;c[b>>2]=r;s=k+j|0;t=b+4|0;c[t>>2]=s;u=o+s|0;a[u]=0;i=l;return}Jo(m);q=b+8|0;c[q>>2]=o;r=p|1;c[b>>2]=r;s=k+j|0;t=b+4|0;c[t>>2]=s;u=o+s|0;a[u]=0;i=l;return}function xg(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0;k=i;if((-17-d|0)>>>0<e>>>0){lg(0)}if((a[b]&1)==0){l=b+1|0}else{l=c[b+8>>2]|0}if(d>>>0<2147483623){m=e+d|0;e=d<<1;n=m>>>0<e>>>0?e:m;if(n>>>0<11){o=11}else{o=n+16&-16}}else{o=-17}n=Ho(o)|0;if((g|0)!=0){dp(n|0,l|0,g|0)|0}m=f-h|0;if((m|0)!=(g|0)){dp(n+(j+g)|0,l+(h+g)|0,m-g|0)|0}if((d|0)==10){p=b+8|0;c[p>>2]=n;q=o|1;c[b>>2]=q;i=k;return}Jo(l);p=b+8|0;c[p>>2]=n;q=o|1;c[b>>2]=q;i=k;return}function yg(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;if(e>>>0>1073741807){lg(0)}if(e>>>0<2){a[b]=e<<1;g=b+4|0}else{h=e+4&-4;j=Ho(h<<2)|0;c[b+8>>2]=j;c[b>>2]=h|1;c[b+4>>2]=e;g=j}co(g,d,e)|0;c[g+(e<<2)>>2]=0;i=f;return}function zg(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;if(d>>>0>1073741807){lg(0)}if(d>>>0<2){a[b]=d<<1;g=b+4|0}else{h=d+4&-4;j=Ho(h<<2)|0;c[b+8>>2]=j;c[b>>2]=h|1;c[b+4>>2]=d;g=j}fo(g,e,d)|0;c[g+(d<<2)>>2]=0;i=f;return}function Ag(b){b=b|0;var d=0;d=i;if((a[b]&1)==0){i=d;return}Jo(c[b+8>>2]|0);i=d;return}function Bg(a,b){a=a|0;b=b|0;var c=0,d=0;c=i;d=Cg(a,b,bo(b)|0)|0;i=c;return d|0}function Cg(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0;f=i;g=a[b]|0;if((g&1)==0){h=1;j=g}else{g=c[b>>2]|0;h=(g&-2)+ -1|0;j=g&255}g=(j&1)==0;if(h>>>0<e>>>0){if(g){k=(j&255)>>>1}else{k=c[b+4>>2]|0}Fg(b,h,e-h|0,k,0,k,e,d);i=f;return b|0}if(g){l=b+4|0}else{l=c[b+8>>2]|0}eo(l,d,e)|0;c[l+(e<<2)>>2]=0;if((a[b]&1)==0){a[b]=e<<1;i=f;return b|0}else{c[b+4>>2]=e;i=f;return b|0}return 0}function Dg(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;e=i;if(d>>>0>1073741807){lg(0)}f=a[b]|0;if((f&1)==0){g=1;h=f}else{f=c[b>>2]|0;g=(f&-2)+ -1|0;h=f&255}if((h&1)==0){j=(h&255)>>>1}else{j=c[b+4>>2]|0}f=j>>>0>d>>>0?j:d;if(f>>>0<2){k=1}else{k=(f+4&-4)+ -1|0}if((k|0)==(g|0)){i=e;return}do{if((k|0)!=1){f=(k<<2)+4|0;if(k>>>0>g>>>0){l=Ho(f)|0}else{l=Ho(f)|0}if((h&1)==0){m=l;n=1;o=b+4|0;p=0;break}else{m=l;n=1;o=c[b+8>>2]|0;p=1;break}}else{m=b+4|0;n=0;o=c[b+8>>2]|0;p=1}}while(0);if((h&1)==0){q=(h&255)>>>1}else{q=c[b+4>>2]|0}co(m,o,q+1|0)|0;if(p){Jo(o)}if(n){c[b>>2]=k+1|1;c[b+4>>2]=j;c[b+8>>2]=m;i=e;return}else{a[b]=j<<1;i=e;return}}function Eg(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;e=i;f=a[b]|0;g=(f&1)!=0;if(g){h=(c[b>>2]&-2)+ -1|0;j=c[b+4>>2]|0}else{h=1;j=(f&255)>>>1}if((j|0)==(h|0)){Gg(b,h,1,h,h,0,0);if((a[b]&1)==0){k=7}else{k=8}}else{if(g){k=8}else{k=7}}if((k|0)==7){a[b]=(j<<1)+2;l=b+4|0;m=j+1|0;n=l+(j<<2)|0;c[n>>2]=d;o=l+(m<<2)|0;c[o>>2]=0;i=e;return}else if((k|0)==8){k=c[b+8>>2]|0;g=j+1|0;c[b+4>>2]=g;l=k;m=g;n=l+(j<<2)|0;c[n>>2]=d;o=l+(m<<2)|0;c[o>>2]=0;i=e;return}}function Fg(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;l=i;if((1073741806-d|0)>>>0<e>>>0){lg(0)}if((a[b]&1)==0){m=b+4|0}else{m=c[b+8>>2]|0}if(d>>>0<536870887){n=e+d|0;e=d<<1;o=n>>>0<e>>>0?e:n;if(o>>>0<2){p=2}else{p=o+4&-4}}else{p=1073741807}o=Ho(p<<2)|0;if((g|0)!=0){co(o,m,g)|0}if((j|0)!=0){co(o+(g<<2)|0,k,j)|0}k=f-h|0;if((k|0)!=(g|0)){co(o+(j+g<<2)|0,m+(h+g<<2)|0,k-g|0)|0}if((d|0)==1){q=b+8|0;c[q>>2]=o;r=p|1;c[b>>2]=r;s=k+j|0;t=b+4|0;c[t>>2]=s;u=o+(s<<2)|0;c[u>>2]=0;i=l;return}Jo(m);q=b+8|0;c[q>>2]=o;r=p|1;c[b>>2]=r;s=k+j|0;t=b+4|0;c[t>>2]=s;u=o+(s<<2)|0;c[u>>2]=0;i=l;return}function Gg(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0;k=i;if((1073741807-d|0)>>>0<e>>>0){lg(0)}if((a[b]&1)==0){l=b+4|0}else{l=c[b+8>>2]|0}if(d>>>0<536870887){m=e+d|0;e=d<<1;n=m>>>0<e>>>0?e:m;if(n>>>0<2){o=2}else{o=n+4&-4}}else{o=1073741807}n=Ho(o<<2)|0;if((g|0)!=0){co(n,l,g)|0}m=f-h|0;if((m|0)!=(g|0)){co(n+(j+g<<2)|0,l+(h+g<<2)|0,m-g|0)|0}if((d|0)==1){p=b+8|0;c[p>>2]=n;q=o|1;c[b>>2]=q;i=k;return}Jo(l);p=b+8|0;c[p>>2]=n;q=o|1;c[b>>2]=q;i=k;return}function Hg(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=i;i=i+16|0;f=e+8|0;g=e;h=(c[b+24>>2]|0)==0;if(h){c[b+16>>2]=d|1}else{c[b+16>>2]=d}if(((h&1|d)&c[b+20>>2]|0)==0){i=e;return}e=vb(16)|0;if((a[31720]|0)==0?(Ga(31720)|0)!=0:0){c[7928]=32416;gc(46,31712,q|0)|0;bb(31720)}b=g;c[b>>2]=1;c[b+4>>2]=31712;c[f+0>>2]=c[g+0>>2];c[f+4>>2]=c[g+4>>2];hg(e,f,31768);c[e>>2]=31736;cc(e|0,31816,42)}function Ig(a){a=a|0;var b=0,d=0,e=0,f=0,g=0;b=i;c[a>>2]=31760;d=c[a+40>>2]|0;e=a+32|0;f=a+36|0;if((d|0)!=0){g=d;do{g=g+ -1|0;qc[c[(c[e>>2]|0)+(g<<2)>>2]&3](0,a,c[(c[f>>2]|0)+(g<<2)>>2]|0)}while((g|0)!=0)}Pl(a+28|0);Do(c[e>>2]|0);Do(c[f>>2]|0);Do(c[a+48>>2]|0);Do(c[a+60>>2]|0);i=b;return}function Jg(a,b){a=a|0;b=b|0;var c=0;c=i;Ol(a,b+28|0);i=c;return}function Kg(a,b){a=a|0;b=b|0;var d=0,e=0;d=i;c[a+24>>2]=b;c[a+16>>2]=(b|0)==0;c[a+20>>2]=0;c[a+4>>2]=4098;c[a+12>>2]=0;c[a+8>>2]=6;b=a+28|0;e=a+32|0;a=e+40|0;do{c[e>>2]=0;e=e+4|0}while((e|0)<(a|0));Nl(b);i=d;return}function Lg(a){a=a|0;var b=0;b=i;c[a>>2]=31376;Pl(a+4|0);Jo(a);i=b;return}function Mg(a){a=a|0;var b=0;b=i;c[a>>2]=31376;Pl(a+4|0);i=b;return}function Ng(a,b){a=a|0;b=b|0;return}function Og(a,b,c){a=a|0;b=b|0;c=c|0;return a|0}function Pg(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;g=a;c[g>>2]=0;c[g+4>>2]=0;g=a+8|0;c[g>>2]=-1;c[g+4>>2]=-1;return}function Qg(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;e=a;c[e>>2]=0;c[e+4>>2]=0;e=a+8|0;c[e>>2]=-1;c[e+4>>2]=-1;return}function Rg(a){a=a|0;return 0}function Sg(a){a=a|0;return 0}function Tg(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;if((e|0)<=0){g=0;i=f;return g|0}h=b+12|0;j=b+16|0;k=d;d=0;while(1){l=c[h>>2]|0;if(l>>>0<(c[j>>2]|0)>>>0){c[h>>2]=l+1;m=a[l]|0}else{l=oc[c[(c[b>>2]|0)+40>>2]&63](b)|0;if((l|0)==-1){g=d;n=8;break}m=l&255}a[k]=m;l=d+1|0;if((l|0)<(e|0)){k=k+1|0;d=l}else{g=l;n=8;break}}if((n|0)==8){i=f;return g|0}return 0}function Ug(a){a=a|0;return-1}function Vg(a){a=a|0;var b=0,e=0,f=0;b=i;if((oc[c[(c[a>>2]|0)+36>>2]&63](a)|0)==-1){e=-1;i=b;return e|0}f=a+12|0;a=c[f>>2]|0;c[f>>2]=a+1;e=d[a]|0;i=b;return e|0}function Wg(a,b){a=a|0;b=b|0;return-1}function Xg(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;g=i;if((f|0)<=0){h=0;i=g;return h|0}j=b+24|0;k=b+28|0;l=e;e=0;while(1){m=c[j>>2]|0;if(!(m>>>0<(c[k>>2]|0)>>>0)){if((xc[c[(c[b>>2]|0)+52>>2]&31](b,d[l]|0)|0)==-1){h=e;n=7;break}}else{o=a[l]|0;c[j>>2]=m+1;a[m]=o}o=e+1|0;if((o|0)<(f|0)){l=l+1|0;e=o}else{h=o;n=7;break}}if((n|0)==7){i=g;return h|0}return 0}function Yg(a,b){a=a|0;b=b|0;return-1}function Zg(a){a=a|0;var b=0;b=i;c[a>>2]=31440;Pl(a+4|0);Jo(a);i=b;return}function _g(a){a=a|0;var b=0;b=i;c[a>>2]=31440;Pl(a+4|0);i=b;return}function $g(a,b){a=a|0;b=b|0;return}function ah(a,b,c){a=a|0;b=b|0;c=c|0;return a|0}function bh(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;g=a;c[g>>2]=0;c[g+4>>2]=0;g=a+8|0;c[g>>2]=-1;c[g+4>>2]=-1;return}function ch(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;e=a;c[e>>2]=0;c[e+4>>2]=0;e=a+8|0;c[e>>2]=-1;c[e+4>>2]=-1;return}function dh(a){a=a|0;return 0}function eh(a){a=a|0;return 0}function fh(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;e=i;if((d|0)<=0){f=0;i=e;return f|0}g=a+12|0;h=a+16|0;j=b;b=0;while(1){k=c[g>>2]|0;if(!(k>>>0<(c[h>>2]|0)>>>0)){l=oc[c[(c[a>>2]|0)+40>>2]&63](a)|0;if((l|0)==-1){f=b;m=8;break}else{n=l}}else{c[g>>2]=k+4;n=c[k>>2]|0}c[j>>2]=n;k=b+1|0;if((k|0)>=(d|0)){f=k;m=8;break}j=j+4|0;b=k}if((m|0)==8){i=e;return f|0}return 0}function gh(a){a=a|0;return-1}function hh(a){a=a|0;var b=0,d=0,e=0;b=i;if((oc[c[(c[a>>2]|0)+36>>2]&63](a)|0)==-1){d=-1;i=b;return d|0}e=a+12|0;a=c[e>>2]|0;c[e>>2]=a+4;d=c[a>>2]|0;i=b;return d|0}function ih(a,b){a=a|0;b=b|0;return-1}function jh(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0;e=i;if((d|0)<=0){f=0;i=e;return f|0}g=a+24|0;h=a+28|0;j=b;b=0;while(1){k=c[g>>2]|0;if(!(k>>>0<(c[h>>2]|0)>>>0)){if((xc[c[(c[a>>2]|0)+52>>2]&31](a,c[j>>2]|0)|0)==-1){f=b;l=8;break}}else{m=c[j>>2]|0;c[g>>2]=k+4;c[k>>2]=m}m=b+1|0;if((m|0)>=(d|0)){f=m;l=8;break}j=j+4|0;b=m}if((l|0)==8){i=e;return f|0}return 0}function kh(a,b){a=a|0;b=b|0;return-1}function lh(a){a=a|0;var b=0;b=i;Ig(a+8|0);Jo(a);i=b;return}function mh(a){a=a|0;var b=0;b=i;Ig(a+8|0);i=b;return}function nh(a){a=a|0;var b=0,d=0;b=i;d=c[(c[a>>2]|0)+ -12>>2]|0;Ig(a+(d+8)|0);Jo(a+d|0);i=b;return}function oh(a){a=a|0;var b=0;b=i;Ig(a+((c[(c[a>>2]|0)+ -12>>2]|0)+8)|0);i=b;return}function ph(b){b=b|0;var d=0,e=0,f=0,g=0,h=0;d=i;i=i+16|0;e=d;f=c[(c[b>>2]|0)+ -12>>2]|0;if((c[b+(f+24)>>2]|0)==0){i=d;return b|0}a[e]=0;c[e+4>>2]=b;if((c[b+(f+16)>>2]|0)==0){g=c[b+(f+72)>>2]|0;if((g|0)==0){h=f}else{ph(g)|0;h=c[(c[b>>2]|0)+ -12>>2]|0}a[e]=1;g=c[b+(h+24)>>2]|0;if((oc[c[(c[g>>2]|0)+24>>2]&63](g)|0)==-1){g=c[(c[b>>2]|0)+ -12>>2]|0;Hg(b+g|0,c[b+(g+16)>>2]|1)}}zh(e);i=d;return b|0}function qh(a){a=a|0;var b=0;b=i;Ig(a+8|0);Jo(a);i=b;return}function rh(a){a=a|0;var b=0;b=i;Ig(a+8|0);i=b;return}function sh(a){a=a|0;var b=0,d=0;b=i;d=c[(c[a>>2]|0)+ -12>>2]|0;Ig(a+(d+8)|0);Jo(a+d|0);i=b;return}function th(a){a=a|0;var b=0;b=i;Ig(a+((c[(c[a>>2]|0)+ -12>>2]|0)+8)|0);i=b;return}function uh(b){b=b|0;var d=0,e=0,f=0,g=0,h=0;d=i;i=i+16|0;e=d;f=c[(c[b>>2]|0)+ -12>>2]|0;if((c[b+(f+24)>>2]|0)==0){i=d;return b|0}a[e]=0;c[e+4>>2]=b;if((c[b+(f+16)>>2]|0)==0){g=c[b+(f+72)>>2]|0;if((g|0)==0){h=f}else{uh(g)|0;h=c[(c[b>>2]|0)+ -12>>2]|0}a[e]=1;g=c[b+(h+24)>>2]|0;if((oc[c[(c[g>>2]|0)+24>>2]&63](g)|0)==-1){g=c[(c[b>>2]|0)+ -12>>2]|0;Hg(b+g|0,c[b+(g+16)>>2]|1)}}Eh(e);i=d;return b|0}function vh(a){a=a|0;var b=0;b=i;Ig(a+4|0);Jo(a);i=b;return}function wh(a){a=a|0;var b=0;b=i;Ig(a+4|0);i=b;return}function xh(a){a=a|0;var b=0,d=0;b=i;d=c[(c[a>>2]|0)+ -12>>2]|0;Ig(a+(d+4)|0);Jo(a+d|0);i=b;return}function yh(a){a=a|0;var b=0;b=i;Ig(a+((c[(c[a>>2]|0)+ -12>>2]|0)+4)|0);i=b;return}function zh(a){a=a|0;var b=0,d=0,e=0;b=i;d=a+4|0;a=c[d>>2]|0;e=c[(c[a>>2]|0)+ -12>>2]|0;if((c[a+(e+24)>>2]|0)==0){i=b;return}if((c[a+(e+16)>>2]|0)!=0){i=b;return}if((c[a+(e+4)>>2]&8192|0)==0){i=b;return}if(Ja()|0){i=b;return}e=c[d>>2]|0;a=c[e+((c[(c[e>>2]|0)+ -12>>2]|0)+24)>>2]|0;if(!((oc[c[(c[a>>2]|0)+24>>2]&63](a)|0)==-1)){i=b;return}a=c[d>>2]|0;d=c[(c[a>>2]|0)+ -12>>2]|0;Hg(a+d|0,c[a+(d+16)>>2]|1);i=b;return}function Ah(a){a=a|0;var b=0;b=i;Ig(a+4|0);Jo(a);i=b;return}function Bh(a){a=a|0;var b=0;b=i;Ig(a+4|0);i=b;return}function Ch(a){a=a|0;var b=0,d=0;b=i;d=c[(c[a>>2]|0)+ -12>>2]|0;Ig(a+(d+4)|0);Jo(a+d|0);i=b;return}function Dh(a){a=a|0;var b=0;b=i;Ig(a+((c[(c[a>>2]|0)+ -12>>2]|0)+4)|0);i=b;return}function Eh(a){a=a|0;var b=0,d=0,e=0;b=i;d=a+4|0;a=c[d>>2]|0;e=c[(c[a>>2]|0)+ -12>>2]|0;if((c[a+(e+24)>>2]|0)==0){i=b;return}if((c[a+(e+16)>>2]|0)!=0){i=b;return}if((c[a+(e+4)>>2]&8192|0)==0){i=b;return}if(Ja()|0){i=b;return}e=c[d>>2]|0;a=c[e+((c[(c[e>>2]|0)+ -12>>2]|0)+24)>>2]|0;if(!((oc[c[(c[a>>2]|0)+24>>2]&63](a)|0)==-1)){i=b;return}a=c[d>>2]|0;d=c[(c[a>>2]|0)+ -12>>2]|0;Hg(a+d|0,c[a+(d+16)>>2]|1);i=b;return}function Fh(a){a=a|0;return 31656}function Gh(a,b,c){a=a|0;b=b|0;c=c|0;var d=0;d=i;if((c|0)==1){ng(a,31672,35);i=d;return}else{fg(a,b,c);i=d;return}}function Hh(a){a=a|0;return}function Ih(a){a=a|0;var b=0;b=i;jg(a);Jo(a);i=b;return}function Jh(a){a=a|0;var b=0;b=i;jg(a);i=b;return}function Kh(a){a=a|0;var b=0;b=i;Ig(a);Jo(a);i=b;return}function Lh(a){a=a|0;var b=0;b=i;Jo(a);i=b;return}function Mh(a){a=a|0;var b=0;b=i;Jo(a);i=b;return}function Nh(a){a=a|0;return}function Oh(a){a=a|0;return}function Ph(b,c,d,e,f){b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;b=i;a:do{if((e|0)==(f|0)){g=c;h=6}else{j=e;k=c;while(1){if((k|0)==(d|0)){l=-1;break a}m=a[k]|0;n=a[j]|0;if(m<<24>>24<n<<24>>24){l=-1;break a}if(n<<24>>24<m<<24>>24){l=1;break a}m=k+1|0;n=j+1|0;if((n|0)==(f|0)){g=m;h=6;break}else{j=n;k=m}}}}while(0);if((h|0)==6){l=(g|0)!=(d|0)|0}i=b;return l|0}function Qh(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;d=i;g=e;h=f-g|0;if(h>>>0>4294967279){lg(b)}if(h>>>0<11){a[b]=h<<1;j=b+1|0}else{k=h+16&-16;l=Ho(k)|0;c[b+8>>2]=l;c[b>>2]=k|1;c[b+4>>2]=h;j=l}if((e|0)==(f|0)){m=j;a[m]=0;i=d;return}else{n=e;o=j}while(1){a[o]=a[n]|0;n=n+1|0;if((n|0)==(f|0)){break}else{o=o+1|0}}m=j+(f+(0-g))|0;a[m]=0;i=d;return}function Rh(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,j=0;b=i;if((c|0)==(d|0)){e=0;i=b;return e|0}else{f=0;g=c}while(1){c=(a[g]|0)+(f<<4)|0;h=c&-268435456;j=(h>>>24|h)^c;c=g+1|0;if((c|0)==(d|0)){e=j;break}else{f=j;g=c}}i=b;return e|0}function Sh(a){a=a|0;var b=0;b=i;Jo(a);i=b;return}function Th(a){a=a|0;return}function Uh(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;a=i;a:do{if((e|0)==(f|0)){g=b;h=6}else{j=e;k=b;while(1){if((k|0)==(d|0)){l=-1;break a}m=c[k>>2]|0;n=c[j>>2]|0;if((m|0)<(n|0)){l=-1;break a}if((n|0)<(m|0)){l=1;break a}m=k+4|0;n=j+4|0;if((n|0)==(f|0)){g=m;h=6;break}else{j=n;k=m}}}}while(0);if((h|0)==6){l=(g|0)!=(d|0)|0}i=a;return l|0}function Vh(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;d=i;g=e;h=f-g|0;j=h>>2;if(j>>>0>1073741807){lg(b)}if(j>>>0<2){a[b]=h>>>1;k=b+4|0}else{h=j+4&-4;l=Ho(h<<2)|0;c[b+8>>2]=l;c[b>>2]=h|1;c[b+4>>2]=j;k=l}if((e|0)==(f|0)){m=k;c[m>>2]=0;i=d;return}l=f+ -4+(0-g)|0;g=e;e=k;while(1){c[e>>2]=c[g>>2];g=g+4|0;if((g|0)==(f|0)){break}else{e=e+4|0}}m=k+((l>>>2)+1<<2)|0;c[m>>2]=0;i=d;return}function Wh(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0;a=i;if((b|0)==(d|0)){e=0;i=a;return e|0}else{f=0;g=b}while(1){b=(c[g>>2]|0)+(f<<4)|0;h=b&-268435456;j=(h>>>24|h)^b;b=g+4|0;if((b|0)==(d|0)){e=j;break}else{f=j;g=b}}i=a;return e|0}function Xh(a){a=a|0;var b=0;b=i;Jo(a);i=b;return}function Yh(a){a=a|0;return}



function Uj(b,d,e,f,g,h,j,k,l){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0;l=i;i=i+176|0;m=l;n=l+164|0;o=l+160|0;p=l+156|0;q=l+152|0;r=l+148|0;s=l+144|0;t=l+140|0;u=l+136|0;v=l+132|0;w=l+128|0;x=l+124|0;y=l+120|0;z=l+116|0;A=l+112|0;B=l+108|0;C=l+104|0;D=l+100|0;E=l+96|0;F=l+92|0;G=l+88|0;H=l+84|0;I=l+80|0;J=l+76|0;K=l+72|0;L=l+68|0;M=l+64|0;N=l+60|0;O=l+56|0;P=l+52|0;Q=l+48|0;R=l+44|0;S=l+40|0;T=l+36|0;U=l+32|0;V=l+28|0;W=l+24|0;X=l+20|0;Y=l+16|0;Z=l+12|0;c[h>>2]=0;Jg(A,g);_=c[A>>2]|0;if(!((c[8524]|0)==-1)){c[m>>2]=34096;c[m+4>>2]=118;c[m+8>>2]=0;kg(34096,m,119)}$=(c[34100>>2]|0)+ -1|0;aa=c[_+8>>2]|0;if(!((c[_+12>>2]|0)-aa>>2>>>0>$>>>0)){ba=vb(4)|0;ho(ba);cc(ba|0,42064,107)}_=c[aa+($<<2)>>2]|0;if((_|0)==0){ba=vb(4)|0;ho(ba);cc(ba|0,42064,107)}Sf(c[A>>2]|0)|0;a:switch(k<<24>>24|0){case 106:{c[u>>2]=c[f>>2];c[m+0>>2]=c[u+0>>2];u=Xj(e,m,h,_,3)|0;k=c[h>>2]|0;if((k&4|0)==0&(u|0)<366){c[j+28>>2]=u;break a}else{c[h>>2]=k|4;break a}break};case 73:{k=j+8|0;c[v>>2]=c[f>>2];c[m+0>>2]=c[v+0>>2];v=Xj(e,m,h,_,2)|0;u=c[h>>2]|0;if((u&4|0)==0?(v+ -1|0)>>>0<12:0){c[k>>2]=v;break a}c[h>>2]=u|4;break};case 72:{c[w>>2]=c[f>>2];c[m+0>>2]=c[w+0>>2];w=Xj(e,m,h,_,2)|0;u=c[h>>2]|0;if((u&4|0)==0&(w|0)<24){c[j+8>>2]=w;break a}else{c[h>>2]=u|4;break a}break};case 70:{c[I>>2]=c[e>>2];c[J>>2]=c[f>>2];c[n+0>>2]=c[I+0>>2];c[m+0>>2]=c[J+0>>2];Lj(H,d,n,m,g,h,j,33224,33256|0);c[e>>2]=c[H>>2];break};case 101:case 100:{H=j+12|0;c[x>>2]=c[f>>2];c[m+0>>2]=c[x+0>>2];x=Xj(e,m,h,_,2)|0;J=c[h>>2]|0;if((J&4|0)==0?(x+ -1|0)>>>0<31:0){c[H>>2]=x;break a}c[h>>2]=J|4;break};case 116:case 110:{c[K>>2]=c[f>>2];c[m+0>>2]=c[K+0>>2];Vj(0,e,m,h,_);break};case 65:case 97:{K=c[f>>2]|0;J=d+8|0;x=oc[c[c[J>>2]>>2]&63](J)|0;c[z>>2]=K;c[m+0>>2]=c[z+0>>2];z=(xi(e,m,x,x+168|0,_,h,0)|0)-x|0;if((z|0)<168){c[j+24>>2]=((z|0)/12|0|0)%7|0}break};case 104:case 66:case 98:{z=c[f>>2]|0;x=d+8|0;K=oc[c[(c[x>>2]|0)+4>>2]&63](x)|0;c[y>>2]=z;c[m+0>>2]=c[y+0>>2];y=(xi(e,m,K,K+288|0,_,h,0)|0)-K|0;if((y|0)<288){c[j+16>>2]=((y|0)/12|0|0)%12|0}break};case 77:{c[s>>2]=c[f>>2];c[m+0>>2]=c[s+0>>2];s=Xj(e,m,h,_,2)|0;y=c[h>>2]|0;if((y&4|0)==0&(s|0)<60){c[j+4>>2]=s;break a}else{c[h>>2]=y|4;break a}break};case 68:{c[F>>2]=c[e>>2];c[G>>2]=c[f>>2];c[n+0>>2]=c[F+0>>2];c[m+0>>2]=c[G+0>>2];Lj(E,d,n,m,g,h,j,33192,33224|0);c[e>>2]=c[E>>2];break};case 114:{c[M>>2]=c[e>>2];c[N>>2]=c[f>>2];c[n+0>>2]=c[M+0>>2];c[m+0>>2]=c[N+0>>2];Lj(L,d,n,m,g,h,j,33256,33300|0);c[e>>2]=c[L>>2];break};case 82:{c[P>>2]=c[e>>2];c[Q>>2]=c[f>>2];c[n+0>>2]=c[P+0>>2];c[m+0>>2]=c[Q+0>>2];Lj(O,d,n,m,g,h,j,33304,33324|0);c[e>>2]=c[O>>2];break};case 121:{O=j+20|0;c[o>>2]=c[f>>2];c[m+0>>2]=c[o+0>>2];o=Xj(e,m,h,_,4)|0;if((c[h>>2]&4|0)==0){if((o|0)<69){ca=o+2e3|0}else{ca=(o+ -69|0)>>>0<31?o+1900|0:o}c[O>>2]=ca+ -1900}break};case 112:{ca=j+8|0;O=c[f>>2]|0;o=d+8|0;Q=oc[c[(c[o>>2]|0)+8>>2]&63](o)|0;o=a[Q]|0;if((o&1)==0){da=(o&255)>>>1}else{da=c[Q+4>>2]|0}o=a[Q+12|0]|0;if((o&1)==0){ea=(o&255)>>>1}else{ea=c[Q+16>>2]|0}if((da|0)==(0-ea|0)){c[h>>2]=c[h>>2]|4;break a}c[r>>2]=O;c[m+0>>2]=c[r+0>>2];r=xi(e,m,Q,Q+24|0,_,h,0)|0;O=r-Q|0;if((r|0)==(Q|0)?(c[ca>>2]|0)==12:0){c[ca>>2]=0;break a}if((O|0)==12?(O=c[ca>>2]|0,(O|0)<12):0){c[ca>>2]=O+12}break};case 89:{c[n>>2]=c[f>>2];c[m+0>>2]=c[n+0>>2];O=Xj(e,m,h,_,4)|0;if((c[h>>2]&4|0)==0){c[j+20>>2]=O+ -1900}break};case 37:{c[Z>>2]=c[f>>2];c[m+0>>2]=c[Z+0>>2];Wj(0,e,m,h,_);break};case 119:{c[p>>2]=c[f>>2];c[m+0>>2]=c[p+0>>2];p=Xj(e,m,h,_,1)|0;Z=c[h>>2]|0;if((Z&4|0)==0&(p|0)<7){c[j+24>>2]=p;break a}else{c[h>>2]=Z|4;break a}break};case 120:{Z=c[(c[d>>2]|0)+20>>2]|0;c[U>>2]=c[e>>2];c[V>>2]=c[f>>2];c[n+0>>2]=c[U+0>>2];c[m+0>>2]=c[V+0>>2];jc[Z&63](b,d,n,m,g,h,j);i=l;return};case 83:{c[q>>2]=c[f>>2];c[m+0>>2]=c[q+0>>2];q=Xj(e,m,h,_,2)|0;Z=c[h>>2]|0;if((Z&4|0)==0&(q|0)<61){c[j>>2]=q;break a}else{c[h>>2]=Z|4;break a}break};case 88:{Z=d+8|0;q=oc[c[(c[Z>>2]|0)+24>>2]&63](Z)|0;c[X>>2]=c[e>>2];c[Y>>2]=c[f>>2];Z=a[q]|0;if((Z&1)==0){fa=q+4|0;ga=(Z&255)>>>1;ha=q+4|0}else{Z=c[q+8>>2]|0;fa=Z;ga=c[q+4>>2]|0;ha=Z}c[n+0>>2]=c[X+0>>2];c[m+0>>2]=c[Y+0>>2];Lj(W,d,n,m,g,h,j,ha,fa+(ga<<2)|0);c[e>>2]=c[W>>2];break};case 84:{c[S>>2]=c[e>>2];c[T>>2]=c[f>>2];c[n+0>>2]=c[S+0>>2];c[m+0>>2]=c[T+0>>2];Lj(R,d,n,m,g,h,j,33328,33360|0);c[e>>2]=c[R>>2];break};case 109:{c[t>>2]=c[f>>2];c[m+0>>2]=c[t+0>>2];t=Xj(e,m,h,_,2)|0;_=c[h>>2]|0;if((_&4|0)==0&(t|0)<13){c[j+16>>2]=t+ -1;break a}else{c[h>>2]=_|4;break a}break};case 99:{_=d+8|0;t=oc[c[(c[_>>2]|0)+12>>2]&63](_)|0;c[C>>2]=c[e>>2];c[D>>2]=c[f>>2];f=a[t]|0;if((f&1)==0){ia=t+4|0;ja=(f&255)>>>1;ka=t+4|0}else{f=c[t+8>>2]|0;ia=f;ja=c[t+4>>2]|0;ka=f}c[n+0>>2]=c[C+0>>2];c[m+0>>2]=c[D+0>>2];Lj(B,d,n,m,g,h,j,ka,ia+(ja<<2)|0);c[e>>2]=c[B>>2];break};default:{c[h>>2]=c[h>>2]|4}}c[b>>2]=c[e>>2];i=l;return}function Vj(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;a=i;a:while(1){g=c[b>>2]|0;do{if((g|0)!=0){h=c[g+12>>2]|0;if((h|0)==(c[g+16>>2]|0)){j=oc[c[(c[g>>2]|0)+36>>2]&63](g)|0}else{j=c[h>>2]|0}if((j|0)==-1){c[b>>2]=0;k=1;break}else{k=(c[b>>2]|0)==0;break}}else{k=1}}while(0);g=c[d>>2]|0;do{if((g|0)!=0){h=c[g+12>>2]|0;if((h|0)==(c[g+16>>2]|0)){l=oc[c[(c[g>>2]|0)+36>>2]&63](g)|0}else{l=c[h>>2]|0}if(!((l|0)==-1)){if(k){m=g;break}else{n=g;break a}}else{c[d>>2]=0;o=15;break}}else{o=15}}while(0);if((o|0)==15){o=0;if(k){n=0;break}else{m=0}}g=c[b>>2]|0;h=c[g+12>>2]|0;if((h|0)==(c[g+16>>2]|0)){p=oc[c[(c[g>>2]|0)+36>>2]&63](g)|0}else{p=c[h>>2]|0}if(!(ic[c[(c[f>>2]|0)+12>>2]&31](f,8192,p)|0)){n=m;break}h=c[b>>2]|0;g=h+12|0;q=c[g>>2]|0;if((q|0)==(c[h+16>>2]|0)){oc[c[(c[h>>2]|0)+40>>2]&63](h)|0;continue}else{c[g>>2]=q+4;continue}}m=c[b>>2]|0;do{if((m|0)!=0){p=c[m+12>>2]|0;if((p|0)==(c[m+16>>2]|0)){r=oc[c[(c[m>>2]|0)+36>>2]&63](m)|0}else{r=c[p>>2]|0}if((r|0)==-1){c[b>>2]=0;s=1;break}else{s=(c[b>>2]|0)==0;break}}else{s=1}}while(0);do{if((n|0)!=0){b=c[n+12>>2]|0;if((b|0)==(c[n+16>>2]|0)){t=oc[c[(c[n>>2]|0)+36>>2]&63](n)|0}else{t=c[b>>2]|0}if((t|0)==-1){c[d>>2]=0;o=37;break}if(s){i=a;return}}else{o=37}}while(0);if((o|0)==37?!s:0){i=a;return}c[e>>2]=c[e>>2]|2;i=a;return}function Wj(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;a=i;g=c[b>>2]|0;do{if((g|0)!=0){h=c[g+12>>2]|0;if((h|0)==(c[g+16>>2]|0)){j=oc[c[(c[g>>2]|0)+36>>2]&63](g)|0}else{j=c[h>>2]|0}if((j|0)==-1){c[b>>2]=0;k=1;break}else{k=(c[b>>2]|0)==0;break}}else{k=1}}while(0);j=c[d>>2]|0;do{if((j|0)!=0){g=c[j+12>>2]|0;if((g|0)==(c[j+16>>2]|0)){l=oc[c[(c[j>>2]|0)+36>>2]&63](j)|0}else{l=c[g>>2]|0}if(!((l|0)==-1)){if(k){m=j;break}else{n=16;break}}else{c[d>>2]=0;n=14;break}}else{n=14}}while(0);if((n|0)==14){if(k){n=16}else{m=0}}if((n|0)==16){c[e>>2]=c[e>>2]|6;i=a;return}k=c[b>>2]|0;j=c[k+12>>2]|0;if((j|0)==(c[k+16>>2]|0)){o=oc[c[(c[k>>2]|0)+36>>2]&63](k)|0}else{o=c[j>>2]|0}if(!((ic[c[(c[f>>2]|0)+52>>2]&31](f,o,0)|0)<<24>>24==37)){c[e>>2]=c[e>>2]|4;i=a;return}o=c[b>>2]|0;f=o+12|0;j=c[f>>2]|0;if((j|0)==(c[o+16>>2]|0)){oc[c[(c[o>>2]|0)+40>>2]&63](o)|0}else{c[f>>2]=j+4}j=c[b>>2]|0;do{if((j|0)!=0){f=c[j+12>>2]|0;if((f|0)==(c[j+16>>2]|0)){p=oc[c[(c[j>>2]|0)+36>>2]&63](j)|0}else{p=c[f>>2]|0}if((p|0)==-1){c[b>>2]=0;q=1;break}else{q=(c[b>>2]|0)==0;break}}else{q=1}}while(0);do{if((m|0)!=0){b=c[m+12>>2]|0;if((b|0)==(c[m+16>>2]|0)){r=oc[c[(c[m>>2]|0)+36>>2]&63](m)|0}else{r=c[b>>2]|0}if((r|0)==-1){c[d>>2]=0;n=38;break}if(q){i=a;return}}else{n=38}}while(0);if((n|0)==38?!q:0){i=a;return}c[e>>2]=c[e>>2]|2;i=a;return}function Xj(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;g=i;h=c[a>>2]|0;do{if((h|0)!=0){j=c[h+12>>2]|0;if((j|0)==(c[h+16>>2]|0)){k=oc[c[(c[h>>2]|0)+36>>2]&63](h)|0}else{k=c[j>>2]|0}if((k|0)==-1){c[a>>2]=0;l=1;break}else{l=(c[a>>2]|0)==0;break}}else{l=1}}while(0);k=c[b>>2]|0;do{if((k|0)!=0){h=c[k+12>>2]|0;if((h|0)==(c[k+16>>2]|0)){m=oc[c[(c[k>>2]|0)+36>>2]&63](k)|0}else{m=c[h>>2]|0}if(!((m|0)==-1)){if(l){n=k;break}else{o=16;break}}else{c[b>>2]=0;o=14;break}}else{o=14}}while(0);if((o|0)==14){if(l){o=16}else{n=0}}if((o|0)==16){c[d>>2]=c[d>>2]|6;p=0;i=g;return p|0}l=c[a>>2]|0;k=c[l+12>>2]|0;if((k|0)==(c[l+16>>2]|0)){q=oc[c[(c[l>>2]|0)+36>>2]&63](l)|0}else{q=c[k>>2]|0}if(!(ic[c[(c[e>>2]|0)+12>>2]&31](e,2048,q)|0)){c[d>>2]=c[d>>2]|4;p=0;i=g;return p|0}k=(ic[c[(c[e>>2]|0)+52>>2]&31](e,q,0)|0)<<24>>24;q=c[a>>2]|0;l=q+12|0;m=c[l>>2]|0;if((m|0)==(c[q+16>>2]|0)){oc[c[(c[q>>2]|0)+40>>2]&63](q)|0;r=f;s=n;t=n;u=k}else{c[l>>2]=m+4;r=f;s=n;t=n;u=k}while(1){v=u+ -48|0;k=r+ -1|0;n=c[a>>2]|0;do{if((n|0)!=0){f=c[n+12>>2]|0;if((f|0)==(c[n+16>>2]|0)){w=oc[c[(c[n>>2]|0)+36>>2]&63](n)|0}else{w=c[f>>2]|0}if((w|0)==-1){c[a>>2]=0;x=1;break}else{x=(c[a>>2]|0)==0;break}}else{x=1}}while(0);do{if((t|0)!=0){n=c[t+12>>2]|0;if((n|0)==(c[t+16>>2]|0)){y=oc[c[(c[t>>2]|0)+36>>2]&63](t)|0}else{y=c[n>>2]|0}if((y|0)==-1){c[b>>2]=0;z=0;A=0;B=1;break}else{z=s;A=s;B=(s|0)==0;break}}else{z=s;A=0;B=1}}while(0);C=c[a>>2]|0;if(!((x^B)&(k|0)>0)){break}n=c[C+12>>2]|0;if((n|0)==(c[C+16>>2]|0)){D=oc[c[(c[C>>2]|0)+36>>2]&63](C)|0}else{D=c[n>>2]|0}if(!(ic[c[(c[e>>2]|0)+12>>2]&31](e,2048,D)|0)){p=v;o=63;break}n=((ic[c[(c[e>>2]|0)+52>>2]&31](e,D,0)|0)<<24>>24)+(v*10|0)|0;f=c[a>>2]|0;m=f+12|0;l=c[m>>2]|0;if((l|0)==(c[f+16>>2]|0)){oc[c[(c[f>>2]|0)+40>>2]&63](f)|0;r=k;s=z;t=A;u=n;continue}else{c[m>>2]=l+4;r=k;s=z;t=A;u=n;continue}}if((o|0)==63){i=g;return p|0}do{if((C|0)!=0){u=c[C+12>>2]|0;if((u|0)==(c[C+16>>2]|0)){E=oc[c[(c[C>>2]|0)+36>>2]&63](C)|0}else{E=c[u>>2]|0}if((E|0)==-1){c[a>>2]=0;F=1;break}else{F=(c[a>>2]|0)==0;break}}else{F=1}}while(0);do{if((z|0)!=0){a=c[z+12>>2]|0;if((a|0)==(c[z+16>>2]|0)){G=oc[c[(c[z>>2]|0)+36>>2]&63](z)|0}else{G=c[a>>2]|0}if((G|0)==-1){c[b>>2]=0;o=60;break}if(F){p=v;i=g;return p|0}}else{o=60}}while(0);if((o|0)==60?!F:0){p=v;i=g;return p|0}c[d>>2]=c[d>>2]|2;p=v;i=g;return p|0}function Yj(b){b=b|0;var d=0,e=0,f=0;d=i;e=b+8|0;f=c[e>>2]|0;if((a[34e3]|0)==0?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}if((f|0)==(c[8498]|0)){Jo(b);i=d;return}hb(c[e>>2]|0);Jo(b);i=d;return}function Zj(b){b=b|0;var d=0,e=0;d=i;e=b+8|0;b=c[e>>2]|0;if((a[34e3]|0)==0?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}if((b|0)==(c[8498]|0)){i=d;return}hb(c[e>>2]|0);i=d;return}function _j(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;g=i;i=i+112|0;f=g+100|0;l=g;a[f]=37;m=f+1|0;a[m]=j;n=f+2|0;a[n]=k;a[f+3|0]=0;if(!(k<<24>>24==0)){a[m]=k;a[n]=j}j=Rb(l|0,100,f|0,h|0,c[d+8>>2]|0)|0;d=l+j|0;h=c[e>>2]|0;if((j|0)==0){o=h;c[b>>2]=o;i=g;return}else{p=l;q=h;r=h}while(1){h=a[p]|0;do{if((q|0)!=0){l=q+24|0;j=c[l>>2]|0;if((j|0)==(c[q+28>>2]|0)){e=(xc[c[(c[q>>2]|0)+52>>2]&31](q,h&255)|0)==-1;s=e?0:r;t=e?0:q;break}else{c[l>>2]=j+1;a[j]=h;s=r;t=q;break}}else{s=r;t=0}}while(0);h=p+1|0;if((h|0)==(d|0)){o=s;break}else{p=h;q=t;r=s}}c[b>>2]=o;i=g;return}function $j(b){b=b|0;var d=0,e=0,f=0;d=i;e=b+8|0;f=c[e>>2]|0;if((a[34e3]|0)==0?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}if((f|0)==(c[8498]|0)){Jo(b);i=d;return}hb(c[e>>2]|0);Jo(b);i=d;return}function ak(b){b=b|0;var d=0,e=0;d=i;e=b+8|0;b=c[e>>2]|0;if((a[34e3]|0)==0?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}if((b|0)==(c[8498]|0)){i=d;return}hb(c[e>>2]|0);i=d;return}function bk(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;f=i;i=i+416|0;e=f+8|0;k=f;c[k>>2]=e+400;ck(b+8|0,e,k,g,h,j);j=c[k>>2]|0;k=c[d>>2]|0;if((e|0)==(j|0)){l=k;c[a>>2]=l;i=f;return}else{m=e;n=k;o=k}while(1){k=c[m>>2]|0;if((o|0)==0){p=n;q=0}else{e=o+24|0;d=c[e>>2]|0;if((d|0)==(c[o+28>>2]|0)){r=xc[c[(c[o>>2]|0)+52>>2]&31](o,k)|0}else{c[e>>2]=d+4;c[d>>2]=k;r=k}k=(r|0)==-1;p=k?0:n;q=k?0:o}k=m+4|0;if((k|0)==(j|0)){l=p;break}else{m=k;n=p;o=q}}c[a>>2]=l;i=f;return}function ck(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0;j=i;i=i+128|0;k=j+112|0;l=j+12|0;m=j;n=j+8|0;a[k]=37;o=k+1|0;a[o]=g;p=k+2|0;a[p]=h;a[k+3|0]=0;if(!(h<<24>>24==0)){a[o]=h;a[p]=g}Rb(l|0,100,k|0,f|0,c[b>>2]|0)|0;f=m;c[f>>2]=0;c[f+4>>2]=0;c[n>>2]=l;l=(c[e>>2]|0)-d>>2;f=zb(c[b>>2]|0)|0;b=Yn(d,n,l,m)|0;if((f|0)!=0){zb(f|0)|0}if((b|0)==-1){_k(34984)}else{c[e>>2]=d+(b<<2);i=j;return}}function dk(a){a=a|0;var b=0;b=i;Jo(a);i=b;return}function ek(a){a=a|0;return}function fk(a){a=a|0;return 127}function gk(a){a=a|0;return 127}function hk(a,b){a=a|0;b=b|0;b=i;c[a+0>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;i=b;return}function ik(a,b){a=a|0;b=b|0;b=i;c[a+0>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;i=b;return}function jk(a,b){a=a|0;b=b|0;b=i;c[a+0>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;i=b;return}function kk(a,b){a=a|0;b=b|0;b=i;og(a,1,45);i=b;return}function lk(a){a=a|0;return 0}function mk(b,c){b=b|0;c=c|0;a[b]=67109634;a[b+1|0]=262147;a[b+2|0]=1024;a[b+3|0]=4;return}function nk(b,c){b=b|0;c=c|0;a[b]=67109634;a[b+1|0]=262147;a[b+2|0]=1024;a[b+3|0]=4;return}function ok(a){a=a|0;var b=0;b=i;Jo(a);i=b;return}function pk(a){a=a|0;return}function qk(a){a=a|0;return 127}function rk(a){a=a|0;return 127}function sk(a,b){a=a|0;b=b|0;b=i;c[a+0>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;i=b;return}function tk(a,b){a=a|0;b=b|0;b=i;c[a+0>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;i=b;return}function uk(a,b){a=a|0;b=b|0;b=i;c[a+0>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;i=b;return}function vk(a,b){a=a|0;b=b|0;b=i;og(a,1,45);i=b;return}function wk(a){a=a|0;return 0}function xk(b,c){b=b|0;c=c|0;a[b]=67109634;a[b+1|0]=262147;a[b+2|0]=1024;a[b+3|0]=4;return}function yk(b,c){b=b|0;c=c|0;a[b]=67109634;a[b+1|0]=262147;a[b+2|0]=1024;a[b+3|0]=4;return}function zk(a){a=a|0;var b=0;b=i;Jo(a);i=b;return}function Ak(a){a=a|0;return}function Bk(a){a=a|0;return 2147483647}function Ck(a){a=a|0;return 2147483647}function Dk(a,b){a=a|0;b=b|0;b=i;c[a+0>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;i=b;return}function Ek(a,b){a=a|0;b=b|0;b=i;c[a+0>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;i=b;return}function Fk(a,b){a=a|0;b=b|0;b=i;c[a+0>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;i=b;return}function Gk(a,b){a=a|0;b=b|0;b=i;zg(a,1,45);i=b;return}function Hk(a){a=a|0;return 0}function Ik(b,c){b=b|0;c=c|0;a[b]=67109634;a[b+1|0]=262147;a[b+2|0]=1024;a[b+3|0]=4;return}function Jk(b,c){b=b|0;c=c|0;a[b]=67109634;a[b+1|0]=262147;a[b+2|0]=1024;a[b+3|0]=4;return}function Kk(a){a=a|0;var b=0;b=i;Jo(a);i=b;return}function Lk(a){a=a|0;return}function Mk(a){a=a|0;return 2147483647}function Nk(a){a=a|0;return 2147483647}function Ok(a,b){a=a|0;b=b|0;b=i;c[a+0>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;i=b;return}function Pk(a,b){a=a|0;b=b|0;b=i;c[a+0>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;i=b;return}function Qk(a,b){a=a|0;b=b|0;b=i;c[a+0>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;i=b;return}function Rk(a,b){a=a|0;b=b|0;b=i;zg(a,1,45);i=b;return}function Sk(a){a=a|0;return 0}function Tk(b,c){b=b|0;c=c|0;a[b]=67109634;a[b+1|0]=262147;a[b+2|0]=1024;a[b+3|0]=4;return}function Uk(b,c){b=b|0;c=c|0;a[b]=67109634;a[b+1|0]=262147;a[b+2|0]=1024;a[b+3|0]=4;return}function Vk(a){a=a|0;var b=0;b=i;Jo(a);i=b;return}function Wk(a){a=a|0;return}function Xk(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;d=i;i=i+256|0;l=d;m=d+144|0;n=d+24|0;o=d+20|0;p=d+16|0;q=d+142|0;r=d+12|0;s=d+132|0;t=d+32|0;c[n>>2]=m;u=n+4|0;c[u>>2]=120;v=m+100|0;Jg(p,h);m=c[p>>2]|0;if(!((c[8526]|0)==-1)){c[l>>2]=34104;c[l+4>>2]=118;c[l+8>>2]=0;kg(34104,l,119)}w=(c[34108>>2]|0)+ -1|0;x=c[m+8>>2]|0;if(!((c[m+12>>2]|0)-x>>2>>>0>w>>>0)){y=vb(4)|0;ho(y);cc(y|0,42064,107)}m=c[x+(w<<2)>>2]|0;if((m|0)==0){y=vb(4)|0;ho(y);cc(y|0,42064,107)}a[q]=0;c[r>>2]=c[f>>2];y=c[h+4>>2]|0;c[l+0>>2]=c[r+0>>2];if(Zk(e,l,g,p,y,j,q,m,n,o,v)|0){uc[c[(c[m>>2]|0)+32>>2]&7](m,33720,33730|0,s)|0;m=c[o>>2]|0;v=c[n>>2]|0;y=m-v|0;if((y|0)>98){g=Co(y+2|0)|0;if((g|0)==0){Oo()}else{z=g;A=g}}else{z=0;A=t}if((a[q]|0)==0){B=A}else{a[A]=45;B=A+1|0}if(v>>>0<m>>>0){m=s+10|0;A=s;q=B;g=v;while(1){v=a[g]|0;y=s;while(1){r=y+1|0;if((a[y]|0)==v<<24>>24){C=y;break}if((r|0)==(m|0)){C=m;break}else{y=r}}a[q]=a[33720+(C-A)|0]|0;y=g+1|0;v=q+1|0;if(y>>>0<(c[o>>2]|0)>>>0){q=v;g=y}else{D=v;break}}}else{D=B}a[D]=0;c[l>>2]=k;if((Ha(t|0,33736,l|0)|0)!=1){l=vb(8)|0;Yf(l,33744);cc(l|0,31112,17)}if((z|0)!=0){Do(z)}}z=c[e>>2]|0;if((z|0)!=0){if((c[z+12>>2]|0)==(c[z+16>>2]|0)?(oc[c[(c[z>>2]|0)+36>>2]&63](z)|0)==-1:0){c[e>>2]=0;E=0}else{E=z}}else{E=0}z=(E|0)==0;e=c[f>>2]|0;do{if((e|0)!=0){if((c[e+12>>2]|0)!=(c[e+16>>2]|0)){if(z){break}else{F=33;break}}if(!((oc[c[(c[e>>2]|0)+36>>2]&63](e)|0)==-1)){if(z){break}else{F=33;break}}else{c[f>>2]=0;F=31;break}}else{F=31}}while(0);if((F|0)==31?z:0){F=33}if((F|0)==33){c[j>>2]=c[j>>2]|2}c[b>>2]=E;Sf(c[p>>2]|0)|0;p=c[n>>2]|0;c[n>>2]=0;if((p|0)==0){i=d;return}lc[c[u>>2]&255](p);i=d;return}function Yk(a){a=a|0;return}function Zk(e,f,g,h,j,k,l,m,n,o,p){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;var q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0,Ja=0,Ka=0,La=0,Ma=0,Na=0,Oa=0,Pa=0,Qa=0,Ra=0,Sa=0,Ta=0,Ua=0,Va=0,Wa=0,Xa=0,Ya=0,Za=0,_a=0,$a=0,ab=0,bb=0,cb=0,db=0,eb=0,fb=0,gb=0,hb=0,ib=0,jb=0,kb=0,lb=0,mb=0,nb=0,ob=0,pb=0,qb=0,rb=0,sb=0,tb=0,ub=0,vb=0,wb=0,xb=0,yb=0,zb=0,Ab=0,Bb=0,Cb=0,Db=0,Eb=0,Fb=0,Gb=0,Hb=0,Ib=0,Jb=0,Kb=0,Lb=0,Mb=0,Nb=0,Ob=0,Pb=0,Qb=0,Rb=0,Sb=0,Tb=0,Ub=0,Vb=0,Wb=0,Xb=0,Yb=0,Zb=0,_b=0,$b=0,ac=0,bc=0,cc=0,dc=0,ec=0,fc=0,gc=0,hc=0,ic=0,jc=0,kc=0;q=i;i=i+480|0;r=q+72|0;s=q+68|0;t=q+473|0;u=q+472|0;v=q+56|0;w=q+44|0;x=q+32|0;y=q+20|0;z=q+8|0;A=q+4|0;B=q;c[s>>2]=0;c[v+0>>2]=0;c[v+4>>2]=0;c[v+8>>2]=0;c[w+0>>2]=0;c[w+4>>2]=0;c[w+8>>2]=0;c[x+0>>2]=0;c[x+4>>2]=0;c[x+8>>2]=0;c[y+0>>2]=0;c[y+4>>2]=0;c[y+8>>2]=0;c[z+0>>2]=0;c[z+4>>2]=0;c[z+8>>2]=0;bl(g,h,s,t,u,v,w,x,y,A);c[o>>2]=c[n>>2];h=m+8|0;m=y+1|0;g=y+4|0;C=y+8|0;D=x+1|0;E=x+4|0;F=x+8|0;G=(j&512|0)!=0;j=w+1|0;H=w+8|0;I=w+4|0;J=z+1|0;K=z+8|0;L=z+4|0;M=s+3|0;N=n+4|0;O=v+4|0;P=r+400|0;Q=r;R=r;r=p;p=0;S=0;T=120;a:while(1){U=c[e>>2]|0;do{if((U|0)!=0){if((c[U+12>>2]|0)==(c[U+16>>2]|0)){if((oc[c[(c[U>>2]|0)+36>>2]&63](U)|0)==-1){c[e>>2]=0;V=0;break}else{V=c[e>>2]|0;break}}else{V=U}}else{V=0}}while(0);U=(V|0)==0;W=c[f>>2]|0;do{if((W|0)!=0){if((c[W+12>>2]|0)!=(c[W+16>>2]|0)){if(U){X=W;break}else{Y=R;Z=Q;_=S;$=T;aa=269;break a}}if(!((oc[c[(c[W>>2]|0)+36>>2]&63](W)|0)==-1)){if(U){X=W;break}else{Y=R;Z=Q;_=S;$=T;aa=269;break a}}else{c[f>>2]=0;aa=12;break}}else{aa=12}}while(0);if((aa|0)==12){aa=0;if(U){Y=R;Z=Q;_=S;$=T;aa=269;break}else{X=0}}b:do{switch(a[s+p|0]|0){case 0:{aa=26;break};case 3:{W=a[x]|0;ba=(W&1)==0;if(ba){ca=(W&255)>>>1}else{ca=c[E>>2]|0}da=a[y]|0;ea=(da&1)==0;if(ea){fa=(da&255)>>>1}else{fa=c[g>>2]|0}if((ca|0)==(0-fa|0)){ga=r;ha=R;ia=Q;ja=P;ka=S;la=T}else{if(ba){ma=(W&255)>>>1}else{ma=c[E>>2]|0}if((ma|0)!=0){if(ea){na=(da&255)>>>1}else{na=c[g>>2]|0}if((na|0)!=0){ea=c[e>>2]|0;oa=c[ea+12>>2]|0;pa=c[ea+16>>2]|0;if((oa|0)==(pa|0)){qa=oc[c[(c[ea>>2]|0)+36>>2]&63](ea)|0;ra=c[e>>2]|0;sa=qa;ta=a[x]|0;ua=ra;va=c[ra+12>>2]|0;wa=c[ra+16>>2]|0}else{sa=d[oa]|0;ta=W;ua=ea;va=oa;wa=pa}pa=ua+12|0;oa=(va|0)==(wa|0);if((sa&255)<<24>>24==(a[(ta&1)==0?D:c[F>>2]|0]|0)){if(oa){oc[c[(c[ua>>2]|0)+40>>2]&63](ua)|0}else{c[pa>>2]=va+1}pa=a[x]|0;if((pa&1)==0){xa=(pa&255)>>>1}else{xa=c[E>>2]|0}ga=r;ha=R;ia=Q;ja=P;ka=xa>>>0>1?x:S;la=T;break b}if(oa){ya=oc[c[(c[ua>>2]|0)+36>>2]&63](ua)|0}else{ya=d[va]|0}if(!((ya&255)<<24>>24==(a[(a[y]&1)==0?m:c[C>>2]|0]|0))){aa=112;break a}oa=c[e>>2]|0;pa=oa+12|0;ea=c[pa>>2]|0;if((ea|0)==(c[oa+16>>2]|0)){oc[c[(c[oa>>2]|0)+40>>2]&63](oa)|0}else{c[pa>>2]=ea+1}a[l]=1;ea=a[y]|0;if((ea&1)==0){za=(ea&255)>>>1}else{za=c[g>>2]|0}ga=r;ha=R;ia=Q;ja=P;ka=za>>>0>1?y:S;la=T;break b}}if(ba){Aa=(W&255)>>>1}else{Aa=c[E>>2]|0}ba=c[e>>2]|0;ea=c[ba+12>>2]|0;pa=(ea|0)==(c[ba+16>>2]|0);if((Aa|0)==0){if(pa){oa=oc[c[(c[ba>>2]|0)+36>>2]&63](ba)|0;Ba=oa;Ca=a[y]|0}else{Ba=d[ea]|0;Ca=da}if(!((Ba&255)<<24>>24==(a[(Ca&1)==0?m:c[C>>2]|0]|0))){ga=r;ha=R;ia=Q;ja=P;ka=S;la=T;break b}da=c[e>>2]|0;oa=da+12|0;ra=c[oa>>2]|0;if((ra|0)==(c[da+16>>2]|0)){oc[c[(c[da>>2]|0)+40>>2]&63](da)|0}else{c[oa>>2]=ra+1}a[l]=1;ra=a[y]|0;if((ra&1)==0){Da=(ra&255)>>>1}else{Da=c[g>>2]|0}ga=r;ha=R;ia=Q;ja=P;ka=Da>>>0>1?y:S;la=T;break b}if(pa){pa=oc[c[(c[ba>>2]|0)+36>>2]&63](ba)|0;Ea=pa;Fa=a[x]|0}else{Ea=d[ea]|0;Fa=W}if(!((Ea&255)<<24>>24==(a[(Fa&1)==0?D:c[F>>2]|0]|0))){a[l]=1;ga=r;ha=R;ia=Q;ja=P;ka=S;la=T;break b}W=c[e>>2]|0;ea=W+12|0;pa=c[ea>>2]|0;if((pa|0)==(c[W+16>>2]|0)){oc[c[(c[W>>2]|0)+40>>2]&63](W)|0}else{c[ea>>2]=pa+1}pa=a[x]|0;if((pa&1)==0){Ga=(pa&255)>>>1}else{Ga=c[E>>2]|0}ga=r;ha=R;ia=Q;ja=P;ka=Ga>>>0>1?x:S;la=T}break};case 1:{if((p|0)==3){Y=R;Z=Q;_=S;$=T;aa=269;break a}pa=c[e>>2]|0;ea=c[pa+12>>2]|0;if((ea|0)==(c[pa+16>>2]|0)){Ha=oc[c[(c[pa>>2]|0)+36>>2]&63](pa)|0}else{Ha=d[ea]|0}if(!((Ha&255)<<24>>24>-1)){aa=25;break a}if((b[(c[h>>2]|0)+(Ha<<24>>24<<1)>>1]&8192)==0){aa=25;break a}ea=c[e>>2]|0;pa=ea+12|0;W=c[pa>>2]|0;if((W|0)==(c[ea+16>>2]|0)){Ia=oc[c[(c[ea>>2]|0)+40>>2]&63](ea)|0}else{c[pa>>2]=W+1;Ia=d[W]|0}ug(z,Ia&255);aa=26;break};case 2:{if(!((S|0)!=0|p>>>0<2)){if((p|0)==2){Ja=(a[M]|0)!=0}else{Ja=0}if(!(G|Ja)){ga=r;ha=R;ia=Q;ja=P;ka=0;la=T;break b}}W=a[w]|0;pa=(W&1)==0;ea=pa?j:c[H>>2]|0;c:do{if((p|0)!=0?(d[s+(p+ -1)|0]|0)<2:0){ba=ea+(pa?(W&255)>>>1:c[I>>2]|0)|0;ra=ea;while(1){if((ra|0)==(ba|0)){Ka=ba;break}oa=a[ra]|0;if(!(oa<<24>>24>-1)){Ka=ra;break}if((b[(c[h>>2]|0)+(oa<<24>>24<<1)>>1]&8192)==0){Ka=ra;break}else{ra=ra+1|0}}ra=Ka-ea|0;ba=a[z]|0;oa=(ba&1)==0;if(oa){La=(ba&255)>>>1}else{La=c[L>>2]|0}if(!(ra>>>0>La>>>0)){if(oa){oa=(ba&255)>>>1;Ma=J;Na=oa;Oa=z+(oa-ra)+1|0}else{oa=c[K>>2]|0;ba=c[L>>2]|0;Ma=oa;Na=ba;Oa=oa+(ba-ra)|0}ra=Ma+Na|0;if((Oa|0)==(ra|0)){Pa=X;Qa=W;Ra=Ka;Sa=X}else{ba=Oa;oa=ea;while(1){if((a[ba]|0)!=(a[oa]|0)){Pa=X;Qa=W;Ra=ea;Sa=X;break c}da=ba+1|0;if((da|0)==(ra|0)){Pa=X;Qa=W;Ra=Ka;Sa=X;break}else{ba=da;oa=oa+1|0}}}}else{Pa=X;Qa=W;Ra=ea;Sa=X}}else{Pa=X;Qa=W;Ra=ea;Sa=X}}while(0);d:while(1){if((Qa&1)==0){Ta=j;Ua=(Qa&255)>>>1}else{Ta=c[H>>2]|0;Ua=c[I>>2]|0}if((Ra|0)==(Ta+Ua|0)){break}ea=c[e>>2]|0;do{if((ea|0)!=0){if((c[ea+12>>2]|0)==(c[ea+16>>2]|0)){if((oc[c[(c[ea>>2]|0)+36>>2]&63](ea)|0)==-1){c[e>>2]=0;Va=0;break}else{Va=c[e>>2]|0;break}}else{Va=ea}}else{Va=0}}while(0);ea=(Va|0)==0;do{if((Sa|0)!=0){if((c[Sa+12>>2]|0)!=(c[Sa+16>>2]|0)){if(ea){Wa=Pa;Xa=Sa;break}else{break d}}if(!((oc[c[(c[Sa>>2]|0)+36>>2]&63](Sa)|0)==-1)){if(ea^(Pa|0)==0){Wa=Pa;Xa=Pa;break}else{break d}}else{c[f>>2]=0;Ya=0;aa=147;break}}else{Ya=Pa;aa=147}}while(0);if((aa|0)==147){aa=0;if(ea){break}else{Wa=Ya;Xa=0}}W=c[e>>2]|0;pa=c[W+12>>2]|0;if((pa|0)==(c[W+16>>2]|0)){Za=oc[c[(c[W>>2]|0)+36>>2]&63](W)|0}else{Za=d[pa]|0}if(!((Za&255)<<24>>24==(a[Ra]|0))){break}pa=c[e>>2]|0;W=pa+12|0;oa=c[W>>2]|0;if((oa|0)==(c[pa+16>>2]|0)){oc[c[(c[pa>>2]|0)+40>>2]&63](pa)|0}else{c[W>>2]=oa+1}Pa=Wa;Qa=a[w]|0;Ra=Ra+1|0;Sa=Xa}if(G){oa=a[w]|0;if((oa&1)==0){_a=j;$a=(oa&255)>>>1}else{_a=c[H>>2]|0;$a=c[I>>2]|0}if((Ra|0)!=(_a+$a|0)){aa=162;break a}else{ga=r;ha=R;ia=Q;ja=P;ka=S;la=T}}else{ga=r;ha=R;ia=Q;ja=P;ka=S;la=T}break};case 4:{oa=r;W=Q;pa=P;ba=R;ra=0;da=T;e:while(1){qa=c[e>>2]|0;do{if((qa|0)!=0){if((c[qa+12>>2]|0)==(c[qa+16>>2]|0)){if((oc[c[(c[qa>>2]|0)+36>>2]&63](qa)|0)==-1){c[e>>2]=0;ab=0;break}else{ab=c[e>>2]|0;break}}else{ab=qa}}else{ab=0}}while(0);qa=(ab|0)==0;ea=c[f>>2]|0;do{if((ea|0)!=0){if((c[ea+12>>2]|0)!=(c[ea+16>>2]|0)){if(qa){break}else{break e}}if(!((oc[c[(c[ea>>2]|0)+36>>2]&63](ea)|0)==-1)){if(qa){break}else{break e}}else{c[f>>2]=0;aa=173;break}}else{aa=173}}while(0);if((aa|0)==173?(aa=0,qa):0){break}ea=c[e>>2]|0;bb=c[ea+12>>2]|0;if((bb|0)==(c[ea+16>>2]|0)){cb=oc[c[(c[ea>>2]|0)+36>>2]&63](ea)|0}else{cb=d[bb]|0}bb=cb&255;if(bb<<24>>24>-1?!((b[(c[h>>2]|0)+(cb<<24>>24<<1)>>1]&2048)==0):0){ea=c[o>>2]|0;if((ea|0)==(oa|0)){db=(c[N>>2]|0)!=120;eb=c[n>>2]|0;fb=oa-eb|0;gb=fb>>>0<2147483647?fb<<1:-1;hb=Eo(db?eb:0,gb)|0;if((hb|0)==0){aa=182;break a}if(!db){db=c[n>>2]|0;c[n>>2]=hb;if((db|0)==0){ib=hb}else{lc[c[N>>2]&255](db);ib=c[n>>2]|0}}else{c[n>>2]=hb;ib=hb}c[N>>2]=121;hb=ib+fb|0;c[o>>2]=hb;jb=hb;kb=(c[n>>2]|0)+gb|0}else{jb=ea;kb=oa}c[o>>2]=jb+1;a[jb]=bb;lb=kb;mb=ba;nb=W;ob=pa;pb=ra+1|0;qb=da}else{ea=a[v]|0;if((ea&1)==0){rb=(ea&255)>>>1}else{rb=c[O>>2]|0}if((rb|0)==0|(ra|0)==0){break}if(!(bb<<24>>24==(a[u]|0))){break}if((W|0)==(pa|0)){bb=W-ba|0;ea=bb>>>0<2147483647?bb<<1:-1;if((da|0)==120){sb=0}else{sb=ba}gb=Eo(sb,ea)|0;if((gb|0)==0){aa=198;break a}tb=gb+(bb>>2<<2)|0;ub=gb;vb=gb+(ea>>>2<<2)|0;wb=121}else{tb=W;ub=ba;vb=pa;wb=da}c[tb>>2]=ra;lb=oa;mb=ub;nb=tb+4|0;ob=vb;pb=0;qb=wb}ea=c[e>>2]|0;gb=ea+12|0;bb=c[gb>>2]|0;if((bb|0)==(c[ea+16>>2]|0)){oc[c[(c[ea>>2]|0)+40>>2]&63](ea)|0;oa=lb;W=nb;pa=ob;ba=mb;ra=pb;da=qb;continue}else{c[gb>>2]=bb+1;oa=lb;W=nb;pa=ob;ba=mb;ra=pb;da=qb;continue}}if((ba|0)==(W|0)|(ra|0)==0){xb=ba;yb=W;zb=pa;Ab=da}else{if((W|0)==(pa|0)){bb=W-ba|0;gb=bb>>>0<2147483647?bb<<1:-1;if((da|0)==120){Bb=0}else{Bb=ba}ea=Eo(Bb,gb)|0;if((ea|0)==0){aa=209;break a}Cb=ea+(bb>>2<<2)|0;Db=ea;Eb=ea+(gb>>>2<<2)|0;Fb=121}else{Cb=W;Db=ba;Eb=pa;Fb=da}c[Cb>>2]=ra;xb=Db;yb=Cb+4|0;zb=Eb;Ab=Fb}gb=c[A>>2]|0;if((gb|0)>0){ea=c[e>>2]|0;do{if((ea|0)!=0){if((c[ea+12>>2]|0)==(c[ea+16>>2]|0)){if((oc[c[(c[ea>>2]|0)+36>>2]&63](ea)|0)==-1){c[e>>2]=0;Gb=0;break}else{Gb=c[e>>2]|0;break}}else{Gb=ea}}else{Gb=0}}while(0);ea=(Gb|0)==0;ra=c[f>>2]|0;do{if((ra|0)!=0){if((c[ra+12>>2]|0)!=(c[ra+16>>2]|0)){if(ea){Hb=ra;break}else{aa=229;break a}}if(!((oc[c[(c[ra>>2]|0)+36>>2]&63](ra)|0)==-1)){if(ea){Hb=ra;break}else{aa=229;break a}}else{c[f>>2]=0;aa=223;break}}else{aa=223}}while(0);if((aa|0)==223){aa=0;if(ea){aa=229;break a}else{Hb=0}}ra=c[e>>2]|0;da=c[ra+12>>2]|0;if((da|0)==(c[ra+16>>2]|0)){Ib=oc[c[(c[ra>>2]|0)+36>>2]&63](ra)|0}else{Ib=d[da]|0}if(!((Ib&255)<<24>>24==(a[t]|0))){aa=229;break a}da=c[e>>2]|0;ra=da+12|0;pa=c[ra>>2]|0;if((pa|0)==(c[da+16>>2]|0)){oc[c[(c[da>>2]|0)+40>>2]&63](da)|0;Jb=Hb;Kb=Hb;Lb=oa;Mb=gb}else{c[ra>>2]=pa+1;Jb=Hb;Kb=Hb;Lb=oa;Mb=gb}while(1){pa=c[e>>2]|0;do{if((pa|0)!=0){if((c[pa+12>>2]|0)==(c[pa+16>>2]|0)){if((oc[c[(c[pa>>2]|0)+36>>2]&63](pa)|0)==-1){c[e>>2]=0;Nb=0;break}else{Nb=c[e>>2]|0;break}}else{Nb=pa}}else{Nb=0}}while(0);pa=(Nb|0)==0;do{if((Kb|0)!=0){if((c[Kb+12>>2]|0)!=(c[Kb+16>>2]|0)){if(pa){Ob=Jb;Pb=Kb;break}else{aa=250;break a}}if(!((oc[c[(c[Kb>>2]|0)+36>>2]&63](Kb)|0)==-1)){if(pa^(Jb|0)==0){Ob=Jb;Pb=Jb;break}else{aa=250;break a}}else{c[f>>2]=0;Qb=0;aa=243;break}}else{Qb=Jb;aa=243}}while(0);if((aa|0)==243){aa=0;if(pa){aa=250;break a}else{Ob=Qb;Pb=0}}qa=c[e>>2]|0;ra=c[qa+12>>2]|0;if((ra|0)==(c[qa+16>>2]|0)){Rb=oc[c[(c[qa>>2]|0)+36>>2]&63](qa)|0}else{Rb=d[ra]|0}if(!((Rb&255)<<24>>24>-1)){aa=250;break a}if((b[(c[h>>2]|0)+(Rb<<24>>24<<1)>>1]&2048)==0){aa=250;break a}ra=c[o>>2]|0;if((ra|0)==(Lb|0)){qa=(c[N>>2]|0)!=120;da=c[n>>2]|0;ba=Lb-da|0;W=ba>>>0<2147483647?ba<<1:-1;bb=Eo(qa?da:0,W)|0;if((bb|0)==0){aa=253;break a}if(!qa){qa=c[n>>2]|0;c[n>>2]=bb;if((qa|0)==0){Sb=bb}else{lc[c[N>>2]&255](qa);Sb=c[n>>2]|0}}else{c[n>>2]=bb;Sb=bb}c[N>>2]=121;bb=Sb+ba|0;c[o>>2]=bb;Tb=bb;Ub=(c[n>>2]|0)+W|0}else{Tb=ra;Ub=Lb}ra=c[e>>2]|0;W=c[ra+12>>2]|0;if((W|0)==(c[ra+16>>2]|0)){bb=oc[c[(c[ra>>2]|0)+36>>2]&63](ra)|0;Vb=bb;Wb=c[o>>2]|0}else{Vb=d[W]|0;Wb=Tb}c[o>>2]=Wb+1;a[Wb]=Vb;W=Mb+ -1|0;c[A>>2]=W;bb=c[e>>2]|0;ra=bb+12|0;ba=c[ra>>2]|0;if((ba|0)==(c[bb+16>>2]|0)){oc[c[(c[bb>>2]|0)+40>>2]&63](bb)|0}else{c[ra>>2]=ba+1}if((W|0)>0){Jb=Ob;Kb=Pb;Lb=Ub;Mb=W}else{Xb=Ub;break}}}else{Xb=oa}if((c[o>>2]|0)==(c[n>>2]|0)){aa=267;break a}else{ga=Xb;ha=xb;ia=yb;ja=zb;ka=S;la=Ab}break};default:{ga=r;ha=R;ia=Q;ja=P;ka=S;la=T}}}while(0);f:do{if((aa|0)==26){aa=0;if((p|0)==3){Y=R;Z=Q;_=S;$=T;aa=269;break a}else{Yb=X;Zb=X}while(1){U=c[e>>2]|0;do{if((U|0)!=0){if((c[U+12>>2]|0)==(c[U+16>>2]|0)){if((oc[c[(c[U>>2]|0)+36>>2]&63](U)|0)==-1){c[e>>2]=0;_b=0;break}else{_b=c[e>>2]|0;break}}else{_b=U}}else{_b=0}}while(0);U=(_b|0)==0;do{if((Zb|0)!=0){if((c[Zb+12>>2]|0)!=(c[Zb+16>>2]|0)){if(U){$b=Yb;ac=Zb;break}else{ga=r;ha=R;ia=Q;ja=P;ka=S;la=T;break f}}if(!((oc[c[(c[Zb>>2]|0)+36>>2]&63](Zb)|0)==-1)){if(U^(Yb|0)==0){$b=Yb;ac=Yb;break}else{ga=r;ha=R;ia=Q;ja=P;ka=S;la=T;break f}}else{c[f>>2]=0;bc=0;aa=37;break}}else{bc=Yb;aa=37}}while(0);if((aa|0)==37){aa=0;if(U){ga=r;ha=R;ia=Q;ja=P;ka=S;la=T;break f}else{$b=bc;ac=0}}pa=c[e>>2]|0;gb=c[pa+12>>2]|0;if((gb|0)==(c[pa+16>>2]|0)){cc=oc[c[(c[pa>>2]|0)+36>>2]&63](pa)|0}else{cc=d[gb]|0}if(!((cc&255)<<24>>24>-1)){ga=r;ha=R;ia=Q;ja=P;ka=S;la=T;break f}if((b[(c[h>>2]|0)+(cc<<24>>24<<1)>>1]&8192)==0){ga=r;ha=R;ia=Q;ja=P;ka=S;la=T;break f}gb=c[e>>2]|0;pa=gb+12|0;ea=c[pa>>2]|0;if((ea|0)==(c[gb+16>>2]|0)){dc=oc[c[(c[gb>>2]|0)+40>>2]&63](gb)|0}else{c[pa>>2]=ea+1;dc=d[ea]|0}ug(z,dc&255);Yb=$b;Zb=ac}}}while(0);oa=p+1|0;if(oa>>>0<4){P=ja;Q=ia;R=ha;r=ga;p=oa;S=ka;T=la}else{Y=ha;Z=ia;_=ka;$=la;aa=269;break}}g:switch(aa|0){case 25:{c[k>>2]=c[k>>2]|4;ec=0;fc=R;gc=T;break};case 112:{c[k>>2]=c[k>>2]|4;ec=0;fc=R;gc=T;break};case 162:{c[k>>2]=c[k>>2]|4;ec=0;fc=R;gc=T;break};case 182:{Oo();break};case 198:{Oo();break};case 209:{Oo();break};case 229:{c[k>>2]=c[k>>2]|4;ec=0;fc=xb;gc=Ab;break};case 250:{c[k>>2]=c[k>>2]|4;ec=0;fc=xb;gc=Ab;break};case 253:{Oo();break};case 267:{c[k>>2]=c[k>>2]|4;ec=0;fc=xb;gc=Ab;break};case 269:{h:do{if((_|0)!=0){Ab=_+1|0;xb=_+8|0;T=_+4|0;R=1;i:while(1){la=a[_]|0;if((la&1)==0){hc=(la&255)>>>1}else{hc=c[T>>2]|0}if(!(R>>>0<hc>>>0)){break h}la=c[e>>2]|0;do{if((la|0)!=0){if((c[la+12>>2]|0)==(c[la+16>>2]|0)){if((oc[c[(c[la>>2]|0)+36>>2]&63](la)|0)==-1){c[e>>2]=0;ic=0;break}else{ic=c[e>>2]|0;break}}else{ic=la}}else{ic=0}}while(0);la=(ic|0)==0;ka=c[f>>2]|0;do{if((ka|0)!=0){if((c[ka+12>>2]|0)!=(c[ka+16>>2]|0)){if(la){break}else{break i}}if(!((oc[c[(c[ka>>2]|0)+36>>2]&63](ka)|0)==-1)){if(la){break}else{break i}}else{c[f>>2]=0;aa=285;break}}else{aa=285}}while(0);if((aa|0)==285?(aa=0,la):0){break}ka=c[e>>2]|0;ia=c[ka+12>>2]|0;if((ia|0)==(c[ka+16>>2]|0)){jc=oc[c[(c[ka>>2]|0)+36>>2]&63](ka)|0}else{jc=d[ia]|0}if((a[_]&1)==0){kc=Ab}else{kc=c[xb>>2]|0}if(!((jc&255)<<24>>24==(a[kc+R|0]|0))){break}ia=R+1|0;ka=c[e>>2]|0;ha=ka+12|0;S=c[ha>>2]|0;if((S|0)==(c[ka+16>>2]|0)){oc[c[(c[ka>>2]|0)+40>>2]&63](ka)|0;R=ia;continue}else{c[ha>>2]=S+1;R=ia;continue}}c[k>>2]=c[k>>2]|4;ec=0;fc=Y;gc=$;break g}}while(0);if((Y|0)!=(Z|0)){c[B>>2]=0;cl(v,Y,Z,B);if((c[B>>2]|0)==0){ec=1;fc=Y;gc=$}else{c[k>>2]=c[k>>2]|4;ec=0;fc=Y;gc=$}}else{ec=1;fc=Z;gc=$}break}}pg(z);pg(y);pg(x);pg(w);pg(v);if((fc|0)==0){i=q;return ec|0}lc[gc&255](fc);i=q;return ec|0}function _k(a){a=a|0;var b=0;b=vb(8)|0;Yf(b,a);cc(b|0,31112,17)}function $k(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;d=i;i=i+144|0;l=d;m=d+36|0;n=d+24|0;o=d+20|0;p=d+16|0;q=d+32|0;r=d+12|0;c[n>>2]=m;s=n+4|0;c[s>>2]=120;t=m+100|0;Jg(p,h);m=c[p>>2]|0;if(!((c[8526]|0)==-1)){c[l>>2]=34104;c[l+4>>2]=118;c[l+8>>2]=0;kg(34104,l,119)}u=(c[34108>>2]|0)+ -1|0;v=c[m+8>>2]|0;if(!((c[m+12>>2]|0)-v>>2>>>0>u>>>0)){w=vb(4)|0;ho(w);cc(w|0,42064,107)}m=c[v+(u<<2)>>2]|0;if((m|0)==0){w=vb(4)|0;ho(w);cc(w|0,42064,107)}a[q]=0;w=c[f>>2]|0;c[r>>2]=w;u=c[h+4>>2]|0;c[l+0>>2]=c[r+0>>2];if(Zk(e,l,g,p,u,j,q,m,n,o,t)|0){if((a[k]&1)==0){a[k+1|0]=0;a[k]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}if((a[q]|0)!=0){ug(k,xc[c[(c[m>>2]|0)+28>>2]&31](m,45)|0)}q=xc[c[(c[m>>2]|0)+28>>2]&31](m,48)|0;m=c[n>>2]|0;t=c[o>>2]|0;o=t+ -1|0;a:do{if(m>>>0<o>>>0){u=m;while(1){g=u+1|0;if(!((a[u]|0)==q<<24>>24)){x=u;break a}if(g>>>0<o>>>0){u=g}else{x=g;break}}}else{x=m}}while(0);al(k,x,t)|0}t=c[e>>2]|0;if((t|0)!=0){if((c[t+12>>2]|0)==(c[t+16>>2]|0)?(oc[c[(c[t>>2]|0)+36>>2]&63](t)|0)==-1:0){c[e>>2]=0;y=0}else{y=t}}else{y=0}t=(y|0)==0;do{if((w|0)!=0){if((c[w+12>>2]|0)!=(c[w+16>>2]|0)){if(t){break}else{z=27;break}}if(!((oc[c[(c[w>>2]|0)+36>>2]&63](w)|0)==-1)){if(t^(w|0)==0){break}else{z=27;break}}else{c[f>>2]=0;z=25;break}}else{z=25}}while(0);if((z|0)==25?t:0){z=27}if((z|0)==27){c[j>>2]=c[j>>2]|2}c[b>>2]=y;Sf(c[p>>2]|0)|0;p=c[n>>2]|0;c[n>>2]=0;if((p|0)==0){i=d;return}lc[c[s>>2]&255](p);i=d;return}function al(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;g=d;h=a[b]|0;if((h&1)==0){j=(h&255)>>>1;k=10;l=h}else{h=c[b>>2]|0;j=c[b+4>>2]|0;k=(h&-2)+ -1|0;l=h&255}h=e-g|0;if((e|0)==(d|0)){i=f;return b|0}if((k-j|0)>>>0<h>>>0){xg(b,k,j+h-k|0,j,j,0,0);m=a[b]|0}else{m=l}if((m&1)==0){n=b+1|0}else{n=c[b+8>>2]|0}m=e+(j-g)|0;g=d;d=n+j|0;while(1){a[d]=a[g]|0;g=g+1|0;if((g|0)==(e|0)){break}else{d=d+1|0}}a[n+m|0]=0;m=j+h|0;if((a[b]&1)==0){a[b]=m<<1;i=f;return b|0}else{c[b+4>>2]=m;i=f;return b|0}return 0}function bl(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;n=i;i=i+128|0;o=n;p=n+112|0;q=n+100|0;r=n+88|0;s=n+76|0;t=n+64|0;u=n+60|0;v=n+48|0;w=n+36|0;x=n+24|0;y=n+12|0;if(b){b=c[d>>2]|0;if(!((c[8386]|0)==-1)){c[o>>2]=33544;c[o+4>>2]=118;c[o+8>>2]=0;kg(33544,o,119)}z=(c[33548>>2]|0)+ -1|0;A=c[b+8>>2]|0;if(!((c[b+12>>2]|0)-A>>2>>>0>z>>>0)){B=vb(4)|0;ho(B);cc(B|0,42064,107)}b=c[A+(z<<2)>>2]|0;if((b|0)==0){B=vb(4)|0;ho(B);cc(B|0,42064,107)}mc[c[(c[b>>2]|0)+44>>2]&63](p,b);B=c[p>>2]|0;a[e]=B;a[e+1|0]=B>>8;a[e+2|0]=B>>16;a[e+3|0]=B>>24;mc[c[(c[b>>2]|0)+32>>2]&63](q,b);if((a[l]&1)==0){a[l+1|0]=0;a[l]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}tg(l,0);c[l+0>>2]=c[q+0>>2];c[l+4>>2]=c[q+4>>2];c[l+8>>2]=c[q+8>>2];c[q+0>>2]=0;c[q+4>>2]=0;c[q+8>>2]=0;pg(q);mc[c[(c[b>>2]|0)+28>>2]&63](r,b);if((a[k]&1)==0){a[k+1|0]=0;a[k]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}tg(k,0);c[k+0>>2]=c[r+0>>2];c[k+4>>2]=c[r+4>>2];c[k+8>>2]=c[r+8>>2];c[r+0>>2]=0;c[r+4>>2]=0;c[r+8>>2]=0;pg(r);a[f]=oc[c[(c[b>>2]|0)+12>>2]&63](b)|0;a[g]=oc[c[(c[b>>2]|0)+16>>2]&63](b)|0;mc[c[(c[b>>2]|0)+20>>2]&63](s,b);if((a[h]&1)==0){a[h+1|0]=0;a[h]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}tg(h,0);c[h+0>>2]=c[s+0>>2];c[h+4>>2]=c[s+4>>2];c[h+8>>2]=c[s+8>>2];c[s+0>>2]=0;c[s+4>>2]=0;c[s+8>>2]=0;pg(s);mc[c[(c[b>>2]|0)+24>>2]&63](t,b);if((a[j]&1)==0){a[j+1|0]=0;a[j]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}tg(j,0);c[j+0>>2]=c[t+0>>2];c[j+4>>2]=c[t+4>>2];c[j+8>>2]=c[t+8>>2];c[t+0>>2]=0;c[t+4>>2]=0;c[t+8>>2]=0;pg(t);C=oc[c[(c[b>>2]|0)+36>>2]&63](b)|0;c[m>>2]=C;i=n;return}else{b=c[d>>2]|0;if(!((c[8370]|0)==-1)){c[o>>2]=33480;c[o+4>>2]=118;c[o+8>>2]=0;kg(33480,o,119)}o=(c[33484>>2]|0)+ -1|0;d=c[b+8>>2]|0;if(!((c[b+12>>2]|0)-d>>2>>>0>o>>>0)){D=vb(4)|0;ho(D);cc(D|0,42064,107)}b=c[d+(o<<2)>>2]|0;if((b|0)==0){D=vb(4)|0;ho(D);cc(D|0,42064,107)}mc[c[(c[b>>2]|0)+44>>2]&63](u,b);D=c[u>>2]|0;a[e]=D;a[e+1|0]=D>>8;a[e+2|0]=D>>16;a[e+3|0]=D>>24;mc[c[(c[b>>2]|0)+32>>2]&63](v,b);if((a[l]&1)==0){a[l+1|0]=0;a[l]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}tg(l,0);c[l+0>>2]=c[v+0>>2];c[l+4>>2]=c[v+4>>2];c[l+8>>2]=c[v+8>>2];c[v+0>>2]=0;c[v+4>>2]=0;c[v+8>>2]=0;pg(v);mc[c[(c[b>>2]|0)+28>>2]&63](w,b);if((a[k]&1)==0){a[k+1|0]=0;a[k]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}tg(k,0);c[k+0>>2]=c[w+0>>2];c[k+4>>2]=c[w+4>>2];c[k+8>>2]=c[w+8>>2];c[w+0>>2]=0;c[w+4>>2]=0;c[w+8>>2]=0;pg(w);a[f]=oc[c[(c[b>>2]|0)+12>>2]&63](b)|0;a[g]=oc[c[(c[b>>2]|0)+16>>2]&63](b)|0;mc[c[(c[b>>2]|0)+20>>2]&63](x,b);if((a[h]&1)==0){a[h+1|0]=0;a[h]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}tg(h,0);c[h+0>>2]=c[x+0>>2];c[h+4>>2]=c[x+4>>2];c[h+8>>2]=c[x+8>>2];c[x+0>>2]=0;c[x+4>>2]=0;c[x+8>>2]=0;pg(x);mc[c[(c[b>>2]|0)+24>>2]&63](y,b);if((a[j]&1)==0){a[j+1|0]=0;a[j]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}tg(j,0);c[j+0>>2]=c[y+0>>2];c[j+4>>2]=c[y+4>>2];c[j+8>>2]=c[y+8>>2];c[y+0>>2]=0;c[y+4>>2]=0;c[y+8>>2]=0;pg(y);C=oc[c[(c[b>>2]|0)+36>>2]&63](b)|0;c[m>>2]=C;i=n;return}}function cl(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;g=i;h=a[b]|0;if((h&1)==0){j=(h&255)>>>1}else{j=c[b+4>>2]|0}if((j|0)==0){i=g;return}if((d|0)!=(e|0)?(j=e+ -4|0,j>>>0>d>>>0):0){k=d;l=j;do{j=c[k>>2]|0;c[k>>2]=c[l>>2];c[l>>2]=j;k=k+4|0;l=l+ -4|0}while(k>>>0<l>>>0);m=a[b]|0}else{m=h}if((m&1)==0){n=b+1|0;o=(m&255)>>>1}else{n=c[b+8>>2]|0;o=c[b+4>>2]|0}b=e+ -4|0;e=a[n]|0;m=e<<24>>24<1|e<<24>>24==127;a:do{if(b>>>0>d>>>0){h=n+o|0;l=e;k=n;j=d;p=m;while(1){if(!p?(l<<24>>24|0)!=(c[j>>2]|0):0){break}q=(h-k|0)>1?k+1|0:k;r=j+4|0;s=a[q]|0;t=s<<24>>24<1|s<<24>>24==127;if(r>>>0<b>>>0){l=s;k=q;j=r;p=t}else{u=s;v=t;break a}}c[f>>2]=4;i=g;return}else{u=e;v=m}}while(0);if(v){i=g;return}v=c[b>>2]|0;if(!(u<<24>>24>>>0<v>>>0|(v|0)==0)){i=g;return}c[f>>2]=4;i=g;return}function dl(a){a=a|0;var b=0;b=i;Jo(a);i=b;return}function el(a){a=a|0;return}function fl(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;d=i;i=i+592|0;l=d;m=d+80|0;n=d+72|0;o=d+64|0;p=d+60|0;q=d+580|0;r=d+56|0;s=d+16|0;t=d+480|0;c[n>>2]=m;u=n+4|0;c[u>>2]=120;v=m+400|0;Jg(p,h);m=c[p>>2]|0;if(!((c[8524]|0)==-1)){c[l>>2]=34096;c[l+4>>2]=118;c[l+8>>2]=0;kg(34096,l,119)}w=(c[34100>>2]|0)+ -1|0;x=c[m+8>>2]|0;if(!((c[m+12>>2]|0)-x>>2>>>0>w>>>0)){y=vb(4)|0;ho(y);cc(y|0,42064,107)}m=c[x+(w<<2)>>2]|0;if((m|0)==0){y=vb(4)|0;ho(y);cc(y|0,42064,107)}a[q]=0;c[r>>2]=c[f>>2];y=c[h+4>>2]|0;c[l+0>>2]=c[r+0>>2];if(gl(e,l,g,p,y,j,q,m,n,o,v)|0){uc[c[(c[m>>2]|0)+48>>2]&7](m,33800,33810|0,s)|0;m=c[o>>2]|0;v=c[n>>2]|0;y=m-v|0;if((y|0)>392){g=Co((y>>2)+2|0)|0;if((g|0)==0){Oo()}else{z=g;A=g}}else{z=0;A=t}if((a[q]|0)==0){B=A}else{a[A]=45;B=A+1|0}if(v>>>0<m>>>0){m=s+40|0;A=s;q=B;g=v;while(1){v=c[g>>2]|0;y=s;while(1){r=y+4|0;if((c[y>>2]|0)==(v|0)){C=y;break}if((r|0)==(m|0)){C=m;break}else{y=r}}a[q]=a[33800+(C-A>>2)|0]|0;y=g+4|0;v=q+1|0;if(y>>>0<(c[o>>2]|0)>>>0){q=v;g=y}else{D=v;break}}}else{D=B}a[D]=0;c[l>>2]=k;if((Ha(t|0,33736,l|0)|0)!=1){l=vb(8)|0;Yf(l,33744);cc(l|0,31112,17)}if((z|0)!=0){Do(z)}}z=c[e>>2]|0;do{if((z|0)!=0){l=c[z+12>>2]|0;if((l|0)==(c[z+16>>2]|0)){E=oc[c[(c[z>>2]|0)+36>>2]&63](z)|0}else{E=c[l>>2]|0}if((E|0)==-1){c[e>>2]=0;F=1;break}else{F=(c[e>>2]|0)==0;break}}else{F=1}}while(0);E=c[f>>2]|0;do{if((E|0)!=0){z=c[E+12>>2]|0;if((z|0)==(c[E+16>>2]|0)){G=oc[c[(c[E>>2]|0)+36>>2]&63](E)|0}else{G=c[z>>2]|0}if(!((G|0)==-1)){if(F){break}else{H=37;break}}else{c[f>>2]=0;H=35;break}}else{H=35}}while(0);if((H|0)==35?F:0){H=37}if((H|0)==37){c[j>>2]=c[j>>2]|2}c[b>>2]=c[e>>2];Sf(c[p>>2]|0)|0;p=c[n>>2]|0;c[n>>2]=0;if((p|0)==0){i=d;return}lc[c[u>>2]&255](p);i=d;return}function gl(b,e,f,g,h,j,k,l,m,n,o){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;var p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0,Ja=0,Ka=0,La=0,Ma=0,Na=0,Oa=0,Pa=0,Qa=0,Ra=0,Sa=0,Ta=0,Ua=0,Va=0,Wa=0,Xa=0,Ya=0,Za=0,_a=0,$a=0,ab=0,bb=0,cb=0,db=0,eb=0,fb=0,gb=0,hb=0,ib=0,jb=0,kb=0,lb=0,mb=0,nb=0,ob=0,pb=0,qb=0,rb=0,sb=0,tb=0,ub=0,vb=0,wb=0,xb=0,yb=0,zb=0,Ab=0,Bb=0,Cb=0,Db=0,Eb=0,Fb=0,Gb=0,Hb=0,Ib=0,Jb=0,Kb=0,Lb=0,Mb=0,Nb=0,Ob=0,Pb=0,Qb=0,Rb=0,Sb=0,Tb=0,Ub=0,Vb=0,Wb=0,Xb=0,Yb=0,Zb=0,_b=0,$b=0,ac=0,bc=0,cc=0,dc=0,ec=0,fc=0,gc=0,hc=0,jc=0,kc=0,mc=0,nc=0,pc=0,qc=0,rc=0,sc=0,tc=0,uc=0,vc=0,wc=0;p=i;i=i+480|0;q=p+80|0;r=p+76|0;s=p+72|0;t=p+68|0;u=p+56|0;v=p+44|0;w=p+32|0;x=p+20|0;y=p+8|0;z=p+4|0;A=p;c[r>>2]=0;c[u+0>>2]=0;c[u+4>>2]=0;c[u+8>>2]=0;c[v+0>>2]=0;c[v+4>>2]=0;c[v+8>>2]=0;c[w+0>>2]=0;c[w+4>>2]=0;c[w+8>>2]=0;c[x+0>>2]=0;c[x+4>>2]=0;c[x+8>>2]=0;c[y+0>>2]=0;c[y+4>>2]=0;c[y+8>>2]=0;jl(f,g,r,s,t,u,v,w,x,z);c[n>>2]=c[m>>2];g=x+4|0;f=x+8|0;B=w+4|0;C=w+8|0;D=(h&512|0)!=0;h=v+4|0;E=v+8|0;F=y+4|0;G=y+8|0;H=r+3|0;I=m+4|0;J=u+4|0;K=q+400|0;L=q;M=q;q=o;o=0;N=0;O=120;a:while(1){P=c[b>>2]|0;do{if((P|0)!=0){Q=c[P+12>>2]|0;if((Q|0)==(c[P+16>>2]|0)){R=oc[c[(c[P>>2]|0)+36>>2]&63](P)|0}else{R=c[Q>>2]|0}if((R|0)==-1){c[b>>2]=0;S=1;break}else{S=(c[b>>2]|0)==0;break}}else{S=1}}while(0);P=c[e>>2]|0;do{if((P|0)!=0){Q=c[P+12>>2]|0;if((Q|0)==(c[P+16>>2]|0)){T=oc[c[(c[P>>2]|0)+36>>2]&63](P)|0}else{T=c[Q>>2]|0}if(!((T|0)==-1)){if(S){U=P;break}else{V=M;W=L;X=N;Y=O;Z=292;break a}}else{c[e>>2]=0;Z=15;break}}else{Z=15}}while(0);if((Z|0)==15){Z=0;if(S){V=M;W=L;X=N;Y=O;Z=292;break}else{U=0}}b:do{switch(a[r+o|0]|0){case 0:{Z=28;break};case 1:{if((o|0)==3){V=M;W=L;X=N;Y=O;Z=292;break a}P=c[b>>2]|0;Q=c[P+12>>2]|0;if((Q|0)==(c[P+16>>2]|0)){_=oc[c[(c[P>>2]|0)+36>>2]&63](P)|0}else{_=c[Q>>2]|0}if(!(ic[c[(c[l>>2]|0)+12>>2]&31](l,8192,_)|0)){Z=27;break a}Q=c[b>>2]|0;P=Q+12|0;$=c[P>>2]|0;if(($|0)==(c[Q+16>>2]|0)){aa=oc[c[(c[Q>>2]|0)+40>>2]&63](Q)|0}else{c[P>>2]=$+4;aa=c[$>>2]|0}Eg(y,aa);Z=28;break};case 3:{$=a[w]|0;P=($&1)==0;if(P){ba=($&255)>>>1}else{ba=c[B>>2]|0}Q=a[x]|0;ca=(Q&1)==0;if(ca){da=(Q&255)>>>1}else{da=c[g>>2]|0}if((ba|0)==(0-da|0)){ea=q;fa=M;ga=L;ha=K;ia=N;ja=O}else{if(P){ka=($&255)>>>1}else{ka=c[B>>2]|0}if((ka|0)!=0){if(ca){la=(Q&255)>>>1}else{la=c[g>>2]|0}if((la|0)!=0){ca=c[b>>2]|0;ma=c[ca+12>>2]|0;if((ma|0)==(c[ca+16>>2]|0)){na=oc[c[(c[ca>>2]|0)+36>>2]&63](ca)|0;oa=na;pa=a[w]|0}else{oa=c[ma>>2]|0;pa=$}ma=c[b>>2]|0;na=ma+12|0;ca=c[na>>2]|0;qa=(ca|0)==(c[ma+16>>2]|0);if((oa|0)==(c[((pa&1)==0?B:c[C>>2]|0)>>2]|0)){if(qa){oc[c[(c[ma>>2]|0)+40>>2]&63](ma)|0}else{c[na>>2]=ca+4}na=a[w]|0;if((na&1)==0){ra=(na&255)>>>1}else{ra=c[B>>2]|0}ea=q;fa=M;ga=L;ha=K;ia=ra>>>0>1?w:N;ja=O;break b}if(qa){sa=oc[c[(c[ma>>2]|0)+36>>2]&63](ma)|0}else{sa=c[ca>>2]|0}if((sa|0)!=(c[((a[x]&1)==0?g:c[f>>2]|0)>>2]|0)){Z=116;break a}ca=c[b>>2]|0;ma=ca+12|0;qa=c[ma>>2]|0;if((qa|0)==(c[ca+16>>2]|0)){oc[c[(c[ca>>2]|0)+40>>2]&63](ca)|0}else{c[ma>>2]=qa+4}a[k]=1;qa=a[x]|0;if((qa&1)==0){ta=(qa&255)>>>1}else{ta=c[g>>2]|0}ea=q;fa=M;ga=L;ha=K;ia=ta>>>0>1?x:N;ja=O;break b}}if(P){ua=($&255)>>>1}else{ua=c[B>>2]|0}P=c[b>>2]|0;qa=c[P+12>>2]|0;ma=(qa|0)==(c[P+16>>2]|0);if((ua|0)==0){if(ma){ca=oc[c[(c[P>>2]|0)+36>>2]&63](P)|0;va=ca;wa=a[x]|0}else{va=c[qa>>2]|0;wa=Q}if((va|0)!=(c[((wa&1)==0?g:c[f>>2]|0)>>2]|0)){ea=q;fa=M;ga=L;ha=K;ia=N;ja=O;break b}Q=c[b>>2]|0;ca=Q+12|0;na=c[ca>>2]|0;if((na|0)==(c[Q+16>>2]|0)){oc[c[(c[Q>>2]|0)+40>>2]&63](Q)|0}else{c[ca>>2]=na+4}a[k]=1;na=a[x]|0;if((na&1)==0){xa=(na&255)>>>1}else{xa=c[g>>2]|0}ea=q;fa=M;ga=L;ha=K;ia=xa>>>0>1?x:N;ja=O;break b}if(ma){ma=oc[c[(c[P>>2]|0)+36>>2]&63](P)|0;ya=ma;za=a[w]|0}else{ya=c[qa>>2]|0;za=$}if((ya|0)!=(c[((za&1)==0?B:c[C>>2]|0)>>2]|0)){a[k]=1;ea=q;fa=M;ga=L;ha=K;ia=N;ja=O;break b}$=c[b>>2]|0;qa=$+12|0;ma=c[qa>>2]|0;if((ma|0)==(c[$+16>>2]|0)){oc[c[(c[$>>2]|0)+40>>2]&63]($)|0}else{c[qa>>2]=ma+4}ma=a[w]|0;if((ma&1)==0){Aa=(ma&255)>>>1}else{Aa=c[B>>2]|0}ea=q;fa=M;ga=L;ha=K;ia=Aa>>>0>1?w:N;ja=O}break};case 2:{if(!((N|0)!=0|o>>>0<2)){if((o|0)==2){Ba=(a[H]|0)!=0}else{Ba=0}if(!(D|Ba)){ea=q;fa=M;ga=L;ha=K;ia=0;ja=O;break b}}ma=a[v]|0;qa=(ma&1)==0?h:c[E>>2]|0;c:do{if((o|0)!=0?(d[r+(o+ -1)|0]|0)<2:0){$=ma;P=qa;while(1){if(($&1)==0){Ca=h;Da=($&255)>>>1}else{Ca=c[E>>2]|0;Da=c[h>>2]|0}if((P|0)==(Ca+(Da<<2)|0)){Ea=$;break}if(!(ic[c[(c[l>>2]|0)+12>>2]&31](l,8192,c[P>>2]|0)|0)){Z=129;break}$=a[v]|0;P=P+4|0}if((Z|0)==129){Z=0;Ea=a[v]|0}$=(Ea&1)==0;na=P-($?h:c[E>>2]|0)>>2;ca=a[y]|0;Q=(ca&1)==0;if(Q){Fa=(ca&255)>>>1}else{Fa=c[F>>2]|0}d:do{if(!(na>>>0>Fa>>>0)){if(Q){Ga=F;Ha=(ca&255)>>>1;Ia=F+(((ca&255)>>>1)-na<<2)|0}else{Ja=c[G>>2]|0;Ka=c[F>>2]|0;Ga=Ja;Ha=Ka;Ia=Ja+(Ka-na<<2)|0}Ka=Ga+(Ha<<2)|0;if((Ia|0)==(Ka|0)){La=U;Ma=Ea;Na=P;Oa=U;break c}else{Pa=Ia;Qa=$?h:c[E>>2]|0}while(1){if((c[Pa>>2]|0)!=(c[Qa>>2]|0)){break d}Ja=Pa+4|0;if((Ja|0)==(Ka|0)){La=U;Ma=Ea;Na=P;Oa=U;break c}Pa=Ja;Qa=Qa+4|0}}}while(0);La=U;Ma=Ea;Na=$?h:c[E>>2]|0;Oa=U}else{La=U;Ma=ma;Na=qa;Oa=U}}while(0);e:while(1){if((Ma&1)==0){Ra=h;Sa=(Ma&255)>>>1}else{Ra=c[E>>2]|0;Sa=c[h>>2]|0}if((Na|0)==(Ra+(Sa<<2)|0)){break}qa=c[b>>2]|0;do{if((qa|0)!=0){ma=c[qa+12>>2]|0;if((ma|0)==(c[qa+16>>2]|0)){Ta=oc[c[(c[qa>>2]|0)+36>>2]&63](qa)|0}else{Ta=c[ma>>2]|0}if((Ta|0)==-1){c[b>>2]=0;Ua=1;break}else{Ua=(c[b>>2]|0)==0;break}}else{Ua=1}}while(0);do{if((Oa|0)!=0){qa=c[Oa+12>>2]|0;if((qa|0)==(c[Oa+16>>2]|0)){Va=oc[c[(c[Oa>>2]|0)+36>>2]&63](Oa)|0}else{Va=c[qa>>2]|0}if(!((Va|0)==-1)){if(Ua^(La|0)==0){Wa=La;Xa=La;break}else{break e}}else{c[e>>2]=0;Ya=0;Z=159;break}}else{Ya=La;Z=159}}while(0);if((Z|0)==159){Z=0;if(Ua){break}else{Wa=Ya;Xa=0}}qa=c[b>>2]|0;$=c[qa+12>>2]|0;if(($|0)==(c[qa+16>>2]|0)){Za=oc[c[(c[qa>>2]|0)+36>>2]&63](qa)|0}else{Za=c[$>>2]|0}if((Za|0)!=(c[Na>>2]|0)){break}$=c[b>>2]|0;qa=$+12|0;ma=c[qa>>2]|0;if((ma|0)==(c[$+16>>2]|0)){oc[c[(c[$>>2]|0)+40>>2]&63]($)|0}else{c[qa>>2]=ma+4}La=Wa;Ma=a[v]|0;Na=Na+4|0;Oa=Xa}if(D){ma=a[v]|0;if((ma&1)==0){_a=h;$a=(ma&255)>>>1}else{_a=c[E>>2]|0;$a=c[h>>2]|0}if((Na|0)!=(_a+($a<<2)|0)){Z=174;break a}else{ea=q;fa=M;ga=L;ha=K;ia=N;ja=O}}else{ea=q;fa=M;ga=L;ha=K;ia=N;ja=O}break};case 4:{ma=q;qa=L;$=K;P=M;na=0;ca=O;f:while(1){Q=c[b>>2]|0;do{if((Q|0)!=0){Ka=c[Q+12>>2]|0;if((Ka|0)==(c[Q+16>>2]|0)){ab=oc[c[(c[Q>>2]|0)+36>>2]&63](Q)|0}else{ab=c[Ka>>2]|0}if((ab|0)==-1){c[b>>2]=0;bb=1;break}else{bb=(c[b>>2]|0)==0;break}}else{bb=1}}while(0);Q=c[e>>2]|0;do{if((Q|0)!=0){Ka=c[Q+12>>2]|0;if((Ka|0)==(c[Q+16>>2]|0)){cb=oc[c[(c[Q>>2]|0)+36>>2]&63](Q)|0}else{cb=c[Ka>>2]|0}if(!((cb|0)==-1)){if(bb){break}else{break f}}else{c[e>>2]=0;Z=188;break}}else{Z=188}}while(0);if((Z|0)==188?(Z=0,bb):0){break}Q=c[b>>2]|0;Ka=c[Q+12>>2]|0;if((Ka|0)==(c[Q+16>>2]|0)){db=oc[c[(c[Q>>2]|0)+36>>2]&63](Q)|0}else{db=c[Ka>>2]|0}if(ic[c[(c[l>>2]|0)+12>>2]&31](l,2048,db)|0){Ka=c[n>>2]|0;if((Ka|0)==(ma|0)){Q=(c[I>>2]|0)!=120;Ja=c[m>>2]|0;eb=ma-Ja|0;fb=eb>>>0<2147483647?eb<<1:-1;gb=eb>>2;if(Q){hb=Ja}else{hb=0}Ja=Eo(hb,fb)|0;if((Ja|0)==0){Z=198;break a}if(!Q){Q=c[m>>2]|0;c[m>>2]=Ja;if((Q|0)==0){ib=Ja}else{lc[c[I>>2]&255](Q);ib=c[m>>2]|0}}else{c[m>>2]=Ja;ib=Ja}c[I>>2]=121;Ja=ib+(gb<<2)|0;c[n>>2]=Ja;jb=Ja;kb=(c[m>>2]|0)+(fb>>>2<<2)|0}else{jb=Ka;kb=ma}c[n>>2]=jb+4;c[jb>>2]=db;lb=kb;mb=P;nb=qa;ob=$;pb=na+1|0;qb=ca}else{Ka=a[u]|0;if((Ka&1)==0){rb=(Ka&255)>>>1}else{rb=c[J>>2]|0}if((rb|0)==0|(na|0)==0){break}if((db|0)!=(c[t>>2]|0)){break}if((qa|0)==($|0)){Ka=qa-P|0;fb=Ka>>>0<2147483647?Ka<<1:-1;if((ca|0)!=120){sb=P}else{sb=0}Ja=Eo(sb,fb)|0;if((Ja|0)==0){Z=214;break a}tb=Ja+(Ka>>2<<2)|0;ub=Ja;vb=Ja+(fb>>>2<<2)|0;wb=121}else{tb=qa;ub=P;vb=$;wb=ca}c[tb>>2]=na;lb=ma;mb=ub;nb=tb+4|0;ob=vb;pb=0;qb=wb}fb=c[b>>2]|0;Ja=fb+12|0;Ka=c[Ja>>2]|0;if((Ka|0)==(c[fb+16>>2]|0)){oc[c[(c[fb>>2]|0)+40>>2]&63](fb)|0;ma=lb;qa=nb;$=ob;P=mb;na=pb;ca=qb;continue}else{c[Ja>>2]=Ka+4;ma=lb;qa=nb;$=ob;P=mb;na=pb;ca=qb;continue}}if((P|0)==(qa|0)|(na|0)==0){xb=P;yb=qa;zb=$;Ab=ca}else{if((qa|0)==($|0)){Ka=qa-P|0;Ja=Ka>>>0<2147483647?Ka<<1:-1;if((ca|0)!=120){Bb=P}else{Bb=0}fb=Eo(Bb,Ja)|0;if((fb|0)==0){Z=225;break a}Cb=fb+(Ka>>2<<2)|0;Db=fb;Eb=fb+(Ja>>>2<<2)|0;Fb=121}else{Cb=qa;Db=P;Eb=$;Fb=ca}c[Cb>>2]=na;xb=Db;yb=Cb+4|0;zb=Eb;Ab=Fb}Ja=c[z>>2]|0;if((Ja|0)>0){fb=c[b>>2]|0;do{if((fb|0)!=0){Ka=c[fb+12>>2]|0;if((Ka|0)==(c[fb+16>>2]|0)){Gb=oc[c[(c[fb>>2]|0)+36>>2]&63](fb)|0}else{Gb=c[Ka>>2]|0}if((Gb|0)==-1){c[b>>2]=0;Hb=1;break}else{Hb=(c[b>>2]|0)==0;break}}else{Hb=1}}while(0);fb=c[e>>2]|0;do{if((fb|0)!=0){na=c[fb+12>>2]|0;if((na|0)==(c[fb+16>>2]|0)){Ib=oc[c[(c[fb>>2]|0)+36>>2]&63](fb)|0}else{Ib=c[na>>2]|0}if(!((Ib|0)==-1)){if(Hb){Jb=fb;break}else{Z=248;break a}}else{c[e>>2]=0;Z=242;break}}else{Z=242}}while(0);if((Z|0)==242){Z=0;if(Hb){Z=248;break a}else{Jb=0}}fb=c[b>>2]|0;na=c[fb+12>>2]|0;if((na|0)==(c[fb+16>>2]|0)){Kb=oc[c[(c[fb>>2]|0)+36>>2]&63](fb)|0}else{Kb=c[na>>2]|0}if((Kb|0)!=(c[s>>2]|0)){Z=248;break a}na=c[b>>2]|0;fb=na+12|0;ca=c[fb>>2]|0;if((ca|0)==(c[na+16>>2]|0)){oc[c[(c[na>>2]|0)+40>>2]&63](na)|0;Lb=Jb;Mb=Jb;Nb=ma;Ob=Ja}else{c[fb>>2]=ca+4;Lb=Jb;Mb=Jb;Nb=ma;Ob=Ja}while(1){ca=c[b>>2]|0;do{if((ca|0)!=0){fb=c[ca+12>>2]|0;if((fb|0)==(c[ca+16>>2]|0)){Pb=oc[c[(c[ca>>2]|0)+36>>2]&63](ca)|0}else{Pb=c[fb>>2]|0}if((Pb|0)==-1){c[b>>2]=0;Qb=1;break}else{Qb=(c[b>>2]|0)==0;break}}else{Qb=1}}while(0);do{if((Mb|0)!=0){ca=c[Mb+12>>2]|0;if((ca|0)==(c[Mb+16>>2]|0)){Rb=oc[c[(c[Mb>>2]|0)+36>>2]&63](Mb)|0}else{Rb=c[ca>>2]|0}if(!((Rb|0)==-1)){if(Qb^(Lb|0)==0){Sb=Lb;Tb=Lb;break}else{Z=271;break a}}else{c[e>>2]=0;Ub=0;Z=265;break}}else{Ub=Lb;Z=265}}while(0);if((Z|0)==265){Z=0;if(Qb){Z=271;break a}else{Sb=Ub;Tb=0}}ca=c[b>>2]|0;fb=c[ca+12>>2]|0;if((fb|0)==(c[ca+16>>2]|0)){Vb=oc[c[(c[ca>>2]|0)+36>>2]&63](ca)|0}else{Vb=c[fb>>2]|0}if(!(ic[c[(c[l>>2]|0)+12>>2]&31](l,2048,Vb)|0)){Z=271;break a}fb=c[n>>2]|0;if((fb|0)==(Nb|0)){ca=(c[I>>2]|0)!=120;na=c[m>>2]|0;$=Nb-na|0;P=$>>>0<2147483647?$<<1:-1;qa=$>>2;if(ca){Wb=na}else{Wb=0}na=Eo(Wb,P)|0;if((na|0)==0){Z=276;break a}if(!ca){ca=c[m>>2]|0;c[m>>2]=na;if((ca|0)==0){Xb=na}else{lc[c[I>>2]&255](ca);Xb=c[m>>2]|0}}else{c[m>>2]=na;Xb=na}c[I>>2]=121;na=Xb+(qa<<2)|0;c[n>>2]=na;Yb=na;Zb=(c[m>>2]|0)+(P>>>2<<2)|0}else{Yb=fb;Zb=Nb}fb=c[b>>2]|0;P=c[fb+12>>2]|0;if((P|0)==(c[fb+16>>2]|0)){na=oc[c[(c[fb>>2]|0)+36>>2]&63](fb)|0;_b=na;$b=c[n>>2]|0}else{_b=c[P>>2]|0;$b=Yb}c[n>>2]=$b+4;c[$b>>2]=_b;P=Ob+ -1|0;c[z>>2]=P;na=c[b>>2]|0;fb=na+12|0;qa=c[fb>>2]|0;if((qa|0)==(c[na+16>>2]|0)){oc[c[(c[na>>2]|0)+40>>2]&63](na)|0}else{c[fb>>2]=qa+4}if((P|0)>0){Lb=Sb;Mb=Tb;Nb=Zb;Ob=P}else{ac=Zb;break}}}else{ac=ma}if((c[n>>2]|0)==(c[m>>2]|0)){Z=290;break a}else{ea=ac;fa=xb;ga=yb;ha=zb;ia=N;ja=Ab}break};default:{ea=q;fa=M;ga=L;ha=K;ia=N;ja=O}}}while(0);g:do{if((Z|0)==28){Z=0;if((o|0)==3){V=M;W=L;X=N;Y=O;Z=292;break a}else{bc=U;cc=U}while(1){Ja=c[b>>2]|0;do{if((Ja|0)!=0){P=c[Ja+12>>2]|0;if((P|0)==(c[Ja+16>>2]|0)){dc=oc[c[(c[Ja>>2]|0)+36>>2]&63](Ja)|0}else{dc=c[P>>2]|0}if((dc|0)==-1){c[b>>2]=0;ec=1;break}else{ec=(c[b>>2]|0)==0;break}}else{ec=1}}while(0);do{if((cc|0)!=0){Ja=c[cc+12>>2]|0;if((Ja|0)==(c[cc+16>>2]|0)){fc=oc[c[(c[cc>>2]|0)+36>>2]&63](cc)|0}else{fc=c[Ja>>2]|0}if(!((fc|0)==-1)){if(ec^(bc|0)==0){gc=bc;hc=bc;break}else{ea=q;fa=M;ga=L;ha=K;ia=N;ja=O;break g}}else{c[e>>2]=0;jc=0;Z=42;break}}else{jc=bc;Z=42}}while(0);if((Z|0)==42){Z=0;if(ec){ea=q;fa=M;ga=L;ha=K;ia=N;ja=O;break g}else{gc=jc;hc=0}}Ja=c[b>>2]|0;P=c[Ja+12>>2]|0;if((P|0)==(c[Ja+16>>2]|0)){kc=oc[c[(c[Ja>>2]|0)+36>>2]&63](Ja)|0}else{kc=c[P>>2]|0}if(!(ic[c[(c[l>>2]|0)+12>>2]&31](l,8192,kc)|0)){ea=q;fa=M;ga=L;ha=K;ia=N;ja=O;break g}P=c[b>>2]|0;Ja=P+12|0;qa=c[Ja>>2]|0;if((qa|0)==(c[P+16>>2]|0)){mc=oc[c[(c[P>>2]|0)+40>>2]&63](P)|0}else{c[Ja>>2]=qa+4;mc=c[qa>>2]|0}Eg(y,mc);bc=gc;cc=hc}}}while(0);ma=o+1|0;if(ma>>>0<4){K=ha;L=ga;M=fa;q=ea;o=ma;N=ia;O=ja}else{V=fa;W=ga;X=ia;Y=ja;Z=292;break}}h:switch(Z|0){case 27:{c[j>>2]=c[j>>2]|4;nc=0;pc=M;qc=O;break};case 116:{c[j>>2]=c[j>>2]|4;nc=0;pc=M;qc=O;break};case 174:{c[j>>2]=c[j>>2]|4;nc=0;pc=M;qc=O;break};case 198:{Oo();break};case 214:{Oo();break};case 225:{Oo();break};case 248:{c[j>>2]=c[j>>2]|4;nc=0;pc=xb;qc=Ab;break};case 271:{c[j>>2]=c[j>>2]|4;nc=0;pc=xb;qc=Ab;break};case 276:{Oo();break};case 290:{c[j>>2]=c[j>>2]|4;nc=0;pc=xb;qc=Ab;break};case 292:{i:do{if((X|0)!=0){Ab=X+4|0;xb=X+8|0;O=1;j:while(1){M=a[X]|0;if((M&1)==0){rc=(M&255)>>>1}else{rc=c[Ab>>2]|0}if(!(O>>>0<rc>>>0)){break i}M=c[b>>2]|0;do{if((M|0)!=0){ja=c[M+12>>2]|0;if((ja|0)==(c[M+16>>2]|0)){sc=oc[c[(c[M>>2]|0)+36>>2]&63](M)|0}else{sc=c[ja>>2]|0}if((sc|0)==-1){c[b>>2]=0;tc=1;break}else{tc=(c[b>>2]|0)==0;break}}else{tc=1}}while(0);M=c[e>>2]|0;do{if((M|0)!=0){ja=c[M+12>>2]|0;if((ja|0)==(c[M+16>>2]|0)){uc=oc[c[(c[M>>2]|0)+36>>2]&63](M)|0}else{uc=c[ja>>2]|0}if(!((uc|0)==-1)){if(tc){break}else{break j}}else{c[e>>2]=0;Z=311;break}}else{Z=311}}while(0);if((Z|0)==311?(Z=0,tc):0){break}M=c[b>>2]|0;ja=c[M+12>>2]|0;if((ja|0)==(c[M+16>>2]|0)){vc=oc[c[(c[M>>2]|0)+36>>2]&63](M)|0}else{vc=c[ja>>2]|0}if((a[X]&1)==0){wc=Ab}else{wc=c[xb>>2]|0}if((vc|0)!=(c[wc+(O<<2)>>2]|0)){break}ja=O+1|0;M=c[b>>2]|0;ia=M+12|0;ga=c[ia>>2]|0;if((ga|0)==(c[M+16>>2]|0)){oc[c[(c[M>>2]|0)+40>>2]&63](M)|0;O=ja;continue}else{c[ia>>2]=ga+4;O=ja;continue}}c[j>>2]=c[j>>2]|4;nc=0;pc=V;qc=Y;break h}}while(0);if((V|0)!=(W|0)){c[A>>2]=0;cl(u,V,W,A);if((c[A>>2]|0)==0){nc=1;pc=V;qc=Y}else{c[j>>2]=c[j>>2]|4;nc=0;pc=V;qc=Y}}else{nc=1;pc=W;qc=Y}break}}Ag(y);Ag(x);Ag(w);Ag(v);pg(u);if((pc|0)==0){i=p;return nc|0}lc[qc&255](pc);i=p;return nc|0}function hl(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;d=i;i=i+448|0;l=d;m=d+32|0;n=d+24|0;o=d+20|0;p=d+16|0;q=d+432|0;r=d+12|0;c[n>>2]=m;s=n+4|0;c[s>>2]=120;t=m+400|0;Jg(p,h);m=c[p>>2]|0;if(!((c[8524]|0)==-1)){c[l>>2]=34096;c[l+4>>2]=118;c[l+8>>2]=0;kg(34096,l,119)}u=(c[34100>>2]|0)+ -1|0;v=c[m+8>>2]|0;if(!((c[m+12>>2]|0)-v>>2>>>0>u>>>0)){w=vb(4)|0;ho(w);cc(w|0,42064,107)}m=c[v+(u<<2)>>2]|0;if((m|0)==0){w=vb(4)|0;ho(w);cc(w|0,42064,107)}a[q]=0;w=c[f>>2]|0;c[r>>2]=w;u=c[h+4>>2]|0;c[l+0>>2]=c[r+0>>2];if(gl(e,l,g,p,u,j,q,m,n,o,t)|0){if((a[k]&1)==0){c[k+4>>2]=0;a[k]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}if((a[q]|0)!=0){Eg(k,xc[c[(c[m>>2]|0)+44>>2]&31](m,45)|0)}q=xc[c[(c[m>>2]|0)+44>>2]&31](m,48)|0;m=c[n>>2]|0;t=c[o>>2]|0;o=t+ -4|0;a:do{if(m>>>0<o>>>0){u=m;while(1){g=u+4|0;if((c[u>>2]|0)!=(q|0)){x=u;break a}if(g>>>0<o>>>0){u=g}else{x=g;break}}}else{x=m}}while(0);il(k,x,t)|0}t=c[e>>2]|0;do{if((t|0)!=0){x=c[t+12>>2]|0;if((x|0)==(c[t+16>>2]|0)){y=oc[c[(c[t>>2]|0)+36>>2]&63](t)|0}else{y=c[x>>2]|0}if((y|0)==-1){c[e>>2]=0;z=1;break}else{z=(c[e>>2]|0)==0;break}}else{z=1}}while(0);do{if((w|0)!=0){y=c[w+12>>2]|0;if((y|0)==(c[w+16>>2]|0)){A=oc[c[(c[w>>2]|0)+36>>2]&63](w)|0}else{A=c[y>>2]|0}if(!((A|0)==-1)){if(z){break}else{B=31;break}}else{c[f>>2]=0;B=29;break}}else{B=29}}while(0);if((B|0)==29?z:0){B=31}if((B|0)==31){c[j>>2]=c[j>>2]|2}c[b>>2]=c[e>>2];Sf(c[p>>2]|0)|0;p=c[n>>2]|0;c[n>>2]=0;if((p|0)==0){i=d;return}lc[c[s>>2]&255](p);i=d;return}function il(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;f=i;g=d;h=a[b]|0;if((h&1)==0){j=(h&255)>>>1;k=1;l=h}else{h=c[b>>2]|0;j=c[b+4>>2]|0;k=(h&-2)+ -1|0;l=h&255}h=e-g>>2;if((h|0)==0){i=f;return b|0}if((k-j|0)>>>0<h>>>0){Gg(b,k,j+h-k|0,j,j,0,0);m=a[b]|0}else{m=l}if((m&1)==0){n=b+4|0}else{n=c[b+8>>2]|0}m=n+(j<<2)|0;if((d|0)==(e|0)){o=m}else{l=j+((e+ -4+(0-g)|0)>>>2)+1|0;g=d;d=m;while(1){c[d>>2]=c[g>>2];g=g+4|0;if((g|0)==(e|0)){break}else{d=d+4|0}}o=n+(l<<2)|0}c[o>>2]=0;o=j+h|0;if((a[b]&1)==0){a[b]=o<<1;i=f;return b|0}else{c[b+4>>2]=o;i=f;return b|0}return 0}function jl(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;n=i;i=i+128|0;o=n;p=n+112|0;q=n+100|0;r=n+88|0;s=n+76|0;t=n+64|0;u=n+60|0;v=n+48|0;w=n+36|0;x=n+24|0;y=n+12|0;if(b){b=c[d>>2]|0;if(!((c[8418]|0)==-1)){c[o>>2]=33672;c[o+4>>2]=118;c[o+8>>2]=0;kg(33672,o,119)}z=(c[33676>>2]|0)+ -1|0;A=c[b+8>>2]|0;if(!((c[b+12>>2]|0)-A>>2>>>0>z>>>0)){B=vb(4)|0;ho(B);cc(B|0,42064,107)}b=c[A+(z<<2)>>2]|0;if((b|0)==0){B=vb(4)|0;ho(B);cc(B|0,42064,107)}mc[c[(c[b>>2]|0)+44>>2]&63](p,b);B=c[p>>2]|0;a[e]=B;a[e+1|0]=B>>8;a[e+2|0]=B>>16;a[e+3|0]=B>>24;mc[c[(c[b>>2]|0)+32>>2]&63](q,b);if((a[l]&1)==0){c[l+4>>2]=0;a[l]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}Dg(l,0);c[l+0>>2]=c[q+0>>2];c[l+4>>2]=c[q+4>>2];c[l+8>>2]=c[q+8>>2];c[q+0>>2]=0;c[q+4>>2]=0;c[q+8>>2]=0;Ag(q);mc[c[(c[b>>2]|0)+28>>2]&63](r,b);if((a[k]&1)==0){c[k+4>>2]=0;a[k]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}Dg(k,0);c[k+0>>2]=c[r+0>>2];c[k+4>>2]=c[r+4>>2];c[k+8>>2]=c[r+8>>2];c[r+0>>2]=0;c[r+4>>2]=0;c[r+8>>2]=0;Ag(r);c[f>>2]=oc[c[(c[b>>2]|0)+12>>2]&63](b)|0;c[g>>2]=oc[c[(c[b>>2]|0)+16>>2]&63](b)|0;mc[c[(c[b>>2]|0)+20>>2]&63](s,b);if((a[h]&1)==0){a[h+1|0]=0;a[h]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}tg(h,0);c[h+0>>2]=c[s+0>>2];c[h+4>>2]=c[s+4>>2];c[h+8>>2]=c[s+8>>2];c[s+0>>2]=0;c[s+4>>2]=0;c[s+8>>2]=0;pg(s);mc[c[(c[b>>2]|0)+24>>2]&63](t,b);if((a[j]&1)==0){c[j+4>>2]=0;a[j]=0}else{c[c[j+8>>2]>>2]=0;c[j+4>>2]=0}Dg(j,0);c[j+0>>2]=c[t+0>>2];c[j+4>>2]=c[t+4>>2];c[j+8>>2]=c[t+8>>2];c[t+0>>2]=0;c[t+4>>2]=0;c[t+8>>2]=0;Ag(t);C=oc[c[(c[b>>2]|0)+36>>2]&63](b)|0;c[m>>2]=C;i=n;return}else{b=c[d>>2]|0;if(!((c[8402]|0)==-1)){c[o>>2]=33608;c[o+4>>2]=118;c[o+8>>2]=0;kg(33608,o,119)}o=(c[33612>>2]|0)+ -1|0;d=c[b+8>>2]|0;if(!((c[b+12>>2]|0)-d>>2>>>0>o>>>0)){D=vb(4)|0;ho(D);cc(D|0,42064,107)}b=c[d+(o<<2)>>2]|0;if((b|0)==0){D=vb(4)|0;ho(D);cc(D|0,42064,107)}mc[c[(c[b>>2]|0)+44>>2]&63](u,b);D=c[u>>2]|0;a[e]=D;a[e+1|0]=D>>8;a[e+2|0]=D>>16;a[e+3|0]=D>>24;mc[c[(c[b>>2]|0)+32>>2]&63](v,b);if((a[l]&1)==0){c[l+4>>2]=0;a[l]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}Dg(l,0);c[l+0>>2]=c[v+0>>2];c[l+4>>2]=c[v+4>>2];c[l+8>>2]=c[v+8>>2];c[v+0>>2]=0;c[v+4>>2]=0;c[v+8>>2]=0;Ag(v);mc[c[(c[b>>2]|0)+28>>2]&63](w,b);if((a[k]&1)==0){c[k+4>>2]=0;a[k]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}Dg(k,0);c[k+0>>2]=c[w+0>>2];c[k+4>>2]=c[w+4>>2];c[k+8>>2]=c[w+8>>2];c[w+0>>2]=0;c[w+4>>2]=0;c[w+8>>2]=0;Ag(w);c[f>>2]=oc[c[(c[b>>2]|0)+12>>2]&63](b)|0;c[g>>2]=oc[c[(c[b>>2]|0)+16>>2]&63](b)|0;mc[c[(c[b>>2]|0)+20>>2]&63](x,b);if((a[h]&1)==0){a[h+1|0]=0;a[h]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}tg(h,0);c[h+0>>2]=c[x+0>>2];c[h+4>>2]=c[x+4>>2];c[h+8>>2]=c[x+8>>2];c[x+0>>2]=0;c[x+4>>2]=0;c[x+8>>2]=0;pg(x);mc[c[(c[b>>2]|0)+24>>2]&63](y,b);if((a[j]&1)==0){c[j+4>>2]=0;a[j]=0}else{c[c[j+8>>2]>>2]=0;c[j+4>>2]=0}Dg(j,0);c[j+0>>2]=c[y+0>>2];c[j+4>>2]=c[y+4>>2];c[j+8>>2]=c[y+8>>2];c[y+0>>2]=0;c[y+4>>2]=0;c[y+8>>2]=0;Ag(y);C=oc[c[(c[b>>2]|0)+36>>2]&63](b)|0;c[m>>2]=C;i=n;return}}function kl(a){a=a|0;var b=0;b=i;Jo(a);i=b;return}function ll(a){a=a|0;return}function ml(b,d,e,f,g,j,l){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=j|0;l=+l;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0;d=i;i=i+384|0;m=d;n=d+280|0;o=d+72|0;p=d+180|0;q=d+68|0;r=d+64|0;s=d+177|0;t=d+176|0;u=d+52|0;v=d+40|0;w=d+28|0;x=d+24|0;y=d+76|0;z=d+20|0;A=d+16|0;B=d+12|0;c[o>>2]=n;h[k>>3]=l;c[m>>2]=c[k>>2];c[m+4>>2]=c[k+4>>2];C=Ab(n|0,100,33856,m|0)|0;if(C>>>0>99){if((a[34e3]|0)==0?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}n=c[8498]|0;h[k>>3]=l;c[m>>2]=c[k>>2];c[m+4>>2]=c[k+4>>2];D=hj(o,n,33856,m)|0;n=c[o>>2]|0;if((n|0)==0){Oo()}E=Co(D)|0;if((E|0)==0){Oo()}else{F=E;G=n;H=E;I=D}}else{F=0;G=0;H=p;I=C}Jg(q,g);C=c[q>>2]|0;if(!((c[8526]|0)==-1)){c[m>>2]=34104;c[m+4>>2]=118;c[m+8>>2]=0;kg(34104,m,119)}p=(c[34108>>2]|0)+ -1|0;D=c[C+8>>2]|0;if(!((c[C+12>>2]|0)-D>>2>>>0>p>>>0)){J=vb(4)|0;ho(J);cc(J|0,42064,107)}C=c[D+(p<<2)>>2]|0;if((C|0)==0){J=vb(4)|0;ho(J);cc(J|0,42064,107)}J=c[o>>2]|0;uc[c[(c[C>>2]|0)+32>>2]&7](C,J,J+I|0,H)|0;if((I|0)==0){K=0}else{K=(a[c[o>>2]|0]|0)==45}c[r>>2]=0;c[u+0>>2]=0;c[u+4>>2]=0;c[u+8>>2]=0;c[v+0>>2]=0;c[v+4>>2]=0;c[v+8>>2]=0;c[w+0>>2]=0;c[w+4>>2]=0;c[w+8>>2]=0;nl(f,K,q,r,s,t,u,v,w,x);f=c[x>>2]|0;if((I|0)>(f|0)){x=a[w]|0;if((x&1)==0){L=(x&255)>>>1}else{L=c[w+4>>2]|0}x=a[v]|0;if((x&1)==0){M=(x&255)>>>1}else{M=c[v+4>>2]|0}N=L+(I-f<<1|1)+M|0}else{M=a[w]|0;if((M&1)==0){O=(M&255)>>>1}else{O=c[w+4>>2]|0}M=a[v]|0;if((M&1)==0){P=(M&255)>>>1}else{P=c[v+4>>2]|0}N=O+2+P|0}P=N+f|0;if(P>>>0>100){N=Co(P)|0;if((N|0)==0){Oo()}else{Q=N;R=N}}else{Q=0;R=y}ol(R,z,A,c[g+4>>2]|0,H,H+I|0,C,K,r,a[s]|0,a[t]|0,u,v,w,f);c[B>>2]=c[e>>2];e=c[z>>2]|0;z=c[A>>2]|0;c[m+0>>2]=c[B+0>>2];cj(b,m,R,e,z,g,j);if((Q|0)!=0){Do(Q)}pg(w);pg(v);pg(u);Sf(c[q>>2]|0)|0;if((F|0)!=0){Do(F)}if((G|0)==0){i=d;return}Do(G);i=d;return}function nl(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;n=i;i=i+128|0;o=n;p=n+120|0;q=n+108|0;r=n+104|0;s=n+92|0;t=n+80|0;u=n+68|0;v=n+64|0;w=n+52|0;x=n+48|0;y=n+36|0;z=n+24|0;A=n+12|0;B=c[e>>2]|0;if(b){if(!((c[8386]|0)==-1)){c[o>>2]=33544;c[o+4>>2]=118;c[o+8>>2]=0;kg(33544,o,119)}b=(c[33548>>2]|0)+ -1|0;e=c[B+8>>2]|0;if(!((c[B+12>>2]|0)-e>>2>>>0>b>>>0)){C=vb(4)|0;ho(C);cc(C|0,42064,107)}D=c[e+(b<<2)>>2]|0;if((D|0)==0){C=vb(4)|0;ho(C);cc(C|0,42064,107)}C=c[D>>2]|0;if(d){mc[c[C+44>>2]&63](p,D);b=c[p>>2]|0;a[f]=b;a[f+1|0]=b>>8;a[f+2|0]=b>>16;a[f+3|0]=b>>24;mc[c[(c[D>>2]|0)+32>>2]&63](q,D);if((a[l]&1)==0){a[l+1|0]=0;a[l]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}tg(l,0);c[l+0>>2]=c[q+0>>2];c[l+4>>2]=c[q+4>>2];c[l+8>>2]=c[q+8>>2];c[q+0>>2]=0;c[q+4>>2]=0;c[q+8>>2]=0;pg(q)}else{mc[c[C+40>>2]&63](r,D);C=c[r>>2]|0;a[f]=C;a[f+1|0]=C>>8;a[f+2|0]=C>>16;a[f+3|0]=C>>24;mc[c[(c[D>>2]|0)+28>>2]&63](s,D);if((a[l]&1)==0){a[l+1|0]=0;a[l]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}tg(l,0);c[l+0>>2]=c[s+0>>2];c[l+4>>2]=c[s+4>>2];c[l+8>>2]=c[s+8>>2];c[s+0>>2]=0;c[s+4>>2]=0;c[s+8>>2]=0;pg(s)}a[g]=oc[c[(c[D>>2]|0)+12>>2]&63](D)|0;a[h]=oc[c[(c[D>>2]|0)+16>>2]&63](D)|0;mc[c[(c[D>>2]|0)+20>>2]&63](t,D);if((a[j]&1)==0){a[j+1|0]=0;a[j]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}tg(j,0);c[j+0>>2]=c[t+0>>2];c[j+4>>2]=c[t+4>>2];c[j+8>>2]=c[t+8>>2];c[t+0>>2]=0;c[t+4>>2]=0;c[t+8>>2]=0;pg(t);mc[c[(c[D>>2]|0)+24>>2]&63](u,D);if((a[k]&1)==0){a[k+1|0]=0;a[k]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}tg(k,0);c[k+0>>2]=c[u+0>>2];c[k+4>>2]=c[u+4>>2];c[k+8>>2]=c[u+8>>2];c[u+0>>2]=0;c[u+4>>2]=0;c[u+8>>2]=0;pg(u);E=oc[c[(c[D>>2]|0)+36>>2]&63](D)|0;c[m>>2]=E;i=n;return}else{if(!((c[8370]|0)==-1)){c[o>>2]=33480;c[o+4>>2]=118;c[o+8>>2]=0;kg(33480,o,119)}o=(c[33484>>2]|0)+ -1|0;D=c[B+8>>2]|0;if(!((c[B+12>>2]|0)-D>>2>>>0>o>>>0)){F=vb(4)|0;ho(F);cc(F|0,42064,107)}B=c[D+(o<<2)>>2]|0;if((B|0)==0){F=vb(4)|0;ho(F);cc(F|0,42064,107)}F=c[B>>2]|0;if(d){mc[c[F+44>>2]&63](v,B);d=c[v>>2]|0;a[f]=d;a[f+1|0]=d>>8;a[f+2|0]=d>>16;a[f+3|0]=d>>24;mc[c[(c[B>>2]|0)+32>>2]&63](w,B);if((a[l]&1)==0){a[l+1|0]=0;a[l]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}tg(l,0);c[l+0>>2]=c[w+0>>2];c[l+4>>2]=c[w+4>>2];c[l+8>>2]=c[w+8>>2];c[w+0>>2]=0;c[w+4>>2]=0;c[w+8>>2]=0;pg(w)}else{mc[c[F+40>>2]&63](x,B);F=c[x>>2]|0;a[f]=F;a[f+1|0]=F>>8;a[f+2|0]=F>>16;a[f+3|0]=F>>24;mc[c[(c[B>>2]|0)+28>>2]&63](y,B);if((a[l]&1)==0){a[l+1|0]=0;a[l]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}tg(l,0);c[l+0>>2]=c[y+0>>2];c[l+4>>2]=c[y+4>>2];c[l+8>>2]=c[y+8>>2];c[y+0>>2]=0;c[y+4>>2]=0;c[y+8>>2]=0;pg(y)}a[g]=oc[c[(c[B>>2]|0)+12>>2]&63](B)|0;a[h]=oc[c[(c[B>>2]|0)+16>>2]&63](B)|0;mc[c[(c[B>>2]|0)+20>>2]&63](z,B);if((a[j]&1)==0){a[j+1|0]=0;a[j]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}tg(j,0);c[j+0>>2]=c[z+0>>2];c[j+4>>2]=c[z+4>>2];c[j+8>>2]=c[z+8>>2];c[z+0>>2]=0;c[z+4>>2]=0;c[z+8>>2]=0;pg(z);mc[c[(c[B>>2]|0)+24>>2]&63](A,B);if((a[k]&1)==0){a[k+1|0]=0;a[k]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}tg(k,0);c[k+0>>2]=c[A+0>>2];c[k+4>>2]=c[A+4>>2];c[k+8>>2]=c[A+8>>2];c[A+0>>2]=0;c[A+4>>2]=0;c[A+8>>2]=0;pg(A);E=oc[c[(c[B>>2]|0)+36>>2]&63](B)|0;c[m>>2]=E;i=n;return}}function ol(d,e,f,g,h,j,k,l,m,n,o,p,q,r,s){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;q=q|0;r=r|0;s=s|0;var t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0;t=i;c[f>>2]=d;u=r+1|0;v=r+8|0;w=r+4|0;x=(g&512|0)==0;y=q+1|0;z=q+8|0;A=q+4|0;B=(s|0)>0;C=p+1|0;D=p+8|0;E=p+4|0;F=k+8|0;G=0-s|0;H=h;h=0;while(1){switch(a[m+h|0]|0){case 1:{c[e>>2]=c[f>>2];I=xc[c[(c[k>>2]|0)+28>>2]&31](k,32)|0;J=c[f>>2]|0;c[f>>2]=J+1;a[J]=I;K=H;break};case 4:{I=c[f>>2]|0;J=l?H+1|0:H;a:do{if(J>>>0<j>>>0){L=J;while(1){M=a[L]|0;if(!(M<<24>>24>-1)){N=L;break a}O=L+1|0;if((b[(c[F>>2]|0)+(M<<24>>24<<1)>>1]&2048)==0){N=L;break a}if(O>>>0<j>>>0){L=O}else{N=O;break}}}else{N=J}}while(0);L=N;if(B){if(N>>>0>J>>>0){O=J+(0-L)|0;L=O>>>0<G>>>0?G:O;O=L+s|0;M=I;P=N;Q=s;while(1){R=P+ -1|0;S=a[R]|0;c[f>>2]=M+1;a[M]=S;S=Q+ -1|0;T=(S|0)>0;if(!(R>>>0>J>>>0&T)){break}M=c[f>>2]|0;P=R;Q=S}Q=N+L|0;if(T){U=Q;V=O;W=32}else{X=0;Y=Q;Z=O}}else{U=N;V=s;W=32}if((W|0)==32){W=0;X=xc[c[(c[k>>2]|0)+28>>2]&31](k,48)|0;Y=U;Z=V}Q=c[f>>2]|0;c[f>>2]=Q+1;if((Z|0)>0){P=Q;M=Z;while(1){a[P]=X;S=M+ -1|0;R=c[f>>2]|0;c[f>>2]=R+1;if((S|0)>0){P=R;M=S}else{_=R;break}}}else{_=Q}a[_]=n;$=Y}else{$=N}if(($|0)==(J|0)){M=xc[c[(c[k>>2]|0)+28>>2]&31](k,48)|0;P=c[f>>2]|0;c[f>>2]=P+1;a[P]=M}else{M=a[p]|0;P=(M&1)==0;if(P){aa=(M&255)>>>1}else{aa=c[E>>2]|0}if((aa|0)==0){ba=$;ca=-1;da=0;ea=0}else{if(P){fa=C}else{fa=c[D>>2]|0}ba=$;ca=a[fa]|0;da=0;ea=0}while(1){if((ea|0)==(ca|0)){P=c[f>>2]|0;c[f>>2]=P+1;a[P]=o;P=da+1|0;M=a[p]|0;O=(M&1)==0;if(O){ga=(M&255)>>>1}else{ga=c[E>>2]|0}if(P>>>0<ga>>>0){if(O){ha=C}else{ha=c[D>>2]|0}if((a[ha+P|0]|0)==127){ia=-1;ja=P;ka=0}else{if(O){la=C}else{la=c[D>>2]|0}ia=a[la+P|0]|0;ja=P;ka=0}}else{ia=ca;ja=P;ka=0}}else{ia=ca;ja=da;ka=ea}ba=ba+ -1|0;P=a[ba]|0;O=c[f>>2]|0;c[f>>2]=O+1;a[O]=P;if((ba|0)==(J|0)){break}else{ca=ia;da=ja;ea=ka+1|0}}}Q=c[f>>2]|0;if((I|0)!=(Q|0)?(P=Q+ -1|0,P>>>0>I>>>0):0){Q=I;O=P;while(1){P=a[Q]|0;a[Q]=a[O]|0;a[O]=P;P=Q+1|0;M=O+ -1|0;if(P>>>0<M>>>0){Q=P;O=M}else{K=J;break}}}else{K=J}break};case 3:{O=a[r]|0;Q=(O&1)==0;if(Q){ma=(O&255)>>>1}else{ma=c[w>>2]|0}if((ma|0)==0){K=H}else{if(Q){na=u}else{na=c[v>>2]|0}Q=a[na]|0;O=c[f>>2]|0;c[f>>2]=O+1;a[O]=Q;K=H}break};case 0:{c[e>>2]=c[f>>2];K=H;break};case 2:{Q=a[q]|0;O=(Q&1)==0;if(O){oa=(Q&255)>>>1}else{oa=c[A>>2]|0}if((oa|0)==0|x){K=H}else{if(O){pa=y;qa=(Q&255)>>>1}else{pa=c[z>>2]|0;qa=c[A>>2]|0}Q=pa+qa|0;O=c[f>>2]|0;if((pa|0)==(Q|0)){ra=O}else{I=O;O=pa;while(1){a[I]=a[O]|0;M=O+1|0;P=I+1|0;if((M|0)==(Q|0)){ra=P;break}else{I=P;O=M}}}c[f>>2]=ra;K=H}break};default:{K=H}}h=h+1|0;if((h|0)==4){break}else{H=K}}K=a[r]|0;r=(K&1)==0;if(r){sa=(K&255)>>>1}else{sa=c[w>>2]|0}if(sa>>>0>1){if(r){ta=u;ua=(K&255)>>>1}else{ta=c[v>>2]|0;ua=c[w>>2]|0}w=ta+1|0;v=ta+ua|0;ua=c[f>>2]|0;if((w|0)==(v|0)){va=ua}else{ta=ua;ua=w;while(1){a[ta]=a[ua]|0;w=ua+1|0;K=ta+1|0;if((w|0)==(v|0)){va=K;break}else{ta=K;ua=w}}}c[f>>2]=va}va=g&176;if((va|0)==32){c[e>>2]=c[f>>2];i=t;return}else if((va|0)==16){i=t;return}else{c[e>>2]=d;i=t;return}}function pl(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0;d=i;i=i+176|0;k=d;l=d+68|0;m=d+64|0;n=d+173|0;o=d+172|0;p=d+52|0;q=d+40|0;r=d+28|0;s=d+24|0;t=d+72|0;u=d+20|0;v=d+16|0;w=d+12|0;Jg(l,g);x=c[l>>2]|0;if(!((c[8526]|0)==-1)){c[k>>2]=34104;c[k+4>>2]=118;c[k+8>>2]=0;kg(34104,k,119)}y=(c[34108>>2]|0)+ -1|0;z=c[x+8>>2]|0;if(!((c[x+12>>2]|0)-z>>2>>>0>y>>>0)){A=vb(4)|0;ho(A);cc(A|0,42064,107)}x=c[z+(y<<2)>>2]|0;if((x|0)==0){A=vb(4)|0;ho(A);cc(A|0,42064,107)}A=a[j]|0;y=(A&1)==0;if(y){B=(A&255)>>>1}else{B=c[j+4>>2]|0}if((B|0)==0){C=0}else{if(y){D=j+1|0}else{D=c[j+8>>2]|0}y=a[D]|0;C=y<<24>>24==(xc[c[(c[x>>2]|0)+28>>2]&31](x,45)|0)<<24>>24}c[m>>2]=0;c[p+0>>2]=0;c[p+4>>2]=0;c[p+8>>2]=0;c[q+0>>2]=0;c[q+4>>2]=0;c[q+8>>2]=0;c[r+0>>2]=0;c[r+4>>2]=0;c[r+8>>2]=0;nl(f,C,l,m,n,o,p,q,r,s);f=a[j]|0;y=(f&1)==0;if(y){E=(f&255)>>>1}else{E=c[j+4>>2]|0}D=c[s>>2]|0;if((E|0)>(D|0)){if(y){F=(f&255)>>>1}else{F=c[j+4>>2]|0}y=a[r]|0;if((y&1)==0){G=(y&255)>>>1}else{G=c[r+4>>2]|0}y=a[q]|0;if((y&1)==0){H=(y&255)>>>1}else{H=c[q+4>>2]|0}I=G+(F-D<<1|1)+H|0}else{H=a[r]|0;if((H&1)==0){J=(H&255)>>>1}else{J=c[r+4>>2]|0}H=a[q]|0;if((H&1)==0){K=(H&255)>>>1}else{K=c[q+4>>2]|0}I=J+2+K|0}K=I+D|0;if(K>>>0>100){I=Co(K)|0;if((I|0)==0){Oo()}else{L=I;M=I}}else{L=0;M=t}if((f&1)==0){N=j+1|0;O=(f&255)>>>1}else{N=c[j+8>>2]|0;O=c[j+4>>2]|0}ol(M,u,v,c[g+4>>2]|0,N,N+O|0,x,C,m,a[n]|0,a[o]|0,p,q,r,D);c[w>>2]=c[e>>2];e=c[u>>2]|0;u=c[v>>2]|0;c[k+0>>2]=c[w+0>>2];cj(b,k,M,e,u,g,h);if((L|0)==0){pg(r);pg(q);pg(p);P=c[l>>2]|0;Sf(P)|0;i=d;return}Do(L);pg(r);pg(q);pg(p);P=c[l>>2]|0;Sf(P)|0;i=d;return}function ql(a){a=a|0;var b=0;b=i;Jo(a);i=b;return}function rl(a){a=a|0;return}function sl(b,d,e,f,g,j,l){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=j|0;l=+l;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0;d=i;i=i+992|0;m=d;n=d+884|0;o=d+880|0;p=d+480|0;q=d+476|0;r=d+472|0;s=d+468|0;t=d+464|0;u=d+452|0;v=d+440|0;w=d+428|0;x=d+424|0;y=d+24|0;z=d+20|0;A=d+16|0;B=d+12|0;c[o>>2]=n;h[k>>3]=l;c[m>>2]=c[k>>2];c[m+4>>2]=c[k+4>>2];C=Ab(n|0,100,33856,m|0)|0;if(C>>>0>99){if((a[34e3]|0)==0?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}n=c[8498]|0;h[k>>3]=l;c[m>>2]=c[k>>2];c[m+4>>2]=c[k+4>>2];D=hj(o,n,33856,m)|0;n=c[o>>2]|0;if((n|0)==0){Oo()}E=Co(D<<2)|0;if((E|0)==0){Oo()}else{F=E;G=n;H=E;I=D}}else{F=0;G=0;H=p;I=C}Jg(q,g);C=c[q>>2]|0;if(!((c[8524]|0)==-1)){c[m>>2]=34096;c[m+4>>2]=118;c[m+8>>2]=0;kg(34096,m,119)}p=(c[34100>>2]|0)+ -1|0;D=c[C+8>>2]|0;if(!((c[C+12>>2]|0)-D>>2>>>0>p>>>0)){J=vb(4)|0;ho(J);cc(J|0,42064,107)}C=c[D+(p<<2)>>2]|0;if((C|0)==0){J=vb(4)|0;ho(J);cc(J|0,42064,107)}J=c[o>>2]|0;uc[c[(c[C>>2]|0)+48>>2]&7](C,J,J+I|0,H)|0;if((I|0)==0){K=0}else{K=(a[c[o>>2]|0]|0)==45}c[r>>2]=0;c[u+0>>2]=0;c[u+4>>2]=0;c[u+8>>2]=0;c[v+0>>2]=0;c[v+4>>2]=0;c[v+8>>2]=0;c[w+0>>2]=0;c[w+4>>2]=0;c[w+8>>2]=0;tl(f,K,q,r,s,t,u,v,w,x);f=c[x>>2]|0;if((I|0)>(f|0)){x=a[w]|0;if((x&1)==0){L=(x&255)>>>1}else{L=c[w+4>>2]|0}x=a[v]|0;if((x&1)==0){M=(x&255)>>>1}else{M=c[v+4>>2]|0}N=L+(I-f<<1|1)+M|0}else{M=a[w]|0;if((M&1)==0){O=(M&255)>>>1}else{O=c[w+4>>2]|0}M=a[v]|0;if((M&1)==0){P=(M&255)>>>1}else{P=c[v+4>>2]|0}N=O+2+P|0}P=N+f|0;if(P>>>0>100){N=Co(P<<2)|0;if((N|0)==0){Oo()}else{Q=N;R=N}}else{Q=0;R=y}ul(R,z,A,c[g+4>>2]|0,H,H+(I<<2)|0,C,K,r,c[s>>2]|0,c[t>>2]|0,u,v,w,f);c[B>>2]=c[e>>2];e=c[z>>2]|0;z=c[A>>2]|0;c[m+0>>2]=c[B+0>>2];qj(b,m,R,e,z,g,j);if((Q|0)!=0){Do(Q)}Ag(w);Ag(v);pg(u);Sf(c[q>>2]|0)|0;if((F|0)!=0){Do(F)}if((G|0)==0){i=d;return}Do(G);i=d;return}function tl(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;n=i;i=i+128|0;o=n;p=n+120|0;q=n+108|0;r=n+104|0;s=n+92|0;t=n+80|0;u=n+68|0;v=n+64|0;w=n+52|0;x=n+48|0;y=n+36|0;z=n+24|0;A=n+12|0;B=c[e>>2]|0;if(b){if(!((c[8418]|0)==-1)){c[o>>2]=33672;c[o+4>>2]=118;c[o+8>>2]=0;kg(33672,o,119)}b=(c[33676>>2]|0)+ -1|0;e=c[B+8>>2]|0;if(!((c[B+12>>2]|0)-e>>2>>>0>b>>>0)){C=vb(4)|0;ho(C);cc(C|0,42064,107)}D=c[e+(b<<2)>>2]|0;if((D|0)==0){C=vb(4)|0;ho(C);cc(C|0,42064,107)}C=c[D>>2]|0;if(d){mc[c[C+44>>2]&63](p,D);b=c[p>>2]|0;a[f]=b;a[f+1|0]=b>>8;a[f+2|0]=b>>16;a[f+3|0]=b>>24;mc[c[(c[D>>2]|0)+32>>2]&63](q,D);if((a[l]&1)==0){c[l+4>>2]=0;a[l]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}Dg(l,0);c[l+0>>2]=c[q+0>>2];c[l+4>>2]=c[q+4>>2];c[l+8>>2]=c[q+8>>2];c[q+0>>2]=0;c[q+4>>2]=0;c[q+8>>2]=0;Ag(q)}else{mc[c[C+40>>2]&63](r,D);C=c[r>>2]|0;a[f]=C;a[f+1|0]=C>>8;a[f+2|0]=C>>16;a[f+3|0]=C>>24;mc[c[(c[D>>2]|0)+28>>2]&63](s,D);if((a[l]&1)==0){c[l+4>>2]=0;a[l]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}Dg(l,0);c[l+0>>2]=c[s+0>>2];c[l+4>>2]=c[s+4>>2];c[l+8>>2]=c[s+8>>2];c[s+0>>2]=0;c[s+4>>2]=0;c[s+8>>2]=0;Ag(s)}c[g>>2]=oc[c[(c[D>>2]|0)+12>>2]&63](D)|0;c[h>>2]=oc[c[(c[D>>2]|0)+16>>2]&63](D)|0;mc[c[(c[D>>2]|0)+20>>2]&63](t,D);if((a[j]&1)==0){a[j+1|0]=0;a[j]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}tg(j,0);c[j+0>>2]=c[t+0>>2];c[j+4>>2]=c[t+4>>2];c[j+8>>2]=c[t+8>>2];c[t+0>>2]=0;c[t+4>>2]=0;c[t+8>>2]=0;pg(t);mc[c[(c[D>>2]|0)+24>>2]&63](u,D);if((a[k]&1)==0){c[k+4>>2]=0;a[k]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}Dg(k,0);c[k+0>>2]=c[u+0>>2];c[k+4>>2]=c[u+4>>2];c[k+8>>2]=c[u+8>>2];c[u+0>>2]=0;c[u+4>>2]=0;c[u+8>>2]=0;Ag(u);E=oc[c[(c[D>>2]|0)+36>>2]&63](D)|0;c[m>>2]=E;i=n;return}else{if(!((c[8402]|0)==-1)){c[o>>2]=33608;c[o+4>>2]=118;c[o+8>>2]=0;kg(33608,o,119)}o=(c[33612>>2]|0)+ -1|0;D=c[B+8>>2]|0;if(!((c[B+12>>2]|0)-D>>2>>>0>o>>>0)){F=vb(4)|0;ho(F);cc(F|0,42064,107)}B=c[D+(o<<2)>>2]|0;if((B|0)==0){F=vb(4)|0;ho(F);cc(F|0,42064,107)}F=c[B>>2]|0;if(d){mc[c[F+44>>2]&63](v,B);d=c[v>>2]|0;a[f]=d;a[f+1|0]=d>>8;a[f+2|0]=d>>16;a[f+3|0]=d>>24;mc[c[(c[B>>2]|0)+32>>2]&63](w,B);if((a[l]&1)==0){c[l+4>>2]=0;a[l]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}Dg(l,0);c[l+0>>2]=c[w+0>>2];c[l+4>>2]=c[w+4>>2];c[l+8>>2]=c[w+8>>2];c[w+0>>2]=0;c[w+4>>2]=0;c[w+8>>2]=0;Ag(w)}else{mc[c[F+40>>2]&63](x,B);F=c[x>>2]|0;a[f]=F;a[f+1|0]=F>>8;a[f+2|0]=F>>16;a[f+3|0]=F>>24;mc[c[(c[B>>2]|0)+28>>2]&63](y,B);if((a[l]&1)==0){c[l+4>>2]=0;a[l]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}Dg(l,0);c[l+0>>2]=c[y+0>>2];c[l+4>>2]=c[y+4>>2];c[l+8>>2]=c[y+8>>2];c[y+0>>2]=0;c[y+4>>2]=0;c[y+8>>2]=0;Ag(y)}c[g>>2]=oc[c[(c[B>>2]|0)+12>>2]&63](B)|0;c[h>>2]=oc[c[(c[B>>2]|0)+16>>2]&63](B)|0;mc[c[(c[B>>2]|0)+20>>2]&63](z,B);if((a[j]&1)==0){a[j+1|0]=0;a[j]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}tg(j,0);c[j+0>>2]=c[z+0>>2];c[j+4>>2]=c[z+4>>2];c[j+8>>2]=c[z+8>>2];c[z+0>>2]=0;c[z+4>>2]=0;c[z+8>>2]=0;pg(z);mc[c[(c[B>>2]|0)+24>>2]&63](A,B);if((a[k]&1)==0){c[k+4>>2]=0;a[k]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}Dg(k,0);c[k+0>>2]=c[A+0>>2];c[k+4>>2]=c[A+4>>2];c[k+8>>2]=c[A+8>>2];c[A+0>>2]=0;c[A+4>>2]=0;c[A+8>>2]=0;Ag(A);E=oc[c[(c[B>>2]|0)+36>>2]&63](B)|0;c[m>>2]=E;i=n;return}}function ul(b,d,e,f,g,h,j,k,l,m,n,o,p,q,r){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;q=q|0;r=r|0;var s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0;s=i;c[e>>2]=b;t=q+4|0;u=q+8|0;v=(f&512|0)==0;w=p+4|0;x=p+8|0;y=(r|0)>0;z=o+1|0;A=o+8|0;B=o+4|0;C=g;g=0;while(1){switch(a[l+g|0]|0){case 4:{D=c[e>>2]|0;E=k?C+4|0:C;a:do{if(E>>>0<h>>>0){F=E;while(1){G=F+4|0;if(!(ic[c[(c[j>>2]|0)+12>>2]&31](j,2048,c[F>>2]|0)|0)){H=F;break a}if(G>>>0<h>>>0){F=G}else{H=G;break}}}else{H=E}}while(0);if(y){if(H>>>0>E>>>0){F=c[e>>2]|0;G=H;I=r;do{G=G+ -4|0;J=F;F=F+4|0;c[J>>2]=c[G>>2];I=I+ -1|0;K=(I|0)>0}while(G>>>0>E>>>0&K);c[e>>2]=F;if(K){L=G;M=I;N=34}else{J=c[e>>2]|0;c[e>>2]=J+4;O=J;P=G}}else{L=H;M=r;N=34}if((N|0)==34){N=0;J=xc[c[(c[j>>2]|0)+44>>2]&31](j,48)|0;Q=c[e>>2]|0;R=Q+4|0;c[e>>2]=R;if((M|0)>0){S=Q;T=R;R=M;while(1){c[S>>2]=J;R=R+ -1|0;if((R|0)<=0){break}else{U=T;T=T+4|0;S=U}}c[e>>2]=Q+(M+1<<2);O=Q+(M<<2)|0;P=L}else{O=Q;P=L}}c[O>>2]=m;V=P}else{V=H}if((V|0)==(E|0)){S=xc[c[(c[j>>2]|0)+44>>2]&31](j,48)|0;T=c[e>>2]|0;R=T+4|0;c[e>>2]=R;c[T>>2]=S;W=R}else{R=a[o]|0;S=(R&1)==0;if(S){X=(R&255)>>>1}else{X=c[B>>2]|0}if((X|0)==0){Y=V;Z=-1;_=0;$=0}else{if(S){aa=z}else{aa=c[A>>2]|0}Y=V;Z=a[aa]|0;_=0;$=0}while(1){S=c[e>>2]|0;if(($|0)==(Z|0)){R=S+4|0;c[e>>2]=R;c[S>>2]=n;T=_+1|0;J=a[o]|0;G=(J&1)==0;if(G){ba=(J&255)>>>1}else{ba=c[B>>2]|0}if(T>>>0<ba>>>0){if(G){ca=z}else{ca=c[A>>2]|0}if((a[ca+T|0]|0)==127){da=R;ea=-1;fa=T;ga=0}else{if(G){ha=z}else{ha=c[A>>2]|0}da=R;ea=a[ha+T|0]|0;fa=T;ga=0}}else{da=R;ea=Z;fa=T;ga=0}}else{da=S;ea=Z;fa=_;ga=$}S=Y+ -4|0;T=c[S>>2]|0;R=da+4|0;c[e>>2]=R;c[da>>2]=T;if((S|0)==(E|0)){W=R;break}else{Y=S;Z=ea;_=fa;$=ga+1|0}}}if((D|0)!=(W|0)?(Q=W+ -4|0,Q>>>0>D>>>0):0){S=D;R=Q;while(1){Q=c[S>>2]|0;c[S>>2]=c[R>>2];c[R>>2]=Q;Q=S+4|0;T=R+ -4|0;if(Q>>>0<T>>>0){S=Q;R=T}else{ia=E;break}}}else{ia=E}break};case 3:{R=a[q]|0;S=(R&1)==0;if(S){ja=(R&255)>>>1}else{ja=c[t>>2]|0}if((ja|0)==0){ia=C}else{if(S){ka=t}else{ka=c[u>>2]|0}S=c[ka>>2]|0;R=c[e>>2]|0;c[e>>2]=R+4;c[R>>2]=S;ia=C}break};case 0:{c[d>>2]=c[e>>2];ia=C;break};case 2:{S=a[p]|0;R=(S&1)==0;if(R){la=(S&255)>>>1}else{la=c[w>>2]|0}if((la|0)==0|v){ia=C}else{if(R){ma=w;na=(S&255)>>>1}else{ma=c[x>>2]|0;na=c[w>>2]|0}S=ma+(na<<2)|0;R=c[e>>2]|0;if((ma|0)==(S|0)){oa=R}else{D=(ma+(na+ -1<<2)+(0-ma)|0)>>>2;T=R;Q=ma;while(1){c[T>>2]=c[Q>>2];G=Q+4|0;if((G|0)==(S|0)){break}T=T+4|0;Q=G}oa=R+(D+1<<2)|0}c[e>>2]=oa;ia=C}break};case 1:{c[d>>2]=c[e>>2];Q=xc[c[(c[j>>2]|0)+44>>2]&31](j,32)|0;T=c[e>>2]|0;c[e>>2]=T+4;c[T>>2]=Q;ia=C;break};default:{ia=C}}g=g+1|0;if((g|0)==4){break}else{C=ia}}ia=a[q]|0;q=(ia&1)==0;if(q){pa=(ia&255)>>>1}else{pa=c[t>>2]|0}if(pa>>>0>1){if(q){qa=t;ra=(ia&255)>>>1}else{qa=c[u>>2]|0;ra=c[t>>2]|0}t=qa+4|0;u=qa+(ra<<2)|0;ia=c[e>>2]|0;if((t|0)==(u|0)){sa=ia}else{q=(qa+(ra+ -1<<2)+(0-t)|0)>>>2;ra=ia;qa=t;while(1){c[ra>>2]=c[qa>>2];qa=qa+4|0;if((qa|0)==(u|0)){break}else{ra=ra+4|0}}sa=ia+(q+1<<2)|0}c[e>>2]=sa}sa=f&176;if((sa|0)==32){c[d>>2]=c[e>>2];i=s;return}else if((sa|0)==16){i=s;return}else{c[d>>2]=b;i=s;return}}function vl(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0;d=i;i=i+480|0;k=d;l=d+476|0;m=d+472|0;n=d+468|0;o=d+464|0;p=d+452|0;q=d+440|0;r=d+428|0;s=d+424|0;t=d+24|0;u=d+20|0;v=d+16|0;w=d+12|0;Jg(l,g);x=c[l>>2]|0;if(!((c[8524]|0)==-1)){c[k>>2]=34096;c[k+4>>2]=118;c[k+8>>2]=0;kg(34096,k,119)}y=(c[34100>>2]|0)+ -1|0;z=c[x+8>>2]|0;if(!((c[x+12>>2]|0)-z>>2>>>0>y>>>0)){A=vb(4)|0;ho(A);cc(A|0,42064,107)}x=c[z+(y<<2)>>2]|0;if((x|0)==0){A=vb(4)|0;ho(A);cc(A|0,42064,107)}A=a[j]|0;y=(A&1)==0;if(y){B=(A&255)>>>1}else{B=c[j+4>>2]|0}if((B|0)==0){C=0}else{if(y){D=j+4|0}else{D=c[j+8>>2]|0}y=c[D>>2]|0;C=(y|0)==(xc[c[(c[x>>2]|0)+44>>2]&31](x,45)|0)}c[m>>2]=0;c[p+0>>2]=0;c[p+4>>2]=0;c[p+8>>2]=0;c[q+0>>2]=0;c[q+4>>2]=0;c[q+8>>2]=0;c[r+0>>2]=0;c[r+4>>2]=0;c[r+8>>2]=0;tl(f,C,l,m,n,o,p,q,r,s);f=a[j]|0;y=(f&1)==0;if(y){E=(f&255)>>>1}else{E=c[j+4>>2]|0}D=c[s>>2]|0;if((E|0)>(D|0)){if(y){F=(f&255)>>>1}else{F=c[j+4>>2]|0}y=a[r]|0;if((y&1)==0){G=(y&255)>>>1}else{G=c[r+4>>2]|0}y=a[q]|0;if((y&1)==0){H=(y&255)>>>1}else{H=c[q+4>>2]|0}I=G+(F-D<<1|1)+H|0}else{H=a[r]|0;if((H&1)==0){J=(H&255)>>>1}else{J=c[r+4>>2]|0}H=a[q]|0;if((H&1)==0){K=(H&255)>>>1}else{K=c[q+4>>2]|0}I=J+2+K|0}K=I+D|0;if(K>>>0>100){I=Co(K<<2)|0;if((I|0)==0){Oo()}else{L=I;M=I}}else{L=0;M=t}if((f&1)==0){N=j+4|0;O=(f&255)>>>1}else{N=c[j+8>>2]|0;O=c[j+4>>2]|0}ul(M,u,v,c[g+4>>2]|0,N,N+(O<<2)|0,x,C,m,c[n>>2]|0,c[o>>2]|0,p,q,r,D);c[w>>2]=c[e>>2];e=c[u>>2]|0;u=c[v>>2]|0;c[k+0>>2]=c[w+0>>2];qj(b,k,M,e,u,g,h);if((L|0)==0){Ag(r);Ag(q);pg(p);P=c[l>>2]|0;Sf(P)|0;i=d;return}Do(L);Ag(r);Ag(q);pg(p);P=c[l>>2]|0;Sf(P)|0;i=d;return}function wl(a){a=a|0;var b=0;b=i;Jo(a);i=b;return}function xl(a){a=a|0;return}function yl(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;e=i;if((a[d]&1)==0){f=d+1|0}else{f=c[d+8>>2]|0}d=rb(f|0,1)|0;i=e;return d>>>((d|0)!=(-1|0)|0)|0}function zl(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;d=i;i=i+16|0;j=d;c[j+0>>2]=0;c[j+4>>2]=0;c[j+8>>2]=0;k=a[h]|0;if((k&1)==0){l=h+1|0;m=(k&255)>>>1;n=h+1|0}else{k=c[h+8>>2]|0;l=k;m=c[h+4>>2]|0;n=k}k=l+m|0;if(n>>>0<k>>>0){m=n;do{ug(j,a[m]|0);m=m+1|0}while((m|0)!=(k|0));k=(e|0)==-1?-1:e<<1;if((a[j]&1)==0){o=k;p=9}else{q=k;r=c[j+8>>2]|0}}else{o=(e|0)==-1?-1:e<<1;p=9}if((p|0)==9){q=o;r=j+1|0}o=Ub(q|0,f|0,g|0,r|0)|0;c[b+0>>2]=0;c[b+4>>2]=0;c[b+8>>2]=0;r=cp(o|0)|0;g=o+r|0;if((r|0)>0){s=o}else{pg(j);i=d;return}do{ug(b,a[s]|0);s=s+1|0}while((s|0)!=(g|0));pg(j);i=d;return}function Al(a,b){a=a|0;b=b|0;a=i;Ya(((b|0)==-1?-1:b<<1)|0)|0;i=a;return}function Bl(a){a=a|0;var b=0;b=i;Jo(a);i=b;return}function Cl(a){a=a|0;return}function Dl(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;e=i;if((a[d]&1)==0){f=d+1|0}else{f=c[d+8>>2]|0}d=rb(f|0,1)|0;i=e;return d>>>((d|0)!=(-1|0)|0)|0}function El(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;d=i;i=i+176|0;j=d;k=d+48|0;l=d+40|0;m=d+36|0;n=d+24|0;o=d+16|0;p=d+8|0;c[n+0>>2]=0;c[n+4>>2]=0;c[n+8>>2]=0;c[o+4>>2]=0;c[o>>2]=35760;q=a[h]|0;if((q&1)==0){r=h+4|0;s=(q&255)>>>1;t=h+4|0}else{q=c[h+8>>2]|0;r=q;s=c[h+4>>2]|0;t=q}q=r+(s<<2)|0;s=j;c[s>>2]=0;c[s+4>>2]=0;a:do{if(t>>>0<q>>>0){s=k+32|0;r=t;h=35760|0;while(1){c[m>>2]=r;u=(tc[c[h+12>>2]&15](o,j,r,q,m,k,s,l)|0)==2;v=c[m>>2]|0;if(u|(v|0)==(r|0)){break}if(k>>>0<(c[l>>2]|0)>>>0){u=k;do{ug(n,a[u]|0);u=u+1|0}while(u>>>0<(c[l>>2]|0)>>>0);w=c[m>>2]|0}else{w=v}if(!(w>>>0<q>>>0)){break a}r=w;h=c[o>>2]|0}_k(34984)}}while(0);if((a[n]&1)==0){x=n+1|0}else{x=c[n+8>>2]|0}o=Ub(((e|0)==-1?-1:e<<1)|0,f|0,g|0,x|0)|0;c[b+0>>2]=0;c[b+4>>2]=0;c[b+8>>2]=0;c[p+4>>2]=0;c[p>>2]=35864;x=cp(o|0)|0;g=o+x|0;f=j;c[f>>2]=0;c[f+4>>2]=0;if((x|0)<=0){pg(n);i=d;return}x=g;f=k+128|0;e=o;o=35864|0;while(1){c[m>>2]=e;w=(tc[c[o+16>>2]&15](p,j,e,(x-e|0)>32?e+32|0:g,m,k,f,l)|0)==2;q=c[m>>2]|0;if(w|(q|0)==(e|0)){y=20;break}if(k>>>0<(c[l>>2]|0)>>>0){w=k;do{Eg(b,c[w>>2]|0);w=w+4|0}while(w>>>0<(c[l>>2]|0)>>>0);z=c[m>>2]|0}else{z=q}if(!(z>>>0<g>>>0)){y=25;break}e=z;o=c[p>>2]|0}if((y|0)==20){_k(34984)}else if((y|0)==25){pg(n);i=d;return}}function Fl(a,b){a=a|0;b=b|0;a=i;Ya(((b|0)==-1?-1:b<<1)|0)|0;i=a;return}function Gl(b){b=b|0;var d=0,e=0;d=i;c[b>>2]=34192;e=b+8|0;b=c[e>>2]|0;if((a[34e3]|0)==0?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}if((b|0)==(c[8498]|0)){i=d;return}hb(c[e>>2]|0);i=d;return}function Hl(a){a=a|0;a=vb(8)|0;Tf(a,33984);c[a>>2]=31032;cc(a|0,31072,15)}function Il(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;e=i;i=i+16|0;f=e;c[b+4>>2]=d+ -1;c[b>>2]=34024;d=b+8|0;g=b+12|0;h=b+136|0;j=b+24|0;a[h]=1;c[g>>2]=j;c[d>>2]=j;c[b+16>>2]=h;h=28;k=j;do{if((k|0)==0){l=0}else{c[k>>2]=0;l=c[g>>2]|0}k=l+4|0;c[g>>2]=k;h=h+ -1|0}while((h|0)!=0);ng(b+144|0,34008,1);h=c[d>>2]|0;d=c[g>>2]|0;if((d|0)!=(h|0)){c[g>>2]=d+(~((d+ -4+(0-h)|0)>>>2)<<2)}c[38916>>2]=0;c[9728]=32504;if(!((c[8132]|0)==-1)){c[f>>2]=32528;c[f+4>>2]=118;c[f+8>>2]=0;kg(32528,f,119)}Jl(b,38912,(c[32532>>2]|0)+ -1|0);c[38908>>2]=0;c[9726]=32544;if(!((c[8142]|0)==-1)){c[f>>2]=32568;c[f+4>>2]=118;c[f+8>>2]=0;kg(32568,f,119)}Jl(b,38904,(c[32572>>2]|0)+ -1|0);c[38892>>2]=0;c[9722]=34120;c[38896>>2]=0;a[38900|0]=0;c[38896>>2]=c[(tb()|0)>>2];if(!((c[8526]|0)==-1)){c[f>>2]=34104;c[f+4>>2]=118;c[f+8>>2]=0;kg(34104,f,119)}Jl(b,38888,(c[34108>>2]|0)+ -1|0);c[38884>>2]=0;c[9720]=35080;if(!((c[8524]|0)==-1)){c[f>>2]=34096;c[f+4>>2]=118;c[f+8>>2]=0;kg(34096,f,119)}Jl(b,38880,(c[34100>>2]|0)+ -1|0);c[38876>>2]=0;c[9718]=35296;if(!((c[8542]|0)==-1)){c[f>>2]=34168;c[f+4>>2]=118;c[f+8>>2]=0;kg(34168,f,119)}Jl(b,38872,(c[34172>>2]|0)+ -1|0);c[38860>>2]=0;c[9714]=34192;if((a[34e3]|0)==0?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}c[38864>>2]=c[8498];if(!((c[8544]|0)==-1)){c[f>>2]=34176;c[f+4>>2]=118;c[f+8>>2]=0;kg(34176,f,119)}Jl(b,38856,(c[34180>>2]|0)+ -1|0);c[38852>>2]=0;c[9712]=35520;if(!((c[8558]|0)==-1)){c[f>>2]=34232;c[f+4>>2]=118;c[f+8>>2]=0;kg(34232,f,119)}Jl(b,38848,(c[34236>>2]|0)+ -1|0);c[38844>>2]=0;c[9710]=35640;if(!((c[8560]|0)==-1)){c[f>>2]=34240;c[f+4>>2]=118;c[f+8>>2]=0;kg(34240,f,119)}Jl(b,38840,(c[34244>>2]|0)+ -1|0);c[38820>>2]=0;c[9704]=34272;a[38824|0]=46;a[38825|0]=44;c[38828>>2]=0;c[38832>>2]=0;c[38836>>2]=0;if(!((c[8562]|0)==-1)){c[f>>2]=34248;c[f+4>>2]=118;c[f+8>>2]=0;kg(34248,f,119)}Jl(b,38816,(c[34252>>2]|0)+ -1|0);c[38788>>2]=0;c[9696]=34312;c[38792>>2]=46;c[38796>>2]=44;c[38800>>2]=0;c[38804>>2]=0;c[38808>>2]=0;if(!((c[8564]|0)==-1)){c[f>>2]=34256;c[f+4>>2]=118;c[f+8>>2]=0;kg(34256,f,119)}Jl(b,38784,(c[34260>>2]|0)+ -1|0);c[38780>>2]=0;c[9694]=32584;if(!((c[8160]|0)==-1)){c[f>>2]=32640;c[f+4>>2]=118;c[f+8>>2]=0;kg(32640,f,119)}Jl(b,38776,(c[32644>>2]|0)+ -1|0);c[38772>>2]=0;c[9692]=32704;if(!((c[8190]|0)==-1)){c[f>>2]=32760;c[f+4>>2]=118;c[f+8>>2]=0;kg(32760,f,119)}Jl(b,38768,(c[32764>>2]|0)+ -1|0);c[38764>>2]=0;c[9690]=32776;if(!((c[8206]|0)==-1)){c[f>>2]=32824;c[f+4>>2]=118;c[f+8>>2]=0;kg(32824,f,119)}Jl(b,38760,(c[32828>>2]|0)+ -1|0);c[38756>>2]=0;c[9688]=32840;if(!((c[8222]|0)==-1)){c[f>>2]=32888;c[f+4>>2]=118;c[f+8>>2]=0;kg(32888,f,119)}Jl(b,38752,(c[32892>>2]|0)+ -1|0);c[38748>>2]=0;c[9686]=33432;if(!((c[8370]|0)==-1)){c[f>>2]=33480;c[f+4>>2]=118;c[f+8>>2]=0;kg(33480,f,119)}Jl(b,38744,(c[33484>>2]|0)+ -1|0);c[38740>>2]=0;c[9684]=33496;if(!((c[8386]|0)==-1)){c[f>>2]=33544;c[f+4>>2]=118;c[f+8>>2]=0;kg(33544,f,119)}Jl(b,38736,(c[33548>>2]|0)+ -1|0);c[38732>>2]=0;c[9682]=33560;if(!((c[8402]|0)==-1)){c[f>>2]=33608;c[f+4>>2]=118;c[f+8>>2]=0;kg(33608,f,119)}Jl(b,38728,(c[33612>>2]|0)+ -1|0);c[38724>>2]=0;c[9680]=33624;if(!((c[8418]|0)==-1)){c[f>>2]=33672;c[f+4>>2]=118;c[f+8>>2]=0;kg(33672,f,119)}Jl(b,38720,(c[33676>>2]|0)+ -1|0);c[38716>>2]=0;c[9678]=33688;if(!((c[8428]|0)==-1)){c[f>>2]=33712;c[f+4>>2]=118;c[f+8>>2]=0;kg(33712,f,119)}Jl(b,38712,(c[33716>>2]|0)+ -1|0);c[38708>>2]=0;c[9676]=33768;if(!((c[8448]|0)==-1)){c[f>>2]=33792;c[f+4>>2]=118;c[f+8>>2]=0;kg(33792,f,119)}Jl(b,38704,(c[33796>>2]|0)+ -1|0);c[38700>>2]=0;c[9674]=33824;if(!((c[8462]|0)==-1)){c[f>>2]=33848;c[f+4>>2]=118;c[f+8>>2]=0;kg(33848,f,119)}Jl(b,38696,(c[33852>>2]|0)+ -1|0);c[38692>>2]=0;c[9672]=33872;if(!((c[8474]|0)==-1)){c[f>>2]=33896;c[f+4>>2]=118;c[f+8>>2]=0;kg(33896,f,119)}Jl(b,38688,(c[33900>>2]|0)+ -1|0);c[38676>>2]=0;c[9668]=32920;c[38680>>2]=32968;if(!((c[8250]|0)==-1)){c[f>>2]=33e3;c[f+4>>2]=118;c[f+8>>2]=0;kg(33e3,f,119)}Jl(b,38672,(c[33004>>2]|0)+ -1|0);c[38660>>2]=0;c[9664]=33072;c[38664>>2]=33120;if(!((c[8288]|0)==-1)){c[f>>2]=33152;c[f+4>>2]=118;c[f+8>>2]=0;kg(33152,f,119)}Jl(b,38656,(c[33156>>2]|0)+ -1|0);c[38644>>2]=0;c[9660]=35016;if((a[34e3]|0)==0?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}c[38648>>2]=c[8498];c[9660]=33368;if(!((c[8346]|0)==-1)){c[f>>2]=33384;c[f+4>>2]=118;c[f+8>>2]=0;kg(33384,f,119)}Jl(b,38640,(c[33388>>2]|0)+ -1|0);c[38628>>2]=0;c[9656]=35016;if((a[34e3]|0)==0?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}c[38632>>2]=c[8498];c[9656]=33400;if(!((c[8354]|0)==-1)){c[f>>2]=33416;c[f+4>>2]=118;c[f+8>>2]=0;kg(33416,f,119)}Jl(b,38624,(c[33420>>2]|0)+ -1|0);c[38620>>2]=0;c[9654]=33912;if(!((c[8484]|0)==-1)){c[f>>2]=33936;c[f+4>>2]=118;c[f+8>>2]=0;kg(33936,f,119)}Jl(b,38616,(c[33940>>2]|0)+ -1|0);c[38612>>2]=0;c[9652]=33952;if((c[8494]|0)==-1){m=c[33980>>2]|0;n=m+ -1|0;Jl(b,38608,n);i=e;return}c[f>>2]=33976;c[f+4>>2]=118;c[f+8>>2]=0;kg(33976,f,119);m=c[33980>>2]|0;n=m+ -1|0;Jl(b,38608,n);i=e;return}function Jl(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;e=i;Rf(b);f=a+8|0;g=a+12|0;a=c[g>>2]|0;h=c[f>>2]|0;j=a-h>>2;do{if(!(j>>>0>d>>>0)){k=d+1|0;if(j>>>0<k>>>0){On(f,k-j|0);l=c[f>>2]|0;break}if(j>>>0>k>>>0?(m=h+(k<<2)|0,(a|0)!=(m|0)):0){c[g>>2]=a+(~((a+ -4+(0-m)|0)>>>2)<<2);l=h}else{l=h}}else{l=h}}while(0);h=c[l+(d<<2)>>2]|0;if((h|0)==0){n=l;o=n+(d<<2)|0;c[o>>2]=b;i=e;return}Sf(h)|0;n=c[f>>2]|0;o=n+(d<<2)|0;c[o>>2]=b;i=e;return}function Kl(a){a=a|0;var b=0;b=i;Ll(a);Jo(a);i=b;return}function Ll(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0;d=i;c[b>>2]=34024;e=b+12|0;f=c[e>>2]|0;g=b+8|0;h=c[g>>2]|0;if((f|0)!=(h|0)){j=f;f=h;h=0;while(1){k=c[f+(h<<2)>>2]|0;if((k|0)==0){l=j;m=f}else{Sf(k)|0;l=c[e>>2]|0;m=c[g>>2]|0}h=h+1|0;if(!(h>>>0<l-m>>2>>>0)){break}else{j=l;f=m}}}pg(b+144|0);m=c[g>>2]|0;if((m|0)==0){i=d;return}g=c[e>>2]|0;if((g|0)!=(m|0)){c[e>>2]=g+(~((g+ -4+(0-m)|0)>>>2)<<2)}if((b+24|0)==(m|0)){a[b+136|0]=0;i=d;return}else{Jo(m);i=d;return}}function Ml(){var b=0,d=0,e=0;b=i;if((a[34080]|0)!=0){d=c[8518]|0;i=b;return d|0}if((Ga(34080)|0)==0){d=c[8518]|0;i=b;return d|0}if((a[34056]|0)==0?(Ga(34056)|0)!=0:0){Il(38448,1);c[8510]=38448;c[8512]=34040;bb(34056)}e=c[c[8512]>>2]|0;c[8516]=e;Rf(e);c[8518]=34064;bb(34080);d=c[8518]|0;i=b;return d|0}function Nl(a){a=a|0;var b=0,d=0;b=i;d=c[(Ml()|0)>>2]|0;c[a>>2]=d;Rf(d);i=b;return}function Ol(a,b){a=a|0;b=b|0;var d=0,e=0;d=i;e=c[b>>2]|0;c[a>>2]=e;Rf(e);i=d;return}function Pl(a){a=a|0;var b=0;b=i;Sf(c[a>>2]|0)|0;i=b;return}function Ql(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=i;i=i+16|0;e=d;f=c[a>>2]|0;if(!((c[b>>2]|0)==-1)){c[e>>2]=b;c[e+4>>2]=118;c[e+8>>2]=0;kg(b,e,119)}e=(c[b+4>>2]|0)+ -1|0;b=c[f+8>>2]|0;if(!((c[f+12>>2]|0)-b>>2>>>0>e>>>0)){g=vb(4)|0;ho(g);cc(g|0,42064,107)}f=c[b+(e<<2)>>2]|0;if((f|0)==0){g=vb(4)|0;ho(g);cc(g|0,42064,107)}else{i=d;return f|0}return 0}function Rl(a){a=a|0;var b=0;b=i;Jo(a);i=b;return}function Sl(a){a=a|0;var b=0;b=i;if((a|0)==0){i=b;return}lc[c[(c[a>>2]|0)+4>>2]&255](a);i=b;return}function Tl(a){a=a|0;var b=0;b=c[8522]|0;c[8522]=b+1;c[a+4>>2]=b+1;return}function Ul(a){a=a|0;var b=0;b=i;Jo(a);i=b;return}function Vl(a,d,e){a=a|0;d=d|0;e=e|0;var f=0;a=i;if(!(e>>>0<128)){f=0;i=a;return f|0}f=(b[(c[(tb()|0)>>2]|0)+(e<<1)>>1]&d)<<16>>16!=0;i=a;return f|0}function Wl(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0;a=i;if((d|0)==(e|0)){g=d;i=a;return g|0}else{h=d;j=f}while(1){f=c[h>>2]|0;if(f>>>0<128){k=b[(c[(tb()|0)>>2]|0)+(f<<1)>>1]|0}else{k=0}b[j>>1]=k;f=h+4|0;if((f|0)==(e|0)){g=e;break}else{h=f;j=j+2|0}}i=a;return g|0}function Xl(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0;a=i;a:do{if((e|0)==(f|0)){g=e}else{h=e;while(1){j=c[h>>2]|0;if(j>>>0<128?!((b[(c[(tb()|0)>>2]|0)+(j<<1)>>1]&d)<<16>>16==0):0){g=h;break a}j=h+4|0;if((j|0)==(f|0)){g=f;break}else{h=j}}}}while(0);i=a;return g|0}function Yl(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0;a=i;a:do{if((e|0)==(f|0)){g=e}else{h=e;while(1){j=c[h>>2]|0;if(!(j>>>0<128)){g=h;break a}k=h+4|0;if((b[(c[(tb()|0)>>2]|0)+(j<<1)>>1]&d)<<16>>16==0){g=h;break a}if((k|0)==(f|0)){g=f;break}else{h=k}}}}while(0);i=a;return g|0}function Zl(a,b){a=a|0;b=b|0;var d=0;a=i;if(!(b>>>0<128)){d=b;i=a;return d|0}d=c[(c[(Ka()|0)>>2]|0)+(b<<2)>>2]|0;i=a;return d|0}function _l(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;a=i;if((b|0)==(d|0)){e=b;i=a;return e|0}else{f=b}while(1){b=c[f>>2]|0;if(b>>>0<128){g=c[(c[(Ka()|0)>>2]|0)+(b<<2)>>2]|0}else{g=b}c[f>>2]=g;b=f+4|0;if((b|0)==(d|0)){e=d;break}else{f=b}}i=a;return e|0}function $l(a,b){a=a|0;b=b|0;var d=0;a=i;if(!(b>>>0<128)){d=b;i=a;return d|0}d=c[(c[(Yb()|0)>>2]|0)+(b<<2)>>2]|0;i=a;return d|0}function am(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;a=i;if((b|0)==(d|0)){e=b;i=a;return e|0}else{f=b}while(1){b=c[f>>2]|0;if(b>>>0<128){g=c[(c[(Yb()|0)>>2]|0)+(b<<2)>>2]|0}else{g=b}c[f>>2]=g;b=f+4|0;if((b|0)==(d|0)){e=d;break}else{f=b}}i=a;return e|0}function bm(a,b){a=a|0;b=b|0;return b<<24>>24|0}function cm(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0;b=i;if((d|0)==(e|0)){g=d;i=b;return g|0}else{h=d;j=f}while(1){c[j>>2]=a[h]|0;f=h+1|0;if((f|0)==(e|0)){g=e;break}else{h=f;j=j+4|0}}i=b;return g|0}function dm(a,b,c){a=a|0;b=b|0;c=c|0;return(b>>>0<128?b&255:c)|0}function em(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0;b=i;if((d|0)==(e|0)){h=d;i=b;return h|0}j=((e+ -4+(0-d)|0)>>>2)+1|0;k=d;l=g;while(1){g=c[k>>2]|0;a[l]=g>>>0<128?g&255:f;k=k+4|0;if((k|0)==(e|0)){break}else{l=l+1|0}}h=d+(j<<2)|0;i=b;return h|0}function fm(b){b=b|0;var d=0,e=0;d=i;c[b>>2]=34120;e=c[b+8>>2]|0;if((e|0)!=0?(a[b+12|0]|0)!=0:0){Ko(e)}Jo(b);i=d;return}function gm(b){b=b|0;var d=0,e=0;d=i;c[b>>2]=34120;e=c[b+8>>2]|0;if((e|0)!=0?(a[b+12|0]|0)!=0:0){Ko(e)}i=d;return}function hm(a,b){a=a|0;b=b|0;var d=0;a=i;if(!(b<<24>>24>-1)){d=b;i=a;return d|0}d=c[(c[(Ka()|0)>>2]|0)+((b&255)<<2)>>2]&255;i=a;return d|0}function im(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;b=i;if((d|0)==(e|0)){f=d;i=b;return f|0}else{g=d}while(1){d=a[g]|0;if(d<<24>>24>-1){h=c[(c[(Ka()|0)>>2]|0)+(d<<24>>24<<2)>>2]&255}else{h=d}a[g]=h;d=g+1|0;if((d|0)==(e|0)){f=e;break}else{g=d}}i=b;return f|0}function jm(a,b){a=a|0;b=b|0;var d=0;a=i;if(!(b<<24>>24>-1)){d=b;i=a;return d|0}d=c[(c[(Yb()|0)>>2]|0)+(b<<24>>24<<2)>>2]&255;i=a;return d|0}function km(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;b=i;if((d|0)==(e|0)){f=d;i=b;return f|0}else{g=d}while(1){d=a[g]|0;if(d<<24>>24>-1){h=c[(c[(Yb()|0)>>2]|0)+(d<<24>>24<<2)>>2]&255}else{h=d}a[g]=h;d=g+1|0;if((d|0)==(e|0)){f=e;break}else{g=d}}i=b;return f|0}function lm(a,b){a=a|0;b=b|0;return b|0}function mm(b,c,d,e){b=b|0;c=c|0;d=d|0;e=e|0;var f=0,g=0;b=i;if((c|0)==(d|0)){f=c}else{g=c;c=e;while(1){a[c]=a[g]|0;e=g+1|0;if((e|0)==(d|0)){f=d;break}else{g=e;c=c+1|0}}}i=b;return f|0}function nm(a,b,c){a=a|0;b=b|0;c=c|0;return(b<<24>>24>-1?b:c)|0}function om(b,c,d,e,f){b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0;b=i;if((c|0)==(d|0)){g=c;i=b;return g|0}else{h=c;j=f}while(1){f=a[h]|0;a[j]=f<<24>>24>-1?f:e;f=h+1|0;if((f|0)==(d|0)){g=d;break}else{h=f;j=j+1|0}}i=b;return g|0}function pm(a){a=a|0;var b=0;b=i;Jo(a);i=b;return}function qm(a,b,d,e,f,g,h,i){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;c[f>>2]=d;c[i>>2]=g;return 3}function rm(a,b,d,e,f,g,h,i){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;c[f>>2]=d;c[i>>2]=g;return 3}function sm(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[f>>2]=d;return 3}function tm(a){a=a|0;return 1}function um(a){a=a|0;return 1}function vm(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;b=d-c|0;return(b>>>0<e>>>0?b:e)|0}function wm(a){a=a|0;return 1}function xm(a){a=a|0;var b=0;b=i;Gl(a);Jo(a);i=b;return}function ym(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;l=i;i=i+16|0;m=l;n=l+8|0;o=(e|0)==(f|0);a:do{if(!o){p=e;while(1){q=p+4|0;if((c[p>>2]|0)==0){r=p;break}if((q|0)==(f|0)){r=f;break}else{p=q}}c[k>>2]=h;c[g>>2]=e;if(!(o|(h|0)==(j|0))){p=j;q=b+8|0;s=e;t=h;u=r;while(1){v=d;w=c[v+4>>2]|0;x=m;c[x>>2]=c[v>>2];c[x+4>>2]=w;w=zb(c[q>>2]|0)|0;x=$n(t,g,u-s>>2,p-t|0,d)|0;if((w|0)!=0){zb(w|0)|0}if((x|0)==0){y=1;z=33;break}else if((x|0)==-1){z=10;break}w=(c[k>>2]|0)+x|0;c[k>>2]=w;if((w|0)==(j|0)){z=31;break}if((u|0)==(f|0)){A=c[g>>2]|0;B=w;C=f}else{w=zb(c[q>>2]|0)|0;x=_n(n,0,d)|0;if((w|0)!=0){zb(w|0)|0}if((x|0)==-1){y=2;z=33;break}w=c[k>>2]|0;if(x>>>0>(p-w|0)>>>0){y=1;z=33;break}b:do{if((x|0)!=0){v=w;D=x;E=n;while(1){F=a[E]|0;c[k>>2]=v+1;a[v]=F;F=D+ -1|0;if((F|0)==0){break b}v=c[k>>2]|0;D=F;E=E+1|0}}}while(0);x=(c[g>>2]|0)+4|0;c[g>>2]=x;c:do{if((x|0)==(f|0)){G=f}else{w=x;while(1){E=w+4|0;if((c[w>>2]|0)==0){G=w;break c}if((E|0)==(f|0)){G=f;break}else{w=E}}}}while(0);A=x;B=c[k>>2]|0;C=G}if((A|0)==(f|0)|(B|0)==(j|0)){H=A;break a}else{s=A;t=B;u=C}}if((z|0)==10){c[k>>2]=t;d:do{if((s|0)==(c[g>>2]|0)){I=s}else{u=s;p=t;while(1){w=c[u>>2]|0;E=zb(c[q>>2]|0)|0;D=_n(p,w,m)|0;if((E|0)!=0){zb(E|0)|0}if((D|0)==-1){I=u;break d}E=(c[k>>2]|0)+D|0;c[k>>2]=E;D=u+4|0;if((D|0)==(c[g>>2]|0)){I=D;break}else{u=D;p=E}}}}while(0);c[g>>2]=I;y=2;i=l;return y|0}else if((z|0)==31){H=c[g>>2]|0;break}else if((z|0)==33){i=l;return y|0}}else{H=e}}else{c[k>>2]=h;c[g>>2]=e;H=e}}while(0);y=(H|0)!=(f|0)|0;i=l;return y|0}function zm(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;l=i;i=i+16|0;m=l;n=(e|0)==(f|0);a:do{if(!n){o=e;while(1){p=o+1|0;if((a[o]|0)==0){q=o;break}if((p|0)==(f|0)){q=f;break}else{o=p}}c[k>>2]=h;c[g>>2]=e;if(!(n|(h|0)==(j|0))){o=j;p=b+8|0;r=e;s=h;t=q;while(1){u=d;v=c[u+4>>2]|0;w=m;c[w>>2]=c[u>>2];c[w+4>>2]=v;x=t;v=zb(c[p>>2]|0)|0;w=Xn(s,g,x-r|0,o-s>>2,d)|0;if((v|0)!=0){zb(v|0)|0}if((w|0)==0){y=2;z=32;break}else if((w|0)==-1){z=10;break}v=(c[k>>2]|0)+(w<<2)|0;c[k>>2]=v;if((v|0)==(j|0)){z=30;break}w=c[g>>2]|0;if((t|0)==(f|0)){A=w;B=v;C=f}else{u=zb(c[p>>2]|0)|0;D=Wn(v,w,1,d)|0;if((u|0)!=0){zb(u|0)|0}if((D|0)!=0){y=2;z=32;break}c[k>>2]=(c[k>>2]|0)+4;D=(c[g>>2]|0)+1|0;c[g>>2]=D;b:do{if((D|0)==(f|0)){E=f}else{u=D;while(1){w=u+1|0;if((a[u]|0)==0){E=u;break b}if((w|0)==(f|0)){E=f;break}else{u=w}}}}while(0);A=D;B=c[k>>2]|0;C=E}if((A|0)==(f|0)|(B|0)==(j|0)){F=A;break a}else{r=A;s=B;t=C}}if((z|0)==10){c[k>>2]=s;c:do{if((r|0)!=(c[g>>2]|0)){t=r;o=s;while(1){u=zb(c[p>>2]|0)|0;w=Wn(o,t,x-t|0,m)|0;if((u|0)!=0){zb(u|0)|0}if((w|0)==-2){z=16;break}else if((w|0)==-1){z=15;break}else if((w|0)==0){G=t+1|0}else{G=t+w|0}w=(c[k>>2]|0)+4|0;c[k>>2]=w;if((G|0)==(c[g>>2]|0)){H=G;break c}else{t=G;o=w}}if((z|0)==15){c[g>>2]=t;y=2;i=l;return y|0}else if((z|0)==16){c[g>>2]=t;y=1;i=l;return y|0}}else{H=r}}while(0);c[g>>2]=H;y=(H|0)!=(f|0)|0;i=l;return y|0}else if((z|0)==30){F=c[g>>2]|0;break}else if((z|0)==32){i=l;return y|0}}else{F=e}}else{c[k>>2]=h;c[g>>2]=e;F=e}}while(0);y=(F|0)!=(f|0)|0;i=l;return y|0}function Am(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0;h=i;i=i+16|0;j=h;c[g>>2]=e;e=zb(c[b+8>>2]|0)|0;b=_n(j,0,d)|0;if((e|0)!=0){zb(e|0)|0}if((b|0)==0|(b|0)==-1){k=2;i=h;return k|0}e=b+ -1|0;b=c[g>>2]|0;if(e>>>0>(f-b|0)>>>0){k=1;i=h;return k|0}if((e|0)==0){k=0;i=h;return k|0}else{l=b;m=e;n=j}while(1){j=a[n]|0;c[g>>2]=l+1;a[l]=j;j=m+ -1|0;if((j|0)==0){k=0;break}l=c[g>>2]|0;m=j;n=n+1|0}i=h;return k|0}function Bm(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=a+8|0;a=zb(c[d>>2]|0)|0;e=Zn(0,0,4)|0;if((a|0)!=0){zb(a|0)|0}if((e|0)==0){e=c[d>>2]|0;if((e|0)!=0){d=zb(e|0)|0;if((d|0)==0){f=0}else{zb(d|0)|0;f=0}}else{f=1}}else{f=-1}i=b;return f|0}function Cm(a){a=a|0;return 0}function Dm(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;g=i;if((f|0)==0|(d|0)==(e|0)){h=0;i=g;return h|0}j=e;k=a+8|0;a=d;d=0;l=0;while(1){m=zb(c[k>>2]|0)|0;n=Vn(a,j-a|0,b)|0;if((m|0)!=0){zb(m|0)|0}if((n|0)==0){o=a+1|0;p=1}else if((n|0)==-2|(n|0)==-1){h=d;q=9;break}else{o=a+n|0;p=n}n=p+d|0;m=l+1|0;if(m>>>0>=f>>>0|(o|0)==(e|0)){h=n;q=9;break}else{a=o;d=n;l=m}}if((q|0)==9){i=g;return h|0}return 0}function Em(a){a=a|0;var b=0,d=0,e=0;b=i;d=c[a+8>>2]|0;if((d|0)!=0){a=zb(d|0)|0;if((a|0)==0){e=4}else{zb(a|0)|0;e=4}}else{e=1}i=b;return e|0}function Fm(a){a=a|0;var b=0;b=i;Jo(a);i=b;return}function Gm(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;b=i;i=i+16|0;a=b+4|0;k=b;c[a>>2]=d;c[k>>2]=g;l=Hm(d,e,a,g,h,k,1114111,0)|0;c[f>>2]=d+((c[a>>2]|0)-d>>1<<1);c[j>>2]=g+((c[k>>2]|0)-g);i=b;return l|0}function Hm(d,f,g,h,j,k,l,m){d=d|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0;n=i;c[g>>2]=d;c[k>>2]=h;do{if((m&2|0)!=0){if((j-h|0)<3){o=1;i=n;return o|0}else{c[k>>2]=h+1;a[h]=-17;d=c[k>>2]|0;c[k>>2]=d+1;a[d]=-69;d=c[k>>2]|0;c[k>>2]=d+1;a[d]=-65;break}}}while(0);h=f;m=c[g>>2]|0;if(!(m>>>0<f>>>0)){o=0;i=n;return o|0}d=j;j=m;a:while(1){m=b[j>>1]|0;p=m&65535;if(p>>>0>l>>>0){o=2;q=26;break}do{if((m&65535)<128){r=c[k>>2]|0;if((d-r|0)<1){o=1;q=26;break a}c[k>>2]=r+1;a[r]=m}else{if((m&65535)<2048){r=c[k>>2]|0;if((d-r|0)<2){o=1;q=26;break a}c[k>>2]=r+1;a[r]=p>>>6|192;r=c[k>>2]|0;c[k>>2]=r+1;a[r]=p&63|128;break}if((m&65535)<55296){r=c[k>>2]|0;if((d-r|0)<3){o=1;q=26;break a}c[k>>2]=r+1;a[r]=p>>>12|224;r=c[k>>2]|0;c[k>>2]=r+1;a[r]=p>>>6&63|128;r=c[k>>2]|0;c[k>>2]=r+1;a[r]=p&63|128;break}if(!((m&65535)<56320)){if((m&65535)<57344){o=2;q=26;break a}r=c[k>>2]|0;if((d-r|0)<3){o=1;q=26;break a}c[k>>2]=r+1;a[r]=p>>>12|224;r=c[k>>2]|0;c[k>>2]=r+1;a[r]=p>>>6&63|128;r=c[k>>2]|0;c[k>>2]=r+1;a[r]=p&63|128;break}if((h-j|0)<4){o=1;q=26;break a}r=j+2|0;s=e[r>>1]|0;if((s&64512|0)!=56320){o=2;q=26;break a}if((d-(c[k>>2]|0)|0)<4){o=1;q=26;break a}t=p&960;if(((t<<10)+65536|p<<10&64512|s&1023)>>>0>l>>>0){o=2;q=26;break a}c[g>>2]=r;r=(t>>>6)+1|0;t=c[k>>2]|0;c[k>>2]=t+1;a[t]=r>>>2|240;t=c[k>>2]|0;c[k>>2]=t+1;a[t]=p>>>2&15|r<<4&48|128;r=c[k>>2]|0;c[k>>2]=r+1;a[r]=p<<4&48|s>>>6&15|128;r=c[k>>2]|0;c[k>>2]=r+1;a[r]=s&63|128}}while(0);p=(c[g>>2]|0)+2|0;c[g>>2]=p;if(p>>>0<f>>>0){j=p}else{o=0;q=26;break}}if((q|0)==26){i=n;return o|0}return 0}function Im(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;b=i;i=i+16|0;a=b+4|0;k=b;c[a>>2]=d;c[k>>2]=g;l=Jm(d,e,a,g,h,k,1114111,0)|0;c[f>>2]=d+((c[a>>2]|0)-d);c[j>>2]=g+((c[k>>2]|0)-g>>1<<1);i=b;return l|0}function Jm(e,f,g,h,j,k,l,m){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;n=i;c[g>>2]=e;c[k>>2]=h;h=c[g>>2]|0;if(((((m&4|0)!=0?(f-h|0)>2:0)?(a[h]|0)==-17:0)?(a[h+1|0]|0)==-69:0)?(a[h+2|0]|0)==-65:0){m=h+3|0;c[g>>2]=m;o=m}else{o=h}a:do{if(o>>>0<f>>>0){h=f;m=j;e=c[k>>2]|0;p=o;b:while(1){if(!(e>>>0<j>>>0)){q=p;break a}r=a[p]|0;s=r&255;if(s>>>0>l>>>0){t=2;u=41;break}do{if(r<<24>>24>-1){b[e>>1]=r&255;c[g>>2]=p+1}else{if((r&255)<194){t=2;u=41;break b}if((r&255)<224){if((h-p|0)<2){t=1;u=41;break b}v=d[p+1|0]|0;if((v&192|0)!=128){t=2;u=41;break b}w=v&63|s<<6&1984;if(w>>>0>l>>>0){t=2;u=41;break b}b[e>>1]=w;c[g>>2]=p+2;break}if((r&255)<240){if((h-p|0)<3){t=1;u=41;break b}w=a[p+1|0]|0;v=a[p+2|0]|0;if((s|0)==237){if(!((w&-32)<<24>>24==-128)){t=2;u=41;break b}}else if((s|0)==224){if(!((w&-32)<<24>>24==-96)){t=2;u=41;break b}}else{if(!((w&-64)<<24>>24==-128)){t=2;u=41;break b}}x=v&255;if((x&192|0)!=128){t=2;u=41;break b}v=(w&255)<<6&4032|s<<12|x&63;if((v&65535)>>>0>l>>>0){t=2;u=41;break b}b[e>>1]=v;c[g>>2]=p+3;break}if(!((r&255)<245)){t=2;u=41;break b}if((h-p|0)<4){t=1;u=41;break b}v=a[p+1|0]|0;x=a[p+2|0]|0;w=a[p+3|0]|0;if((s|0)==240){if(!((v+112<<24>>24&255)<48)){t=2;u=41;break b}}else if((s|0)==244){if(!((v&-16)<<24>>24==-128)){t=2;u=41;break b}}else{if(!((v&-64)<<24>>24==-128)){t=2;u=41;break b}}y=x&255;if((y&192|0)!=128){t=2;u=41;break b}x=w&255;if((x&192|0)!=128){t=2;u=41;break b}if((m-e|0)<4){t=1;u=41;break b}w=s&7;z=v&255;v=y<<6;A=x&63;if((z<<12&258048|w<<18|v&4032|A)>>>0>l>>>0){t=2;u=41;break b}b[e>>1]=z<<2&60|y>>>4&3|((z>>>4&3|w<<2)<<6)+16320|55296;w=e+2|0;c[k>>2]=w;b[w>>1]=A|v&960|56320;c[g>>2]=(c[g>>2]|0)+4}}while(0);s=(c[k>>2]|0)+2|0;c[k>>2]=s;r=c[g>>2]|0;if(r>>>0<f>>>0){e=s;p=r}else{q=r;break a}}if((u|0)==41){i=n;return t|0}}else{q=o}}while(0);t=q>>>0<f>>>0|0;i=n;return t|0}function Km(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[f>>2]=d;return 3}function Lm(a){a=a|0;return 0}function Mm(a){a=a|0;return 0}function Nm(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;b=i;a=Om(c,d,e,1114111,0)|0;i=b;return a|0}function Om(b,c,e,f,g){b=b|0;c=c|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;h=i;if((((g&4|0)!=0?(c-b|0)>2:0)?(a[b]|0)==-17:0)?(a[b+1|0]|0)==-69:0){j=(a[b+2|0]|0)==-65?b+3|0:b}else{j=b}a:do{if(j>>>0<c>>>0&(e|0)!=0){g=c;k=j;l=0;b:while(1){m=a[k]|0;n=m&255;if(n>>>0>f>>>0){o=k;break a}do{if(m<<24>>24>-1){p=k+1|0;q=l}else{if((m&255)<194){o=k;break a}if((m&255)<224){if((g-k|0)<2){o=k;break a}r=d[k+1|0]|0;if((r&192|0)!=128){o=k;break a}if((r&63|n<<6&1984)>>>0>f>>>0){o=k;break a}p=k+2|0;q=l;break}if((m&255)<240){s=k;if((g-s|0)<3){o=k;break a}r=a[k+1|0]|0;t=a[k+2|0]|0;if((n|0)==224){if(!((r&-32)<<24>>24==-96)){u=21;break b}}else if((n|0)==237){if(!((r&-32)<<24>>24==-128)){u=23;break b}}else{if(!((r&-64)<<24>>24==-128)){u=25;break b}}v=t&255;if((v&192|0)!=128){o=k;break a}if(((r&255)<<6&4032|n<<12&61440|v&63)>>>0>f>>>0){o=k;break a}p=k+3|0;q=l;break}if(!((m&255)<245)){o=k;break a}w=k;if((g-w|0)<4){o=k;break a}if((e-l|0)>>>0<2){o=k;break a}v=a[k+1|0]|0;r=a[k+2|0]|0;t=a[k+3|0]|0;if((n|0)==240){if(!((v+112<<24>>24&255)<48)){u=34;break b}}else if((n|0)==244){if(!((v&-16)<<24>>24==-128)){u=36;break b}}else{if(!((v&-64)<<24>>24==-128)){u=38;break b}}x=r&255;if((x&192|0)!=128){o=k;break a}r=t&255;if((r&192|0)!=128){o=k;break a}if(((v&255)<<12&258048|n<<18&1835008|x<<6&4032|r&63)>>>0>f>>>0){o=k;break a}p=k+4|0;q=l+1|0}}while(0);n=q+1|0;if(p>>>0<c>>>0&n>>>0<e>>>0){k=p;l=n}else{o=p;break a}}if((u|0)==21){y=s-b|0;i=h;return y|0}else if((u|0)==23){y=s-b|0;i=h;return y|0}else if((u|0)==25){y=s-b|0;i=h;return y|0}else if((u|0)==34){y=w-b|0;i=h;return y|0}else if((u|0)==36){y=w-b|0;i=h;return y|0}else if((u|0)==38){y=w-b|0;i=h;return y|0}}else{o=j}}while(0);y=o-b|0;i=h;return y|0}function Pm(a){a=a|0;return 4}function Qm(a){a=a|0;var b=0;b=i;Jo(a);i=b;return}function Rm(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;b=i;i=i+16|0;a=b+4|0;k=b;c[a>>2]=d;c[k>>2]=g;l=Sm(d,e,a,g,h,k,1114111,0)|0;c[f>>2]=d+((c[a>>2]|0)-d>>2<<2);c[j>>2]=g+((c[k>>2]|0)-g);i=b;return l|0}function Sm(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0;l=i;c[e>>2]=b;c[h>>2]=f;do{if((k&2|0)!=0){if((g-f|0)<3){m=1;i=l;return m|0}else{c[h>>2]=f+1;a[f]=-17;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=-69;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=-65;break}}}while(0);f=c[e>>2]|0;if(!(f>>>0<d>>>0)){m=0;i=l;return m|0}k=g;g=f;a:while(1){f=c[g>>2]|0;if((f&-2048|0)==55296|f>>>0>j>>>0){m=2;n=19;break}do{if(!(f>>>0<128)){if(f>>>0<2048){b=c[h>>2]|0;if((k-b|0)<2){m=1;n=19;break a}c[h>>2]=b+1;a[b]=f>>>6|192;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=f&63|128;break}b=c[h>>2]|0;o=k-b|0;if(f>>>0<65536){if((o|0)<3){m=1;n=19;break a}c[h>>2]=b+1;a[b]=f>>>12|224;p=c[h>>2]|0;c[h>>2]=p+1;a[p]=f>>>6&63|128;p=c[h>>2]|0;c[h>>2]=p+1;a[p]=f&63|128;break}else{if((o|0)<4){m=1;n=19;break a}c[h>>2]=b+1;a[b]=f>>>18|240;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=f>>>12&63|128;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=f>>>6&63|128;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=f&63|128;break}}else{b=c[h>>2]|0;if((k-b|0)<1){m=1;n=19;break a}c[h>>2]=b+1;a[b]=f}}while(0);f=(c[e>>2]|0)+4|0;c[e>>2]=f;if(f>>>0<d>>>0){g=f}else{m=0;n=19;break}}if((n|0)==19){i=l;return m|0}return 0}function Tm(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;b=i;i=i+16|0;a=b+4|0;k=b;c[a>>2]=d;c[k>>2]=g;l=Um(d,e,a,g,h,k,1114111,0)|0;c[f>>2]=d+((c[a>>2]|0)-d);c[j>>2]=g+((c[k>>2]|0)-g>>2<<2);i=b;return l|0}function Um(b,e,f,g,h,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;m=i;c[f>>2]=b;c[j>>2]=g;g=c[f>>2]|0;if(((((l&4|0)!=0?(e-g|0)>2:0)?(a[g]|0)==-17:0)?(a[g+1|0]|0)==-69:0)?(a[g+2|0]|0)==-65:0){l=g+3|0;c[f>>2]=l;n=l}else{n=g}a:do{if(n>>>0<e>>>0){g=e;l=c[j>>2]|0;b=n;while(1){if(!(l>>>0<h>>>0)){o=b;p=39;break a}q=a[b]|0;r=q&255;do{if(q<<24>>24>-1){if(r>>>0>k>>>0){s=2;break a}c[l>>2]=r;c[f>>2]=b+1}else{if((q&255)<194){s=2;break a}if((q&255)<224){if((g-b|0)<2){s=1;break a}t=d[b+1|0]|0;if((t&192|0)!=128){s=2;break a}u=t&63|r<<6&1984;if(u>>>0>k>>>0){s=2;break a}c[l>>2]=u;c[f>>2]=b+2;break}if((q&255)<240){if((g-b|0)<3){s=1;break a}u=a[b+1|0]|0;t=a[b+2|0]|0;if((r|0)==224){if(!((u&-32)<<24>>24==-96)){s=2;break a}}else if((r|0)==237){if(!((u&-32)<<24>>24==-128)){s=2;break a}}else{if(!((u&-64)<<24>>24==-128)){s=2;break a}}v=t&255;if((v&192|0)!=128){s=2;break a}t=(u&255)<<6&4032|r<<12&61440|v&63;if(t>>>0>k>>>0){s=2;break a}c[l>>2]=t;c[f>>2]=b+3;break}if(!((q&255)<245)){s=2;break a}if((g-b|0)<4){s=1;break a}t=a[b+1|0]|0;v=a[b+2|0]|0;u=a[b+3|0]|0;if((r|0)==240){if(!((t+112<<24>>24&255)<48)){s=2;break a}}else if((r|0)==244){if(!((t&-16)<<24>>24==-128)){s=2;break a}}else{if(!((t&-64)<<24>>24==-128)){s=2;break a}}w=v&255;if((w&192|0)!=128){s=2;break a}v=u&255;if((v&192|0)!=128){s=2;break a}u=(t&255)<<12&258048|r<<18&1835008|w<<6&4032|v&63;if(u>>>0>k>>>0){s=2;break a}c[l>>2]=u;c[f>>2]=b+4}}while(0);r=(c[j>>2]|0)+4|0;c[j>>2]=r;q=c[f>>2]|0;if(q>>>0<e>>>0){l=r;b=q}else{o=q;p=39;break}}}else{o=n;p=39}}while(0);if((p|0)==39){s=o>>>0<e>>>0|0}i=m;return s|0}function Vm(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[f>>2]=d;return 3}function Wm(a){a=a|0;return 0}function Xm(a){a=a|0;return 0}function Ym(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;b=i;a=Zm(c,d,e,1114111,0)|0;i=b;return a|0}function Zm(b,c,e,f,g){b=b|0;c=c|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;h=i;if((((g&4|0)!=0?(c-b|0)>2:0)?(a[b]|0)==-17:0)?(a[b+1|0]|0)==-69:0){j=(a[b+2|0]|0)==-65?b+3|0:b}else{j=b}a:do{if(j>>>0<c>>>0&(e|0)!=0){g=c;k=j;l=1;b:while(1){m=a[k]|0;n=m&255;do{if(m<<24>>24>-1){if(n>>>0>f>>>0){o=k;break a}p=k+1|0}else{if((m&255)<194){o=k;break a}if((m&255)<224){if((g-k|0)<2){o=k;break a}q=d[k+1|0]|0;if((q&192|0)!=128){o=k;break a}if((q&63|n<<6&1984)>>>0>f>>>0){o=k;break a}p=k+2|0;break}if((m&255)<240){r=k;if((g-r|0)<3){o=k;break a}q=a[k+1|0]|0;s=a[k+2|0]|0;if((n|0)==224){if(!((q&-32)<<24>>24==-96)){t=21;break b}}else if((n|0)==237){if(!((q&-32)<<24>>24==-128)){t=23;break b}}else{if(!((q&-64)<<24>>24==-128)){t=25;break b}}u=s&255;if((u&192|0)!=128){o=k;break a}if(((q&255)<<6&4032|n<<12&61440|u&63)>>>0>f>>>0){o=k;break a}p=k+3|0;break}if(!((m&255)<245)){o=k;break a}v=k;if((g-v|0)<4){o=k;break a}u=a[k+1|0]|0;q=a[k+2|0]|0;s=a[k+3|0]|0;if((n|0)==244){if(!((u&-16)<<24>>24==-128)){t=35;break b}}else if((n|0)==240){if(!((u+112<<24>>24&255)<48)){t=33;break b}}else{if(!((u&-64)<<24>>24==-128)){t=37;break b}}w=q&255;if((w&192|0)!=128){o=k;break a}q=s&255;if((q&192|0)!=128){o=k;break a}if(((u&255)<<12&258048|n<<18&1835008|w<<6&4032|q&63)>>>0>f>>>0){o=k;break a}p=k+4|0}}while(0);if(!(p>>>0<c>>>0&l>>>0<e>>>0)){o=p;break a}k=p;l=l+1|0}if((t|0)==21){x=r-b|0;i=h;return x|0}else if((t|0)==23){x=r-b|0;i=h;return x|0}else if((t|0)==25){x=r-b|0;i=h;return x|0}else if((t|0)==33){x=v-b|0;i=h;return x|0}else if((t|0)==35){x=v-b|0;i=h;return x|0}else if((t|0)==37){x=v-b|0;i=h;return x|0}}else{o=j}}while(0);x=o-b|0;i=h;return x|0}function _m(a){a=a|0;return 4}function $m(a){a=a|0;var b=0;b=i;Jo(a);i=b;return}function an(a){a=a|0;var b=0;b=i;Jo(a);i=b;return}function bn(a){a=a|0;var b=0;b=i;c[a>>2]=34272;pg(a+12|0);Jo(a);i=b;return}function cn(a){a=a|0;var b=0;b=i;c[a>>2]=34272;pg(a+12|0);i=b;return}function dn(a){a=a|0;var b=0;b=i;c[a>>2]=34312;pg(a+16|0);Jo(a);i=b;return}function en(a){a=a|0;var b=0;b=i;c[a>>2]=34312;pg(a+16|0);i=b;return}function fn(b){b=b|0;return a[b+8|0]|0}function gn(a){a=a|0;return c[a+8>>2]|0}function hn(b){b=b|0;return a[b+9|0]|0}function jn(a){a=a|0;return c[a+12>>2]|0}function kn(a,b){a=a|0;b=b|0;var c=0;c=i;mg(a,b+12|0);i=c;return}function ln(a,b){a=a|0;b=b|0;var c=0;c=i;mg(a,b+16|0);i=c;return}function mn(a,b){a=a|0;b=b|0;b=i;ng(a,34344,4);i=b;return}function nn(a,b){a=a|0;b=b|0;b=i;yg(a,34352,bo(34352)|0);i=b;return}function on(a,b){a=a|0;b=b|0;b=i;ng(a,34376,5);i=b;return}function pn(a,b){a=a|0;b=b|0;b=i;yg(a,34384,bo(34384)|0);i=b;return}function qn(b){b=b|0;var d=0;b=i;if((a[34416]|0)!=0){d=c[8602]|0;i=b;return d|0}if((Ga(34416)|0)==0){d=c[8602]|0;i=b;return d|0}if((a[41616]|0)==0?(Ga(41616)|0)!=0:0){fp(41448,0,168)|0;gc(122,0,q|0)|0;bb(41616)}qg(41448,41624)|0;qg(41460|0,41632)|0;qg(41472|0,41640)|0;qg(41484|0,41648)|0;qg(41496|0,41664)|0;qg(41508|0,41680)|0;qg(41520|0,41688)|0;qg(41532|0,41704)|0;qg(41544|0,41712)|0;qg(41556|0,41720)|0;qg(41568|0,41728)|0;qg(41580|0,41736)|0;qg(41592|0,41744)|0;qg(41604|0,41752)|0;c[8602]=41448;bb(34416);d=c[8602]|0;i=b;return d|0}function rn(b){b=b|0;var d=0;b=i;if((a[34432]|0)!=0){d=c[8606]|0;i=b;return d|0}if((Ga(34432)|0)==0){d=c[8606]|0;i=b;return d|0}if((a[41080]|0)==0?(Ga(41080)|0)!=0:0){fp(40912,0,168)|0;gc(123,0,q|0)|0;bb(41080)}Bg(40912,41088)|0;Bg(40924|0,41120)|0;Bg(40936|0,41152)|0;Bg(40948|0,41184)|0;Bg(40960|0,41224)|0;Bg(40972|0,41264)|0;Bg(40984|0,41296)|0;Bg(40996|0,41336)|0;Bg(41008|0,41352)|0;Bg(41020|0,41368)|0;Bg(41032|0,41384)|0;Bg(41044|0,41400)|0;Bg(41056|0,41416)|0;Bg(41068|0,41432)|0;c[8606]=40912;bb(34432);d=c[8606]|0;i=b;return d|0}function sn(b){b=b|0;var d=0;b=i;if((a[34448]|0)!=0){d=c[8610]|0;i=b;return d|0}if((Ga(34448)|0)==0){d=c[8610]|0;i=b;return d|0}if((a[40688]|0)==0?(Ga(40688)|0)!=0:0){fp(40400,0,288)|0;gc(124,0,q|0)|0;bb(40688)}qg(40400,40696)|0;qg(40412|0,40704)|0;qg(40424|0,40720)|0;qg(40436|0,40728)|0;qg(40448|0,40736)|0;qg(40460|0,40744)|0;qg(40472|0,40752)|0;qg(40484|0,40760)|0;qg(40496|0,40768)|0;qg(40508|0,40784)|0;qg(40520|0,40792)|0;qg(40532|0,40808)|0;qg(40544|0,40824)|0;qg(40556|0,40832)|0;qg(40568|0,40840)|0;qg(40580|0,40848)|0;qg(40592|0,40736)|0;qg(40604|0,40856)|0;qg(40616|0,40864)|0;qg(40628|0,40872)|0;qg(40640|0,40880)|0;qg(40652|0,40888)|0;qg(40664|0,40896)|0;qg(40676|0,40904)|0;c[8610]=40400;bb(34448);d=c[8610]|0;i=b;return d|0}function tn(b){b=b|0;var d=0;b=i;if((a[34464]|0)!=0){d=c[8614]|0;i=b;return d|0}if((Ga(34464)|0)==0){d=c[8614]|0;i=b;return d|0}if((a[39848]|0)==0?(Ga(39848)|0)!=0:0){fp(39560,0,288)|0;gc(125,0,q|0)|0;bb(39848)}Bg(39560,39856)|0;Bg(39572|0,39888)|0;Bg(39584|0,39928)|0;Bg(39596|0,39952)|0;Bg(39608|0,40272)|0;Bg(39620|0,39976)|0;Bg(39632|0,4e4)|0;Bg(39644|0,40024)|0;Bg(39656|0,40056)|0;Bg(39668|0,40096)|0;Bg(39680|0,40128)|0;Bg(39692|0,40168)|0;Bg(39704|0,40208)|0;Bg(39716|0,40224)|0;Bg(39728|0,40240)|0;Bg(39740|0,40256)|0;Bg(39752|0,40272)|0;Bg(39764|0,40288)|0;Bg(39776|0,40304)|0;Bg(39788|0,40320)|0;Bg(39800|0,40336)|0;Bg(39812|0,40352)|0;Bg(39824|0,40368)|0;Bg(39836|0,40384)|0;c[8614]=39560;bb(34464);d=c[8614]|0;i=b;return d|0}function un(b){b=b|0;var d=0;b=i;if((a[34480]|0)!=0){d=c[8618]|0;i=b;return d|0}if((Ga(34480)|0)==0){d=c[8618]|0;i=b;return d|0}if((a[39536]|0)==0?(Ga(39536)|0)!=0:0){fp(39248,0,288)|0;gc(126,0,q|0)|0;bb(39536)}qg(39248,39544)|0;qg(39260|0,39552)|0;c[8618]=39248;bb(34480);d=c[8618]|0;i=b;return d|0}function vn(b){b=b|0;var d=0;b=i;if((a[34496]|0)!=0){d=c[8622]|0;i=b;return d|0}if((Ga(34496)|0)==0){d=c[8622]|0;i=b;return d|0}if((a[39208]|0)==0?(Ga(39208)|0)!=0:0){fp(38920,0,288)|0;gc(127,0,q|0)|0;bb(39208)}Bg(38920,39216)|0;Bg(38932|0,39232)|0;c[8622]=38920;bb(34496);d=c[8622]|0;i=b;return d|0}function wn(b){b=b|0;b=i;if((a[34520]|0)==0?(Ga(34520)|0)!=0:0){ng(34504,34528,8);gc(128,34504,q|0)|0;bb(34520)}i=b;return 34504}function xn(b){b=b|0;b=i;if((a[34560]|0)!=0){i=b;return 34544}if((Ga(34560)|0)==0){i=b;return 34544}yg(34544,34568,bo(34568)|0);gc(129,34544,q|0)|0;bb(34560);i=b;return 34544}function yn(b){b=b|0;b=i;if((a[34624]|0)==0?(Ga(34624)|0)!=0:0){ng(34608,34632,8);gc(128,34608,q|0)|0;bb(34624)}i=b;return 34608}function zn(b){b=b|0;b=i;if((a[34664]|0)!=0){i=b;return 34648}if((Ga(34664)|0)==0){i=b;return 34648}yg(34648,34672,bo(34672)|0);gc(129,34648,q|0)|0;bb(34664);i=b;return 34648}function An(b){b=b|0;b=i;if((a[34728]|0)==0?(Ga(34728)|0)!=0:0){ng(34712,34736,20);gc(128,34712,q|0)|0;bb(34728)}i=b;return 34712}function Bn(b){b=b|0;b=i;if((a[34776]|0)!=0){i=b;return 34760}if((Ga(34776)|0)==0){i=b;return 34760}yg(34760,34784,bo(34784)|0);gc(129,34760,q|0)|0;bb(34776);i=b;return 34760}function Cn(b){b=b|0;b=i;if((a[34888]|0)==0?(Ga(34888)|0)!=0:0){ng(34872,34896,11);gc(128,34872,q|0)|0;bb(34888)}i=b;return 34872}function Dn(b){b=b|0;b=i;if((a[34928]|0)!=0){i=b;return 34912}if((Ga(34928)|0)==0){i=b;return 34912}yg(34912,34936,bo(34936)|0);gc(129,34912,q|0)|0;bb(34928);i=b;return 34912}function En(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0.0,j=0,k=0,l=0.0;f=i;i=i+16|0;g=f;if((b|0)==(d|0)){c[e>>2]=4;h=0.0;i=f;return+h}j=ac()|0;k=c[j>>2]|0;c[j>>2]=0;if((a[34e3]|0)==0?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}l=+Xo(b,g,c[8498]|0);b=c[j>>2]|0;if((b|0)==0){c[j>>2]=k}if((c[g>>2]|0)!=(d|0)){c[e>>2]=4;h=0.0;i=f;return+h}if((b|0)!=34){h=l;i=f;return+h}c[e>>2]=4;h=l;i=f;return+h}function Fn(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0.0,j=0,k=0,l=0.0;f=i;i=i+16|0;g=f;if((b|0)==(d|0)){c[e>>2]=4;h=0.0;i=f;return+h}j=ac()|0;k=c[j>>2]|0;c[j>>2]=0;if((a[34e3]|0)==0?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}l=+Xo(b,g,c[8498]|0);b=c[j>>2]|0;if((b|0)==0){c[j>>2]=k}if((c[g>>2]|0)!=(d|0)){c[e>>2]=4;h=0.0;i=f;return+h}if((b|0)!=34){h=l;i=f;return+h}c[e>>2]=4;h=l;i=f;return+h}function Gn(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0.0,j=0,k=0,l=0.0;f=i;i=i+16|0;g=f;if((b|0)==(d|0)){c[e>>2]=4;h=0.0;i=f;return+h}j=ac()|0;k=c[j>>2]|0;c[j>>2]=0;if((a[34e3]|0)==0?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}l=+Xo(b,g,c[8498]|0);b=c[j>>2]|0;if((b|0)==0){c[j>>2]=k}if((c[g>>2]|0)!=(d|0)){c[e>>2]=4;h=0.0;i=f;return+h}if((b|0)==34){c[e>>2]=4}h=l;i=f;return+h}function Hn(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;g=i;i=i+16|0;h=g;do{if((b|0)!=(d|0)){if((a[b]|0)==45){c[e>>2]=4;j=0;k=0;break}l=ac()|0;m=c[l>>2]|0;c[l>>2]=0;if((a[34e3]|0)==0?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}n=mb(b|0,h|0,f|0,c[8498]|0)|0;o=c[l>>2]|0;if((o|0)==0){c[l>>2]=m}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;k=0;break}if((o|0)==34){c[e>>2]=4;j=-1;k=-1}else{j=J;k=n}}else{c[e>>2]=4;j=0;k=0}}while(0);J=j;i=g;return k|0}function In(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;i=i+16|0;h=g;if((b|0)==(d|0)){c[e>>2]=4;j=0;i=g;return j|0}if((a[b]|0)==45){c[e>>2]=4;j=0;i=g;return j|0}k=ac()|0;l=c[k>>2]|0;c[k>>2]=0;if((a[34e3]|0)==0?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}m=mb(b|0,h|0,f|0,c[8498]|0)|0;f=J;b=c[k>>2]|0;if((b|0)==0){c[k>>2]=l}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;i=g;return j|0}if((b|0)==34|(f>>>0>0|(f|0)==0&m>>>0>4294967295)){c[e>>2]=4;j=-1;i=g;return j|0}else{j=m;i=g;return j|0}return 0}function Jn(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;i=i+16|0;h=g;if((b|0)==(d|0)){c[e>>2]=4;j=0;i=g;return j|0}if((a[b]|0)==45){c[e>>2]=4;j=0;i=g;return j|0}k=ac()|0;l=c[k>>2]|0;c[k>>2]=0;if((a[34e3]|0)==0?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}m=mb(b|0,h|0,f|0,c[8498]|0)|0;f=J;b=c[k>>2]|0;if((b|0)==0){c[k>>2]=l}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;i=g;return j|0}if((b|0)==34|(f>>>0>0|(f|0)==0&m>>>0>4294967295)){c[e>>2]=4;j=-1;i=g;return j|0}else{j=m;i=g;return j|0}return 0}function Kn(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;i=i+16|0;h=g;if((b|0)==(d|0)){c[e>>2]=4;j=0;i=g;return j|0}if((a[b]|0)==45){c[e>>2]=4;j=0;i=g;return j|0}k=ac()|0;l=c[k>>2]|0;c[k>>2]=0;if((a[34e3]|0)==0?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}m=mb(b|0,h|0,f|0,c[8498]|0)|0;f=J;b=c[k>>2]|0;if((b|0)==0){c[k>>2]=l}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;i=g;return j|0}if((b|0)==34|(f>>>0>0|(f|0)==0&m>>>0>65535)){c[e>>2]=4;j=-1;i=g;return j|0}else{j=m&65535;i=g;return j|0}return 0}function Ln(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;g=i;i=i+16|0;h=g;if((b|0)==(d|0)){c[e>>2]=4;j=0;k=0;J=j;i=g;return k|0}l=ac()|0;m=c[l>>2]|0;c[l>>2]=0;if((a[34e3]|0)==0?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}n=Wb(b|0,h|0,f|0,c[8498]|0)|0;f=J;b=c[l>>2]|0;if((b|0)==0){c[l>>2]=m}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;k=0;J=j;i=g;return k|0}if((b|0)==34){c[e>>2]=4;e=(f|0)>0|(f|0)==0&n>>>0>0;J=e?2147483647:-2147483648;i=g;return(e?-1:0)|0}else{j=f;k=n;J=j;i=g;return k|0}return 0}function Mn(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;i=i+16|0;h=g;if((b|0)==(d|0)){c[e>>2]=4;j=0;i=g;return j|0}k=ac()|0;l=c[k>>2]|0;c[k>>2]=0;if((a[34e3]|0)==0?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}m=Wb(b|0,h|0,f|0,c[8498]|0)|0;f=J;b=c[k>>2]|0;if((b|0)==0){c[k>>2]=l}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;j=0;i=g;return j|0}do{if((b|0)==34){c[e>>2]=4;if((f|0)>0|(f|0)==0&m>>>0>0){j=2147483647;i=g;return j|0}}else{if((f|0)<-1|(f|0)==-1&m>>>0<2147483648){c[e>>2]=4;break}if((f|0)>0|(f|0)==0&m>>>0>2147483647){c[e>>2]=4;j=2147483647;i=g;return j|0}else{j=m;i=g;return j|0}}}while(0);j=-2147483648;i=g;return j|0}function Nn(a){a=a|0;var b=0,e=0,f=0,g=0,h=0;b=i;e=a+4|0;f=d[e]|d[e+1|0]<<8|d[e+2|0]<<16|d[e+3|0]<<24;g=e+4|0;e=d[g]|d[g+1|0]<<8|d[g+2|0]<<16|d[g+3|0]<<24;g=(c[a>>2]|0)+(e>>1)|0;if((e&1|0)==0){h=f;lc[h&255](g);i=b;return}else{h=c[(c[g>>2]|0)+f>>2]|0;lc[h&255](g);i=b;return}}function On(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;e=i;f=b+8|0;g=b+4|0;h=c[g>>2]|0;j=c[f>>2]|0;k=h;if(!(j-k>>2>>>0<d>>>0)){l=d;m=h;do{if((m|0)==0){n=0}else{c[m>>2]=0;n=c[g>>2]|0}m=n+4|0;c[g>>2]=m;l=l+ -1|0}while((l|0)!=0);i=e;return}l=b+16|0;m=c[b>>2]|0;n=k-m>>2;k=n+d|0;if(k>>>0>1073741823){Hl(0)}h=j-m|0;if(h>>2>>>0<536870911){m=h>>1;h=m>>>0<k>>>0?k:m;if((h|0)!=0){m=b+128|0;if((a[m]|0)==0&h>>>0<29){a[m]=1;o=h;p=l}else{q=h;r=11}}else{o=0;p=0}}else{q=1073741823;r=11}if((r|0)==11){o=q;p=Ho(q<<2)|0}q=d;d=p+(n<<2)|0;do{if((d|0)==0){s=0}else{c[d>>2]=0;s=d}d=s+4|0;q=q+ -1|0}while((q|0)!=0);q=c[b>>2]|0;s=(c[g>>2]|0)-q|0;r=p+(n-(s>>2)<<2)|0;dp(r|0,q|0,s|0)|0;c[b>>2]=r;c[g>>2]=d;c[f>>2]=p+(o<<2);if((q|0)==0){i=e;return}if((l|0)==(q|0)){a[b+128|0]=0;i=e;return}else{Jo(q);i=e;return}}function Pn(a){a=a|0;a=i;Ag(39196|0);Ag(39184|0);Ag(39172|0);Ag(39160|0);Ag(39148|0);Ag(39136|0);Ag(39124|0);Ag(39112|0);Ag(39100|0);Ag(39088|0);Ag(39076|0);Ag(39064|0);Ag(39052|0);Ag(39040|0);Ag(39028|0);Ag(39016|0);Ag(39004|0);Ag(38992|0);Ag(38980|0);Ag(38968|0);Ag(38956|0);Ag(38944|0);Ag(38932|0);Ag(38920);i=a;return}function Qn(a){a=a|0;a=i;pg(39524|0);pg(39512|0);pg(39500|0);pg(39488|0);pg(39476|0);pg(39464|0);pg(39452|0);pg(39440|0);pg(39428|0);pg(39416|0);pg(39404|0);pg(39392|0);pg(39380|0);pg(39368|0);pg(39356|0);pg(39344|0);pg(39332|0);pg(39320|0);pg(39308|0);pg(39296|0);pg(39284|0);pg(39272|0);pg(39260|0);pg(39248);i=a;return}function Rn(a){a=a|0;a=i;Ag(39836|0);Ag(39824|0);Ag(39812|0);Ag(39800|0);Ag(39788|0);Ag(39776|0);Ag(39764|0);Ag(39752|0);Ag(39740|0);Ag(39728|0);Ag(39716|0);Ag(39704|0);Ag(39692|0);Ag(39680|0);Ag(39668|0);Ag(39656|0);Ag(39644|0);Ag(39632|0);Ag(39620|0);Ag(39608|0);Ag(39596|0);Ag(39584|0);Ag(39572|0);Ag(39560);i=a;return}function Sn(a){a=a|0;a=i;pg(40676|0);pg(40664|0);pg(40652|0);pg(40640|0);pg(40628|0);pg(40616|0);pg(40604|0);pg(40592|0);pg(40580|0);pg(40568|0);pg(40556|0);pg(40544|0);pg(40532|0);pg(40520|0);pg(40508|0);pg(40496|0);pg(40484|0);pg(40472|0);pg(40460|0);pg(40448|0);pg(40436|0);pg(40424|0);pg(40412|0);pg(40400);i=a;return}function Tn(a){a=a|0;a=i;Ag(41068|0);Ag(41056|0);Ag(41044|0);Ag(41032|0);Ag(41020|0);Ag(41008|0);Ag(40996|0);Ag(40984|0);Ag(40972|0);Ag(40960|0);Ag(40948|0);Ag(40936|0);Ag(40924|0);Ag(40912);i=a;return}function Un(a){a=a|0;a=i;pg(41604|0);pg(41592|0);pg(41580|0);pg(41568|0);pg(41556|0);pg(41544|0);pg(41532|0);pg(41520|0);pg(41508|0);pg(41496|0);pg(41484|0);pg(41472|0);pg(41460|0);pg(41448);i=a;return}function Vn(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0;d=i;e=Wn(0,a,b,(c|0)!=0?c:41968)|0;i=d;return e|0}function Wn(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;g=i;i=i+16|0;h=g;c[h>>2]=b;j=(f|0)==0?41976:f;f=c[j>>2]|0;a:do{if((d|0)==0){if((f|0)==0){k=0;i=g;return k|0}}else{if((b|0)==0){c[h>>2]=h;l=h}else{l=b}if((e|0)==0){k=-2;i=g;return k|0}do{if((f|0)==0){m=a[d]|0;n=m&255;if(m<<24>>24>-1){c[l>>2]=n;k=m<<24>>24!=0|0;i=g;return k|0}else{m=n+ -194|0;if(m>>>0>50){break a}o=e+ -1|0;p=c[41760+(m<<2)>>2]|0;q=d+1|0;break}}else{o=e;p=f;q=d}}while(0);b:do{if((o|0)==0){r=p}else{m=a[q]|0;n=(m&255)>>>3;if((n+ -16|n+(p>>26))>>>0>7){break a}else{s=o;t=m;u=p;v=q}while(1){v=v+1|0;u=(t&255)+ -128|u<<6;s=s+ -1|0;if((u|0)>=0){break}if((s|0)==0){r=u;break b}t=a[v]|0;if(((t&255)+ -128|0)>>>0>63){break a}}c[j>>2]=0;c[l>>2]=u;k=e-s|0;i=g;return k|0}}while(0);c[j>>2]=r;k=-2;i=g;return k|0}}while(0);c[j>>2]=0;c[(ac()|0)>>2]=84;k=-1;i=g;return k|0}function Xn(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;g=i;i=i+1040|0;h=g+8|0;j=g;k=c[b>>2]|0;c[j>>2]=k;l=(a|0)!=0;m=l?e:256;e=l?a:h;a:do{if((k|0)==0|(m|0)==0){n=d;o=m;p=k;q=0;r=e}else{a=d;s=m;t=k;u=0;v=e;while(1){w=a>>>2;x=w>>>0>=s>>>0;if(!(x|a>>>0>131)){n=a;o=s;p=t;q=u;r=v;break a}y=x?s:w;z=a-y|0;w=Yn(v,j,y,f)|0;if((w|0)==-1){break}if((v|0)==(h|0)){A=s;B=h}else{A=s-w|0;B=v+(w<<2)|0}y=w+u|0;w=c[j>>2]|0;if((w|0)==0|(A|0)==0){n=z;o=A;p=w;q=y;r=B;break a}else{a=z;s=A;t=w;u=y;v=B}}n=z;o=0;p=c[j>>2]|0;q=-1;r=v}}while(0);b:do{if((p|0)!=0?!((o|0)==0|(n|0)==0):0){z=n;B=o;A=p;h=q;e=r;while(1){C=Wn(e,A,z,f)|0;if((C+2|0)>>>0<3){break}k=(c[j>>2]|0)+C|0;c[j>>2]=k;m=B+ -1|0;d=h+1|0;if((m|0)==0|(z|0)==(C|0)){D=d;break b}else{z=z-C|0;B=m;A=k;h=d;e=e+4|0}}if((C|0)==-1){D=-1;break}else if((C|0)==0){c[j>>2]=0;D=h;break}else{c[f>>2]=0;D=h;break}}else{D=q}}while(0);if(!l){i=g;return D|0}c[b>>2]=c[j>>2];i=g;return D|0}function Yn(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0;h=i;j=c[e>>2]|0;if((g|0)!=0?(k=c[g>>2]|0,(k|0)!=0):0){if((b|0)==0){l=f;m=k;n=j;o=16}else{c[g>>2]=0;p=b;q=f;r=k;s=j;o=36}}else{if((b|0)==0){t=f;u=j;o=7}else{v=b;w=f;x=j;o=6}}a:while(1){if((o|0)==6){o=0;if((w|0)==0){y=f;o=53;break}else{z=v;A=w;B=x}while(1){j=a[B]|0;do{if(((j&255)+ -1|0)>>>0<127?(B&3|0)==0&A>>>0>3:0){k=z;g=A;C=B;while(1){D=c[C>>2]|0;if(((D+ -16843009|D)&-2139062144|0)!=0){o=30;break}c[k>>2]=D&255;c[k+4>>2]=d[C+1|0]|0;c[k+8>>2]=d[C+2|0]|0;E=C+4|0;F=k+16|0;c[k+12>>2]=d[C+3|0]|0;G=g+ -4|0;if(G>>>0>3){k=F;g=G;C=E}else{o=31;break}}if((o|0)==30){o=0;H=k;I=g;J=D&255;K=C;break}else if((o|0)==31){o=0;H=F;I=G;J=a[E]|0;K=E;break}}else{H=z;I=A;J=j;K=B}}while(0);L=J&255;if(!((L+ -1|0)>>>0<127)){break}c[H>>2]=L;j=I+ -1|0;if((j|0)==0){y=f;o=53;break a}else{z=H+4|0;A=j;B=K+1|0}}j=L+ -194|0;if(j>>>0>50){M=H;N=I;O=K;o=47;break}p=H;q=I;r=c[41760+(j<<2)>>2]|0;s=K+1|0;o=36;continue}else if((o|0)==7){o=0;j=a[u]|0;if(((j&255)+ -1|0)>>>0<127?(u&3|0)==0:0){P=c[u>>2]|0;if(((P+ -16843009|P)&-2139062144|0)==0){Q=t;R=u;while(1){S=R+4|0;T=Q+ -4|0;U=c[S>>2]|0;if(((U+ -16843009|U)&-2139062144|0)==0){Q=T;R=S}else{V=T;W=U;X=S;break}}}else{V=t;W=P;X=u}Y=V;Z=W&255;_=X}else{Y=t;Z=j;_=u}R=Z&255;if((R+ -1|0)>>>0<127){t=Y+ -1|0;u=_+1|0;o=7;continue}Q=R+ -194|0;if(Q>>>0>50){M=b;N=Y;O=_;o=47;break}l=Y;m=c[41760+(Q<<2)>>2]|0;n=_+1|0;o=16;continue}else if((o|0)==16){o=0;Q=(d[n]|0)>>>3;if((Q+ -16|Q+(m>>26))>>>0>7){o=17;break}Q=n+1|0;if((m&33554432|0)!=0){if(((d[Q]|0)+ -128|0)>>>0>63){o=20;break}R=n+2|0;if((m&524288|0)==0){$=R}else{if(((d[R]|0)+ -128|0)>>>0>63){o=23;break}$=n+3|0}}else{$=Q}t=l+ -1|0;u=$;o=7;continue}else if((o|0)==36){o=0;Q=d[s]|0;R=Q>>>3;if((R+ -16|R+(r>>26))>>>0>7){o=37;break}R=s+1|0;aa=Q+ -128|r<<6;if((aa|0)<0){Q=(d[R]|0)+ -128|0;if(Q>>>0>63){o=40;break}S=s+2|0;ba=Q|aa<<6;if((ba|0)<0){Q=(d[S]|0)+ -128|0;if(Q>>>0>63){o=43;break}ca=Q|ba<<6;da=s+3|0}else{ca=ba;da=S}}else{ca=aa;da=R}c[p>>2]=ca;v=p+4|0;w=q+ -1|0;x=da;o=6;continue}}if((o|0)==17){ea=b;fa=l;ga=m;ha=n+ -1|0;o=46}else if((o|0)==20){ea=b;fa=l;ga=m;ha=n+ -1|0;o=46}else if((o|0)==23){ea=b;fa=l;ga=m;ha=n+ -1|0;o=46}else if((o|0)==37){ea=p;fa=q;ga=r;ha=s+ -1|0;o=46}else if((o|0)==40){ea=p;fa=q;ga=aa;ha=s+ -1|0;o=46}else if((o|0)==43){ea=p;fa=q;ga=ba;ha=s+ -1|0;o=46}else if((o|0)==53){i=h;return y|0}if((o|0)==46){if((ga|0)==0){M=ea;N=fa;O=ha;o=47}else{ia=ea;ja=ha}}if((o|0)==47){if((a[O]|0)==0){if((M|0)!=0){c[M>>2]=0;c[e>>2]=0}y=f-N|0;i=h;return y|0}else{ia=M;ja=O}}c[(ac()|0)>>2]=84;if((ia|0)==0){y=-1;i=h;return y|0}c[e>>2]=ja;y=-1;i=h;return y|0}function Zn(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;g=i;i=i+16|0;h=g;c[h>>2]=b;if((e|0)==0){j=0;i=g;return j|0}do{if((f|0)!=0){if((b|0)==0){c[h>>2]=h;k=h}else{k=b}l=a[e]|0;m=l&255;if(l<<24>>24>-1){c[k>>2]=m;j=l<<24>>24!=0|0;i=g;return j|0}l=m+ -194|0;if(!(l>>>0>50)){m=e+1|0;n=c[41760+(l<<2)>>2]|0;if(f>>>0<4?(n&-2147483648>>>((f*6|0)+ -6|0)|0)!=0:0){break}l=d[m]|0;m=l>>>3;if(!((m+ -16|m+(n>>26))>>>0>7)){m=l+ -128|n<<6;if((m|0)>=0){c[k>>2]=m;j=2;i=g;return j|0}n=(d[e+2|0]|0)+ -128|0;if(!(n>>>0>63)){l=n|m<<6;if((l|0)>=0){c[k>>2]=l;j=3;i=g;return j|0}m=(d[e+3|0]|0)+ -128|0;if(!(m>>>0>63)){c[k>>2]=m|l<<6;j=4;i=g;return j|0}}}}}}while(0);c[(ac()|0)>>2]=84;j=-1;i=g;return j|0}function _n(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;e=i;if((b|0)==0){f=1;i=e;return f|0}if(d>>>0<128){a[b]=d;f=1;i=e;return f|0}if(d>>>0<2048){a[b]=d>>>6|192;a[b+1|0]=d&63|128;f=2;i=e;return f|0}if(d>>>0<55296|(d+ -57344|0)>>>0<8192){a[b]=d>>>12|224;a[b+1|0]=d>>>6&63|128;a[b+2|0]=d&63|128;f=3;i=e;return f|0}if((d+ -65536|0)>>>0<1048576){a[b]=d>>>18|240;a[b+1|0]=d>>>12&63|128;a[b+2|0]=d>>>6&63|128;a[b+3|0]=d&63|128;f=4;i=e;return f|0}else{c[(ac()|0)>>2]=84;f=-1;i=e;return f|0}return 0}function $n(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;f=i;i=i+272|0;g=f+8|0;h=f;j=c[b>>2]|0;c[h>>2]=j;k=(a|0)!=0;l=k?e:256;e=k?a:g;a:do{if((j|0)==0|(l|0)==0){m=d;n=l;o=j;p=0;q=e}else{a=d;r=l;s=j;t=0;u=e;while(1){v=a>>>0>=r>>>0;if(!(v|a>>>0>32)){m=a;n=r;o=s;p=t;q=u;break a}w=v?r:a;x=a-w|0;v=ao(u,h,w,0)|0;if((v|0)==-1){break}if((u|0)==(g|0)){y=r;z=g}else{y=r-v|0;z=u+v|0}w=v+t|0;v=c[h>>2]|0;if((v|0)==0|(y|0)==0){m=x;n=y;o=v;p=w;q=z;break a}else{a=x;r=y;s=v;t=w;u=z}}m=x;n=0;o=c[h>>2]|0;p=-1;q=u}}while(0);b:do{if((o|0)!=0?!((n|0)==0|(m|0)==0):0){x=m;z=n;y=o;g=p;e=q;while(1){A=_n(e,c[y>>2]|0,0)|0;if((A+1|0)>>>0<2){break}j=(c[h>>2]|0)+4|0;c[h>>2]=j;l=x+ -1|0;d=g+1|0;if((z|0)==(A|0)|(l|0)==0){B=d;break b}else{x=l;z=z-A|0;y=j;g=d;e=e+A|0}}if((A|0)==0){c[h>>2]=0;B=g}else{B=-1}}else{B=p}}while(0);if(!k){i=f;return B|0}c[b>>2]=c[h>>2];i=f;return B|0}function ao(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;f=i;i=i+16|0;g=f;if((b|0)==0){h=c[d>>2]|0;j=c[h>>2]|0;if((j|0)==0){k=0;i=f;return k|0}else{l=0;m=j;n=h}while(1){if(m>>>0>127){h=_n(g,m,0)|0;if((h|0)==-1){k=-1;o=26;break}else{p=h}}else{p=1}h=p+l|0;j=n+4|0;q=c[j>>2]|0;if((q|0)==0){k=h;o=26;break}else{l=h;m=q;n=j}}if((o|0)==26){i=f;return k|0}}a:do{if(e>>>0>3){n=b;m=e;l=c[d>>2]|0;while(1){p=c[l>>2]|0;if((p|0)==0){r=n;s=m;break a}if(p>>>0>127){j=_n(n,p,0)|0;if((j|0)==-1){k=-1;break}t=n+j|0;u=m-j|0;v=l}else{a[n]=p;t=n+1|0;u=m+ -1|0;v=c[d>>2]|0}p=v+4|0;c[d>>2]=p;if(u>>>0>3){n=t;m=u;l=p}else{r=t;s=u;break a}}i=f;return k|0}else{r=b;s=e}}while(0);b:do{if((s|0)!=0){b=r;u=s;t=c[d>>2]|0;while(1){v=c[t>>2]|0;if((v|0)==0){o=24;break}if(v>>>0>127){l=_n(g,v,0)|0;if((l|0)==-1){k=-1;o=26;break}if(l>>>0>u>>>0){o=20;break}_n(b,c[t>>2]|0,0)|0;w=b+l|0;x=u-l|0;y=t}else{a[b]=v;w=b+1|0;x=u+ -1|0;y=c[d>>2]|0}v=y+4|0;c[d>>2]=v;if((x|0)==0){z=0;break b}else{b=w;u=x;t=v}}if((o|0)==20){k=e-u|0;i=f;return k|0}else if((o|0)==24){a[b]=0;z=u;break}else if((o|0)==26){i=f;return k|0}}else{z=0}}while(0);c[d>>2]=0;k=e-z|0;i=f;return k|0}



function Zh(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;k=i;i=i+80|0;l=k;m=k+64|0;n=k+60|0;o=k+56|0;p=k+52|0;q=k+48|0;r=k+44|0;s=k+40|0;t=k+16|0;u=k+12|0;if((c[g+4>>2]&1|0)==0){c[n>>2]=-1;v=c[(c[d>>2]|0)+16>>2]|0;c[p>>2]=c[e>>2];c[q>>2]=c[f>>2];c[m+0>>2]=c[p+0>>2];c[l+0>>2]=c[q+0>>2];jc[v&63](o,d,m,l,g,h,n);m=c[o>>2]|0;c[e>>2]=m;o=c[n>>2]|0;if((o|0)==1){a[j]=1}else if((o|0)==0){a[j]=0}else{a[j]=1;c[h>>2]=4}c[b>>2]=m;i=k;return}Jg(r,g);m=c[r>>2]|0;if(!((c[8526]|0)==-1)){c[l>>2]=34104;c[l+4>>2]=118;c[l+8>>2]=0;kg(34104,l,119)}o=(c[34108>>2]|0)+ -1|0;n=c[m+8>>2]|0;if(!((c[m+12>>2]|0)-n>>2>>>0>o>>>0)){w=vb(4)|0;ho(w);cc(w|0,42064,107)}m=c[n+(o<<2)>>2]|0;if((m|0)==0){w=vb(4)|0;ho(w);cc(w|0,42064,107)}Sf(c[r>>2]|0)|0;Jg(s,g);g=c[s>>2]|0;if(!((c[8562]|0)==-1)){c[l>>2]=34248;c[l+4>>2]=118;c[l+8>>2]=0;kg(34248,l,119)}r=(c[34252>>2]|0)+ -1|0;w=c[g+8>>2]|0;if(!((c[g+12>>2]|0)-w>>2>>>0>r>>>0)){x=vb(4)|0;ho(x);cc(x|0,42064,107)}g=c[w+(r<<2)>>2]|0;if((g|0)==0){x=vb(4)|0;ho(x);cc(x|0,42064,107)}Sf(c[s>>2]|0)|0;mc[c[(c[g>>2]|0)+24>>2]&63](t,g);mc[c[(c[g>>2]|0)+28>>2]&63](t+12|0,g);c[u>>2]=c[f>>2];f=t+24|0;c[l+0>>2]=c[u+0>>2];a[j]=(_h(e,l,t,f,m,h,1)|0)==(t|0)|0;c[b>>2]=c[e>>2];pg(t+12|0);pg(t);i=k;return}function _h(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0;l=i;i=i+112|0;m=l;n=(g-f|0)/12|0;if(n>>>0>100){o=Co(n)|0;if((o|0)==0){Oo()}else{p=o;q=o}}else{p=0;q=m}m=(f|0)==(g|0);if(m){r=0;s=n}else{o=f;t=0;u=n;n=q;while(1){v=a[o]|0;if((v&1)==0){w=(v&255)>>>1}else{w=c[o+4>>2]|0}if((w|0)==0){a[n]=2;x=t+1|0;y=u+ -1|0}else{a[n]=1;x=t;y=u}v=o+12|0;if((v|0)==(g|0)){r=x;s=y;break}else{o=v;t=x;u=y;n=n+1|0}}}n=0;y=r;r=s;a:while(1){s=c[b>>2]|0;do{if((s|0)!=0){if((c[s+12>>2]|0)==(c[s+16>>2]|0)){if((oc[c[(c[s>>2]|0)+36>>2]&63](s)|0)==-1){c[b>>2]=0;z=0;break}else{z=c[b>>2]|0;break}}else{z=s}}else{z=0}}while(0);s=(z|0)==0;u=c[e>>2]|0;if((u|0)!=0){if((c[u+12>>2]|0)==(c[u+16>>2]|0)?(oc[c[(c[u>>2]|0)+36>>2]&63](u)|0)==-1:0){c[e>>2]=0;A=0}else{A=u}}else{A=0}B=(A|0)==0;C=c[b>>2]|0;if(!((s^B)&(r|0)!=0)){break}s=c[C+12>>2]|0;if((s|0)==(c[C+16>>2]|0)){D=oc[c[(c[C>>2]|0)+36>>2]&63](C)|0}else{D=d[s]|0}s=D&255;if(k){E=s}else{E=xc[c[(c[h>>2]|0)+12>>2]&31](h,s)|0}s=n+1|0;if(m){n=s;continue}b:do{if(k){u=0;x=f;t=y;o=r;w=q;while(1){do{if((a[w]|0)==1){v=a[x]|0;F=(v&1)==0;if(F){G=x+1|0}else{G=c[x+8>>2]|0}if(!(E<<24>>24==(a[G+n|0]|0))){a[w]=0;H=u;I=t;J=o+ -1|0;break}if(F){K=(v&255)>>>1}else{K=c[x+4>>2]|0}if((K|0)==(s|0)){a[w]=2;H=1;I=t+1|0;J=o+ -1|0}else{H=1;I=t;J=o}}else{H=u;I=t;J=o}}while(0);v=x+12|0;if((v|0)==(g|0)){L=H;M=I;N=J;break b}u=H;x=v;t=I;o=J;w=w+1|0}}else{w=0;o=f;t=y;x=r;u=q;while(1){do{if((a[u]|0)==1){if((a[o]&1)==0){O=o+1|0}else{O=c[o+8>>2]|0}if(!(E<<24>>24==(xc[c[(c[h>>2]|0)+12>>2]&31](h,a[O+n|0]|0)|0)<<24>>24)){a[u]=0;P=w;Q=t;R=x+ -1|0;break}v=a[o]|0;if((v&1)==0){S=(v&255)>>>1}else{S=c[o+4>>2]|0}if((S|0)==(s|0)){a[u]=2;P=1;Q=t+1|0;R=x+ -1|0}else{P=1;Q=t;R=x}}else{P=w;Q=t;R=x}}while(0);v=o+12|0;if((v|0)==(g|0)){L=P;M=Q;N=R;break b}w=P;o=v;t=Q;x=R;u=u+1|0}}}while(0);if(!L){n=s;y=M;r=N;continue}u=c[b>>2]|0;x=u+12|0;t=c[x>>2]|0;if((t|0)==(c[u+16>>2]|0)){oc[c[(c[u>>2]|0)+40>>2]&63](u)|0}else{c[x>>2]=t+1}if((N+M|0)>>>0<2){n=s;y=M;r=N;continue}else{T=f;U=M;V=q}while(1){if((a[V]|0)==2){t=a[T]|0;if((t&1)==0){W=(t&255)>>>1}else{W=c[T+4>>2]|0}if((W|0)!=(s|0)){a[V]=0;X=U+ -1|0}else{X=U}}else{X=U}t=T+12|0;if((t|0)==(g|0)){n=s;y=X;r=N;continue a}else{T=t;U=X;V=V+1|0}}}do{if((C|0)!=0){if((c[C+12>>2]|0)==(c[C+16>>2]|0)){if((oc[c[(c[C>>2]|0)+36>>2]&63](C)|0)==-1){c[b>>2]=0;Y=0;break}else{Y=c[b>>2]|0;break}}else{Y=C}}else{Y=0}}while(0);C=(Y|0)==0;do{if(!B){if((c[A+12>>2]|0)!=(c[A+16>>2]|0)){if(C){break}else{Z=80;break}}if(!((oc[c[(c[A>>2]|0)+36>>2]&63](A)|0)==-1)){if(C){break}else{Z=80;break}}else{c[e>>2]=0;Z=78;break}}else{Z=78}}while(0);if((Z|0)==78?C:0){Z=80}if((Z|0)==80){c[j>>2]=c[j>>2]|2}c:do{if(!m){if((a[q]|0)==2){_=f}else{C=f;e=q;while(1){A=C+12|0;B=e+1|0;if((A|0)==(g|0)){Z=85;break c}if((a[B]|0)==2){_=A;break}else{C=A;e=B}}}}else{Z=85}}while(0);if((Z|0)==85){c[j>>2]=c[j>>2]|4;_=g}if((p|0)==0){i=l;return _|0}Do(p);i=l;return _|0}function $h(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+16|0;j=b+12|0;k=b+8|0;l=b+4|0;m=b;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];c[k+0>>2]=c[l+0>>2];c[j+0>>2]=c[m+0>>2];ai(a,0,k,j,f,g,h);i=b;return}function ai(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0;e=i;i=i+224|0;l=e+198|0;m=e+196|0;n=e+184|0;o=e+172|0;p=e+168|0;q=e+8|0;r=e+4|0;s=e;t=c[h+4>>2]&74;if((t|0)==0){u=0}else if((t|0)==8){u=16}else if((t|0)==64){u=8}else{u=10}Si(n,h,l,m);c[o+0>>2]=0;c[o+4>>2]=0;c[o+8>>2]=0;rg(o,10,0);if((a[o]&1)==0){h=o+1|0;v=h;w=o+8|0;x=h}else{h=o+8|0;v=o+1|0;w=h;x=c[h>>2]|0}c[p>>2]=x;c[r>>2]=q;c[s>>2]=0;h=o+4|0;t=a[m]|0;m=c[f>>2]|0;y=x;a:while(1){if((m|0)!=0){if((c[m+12>>2]|0)==(c[m+16>>2]|0)?(oc[c[(c[m>>2]|0)+36>>2]&63](m)|0)==-1:0){c[f>>2]=0;z=0}else{z=m}}else{z=0}x=(z|0)==0;A=c[g>>2]|0;do{if((A|0)!=0){if((c[A+12>>2]|0)!=(c[A+16>>2]|0)){if(x){B=A;break}else{C=A;D=y;break a}}if(!((oc[c[(c[A>>2]|0)+36>>2]&63](A)|0)==-1)){if(x){B=A;break}else{C=A;D=y;break a}}else{c[g>>2]=0;E=18;break}}else{E=18}}while(0);if((E|0)==18){E=0;if(x){C=0;D=y;break}else{B=0}}A=a[o]|0;F=(A&1)==0;if(F){G=(A&255)>>>1}else{G=c[h>>2]|0}if(((c[p>>2]|0)-y|0)==(G|0)){if(F){H=(A&255)>>>1;I=(A&255)>>>1}else{A=c[h>>2]|0;H=A;I=A}rg(o,H<<1,0);if((a[o]&1)==0){J=10}else{J=(c[o>>2]&-2)+ -1|0}rg(o,J,0);if((a[o]&1)==0){K=v}else{K=c[w>>2]|0}c[p>>2]=K+I;L=K}else{L=y}A=z+12|0;F=c[A>>2]|0;M=z+16|0;if((F|0)==(c[M>>2]|0)){N=oc[c[(c[z>>2]|0)+36>>2]&63](z)|0}else{N=d[F]|0}if((si(N&255,u,L,p,s,t,n,q,r,l)|0)!=0){C=B;D=L;break}F=c[A>>2]|0;if((F|0)==(c[M>>2]|0)){oc[c[(c[z>>2]|0)+40>>2]&63](z)|0;m=z;y=L;continue}else{c[A>>2]=F+1;m=z;y=L;continue}}L=a[n]|0;if((L&1)==0){O=(L&255)>>>1}else{O=c[n+4>>2]|0}if((O|0)!=0?(O=c[r>>2]|0,(O-q|0)<160):0){L=c[s>>2]|0;c[r>>2]=O+4;c[O>>2]=L}c[k>>2]=Mn(D,c[p>>2]|0,j,u)|0;cl(n,q,c[r>>2]|0,j);if((z|0)!=0){if((c[z+12>>2]|0)==(c[z+16>>2]|0)?(oc[c[(c[z>>2]|0)+36>>2]&63](z)|0)==-1:0){c[f>>2]=0;P=0}else{P=z}}else{P=0}z=(P|0)==0;do{if((C|0)!=0){if((c[C+12>>2]|0)!=(c[C+16>>2]|0)){if(!z){break}c[b>>2]=P;pg(o);pg(n);i=e;return}if((oc[c[(c[C>>2]|0)+36>>2]&63](C)|0)==-1){c[g>>2]=0;E=54;break}if(z^(C|0)==0){c[b>>2]=P;pg(o);pg(n);i=e;return}}else{E=54}}while(0);if((E|0)==54?!z:0){c[b>>2]=P;pg(o);pg(n);i=e;return}c[j>>2]=c[j>>2]|2;c[b>>2]=P;pg(o);pg(n);i=e;return}function bi(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+16|0;j=b+12|0;k=b+8|0;l=b+4|0;m=b;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];c[k+0>>2]=c[l+0>>2];c[j+0>>2]=c[m+0>>2];ci(a,0,k,j,f,g,h);i=b;return}function ci(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0;e=i;i=i+224|0;l=e+198|0;m=e+196|0;n=e+184|0;o=e+172|0;p=e+168|0;q=e+8|0;r=e+4|0;s=e;t=c[h+4>>2]&74;if((t|0)==0){u=0}else if((t|0)==64){u=8}else if((t|0)==8){u=16}else{u=10}Si(n,h,l,m);c[o+0>>2]=0;c[o+4>>2]=0;c[o+8>>2]=0;rg(o,10,0);if((a[o]&1)==0){h=o+1|0;v=h;w=o+8|0;x=h}else{h=o+8|0;v=o+1|0;w=h;x=c[h>>2]|0}c[p>>2]=x;c[r>>2]=q;c[s>>2]=0;h=o+4|0;t=a[m]|0;m=c[f>>2]|0;y=x;a:while(1){if((m|0)!=0){if((c[m+12>>2]|0)==(c[m+16>>2]|0)?(oc[c[(c[m>>2]|0)+36>>2]&63](m)|0)==-1:0){c[f>>2]=0;z=0}else{z=m}}else{z=0}x=(z|0)==0;A=c[g>>2]|0;do{if((A|0)!=0){if((c[A+12>>2]|0)!=(c[A+16>>2]|0)){if(x){B=A;break}else{C=A;D=y;break a}}if(!((oc[c[(c[A>>2]|0)+36>>2]&63](A)|0)==-1)){if(x){B=A;break}else{C=A;D=y;break a}}else{c[g>>2]=0;E=18;break}}else{E=18}}while(0);if((E|0)==18){E=0;if(x){C=0;D=y;break}else{B=0}}A=a[o]|0;F=(A&1)==0;if(F){G=(A&255)>>>1}else{G=c[h>>2]|0}if(((c[p>>2]|0)-y|0)==(G|0)){if(F){H=(A&255)>>>1;I=(A&255)>>>1}else{A=c[h>>2]|0;H=A;I=A}rg(o,H<<1,0);if((a[o]&1)==0){K=10}else{K=(c[o>>2]&-2)+ -1|0}rg(o,K,0);if((a[o]&1)==0){L=v}else{L=c[w>>2]|0}c[p>>2]=L+I;M=L}else{M=y}A=z+12|0;F=c[A>>2]|0;N=z+16|0;if((F|0)==(c[N>>2]|0)){O=oc[c[(c[z>>2]|0)+36>>2]&63](z)|0}else{O=d[F]|0}if((si(O&255,u,M,p,s,t,n,q,r,l)|0)!=0){C=B;D=M;break}F=c[A>>2]|0;if((F|0)==(c[N>>2]|0)){oc[c[(c[z>>2]|0)+40>>2]&63](z)|0;m=z;y=M;continue}else{c[A>>2]=F+1;m=z;y=M;continue}}M=a[n]|0;if((M&1)==0){P=(M&255)>>>1}else{P=c[n+4>>2]|0}if((P|0)!=0?(P=c[r>>2]|0,(P-q|0)<160):0){M=c[s>>2]|0;c[r>>2]=P+4;c[P>>2]=M}M=Ln(D,c[p>>2]|0,j,u)|0;u=k;c[u>>2]=M;c[u+4>>2]=J;cl(n,q,c[r>>2]|0,j);if((z|0)!=0){if((c[z+12>>2]|0)==(c[z+16>>2]|0)?(oc[c[(c[z>>2]|0)+36>>2]&63](z)|0)==-1:0){c[f>>2]=0;Q=0}else{Q=z}}else{Q=0}z=(Q|0)==0;do{if((C|0)!=0){if((c[C+12>>2]|0)!=(c[C+16>>2]|0)){if(!z){break}c[b>>2]=Q;pg(o);pg(n);i=e;return}if((oc[c[(c[C>>2]|0)+36>>2]&63](C)|0)==-1){c[g>>2]=0;E=54;break}if(z^(C|0)==0){c[b>>2]=Q;pg(o);pg(n);i=e;return}}else{E=54}}while(0);if((E|0)==54?!z:0){c[b>>2]=Q;pg(o);pg(n);i=e;return}c[j>>2]=c[j>>2]|2;c[b>>2]=Q;pg(o);pg(n);i=e;return}function di(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+16|0;j=b+12|0;k=b+8|0;l=b+4|0;m=b;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];c[k+0>>2]=c[l+0>>2];c[j+0>>2]=c[m+0>>2];ei(a,0,k,j,f,g,h);i=b;return}function ei(e,f,g,h,j,k,l){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0;f=i;i=i+224|0;m=f+198|0;n=f+196|0;o=f+184|0;p=f+172|0;q=f+168|0;r=f+8|0;s=f+4|0;t=f;u=c[j+4>>2]&74;if((u|0)==8){v=16}else if((u|0)==64){v=8}else if((u|0)==0){v=0}else{v=10}Si(o,j,m,n);c[p+0>>2]=0;c[p+4>>2]=0;c[p+8>>2]=0;rg(p,10,0);if((a[p]&1)==0){j=p+1|0;w=j;x=p+8|0;y=j}else{j=p+8|0;w=p+1|0;x=j;y=c[j>>2]|0}c[q>>2]=y;c[s>>2]=r;c[t>>2]=0;j=p+4|0;u=a[n]|0;n=c[g>>2]|0;z=y;a:while(1){if((n|0)!=0){if((c[n+12>>2]|0)==(c[n+16>>2]|0)?(oc[c[(c[n>>2]|0)+36>>2]&63](n)|0)==-1:0){c[g>>2]=0;A=0}else{A=n}}else{A=0}y=(A|0)==0;B=c[h>>2]|0;do{if((B|0)!=0){if((c[B+12>>2]|0)!=(c[B+16>>2]|0)){if(y){C=B;break}else{D=B;E=z;break a}}if(!((oc[c[(c[B>>2]|0)+36>>2]&63](B)|0)==-1)){if(y){C=B;break}else{D=B;E=z;break a}}else{c[h>>2]=0;F=18;break}}else{F=18}}while(0);if((F|0)==18){F=0;if(y){D=0;E=z;break}else{C=0}}B=a[p]|0;G=(B&1)==0;if(G){H=(B&255)>>>1}else{H=c[j>>2]|0}if(((c[q>>2]|0)-z|0)==(H|0)){if(G){I=(B&255)>>>1;J=(B&255)>>>1}else{B=c[j>>2]|0;I=B;J=B}rg(p,I<<1,0);if((a[p]&1)==0){K=10}else{K=(c[p>>2]&-2)+ -1|0}rg(p,K,0);if((a[p]&1)==0){L=w}else{L=c[x>>2]|0}c[q>>2]=L+J;M=L}else{M=z}B=A+12|0;G=c[B>>2]|0;N=A+16|0;if((G|0)==(c[N>>2]|0)){O=oc[c[(c[A>>2]|0)+36>>2]&63](A)|0}else{O=d[G]|0}if((si(O&255,v,M,q,t,u,o,r,s,m)|0)!=0){D=C;E=M;break}G=c[B>>2]|0;if((G|0)==(c[N>>2]|0)){oc[c[(c[A>>2]|0)+40>>2]&63](A)|0;n=A;z=M;continue}else{c[B>>2]=G+1;n=A;z=M;continue}}M=a[o]|0;if((M&1)==0){P=(M&255)>>>1}else{P=c[o+4>>2]|0}if((P|0)!=0?(P=c[s>>2]|0,(P-r|0)<160):0){M=c[t>>2]|0;c[s>>2]=P+4;c[P>>2]=M}b[l>>1]=Kn(E,c[q>>2]|0,k,v)|0;cl(o,r,c[s>>2]|0,k);if((A|0)!=0){if((c[A+12>>2]|0)==(c[A+16>>2]|0)?(oc[c[(c[A>>2]|0)+36>>2]&63](A)|0)==-1:0){c[g>>2]=0;Q=0}else{Q=A}}else{Q=0}A=(Q|0)==0;do{if((D|0)!=0){if((c[D+12>>2]|0)!=(c[D+16>>2]|0)){if(!A){break}c[e>>2]=Q;pg(p);pg(o);i=f;return}if((oc[c[(c[D>>2]|0)+36>>2]&63](D)|0)==-1){c[h>>2]=0;F=54;break}if(A^(D|0)==0){c[e>>2]=Q;pg(p);pg(o);i=f;return}}else{F=54}}while(0);if((F|0)==54?!A:0){c[e>>2]=Q;pg(p);pg(o);i=f;return}c[k>>2]=c[k>>2]|2;c[e>>2]=Q;pg(p);pg(o);i=f;return}function fi(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+16|0;j=b+12|0;k=b+8|0;l=b+4|0;m=b;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];c[k+0>>2]=c[l+0>>2];c[j+0>>2]=c[m+0>>2];gi(a,0,k,j,f,g,h);i=b;return}function gi(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0;e=i;i=i+224|0;l=e+198|0;m=e+196|0;n=e+184|0;o=e+172|0;p=e+168|0;q=e+8|0;r=e+4|0;s=e;t=c[h+4>>2]&74;if((t|0)==0){u=0}else if((t|0)==64){u=8}else if((t|0)==8){u=16}else{u=10}Si(n,h,l,m);c[o+0>>2]=0;c[o+4>>2]=0;c[o+8>>2]=0;rg(o,10,0);if((a[o]&1)==0){h=o+1|0;v=h;w=o+8|0;x=h}else{h=o+8|0;v=o+1|0;w=h;x=c[h>>2]|0}c[p>>2]=x;c[r>>2]=q;c[s>>2]=0;h=o+4|0;t=a[m]|0;m=c[f>>2]|0;y=x;a:while(1){if((m|0)!=0){if((c[m+12>>2]|0)==(c[m+16>>2]|0)?(oc[c[(c[m>>2]|0)+36>>2]&63](m)|0)==-1:0){c[f>>2]=0;z=0}else{z=m}}else{z=0}x=(z|0)==0;A=c[g>>2]|0;do{if((A|0)!=0){if((c[A+12>>2]|0)!=(c[A+16>>2]|0)){if(x){B=A;break}else{C=A;D=y;break a}}if(!((oc[c[(c[A>>2]|0)+36>>2]&63](A)|0)==-1)){if(x){B=A;break}else{C=A;D=y;break a}}else{c[g>>2]=0;E=18;break}}else{E=18}}while(0);if((E|0)==18){E=0;if(x){C=0;D=y;break}else{B=0}}A=a[o]|0;F=(A&1)==0;if(F){G=(A&255)>>>1}else{G=c[h>>2]|0}if(((c[p>>2]|0)-y|0)==(G|0)){if(F){H=(A&255)>>>1;I=(A&255)>>>1}else{A=c[h>>2]|0;H=A;I=A}rg(o,H<<1,0);if((a[o]&1)==0){J=10}else{J=(c[o>>2]&-2)+ -1|0}rg(o,J,0);if((a[o]&1)==0){K=v}else{K=c[w>>2]|0}c[p>>2]=K+I;L=K}else{L=y}A=z+12|0;F=c[A>>2]|0;M=z+16|0;if((F|0)==(c[M>>2]|0)){N=oc[c[(c[z>>2]|0)+36>>2]&63](z)|0}else{N=d[F]|0}if((si(N&255,u,L,p,s,t,n,q,r,l)|0)!=0){C=B;D=L;break}F=c[A>>2]|0;if((F|0)==(c[M>>2]|0)){oc[c[(c[z>>2]|0)+40>>2]&63](z)|0;m=z;y=L;continue}else{c[A>>2]=F+1;m=z;y=L;continue}}L=a[n]|0;if((L&1)==0){O=(L&255)>>>1}else{O=c[n+4>>2]|0}if((O|0)!=0?(O=c[r>>2]|0,(O-q|0)<160):0){L=c[s>>2]|0;c[r>>2]=O+4;c[O>>2]=L}c[k>>2]=Jn(D,c[p>>2]|0,j,u)|0;cl(n,q,c[r>>2]|0,j);if((z|0)!=0){if((c[z+12>>2]|0)==(c[z+16>>2]|0)?(oc[c[(c[z>>2]|0)+36>>2]&63](z)|0)==-1:0){c[f>>2]=0;P=0}else{P=z}}else{P=0}z=(P|0)==0;do{if((C|0)!=0){if((c[C+12>>2]|0)!=(c[C+16>>2]|0)){if(!z){break}c[b>>2]=P;pg(o);pg(n);i=e;return}if((oc[c[(c[C>>2]|0)+36>>2]&63](C)|0)==-1){c[g>>2]=0;E=54;break}if(z^(C|0)==0){c[b>>2]=P;pg(o);pg(n);i=e;return}}else{E=54}}while(0);if((E|0)==54?!z:0){c[b>>2]=P;pg(o);pg(n);i=e;return}c[j>>2]=c[j>>2]|2;c[b>>2]=P;pg(o);pg(n);i=e;return}function hi(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+16|0;j=b+12|0;k=b+8|0;l=b+4|0;m=b;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];c[k+0>>2]=c[l+0>>2];c[j+0>>2]=c[m+0>>2];ii(a,0,k,j,f,g,h);i=b;return}function ii(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0;e=i;i=i+224|0;l=e+198|0;m=e+196|0;n=e+184|0;o=e+172|0;p=e+168|0;q=e+8|0;r=e+4|0;s=e;t=c[h+4>>2]&74;if((t|0)==8){u=16}else if((t|0)==0){u=0}else if((t|0)==64){u=8}else{u=10}Si(n,h,l,m);c[o+0>>2]=0;c[o+4>>2]=0;c[o+8>>2]=0;rg(o,10,0);if((a[o]&1)==0){h=o+1|0;v=h;w=o+8|0;x=h}else{h=o+8|0;v=o+1|0;w=h;x=c[h>>2]|0}c[p>>2]=x;c[r>>2]=q;c[s>>2]=0;h=o+4|0;t=a[m]|0;m=c[f>>2]|0;y=x;a:while(1){if((m|0)!=0){if((c[m+12>>2]|0)==(c[m+16>>2]|0)?(oc[c[(c[m>>2]|0)+36>>2]&63](m)|0)==-1:0){c[f>>2]=0;z=0}else{z=m}}else{z=0}x=(z|0)==0;A=c[g>>2]|0;do{if((A|0)!=0){if((c[A+12>>2]|0)!=(c[A+16>>2]|0)){if(x){B=A;break}else{C=A;D=y;break a}}if(!((oc[c[(c[A>>2]|0)+36>>2]&63](A)|0)==-1)){if(x){B=A;break}else{C=A;D=y;break a}}else{c[g>>2]=0;E=18;break}}else{E=18}}while(0);if((E|0)==18){E=0;if(x){C=0;D=y;break}else{B=0}}A=a[o]|0;F=(A&1)==0;if(F){G=(A&255)>>>1}else{G=c[h>>2]|0}if(((c[p>>2]|0)-y|0)==(G|0)){if(F){H=(A&255)>>>1;I=(A&255)>>>1}else{A=c[h>>2]|0;H=A;I=A}rg(o,H<<1,0);if((a[o]&1)==0){J=10}else{J=(c[o>>2]&-2)+ -1|0}rg(o,J,0);if((a[o]&1)==0){K=v}else{K=c[w>>2]|0}c[p>>2]=K+I;L=K}else{L=y}A=z+12|0;F=c[A>>2]|0;M=z+16|0;if((F|0)==(c[M>>2]|0)){N=oc[c[(c[z>>2]|0)+36>>2]&63](z)|0}else{N=d[F]|0}if((si(N&255,u,L,p,s,t,n,q,r,l)|0)!=0){C=B;D=L;break}F=c[A>>2]|0;if((F|0)==(c[M>>2]|0)){oc[c[(c[z>>2]|0)+40>>2]&63](z)|0;m=z;y=L;continue}else{c[A>>2]=F+1;m=z;y=L;continue}}L=a[n]|0;if((L&1)==0){O=(L&255)>>>1}else{O=c[n+4>>2]|0}if((O|0)!=0?(O=c[r>>2]|0,(O-q|0)<160):0){L=c[s>>2]|0;c[r>>2]=O+4;c[O>>2]=L}c[k>>2]=In(D,c[p>>2]|0,j,u)|0;cl(n,q,c[r>>2]|0,j);if((z|0)!=0){if((c[z+12>>2]|0)==(c[z+16>>2]|0)?(oc[c[(c[z>>2]|0)+36>>2]&63](z)|0)==-1:0){c[f>>2]=0;P=0}else{P=z}}else{P=0}z=(P|0)==0;do{if((C|0)!=0){if((c[C+12>>2]|0)!=(c[C+16>>2]|0)){if(!z){break}c[b>>2]=P;pg(o);pg(n);i=e;return}if((oc[c[(c[C>>2]|0)+36>>2]&63](C)|0)==-1){c[g>>2]=0;E=54;break}if(z^(C|0)==0){c[b>>2]=P;pg(o);pg(n);i=e;return}}else{E=54}}while(0);if((E|0)==54?!z:0){c[b>>2]=P;pg(o);pg(n);i=e;return}c[j>>2]=c[j>>2]|2;c[b>>2]=P;pg(o);pg(n);i=e;return}function ji(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+16|0;j=b+12|0;k=b+8|0;l=b+4|0;m=b;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];c[k+0>>2]=c[l+0>>2];c[j+0>>2]=c[m+0>>2];ki(a,0,k,j,f,g,h);i=b;return}function ki(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0;e=i;i=i+224|0;l=e+198|0;m=e+196|0;n=e+184|0;o=e+172|0;p=e+168|0;q=e+8|0;r=e+4|0;s=e;t=c[h+4>>2]&74;if((t|0)==0){u=0}else if((t|0)==64){u=8}else if((t|0)==8){u=16}else{u=10}Si(n,h,l,m);c[o+0>>2]=0;c[o+4>>2]=0;c[o+8>>2]=0;rg(o,10,0);if((a[o]&1)==0){h=o+1|0;v=h;w=o+8|0;x=h}else{h=o+8|0;v=o+1|0;w=h;x=c[h>>2]|0}c[p>>2]=x;c[r>>2]=q;c[s>>2]=0;h=o+4|0;t=a[m]|0;m=c[f>>2]|0;y=x;a:while(1){if((m|0)!=0){if((c[m+12>>2]|0)==(c[m+16>>2]|0)?(oc[c[(c[m>>2]|0)+36>>2]&63](m)|0)==-1:0){c[f>>2]=0;z=0}else{z=m}}else{z=0}x=(z|0)==0;A=c[g>>2]|0;do{if((A|0)!=0){if((c[A+12>>2]|0)!=(c[A+16>>2]|0)){if(x){B=A;break}else{C=A;D=y;break a}}if(!((oc[c[(c[A>>2]|0)+36>>2]&63](A)|0)==-1)){if(x){B=A;break}else{C=A;D=y;break a}}else{c[g>>2]=0;E=18;break}}else{E=18}}while(0);if((E|0)==18){E=0;if(x){C=0;D=y;break}else{B=0}}A=a[o]|0;F=(A&1)==0;if(F){G=(A&255)>>>1}else{G=c[h>>2]|0}if(((c[p>>2]|0)-y|0)==(G|0)){if(F){H=(A&255)>>>1;I=(A&255)>>>1}else{A=c[h>>2]|0;H=A;I=A}rg(o,H<<1,0);if((a[o]&1)==0){K=10}else{K=(c[o>>2]&-2)+ -1|0}rg(o,K,0);if((a[o]&1)==0){L=v}else{L=c[w>>2]|0}c[p>>2]=L+I;M=L}else{M=y}A=z+12|0;F=c[A>>2]|0;N=z+16|0;if((F|0)==(c[N>>2]|0)){O=oc[c[(c[z>>2]|0)+36>>2]&63](z)|0}else{O=d[F]|0}if((si(O&255,u,M,p,s,t,n,q,r,l)|0)!=0){C=B;D=M;break}F=c[A>>2]|0;if((F|0)==(c[N>>2]|0)){oc[c[(c[z>>2]|0)+40>>2]&63](z)|0;m=z;y=M;continue}else{c[A>>2]=F+1;m=z;y=M;continue}}M=a[n]|0;if((M&1)==0){P=(M&255)>>>1}else{P=c[n+4>>2]|0}if((P|0)!=0?(P=c[r>>2]|0,(P-q|0)<160):0){M=c[s>>2]|0;c[r>>2]=P+4;c[P>>2]=M}M=Hn(D,c[p>>2]|0,j,u)|0;u=k;c[u>>2]=M;c[u+4>>2]=J;cl(n,q,c[r>>2]|0,j);if((z|0)!=0){if((c[z+12>>2]|0)==(c[z+16>>2]|0)?(oc[c[(c[z>>2]|0)+36>>2]&63](z)|0)==-1:0){c[f>>2]=0;Q=0}else{Q=z}}else{Q=0}z=(Q|0)==0;do{if((C|0)!=0){if((c[C+12>>2]|0)!=(c[C+16>>2]|0)){if(!z){break}c[b>>2]=Q;pg(o);pg(n);i=e;return}if((oc[c[(c[C>>2]|0)+36>>2]&63](C)|0)==-1){c[g>>2]=0;E=54;break}if(z^(C|0)==0){c[b>>2]=Q;pg(o);pg(n);i=e;return}}else{E=54}}while(0);if((E|0)==54?!z:0){c[b>>2]=Q;pg(o);pg(n);i=e;return}c[j>>2]=c[j>>2]|2;c[b>>2]=Q;pg(o);pg(n);i=e;return}function li(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+16|0;j=b+12|0;k=b+8|0;l=b+4|0;m=b;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];c[k+0>>2]=c[l+0>>2];c[j+0>>2]=c[m+0>>2];mi(a,0,k,j,f,g,h);i=b;return}function mi(b,e,f,h,j,k,l){b=b|0;e=e|0;f=f|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0;e=i;i=i+240|0;m=e+200|0;n=e+199|0;o=e+198|0;p=e+184|0;q=e+172|0;r=e+168|0;s=e+8|0;t=e+4|0;u=e;v=e+197|0;w=e+196|0;Ti(p,j,m,n,o);c[q+0>>2]=0;c[q+4>>2]=0;c[q+8>>2]=0;rg(q,10,0);if((a[q]&1)==0){j=q+1|0;x=j;y=q+8|0;z=j}else{j=q+8|0;x=q+1|0;y=j;z=c[j>>2]|0}c[r>>2]=z;c[t>>2]=s;c[u>>2]=0;a[v]=1;a[w]=69;j=q+4|0;A=a[n]|0;n=a[o]|0;o=c[f>>2]|0;B=z;a:while(1){if((o|0)!=0){if((c[o+12>>2]|0)==(c[o+16>>2]|0)?(oc[c[(c[o>>2]|0)+36>>2]&63](o)|0)==-1:0){c[f>>2]=0;C=0}else{C=o}}else{C=0}z=(C|0)==0;D=c[h>>2]|0;do{if((D|0)!=0){if((c[D+12>>2]|0)!=(c[D+16>>2]|0)){if(z){E=D;break}else{F=D;G=B;break a}}if(!((oc[c[(c[D>>2]|0)+36>>2]&63](D)|0)==-1)){if(z){E=D;break}else{F=D;G=B;break a}}else{c[h>>2]=0;H=14;break}}else{H=14}}while(0);if((H|0)==14){H=0;if(z){F=0;G=B;break}else{E=0}}D=a[q]|0;I=(D&1)==0;if(I){J=(D&255)>>>1}else{J=c[j>>2]|0}if(((c[r>>2]|0)-B|0)==(J|0)){if(I){K=(D&255)>>>1;L=(D&255)>>>1}else{D=c[j>>2]|0;K=D;L=D}rg(q,K<<1,0);if((a[q]&1)==0){M=10}else{M=(c[q>>2]&-2)+ -1|0}rg(q,M,0);if((a[q]&1)==0){N=x}else{N=c[y>>2]|0}c[r>>2]=N+L;O=N}else{O=B}D=C+12|0;I=c[D>>2]|0;P=C+16|0;if((I|0)==(c[P>>2]|0)){Q=oc[c[(c[C>>2]|0)+36>>2]&63](C)|0}else{Q=d[I]|0}if((Ui(Q&255,v,w,O,r,A,n,p,s,t,u,m)|0)!=0){F=E;G=O;break}I=c[D>>2]|0;if((I|0)==(c[P>>2]|0)){oc[c[(c[C>>2]|0)+40>>2]&63](C)|0;o=C;B=O;continue}else{c[D>>2]=I+1;o=C;B=O;continue}}O=a[p]|0;if((O&1)==0){R=(O&255)>>>1}else{R=c[p+4>>2]|0}if(((R|0)!=0?(a[v]|0)!=0:0)?(v=c[t>>2]|0,(v-s|0)<160):0){R=c[u>>2]|0;c[t>>2]=v+4;c[v>>2]=R}g[l>>2]=+Gn(G,c[r>>2]|0,k);cl(p,s,c[t>>2]|0,k);if((C|0)!=0){if((c[C+12>>2]|0)==(c[C+16>>2]|0)?(oc[c[(c[C>>2]|0)+36>>2]&63](C)|0)==-1:0){c[f>>2]=0;S=0}else{S=C}}else{S=0}C=(S|0)==0;do{if((F|0)!=0){if((c[F+12>>2]|0)!=(c[F+16>>2]|0)){if(!C){break}c[b>>2]=S;pg(q);pg(p);i=e;return}if((oc[c[(c[F>>2]|0)+36>>2]&63](F)|0)==-1){c[h>>2]=0;H=51;break}if(C^(F|0)==0){c[b>>2]=S;pg(q);pg(p);i=e;return}}else{H=51}}while(0);if((H|0)==51?!C:0){c[b>>2]=S;pg(q);pg(p);i=e;return}c[k>>2]=c[k>>2]|2;c[b>>2]=S;pg(q);pg(p);i=e;return}function ni(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+16|0;j=b+12|0;k=b+8|0;l=b+4|0;m=b;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];c[k+0>>2]=c[l+0>>2];c[j+0>>2]=c[m+0>>2];oi(a,0,k,j,f,g,h);i=b;return}function oi(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0;e=i;i=i+240|0;m=e+200|0;n=e+199|0;o=e+198|0;p=e+184|0;q=e+172|0;r=e+168|0;s=e+8|0;t=e+4|0;u=e;v=e+197|0;w=e+196|0;Ti(p,j,m,n,o);c[q+0>>2]=0;c[q+4>>2]=0;c[q+8>>2]=0;rg(q,10,0);if((a[q]&1)==0){j=q+1|0;x=j;y=q+8|0;z=j}else{j=q+8|0;x=q+1|0;y=j;z=c[j>>2]|0}c[r>>2]=z;c[t>>2]=s;c[u>>2]=0;a[v]=1;a[w]=69;j=q+4|0;A=a[n]|0;n=a[o]|0;o=c[f>>2]|0;B=z;a:while(1){if((o|0)!=0){if((c[o+12>>2]|0)==(c[o+16>>2]|0)?(oc[c[(c[o>>2]|0)+36>>2]&63](o)|0)==-1:0){c[f>>2]=0;C=0}else{C=o}}else{C=0}z=(C|0)==0;D=c[g>>2]|0;do{if((D|0)!=0){if((c[D+12>>2]|0)!=(c[D+16>>2]|0)){if(z){E=D;break}else{F=D;G=B;break a}}if(!((oc[c[(c[D>>2]|0)+36>>2]&63](D)|0)==-1)){if(z){E=D;break}else{F=D;G=B;break a}}else{c[g>>2]=0;H=14;break}}else{H=14}}while(0);if((H|0)==14){H=0;if(z){F=0;G=B;break}else{E=0}}D=a[q]|0;I=(D&1)==0;if(I){J=(D&255)>>>1}else{J=c[j>>2]|0}if(((c[r>>2]|0)-B|0)==(J|0)){if(I){K=(D&255)>>>1;L=(D&255)>>>1}else{D=c[j>>2]|0;K=D;L=D}rg(q,K<<1,0);if((a[q]&1)==0){M=10}else{M=(c[q>>2]&-2)+ -1|0}rg(q,M,0);if((a[q]&1)==0){N=x}else{N=c[y>>2]|0}c[r>>2]=N+L;O=N}else{O=B}D=C+12|0;I=c[D>>2]|0;P=C+16|0;if((I|0)==(c[P>>2]|0)){Q=oc[c[(c[C>>2]|0)+36>>2]&63](C)|0}else{Q=d[I]|0}if((Ui(Q&255,v,w,O,r,A,n,p,s,t,u,m)|0)!=0){F=E;G=O;break}I=c[D>>2]|0;if((I|0)==(c[P>>2]|0)){oc[c[(c[C>>2]|0)+40>>2]&63](C)|0;o=C;B=O;continue}else{c[D>>2]=I+1;o=C;B=O;continue}}O=a[p]|0;if((O&1)==0){R=(O&255)>>>1}else{R=c[p+4>>2]|0}if(((R|0)!=0?(a[v]|0)!=0:0)?(v=c[t>>2]|0,(v-s|0)<160):0){R=c[u>>2]|0;c[t>>2]=v+4;c[v>>2]=R}h[l>>3]=+Fn(G,c[r>>2]|0,k);cl(p,s,c[t>>2]|0,k);if((C|0)!=0){if((c[C+12>>2]|0)==(c[C+16>>2]|0)?(oc[c[(c[C>>2]|0)+36>>2]&63](C)|0)==-1:0){c[f>>2]=0;S=0}else{S=C}}else{S=0}C=(S|0)==0;do{if((F|0)!=0){if((c[F+12>>2]|0)!=(c[F+16>>2]|0)){if(!C){break}c[b>>2]=S;pg(q);pg(p);i=e;return}if((oc[c[(c[F>>2]|0)+36>>2]&63](F)|0)==-1){c[g>>2]=0;H=51;break}if(C^(F|0)==0){c[b>>2]=S;pg(q);pg(p);i=e;return}}else{H=51}}while(0);if((H|0)==51?!C:0){c[b>>2]=S;pg(q);pg(p);i=e;return}c[k>>2]=c[k>>2]|2;c[b>>2]=S;pg(q);pg(p);i=e;return}function pi(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+16|0;j=b+12|0;k=b+8|0;l=b+4|0;m=b;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];c[k+0>>2]=c[l+0>>2];c[j+0>>2]=c[m+0>>2];qi(a,0,k,j,f,g,h);i=b;return}function qi(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0;e=i;i=i+240|0;m=e+200|0;n=e+199|0;o=e+198|0;p=e+184|0;q=e+172|0;r=e+168|0;s=e+8|0;t=e+4|0;u=e;v=e+197|0;w=e+196|0;Ti(p,j,m,n,o);c[q+0>>2]=0;c[q+4>>2]=0;c[q+8>>2]=0;rg(q,10,0);if((a[q]&1)==0){j=q+1|0;x=j;y=q+8|0;z=j}else{j=q+8|0;x=q+1|0;y=j;z=c[j>>2]|0}c[r>>2]=z;c[t>>2]=s;c[u>>2]=0;a[v]=1;a[w]=69;j=q+4|0;A=a[n]|0;n=a[o]|0;o=c[f>>2]|0;B=z;a:while(1){if((o|0)!=0){if((c[o+12>>2]|0)==(c[o+16>>2]|0)?(oc[c[(c[o>>2]|0)+36>>2]&63](o)|0)==-1:0){c[f>>2]=0;C=0}else{C=o}}else{C=0}z=(C|0)==0;D=c[g>>2]|0;do{if((D|0)!=0){if((c[D+12>>2]|0)!=(c[D+16>>2]|0)){if(z){E=D;break}else{F=D;G=B;break a}}if(!((oc[c[(c[D>>2]|0)+36>>2]&63](D)|0)==-1)){if(z){E=D;break}else{F=D;G=B;break a}}else{c[g>>2]=0;H=14;break}}else{H=14}}while(0);if((H|0)==14){H=0;if(z){F=0;G=B;break}else{E=0}}D=a[q]|0;I=(D&1)==0;if(I){J=(D&255)>>>1}else{J=c[j>>2]|0}if(((c[r>>2]|0)-B|0)==(J|0)){if(I){K=(D&255)>>>1;L=(D&255)>>>1}else{D=c[j>>2]|0;K=D;L=D}rg(q,K<<1,0);if((a[q]&1)==0){M=10}else{M=(c[q>>2]&-2)+ -1|0}rg(q,M,0);if((a[q]&1)==0){N=x}else{N=c[y>>2]|0}c[r>>2]=N+L;O=N}else{O=B}D=C+12|0;I=c[D>>2]|0;P=C+16|0;if((I|0)==(c[P>>2]|0)){Q=oc[c[(c[C>>2]|0)+36>>2]&63](C)|0}else{Q=d[I]|0}if((Ui(Q&255,v,w,O,r,A,n,p,s,t,u,m)|0)!=0){F=E;G=O;break}I=c[D>>2]|0;if((I|0)==(c[P>>2]|0)){oc[c[(c[C>>2]|0)+40>>2]&63](C)|0;o=C;B=O;continue}else{c[D>>2]=I+1;o=C;B=O;continue}}O=a[p]|0;if((O&1)==0){R=(O&255)>>>1}else{R=c[p+4>>2]|0}if(((R|0)!=0?(a[v]|0)!=0:0)?(v=c[t>>2]|0,(v-s|0)<160):0){R=c[u>>2]|0;c[t>>2]=v+4;c[v>>2]=R}h[l>>3]=+En(G,c[r>>2]|0,k);cl(p,s,c[t>>2]|0,k);if((C|0)!=0){if((c[C+12>>2]|0)==(c[C+16>>2]|0)?(oc[c[(c[C>>2]|0)+36>>2]&63](C)|0)==-1:0){c[f>>2]=0;S=0}else{S=C}}else{S=0}C=(S|0)==0;do{if((F|0)!=0){if((c[F+12>>2]|0)!=(c[F+16>>2]|0)){if(!C){break}c[b>>2]=S;pg(q);pg(p);i=e;return}if((oc[c[(c[F>>2]|0)+36>>2]&63](F)|0)==-1){c[g>>2]=0;H=51;break}if(C^(F|0)==0){c[b>>2]=S;pg(q);pg(p);i=e;return}}else{H=51}}while(0);if((H|0)==51?!C:0){c[b>>2]=S;pg(q);pg(p);i=e;return}c[k>>2]=c[k>>2]|2;c[b>>2]=S;pg(q);pg(p);i=e;return}function ri(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0;e=i;i=i+240|0;l=e;m=e+204|0;n=e+192|0;o=e+188|0;p=e+176|0;q=e+16|0;c[n+0>>2]=0;c[n+4>>2]=0;c[n+8>>2]=0;Jg(o,h);h=c[o>>2]|0;if(!((c[8526]|0)==-1)){c[l>>2]=34104;c[l+4>>2]=118;c[l+8>>2]=0;kg(34104,l,119)}r=(c[34108>>2]|0)+ -1|0;s=c[h+8>>2]|0;if(!((c[h+12>>2]|0)-s>>2>>>0>r>>>0)){t=vb(4)|0;ho(t);cc(t|0,42064,107)}h=c[s+(r<<2)>>2]|0;if((h|0)==0){t=vb(4)|0;ho(t);cc(t|0,42064,107)}uc[c[(c[h>>2]|0)+32>>2]&7](h,32648,32674|0,m)|0;Sf(c[o>>2]|0)|0;c[p+0>>2]=0;c[p+4>>2]=0;c[p+8>>2]=0;rg(p,10,0);if((a[p]&1)==0){o=p+1|0;u=o;v=p+8|0;w=o}else{o=p+8|0;u=p+1|0;v=o;w=c[o>>2]|0}o=p+4|0;h=m+24|0;t=m+25|0;r=q;s=m+26|0;x=m;y=n+4|0;z=c[f>>2]|0;A=q;q=0;B=w;C=w;a:while(1){if((z|0)!=0){if((c[z+12>>2]|0)==(c[z+16>>2]|0)?(oc[c[(c[z>>2]|0)+36>>2]&63](z)|0)==-1:0){c[f>>2]=0;D=0}else{D=z}}else{D=0}w=(D|0)==0;E=c[g>>2]|0;do{if((E|0)!=0){if((c[E+12>>2]|0)!=(c[E+16>>2]|0)){if(w){break}else{F=C;break a}}if(!((oc[c[(c[E>>2]|0)+36>>2]&63](E)|0)==-1)){if(w){break}else{F=C;break a}}else{c[g>>2]=0;G=19;break}}else{G=19}}while(0);if((G|0)==19?(G=0,w):0){F=C;break}E=a[p]|0;H=(E&1)==0;if(H){I=(E&255)>>>1}else{I=c[o>>2]|0}if((B-C|0)==(I|0)){if(H){J=(E&255)>>>1;K=(E&255)>>>1}else{E=c[o>>2]|0;J=E;K=E}rg(p,J<<1,0);if((a[p]&1)==0){L=10}else{L=(c[p>>2]&-2)+ -1|0}rg(p,L,0);if((a[p]&1)==0){M=u}else{M=c[v>>2]|0}N=M+K|0;O=M}else{N=B;O=C}E=c[D+12>>2]|0;if((E|0)==(c[D+16>>2]|0)){P=oc[c[(c[D>>2]|0)+36>>2]&63](D)|0}else{P=d[E]|0}E=P&255;H=(N|0)==(O|0);do{if(H){Q=(a[h]|0)==E<<24>>24;if(!Q?!((a[t]|0)==E<<24>>24):0){G=40;break}a[N]=Q?43:45;R=N+1|0;S=A;T=0}else{G=40}}while(0);do{if((G|0)==40){G=0;w=a[n]|0;if((w&1)==0){U=(w&255)>>>1}else{U=c[y>>2]|0}if((U|0)!=0&E<<24>>24==0){if((A-r|0)>=160){R=N;S=A;T=q;break}c[A>>2]=q;R=N;S=A+4|0;T=0;break}else{V=m}while(1){w=V+1|0;if((a[V]|0)==E<<24>>24){W=V;break}if((w|0)==(s|0)){W=s;break}else{V=w}}w=W-x|0;if((w|0)>23){F=O;break a}if((w|0)<22){a[N]=a[32648+w|0]|0;R=N+1|0;S=A;T=q+1|0;break}if(H){F=N;break a}if((N-O|0)>=3){F=O;break a}if((a[N+ -1|0]|0)!=48){F=O;break a}a[N]=a[32648+w|0]|0;R=N+1|0;S=A;T=0}}while(0);H=c[f>>2]|0;E=H+12|0;w=c[E>>2]|0;if((w|0)==(c[H+16>>2]|0)){oc[c[(c[H>>2]|0)+40>>2]&63](H)|0;z=H;A=S;q=T;B=R;C=O;continue}else{c[E>>2]=w+1;z=H;A=S;q=T;B=R;C=O;continue}}a[F+3|0]=0;if((a[34e3]|0)==0?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}O=c[8498]|0;c[l>>2]=k;if((ti(F,O,32688,l)|0)!=1){c[j>>2]=4}l=c[f>>2]|0;if((l|0)!=0){if((c[l+12>>2]|0)==(c[l+16>>2]|0)?(oc[c[(c[l>>2]|0)+36>>2]&63](l)|0)==-1:0){c[f>>2]=0;X=0}else{X=l}}else{X=0}l=(X|0)==0;f=c[g>>2]|0;do{if((f|0)!=0){if((c[f+12>>2]|0)!=(c[f+16>>2]|0)){if(!l){break}c[b>>2]=X;pg(p);pg(n);i=e;return}if((oc[c[(c[f>>2]|0)+36>>2]&63](f)|0)==-1){c[g>>2]=0;G=72;break}if(l^(f|0)==0){c[b>>2]=X;pg(p);pg(n);i=e;return}}else{G=72}}while(0);if((G|0)==72?!l:0){c[b>>2]=X;pg(p);pg(n);i=e;return}c[j>>2]=c[j>>2]|2;c[b>>2]=X;pg(p);pg(n);i=e;return}function si(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0;n=i;o=c[f>>2]|0;p=(o|0)==(e|0);do{if(p){q=(a[m+24|0]|0)==b<<24>>24;if(!q?!((a[m+25|0]|0)==b<<24>>24):0){break}c[f>>2]=e+1;a[e]=q?43:45;c[g>>2]=0;r=0;i=n;return r|0}}while(0);q=a[j]|0;if((q&1)==0){s=(q&255)>>>1}else{s=c[j+4>>2]|0}if((s|0)!=0&b<<24>>24==h<<24>>24){h=c[l>>2]|0;if((h-k|0)>=160){r=0;i=n;return r|0}k=c[g>>2]|0;c[l>>2]=h+4;c[h>>2]=k;c[g>>2]=0;r=0;i=n;return r|0}k=m+26|0;h=m;while(1){l=h+1|0;if((a[h]|0)==b<<24>>24){t=h;break}if((l|0)==(k|0)){t=k;break}else{h=l}}h=t-m|0;if((h|0)>23){r=-1;i=n;return r|0}if((d|0)==16){if((h|0)>=22){if(p){r=-1;i=n;return r|0}if((o-e|0)>=3){r=-1;i=n;return r|0}if((a[o+ -1|0]|0)!=48){r=-1;i=n;return r|0}c[g>>2]=0;e=a[32648+h|0]|0;c[f>>2]=o+1;a[o]=e;r=0;i=n;return r|0}}else if((d|0)==10|(d|0)==8?(h|0)>=(d|0):0){r=-1;i=n;return r|0}d=a[32648+h|0]|0;c[f>>2]=o+1;a[o]=d;c[g>>2]=(c[g>>2]|0)+1;r=0;i=n;return r|0}function ti(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;i=i+16|0;g=f;c[g>>2]=e;e=zb(b|0)|0;b=Ea(a|0,d|0,g|0)|0;if((e|0)==0){i=f;return b|0}zb(e|0)|0;i=f;return b|0}function ui(a){a=a|0;var b=0;b=i;Jo(a);i=b;return}function vi(a){a=a|0;return}function wi(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;k=i;i=i+80|0;l=k;m=k+64|0;n=k+60|0;o=k+56|0;p=k+52|0;q=k+48|0;r=k+44|0;s=k+40|0;t=k+16|0;u=k+12|0;if((c[g+4>>2]&1|0)==0){c[n>>2]=-1;v=c[(c[d>>2]|0)+16>>2]|0;c[p>>2]=c[e>>2];c[q>>2]=c[f>>2];c[m+0>>2]=c[p+0>>2];c[l+0>>2]=c[q+0>>2];jc[v&63](o,d,m,l,g,h,n);m=c[o>>2]|0;c[e>>2]=m;o=c[n>>2]|0;if((o|0)==1){a[j]=1}else if((o|0)==0){a[j]=0}else{a[j]=1;c[h>>2]=4}c[b>>2]=m;i=k;return}Jg(r,g);m=c[r>>2]|0;if(!((c[8524]|0)==-1)){c[l>>2]=34096;c[l+4>>2]=118;c[l+8>>2]=0;kg(34096,l,119)}o=(c[34100>>2]|0)+ -1|0;n=c[m+8>>2]|0;if(!((c[m+12>>2]|0)-n>>2>>>0>o>>>0)){w=vb(4)|0;ho(w);cc(w|0,42064,107)}m=c[n+(o<<2)>>2]|0;if((m|0)==0){w=vb(4)|0;ho(w);cc(w|0,42064,107)}Sf(c[r>>2]|0)|0;Jg(s,g);g=c[s>>2]|0;if(!((c[8564]|0)==-1)){c[l>>2]=34256;c[l+4>>2]=118;c[l+8>>2]=0;kg(34256,l,119)}r=(c[34260>>2]|0)+ -1|0;w=c[g+8>>2]|0;if(!((c[g+12>>2]|0)-w>>2>>>0>r>>>0)){x=vb(4)|0;ho(x);cc(x|0,42064,107)}g=c[w+(r<<2)>>2]|0;if((g|0)==0){x=vb(4)|0;ho(x);cc(x|0,42064,107)}Sf(c[s>>2]|0)|0;mc[c[(c[g>>2]|0)+24>>2]&63](t,g);mc[c[(c[g>>2]|0)+28>>2]&63](t+12|0,g);c[u>>2]=c[f>>2];f=t+24|0;c[l+0>>2]=c[u+0>>2];a[j]=(xi(e,l,t,f,m,h,1)|0)==(t|0)|0;c[b>>2]=c[e>>2];Ag(t+12|0);Ag(t);i=k;return}function xi(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0;k=i;i=i+112|0;l=k;m=(f-e|0)/12|0;if(m>>>0>100){n=Co(m)|0;if((n|0)==0){Oo()}else{o=n;p=n}}else{o=0;p=l}l=(e|0)==(f|0);if(l){q=0;r=m}else{n=e;s=0;t=m;m=p;while(1){u=a[n]|0;if((u&1)==0){v=(u&255)>>>1}else{v=c[n+4>>2]|0}if((v|0)==0){a[m]=2;w=s+1|0;x=t+ -1|0}else{a[m]=1;w=s;x=t}u=n+12|0;if((u|0)==(f|0)){q=w;r=x;break}else{n=u;s=w;t=x;m=m+1|0}}}m=0;x=q;q=r;a:while(1){r=c[b>>2]|0;do{if((r|0)!=0){t=c[r+12>>2]|0;if((t|0)==(c[r+16>>2]|0)){y=oc[c[(c[r>>2]|0)+36>>2]&63](r)|0}else{y=c[t>>2]|0}if((y|0)==-1){c[b>>2]=0;z=1;break}else{z=(c[b>>2]|0)==0;break}}else{z=1}}while(0);r=c[d>>2]|0;if((r|0)!=0){t=c[r+12>>2]|0;if((t|0)==(c[r+16>>2]|0)){A=oc[c[(c[r>>2]|0)+36>>2]&63](r)|0}else{A=c[t>>2]|0}if((A|0)==-1){c[d>>2]=0;B=0;C=1}else{B=r;C=0}}else{B=0;C=1}D=c[b>>2]|0;if(!((z^C)&(q|0)!=0)){break}r=c[D+12>>2]|0;if((r|0)==(c[D+16>>2]|0)){E=oc[c[(c[D>>2]|0)+36>>2]&63](D)|0}else{E=c[r>>2]|0}if(j){F=E}else{F=xc[c[(c[g>>2]|0)+28>>2]&31](g,E)|0}r=m+1|0;if(l){m=r;continue}b:do{if(j){t=0;w=e;s=x;n=q;v=p;while(1){do{if((a[v]|0)==1){u=a[w]|0;G=(u&1)==0;if(G){H=w+4|0}else{H=c[w+8>>2]|0}if((F|0)!=(c[H+(m<<2)>>2]|0)){a[v]=0;I=t;J=s;K=n+ -1|0;break}if(G){L=(u&255)>>>1}else{L=c[w+4>>2]|0}if((L|0)==(r|0)){a[v]=2;I=1;J=s+1|0;K=n+ -1|0}else{I=1;J=s;K=n}}else{I=t;J=s;K=n}}while(0);u=w+12|0;if((u|0)==(f|0)){M=I;N=J;O=K;break b}t=I;w=u;s=J;n=K;v=v+1|0}}else{v=0;n=e;s=x;w=q;t=p;while(1){do{if((a[t]|0)==1){if((a[n]&1)==0){P=n+4|0}else{P=c[n+8>>2]|0}if((F|0)!=(xc[c[(c[g>>2]|0)+28>>2]&31](g,c[P+(m<<2)>>2]|0)|0)){a[t]=0;Q=v;R=s;S=w+ -1|0;break}u=a[n]|0;if((u&1)==0){T=(u&255)>>>1}else{T=c[n+4>>2]|0}if((T|0)==(r|0)){a[t]=2;Q=1;R=s+1|0;S=w+ -1|0}else{Q=1;R=s;S=w}}else{Q=v;R=s;S=w}}while(0);u=n+12|0;if((u|0)==(f|0)){M=Q;N=R;O=S;break b}v=Q;n=u;s=R;w=S;t=t+1|0}}}while(0);if(!M){m=r;x=N;q=O;continue}t=c[b>>2]|0;w=t+12|0;s=c[w>>2]|0;if((s|0)==(c[t+16>>2]|0)){oc[c[(c[t>>2]|0)+40>>2]&63](t)|0}else{c[w>>2]=s+4}if((O+N|0)>>>0<2){m=r;x=N;q=O;continue}else{U=e;V=N;W=p}while(1){if((a[W]|0)==2){s=a[U]|0;if((s&1)==0){X=(s&255)>>>1}else{X=c[U+4>>2]|0}if((X|0)!=(r|0)){a[W]=0;Y=V+ -1|0}else{Y=V}}else{Y=V}s=U+12|0;if((s|0)==(f|0)){m=r;x=Y;q=O;continue a}else{U=s;V=Y;W=W+1|0}}}do{if((D|0)!=0){W=c[D+12>>2]|0;if((W|0)==(c[D+16>>2]|0)){Z=oc[c[(c[D>>2]|0)+36>>2]&63](D)|0}else{Z=c[W>>2]|0}if((Z|0)==-1){c[b>>2]=0;_=1;break}else{_=(c[b>>2]|0)==0;break}}else{_=1}}while(0);do{if((B|0)!=0){b=c[B+12>>2]|0;if((b|0)==(c[B+16>>2]|0)){$=oc[c[(c[B>>2]|0)+36>>2]&63](B)|0}else{$=c[b>>2]|0}if(!(($|0)==-1)){if(_){break}else{aa=87;break}}else{c[d>>2]=0;aa=85;break}}else{aa=85}}while(0);if((aa|0)==85?_:0){aa=87}if((aa|0)==87){c[h>>2]=c[h>>2]|2}c:do{if(!l){if((a[p]|0)==2){ba=e}else{_=e;d=p;while(1){$=_+12|0;B=d+1|0;if(($|0)==(f|0)){aa=92;break c}if((a[B]|0)==2){ba=$;break}else{_=$;d=B}}}}else{aa=92}}while(0);if((aa|0)==92){c[h>>2]=c[h>>2]|4;ba=f}if((o|0)==0){i=k;return ba|0}Do(o);i=k;return ba|0}function yi(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+16|0;j=b+12|0;k=b+8|0;l=b+4|0;m=b;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];c[k+0>>2]=c[l+0>>2];c[j+0>>2]=c[m+0>>2];zi(a,0,k,j,f,g,h);i=b;return}function zi(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0;d=i;i=i+304|0;k=d+200|0;l=d+196|0;m=d+184|0;n=d+172|0;o=d+168|0;p=d+8|0;q=d+4|0;r=d;s=c[g+4>>2]&74;if((s|0)==0){t=0}else if((s|0)==8){t=16}else if((s|0)==64){t=8}else{t=10}Vi(m,g,k,l);c[n+0>>2]=0;c[n+4>>2]=0;c[n+8>>2]=0;rg(n,10,0);if((a[n]&1)==0){g=n+1|0;u=g;v=n+8|0;w=g}else{g=n+8|0;u=n+1|0;v=g;w=c[g>>2]|0}c[o>>2]=w;c[q>>2]=p;c[r>>2]=0;g=n+4|0;s=c[l>>2]|0;l=c[e>>2]|0;x=w;a:while(1){if((l|0)!=0){w=c[l+12>>2]|0;if((w|0)==(c[l+16>>2]|0)){y=oc[c[(c[l>>2]|0)+36>>2]&63](l)|0}else{y=c[w>>2]|0}if((y|0)==-1){c[e>>2]=0;z=1;A=0}else{z=0;A=l}}else{z=1;A=0}w=c[f>>2]|0;do{if((w|0)!=0){B=c[w+12>>2]|0;if((B|0)==(c[w+16>>2]|0)){C=oc[c[(c[w>>2]|0)+36>>2]&63](w)|0}else{C=c[B>>2]|0}if(!((C|0)==-1)){if(z){D=w;break}else{E=w;F=x;break a}}else{c[f>>2]=0;G=21;break}}else{G=21}}while(0);if((G|0)==21){G=0;if(z){E=0;F=x;break}else{D=0}}w=a[n]|0;B=(w&1)==0;if(B){H=(w&255)>>>1}else{H=c[g>>2]|0}if(((c[o>>2]|0)-x|0)==(H|0)){if(B){I=(w&255)>>>1;J=(w&255)>>>1}else{w=c[g>>2]|0;I=w;J=w}rg(n,I<<1,0);if((a[n]&1)==0){K=10}else{K=(c[n>>2]&-2)+ -1|0}rg(n,K,0);if((a[n]&1)==0){L=u}else{L=c[v>>2]|0}c[o>>2]=L+J;M=L}else{M=x}w=A+12|0;B=c[w>>2]|0;N=A+16|0;if((B|0)==(c[N>>2]|0)){O=oc[c[(c[A>>2]|0)+36>>2]&63](A)|0}else{O=c[B>>2]|0}if((Ri(O,t,M,o,r,s,m,p,q,k)|0)!=0){E=D;F=M;break}B=c[w>>2]|0;if((B|0)==(c[N>>2]|0)){oc[c[(c[A>>2]|0)+40>>2]&63](A)|0;l=A;x=M;continue}else{c[w>>2]=B+4;l=A;x=M;continue}}M=a[m]|0;if((M&1)==0){P=(M&255)>>>1}else{P=c[m+4>>2]|0}if((P|0)!=0?(P=c[q>>2]|0,(P-p|0)<160):0){M=c[r>>2]|0;c[q>>2]=P+4;c[P>>2]=M}c[j>>2]=Mn(F,c[o>>2]|0,h,t)|0;cl(m,p,c[q>>2]|0,h);if((A|0)!=0){q=c[A+12>>2]|0;if((q|0)==(c[A+16>>2]|0)){Q=oc[c[(c[A>>2]|0)+36>>2]&63](A)|0}else{Q=c[q>>2]|0}if((Q|0)==-1){c[e>>2]=0;R=0;S=1}else{R=A;S=0}}else{R=0;S=1}do{if((E|0)!=0){A=c[E+12>>2]|0;if((A|0)==(c[E+16>>2]|0)){T=oc[c[(c[E>>2]|0)+36>>2]&63](E)|0}else{T=c[A>>2]|0}if((T|0)==-1){c[f>>2]=0;G=60;break}if(S){c[b>>2]=R;pg(n);pg(m);i=d;return}}else{G=60}}while(0);if((G|0)==60?!S:0){c[b>>2]=R;pg(n);pg(m);i=d;return}c[h>>2]=c[h>>2]|2;c[b>>2]=R;pg(n);pg(m);i=d;return}function Ai(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+16|0;j=b+12|0;k=b+8|0;l=b+4|0;m=b;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];c[k+0>>2]=c[l+0>>2];c[j+0>>2]=c[m+0>>2];Bi(a,0,k,j,f,g,h);i=b;return}function Bi(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0;d=i;i=i+304|0;k=d+200|0;l=d+196|0;m=d+184|0;n=d+172|0;o=d+168|0;p=d+8|0;q=d+4|0;r=d;s=c[g+4>>2]&74;if((s|0)==8){t=16}else if((s|0)==0){t=0}else if((s|0)==64){t=8}else{t=10}Vi(m,g,k,l);c[n+0>>2]=0;c[n+4>>2]=0;c[n+8>>2]=0;rg(n,10,0);if((a[n]&1)==0){g=n+1|0;u=g;v=n+8|0;w=g}else{g=n+8|0;u=n+1|0;v=g;w=c[g>>2]|0}c[o>>2]=w;c[q>>2]=p;c[r>>2]=0;g=n+4|0;s=c[l>>2]|0;l=c[e>>2]|0;x=w;a:while(1){if((l|0)!=0){w=c[l+12>>2]|0;if((w|0)==(c[l+16>>2]|0)){y=oc[c[(c[l>>2]|0)+36>>2]&63](l)|0}else{y=c[w>>2]|0}if((y|0)==-1){c[e>>2]=0;z=1;A=0}else{z=0;A=l}}else{z=1;A=0}w=c[f>>2]|0;do{if((w|0)!=0){B=c[w+12>>2]|0;if((B|0)==(c[w+16>>2]|0)){C=oc[c[(c[w>>2]|0)+36>>2]&63](w)|0}else{C=c[B>>2]|0}if(!((C|0)==-1)){if(z){D=w;break}else{E=w;F=x;break a}}else{c[f>>2]=0;G=21;break}}else{G=21}}while(0);if((G|0)==21){G=0;if(z){E=0;F=x;break}else{D=0}}w=a[n]|0;B=(w&1)==0;if(B){H=(w&255)>>>1}else{H=c[g>>2]|0}if(((c[o>>2]|0)-x|0)==(H|0)){if(B){I=(w&255)>>>1;K=(w&255)>>>1}else{w=c[g>>2]|0;I=w;K=w}rg(n,I<<1,0);if((a[n]&1)==0){L=10}else{L=(c[n>>2]&-2)+ -1|0}rg(n,L,0);if((a[n]&1)==0){M=u}else{M=c[v>>2]|0}c[o>>2]=M+K;N=M}else{N=x}w=A+12|0;B=c[w>>2]|0;O=A+16|0;if((B|0)==(c[O>>2]|0)){P=oc[c[(c[A>>2]|0)+36>>2]&63](A)|0}else{P=c[B>>2]|0}if((Ri(P,t,N,o,r,s,m,p,q,k)|0)!=0){E=D;F=N;break}B=c[w>>2]|0;if((B|0)==(c[O>>2]|0)){oc[c[(c[A>>2]|0)+40>>2]&63](A)|0;l=A;x=N;continue}else{c[w>>2]=B+4;l=A;x=N;continue}}N=a[m]|0;if((N&1)==0){Q=(N&255)>>>1}else{Q=c[m+4>>2]|0}if((Q|0)!=0?(Q=c[q>>2]|0,(Q-p|0)<160):0){N=c[r>>2]|0;c[q>>2]=Q+4;c[Q>>2]=N}N=Ln(F,c[o>>2]|0,h,t)|0;t=j;c[t>>2]=N;c[t+4>>2]=J;cl(m,p,c[q>>2]|0,h);if((A|0)!=0){q=c[A+12>>2]|0;if((q|0)==(c[A+16>>2]|0)){R=oc[c[(c[A>>2]|0)+36>>2]&63](A)|0}else{R=c[q>>2]|0}if((R|0)==-1){c[e>>2]=0;S=0;T=1}else{S=A;T=0}}else{S=0;T=1}do{if((E|0)!=0){A=c[E+12>>2]|0;if((A|0)==(c[E+16>>2]|0)){U=oc[c[(c[E>>2]|0)+36>>2]&63](E)|0}else{U=c[A>>2]|0}if((U|0)==-1){c[f>>2]=0;G=60;break}if(T){c[b>>2]=S;pg(n);pg(m);i=d;return}}else{G=60}}while(0);if((G|0)==60?!T:0){c[b>>2]=S;pg(n);pg(m);i=d;return}c[h>>2]=c[h>>2]|2;c[b>>2]=S;pg(n);pg(m);i=d;return}function Ci(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+16|0;j=b+12|0;k=b+8|0;l=b+4|0;m=b;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];c[k+0>>2]=c[l+0>>2];c[j+0>>2]=c[m+0>>2];Di(a,0,k,j,f,g,h);i=b;return}function Di(d,e,f,g,h,j,k){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0;e=i;i=i+304|0;l=e+200|0;m=e+196|0;n=e+184|0;o=e+172|0;p=e+168|0;q=e+8|0;r=e+4|0;s=e;t=c[h+4>>2]&74;if((t|0)==8){u=16}else if((t|0)==0){u=0}else if((t|0)==64){u=8}else{u=10}Vi(n,h,l,m);c[o+0>>2]=0;c[o+4>>2]=0;c[o+8>>2]=0;rg(o,10,0);if((a[o]&1)==0){h=o+1|0;v=h;w=o+8|0;x=h}else{h=o+8|0;v=o+1|0;w=h;x=c[h>>2]|0}c[p>>2]=x;c[r>>2]=q;c[s>>2]=0;h=o+4|0;t=c[m>>2]|0;m=c[f>>2]|0;y=x;a:while(1){if((m|0)!=0){x=c[m+12>>2]|0;if((x|0)==(c[m+16>>2]|0)){z=oc[c[(c[m>>2]|0)+36>>2]&63](m)|0}else{z=c[x>>2]|0}if((z|0)==-1){c[f>>2]=0;A=1;B=0}else{A=0;B=m}}else{A=1;B=0}x=c[g>>2]|0;do{if((x|0)!=0){C=c[x+12>>2]|0;if((C|0)==(c[x+16>>2]|0)){D=oc[c[(c[x>>2]|0)+36>>2]&63](x)|0}else{D=c[C>>2]|0}if(!((D|0)==-1)){if(A){E=x;break}else{F=x;G=y;break a}}else{c[g>>2]=0;H=21;break}}else{H=21}}while(0);if((H|0)==21){H=0;if(A){F=0;G=y;break}else{E=0}}x=a[o]|0;C=(x&1)==0;if(C){I=(x&255)>>>1}else{I=c[h>>2]|0}if(((c[p>>2]|0)-y|0)==(I|0)){if(C){J=(x&255)>>>1;K=(x&255)>>>1}else{x=c[h>>2]|0;J=x;K=x}rg(o,J<<1,0);if((a[o]&1)==0){L=10}else{L=(c[o>>2]&-2)+ -1|0}rg(o,L,0);if((a[o]&1)==0){M=v}else{M=c[w>>2]|0}c[p>>2]=M+K;N=M}else{N=y}x=B+12|0;C=c[x>>2]|0;O=B+16|0;if((C|0)==(c[O>>2]|0)){P=oc[c[(c[B>>2]|0)+36>>2]&63](B)|0}else{P=c[C>>2]|0}if((Ri(P,u,N,p,s,t,n,q,r,l)|0)!=0){F=E;G=N;break}C=c[x>>2]|0;if((C|0)==(c[O>>2]|0)){oc[c[(c[B>>2]|0)+40>>2]&63](B)|0;m=B;y=N;continue}else{c[x>>2]=C+4;m=B;y=N;continue}}N=a[n]|0;if((N&1)==0){Q=(N&255)>>>1}else{Q=c[n+4>>2]|0}if((Q|0)!=0?(Q=c[r>>2]|0,(Q-q|0)<160):0){N=c[s>>2]|0;c[r>>2]=Q+4;c[Q>>2]=N}b[k>>1]=Kn(G,c[p>>2]|0,j,u)|0;cl(n,q,c[r>>2]|0,j);if((B|0)!=0){r=c[B+12>>2]|0;if((r|0)==(c[B+16>>2]|0)){R=oc[c[(c[B>>2]|0)+36>>2]&63](B)|0}else{R=c[r>>2]|0}if((R|0)==-1){c[f>>2]=0;S=0;T=1}else{S=B;T=0}}else{S=0;T=1}do{if((F|0)!=0){B=c[F+12>>2]|0;if((B|0)==(c[F+16>>2]|0)){U=oc[c[(c[F>>2]|0)+36>>2]&63](F)|0}else{U=c[B>>2]|0}if((U|0)==-1){c[g>>2]=0;H=60;break}if(T){c[d>>2]=S;pg(o);pg(n);i=e;return}}else{H=60}}while(0);if((H|0)==60?!T:0){c[d>>2]=S;pg(o);pg(n);i=e;return}c[j>>2]=c[j>>2]|2;c[d>>2]=S;pg(o);pg(n);i=e;return}function Ei(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+16|0;j=b+12|0;k=b+8|0;l=b+4|0;m=b;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];c[k+0>>2]=c[l+0>>2];c[j+0>>2]=c[m+0>>2];Fi(a,0,k,j,f,g,h);i=b;return}function Fi(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0;d=i;i=i+304|0;k=d+200|0;l=d+196|0;m=d+184|0;n=d+172|0;o=d+168|0;p=d+8|0;q=d+4|0;r=d;s=c[g+4>>2]&74;if((s|0)==64){t=8}else if((s|0)==0){t=0}else if((s|0)==8){t=16}else{t=10}Vi(m,g,k,l);c[n+0>>2]=0;c[n+4>>2]=0;c[n+8>>2]=0;rg(n,10,0);if((a[n]&1)==0){g=n+1|0;u=g;v=n+8|0;w=g}else{g=n+8|0;u=n+1|0;v=g;w=c[g>>2]|0}c[o>>2]=w;c[q>>2]=p;c[r>>2]=0;g=n+4|0;s=c[l>>2]|0;l=c[e>>2]|0;x=w;a:while(1){if((l|0)!=0){w=c[l+12>>2]|0;if((w|0)==(c[l+16>>2]|0)){y=oc[c[(c[l>>2]|0)+36>>2]&63](l)|0}else{y=c[w>>2]|0}if((y|0)==-1){c[e>>2]=0;z=1;A=0}else{z=0;A=l}}else{z=1;A=0}w=c[f>>2]|0;do{if((w|0)!=0){B=c[w+12>>2]|0;if((B|0)==(c[w+16>>2]|0)){C=oc[c[(c[w>>2]|0)+36>>2]&63](w)|0}else{C=c[B>>2]|0}if(!((C|0)==-1)){if(z){D=w;break}else{E=w;F=x;break a}}else{c[f>>2]=0;G=21;break}}else{G=21}}while(0);if((G|0)==21){G=0;if(z){E=0;F=x;break}else{D=0}}w=a[n]|0;B=(w&1)==0;if(B){H=(w&255)>>>1}else{H=c[g>>2]|0}if(((c[o>>2]|0)-x|0)==(H|0)){if(B){I=(w&255)>>>1;J=(w&255)>>>1}else{w=c[g>>2]|0;I=w;J=w}rg(n,I<<1,0);if((a[n]&1)==0){K=10}else{K=(c[n>>2]&-2)+ -1|0}rg(n,K,0);if((a[n]&1)==0){L=u}else{L=c[v>>2]|0}c[o>>2]=L+J;M=L}else{M=x}w=A+12|0;B=c[w>>2]|0;N=A+16|0;if((B|0)==(c[N>>2]|0)){O=oc[c[(c[A>>2]|0)+36>>2]&63](A)|0}else{O=c[B>>2]|0}if((Ri(O,t,M,o,r,s,m,p,q,k)|0)!=0){E=D;F=M;break}B=c[w>>2]|0;if((B|0)==(c[N>>2]|0)){oc[c[(c[A>>2]|0)+40>>2]&63](A)|0;l=A;x=M;continue}else{c[w>>2]=B+4;l=A;x=M;continue}}M=a[m]|0;if((M&1)==0){P=(M&255)>>>1}else{P=c[m+4>>2]|0}if((P|0)!=0?(P=c[q>>2]|0,(P-p|0)<160):0){M=c[r>>2]|0;c[q>>2]=P+4;c[P>>2]=M}c[j>>2]=Jn(F,c[o>>2]|0,h,t)|0;cl(m,p,c[q>>2]|0,h);if((A|0)!=0){q=c[A+12>>2]|0;if((q|0)==(c[A+16>>2]|0)){Q=oc[c[(c[A>>2]|0)+36>>2]&63](A)|0}else{Q=c[q>>2]|0}if((Q|0)==-1){c[e>>2]=0;R=0;S=1}else{R=A;S=0}}else{R=0;S=1}do{if((E|0)!=0){A=c[E+12>>2]|0;if((A|0)==(c[E+16>>2]|0)){T=oc[c[(c[E>>2]|0)+36>>2]&63](E)|0}else{T=c[A>>2]|0}if((T|0)==-1){c[f>>2]=0;G=60;break}if(S){c[b>>2]=R;pg(n);pg(m);i=d;return}}else{G=60}}while(0);if((G|0)==60?!S:0){c[b>>2]=R;pg(n);pg(m);i=d;return}c[h>>2]=c[h>>2]|2;c[b>>2]=R;pg(n);pg(m);i=d;return}function Gi(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+16|0;j=b+12|0;k=b+8|0;l=b+4|0;m=b;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];c[k+0>>2]=c[l+0>>2];c[j+0>>2]=c[m+0>>2];Hi(a,0,k,j,f,g,h);i=b;return}function Hi(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0;d=i;i=i+304|0;k=d+200|0;l=d+196|0;m=d+184|0;n=d+172|0;o=d+168|0;p=d+8|0;q=d+4|0;r=d;s=c[g+4>>2]&74;if((s|0)==8){t=16}else if((s|0)==64){t=8}else if((s|0)==0){t=0}else{t=10}Vi(m,g,k,l);c[n+0>>2]=0;c[n+4>>2]=0;c[n+8>>2]=0;rg(n,10,0);if((a[n]&1)==0){g=n+1|0;u=g;v=n+8|0;w=g}else{g=n+8|0;u=n+1|0;v=g;w=c[g>>2]|0}c[o>>2]=w;c[q>>2]=p;c[r>>2]=0;g=n+4|0;s=c[l>>2]|0;l=c[e>>2]|0;x=w;a:while(1){if((l|0)!=0){w=c[l+12>>2]|0;if((w|0)==(c[l+16>>2]|0)){y=oc[c[(c[l>>2]|0)+36>>2]&63](l)|0}else{y=c[w>>2]|0}if((y|0)==-1){c[e>>2]=0;z=1;A=0}else{z=0;A=l}}else{z=1;A=0}w=c[f>>2]|0;do{if((w|0)!=0){B=c[w+12>>2]|0;if((B|0)==(c[w+16>>2]|0)){C=oc[c[(c[w>>2]|0)+36>>2]&63](w)|0}else{C=c[B>>2]|0}if(!((C|0)==-1)){if(z){D=w;break}else{E=w;F=x;break a}}else{c[f>>2]=0;G=21;break}}else{G=21}}while(0);if((G|0)==21){G=0;if(z){E=0;F=x;break}else{D=0}}w=a[n]|0;B=(w&1)==0;if(B){H=(w&255)>>>1}else{H=c[g>>2]|0}if(((c[o>>2]|0)-x|0)==(H|0)){if(B){I=(w&255)>>>1;J=(w&255)>>>1}else{w=c[g>>2]|0;I=w;J=w}rg(n,I<<1,0);if((a[n]&1)==0){K=10}else{K=(c[n>>2]&-2)+ -1|0}rg(n,K,0);if((a[n]&1)==0){L=u}else{L=c[v>>2]|0}c[o>>2]=L+J;M=L}else{M=x}w=A+12|0;B=c[w>>2]|0;N=A+16|0;if((B|0)==(c[N>>2]|0)){O=oc[c[(c[A>>2]|0)+36>>2]&63](A)|0}else{O=c[B>>2]|0}if((Ri(O,t,M,o,r,s,m,p,q,k)|0)!=0){E=D;F=M;break}B=c[w>>2]|0;if((B|0)==(c[N>>2]|0)){oc[c[(c[A>>2]|0)+40>>2]&63](A)|0;l=A;x=M;continue}else{c[w>>2]=B+4;l=A;x=M;continue}}M=a[m]|0;if((M&1)==0){P=(M&255)>>>1}else{P=c[m+4>>2]|0}if((P|0)!=0?(P=c[q>>2]|0,(P-p|0)<160):0){M=c[r>>2]|0;c[q>>2]=P+4;c[P>>2]=M}c[j>>2]=In(F,c[o>>2]|0,h,t)|0;cl(m,p,c[q>>2]|0,h);if((A|0)!=0){q=c[A+12>>2]|0;if((q|0)==(c[A+16>>2]|0)){Q=oc[c[(c[A>>2]|0)+36>>2]&63](A)|0}else{Q=c[q>>2]|0}if((Q|0)==-1){c[e>>2]=0;R=0;S=1}else{R=A;S=0}}else{R=0;S=1}do{if((E|0)!=0){A=c[E+12>>2]|0;if((A|0)==(c[E+16>>2]|0)){T=oc[c[(c[E>>2]|0)+36>>2]&63](E)|0}else{T=c[A>>2]|0}if((T|0)==-1){c[f>>2]=0;G=60;break}if(S){c[b>>2]=R;pg(n);pg(m);i=d;return}}else{G=60}}while(0);if((G|0)==60?!S:0){c[b>>2]=R;pg(n);pg(m);i=d;return}c[h>>2]=c[h>>2]|2;c[b>>2]=R;pg(n);pg(m);i=d;return}function Ii(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+16|0;j=b+12|0;k=b+8|0;l=b+4|0;m=b;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];c[k+0>>2]=c[l+0>>2];c[j+0>>2]=c[m+0>>2];Ji(a,0,k,j,f,g,h);i=b;return}function Ji(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0;d=i;i=i+304|0;k=d+200|0;l=d+196|0;m=d+184|0;n=d+172|0;o=d+168|0;p=d+8|0;q=d+4|0;r=d;s=c[g+4>>2]&74;if((s|0)==0){t=0}else if((s|0)==64){t=8}else if((s|0)==8){t=16}else{t=10}Vi(m,g,k,l);c[n+0>>2]=0;c[n+4>>2]=0;c[n+8>>2]=0;rg(n,10,0);if((a[n]&1)==0){g=n+1|0;u=g;v=n+8|0;w=g}else{g=n+8|0;u=n+1|0;v=g;w=c[g>>2]|0}c[o>>2]=w;c[q>>2]=p;c[r>>2]=0;g=n+4|0;s=c[l>>2]|0;l=c[e>>2]|0;x=w;a:while(1){if((l|0)!=0){w=c[l+12>>2]|0;if((w|0)==(c[l+16>>2]|0)){y=oc[c[(c[l>>2]|0)+36>>2]&63](l)|0}else{y=c[w>>2]|0}if((y|0)==-1){c[e>>2]=0;z=1;A=0}else{z=0;A=l}}else{z=1;A=0}w=c[f>>2]|0;do{if((w|0)!=0){B=c[w+12>>2]|0;if((B|0)==(c[w+16>>2]|0)){C=oc[c[(c[w>>2]|0)+36>>2]&63](w)|0}else{C=c[B>>2]|0}if(!((C|0)==-1)){if(z){D=w;break}else{E=w;F=x;break a}}else{c[f>>2]=0;G=21;break}}else{G=21}}while(0);if((G|0)==21){G=0;if(z){E=0;F=x;break}else{D=0}}w=a[n]|0;B=(w&1)==0;if(B){H=(w&255)>>>1}else{H=c[g>>2]|0}if(((c[o>>2]|0)-x|0)==(H|0)){if(B){I=(w&255)>>>1;K=(w&255)>>>1}else{w=c[g>>2]|0;I=w;K=w}rg(n,I<<1,0);if((a[n]&1)==0){L=10}else{L=(c[n>>2]&-2)+ -1|0}rg(n,L,0);if((a[n]&1)==0){M=u}else{M=c[v>>2]|0}c[o>>2]=M+K;N=M}else{N=x}w=A+12|0;B=c[w>>2]|0;O=A+16|0;if((B|0)==(c[O>>2]|0)){P=oc[c[(c[A>>2]|0)+36>>2]&63](A)|0}else{P=c[B>>2]|0}if((Ri(P,t,N,o,r,s,m,p,q,k)|0)!=0){E=D;F=N;break}B=c[w>>2]|0;if((B|0)==(c[O>>2]|0)){oc[c[(c[A>>2]|0)+40>>2]&63](A)|0;l=A;x=N;continue}else{c[w>>2]=B+4;l=A;x=N;continue}}N=a[m]|0;if((N&1)==0){Q=(N&255)>>>1}else{Q=c[m+4>>2]|0}if((Q|0)!=0?(Q=c[q>>2]|0,(Q-p|0)<160):0){N=c[r>>2]|0;c[q>>2]=Q+4;c[Q>>2]=N}N=Hn(F,c[o>>2]|0,h,t)|0;t=j;c[t>>2]=N;c[t+4>>2]=J;cl(m,p,c[q>>2]|0,h);if((A|0)!=0){q=c[A+12>>2]|0;if((q|0)==(c[A+16>>2]|0)){R=oc[c[(c[A>>2]|0)+36>>2]&63](A)|0}else{R=c[q>>2]|0}if((R|0)==-1){c[e>>2]=0;S=0;T=1}else{S=A;T=0}}else{S=0;T=1}do{if((E|0)!=0){A=c[E+12>>2]|0;if((A|0)==(c[E+16>>2]|0)){U=oc[c[(c[E>>2]|0)+36>>2]&63](E)|0}else{U=c[A>>2]|0}if((U|0)==-1){c[f>>2]=0;G=60;break}if(T){c[b>>2]=S;pg(n);pg(m);i=d;return}}else{G=60}}while(0);if((G|0)==60?!T:0){c[b>>2]=S;pg(n);pg(m);i=d;return}c[h>>2]=c[h>>2]|2;c[b>>2]=S;pg(n);pg(m);i=d;return}function Ki(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+16|0;j=b+12|0;k=b+8|0;l=b+4|0;m=b;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];c[k+0>>2]=c[l+0>>2];c[j+0>>2]=c[m+0>>2];Li(a,0,k,j,f,g,h);i=b;return}function Li(b,d,e,f,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0;d=i;i=i+352|0;l=d+208|0;m=d+200|0;n=d+196|0;o=d+184|0;p=d+172|0;q=d+168|0;r=d+8|0;s=d+4|0;t=d;u=d+337|0;v=d+336|0;Wi(o,h,l,m,n);c[p+0>>2]=0;c[p+4>>2]=0;c[p+8>>2]=0;rg(p,10,0);if((a[p]&1)==0){h=p+1|0;w=h;x=p+8|0;y=h}else{h=p+8|0;w=p+1|0;x=h;y=c[h>>2]|0}c[q>>2]=y;c[s>>2]=r;c[t>>2]=0;a[u]=1;a[v]=69;h=p+4|0;z=c[m>>2]|0;m=c[n>>2]|0;n=c[e>>2]|0;A=y;a:while(1){if((n|0)!=0){y=c[n+12>>2]|0;if((y|0)==(c[n+16>>2]|0)){B=oc[c[(c[n>>2]|0)+36>>2]&63](n)|0}else{B=c[y>>2]|0}if((B|0)==-1){c[e>>2]=0;C=1;D=0}else{C=0;D=n}}else{C=1;D=0}y=c[f>>2]|0;do{if((y|0)!=0){E=c[y+12>>2]|0;if((E|0)==(c[y+16>>2]|0)){F=oc[c[(c[y>>2]|0)+36>>2]&63](y)|0}else{F=c[E>>2]|0}if(!((F|0)==-1)){if(C){G=y;break}else{H=y;I=A;break a}}else{c[f>>2]=0;J=17;break}}else{J=17}}while(0);if((J|0)==17){J=0;if(C){H=0;I=A;break}else{G=0}}y=a[p]|0;E=(y&1)==0;if(E){K=(y&255)>>>1}else{K=c[h>>2]|0}if(((c[q>>2]|0)-A|0)==(K|0)){if(E){L=(y&255)>>>1;M=(y&255)>>>1}else{y=c[h>>2]|0;L=y;M=y}rg(p,L<<1,0);if((a[p]&1)==0){N=10}else{N=(c[p>>2]&-2)+ -1|0}rg(p,N,0);if((a[p]&1)==0){O=w}else{O=c[x>>2]|0}c[q>>2]=O+M;P=O}else{P=A}y=D+12|0;E=c[y>>2]|0;Q=D+16|0;if((E|0)==(c[Q>>2]|0)){R=oc[c[(c[D>>2]|0)+36>>2]&63](D)|0}else{R=c[E>>2]|0}if((Xi(R,u,v,P,q,z,m,o,r,s,t,l)|0)!=0){H=G;I=P;break}E=c[y>>2]|0;if((E|0)==(c[Q>>2]|0)){oc[c[(c[D>>2]|0)+40>>2]&63](D)|0;n=D;A=P;continue}else{c[y>>2]=E+4;n=D;A=P;continue}}P=a[o]|0;if((P&1)==0){S=(P&255)>>>1}else{S=c[o+4>>2]|0}if(((S|0)!=0?(a[u]|0)!=0:0)?(u=c[s>>2]|0,(u-r|0)<160):0){S=c[t>>2]|0;c[s>>2]=u+4;c[u>>2]=S}g[k>>2]=+Gn(I,c[q>>2]|0,j);cl(o,r,c[s>>2]|0,j);if((D|0)!=0){s=c[D+12>>2]|0;if((s|0)==(c[D+16>>2]|0)){T=oc[c[(c[D>>2]|0)+36>>2]&63](D)|0}else{T=c[s>>2]|0}if((T|0)==-1){c[e>>2]=0;U=0;V=1}else{U=D;V=0}}else{U=0;V=1}do{if((H|0)!=0){D=c[H+12>>2]|0;if((D|0)==(c[H+16>>2]|0)){W=oc[c[(c[H>>2]|0)+36>>2]&63](H)|0}else{W=c[D>>2]|0}if((W|0)==-1){c[f>>2]=0;J=57;break}if(V){c[b>>2]=U;pg(p);pg(o);i=d;return}}else{J=57}}while(0);if((J|0)==57?!V:0){c[b>>2]=U;pg(p);pg(o);i=d;return}c[j>>2]=c[j>>2]|2;c[b>>2]=U;pg(p);pg(o);i=d;return}function Mi(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+16|0;j=b+12|0;k=b+8|0;l=b+4|0;m=b;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];c[k+0>>2]=c[l+0>>2];c[j+0>>2]=c[m+0>>2];Ni(a,0,k,j,f,g,h);i=b;return}function Ni(b,d,e,f,g,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0;d=i;i=i+352|0;l=d+208|0;m=d+200|0;n=d+196|0;o=d+184|0;p=d+172|0;q=d+168|0;r=d+8|0;s=d+4|0;t=d;u=d+337|0;v=d+336|0;Wi(o,g,l,m,n);c[p+0>>2]=0;c[p+4>>2]=0;c[p+8>>2]=0;rg(p,10,0);if((a[p]&1)==0){g=p+1|0;w=g;x=p+8|0;y=g}else{g=p+8|0;w=p+1|0;x=g;y=c[g>>2]|0}c[q>>2]=y;c[s>>2]=r;c[t>>2]=0;a[u]=1;a[v]=69;g=p+4|0;z=c[m>>2]|0;m=c[n>>2]|0;n=c[e>>2]|0;A=y;a:while(1){if((n|0)!=0){y=c[n+12>>2]|0;if((y|0)==(c[n+16>>2]|0)){B=oc[c[(c[n>>2]|0)+36>>2]&63](n)|0}else{B=c[y>>2]|0}if((B|0)==-1){c[e>>2]=0;C=1;D=0}else{C=0;D=n}}else{C=1;D=0}y=c[f>>2]|0;do{if((y|0)!=0){E=c[y+12>>2]|0;if((E|0)==(c[y+16>>2]|0)){F=oc[c[(c[y>>2]|0)+36>>2]&63](y)|0}else{F=c[E>>2]|0}if(!((F|0)==-1)){if(C){G=y;break}else{H=y;I=A;break a}}else{c[f>>2]=0;J=17;break}}else{J=17}}while(0);if((J|0)==17){J=0;if(C){H=0;I=A;break}else{G=0}}y=a[p]|0;E=(y&1)==0;if(E){K=(y&255)>>>1}else{K=c[g>>2]|0}if(((c[q>>2]|0)-A|0)==(K|0)){if(E){L=(y&255)>>>1;M=(y&255)>>>1}else{y=c[g>>2]|0;L=y;M=y}rg(p,L<<1,0);if((a[p]&1)==0){N=10}else{N=(c[p>>2]&-2)+ -1|0}rg(p,N,0);if((a[p]&1)==0){O=w}else{O=c[x>>2]|0}c[q>>2]=O+M;P=O}else{P=A}y=D+12|0;E=c[y>>2]|0;Q=D+16|0;if((E|0)==(c[Q>>2]|0)){R=oc[c[(c[D>>2]|0)+36>>2]&63](D)|0}else{R=c[E>>2]|0}if((Xi(R,u,v,P,q,z,m,o,r,s,t,l)|0)!=0){H=G;I=P;break}E=c[y>>2]|0;if((E|0)==(c[Q>>2]|0)){oc[c[(c[D>>2]|0)+40>>2]&63](D)|0;n=D;A=P;continue}else{c[y>>2]=E+4;n=D;A=P;continue}}P=a[o]|0;if((P&1)==0){S=(P&255)>>>1}else{S=c[o+4>>2]|0}if(((S|0)!=0?(a[u]|0)!=0:0)?(u=c[s>>2]|0,(u-r|0)<160):0){S=c[t>>2]|0;c[s>>2]=u+4;c[u>>2]=S}h[k>>3]=+Fn(I,c[q>>2]|0,j);cl(o,r,c[s>>2]|0,j);if((D|0)!=0){s=c[D+12>>2]|0;if((s|0)==(c[D+16>>2]|0)){T=oc[c[(c[D>>2]|0)+36>>2]&63](D)|0}else{T=c[s>>2]|0}if((T|0)==-1){c[e>>2]=0;U=0;V=1}else{U=D;V=0}}else{U=0;V=1}do{if((H|0)!=0){D=c[H+12>>2]|0;if((D|0)==(c[H+16>>2]|0)){W=oc[c[(c[H>>2]|0)+36>>2]&63](H)|0}else{W=c[D>>2]|0}if((W|0)==-1){c[f>>2]=0;J=57;break}if(V){c[b>>2]=U;pg(p);pg(o);i=d;return}}else{J=57}}while(0);if((J|0)==57?!V:0){c[b>>2]=U;pg(p);pg(o);i=d;return}c[j>>2]=c[j>>2]|2;c[b>>2]=U;pg(p);pg(o);i=d;return}function Oi(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+16|0;j=b+12|0;k=b+8|0;l=b+4|0;m=b;c[l>>2]=c[d>>2];c[m>>2]=c[e>>2];c[k+0>>2]=c[l+0>>2];c[j+0>>2]=c[m+0>>2];Pi(a,0,k,j,f,g,h);i=b;return}function Pi(b,d,e,f,g,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0;d=i;i=i+352|0;l=d+208|0;m=d+200|0;n=d+196|0;o=d+184|0;p=d+172|0;q=d+168|0;r=d+8|0;s=d+4|0;t=d;u=d+337|0;v=d+336|0;Wi(o,g,l,m,n);c[p+0>>2]=0;c[p+4>>2]=0;c[p+8>>2]=0;rg(p,10,0);if((a[p]&1)==0){g=p+1|0;w=g;x=p+8|0;y=g}else{g=p+8|0;w=p+1|0;x=g;y=c[g>>2]|0}c[q>>2]=y;c[s>>2]=r;c[t>>2]=0;a[u]=1;a[v]=69;g=p+4|0;z=c[m>>2]|0;m=c[n>>2]|0;n=c[e>>2]|0;A=y;a:while(1){if((n|0)!=0){y=c[n+12>>2]|0;if((y|0)==(c[n+16>>2]|0)){B=oc[c[(c[n>>2]|0)+36>>2]&63](n)|0}else{B=c[y>>2]|0}if((B|0)==-1){c[e>>2]=0;C=1;D=0}else{C=0;D=n}}else{C=1;D=0}y=c[f>>2]|0;do{if((y|0)!=0){E=c[y+12>>2]|0;if((E|0)==(c[y+16>>2]|0)){F=oc[c[(c[y>>2]|0)+36>>2]&63](y)|0}else{F=c[E>>2]|0}if(!((F|0)==-1)){if(C){G=y;break}else{H=y;I=A;break a}}else{c[f>>2]=0;J=17;break}}else{J=17}}while(0);if((J|0)==17){J=0;if(C){H=0;I=A;break}else{G=0}}y=a[p]|0;E=(y&1)==0;if(E){K=(y&255)>>>1}else{K=c[g>>2]|0}if(((c[q>>2]|0)-A|0)==(K|0)){if(E){L=(y&255)>>>1;M=(y&255)>>>1}else{y=c[g>>2]|0;L=y;M=y}rg(p,L<<1,0);if((a[p]&1)==0){N=10}else{N=(c[p>>2]&-2)+ -1|0}rg(p,N,0);if((a[p]&1)==0){O=w}else{O=c[x>>2]|0}c[q>>2]=O+M;P=O}else{P=A}y=D+12|0;E=c[y>>2]|0;Q=D+16|0;if((E|0)==(c[Q>>2]|0)){R=oc[c[(c[D>>2]|0)+36>>2]&63](D)|0}else{R=c[E>>2]|0}if((Xi(R,u,v,P,q,z,m,o,r,s,t,l)|0)!=0){H=G;I=P;break}E=c[y>>2]|0;if((E|0)==(c[Q>>2]|0)){oc[c[(c[D>>2]|0)+40>>2]&63](D)|0;n=D;A=P;continue}else{c[y>>2]=E+4;n=D;A=P;continue}}P=a[o]|0;if((P&1)==0){S=(P&255)>>>1}else{S=c[o+4>>2]|0}if(((S|0)!=0?(a[u]|0)!=0:0)?(u=c[s>>2]|0,(u-r|0)<160):0){S=c[t>>2]|0;c[s>>2]=u+4;c[u>>2]=S}h[k>>3]=+En(I,c[q>>2]|0,j);cl(o,r,c[s>>2]|0,j);if((D|0)!=0){s=c[D+12>>2]|0;if((s|0)==(c[D+16>>2]|0)){T=oc[c[(c[D>>2]|0)+36>>2]&63](D)|0}else{T=c[s>>2]|0}if((T|0)==-1){c[e>>2]=0;U=0;V=1}else{U=D;V=0}}else{U=0;V=1}do{if((H|0)!=0){D=c[H+12>>2]|0;if((D|0)==(c[H+16>>2]|0)){W=oc[c[(c[H>>2]|0)+36>>2]&63](H)|0}else{W=c[D>>2]|0}if((W|0)==-1){c[f>>2]=0;J=57;break}if(V){c[b>>2]=U;pg(p);pg(o);i=d;return}}else{J=57}}while(0);if((J|0)==57?!V:0){c[b>>2]=U;pg(p);pg(o);i=d;return}c[j>>2]=c[j>>2]|2;c[b>>2]=U;pg(p);pg(o);i=d;return}function Qi(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0;d=i;i=i+320|0;k=d;l=d+208|0;m=d+192|0;n=d+188|0;o=d+176|0;p=d+16|0;c[m+0>>2]=0;c[m+4>>2]=0;c[m+8>>2]=0;Jg(n,g);g=c[n>>2]|0;if(!((c[8524]|0)==-1)){c[k>>2]=34096;c[k+4>>2]=118;c[k+8>>2]=0;kg(34096,k,119)}q=(c[34100>>2]|0)+ -1|0;r=c[g+8>>2]|0;if(!((c[g+12>>2]|0)-r>>2>>>0>q>>>0)){s=vb(4)|0;ho(s);cc(s|0,42064,107)}g=c[r+(q<<2)>>2]|0;if((g|0)==0){s=vb(4)|0;ho(s);cc(s|0,42064,107)}uc[c[(c[g>>2]|0)+48>>2]&7](g,32648,32674|0,l)|0;Sf(c[n>>2]|0)|0;c[o+0>>2]=0;c[o+4>>2]=0;c[o+8>>2]=0;rg(o,10,0);if((a[o]&1)==0){n=o+1|0;t=n;u=o+8|0;v=n}else{n=o+8|0;t=o+1|0;u=n;v=c[n>>2]|0}n=o+4|0;g=l+96|0;s=l+100|0;q=p;r=l+104|0;w=l;x=m+4|0;y=c[e>>2]|0;z=p;p=0;A=v;B=v;a:while(1){if((y|0)!=0){v=c[y+12>>2]|0;if((v|0)==(c[y+16>>2]|0)){C=oc[c[(c[y>>2]|0)+36>>2]&63](y)|0}else{C=c[v>>2]|0}if((C|0)==-1){c[e>>2]=0;D=1;E=0}else{D=0;E=y}}else{D=1;E=0}v=c[f>>2]|0;do{if((v|0)!=0){F=c[v+12>>2]|0;if((F|0)==(c[v+16>>2]|0)){G=oc[c[(c[v>>2]|0)+36>>2]&63](v)|0}else{G=c[F>>2]|0}if(!((G|0)==-1)){if(D){break}else{H=B;break a}}else{c[f>>2]=0;I=22;break}}else{I=22}}while(0);if((I|0)==22?(I=0,D):0){H=B;break}v=a[o]|0;F=(v&1)==0;if(F){J=(v&255)>>>1}else{J=c[n>>2]|0}if((A-B|0)==(J|0)){if(F){K=(v&255)>>>1;L=(v&255)>>>1}else{v=c[n>>2]|0;K=v;L=v}rg(o,K<<1,0);if((a[o]&1)==0){M=10}else{M=(c[o>>2]&-2)+ -1|0}rg(o,M,0);if((a[o]&1)==0){N=t}else{N=c[u>>2]|0}O=N+L|0;P=N}else{O=A;P=B}v=c[E+12>>2]|0;if((v|0)==(c[E+16>>2]|0)){Q=oc[c[(c[E>>2]|0)+36>>2]&63](E)|0}else{Q=c[v>>2]|0}v=(O|0)==(P|0);do{if(v){F=(c[g>>2]|0)==(Q|0);if(!F?(c[s>>2]|0)!=(Q|0):0){I=43;break}a[O]=F?43:45;R=O+1|0;S=z;T=0}else{I=43}}while(0);do{if((I|0)==43){I=0;F=a[m]|0;if((F&1)==0){U=(F&255)>>>1}else{U=c[x>>2]|0}if((U|0)!=0&(Q|0)==0){if((z-q|0)>=160){R=O;S=z;T=p;break}c[z>>2]=p;R=O;S=z+4|0;T=0;break}else{V=l}while(1){F=V+4|0;if((c[V>>2]|0)==(Q|0)){W=V;break}if((F|0)==(r|0)){W=r;break}else{V=F}}F=W-w|0;X=F>>2;if((F|0)>92){H=P;break a}if((F|0)<88){a[O]=a[32648+X|0]|0;R=O+1|0;S=z;T=p+1|0;break}if(v){H=O;break a}if((O-P|0)>=3){H=P;break a}if((a[O+ -1|0]|0)!=48){H=P;break a}a[O]=a[32648+X|0]|0;R=O+1|0;S=z;T=0}}while(0);v=c[e>>2]|0;X=v+12|0;F=c[X>>2]|0;if((F|0)==(c[v+16>>2]|0)){oc[c[(c[v>>2]|0)+40>>2]&63](v)|0;y=v;z=S;p=T;A=R;B=P;continue}else{c[X>>2]=F+4;y=v;z=S;p=T;A=R;B=P;continue}}a[H+3|0]=0;if((a[34e3]|0)==0?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}P=c[8498]|0;c[k>>2]=j;if((ti(H,P,32688,k)|0)!=1){c[h>>2]=4}k=c[e>>2]|0;if((k|0)!=0){P=c[k+12>>2]|0;if((P|0)==(c[k+16>>2]|0)){Y=oc[c[(c[k>>2]|0)+36>>2]&63](k)|0}else{Y=c[P>>2]|0}if((Y|0)==-1){c[e>>2]=0;Z=0;_=1}else{Z=k;_=0}}else{Z=0;_=1}k=c[f>>2]|0;do{if((k|0)!=0){e=c[k+12>>2]|0;if((e|0)==(c[k+16>>2]|0)){$=oc[c[(c[k>>2]|0)+36>>2]&63](k)|0}else{$=c[e>>2]|0}if(($|0)==-1){c[f>>2]=0;I=78;break}if(_){c[b>>2]=Z;pg(o);pg(m);i=d;return}}else{I=78}}while(0);if((I|0)==78?!_:0){c[b>>2]=Z;pg(o);pg(m);i=d;return}c[h>>2]=c[h>>2]|2;c[b>>2]=Z;pg(o);pg(m);i=d;return}function Ri(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0;n=i;o=c[f>>2]|0;p=(o|0)==(e|0);do{if(p){q=(c[m+96>>2]|0)==(b|0);if(!q?(c[m+100>>2]|0)!=(b|0):0){break}c[f>>2]=e+1;a[e]=q?43:45;c[g>>2]=0;r=0;i=n;return r|0}}while(0);q=a[j]|0;if((q&1)==0){s=(q&255)>>>1}else{s=c[j+4>>2]|0}if((s|0)!=0&(b|0)==(h|0)){h=c[l>>2]|0;if((h-k|0)>=160){r=0;i=n;return r|0}k=c[g>>2]|0;c[l>>2]=h+4;c[h>>2]=k;c[g>>2]=0;r=0;i=n;return r|0}k=m+104|0;h=m;while(1){l=h+4|0;if((c[h>>2]|0)==(b|0)){t=h;break}if((l|0)==(k|0)){t=k;break}else{h=l}}h=t-m|0;m=h>>2;if((h|0)>92){r=-1;i=n;return r|0}if((d|0)==16){if((h|0)>=88){if(p){r=-1;i=n;return r|0}if((o-e|0)>=3){r=-1;i=n;return r|0}if((a[o+ -1|0]|0)!=48){r=-1;i=n;return r|0}c[g>>2]=0;e=a[32648+m|0]|0;c[f>>2]=o+1;a[o]=e;r=0;i=n;return r|0}}else if((d|0)==10|(d|0)==8?(m|0)>=(d|0):0){r=-1;i=n;return r|0}d=a[32648+m|0]|0;c[f>>2]=o+1;a[o]=d;c[g>>2]=(c[g>>2]|0)+1;r=0;i=n;return r|0}function Si(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;g=i;i=i+16|0;h=g;j=g+12|0;Jg(j,d);d=c[j>>2]|0;if(!((c[8526]|0)==-1)){c[h>>2]=34104;c[h+4>>2]=118;c[h+8>>2]=0;kg(34104,h,119)}k=(c[34108>>2]|0)+ -1|0;l=c[d+8>>2]|0;if(!((c[d+12>>2]|0)-l>>2>>>0>k>>>0)){m=vb(4)|0;ho(m);cc(m|0,42064,107)}d=c[l+(k<<2)>>2]|0;if((d|0)==0){m=vb(4)|0;ho(m);cc(m|0,42064,107)}uc[c[(c[d>>2]|0)+32>>2]&7](d,32648,32674|0,e)|0;e=c[j>>2]|0;if(!((c[8562]|0)==-1)){c[h>>2]=34248;c[h+4>>2]=118;c[h+8>>2]=0;kg(34248,h,119)}h=(c[34252>>2]|0)+ -1|0;d=c[e+8>>2]|0;if(!((c[e+12>>2]|0)-d>>2>>>0>h>>>0)){n=vb(4)|0;ho(n);cc(n|0,42064,107)}e=c[d+(h<<2)>>2]|0;if((e|0)==0){n=vb(4)|0;ho(n);cc(n|0,42064,107)}else{a[f]=oc[c[(c[e>>2]|0)+16>>2]&63](e)|0;mc[c[(c[e>>2]|0)+20>>2]&63](b,e);Sf(c[j>>2]|0)|0;i=g;return}}function Ti(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0;h=i;i=i+16|0;j=h;k=h+12|0;Jg(k,d);d=c[k>>2]|0;if(!((c[8526]|0)==-1)){c[j>>2]=34104;c[j+4>>2]=118;c[j+8>>2]=0;kg(34104,j,119)}l=(c[34108>>2]|0)+ -1|0;m=c[d+8>>2]|0;if(!((c[d+12>>2]|0)-m>>2>>>0>l>>>0)){n=vb(4)|0;ho(n);cc(n|0,42064,107)}d=c[m+(l<<2)>>2]|0;if((d|0)==0){n=vb(4)|0;ho(n);cc(n|0,42064,107)}uc[c[(c[d>>2]|0)+32>>2]&7](d,32648,32680|0,e)|0;e=c[k>>2]|0;if(!((c[8562]|0)==-1)){c[j>>2]=34248;c[j+4>>2]=118;c[j+8>>2]=0;kg(34248,j,119)}j=(c[34252>>2]|0)+ -1|0;d=c[e+8>>2]|0;if(!((c[e+12>>2]|0)-d>>2>>>0>j>>>0)){o=vb(4)|0;ho(o);cc(o|0,42064,107)}e=c[d+(j<<2)>>2]|0;if((e|0)==0){o=vb(4)|0;ho(o);cc(o|0,42064,107)}else{a[f]=oc[c[(c[e>>2]|0)+12>>2]&63](e)|0;a[g]=oc[c[(c[e>>2]|0)+16>>2]&63](e)|0;mc[c[(c[e>>2]|0)+20>>2]&63](b,e);Sf(c[k>>2]|0)|0;i=h;return}}function Ui(b,d,e,f,g,h,j,k,l,m,n,o){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;var p=0,q=0,r=0,s=0,t=0,u=0;p=i;if(b<<24>>24==h<<24>>24){if((a[d]|0)==0){q=-1;i=p;return q|0}a[d]=0;h=c[g>>2]|0;c[g>>2]=h+1;a[h]=46;h=a[k]|0;if((h&1)==0){r=(h&255)>>>1}else{r=c[k+4>>2]|0}if((r|0)==0){q=0;i=p;return q|0}r=c[m>>2]|0;if((r-l|0)>=160){q=0;i=p;return q|0}h=c[n>>2]|0;c[m>>2]=r+4;c[r>>2]=h;q=0;i=p;return q|0}if(b<<24>>24==j<<24>>24){j=a[k]|0;if((j&1)==0){s=(j&255)>>>1}else{s=c[k+4>>2]|0}if((s|0)!=0){if((a[d]|0)==0){q=-1;i=p;return q|0}s=c[m>>2]|0;if((s-l|0)>=160){q=0;i=p;return q|0}j=c[n>>2]|0;c[m>>2]=s+4;c[s>>2]=j;c[n>>2]=0;q=0;i=p;return q|0}}j=o+32|0;s=o;while(1){h=s+1|0;if((a[s]|0)==b<<24>>24){t=s;break}if((h|0)==(j|0)){t=j;break}else{s=h}}s=t-o|0;if((s|0)>31){q=-1;i=p;return q|0}o=a[32648+s|0]|0;if((s|0)==24|(s|0)==25){t=c[g>>2]|0;if((t|0)!=(f|0)?(a[t+ -1|0]&95|0)!=(a[e]&127|0):0){q=-1;i=p;return q|0}c[g>>2]=t+1;a[t]=o;q=0;i=p;return q|0}else if((s|0)==23|(s|0)==22){a[e]=80;t=c[g>>2]|0;c[g>>2]=t+1;a[t]=o;q=0;i=p;return q|0}else{t=o&95;if((t|0)==(a[e]|0)?(a[e]=t|128,(a[d]|0)!=0):0){a[d]=0;d=a[k]|0;if((d&1)==0){u=(d&255)>>>1}else{u=c[k+4>>2]|0}if((u|0)!=0?(u=c[m>>2]|0,(u-l|0)<160):0){l=c[n>>2]|0;c[m>>2]=u+4;c[u>>2]=l}}l=c[g>>2]|0;c[g>>2]=l+1;a[l]=o;if((s|0)>21){q=0;i=p;return q|0}c[n>>2]=(c[n>>2]|0)+1;q=0;i=p;return q|0}return 0}function Vi(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+16|0;g=f;h=f+12|0;Jg(h,b);b=c[h>>2]|0;if(!((c[8524]|0)==-1)){c[g>>2]=34096;c[g+4>>2]=118;c[g+8>>2]=0;kg(34096,g,119)}j=(c[34100>>2]|0)+ -1|0;k=c[b+8>>2]|0;if(!((c[b+12>>2]|0)-k>>2>>>0>j>>>0)){l=vb(4)|0;ho(l);cc(l|0,42064,107)}b=c[k+(j<<2)>>2]|0;if((b|0)==0){l=vb(4)|0;ho(l);cc(l|0,42064,107)}uc[c[(c[b>>2]|0)+48>>2]&7](b,32648,32674|0,d)|0;d=c[h>>2]|0;if(!((c[8564]|0)==-1)){c[g>>2]=34256;c[g+4>>2]=118;c[g+8>>2]=0;kg(34256,g,119)}g=(c[34260>>2]|0)+ -1|0;b=c[d+8>>2]|0;if(!((c[d+12>>2]|0)-b>>2>>>0>g>>>0)){m=vb(4)|0;ho(m);cc(m|0,42064,107)}d=c[b+(g<<2)>>2]|0;if((d|0)==0){m=vb(4)|0;ho(m);cc(m|0,42064,107)}else{c[e>>2]=oc[c[(c[d>>2]|0)+16>>2]&63](d)|0;mc[c[(c[d>>2]|0)+20>>2]&63](a,d);Sf(c[h>>2]|0)|0;i=f;return}}function Wi(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;g=i;i=i+16|0;h=g;j=g+12|0;Jg(j,b);b=c[j>>2]|0;if(!((c[8524]|0)==-1)){c[h>>2]=34096;c[h+4>>2]=118;c[h+8>>2]=0;kg(34096,h,119)}k=(c[34100>>2]|0)+ -1|0;l=c[b+8>>2]|0;if(!((c[b+12>>2]|0)-l>>2>>>0>k>>>0)){m=vb(4)|0;ho(m);cc(m|0,42064,107)}b=c[l+(k<<2)>>2]|0;if((b|0)==0){m=vb(4)|0;ho(m);cc(m|0,42064,107)}uc[c[(c[b>>2]|0)+48>>2]&7](b,32648,32680|0,d)|0;d=c[j>>2]|0;if(!((c[8564]|0)==-1)){c[h>>2]=34256;c[h+4>>2]=118;c[h+8>>2]=0;kg(34256,h,119)}h=(c[34260>>2]|0)+ -1|0;b=c[d+8>>2]|0;if(!((c[d+12>>2]|0)-b>>2>>>0>h>>>0)){n=vb(4)|0;ho(n);cc(n|0,42064,107)}d=c[b+(h<<2)>>2]|0;if((d|0)==0){n=vb(4)|0;ho(n);cc(n|0,42064,107)}else{c[e>>2]=oc[c[(c[d>>2]|0)+12>>2]&63](d)|0;c[f>>2]=oc[c[(c[d>>2]|0)+16>>2]&63](d)|0;mc[c[(c[d>>2]|0)+20>>2]&63](a,d);Sf(c[j>>2]|0)|0;i=g;return}}function Xi(b,d,e,f,g,h,j,k,l,m,n,o){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;var p=0,q=0,r=0,s=0,t=0,u=0;p=i;if((b|0)==(h|0)){if((a[d]|0)==0){q=-1;i=p;return q|0}a[d]=0;h=c[g>>2]|0;c[g>>2]=h+1;a[h]=46;h=a[k]|0;if((h&1)==0){r=(h&255)>>>1}else{r=c[k+4>>2]|0}if((r|0)==0){q=0;i=p;return q|0}r=c[m>>2]|0;if((r-l|0)>=160){q=0;i=p;return q|0}h=c[n>>2]|0;c[m>>2]=r+4;c[r>>2]=h;q=0;i=p;return q|0}if((b|0)==(j|0)){j=a[k]|0;if((j&1)==0){s=(j&255)>>>1}else{s=c[k+4>>2]|0}if((s|0)!=0){if((a[d]|0)==0){q=-1;i=p;return q|0}s=c[m>>2]|0;if((s-l|0)>=160){q=0;i=p;return q|0}j=c[n>>2]|0;c[m>>2]=s+4;c[s>>2]=j;c[n>>2]=0;q=0;i=p;return q|0}}j=o+128|0;s=o;while(1){h=s+4|0;if((c[s>>2]|0)==(b|0)){t=s;break}if((h|0)==(j|0)){t=j;break}else{s=h}}s=t-o|0;o=s>>2;if((s|0)>124){q=-1;i=p;return q|0}t=a[32648+o|0]|0;if((o|0)==23|(o|0)==22){a[e]=80}else if(!((o|0)==24|(o|0)==25)){o=t&95;if((o|0)==(a[e]|0)?(a[e]=o|128,(a[d]|0)!=0):0){a[d]=0;d=a[k]|0;if((d&1)==0){u=(d&255)>>>1}else{u=c[k+4>>2]|0}if((u|0)!=0?(u=c[m>>2]|0,(u-l|0)<160):0){l=c[n>>2]|0;c[m>>2]=u+4;c[u>>2]=l}}}else{l=c[g>>2]|0;if((l|0)!=(f|0)?(a[l+ -1|0]&95|0)!=(a[e]&127|0):0){q=-1;i=p;return q|0}c[g>>2]=l+1;a[l]=t;q=0;i=p;return q|0}l=c[g>>2]|0;c[g>>2]=l+1;a[l]=t;if((s|0)>84){q=0;i=p;return q|0}c[n>>2]=(c[n>>2]|0)+1;q=0;i=p;return q|0}function Yi(a){a=a|0;var b=0;b=i;Jo(a);i=b;return}function Zi(a){a=a|0;return}function _i(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;j=i;i=i+32|0;k=j;l=j+28|0;m=j+24|0;n=j+12|0;if((c[f+4>>2]&1|0)==0){o=c[(c[d>>2]|0)+24>>2]|0;c[l>>2]=c[e>>2];p=h&1;c[k+0>>2]=c[l+0>>2];wc[o&15](b,d,k,f,g,p);i=j;return}Jg(m,f);f=c[m>>2]|0;if(!((c[8562]|0)==-1)){c[k>>2]=34248;c[k+4>>2]=118;c[k+8>>2]=0;kg(34248,k,119)}k=(c[34252>>2]|0)+ -1|0;p=c[f+8>>2]|0;if(!((c[f+12>>2]|0)-p>>2>>>0>k>>>0)){q=vb(4)|0;ho(q);cc(q|0,42064,107)}f=c[p+(k<<2)>>2]|0;if((f|0)==0){q=vb(4)|0;ho(q);cc(q|0,42064,107)}Sf(c[m>>2]|0)|0;m=c[f>>2]|0;if(h){mc[c[m+24>>2]&63](n,f)}else{mc[c[m+28>>2]&63](n,f)}f=a[n]|0;if((f&1)==0){m=n+1|0;r=m;s=m;t=n+8|0}else{m=n+8|0;r=c[m>>2]|0;s=n+1|0;t=m}m=n+4|0;h=f;f=r;while(1){if((h&1)==0){u=s;v=(h&255)>>>1}else{u=c[t>>2]|0;v=c[m>>2]|0}if((f|0)==(u+v|0)){break}r=a[f]|0;q=c[e>>2]|0;do{if((q|0)!=0){k=q+24|0;p=c[k>>2]|0;if((p|0)!=(c[q+28>>2]|0)){c[k>>2]=p+1;a[p]=r;break}if((xc[c[(c[q>>2]|0)+52>>2]&31](q,r&255)|0)==-1){c[e>>2]=0}}}while(0);h=a[n]|0;f=f+1|0}c[b>>2]=c[e>>2];pg(n);i=j;return}function $i(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+64|0;j=d;k=d+56|0;l=d+44|0;m=d+20|0;n=d+16|0;o=d+12|0;p=d+8|0;q=d+4|0;a[k+0|0]=a[32896|0]|0;a[k+1|0]=a[32897|0]|0;a[k+2|0]=a[32898|0]|0;a[k+3|0]=a[32899|0]|0;a[k+4|0]=a[32900|0]|0;a[k+5|0]=a[32901|0]|0;r=k+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=r}else{a[r]=43;u=k+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;u=v+1|0;v=t&74;do{if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else if((v|0)==64){a[u]=111}else{a[u]=100}}while(0);if((a[34e3]|0)==0?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}u=c[8498]|0;c[j>>2]=h;h=aj(l,12,u,k,j)|0;k=l+h|0;u=c[s>>2]&176;do{if((u|0)==16){s=a[l]|0;if(s<<24>>24==43|s<<24>>24==45){w=l+1|0;break}if((h|0)>1&s<<24>>24==48?(s=a[l+1|0]|0,s<<24>>24==88|s<<24>>24==120):0){w=l+2|0}else{x=20}}else if((u|0)==32){w=k}else{x=20}}while(0);if((x|0)==20){w=l}Jg(p,f);bj(l,w,k,m,n,o,p);Sf(c[p>>2]|0)|0;c[q>>2]=c[e>>2];e=c[n>>2]|0;n=c[o>>2]|0;c[j+0>>2]=c[q+0>>2];cj(b,j,m,e,n,f,g);i=d;return}function aj(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0;g=i;i=i+16|0;h=g;c[h>>2]=f;f=zb(d|0)|0;d=lb(a|0,b|0,e|0,h|0)|0;if((f|0)==0){i=g;return d|0}zb(f|0)|0;i=g;return d|0}function bj(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;k=i;i=i+32|0;l=k;m=k+12|0;n=c[j>>2]|0;if(!((c[8526]|0)==-1)){c[l>>2]=34104;c[l+4>>2]=118;c[l+8>>2]=0;kg(34104,l,119)}o=(c[34108>>2]|0)+ -1|0;p=c[n+8>>2]|0;if(!((c[n+12>>2]|0)-p>>2>>>0>o>>>0)){q=vb(4)|0;ho(q);cc(q|0,42064,107)}n=c[p+(o<<2)>>2]|0;if((n|0)==0){q=vb(4)|0;ho(q);cc(q|0,42064,107)}q=c[j>>2]|0;if(!((c[8562]|0)==-1)){c[l>>2]=34248;c[l+4>>2]=118;c[l+8>>2]=0;kg(34248,l,119)}l=(c[34252>>2]|0)+ -1|0;j=c[q+8>>2]|0;if(!((c[q+12>>2]|0)-j>>2>>>0>l>>>0)){r=vb(4)|0;ho(r);cc(r|0,42064,107)}q=c[j+(l<<2)>>2]|0;if((q|0)==0){r=vb(4)|0;ho(r);cc(r|0,42064,107)}mc[c[(c[q>>2]|0)+20>>2]&63](m,q);r=a[m]|0;if((r&1)==0){s=(r&255)>>>1}else{s=c[m+4>>2]|0}if((s|0)!=0){c[h>>2]=f;s=a[b]|0;if(s<<24>>24==43|s<<24>>24==45){r=xc[c[(c[n>>2]|0)+28>>2]&31](n,s)|0;s=c[h>>2]|0;c[h>>2]=s+1;a[s]=r;t=b+1|0}else{t=b}if(((e-t|0)>1?(a[t]|0)==48:0)?(r=t+1|0,s=a[r]|0,s<<24>>24==88|s<<24>>24==120):0){s=xc[c[(c[n>>2]|0)+28>>2]&31](n,48)|0;l=c[h>>2]|0;c[h>>2]=l+1;a[l]=s;s=xc[c[(c[n>>2]|0)+28>>2]&31](n,a[r]|0)|0;r=c[h>>2]|0;c[h>>2]=r+1;a[r]=s;u=t+2|0}else{u=t}if((u|0)!=(e|0)?(t=e+ -1|0,t>>>0>u>>>0):0){s=u;r=t;do{t=a[s]|0;a[s]=a[r]|0;a[r]=t;s=s+1|0;r=r+ -1|0}while(s>>>0<r>>>0)}r=oc[c[(c[q>>2]|0)+16>>2]&63](q)|0;if(u>>>0<e>>>0){q=m+1|0;s=m+4|0;t=m+8|0;l=0;j=0;o=u;while(1){p=(a[m]&1)==0;if((a[(p?q:c[t>>2]|0)+j|0]|0)!=0?(l|0)==(a[(p?q:c[t>>2]|0)+j|0]|0):0){p=c[h>>2]|0;c[h>>2]=p+1;a[p]=r;p=a[m]|0;if((p&1)==0){v=(p&255)>>>1}else{v=c[s>>2]|0}w=0;x=(j>>>0<(v+ -1|0)>>>0)+j|0}else{w=l;x=j}p=xc[c[(c[n>>2]|0)+28>>2]&31](n,a[o]|0)|0;y=c[h>>2]|0;c[h>>2]=y+1;a[y]=p;o=o+1|0;if(!(o>>>0<e>>>0)){break}else{l=w+1|0;j=x}}}x=f+(u-b)|0;u=c[h>>2]|0;if((x|0)!=(u|0)?(j=u+ -1|0,j>>>0>x>>>0):0){u=x;x=j;do{j=a[u]|0;a[u]=a[x]|0;a[x]=j;u=u+1|0;x=x+ -1|0}while(u>>>0<x>>>0)}}else{uc[c[(c[n>>2]|0)+32>>2]&7](n,b,e,f)|0;c[h>>2]=f+(e-b)}if((d|0)==(e|0)){z=c[h>>2]|0;c[g>>2]=z;pg(m);i=k;return}else{z=f+(d-b)|0;c[g>>2]=z;pg(m);i=k;return}}function cj(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;k=i;i=i+16|0;l=k;m=c[d>>2]|0;if((m|0)==0){c[b>>2]=0;i=k;return}n=g;g=e;o=n-g|0;p=h+12|0;h=c[p>>2]|0;q=(h|0)>(o|0)?h-o|0:0;o=f;h=o-g|0;if((h|0)>0?(ic[c[(c[m>>2]|0)+48>>2]&31](m,e,h)|0)!=(h|0):0){c[d>>2]=0;c[b>>2]=0;i=k;return}do{if((q|0)>0){og(l,q,j);if((a[l]&1)==0){r=l+1|0}else{r=c[l+8>>2]|0}if((ic[c[(c[m>>2]|0)+48>>2]&31](m,r,q)|0)==(q|0)){pg(l);break}c[d>>2]=0;c[b>>2]=0;pg(l);i=k;return}}while(0);l=n-o|0;if((l|0)>0?(ic[c[(c[m>>2]|0)+48>>2]&31](m,f,l)|0)!=(l|0):0){c[d>>2]=0;c[b>>2]=0;i=k;return}c[p>>2]=0;c[b>>2]=m;i=k;return}function dj(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;d=i;i=i+96|0;k=d+8|0;l=d;m=d+74|0;n=d+32|0;o=d+28|0;p=d+24|0;q=d+20|0;r=d+16|0;s=l;c[s>>2]=37;c[s+4>>2]=0;s=l+1|0;t=f+4|0;u=c[t>>2]|0;if((u&2048|0)==0){v=s}else{a[s]=43;v=l+2|0}if((u&512|0)==0){w=v}else{a[v]=35;w=v+1|0}v=w+2|0;a[w]=108;a[w+1|0]=108;w=u&74;do{if((w|0)==64){a[v]=111}else if((w|0)==8){if((u&16384|0)==0){a[v]=120;break}else{a[v]=88;break}}else{a[v]=100}}while(0);if((a[34e3]|0)==0?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}v=c[8498]|0;u=k;c[u>>2]=h;c[u+4>>2]=j;j=aj(m,22,v,l,k)|0;l=m+j|0;v=c[t>>2]&176;do{if((v|0)==32){x=l}else if((v|0)==16){t=a[m]|0;if(t<<24>>24==43|t<<24>>24==45){x=m+1|0;break}if((j|0)>1&t<<24>>24==48?(t=a[m+1|0]|0,t<<24>>24==88|t<<24>>24==120):0){x=m+2|0}else{y=20}}else{y=20}}while(0);if((y|0)==20){x=m}Jg(q,f);bj(m,x,l,n,o,p,q);Sf(c[q>>2]|0)|0;c[r>>2]=c[e>>2];e=c[o>>2]|0;o=c[p>>2]|0;c[k+0>>2]=c[r+0>>2];cj(b,k,n,e,o,f,g);i=d;return}function ej(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+64|0;j=d;k=d+56|0;l=d+44|0;m=d+20|0;n=d+16|0;o=d+12|0;p=d+8|0;q=d+4|0;a[k+0|0]=a[32896|0]|0;a[k+1|0]=a[32897|0]|0;a[k+2|0]=a[32898|0]|0;a[k+3|0]=a[32899|0]|0;a[k+4|0]=a[32900|0]|0;a[k+5|0]=a[32901|0]|0;r=k+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=r}else{a[r]=43;u=k+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;u=v+1|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=117}}while(0);if((a[34e3]|0)==0?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}u=c[8498]|0;c[j>>2]=h;h=aj(l,12,u,k,j)|0;k=l+h|0;u=c[s>>2]&176;do{if((u|0)==32){w=k}else if((u|0)==16){s=a[l]|0;if(s<<24>>24==43|s<<24>>24==45){w=l+1|0;break}if((h|0)>1&s<<24>>24==48?(s=a[l+1|0]|0,s<<24>>24==88|s<<24>>24==120):0){w=l+2|0}else{x=20}}else{x=20}}while(0);if((x|0)==20){w=l}Jg(p,f);bj(l,w,k,m,n,o,p);Sf(c[p>>2]|0)|0;c[q>>2]=c[e>>2];e=c[n>>2]|0;n=c[o>>2]|0;c[j+0>>2]=c[q+0>>2];cj(b,j,m,e,n,f,g);i=d;return}function fj(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;d=i;i=i+112|0;k=d+8|0;l=d;m=d+75|0;n=d+32|0;o=d+28|0;p=d+24|0;q=d+20|0;r=d+16|0;s=l;c[s>>2]=37;c[s+4>>2]=0;s=l+1|0;t=f+4|0;u=c[t>>2]|0;if((u&2048|0)==0){v=s}else{a[s]=43;v=l+2|0}if((u&512|0)==0){w=v}else{a[v]=35;w=v+1|0}v=w+2|0;a[w]=108;a[w+1|0]=108;w=u&74;do{if((w|0)==8){if((u&16384|0)==0){a[v]=120;break}else{a[v]=88;break}}else if((w|0)==64){a[v]=111}else{a[v]=117}}while(0);if((a[34e3]|0)==0?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}v=c[8498]|0;w=k;c[w>>2]=h;c[w+4>>2]=j;j=aj(m,23,v,l,k)|0;l=m+j|0;v=c[t>>2]&176;do{if((v|0)==32){x=l}else if((v|0)==16){t=a[m]|0;if(t<<24>>24==43|t<<24>>24==45){x=m+1|0;break}if((j|0)>1&t<<24>>24==48?(t=a[m+1|0]|0,t<<24>>24==88|t<<24>>24==120):0){x=m+2|0}else{y=20}}else{y=20}}while(0);if((y|0)==20){x=m}Jg(q,f);bj(m,x,l,n,o,p,q);Sf(c[q>>2]|0)|0;c[r>>2]=c[e>>2];e=c[o>>2]|0;o=c[p>>2]|0;c[k+0>>2]=c[r+0>>2];cj(b,k,n,e,o,f,g);i=d;return}function gj(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0;d=i;i=i+144|0;l=d+8|0;m=d;n=d+102|0;o=d+40|0;p=d+44|0;q=d+36|0;r=d+32|0;s=d+28|0;t=d+24|0;u=d+20|0;v=m;c[v>>2]=37;c[v+4>>2]=0;v=m+1|0;w=f+4|0;x=c[w>>2]|0;if((x&2048|0)==0){y=v}else{a[v]=43;y=m+2|0}if((x&1024|0)==0){z=y}else{a[y]=35;z=y+1|0}y=x&260;v=x>>>14;do{if((y|0)==260){if((v&1|0)==0){a[z]=97;A=0;break}else{a[z]=65;A=0;break}}else{a[z]=46;x=z+2|0;a[z+1|0]=42;if((y|0)==256){if((v&1|0)==0){a[x]=101;A=1;break}else{a[x]=69;A=1;break}}else if((y|0)==4){if((v&1|0)==0){a[x]=102;A=1;break}else{a[x]=70;A=1;break}}else{if((v&1|0)==0){a[x]=103;A=1;break}else{a[x]=71;A=1;break}}}}while(0);c[o>>2]=n;if((a[34e3]|0)==0?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}v=c[8498]|0;if(A){c[l>>2]=c[f+8>>2];y=l+4|0;h[k>>3]=j;c[y>>2]=c[k>>2];c[y+4>>2]=c[k+4>>2];B=aj(n,30,v,m,l)|0}else{h[k>>3]=j;c[l>>2]=c[k>>2];c[l+4>>2]=c[k+4>>2];B=aj(n,30,v,m,l)|0}if((B|0)>29){v=(a[34e3]|0)==0;if(A){if(v?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}A=c[8498]|0;c[l>>2]=c[f+8>>2];y=l+4|0;h[k>>3]=j;c[y>>2]=c[k>>2];c[y+4>>2]=c[k+4>>2];C=hj(o,A,m,l)|0}else{if(v?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}v=c[8498]|0;c[l>>2]=c[f+8>>2];A=l+4|0;h[k>>3]=j;c[A>>2]=c[k>>2];c[A+4>>2]=c[k+4>>2];C=hj(o,v,m,l)|0}m=c[o>>2]|0;if((m|0)==0){Oo()}else{D=m;E=m;F=C}}else{D=c[o>>2]|0;E=0;F=B}B=D+F|0;o=c[w>>2]&176;do{if((o|0)==32){G=B}else if((o|0)==16){w=a[D]|0;if(w<<24>>24==43|w<<24>>24==45){G=D+1|0;break}if((F|0)>1&w<<24>>24==48?(w=a[D+1|0]|0,w<<24>>24==88|w<<24>>24==120):0){G=D+2|0}else{H=44}}else{H=44}}while(0);if((H|0)==44){G=D}if((D|0)!=(n|0)){H=Co(F<<1)|0;if((H|0)==0){Oo()}else{I=D;J=H;K=H}}else{I=n;J=0;K=p}Jg(s,f);ij(I,G,B,K,q,r,s);Sf(c[s>>2]|0)|0;c[u>>2]=c[e>>2];s=c[q>>2]|0;q=c[r>>2]|0;c[l+0>>2]=c[u+0>>2];cj(t,l,K,s,q,f,g);g=c[t>>2]|0;c[e>>2]=g;c[b>>2]=g;if((J|0)!=0){Do(J)}if((E|0)==0){i=d;return}Do(E);i=d;return}function hj(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;i=i+16|0;g=f;c[g>>2]=e;e=zb(b|0)|0;b=kb(a|0,d|0,g|0)|0;if((e|0)==0){i=f;return b|0}zb(e|0)|0;i=f;return b|0}function ij(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;k=i;i=i+32|0;l=k;m=k+12|0;n=c[j>>2]|0;if(!((c[8526]|0)==-1)){c[l>>2]=34104;c[l+4>>2]=118;c[l+8>>2]=0;kg(34104,l,119)}o=(c[34108>>2]|0)+ -1|0;p=c[n+8>>2]|0;if(!((c[n+12>>2]|0)-p>>2>>>0>o>>>0)){q=vb(4)|0;ho(q);cc(q|0,42064,107)}n=c[p+(o<<2)>>2]|0;if((n|0)==0){q=vb(4)|0;ho(q);cc(q|0,42064,107)}q=c[j>>2]|0;if(!((c[8562]|0)==-1)){c[l>>2]=34248;c[l+4>>2]=118;c[l+8>>2]=0;kg(34248,l,119)}l=(c[34252>>2]|0)+ -1|0;j=c[q+8>>2]|0;if(!((c[q+12>>2]|0)-j>>2>>>0>l>>>0)){r=vb(4)|0;ho(r);cc(r|0,42064,107)}q=c[j+(l<<2)>>2]|0;if((q|0)==0){r=vb(4)|0;ho(r);cc(r|0,42064,107)}mc[c[(c[q>>2]|0)+20>>2]&63](m,q);c[h>>2]=f;r=a[b]|0;if(r<<24>>24==43|r<<24>>24==45){l=xc[c[(c[n>>2]|0)+28>>2]&31](n,r)|0;r=c[h>>2]|0;c[h>>2]=r+1;a[r]=l;s=b+1|0}else{s=b}l=e;a:do{if(((l-s|0)>1?(a[s]|0)==48:0)?(r=s+1|0,j=a[r]|0,j<<24>>24==88|j<<24>>24==120):0){j=xc[c[(c[n>>2]|0)+28>>2]&31](n,48)|0;o=c[h>>2]|0;c[h>>2]=o+1;a[o]=j;j=s+2|0;o=xc[c[(c[n>>2]|0)+28>>2]&31](n,a[r]|0)|0;r=c[h>>2]|0;c[h>>2]=r+1;a[r]=o;if(j>>>0<e>>>0){o=j;while(1){r=a[o]|0;if((a[34e3]|0)==0?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}p=o+1|0;if((ab(r<<24>>24|0,c[8498]|0)|0)==0){t=j;u=o;break a}if(p>>>0<e>>>0){o=p}else{t=j;u=p;break}}}else{t=j;u=j}}else{v=14}}while(0);b:do{if((v|0)==14){if(s>>>0<e>>>0){o=s;while(1){p=a[o]|0;if((a[34e3]|0)==0?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}r=o+1|0;if((fb(p<<24>>24|0,c[8498]|0)|0)==0){t=s;u=o;break b}if(r>>>0<e>>>0){o=r}else{t=s;u=r;break}}}else{t=s;u=s}}}while(0);s=a[m]|0;if((s&1)==0){w=(s&255)>>>1}else{w=c[m+4>>2]|0}if((w|0)!=0){if((t|0)!=(u|0)?(w=u+ -1|0,w>>>0>t>>>0):0){s=t;v=w;do{w=a[s]|0;a[s]=a[v]|0;a[v]=w;s=s+1|0;v=v+ -1|0}while(s>>>0<v>>>0)}v=oc[c[(c[q>>2]|0)+16>>2]&63](q)|0;if(t>>>0<u>>>0){s=m+1|0;w=m+4|0;o=m+8|0;j=0;r=0;p=t;while(1){x=(a[m]&1)==0;if((a[(x?s:c[o>>2]|0)+r|0]|0)>0?(j|0)==(a[(x?s:c[o>>2]|0)+r|0]|0):0){x=c[h>>2]|0;c[h>>2]=x+1;a[x]=v;x=a[m]|0;if((x&1)==0){y=(x&255)>>>1}else{y=c[w>>2]|0}z=0;A=(r>>>0<(y+ -1|0)>>>0)+r|0}else{z=j;A=r}x=xc[c[(c[n>>2]|0)+28>>2]&31](n,a[p]|0)|0;B=c[h>>2]|0;c[h>>2]=B+1;a[B]=x;p=p+1|0;if(!(p>>>0<u>>>0)){break}else{j=z+1|0;r=A}}}A=f+(t-b)|0;r=c[h>>2]|0;if((A|0)!=(r|0)?(z=r+ -1|0,z>>>0>A>>>0):0){r=A;A=z;do{z=a[r]|0;a[r]=a[A]|0;a[A]=z;r=r+1|0;A=A+ -1|0}while(r>>>0<A>>>0)}}else{uc[c[(c[n>>2]|0)+32>>2]&7](n,t,u,c[h>>2]|0)|0;c[h>>2]=(c[h>>2]|0)+(u-t)}c:do{if(u>>>0<e>>>0){t=u;while(1){A=a[t]|0;if(A<<24>>24==46){break}r=xc[c[(c[n>>2]|0)+28>>2]&31](n,A)|0;A=c[h>>2]|0;c[h>>2]=A+1;a[A]=r;r=t+1|0;if(r>>>0<e>>>0){t=r}else{C=r;break c}}r=oc[c[(c[q>>2]|0)+12>>2]&63](q)|0;A=c[h>>2]|0;c[h>>2]=A+1;a[A]=r;C=t+1|0}else{C=u}}while(0);uc[c[(c[n>>2]|0)+32>>2]&7](n,C,e,c[h>>2]|0)|0;n=(c[h>>2]|0)+(l-C)|0;c[h>>2]=n;if((d|0)==(e|0)){D=n;c[g>>2]=D;pg(m);i=k;return}D=f+(d-b)|0;c[g>>2]=D;pg(m);i=k;return}function jj(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0;d=i;i=i+144|0;l=d+8|0;m=d;n=d+102|0;o=d+40|0;p=d+44|0;q=d+36|0;r=d+32|0;s=d+28|0;t=d+24|0;u=d+20|0;v=m;c[v>>2]=37;c[v+4>>2]=0;v=m+1|0;w=f+4|0;x=c[w>>2]|0;if((x&2048|0)==0){y=v}else{a[v]=43;y=m+2|0}if((x&1024|0)==0){z=y}else{a[y]=35;z=y+1|0}y=x&260;v=x>>>14;do{if((y|0)==260){a[z]=76;x=z+1|0;if((v&1|0)==0){a[x]=97;A=0;break}else{a[x]=65;A=0;break}}else{a[z]=46;a[z+1|0]=42;a[z+2|0]=76;x=z+3|0;if((y|0)==4){if((v&1|0)==0){a[x]=102;A=1;break}else{a[x]=70;A=1;break}}else if((y|0)==256){if((v&1|0)==0){a[x]=101;A=1;break}else{a[x]=69;A=1;break}}else{if((v&1|0)==0){a[x]=103;A=1;break}else{a[x]=71;A=1;break}}}}while(0);c[o>>2]=n;if((a[34e3]|0)==0?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}v=c[8498]|0;if(A){c[l>>2]=c[f+8>>2];y=l+4|0;h[k>>3]=j;c[y>>2]=c[k>>2];c[y+4>>2]=c[k+4>>2];B=aj(n,30,v,m,l)|0}else{h[k>>3]=j;c[l>>2]=c[k>>2];c[l+4>>2]=c[k+4>>2];B=aj(n,30,v,m,l)|0}if((B|0)>29){v=(a[34e3]|0)==0;if(A){if(v?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}A=c[8498]|0;c[l>>2]=c[f+8>>2];y=l+4|0;h[k>>3]=j;c[y>>2]=c[k>>2];c[y+4>>2]=c[k+4>>2];C=hj(o,A,m,l)|0}else{if(v?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}v=c[8498]|0;h[k>>3]=j;c[l>>2]=c[k>>2];c[l+4>>2]=c[k+4>>2];C=hj(o,v,m,l)|0}m=c[o>>2]|0;if((m|0)==0){Oo()}else{D=m;E=m;F=C}}else{D=c[o>>2]|0;E=0;F=B}B=D+F|0;o=c[w>>2]&176;do{if((o|0)==16){w=a[D]|0;if(w<<24>>24==43|w<<24>>24==45){G=D+1|0;break}if((F|0)>1&w<<24>>24==48?(w=a[D+1|0]|0,w<<24>>24==88|w<<24>>24==120):0){G=D+2|0}else{H=44}}else if((o|0)==32){G=B}else{H=44}}while(0);if((H|0)==44){G=D}if((D|0)!=(n|0)){H=Co(F<<1)|0;if((H|0)==0){Oo()}else{I=D;J=H;K=H}}else{I=n;J=0;K=p}Jg(s,f);ij(I,G,B,K,q,r,s);Sf(c[s>>2]|0)|0;c[u>>2]=c[e>>2];s=c[q>>2]|0;q=c[r>>2]|0;c[l+0>>2]=c[u+0>>2];cj(t,l,K,s,q,f,g);g=c[t>>2]|0;c[e>>2]=g;c[b>>2]=g;if((J|0)!=0){Do(J)}if((E|0)==0){i=d;return}Do(E);i=d;return}function kj(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;d=i;i=i+96|0;j=d;k=d+80|0;l=d+60|0;m=d+20|0;n=d+16|0;o=d+12|0;a[k+0|0]=a[32904|0]|0;a[k+1|0]=a[32905|0]|0;a[k+2|0]=a[32906|0]|0;a[k+3|0]=a[32907|0]|0;a[k+4|0]=a[32908|0]|0;a[k+5|0]=a[32909|0]|0;if((a[34e3]|0)==0?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}p=c[8498]|0;c[j>>2]=h;h=aj(l,20,p,k,j)|0;k=l+h|0;p=c[f+4>>2]&176;do{if((p|0)==16){q=a[l]|0;if(q<<24>>24==43|q<<24>>24==45){r=l+1|0;break}if((h|0)>1&q<<24>>24==48?(q=a[l+1|0]|0,q<<24>>24==88|q<<24>>24==120):0){r=l+2|0}else{s=10}}else if((p|0)==32){r=k}else{s=10}}while(0);if((s|0)==10){r=l}Jg(n,f);s=c[n>>2]|0;if(!((c[8526]|0)==-1)){c[j>>2]=34104;c[j+4>>2]=118;c[j+8>>2]=0;kg(34104,j,119)}p=(c[34108>>2]|0)+ -1|0;q=c[s+8>>2]|0;if(!((c[s+12>>2]|0)-q>>2>>>0>p>>>0)){t=vb(4)|0;ho(t);cc(t|0,42064,107)}s=c[q+(p<<2)>>2]|0;if((s|0)==0){t=vb(4)|0;ho(t);cc(t|0,42064,107)}Sf(c[n>>2]|0)|0;uc[c[(c[s>>2]|0)+32>>2]&7](s,l,k,m)|0;s=m+h|0;if((r|0)==(k|0)){u=s;v=c[e>>2]|0;c[o>>2]=v;c[j+0>>2]=c[o+0>>2];cj(b,j,m,u,s,f,g);i=d;return}u=m+(r-l)|0;v=c[e>>2]|0;c[o>>2]=v;c[j+0>>2]=c[o+0>>2];cj(b,j,m,u,s,f,g);i=d;return}function lj(a){a=a|0;var b=0;b=i;Jo(a);i=b;return}function mj(a){a=a|0;return}function nj(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;j=i;i=i+32|0;k=j;l=j+28|0;m=j+24|0;n=j+12|0;if((c[f+4>>2]&1|0)==0){o=c[(c[d>>2]|0)+24>>2]|0;c[l>>2]=c[e>>2];p=h&1;c[k+0>>2]=c[l+0>>2];wc[o&15](b,d,k,f,g,p);i=j;return}Jg(m,f);f=c[m>>2]|0;if(!((c[8564]|0)==-1)){c[k>>2]=34256;c[k+4>>2]=118;c[k+8>>2]=0;kg(34256,k,119)}k=(c[34260>>2]|0)+ -1|0;p=c[f+8>>2]|0;if(!((c[f+12>>2]|0)-p>>2>>>0>k>>>0)){q=vb(4)|0;ho(q);cc(q|0,42064,107)}f=c[p+(k<<2)>>2]|0;if((f|0)==0){q=vb(4)|0;ho(q);cc(q|0,42064,107)}Sf(c[m>>2]|0)|0;m=c[f>>2]|0;if(h){mc[c[m+24>>2]&63](n,f)}else{mc[c[m+28>>2]&63](n,f)}f=a[n]|0;if((f&1)==0){m=n+4|0;r=m;s=n+8|0;t=m}else{m=n+8|0;r=c[m>>2]|0;s=m;t=n+4|0}m=f;f=r;while(1){if((m&1)==0){u=t;v=(m&255)>>>1}else{u=c[s>>2]|0;v=c[t>>2]|0}if((f|0)==(u+(v<<2)|0)){break}r=c[f>>2]|0;h=c[e>>2]|0;if((h|0)!=0){q=h+24|0;k=c[q>>2]|0;if((k|0)==(c[h+28>>2]|0)){w=xc[c[(c[h>>2]|0)+52>>2]&31](h,r)|0}else{c[q>>2]=k+4;c[k>>2]=r;w=r}if((w|0)==-1){c[e>>2]=0}}m=a[n]|0;f=f+4|0}c[b>>2]=c[e>>2];Ag(n);i=j;return}function oj(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+128|0;j=d;k=d+116|0;l=d+104|0;m=d+20|0;n=d+16|0;o=d+12|0;p=d+8|0;q=d+4|0;a[k+0|0]=a[32896|0]|0;a[k+1|0]=a[32897|0]|0;a[k+2|0]=a[32898|0]|0;a[k+3|0]=a[32899|0]|0;a[k+4|0]=a[32900|0]|0;a[k+5|0]=a[32901|0]|0;r=k+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=r}else{a[r]=43;u=k+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;u=v+1|0;v=t&74;do{if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else if((v|0)==64){a[u]=111}else{a[u]=100}}while(0);if((a[34e3]|0)==0?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}u=c[8498]|0;c[j>>2]=h;h=aj(l,12,u,k,j)|0;k=l+h|0;u=c[s>>2]&176;do{if((u|0)==32){w=k}else if((u|0)==16){s=a[l]|0;if(s<<24>>24==43|s<<24>>24==45){w=l+1|0;break}if((h|0)>1&s<<24>>24==48?(s=a[l+1|0]|0,s<<24>>24==88|s<<24>>24==120):0){w=l+2|0}else{x=20}}else{x=20}}while(0);if((x|0)==20){w=l}Jg(p,f);pj(l,w,k,m,n,o,p);Sf(c[p>>2]|0)|0;c[q>>2]=c[e>>2];e=c[n>>2]|0;n=c[o>>2]|0;c[j+0>>2]=c[q+0>>2];qj(b,j,m,e,n,f,g);i=d;return}function pj(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;k=i;i=i+32|0;l=k;m=k+12|0;n=c[j>>2]|0;if(!((c[8524]|0)==-1)){c[l>>2]=34096;c[l+4>>2]=118;c[l+8>>2]=0;kg(34096,l,119)}o=(c[34100>>2]|0)+ -1|0;p=c[n+8>>2]|0;if(!((c[n+12>>2]|0)-p>>2>>>0>o>>>0)){q=vb(4)|0;ho(q);cc(q|0,42064,107)}n=c[p+(o<<2)>>2]|0;if((n|0)==0){q=vb(4)|0;ho(q);cc(q|0,42064,107)}q=c[j>>2]|0;if(!((c[8564]|0)==-1)){c[l>>2]=34256;c[l+4>>2]=118;c[l+8>>2]=0;kg(34256,l,119)}l=(c[34260>>2]|0)+ -1|0;j=c[q+8>>2]|0;if(!((c[q+12>>2]|0)-j>>2>>>0>l>>>0)){r=vb(4)|0;ho(r);cc(r|0,42064,107)}q=c[j+(l<<2)>>2]|0;if((q|0)==0){r=vb(4)|0;ho(r);cc(r|0,42064,107)}mc[c[(c[q>>2]|0)+20>>2]&63](m,q);r=a[m]|0;if((r&1)==0){s=(r&255)>>>1}else{s=c[m+4>>2]|0}if((s|0)!=0){c[h>>2]=f;s=a[b]|0;if(s<<24>>24==43|s<<24>>24==45){r=xc[c[(c[n>>2]|0)+44>>2]&31](n,s)|0;s=c[h>>2]|0;c[h>>2]=s+4;c[s>>2]=r;t=b+1|0}else{t=b}if(((e-t|0)>1?(a[t]|0)==48:0)?(r=t+1|0,s=a[r]|0,s<<24>>24==88|s<<24>>24==120):0){s=xc[c[(c[n>>2]|0)+44>>2]&31](n,48)|0;l=c[h>>2]|0;c[h>>2]=l+4;c[l>>2]=s;s=xc[c[(c[n>>2]|0)+44>>2]&31](n,a[r]|0)|0;r=c[h>>2]|0;c[h>>2]=r+4;c[r>>2]=s;u=t+2|0}else{u=t}if((u|0)!=(e|0)?(t=e+ -1|0,t>>>0>u>>>0):0){s=u;r=t;do{t=a[s]|0;a[s]=a[r]|0;a[r]=t;s=s+1|0;r=r+ -1|0}while(s>>>0<r>>>0)}r=oc[c[(c[q>>2]|0)+16>>2]&63](q)|0;if(u>>>0<e>>>0){q=m+1|0;s=m+4|0;t=m+8|0;l=0;j=0;o=u;while(1){p=(a[m]&1)==0;if((a[(p?q:c[t>>2]|0)+j|0]|0)!=0?(l|0)==(a[(p?q:c[t>>2]|0)+j|0]|0):0){p=c[h>>2]|0;c[h>>2]=p+4;c[p>>2]=r;p=a[m]|0;if((p&1)==0){v=(p&255)>>>1}else{v=c[s>>2]|0}w=0;x=(j>>>0<(v+ -1|0)>>>0)+j|0}else{w=l;x=j}p=xc[c[(c[n>>2]|0)+44>>2]&31](n,a[o]|0)|0;y=c[h>>2]|0;z=y+4|0;c[h>>2]=z;c[y>>2]=p;p=o+1|0;if(p>>>0<e>>>0){l=w+1|0;j=x;o=p}else{A=z;break}}}else{A=c[h>>2]|0}o=f+(u-b<<2)|0;if((o|0)!=(A|0)?(u=A+ -4|0,u>>>0>o>>>0):0){x=o;o=u;while(1){u=c[x>>2]|0;c[x>>2]=c[o>>2];c[o>>2]=u;u=x+4|0;j=o+ -4|0;if(u>>>0<j>>>0){x=u;o=j}else{B=A;break}}}else{B=A}}else{uc[c[(c[n>>2]|0)+48>>2]&7](n,b,e,f)|0;n=f+(e-b<<2)|0;c[h>>2]=n;B=n}if((d|0)==(e|0)){C=B;c[g>>2]=C;pg(m);i=k;return}C=f+(d-b<<2)|0;c[g>>2]=C;pg(m);i=k;return}function qj(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;k=i;i=i+16|0;l=k;m=c[d>>2]|0;if((m|0)==0){c[b>>2]=0;i=k;return}n=g;g=e;o=n-g>>2;p=h+12|0;h=c[p>>2]|0;q=(h|0)>(o|0)?h-o|0:0;o=f;h=o-g|0;g=h>>2;if((h|0)>0?(ic[c[(c[m>>2]|0)+48>>2]&31](m,e,g)|0)!=(g|0):0){c[d>>2]=0;c[b>>2]=0;i=k;return}do{if((q|0)>0){zg(l,q,j);if((a[l]&1)==0){r=l+4|0}else{r=c[l+8>>2]|0}if((ic[c[(c[m>>2]|0)+48>>2]&31](m,r,q)|0)==(q|0)){Ag(l);break}c[d>>2]=0;c[b>>2]=0;Ag(l);i=k;return}}while(0);l=n-o|0;o=l>>2;if((l|0)>0?(ic[c[(c[m>>2]|0)+48>>2]&31](m,f,o)|0)!=(o|0):0){c[d>>2]=0;c[b>>2]=0;i=k;return}c[p>>2]=0;c[b>>2]=m;i=k;return}function rj(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;d=i;i=i+224|0;k=d+8|0;l=d;m=d+196|0;n=d+32|0;o=d+28|0;p=d+24|0;q=d+20|0;r=d+16|0;s=l;c[s>>2]=37;c[s+4>>2]=0;s=l+1|0;t=f+4|0;u=c[t>>2]|0;if((u&2048|0)==0){v=s}else{a[s]=43;v=l+2|0}if((u&512|0)==0){w=v}else{a[v]=35;w=v+1|0}v=w+2|0;a[w]=108;a[w+1|0]=108;w=u&74;do{if((w|0)==8){if((u&16384|0)==0){a[v]=120;break}else{a[v]=88;break}}else if((w|0)==64){a[v]=111}else{a[v]=100}}while(0);if((a[34e3]|0)==0?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}v=c[8498]|0;w=k;c[w>>2]=h;c[w+4>>2]=j;j=aj(m,22,v,l,k)|0;l=m+j|0;v=c[t>>2]&176;do{if((v|0)==32){x=l}else if((v|0)==16){t=a[m]|0;if(t<<24>>24==43|t<<24>>24==45){x=m+1|0;break}if((j|0)>1&t<<24>>24==48?(t=a[m+1|0]|0,t<<24>>24==88|t<<24>>24==120):0){x=m+2|0}else{y=20}}else{y=20}}while(0);if((y|0)==20){x=m}Jg(q,f);pj(m,x,l,n,o,p,q);Sf(c[q>>2]|0)|0;c[r>>2]=c[e>>2];e=c[o>>2]|0;o=c[p>>2]|0;c[k+0>>2]=c[r+0>>2];qj(b,k,n,e,o,f,g);i=d;return}function sj(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;i=i+128|0;j=d;k=d+116|0;l=d+104|0;m=d+20|0;n=d+16|0;o=d+12|0;p=d+8|0;q=d+4|0;a[k+0|0]=a[32896|0]|0;a[k+1|0]=a[32897|0]|0;a[k+2|0]=a[32898|0]|0;a[k+3|0]=a[32899|0]|0;a[k+4|0]=a[32900|0]|0;a[k+5|0]=a[32901|0]|0;r=k+1|0;s=f+4|0;t=c[s>>2]|0;if((t&2048|0)==0){u=r}else{a[r]=43;u=k+2|0}if((t&512|0)==0){v=u}else{a[u]=35;v=u+1|0}a[v]=108;u=v+1|0;v=t&74;do{if((v|0)==64){a[u]=111}else if((v|0)==8){if((t&16384|0)==0){a[u]=120;break}else{a[u]=88;break}}else{a[u]=117}}while(0);if((a[34e3]|0)==0?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}u=c[8498]|0;c[j>>2]=h;h=aj(l,12,u,k,j)|0;k=l+h|0;u=c[s>>2]&176;do{if((u|0)==16){s=a[l]|0;if(s<<24>>24==43|s<<24>>24==45){w=l+1|0;break}if((h|0)>1&s<<24>>24==48?(s=a[l+1|0]|0,s<<24>>24==88|s<<24>>24==120):0){w=l+2|0}else{x=20}}else if((u|0)==32){w=k}else{x=20}}while(0);if((x|0)==20){w=l}Jg(p,f);pj(l,w,k,m,n,o,p);Sf(c[p>>2]|0)|0;c[q>>2]=c[e>>2];e=c[n>>2]|0;n=c[o>>2]|0;c[j+0>>2]=c[q+0>>2];qj(b,j,m,e,n,f,g);i=d;return}function tj(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;d=i;i=i+240|0;k=d+8|0;l=d;m=d+204|0;n=d+32|0;o=d+28|0;p=d+24|0;q=d+20|0;r=d+16|0;s=l;c[s>>2]=37;c[s+4>>2]=0;s=l+1|0;t=f+4|0;u=c[t>>2]|0;if((u&2048|0)==0){v=s}else{a[s]=43;v=l+2|0}if((u&512|0)==0){w=v}else{a[v]=35;w=v+1|0}v=w+2|0;a[w]=108;a[w+1|0]=108;w=u&74;do{if((w|0)==64){a[v]=111}else if((w|0)==8){if((u&16384|0)==0){a[v]=120;break}else{a[v]=88;break}}else{a[v]=117}}while(0);if((a[34e3]|0)==0?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}v=c[8498]|0;u=k;c[u>>2]=h;c[u+4>>2]=j;j=aj(m,23,v,l,k)|0;l=m+j|0;v=c[t>>2]&176;do{if((v|0)==16){t=a[m]|0;if(t<<24>>24==43|t<<24>>24==45){x=m+1|0;break}if((j|0)>1&t<<24>>24==48?(t=a[m+1|0]|0,t<<24>>24==88|t<<24>>24==120):0){x=m+2|0}else{y=20}}else if((v|0)==32){x=l}else{y=20}}while(0);if((y|0)==20){x=m}Jg(q,f);pj(m,x,l,n,o,p,q);Sf(c[q>>2]|0)|0;c[r>>2]=c[e>>2];e=c[o>>2]|0;o=c[p>>2]|0;c[k+0>>2]=c[r+0>>2];qj(b,k,n,e,o,f,g);i=d;return}function uj(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0;d=i;i=i+304|0;l=d+8|0;m=d;n=d+272|0;o=d+268|0;p=d+40|0;q=d+36|0;r=d+32|0;s=d+28|0;t=d+24|0;u=d+20|0;v=m;c[v>>2]=37;c[v+4>>2]=0;v=m+1|0;w=f+4|0;x=c[w>>2]|0;if((x&2048|0)==0){y=v}else{a[v]=43;y=m+2|0}if((x&1024|0)==0){z=y}else{a[y]=35;z=y+1|0}y=x&260;v=x>>>14;do{if((y|0)==260){if((v&1|0)==0){a[z]=97;A=0;break}else{a[z]=65;A=0;break}}else{a[z]=46;x=z+2|0;a[z+1|0]=42;if((y|0)==256){if((v&1|0)==0){a[x]=101;A=1;break}else{a[x]=69;A=1;break}}else if((y|0)==4){if((v&1|0)==0){a[x]=102;A=1;break}else{a[x]=70;A=1;break}}else{if((v&1|0)==0){a[x]=103;A=1;break}else{a[x]=71;A=1;break}}}}while(0);c[o>>2]=n;if((a[34e3]|0)==0?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}v=c[8498]|0;if(A){c[l>>2]=c[f+8>>2];y=l+4|0;h[k>>3]=j;c[y>>2]=c[k>>2];c[y+4>>2]=c[k+4>>2];B=aj(n,30,v,m,l)|0}else{h[k>>3]=j;c[l>>2]=c[k>>2];c[l+4>>2]=c[k+4>>2];B=aj(n,30,v,m,l)|0}if((B|0)>29){v=(a[34e3]|0)==0;if(A){if(v?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}A=c[8498]|0;c[l>>2]=c[f+8>>2];y=l+4|0;h[k>>3]=j;c[y>>2]=c[k>>2];c[y+4>>2]=c[k+4>>2];C=hj(o,A,m,l)|0}else{if(v?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}v=c[8498]|0;c[l>>2]=c[f+8>>2];A=l+4|0;h[k>>3]=j;c[A>>2]=c[k>>2];c[A+4>>2]=c[k+4>>2];C=hj(o,v,m,l)|0}m=c[o>>2]|0;if((m|0)==0){Oo()}else{D=m;E=m;F=C}}else{D=c[o>>2]|0;E=0;F=B}B=D+F|0;o=c[w>>2]&176;do{if((o|0)==32){G=B}else if((o|0)==16){w=a[D]|0;if(w<<24>>24==43|w<<24>>24==45){G=D+1|0;break}if((F|0)>1&w<<24>>24==48?(w=a[D+1|0]|0,w<<24>>24==88|w<<24>>24==120):0){G=D+2|0}else{H=44}}else{H=44}}while(0);if((H|0)==44){G=D}if((D|0)!=(n|0)){H=Co(F<<3)|0;if((H|0)==0){Oo()}else{I=D;J=H;K=H}}else{I=n;J=0;K=p}Jg(s,f);vj(I,G,B,K,q,r,s);Sf(c[s>>2]|0)|0;c[u>>2]=c[e>>2];s=c[q>>2]|0;q=c[r>>2]|0;c[l+0>>2]=c[u+0>>2];qj(t,l,K,s,q,f,g);g=c[t>>2]|0;c[e>>2]=g;c[b>>2]=g;if((J|0)!=0){Do(J)}if((E|0)==0){i=d;return}Do(E);i=d;return}function vj(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;k=i;i=i+32|0;l=k;m=k+12|0;n=c[j>>2]|0;if(!((c[8524]|0)==-1)){c[l>>2]=34096;c[l+4>>2]=118;c[l+8>>2]=0;kg(34096,l,119)}o=(c[34100>>2]|0)+ -1|0;p=c[n+8>>2]|0;if(!((c[n+12>>2]|0)-p>>2>>>0>o>>>0)){q=vb(4)|0;ho(q);cc(q|0,42064,107)}n=c[p+(o<<2)>>2]|0;if((n|0)==0){q=vb(4)|0;ho(q);cc(q|0,42064,107)}q=c[j>>2]|0;if(!((c[8564]|0)==-1)){c[l>>2]=34256;c[l+4>>2]=118;c[l+8>>2]=0;kg(34256,l,119)}l=(c[34260>>2]|0)+ -1|0;j=c[q+8>>2]|0;if(!((c[q+12>>2]|0)-j>>2>>>0>l>>>0)){r=vb(4)|0;ho(r);cc(r|0,42064,107)}q=c[j+(l<<2)>>2]|0;if((q|0)==0){r=vb(4)|0;ho(r);cc(r|0,42064,107)}mc[c[(c[q>>2]|0)+20>>2]&63](m,q);c[h>>2]=f;r=a[b]|0;if(r<<24>>24==43|r<<24>>24==45){l=xc[c[(c[n>>2]|0)+44>>2]&31](n,r)|0;r=c[h>>2]|0;c[h>>2]=r+4;c[r>>2]=l;s=b+1|0}else{s=b}l=e;a:do{if(((l-s|0)>1?(a[s]|0)==48:0)?(r=s+1|0,j=a[r]|0,j<<24>>24==88|j<<24>>24==120):0){j=xc[c[(c[n>>2]|0)+44>>2]&31](n,48)|0;o=c[h>>2]|0;c[h>>2]=o+4;c[o>>2]=j;j=s+2|0;o=xc[c[(c[n>>2]|0)+44>>2]&31](n,a[r]|0)|0;r=c[h>>2]|0;c[h>>2]=r+4;c[r>>2]=o;if(j>>>0<e>>>0){o=j;while(1){r=a[o]|0;if((a[34e3]|0)==0?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}p=o+1|0;if((ab(r<<24>>24|0,c[8498]|0)|0)==0){t=j;u=o;break a}if(p>>>0<e>>>0){o=p}else{t=j;u=p;break}}}else{t=j;u=j}}else{v=14}}while(0);b:do{if((v|0)==14){if(s>>>0<e>>>0){o=s;while(1){p=a[o]|0;if((a[34e3]|0)==0?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}r=o+1|0;if((fb(p<<24>>24|0,c[8498]|0)|0)==0){t=s;u=o;break b}if(r>>>0<e>>>0){o=r}else{t=s;u=r;break}}}else{t=s;u=s}}}while(0);s=a[m]|0;if((s&1)==0){w=(s&255)>>>1}else{w=c[m+4>>2]|0}if((w|0)!=0){if((t|0)!=(u|0)?(w=u+ -1|0,w>>>0>t>>>0):0){s=t;v=w;do{w=a[s]|0;a[s]=a[v]|0;a[v]=w;s=s+1|0;v=v+ -1|0}while(s>>>0<v>>>0)}v=oc[c[(c[q>>2]|0)+16>>2]&63](q)|0;if(t>>>0<u>>>0){s=m+1|0;w=m+4|0;o=m+8|0;j=0;r=0;p=t;while(1){x=(a[m]&1)==0;if((a[(x?s:c[o>>2]|0)+r|0]|0)>0?(j|0)==(a[(x?s:c[o>>2]|0)+r|0]|0):0){x=c[h>>2]|0;c[h>>2]=x+4;c[x>>2]=v;x=a[m]|0;if((x&1)==0){y=(x&255)>>>1}else{y=c[w>>2]|0}z=0;A=(r>>>0<(y+ -1|0)>>>0)+r|0}else{z=j;A=r}x=xc[c[(c[n>>2]|0)+44>>2]&31](n,a[p]|0)|0;B=c[h>>2]|0;C=B+4|0;c[h>>2]=C;c[B>>2]=x;x=p+1|0;if(x>>>0<u>>>0){j=z+1|0;r=A;p=x}else{D=C;break}}}else{D=c[h>>2]|0}p=f+(t-b<<2)|0;if((p|0)!=(D|0)?(A=D+ -4|0,A>>>0>p>>>0):0){r=p;p=A;while(1){A=c[r>>2]|0;c[r>>2]=c[p>>2];c[p>>2]=A;A=r+4|0;z=p+ -4|0;if(A>>>0<z>>>0){r=A;p=z}else{E=D;break}}}else{E=D}}else{uc[c[(c[n>>2]|0)+48>>2]&7](n,t,u,c[h>>2]|0)|0;D=(c[h>>2]|0)+(u-t<<2)|0;c[h>>2]=D;E=D}c:do{if(u>>>0<e>>>0){D=u;while(1){t=a[D]|0;if(t<<24>>24==46){break}p=xc[c[(c[n>>2]|0)+44>>2]&31](n,t)|0;t=c[h>>2]|0;r=t+4|0;c[h>>2]=r;c[t>>2]=p;p=D+1|0;if(p>>>0<e>>>0){D=p}else{F=r;G=p;break c}}p=oc[c[(c[q>>2]|0)+12>>2]&63](q)|0;r=c[h>>2]|0;t=r+4|0;c[h>>2]=t;c[r>>2]=p;F=t;G=D+1|0}else{F=E;G=u}}while(0);uc[c[(c[n>>2]|0)+48>>2]&7](n,G,e,F)|0;F=(c[h>>2]|0)+(l-G<<2)|0;c[h>>2]=F;if((d|0)==(e|0)){H=F;c[g>>2]=H;pg(m);i=k;return}H=f+(d-b<<2)|0;c[g>>2]=H;pg(m);i=k;return}function wj(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0;d=i;i=i+304|0;l=d+8|0;m=d;n=d+272|0;o=d+268|0;p=d+40|0;q=d+36|0;r=d+32|0;s=d+28|0;t=d+24|0;u=d+20|0;v=m;c[v>>2]=37;c[v+4>>2]=0;v=m+1|0;w=f+4|0;x=c[w>>2]|0;if((x&2048|0)==0){y=v}else{a[v]=43;y=m+2|0}if((x&1024|0)==0){z=y}else{a[y]=35;z=y+1|0}y=x&260;v=x>>>14;do{if((y|0)==260){a[z]=76;x=z+1|0;if((v&1|0)==0){a[x]=97;A=0;break}else{a[x]=65;A=0;break}}else{a[z]=46;a[z+1|0]=42;a[z+2|0]=76;x=z+3|0;if((y|0)==4){if((v&1|0)==0){a[x]=102;A=1;break}else{a[x]=70;A=1;break}}else if((y|0)==256){if((v&1|0)==0){a[x]=101;A=1;break}else{a[x]=69;A=1;break}}else{if((v&1|0)==0){a[x]=103;A=1;break}else{a[x]=71;A=1;break}}}}while(0);c[o>>2]=n;if((a[34e3]|0)==0?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}v=c[8498]|0;if(A){c[l>>2]=c[f+8>>2];y=l+4|0;h[k>>3]=j;c[y>>2]=c[k>>2];c[y+4>>2]=c[k+4>>2];B=aj(n,30,v,m,l)|0}else{h[k>>3]=j;c[l>>2]=c[k>>2];c[l+4>>2]=c[k+4>>2];B=aj(n,30,v,m,l)|0}if((B|0)>29){v=(a[34e3]|0)==0;if(A){if(v?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}A=c[8498]|0;c[l>>2]=c[f+8>>2];y=l+4|0;h[k>>3]=j;c[y>>2]=c[k>>2];c[y+4>>2]=c[k+4>>2];C=hj(o,A,m,l)|0}else{if(v?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}v=c[8498]|0;h[k>>3]=j;c[l>>2]=c[k>>2];c[l+4>>2]=c[k+4>>2];C=hj(o,v,m,l)|0}m=c[o>>2]|0;if((m|0)==0){Oo()}else{D=m;E=m;F=C}}else{D=c[o>>2]|0;E=0;F=B}B=D+F|0;o=c[w>>2]&176;do{if((o|0)==16){w=a[D]|0;if(w<<24>>24==43|w<<24>>24==45){G=D+1|0;break}if((F|0)>1&w<<24>>24==48?(w=a[D+1|0]|0,w<<24>>24==88|w<<24>>24==120):0){G=D+2|0}else{H=44}}else if((o|0)==32){G=B}else{H=44}}while(0);if((H|0)==44){G=D}if((D|0)!=(n|0)){H=Co(F<<3)|0;if((H|0)==0){Oo()}else{I=D;J=H;K=H}}else{I=n;J=0;K=p}Jg(s,f);vj(I,G,B,K,q,r,s);Sf(c[s>>2]|0)|0;c[u>>2]=c[e>>2];s=c[q>>2]|0;q=c[r>>2]|0;c[l+0>>2]=c[u+0>>2];qj(t,l,K,s,q,f,g);g=c[t>>2]|0;c[e>>2]=g;c[b>>2]=g;if((J|0)!=0){Do(J)}if((E|0)==0){i=d;return}Do(E);i=d;return}function xj(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;d=i;i=i+208|0;j=d;k=d+188|0;l=d+168|0;m=d+20|0;n=d+16|0;o=d+12|0;a[k+0|0]=a[32904|0]|0;a[k+1|0]=a[32905|0]|0;a[k+2|0]=a[32906|0]|0;a[k+3|0]=a[32907|0]|0;a[k+4|0]=a[32908|0]|0;a[k+5|0]=a[32909|0]|0;if((a[34e3]|0)==0?(Ga(34e3)|0)!=0:0){c[8498]=eb(2147483647,34008,0)|0;bb(34e3)}p=c[8498]|0;c[j>>2]=h;h=aj(l,20,p,k,j)|0;k=l+h|0;p=c[f+4>>2]&176;do{if((p|0)==16){q=a[l]|0;if(q<<24>>24==43|q<<24>>24==45){r=l+1|0;break}if((h|0)>1&q<<24>>24==48?(q=a[l+1|0]|0,q<<24>>24==88|q<<24>>24==120):0){r=l+2|0}else{s=10}}else if((p|0)==32){r=k}else{s=10}}while(0);if((s|0)==10){r=l}Jg(n,f);s=c[n>>2]|0;if(!((c[8524]|0)==-1)){c[j>>2]=34096;c[j+4>>2]=118;c[j+8>>2]=0;kg(34096,j,119)}p=(c[34100>>2]|0)+ -1|0;q=c[s+8>>2]|0;if(!((c[s+12>>2]|0)-q>>2>>>0>p>>>0)){t=vb(4)|0;ho(t);cc(t|0,42064,107)}s=c[q+(p<<2)>>2]|0;if((s|0)==0){t=vb(4)|0;ho(t);cc(t|0,42064,107)}Sf(c[n>>2]|0)|0;uc[c[(c[s>>2]|0)+48>>2]&7](s,l,k,m)|0;s=m+(h<<2)|0;if((r|0)==(k|0)){u=s;v=c[e>>2]|0;c[o>>2]=v;c[j+0>>2]=c[o+0>>2];qj(b,j,m,u,s,f,g);i=d;return}u=m+(r-l<<2)|0;v=c[e>>2]|0;c[o>>2]=v;c[j+0>>2]=c[o+0>>2];qj(b,j,m,u,s,f,g);i=d;return}function yj(e,f,g,h,j,k,l,m,n){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;var o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0;o=i;i=i+32|0;p=o;q=o+28|0;r=o+24|0;s=o+20|0;t=o+16|0;u=o+12|0;Jg(r,j);v=c[r>>2]|0;if(!((c[8526]|0)==-1)){c[p>>2]=34104;c[p+4>>2]=118;c[p+8>>2]=0;kg(34104,p,119)}w=(c[34108>>2]|0)+ -1|0;x=c[v+8>>2]|0;if(!((c[v+12>>2]|0)-x>>2>>>0>w>>>0)){y=vb(4)|0;ho(y);cc(y|0,42064,107)}v=c[x+(w<<2)>>2]|0;if((v|0)==0){y=vb(4)|0;ho(y);cc(y|0,42064,107)}Sf(c[r>>2]|0)|0;c[k>>2]=0;a:do{if((m|0)!=(n|0)){r=v+8|0;y=m;w=0;b:while(1){x=w;while(1){if((x|0)!=0){z=65;break a}A=c[g>>2]|0;if((A|0)!=0){if((c[A+12>>2]|0)==(c[A+16>>2]|0)?(oc[c[(c[A>>2]|0)+36>>2]&63](A)|0)==-1:0){c[g>>2]=0;B=0}else{B=A}}else{B=0}A=(B|0)==0;C=c[h>>2]|0;do{if((C|0)!=0){if((c[C+12>>2]|0)==(c[C+16>>2]|0)?(oc[c[(c[C>>2]|0)+36>>2]&63](C)|0)==-1:0){c[h>>2]=0;z=19;break}if(A){D=C}else{z=20;break b}}else{z=19}}while(0);if((z|0)==19){z=0;if(A){z=20;break b}else{D=0}}if((ic[c[(c[v>>2]|0)+36>>2]&31](v,a[y]|0,0)|0)<<24>>24==37){z=22;break}C=a[y]|0;if(C<<24>>24>-1?(E=c[r>>2]|0,!((b[E+(C<<24>>24<<1)>>1]&8192)==0)):0){F=y;z=33;break}G=B+12|0;C=c[G>>2]|0;H=B+16|0;if((C|0)==(c[H>>2]|0)){I=oc[c[(c[B>>2]|0)+36>>2]&63](B)|0}else{I=d[C]|0}C=xc[c[(c[v>>2]|0)+12>>2]&31](v,I&255)|0;if(C<<24>>24==(xc[c[(c[v>>2]|0)+12>>2]&31](v,a[y]|0)|0)<<24>>24){z=60;break}c[k>>2]=4;x=4}c:do{if((z|0)==22){z=0;x=y+1|0;if((x|0)==(n|0)){z=23;break b}C=ic[c[(c[v>>2]|0)+36>>2]&31](v,a[x]|0,0)|0;if(C<<24>>24==48|C<<24>>24==69){J=y+2|0;if((J|0)==(n|0)){z=26;break b}K=J;L=ic[c[(c[v>>2]|0)+36>>2]&31](v,a[J]|0,0)|0;M=C}else{K=x;L=C;M=0}C=c[(c[f>>2]|0)+36>>2]|0;c[t>>2]=B;c[u>>2]=D;c[q+0>>2]=c[t+0>>2];c[p+0>>2]=c[u+0>>2];nc[C&3](s,f,q,p,j,k,l,L,M);c[g>>2]=c[s>>2];N=K+1|0}else if((z|0)==33){while(1){z=0;C=F+1|0;if((C|0)==(n|0)){O=n;break}x=a[C]|0;if(!(x<<24>>24>-1)){O=C;break}if((b[E+(x<<24>>24<<1)>>1]&8192)==0){O=C;break}else{F=C;z=33}}A=B;C=D;x=D;while(1){if((A|0)!=0){if((c[A+12>>2]|0)==(c[A+16>>2]|0)?(oc[c[(c[A>>2]|0)+36>>2]&63](A)|0)==-1:0){c[g>>2]=0;P=0}else{P=A}}else{P=0}J=(P|0)==0;do{if((x|0)!=0){if((c[x+12>>2]|0)!=(c[x+16>>2]|0)){if(J){Q=C;R=x;break}else{N=O;break c}}if(!((oc[c[(c[x>>2]|0)+36>>2]&63](x)|0)==-1)){if(J^(C|0)==0){Q=C;R=C;break}else{N=O;break c}}else{c[h>>2]=0;S=0;z=46;break}}else{S=C;z=46}}while(0);if((z|0)==46){z=0;if(J){N=O;break c}else{Q=S;R=0}}T=P+12|0;U=c[T>>2]|0;V=P+16|0;if((U|0)==(c[V>>2]|0)){W=oc[c[(c[P>>2]|0)+36>>2]&63](P)|0}else{W=d[U]|0}if(!((W&255)<<24>>24>-1)){N=O;break c}if((b[(c[r>>2]|0)+(W<<24>>24<<1)>>1]&8192)==0){N=O;break c}U=c[T>>2]|0;if((U|0)==(c[V>>2]|0)){oc[c[(c[P>>2]|0)+40>>2]&63](P)|0;A=P;C=Q;x=R;continue}else{c[T>>2]=U+1;A=P;C=Q;x=R;continue}}}else if((z|0)==60){z=0;x=c[G>>2]|0;if((x|0)==(c[H>>2]|0)){oc[c[(c[B>>2]|0)+40>>2]&63](B)|0}else{c[G>>2]=x+1}N=y+1|0}}while(0);if((N|0)==(n|0)){z=65;break a}y=N;w=c[k>>2]|0}if((z|0)==20){c[k>>2]=4;X=B;break}else if((z|0)==23){c[k>>2]=4;X=B;break}else if((z|0)==26){c[k>>2]=4;X=B;break}}else{z=65}}while(0);if((z|0)==65){X=c[g>>2]|0}if((X|0)!=0){if((c[X+12>>2]|0)==(c[X+16>>2]|0)?(oc[c[(c[X>>2]|0)+36>>2]&63](X)|0)==-1:0){c[g>>2]=0;Y=0}else{Y=X}}else{Y=0}X=(Y|0)==0;g=c[h>>2]|0;do{if((g|0)!=0){if((c[g+12>>2]|0)==(c[g+16>>2]|0)?(oc[c[(c[g>>2]|0)+36>>2]&63](g)|0)==-1:0){c[h>>2]=0;z=75;break}if(X){c[e>>2]=Y;i=o;return}}else{z=75}}while(0);if((z|0)==75?!X:0){c[e>>2]=Y;i=o;return}c[k>>2]=c[k>>2]|2;c[e>>2]=Y;i=o;return}function zj(a){a=a|0;var b=0;b=i;Jo(a);i=b;return}function Aj(a){a=a|0;return}function Bj(a){a=a|0;return 2}function Cj(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0;j=i;i=i+16|0;k=j+12|0;l=j+8|0;m=j+4|0;n=j;c[m>>2]=c[d>>2];c[n>>2]=c[e>>2];c[l+0>>2]=c[m+0>>2];c[k+0>>2]=c[n+0>>2];yj(a,b,l,k,f,g,h,33008,33016|0);i=j;return}function Dj(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;k=i;i=i+16|0;l=k+12|0;m=k+8|0;n=k+4|0;o=k;p=d+8|0;q=oc[c[(c[p>>2]|0)+20>>2]&63](p)|0;c[n>>2]=c[e>>2];c[o>>2]=c[f>>2];f=a[q]|0;if((f&1)==0){r=q+1|0;s=(f&255)>>>1;t=q+1|0}else{f=c[q+8>>2]|0;r=f;s=c[q+4>>2]|0;t=f}f=r+s|0;c[m+0>>2]=c[n+0>>2];c[l+0>>2]=c[o+0>>2];yj(b,d,m,l,g,h,j,t,f);i=k;return}function Ej(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;j=i;i=i+32|0;k=j;l=j+16|0;m=j+12|0;Jg(m,f);f=c[m>>2]|0;if(!((c[8526]|0)==-1)){c[k>>2]=34104;c[k+4>>2]=118;c[k+8>>2]=0;kg(34104,k,119)}n=(c[34108>>2]|0)+ -1|0;o=c[f+8>>2]|0;if(!((c[f+12>>2]|0)-o>>2>>>0>n>>>0)){p=vb(4)|0;ho(p);cc(p|0,42064,107)}f=c[o+(n<<2)>>2]|0;if((f|0)==0){p=vb(4)|0;ho(p);cc(p|0,42064,107)}Sf(c[m>>2]|0)|0;m=c[e>>2]|0;e=b+8|0;b=oc[c[c[e>>2]>>2]&63](e)|0;c[l>>2]=m;m=b+168|0;c[k+0>>2]=c[l+0>>2];l=(_h(d,k,b,m,f,g,0)|0)-b|0;if((l|0)>=168){q=c[d>>2]|0;c[a>>2]=q;i=j;return}c[h+24>>2]=((l|0)/12|0|0)%7|0;q=c[d>>2]|0;c[a>>2]=q;i=j;return}function Fj(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;j=i;i=i+32|0;k=j;l=j+16|0;m=j+12|0;Jg(m,f);f=c[m>>2]|0;if(!((c[8526]|0)==-1)){c[k>>2]=34104;c[k+4>>2]=118;c[k+8>>2]=0;kg(34104,k,119)}n=(c[34108>>2]|0)+ -1|0;o=c[f+8>>2]|0;if(!((c[f+12>>2]|0)-o>>2>>>0>n>>>0)){p=vb(4)|0;ho(p);cc(p|0,42064,107)}f=c[o+(n<<2)>>2]|0;if((f|0)==0){p=vb(4)|0;ho(p);cc(p|0,42064,107)}Sf(c[m>>2]|0)|0;m=c[e>>2]|0;e=b+8|0;b=oc[c[(c[e>>2]|0)+4>>2]&63](e)|0;c[l>>2]=m;m=b+288|0;c[k+0>>2]=c[l+0>>2];l=(_h(d,k,b,m,f,g,0)|0)-b|0;if((l|0)>=288){q=c[d>>2]|0;c[a>>2]=q;i=j;return}c[h+16>>2]=((l|0)/12|0|0)%12|0;q=c[d>>2]|0;c[a>>2]=q;i=j;return}function Gj(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;b=i;i=i+32|0;j=b;k=b+16|0;l=b+12|0;Jg(l,f);f=c[l>>2]|0;if(!((c[8526]|0)==-1)){c[j>>2]=34104;c[j+4>>2]=118;c[j+8>>2]=0;kg(34104,j,119)}m=(c[34108>>2]|0)+ -1|0;n=c[f+8>>2]|0;if(!((c[f+12>>2]|0)-n>>2>>>0>m>>>0)){o=vb(4)|0;ho(o);cc(o|0,42064,107)}f=c[n+(m<<2)>>2]|0;if((f|0)==0){o=vb(4)|0;ho(o);cc(o|0,42064,107)}Sf(c[l>>2]|0)|0;l=h+20|0;c[k>>2]=c[e>>2];c[j+0>>2]=c[k+0>>2];k=Kj(d,j,g,f,4)|0;if((c[g>>2]&4|0)!=0){p=c[d>>2]|0;c[a>>2]=p;i=b;return}if((k|0)<69){q=k+2e3|0}else{q=(k+ -69|0)>>>0<31?k+1900|0:k}c[l>>2]=q+ -1900;p=c[d>>2]|0;c[a>>2]=p;i=b;return}function Hj(b,d,e,f,g,h,j,k,l){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0;l=i;i=i+176|0;m=l;n=l+164|0;o=l+160|0;p=l+156|0;q=l+152|0;r=l+148|0;s=l+144|0;t=l+140|0;u=l+136|0;v=l+132|0;w=l+128|0;x=l+124|0;y=l+120|0;z=l+116|0;A=l+112|0;B=l+108|0;C=l+104|0;D=l+100|0;E=l+96|0;F=l+92|0;G=l+88|0;H=l+84|0;I=l+80|0;J=l+76|0;K=l+72|0;L=l+68|0;M=l+64|0;N=l+60|0;O=l+56|0;P=l+52|0;Q=l+48|0;R=l+44|0;S=l+40|0;T=l+36|0;U=l+32|0;V=l+28|0;W=l+24|0;X=l+20|0;Y=l+16|0;Z=l+12|0;c[h>>2]=0;Jg(A,g);_=c[A>>2]|0;if(!((c[8526]|0)==-1)){c[m>>2]=34104;c[m+4>>2]=118;c[m+8>>2]=0;kg(34104,m,119)}$=(c[34108>>2]|0)+ -1|0;aa=c[_+8>>2]|0;if(!((c[_+12>>2]|0)-aa>>2>>>0>$>>>0)){ba=vb(4)|0;ho(ba);cc(ba|0,42064,107)}_=c[aa+($<<2)>>2]|0;if((_|0)==0){ba=vb(4)|0;ho(ba);cc(ba|0,42064,107)}Sf(c[A>>2]|0)|0;a:switch(k<<24>>24|0){case 72:{c[w>>2]=c[f>>2];c[m+0>>2]=c[w+0>>2];w=Kj(e,m,h,_,2)|0;k=c[h>>2]|0;if((k&4|0)==0&(w|0)<24){c[j+8>>2]=w;break a}else{c[h>>2]=k|4;break a}break};case 70:{c[I>>2]=c[e>>2];c[J>>2]=c[f>>2];c[n+0>>2]=c[I+0>>2];c[m+0>>2]=c[J+0>>2];yj(H,d,n,m,g,h,j,33024,33032|0);c[e>>2]=c[H>>2];break};case 73:{H=j+8|0;c[v>>2]=c[f>>2];c[m+0>>2]=c[v+0>>2];v=Kj(e,m,h,_,2)|0;J=c[h>>2]|0;if((J&4|0)==0?(v+ -1|0)>>>0<12:0){c[H>>2]=v;break a}c[h>>2]=J|4;break};case 109:{c[t>>2]=c[f>>2];c[m+0>>2]=c[t+0>>2];t=Kj(e,m,h,_,2)|0;J=c[h>>2]|0;if((J&4|0)==0&(t|0)<13){c[j+16>>2]=t+ -1;break a}else{c[h>>2]=J|4;break a}break};case 68:{c[F>>2]=c[e>>2];c[G>>2]=c[f>>2];c[n+0>>2]=c[F+0>>2];c[m+0>>2]=c[G+0>>2];yj(E,d,n,m,g,h,j,33016,33024|0);c[e>>2]=c[E>>2];break};case 116:case 110:{c[K>>2]=c[f>>2];c[m+0>>2]=c[K+0>>2];Ij(0,e,m,h,_);break};case 65:case 97:{K=c[f>>2]|0;E=d+8|0;G=oc[c[c[E>>2]>>2]&63](E)|0;c[z>>2]=K;c[m+0>>2]=c[z+0>>2];z=(_h(e,m,G,G+168|0,_,h,0)|0)-G|0;if((z|0)<168){c[j+24>>2]=((z|0)/12|0|0)%7|0}break};case 89:{c[n>>2]=c[f>>2];c[m+0>>2]=c[n+0>>2];z=Kj(e,m,h,_,4)|0;if((c[h>>2]&4|0)==0){c[j+20>>2]=z+ -1900}break};case 37:{c[Z>>2]=c[f>>2];c[m+0>>2]=c[Z+0>>2];Jj(0,e,m,h,_);break};case 121:{Z=j+20|0;c[o>>2]=c[f>>2];c[m+0>>2]=c[o+0>>2];o=Kj(e,m,h,_,4)|0;if((c[h>>2]&4|0)==0){if((o|0)<69){ca=o+2e3|0}else{ca=(o+ -69|0)>>>0<31?o+1900|0:o}c[Z>>2]=ca+ -1900}break};case 106:{c[u>>2]=c[f>>2];c[m+0>>2]=c[u+0>>2];u=Kj(e,m,h,_,3)|0;ca=c[h>>2]|0;if((ca&4|0)==0&(u|0)<366){c[j+28>>2]=u;break a}else{c[h>>2]=ca|4;break a}break};case 112:{ca=j+8|0;u=c[f>>2]|0;Z=d+8|0;o=oc[c[(c[Z>>2]|0)+8>>2]&63](Z)|0;Z=a[o]|0;if((Z&1)==0){da=(Z&255)>>>1}else{da=c[o+4>>2]|0}Z=a[o+12|0]|0;if((Z&1)==0){ea=(Z&255)>>>1}else{ea=c[o+16>>2]|0}if((da|0)==(0-ea|0)){c[h>>2]=c[h>>2]|4;break a}c[r>>2]=u;c[m+0>>2]=c[r+0>>2];r=_h(e,m,o,o+24|0,_,h,0)|0;u=r-o|0;if((r|0)==(o|0)?(c[ca>>2]|0)==12:0){c[ca>>2]=0;break a}if((u|0)==12?(u=c[ca>>2]|0,(u|0)<12):0){c[ca>>2]=u+12}break};case 101:case 100:{u=j+12|0;c[x>>2]=c[f>>2];c[m+0>>2]=c[x+0>>2];x=Kj(e,m,h,_,2)|0;ca=c[h>>2]|0;if((ca&4|0)==0?(x+ -1|0)>>>0<31:0){c[u>>2]=x;break a}c[h>>2]=ca|4;break};case 77:{c[s>>2]=c[f>>2];c[m+0>>2]=c[s+0>>2];s=Kj(e,m,h,_,2)|0;ca=c[h>>2]|0;if((ca&4|0)==0&(s|0)<60){c[j+4>>2]=s;break a}else{c[h>>2]=ca|4;break a}break};case 88:{ca=d+8|0;s=oc[c[(c[ca>>2]|0)+24>>2]&63](ca)|0;c[X>>2]=c[e>>2];c[Y>>2]=c[f>>2];ca=a[s]|0;if((ca&1)==0){fa=s+1|0;ga=(ca&255)>>>1;ha=s+1|0}else{ca=c[s+8>>2]|0;fa=ca;ga=c[s+4>>2]|0;ha=ca}c[n+0>>2]=c[X+0>>2];c[m+0>>2]=c[Y+0>>2];yj(W,d,n,m,g,h,j,ha,fa+ga|0);c[e>>2]=c[W>>2];break};case 114:{c[M>>2]=c[e>>2];c[N>>2]=c[f>>2];c[n+0>>2]=c[M+0>>2];c[m+0>>2]=c[N+0>>2];yj(L,d,n,m,g,h,j,33032,33043|0);c[e>>2]=c[L>>2];break};case 82:{c[P>>2]=c[e>>2];c[Q>>2]=c[f>>2];c[n+0>>2]=c[P+0>>2];c[m+0>>2]=c[Q+0>>2];yj(O,d,n,m,g,h,j,33048,33053|0);c[e>>2]=c[O>>2];break};case 99:{O=d+8|0;Q=oc[c[(c[O>>2]|0)+12>>2]&63](O)|0;c[C>>2]=c[e>>2];c[D>>2]=c[f>>2];O=a[Q]|0;if((O&1)==0){ia=Q+1|0;ja=(O&255)>>>1;ka=Q+1|0}else{O=c[Q+8>>2]|0;ia=O;ja=c[Q+4>>2]|0;ka=O}c[n+0>>2]=c[C+0>>2];c[m+0>>2]=c[D+0>>2];yj(B,d,n,m,g,h,j,ka,ia+ja|0);c[e>>2]=c[B>>2];break};case 83:{c[q>>2]=c[f>>2];c[m+0>>2]=c[q+0>>2];q=Kj(e,m,h,_,2)|0;B=c[h>>2]|0;if((B&4|0)==0&(q|0)<61){c[j>>2]=q;break a}else{c[h>>2]=B|4;break a}break};case 84:{c[S>>2]=c[e>>2];c[T>>2]=c[f>>2];c[n+0>>2]=c[S+0>>2];c[m+0>>2]=c[T+0>>2];yj(R,d,n,m,g,h,j,33056,33064|0);c[e>>2]=c[R>>2];break};case 119:{c[p>>2]=c[f>>2];c[m+0>>2]=c[p+0>>2];p=Kj(e,m,h,_,1)|0;R=c[h>>2]|0;if((R&4|0)==0&(p|0)<7){c[j+24>>2]=p;break a}else{c[h>>2]=R|4;break a}break};case 120:{R=c[(c[d>>2]|0)+20>>2]|0;c[U>>2]=c[e>>2];c[V>>2]=c[f>>2];c[n+0>>2]=c[U+0>>2];c[m+0>>2]=c[V+0>>2];jc[R&63](b,d,n,m,g,h,j);i=l;return};case 104:case 66:case 98:{g=c[f>>2]|0;f=d+8|0;d=oc[c[(c[f>>2]|0)+4>>2]&63](f)|0;c[y>>2]=g;c[m+0>>2]=c[y+0>>2];y=(_h(e,m,d,d+288|0,_,h,0)|0)-d|0;if((y|0)<288){c[j+16>>2]=((y|0)/12|0|0)%12|0}break};default:{c[h>>2]=c[h>>2]|4}}c[b>>2]=c[e>>2];i=l;return}function Ij(a,e,f,g,h){a=a|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;a=i;j=h+8|0;a:while(1){h=c[e>>2]|0;do{if((h|0)!=0){if((c[h+12>>2]|0)==(c[h+16>>2]|0)){if((oc[c[(c[h>>2]|0)+36>>2]&63](h)|0)==-1){c[e>>2]=0;k=0;break}else{k=c[e>>2]|0;break}}else{k=h}}else{k=0}}while(0);h=(k|0)==0;l=c[f>>2]|0;do{if((l|0)!=0){if((c[l+12>>2]|0)!=(c[l+16>>2]|0)){if(h){m=l;break}else{n=l;break a}}if(!((oc[c[(c[l>>2]|0)+36>>2]&63](l)|0)==-1)){if(h){m=l;break}else{n=l;break a}}else{c[f>>2]=0;o=12;break}}else{o=12}}while(0);if((o|0)==12){o=0;if(h){n=0;break}else{m=0}}l=c[e>>2]|0;p=c[l+12>>2]|0;if((p|0)==(c[l+16>>2]|0)){q=oc[c[(c[l>>2]|0)+36>>2]&63](l)|0}else{q=d[p]|0}if(!((q&255)<<24>>24>-1)){n=m;break}if((b[(c[j>>2]|0)+(q<<24>>24<<1)>>1]&8192)==0){n=m;break}p=c[e>>2]|0;l=p+12|0;r=c[l>>2]|0;if((r|0)==(c[p+16>>2]|0)){oc[c[(c[p>>2]|0)+40>>2]&63](p)|0;continue}else{c[l>>2]=r+1;continue}}m=c[e>>2]|0;do{if((m|0)!=0){if((c[m+12>>2]|0)==(c[m+16>>2]|0)){if((oc[c[(c[m>>2]|0)+36>>2]&63](m)|0)==-1){c[e>>2]=0;s=0;break}else{s=c[e>>2]|0;break}}else{s=m}}else{s=0}}while(0);m=(s|0)==0;do{if((n|0)!=0){if((c[n+12>>2]|0)==(c[n+16>>2]|0)?(oc[c[(c[n>>2]|0)+36>>2]&63](n)|0)==-1:0){c[f>>2]=0;o=32;break}if(m){i=a;return}}else{o=32}}while(0);if((o|0)==32?!m:0){i=a;return}c[g>>2]=c[g>>2]|2;i=a;return}function Jj(a,b,e,f,g){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0;a=i;h=c[b>>2]|0;do{if((h|0)!=0){if((c[h+12>>2]|0)==(c[h+16>>2]|0)){if((oc[c[(c[h>>2]|0)+36>>2]&63](h)|0)==-1){c[b>>2]=0;j=0;break}else{j=c[b>>2]|0;break}}else{j=h}}else{j=0}}while(0);h=(j|0)==0;j=c[e>>2]|0;do{if((j|0)!=0){if((c[j+12>>2]|0)==(c[j+16>>2]|0)?(oc[c[(c[j>>2]|0)+36>>2]&63](j)|0)==-1:0){c[e>>2]=0;k=11;break}if(h){l=j}else{k=12}}else{k=11}}while(0);if((k|0)==11){if(h){k=12}else{l=0}}if((k|0)==12){c[f>>2]=c[f>>2]|6;i=a;return}h=c[b>>2]|0;j=c[h+12>>2]|0;if((j|0)==(c[h+16>>2]|0)){m=oc[c[(c[h>>2]|0)+36>>2]&63](h)|0}else{m=d[j]|0}if(!((ic[c[(c[g>>2]|0)+36>>2]&31](g,m&255,0)|0)<<24>>24==37)){c[f>>2]=c[f>>2]|4;i=a;return}m=c[b>>2]|0;g=m+12|0;j=c[g>>2]|0;if((j|0)==(c[m+16>>2]|0)){oc[c[(c[m>>2]|0)+40>>2]&63](m)|0}else{c[g>>2]=j+1}j=c[b>>2]|0;do{if((j|0)!=0){if((c[j+12>>2]|0)==(c[j+16>>2]|0)){if((oc[c[(c[j>>2]|0)+36>>2]&63](j)|0)==-1){c[b>>2]=0;n=0;break}else{n=c[b>>2]|0;break}}else{n=j}}else{n=0}}while(0);j=(n|0)==0;do{if((l|0)!=0){if((c[l+12>>2]|0)==(c[l+16>>2]|0)?(oc[c[(c[l>>2]|0)+36>>2]&63](l)|0)==-1:0){c[e>>2]=0;k=31;break}if(j){i=a;return}}else{k=31}}while(0);if((k|0)==31?!j:0){i=a;return}c[f>>2]=c[f>>2]|2;i=a;return}function Kj(a,e,f,g,h){a=a|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;j=i;k=c[a>>2]|0;do{if((k|0)!=0){if((c[k+12>>2]|0)==(c[k+16>>2]|0)){if((oc[c[(c[k>>2]|0)+36>>2]&63](k)|0)==-1){c[a>>2]=0;l=0;break}else{l=c[a>>2]|0;break}}else{l=k}}else{l=0}}while(0);k=(l|0)==0;l=c[e>>2]|0;do{if((l|0)!=0){if((c[l+12>>2]|0)==(c[l+16>>2]|0)?(oc[c[(c[l>>2]|0)+36>>2]&63](l)|0)==-1:0){c[e>>2]=0;m=11;break}if(k){n=l}else{m=12}}else{m=11}}while(0);if((m|0)==11){if(k){m=12}else{n=0}}if((m|0)==12){c[f>>2]=c[f>>2]|6;o=0;i=j;return o|0}k=c[a>>2]|0;l=c[k+12>>2]|0;if((l|0)==(c[k+16>>2]|0)){p=oc[c[(c[k>>2]|0)+36>>2]&63](k)|0}else{p=d[l]|0}l=p&255;if(l<<24>>24>-1?(k=g+8|0,!((b[(c[k>>2]|0)+(p<<24>>24<<1)>>1]&2048)==0)):0){p=(ic[c[(c[g>>2]|0)+36>>2]&31](g,l,0)|0)<<24>>24;l=c[a>>2]|0;q=l+12|0;r=c[q>>2]|0;if((r|0)==(c[l+16>>2]|0)){oc[c[(c[l>>2]|0)+40>>2]&63](l)|0;s=h;t=n;u=n;v=p}else{c[q>>2]=r+1;s=h;t=n;u=n;v=p}while(1){w=v+ -48|0;p=s+ -1|0;n=c[a>>2]|0;do{if((n|0)!=0){if((c[n+12>>2]|0)==(c[n+16>>2]|0)){if((oc[c[(c[n>>2]|0)+36>>2]&63](n)|0)==-1){c[a>>2]=0;x=0;break}else{x=c[a>>2]|0;break}}else{x=n}}else{x=0}}while(0);n=(x|0)==0;if((u|0)!=0){if((c[u+12>>2]|0)==(c[u+16>>2]|0)){if((oc[c[(c[u>>2]|0)+36>>2]&63](u)|0)==-1){c[e>>2]=0;y=0;z=0}else{y=t;z=t}}else{y=t;z=u}}else{y=t;z=0}A=c[a>>2]|0;if(!((n^(z|0)==0)&(p|0)>0)){m=40;break}n=c[A+12>>2]|0;if((n|0)==(c[A+16>>2]|0)){B=oc[c[(c[A>>2]|0)+36>>2]&63](A)|0}else{B=d[n]|0}n=B&255;if(!(n<<24>>24>-1)){o=w;m=52;break}if((b[(c[k>>2]|0)+(B<<24>>24<<1)>>1]&2048)==0){o=w;m=52;break}h=((ic[c[(c[g>>2]|0)+36>>2]&31](g,n,0)|0)<<24>>24)+(w*10|0)|0;n=c[a>>2]|0;r=n+12|0;q=c[r>>2]|0;if((q|0)==(c[n+16>>2]|0)){oc[c[(c[n>>2]|0)+40>>2]&63](n)|0;s=p;t=y;u=z;v=h;continue}else{c[r>>2]=q+1;s=p;t=y;u=z;v=h;continue}}if((m|0)==40){do{if((A|0)!=0){if((c[A+12>>2]|0)==(c[A+16>>2]|0)){if((oc[c[(c[A>>2]|0)+36>>2]&63](A)|0)==-1){c[a>>2]=0;C=0;break}else{C=c[a>>2]|0;break}}else{C=A}}else{C=0}}while(0);A=(C|0)==0;do{if((y|0)!=0){if((c[y+12>>2]|0)==(c[y+16>>2]|0)?(oc[c[(c[y>>2]|0)+36>>2]&63](y)|0)==-1:0){c[e>>2]=0;m=50;break}if(A){o=w;i=j;return o|0}}else{m=50}}while(0);if((m|0)==50?!A:0){o=w;i=j;return o|0}c[f>>2]=c[f>>2]|2;o=w;i=j;return o|0}else if((m|0)==52){i=j;return o|0}}c[f>>2]=c[f>>2]|4;o=0;i=j;return o|0}function Lj(a,b,d,e,f,g,h,j,k){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0;l=i;i=i+32|0;m=l;n=l+28|0;o=l+24|0;p=l+20|0;q=l+16|0;r=l+12|0;Jg(o,f);s=c[o>>2]|0;if(!((c[8524]|0)==-1)){c[m>>2]=34096;c[m+4>>2]=118;c[m+8>>2]=0;kg(34096,m,119)}t=(c[34100>>2]|0)+ -1|0;u=c[s+8>>2]|0;if(!((c[s+12>>2]|0)-u>>2>>>0>t>>>0)){v=vb(4)|0;ho(v);cc(v|0,42064,107)}s=c[u+(t<<2)>>2]|0;if((s|0)==0){v=vb(4)|0;ho(v);cc(v|0,42064,107)}Sf(c[o>>2]|0)|0;c[g>>2]=0;a:do{if((j|0)!=(k|0)){o=j;v=0;b:while(1){t=v;while(1){if((t|0)!=0){w=69;break a}u=c[d>>2]|0;if((u|0)!=0){x=c[u+12>>2]|0;if((x|0)==(c[u+16>>2]|0)){y=oc[c[(c[u>>2]|0)+36>>2]&63](u)|0}else{y=c[x>>2]|0}if((y|0)==-1){c[d>>2]=0;z=1;A=0}else{z=0;A=u}}else{z=1;A=0}u=c[e>>2]|0;do{if((u|0)!=0){x=c[u+12>>2]|0;if((x|0)==(c[u+16>>2]|0)){B=oc[c[(c[u>>2]|0)+36>>2]&63](u)|0}else{B=c[x>>2]|0}if(!((B|0)==-1)){if(z){C=u;break}else{w=24;break b}}else{c[e>>2]=0;w=22;break}}else{w=22}}while(0);if((w|0)==22){w=0;if(z){w=24;break b}else{C=0}}if((ic[c[(c[s>>2]|0)+52>>2]&31](s,c[o>>2]|0,0)|0)<<24>>24==37){w=26;break}if(ic[c[(c[s>>2]|0)+12>>2]&31](s,8192,c[o>>2]|0)|0){D=o;w=36;break}E=A+12|0;u=c[E>>2]|0;F=A+16|0;if((u|0)==(c[F>>2]|0)){G=oc[c[(c[A>>2]|0)+36>>2]&63](A)|0}else{G=c[u>>2]|0}u=xc[c[(c[s>>2]|0)+28>>2]&31](s,G)|0;if((u|0)==(xc[c[(c[s>>2]|0)+28>>2]&31](s,c[o>>2]|0)|0)){w=64;break}c[g>>2]=4;t=4}c:do{if((w|0)==26){w=0;t=o+4|0;if((t|0)==(k|0)){w=27;break b}u=ic[c[(c[s>>2]|0)+52>>2]&31](s,c[t>>2]|0,0)|0;if(u<<24>>24==48|u<<24>>24==69){x=o+8|0;if((x|0)==(k|0)){w=30;break b}H=x;I=ic[c[(c[s>>2]|0)+52>>2]&31](s,c[x>>2]|0,0)|0;J=u}else{H=t;I=u;J=0}u=c[(c[b>>2]|0)+36>>2]|0;c[q>>2]=A;c[r>>2]=C;c[n+0>>2]=c[q+0>>2];c[m+0>>2]=c[r+0>>2];nc[u&3](p,b,n,m,f,g,h,I,J);c[d>>2]=c[p>>2];K=H+4|0}else if((w|0)==36){while(1){w=0;u=D+4|0;if((u|0)==(k|0)){L=k;break}if(ic[c[(c[s>>2]|0)+12>>2]&31](s,8192,c[u>>2]|0)|0){D=u;w=36}else{L=u;break}}u=A;t=C;x=C;while(1){if((u|0)!=0){M=c[u+12>>2]|0;if((M|0)==(c[u+16>>2]|0)){N=oc[c[(c[u>>2]|0)+36>>2]&63](u)|0}else{N=c[M>>2]|0}if((N|0)==-1){c[d>>2]=0;O=1;P=0}else{O=0;P=u}}else{O=1;P=0}do{if((x|0)!=0){M=c[x+12>>2]|0;if((M|0)==(c[x+16>>2]|0)){Q=oc[c[(c[x>>2]|0)+36>>2]&63](x)|0}else{Q=c[M>>2]|0}if(!((Q|0)==-1)){if(O^(t|0)==0){R=t;S=t;break}else{K=L;break c}}else{c[e>>2]=0;T=0;w=51;break}}else{T=t;w=51}}while(0);if((w|0)==51){w=0;if(O){K=L;break c}else{R=T;S=0}}M=P+12|0;U=c[M>>2]|0;V=P+16|0;if((U|0)==(c[V>>2]|0)){W=oc[c[(c[P>>2]|0)+36>>2]&63](P)|0}else{W=c[U>>2]|0}if(!(ic[c[(c[s>>2]|0)+12>>2]&31](s,8192,W)|0)){K=L;break c}U=c[M>>2]|0;if((U|0)==(c[V>>2]|0)){oc[c[(c[P>>2]|0)+40>>2]&63](P)|0;u=P;t=R;x=S;continue}else{c[M>>2]=U+4;u=P;t=R;x=S;continue}}}else if((w|0)==64){w=0;x=c[E>>2]|0;if((x|0)==(c[F>>2]|0)){oc[c[(c[A>>2]|0)+40>>2]&63](A)|0}else{c[E>>2]=x+4}K=o+4|0}}while(0);if((K|0)==(k|0)){w=69;break a}o=K;v=c[g>>2]|0}if((w|0)==24){c[g>>2]=4;X=A;break}else if((w|0)==27){c[g>>2]=4;X=A;break}else if((w|0)==30){c[g>>2]=4;X=A;break}}else{w=69}}while(0);if((w|0)==69){X=c[d>>2]|0}if((X|0)!=0){A=c[X+12>>2]|0;if((A|0)==(c[X+16>>2]|0)){Y=oc[c[(c[X>>2]|0)+36>>2]&63](X)|0}else{Y=c[A>>2]|0}if((Y|0)==-1){c[d>>2]=0;Z=0;_=1}else{Z=X;_=0}}else{Z=0;_=1}X=c[e>>2]|0;do{if((X|0)!=0){d=c[X+12>>2]|0;if((d|0)==(c[X+16>>2]|0)){$=oc[c[(c[X>>2]|0)+36>>2]&63](X)|0}else{$=c[d>>2]|0}if(($|0)==-1){c[e>>2]=0;w=82;break}if(_){c[a>>2]=Z;i=l;return}}else{w=82}}while(0);if((w|0)==82?!_:0){c[a>>2]=Z;i=l;return}c[g>>2]=c[g>>2]|2;c[a>>2]=Z;i=l;return}function Mj(a){a=a|0;var b=0;b=i;Jo(a);i=b;return}function Nj(a){a=a|0;return}function Oj(a){a=a|0;return 2}function Pj(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0;j=i;i=i+16|0;k=j+12|0;l=j+8|0;m=j+4|0;n=j;c[m>>2]=c[d>>2];c[n>>2]=c[e>>2];c[l+0>>2]=c[m+0>>2];c[k+0>>2]=c[n+0>>2];Lj(a,b,l,k,f,g,h,33160,33192|0);i=j;return}function Qj(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;k=i;i=i+16|0;l=k+12|0;m=k+8|0;n=k+4|0;o=k;p=d+8|0;q=oc[c[(c[p>>2]|0)+20>>2]&63](p)|0;c[n>>2]=c[e>>2];c[o>>2]=c[f>>2];f=a[q]|0;if((f&1)==0){r=q+4|0;s=(f&255)>>>1;t=q+4|0}else{f=c[q+8>>2]|0;r=f;s=c[q+4>>2]|0;t=f}f=r+(s<<2)|0;c[m+0>>2]=c[n+0>>2];c[l+0>>2]=c[o+0>>2];Lj(b,d,m,l,g,h,j,t,f);i=k;return}function Rj(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;j=i;i=i+32|0;k=j;l=j+16|0;m=j+12|0;Jg(m,f);f=c[m>>2]|0;if(!((c[8524]|0)==-1)){c[k>>2]=34096;c[k+4>>2]=118;c[k+8>>2]=0;kg(34096,k,119)}n=(c[34100>>2]|0)+ -1|0;o=c[f+8>>2]|0;if(!((c[f+12>>2]|0)-o>>2>>>0>n>>>0)){p=vb(4)|0;ho(p);cc(p|0,42064,107)}f=c[o+(n<<2)>>2]|0;if((f|0)==0){p=vb(4)|0;ho(p);cc(p|0,42064,107)}Sf(c[m>>2]|0)|0;m=c[e>>2]|0;e=b+8|0;b=oc[c[c[e>>2]>>2]&63](e)|0;c[l>>2]=m;m=b+168|0;c[k+0>>2]=c[l+0>>2];l=(xi(d,k,b,m,f,g,0)|0)-b|0;if((l|0)>=168){q=c[d>>2]|0;c[a>>2]=q;i=j;return}c[h+24>>2]=((l|0)/12|0|0)%7|0;q=c[d>>2]|0;c[a>>2]=q;i=j;return}function Sj(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;j=i;i=i+32|0;k=j;l=j+16|0;m=j+12|0;Jg(m,f);f=c[m>>2]|0;if(!((c[8524]|0)==-1)){c[k>>2]=34096;c[k+4>>2]=118;c[k+8>>2]=0;kg(34096,k,119)}n=(c[34100>>2]|0)+ -1|0;o=c[f+8>>2]|0;if(!((c[f+12>>2]|0)-o>>2>>>0>n>>>0)){p=vb(4)|0;ho(p);cc(p|0,42064,107)}f=c[o+(n<<2)>>2]|0;if((f|0)==0){p=vb(4)|0;ho(p);cc(p|0,42064,107)}Sf(c[m>>2]|0)|0;m=c[e>>2]|0;e=b+8|0;b=oc[c[(c[e>>2]|0)+4>>2]&63](e)|0;c[l>>2]=m;m=b+288|0;c[k+0>>2]=c[l+0>>2];l=(xi(d,k,b,m,f,g,0)|0)-b|0;if((l|0)>=288){q=c[d>>2]|0;c[a>>2]=q;i=j;return}c[h+16>>2]=((l|0)/12|0|0)%12|0;q=c[d>>2]|0;c[a>>2]=q;i=j;return}function Tj(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;b=i;i=i+32|0;j=b;k=b+16|0;l=b+12|0;Jg(l,f);f=c[l>>2]|0;if(!((c[8524]|0)==-1)){c[j>>2]=34096;c[j+4>>2]=118;c[j+8>>2]=0;kg(34096,j,119)}m=(c[34100>>2]|0)+ -1|0;n=c[f+8>>2]|0;if(!((c[f+12>>2]|0)-n>>2>>>0>m>>>0)){o=vb(4)|0;ho(o);cc(o|0,42064,107)}f=c[n+(m<<2)>>2]|0;if((f|0)==0){o=vb(4)|0;ho(o);cc(o|0,42064,107)}Sf(c[l>>2]|0)|0;l=h+20|0;c[k>>2]=c[e>>2];c[j+0>>2]=c[k+0>>2];k=Xj(d,j,g,f,4)|0;if((c[g>>2]&4|0)!=0){p=c[d>>2]|0;c[a>>2]=p;i=b;return}if((k|0)<69){q=k+2e3|0}else{q=(k+ -69|0)>>>0<31?k+1900|0:k}c[l>>2]=q+ -1900;p=c[d>>2]|0;c[a>>2]=p;i=b;return}



function bo(a){a=a|0;var b=0,d=0;b=i;d=a;while(1){if((c[d>>2]|0)==0){break}else{d=d+4|0}}i=b;return d-a>>2|0}function co(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=i;if((d|0)==0){i=e;return a|0}else{f=d;g=b;h=a}while(1){f=f+ -1|0;c[h>>2]=c[g>>2];if((f|0)==0){break}else{g=g+4|0;h=h+4|0}}i=e;return a|0}function eo(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;f=(d|0)==0;if(a-b>>2>>>0<d>>>0){if(!f){g=d;do{g=g+ -1|0;c[a+(g<<2)>>2]=c[b+(g<<2)>>2]}while((g|0)!=0)}}else{if(!f){f=b;b=a;g=d;while(1){g=g+ -1|0;c[b>>2]=c[f>>2];if((g|0)==0){break}else{f=f+4|0;b=b+4|0}}}}i=e;return a|0}function fo(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;e=i;if((d|0)!=0){f=d;d=a;while(1){f=f+ -1|0;c[d>>2]=b;if((f|0)==0){break}else{d=d+4|0}}}i=e;return a|0}function go(a){a=a|0;return}function ho(a){a=a|0;c[a>>2]=41992;return}function io(a){a=a|0;var b=0;b=i;Va(a|0);Jo(a);i=b;return}function jo(a){a=a|0;var b=0;b=i;Va(a|0);i=b;return}function ko(a){a=a|0;return 42008}function lo(a){a=a|0;return}function mo(a){a=a|0;return}function no(a){a=a|0;return}function oo(a){a=a|0;var b=0;b=i;Jo(a);i=b;return}function po(a){a=a|0;var b=0;b=i;Jo(a);i=b;return}function qo(a){a=a|0;var b=0;b=i;Jo(a);i=b;return}function ro(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0;e=i;i=i+64|0;f=e;if((a|0)==(b|0)){g=1;i=e;return g|0}if((b|0)==0){g=0;i=e;return g|0}h=vo(b,42120,42176,0)|0;if((h|0)==0){g=0;i=e;return g|0}b=f+0|0;j=b+56|0;do{c[b>>2]=0;b=b+4|0}while((b|0)<(j|0));c[f>>2]=h;c[f+8>>2]=a;c[f+12>>2]=-1;c[f+48>>2]=1;zc[c[(c[h>>2]|0)+28>>2]&7](h,f,c[d>>2]|0,1);if((c[f+24>>2]|0)!=1){g=0;i=e;return g|0}c[d>>2]=c[f+16>>2];g=1;i=e;return g|0}function so(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0;g=i;if((c[d+8>>2]|0)!=(b|0)){i=g;return}b=d+16|0;h=c[b>>2]|0;if((h|0)==0){c[b>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;i=g;return}if((h|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;i=g;return}e=d+24|0;if((c[e>>2]|0)!=2){i=g;return}c[e>>2]=f;i=g;return}function to(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0;g=i;if((b|0)!=(c[d+8>>2]|0)){h=c[b+8>>2]|0;zc[c[(c[h>>2]|0)+28>>2]&7](h,d,e,f);i=g;return}h=d+16|0;b=c[h>>2]|0;if((b|0)==0){c[h>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;i=g;return}if((b|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;i=g;return}e=d+24|0;if((c[e>>2]|0)!=2){i=g;return}c[e>>2]=f;i=g;return}function uo(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;g=i;if((b|0)==(c[d+8>>2]|0)){h=d+16|0;j=c[h>>2]|0;if((j|0)==0){c[h>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;i=g;return}if((j|0)!=(e|0)){j=d+36|0;c[j>>2]=(c[j>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;i=g;return}j=d+24|0;if((c[j>>2]|0)!=2){i=g;return}c[j>>2]=f;i=g;return}j=c[b+12>>2]|0;h=b+(j<<3)+16|0;k=c[b+20>>2]|0;l=k>>8;if((k&1|0)==0){m=l}else{m=c[(c[e>>2]|0)+l>>2]|0}l=c[b+16>>2]|0;zc[c[(c[l>>2]|0)+28>>2]&7](l,d,e+m|0,(k&2|0)!=0?f:2);if((j|0)<=1){i=g;return}j=d+54|0;k=b+24|0;while(1){b=c[k+4>>2]|0;m=b>>8;if((b&1|0)==0){n=m}else{n=c[(c[e>>2]|0)+m>>2]|0}m=c[k>>2]|0;zc[c[(c[m>>2]|0)+28>>2]&7](m,d,e+n|0,(b&2|0)!=0?f:2);if((a[j]|0)!=0){o=16;break}b=k+8|0;if(b>>>0<h>>>0){k=b}else{o=16;break}}if((o|0)==16){i=g;return}}function vo(d,e,f,g){d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;h=i;i=i+64|0;j=h;k=c[d>>2]|0;l=d+(c[k+ -8>>2]|0)|0;m=c[k+ -4>>2]|0;c[j>>2]=f;c[j+4>>2]=d;c[j+8>>2]=e;c[j+12>>2]=g;g=j+16|0;e=j+20|0;d=j+24|0;k=j+28|0;n=j+32|0;o=j+40|0;p=(m|0)==(f|0);f=g+0|0;q=f+36|0;do{c[f>>2]=0;f=f+4|0}while((f|0)<(q|0));b[g+36>>1]=0;a[g+38|0]=0;if(p){c[j+48>>2]=1;wc[c[(c[m>>2]|0)+20>>2]&15](m,j,l,l,1,0);r=(c[d>>2]|0)==1?l:0;i=h;return r|0}kc[c[(c[m>>2]|0)+24>>2]&3](m,j,l,1,0);l=c[j+36>>2]|0;if((l|0)==0){if((c[o>>2]|0)!=1){r=0;i=h;return r|0}if((c[k>>2]|0)!=1){r=0;i=h;return r|0}r=(c[n>>2]|0)==1?c[e>>2]|0:0;i=h;return r|0}else if((l|0)==1){if((c[d>>2]|0)!=1){if((c[o>>2]|0)!=0){r=0;i=h;return r|0}if((c[k>>2]|0)!=1){r=0;i=h;return r|0}if((c[n>>2]|0)!=1){r=0;i=h;return r|0}}r=c[g>>2]|0;i=h;return r|0}else{r=0;i=h;return r|0}return 0}function wo(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;h=i;if((b|0)==(c[d+8>>2]|0)){if((c[d+4>>2]|0)!=(e|0)){i=h;return}j=d+28|0;if((c[j>>2]|0)==1){i=h;return}c[j>>2]=f;i=h;return}if((b|0)==(c[d>>2]|0)){if((c[d+16>>2]|0)!=(e|0)?(j=d+20|0,(c[j>>2]|0)!=(e|0)):0){c[d+32>>2]=f;k=d+44|0;if((c[k>>2]|0)==4){i=h;return}l=c[b+12>>2]|0;m=b+(l<<3)+16|0;a:do{if((l|0)>0){n=d+52|0;o=d+53|0;p=d+54|0;q=b+8|0;r=d+24|0;s=0;t=0;u=b+16|0;b:while(1){a[n]=0;a[o]=0;v=c[u+4>>2]|0;w=v>>8;if((v&1|0)==0){x=w}else{x=c[(c[e>>2]|0)+w>>2]|0}w=c[u>>2]|0;wc[c[(c[w>>2]|0)+20>>2]&15](w,d,e,e+x|0,2-(v>>>1&1)|0,g);if((a[p]|0)!=0){y=s;z=t;break}do{if((a[o]|0)!=0){if((a[n]|0)==0){if((c[q>>2]&1|0)==0){y=s;z=1;break b}else{A=s;B=1;break}}if((c[r>>2]|0)==1){C=27;break a}if((c[q>>2]&2|0)==0){C=27;break a}else{A=1;B=1}}else{A=s;B=t}}while(0);v=u+8|0;if(v>>>0<m>>>0){s=A;t=B;u=v}else{y=A;z=B;break}}if(y){D=z;C=26}else{E=z;C=23}}else{E=0;C=23}}while(0);if((C|0)==23){c[j>>2]=e;j=d+40|0;c[j>>2]=(c[j>>2]|0)+1;if((c[d+36>>2]|0)==1?(c[d+24>>2]|0)==2:0){a[d+54|0]=1;if(E){C=27}else{C=28}}else{D=E;C=26}}if((C|0)==26){if(D){C=27}else{C=28}}if((C|0)==27){c[k>>2]=3;i=h;return}else if((C|0)==28){c[k>>2]=4;i=h;return}}if((f|0)!=1){i=h;return}c[d+32>>2]=1;i=h;return}k=c[b+12>>2]|0;D=b+(k<<3)+16|0;E=c[b+20>>2]|0;j=E>>8;if((E&1|0)==0){F=j}else{F=c[(c[e>>2]|0)+j>>2]|0}j=c[b+16>>2]|0;kc[c[(c[j>>2]|0)+24>>2]&3](j,d,e+F|0,(E&2|0)!=0?f:2,g);E=b+24|0;if((k|0)<=1){i=h;return}k=c[b+8>>2]|0;if((k&2|0)==0?(b=d+36|0,(c[b>>2]|0)!=1):0){if((k&1|0)==0){k=d+54|0;F=E;while(1){if((a[k]|0)!=0){C=53;break}if((c[b>>2]|0)==1){C=53;break}j=c[F+4>>2]|0;z=j>>8;if((j&1|0)==0){G=z}else{G=c[(c[e>>2]|0)+z>>2]|0}z=c[F>>2]|0;kc[c[(c[z>>2]|0)+24>>2]&3](z,d,e+G|0,(j&2|0)!=0?f:2,g);j=F+8|0;if(j>>>0<D>>>0){F=j}else{C=53;break}}if((C|0)==53){i=h;return}}F=d+24|0;G=d+54|0;k=E;while(1){if((a[G]|0)!=0){C=53;break}if((c[b>>2]|0)==1?(c[F>>2]|0)==1:0){C=53;break}j=c[k+4>>2]|0;z=j>>8;if((j&1|0)==0){H=z}else{H=c[(c[e>>2]|0)+z>>2]|0}z=c[k>>2]|0;kc[c[(c[z>>2]|0)+24>>2]&3](z,d,e+H|0,(j&2|0)!=0?f:2,g);j=k+8|0;if(j>>>0<D>>>0){k=j}else{C=53;break}}if((C|0)==53){i=h;return}}k=d+54|0;H=E;while(1){if((a[k]|0)!=0){C=53;break}E=c[H+4>>2]|0;F=E>>8;if((E&1|0)==0){I=F}else{I=c[(c[e>>2]|0)+F>>2]|0}F=c[H>>2]|0;kc[c[(c[F>>2]|0)+24>>2]&3](F,d,e+I|0,(E&2|0)!=0?f:2,g);E=H+8|0;if(E>>>0<D>>>0){H=E}else{C=53;break}}if((C|0)==53){i=h;return}}function xo(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;h=i;if((b|0)==(c[d+8>>2]|0)){if((c[d+4>>2]|0)!=(e|0)){i=h;return}j=d+28|0;if((c[j>>2]|0)==1){i=h;return}c[j>>2]=f;i=h;return}if((b|0)!=(c[d>>2]|0)){j=c[b+8>>2]|0;kc[c[(c[j>>2]|0)+24>>2]&3](j,d,e,f,g);i=h;return}if((c[d+16>>2]|0)!=(e|0)?(j=d+20|0,(c[j>>2]|0)!=(e|0)):0){c[d+32>>2]=f;k=d+44|0;if((c[k>>2]|0)==4){i=h;return}l=d+52|0;a[l]=0;m=d+53|0;a[m]=0;n=c[b+8>>2]|0;wc[c[(c[n>>2]|0)+20>>2]&15](n,d,e,e,1,g);if((a[m]|0)!=0){if((a[l]|0)==0){o=1;p=13}}else{o=0;p=13}do{if((p|0)==13){c[j>>2]=e;l=d+40|0;c[l>>2]=(c[l>>2]|0)+1;if((c[d+36>>2]|0)==1?(c[d+24>>2]|0)==2:0){a[d+54|0]=1;if(o){break}}else{p=16}if((p|0)==16?o:0){break}c[k>>2]=4;i=h;return}}while(0);c[k>>2]=3;i=h;return}if((f|0)!=1){i=h;return}c[d+32>>2]=1;i=h;return}function yo(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0;g=i;if((c[d+8>>2]|0)==(b|0)){if((c[d+4>>2]|0)!=(e|0)){i=g;return}h=d+28|0;if((c[h>>2]|0)==1){i=g;return}c[h>>2]=f;i=g;return}if((c[d>>2]|0)!=(b|0)){i=g;return}if((c[d+16>>2]|0)!=(e|0)?(b=d+20|0,(c[b>>2]|0)!=(e|0)):0){c[d+32>>2]=f;c[b>>2]=e;e=d+40|0;c[e>>2]=(c[e>>2]|0)+1;if((c[d+36>>2]|0)==1?(c[d+24>>2]|0)==2:0){a[d+54|0]=1}c[d+44>>2]=4;i=g;return}if((f|0)!=1){i=g;return}c[d+32>>2]=1;i=g;return}function zo(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;j=i;if((b|0)!=(c[d+8>>2]|0)){k=d+52|0;l=a[k]|0;m=d+53|0;n=a[m]|0;o=c[b+12>>2]|0;p=b+(o<<3)+16|0;a[k]=0;a[m]=0;q=c[b+20>>2]|0;r=q>>8;if((q&1|0)==0){s=r}else{s=c[(c[f>>2]|0)+r>>2]|0}r=c[b+16>>2]|0;wc[c[(c[r>>2]|0)+20>>2]&15](r,d,e,f+s|0,(q&2|0)!=0?g:2,h);a:do{if((o|0)>1){q=d+24|0;s=b+8|0;r=d+54|0;t=b+24|0;do{if((a[r]|0)!=0){break a}if((a[k]|0)==0){if((a[m]|0)!=0?(c[s>>2]&1|0)==0:0){break a}}else{if((c[q>>2]|0)==1){break a}if((c[s>>2]&2|0)==0){break a}}a[k]=0;a[m]=0;u=c[t+4>>2]|0;v=u>>8;if((u&1|0)==0){w=v}else{w=c[(c[f>>2]|0)+v>>2]|0}v=c[t>>2]|0;wc[c[(c[v>>2]|0)+20>>2]&15](v,d,e,f+w|0,(u&2|0)!=0?g:2,h);t=t+8|0}while(t>>>0<p>>>0)}}while(0);a[k]=l;a[m]=n;i=j;return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){i=j;return}a[d+52|0]=1;f=d+16|0;n=c[f>>2]|0;if((n|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){i=j;return}a[d+54|0]=1;i=j;return}if((n|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;a[d+54|0]=1;i=j;return}e=d+24|0;n=c[e>>2]|0;if((n|0)==2){c[e>>2]=g;x=g}else{x=n}if(!((c[d+48>>2]|0)==1&(x|0)==1)){i=j;return}a[d+54|0]=1;i=j;return}function Ao(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;j=i;if((b|0)!=(c[d+8>>2]|0)){k=c[b+8>>2]|0;wc[c[(c[k>>2]|0)+20>>2]&15](k,d,e,f,g,h);i=j;return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){i=j;return}a[d+52|0]=1;f=d+16|0;h=c[f>>2]|0;if((h|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){i=j;return}a[d+54|0]=1;i=j;return}if((h|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;a[d+54|0]=1;i=j;return}e=d+24|0;h=c[e>>2]|0;if((h|0)==2){c[e>>2]=g;l=g}else{l=h}if(!((c[d+48>>2]|0)==1&(l|0)==1)){i=j;return}a[d+54|0]=1;i=j;return}function Bo(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0;h=i;if((c[d+8>>2]|0)!=(b|0)){i=h;return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){i=h;return}a[d+52|0]=1;f=d+16|0;b=c[f>>2]|0;if((b|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){i=h;return}a[d+54|0]=1;i=h;return}if((b|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;a[d+54|0]=1;i=h;return}e=d+24|0;b=c[e>>2]|0;if((b|0)==2){c[e>>2]=g;j=g}else{j=b}if(!((c[d+48>>2]|0)==1&(j|0)==1)){i=h;return}a[d+54|0]=1;i=h;return}function Co(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0,Ja=0,Ka=0;b=i;do{if(a>>>0<245){if(a>>>0<11){d=16}else{d=a+11&-8}e=d>>>3;f=c[10606]|0;g=f>>>e;if((g&3|0)!=0){h=(g&1^1)+e|0;j=h<<1;k=42464+(j<<2)|0;l=42464+(j+2<<2)|0;j=c[l>>2]|0;m=j+8|0;n=c[m>>2]|0;do{if((k|0)!=(n|0)){if(n>>>0<(c[42440>>2]|0)>>>0){Kb()}o=n+12|0;if((c[o>>2]|0)==(j|0)){c[o>>2]=k;c[l>>2]=n;break}else{Kb()}}else{c[10606]=f&~(1<<h)}}while(0);n=h<<3;c[j+4>>2]=n|3;l=j+(n|4)|0;c[l>>2]=c[l>>2]|1;p=m;i=b;return p|0}if(d>>>0>(c[42432>>2]|0)>>>0){if((g|0)!=0){l=2<<e;n=g<<e&(l|0-l);l=(n&0-n)+ -1|0;n=l>>>12&16;k=l>>>n;l=k>>>5&8;o=k>>>l;k=o>>>2&4;q=o>>>k;o=q>>>1&2;r=q>>>o;q=r>>>1&1;s=(l|n|k|o|q)+(r>>>q)|0;q=s<<1;r=42464+(q<<2)|0;o=42464+(q+2<<2)|0;q=c[o>>2]|0;k=q+8|0;n=c[k>>2]|0;do{if((r|0)!=(n|0)){if(n>>>0<(c[42440>>2]|0)>>>0){Kb()}l=n+12|0;if((c[l>>2]|0)==(q|0)){c[l>>2]=r;c[o>>2]=n;break}else{Kb()}}else{c[10606]=f&~(1<<s)}}while(0);f=s<<3;n=f-d|0;c[q+4>>2]=d|3;o=q+d|0;c[q+(d|4)>>2]=n|1;c[q+f>>2]=n;f=c[42432>>2]|0;if((f|0)!=0){r=c[42444>>2]|0;e=f>>>3;f=e<<1;g=42464+(f<<2)|0;m=c[10606]|0;j=1<<e;if((m&j|0)!=0){e=42464+(f+2<<2)|0;h=c[e>>2]|0;if(h>>>0<(c[42440>>2]|0)>>>0){Kb()}else{t=e;u=h}}else{c[10606]=m|j;t=42464+(f+2<<2)|0;u=g}c[t>>2]=r;c[u+12>>2]=r;c[r+8>>2]=u;c[r+12>>2]=g}c[42432>>2]=n;c[42444>>2]=o;p=k;i=b;return p|0}o=c[42428>>2]|0;if((o|0)!=0){n=(o&0-o)+ -1|0;o=n>>>12&16;g=n>>>o;n=g>>>5&8;r=g>>>n;g=r>>>2&4;f=r>>>g;r=f>>>1&2;j=f>>>r;f=j>>>1&1;m=c[42728+((n|o|g|r|f)+(j>>>f)<<2)>>2]|0;f=(c[m+4>>2]&-8)-d|0;j=m;r=m;while(1){m=c[j+16>>2]|0;if((m|0)==0){g=c[j+20>>2]|0;if((g|0)==0){break}else{v=g}}else{v=m}m=(c[v+4>>2]&-8)-d|0;g=m>>>0<f>>>0;f=g?m:f;j=v;r=g?v:r}j=c[42440>>2]|0;if(r>>>0<j>>>0){Kb()}k=r+d|0;if(!(r>>>0<k>>>0)){Kb()}q=c[r+24>>2]|0;s=c[r+12>>2]|0;do{if((s|0)==(r|0)){g=r+20|0;m=c[g>>2]|0;if((m|0)==0){o=r+16|0;n=c[o>>2]|0;if((n|0)==0){w=0;break}else{x=n;y=o}}else{x=m;y=g}while(1){g=x+20|0;m=c[g>>2]|0;if((m|0)!=0){x=m;y=g;continue}g=x+16|0;m=c[g>>2]|0;if((m|0)==0){break}else{x=m;y=g}}if(y>>>0<j>>>0){Kb()}else{c[y>>2]=0;w=x;break}}else{g=c[r+8>>2]|0;if(g>>>0<j>>>0){Kb()}m=g+12|0;if((c[m>>2]|0)!=(r|0)){Kb()}o=s+8|0;if((c[o>>2]|0)==(r|0)){c[m>>2]=s;c[o>>2]=g;w=s;break}else{Kb()}}}while(0);do{if((q|0)!=0){s=c[r+28>>2]|0;j=42728+(s<<2)|0;if((r|0)==(c[j>>2]|0)){c[j>>2]=w;if((w|0)==0){c[42428>>2]=c[42428>>2]&~(1<<s);break}}else{if(q>>>0<(c[42440>>2]|0)>>>0){Kb()}s=q+16|0;if((c[s>>2]|0)==(r|0)){c[s>>2]=w}else{c[q+20>>2]=w}if((w|0)==0){break}}if(w>>>0<(c[42440>>2]|0)>>>0){Kb()}c[w+24>>2]=q;s=c[r+16>>2]|0;do{if((s|0)!=0){if(s>>>0<(c[42440>>2]|0)>>>0){Kb()}else{c[w+16>>2]=s;c[s+24>>2]=w;break}}}while(0);s=c[r+20>>2]|0;if((s|0)!=0){if(s>>>0<(c[42440>>2]|0)>>>0){Kb()}else{c[w+20>>2]=s;c[s+24>>2]=w;break}}}}while(0);if(f>>>0<16){q=f+d|0;c[r+4>>2]=q|3;s=r+(q+4)|0;c[s>>2]=c[s>>2]|1}else{c[r+4>>2]=d|3;c[r+(d|4)>>2]=f|1;c[r+(f+d)>>2]=f;s=c[42432>>2]|0;if((s|0)!=0){q=c[42444>>2]|0;j=s>>>3;s=j<<1;g=42464+(s<<2)|0;o=c[10606]|0;m=1<<j;if((o&m|0)!=0){j=42464+(s+2<<2)|0;n=c[j>>2]|0;if(n>>>0<(c[42440>>2]|0)>>>0){Kb()}else{z=j;A=n}}else{c[10606]=o|m;z=42464+(s+2<<2)|0;A=g}c[z>>2]=q;c[A+12>>2]=q;c[q+8>>2]=A;c[q+12>>2]=g}c[42432>>2]=f;c[42444>>2]=k}p=r+8|0;i=b;return p|0}else{B=d}}else{B=d}}else{if(!(a>>>0>4294967231)){g=a+11|0;q=g&-8;s=c[42428>>2]|0;if((s|0)!=0){m=0-q|0;o=g>>>8;if((o|0)!=0){if(q>>>0>16777215){C=31}else{g=(o+1048320|0)>>>16&8;n=o<<g;o=(n+520192|0)>>>16&4;j=n<<o;n=(j+245760|0)>>>16&2;h=14-(o|g|n)+(j<<n>>>15)|0;C=q>>>(h+7|0)&1|h<<1}}else{C=0}h=c[42728+(C<<2)>>2]|0;a:do{if((h|0)==0){D=m;E=0;F=0}else{if((C|0)==31){G=0}else{G=25-(C>>>1)|0}n=m;j=0;g=q<<G;o=h;e=0;while(1){l=c[o+4>>2]&-8;H=l-q|0;if(H>>>0<n>>>0){if((l|0)==(q|0)){D=H;E=o;F=o;break a}else{I=H;J=o}}else{I=n;J=e}H=c[o+20>>2]|0;l=c[o+(g>>>31<<2)+16>>2]|0;K=(H|0)==0|(H|0)==(l|0)?j:H;if((l|0)==0){D=I;E=K;F=J;break}else{n=I;j=K;g=g<<1;o=l;e=J}}}}while(0);if((E|0)==0&(F|0)==0){h=2<<C;m=s&(h|0-h);if((m|0)==0){B=q;break}h=(m&0-m)+ -1|0;m=h>>>12&16;r=h>>>m;h=r>>>5&8;k=r>>>h;r=k>>>2&4;f=k>>>r;k=f>>>1&2;e=f>>>k;f=e>>>1&1;L=c[42728+((h|m|r|k|f)+(e>>>f)<<2)>>2]|0}else{L=E}if((L|0)==0){M=D;N=F}else{f=D;e=L;k=F;while(1){r=(c[e+4>>2]&-8)-q|0;m=r>>>0<f>>>0;h=m?r:f;r=m?e:k;m=c[e+16>>2]|0;if((m|0)!=0){f=h;e=m;k=r;continue}m=c[e+20>>2]|0;if((m|0)==0){M=h;N=r;break}else{f=h;e=m;k=r}}}if((N|0)!=0?M>>>0<((c[42432>>2]|0)-q|0)>>>0:0){k=c[42440>>2]|0;if(N>>>0<k>>>0){Kb()}e=N+q|0;if(!(N>>>0<e>>>0)){Kb()}f=c[N+24>>2]|0;s=c[N+12>>2]|0;do{if((s|0)==(N|0)){r=N+20|0;m=c[r>>2]|0;if((m|0)==0){h=N+16|0;o=c[h>>2]|0;if((o|0)==0){O=0;break}else{P=o;Q=h}}else{P=m;Q=r}while(1){r=P+20|0;m=c[r>>2]|0;if((m|0)!=0){P=m;Q=r;continue}r=P+16|0;m=c[r>>2]|0;if((m|0)==0){break}else{P=m;Q=r}}if(Q>>>0<k>>>0){Kb()}else{c[Q>>2]=0;O=P;break}}else{r=c[N+8>>2]|0;if(r>>>0<k>>>0){Kb()}m=r+12|0;if((c[m>>2]|0)!=(N|0)){Kb()}h=s+8|0;if((c[h>>2]|0)==(N|0)){c[m>>2]=s;c[h>>2]=r;O=s;break}else{Kb()}}}while(0);do{if((f|0)!=0){s=c[N+28>>2]|0;k=42728+(s<<2)|0;if((N|0)==(c[k>>2]|0)){c[k>>2]=O;if((O|0)==0){c[42428>>2]=c[42428>>2]&~(1<<s);break}}else{if(f>>>0<(c[42440>>2]|0)>>>0){Kb()}s=f+16|0;if((c[s>>2]|0)==(N|0)){c[s>>2]=O}else{c[f+20>>2]=O}if((O|0)==0){break}}if(O>>>0<(c[42440>>2]|0)>>>0){Kb()}c[O+24>>2]=f;s=c[N+16>>2]|0;do{if((s|0)!=0){if(s>>>0<(c[42440>>2]|0)>>>0){Kb()}else{c[O+16>>2]=s;c[s+24>>2]=O;break}}}while(0);s=c[N+20>>2]|0;if((s|0)!=0){if(s>>>0<(c[42440>>2]|0)>>>0){Kb()}else{c[O+20>>2]=s;c[s+24>>2]=O;break}}}}while(0);b:do{if(!(M>>>0<16)){c[N+4>>2]=q|3;c[N+(q|4)>>2]=M|1;c[N+(M+q)>>2]=M;f=M>>>3;if(M>>>0<256){s=f<<1;k=42464+(s<<2)|0;r=c[10606]|0;h=1<<f;if((r&h|0)!=0){f=42464+(s+2<<2)|0;m=c[f>>2]|0;if(m>>>0<(c[42440>>2]|0)>>>0){Kb()}else{R=f;S=m}}else{c[10606]=r|h;R=42464+(s+2<<2)|0;S=k}c[R>>2]=e;c[S+12>>2]=e;c[N+(q+8)>>2]=S;c[N+(q+12)>>2]=k;break}k=M>>>8;if((k|0)!=0){if(M>>>0>16777215){T=31}else{s=(k+1048320|0)>>>16&8;h=k<<s;k=(h+520192|0)>>>16&4;r=h<<k;h=(r+245760|0)>>>16&2;m=14-(k|s|h)+(r<<h>>>15)|0;T=M>>>(m+7|0)&1|m<<1}}else{T=0}m=42728+(T<<2)|0;c[N+(q+28)>>2]=T;c[N+(q+20)>>2]=0;c[N+(q+16)>>2]=0;h=c[42428>>2]|0;r=1<<T;if((h&r|0)==0){c[42428>>2]=h|r;c[m>>2]=e;c[N+(q+24)>>2]=m;c[N+(q+12)>>2]=e;c[N+(q+8)>>2]=e;break}r=c[m>>2]|0;if((T|0)==31){U=0}else{U=25-(T>>>1)|0}c:do{if((c[r+4>>2]&-8|0)!=(M|0)){m=M<<U;h=r;while(1){V=h+(m>>>31<<2)+16|0;s=c[V>>2]|0;if((s|0)==0){break}if((c[s+4>>2]&-8|0)==(M|0)){W=s;break c}else{m=m<<1;h=s}}if(V>>>0<(c[42440>>2]|0)>>>0){Kb()}else{c[V>>2]=e;c[N+(q+24)>>2]=h;c[N+(q+12)>>2]=e;c[N+(q+8)>>2]=e;break b}}else{W=r}}while(0);r=W+8|0;m=c[r>>2]|0;s=c[42440>>2]|0;if(W>>>0<s>>>0){Kb()}if(m>>>0<s>>>0){Kb()}else{c[m+12>>2]=e;c[r>>2]=e;c[N+(q+8)>>2]=m;c[N+(q+12)>>2]=W;c[N+(q+24)>>2]=0;break}}else{m=M+q|0;c[N+4>>2]=m|3;r=N+(m+4)|0;c[r>>2]=c[r>>2]|1}}while(0);p=N+8|0;i=b;return p|0}else{B=q}}else{B=q}}else{B=-1}}}while(0);N=c[42432>>2]|0;if(!(B>>>0>N>>>0)){M=N-B|0;W=c[42444>>2]|0;if(M>>>0>15){c[42444>>2]=W+B;c[42432>>2]=M;c[W+(B+4)>>2]=M|1;c[W+N>>2]=M;c[W+4>>2]=B|3}else{c[42432>>2]=0;c[42444>>2]=0;c[W+4>>2]=N|3;M=W+(N+4)|0;c[M>>2]=c[M>>2]|1}p=W+8|0;i=b;return p|0}W=c[42436>>2]|0;if(B>>>0<W>>>0){M=W-B|0;c[42436>>2]=M;W=c[42448>>2]|0;c[42448>>2]=W+B;c[W+(B+4)>>2]=M|1;c[W+4>>2]=B|3;p=W+8|0;i=b;return p|0}do{if((c[10724]|0)==0){W=Pa(30)|0;if((W+ -1&W|0)==0){c[42904>>2]=W;c[42900>>2]=W;c[42908>>2]=-1;c[42912>>2]=-1;c[42916>>2]=0;c[42868>>2]=0;c[10724]=(pb(0)|0)&-16^1431655768;break}else{Kb()}}}while(0);W=B+48|0;M=c[42904>>2]|0;N=B+47|0;V=M+N|0;U=0-M|0;M=V&U;if(!(M>>>0>B>>>0)){p=0;i=b;return p|0}T=c[42864>>2]|0;if((T|0)!=0?(S=c[42856>>2]|0,R=S+M|0,R>>>0<=S>>>0|R>>>0>T>>>0):0){p=0;i=b;return p|0}d:do{if((c[42868>>2]&4|0)==0){T=c[42448>>2]|0;e:do{if((T|0)!=0){R=42872|0;while(1){S=c[R>>2]|0;if(!(S>>>0>T>>>0)?(X=R+4|0,(S+(c[X>>2]|0)|0)>>>0>T>>>0):0){break}S=c[R+8>>2]|0;if((S|0)==0){Y=182;break e}else{R=S}}if((R|0)!=0){S=V-(c[42436>>2]|0)&U;if(S>>>0<2147483647){O=Ma(S|0)|0;P=(O|0)==((c[R>>2]|0)+(c[X>>2]|0)|0);Z=O;_=S;$=P?O:-1;aa=P?S:0;Y=191}else{ba=0}}else{Y=182}}else{Y=182}}while(0);do{if((Y|0)==182){T=Ma(0)|0;if((T|0)!=(-1|0)){q=T;S=c[42900>>2]|0;P=S+ -1|0;if((P&q|0)==0){ca=M}else{ca=M-q+(P+q&0-S)|0}S=c[42856>>2]|0;q=S+ca|0;if(ca>>>0>B>>>0&ca>>>0<2147483647){P=c[42864>>2]|0;if((P|0)!=0?q>>>0<=S>>>0|q>>>0>P>>>0:0){ba=0;break}P=Ma(ca|0)|0;q=(P|0)==(T|0);Z=P;_=ca;$=q?T:-1;aa=q?ca:0;Y=191}else{ba=0}}else{ba=0}}}while(0);f:do{if((Y|0)==191){q=0-_|0;if(($|0)!=(-1|0)){da=$;ea=aa;Y=202;break d}do{if((Z|0)!=(-1|0)&_>>>0<2147483647&_>>>0<W>>>0?(T=c[42904>>2]|0,P=N-_+T&0-T,P>>>0<2147483647):0){if((Ma(P|0)|0)==(-1|0)){Ma(q|0)|0;ba=aa;break f}else{fa=P+_|0;break}}else{fa=_}}while(0);if((Z|0)==(-1|0)){ba=aa}else{da=Z;ea=fa;Y=202;break d}}}while(0);c[42868>>2]=c[42868>>2]|4;ga=ba;Y=199}else{ga=0;Y=199}}while(0);if((((Y|0)==199?M>>>0<2147483647:0)?(ba=Ma(M|0)|0,M=Ma(0)|0,(M|0)!=(-1|0)&(ba|0)!=(-1|0)&ba>>>0<M>>>0):0)?(fa=M-ba|0,M=fa>>>0>(B+40|0)>>>0,M):0){da=ba;ea=M?fa:ga;Y=202}if((Y|0)==202){ga=(c[42856>>2]|0)+ea|0;c[42856>>2]=ga;if(ga>>>0>(c[42860>>2]|0)>>>0){c[42860>>2]=ga}ga=c[42448>>2]|0;g:do{if((ga|0)!=0){fa=42872|0;while(1){ha=c[fa>>2]|0;ia=fa+4|0;ja=c[ia>>2]|0;if((da|0)==(ha+ja|0)){Y=214;break}M=c[fa+8>>2]|0;if((M|0)==0){break}else{fa=M}}if(((Y|0)==214?(c[fa+12>>2]&8|0)==0:0)?ga>>>0>=ha>>>0&ga>>>0<da>>>0:0){c[ia>>2]=ja+ea;M=(c[42436>>2]|0)+ea|0;ba=ga+8|0;if((ba&7|0)==0){ka=0}else{ka=0-ba&7}ba=M-ka|0;c[42448>>2]=ga+ka;c[42436>>2]=ba;c[ga+(ka+4)>>2]=ba|1;c[ga+(M+4)>>2]=40;c[42452>>2]=c[42912>>2];break}if(da>>>0<(c[42440>>2]|0)>>>0){c[42440>>2]=da}M=da+ea|0;ba=42872|0;while(1){if((c[ba>>2]|0)==(M|0)){Y=224;break}Z=c[ba+8>>2]|0;if((Z|0)==0){break}else{ba=Z}}if((Y|0)==224?(c[ba+12>>2]&8|0)==0:0){c[ba>>2]=da;M=ba+4|0;c[M>>2]=(c[M>>2]|0)+ea;M=da+8|0;if((M&7|0)==0){la=0}else{la=0-M&7}M=da+(ea+8)|0;if((M&7|0)==0){ma=0}else{ma=0-M&7}M=da+(ma+ea)|0;fa=la+B|0;Z=da+fa|0;aa=M-(da+la)-B|0;c[da+(la+4)>>2]=B|3;h:do{if((M|0)!=(c[42448>>2]|0)){if((M|0)==(c[42444>>2]|0)){_=(c[42432>>2]|0)+aa|0;c[42432>>2]=_;c[42444>>2]=Z;c[da+(fa+4)>>2]=_|1;c[da+(_+fa)>>2]=_;break}_=ea+4|0;N=c[da+(_+ma)>>2]|0;if((N&3|0)==1){W=N&-8;$=N>>>3;do{if(!(N>>>0<256)){ca=c[da+((ma|24)+ea)>>2]|0;X=c[da+(ea+12+ma)>>2]|0;do{if((X|0)==(M|0)){U=ma|16;V=da+(_+U)|0;q=c[V>>2]|0;if((q|0)==0){R=da+(U+ea)|0;U=c[R>>2]|0;if((U|0)==0){na=0;break}else{oa=U;pa=R}}else{oa=q;pa=V}while(1){V=oa+20|0;q=c[V>>2]|0;if((q|0)!=0){oa=q;pa=V;continue}V=oa+16|0;q=c[V>>2]|0;if((q|0)==0){break}else{oa=q;pa=V}}if(pa>>>0<(c[42440>>2]|0)>>>0){Kb()}else{c[pa>>2]=0;na=oa;break}}else{V=c[da+((ma|8)+ea)>>2]|0;if(V>>>0<(c[42440>>2]|0)>>>0){Kb()}q=V+12|0;if((c[q>>2]|0)!=(M|0)){Kb()}R=X+8|0;if((c[R>>2]|0)==(M|0)){c[q>>2]=X;c[R>>2]=V;na=X;break}else{Kb()}}}while(0);if((ca|0)!=0){X=c[da+(ea+28+ma)>>2]|0;h=42728+(X<<2)|0;if((M|0)==(c[h>>2]|0)){c[h>>2]=na;if((na|0)==0){c[42428>>2]=c[42428>>2]&~(1<<X);break}}else{if(ca>>>0<(c[42440>>2]|0)>>>0){Kb()}X=ca+16|0;if((c[X>>2]|0)==(M|0)){c[X>>2]=na}else{c[ca+20>>2]=na}if((na|0)==0){break}}if(na>>>0<(c[42440>>2]|0)>>>0){Kb()}c[na+24>>2]=ca;X=ma|16;h=c[da+(X+ea)>>2]|0;do{if((h|0)!=0){if(h>>>0<(c[42440>>2]|0)>>>0){Kb()}else{c[na+16>>2]=h;c[h+24>>2]=na;break}}}while(0);h=c[da+(_+X)>>2]|0;if((h|0)!=0){if(h>>>0<(c[42440>>2]|0)>>>0){Kb()}else{c[na+20>>2]=h;c[h+24>>2]=na;break}}}}else{h=c[da+((ma|8)+ea)>>2]|0;ca=c[da+(ea+12+ma)>>2]|0;V=42464+($<<1<<2)|0;if((h|0)!=(V|0)){if(h>>>0<(c[42440>>2]|0)>>>0){Kb()}if((c[h+12>>2]|0)!=(M|0)){Kb()}}if((ca|0)==(h|0)){c[10606]=c[10606]&~(1<<$);break}if((ca|0)!=(V|0)){if(ca>>>0<(c[42440>>2]|0)>>>0){Kb()}V=ca+8|0;if((c[V>>2]|0)==(M|0)){qa=V}else{Kb()}}else{qa=ca+8|0}c[h+12>>2]=ca;c[qa>>2]=h}}while(0);ra=da+((W|ma)+ea)|0;sa=W+aa|0}else{ra=M;sa=aa}$=ra+4|0;c[$>>2]=c[$>>2]&-2;c[da+(fa+4)>>2]=sa|1;c[da+(sa+fa)>>2]=sa;$=sa>>>3;if(sa>>>0<256){_=$<<1;N=42464+(_<<2)|0;h=c[10606]|0;ca=1<<$;if((h&ca|0)!=0){$=42464+(_+2<<2)|0;V=c[$>>2]|0;if(V>>>0<(c[42440>>2]|0)>>>0){Kb()}else{ta=$;ua=V}}else{c[10606]=h|ca;ta=42464+(_+2<<2)|0;ua=N}c[ta>>2]=Z;c[ua+12>>2]=Z;c[da+(fa+8)>>2]=ua;c[da+(fa+12)>>2]=N;break}N=sa>>>8;if((N|0)!=0){if(sa>>>0>16777215){va=31}else{_=(N+1048320|0)>>>16&8;ca=N<<_;N=(ca+520192|0)>>>16&4;h=ca<<N;ca=(h+245760|0)>>>16&2;V=14-(N|_|ca)+(h<<ca>>>15)|0;va=sa>>>(V+7|0)&1|V<<1}}else{va=0}V=42728+(va<<2)|0;c[da+(fa+28)>>2]=va;c[da+(fa+20)>>2]=0;c[da+(fa+16)>>2]=0;ca=c[42428>>2]|0;h=1<<va;if((ca&h|0)==0){c[42428>>2]=ca|h;c[V>>2]=Z;c[da+(fa+24)>>2]=V;c[da+(fa+12)>>2]=Z;c[da+(fa+8)>>2]=Z;break}h=c[V>>2]|0;if((va|0)==31){wa=0}else{wa=25-(va>>>1)|0}i:do{if((c[h+4>>2]&-8|0)!=(sa|0)){V=sa<<wa;ca=h;while(1){xa=ca+(V>>>31<<2)+16|0;_=c[xa>>2]|0;if((_|0)==0){break}if((c[_+4>>2]&-8|0)==(sa|0)){ya=_;break i}else{V=V<<1;ca=_}}if(xa>>>0<(c[42440>>2]|0)>>>0){Kb()}else{c[xa>>2]=Z;c[da+(fa+24)>>2]=ca;c[da+(fa+12)>>2]=Z;c[da+(fa+8)>>2]=Z;break h}}else{ya=h}}while(0);h=ya+8|0;W=c[h>>2]|0;V=c[42440>>2]|0;if(ya>>>0<V>>>0){Kb()}if(W>>>0<V>>>0){Kb()}else{c[W+12>>2]=Z;c[h>>2]=Z;c[da+(fa+8)>>2]=W;c[da+(fa+12)>>2]=ya;c[da+(fa+24)>>2]=0;break}}else{W=(c[42436>>2]|0)+aa|0;c[42436>>2]=W;c[42448>>2]=Z;c[da+(fa+4)>>2]=W|1}}while(0);p=da+(la|8)|0;i=b;return p|0}fa=42872|0;while(1){za=c[fa>>2]|0;if(!(za>>>0>ga>>>0)?(Aa=c[fa+4>>2]|0,Ba=za+Aa|0,Ba>>>0>ga>>>0):0){break}fa=c[fa+8>>2]|0}fa=za+(Aa+ -39)|0;if((fa&7|0)==0){Ca=0}else{Ca=0-fa&7}fa=za+(Aa+ -47+Ca)|0;Z=fa>>>0<(ga+16|0)>>>0?ga:fa;fa=Z+8|0;aa=da+8|0;if((aa&7|0)==0){Da=0}else{Da=0-aa&7}aa=ea+ -40-Da|0;c[42448>>2]=da+Da;c[42436>>2]=aa;c[da+(Da+4)>>2]=aa|1;c[da+(ea+ -36)>>2]=40;c[42452>>2]=c[42912>>2];c[Z+4>>2]=27;c[fa+0>>2]=c[42872>>2];c[fa+4>>2]=c[42876>>2];c[fa+8>>2]=c[42880>>2];c[fa+12>>2]=c[42884>>2];c[42872>>2]=da;c[42876>>2]=ea;c[42884>>2]=0;c[42880>>2]=fa;fa=Z+28|0;c[fa>>2]=7;if((Z+32|0)>>>0<Ba>>>0){aa=fa;do{fa=aa;aa=aa+4|0;c[aa>>2]=7}while((fa+8|0)>>>0<Ba>>>0)}if((Z|0)!=(ga|0)){aa=Z-ga|0;fa=ga+(aa+4)|0;c[fa>>2]=c[fa>>2]&-2;c[ga+4>>2]=aa|1;c[ga+aa>>2]=aa;fa=aa>>>3;if(aa>>>0<256){M=fa<<1;ba=42464+(M<<2)|0;W=c[10606]|0;h=1<<fa;if((W&h|0)!=0){fa=42464+(M+2<<2)|0;V=c[fa>>2]|0;if(V>>>0<(c[42440>>2]|0)>>>0){Kb()}else{Ea=fa;Fa=V}}else{c[10606]=W|h;Ea=42464+(M+2<<2)|0;Fa=ba}c[Ea>>2]=ga;c[Fa+12>>2]=ga;c[ga+8>>2]=Fa;c[ga+12>>2]=ba;break}ba=aa>>>8;if((ba|0)!=0){if(aa>>>0>16777215){Ga=31}else{M=(ba+1048320|0)>>>16&8;h=ba<<M;ba=(h+520192|0)>>>16&4;W=h<<ba;h=(W+245760|0)>>>16&2;V=14-(ba|M|h)+(W<<h>>>15)|0;Ga=aa>>>(V+7|0)&1|V<<1}}else{Ga=0}V=42728+(Ga<<2)|0;c[ga+28>>2]=Ga;c[ga+20>>2]=0;c[ga+16>>2]=0;h=c[42428>>2]|0;W=1<<Ga;if((h&W|0)==0){c[42428>>2]=h|W;c[V>>2]=ga;c[ga+24>>2]=V;c[ga+12>>2]=ga;c[ga+8>>2]=ga;break}W=c[V>>2]|0;if((Ga|0)==31){Ha=0}else{Ha=25-(Ga>>>1)|0}j:do{if((c[W+4>>2]&-8|0)!=(aa|0)){V=aa<<Ha;h=W;while(1){Ia=h+(V>>>31<<2)+16|0;M=c[Ia>>2]|0;if((M|0)==0){break}if((c[M+4>>2]&-8|0)==(aa|0)){Ja=M;break j}else{V=V<<1;h=M}}if(Ia>>>0<(c[42440>>2]|0)>>>0){Kb()}else{c[Ia>>2]=ga;c[ga+24>>2]=h;c[ga+12>>2]=ga;c[ga+8>>2]=ga;break g}}else{Ja=W}}while(0);W=Ja+8|0;aa=c[W>>2]|0;Z=c[42440>>2]|0;if(Ja>>>0<Z>>>0){Kb()}if(aa>>>0<Z>>>0){Kb()}else{c[aa+12>>2]=ga;c[W>>2]=ga;c[ga+8>>2]=aa;c[ga+12>>2]=Ja;c[ga+24>>2]=0;break}}}else{aa=c[42440>>2]|0;if((aa|0)==0|da>>>0<aa>>>0){c[42440>>2]=da}c[42872>>2]=da;c[42876>>2]=ea;c[42884>>2]=0;c[42460>>2]=c[10724];c[42456>>2]=-1;aa=0;do{W=aa<<1;Z=42464+(W<<2)|0;c[42464+(W+3<<2)>>2]=Z;c[42464+(W+2<<2)>>2]=Z;aa=aa+1|0}while((aa|0)!=32);aa=da+8|0;if((aa&7|0)==0){Ka=0}else{Ka=0-aa&7}aa=ea+ -40-Ka|0;c[42448>>2]=da+Ka;c[42436>>2]=aa;c[da+(Ka+4)>>2]=aa|1;c[da+(ea+ -36)>>2]=40;c[42452>>2]=c[42912>>2]}}while(0);ea=c[42436>>2]|0;if(ea>>>0>B>>>0){da=ea-B|0;c[42436>>2]=da;ea=c[42448>>2]|0;c[42448>>2]=ea+B;c[ea+(B+4)>>2]=da|1;c[ea+4>>2]=B|3;p=ea+8|0;i=b;return p|0}}c[(ac()|0)>>2]=12;p=0;i=b;return p|0}function Do(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0;b=i;if((a|0)==0){i=b;return}d=a+ -8|0;e=c[42440>>2]|0;if(d>>>0<e>>>0){Kb()}f=c[a+ -4>>2]|0;g=f&3;if((g|0)==1){Kb()}h=f&-8;j=a+(h+ -8)|0;do{if((f&1|0)==0){k=c[d>>2]|0;if((g|0)==0){i=b;return}l=-8-k|0;m=a+l|0;n=k+h|0;if(m>>>0<e>>>0){Kb()}if((m|0)==(c[42444>>2]|0)){o=a+(h+ -4)|0;if((c[o>>2]&3|0)!=3){p=m;q=n;break}c[42432>>2]=n;c[o>>2]=c[o>>2]&-2;c[a+(l+4)>>2]=n|1;c[j>>2]=n;i=b;return}o=k>>>3;if(k>>>0<256){k=c[a+(l+8)>>2]|0;r=c[a+(l+12)>>2]|0;s=42464+(o<<1<<2)|0;if((k|0)!=(s|0)){if(k>>>0<e>>>0){Kb()}if((c[k+12>>2]|0)!=(m|0)){Kb()}}if((r|0)==(k|0)){c[10606]=c[10606]&~(1<<o);p=m;q=n;break}if((r|0)!=(s|0)){if(r>>>0<e>>>0){Kb()}s=r+8|0;if((c[s>>2]|0)==(m|0)){t=s}else{Kb()}}else{t=r+8|0}c[k+12>>2]=r;c[t>>2]=k;p=m;q=n;break}k=c[a+(l+24)>>2]|0;r=c[a+(l+12)>>2]|0;do{if((r|0)==(m|0)){s=a+(l+20)|0;o=c[s>>2]|0;if((o|0)==0){u=a+(l+16)|0;v=c[u>>2]|0;if((v|0)==0){w=0;break}else{x=v;y=u}}else{x=o;y=s}while(1){s=x+20|0;o=c[s>>2]|0;if((o|0)!=0){x=o;y=s;continue}s=x+16|0;o=c[s>>2]|0;if((o|0)==0){break}else{x=o;y=s}}if(y>>>0<e>>>0){Kb()}else{c[y>>2]=0;w=x;break}}else{s=c[a+(l+8)>>2]|0;if(s>>>0<e>>>0){Kb()}o=s+12|0;if((c[o>>2]|0)!=(m|0)){Kb()}u=r+8|0;if((c[u>>2]|0)==(m|0)){c[o>>2]=r;c[u>>2]=s;w=r;break}else{Kb()}}}while(0);if((k|0)!=0){r=c[a+(l+28)>>2]|0;s=42728+(r<<2)|0;if((m|0)==(c[s>>2]|0)){c[s>>2]=w;if((w|0)==0){c[42428>>2]=c[42428>>2]&~(1<<r);p=m;q=n;break}}else{if(k>>>0<(c[42440>>2]|0)>>>0){Kb()}r=k+16|0;if((c[r>>2]|0)==(m|0)){c[r>>2]=w}else{c[k+20>>2]=w}if((w|0)==0){p=m;q=n;break}}if(w>>>0<(c[42440>>2]|0)>>>0){Kb()}c[w+24>>2]=k;r=c[a+(l+16)>>2]|0;do{if((r|0)!=0){if(r>>>0<(c[42440>>2]|0)>>>0){Kb()}else{c[w+16>>2]=r;c[r+24>>2]=w;break}}}while(0);r=c[a+(l+20)>>2]|0;if((r|0)!=0){if(r>>>0<(c[42440>>2]|0)>>>0){Kb()}else{c[w+20>>2]=r;c[r+24>>2]=w;p=m;q=n;break}}else{p=m;q=n}}else{p=m;q=n}}else{p=d;q=h}}while(0);if(!(p>>>0<j>>>0)){Kb()}d=a+(h+ -4)|0;w=c[d>>2]|0;if((w&1|0)==0){Kb()}if((w&2|0)==0){if((j|0)==(c[42448>>2]|0)){e=(c[42436>>2]|0)+q|0;c[42436>>2]=e;c[42448>>2]=p;c[p+4>>2]=e|1;if((p|0)!=(c[42444>>2]|0)){i=b;return}c[42444>>2]=0;c[42432>>2]=0;i=b;return}if((j|0)==(c[42444>>2]|0)){e=(c[42432>>2]|0)+q|0;c[42432>>2]=e;c[42444>>2]=p;c[p+4>>2]=e|1;c[p+e>>2]=e;i=b;return}e=(w&-8)+q|0;x=w>>>3;do{if(!(w>>>0<256)){y=c[a+(h+16)>>2]|0;t=c[a+(h|4)>>2]|0;do{if((t|0)==(j|0)){g=a+(h+12)|0;f=c[g>>2]|0;if((f|0)==0){r=a+(h+8)|0;k=c[r>>2]|0;if((k|0)==0){z=0;break}else{A=k;B=r}}else{A=f;B=g}while(1){g=A+20|0;f=c[g>>2]|0;if((f|0)!=0){A=f;B=g;continue}g=A+16|0;f=c[g>>2]|0;if((f|0)==0){break}else{A=f;B=g}}if(B>>>0<(c[42440>>2]|0)>>>0){Kb()}else{c[B>>2]=0;z=A;break}}else{g=c[a+h>>2]|0;if(g>>>0<(c[42440>>2]|0)>>>0){Kb()}f=g+12|0;if((c[f>>2]|0)!=(j|0)){Kb()}r=t+8|0;if((c[r>>2]|0)==(j|0)){c[f>>2]=t;c[r>>2]=g;z=t;break}else{Kb()}}}while(0);if((y|0)!=0){t=c[a+(h+20)>>2]|0;n=42728+(t<<2)|0;if((j|0)==(c[n>>2]|0)){c[n>>2]=z;if((z|0)==0){c[42428>>2]=c[42428>>2]&~(1<<t);break}}else{if(y>>>0<(c[42440>>2]|0)>>>0){Kb()}t=y+16|0;if((c[t>>2]|0)==(j|0)){c[t>>2]=z}else{c[y+20>>2]=z}if((z|0)==0){break}}if(z>>>0<(c[42440>>2]|0)>>>0){Kb()}c[z+24>>2]=y;t=c[a+(h+8)>>2]|0;do{if((t|0)!=0){if(t>>>0<(c[42440>>2]|0)>>>0){Kb()}else{c[z+16>>2]=t;c[t+24>>2]=z;break}}}while(0);t=c[a+(h+12)>>2]|0;if((t|0)!=0){if(t>>>0<(c[42440>>2]|0)>>>0){Kb()}else{c[z+20>>2]=t;c[t+24>>2]=z;break}}}}else{t=c[a+h>>2]|0;y=c[a+(h|4)>>2]|0;n=42464+(x<<1<<2)|0;if((t|0)!=(n|0)){if(t>>>0<(c[42440>>2]|0)>>>0){Kb()}if((c[t+12>>2]|0)!=(j|0)){Kb()}}if((y|0)==(t|0)){c[10606]=c[10606]&~(1<<x);break}if((y|0)!=(n|0)){if(y>>>0<(c[42440>>2]|0)>>>0){Kb()}n=y+8|0;if((c[n>>2]|0)==(j|0)){C=n}else{Kb()}}else{C=y+8|0}c[t+12>>2]=y;c[C>>2]=t}}while(0);c[p+4>>2]=e|1;c[p+e>>2]=e;if((p|0)==(c[42444>>2]|0)){c[42432>>2]=e;i=b;return}else{D=e}}else{c[d>>2]=w&-2;c[p+4>>2]=q|1;c[p+q>>2]=q;D=q}q=D>>>3;if(D>>>0<256){w=q<<1;d=42464+(w<<2)|0;e=c[10606]|0;C=1<<q;if((e&C|0)!=0){q=42464+(w+2<<2)|0;j=c[q>>2]|0;if(j>>>0<(c[42440>>2]|0)>>>0){Kb()}else{E=q;F=j}}else{c[10606]=e|C;E=42464+(w+2<<2)|0;F=d}c[E>>2]=p;c[F+12>>2]=p;c[p+8>>2]=F;c[p+12>>2]=d;i=b;return}d=D>>>8;if((d|0)!=0){if(D>>>0>16777215){G=31}else{F=(d+1048320|0)>>>16&8;E=d<<F;d=(E+520192|0)>>>16&4;w=E<<d;E=(w+245760|0)>>>16&2;C=14-(d|F|E)+(w<<E>>>15)|0;G=D>>>(C+7|0)&1|C<<1}}else{G=0}C=42728+(G<<2)|0;c[p+28>>2]=G;c[p+20>>2]=0;c[p+16>>2]=0;E=c[42428>>2]|0;w=1<<G;a:do{if((E&w|0)!=0){F=c[C>>2]|0;if((G|0)==31){H=0}else{H=25-(G>>>1)|0}b:do{if((c[F+4>>2]&-8|0)!=(D|0)){d=D<<H;e=F;while(1){I=e+(d>>>31<<2)+16|0;j=c[I>>2]|0;if((j|0)==0){break}if((c[j+4>>2]&-8|0)==(D|0)){J=j;break b}else{d=d<<1;e=j}}if(I>>>0<(c[42440>>2]|0)>>>0){Kb()}else{c[I>>2]=p;c[p+24>>2]=e;c[p+12>>2]=p;c[p+8>>2]=p;break a}}else{J=F}}while(0);F=J+8|0;d=c[F>>2]|0;j=c[42440>>2]|0;if(J>>>0<j>>>0){Kb()}if(d>>>0<j>>>0){Kb()}else{c[d+12>>2]=p;c[F>>2]=p;c[p+8>>2]=d;c[p+12>>2]=J;c[p+24>>2]=0;break}}else{c[42428>>2]=E|w;c[C>>2]=p;c[p+24>>2]=C;c[p+12>>2]=p;c[p+8>>2]=p}}while(0);p=(c[42456>>2]|0)+ -1|0;c[42456>>2]=p;if((p|0)==0){K=42880|0}else{i=b;return}while(1){p=c[K>>2]|0;if((p|0)==0){break}else{K=p+8|0}}c[42456>>2]=-1;i=b;return}function Eo(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0;d=i;do{if((a|0)!=0){if(b>>>0>4294967231){c[(ac()|0)>>2]=12;e=0;break}if(b>>>0<11){f=16}else{f=b+11&-8}g=Fo(a+ -8|0,f)|0;if((g|0)!=0){e=g+8|0;break}g=Co(b)|0;if((g|0)==0){e=0}else{h=c[a+ -4>>2]|0;j=(h&-8)-((h&3|0)==0?8:4)|0;dp(g|0,a|0,(j>>>0<b>>>0?j:b)|0)|0;Do(a);e=g}}else{e=Co(b)|0}}while(0);i=d;return e|0}function Fo(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;d=i;e=a+4|0;f=c[e>>2]|0;g=f&-8;h=a+g|0;j=c[42440>>2]|0;if(a>>>0<j>>>0){Kb()}k=f&3;if(!((k|0)!=1&a>>>0<h>>>0)){Kb()}l=a+(g|4)|0;m=c[l>>2]|0;if((m&1|0)==0){Kb()}if((k|0)==0){if(b>>>0<256){n=0;i=d;return n|0}if(!(g>>>0<(b+4|0)>>>0)?!((g-b|0)>>>0>c[42904>>2]<<1>>>0):0){n=a;i=d;return n|0}n=0;i=d;return n|0}if(!(g>>>0<b>>>0)){k=g-b|0;if(!(k>>>0>15)){n=a;i=d;return n|0}c[e>>2]=f&1|b|2;c[a+(b+4)>>2]=k|3;c[l>>2]=c[l>>2]|1;Go(a+b|0,k);n=a;i=d;return n|0}if((h|0)==(c[42448>>2]|0)){k=(c[42436>>2]|0)+g|0;if(!(k>>>0>b>>>0)){n=0;i=d;return n|0}l=k-b|0;c[e>>2]=f&1|b|2;c[a+(b+4)>>2]=l|1;c[42448>>2]=a+b;c[42436>>2]=l;n=a;i=d;return n|0}if((h|0)==(c[42444>>2]|0)){l=(c[42432>>2]|0)+g|0;if(l>>>0<b>>>0){n=0;i=d;return n|0}k=l-b|0;if(k>>>0>15){c[e>>2]=f&1|b|2;c[a+(b+4)>>2]=k|1;c[a+l>>2]=k;o=a+(l+4)|0;c[o>>2]=c[o>>2]&-2;p=a+b|0;q=k}else{c[e>>2]=f&1|l|2;f=a+(l+4)|0;c[f>>2]=c[f>>2]|1;p=0;q=0}c[42432>>2]=q;c[42444>>2]=p;n=a;i=d;return n|0}if((m&2|0)!=0){n=0;i=d;return n|0}p=(m&-8)+g|0;if(p>>>0<b>>>0){n=0;i=d;return n|0}q=p-b|0;f=m>>>3;do{if(!(m>>>0<256)){l=c[a+(g+24)>>2]|0;k=c[a+(g+12)>>2]|0;do{if((k|0)==(h|0)){o=a+(g+20)|0;r=c[o>>2]|0;if((r|0)==0){s=a+(g+16)|0;t=c[s>>2]|0;if((t|0)==0){u=0;break}else{v=t;w=s}}else{v=r;w=o}while(1){o=v+20|0;r=c[o>>2]|0;if((r|0)!=0){v=r;w=o;continue}o=v+16|0;r=c[o>>2]|0;if((r|0)==0){break}else{v=r;w=o}}if(w>>>0<j>>>0){Kb()}else{c[w>>2]=0;u=v;break}}else{o=c[a+(g+8)>>2]|0;if(o>>>0<j>>>0){Kb()}r=o+12|0;if((c[r>>2]|0)!=(h|0)){Kb()}s=k+8|0;if((c[s>>2]|0)==(h|0)){c[r>>2]=k;c[s>>2]=o;u=k;break}else{Kb()}}}while(0);if((l|0)!=0){k=c[a+(g+28)>>2]|0;o=42728+(k<<2)|0;if((h|0)==(c[o>>2]|0)){c[o>>2]=u;if((u|0)==0){c[42428>>2]=c[42428>>2]&~(1<<k);break}}else{if(l>>>0<(c[42440>>2]|0)>>>0){Kb()}k=l+16|0;if((c[k>>2]|0)==(h|0)){c[k>>2]=u}else{c[l+20>>2]=u}if((u|0)==0){break}}if(u>>>0<(c[42440>>2]|0)>>>0){Kb()}c[u+24>>2]=l;k=c[a+(g+16)>>2]|0;do{if((k|0)!=0){if(k>>>0<(c[42440>>2]|0)>>>0){Kb()}else{c[u+16>>2]=k;c[k+24>>2]=u;break}}}while(0);k=c[a+(g+20)>>2]|0;if((k|0)!=0){if(k>>>0<(c[42440>>2]|0)>>>0){Kb()}else{c[u+20>>2]=k;c[k+24>>2]=u;break}}}}else{k=c[a+(g+8)>>2]|0;l=c[a+(g+12)>>2]|0;o=42464+(f<<1<<2)|0;if((k|0)!=(o|0)){if(k>>>0<j>>>0){Kb()}if((c[k+12>>2]|0)!=(h|0)){Kb()}}if((l|0)==(k|0)){c[10606]=c[10606]&~(1<<f);break}if((l|0)!=(o|0)){if(l>>>0<j>>>0){Kb()}o=l+8|0;if((c[o>>2]|0)==(h|0)){x=o}else{Kb()}}else{x=l+8|0}c[k+12>>2]=l;c[x>>2]=k}}while(0);if(q>>>0<16){c[e>>2]=p|c[e>>2]&1|2;x=a+(p|4)|0;c[x>>2]=c[x>>2]|1;n=a;i=d;return n|0}else{c[e>>2]=c[e>>2]&1|b|2;c[a+(b+4)>>2]=q|3;e=a+(p|4)|0;c[e>>2]=c[e>>2]|1;Go(a+b|0,q);n=a;i=d;return n|0}return 0}function Go(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;d=i;e=a+b|0;f=c[a+4>>2]|0;do{if((f&1|0)==0){g=c[a>>2]|0;if((f&3|0)==0){i=d;return}h=a+(0-g)|0;j=g+b|0;k=c[42440>>2]|0;if(h>>>0<k>>>0){Kb()}if((h|0)==(c[42444>>2]|0)){l=a+(b+4)|0;if((c[l>>2]&3|0)!=3){m=h;n=j;break}c[42432>>2]=j;c[l>>2]=c[l>>2]&-2;c[a+(4-g)>>2]=j|1;c[e>>2]=j;i=d;return}l=g>>>3;if(g>>>0<256){o=c[a+(8-g)>>2]|0;p=c[a+(12-g)>>2]|0;q=42464+(l<<1<<2)|0;if((o|0)!=(q|0)){if(o>>>0<k>>>0){Kb()}if((c[o+12>>2]|0)!=(h|0)){Kb()}}if((p|0)==(o|0)){c[10606]=c[10606]&~(1<<l);m=h;n=j;break}if((p|0)!=(q|0)){if(p>>>0<k>>>0){Kb()}q=p+8|0;if((c[q>>2]|0)==(h|0)){r=q}else{Kb()}}else{r=p+8|0}c[o+12>>2]=p;c[r>>2]=o;m=h;n=j;break}o=c[a+(24-g)>>2]|0;p=c[a+(12-g)>>2]|0;do{if((p|0)==(h|0)){q=16-g|0;l=a+(q+4)|0;s=c[l>>2]|0;if((s|0)==0){t=a+q|0;q=c[t>>2]|0;if((q|0)==0){u=0;break}else{v=q;w=t}}else{v=s;w=l}while(1){l=v+20|0;s=c[l>>2]|0;if((s|0)!=0){v=s;w=l;continue}l=v+16|0;s=c[l>>2]|0;if((s|0)==0){break}else{v=s;w=l}}if(w>>>0<k>>>0){Kb()}else{c[w>>2]=0;u=v;break}}else{l=c[a+(8-g)>>2]|0;if(l>>>0<k>>>0){Kb()}s=l+12|0;if((c[s>>2]|0)!=(h|0)){Kb()}t=p+8|0;if((c[t>>2]|0)==(h|0)){c[s>>2]=p;c[t>>2]=l;u=p;break}else{Kb()}}}while(0);if((o|0)!=0){p=c[a+(28-g)>>2]|0;k=42728+(p<<2)|0;if((h|0)==(c[k>>2]|0)){c[k>>2]=u;if((u|0)==0){c[42428>>2]=c[42428>>2]&~(1<<p);m=h;n=j;break}}else{if(o>>>0<(c[42440>>2]|0)>>>0){Kb()}p=o+16|0;if((c[p>>2]|0)==(h|0)){c[p>>2]=u}else{c[o+20>>2]=u}if((u|0)==0){m=h;n=j;break}}if(u>>>0<(c[42440>>2]|0)>>>0){Kb()}c[u+24>>2]=o;p=16-g|0;k=c[a+p>>2]|0;do{if((k|0)!=0){if(k>>>0<(c[42440>>2]|0)>>>0){Kb()}else{c[u+16>>2]=k;c[k+24>>2]=u;break}}}while(0);k=c[a+(p+4)>>2]|0;if((k|0)!=0){if(k>>>0<(c[42440>>2]|0)>>>0){Kb()}else{c[u+20>>2]=k;c[k+24>>2]=u;m=h;n=j;break}}else{m=h;n=j}}else{m=h;n=j}}else{m=a;n=b}}while(0);u=c[42440>>2]|0;if(e>>>0<u>>>0){Kb()}v=a+(b+4)|0;w=c[v>>2]|0;if((w&2|0)==0){if((e|0)==(c[42448>>2]|0)){r=(c[42436>>2]|0)+n|0;c[42436>>2]=r;c[42448>>2]=m;c[m+4>>2]=r|1;if((m|0)!=(c[42444>>2]|0)){i=d;return}c[42444>>2]=0;c[42432>>2]=0;i=d;return}if((e|0)==(c[42444>>2]|0)){r=(c[42432>>2]|0)+n|0;c[42432>>2]=r;c[42444>>2]=m;c[m+4>>2]=r|1;c[m+r>>2]=r;i=d;return}r=(w&-8)+n|0;f=w>>>3;do{if(!(w>>>0<256)){k=c[a+(b+24)>>2]|0;g=c[a+(b+12)>>2]|0;do{if((g|0)==(e|0)){o=a+(b+20)|0;l=c[o>>2]|0;if((l|0)==0){t=a+(b+16)|0;s=c[t>>2]|0;if((s|0)==0){x=0;break}else{y=s;z=t}}else{y=l;z=o}while(1){o=y+20|0;l=c[o>>2]|0;if((l|0)!=0){y=l;z=o;continue}o=y+16|0;l=c[o>>2]|0;if((l|0)==0){break}else{y=l;z=o}}if(z>>>0<u>>>0){Kb()}else{c[z>>2]=0;x=y;break}}else{o=c[a+(b+8)>>2]|0;if(o>>>0<u>>>0){Kb()}l=o+12|0;if((c[l>>2]|0)!=(e|0)){Kb()}t=g+8|0;if((c[t>>2]|0)==(e|0)){c[l>>2]=g;c[t>>2]=o;x=g;break}else{Kb()}}}while(0);if((k|0)!=0){g=c[a+(b+28)>>2]|0;j=42728+(g<<2)|0;if((e|0)==(c[j>>2]|0)){c[j>>2]=x;if((x|0)==0){c[42428>>2]=c[42428>>2]&~(1<<g);break}}else{if(k>>>0<(c[42440>>2]|0)>>>0){Kb()}g=k+16|0;if((c[g>>2]|0)==(e|0)){c[g>>2]=x}else{c[k+20>>2]=x}if((x|0)==0){break}}if(x>>>0<(c[42440>>2]|0)>>>0){Kb()}c[x+24>>2]=k;g=c[a+(b+16)>>2]|0;do{if((g|0)!=0){if(g>>>0<(c[42440>>2]|0)>>>0){Kb()}else{c[x+16>>2]=g;c[g+24>>2]=x;break}}}while(0);g=c[a+(b+20)>>2]|0;if((g|0)!=0){if(g>>>0<(c[42440>>2]|0)>>>0){Kb()}else{c[x+20>>2]=g;c[g+24>>2]=x;break}}}}else{g=c[a+(b+8)>>2]|0;k=c[a+(b+12)>>2]|0;j=42464+(f<<1<<2)|0;if((g|0)!=(j|0)){if(g>>>0<u>>>0){Kb()}if((c[g+12>>2]|0)!=(e|0)){Kb()}}if((k|0)==(g|0)){c[10606]=c[10606]&~(1<<f);break}if((k|0)!=(j|0)){if(k>>>0<u>>>0){Kb()}j=k+8|0;if((c[j>>2]|0)==(e|0)){A=j}else{Kb()}}else{A=k+8|0}c[g+12>>2]=k;c[A>>2]=g}}while(0);c[m+4>>2]=r|1;c[m+r>>2]=r;if((m|0)==(c[42444>>2]|0)){c[42432>>2]=r;i=d;return}else{B=r}}else{c[v>>2]=w&-2;c[m+4>>2]=n|1;c[m+n>>2]=n;B=n}n=B>>>3;if(B>>>0<256){w=n<<1;v=42464+(w<<2)|0;r=c[10606]|0;A=1<<n;if((r&A|0)!=0){n=42464+(w+2<<2)|0;e=c[n>>2]|0;if(e>>>0<(c[42440>>2]|0)>>>0){Kb()}else{C=n;D=e}}else{c[10606]=r|A;C=42464+(w+2<<2)|0;D=v}c[C>>2]=m;c[D+12>>2]=m;c[m+8>>2]=D;c[m+12>>2]=v;i=d;return}v=B>>>8;if((v|0)!=0){if(B>>>0>16777215){E=31}else{D=(v+1048320|0)>>>16&8;C=v<<D;v=(C+520192|0)>>>16&4;w=C<<v;C=(w+245760|0)>>>16&2;A=14-(v|D|C)+(w<<C>>>15)|0;E=B>>>(A+7|0)&1|A<<1}}else{E=0}A=42728+(E<<2)|0;c[m+28>>2]=E;c[m+20>>2]=0;c[m+16>>2]=0;C=c[42428>>2]|0;w=1<<E;if((C&w|0)==0){c[42428>>2]=C|w;c[A>>2]=m;c[m+24>>2]=A;c[m+12>>2]=m;c[m+8>>2]=m;i=d;return}w=c[A>>2]|0;if((E|0)==31){F=0}else{F=25-(E>>>1)|0}a:do{if((c[w+4>>2]&-8|0)==(B|0)){G=w}else{E=B<<F;A=w;while(1){H=A+(E>>>31<<2)+16|0;C=c[H>>2]|0;if((C|0)==0){break}if((c[C+4>>2]&-8|0)==(B|0)){G=C;break a}else{E=E<<1;A=C}}if(H>>>0<(c[42440>>2]|0)>>>0){Kb()}c[H>>2]=m;c[m+24>>2]=A;c[m+12>>2]=m;c[m+8>>2]=m;i=d;return}}while(0);H=G+8|0;B=c[H>>2]|0;w=c[42440>>2]|0;if(G>>>0<w>>>0){Kb()}if(B>>>0<w>>>0){Kb()}c[B+12>>2]=m;c[H>>2]=m;c[m+8>>2]=B;c[m+12>>2]=G;c[m+24>>2]=0;i=d;return}function Ho(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=(a|0)==0?1:a;while(1){e=Co(d)|0;if((e|0)!=0){f=6;break}a=c[10730]|0;c[10730]=a+0;if((a|0)==0){f=5;break}sc[a&1]()}if((f|0)==5){d=vb(4)|0;c[d>>2]=42936;cc(d|0,42984,115)}else if((f|0)==6){i=b;return e|0}return 0}function Io(a){a=a|0;var b=0,c=0;b=i;c=Ho(a)|0;i=b;return c|0}function Jo(a){a=a|0;var b=0;b=i;if((a|0)!=0){Do(a)}i=b;return}function Ko(a){a=a|0;var b=0;b=i;Jo(a);i=b;return}function Lo(a){a=a|0;var b=0;b=i;Va(a|0);Jo(a);i=b;return}function Mo(a){a=a|0;var b=0;b=i;Va(a|0);i=b;return}function No(a){a=a|0;return 42952}function Oo(){var a=0;a=vb(4)|0;c[a>>2]=42936;cc(a|0,42984,115)}function Po(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0.0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0.0,T=0,V=0.0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0.0,ga=0,ha=0.0,ia=0,ja=0.0,ka=0,la=0.0,ma=0,na=0.0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0.0,wa=0,xa=0.0,ya=0,za=0,Aa=0,Ba=0,Ca=0.0,Da=0,Ea=0.0,Fa=0.0,Ga=0,Ha=0.0,Ia=0,Ja=0,Ka=0,La=0,Ma=0,Na=0,Oa=0,Pa=0,Qa=0,Ra=0,Sa=0,Ta=0,Ua=0,Va=0,Wa=0,Xa=0,Ya=0,Za=0,_a=0,$a=0,ab=0,bb=0,cb=0,db=0,eb=0,fb=0,gb=0,hb=0,ib=0,jb=0,kb=0,lb=0,mb=0,nb=0,ob=0,pb=0,qb=0,rb=0,sb=0,tb=0,vb=0,wb=0,xb=0,yb=0,zb=0,Ab=0,Bb=0,Cb=0,Db=0,Eb=0,Fb=0,Gb=0,Hb=0,Ib=0,Jb=0,Kb=0,Lb=0,Nb=0,Ob=0,Pb=0,Qb=0,Rb=0,Sb=0,Tb=0,Ub=0,Vb=0,Wb=0,Xb=0,Yb=0,Zb=0,_b=0,$b=0,cc=0,dc=0,ec=0,fc=0,gc=0,hc=0,ic=0,jc=0,kc=0,lc=0,mc=0,nc=0,oc=0,pc=0,qc=0,rc=0,sc=0,tc=0,uc=0.0,vc=0,wc=0,xc=0.0,yc=0.0,zc=0.0,Ac=0.0,Bc=0.0,Cc=0.0,Dc=0,Ec=0,Fc=0.0,Gc=0,Hc=0.0;g=i;i=i+512|0;h=g;if((e|0)==0){j=24;k=-149}else if((e|0)==2){j=53;k=-1074}else if((e|0)==1){j=53;k=-1074}else{l=0.0;i=g;return+l}e=b+4|0;m=b+100|0;do{n=c[e>>2]|0;if(n>>>0<(c[m>>2]|0)>>>0){c[e>>2]=n+1;o=d[n]|0}else{o=So(b)|0}}while((Mb(o|0)|0)!=0);do{if((o|0)==43|(o|0)==45){n=1-(((o|0)==45)<<1)|0;p=c[e>>2]|0;if(p>>>0<(c[m>>2]|0)>>>0){c[e>>2]=p+1;q=d[p]|0;r=n;break}else{q=So(b)|0;r=n;break}}else{q=o;r=1}}while(0);o=q;q=0;while(1){if((o|32|0)!=(a[43e3+q|0]|0)){s=o;t=q;break}do{if(q>>>0<7){n=c[e>>2]|0;if(n>>>0<(c[m>>2]|0)>>>0){c[e>>2]=n+1;u=d[n]|0;break}else{u=So(b)|0;break}}else{u=o}}while(0);n=q+1|0;if(n>>>0<8){o=u;q=n}else{s=u;t=n;break}}do{if((t|0)==3){v=23}else if((t|0)!=8){u=(f|0)==0;if(!(t>>>0<4|u)){if((t|0)==8){break}else{v=23;break}}a:do{if((t|0)==0){q=s;o=0;while(1){if((q|32|0)!=(a[43016+o|0]|0)){w=q;x=o;break a}do{if(o>>>0<2){n=c[e>>2]|0;if(n>>>0<(c[m>>2]|0)>>>0){c[e>>2]=n+1;A=d[n]|0;break}else{A=So(b)|0;break}}else{A=q}}while(0);n=o+1|0;if(n>>>0<3){q=A;o=n}else{w=A;x=n;break}}}else{w=s;x=t}}while(0);if((x|0)==3){o=c[e>>2]|0;if(o>>>0<(c[m>>2]|0)>>>0){c[e>>2]=o+1;B=d[o]|0}else{B=So(b)|0}if((B|0)==40){C=1}else{if((c[m>>2]|0)==0){l=y;i=g;return+l}c[e>>2]=(c[e>>2]|0)+ -1;l=y;i=g;return+l}while(1){o=c[e>>2]|0;if(o>>>0<(c[m>>2]|0)>>>0){c[e>>2]=o+1;D=d[o]|0}else{D=So(b)|0}if(!((D+ -48|0)>>>0<10|(D+ -65|0)>>>0<26)?!((D+ -97|0)>>>0<26|(D|0)==95):0){break}C=C+1|0}if((D|0)==41){l=y;i=g;return+l}o=(c[m>>2]|0)==0;if(!o){c[e>>2]=(c[e>>2]|0)+ -1}if(u){c[(ac()|0)>>2]=22;Ro(b,0);l=0.0;i=g;return+l}if((C|0)==0|o){l=y;i=g;return+l}else{E=C}while(1){o=E+ -1|0;c[e>>2]=(c[e>>2]|0)+ -1;if((o|0)==0){l=y;break}else{E=o}}i=g;return+l}else if((x|0)==0){do{if((w|0)==48){o=c[e>>2]|0;if(o>>>0<(c[m>>2]|0)>>>0){c[e>>2]=o+1;F=d[o]|0}else{F=So(b)|0}if((F|32|0)!=120){if((c[m>>2]|0)==0){G=48;break}c[e>>2]=(c[e>>2]|0)+ -1;G=48;break}o=c[e>>2]|0;if(o>>>0<(c[m>>2]|0)>>>0){c[e>>2]=o+1;H=d[o]|0;I=0}else{H=So(b)|0;I=0}while(1){if((H|0)==46){v=70;break}else if((H|0)!=48){K=0;L=0;M=0;N=0;O=H;P=I;Q=0;R=0;S=1.0;T=0;V=0.0;break}o=c[e>>2]|0;if(o>>>0<(c[m>>2]|0)>>>0){c[e>>2]=o+1;H=d[o]|0;I=1;continue}else{H=So(b)|0;I=1;continue}}b:do{if((v|0)==70){o=c[e>>2]|0;if(o>>>0<(c[m>>2]|0)>>>0){c[e>>2]=o+1;W=d[o]|0}else{W=So(b)|0}if((W|0)==48){o=-1;q=-1;while(1){n=c[e>>2]|0;if(n>>>0<(c[m>>2]|0)>>>0){c[e>>2]=n+1;X=d[n]|0}else{X=So(b)|0}if((X|0)!=48){K=0;L=0;M=o;N=q;O=X;P=1;Q=1;R=0;S=1.0;T=0;V=0.0;break b}n=bp(o|0,q|0,-1,-1)|0;o=n;q=J}}else{K=0;L=0;M=0;N=0;O=W;P=I;Q=1;R=0;S=1.0;T=0;V=0.0}}}while(0);c:while(1){q=O+ -48|0;do{if(!(q>>>0<10)){o=O|32;n=(O|0)==46;if(!((o+ -97|0)>>>0<6|n)){Y=O;break c}if(n){if((Q|0)==0){Z=L;_=K;$=L;aa=K;ba=P;ca=1;da=R;ea=S;ga=T;ha=V;break}else{Y=46;break c}}else{ia=(O|0)>57?o+ -87|0:q;v=84;break}}else{ia=q;v=84}}while(0);if((v|0)==84){v=0;do{if(!((K|0)<0|(K|0)==0&L>>>0<8)){if((K|0)<0|(K|0)==0&L>>>0<14){ja=S*.0625;ka=R;la=ja;ma=T;na=V+ja*+(ia|0);break}if((ia|0)!=0&(R|0)==0){ka=1;la=S;ma=T;na=V+S*.5}else{ka=R;la=S;ma=T;na=V}}else{ka=R;la=S;ma=ia+(T<<4)|0;na=V}}while(0);q=bp(L|0,K|0,1,0)|0;Z=M;_=N;$=q;aa=J;ba=1;ca=Q;da=ka;ea=la;ga=ma;ha=na}q=c[e>>2]|0;if(q>>>0<(c[m>>2]|0)>>>0){c[e>>2]=q+1;K=aa;L=$;M=Z;N=_;O=d[q]|0;P=ba;Q=ca;R=da;S=ea;T=ga;V=ha;continue}else{K=aa;L=$;M=Z;N=_;O=So(b)|0;P=ba;Q=ca;R=da;S=ea;T=ga;V=ha;continue}}if((P|0)==0){q=(c[m>>2]|0)==0;if(!q){c[e>>2]=(c[e>>2]|0)+ -1}if(!u){if(!q?(q=c[e>>2]|0,c[e>>2]=q+ -1,(Q|0)!=0):0){c[e>>2]=q+ -2}}else{Ro(b,0)}l=+(r|0)*0.0;i=g;return+l}q=(Q|0)==0;o=q?L:M;n=q?K:N;if((K|0)<0|(K|0)==0&L>>>0<8){q=L;p=K;oa=T;while(1){pa=oa<<4;qa=bp(q|0,p|0,1,0)|0;ra=J;if((ra|0)<0|(ra|0)==0&qa>>>0<8){q=qa;p=ra;oa=pa}else{sa=pa;break}}}else{sa=T}do{if((Y|32|0)==112){oa=Qo(b,f)|0;p=J;if((oa|0)==0&(p|0)==-2147483648){if(u){Ro(b,0);l=0.0;i=g;return+l}else{if((c[m>>2]|0)==0){ta=0;ua=0;break}c[e>>2]=(c[e>>2]|0)+ -1;ta=0;ua=0;break}}else{ta=oa;ua=p}}else{if((c[m>>2]|0)==0){ta=0;ua=0}else{c[e>>2]=(c[e>>2]|0)+ -1;ta=0;ua=0}}}while(0);p=hp(o|0,n|0,2)|0;oa=bp(p|0,J|0,-32,-1)|0;p=bp(oa|0,J|0,ta|0,ua|0)|0;oa=J;if((sa|0)==0){l=+(r|0)*0.0;i=g;return+l}if((oa|0)>0|(oa|0)==0&p>>>0>(0-k|0)>>>0){c[(ac()|0)>>2]=34;l=+(r|0)*1.7976931348623157e+308*1.7976931348623157e+308;i=g;return+l}q=k+ -106|0;pa=((q|0)<0)<<31>>31;if((oa|0)<(pa|0)|(oa|0)==(pa|0)&p>>>0<q>>>0){c[(ac()|0)>>2]=34;l=+(r|0)*2.2250738585072014e-308*2.2250738585072014e-308;i=g;return+l}if((sa|0)>-1){q=p;pa=oa;ra=sa;ja=V;while(1){qa=ra<<1;if(!(ja>=.5)){va=ja;wa=qa}else{va=ja+-1.0;wa=qa|1}xa=ja+va;qa=bp(q|0,pa|0,-1,-1)|0;ya=J;if((wa|0)>-1){q=qa;pa=ya;ra=wa;ja=xa}else{za=qa;Aa=ya;Ba=wa;Ca=xa;break}}}else{za=p;Aa=oa;Ba=sa;Ca=V}ra=ap(32,0,k|0,((k|0)<0)<<31>>31|0)|0;pa=bp(za|0,Aa|0,ra|0,J|0)|0;ra=J;if(0>(ra|0)|0==(ra|0)&j>>>0>pa>>>0){Da=(pa|0)<0?0:pa}else{Da=j}if((Da|0)<53){ja=+(r|0);xa=+bc(+(+To(1.0,84-Da|0)),+ja);if((Da|0)<32&Ca!=0.0){pa=Ba&1;Ea=ja;Fa=xa;Ga=(pa^1)+Ba|0;Ha=(pa|0)==0?0.0:Ca}else{Ea=ja;Fa=xa;Ga=Ba;Ha=Ca}}else{Ea=+(r|0);Fa=0.0;Ga=Ba;Ha=Ca}xa=Ea*Ha+(Fa+Ea*+(Ga>>>0))-Fa;if(!(xa!=0.0)){c[(ac()|0)>>2]=34}l=+Uo(xa,za);i=g;return+l}else{G=w}}while(0);pa=k+j|0;ra=0-pa|0;q=G;n=0;while(1){if((q|0)==46){v=139;break}else if((q|0)!=48){Ia=q;Ja=0;Ka=0;La=n;Ma=0;break}o=c[e>>2]|0;if(o>>>0<(c[m>>2]|0)>>>0){c[e>>2]=o+1;q=d[o]|0;n=1;continue}else{q=So(b)|0;n=1;continue}}d:do{if((v|0)==139){q=c[e>>2]|0;if(q>>>0<(c[m>>2]|0)>>>0){c[e>>2]=q+1;Na=d[q]|0}else{Na=So(b)|0}if((Na|0)==48){q=-1;o=-1;while(1){ya=c[e>>2]|0;if(ya>>>0<(c[m>>2]|0)>>>0){c[e>>2]=ya+1;Oa=d[ya]|0}else{Oa=So(b)|0}if((Oa|0)!=48){Ia=Oa;Ja=q;Ka=o;La=1;Ma=1;break d}ya=bp(q|0,o|0,-1,-1)|0;q=ya;o=J}}else{Ia=Na;Ja=0;Ka=0;La=n;Ma=1}}}while(0);c[h>>2]=0;n=Ia+ -48|0;o=(Ia|0)==46;e:do{if(n>>>0<10|o){q=h+496|0;oa=Ia;p=0;ya=0;qa=o;Pa=n;Qa=Ja;Ra=Ka;Sa=La;Ta=Ma;Ua=0;Va=0;Wa=0;while(1){do{if(qa){if((Ta|0)==0){Xa=p;Ya=ya;Za=p;_a=ya;$a=Sa;ab=1;bb=Ua;cb=Va;db=Wa}else{eb=oa;fb=Qa;gb=Ra;hb=p;ib=ya;jb=Sa;kb=Ua;lb=Va;mb=Wa;break e}}else{nb=bp(p|0,ya|0,1,0)|0;ob=J;pb=(oa|0)!=48;if((Va|0)>=125){if(!pb){Xa=Qa;Ya=Ra;Za=nb;_a=ob;$a=Sa;ab=Ta;bb=Ua;cb=Va;db=Wa;break}c[q>>2]=c[q>>2]|1;Xa=Qa;Ya=Ra;Za=nb;_a=ob;$a=Sa;ab=Ta;bb=Ua;cb=Va;db=Wa;break}qb=h+(Va<<2)|0;if((Ua|0)==0){rb=Pa}else{rb=oa+ -48+((c[qb>>2]|0)*10|0)|0}c[qb>>2]=rb;qb=Ua+1|0;sb=(qb|0)==9;Xa=Qa;Ya=Ra;Za=nb;_a=ob;$a=1;ab=Ta;bb=sb?0:qb;cb=(sb&1)+Va|0;db=pb?nb:Wa}}while(0);nb=c[e>>2]|0;if(nb>>>0<(c[m>>2]|0)>>>0){c[e>>2]=nb+1;tb=d[nb]|0}else{tb=So(b)|0}nb=tb+ -48|0;pb=(tb|0)==46;if(nb>>>0<10|pb){oa=tb;p=Za;ya=_a;qa=pb;Pa=nb;Qa=Xa;Ra=Ya;Sa=$a;Ta=ab;Ua=bb;Va=cb;Wa=db}else{vb=tb;wb=Xa;xb=Za;yb=Ya;zb=_a;Ab=$a;Bb=ab;Cb=bb;Db=cb;Eb=db;v=162;break}}}else{vb=Ia;wb=Ja;xb=0;yb=Ka;zb=0;Ab=La;Bb=Ma;Cb=0;Db=0;Eb=0;v=162}}while(0);if((v|0)==162){n=(Bb|0)==0;eb=vb;fb=n?xb:wb;gb=n?zb:yb;hb=xb;ib=zb;jb=Ab;kb=Cb;lb=Db;mb=Eb}n=(jb|0)!=0;if(n?(eb|32|0)==101:0){o=Qo(b,f)|0;Wa=J;do{if((o|0)==0&(Wa|0)==-2147483648){if(u){Ro(b,0);l=0.0;i=g;return+l}else{if((c[m>>2]|0)==0){Fb=0;Gb=0;break}c[e>>2]=(c[e>>2]|0)+ -1;Fb=0;Gb=0;break}}else{Fb=o;Gb=Wa}}while(0);Wa=bp(Fb|0,Gb|0,fb|0,gb|0)|0;Hb=Wa;Ib=J}else{if((eb|0)>-1?(c[m>>2]|0)!=0:0){c[e>>2]=(c[e>>2]|0)+ -1;Hb=fb;Ib=gb}else{Hb=fb;Ib=gb}}if(!n){c[(ac()|0)>>2]=22;Ro(b,0);l=0.0;i=g;return+l}Wa=c[h>>2]|0;if((Wa|0)==0){l=+(r|0)*0.0;i=g;return+l}do{if((Hb|0)==(hb|0)&(Ib|0)==(ib|0)&((ib|0)<0|(ib|0)==0&hb>>>0<10)){if(!(j>>>0>30)?(Wa>>>j|0)!=0:0){break}l=+(r|0)*+(Wa>>>0);i=g;return+l}}while(0);Wa=(k|0)/-2|0;n=((Wa|0)<0)<<31>>31;if((Ib|0)>(n|0)|(Ib|0)==(n|0)&Hb>>>0>Wa>>>0){c[(ac()|0)>>2]=34;l=+(r|0)*1.7976931348623157e+308*1.7976931348623157e+308;i=g;return+l}Wa=k+ -106|0;n=((Wa|0)<0)<<31>>31;if((Ib|0)<(n|0)|(Ib|0)==(n|0)&Hb>>>0<Wa>>>0){c[(ac()|0)>>2]=34;l=+(r|0)*2.2250738585072014e-308*2.2250738585072014e-308;i=g;return+l}if((kb|0)==0){Jb=lb}else{if((kb|0)<9){Wa=h+(lb<<2)|0;n=c[Wa>>2]|0;o=kb;do{n=n*10|0;o=o+1|0}while((o|0)!=9);c[Wa>>2]=n}Jb=lb+1|0}do{if((mb|0)<9?(mb|0)<=(Hb|0)&(Hb|0)<18:0){if((Hb|0)==9){l=+(r|0)*+((c[h>>2]|0)>>>0);i=g;return+l}if((Hb|0)<9){l=+(r|0)*+((c[h>>2]|0)>>>0)/+(c[43032+(8-Hb<<2)>>2]|0);i=g;return+l}o=j+27+(fa(Hb,-3)|0)|0;u=c[h>>2]|0;if((o|0)<=30?(u>>>o|0)!=0:0){break}l=+(r|0)*+(u>>>0)*+(c[43032+(Hb+ -10<<2)>>2]|0);i=g;return+l}}while(0);n=(Hb|0)%9|0;if((n|0)==0){Kb=0;Lb=0;Nb=Hb;Ob=Jb}else{Wa=(Hb|0)>-1?n:n+9|0;n=c[43032+(8-Wa<<2)>>2]|0;if((Jb|0)!=0){u=1e9/(n|0)|0;o=0;Va=0;Ua=0;Ta=Hb;while(1){Sa=h+(Ua<<2)|0;Ra=c[Sa>>2]|0;Qa=((Ra>>>0)/(n>>>0)|0)+Va|0;c[Sa>>2]=Qa;Va=fa((Ra>>>0)%(n>>>0)|0,u)|0;Ra=Ua;Ua=Ua+1|0;if((Ra|0)==(o|0)&(Qa|0)==0){Pb=Ua&127;Qb=Ta+ -9|0}else{Pb=o;Qb=Ta}if((Ua|0)==(Jb|0)){break}else{o=Pb;Ta=Qb}}if((Va|0)==0){Rb=Pb;Sb=Qb;Tb=Jb}else{c[h+(Jb<<2)>>2]=Va;Rb=Pb;Sb=Qb;Tb=Jb+1|0}}else{Rb=0;Sb=Hb;Tb=0}Kb=Rb;Lb=0;Nb=9-Wa+Sb|0;Ob=Tb}f:while(1){Ta=h+(Kb<<2)|0;if((Nb|0)<18){o=Lb;Ua=Ob;while(1){u=0;n=Ua+127|0;Qa=Ua;while(1){Ra=n&127;Sa=h+(Ra<<2)|0;Pa=hp(c[Sa>>2]|0,0,29)|0;qa=bp(Pa|0,J|0,u|0,0)|0;Pa=J;if(Pa>>>0>0|(Pa|0)==0&qa>>>0>1e9){ya=rp(qa|0,Pa|0,1e9,0)|0;p=sp(qa|0,Pa|0,1e9,0)|0;Ub=p;Vb=ya}else{Ub=qa;Vb=0}c[Sa>>2]=Ub;Sa=(Ra|0)==(Kb|0);if((Ra|0)!=(Qa+127&127|0)|Sa){Wb=Qa}else{Wb=(Ub|0)==0?Ra:Qa}if(Sa){break}else{u=Vb;n=Ra+ -1|0;Qa=Wb}}Qa=o+ -29|0;if((Vb|0)==0){o=Qa;Ua=Wb}else{Xb=Qa;Yb=Vb;Zb=Wb;break}}}else{if((Nb|0)==18){_b=Lb;$b=Ob}else{cc=Kb;dc=Lb;ec=Nb;fc=Ob;break}while(1){if(!((c[Ta>>2]|0)>>>0<9007199)){cc=Kb;dc=_b;ec=18;fc=$b;break f}Ua=0;o=$b+127|0;Qa=$b;while(1){n=o&127;u=h+(n<<2)|0;Ra=hp(c[u>>2]|0,0,29)|0;Sa=bp(Ra|0,J|0,Ua|0,0)|0;Ra=J;if(Ra>>>0>0|(Ra|0)==0&Sa>>>0>1e9){qa=rp(Sa|0,Ra|0,1e9,0)|0;ya=sp(Sa|0,Ra|0,1e9,0)|0;gc=ya;hc=qa}else{gc=Sa;hc=0}c[u>>2]=gc;u=(n|0)==(Kb|0);if((n|0)!=(Qa+127&127|0)|u){ic=Qa}else{ic=(gc|0)==0?n:Qa}if(u){break}else{Ua=hc;o=n+ -1|0;Qa=ic}}Qa=_b+ -29|0;if((hc|0)==0){_b=Qa;$b=ic}else{Xb=Qa;Yb=hc;Zb=ic;break}}}Ta=Kb+127&127;if((Ta|0)==(Zb|0)){Qa=Zb+127&127;o=h+((Zb+126&127)<<2)|0;c[o>>2]=c[o>>2]|c[h+(Qa<<2)>>2];jc=Qa}else{jc=Zb}c[h+(Ta<<2)>>2]=Yb;Kb=Ta;Lb=Xb;Nb=Nb+9|0;Ob=jc}g:while(1){kc=fc+1&127;Wa=h+((fc+127&127)<<2)|0;Va=cc;Ta=dc;Qa=ec;while(1){o=(Qa|0)==18;Ua=(Qa|0)>27?9:1;lc=Va;mc=Ta;while(1){n=0;while(1){u=n+lc&127;if((u|0)==(fc|0)){nc=2;break}Sa=c[h+(u<<2)>>2]|0;u=c[43024+(n<<2)>>2]|0;if(Sa>>>0<u>>>0){nc=2;break}qa=n+1|0;if(Sa>>>0>u>>>0){nc=n;break}if((qa|0)<2){n=qa}else{nc=qa;break}}if((nc|0)==2&o){break g}oc=Ua+mc|0;if((lc|0)==(fc|0)){lc=fc;mc=oc}else{break}}o=(1<<Ua)+ -1|0;n=1e9>>>Ua;pc=lc;qc=0;qa=lc;rc=Qa;do{u=h+(qa<<2)|0;Sa=c[u>>2]|0;ya=(Sa>>>Ua)+qc|0;c[u>>2]=ya;qc=fa(Sa&o,n)|0;Sa=(qa|0)==(pc|0)&(ya|0)==0;qa=qa+1&127;rc=Sa?rc+ -9|0:rc;pc=Sa?qa:pc}while((qa|0)!=(fc|0));if((qc|0)==0){Va=pc;Ta=oc;Qa=rc;continue}if((kc|0)!=(pc|0)){break}c[Wa>>2]=c[Wa>>2]|1;Va=pc;Ta=oc;Qa=rc}c[h+(fc<<2)>>2]=qc;cc=pc;dc=oc;ec=rc;fc=kc}Qa=lc&127;if((Qa|0)==(fc|0)){c[h+(kc+ -1<<2)>>2]=0;sc=kc}else{sc=fc}xa=+((c[h+(Qa<<2)>>2]|0)>>>0);Qa=lc+1&127;if((Qa|0)==(sc|0)){Ta=sc+1&127;c[h+(Ta+ -1<<2)>>2]=0;tc=Ta}else{tc=sc}ja=+(r|0);uc=ja*(xa*1.0e9+ +((c[h+(Qa<<2)>>2]|0)>>>0));Qa=mc+53|0;Ta=Qa-k|0;if((Ta|0)<(j|0)){vc=(Ta|0)<0?0:Ta;wc=1}else{vc=j;wc=0}if((vc|0)<53){xa=+bc(+(+To(1.0,105-vc|0)),+uc);xc=+ub(+uc,+(+To(1.0,53-vc|0)));yc=xa;zc=xc;Ac=xa+(uc-xc)}else{yc=0.0;zc=0.0;Ac=uc}Va=lc+2&127;if((Va|0)!=(tc|0)){Wa=c[h+(Va<<2)>>2]|0;do{if(!(Wa>>>0<5e8)){if(Wa>>>0>5e8){Bc=ja*.75+zc;break}if((lc+3&127|0)==(tc|0)){Bc=ja*.5+zc;break}else{Bc=ja*.75+zc;break}}else{if((Wa|0)==0?(lc+3&127|0)==(tc|0):0){Bc=zc;break}Bc=ja*.25+zc}}while(0);if((53-vc|0)>1?!(+ub(+Bc,1.0)!=0.0):0){Cc=Bc+1.0}else{Cc=Bc}}else{Cc=zc}ja=Ac+Cc-yc;do{if((Qa&2147483647|0)>(-2-pa|0)){if(!(+U(+ja)>=9007199254740992.0)){Dc=wc;Ec=mc;Fc=ja}else{Dc=(wc|0)!=0&(vc|0)==(Ta|0)?0:wc;Ec=mc+1|0;Fc=ja*.5}if((Ec+50|0)<=(ra|0)?!((Dc|0)!=0&Cc!=0.0):0){Gc=Ec;Hc=Fc;break}c[(ac()|0)>>2]=34;Gc=Ec;Hc=Fc}else{Gc=mc;Hc=ja}}while(0);l=+Uo(Hc,Gc);i=g;return+l}else{if((c[m>>2]|0)!=0){c[e>>2]=(c[e>>2]|0)+ -1}c[(ac()|0)>>2]=22;Ro(b,0);l=0.0;i=g;return+l}}}while(0);if((v|0)==23){v=(c[m>>2]|0)==0;if(!v){c[e>>2]=(c[e>>2]|0)+ -1}if(!(t>>>0<4|(f|0)==0|v)){v=t;do{c[e>>2]=(c[e>>2]|0)+ -1;v=v+ -1|0}while(v>>>0>3)}}l=+(r|0)*z;i=g;return+l}function Qo(a,b){a=a|0;b=b|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;e=i;f=a+4|0;g=c[f>>2]|0;h=a+100|0;if(g>>>0<(c[h>>2]|0)>>>0){c[f>>2]=g+1;j=d[g]|0}else{j=So(a)|0}if((j|0)==43|(j|0)==45){g=(j|0)==45|0;k=c[f>>2]|0;if(k>>>0<(c[h>>2]|0)>>>0){c[f>>2]=k+1;l=d[k]|0}else{l=So(a)|0}if(!((l+ -48|0)>>>0<10|(b|0)==0)?(c[h>>2]|0)!=0:0){c[f>>2]=(c[f>>2]|0)+ -1;m=l;n=g}else{m=l;n=g}}else{m=j;n=0}if((m+ -48|0)>>>0>9){if((c[h>>2]|0)==0){o=-2147483648;p=0;J=o;i=e;return p|0}c[f>>2]=(c[f>>2]|0)+ -1;o=-2147483648;p=0;J=o;i=e;return p|0}else{q=m;r=0}while(1){s=q+ -48+r|0;m=c[f>>2]|0;if(m>>>0<(c[h>>2]|0)>>>0){c[f>>2]=m+1;t=d[m]|0}else{t=So(a)|0}if(!((t+ -48|0)>>>0<10&(s|0)<214748364)){break}q=t;r=s*10|0}r=((s|0)<0)<<31>>31;if((t+ -48|0)>>>0<10){q=s;m=r;j=t;while(1){g=qp(q|0,m|0,10,0)|0;l=J;b=bp(j|0,((j|0)<0)<<31>>31|0,-48,-1)|0;k=bp(b|0,J|0,g|0,l|0)|0;l=J;g=c[f>>2]|0;if(g>>>0<(c[h>>2]|0)>>>0){c[f>>2]=g+1;u=d[g]|0}else{u=So(a)|0}if((u+ -48|0)>>>0<10&((l|0)<21474836|(l|0)==21474836&k>>>0<2061584302)){q=k;m=l;j=u}else{v=k;w=l;x=u;break}}}else{v=s;w=r;x=t}if((x+ -48|0)>>>0<10){do{x=c[f>>2]|0;if(x>>>0<(c[h>>2]|0)>>>0){c[f>>2]=x+1;y=d[x]|0}else{y=So(a)|0}}while((y+ -48|0)>>>0<10)}if((c[h>>2]|0)!=0){c[f>>2]=(c[f>>2]|0)+ -1}f=(n|0)!=0;n=ap(0,0,v|0,w|0)|0;o=f?J:w;p=f?n:v;J=o;i=e;return p|0}function Ro(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=i;c[a+104>>2]=b;e=c[a+8>>2]|0;f=c[a+4>>2]|0;g=e-f|0;c[a+108>>2]=g;if((b|0)!=0&(g|0)>(b|0)){c[a+100>>2]=f+b;i=d;return}else{c[a+100>>2]=e;i=d;return}}function So(b){b=b|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0;e=i;f=b+104|0;g=c[f>>2]|0;if(!((g|0)!=0?(c[b+108>>2]|0)>=(g|0):0)){h=3}if((h|0)==3?(h=Wo(b)|0,(h|0)>=0):0){g=c[f>>2]|0;f=c[b+8>>2]|0;if((g|0)!=0?(j=c[b+4>>2]|0,k=g-(c[b+108>>2]|0)+ -1|0,(f-j|0)>(k|0)):0){c[b+100>>2]=j+k}else{c[b+100>>2]=f}k=c[b+4>>2]|0;if((f|0)!=0){j=b+108|0;c[j>>2]=f+1-k+(c[j>>2]|0)}j=k+ -1|0;if((d[j]|0|0)==(h|0)){l=h;i=e;return l|0}a[j]=h;l=h;i=e;return l|0}c[b+100>>2]=0;l=-1;i=e;return l|0}function To(a,b){a=+a;b=b|0;var d=0,e=0.0,f=0,g=0,j=0,l=0.0;d=i;if((b|0)>1023){e=a*8.98846567431158e+307;f=b+ -1023|0;if((f|0)>1023){g=b+ -2046|0;j=(g|0)>1023?1023:g;l=e*8.98846567431158e+307}else{j=f;l=e}}else{if((b|0)<-1022){e=a*2.2250738585072014e-308;f=b+1022|0;if((f|0)<-1022){g=b+2044|0;j=(g|0)<-1022?-1022:g;l=e*2.2250738585072014e-308}else{j=f;l=e}}else{j=b;l=a}}b=hp(j+1023|0,0,52)|0;j=J;c[k>>2]=b;c[k+4>>2]=j;a=l*+h[k>>3];i=d;return+a}function Uo(a,b){a=+a;b=b|0;var c=0,d=0.0;c=i;d=+To(a,b);i=c;return+d}function Vo(b){b=b|0;var d=0,e=0,f=0,g=0,h=0;d=i;e=b+74|0;f=a[e]|0;a[e]=f+255|f;f=b+20|0;e=b+44|0;if((c[f>>2]|0)>>>0>(c[e>>2]|0)>>>0){ic[c[b+36>>2]&31](b,0,0)|0}c[b+16>>2]=0;c[b+28>>2]=0;c[f>>2]=0;f=c[b>>2]|0;if((f&20|0)==0){g=c[e>>2]|0;c[b+8>>2]=g;c[b+4>>2]=g;h=0;i=d;return h|0}if((f&4|0)==0){h=-1;i=d;return h|0}c[b>>2]=f|32;h=-1;i=d;return h|0}function Wo(a){a=a|0;var b=0,e=0,f=0;b=i;i=i+16|0;e=b;if((c[a+8>>2]|0)==0?(Vo(a)|0)!=0:0){f=-1}else{if((ic[c[a+32>>2]&31](a,e,1)|0)==1){f=d[e]|0}else{f=-1}}i=b;return f|0}function Xo(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0.0,j=0,k=0;d=i;i=i+112|0;e=d;f=e+0|0;g=f+112|0;do{c[f>>2]=0;f=f+4|0}while((f|0)<(g|0));f=e+4|0;c[f>>2]=a;g=e+8|0;c[g>>2]=-1;c[e+44>>2]=a;c[e+76>>2]=-1;Ro(e,0);h=+Po(e,2,1);j=(c[f>>2]|0)-(c[g>>2]|0)+(c[e+108>>2]|0)|0;if((b|0)==0){i=d;return+h}if((j|0)==0){k=a}else{k=a+j|0}c[b>>2]=k;i=d;return+h}function Yo(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0;e=i;a:do{if((d|0)==0){f=0}else{g=d;h=b;j=c;while(1){k=a[h]|0;l=a[j]|0;if(!(k<<24>>24==l<<24>>24)){break}m=g+ -1|0;if((m|0)==0){f=0;break a}else{g=m;h=h+1|0;j=j+1|0}}f=(k&255)-(l&255)|0}}while(0);i=e;return f|0}function Zo(){c[7754]=p;c[7780]=p;c[10518]=p;c[10748]=p}function _o(a){a=a|0;var b=0;b=(fa(c[a>>2]|0,31010991)|0)+1735287159&2147483647;c[a>>2]=b;return b|0}function $o(){return _o(o)|0}function ap(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=b-d>>>0;e=b-d-(c>>>0>a>>>0|0)>>>0;return(J=e,a-c>>>0|0)|0}function bp(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=a+c>>>0;return(J=b+d+(e>>>0<a>>>0|0)>>>0,e|0)|0}function cp(b){b=b|0;var c=0;c=b;while(a[c]|0){c=c+1|0}return c-b|0}function dp(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((e|0)>=4096)return Oa(b|0,d|0,e|0)|0;f=b|0;if((b&3)==(d&3)){while(b&3){if((e|0)==0)return f|0;a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function ep(b,c,d){b=b|0;c=c|0;d=d|0;var e=0;if((c|0)<(b|0)&(b|0)<(c+d|0)){e=b;c=c+d|0;b=b+d|0;while((d|0)>0){b=b-1|0;c=c-1|0;d=d-1|0;a[b]=a[c]|0}b=e}else{dp(b,c,d)|0}return b|0}function fp(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=b+e|0;if((e|0)>=20){d=d&255;g=b&3;h=d|d<<8|d<<16|d<<24;i=f&~3;if(g){g=b+4-g|0;while((b|0)<(g|0)){a[b]=d;b=b+1|0}}while((b|0)<(i|0)){c[b>>2]=h;b=b+4|0}}while((b|0)<(f|0)){a[b]=d;b=b+1|0}return b-e|0}function gp(a){a=a|0;if((a|0)<65)return a|0;if((a|0)>90)return a|0;return a-65+97|0}function hp(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){J=b<<c|(a&(1<<c)-1<<32-c)>>>32-c;return a<<c}J=a<<c-32;return 0}function ip(b,c){b=b|0;c=c|0;var d=0;do{a[b+d|0]=a[c+d|0];d=d+1|0}while(a[c+(d-1)|0]|0);return b|0}function jp(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){J=b>>>c;return a>>>c|(b&(1<<c)-1)<<32-c}J=0;return b>>>c-32|0}function kp(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){J=b>>c;return a>>>c|(b&(1<<c)-1)<<32-c}J=(b|0)<0?-1:0;return b>>c-32|0}function lp(b){b=b|0;var c=0;c=a[n+(b>>>24)|0]|0;if((c|0)<8)return c|0;c=a[n+(b>>16&255)|0]|0;if((c|0)<8)return c+8|0;c=a[n+(b>>8&255)|0]|0;if((c|0)<8)return c+16|0;return(a[n+(b&255)|0]|0)+24|0}function mp(b){b=b|0;var c=0;c=a[m+(b&255)|0]|0;if((c|0)<8)return c|0;c=a[m+(b>>8&255)|0]|0;if((c|0)<8)return c+8|0;c=a[m+(b>>16&255)|0]|0;if((c|0)<8)return c+16|0;return(a[m+(b>>>24)|0]|0)+24|0}function np(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0;c=a&65535;d=b&65535;e=fa(d,c)|0;f=a>>>16;a=(e>>>16)+(fa(d,f)|0)|0;d=b>>>16;b=fa(d,c)|0;return(J=(a>>>16)+(fa(d,f)|0)+(((a&65535)+b|0)>>>16)|0,a+b<<16|e&65535|0)|0}function op(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=b>>31|((b|0)<0?-1:0)<<1;f=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;g=d>>31|((d|0)<0?-1:0)<<1;h=((d|0)<0?-1:0)>>31|((d|0)<0?-1:0)<<1;i=ap(e^a,f^b,e,f)|0;b=J;a=g^e;e=h^f;f=ap((tp(i,b,ap(g^c,h^d,g,h)|0,J,0)|0)^a,J^e,a,e)|0;return f|0}function pp(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+8|0;g=f|0;h=b>>31|((b|0)<0?-1:0)<<1;j=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;k=e>>31|((e|0)<0?-1:0)<<1;l=((e|0)<0?-1:0)>>31|((e|0)<0?-1:0)<<1;m=ap(h^a,j^b,h,j)|0;b=J;tp(m,b,ap(k^d,l^e,k,l)|0,J,g)|0;l=ap(c[g>>2]^h,c[g+4>>2]^j,h,j)|0;j=J;i=f;return(J=j,l)|0}function qp(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=a;a=c;c=np(e,a)|0;f=J;return(J=(fa(b,a)|0)+(fa(d,e)|0)+f|f&0,c|0|0)|0}function rp(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0;e=tp(a,b,c,d,0)|0;return e|0}function sp(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;i=i+8|0;g=f|0;tp(a,b,d,e,g)|0;i=f;return(J=c[g+4>>2]|0,c[g>>2]|0)|0}function tp(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;g=a;h=b;i=h;j=d;k=e;l=k;if((i|0)==0){m=(f|0)!=0;if((l|0)==0){if(m){c[f>>2]=(g>>>0)%(j>>>0);c[f+4>>2]=0}n=0;o=(g>>>0)/(j>>>0)>>>0;return(J=n,o)|0}else{if(!m){n=0;o=0;return(J=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=b&0;n=0;o=0;return(J=n,o)|0}}m=(l|0)==0;do{if((j|0)!=0){if(!m){p=(lp(l|0)|0)-(lp(i|0)|0)|0;if(p>>>0<=31){q=p+1|0;r=31-p|0;s=p-31>>31;t=q;u=g>>>(q>>>0)&s|i<<r;v=i>>>(q>>>0)&s;w=0;x=g<<r;break}if((f|0)==0){n=0;o=0;return(J=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=h|b&0;n=0;o=0;return(J=n,o)|0}r=j-1|0;if((r&j|0)!=0){s=(lp(j|0)|0)+33-(lp(i|0)|0)|0;q=64-s|0;p=32-s|0;y=p>>31;z=s-32|0;A=z>>31;t=s;u=p-1>>31&i>>>(z>>>0)|(i<<p|g>>>(s>>>0))&A;v=A&i>>>(s>>>0);w=g<<q&y;x=(i<<q|g>>>(z>>>0))&y|g<<p&s-33>>31;break}if((f|0)!=0){c[f>>2]=r&g;c[f+4>>2]=0}if((j|0)==1){n=h|b&0;o=a|0|0;return(J=n,o)|0}else{r=mp(j|0)|0;n=i>>>(r>>>0)|0;o=i<<32-r|g>>>(r>>>0)|0;return(J=n,o)|0}}else{if(m){if((f|0)!=0){c[f>>2]=(i>>>0)%(j>>>0);c[f+4>>2]=0}n=0;o=(i>>>0)/(j>>>0)>>>0;return(J=n,o)|0}if((g|0)==0){if((f|0)!=0){c[f>>2]=0;c[f+4>>2]=(i>>>0)%(l>>>0)}n=0;o=(i>>>0)/(l>>>0)>>>0;return(J=n,o)|0}r=l-1|0;if((r&l|0)==0){if((f|0)!=0){c[f>>2]=a|0;c[f+4>>2]=r&i|b&0}n=0;o=i>>>((mp(l|0)|0)>>>0);return(J=n,o)|0}r=(lp(l|0)|0)-(lp(i|0)|0)|0;if(r>>>0<=30){s=r+1|0;p=31-r|0;t=s;u=i<<p|g>>>(s>>>0);v=i>>>(s>>>0);w=0;x=g<<p;break}if((f|0)==0){n=0;o=0;return(J=n,o)|0}c[f>>2]=a|0;c[f+4>>2]=h|b&0;n=0;o=0;return(J=n,o)|0}}while(0);if((t|0)==0){B=x;C=w;D=v;E=u;F=0;G=0}else{b=d|0|0;d=k|e&0;e=bp(b,d,-1,-1)|0;k=J;h=x;x=w;w=v;v=u;u=t;t=0;do{a=h;h=x>>>31|h<<1;x=t|x<<1;g=v<<1|a>>>31|0;a=v>>>31|w<<1|0;ap(e,k,g,a)|0;i=J;l=i>>31|((i|0)<0?-1:0)<<1;t=l&1;v=ap(g,a,l&b,(((i|0)<0?-1:0)>>31|((i|0)<0?-1:0)<<1)&d)|0;w=J;u=u-1|0}while((u|0)!=0);B=h;C=x;D=w;E=v;F=0;G=t}t=C;C=0;if((f|0)!=0){c[f>>2]=E;c[f+4>>2]=D}n=(t|0)>>>31|(B|C)<<1|(C<<1|t>>>31)&0|F;o=(t<<1|0>>>31)&-2|G;return(J=n,o)|0}function up(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ic[a&31](b|0,c|0,d|0)|0}function vp(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;jc[a&63](b|0,c|0,d|0,e|0,f|0,g|0,h|0)}function wp(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;kc[a&3](b|0,c|0,d|0,e|0,f|0)}function xp(a,b){a=a|0;b=b|0;lc[a&255](b|0)}function yp(a,b,c){a=a|0;b=b|0;c=c|0;mc[a&63](b|0,c|0)}function zp(a,b,c,d,e,f,g,h,i,j){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;nc[a&3](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0,j|0)}function Ap(a,b){a=a|0;b=b|0;return oc[a&63](b|0)|0}function Bp(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;pc[a&3](b|0,c|0,d|0,e|0,f|0,g|0,+h)}function Cp(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;qc[a&3](b|0,c|0,d|0)}function Dp(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=+g;rc[a&7](b|0,c|0,d|0,e|0,f|0,+g)}function Ep(a){a=a|0;sc[a&1]()}function Fp(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;return tc[a&15](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0)|0}function Gp(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return uc[a&7](b|0,c|0,d|0,e|0)|0}function Hp(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;vc[a&7](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0)}function Ip(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;wc[a&15](b|0,c|0,d|0,e|0,f|0,g|0)}function Jp(a,b,c){a=a|0;b=b|0;c=c|0;return xc[a&31](b|0,c|0)|0}function Kp(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;return yc[a&15](b|0,c|0,d|0,e|0,f|0)|0}function Lp(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;zc[a&7](b|0,c|0,d|0,e|0)}function Mp(a,b,c){a=a|0;b=b|0;c=c|0;ga(0);return 0}function Np(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;ga(1)}function Op(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ga(2)}function Pp(a){a=a|0;ga(3)}function Qp(a,b){a=a|0;b=b|0;ga(4)}function Rp(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;ga(5)}function Sp(a){a=a|0;ga(6);return 0}function Tp(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=+g;ga(7)}function Up(a,b,c){a=a|0;b=b|0;c=c|0;ga(8)}function Vp(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=+f;ga(9)}function Wp(){ga(10)}function Xp(){Nb()}function Yp(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;ga(11);return 0}function Zp(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ga(12);return 0}function _p(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;ga(13)}function $p(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ga(14)}function aq(a,b){a=a|0;b=b|0;ga(15);return 0}function bq(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ga(16);return 0}function cq(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ga(17)}




// EMSCRIPTEN_END_FUNCS
var ic=[Mp,ah,fh,rf,jh,Og,Tg,Ff,Xg,dg,eg,Rh,Wh,yl,Dl,im,km,nm,Vl,_l,am,dm,ro,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp,Mp];var jc=[Np,Zh,$h,bi,di,fi,hi,ji,li,ni,pi,ri,wi,yi,Ai,Ci,Ei,Gi,Ii,Ki,Mi,Oi,Qi,dj,fj,rj,tj,Cj,Dj,Ej,Fj,Gj,Pj,Qj,Rj,Sj,Tj,pl,vl,Np,Np,Np,Np,Np,Np,Np,Np,Np,Np,Np,Np,Np,Np,Np,Np,Np,Np,Np,Np,Np,Np,Np,Np,Np];var kc=[Op,yo,xo,wo];var lc=[Pp,jd,Ad,we,xe,We,bf,nf,of,uf,vf,Bf,Cf,If,Jf,Vf,Uf,_f,Zf,ag,jg,ig,Mg,Lg,_g,Zg,mh,lh,oh,nh,rh,qh,th,sh,wh,vh,yh,xh,Bh,Ah,Dh,Ch,Jh,Ih,Ig,Kh,Hh,Lh,Nh,Mh,Sl,Th,Sh,Yh,Xh,vi,ui,Zi,Yi,mj,lj,Aj,zj,Nj,Mj,Zj,Yj,ak,$j,ek,dk,pk,ok,Ak,zk,Lk,Kk,Wk,Vk,el,dl,ll,kl,rl,ql,xl,wl,Cl,Bl,Ll,Kl,gm,fm,Gl,xm,cn,bn,en,dn,Oh,Rl,Ul,pm,Fm,Qm,$m,an,jo,io,lo,oo,mo,no,po,qo,Mo,Lo,mf,Tl,Nn,Yk,Do,Un,Tn,Sn,Rn,Qn,Pn,pg,Ag,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp,Pp];var mc=[Qp,pf,wf,Df,Kf,Ng,$g,hk,ik,jk,kk,mk,nk,sk,tk,uk,vk,xk,yk,Dk,Ek,Fk,Gk,Ik,Jk,Ok,Pk,Qk,Rk,Tk,Uk,Al,Fl,kn,mn,on,ln,nn,pn,Qp,Qp,Qp,Qp,Qp,Qp,Qp,Qp,Qp,Qp,Qp,Qp,Qp,Qp,Qp,Qp,Qp,Qp,Qp,Qp,Qp,Qp,Qp,Qp,Qp];var nc=[Rp,Hj,Uj,Rp];var oc=[Sp,qf,eh,gh,hh,dh,xf,yf,Ef,Sg,Ug,Vg,Rg,Lf,Mf,Wf,$f,Fh,Bj,qn,sn,un,An,Cn,wn,yn,Oj,rn,tn,vn,Bn,Dn,xn,zn,fk,gk,lk,qk,rk,wk,Bk,Ck,Hk,Mk,Nk,Sk,Bm,Cm,Em,fn,hn,gn,jn,tm,um,wm,Lm,Mm,Pm,Wm,Xm,_m,ko,No];var pc=[Tp,ml,sl,Tp];var qc=[Up,cg,Gh,Up];var rc=[Vp,gj,jj,uj,wj,Vp,Vp,Vp];var sc=[Wp,Xp];var tc=[Yp,ym,zm,qm,rm,Gm,Im,Rm,Tm,Yp,Yp,Yp,Yp,Yp,Yp,Yp];var uc=[Zp,mm,Wl,Xl,Yl,cm,Zp,Zp];var vc=[_p,_j,bk,Xk,$k,fl,hl,_p];var wc=[$p,bh,Pg,_i,$i,ej,kj,nj,oj,sj,xj,zl,El,Bo,Ao,zo];var xc=[aq,gd,cf,ih,sf,zf,kh,Wg,Gf,Nf,Yg,hm,jm,lm,Zl,$l,bm,aq,aq,aq,aq,aq,aq,aq,aq,aq,aq,aq,aq,aq,aq,aq];var yc=[bq,Ph,Uh,om,Am,Dm,em,sm,vm,Km,Nm,Vm,Ym,bq,bq,bq];var zc=[cq,ch,Qg,Qh,Vh,so,to,uo];return{_getVisitedNodes:Yc,_i64Subtract:ap,_free:Do,_rand_r:_o,_realloc:Eo,_i64Add:bp,_memmove:ep,_tolower:gp,_strlen:cp,_memset:fp,_hm5move:Xc,_malloc:Co,_memcpy:dp,_rand:$o,_strcpy:ip,_bitshift64Shl:hp,__GLOBAL__I_a:$c,__GLOBAL__I_a17:Be,__GLOBAL__I_a44:ef,__GLOBAL__I_a60:kf,__GLOBAL__I_a35:Pf,runPostSets:Zo,stackAlloc:Ac,stackSave:Bc,stackRestore:Cc,setThrew:Dc,setTempRet0:Gc,setTempRet1:Hc,setTempRet2:Ic,setTempRet3:Jc,setTempRet4:Kc,setTempRet5:Lc,setTempRet6:Mc,setTempRet7:Nc,setTempRet8:Oc,setTempRet9:Pc,dynCall_iiii:up,dynCall_viiiiiii:vp,dynCall_viiiii:wp,dynCall_vi:xp,dynCall_vii:yp,dynCall_viiiiiiiii:zp,dynCall_ii:Ap,dynCall_viiiiiid:Bp,dynCall_viii:Cp,dynCall_viiiiid:Dp,dynCall_v:Ep,dynCall_iiiiiiiii:Fp,dynCall_iiiii:Gp,dynCall_viiiiiiii:Hp,dynCall_viiiiii:Ip,dynCall_iii:Jp,dynCall_iiiiii:Kp,dynCall_viiii:Lp}})


// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "invoke_iiii": invoke_iiii, "invoke_viiiiiii": invoke_viiiiiii, "invoke_viiiii": invoke_viiiii, "invoke_vi": invoke_vi, "invoke_vii": invoke_vii, "invoke_viiiiiiiii": invoke_viiiiiiiii, "invoke_ii": invoke_ii, "invoke_viiiiiid": invoke_viiiiiid, "invoke_viii": invoke_viii, "invoke_viiiiid": invoke_viiiiid, "invoke_v": invoke_v, "invoke_iiiiiiiii": invoke_iiiiiiiii, "invoke_iiiii": invoke_iiiii, "invoke_viiiiiiii": invoke_viiiiiiii, "invoke_viiiiii": invoke_viiiiii, "invoke_iii": invoke_iii, "invoke_iiiiii": invoke_iiiiii, "invoke_viiii": invoke_viiii, "_fabs": _fabs, "_vsscanf": _vsscanf, "__ZSt9terminatev": __ZSt9terminatev, "___cxa_guard_acquire": ___cxa_guard_acquire, "_sscanf": _sscanf, "___assert_fail": ___assert_fail, "__ZSt18uncaught_exceptionv": __ZSt18uncaught_exceptionv, "___ctype_toupper_loc": ___ctype_toupper_loc, "__addDays": __addDays, "_sbrk": _sbrk, "___cxa_begin_catch": ___cxa_begin_catch, "_emscripten_memcpy_big": _emscripten_memcpy_big, "_sysconf": _sysconf, "_clock": _clock, "_fileno": _fileno, "_fread": _fread, "_write": _write, "__isLeapYear": __isLeapYear, "__ZNSt9exceptionD2Ev": __ZNSt9exceptionD2Ev, "___cxa_does_inherit": ___cxa_does_inherit, "__exit": __exit, "_catclose": _catclose, "_send": _send, "___cxa_is_number_type": ___cxa_is_number_type, "___cxa_find_matching_catch": ___cxa_find_matching_catch, "_isxdigit_l": _isxdigit_l, "___cxa_guard_release": ___cxa_guard_release, "_strerror_r": _strerror_r, "___setErrNo": ___setErrNo, "_newlocale": _newlocale, "_isdigit_l": _isdigit_l, "___resumeException": ___resumeException, "_freelocale": _freelocale, "_printf": _printf, "_sprintf": _sprintf, "_vasprintf": _vasprintf, "_vsnprintf": _vsnprintf, "_strtoull_l": _strtoull_l, "_read": _read, "_fwrite": _fwrite, "_time": _time, "_fprintf": _fprintf, "_catopen": _catopen, "_exit": _exit, "___ctype_b_loc": ___ctype_b_loc, "_fmod": _fmod, "___cxa_allocate_exception": ___cxa_allocate_exception, "_floor": _floor, "_strtoll": _strtoll, "_pwrite": _pwrite, "_uselocale": _uselocale, "_snprintf": _snprintf, "__scanString": __scanString, "_strtoull": _strtoull, "_strftime": _strftime, "_isxdigit": _isxdigit, "_pthread_cond_broadcast": _pthread_cond_broadcast, "_recv": _recv, "_fgetc": _fgetc, "__parseInt64": __parseInt64, "__getFloat": __getFloat, "_abort": _abort, "_ceil": _ceil, "_isspace": _isspace, "___cxa_pure_virtual": ___cxa_pure_virtual, "_pthread_cond_wait": _pthread_cond_wait, "_ungetc": _ungetc, "_fflush": _fflush, "_strftime_l": _strftime_l, "_pthread_mutex_lock": _pthread_mutex_lock, "__reallyNegative": __reallyNegative, "_catgets": _catgets, "_asprintf": _asprintf, "_strtoll_l": _strtoll_l, "__arraySum": __arraySum, "___ctype_tolower_loc": ___ctype_tolower_loc, "_pthread_mutex_unlock": _pthread_mutex_unlock, "_pread": _pread, "_mkport": _mkport, "___errno_location": ___errno_location, "_copysign": _copysign, "___cxa_throw": ___cxa_throw, "_isdigit": _isdigit, "_strerror": _strerror, "__formatString": __formatString, "_atexit": _atexit, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "cttz_i8": cttz_i8, "ctlz_i8": ctlz_i8, "___rand_seed": ___rand_seed, "NaN": NaN, "Infinity": Infinity, "__ZTISt9exception": __ZTISt9exception, "___dso_handle": ___dso_handle, "_stderr": _stderr, "_stdin": _stdin, "_stdout": _stdout }, buffer);
var _getVisitedNodes = Module["_getVisitedNodes"] = asm["_getVisitedNodes"];
var _i64Subtract = Module["_i64Subtract"] = asm["_i64Subtract"];
var _free = Module["_free"] = asm["_free"];
var _rand_r = Module["_rand_r"] = asm["_rand_r"];
var _realloc = Module["_realloc"] = asm["_realloc"];
var _i64Add = Module["_i64Add"] = asm["_i64Add"];
var _memmove = Module["_memmove"] = asm["_memmove"];
var _tolower = Module["_tolower"] = asm["_tolower"];
var _strlen = Module["_strlen"] = asm["_strlen"];
var _memset = Module["_memset"] = asm["_memset"];
var _hm5move = Module["_hm5move"] = asm["_hm5move"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _rand = Module["_rand"] = asm["_rand"];
var _strcpy = Module["_strcpy"] = asm["_strcpy"];
var _bitshift64Shl = Module["_bitshift64Shl"] = asm["_bitshift64Shl"];
var __GLOBAL__I_a = Module["__GLOBAL__I_a"] = asm["__GLOBAL__I_a"];
var __GLOBAL__I_a17 = Module["__GLOBAL__I_a17"] = asm["__GLOBAL__I_a17"];
var __GLOBAL__I_a44 = Module["__GLOBAL__I_a44"] = asm["__GLOBAL__I_a44"];
var __GLOBAL__I_a60 = Module["__GLOBAL__I_a60"] = asm["__GLOBAL__I_a60"];
var __GLOBAL__I_a35 = Module["__GLOBAL__I_a35"] = asm["__GLOBAL__I_a35"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
var dynCall_viiiiiii = Module["dynCall_viiiiiii"] = asm["dynCall_viiiiiii"];
var dynCall_viiiii = Module["dynCall_viiiii"] = asm["dynCall_viiiii"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_vii = Module["dynCall_vii"] = asm["dynCall_vii"];
var dynCall_viiiiiiiii = Module["dynCall_viiiiiiiii"] = asm["dynCall_viiiiiiiii"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_viiiiiid = Module["dynCall_viiiiiid"] = asm["dynCall_viiiiiid"];
var dynCall_viii = Module["dynCall_viii"] = asm["dynCall_viii"];
var dynCall_viiiiid = Module["dynCall_viiiiid"] = asm["dynCall_viiiiid"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_iiiiiiiii = Module["dynCall_iiiiiiiii"] = asm["dynCall_iiiiiiiii"];
var dynCall_iiiii = Module["dynCall_iiiii"] = asm["dynCall_iiiii"];
var dynCall_viiiiiiii = Module["dynCall_viiiiiiii"] = asm["dynCall_viiiiiiii"];
var dynCall_viiiiii = Module["dynCall_viiiiii"] = asm["dynCall_viiiiii"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_iiiiii = Module["dynCall_iiiiii"] = asm["dynCall_iiiiii"];
var dynCall_viiii = Module["dynCall_viiii"] = asm["dynCall_viiii"];

Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };


// TODO: strip out parts of this we do not need

//======= begin closure i64 code =======

// Copyright 2009 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Defines a Long class for representing a 64-bit two's-complement
 * integer value, which faithfully simulates the behavior of a Java "long". This
 * implementation is derived from LongLib in GWT.
 *
 */

var i64Math = (function() { // Emscripten wrapper
  var goog = { math: {} };


  /**
   * Constructs a 64-bit two's-complement integer, given its low and high 32-bit
   * values as *signed* integers.  See the from* functions below for more
   * convenient ways of constructing Longs.
   *
   * The internal representation of a long is the two given signed, 32-bit values.
   * We use 32-bit pieces because these are the size of integers on which
   * Javascript performs bit-operations.  For operations like addition and
   * multiplication, we split each number into 16-bit pieces, which can easily be
   * multiplied within Javascript's floating-point representation without overflow
   * or change in sign.
   *
   * In the algorithms below, we frequently reduce the negative case to the
   * positive case by negating the input(s) and then post-processing the result.
   * Note that we must ALWAYS check specially whether those values are MIN_VALUE
   * (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
   * a positive number, it overflows back into a negative).  Not handling this
   * case would often result in infinite recursion.
   *
   * @param {number} low  The low (signed) 32 bits of the long.
   * @param {number} high  The high (signed) 32 bits of the long.
   * @constructor
   */
  goog.math.Long = function(low, high) {
    /**
     * @type {number}
     * @private
     */
    this.low_ = low | 0;  // force into 32 signed bits.

    /**
     * @type {number}
     * @private
     */
    this.high_ = high | 0;  // force into 32 signed bits.
  };


  // NOTE: Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the
  // from* methods on which they depend.


  /**
   * A cache of the Long representations of small integer values.
   * @type {!Object}
   * @private
   */
  goog.math.Long.IntCache_ = {};


  /**
   * Returns a Long representing the given (32-bit) integer value.
   * @param {number} value The 32-bit integer in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromInt = function(value) {
    if (-128 <= value && value < 128) {
      var cachedObj = goog.math.Long.IntCache_[value];
      if (cachedObj) {
        return cachedObj;
      }
    }

    var obj = new goog.math.Long(value | 0, value < 0 ? -1 : 0);
    if (-128 <= value && value < 128) {
      goog.math.Long.IntCache_[value] = obj;
    }
    return obj;
  };


  /**
   * Returns a Long representing the given value, provided that it is a finite
   * number.  Otherwise, zero is returned.
   * @param {number} value The number in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromNumber = function(value) {
    if (isNaN(value) || !isFinite(value)) {
      return goog.math.Long.ZERO;
    } else if (value <= -goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MIN_VALUE;
    } else if (value + 1 >= goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MAX_VALUE;
    } else if (value < 0) {
      return goog.math.Long.fromNumber(-value).negate();
    } else {
      return new goog.math.Long(
          (value % goog.math.Long.TWO_PWR_32_DBL_) | 0,
          (value / goog.math.Long.TWO_PWR_32_DBL_) | 0);
    }
  };


  /**
   * Returns a Long representing the 64-bit integer that comes by concatenating
   * the given high and low bits.  Each is assumed to use 32 bits.
   * @param {number} lowBits The low 32-bits.
   * @param {number} highBits The high 32-bits.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromBits = function(lowBits, highBits) {
    return new goog.math.Long(lowBits, highBits);
  };


  /**
   * Returns a Long representation of the given string, written using the given
   * radix.
   * @param {string} str The textual representation of the Long.
   * @param {number=} opt_radix The radix in which the text is written.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromString = function(str, opt_radix) {
    if (str.length == 0) {
      throw Error('number format error: empty string');
    }

    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }

    if (str.charAt(0) == '-') {
      return goog.math.Long.fromString(str.substring(1), radix).negate();
    } else if (str.indexOf('-') >= 0) {
      throw Error('number format error: interior "-" character: ' + str);
    }

    // Do several (8) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 8));

    var result = goog.math.Long.ZERO;
    for (var i = 0; i < str.length; i += 8) {
      var size = Math.min(8, str.length - i);
      var value = parseInt(str.substring(i, i + size), radix);
      if (size < 8) {
        var power = goog.math.Long.fromNumber(Math.pow(radix, size));
        result = result.multiply(power).add(goog.math.Long.fromNumber(value));
      } else {
        result = result.multiply(radixToPower);
        result = result.add(goog.math.Long.fromNumber(value));
      }
    }
    return result;
  };


  // NOTE: the compiler should inline these constant values below and then remove
  // these variables, so there should be no runtime penalty for these.


  /**
   * Number used repeated below in calculations.  This must appear before the
   * first call to any from* function below.
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_16_DBL_ = 1 << 16;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_24_DBL_ = 1 << 24;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_32_DBL_ =
      goog.math.Long.TWO_PWR_16_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_31_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ / 2;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_48_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_64_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_32_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_63_DBL_ =
      goog.math.Long.TWO_PWR_64_DBL_ / 2;


  /** @type {!goog.math.Long} */
  goog.math.Long.ZERO = goog.math.Long.fromInt(0);


  /** @type {!goog.math.Long} */
  goog.math.Long.ONE = goog.math.Long.fromInt(1);


  /** @type {!goog.math.Long} */
  goog.math.Long.NEG_ONE = goog.math.Long.fromInt(-1);


  /** @type {!goog.math.Long} */
  goog.math.Long.MAX_VALUE =
      goog.math.Long.fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0);


  /** @type {!goog.math.Long} */
  goog.math.Long.MIN_VALUE = goog.math.Long.fromBits(0, 0x80000000 | 0);


  /**
   * @type {!goog.math.Long}
   * @private
   */
  goog.math.Long.TWO_PWR_24_ = goog.math.Long.fromInt(1 << 24);


  /** @return {number} The value, assuming it is a 32-bit integer. */
  goog.math.Long.prototype.toInt = function() {
    return this.low_;
  };


  /** @return {number} The closest floating-point representation to this value. */
  goog.math.Long.prototype.toNumber = function() {
    return this.high_ * goog.math.Long.TWO_PWR_32_DBL_ +
           this.getLowBitsUnsigned();
  };


  /**
   * @param {number=} opt_radix The radix in which the text should be written.
   * @return {string} The textual representation of this value.
   */
  goog.math.Long.prototype.toString = function(opt_radix) {
    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }

    if (this.isZero()) {
      return '0';
    }

    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        // We need to change the Long value before it can be negated, so we remove
        // the bottom-most digit in this base and then recurse to do the rest.
        var radixLong = goog.math.Long.fromNumber(radix);
        var div = this.div(radixLong);
        var rem = div.multiply(radixLong).subtract(this);
        return div.toString(radix) + rem.toInt().toString(radix);
      } else {
        return '-' + this.negate().toString(radix);
      }
    }

    // Do several (6) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 6));

    var rem = this;
    var result = '';
    while (true) {
      var remDiv = rem.div(radixToPower);
      var intval = rem.subtract(remDiv.multiply(radixToPower)).toInt();
      var digits = intval.toString(radix);

      rem = remDiv;
      if (rem.isZero()) {
        return digits + result;
      } else {
        while (digits.length < 6) {
          digits = '0' + digits;
        }
        result = '' + digits + result;
      }
    }
  };


  /** @return {number} The high 32-bits as a signed value. */
  goog.math.Long.prototype.getHighBits = function() {
    return this.high_;
  };


  /** @return {number} The low 32-bits as a signed value. */
  goog.math.Long.prototype.getLowBits = function() {
    return this.low_;
  };


  /** @return {number} The low 32-bits as an unsigned value. */
  goog.math.Long.prototype.getLowBitsUnsigned = function() {
    return (this.low_ >= 0) ?
        this.low_ : goog.math.Long.TWO_PWR_32_DBL_ + this.low_;
  };


  /**
   * @return {number} Returns the number of bits needed to represent the absolute
   *     value of this Long.
   */
  goog.math.Long.prototype.getNumBitsAbs = function() {
    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        return 64;
      } else {
        return this.negate().getNumBitsAbs();
      }
    } else {
      var val = this.high_ != 0 ? this.high_ : this.low_;
      for (var bit = 31; bit > 0; bit--) {
        if ((val & (1 << bit)) != 0) {
          break;
        }
      }
      return this.high_ != 0 ? bit + 33 : bit + 1;
    }
  };


  /** @return {boolean} Whether this value is zero. */
  goog.math.Long.prototype.isZero = function() {
    return this.high_ == 0 && this.low_ == 0;
  };


  /** @return {boolean} Whether this value is negative. */
  goog.math.Long.prototype.isNegative = function() {
    return this.high_ < 0;
  };


  /** @return {boolean} Whether this value is odd. */
  goog.math.Long.prototype.isOdd = function() {
    return (this.low_ & 1) == 1;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long equals the other.
   */
  goog.math.Long.prototype.equals = function(other) {
    return (this.high_ == other.high_) && (this.low_ == other.low_);
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long does not equal the other.
   */
  goog.math.Long.prototype.notEquals = function(other) {
    return (this.high_ != other.high_) || (this.low_ != other.low_);
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than the other.
   */
  goog.math.Long.prototype.lessThan = function(other) {
    return this.compare(other) < 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than or equal to the other.
   */
  goog.math.Long.prototype.lessThanOrEqual = function(other) {
    return this.compare(other) <= 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than the other.
   */
  goog.math.Long.prototype.greaterThan = function(other) {
    return this.compare(other) > 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than or equal to the other.
   */
  goog.math.Long.prototype.greaterThanOrEqual = function(other) {
    return this.compare(other) >= 0;
  };


  /**
   * Compares this Long with the given one.
   * @param {goog.math.Long} other Long to compare against.
   * @return {number} 0 if they are the same, 1 if the this is greater, and -1
   *     if the given one is greater.
   */
  goog.math.Long.prototype.compare = function(other) {
    if (this.equals(other)) {
      return 0;
    }

    var thisNeg = this.isNegative();
    var otherNeg = other.isNegative();
    if (thisNeg && !otherNeg) {
      return -1;
    }
    if (!thisNeg && otherNeg) {
      return 1;
    }

    // at this point, the signs are the same, so subtraction will not overflow
    if (this.subtract(other).isNegative()) {
      return -1;
    } else {
      return 1;
    }
  };


  /** @return {!goog.math.Long} The negation of this value. */
  goog.math.Long.prototype.negate = function() {
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.MIN_VALUE;
    } else {
      return this.not().add(goog.math.Long.ONE);
    }
  };


  /**
   * Returns the sum of this and the given Long.
   * @param {goog.math.Long} other Long to add to this one.
   * @return {!goog.math.Long} The sum of this and the given Long.
   */
  goog.math.Long.prototype.add = function(other) {
    // Divide each number into 4 chunks of 16 bits, and then sum the chunks.

    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;

    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;

    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 + b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 + b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 + b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 + b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };


  /**
   * Returns the difference of this and the given Long.
   * @param {goog.math.Long} other Long to subtract from this.
   * @return {!goog.math.Long} The difference of this and the given Long.
   */
  goog.math.Long.prototype.subtract = function(other) {
    return this.add(other.negate());
  };


  /**
   * Returns the product of this and the given long.
   * @param {goog.math.Long} other Long to multiply with this.
   * @return {!goog.math.Long} The product of this and the other.
   */
  goog.math.Long.prototype.multiply = function(other) {
    if (this.isZero()) {
      return goog.math.Long.ZERO;
    } else if (other.isZero()) {
      return goog.math.Long.ZERO;
    }

    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return other.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return this.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    }

    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().multiply(other.negate());
      } else {
        return this.negate().multiply(other).negate();
      }
    } else if (other.isNegative()) {
      return this.multiply(other.negate()).negate();
    }

    // If both longs are small, use float multiplication
    if (this.lessThan(goog.math.Long.TWO_PWR_24_) &&
        other.lessThan(goog.math.Long.TWO_PWR_24_)) {
      return goog.math.Long.fromNumber(this.toNumber() * other.toNumber());
    }

    // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
    // We can skip products that would overflow.

    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;

    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;

    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 * b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 * b00;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c16 += a00 * b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 * b00;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a16 * b16;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a00 * b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };


  /**
   * Returns this Long divided by the given one.
   * @param {goog.math.Long} other Long by which to divide.
   * @return {!goog.math.Long} This Long divided by the given one.
   */
  goog.math.Long.prototype.div = function(other) {
    if (other.isZero()) {
      throw Error('division by zero');
    } else if (this.isZero()) {
      return goog.math.Long.ZERO;
    }

    if (this.equals(goog.math.Long.MIN_VALUE)) {
      if (other.equals(goog.math.Long.ONE) ||
          other.equals(goog.math.Long.NEG_ONE)) {
        return goog.math.Long.MIN_VALUE;  // recall that -MIN_VALUE == MIN_VALUE
      } else if (other.equals(goog.math.Long.MIN_VALUE)) {
        return goog.math.Long.ONE;
      } else {
        // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
        var halfThis = this.shiftRight(1);
        var approx = halfThis.div(other).shiftLeft(1);
        if (approx.equals(goog.math.Long.ZERO)) {
          return other.isNegative() ? goog.math.Long.ONE : goog.math.Long.NEG_ONE;
        } else {
          var rem = this.subtract(other.multiply(approx));
          var result = approx.add(rem.div(other));
          return result;
        }
      }
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.ZERO;
    }

    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().div(other.negate());
      } else {
        return this.negate().div(other).negate();
      }
    } else if (other.isNegative()) {
      return this.div(other.negate()).negate();
    }

    // Repeat the following until the remainder is less than other:  find a
    // floating-point that approximates remainder / other *from below*, add this
    // into the result, and subtract it from the remainder.  It is critical that
    // the approximate value is less than or equal to the real value so that the
    // remainder never becomes negative.
    var res = goog.math.Long.ZERO;
    var rem = this;
    while (rem.greaterThanOrEqual(other)) {
      // Approximate the result of division. This may be a little greater or
      // smaller than the actual value.
      var approx = Math.max(1, Math.floor(rem.toNumber() / other.toNumber()));

      // We will tweak the approximate result by changing it in the 48-th digit or
      // the smallest non-fractional digit, whichever is larger.
      var log2 = Math.ceil(Math.log(approx) / Math.LN2);
      var delta = (log2 <= 48) ? 1 : Math.pow(2, log2 - 48);

      // Decrease the approximation until it is smaller than the remainder.  Note
      // that if it is too large, the product overflows and is negative.
      var approxRes = goog.math.Long.fromNumber(approx);
      var approxRem = approxRes.multiply(other);
      while (approxRem.isNegative() || approxRem.greaterThan(rem)) {
        approx -= delta;
        approxRes = goog.math.Long.fromNumber(approx);
        approxRem = approxRes.multiply(other);
      }

      // We know the answer can't be zero... and actually, zero would cause
      // infinite recursion since we would make no progress.
      if (approxRes.isZero()) {
        approxRes = goog.math.Long.ONE;
      }

      res = res.add(approxRes);
      rem = rem.subtract(approxRem);
    }
    return res;
  };


  /**
   * Returns this Long modulo the given one.
   * @param {goog.math.Long} other Long by which to mod.
   * @return {!goog.math.Long} This Long modulo the given one.
   */
  goog.math.Long.prototype.modulo = function(other) {
    return this.subtract(this.div(other).multiply(other));
  };


  /** @return {!goog.math.Long} The bitwise-NOT of this value. */
  goog.math.Long.prototype.not = function() {
    return goog.math.Long.fromBits(~this.low_, ~this.high_);
  };


  /**
   * Returns the bitwise-AND of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to AND.
   * @return {!goog.math.Long} The bitwise-AND of this and the other.
   */
  goog.math.Long.prototype.and = function(other) {
    return goog.math.Long.fromBits(this.low_ & other.low_,
                                   this.high_ & other.high_);
  };


  /**
   * Returns the bitwise-OR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to OR.
   * @return {!goog.math.Long} The bitwise-OR of this and the other.
   */
  goog.math.Long.prototype.or = function(other) {
    return goog.math.Long.fromBits(this.low_ | other.low_,
                                   this.high_ | other.high_);
  };


  /**
   * Returns the bitwise-XOR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to XOR.
   * @return {!goog.math.Long} The bitwise-XOR of this and the other.
   */
  goog.math.Long.prototype.xor = function(other) {
    return goog.math.Long.fromBits(this.low_ ^ other.low_,
                                   this.high_ ^ other.high_);
  };


  /**
   * Returns this Long with bits shifted to the left by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the left by the given amount.
   */
  goog.math.Long.prototype.shiftLeft = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var low = this.low_;
      if (numBits < 32) {
        var high = this.high_;
        return goog.math.Long.fromBits(
            low << numBits,
            (high << numBits) | (low >>> (32 - numBits)));
      } else {
        return goog.math.Long.fromBits(0, low << (numBits - 32));
      }
    }
  };


  /**
   * Returns this Long with bits shifted to the right by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount.
   */
  goog.math.Long.prototype.shiftRight = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >> numBits);
      } else {
        return goog.math.Long.fromBits(
            high >> (numBits - 32),
            high >= 0 ? 0 : -1);
      }
    }
  };


  /**
   * Returns this Long with bits shifted to the right by the given amount, with
   * the new top bits matching the current sign bit.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount, with
   *     zeros placed into the new leading bits.
   */
  goog.math.Long.prototype.shiftRightUnsigned = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >>> numBits);
      } else if (numBits == 32) {
        return goog.math.Long.fromBits(high, 0);
      } else {
        return goog.math.Long.fromBits(high >>> (numBits - 32), 0);
      }
    }
  };

  //======= begin jsbn =======

  var navigator = { appName: 'Modern Browser' }; // polyfill a little

  // Copyright (c) 2005  Tom Wu
  // All Rights Reserved.
  // http://www-cs-students.stanford.edu/~tjw/jsbn/

  /*
   * Copyright (c) 2003-2005  Tom Wu
   * All Rights Reserved.
   *
   * Permission is hereby granted, free of charge, to any person obtaining
   * a copy of this software and associated documentation files (the
   * "Software"), to deal in the Software without restriction, including
   * without limitation the rights to use, copy, modify, merge, publish,
   * distribute, sublicense, and/or sell copies of the Software, and to
   * permit persons to whom the Software is furnished to do so, subject to
   * the following conditions:
   *
   * The above copyright notice and this permission notice shall be
   * included in all copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS-IS" AND WITHOUT WARRANTY OF ANY KIND, 
   * EXPRESS, IMPLIED OR OTHERWISE, INCLUDING WITHOUT LIMITATION, ANY 
   * WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.  
   *
   * IN NO EVENT SHALL TOM WU BE LIABLE FOR ANY SPECIAL, INCIDENTAL,
   * INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND, OR ANY DAMAGES WHATSOEVER
   * RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER OR NOT ADVISED OF
   * THE POSSIBILITY OF DAMAGE, AND ON ANY THEORY OF LIABILITY, ARISING OUT
   * OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   * In addition, the following condition applies:
   *
   * All redistributions must retain an intact copy of this copyright notice
   * and disclaimer.
   */

  // Basic JavaScript BN library - subset useful for RSA encryption.

  // Bits per digit
  var dbits;

  // JavaScript engine analysis
  var canary = 0xdeadbeefcafe;
  var j_lm = ((canary&0xffffff)==0xefcafe);

  // (public) Constructor
  function BigInteger(a,b,c) {
    if(a != null)
      if("number" == typeof a) this.fromNumber(a,b,c);
      else if(b == null && "string" != typeof a) this.fromString(a,256);
      else this.fromString(a,b);
  }

  // return new, unset BigInteger
  function nbi() { return new BigInteger(null); }

  // am: Compute w_j += (x*this_i), propagate carries,
  // c is initial carry, returns final carry.
  // c < 3*dvalue, x < 2*dvalue, this_i < dvalue
  // We need to select the fastest one that works in this environment.

  // am1: use a single mult and divide to get the high bits,
  // max digit bits should be 26 because
  // max internal value = 2*dvalue^2-2*dvalue (< 2^53)
  function am1(i,x,w,j,c,n) {
    while(--n >= 0) {
      var v = x*this[i++]+w[j]+c;
      c = Math.floor(v/0x4000000);
      w[j++] = v&0x3ffffff;
    }
    return c;
  }
  // am2 avoids a big mult-and-extract completely.
  // Max digit bits should be <= 30 because we do bitwise ops
  // on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
  function am2(i,x,w,j,c,n) {
    var xl = x&0x7fff, xh = x>>15;
    while(--n >= 0) {
      var l = this[i]&0x7fff;
      var h = this[i++]>>15;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x7fff)<<15)+w[j]+(c&0x3fffffff);
      c = (l>>>30)+(m>>>15)+xh*h+(c>>>30);
      w[j++] = l&0x3fffffff;
    }
    return c;
  }
  // Alternately, set max digit bits to 28 since some
  // browsers slow down when dealing with 32-bit numbers.
  function am3(i,x,w,j,c,n) {
    var xl = x&0x3fff, xh = x>>14;
    while(--n >= 0) {
      var l = this[i]&0x3fff;
      var h = this[i++]>>14;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x3fff)<<14)+w[j]+c;
      c = (l>>28)+(m>>14)+xh*h;
      w[j++] = l&0xfffffff;
    }
    return c;
  }
  if(j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
    BigInteger.prototype.am = am2;
    dbits = 30;
  }
  else if(j_lm && (navigator.appName != "Netscape")) {
    BigInteger.prototype.am = am1;
    dbits = 26;
  }
  else { // Mozilla/Netscape seems to prefer am3
    BigInteger.prototype.am = am3;
    dbits = 28;
  }

  BigInteger.prototype.DB = dbits;
  BigInteger.prototype.DM = ((1<<dbits)-1);
  BigInteger.prototype.DV = (1<<dbits);

  var BI_FP = 52;
  BigInteger.prototype.FV = Math.pow(2,BI_FP);
  BigInteger.prototype.F1 = BI_FP-dbits;
  BigInteger.prototype.F2 = 2*dbits-BI_FP;

  // Digit conversions
  var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
  var BI_RC = new Array();
  var rr,vv;
  rr = "0".charCodeAt(0);
  for(vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
  rr = "a".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
  rr = "A".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

  function int2char(n) { return BI_RM.charAt(n); }
  function intAt(s,i) {
    var c = BI_RC[s.charCodeAt(i)];
    return (c==null)?-1:c;
  }

  // (protected) copy this to r
  function bnpCopyTo(r) {
    for(var i = this.t-1; i >= 0; --i) r[i] = this[i];
    r.t = this.t;
    r.s = this.s;
  }

  // (protected) set from integer value x, -DV <= x < DV
  function bnpFromInt(x) {
    this.t = 1;
    this.s = (x<0)?-1:0;
    if(x > 0) this[0] = x;
    else if(x < -1) this[0] = x+DV;
    else this.t = 0;
  }

  // return bigint initialized to value
  function nbv(i) { var r = nbi(); r.fromInt(i); return r; }

  // (protected) set from string and radix
  function bnpFromString(s,b) {
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 256) k = 8; // byte array
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else { this.fromRadix(s,b); return; }
    this.t = 0;
    this.s = 0;
    var i = s.length, mi = false, sh = 0;
    while(--i >= 0) {
      var x = (k==8)?s[i]&0xff:intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-") mi = true;
        continue;
      }
      mi = false;
      if(sh == 0)
        this[this.t++] = x;
      else if(sh+k > this.DB) {
        this[this.t-1] |= (x&((1<<(this.DB-sh))-1))<<sh;
        this[this.t++] = (x>>(this.DB-sh));
      }
      else
        this[this.t-1] |= x<<sh;
      sh += k;
      if(sh >= this.DB) sh -= this.DB;
    }
    if(k == 8 && (s[0]&0x80) != 0) {
      this.s = -1;
      if(sh > 0) this[this.t-1] |= ((1<<(this.DB-sh))-1)<<sh;
    }
    this.clamp();
    if(mi) BigInteger.ZERO.subTo(this,this);
  }

  // (protected) clamp off excess high words
  function bnpClamp() {
    var c = this.s&this.DM;
    while(this.t > 0 && this[this.t-1] == c) --this.t;
  }

  // (public) return string representation in given radix
  function bnToString(b) {
    if(this.s < 0) return "-"+this.negate().toString(b);
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else return this.toRadix(b);
    var km = (1<<k)-1, d, m = false, r = "", i = this.t;
    var p = this.DB-(i*this.DB)%k;
    if(i-- > 0) {
      if(p < this.DB && (d = this[i]>>p) > 0) { m = true; r = int2char(d); }
      while(i >= 0) {
        if(p < k) {
          d = (this[i]&((1<<p)-1))<<(k-p);
          d |= this[--i]>>(p+=this.DB-k);
        }
        else {
          d = (this[i]>>(p-=k))&km;
          if(p <= 0) { p += this.DB; --i; }
        }
        if(d > 0) m = true;
        if(m) r += int2char(d);
      }
    }
    return m?r:"0";
  }

  // (public) -this
  function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this,r); return r; }

  // (public) |this|
  function bnAbs() { return (this.s<0)?this.negate():this; }

  // (public) return + if this > a, - if this < a, 0 if equal
  function bnCompareTo(a) {
    var r = this.s-a.s;
    if(r != 0) return r;
    var i = this.t;
    r = i-a.t;
    if(r != 0) return (this.s<0)?-r:r;
    while(--i >= 0) if((r=this[i]-a[i]) != 0) return r;
    return 0;
  }

  // returns bit length of the integer x
  function nbits(x) {
    var r = 1, t;
    if((t=x>>>16) != 0) { x = t; r += 16; }
    if((t=x>>8) != 0) { x = t; r += 8; }
    if((t=x>>4) != 0) { x = t; r += 4; }
    if((t=x>>2) != 0) { x = t; r += 2; }
    if((t=x>>1) != 0) { x = t; r += 1; }
    return r;
  }

  // (public) return the number of bits in "this"
  function bnBitLength() {
    if(this.t <= 0) return 0;
    return this.DB*(this.t-1)+nbits(this[this.t-1]^(this.s&this.DM));
  }

  // (protected) r = this << n*DB
  function bnpDLShiftTo(n,r) {
    var i;
    for(i = this.t-1; i >= 0; --i) r[i+n] = this[i];
    for(i = n-1; i >= 0; --i) r[i] = 0;
    r.t = this.t+n;
    r.s = this.s;
  }

  // (protected) r = this >> n*DB
  function bnpDRShiftTo(n,r) {
    for(var i = n; i < this.t; ++i) r[i-n] = this[i];
    r.t = Math.max(this.t-n,0);
    r.s = this.s;
  }

  // (protected) r = this << n
  function bnpLShiftTo(n,r) {
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<cbs)-1;
    var ds = Math.floor(n/this.DB), c = (this.s<<bs)&this.DM, i;
    for(i = this.t-1; i >= 0; --i) {
      r[i+ds+1] = (this[i]>>cbs)|c;
      c = (this[i]&bm)<<bs;
    }
    for(i = ds-1; i >= 0; --i) r[i] = 0;
    r[ds] = c;
    r.t = this.t+ds+1;
    r.s = this.s;
    r.clamp();
  }

  // (protected) r = this >> n
  function bnpRShiftTo(n,r) {
    r.s = this.s;
    var ds = Math.floor(n/this.DB);
    if(ds >= this.t) { r.t = 0; return; }
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<bs)-1;
    r[0] = this[ds]>>bs;
    for(var i = ds+1; i < this.t; ++i) {
      r[i-ds-1] |= (this[i]&bm)<<cbs;
      r[i-ds] = this[i]>>bs;
    }
    if(bs > 0) r[this.t-ds-1] |= (this.s&bm)<<cbs;
    r.t = this.t-ds;
    r.clamp();
  }

  // (protected) r = this - a
  function bnpSubTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]-a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c -= a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c -= a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c -= a.s;
    }
    r.s = (c<0)?-1:0;
    if(c < -1) r[i++] = this.DV+c;
    else if(c > 0) r[i++] = c;
    r.t = i;
    r.clamp();
  }

  // (protected) r = this * a, r != this,a (HAC 14.12)
  // "this" should be the larger one if appropriate.
  function bnpMultiplyTo(a,r) {
    var x = this.abs(), y = a.abs();
    var i = x.t;
    r.t = i+y.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < y.t; ++i) r[i+x.t] = x.am(0,y[i],r,i,0,x.t);
    r.s = 0;
    r.clamp();
    if(this.s != a.s) BigInteger.ZERO.subTo(r,r);
  }

  // (protected) r = this^2, r != this (HAC 14.16)
  function bnpSquareTo(r) {
    var x = this.abs();
    var i = r.t = 2*x.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < x.t-1; ++i) {
      var c = x.am(i,x[i],r,2*i,0,1);
      if((r[i+x.t]+=x.am(i+1,2*x[i],r,2*i+1,c,x.t-i-1)) >= x.DV) {
        r[i+x.t] -= x.DV;
        r[i+x.t+1] = 1;
      }
    }
    if(r.t > 0) r[r.t-1] += x.am(i,x[i],r,2*i,0,1);
    r.s = 0;
    r.clamp();
  }

  // (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
  // r != q, this != m.  q or r may be null.
  function bnpDivRemTo(m,q,r) {
    var pm = m.abs();
    if(pm.t <= 0) return;
    var pt = this.abs();
    if(pt.t < pm.t) {
      if(q != null) q.fromInt(0);
      if(r != null) this.copyTo(r);
      return;
    }
    if(r == null) r = nbi();
    var y = nbi(), ts = this.s, ms = m.s;
    var nsh = this.DB-nbits(pm[pm.t-1]);	// normalize modulus
    if(nsh > 0) { pm.lShiftTo(nsh,y); pt.lShiftTo(nsh,r); }
    else { pm.copyTo(y); pt.copyTo(r); }
    var ys = y.t;
    var y0 = y[ys-1];
    if(y0 == 0) return;
    var yt = y0*(1<<this.F1)+((ys>1)?y[ys-2]>>this.F2:0);
    var d1 = this.FV/yt, d2 = (1<<this.F1)/yt, e = 1<<this.F2;
    var i = r.t, j = i-ys, t = (q==null)?nbi():q;
    y.dlShiftTo(j,t);
    if(r.compareTo(t) >= 0) {
      r[r.t++] = 1;
      r.subTo(t,r);
    }
    BigInteger.ONE.dlShiftTo(ys,t);
    t.subTo(y,y);	// "negative" y so we can replace sub with am later
    while(y.t < ys) y[y.t++] = 0;
    while(--j >= 0) {
      // Estimate quotient digit
      var qd = (r[--i]==y0)?this.DM:Math.floor(r[i]*d1+(r[i-1]+e)*d2);
      if((r[i]+=y.am(0,qd,r,j,0,ys)) < qd) {	// Try it out
        y.dlShiftTo(j,t);
        r.subTo(t,r);
        while(r[i] < --qd) r.subTo(t,r);
      }
    }
    if(q != null) {
      r.drShiftTo(ys,q);
      if(ts != ms) BigInteger.ZERO.subTo(q,q);
    }
    r.t = ys;
    r.clamp();
    if(nsh > 0) r.rShiftTo(nsh,r);	// Denormalize remainder
    if(ts < 0) BigInteger.ZERO.subTo(r,r);
  }

  // (public) this mod a
  function bnMod(a) {
    var r = nbi();
    this.abs().divRemTo(a,null,r);
    if(this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r,r);
    return r;
  }

  // Modular reduction using "classic" algorithm
  function Classic(m) { this.m = m; }
  function cConvert(x) {
    if(x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
    else return x;
  }
  function cRevert(x) { return x; }
  function cReduce(x) { x.divRemTo(this.m,null,x); }
  function cMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
  function cSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

  Classic.prototype.convert = cConvert;
  Classic.prototype.revert = cRevert;
  Classic.prototype.reduce = cReduce;
  Classic.prototype.mulTo = cMulTo;
  Classic.prototype.sqrTo = cSqrTo;

  // (protected) return "-1/this % 2^DB"; useful for Mont. reduction
  // justification:
  //         xy == 1 (mod m)
  //         xy =  1+km
  //   xy(2-xy) = (1+km)(1-km)
  // x[y(2-xy)] = 1-k^2m^2
  // x[y(2-xy)] == 1 (mod m^2)
  // if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
  // should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
  // JS multiply "overflows" differently from C/C++, so care is needed here.
  function bnpInvDigit() {
    if(this.t < 1) return 0;
    var x = this[0];
    if((x&1) == 0) return 0;
    var y = x&3;		// y == 1/x mod 2^2
    y = (y*(2-(x&0xf)*y))&0xf;	// y == 1/x mod 2^4
    y = (y*(2-(x&0xff)*y))&0xff;	// y == 1/x mod 2^8
    y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff;	// y == 1/x mod 2^16
    // last step - calculate inverse mod DV directly;
    // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
    y = (y*(2-x*y%this.DV))%this.DV;		// y == 1/x mod 2^dbits
    // we really want the negative inverse, and -DV < y < DV
    return (y>0)?this.DV-y:-y;
  }

  // Montgomery reduction
  function Montgomery(m) {
    this.m = m;
    this.mp = m.invDigit();
    this.mpl = this.mp&0x7fff;
    this.mph = this.mp>>15;
    this.um = (1<<(m.DB-15))-1;
    this.mt2 = 2*m.t;
  }

  // xR mod m
  function montConvert(x) {
    var r = nbi();
    x.abs().dlShiftTo(this.m.t,r);
    r.divRemTo(this.m,null,r);
    if(x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r,r);
    return r;
  }

  // x/R mod m
  function montRevert(x) {
    var r = nbi();
    x.copyTo(r);
    this.reduce(r);
    return r;
  }

  // x = x/R mod m (HAC 14.32)
  function montReduce(x) {
    while(x.t <= this.mt2)	// pad x so am has enough room later
      x[x.t++] = 0;
    for(var i = 0; i < this.m.t; ++i) {
      // faster way of calculating u0 = x[i]*mp mod DV
      var j = x[i]&0x7fff;
      var u0 = (j*this.mpl+(((j*this.mph+(x[i]>>15)*this.mpl)&this.um)<<15))&x.DM;
      // use am to combine the multiply-shift-add into one call
      j = i+this.m.t;
      x[j] += this.m.am(0,u0,x,i,0,this.m.t);
      // propagate carry
      while(x[j] >= x.DV) { x[j] -= x.DV; x[++j]++; }
    }
    x.clamp();
    x.drShiftTo(this.m.t,x);
    if(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
  }

  // r = "x^2/R mod m"; x != r
  function montSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

  // r = "xy/R mod m"; x,y != r
  function montMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

  Montgomery.prototype.convert = montConvert;
  Montgomery.prototype.revert = montRevert;
  Montgomery.prototype.reduce = montReduce;
  Montgomery.prototype.mulTo = montMulTo;
  Montgomery.prototype.sqrTo = montSqrTo;

  // (protected) true iff this is even
  function bnpIsEven() { return ((this.t>0)?(this[0]&1):this.s) == 0; }

  // (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
  function bnpExp(e,z) {
    if(e > 0xffffffff || e < 1) return BigInteger.ONE;
    var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e)-1;
    g.copyTo(r);
    while(--i >= 0) {
      z.sqrTo(r,r2);
      if((e&(1<<i)) > 0) z.mulTo(r2,g,r);
      else { var t = r; r = r2; r2 = t; }
    }
    return z.revert(r);
  }

  // (public) this^e % m, 0 <= e < 2^32
  function bnModPowInt(e,m) {
    var z;
    if(e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
    return this.exp(e,z);
  }

  // protected
  BigInteger.prototype.copyTo = bnpCopyTo;
  BigInteger.prototype.fromInt = bnpFromInt;
  BigInteger.prototype.fromString = bnpFromString;
  BigInteger.prototype.clamp = bnpClamp;
  BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
  BigInteger.prototype.drShiftTo = bnpDRShiftTo;
  BigInteger.prototype.lShiftTo = bnpLShiftTo;
  BigInteger.prototype.rShiftTo = bnpRShiftTo;
  BigInteger.prototype.subTo = bnpSubTo;
  BigInteger.prototype.multiplyTo = bnpMultiplyTo;
  BigInteger.prototype.squareTo = bnpSquareTo;
  BigInteger.prototype.divRemTo = bnpDivRemTo;
  BigInteger.prototype.invDigit = bnpInvDigit;
  BigInteger.prototype.isEven = bnpIsEven;
  BigInteger.prototype.exp = bnpExp;

  // public
  BigInteger.prototype.toString = bnToString;
  BigInteger.prototype.negate = bnNegate;
  BigInteger.prototype.abs = bnAbs;
  BigInteger.prototype.compareTo = bnCompareTo;
  BigInteger.prototype.bitLength = bnBitLength;
  BigInteger.prototype.mod = bnMod;
  BigInteger.prototype.modPowInt = bnModPowInt;

  // "constants"
  BigInteger.ZERO = nbv(0);
  BigInteger.ONE = nbv(1);

  // jsbn2 stuff

  // (protected) convert from radix string
  function bnpFromRadix(s,b) {
    this.fromInt(0);
    if(b == null) b = 10;
    var cs = this.chunkSize(b);
    var d = Math.pow(b,cs), mi = false, j = 0, w = 0;
    for(var i = 0; i < s.length; ++i) {
      var x = intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-" && this.signum() == 0) mi = true;
        continue;
      }
      w = b*w+x;
      if(++j >= cs) {
        this.dMultiply(d);
        this.dAddOffset(w,0);
        j = 0;
        w = 0;
      }
    }
    if(j > 0) {
      this.dMultiply(Math.pow(b,j));
      this.dAddOffset(w,0);
    }
    if(mi) BigInteger.ZERO.subTo(this,this);
  }

  // (protected) return x s.t. r^x < DV
  function bnpChunkSize(r) { return Math.floor(Math.LN2*this.DB/Math.log(r)); }

  // (public) 0 if this == 0, 1 if this > 0
  function bnSigNum() {
    if(this.s < 0) return -1;
    else if(this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
    else return 1;
  }

  // (protected) this *= n, this >= 0, 1 < n < DV
  function bnpDMultiply(n) {
    this[this.t] = this.am(0,n-1,this,0,0,this.t);
    ++this.t;
    this.clamp();
  }

  // (protected) this += n << w words, this >= 0
  function bnpDAddOffset(n,w) {
    if(n == 0) return;
    while(this.t <= w) this[this.t++] = 0;
    this[w] += n;
    while(this[w] >= this.DV) {
      this[w] -= this.DV;
      if(++w >= this.t) this[this.t++] = 0;
      ++this[w];
    }
  }

  // (protected) convert to radix string
  function bnpToRadix(b) {
    if(b == null) b = 10;
    if(this.signum() == 0 || b < 2 || b > 36) return "0";
    var cs = this.chunkSize(b);
    var a = Math.pow(b,cs);
    var d = nbv(a), y = nbi(), z = nbi(), r = "";
    this.divRemTo(d,y,z);
    while(y.signum() > 0) {
      r = (a+z.intValue()).toString(b).substr(1) + r;
      y.divRemTo(d,y,z);
    }
    return z.intValue().toString(b) + r;
  }

  // (public) return value as integer
  function bnIntValue() {
    if(this.s < 0) {
      if(this.t == 1) return this[0]-this.DV;
      else if(this.t == 0) return -1;
    }
    else if(this.t == 1) return this[0];
    else if(this.t == 0) return 0;
    // assumes 16 < DB < 32
    return ((this[1]&((1<<(32-this.DB))-1))<<this.DB)|this[0];
  }

  // (protected) r = this + a
  function bnpAddTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]+a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c += a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c += a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += a.s;
    }
    r.s = (c<0)?-1:0;
    if(c > 0) r[i++] = c;
    else if(c < -1) r[i++] = this.DV+c;
    r.t = i;
    r.clamp();
  }

  BigInteger.prototype.fromRadix = bnpFromRadix;
  BigInteger.prototype.chunkSize = bnpChunkSize;
  BigInteger.prototype.signum = bnSigNum;
  BigInteger.prototype.dMultiply = bnpDMultiply;
  BigInteger.prototype.dAddOffset = bnpDAddOffset;
  BigInteger.prototype.toRadix = bnpToRadix;
  BigInteger.prototype.intValue = bnIntValue;
  BigInteger.prototype.addTo = bnpAddTo;

  //======= end jsbn =======

  // Emscripten wrapper
  var Wrapper = {
    abs: function(l, h) {
      var x = new goog.math.Long(l, h);
      var ret;
      if (x.isNegative()) {
        ret = x.negate();
      } else {
        ret = x;
      }
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
    },
    ensureTemps: function() {
      if (Wrapper.ensuredTemps) return;
      Wrapper.ensuredTemps = true;
      Wrapper.two32 = new BigInteger();
      Wrapper.two32.fromString('4294967296', 10);
      Wrapper.two64 = new BigInteger();
      Wrapper.two64.fromString('18446744073709551616', 10);
      Wrapper.temp1 = new BigInteger();
      Wrapper.temp2 = new BigInteger();
    },
    lh2bignum: function(l, h) {
      var a = new BigInteger();
      a.fromString(h.toString(), 10);
      var b = new BigInteger();
      a.multiplyTo(Wrapper.two32, b);
      var c = new BigInteger();
      c.fromString(l.toString(), 10);
      var d = new BigInteger();
      c.addTo(b, d);
      return d;
    },
    stringify: function(l, h, unsigned) {
      var ret = new goog.math.Long(l, h).toString();
      if (unsigned && ret[0] == '-') {
        // unsign slowly using jsbn bignums
        Wrapper.ensureTemps();
        var bignum = new BigInteger();
        bignum.fromString(ret, 10);
        ret = new BigInteger();
        Wrapper.two64.addTo(bignum, ret);
        ret = ret.toString(10);
      }
      return ret;
    },
    fromString: function(str, base, min, max, unsigned) {
      Wrapper.ensureTemps();
      var bignum = new BigInteger();
      bignum.fromString(str, base);
      var bigmin = new BigInteger();
      bigmin.fromString(min, 10);
      var bigmax = new BigInteger();
      bigmax.fromString(max, 10);
      if (unsigned && bignum.compareTo(BigInteger.ZERO) < 0) {
        var temp = new BigInteger();
        bignum.addTo(Wrapper.two64, temp);
        bignum = temp;
      }
      var error = false;
      if (bignum.compareTo(bigmin) < 0) {
        bignum = bigmin;
        error = true;
      } else if (bignum.compareTo(bigmax) > 0) {
        bignum = bigmax;
        error = true;
      }
      var ret = goog.math.Long.fromString(bignum.toString()); // min-max checks should have clamped this to a range goog.math.Long can handle well
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
      if (error) throw 'range error';
    }
  };
  return Wrapper;
})();

//======= end closure i64 code =======



// === Auto-generated postamble setup entry stuff ===

if (memoryInitializer) {
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    var data = Module['readBinary'](memoryInitializer);
    HEAPU8.set(data, STATIC_BASE);
  } else {
    addRunDependency('memory initializer');
    Browser.asyncLoad(memoryInitializer, function(data) {
      HEAPU8.set(data, STATIC_BASE);
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

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later
  if (Module['calledRun']) return; // run may have just been called through dependencies being fulfilled just in this very frame

  function doRun() {
    if (Module['calledRun']) return; // run may have just been called while the async setStatus time below was happening
    Module['calledRun'] = true;

    ensureInitRuntime();

    preMain();

    if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
      Module.printErr('pre-main prep time: ' + (Date.now() - preloadStartTime) + ' ms');
    }

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

  var extra = '\nIf this abort() is unexpected, build with -s ASSERTIONS=1 which can give more information.';

  throw 'abort() at ' + stackTrace() + extra;
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

function depth(level) {
  switch (level) {
  case 2:
    return 10;
  case 3:
    return 10;
  }
  return 3;
}

function limit(level) {
  switch (level) {
  case 2:
    return 1000;
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
    var move = hm5move(path, depth(level), limit(level));
    var elapsed = (Date.now() - start) / 1000;
    postMessage({'move': move, 'nps': getVisitedNodes() / elapsed});
  } else {
    postMessage({'move': "XXXX invalid path"});
  }
});


