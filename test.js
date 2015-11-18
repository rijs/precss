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
    clean = document.head.innerHTML
  })
  
  beforeEach(function(done){
    document.head = clean
    container.innerHTML = '<css-1></css-1>'
                        + '<css-2 css="foo.css"><a></a></css-2>'

    el = container.children[1]
    time(50, done)
  })

  after(function(){
    document.body.removeChild(container)
  })

  it('should render component with css loaded', function(){  
    var ripple = precss(components(fn(css(core()))))
      , result

    ripple('foo.css', '* { color: red }')
    ripple('css-2', function(){ result = true })
    ripple.draw()

    expect(result).to.be.ok
    expect(head.lastChild.outerHTML).to.equal('<style resource="foo.css">css-2 * { color: red }</style>')
    expect(getComputedStyle(el.firstChild).color).to.be.eql('rgb(255, 0, 0)')
    expect(getComputedStyle(document.body).color).to.not.eql('rgb(255, 0, 0)')
  })

  it('should not append css twice outside shadow dom', function(){  
    var ripple = precss(components(fn(css(core()))))
      , result

    container.innerHTML += '<css-2 css="foo.css"></css-2>'

    ripple('foo.css', '* { color: red }')
    ripple('css-2', function(){ result = true })
    ripple.draw()

    expect(all('style', head).length).to.equal(1)
  })

  it('should render component when css becomes available', function(done){  
    var ripple = precss(components(fn(css(core()))))
      , result = 0

    ripple('css-2', function(){ result++ })

    time(50, function(){
      ripple('foo.css', '* { color: red }')
    })
    
    time(150, function(){
      expect(result).to.equal(1)
      expect(head.lastChild.outerHTML).to.equal('<style resource="foo.css">css-2 * { color: red }</style>')
      done()
    })
  })

  it('should render component with no css dep', function(){  
    var ripple = precss(components(fn(css(core()))))
      , result

    ripple('css-1', function(){ result = true })
    ripple.draw()

    expect(result).to.be.ok
  })

  it('should not render component with css not loaded', function(){  
    var ripple = precss(components(fn(css(core()))))
      , result

    ripple('css-2', function(){ result = true })
    ripple.draw()

    expect(result).to.not.be.ok
  })

  it('should render component with css loaded with shadow', function(){  
    var ripple = shadow(precss(components(fn(css(core())))))
      , hasShadow = document.head.createShadowRoot
      , expected = hasShadow 
          ? '<style resource="foo.css">* { color: red }</style>'
          : '<style resource="foo.css">css-2 * { color: red }</style>'
      , result

    ripple('foo.css', '* { color: red }')
    ripple('css-2', function(){ result = true })
    ripple.draw()

    expect(result).to.be.ok
    expect(hasShadow ? el.shadowRoot.firstChild.outerHTML : head.lastChild.outerHTML).to.equal(expected)
    expect(getComputedStyle(el.shadowRoot.firstChild).color).to.be.eql('rgb(255, 0, 0)')
    expect(getComputedStyle(document.body).color).to.not.eql('rgb(255, 0, 0)')
  })

  it('should not mess up keyframes', function(){  
    var ripple = precss(components(fn(css(core()))))
      , keyframes = '@keyframes fade-in {\n'
                  + '0% { opacity: 0; }\n'
                  + '100% { opacity: 0.5; }\n'
                  + '}'

    ripple('css-2', noop)
    ripple('foo.css', keyframes)
    ripple.draw()

    expect(raw('style', head).innerHTML).to.equal(keyframes)
  })

  it('should not be greedy with :host brackets', function(){  
    var ripple = precss(components(fn(css(core()))))
      , style = ':host(.full) header > :not(h3) { }'

    ripple('css-2', noop)
    ripple('foo.css', style)
    ripple.draw()

    expect(raw('style', head).innerHTML).to.equal('css-2.full header > :not(h3) { }')
  })

  it('should update components with multiple css deps', function(done){  
    container.innerHTML = '<css-2 css="foo.css bar.css">'

    var ripple = precss(components(fn(css(core()))))
      , result

    ripple('css-2', function(){ result = true })
    ripple('foo.css', ' ')

    time(30, function(){
      expect(result).to.not.be.ok
      ripple('bar.css', ' ')
      expect(result).to.not.be.ok
    })

    time(60, function(){
      expect(result).to.be.ok
      expect(raw('[resource="foo.css"]')).to.be.ok
      expect(raw('[resource="bar.css"]')).to.be.ok
      done()
    })
  })

  it('should parse :host-context', function(){  
    var ripple = precss(components(fn(css(core()))))
      , style = ':host-context(.full) { }'

    ripple('css-2', noop)
    ripple('foo.css', style)
    ripple.draw()

    expect(raw('style', head).innerHTML).to.equal('.full css-2 { }')
  })

})