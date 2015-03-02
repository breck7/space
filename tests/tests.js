QUnit.module('Space')
var isNode = typeof require !== 'undefined'

test('Space', function() {
  ok(Space, 'Space class should exist')
  ok(new Space() instanceof Space, 'Space should return a space')
  var space = new Space('hello world')
  strictEqual(space.length, 1, 'types array should have 1 property')
  strictEqual(space.indexOf('hello'), 0, 'types array should be correct')
  strictEqual(space.get('hello'), 'world', 'Properties should be accessible')
  strictEqual(typeof space.get('hello'), 'string', 'Leafs should be strings')

  space.set('foo', 'bar')
  strictEqual(space.get('foo'), 'bar', 'Spaces should be modifiable')

  space = new Space('foobar\n one 1')
  strictEqual(typeof space.get('foobar'), 'object', 'Spaces should be objects')
  ok(space.get('foobar') instanceof Space, 'Nested spaces should be spaces')

  space = new Space('list\nsingle value')
  strictEqual(space.length, 2, 'Space should have 2 names')
  ok(space.get('list') instanceof Space, 'A name without a trailing space should be a space')

  space = new Space('body')
  ok(space.get('body') instanceof Space, 'A name without a trailing space should be a space')

  space = new Space({
    foobar: 'hello'
  })
  strictEqual(space.get('foobar'), 'hello', 'Spaces can be created from object literals')

  space = new Space({
    foobar: new Space('hello world')
  })
  strictEqual(space.get('foobar hello'), 'world', 'Spaces can be created from objects mixed with spaces')

  space = new Space({
    foobar: {
      hello: {
        world: 'success'
      }
    }
  })
  strictEqual(space.get('foobar hello world'), 'success', 'Spaces can be created from deep objects')

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
  strictEqual(space.get('domains test.test.com pages home settings data title'), 'Hello, World', 'Multiline creation should be okay.')
})

test('append', function() {
  var a = new Space('hello world')
  var count = 0
  a.on('append', function(property, value) {
    count++
  })
  a.append('foo', 'bar')
  a.set('foo2', 'bar')
  strictEqual(a.get('foo'), 'bar')
  strictEqual(count, 1)

  a.append('foo', 'two')
  strictEqual(a.length, 4)
})

test('clear', function() {
  var a = new Space('hello world')
  strictEqual(a.length, 1)
  ok(a.clear() instanceof Space, 'clear should return this so its chainable')
  strictEqual(a.length, 0)

  var a = new Space('hello world')
  a.clear('foo bar')
  ok(!a.get('hello'))
  strictEqual(a.get('foo'), 'bar')
})

test('clone', function() {
  var a = new Space('hello world')
  var b = a.clone()
  strictEqual(b.get('hello'), 'world')
  b.set('hello', 'mom')
  strictEqual(a.get('hello'), 'world')
  var c = a
  strictEqual(c.get('hello'), 'world')
  c.set('hello', 'foo')
  strictEqual(a.get('hello'), 'foo')
  var d = c
  strictEqual(d.get('hello'), 'foo')
  d.set('hello', 'hiya')
  strictEqual(a.get('hello'), 'hiya')

  a.set('test', 'boom')
  strictEqual(d.get('test'), 'boom')
  a.set('foobar', new Space('123 456'))
  strictEqual(c.get('foobar 123'), '456')

  e = a
  strictEqual(e.get('foobar 123'), '456')
  f = a.clone()
  strictEqual(f.get('foobar 123'), '456')
  f.hi = 'test'
  strictEqual(a.hi, undefined)
})

test('concat', function() {
  var a = new Space('hello world')
  var b = new Space('hi mom')
  a.concat(b)
  strictEqual(a.get('hi'), 'mom')
})

test('create', function() {
  var a = new Space('hello world')
  var count = 0
  a.on('create', function(property, value) {
    count++
  })
  a.create('foo', 'bar')
  a.set('foo2', 'bar')
  strictEqual(a.get('foo'), 'bar')
  strictEqual(count, 1)
})

test('delete', function() {
  var a = new Space()
  a.set('name', 'Breck')
  strictEqual(a.get('name'), 'Breck', 'name is set')
  strictEqual(a.length, 1, 'length okay')
  a.delete('name')
  strictEqual(a.get('name'), undefined, 'name is gone')
  strictEqual(a.length, 0, 'length okay')
  a.set('earth north_america united_states california san_francisco', 'mission')
  ok(a.get('earth north_america united_states california') instanceof Space)
  strictEqual(a.get('earth north_america united_states california san_francisco'), 'mission', 'neighborhood is set')
  strictEqual(a.get('earth north_america united_states california').length, 1, 'length okay')
  strictEqual(a.length, 1, 'length okay')
  ok(a.delete('earth north_america united_states california san_francisco') instanceof Space, 'returns space')
  strictEqual(a.get('earth north_america united_states california san_francisco'), undefined, 'neighborhood is gone')

  var a = new Space('property meta\n')
  a.delete('content')
  strictEqual(a.get('property'), 'meta', 'delete a non existing entry works')

  // #28
  var a = new Space()
  a.delete(2)

  var b = new Space('hi\nhello world')
  b.delete(1)
  strictEqual(b.toString(), 'hi\n')
})

/*
test('dupes', function () {
  space = new Space('time 123\ntime 456')
  strictEqual(space.length, 2)
  strictEqual(space.toString(), 'time 123\ntime 456\n')
})
*/

