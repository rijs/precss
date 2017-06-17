var expect = require('chai').expect
  , noop = require('utilise/noop')
  , all = require('utilise/all')
  , time = require('utilise/time')
  , components = require('rijs.components').default
  , shadow = require('rijs.shadow').default
  , core = require('rijs.core').default
  , css = require('rijs.css').default
  , fn = require('rijs.fn').default
  , precss = require('./').default
  , container = document.createElement('div')
  , head = document.head
  , clean
  , el
  
describe('Scoped CSS', function(){

  before(function(){
    document.body.appendChild(container)
    window.clean = clean = document.head.innerHTML
  })
  
  beforeEach(function(done){
    document.head.innerHTML = clean
    container.innerHTML = ''
    time(40, done)
  })

  after(function(){
    document.body.removeChild(container)
  })

  it('should render component with css loaded', function(done){  
    container.innerHTML = '<css-1 css="foo.css"><a></a></css-1>'
    var ripple = precss(components(fn(css(core()))))
      , result
      
    ripple('foo.css', '* { color: red }', { hash: 'hash' })
    ripple('css-1', function(){ result = true })
    ripple.draw()

    time(40, function() {
      expect(result).to.be.ok
      expect(head.lastChild.outerHTML).to.equal('<style resource="foo.css">[css~="foo.css"] * { color: red }</style>')
      expect(getComputedStyle(container.firstChild.firstChild).color).to.be.eql('rgb(255, 0, 0)')
      expect(getComputedStyle(document.body).color).to.not.eql('rgb(255, 0, 0)')
      done()
    })
  })

  it('should not append css twice outside shadow dom', function(done){  
    container.innerHTML = `
      <css-2 css="foo.css"></css-2>
      <css-2 css="foo.css"></css-2>`

    var ripple = precss(components(fn(css(core()))))
      , result

    ripple('foo.css', '* { color: red }', { hash: 'hash' })
    ripple('css-2', function(){ result = true })
    ripple.draw()

    time(40, function() {
      expect(all('style', head).length).to.equal(1)
      done()
    })
  })

  it('should render component when css becomes available', function(done){  
    container.innerHTML = '<css-3 css="foo.css"><a></a></css-3>'
    var ripple = precss(components(fn(css(core()))))
      , result = 0

    ripple('css-3', function(){ result++ })

    time(50, function(){
      ripple('foo.css', '* { color: red }', { hash: 'hash' })
    })
    
    time(150, function(){
      expect(result).to.equal(1)
      expect(head.lastChild.outerHTML).to.equal('<style resource="foo.css">[css~="foo.css"] * { color: red }</style>')
      done()
    })
  })

  it('should render component with no css dep', function(done){  
    container.innerHTML = '<css-4></css-4>'
    var ripple = precss(components(fn(css(core()))))
      , result

    ripple('css-4', function(){ result = true })
    ripple.draw()

    time(40, function() {
      expect(result).to.be.ok
      done()
    })
  })

  it('should not render component with css not loaded', function(done){  
    container.innerHTML = '<css-5 css="foo.css"><a></a></css-5>'
    var ripple = precss(components(fn(css(core()))))
      , result

    ripple('css-5', function(){ result = true })
    ripple.draw()

    time(40, function() {
      expect(result).to.not.be.ok
      done()
    })
  })

  it('should render component with css loaded with shadow', function(done){  
    container.innerHTML = '<css-shadow css="foo.css"><a></a></css-shadow>'

    var ripple = shadow(precss(components(fn(css(core())))))
      , hasShadow = document.head.createShadowRoot
      , expected = hasShadow 
          ? '<style resource="foo.css">* { color: red }</style>'
          : '<style resource="foo.css">[css~="foo.css"] * { color: red }</style>'
      , result
      , el = container.firstChild

    ripple('foo.css', '* { color: red }', { hash: 'hash' })
    ripple('css-shadow', function(){ result = true })
    ripple.draw()

    time(40, function() {
      expect(result).to.be.ok
      expect(hasShadow ? el.shadowRoot.firstChild.outerHTML : head.lastChild.outerHTML).to.equal(expected)
      expect(getComputedStyle(el.shadowRoot.firstChild).color).to.be.eql('rgb(255, 0, 0)')
      expect(getComputedStyle(document.body).color).to.not.eql('rgb(255, 0, 0)')
      done()
    })

  })

  it('should not mess up keyframes', function(done){  
    container.innerHTML = '<css-keyframes css="foo.css">'
    var ripple = precss(components(fn(css(core()))))
      , keyframes = '@keyframes fade-in {\n'
                  + '0% { opacity: 0; }\n'
                  + '100% { opacity: 0.5; }\n'
                  + '}'

    ripple('css-keyframes', noop)
    ripple('foo.css', keyframes, { hash: 'hash' })
    ripple.draw()

    time(40, function() {
      expect(raw('style', head).innerHTML).to.equal(keyframes)
      done()
    })

  })

  it('should not be greedy with :host brackets', function(done){  
    container.innerHTML = '<css-greedy css="foo.css">'
    var ripple = precss(components(fn(css(core()))))
      , style = ':host(.full) header > :not(h3) { }'

    ripple('css-greedy', noop)
    ripple('foo.css', style, { hash: 'hash' })
    ripple.draw()

    time(40, function() {
      expect(raw('style', head).innerHTML).to.equal('[css~="foo.css"].full header > :not(h3) { }')
      done()
    })
  })

  it('should update components with multiple css deps', function(done){  
    container.innerHTML = '<css-multi css="foo.css bar.css">'
    var ripple = precss(components(fn(css(core()))))
      , result

    ripple('css-multi', function(){ result = true })
    ripple('foo.css', ' ', { hash: 'hash' })

    time(40, function(){
      expect(result).to.not.be.ok
      ripple('bar.css', ' ', { hash: 'hash' })
      expect(result).to.not.be.ok
    })

    time(80, function(){
      expect(result).to.be.ok
      expect(raw('[resource="foo.css"]')).to.be.ok
      expect(raw('[resource="bar.css"]')).to.be.ok
      done()
    })
  })

  it('should parse :host-context', function(done){  
    container.innerHTML = '<css-context css="foo.css">'
    var ripple = precss(components(fn(css(core()))))
      , style = ':host-context(.full:not(.a)) { }'

    ripple('css-context', noop)
    ripple('foo.css', style, { hash: 'hash' })
    ripple.draw()

    time(40, function() {
      expect(raw('style', head).innerHTML).to.equal('.full:not(.a) [css~="foo.css"] { }')
      done()
    })
  })

  it('should prefix additional css modules accordingly', function(done){  
    container.innerHTML = '<css-prefix css="css-prefix.css foo.css bar.css">'
    var ripple = precss(components(fn(css(core()))))
    ripple('css-prefix.css', '.css-prefix {}', { hash: 'hash' })
    ripple('foo.css', '.foo {}', { hash: 'hash' })
    ripple('bar.css', '.bar {}', { hash: 'hash' })
    ripple('css-prefix', noop)
    ripple.draw()

    time(40, function() {
      expect(raw('[resource="css-prefix.css"]').innerHTML).to.equal('[css~="css-prefix.css"] .css-prefix {}')
      expect(raw('[resource="foo.css"]').innerHTML).to.equal('[css~="foo.css"] .foo {}')
      expect(raw('[resource="bar.css"]').innerHTML).to.equal('[css~="bar.css"] .bar {}')
      done()
    })
  })

  it('should not prefix if :host present', function(done){  
    container.innerHTML = '<css-host css="foo.css">'
    var ripple = precss(components(fn(css(core()))))
      
    ripple('css-host', noop)
    ripple('foo.css', '.foo :host(.is-sth) .bar {}', { hash: 'hash' })
    ripple.draw()

    time(40, function() {
      expect(raw('style', head).innerHTML).to.equal('.foo [css~="foo.css"].is-sth .bar {}')
      done()
    })
  })

  it('should transform empty :host()', function(done){  
    container.innerHTML = '<css-empty css="foo.css">'
    var ripple = precss(components(fn(css(core()))))
      
    ripple('css-empty', noop)
    ripple('foo.css', ':host() {}', { hash: 'hash' })
    ripple.draw()

    time(40, function() {
      expect(raw('style', head).innerHTML).to.equal('[css~="foo.css"] {}')
      done()
    })
  })
  
  it('should transform empty :host-context()', function(done){  
    container.innerHTML = '<css-empty-context css="foo.css">'
    var ripple = precss(components(fn(css(core()))))
      
    ripple('css-empty-context', noop)
    ripple('foo.css', ':host-context() {}', { hash: 'hash' })
    ripple.draw()

    time(40, function() {
      expect(raw('style', head).innerHTML.trim()).to.equal('[css~="foo.css"] {}')
      done()
    })
  })

  it('should transform :host in a list', function(done){  
    container.innerHTML = '<css-host-list css="foo.css">'
    var ripple = precss(components(fn(css(core()))))
      
    ripple('css-host-list', noop)
    ripple('foo.css', ':host,\n.foo {}', { hash: 'hash' })
    ripple.draw()

    time(40, function() {
      expect(raw('style', head).innerHTML.trim()).to.equal('[css~="foo.css"],\n[css~="foo.css"] .foo {}')
      done()
    })
  })

  it('should only render if stylesheet hash changed', function(done){  
    container.innerHTML = '<css-hash css="foo.css"><a></a></css-hash>'
    var ripple = precss(components(fn(css(core()))))
      , result = 0

    ripple('css-hash', function(){ result++ })
    ripple('foo.css', '* { color: red }', { hash: 'hash' })

    time(40, function(){
      expect(head.lastChild.outerHTML).to.equal('<style resource="foo.css">[css~="foo.css"] * { color: red }</style>')
      ripple('foo.css', '* { color: green }', { hash: 'hash' })
    })
    
    time(80, function(){
      expect(head.lastChild.outerHTML).to.equal('<style resource="foo.css">[css~="foo.css"] * { color: red }</style>')
      ripple('foo.css', '* { color: blue }', { hash: 'diff' })
    })

    time(120, function(){
      expect(head.lastChild.outerHTML).to.equal('<style resource="foo.css">[css~="foo.css"] * { color: blue }</style>')
      done()
    })
  })
})