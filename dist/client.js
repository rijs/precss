(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

/* istanbul ignore next */
var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

// -------------------------------------------
// API: Pre-applies Scoped CSS [css=name]
// -------------------------------------------
module.exports = precss;

function precss(ripple) {
  if (!client) {
    return;
  }log("creating");

  var render = ripple.render;

  key("types.text/css.render", wrap(css(ripple)))(ripple);

  ripple.render = function (el) {
    var css = attr(el, "css"),
        root = el.shadowRoot || el,
        style,
        styles,
        prefix = "",
        noShadow = !el.shadowRoot || !document.head.createShadowRoot;

    // this el does not have a css dep
    if (!css) return render.apply(this, arguments);

    // this el has a css dep, but it is not loaded yet
    if (css && !ripple.resources[css]) return;

    // this el does not have a shadow and css has already been added
    if (noShadow && all("style[resource=\"" + css + "\"]").length) return render.apply(this, arguments);

    style = raw("style", root) || document.createElement("style");
    styles = ripple(css);

    // scope css if no shadow
    if (noShadow) {
      prefix = attr(el, "is") ? "[is=\"" + attr(el, "is") + "\"]" : el.tagName.toLowerCase();
      styles = polyfill(styles, prefix);
    }

    style.innerHTML = styles;
    attr(style, "resource", noShadow ? css : false);
    root.insertBefore(style, root.firstChild);
    render.apply(this, arguments);
  };

  return ripple;
}

function polyfill(css, prefix) {
  return !prefix ? css : css.replace(/:host\((.+)\)/gi, function ($1, $2) {
    return prefix + $2;
  }).replace(/:host/gi, prefix).replace(/^(.+)[{]/gim, function ($1) {
    return prefix + " " + $1;
  }).replace(/^(.+)(^[:])[,]/gim, function ($1) {
    return prefix + " " + $1;
  }).replace(new RegExp(prefix + " " + prefix, "g"), prefix);
}

function css(ripple) {
  return function (res) {
    return all("[css=\"" + res.name + "\"]:not([inert])").map(ripple.draw);
  };
}

var client = _interopRequire(require("utilise/client"));

var attr = _interopRequire(require("utilise/attr"));

var wrap = _interopRequire(require("utilise/wrap"));

var all = _interopRequire(require("utilise/all"));

var raw = _interopRequire(require("utilise/raw"));

var key = _interopRequire(require("utilise/key"));

var log = _interopRequire(require("utilise/log"));

var err = _interopRequire(require("utilise/err"));

log = log("[ri/precss]");
err = err("[ri/precss]");
},{"utilise/all":2,"utilise/attr":3,"utilise/client":4,"utilise/err":5,"utilise/key":6,"utilise/log":7,"utilise/raw":28,"utilise/wrap":29}],2:[function(require,module,exports){
module.exports = require('all')
},{"all":8}],3:[function(require,module,exports){
module.exports = require('attr')
},{"attr":10}],4:[function(require,module,exports){
module.exports = require('client')
},{"client":12}],5:[function(require,module,exports){
module.exports = require('err')
},{"err":13}],6:[function(require,module,exports){
module.exports = require('key')
},{"key":17}],7:[function(require,module,exports){
module.exports = require('log')
},{"log":21}],8:[function(require,module,exports){
var to = require('to')

module.exports = function all(selector, doc){
  var prefix = !doc && document.head.createShadowRoot ? 'html /deep/ ' : ''
  return to.arr((doc || document).querySelectorAll(prefix+selector))
}
},{"to":9}],9:[function(require,module,exports){
module.exports = { 
  arr : toArray
}

function toArray(d){
  return Array.prototype.slice.call(d, 0)
}
},{}],10:[function(require,module,exports){
var is = require('is')

module.exports = function attr(d, name, value) {
  d = d.node ? d.node() : d
  if (is.str(d)) return function(el){ return attr(this.nodeName || this.node ? this : el, d) }

  return arguments.length > 2 && value === false ? d.removeAttribute(name)
       : arguments.length > 2                    ? d.setAttribute(name, value)
       : d.attributes.getNamedItem(name) 
      && d.attributes.getNamedItem(name).value
}

},{"is":11}],11:[function(require,module,exports){
module.exports = is
is.fn     = isFunction
is.str    = isString
is.num    = isNumber
is.obj    = isObject
is.lit    = isLiteral
is.bol    = isBoolean
is.truthy = isTruthy
is.falsy  = isFalsy
is.arr    = isArray
is.null   = isNull
is.def    = isDef
is.in     = isIn

function is(v){
  return function(d){
    return d == v
  }
}

function isFunction(d) {
  return typeof d == 'function'
}

function isBoolean(d) {
  return typeof d == 'boolean'
}

function isString(d) {
  return typeof d == 'string'
}

function isNumber(d) {
  return typeof d == 'number'
}

function isObject(d) {
  return typeof d == 'object'
}

function isLiteral(d) {
  return typeof d == 'object' 
      && !(d instanceof Array)
}

function isTruthy(d) {
  return !!d == true
}

function isFalsy(d) {
  return !!d == false
}

function isArray(d) {
  return d instanceof Array
}

function isNull(d) {
  return d === null
}

function isDef(d) {
  return typeof d !== 'undefined'
}

function isIn(set) {
  return function(d){
    return  set.indexOf 
         ? ~set.indexOf(d)
         :  d in set
  }
}
},{}],12:[function(require,module,exports){
module.exports = typeof window != 'undefined'
},{}],13:[function(require,module,exports){
var owner = require('owner')
  , to = require('to')

module.exports = function err(prefix){
  return function(d){
    if (!owner.console || !console.error.apply) return d;
    var args = to.arr(arguments)
    args.unshift(prefix.red ? prefix.red : prefix)
    return console.error.apply(console, args), d
  }
}
},{"owner":14,"to":16}],14:[function(require,module,exports){
(function (global){
module.exports = require('client') ? /* istanbul ignore next */ window : global
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"client":15}],15:[function(require,module,exports){
arguments[4][12][0].apply(exports,arguments)
},{"dup":12}],16:[function(require,module,exports){
arguments[4][9][0].apply(exports,arguments)
},{"dup":9}],17:[function(require,module,exports){
var is = require('is')
  , str = require('str')

module.exports = function key(k, v){ 
  var set = arguments.length > 1
    , keys = str(k).split('.')
    , root = keys.shift()

  return function deep(o){
    var masked = {}
    return !o ? undefined 
         : !k ? o
         : is.arr(k) ? (k.map(copy), masked)
         : o[k] || !keys.length ? (set ? ((o[k] = is.fn(v) ? v(o[k]) : v), o)
                                       :   o[k])
                                : (set ? key(keys.join('.'), v)(o[root] ? o[root] : (o[root] = {}))
                                       : key(keys.join('.'))(o[root]))

    function copy(d){
      key(d, key(d)(o))(masked)
    }
  }
}
},{"is":18,"str":19}],18:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"dup":11}],19:[function(require,module,exports){
var is = require('is') 

module.exports = function str(d){
  return d === 0 ? '0'
       : !d ? ''
       : is.fn(d) ? '' + d
       : is.obj(d) ? JSON.stringify(d)
       : String(d)
}
},{"is":20}],20:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"dup":11}],21:[function(require,module,exports){
var is = require('is')
  , to = require('to')
  , owner = require('owner')

module.exports = function log(prefix){
  return function(d){
    if (!owner.console || !console.log.apply) return d;
    is.arr(arguments[2]) && (arguments[2] = arguments[2].length)
    var args = to.arr(arguments)
    args.unshift(prefix.grey ? prefix.grey : prefix)
    return console.log.apply(console, args), d
  }
}
},{"is":22,"owner":23,"to":25}],22:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"dup":11}],23:[function(require,module,exports){
arguments[4][14][0].apply(exports,arguments)
},{"client":24,"dup":14}],24:[function(require,module,exports){
arguments[4][12][0].apply(exports,arguments)
},{"dup":12}],25:[function(require,module,exports){
arguments[4][9][0].apply(exports,arguments)
},{"dup":9}],26:[function(require,module,exports){
module.exports = function raw(selector, doc){
  var prefix = !doc && document.head.createShadowRoot ? 'html /deep/ ' : ''
  return (doc ? doc : document).querySelector(prefix+selector)
}
},{}],27:[function(require,module,exports){
module.exports = function wrap(d){
  return function(){
    return d
  }
}
},{}],28:[function(require,module,exports){
module.exports = require('raw')
},{"raw":26}],29:[function(require,module,exports){
module.exports = require('wrap')
},{"wrap":27}]},{},[1]);