test('diff of subclasses', function() {
  function Page(space) {
    this.clear()

    if (space)
      this.patch(space)
    return this
  }

  Page.prototype = new Space()

  function Block(id, space) {
    this.clear()

    this.id = id
    if (space)
      this.patch(space)
  }

  Block.prototype = new Space()

  var a = new Space('hello world'),
      b = new Space('hello mom'),
      c = new Space('first John')

  strictEqual(a.diff(b).toString(), 'hello mom\n')
  ok(a.diff(c) instanceof Space, 'diff is a space')
  strictEqual(a.diff(c).get('hello'), '')
  strictEqual(a.diff(c).toString(), 'hello \nfirst John\n')

  strictEqual(a.diff(c).get('first'), 'John')

  a = new Space('hi 1')
  b = new Space('hi 1')
  var diff = a.diff(b)
  ok(diff instanceof Space, 'diff is a space')
  strictEqual(diff.toString(), '', 'No difference')

  a = new Space('hi 1')
  b = new Space()
  b.set('hi', 1)
  strictEqual(a.diff(b).toString(), '')

  var d = new Space()
  var e = new Space('z-index 0')
  var patch = d.diff(e)
  strictEqual(patch.toString(), 'z-index 0\n')
  e['z-index'] = 0
  var patch = d.diff(e)
  strictEqual(patch.toString(), 'z-index 0\n')

  var page = new Page('body\n b1\n  content hi')

  var page4 = new Page()
  strictEqual(page4.toString(), '', 'No properties in new instance')

  var page2 = new Page('body\n b1\n  content hi')
  var block = new Block('foobar')
  var block2 = new Block('b2')
  ok(block instanceof Space, 'block is instance of Space')
  ok(block instanceof Block, 'block is instance of Block')
  strictEqual(block.id, 'foobar', 'id is set')
  strictEqual(block2.id, 'b2', 'id is set')

  var diff = block.diff(block2)

  strictEqual(diff.length, 0, 'Difference between 2 spaces should not check privates.')
  var diff = block2.diff(block)
  strictEqual(diff.length, 0, 'Difference between 2 spaces should not check privates.')

  ok(page instanceof Space, 'page is instance of Space')
  ok(page instanceof Space, 'page is instance of Page')
  ok(page.length, 'page has 1 name/value')

  page.set('body foobar', block)

  page2.set('body foobar', block2)
  diff = page.diff(page2)
  strictEqual(page.toString(), page2.toString(), 'Pages should be equal')
  strictEqual(diff.length, 0, 'Difference between 2 composites should not check privates in sub parts.')

  ok(page.get('body foobar') instanceof Block, 'block1 is instance of Block')

  var page3 = new Page('body\n b1\n  content hibob')

  diff = page3.diff(page2)
  ok(diff.get('body foobar') instanceof Space, 'block1 in page3 diff is instance of space')
  ok(!diff.get('body foobar id'), 'id did not get set')
})

test('diffOrder', function() {
  // Recursive order diff
  var a = new Space('body\n content hello world\n value Hi\n')
  var b = new Space('body\n value Hi\n content hello world\n')
  strictEqual(a.diffOrder(b).toString(), 'body\n value\n content\n', 'different')

  var a = new Space('hi world\nhello bob\nhola dude\nyo man')
  var b = new Space('hi world\nhello bob\nhola dude\nyo man')
  var c = new Space('hi world\nhello bob\nyo man\nhola dude')
  strictEqual(a.diffOrder(b).toString(), '', 'no diff')
  strictEqual(a.diffOrder(c).toString(), 'hi\nhello\nyo\nhola\n', 'different')
})

test('diff between a blank property/value and empty object', function() {
  var a = new Space('hi ')
  var b = new Space('hi\n')
  strictEqual(a.get('hi'), '', 'hi is equal to empty string')
  ok(b.get('hi') instanceof Space, 'b is instance of space')
  strictEqual(typeof a.get('hi'), 'string')
  strictEqual(typeof b.get('hi'), 'object')
  notStrictEqual(a.get('hi'), b.get('hi'))

  strictEqual(a.toString(), 'hi \n', 'a should be a property with empty string value')
  strictEqual(b.toString(), 'hi\n')
})

test('duplicate property', function() {
  var spaceWithDupe = 'height 45px\n\
height 50px\n\
width 56px'

  var value = new Space(spaceWithDupe)
    // When turning a string into a Space object and given a duplicate property, first item should win
  strictEqual(value.get('height'), '45px')

  strictEqual(value.length, 3)
})

test('duplicate property with getArray', function() {
  var spaceWithDupe = 'height 45px\n\
height 50px\n\
width 56px'

  var value = new Space(spaceWithDupe)
  strictEqual(value.getArray('height').length, 2)
  strictEqual(value.getArray('height')[1], "50px")

  var spaceWithoutDupe = new Space("height 25px")
  strictEqual(spaceWithoutDupe.getArray('height').length, 1)
  strictEqual(spaceWithoutDupe.getArray('height')[0], "25px")
  strictEqual(spaceWithoutDupe.getArray('width').length, 0)
})

test('each', function() {
  var value = new Space('hello world\nhi mom')
  var string = ''
  strictEqual(value.each(function(property, value) {
    string += property.toUpperCase()
    string += value.toUpperCase()
    string += this.length
  }).length, 2, 'test chaining')
  strictEqual(string, 'HELLOWORLD2HIMOM2')

  // test breaking
  var count = 0
  var value = new Space('hello world\nhi mom')
  value.each(function(property, value) {
    count++
    if (property === 'hello')
      return false
  })
  strictEqual(count, 1)

  var a = new Space('hello world\nhi world')
  var i = 0
  a.each(function(property, value, index) {
    i = i + index
  })
  strictEqual(i, 1, 'index worked')
})

