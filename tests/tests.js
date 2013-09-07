QUnit.module('Space')

test('Space', function() {
  ok(Space, 'Space class should exist')
  ok(new Space() instanceof Space, 'Space should return a space')
  var space = new Space('hello world')
  equal(space._keys.length, 1, 'keys array should have 1 property')
  equal(space._keys.indexOf('hello'), 0, 'keys array should be correct')
  equal(space._values['hello'], 'world', 'value should be correct')
  equal(space.get('hello'), 'world', 'Properties should be accessible')
  equal(typeof space._values.hello, 'string', 'Leafs should be strings')
  
  space.set('foo', 'bar')
  equal(space._values.foo, 'bar', 'Spaces should be modifiable')
  
  space = new Space('foobar\n one 1')
  equal(typeof space._values.foobar, 'object', 'Spaces should be objects')
  ok(space._values.foobar instanceof Space, 'Nested spaces should be spaces')
  
  space = new Space('list\nsingle value')
  equal(space._keys.length, 2, 'Space should have 2 names')
  ok(space._values.list instanceof Space, 'A name without a trailing space should be a space')
  
  space = new Space('body')
  ok(space._values.body instanceof Space, 'A name without a trailing space should be a space')
  
  space = new Space({foobar: 'hello'})
  equal(space._values.foobar, 'hello', 'Spaces can be created from object literals')
  
  space = new Space({foobar: new Space('hello world')})
  equal(space.get('foobar hello'), 'world', 'Spaces can be created from objects mixed with spaces')

  space = new Space({foobar: {hello : { world : 'success'}}})
  equal(space._values.foobar._values.hello._values.world, 'success', 'Spaces can be created from deep objects')

  // test multline creation
  string = 'user\n\
name Aristotle\n\
admin false\n\
stage\n\
name home\n\
domain test.test.com\n\
pro false\n\
domains\n\
 test.test.com\n\
  images\n\
  blocks\n\
  users\n\
  stage home\n\
  pages\n\
   home\n\
    settings\n\
     data\n\
      title Hello, World\n\
    block1\n\
     content Hello world\n'

  space = new Space(string)
  equal(space.get('domains test.test.com pages home settings data title'), 'Hello, World', 'Multiline creation should be okay.')

})

test('append', function() {
  var a = new Space('hello world')
  var count = 0
  a.on('append', function (key, value) {
    count++
  })
  a.append('foo', 'bar')
  a.set('foo2', 'bar')
  equal(a.get('foo'), 'bar')
  equal(count, 1)
})


test('clear', function() {
  var a = new Space('hello world')
  equal(a._keys.length, 1)
  ok(a.clear() instanceof Space, 'clear should return this so its chainable')
  equal(a._keys.length, 0)
  
  var a = new Space('hello world')
  a.clear('foo bar')
  ok(!a.get('hello'))
  equal(a.get('foo'), 'bar')
  

})

test('clone', function() {
  var a = new Space('hello world')
  var b = a.clone()
  equal(b._values.hello, 'world')
  b.set('hello', 'mom')
  equal(a._values.hello, 'world')
  var c = a
  equal(c._values.hello, 'world')
  c.set('hello', 'foo')
  equal(a._values.hello, 'foo')
  var d = c
  equal(d._values.hello, 'foo')
  d.set('hello', 'hiya')
  equal(a._values.hello, 'hiya')

  a.set('test', 'boom')
  equal(d.get('test'), 'boom')
  a.set('foobar', new Space('123 456'))
  equal(c.get('foobar 123'), '456')

  e = a
  equal(e.get('foobar 123'), '456')
  f = a.clone()
  equal(f.get('foobar 123'), '456')
  f.hi = 'test'
  equal(a.hi, undefined)

})

test('create', function() {
  var a = new Space('hello world')
  var count = 0
  a.on('create', function (key, value) {
    count++
  })
  a.create('foo', 'bar')
  a.set('foo2', 'bar')
  equal(a.get('foo'), 'bar')
  equal(count, 1)
})

