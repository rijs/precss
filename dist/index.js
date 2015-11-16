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