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

  ripple.render = render(ripple)(ripple.render);

  values(ripple.types).filter(by("header", "text/css")).map(function (type) {
    return type.render = proxy(type.render, css(ripple));
  });

  return ripple;
}

function render(ripple) {
  return function (next) {
    return function (host) {
      var css = str(attr(host, "css")).split(" ").filter(Boolean),
          root = host.shadowRoot || host,
          head = document.head,
          shadow = head.createShadowRoot && host.shadowRoot,
          styles;

      // this host does not have a css dep, continue with rest of rendering pipeline
      if (!css.length) return next(host);

      // this host has a css dep, but it is not loaded yet - stop rendering this host
      if (css.some(not(is["in"](ripple.resources)))) return;

      // retrieve styles
      styles = css.map(from(ripple.resources)).map(key("body")).map(polyfill(host, shadow));

      // reuse or create style tag
      css.map(function (d) {
        return raw("style[resource=\"" + d + "\"]", shadow ? root : head) || el("style[resource=" + d + "]");
      }).map(function (d, i) {
        return (d.innerHTML = styles[i], d);
      }).filter(not(by("parentNode"))).map(function (d) {
        return (shadow ? root.insertBefore(d, root.firstChild) : head.appendChild(d), d);
      });

      // continue with rest of the rendering pipeline
      return next(host);
    };
  };
}

function polyfill(el, shadow) {
  return shadow ? identity : function (styles) {
    var prefix = attr(el, "is") ? "[is=\"" + attr(el, "is") + "\"]" : el.nodeName.toLowerCase(),
        escaped = prefix.replace(/\[/g, "\\[").replace(/\]/g, "\\]");

    return !prefix ? styles : styles.replace(/:host\((.+?)\)/gi, function ($1, $2) {
      return prefix + $2;
    }) // :host(...) -> tag...
    .replace(/:host /gi, prefix + " ") // :host      -> tag
    .replace(/^([^@%\n]*){/gim, function ($1) {
      return prefix + " " + $1;
    }) // ... {      -> tag ... {
    .replace(/^(.*?),\s*$/gim, function ($1) {
      return prefix + " " + $1;
    }) // ... ,      -> tag ... ,
    .replace(/\/deep\/ /gi, "") // /deep/     ->
    .replace(/^.*:host-context\((.+?)\)/gim, function ($1, $2) {
      return $2 + " " + prefix;
    }) // :host(...) -> tag...
    .replace(new RegExp(escaped + "[\\s]*" + escaped, "g"), prefix) // tag tag    -> tag
    ;
  };
}

function css(ripple) {
  return function (res) {
    return all("[css~=\"" + res.name + "\"]:not([inert])").map(ripple.draw);
  };
}

var identity = _interopRequire(require("utilise/identity"));

var client = _interopRequire(require("utilise/client"));

var attr = _interopRequire(require("utilise/attr"));

var wrap = _interopRequire(require("utilise/wrap"));

var all = _interopRequire(require("utilise/all"));

var raw = _interopRequire(require("utilise/raw"));

var key = _interopRequire(require("utilise/key"));

var log = require("utilise/log")("[ri/precss]");
err = require("utilise/err")("[ri/precss]");
},{"utilise/all":2,"utilise/attr":3,"utilise/client":4,"utilise/err":5,"utilise/identity":6,"utilise/key":8,"utilise/log":9,"utilise/raw":11,"utilise/wrap":14}],2:[function(require,module,exports){
var to = require('utilise/to')

module.exports = function all(selector, doc){
  var prefix = !doc && document.head.createShadowRoot ? 'html /deep/ ' : ''
  return to.arr((doc || document).querySelectorAll(prefix+selector))
}
},{"utilise/to":13}],3:[function(require,module,exports){
var is = require('utilise/is')

module.exports = function attr(d, name, value) {
  d = d.node ? d.node() : d
  if (is.str(d)) return function(el){ return attr(this.nodeName || this.node ? this : el, d) }

  return arguments.length > 2 && value === false ? d.removeAttribute(name)
       : arguments.length > 2                    ? d.setAttribute(name, value)
       : d.attributes.getNamedItem(name) 
      && d.attributes.getNamedItem(name).value
}

},{"utilise/is":7}],4:[function(require,module,exports){
module.exports = typeof window != 'undefined'
},{}],5:[function(require,module,exports){
var owner = require('utilise/owner')
  , to = require('utilise/to')

module.exports = function err(prefix){
  return function(d){
    if (!owner.console || !console.error.apply) return d;
    var args = to.arr(arguments)
    args.unshift(prefix.red ? prefix.red : prefix)
    return console.error.apply(console, args), d
  }
}
},{"utilise/owner":10,"utilise/to":13}],6:[function(require,module,exports){
module.exports = function identity(d) {
  return d
}
},{}],7:[function(require,module,exports){
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
    return !set ? false  
         : set.indexOf ? ~set.indexOf(d)
         : d in set
  }
}
},{}],8:[function(require,module,exports){
var is = require('utilise/is')
  , str = require('utilise/str')

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
                                : (set ? (key(keys.join('.'), v)(o[root] ? o[root] : (o[root] = {})), o)
                                       : key(keys.join('.'))(o[root]))

    function copy(k){
      var val = key(k)(o)
      ;(val != undefined) && key(k, val)(masked)
    }
  }
}
},{"utilise/is":7,"utilise/str":12}],9:[function(require,module,exports){
var is = require('utilise/is')
  , to = require('utilise/to')
  , owner = require('utilise/owner')

module.exports = function log(prefix){
  return function(d){
    if (!owner.console || !console.log.apply) return d;
    is.arr(arguments[2]) && (arguments[2] = arguments[2].length)
    var args = to.arr(arguments)
    args.unshift(prefix.grey ? prefix.grey : prefix)
    return console.log.apply(console, args), d
  }
}
},{"utilise/is":7,"utilise/owner":10,"utilise/to":13}],10:[function(require,module,exports){
(function (global){
module.exports = require('utilise/client') ? /* istanbul ignore next */ window : global
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"utilise/client":4}],11:[function(require,module,exports){
module.exports = function raw(selector, doc){
  var prefix = !doc && document.head.createShadowRoot ? 'html /deep/ ' : ''
  return (doc ? doc : document).querySelector(prefix+selector)
}
},{}],12:[function(require,module,exports){
var is = require('utilise/is') 

module.exports = function str(d){
  return d === 0 ? '0'
       : !d ? ''
       : is.fn(d) ? '' + d
       : is.obj(d) ? JSON.stringify(d)
       : String(d)
}
},{"utilise/is":7}],13:[function(require,module,exports){
module.exports = { 
  arr: toArray
, obj: toObject
}

function toArray(d){
  return Array.prototype.slice.call(d, 0)
}

function toObject(d) {
  var by = 'id'
    , o = {}

  return arguments.length == 1 
    ? (by = d, reduce)
    : reduce.apply(this, arguments)

  function reduce(p,v,i){
    if (i === 0) p = {}
    p[v[by]] = v
    return p
  }
}
},{}],14:[function(require,module,exports){
module.exports = function wrap(d){
  return function(){
    return d
  }
}
},{}]},{},[1]);
