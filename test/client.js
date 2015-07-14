var expect = require('chai').expect
  , components = require('components')
  , noop = require('utilise/noop')
  , all = require('utilise/all')
  , shadow = require('rijs.shadow')
  , precss = require('../')
  , core = require('rijs.core')
  , css = require('rijs.css')
  , fn = require('rijs.fn')
  , container = document.createElement('div')
  , el
  
describe('Scoped CSS', function(){

  before(function(){
    document.body.appendChild(container)
  })
  
  beforeEach(function(done){
    container.innerHTML = '<css-1></css-1>'
                        + '<css-2 css="foo.css"></css-2>'

    el = container.children[1]
    setTimeout(done, 50)
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
    expect(el.innerHTML).to.equal('<style resource="foo.css">css-2 * { color: red }</style>')
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

    expect(all('style', container).length).to.equal(1)
  })

  it('should render component when css becomes available', function(done){  
    var ripple = precss(components(fn(css(core()))))
      , result = 0

    ripple('css-2', function(){ result++ })

    setTimeout(function(){
      ripple('foo.css', '* { color: red }')
    }, 50)
    
    setTimeout(function(){
      expect(result).to.equal(1)
      expect(el.innerHTML).to.equal('<style resource="foo.css">css-2 * { color: red }</style>')
      done()
    }, 150)
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
      , expected = document.head.createShadowRoot 
          ? '<style>* { color: red }</style>'
          : '<style resource="foo.css">css-2 * { color: red }</style>'

      , result

    ripple('foo.css', '* { color: red }')
    ripple('css-2', function(){ result = true })
    ripple.draw()

    expect(result).to.be.ok
    expect(el.shadowRoot.innerHTML).to.equal(expected)
    expect(getComputedStyle(el.shadowRoot.firstChild).color).to.be.eql('rgb(255, 0, 0)')
    expect(getComputedStyle(document.body).color).to.not.eql('rgb(255, 0, 0)')
  })

})