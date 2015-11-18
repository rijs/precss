// -------------------------------------------
// API: Pre-applies Scoped CSS [css=name]
// -------------------------------------------
export default function precss(ripple){
  if (!client) return;
  log('creating')
  
  ripple.render = render(ripple)(ripple.render)

  values(ripple.types)
    .filter(by('header', 'text/css'))
    .map(type => type.render = proxy(type.render, css(ripple)))

  return ripple
}

function render(ripple){
  return next => {
    return host => {
      var css = str(attr(host, 'css')).split(' ').filter(Boolean)
        , root = host.shadowRoot || host
        , head = document.head
        , shadow = head.createShadowRoot && host.shadowRoot
        , styles

      // this host does not have a css dep, continue with rest of rendering pipeline
      if (!css.length) return next(host)
      
      // this host has a css dep, but it is not loaded yet - stop rendering this host
      if (css.some(not(is.in(ripple.resources)))) return;

      // retrieve styles
      styles = css
        .map(from(ripple.resources))
        .map(key('body'))
        .map(polyfill(host, shadow))

      // reuse or create style tag
      css
        .map(d => raw(`style[resource="${d}"]`, shadow ? root : head) || el(`style[resource=${d}]`))
        .map((d, i) => ((d.innerHTML = styles[i]), d))
        .filter(not(by('parentNode')))
        .map(d => ((shadow ? root.insertBefore(d, root.firstChild) : head.appendChild(d)), d))

      // continue with rest of the rendering pipeline
      return next(host)
    }
  }
}

function polyfill(el, shadow){
  return shadow ? identity : styles => {
    var prefix = attr(el, 'is') ? `[is="${attr(el, 'is')}"]` : el.nodeName.toLowerCase()
      , escaped = prefix
          .replace(/\[/g, '\\[')
          .replace(/\]/g, '\\]')

    return !prefix ? styles : styles
      .replace(/:host\((.+?)\)/gi, ($1, $2) => prefix+$2)                     // :host(...) -> tag...
      .replace(/:host /gi, prefix + " ")                                      // :host      -> tag
      .replace(/^([^@%\n]*){/gim, $1 => prefix+' '+$1 )                       // ... {      -> tag ... {
      .replace(/^(.*?),\s*$/gim, $1 => prefix+' '+$1)                         // ... ,      -> tag ... ,
      .replace(/\/deep\/ /gi, '')                                             // /deep/     -> 
      .replace(/^.*:host-context\((.+?)\)/gim, ($1, $2) => $2 + " " + prefix) // :host(...) -> tag...
      .replace(new RegExp(escaped + '[\\s]*' + escaped,"g"), prefix)          // tag tag    -> tag
  }
}

function css(ripple) {
  return res => {
    return all(`[css~="${res.name}"]:not([inert])`)
      .map(ripple.draw)
  }
}

import identity from 'utilise/identity'
import client from 'utilise/client'
import attr from 'utilise/attr'
import wrap from 'utilise/wrap'
import all from 'utilise/all'
import raw from 'utilise/raw'
import key from 'utilise/key'
var log = require('utilise/log')('[ri/precss]')
  , err = require('utilise/err')('[ri/precss]')