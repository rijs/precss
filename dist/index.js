'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = precss;

var _identity = require('utilise/identity');

var _identity2 = _interopRequireDefault(_identity);

var _client = require('utilise/client');

var _client2 = _interopRequireDefault(_client);

var _values = require('utilise/values');

var _values2 = _interopRequireDefault(_values);

var _proxy = require('utilise/proxy');

var _proxy2 = _interopRequireDefault(_proxy);

var _attr = require('utilise/attr');

var _attr2 = _interopRequireDefault(_attr);

var _from = require('utilise/from');

var _from2 = _interopRequireDefault(_from);

var _all = require('utilise/all');

var _all2 = _interopRequireDefault(_all);

var _raw = require('utilise/raw');

var _raw2 = _interopRequireDefault(_raw);

var _str = require('utilise/str');

var _str2 = _interopRequireDefault(_str);

var _key = require('utilise/key');

var _key2 = _interopRequireDefault(_key);

var _not = require('utilise/not');

var _not2 = _interopRequireDefault(_not);

var _by = require('utilise/by');

var _by2 = _interopRequireDefault(_by);

var _is = require('utilise/is');

var _is2 = _interopRequireDefault(_is);

var _el = require('utilise/el');

var _el2 = _interopRequireDefault(_el);

/* istanbul ignore next */
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// -------------------------------------------
// API: Pre-applies Scoped CSS [css=name]
// -------------------------------------------
function precss(ripple) {
  if (!_client2.default) return;
  log('creating');

  ripple.render = render(ripple)(ripple.render);

  (0, _values2.default)(ripple.types).filter((0, _by2.default)('header', 'text/css')).map(function (type) {
    return type.render = (0, _proxy2.default)(type.render, css(ripple));
  });

  return ripple;
}

var render = function render(ripple) {
  return function (next) {
    return function (host) {
      var css = (0, _str2.default)((0, _attr2.default)(host, 'css')).split(' ').filter(Boolean),
          root = host.shadowRoot || host,
          head = document.head,
          shadow = head.createShadowRoot && host.shadowRoot,
          styles;

      // this host does not have a css dep, continue with rest of rendering pipeline
      if (!css.length) return next(host);

      // this host has a css dep, but it is not loaded yet - stop rendering this host
      if (css.some((0, _not2.default)(_is2.default.in(ripple.resources)))) return;

      // retrieve styles
      styles = css.map((0, _from2.default)(ripple.resources)).map((0, _key2.default)('body')).map(scope(host, shadow, css));

      // reuse or create style tag
      css.map(function (d) {
        return (0, _raw2.default)('style[resource="' + d + '"]', shadow ? root : head) || (0, _el2.default)('style[resource=' + d + ']');
      }).map((0, _key2.default)('innerHTML', function (d, i) {
        return styles[i];
      })).filter((0, _not2.default)((0, _by2.default)('parentNode'))).map(function (d) {
        return shadow ? root.insertBefore(d, root.firstChild) : head.appendChild(d);
      });

      // continue with rest of the rendering pipeline
      return next(host);
    };
  };
};

var scope = function scope(el, shadow, names) {
  return shadow ? _identity2.default : function (styles, i) {
    var prefix = '[css~="' + names[i] + '"]',
        escaped = '\\[css~="' + names[i] + '"\\]';

    return styles.replace(/^(?!.*:host)([^@%\n]*){/gim, function ($1) {
      return prefix + ' ' + $1;
    }) // ... {      -> tag ... {
    .replace(/^(?!.*:host)(.*?),\s*$/gim, function ($1) {
      return prefix + ' ' + $1;
    }) // ... ,      -> tag ... ,
    .replace(/:host\((.*?)\)/gi, function ($1, $2) {
      return prefix + $2;
    }) // :host(...) -> tag...
    .replace(/:host /gi, prefix + " ") // :host      -> tag
    .replace(/\/deep\/ /gi, '') // /deep/     ->
    .replace(/^.*:host-context\((.*)\)/gim, function ($1, $2) {
      return $2 + " " + prefix;
    }); // :host(...) -> tag...
  };
};

var css = function css(ripple) {
  return function (res) {
    return (0, _all2.default)('[css~="' + res.name + '"]:not([inert])').map(ripple.draw);
  };
};

var log = require('utilise/log')('[ri/precss]'),
    err = require('utilise/err')('[ri/precss]');