test('delete', function() {

  var a = new Space()
  a.set('name', 'Breck')
  equal(a.get('name'), 'Breck', 'name is set')
  equal(a._keys.length, 1, 'length okay')
  a.delete('name')
  equal(a.get('name'), undefined, 'name is gone')
  equal(a._keys.length, 0, 'length okay')
  a.set('earth north_america united_states california san_francisco', 'mission')
  ok(a.get('earth north_america united_states california') instanceof Space)
  equal(a.get('earth north_america united_states california san_francisco'), 'mission', 'neighborhood is set')
  equal(a.get('earth north_america united_states california')._keys.length, 1, 'length okay')
  equal(a._keys.length, 1, 'length okay')  
  ok(a.delete('earth north_america united_states california san_francisco') instanceof Space, 'returns space')
  equal(a.get('earth north_america united_states california san_francisco'), undefined, 'neighborhood is gone')
  
  var a = new Space('type meta\n')
  a.delete('content')
  equal(a.get('type'), 'meta', 'delete a non existing entry works')
  
  
  // #28
  var a = new Space()
  a.delete(2)
  
  
})

/*
test('dupes', function () {
  space = new Space('time 123\ntime 456')
  equal(space.length(), 2)
  equal(space.toString(), 'time 123\ntime 456\n')
})
*/

test('diff of subclasses', function() {
  
  
  function Page (space) {

    this.clear()

    if (space)
      this.patch(space)
    return this
  }

  Page.prototype = new Space()

  function Block (id, space) {

    this.clear()

    this.id = id
    if (space)
      this.patch(space)
  }

  Block.prototype = new Space()

  var a = new Space('hello world')
  var b = new Space('hello mom')
  var c = new Space('first John')

  
  equal(a.diff(b).toString(), 'hello mom\n')
  ok(a.diff(c) instanceof Space, 'diff is a space')
  equal(a.diff(c)._values.hello, '')
  equal(a.diff(c).toString(), 'hello \nfirst John\n')
  
  equal(a.diff(c)._values.first, 'John')

  a = new Space('hi 1')
  b = new Space('hi 1')
  var diff = a.diff(b)
  ok(diff instanceof Space, 'diff is a space')
  equal(diff.toString(), '', 'No difference')


  a = new Space('hi 1')
  b = new Space()
  b.set('hi', 1)
  equal(a.diff(b), '')
  
  
  var d = new Space()
  var e = new Space('z-index 0')
  var patch = d.diff(e)
  equal(patch.toString(), 'z-index 0\n')
  e['z-index'] = 0
  var patch = d.diff(e)
  equal(patch.toString(), 'z-index 0\n')
  
  var page = new Page('body\n b1\n  content hi')
  
  var page4 = new Page()
  equal(page4.toString(), '', 'No properties in new instance')
  
  var page2 = new Page('body\n b1\n  content hi')
  var block = new Block('foobar')
  var block2 = new Block('b2')
  ok(block instanceof Space, 'block is instance of Space')
  ok(block instanceof Block, 'block is instance of Block')
  equal(block.id, 'foobar', 'id is set')
  equal(block2.id, 'b2', 'id is set')
  
  var diff = block.diff(block2)
  
  equal(diff._keys.length, 0, 'Difference between 2 spaces should not check privates.')
  var diff = block2.diff(block)
  equal(diff._keys.length, 0, 'Difference between 2 spaces should not check privates.')
  
  ok(page instanceof Space, 'page is instance of Space')
  ok(page instanceof Space, 'page is instance of Page')
  ok(page._keys.length, 'page has 1 name/value')
  
  
  page.set('body foobar', block)
  
  
  page2.set('body foobar', block2)
  diff = page.diff(page2)
  equal(page.toString(), page2.toString(), 'Pages should be equal')
  equal(diff._keys.length, 0, 'Difference between 2 composites should not check privates in sub parts.')
  
  
  ok(page.get('body foobar') instanceof Block, 'block1 is instance of Block')
  
  var page3 = new Page('body\n b1\n  content hibob')
  

  diff = page3.diff(page2)
  ok(diff.get('body foobar') instanceof Space, 'block1 in page3 diff is instance of space')
  ok(!diff._values.body._values.foobar.id, 'id did not get set')
  
})

