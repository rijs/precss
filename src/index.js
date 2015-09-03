// -------------------------------------------
// API: Pre-applies Scoped CSS [css=name]
// -------------------------------------------
export default function precss(ripple){
  if (!client) return;
  log('creating')
  
  var render = ripple.render

  key('types.text/css.render', wrap(css(ripple)))(ripple)

  ripple.render = function(el){
    var css = attr(el, 'css')
      , root = el.shadowRoot || el
      , style, styles, prefix = ''
      , noShadow = !el.shadowRoot || !document.head.createShadowRoot

    // this el does not have a css dep, continue with rest of rendering pipeline
    if (!css) return render(el)
    
    // this el has a css dep, but it is not loaded yet - stop rendering this el
    if (css && !ripple.resources[css]) return;
    

    // this el does not have a shadow and css has already been added, so reuse that
    if (noShadow && raw(`style[resource="${css}"]`)) style = raw(`style[resource="${css}"]`)

    // reuse or create style tag
    style = style || raw('style', root) || document.createElement('style')

    // mark tag if no shadow for optimisation
    attr(style, 'resource', noShadow ? css : false)
    
    // retrieve styles
    styles = ripple(css)
    
    // scope css if no shadow
    if (noShadow) styles = polyfill(styles, el)

    // update styles
    style.innerHTML = styles 

    // append if not already attached
    if (!style.parentNode) root.insertBefore(style, root.firstChild)

    // continue with rest of the rendering pipeline
    render(el)
  }

  return ripple
}

function polyfill(css, el){
  var prefix = attr(el, 'is') ? `[is="${attr(el, 'is')}"]` : el.tagName.toLowerCase()
    , escaped = prefix
        .replace(/\[/g, '\\[')
        .replace(/\]/g, '\\]')

  return !prefix ? css
       : css
          .replace(/:host\((.+?)\)/gi, ($1, $2) => prefix+$2)            // :host(...) -> tag...
          .replace(/:host/gi, prefix)                                    // :host      -> tag
          .replace(/^([^@%\n]*){/gim, $1 => prefix+' '+$1 )              // ... {      -> tag ... {
          .replace(/^(.*?),\s*$/gim, $1 => prefix+' '+$1)                // ... ,      -> tag ... ,
          .replace(/\/deep\/ /gi, '')                                    // /deep/     -> 
          .replace(new RegExp(escaped + '[\\s]*' + escaped,"g"), prefix) // tag tag    -> tag
}

function css(ripple) {
  return res => {
    return all(`[css="${res.name}"]:not([inert])`)
      .map(ripple.draw)
  }
}

import client from 'utilise/client'
import attr from 'utilise/attr'
import wrap from 'utilise/wrap'
import all from 'utilise/all'
import raw from 'utilise/raw'
import key from 'utilise/key'
import log from 'utilise/log'
import err from 'utilise/err'
log = log('[ri/precss]')
err = err('[ri/precss]')