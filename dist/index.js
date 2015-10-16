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
        head = document.head,
        noShadow = !el.shadowRoot || !head.createShadowRoot;

    // this el does not have a css dep, continue with rest of rendering pipeline
    if (!css) return render(el);

    // this el has a css dep, but it is not loaded yet - stop rendering this el
    if (css && !ripple.resources[css]) return;

    // this el does not have a shadow and css has already been added, so reuse that
    if (noShadow && raw("style[resource=\"" + css + "\"]", head)) style = raw("style[resource=\"" + css + "\"]", head);

    // reuse or create style tag
    style = style || raw("style", root) || document.createElement("style");

    // mark tag if no shadow for optimisation
    attr(style, "resource", noShadow ? css : false);

    // retrieve styles
    styles = ripple(css);

    // scope css if no shadow
    if (noShadow) styles = polyfill(styles, el);

    // update styles
    style.innerHTML = styles;

    // append if not already attached
    if (!style.parentNode) noShadow ? head.appendChild(style) : root.insertBefore(style, root.firstChild);

    // continue with rest of the rendering pipeline
    return render(el);
  };

  return ripple;
}

function polyfill(css, el) {
  var prefix = attr(el, "is") ? "[is=\"" + attr(el, "is") + "\"]" : el.tagName.toLowerCase(),
      escaped = prefix.replace(/\[/g, "\\[").replace(/\]/g, "\\]");

  return !prefix ? css : css.replace(/:host\((.+?)\)/gi, function ($1, $2) {
    return prefix + $2;
  }) // :host(...) -> tag...
  .replace(/:host/gi, prefix) // :host      -> tag
  .replace(/^([^@%\n]*){/gim, function ($1) {
    return prefix + " " + $1;
  }) // ... {      -> tag ... {
  .replace(/^(.*?),\s*$/gim, function ($1) {
    return prefix + " " + $1;
  }) // ... ,      -> tag ... ,
  .replace(/\/deep\/ /gi, "") // /deep/     ->
  .replace(new RegExp(escaped + "[\\s]*" + escaped, "g"), prefix) // tag tag    -> tag
  ;
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