test('diffOrder', function() {
  
  
  // Recursive order diff
  var a = new Space('body\n content hello world\n value Hi\n')
  var b = new Space('body\n value Hi\n content hello world\n')
  equal(a.diffOrder(b).toString(), 'body\n value\n content\n', 'different')
  
  
  
  var a = new Space('hi world\nhello bob\nhola dude\nyo man')
  var b = new Space('hi world\nhello bob\nhola dude\nyo man')
  var c = new Space('hi world\nhello bob\nyo man\nhola dude')
  equal(a.diffOrder(b).toString(), '', 'no diff')
  equal(a.diffOrder(c).toString(), 'hi\nhello\nyo\nhola\n', 'different')
  
  
})

test('diff between a blank key/value and empty object', function() {

  var a = new Space('hi ')
  var b = new Space('hi\n')
  strictEqual(a.get('hi'), '', 'hi is equal to empty string')
  ok(b.get('hi') instanceof Space, 'b is instance of space')
  equal(typeof a.get('hi'), 'string')
  equal(typeof b.get('hi'), 'object')
  notStrictEqual(a.get('hi'), b.get('hi'))
  
  equal(a.toString(), 'hi \n', 'a should be a key with empty string value')
  equal(b.toString(), 'hi\n')

})

test('duplicate key', function() {

var spaceWithDupe = 'height 45px\n\
height 50px\n\
width 56px'

  var value = new Space(spaceWithDupe)
  // When turning a string into a Space object and given a duplicate key, last item should win
  equal(value.get('height'), '50px')

})

test('each', function() {

  var value = new Space('hello world\nhi mom')
  var string = ''
  equal(value.each(function (key, value) {
    string += key.toUpperCase()
    string += value.toUpperCase()
    string += this._keys.length
  }).length(), 2, 'test chaining')
  equal(string, 'HELLOWORLD2HIMOM2')
  
  // test breaking
  var count  = 0
  var value = new Space('hello world\nhi mom')
  value.each(function (key, value) {
    count++
    if (key === 'hello')
      return false
  })
  equal(count, 1)
})

test('events', function() {

  var value = new Space('hello world\nhi mom')
  var result = ''
  var popsMethod = function () {
    result = 'pops'
  }
  value.on('change', popsMethod)
  value.set('hi', 'dad')
  equal(result, 'pops')
  result = ''
  value.off('change', popsMethod)
  value.set('hi', 'pop')
  equal(result, '')
  
  
  var count = 0
  var inc = function () {
    count++
  }
  value.on('set', inc)
  value.on('patch', inc)
  value.on('clear', inc)
  value.on('delete', inc)
  value.on('rename', inc)
  value.set('yo', 'bob')
  value.patch('foo bar')
  value.delete('yo')
  value.rename('foo', 'foo2')
  value.clear()
  equal(count, 5)
  
  // Event params
  var a = new Space('hello world')
  var b = ''
  var c = ''
  var setCount = 0
  a.on('set', function (key, value) {
    b = value
  })
  var changeCount = 0
  a.on('change', function () {
    changeCount++
  })
  a.on('patch', function (patch) {
    c = patch
  })
  a.on('set', function (key, value) {
     setCount++
  })
  a.set('hello', 'bob')
  a.patch('hi mom')
  equal(b, 'bob')
  equal(c, 'hi mom')
  equal(setCount, 1)
  equal(changeCount, 2)
  
})

test('event bubbling', function() {
  var count = 0
  var cafe = new Space('name Haus\nmenu\n coffee\n  light\n   price 2.50\n  dark\n   price 3\n')
  cafe.get('menu coffee light').on('change', function () {
    count++
  })
//  cafe.set('menu coffee light price', '5')
  cafe.get('menu coffee light').set('price', '6')
  equal(count, 1)
  
})

