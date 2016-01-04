'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = precss;

var _identity = require('utilise/identity');

var _identity2 = _interopRequireDefault(_identity);

var _client = require('utilise/client');

var _client2 = _interopRequireDefault(_client);

var _attr = require('utilise/attr');

var _attr2 = _interopRequireDefault(_attr);

var _wrap = require('utilise/wrap');

var _wrap2 = _interopRequireDefault(_wrap);

var _all = require('utilise/all');

var _all2 = _interopRequireDefault(_all);

var _raw = require('utilise/raw');

var _raw2 = _interopRequireDefault(_raw);

var _key = require('utilise/key');

var _key2 = _interopRequireDefault(_key);

/* istanbul ignore next */
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// -------------------------------------------
// API: Pre-applies Scoped CSS [css=name]
// -------------------------------------------
function precss(ripple) {
  if (!_client2.default) return;
  log('creating');

  ripple.render = render(ripple)(ripple.render);

  values(ripple.types).filter(by('header', 'text/css')).map(function (type) {
    return type.render = proxy(type.render, css(ripple));
  });

  return ripple;
}

function render(ripple) {
  return function (next) {
    return function (host) {
      var css = str((0, _attr2.default)(host, 'css')).split(' ').filter(Boolean),
          root = host.shadowRoot || host,
          head = document.head,
          shadow = head.createShadowRoot && host.shadowRoot,
          styles;

      // this host does not have a css dep, continue with rest of rendering pipeline
      if (!css.length) return next(host);

      // this host has a css dep, but it is not loaded yet - stop rendering this host
      if (css.some(not(is.in(ripple.resources)))) return;

      // retrieve styles
      styles = css.map(from(ripple.resources)).map((0, _key2.default)('body')).map(scope(host, shadow, css));

      // reuse or create style tag
      css.map(function (d) {
        return (0, _raw2.default)('style[resource="' + d + '"]', shadow ? root : head) || el('style[resource=' + d + ']');
      }).map((0, _key2.default)('innerHTML', function (d, i) {
        return styles[i];
      })).filter(not(by('parentNode'))).map(function (d) {
        return shadow ? root.insertBefore(d, root.firstChild) : head.appendChild(d);
      });

      // continue with rest of the rendering pipeline
      return next(host);
    };
  };
}

function scope(el, shadow, names) {
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
}

function css(ripple) {
  return function (res) {
    return (0, _all2.default)('[css~="' + res.name + '"]:not([inert])').map(ripple.draw);
  };
}

var log = require('utilise/log')('[ri/precss]'),
    err = require('utilise/err')('[ri/precss]');