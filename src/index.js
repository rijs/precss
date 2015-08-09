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

    // this el does not have a css dep
    if (!css) return render.apply(this, arguments)
    
    // this el has a css dep, but it is not loaded yet
    if (css && !ripple.resources[css]) return;
    
    // this el does not have a shadow and css has already been added
    if (noShadow && all(`style[resource="${css}"]`).length) return render.apply(this, arguments)

    style  = raw('style', root) || document.createElement('style')
    styles = ripple(css)

    // scope css if no shadow
    if (noShadow) {
      prefix = attr(el, 'is') ? `[is="${attr(el, 'is')}"]` : el.tagName.toLowerCase()
      styles = polyfill(styles, prefix)
    }

    style.innerHTML = styles 
    attr(style, 'resource', noShadow ? css : false)
    root.insertBefore(style, root.firstChild)
    render.apply(this, arguments)
  }

  return ripple
}

function polyfill(css, prefix){
  var escaped = prefix
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')

  return !prefix ? css
       : css
          .replace(/:host\((.+)\)/gi, function($1, $2){ return prefix+$2})
          .replace(/:host/gi, prefix)
          .replace(/^(.+)[{]/gim, function($1){ return prefix+' '+$1 })
          .replace(/^(.+)(^[:])[,]/gim, function($1){ return prefix+' '+$1 })
          .replace(new RegExp(escaped + '[\\s]*' + escaped,"g"), prefix)
          .replace(/\/deep\/ /gim, '')
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