test('every', function() {
  

 var obj = new Space('user\n\
name Aristotle\n\
admin false\n\
stage\n\
 name home\n\
 domain test.test.com\n\
pro false\n\
domains\n\
 test.test.com\n\
  images\n\
  blocks\n\
  users\n\
  stage home\n\
  pages\n\
   home\n\
    settings\n\
     data\n\
      title Hello, World\n\
    block1\n\
     content Hello world\n')
  var i = 0
  obj.every(function (key, value) {
    this.rename(key, key.toUpperCase())
    i++
  })
    
  equal(i, 20)
  equal(obj.get('DOMAINS TEST.TEST.COM PAGES HOME SETTINGS').toString(), 'DATA\n TITLE Hello, World\n')
  
})

test('find', function() {

  var a = new Space('john\n age 5\nsusy\n age 6\nbob\n age 10')
  
  equal(a.find('age', '5').length(), 1)
//  equal(a.find('age', /(5|6)/).length(), 2)
//  equal(a.find('age', function (value) {return value > 4}).length(), 3)

})


test('first', function() {

  var value = new Space('hello world\nhi mom')
  equal(value.get(0), 'world')
})


test('get', function() {

  var value = new Space('hello world')
  equal(value.get('hello'), 'world')
  
  // get non existant value
  
  var value = new Space().get('some long path')
  strictEqual(value, undefined)
  
  
  var value = new Space().get('some')
  strictEqual(value, undefined)
  

})

test('_getValueByIndex', function() {

  var value = new Space('hello world\nhow are you\nhola friend')
  equal(value._getValueByIndex(0), 'world')
  equal(value._getValueByIndex(1), 'are you')
  equal(value._getValueByIndex(2), 'friend')
  equal(value._getValueByIndex(3), undefined)
  equal(value._getValueByIndex(-1), 'friend')
})

test('_getIndexByKey', function () {
  space = new Space('hello world')
  equal(space._getIndexByKey('hello'), 0)
  equal(space._getIndexByKey('hello2'), -1)
})

test('getTokens', function() {

  var value = new Space('hello world')
  equal('KKKKKSVVVVV', value.getTokens())
  
  var value = new Space('hello mom')
  equal('KKKKKSVVV', value.getTokens())
  
  var value =     new Space('first Breck' + '\n' + 'last Yunits')
  equal(value.getTokens(), 'KKKKKSVVVVV' + 'N'  + 'KKKKSVVVVVV')
  
  var value =     new Space('a\n a1 hi\n a2 yo\n')
  equal(value.getTokens(), 'KNNKKSVVNNKKSVV')
  
  var value =     new Space('a\n a1 hi\n a2 yo\nyo hi')
  equal(value.getTokens(), 'KNNKKSVVNNKKSVVNKKSVV')
  
  
  var value =     new Space()
  value.set('multi', 'line1\nline2')
  equal(value.getTokens(), 'KKKKKSVEVVVVVVEVVVVV')
  
})

test('getTokensConcise', function() {
  var value =     new Space()
  value.set('multi', 'line1\nline2')
  equal(value.getTokensConcise(), 'KSVEVEV')
  
  var value =     new Space('a\n a1 hi\n a2 yo\n')
  equal(value.getTokensConcise(), 'KNKSVNKSV')
  
  var value =     new Space('a\n a1 hi\n a2 yo\nyo hi')
  equal(value.getTokensConcise(), 'KNKSVNKSVNKSV')
})

// https://github.com/nudgepad/space/issues/58
test('get expecting a branch but hitting a leaf', function() {
  var value = new Space('posts leaf')
  equal(undefined, value.get('posts branch'))
  
})


test('has', function () {
  space = new Space('hello world')
  equal(space.has('hello'), true)
  equal(space.has('world'), false)
})