test('events', function() {
  var value = new Space('hello world\nhi mom')
  var result = ''
  var popsMethod = function() {
    result = 'pops'
  }
  value.on('change', popsMethod)
  value.set('hi', 'dad')
  strictEqual(result, 'pops')
  result = ''
  value.off('change', popsMethod)
  value.set('hi', 'pop')
  strictEqual(result, '')

  var count = 0
  var inc = function() {
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
  strictEqual(count, 5)

  // Event params
  var a = new Space('hello world')
  var b = ''
  var c = ''
  var setCount = 0
  a.on('set', function(property, value) {
    b = value
  })
  var changeCount = 0
  a.on('change', function() {
    changeCount++
  })
  a.on('patch', function(patch) {
    c = patch
  })
  a.on('set', function(property, value) {
    setCount++
  })
  a.set('hello', 'bob')
  a.patch('hi mom')
  strictEqual(b, 'bob')
  strictEqual(c, 'hi mom')
  strictEqual(setCount, 1)
  strictEqual(changeCount, 2)
})

test('event bubbling', function() {
  var count = 0
  var cafe = new Space('name Haus\nmenu\n coffee\n  light\n   price 2.50\n  dark\n   price 3\n')
  cafe.get('menu coffee light').on('change', function() {
      count++
    })
    //  cafe.set('menu coffee light price', '5')
  cafe.get('menu coffee light').set('price', '6')
  strictEqual(count, 1)
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
  obj.every(function(property, value) {
    this.rename(property, property.toUpperCase())
    i++
  })

  strictEqual(i, 20)
  strictEqual(obj.get('DOMAINS TEST.TEST.COM PAGES HOME SETTINGS').toString(), 'DATA\n TITLE Hello, World\n')
})

test('filter', function() {
  var value = new Space(testStrings.filter)
  var c = 0
  value.filter(function(property, value) {
    return parseFloat(value.get('age')) > 22
  }).each(function() {
    c++
  })
  strictEqual(c, 1, 'filter worked')
})

test('find', function() {
  var a = new Space('john\n age 5\nsusy\n age 6\nbob\n age 10')

  strictEqual(a.find('age', '5').length, 1)
    //  strictEqual(a.find('age', /(5|6)/).length, 2)
    //  strictEqual(a.find('age', function (value) {return value > 4}).length, 3)
})

test('first', function() {
  var value = new Space('hello world\nhi mom')
  strictEqual(value.getByIndex(0), 'world')

  var value = new Space('hello world\nhi mom')
  strictEqual(value.first().toString(), 'hello world\n')
})

test('firstProperty', function() {
  var value = new Space('hello world\nhi mom')
  strictEqual(value.firstProperty(), 'hello')
})

test('firstValue', function() {
  var value = new Space('hello world\nhi mom')
  strictEqual(value.firstValue(), 'world')
})

test('fromCsv', function() {
  var a = Space.fromCsv(testStrings.toCsvResult)
  strictEqual(a.toString(), testStrings.toDelimited)
  strictEqual(a.toCsv(), testStrings.toCsvResult)

  var b = Space.fromCsv("Age,Birth Place,Country\n12,Brockton,USA")
  strictEqual(b.length, 1)
  strictEqual(b.getByIndex(0).get('Country'), 'USA')
})

test('fromHeredoc', function() {
  var doc = new Space(testStrings.heredoc)
  // todo: should this be 15?
  strictEqual(doc.length, 15)
  var parsedDoc = Space.fromHeredoc(testStrings.heredoc, "body", "endbody")
  strictEqual(parsedDoc.length, 4)
})

test('fromSsv', function() {
  var a = Space.fromSsv(testStrings.toSsvResult)
  strictEqual(a.toString(), testStrings.toDelimited)
  strictEqual(a.toSsv(), testStrings.toSsvResult)
})

test('fromTsv', function() {
  var a = Space.fromTsv(testStrings.toTsvResult)
  strictEqual(a.toString(), testStrings.toDelimited)
  strictEqual(a.toTsv(), testStrings.toTsvResult)
})

if (!isNode) {
  test('fromXml', function() {
  
    var a = Space.fromXml(testStrings.toXmlWithAttributesResult)
    strictEqual(a.toString(), testStrings.toXmlWithAttributes)
  })
}

test('get', function() {
  var value = new Space('hello world')
  strictEqual(value.get('hello'), 'world')
  value.set('2', 'hi')
  strictEqual(value.get(2), 'hi')
  strictEqual(value.get(), undefined)

  // get non existant value

  var value = new Space().get('some long path')
  strictEqual(value, undefined)

  var value = new Space().get('some')
  strictEqual(value, undefined)
})

test('getAll', function() {
  var value = new Space('hello world\nhello world')
  ok(value.getAll('hello') instanceof Space)
  strictEqual(value.getAll('hello').length, 2)
  var each = ''
  value.getAll('hello').each(function(k, v) {
    each += 'a'
  })
  strictEqual(each, 'aa')
})

test('getByIndexPath', function() {
  var space = new Space()
  space.set('body header h1 title a', 'hello')
  space.set('body footer a', 'hello')
  space.set('body footer li', 'world')
  strictEqual(space.getByIndexPath('0 1 1'), 'world')

  var space = new Space(testStrings.getByIndexPath)
  strictEqual(space.getByIndexPath('1 2 0'), 'main')
})

test('_getValueByIndex', function() {
  var value = new Space('hello world\nhow are you\nhola friend')
  strictEqual(value._getValueByIndex(0), 'world')
  strictEqual(value._getValueByIndex(1), 'are you')
  strictEqual(value._getValueByIndex(2), 'friend')
  strictEqual(value._getValueByIndex(3), undefined)
  strictEqual(value._getValueByIndex(-1), 'friend')
})

test('getCud', function() {
  var A = new Space('name John\nage 25\nstate California')
  var B = new Space('name John\nage 22\nhometown Brockton')
  var diff = A.getCud(B)
  strictEqual(diff.toString(), 'created\n hometown Brockton\nupdated\n age 22\ndeleted\n state\n')
})

test('getTokens', function() {
  var value = new Space('hello world')
  strictEqual('KKKKKSVVVVV', value.getTokens())

  var value = new Space('hello mom')
  strictEqual('KKKKKSVVV', value.getTokens())

  var value = new Space('first Breck' + '\n' + 'last Yunits')
  strictEqual(value.getTokens(), 'KKKKKSVVVVV' + 'N' + 'KKKKSVVVVVV')

  var value = new Space('a\n a1 hi\n a2 yo\n')
  strictEqual(value.getTokens(), 'KNNKKSVVNNKKSVV')

  var value = new Space('a\n a1 hi\n a2 yo\nyo hi')
  strictEqual(value.getTokens(), 'KNNKKSVVNNKKSVVNKKSVV')

  var value = new Space()
  value.set('multi', 'line1\nline2')
  strictEqual(value.getTokens(), 'KKKKKSVVVVVVEVVVVV')
})

test('getTokensConcise', function() {
  var value = new Space()
  value.set('multi', 'line1\nline2')
  strictEqual(value.getTokensConcise(), 'KSVEV')

  var value = new Space('a\n a1 hi\n a2 yo\n')
  strictEqual(value.getTokensConcise(), 'KNKSVNKSV')

  var value = new Space('a\n a1 hi\n a2 yo\nyo hi')
  strictEqual(value.getTokensConcise(), 'KNKSVNKSVNKSV')
})

// https://github.com/breck7/space/issues/58
test('get expecting a branch but hitting a leaf', function() {
  var value = new Space('posts leaf')
  strictEqual(undefined, value.get('posts branch'))
})

test('getValues', function() {
  var html = new Space('h1 hello world\nh1 hello world')
  strictEqual(html.getValues().join('\n'), 'hello world\nhello world')
})

test('has', function() {
  space = new Space('hello world')
  strictEqual(space.has('hello'), true)
  strictEqual(space.has('world'), false)
})

test('hasOwnProperty bug', function() {
  var foo = {
    bar: foo
  }
  foo.hasOwnProperty = null
  space = new Space(foo)
  ok(space)
})

test('__height', function() {
  space = new Space('hello world')
  strictEqual(space.__height(), 1)
})

test('html dsl', function() {
  var html = new Space('h1 hello world\nh1 hello world')
  var page = ''
  html.every(function(property, value) {
    page += '<' + property + '>' + value + '</' + property + '>'
  })
  strictEqual(page, '<h1>hello world</h1><h1>hello world</h1>')
})

test('indexOf', function() {
  space = new Space('hello world')
  strictEqual(space.indexOf('hello'), 0)
  strictEqual(space.indexOf('hello2'), -1)
})

test('insert', function() {
  space = new Space('hello world')
  space.insert('hi', 'mom', 0)
  strictEqual(space.indexOf('hi'), 0)
})

test('isEmpty', function() {
  var a = new Space()
  strictEqual(a.isEmpty(), true)
  var a = new Space('john\n age 5\nsusy\n age 6\nbob\n age 10')
  strictEqual(a.isEmpty(), false)
})

test('isFlat', function() {
  ok(!new Space(testStrings.renameAll).isFlat())
  ok(!new Space(testStrings.filter).isFlat())
  ok(new Space(testStrings.splitTest).isFlat())
  ok(new Space("foo bar"))
  ok(new Space(""))
})

test('isStringMap', function() {
  var a = new Space('john\n age 5\nsusy\n age 6\nbob\n age 10')
  strictEqual(a.isStringMap(), true)
  strictEqual(a.isStringMap(true), true)
  a.get('john').append('age', '4')
  strictEqual(a.isStringMap(true), false)
  var b = new Space('john\n age 5\nsusy\n age 6\njohn\n age 10')
  strictEqual(b.isStringMap(), false)
})

test('last', function() {
  var value = new Space('hello world\nhi mom')
  strictEqual(value.getByIndex(-1), 'mom')

  var value = new Space('hello world\nhi mom')
  strictEqual(value.last().toString(), 'hi mom\n')
})

test('lastProperty', function() {
  var value = new Space('hello world\nhi mom')
  strictEqual(value.lastProperty(), 'hi')
})

test('lastValue', function() {
  var value = new Space('hello world\nhi mom')
  strictEqual(value.lastValue(), 'mom')
})

test('loadFromArray', function() {
  var a = new Space([1, 2, 3])
  strictEqual(a.toString(), '0 1\n1 2\n2 3\n')

  a = new Space({
    data: [{
      charge: 1
    }, {
      charge: 2
    }]
  })
  strictEqual(a.toString(), 'data\n 0\n  charge 1\n 1\n  charge 2\n')
})

test('loadFromObject', function() {
  var a = new Space(testStrings.json)
  strictEqual(a.get("lowestScore"), "-10")

  var d = new Date(),
      time = d.getTime()

  var b = new Space({ name: "John", date: d})

  strictEqual(b.get("date"), time.toString())
})

test('loadFromString', function() {
  var a = new Space('text \n this is a string\n and more')

  strictEqual(a.get('text'), '\nthis is a string\nand more')

  var b = new Space('a\n text \n  this is a string\n  and more')
  strictEqual(b.get('a text'), '\nthis is a string\nand more')
  strictEqual(b.toString(), 'a\n text \n  this is a string\n  and more\n')

  var string = 'first_name John\nlast_name Doe\nchildren\n 1\n  first_name Joe\n  last_name Doe\n  children\n   1\n    first_name Joe Jr.\n    last_name Doe\n    age 12\ncolors\n blue\n red\nbio \n Hello this is\n my multline\n biography\n \n Theres a blank line in there as well\n \n \n Two blank lines above this one.\ncode <p></p>\n'
  var c = new Space(string)
  strictEqual(c.get('children 1 children 1 age'), '12')
  strictEqual(c.toString().length, string.length)
  strictEqual(c.toString(), string)

  var d = new Space("\n\na b\n")
  strictEqual(d.toString(), "a b\n", "Expected extra newlines at start of string to be trimmed")

  var e = new Space("a b\n\nb c\n")
  strictEqual(e.toString(), "a b\nb c\n", "Expected extra newlines in middle of string to be trimmed")

  var f = new Space("a b\n\n\n")
  strictEqual(f.toString(), "a b\n", "Expected extra newlines at end of string to be trimmed")
})

test('loadFromString extra spaces', function() {
  var d = new Space('one\ntwo\n  three\n    four\nfive six')
  strictEqual(d.length, 3)
})

test('matches leak', function() {
  var foo = new Space('hello world')
  strictEqual(typeof(matches), "undefined")
})

test('map properties', function() {
  var foo = new Space('hello world\nfoo bar')
  foo.map(function (v){ return v.toUpperCase()}, null, null, true)
  strictEqual(foo.toString(), 'HELLO world\nFOO bar\n')
  foo.set("some deep object", "bam")
  strictEqual(foo.get("some deep object"), "bam")
  foo.map(function (v){ return v.toUpperCase()}, null, null, true)
  strictEqual(foo.get("some deep object"), undefined, "expected object not to be there")
  strictEqual(foo.get("SOME deep object"), "bam", "expected path to be changed")
  foo.map(function (v){ return v.toUpperCase()}, null, true, true)
  ok(!foo.get("SOME deep object"), "expected path to be changed recursively")
  strictEqual(foo.get("SOME DEEP OBJECT"), "bam", "expected recursive map to work")
})

test('map values', function() {
  var foo = new Space('hello    world   \nfoo    bar  ')
  foo.map(null, function (v){ return v.trim()}, null, true)
  strictEqual(foo.toString(), 'hello world\nfoo bar\n')
  foo.set("some deep object", "    bam   ")
  strictEqual(foo.get("some deep object"), "    bam   ")
  foo.map(null, function (v){ return v.trim()}, true, true)
  strictEqual(foo.get("some deep object"), "bam")
})

test('multiline', function() {
  var a = new Space('my multiline\n string')
  strictEqual(a.get('my'), 'multiline\nstring')

  var a = new Space('my \n \n multiline\n string')
  strictEqual(a.get('my'), '\n\nmultiline\nstring')

  var b = new Space('brave new\n world')
  strictEqual(b.get('brave'), 'new\nworld', 'ml value correct')
  strictEqual(b.toString(), 'brave new\n world\n', 'multiline does not begin with nl')

  var c = new Space('brave \n new\n world')
  strictEqual(c.get('brave'), '\nnew\nworld', 'ml begin with nl value correct')
  strictEqual(c.toString(), 'brave \n new\n world\n', 'multiline begins with nl')

  var d = new Space('brave \n \n new\n world')
  strictEqual(d.get('brave'), '\n\nnew\nworld', 'ml begin with 2 nl value correct')
  strictEqual(d.toString(), 'brave \n \n new\n world\n', 'multiline begins with 2 nl')

  var e = new Space('brave new\n world\n ')
  strictEqual(e.get('brave'), 'new\nworld\n', 'ml value end with nl correct')
  strictEqual(e.toString(), 'brave new\n world\n \n', 'multiline ends with a nl')

  var f = new Space('brave new\n world\n \n ')
  strictEqual(f.get('brave'), 'new\nworld\n\n', 'ml value end with 2 nl correct')
  strictEqual(f.toString(), 'brave new\n world\n \n \n', 'multiline ends with 2 nl')

  var g = new Space()
  g.set('brave', '\nnew\nworld\n\n')
  strictEqual(g.get('brave'), '\nnew\nworld\n\n', 'set ml works')
  strictEqual(g.toString(), 'brave \n new\n world\n \n \n', 'set ml works')
})

test('next', function() {
  var a = new Space('john\n age 5\nsusy\n age 6\nbob\n age 10')

  strictEqual(a.next('john'), 'susy')
  strictEqual(a.prev('john'), 'bob')
  strictEqual(a.next('susy'), 'bob')
  strictEqual(a.prev('susy'), 'john')
  strictEqual(a.prev('bob'), 'susy')
  strictEqual(a.next('bob'), undefined)

  strictEqual(a.next('foobar'), 'john')
})

test('object count', function() {
  var a = new Space('john\n age 5\nsusy\n age 6\nbob\n age 10')
  strictEqual(a._objectCount(), 3)
  var b = new Space('')
  strictEqual(b._objectCount(), 0)
  var c = new Space('hello world')
  strictEqual(c._objectCount(), 0)
})

test('order', function() {
  var a = new Space('john\n age 5\nsusy\n age 6\nbob\n age 10')
  var types = a.tableOfContents()
  strictEqual(types, 'john susy bob', 'order is preserved')
})

test('patch', function() {
  var a = new Space('hello world')
  strictEqual(a.get('hello'), 'world')
  var b = new Space('hello mom')
  a.patch(b)
  strictEqual(a.get('hello'), 'mom')
  var c = new Space('hello mom')
  c.set('hello', new Space('foo\n cell 123'))
  a.patch(c)
  strictEqual(a.get('hello foo cell'), '123')

  a = new Space('style\n background-color rgb(57, 112, 1)\n border 17px solid white\n color rgb(0, 0, 0)\n font-family Lato\n font-size 16px\n height 100\n left 379px\n top 200\n width 274px\n border-radius 35px\n')
  b = new Space('height 203\ntop 117\n')
  a.get('style').patch(b)
  strictEqual(a.get('style height'), '203')
  strictEqual(a.get('style top'), '117')

  a = new Space('background-color rgb(57, 112, 1)\nborder 17px solid white\ncolor rgb(0, 0, 0)\nfont-family Lato\nfont-size 16px\nheight 199px\nleft 379px\ntop 117px\nwidth 274px\nborder-radius 35px\n')
  b = new Space('height 202\ntop 117\n')
  a.patch(b)
  strictEqual(a.get('height'), '202')
  strictEqual(a.get('top'), '117')

  a = new Space('first John\nlast Doe')
  b = new Space('last\n 1 Doe\n 2 Smith')
  c = new Space('last Aaron')
  a.patch(b)
  strictEqual(a.get('last 2'), 'Smith', 'test 2')
  a.patch(c)
  strictEqual(a.get('last'), 'Aaron')

  var patch = new Space()
  patch.set('first', 'Frank')
  patch.set('last', 'Grimes')
  a.patch(new Space(new Space(patch)))
  strictEqual(a.get('last'), 'Grimes')
  strictEqual(a.get('first'), 'Frank')

  // delete an element
  var page = new Space()
  page.set('text', new Space('content hello world'))
  strictEqual(page.length, 1, 'item deleted')
  page.patch(new Space('text '))
  strictEqual(page.length, 0, 'item deleted')

  var pages = new Space()
  pages.set('page1', new Space('text\n content hello world'))
  strictEqual(pages.get('page1').length, 1)
  pages.get('page1').patch('text')
  strictEqual(pages.get('page1').length, 0)

  var a = new Space('property meta\n')
  var b = new Space('content\n')
  a.patch(b)
  strictEqual(a.length, 1, 'patch okay')
  strictEqual(a.get('property'), 'meta', 'patch okay')
  var space = new Space('meta\n property meta')
  var patch = new Space('meta\n content')
  space.patch(patch)
  strictEqual(space.get('meta property'), 'meta', 'patch okay')

  var a = new Space('hello world')
  ok(a.patch(), 'If nothing passed dont error.')
  ok(a.patch(''), 'If nothing passed dont error.')
  ok(a.patch(false), 'If nothing passed dont error.')
  strictEqual(a.toString(), 'hello world\n')
})

test('patch performance test', function() {
  var space = new Space()
  for (var i = 0; i < 1000; i++) {
    var patch = new Space()
    patch.set(Math.random(), new Space('foobar hello\nworld world\nnested\n element 1\n element2\n  foobar hi'))
    patch.set(Math.random(), 'foobar')
    space.patch(patch)
  }
  strictEqual(space.length, 2000)
})

test('path functions', function() {
  strictEqual(Space.pathLeaf('football'), 'football')
  strictEqual(Space.pathLeaf('page header'), 'header')
  strictEqual(Space.pathLeaf('page header content'), 'content')

  strictEqual(Space.pathBranch('football'), '')
  strictEqual(Space.pathBranch('page header'), 'page')
  strictEqual(Space.pathBranch('page header content'), 'page header')
})

test('pop', function() {
  var a = new Space('john\n age 5\nsusy\n age 6\nbob\n age 10')
  strictEqual(a.length, 3)
  strictEqual(a.pop().toString(), 'bob\n age 10\n')
  strictEqual(a.length, 2)

  var empty = new Space()
  strictEqual(empty.pop(), null)
})

test('prepend', function() {
  var a = new Space('hello world')
  a.prepend('foo', 'bar')
  strictEqual(a.toString(), 'foo bar\nhello world\n')
})

test('prev', function() {
  var a = new Space('john\n age 5\nsusy\n age 6\nbob\n age 10')

  strictEqual(a.next('john'), 'susy')
  strictEqual(a.prev('john'), 'bob')
  strictEqual(a.next('susy'), 'bob')
  strictEqual(a.prev('susy'), 'john')
  strictEqual(a.prev('bob'), 'susy')
})

test('property count', function() {
  var a = new Space('john\n age 5\nsusy\n age 6\nbob\n age 10')
  strictEqual(a._typeCount(), 6)
  var b = new Space('')
  strictEqual(b._typeCount(), 0)
  var c = new Space('hello world')
  strictEqual(c._typeCount(), 1)
})

test('push', function() {
  var a = new Space()
  a.push('hello world')
  strictEqual(a.get('0'), 'hello world')
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
  var result = string.getBySpace(query)
  ok(result instanceof Space, 'Retrieve returns a space')
  strictEqual(result.length, 1, '1 root node')
  strictEqual(result.get('user name'), 'Aristotle', 'Name retrieved successfully')
  ok(typeof result.get('user pro') === 'undefined', 'Did not retrieve pro value')
  strictEqual(result.get('user domains test.test.com pages home block1 content'), 'Hello world')
})

test('reload', function() {
  var a = new Space('john\n age 5\nsusy\n age 6')
  ok(a.reload())
  strictEqual(a.length, 0, 'empty reload cleared object')
  var count = 0
  a.on('reload', function() {
    count++
  })
  a.reload('john 1')
  a.reload('john 2')
  strictEqual(a.length, 1)
  strictEqual(a.get('john'), '2')
  strictEqual(count, 2)
})

test('rename', function() {
  var a = new Space('john\n age 5\nsusy\n age 6\ncandy bar\nx 123\ny 45\n'),
      originalLength = a.length,
      originalString = a.toString(),
      index = a.indexOf('john')

  // Assert
  strictEqual(index, 0, 'index okay')

  // Act
  ok(a.rename('john', 'breck') instanceof Space, 'returns itself for chaining')
  a.rename('candy', 'ice')

  // Assert
  index = a.indexOf('breck')
  strictEqual(index, 0, 'index okay')
  strictEqual(a.get('breck age'), '5', 'value okay')

  // Act
  a.rename('breck', 'john')
  a.rename('ice', 'candy')

  // Assert
  strictEqual(a.length, originalLength, "Length unchanged")
  strictEqual(a.toString(), originalString, "String unchanged")

  // Arrange
  var b = new Space(testStrings.renameTest)
  originalString = b.toString()
  
  // Act
  b.rename("dimensions", "columns")

  // Assert
  strictEqual(b.toString(), originalString)


  // for now we removed xpath rename.
})

test('renameAll', function() {
  var space = new Space(testStrings.renameAll)
  strictEqual(space.toString().match(/first-name/g).length, 5)
  space.renameAll('first-name', 'firstName', true)
  strictEqual(space.toString().match(/firstName/g).length, 5)
})

test('reorder', function() {
  var a = new Space('hello world\n')
  a.set('hi', 'mom')
  strictEqual(a.tableOfContents(), 'hello hi', 'order correct')
  a.insert('yo', 'pal', 0)
  strictEqual(a.tableOfContents(), 'yo hello hi', 'order correct')

  a.insert('hola', 'pal', 2)
  strictEqual(a.tableOfContents(), 'yo hello hola hi', 'order correct')

  a.patchOrder('hello\nhi\nhola\nyo')
  strictEqual(a.tableOfContents(), 'hello hi hola yo', 'order correct')
  a.patchOrder('yo\nhola\nhi\nhello')
  strictEqual(a.tableOfContents(), 'yo hola hi hello', 'order correct')
  strictEqual(a.get('yo'), 'pal', 'types okay')

  // Recursive
  a = new Space('b\n content hi\n value foobar')
  var b = new Space('b\n value foobar\n content hi')
  strictEqual(a.diffOrder(b).toString(), 'b\n value\n content\n', 'diff order correct')
  strictEqual(a.patchOrder(a.diffOrder(b)).toString(), b.toString(), 'recursive order patch')
})

test('set', function() {
  var value = new Space('hello world')
  strictEqual(value.get('hello'), 'world')
  ok(value.set('hello', 'mom') instanceof Space, 'set should return instance so we can chain it')

  var byint = new Space()
  byint.set(2, 'hi')
  strictEqual(byint.get(2), 'hi')

  var blah = new Space()
  value.set('boom', '')
  strictEqual(value.get('boom'), '', 'empty string')

  strictEqual(value.get('hello'), 'mom', 'value should be changed')
  value.set('head style color', 'blue')
  strictEqual(value.get('head style color'), 'blue', 'set should have worked')

  var foo = new Space('style\n')
  foo.set('style color', 'red')
  foo.set('style width', '100')
  strictEqual(foo.get('style color'), 'red')
  strictEqual(foo.get('style width'), '100')

  var a = new Space('hello world\n')
  a.set('hi', 'mom')
  strictEqual(a.tableOfContents(), 'hello hi', 'order correct')
  a.insert('yo', 'pal', 0)
  strictEqual(a.tableOfContents(), 'yo hello hi', 'order correct')

  a.insert('hola', 'pal', 2)
  strictEqual(a.tableOfContents(), 'yo hello hola hi', 'order correct')

  var c = new Space()
  c.set('hi', 'hello world')
  c.set('yo', new Space('hello world'))
    // should these be equal?
  notEqual(c.get('hi'), c.get('yo'))

  var a = new Space()
  a.set('meta x', 123)
  a.set('meta y', 1235)
  a.set('meta c', 435)
  a.set('meta x', 1235123)
  strictEqual(a.get('meta c'), 435)

  var space = new Space('name John\nage\nfavoriteColors\n blue\n  blue1 1\n  blue2 2\n green\n red 1\n')

  space.set('favoriteColors blue', 'purple').toString()
  strictEqual(space.get('favoriteColors blue'), 'purple')
})

test('setByIndexPath', function() {
  var space = new Space()
  space.set('body header h1 title a', 'hello')
  space.set('body footer a', 'hello')
  space.set('body footer li', 'world')
  space.setByIndexPath('0 1 1', 'mom')
  strictEqual(space.getByIndexPath('0 1 1'), 'mom')

  var s = new Space('h1 hello world')
  s.setByIndexPath('0', 'mom')
  strictEqual(s.get('h1'), 'mom')
})

test('shift', function() {
  var a = new Space('john\n age 5\nsusy\n age 6\nbob\n age 10')
  strictEqual(a.length, 3)
  strictEqual(a.shift().toString(), 'john\n age 5\n')
  strictEqual(a.length, 2)

  var empty = new Space()
  strictEqual(empty.shift(), null)
})

test('sort', function() {
  var a = new Space('john\n age 5\nsusy\n age 6\nbob\n age 10')
  strictEqual(a.tableOfContents(), 'john susy bob')
  a.sort(function(a, b) {
    return b[0] < a[0]
  })
  strictEqual(a.tableOfContents(), 'bob john susy')
})

test('split', function() {
  var a = new Space(testStrings.splitTest)
  strictEqual(a.split("foobar").length, 0)
  strictEqual(a.split("title").length, 3)
  strictEqual(a.split("title")[2].get("date"), "2/25/2016")

  var b = new Space(testStrings.splitTest)
  var c = b.split("title", "post")
  ok(c instanceof Space)
  strictEqual(c.length, 3)
  strictEqual(c.get('post content'), 'Hello world')
})

test('toBinary', function() {
  var a = new Space("ABC\n")
  strictEqual(a.toBinary(), '-|-----|-|----|--|----||----|-|-')
})

test('toBinaryMatrixString', function() {
  var a = new Space("A")
  strictEqual(a.toBinaryMatrixString(), '01000001\n')
})

test('toCsv', function() {
  var a = new Space(testStrings.toDelimited)
  strictEqual(a.toCsv(), testStrings.toCsvResult)
})

test('toDecimalMatrix', function() {
  var a = new Space("A")
  var matrix = a.toDecimalMatrix()
  strictEqual(matrix[0][0], 65)
})

test('toDecimalMatrixString', function() {
  var a = new Space("A")
  strictEqual(a.toDecimalMatrixString(), '065\n')
})

// Test this only in node.js
if (isNode) {
  asyncTest('toFile and fromFile', 7, function() {

    // Arrange
    var fs = require("fs"),
        obj = new Space('hello world'),
        filename = 'toFileTest.space'

    // Act
    Space.toFile(filename, obj)

    // Assert
    ok(fs.existsSync(filename), "Expected file to exist")

    // Act
    var fromFile = Space.fromFile(filename)

    // Assert
    ok(fromFile instanceof Space, "Expected space object")
    strictEqual(fromFile.toString(), obj.toString(), "Expected equal space objects")

    // Cleanup
    fs.unlinkSync(filename)

    // Act
    Space.toFile(filename, obj, function (err) {

      // Assert
      ok(!err, "Expected no error")

      // Act
      Space.fromFile(filename, function (err, newObj) {
        // Assert
        ok(!err, "Expected no error")
        ok(newObj instanceof Space, "Expected space object")
        strictEqual(newObj.toString(), obj.toString(), "Expected equal space objects")

        // Cleanup
        fs.unlinkSync(filename)
        start()
      })
    })

  })
}

test('toggle', function() {
  var a = new Space('on true')
  a.toggle('on', 'true', 'false')
  strictEqual(a.get('on'), 'false')
  a.toggle('on', 'true', 'false')
  strictEqual(a.get('on'), 'true')
})

test('toJavascript', function() {
  var a = new Space("hello world")
  strictEqual(a.toJavascript(), 'new Space(\'hello world\\n\')')

  var b = new Space('hello \'world')
  strictEqual(b.toJavascript(), "new Space(\'hello \\\'world\\n\')")

  var c = new Space('hello \'world\'')
  strictEqual(c.toJavascript(), "new Space(\'hello \\\'world\\\'\\n\')")

  var d = new Space('hello "world"')
  strictEqual(d.toJavascript(), "new Space(\'hello \"world\"\\n\')")

  var multiline = new Space('name John\nname John')
  strictEqual(multiline.toJavascript(true), "new Space(\'name John\\n\\\nname John\\n\\\n\')")
})

test('toJSON', function() {
  var a = new Space("hello world")
  strictEqual(a.toJSON(), '{"hello":"world"}')

  var b = new Space("foo bar")
  a.set('b', b)
  strictEqual(a.toJSON(), '{"hello":"world","b":{"foo":"bar"}}')
})

test('toObject', function() {
  var a = new Space("hello world")

  ok(typeof a.toObject() === 'object')
  strictEqual(a.toObject()['hello'], 'world')

  var b = new Space("foo bar")
  a.set('b', b)
  strictEqual(a.toObject()['b']['foo'], 'bar')
})

test('toObject with types', function() {
  var sample = testStrings.json,
      a = new Space(sample),
      js = a.toObject(true),
      s = JSON.stringify(js, null, 2),
      samplejson = JSON.stringify(sample, null, 2)

  strictEqual(s, samplejson)
})

test('toQueryString', function() {
  var a = new Space("name Breck")

  strictEqual(a.toQueryString(), 'name=Breck')
  a.set('city', 'Brockton')
  strictEqual(a.toQueryString(), 'name=Breck&city=Brockton')
  a.set('city', 'Brockton, MA')
  strictEqual(a.toQueryString(), 'name=Breck&city=Brockton%2C%20MA')
})

test('toShapes', function() {
  var a = new Space(testStrings.getByIndexPath)
  strictEqual(a.toShapes(), testStrings.shapes)
})

test('toSsv', function() {
  var a = new Space(testStrings.toDelimited)
  strictEqual(a.toSsv(), testStrings.toSsvResult)
})

test('toString', function() {
  var value = new Space('hello world')
  strictEqual(value.toString(), 'hello world\n')
  value.set('foo', 'bar')
  strictEqual(value.toString(), 'hello world\nfoo bar\n')

  var a = new Space('john\n age 5')
  strictEqual(a.toString(), 'john\n age 5\n')
  ok(a.toString() != 'john\n age 5')

  a.set('multiline', 'hello\nworld')

  strictEqual(a.toString(), 'john\n age 5\nmultiline hello\n world\n')

  a.set('other', 'foobar')

  strictEqual(a.toString(), 'john\n age 5\nmultiline hello\n world\nother foobar\n')

  b = new Space('a\n text \n  this is a multline string\n  and more')
  strictEqual(b.toString(), 'a\n text \n  this is a multline string\n  and more\n')
  a.set('even_more', b)
  strictEqual(a.toString(), 'john\n age 5\nmultiline hello\n world\nother foobar\neven_more\n a\n  text \n   this is a multline string\n   and more\n')

  var e = new Space('z-index 0')
  e['z-index'] = 0
  strictEqual(e.toString(), 'z-index 0\n')
})

test('toTsv', function() {
  var a = new Space(testStrings.toDelimited)
  strictEqual(a.toTsv(), testStrings.toTsvResult)
})

test('toXML', function() {
  var a = new Space(testStrings.toXml)
  strictEqual(a.toXML(), testStrings.toXmlResult)
  strictEqual(a.toXML(true), testStrings.toXmlPrettyResult)
})

test('toXMLWithAttributes', function() {
  var a = new Space(testStrings.toXmlWithAttributes)
  strictEqual(a.toXMLWithAttributes(true), testStrings.toXmlWithAttributesResult)
})

test('__transpose', function() {
  var a = new Space(testStrings.transposeData)
  var html = a.__transpose(testStrings.transposeTemplate)
  strictEqual(html.toString().trim(), testStrings.transposeExpected)
})

test('union', function() {
  var a = new Space('maine me\nnew_york nyc\ncali ca')
  var b = new Space('maine me\nnew_york nyc\ncali ca')
  var c = new Space('maine me')
  var d = new Space('maine me\nflorida fl\ncali ca')
  ok(Space.union(a, b), 'a and b are same')
  strictEqual(Space.union(a, b).length, 3, 'union should have 3 items')
  strictEqual(Space.union(a, c).length, 1, 'union should have 1 item')
  ok(Space.union(a, c).toString() === c.toString(), 'union should be equal to c')

  strictEqual(Space.union(a, b, c, d).length, 1, 'union should take multiple params')
  strictEqual(Space.union(a, b, d).length, 2, 'union should be 2 long')
  strictEqual(Space.union(d, a, b, c).length, 1, 'union should 1 be long')

  a = new Space('font-family Arial\nbackground red\ncolor blue\nwidth 10px')
  b = new Space('font-family Arial\nbackground green\ncolor blue\nwidth 10px')
  c = new Space('font-family Arial\nbackground orange\ncolor blue\nwidth 12px')
  d = new Space('font-family Arial\nbackground #aaa\ncolor blue\nwidth 12px')
  e = new Space('font-family Arial\nbackground #fff\ncolor blue\nwidth 121px')

  var union = Space.union(a, b, c, d, e)
  strictEqual(union.length, 2, 'should should have length 2')
  strictEqual(union.get('color'), 'blue', 'union should have color blue')
  strictEqual(union.get('font-family'), 'Arial', 'union should have font family arial')

  union = Space.union.apply(a, [b, c, d, e])
  strictEqual(union.length, 2, 'union should have length 2')
})

test('update', function() {
  var a = new Space('hello world')
  a.update(0, 'hi', 'mom')
  strictEqual(a.toString(), 'hi mom\n')
  strictEqual(a.indexOf("hello"), -1)
  strictEqual(a.indexOf("hi"), 0)
  strictEqual(a.get("hello"), undefined)
})

test('url methods', function() {
  var a = new Space('maine me\nnew_york nyc\ncali ca')
  var encoded = a.toURL()
  var b = new Space(decodeURIComponent(encoded))
  strictEqual(a.toString(), b.toString(), 'toUrl worked')
})

test('web methods', function() {
  // TODO: write tests for node.js and browser.
  ok(Space.fromUrl)
  ok(Space.toUrl)
})

test('version', function() {
  ok(Space.version)
})

test('__width', function() {
  space = new Space('hello world')
  strictEqual(space.__width(), 11)
})
