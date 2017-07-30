'use strict';

// -------------------------------------------
// Pre-applies Scoped CSS [css=name]
// -------------------------------------------
module.exports = function precss(ripple) {
  if (!client) return;
  log('creating');

  ripple.render = render(ripple)(ripple.render);

  values(ripple.types).filter(by('header', 'text/css')).map(function (type) {
    return type.render = proxy(type.render, css(ripple));
  });

  return ripple;
};

var render = function render(ripple) {
  return function (next) {
    return function (host) {
      var css = str(attr(host, 'css')).split(' ').filter(Boolean),
          root = host.shadowRoot || host,
          head = document.head,
          shadow = head.createShadowRoot && host.shadowRoot,
          styles;

      // this host does not have a css dep, continue with rest of rendering pipeline
      if (!css.length) return next(host);

      // this host has a css dep, but it is not loaded yet - stop rendering this host
      if (css.some(not(is.in(ripple.resources)))) return;

      css
      // reuse or create style tag
      .map(function (d) {
        return {
          res: ripple.resources[d],
          el: raw('style[resource="' + d + '"]', shadow ? root : head) || el('style[resource=' + d + ']')
        };
      })
      // check if hash of styles changed
      .filter(function (d, i) {
        return d.el.hash != d.res.headers.hash;
      }).map(function (d, i) {
        d.el.hash = d.res.headers.hash;
        d.el.innerHTML = shadow ? d.res.body : transform(d.res.body, d.res.name);
        return d.el;
      }).filter(not(by('parentNode'))).map(function (d) {
        return shadow ? root.insertBefore(d, root.firstChild) : head.appendChild(d);
      });

      // continue with rest of the rendering pipeline
      return next(host);
    };
  };
};

var transform = function transform(styles, name) {
  return scope(styles, '[css~="' + name + '"]');
};

var css = function css(ripple) {
  return function (res) {
    return all('[css~="' + res.name + '"]:not([inert])').map(ripple.draw);
  };
};

var log = require('utilise/log')('[ri/precss]'),
    err = require('utilise/err')('[ri/precss]'),
    identity = require('utilise/identity'),
    client = require('utilise/client'),
    values = require('utilise/values'),
    proxy = require('utilise/proxy'),
    attr = require('utilise/attr'),
    from = require('utilise/from'),
    all = require('utilise/all'),
    raw = require('utilise/raw'),
    str = require('utilise/str'),
    not = require('utilise/not'),
    by = require('utilise/by'),
    is = require('utilise/is'),
    el = require('utilise/el'),
    scope = require('cssscope');