test('hasOwnProperty bug', function () {
  var foo = { bar : foo}
  foo.hasOwnProperty = null
  space = new Space(foo)
  ok(space)
})

test('isEmpty', function() {

  var a = new Space()
  equal(a.isEmpty(), true)
  var a = new Space('john\n age 5\nsusy\n age 6\nbob\n age 10')
  equal(a.isEmpty(), false)

})

test('isASet', function() {

  var a = new Space('john\n age 5\nsusy\n age 6\nbob\n age 10')
  equal(a.isASet(), true)

})

test('key count', function() {

  var a = new Space('john\n age 5\nsusy\n age 6\nbob\n age 10')
  equal(a._keyCount(), 6)
  var b = new Space('')
  equal(b._keyCount(), 0)
  var c = new Space('hello world')
  equal(c._keyCount(), 1)
})


test('last', function() {

  var value = new Space('hello world\nhi mom')
  equal(value.get(-1), 'mom')
})

test('loadFromString', function() {

  a = new Space('text \n this is a string\n and more')

  equal(a._values.text, 'this is a string\nand more')

  b = new Space('a\n text \n  this is a string\n  and more')
  equal(b.get('a text'), 'this is a string\nand more')
  equal(b.toString(), 'a\n text \n  this is a string\n  and more\n')

  var string = 'first_name John\nlast_name Doe\nchildren\n 1\n  first_name Joe\n  last_name Doe\n  children\n   1\n    first_name Joe Jr.\n    last_name Doe\n    age 12\ncolors\n blue\n red\nbio \n Hello this is\n my multline\n biography\n \n Theres a blank line in there as well\n \n \n Two blank lines above this one.\ncode <p></p>\n'
  c = new Space(string)
  equal(c.get('children 1 children 1 age'), '12')
  equal(c.toString().length, string.length)
  equal(c.toString(), string)

})

test('matches leak', function() {
  var foo = new Space('hello world')
  equal(typeof(matches), "undefined")
})


test('multiline', function () {
  
  var a = new Space('my multiline\n string')
  equal(a.get('my'), 'multiline\nstring')
  
  // If you have a SPACE\n to start a multiline string, we
  // effectively ignore that first newline
  var a = new Space('my \n \n multiline\n string')
  equal(a.get('my'), '\nmultiline\nstring')
  
})

test('next', function() {

  var a = new Space('john\n age 5\nsusy\n age 6\nbob\n age 10')

  
  equal(a.next('john'), 'susy')
  equal(a.prev('john'), 'bob')
  equal(a.next('susy'), 'bob')
  equal(a.prev('susy'), 'john')
  equal(a.prev('bob'), 'susy')
  equal(a.next('bob'), undefined)
  
  equal(a.next('foobar'), 'john')
  
  
})

test('object count', function() {

  var a = new Space('john\n age 5\nsusy\n age 6\nbob\n age 10')
  equal(a._objectCount(), 3)
  var b = new Space('')
  equal(b._objectCount(), 0)
  var c = new Space('hello world')
  equal(c._objectCount(), 0)
  
})

test('order', function() {

  var a = new Space('john\n age 5\nsusy\n age 6\nbob\n age 10')
  var keys = a._keys.join(' ')
  equal(keys, 'john susy bob', 'order is preserved')
  
})

test('patch', function() {

  var a = new Space('hello world')
  equal(a.get('hello'), 'world')
  var b = new Space('hello mom')
  a.patch(b)
  equal(a._values.hello, 'mom')
  var c = new Space('hello mom')
  c.set('hello', new Space('foo\n cell 123'))
  a.patch(c)
  equal(a.get('hello foo cell'), '123')


  a = new Space('style\n background-color rgb(57, 112, 1)\n border 17px solid white\n color rgb(0, 0, 0)\n font-family Lato\n font-size 16px\n height 100\n left 379px\n top 200\n width 274px\n border-radius 35px\n')
  b = new Space('height 203\ntop 117\n')
  a._values.style.patch(b)
  equal(a._values.style._values.height, '203')
  equal(a._values.style._values.top, '117')

  a = new Space('background-color rgb(57, 112, 1)\nborder 17px solid white\ncolor rgb(0, 0, 0)\nfont-family Lato\nfont-size 16px\nheight 199px\nleft 379px\ntop 117px\nwidth 274px\nborder-radius 35px\n')
  b = new Space('height 202\ntop 117\n')
  a.patch(b)
  equal(a._values.height, '202')
  equal(a._values.top, '117')

  a = new Space('first John\nlast Doe')
  b = new Space('last\n 1 Doe\n 2 Smith')
  c = new Space('last Aaron')
  a.patch(b)
  equal(a.get('last 2'), 'Smith', 'test 2')
  a.patch(c)
  equal(a._values.last, 'Aaron')

  var patch = new Space()
  patch.set('first', 'Frank')
  patch.set('last', 'Grimes')
  a.patch(new Space(new Space(patch)))
  equal(a._values.last, 'Grimes')
  equal(a._values.first, 'Frank')
  
  // delete an element
  var page = new Space()
  page.set('text', new Space('content hello world'))
  equal(page._keys.length, 1, 'item deleted')
  page.patch(new Space('text '))
  equal(page._keys.length, 0, 'item deleted')
  
  var pages = new Space()
  pages.set('page1', new Space('text\n content hello world'))
  equal(pages.get('page1')._keys.length, 1)
  pages.get('page1').patch('text')
  equal(pages.get('page1')._keys.length, 0)
  
  
  var a = new Space('type meta\n')
  var b = new Space('content\n')
  a.patch(b)
  equal(a._keys.length, 1, 'patch okay')
  equal(a.get('type'), 'meta', 'patch okay')
  var space = new Space('meta\n type meta')
  var patch = new Space('meta\n content')
  space.patch(patch)
  equal(space.get('meta type'), 'meta', 'patch okay')
})

test('patch performance test', function() {
  var space = new Space()
  for (var i = 0; i < 1000; i++) {
    var patch = new Space()
    patch.set(Math.random(), new Space('foobar hello\nworld world\nnested\n element 1\n element2\n  foobar hi'))
    patch.set(Math.random(), 'foobar')
    space.patch(patch)
  }
  equal(space._keys.length, 2000)
})

test('path functions', function() {
  equal(Space.pathLeaf('football'), 'football')
  equal(Space.pathLeaf('page header'), 'header')
  equal(Space.pathLeaf('page header content'), 'content')
  
  equal(Space.pathBranch('football'), '')
  equal(Space.pathBranch('page header'), 'page')
  equal(Space.pathBranch('page header content'), 'page header')
  
  
})

test('pop', function() {

  var a = new Space('john\n age 5\nsusy\n age 6\nbob\n age 10')
  equal(a.length(), 3)
  equal(a.pop().toString(), 'bob\n age 10\n')
  equal(a.length(), 2)
  
  var empty = new Space()
  equal(empty.pop(), null)
  
})

test('prev', function() {

  var a = new Space('john\n age 5\nsusy\n age 6\nbob\n age 10')
  
  equal(a.next('john'), 'susy')
  equal(a.prev('john'), 'bob')
  equal(a.next('susy'), 'bob')
  equal(a.prev('susy'), 'john')
  equal(a.prev('bob'), 'susy')
})

test('push', function() {

  var a = new Space()
  a.push('hello world')
  equal(a.get('0'), 'hello world')
  a.push(new Space())
  ok(a.get('1') instanceof Space)
})

test('query', function() {


  var string = new Space('user\n\
 name Aristotle\n\
 admin false\n\
 stage\n\
  name home\n\
  domain test.test.com\n\
 pro false\n\
 domains\n\
  test.test.com\n\
   images\n\
   blocks\n\
   users\n\
   stage home\n\
   pages\n\
    home\n\
     settings\n\
      data\n\
       title Hello, World\n\
     block1\n\
      content Hello world\n')

  var query = new Space('user\n name\n domains\n  test.test.com\n   pages\n    home\n     block1')
  var result = string.get(query)
  ok(result instanceof Space, 'Retrieve returns a space')
  equal(result._keys.length, 1, '1 root node')
  equal(result.get('user name'), 'Aristotle', 'Name retrieved successfully')
  ok(typeof result.get('user pro') === 'undefined', 'Did not retrieve pro value')
  equal(result.get('user domains test.test.com pages home block1 content'), 'Hello world')
})

test('rename', function() {

  var a = new Space('john\n age 5\nsusy\n age 6')
  equal(a._keys[0], 'john', 'index okay')
  ok(a.rename('john', 'breck') instanceof Space, 'returns itself for chaining')
  equal(a._keys[0], 'breck', 'index okay')
  equal(a.get('breck age'), '5', 'value okay')
  
  var page = new Space()
  page.set('header content', 'football')
  page.rename('header content', 'header text')
  equal(page.get('header text'), 'football')
  
})

test('reorder', function() {
  var a = new Space('hello world\n')
  a.set('hi', 'mom')
  equal(a._keys.join(''), 'hellohi', 'order correct')
  a.set('yo', 'pal', 0)
  equal(a._keys.join(''), 'yohellohi', 'order correct')
  
  a.set('hola', 'pal', 2)
  equal(a._keys.join(''), 'yohelloholahi', 'order correct')
  
  a.patchOrder('hello\nhi\nhola\nyo')
  equal(a._keys.join(''), 'hellohiholayo', 'order correct')
  a.patchOrder('yo\nhola\nhi\nhello')
  equal(a._keys.join(''), 'yoholahihello', 'order correct')
  equal(a.get('yo'), 'pal', 'keys okay')
  
  // Recursive
  a = new Space('b\n content hi\n value foobar')
  b = new Space('b\n value foobar\n content hi')
  equal(a.diffOrder(b).toString(), 'b\n value\n content\n', 'diff order correct')
  equal(a.patchOrder(a.diffOrder(b)).toString(), b.toString(), 'recursive order patch')
  
})

test('set', function() {

  var value = new Space('hello world')
  equal(value.get('hello'), 'world')
  ok(value.set('hello', 'mom') instanceof Space, 'set should return instance so we can chain it')
  
  var blah = new Space()
  value.set('boom', '')
  equal(value.get('boom'), '', 'empty string')
  
  equal(value.get('hello'), 'mom', 'value should be changed')
  value.set('head style color', 'blue')
  equal(value.get('head style color'), 'blue', 'set should have worked')
  
  var foo = new Space('style\n')
  foo.set('style color', 'red')
  foo.set('style width', '100')
  equal(foo.get('style color'), 'red')
  equal(foo.get('style width'), '100')
  
  var a = new Space('hello world\n')
  a.set('hi', 'mom')
  equal(a._keys.join(''), 'hellohi', 'order correct')
  a.set('yo', 'pal', 0)
  equal(a._keys.join(''), 'yohellohi', 'order correct')
  
  a.set('hola', 'pal', 2)
  equal(a._keys.join(''), 'yohelloholahi', 'order correct')
  
  var c = new Space()
  c.set('hi', 'hello world')
  c.set('yo', new Space('hello world'))
  // should these be equal?
  notEqual(c.get('hi'), c.get('yo'))

})

test('shift', function() {

  var a = new Space('john\n age 5\nsusy\n age 6\nbob\n age 10')
  equal(a.length(), 3)
  equal(a.shift().toString(), 'john\n age 5\n')
  equal(a.length(), 2)
  
  var empty = new Space()
  equal(empty.shift(), null)
  
})

test('toJavascript', function() {

  var a = new Space("hello world")
  equal(a.toJavascript(), 'new Space(\'hello world\\n\')')

  var b = new Space('hello \'world')
  equal(b.toJavascript(), "new Space(\'hello \\\'world\\n\')")

  var c = new Space('hello \'world\'')
  equal(c.toJavascript(), "new Space(\'hello \\\'world\\\'\\n\')")

  var d = new Space('hello "world"')
  equal(d.toJavascript(), "new Space(\'hello \"world\"\\n\')")

})

test('toJSON', function() {

  var a = new Space("hello world")
  equal(a.toJSON(), '{"hello":"world"}')
  
  var b = new Space("foo bar")
  a.set('b', b)
  equal(a.toJSON(), '{"hello":"world","b":{"foo":"bar"}}')

})

test('toObject', function() {

  var a = new Space("hello world")
  ok(typeof a.toObject() === 'object')
  equal(a.toObject()['hello'], 'world')
  
  var b = new Space("foo bar")
  a.set('b', b)
  equal(a.toObject()['b']['foo'], 'bar')

})

test('toString', function() {

  var value = new Space('hello world')
  equal(value.toString(), 'hello world\n')
  value.set('foo', 'bar')
  equal(value.toString(), 'hello world\nfoo bar\n')

  var a = new Space('john\n age 5')
  equal(a.toString(), 'john\n age 5\n')
  ok(a.toString() != 'john\n age 5')

  a.set('multiline', 'hello\nworld')

  equal(a.toString(), 'john\n age 5\nmultiline \n hello\n world\n')

  a.set('other', 'foobar')

  equal(a.toString(), 'john\n age 5\nmultiline \n hello\n world\nother foobar\n')

  b = new Space('a\n text \n  this is a multline string\n  and more')
  equal(b.toString(), 'a\n text \n  this is a multline string\n  and more\n')
  a.set('even_more', b)
  equal(a.toString(), 'john\n age 5\nmultiline \n hello\n world\nother foobar\neven_more\n a\n  text \n   this is a multline string\n   and more\n')
  
  
  var e = new Space('z-index 0')
  e['z-index'] = 0
  equal(e.toString(), 'z-index 0\n')
})

test('union', function() {

  var a = new Space('maine me\nnew_york nyc\ncali ca')
  var b = new Space('maine me\nnew_york nyc\ncali ca')
  var c = new Space('maine me')
  var d = new Space('maine me\nflorida fl\ncali ca')
  ok(Space.union(a, b), 'a and b are same')
  equal(Space.union(a, b)._keys.length, 3, 'union should have 3 items')
  equal(Space.union(a, c)._keys.length, 1, 'union should have 1 item')
  ok(Space.union(a, c).toString() === c.toString(), 'union should be equal to c')
  
  equal(Space.union(a, b, c, d)._keys.length, 1, 'union should take multiple params')
  equal(Space.union(a, b, d)._keys.length, 2, 'union should be 2 long')
  equal(Space.union(d, a, b, c)._keys.length, 1, 'union should 1 be long')
  
  a = new Space('font-family Arial\nbackground red\ncolor blue\nwidth 10px')
  b = new Space('font-family Arial\nbackground green\ncolor blue\nwidth 10px')
  c = new Space('font-family Arial\nbackground orange\ncolor blue\nwidth 12px')
  d = new Space('font-family Arial\nbackground #aaa\ncolor blue\nwidth 12px')
  e = new Space('font-family Arial\nbackground #fff\ncolor blue\nwidth 121px')
  
  var union = Space.union(a, b, c, d, e)
  equal(union._keys.length, 2, 'should should have length 2')
  equal(union._values.color, 'blue', 'union should have color blue')
  equal(union._values['font-family'], 'Arial', 'union should have font family arial')
  
  union = Space.union.apply(a, [b, c, d, e])
  equal(union._keys.length, 2, 'union should have length 2')
  
  
})


test('url methods', function() {

  var a = new Space('maine me\nnew_york nyc\ncali ca')
  var encoded = a.toURL()
  var b = new Space(decodeURIComponent(encoded))
  equal(a.toString(), b.toString(), 'toUrl worked')

})

