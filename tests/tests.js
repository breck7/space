QUnit.module("Space")
var isNode = typeof require !== "undefined"

test("Basic constructor tests", function() {
  // Assert
  ok(Space, "Space class should exist")
  ok(new Space() instanceof Space, "Space should return a space")

  // Arrange/Act
  var space = new Space("hello world")

  // Assert
  strictEqual(space.length, 1, "types array should have 1 property")
  strictEqual(space.indexOf("hello"), 0, "types array should be correct")
  strictEqual(space.get("hello"), "world", "Properties should be accessible")
  strictEqual(typeof space.get("hello"), "string", "Leafs should be strings")

  // Act
  space.set("foo", "bar")

  // Assert
  strictEqual(space.get("foo"), "bar", "Spaces should be modifiable")

  // Arrange
  space = new Space("foobar\n one 1")

  // Assert
  strictEqual(typeof space.get("foobar"), "object", "Spaces should be objects")
  ok(space.get("foobar") instanceof Space, "Nested spaces should be spaces")

  // Arrange
  space = new Space("list\nsingle value")

  // Assert
  strictEqual(space.length, 2, "Space should have 2 names")
  ok(space.get("list") instanceof Space, "A name without a trailing space should be a space")

  // Arrange
  space = new Space("body")

  // Assert
  ok(space.get("body") instanceof Space, "A name without a trailing space should be a space")

  // Arrange
  space = new Space({
    foobar: "hello"
  })

  // Assert
  strictEqual(space.get("foobar"), "hello", "Spaces can be created from object literals")

  // Arrange
  space = new Space({
    foobar: new Space("hello world")
  })

  // Assert
  strictEqual(space.get("foobar hello"), "world", "Spaces can be created from objects mixed with spaces")

  // Arrange
  space = new Space({
    foobar: {
      hello: {
        world: "success"
      }
    }
  })

  // Assert
  strictEqual(space.get("foobar hello world"), "success", "Spaces can be created from deep objects")

  // Test multline creation
  // Arrange
  string = "user\n\
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
     content Hello world\n"
  space = new Space(string)

  // Assert
  strictEqual(space.get("domains test.test.com pages home settings data title"), "Hello, World", "Multiline creation should be okay.")
})

test("append", function() {
  // Arrange
  var space = new Space("hello world"),
      count = 0

  space.on("append", function(property, value) {
    count++
  })

  // Act
  space.append("foo", "bar")
  space.set("foo2", "bar")

  // Assert
  strictEqual(space.get("foo"), "bar")
  strictEqual(count, 1)

  // Act
  space.append("foo", "two")

  // Assert
  strictEqual(space.length, 4)
})

test("clear", function() {
  // Arrange/Act
  var space = new Space("hello world")

  // Assert
  strictEqual(space.length, 1)
  ok(space.clear() instanceof Space, "clear should return this so its chainable")
  strictEqual(space.length, 0)

  // Arrange
  space = new Space("hello world")

  // Act
  space.clear("foo bar")

  // Assert
  ok(!space.get("hello"))
  strictEqual(space.get("foo"), "bar")
})

test("clone", function() {
  // Arrange/Act
  var a = new Space("hello world"),
      b = a.clone()

  // Assert
  strictEqual(b.get("hello"), "world")

  // Act
  b.set("hello", "mom")

  // Assert
  strictEqual(a.get("hello"), "world")

  // Arrange
  var c = a

  // Assert
  strictEqual(c.get("hello"), "world")

  // Act
  c.set("hello", "foo")

  // Assert
  strictEqual(a.get("hello"), "foo")

  // Arrange
  var d = c

  // Assert
  strictEqual(d.get("hello"), "foo")

  // Act
  d.set("hello", "hiya")

  // Assert
  strictEqual(a.get("hello"), "hiya")

  // Act
  a.set("test", "boom")

  // Assert
  strictEqual(d.get("test"), "boom")

  // Act
  a.set("foobar", new Space("123 456"))

  // Assert
  strictEqual(c.get("foobar 123"), "456")

  // Arrange
  var e = a

  // Assert
  strictEqual(e.get("foobar 123"), "456")

  // Arrange
  var f = a.clone()

  // Assert
  strictEqual(f.get("foobar 123"), "456")

  // Act
  f.hi = "test"

  // Assert
  strictEqual(a.hi, undefined)
})

test("concat", function() {
  // Arrange
  var a = new Space("hello world"),
      b = new Space("hi mom")

  // Act
  a.concat(b)

  // Assert
  strictEqual(a.get("hi"), "mom")
})

test("create", function() {
  // Arrange
  var a = new Space("hello world")
      count = 0

  a.on("create", function(property, value) {
    count++
  })

  // Act
  a.create("foo", "bar")
  a.set("foo2", "bar")

  // Assert
  strictEqual(a.get("foo"), "bar")
  strictEqual(count, 1)
})

test("deepLength", function() {
  // Arrange
  var value = new Space("hello world\nhi mom")
  // Assert
  strictEqual(value.deepLength(), 2)

  // Arrange
  var value = new Space(testStrings.renameAll)
  // Assert
  strictEqual(value.deepLength(), 12)

  // Arrange
  var value = new Space("hello world\nhi mom\n how are you")
  // Assert
  strictEqual(value.deepLength(), 2)
})

test("delete", function() {
  // Arrange
  var space = new Space()
  space.set("name", "Breck")

  // Assert
  strictEqual(space.get("name"), "Breck", "name is set")
  strictEqual(space.length, 1, "length okay")

  // Act
  space.delete("name")

  // Assert
  strictEqual(space.get("name"), undefined, "name is gone")
  strictEqual(space.length, 0, "length okay")

  // Test deep delete
  // Arrange
  space.set("earth north_america united_states california san_francisco", "mission")

  // Assert
  ok(space.get("earth north_america united_states california") instanceof Space)
  strictEqual(space.get("earth north_america united_states california san_francisco"), "mission", "neighborhood is set")
  strictEqual(space.get("earth north_america united_states california").length, 1, "length okay")
  strictEqual(space.length, 1, "length okay")

  // Act
  var deleteResult = space.delete("earth north_america united_states california san_francisco")

  // Assert
  ok(deleteResult instanceof Space, "returns space")
  strictEqual(space.get("earth north_america united_states california san_francisco"), undefined, "neighborhood is gone")

  // Test deleting a non-existant property
  // Arrange
  space = new Space("property meta\n")

  // Act
  space.delete("content")

  // Assert
  strictEqual(space.get("property"), "meta", "delete a non existing entry works")

  // Delete by int
  // Arrange
  space = new Space()

  // Act/Assert
  ok(space.delete(2))

  // Arrange
  space = new Space("hi\nhello world")

  // Act
  space.delete(1)

  // Assert
  strictEqual(space.toString(), "hi\n")

  // Delete a property that has multiple matches
  // Arrange
  space = new Space("time 123\ntime 456")

  // Assert
  strictEqual(space.length, 2)

  // Act
  space.delete("time")

  // Assert
  strictEqual(space.length, 0)
})

test("duplicate properties", function () {
  // Arrange
  var space = new Space("time 123\ntime 456")

  // Assert
  strictEqual(space.length, 2)
  strictEqual(space.toString(), "time 123\ntime 456\n")
})

test("diff of subclasses", function() {
  // Arrange
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

  var a = new Space("hello world"),
      b = new Space("hello mom"),
      c = new Space("first John")

  // Assert
  strictEqual(a.diff(b).toString(), "hello mom\n")
  ok(a.diff(c) instanceof Space, "diff is a space")
  strictEqual(a.diff(c).get("hello"), "")
  strictEqual(a.diff(c).toString(), "hello \nfirst John\n")
  strictEqual(a.diff(c).get("first"), "John")

  // Arrange
  a = new Space("hi 1")
  b = new Space("hi 1")

  // Act
  var diff = a.diff(b)

  // Assert
  ok(diff instanceof Space, "diff is a space")
  strictEqual(diff.toString(), "", "No difference")

  // Arrange
  a = new Space("hi 1")
  b = new Space()

  // Act
  b.set("hi", 1)

  // Assert
  strictEqual(a.diff(b).toString(), "")

  // Arrange
  var d = new Space()
  var e = new Space("z-index 0")
  var patch = d.diff(e)

  // Assert
  strictEqual(patch.toString(), "z-index 0\n")

  // Act
  e["z-index"] = 0
  patch = d.diff(e)

  // Assert
  strictEqual(patch.toString(), "z-index 0\n")

  // Arrange
  var page = new Page("body\n b1\n  content hi")
  var page4 = new Page()
  var page2 = new Page("body\n b1\n  content hi")
  var block = new Block("foobar")
  var block2 = new Block("b2")

  // Assert
  strictEqual(page4.toString(), "", "No properties in new instance")
  ok(block instanceof Space, "block is instance of Space")
  ok(block instanceof Block, "block is instance of Block")
  strictEqual(block.id, "foobar", "id is set")
  strictEqual(block2.id, "b2", "id is set")

  // Act
  diff = block.diff(block2)

  // Assert
  strictEqual(diff.length, 0, "Difference between 2 spaces should not check privates.")

  // Act
  diff = block2.diff(block)

  // Assert
  strictEqual(diff.length, 0, "Difference between 2 spaces should not check privates.")
  ok(page instanceof Space, "page is instance of Space")
  ok(page instanceof Space, "page is instance of Page")
  ok(page.length, "page has 1 name/value")

  // Act
  page.set("body foobar", block)
  page2.set("body foobar", block2)
  diff = page.diff(page2)

  // Assert
  strictEqual(page.toString(), page2.toString(), "Pages should be equal")
  strictEqual(diff.length, 0, "Difference between 2 composites should not check privates in sub parts.")
  ok(page.get("body foobar") instanceof Block, "block1 is instance of Block")

  // Arrange
  var page3 = new Page("body\n b1\n  content hibob")

  // Act
  diff = page3.diff(page2)

  // Assert
  ok(diff.get("body foobar") instanceof Space, "block1 in page3 diff is instance of space")
  ok(!diff.get("body foobar id"), "id did not get set")
})

test("diffOrder", function() {
  // Arrange
  var a = new Space("body\n content hello world\n value Hi\n"),
      b = new Space("body\n value Hi\n content hello world\n"),
      c = new Space("hi world\nhello bob\nyo man\nhola dude"),
      d = new Space("hi world\nhello bob\nhola dude\nyo man"),
      e = new Space("hi world\nhello bob\nhola dude\nyo man")

  // Act/Assert
  strictEqual(a.diffOrder(b).toString(), "body\n value\n content\n", "different")
  strictEqual(d.diffOrder(e).toString(), "", "no diff")
  strictEqual(d.diffOrder(c).toString(), "hi\nhello\nyo\nhola\n", "different")
})

test("diff between a blank property/value and empty object", function() {
  // Arrange
  var a = new Space("hi "),
      b = new Space("hi\n")

  // Assert
  strictEqual(a.get("hi"), "", "hi is equal to empty string")
  ok(b.get("hi") instanceof Space, "b is instance of space")
  strictEqual(typeof a.get("hi"), "string")
  strictEqual(typeof b.get("hi"), "object")
  notStrictEqual(a.get("hi"), b.get("hi"))
  strictEqual(a.toString(), "hi \n", "a should be a property with empty string value")
  strictEqual(b.toString(), "hi\n")
})

test("duplicate property with getArray", function() {
  // Arrange
  var spaceWithDupe = "height 45px\nheight 50px\nwidth 56px",
      value = new Space(spaceWithDupe),
      spaceWithoutDupe = new Space("height 25px")

  // Assert
  strictEqual(value.getArray("height").length, 2)
  strictEqual(value.getArray("height")[1], "50px")
  strictEqual(spaceWithoutDupe.getArray("height").length, 1)
  strictEqual(spaceWithoutDupe.getArray("height")[0], "25px")
  strictEqual(spaceWithoutDupe.getArray("width").length, 0)
})

test("each", function() {
  // Arrange
  var value = new Space("hello world\nhi mom"),
      count = 0,
      string = ""

  // Act/Assert
  strictEqual(value.each(function(property, value) {
    string += property.toUpperCase()
    string += value.toUpperCase()
    string += this.length
  }).length, 2, "test chaining")
  strictEqual(string, "HELLOWORLD2HIMOM2")

  // Test that returning false breaks out of each
  // Arrange
  value = new Space("hello world\nhi mom")

  // Act
  value.each(function(property, value) {
    count++
    if (property === "hello")
      return false
  })
  // Assert
  strictEqual(count, 1)

  // Arrange
  var space = new Space("hello world\nhi world"),
      i = 0

  // Act
  space.each(function(property, value, index) {
    i = i + index
  })

  // Assert
  strictEqual(i, 1, "index worked")

  // Test recursion
  // Arrange
  space = new Space(testStrings.webpage)
  count = 0

  // Act
  space.each(function() {
    count++
  }, true)

  // Assert
  strictEqual(count, 11)
})

test("events", function() {
  // Arrange
  var value = new Space("hello world\nhi mom"),
      result = "",
      popsMethod = function() {
        result = "pops"
      }

  value.on("change", popsMethod)

  // Act
  value.set("hi", "dad")

  // Assert
  strictEqual(result, "pops")

  // Arrange
  result = ""
  value.off("change", popsMethod)

  // Act
  value.set("hi", "pop")

  // Assert
  strictEqual(result, "")

  // Arrange
  var count = 0,
      inc = function() {
        count++
      }

  value.on("set", inc)
  value.on("patch", inc)
  value.on("clear", inc)
  value.on("delete", inc)
  value.on("rename", inc)

  // Act
  value.set("yo", "bob")
  value.patch("foo bar")
  value.delete("yo")
  value.rename("foo", "foo2")
  value.clear()

  // Assert
  strictEqual(count, 5, "Expected count to equal 5.")

  // Event params
  // Arrange
  var a = new Space("hello world"),
      b = "",
      c = "",
      setCount = 0,
      changeCount  = 0

  a.on("set", function(property, value) {
    b = value
  })
  a.on("change", function() {
    changeCount++
  })
  a.on("patch", function(patch) {
    c = patch
  })
  a.on("set", function(property, value) {
    setCount++
  })

  // Act
  a.set("hello", "bob")
  a.patch("hi mom")

  // Assert
  strictEqual(b, "bob")
  strictEqual(c, "hi mom")
  strictEqual(setCount, 1)
  strictEqual(changeCount, 2)
})

test("event bubbling", function() {
  // Arrange
  var count = 0,
      cafe = new Space("name Haus\nmenu\n coffee\n  light\n   price 2.50\n  dark\n   price 3\n")

  cafe
    .get("menu coffee light")
    .on("change", function() {
      count++
    })

  // Act
  cafe
    .get("menu coffee light")
    .set("price", "6")

  // Assert
  strictEqual(count, 1)
})

test("every", function() {
  // Arrange
  var everyCount = 0,
      everyLeafCount = 0,
      everyObj = new Space(testStrings.every),
      leafsOnlyObj = new Space(testStrings.every)

  // Act
  everyObj.every(function(property, value) {
    this.rename(property, property.toUpperCase())
    everyCount++
  })
  leafsOnlyObj.everyLeaf(function(property, value) {
    this.rename(property, property.toUpperCase())
    everyLeafCount++
  })

  // Assert
  strictEqual(everyCount, 20, "Expected every fn to execute 20 times.")
  strictEqual(everyObj.get("DOMAINS TEST.TEST.COM PAGES HOME SETTINGS").toString(), "DATA\n TITLE Hello, World\n")
  strictEqual(everyLeafCount, 8, "Expected every leaf fn to execute 8 times.")
  strictEqual(leafsOnlyObj.get("domains test.test.com pages home settings data TITLE").toString(), "Hello, World")
})

test("extract", function() {
  // Arrange
  var value = new Space(testStrings.filter)

  // Act
  var result = value.extract("age")

  // Assert
  strictEqual(result.length, 4)
  strictEqual(result.get("age"), "21")
})

test("filter", function() {
  // Arrange
  var value = new Space(testStrings.filter),
      c = 0

  // Act
  value.filter(function(property, value) {
    return parseFloat(value.get("age")) > 22
  }).each(function() {
    c++
  })

  // Assert
  strictEqual(c, 1, "filter worked")
})

test("find", function() {
  // Arrange
  var a = new Space("john\n age 5\nsusy\n age 6\nbob\n age 10")

  // Assert
  strictEqual(a.find("age", "5").length, 1)
})

test("first", function() {
  // Arrange
  var value = new Space("hello world\nhi mom")

  // Assert
  strictEqual(value.getByIndex(0), "world")

  // Arrange
  value = new Space("hello world\nhi mom")

  // Assert
  strictEqual(value.first().toString(), "hello world\n")
})

test("firstProperty", function() {
  // Arrange
  var value = new Space("hello world\nhi mom")

  // Assert
  strictEqual(value.firstProperty(), "hello")
})

test("firstValue", function() {
  // Arrange
  var value = new Space("hello world\nhi mom")

  // Assert
  strictEqual(value.firstValue(), "world")
})

test("fromCsv", function() {
  // Arrange/Act
  var space = Space.fromCsv(testStrings.csv)
  var withQuotes = Space.fromCsv("\"Date\",\"Age\"\n\"123\",\"\345\"")

  // Assert
  strictEqual(space.toString(), testStrings.delimited)
  strictEqual(space.toCsv(), testStrings.csv, "Expected toCsv to output same data as fromCsv")

  // Arrange
  space = Space.fromCsv("Age,Birth Place,Country\n12,Brockton,USA")

  // Assert
  strictEqual(space.length, 1)
  strictEqual(space.getByIndex(0).get("Country"), "USA")

  // Arrange
  space = Space.fromCsv("")

  // Assert
  strictEqual(space.toString(), "")

  // Assert
  strictEqual(withQuotes.get("0 Date"), "123", "Expected quotes to be handled properly")
})

test("fromCsv no headers", function() {
  // Arrange
  var a = Space.fromCsv(testStrings.csvNoHeaders, false)

  // Assert
  strictEqual(a.length, 3)
  strictEqual(a.get("1 2"), "blue")
})

test("fromHeredoc", function() {
  // Arrange
  var doc = new Space(testStrings.heredoc)

  // Assert
  strictEqual(doc.length, 15)

  // Act
  var parsedDoc = Space.fromHeredoc(testStrings.heredoc, "body", "endbody")

  // Assert
  strictEqual(parsedDoc.length, 4)
})

test("fromSsv", function() {
  // Arrange/Act
  var a = Space.fromSsv(testStrings.ssv)

  // Assert
  strictEqual(a.toString(), testStrings.delimited)
  strictEqual(a.toSsv(), testStrings.ssv)
})

test("fromTsv", function() {
  // Arrange/Act
  var a = Space.fromTsv(testStrings.tsv)

  // Assert
  strictEqual(a.toString(), testStrings.delimited)
  strictEqual(a.toTsv(), testStrings.tsv)
})

if (!isNode) {
  test("fromXml", function() {
    // Arrange/Act
    var a = Space.fromXml(testStrings.toXmlWithAttributesResult)

    // Assert
    strictEqual(a.toString(), testStrings.toXmlWithAttributes)
  })
}

test("get", function() {
  // Arrange
  var space = new Space("hello world")

  // Assert
  strictEqual(space.get("hello"), "world")

  // Act
  // Test get with ints
  space.set("2", "hi")

  // Assert
  strictEqual(space.get(2), "hi", "Expected int to get casted to string and get value.")

  // Assert
  // Test get with invalid values
  strictEqual(new Space().get("some"), undefined)
  strictEqual(new Space().get("some long path"), undefined)
  strictEqual(space.get(), undefined)
  strictEqual(space.get(null), undefined)
  strictEqual(space.get(""), undefined)
  strictEqual(space.get(false), undefined)
  strictEqual(space.get(true), undefined)

  // Test get with duplicate properties
  // Arrange
  space = new Space("height 45px\nheight 50px\nwidth 56px")

  // Assert
  strictEqual(space.length, 3)

  // Act/Assert
  // When getting a duplicate property last item should win
  strictEqual(space.get("height"), "50px", "Expected to get last value in instance with duplicate property.")
})

test("getAll", function() {
  // Arrange
  var value = new Space("hello world\nhello world"),
      each = ""

  // Assert
  ok(value.getAll("hello") instanceof Space)
  strictEqual(value.getAll("hello").length, 2)

  // Act
  value.getAll("hello").each(function(k, v) {
    each += "a"
  })

  // Assert
  strictEqual(each, "aa")
})

test("_getValueByIndex", function() {
  // Arrange
  var value = new Space("hello world\nhow are you\nhola friend")

  // Assert
  strictEqual(value._getValueByIndex(0), "world")
  strictEqual(value._getValueByIndex(1), "are you")
  strictEqual(value._getValueByIndex(2), "friend")
  strictEqual(value._getValueByIndex(3), undefined)
  strictEqual(value._getValueByIndex(-1), "friend")
})

test("getCud", function() {
  // Arrange
  var a = new Space("name John\nage 25\nstate California")
  var b = new Space("name John\nage 22\nhometown Brockton")

  // Act
  var diff = a.getCud(b)

  // Assert
  strictEqual(diff.toString(), "created\n hometown Brockton\nupdated\n age 22\ndeleted\n state\n")
})

test("get expecting a branch but hitting a leaf", function() {
  // Arrange
  var value = new Space("posts leaf")

  // Assert
  strictEqual(undefined, value.get("posts branch"))
})

test("getPath", function() {
  // Arrange
  var space = new Space(testStrings.every)
  var parent = space.get("domains test.test.com pages home settings")
  var child = space.get("domains test.test.com pages home settings data")
  var simple = new Space("foo bar")

  // Assert
  strictEqual(child.getPath(), "domains test.test.com pages home settings data")
  strictEqual(child.getRoot(), space)
  strictEqual(simple.getRoot(), simple)
  strictEqual(child.getParent(), parent)
})

test("getValues", function() {
  // Arrange
  var html = new Space("h1 hello world\nh1 hello world")

  // Assert
  strictEqual(html.getValues().join("\n"), "hello world\nhello world")
})

test("has", function() {
  // Arrange
  space = new Space("hello world\nnested\nfoo ")

  // Assert
  strictEqual(space.has("hello"), true)
  strictEqual(space.has("world"), false)
  strictEqual(space.has("foo"), true)
  strictEqual(space.has("nested"), true)
})

test("html dsl", function() {
  // Arrange
  var html = new Space("h1 hello world\nh1 hello world"),
      page = ""

  // Act
  html.every(function(property, value) {
    page += "<" + property + ">" + value + "</" + property + ">"
  })

  // Assert
  strictEqual(page, "<h1>hello world</h1><h1>hello world</h1>")
})

test("indexOf", function() {
  // Arrange
  space = new Space("hello world")

  // Assert
  strictEqual(space.indexOf("hello"), 0)
  strictEqual(space.indexOf("hello2"), -1)

  // Act
  space.set("color", "")

  // Assert
  strictEqual(space.indexOf("color"), 1)
})

test("insert", function() {
  // Arrange
  space = new Space("hello world")

  // Act
  space.insert("hi", "mom", 0)

  // Assert
  strictEqual(space.indexOf("hi"), 0, "Expected hi at position 0")

  // Insert using an index longer than the current object
  // Act
  space.insert("test", "dad", 10)

  // Assert
  strictEqual(space.getByIndex(2), "dad", "Expected insert at int greater than length to append")
  strictEqual(space.length, 3)

  // Insert using a negative index
  // Act
  space.insert("test2", "sister", -1)

  // Assert
  strictEqual(space.getByIndex(2), "sister")
  strictEqual(space.getByIndex(3), "dad")
})

test("isEmpty", function() {
  // Arrange
  var a = new Space(),
      b = new Space("john\n age 5\nsusy\n age 6\nbob\n age 10")

  // Assert
  strictEqual(a.isEmpty(), true)
  strictEqual(b.isEmpty(), false)
})

test("isFlat", function() {
  // Arrange/Act/Assert
  ok(!new Space(testStrings.renameAll).isFlat())
  ok(!new Space(testStrings.filter).isFlat())
  ok(new Space(testStrings.splitTest).isFlat())
  ok(new Space("foo bar"))
  ok(new Space(""))
})

test("isStringMap", function() {
  // Arrange
  var a = new Space("john\n age 5\nsusy\n age 6\nbob\n age 10")

  // Assert
  strictEqual(a.isStringMap(), true)
  strictEqual(a.isStringMap(true), true)

  // Act
  a.get("john").append("age", "4")

  // Assert
  strictEqual(a.isStringMap(true), false)

  // Arrange
  var b = new Space("john\n age 5\nsusy\n age 6\njohn\n age 10")

  // Assert
  strictEqual(b.isStringMap(), false)
})

test("last", function() {
  // Arrange
  var value = new Space("hello world\nhi mom")
  // Assert
  strictEqual(value.getByIndex(-1), "mom")

  // Arrange
  var value = new Space("hello world\nhi mom")
  // Assert
  strictEqual(value.last().toString(), "hi mom\n")
})

test("lastProperty", function() {
  // Arrange
  var value = new Space("hello world\nhi mom")
  // Assert
  strictEqual(value.lastProperty(), "hi")
})

test("lastValue", function() {
  // Arrange
  var value = new Space("hello world\nhi mom")
  // Assert
  strictEqual(value.lastValue(), "mom")
})

test("loadFromArray", function() {
  // Arrange
  var a = new Space([1, 2, 3])
  // Assert
  strictEqual(a.toString(), "0 1\n1 2\n2 3\n")

  // Arrange
  a = new Space({
    data: [{
      charge: 1
    }, {
      charge: 2
    }]
  })

  // Assert
  strictEqual(a.toString(), "data\n 0\n  charge 1\n 1\n  charge 2\n")
})

test("loadFromObject", function() {
  // Arrange
  var space = new Space(testStrings.json),
      date = new Date(),
      time = date.getTime(),
      spaceWithDate = new Space({ name: "John", date: date})

  // Assert
  strictEqual(space.get("lowestScore"), -10)
  strictEqual(spaceWithDate.get("date"), time.toString())

  // Arrange
  // For now loading from a date just runs toString on date
  var spaceFromDate = new Space(new Date())
  var spaceWithFn = new Space(function(){})

  // Assert
  ok(spaceFromDate.length > 0)
  ok(spaceWithFn.length > 0)

  // Test against object with circular references
  // Arrange
  var a = {foo : "1"},
      b = {bar: "2", ref: a}

  // Act
  // Create circular reference
  a.c = b
  space = new Space(a)

  // Assert
  strictEqual(space.get("c bar"), "2")
  strictEqual(space.get("c ref"), undefined)

  // Arrange
  space = new Space()
  space.set("docs", testStrings.json2)

  // Assert
  //console.log(space.toString())
  strictEqual(space.toString(), testStrings.json2space)
})

test("loadFromSpace", function() {
  // Arrange
  var a = new Space("foo\n bar bam")
  var b = new Space(a)

  // Assert
  strictEqual(a.get("foo bar"), "bam")
  strictEqual(b.get("foo bar"), "bam")

  // Act
  a.set("foo bar", "wham")

  // Assert
  strictEqual(a.get("foo bar"), "wham")
  strictEqual(b.get("foo bar"), "bam")
})

test("loadFromString", function() {
  // Arrange
  var a = new Space("text \n this is a string\n and more")

  // Assert
  strictEqual(a.get("text"), "\nthis is a string\nand more")

  // Arrange
  var b = new Space("a\n text \n  this is a string\n  and more")

  // Assert
  strictEqual(b.get("a text"), "\nthis is a string\nand more")
  strictEqual(b.toString(), "a\n text \n  this is a string\n  and more\n")

  // Arrange
  var string = "first_name John\nlast_name Doe\nchildren\n 1\n  first_name Joe\n  last_name Doe\n  children\n   1\n    first_name Joe Jr.\n    last_name Doe\n    age 12\ncolors\n blue\n red\nbio \n Hello this is\n my multline\n biography\n \n Theres a blank line in there as well\n \n \n Two blank lines above this one.\ncode <p></p>\n"
  var c = new Space(string)

  // Assert
  strictEqual(c.get("children 1 children 1 age"), "12")
  strictEqual(c.toString().length, string.length)
  strictEqual(c.toString(), string)

  // Arrange
  var d = new Space("\n\na b\n")

  // Assert
  strictEqual(d.toString(), "a b\n", "Expected extra newlines at start of string to be trimmed")

  // Arrange
  var e = new Space("a b\n\nb c\n")
  // Assert
  strictEqual(e.toString(), "a b\nb c\n", "Expected extra newlines in middle of string to be trimmed")

  // Arrange
  var f = new Space("a b\n\n\n")
  // Assert
  strictEqual(f.toString(), "a b\n", "Expected extra newlines at end of string to be trimmed")

  // Arrange
  var g = new Space("hi\n     somewhat invalid")
  // Assert
  strictEqual(g.get("hi somewhat"), "invalid")
})

test("loadFromString extra spaces", function() {
  // Arrange
  var d = new Space("one\ntwo\n  three\n    four\nfive six")
  // Assert
  strictEqual(d.length, 3)
})

test("map properties", function() {
  // Arrange
  var foo = new Space("hello world\nfoo bar")

  // Act
  foo.map(function (v){ return v.toUpperCase()}, null, null, true)

  // Assert
  strictEqual(foo.toString(), "HELLO world\nFOO bar\n")

  // Act
  foo.set("some deep object", "bam")

  // Assert
  strictEqual(foo.get("some deep object"), "bam")

  // Act
  foo.map(function (v){ return v.toUpperCase()}, null, null, true)

  // Assert
  strictEqual(foo.get("some deep object"), undefined, "expected object not to be there")
  strictEqual(foo.get("SOME deep object"), "bam", "expected path to be changed")

  // Act
  foo.map(function (v){ return v.toUpperCase()}, null, true, true)

  // Assert
  ok(!foo.get("SOME deep object"), "expected path to be changed recursively")
  strictEqual(foo.get("SOME DEEP OBJECT"), "bam", "expected recursive map to work")
})

test("map values", function() {
  // Arrange
  var foo = new Space("hello    world   \nfoo    bar  ")

  // Act
  foo.map(null, function (v){ return v.trim()}, null, true)

  // Assert
  strictEqual(foo.toString(), "hello world\nfoo bar\n")

  // Act
  foo.set("some deep object", "    bam   ")

  // Assert
  strictEqual(foo.get("some deep object"), "    bam   ")

  // Act
  foo.map(null, function (v){ return v.trim()}, true, true)

  // Assert
  strictEqual(foo.get("some deep object"), "bam")
})

test("multiline", function() {
  // Arrange
  var a = new Space("my multiline\n string")
  // Assert
  strictEqual(a.get("my"), "multiline\nstring")

  // Arrange
  a = new Space("my \n \n multiline\n string")
  // Assert
  strictEqual(a.get("my"), "\n\nmultiline\nstring")

  // Arrange
  var b = new Space("brave new\n world")
  // Assert
  strictEqual(b.get("brave"), "new\nworld", "ml value correct")
  strictEqual(b.toString(), "brave new\n world\n", "multiline does not begin with nl")

  // Arrange
  var c = new Space("brave \n new\n world")
  // Assert
  strictEqual(c.get("brave"), "\nnew\nworld", "ml begin with nl value correct")
  strictEqual(c.toString(), "brave \n new\n world\n", "multiline begins with nl")

  // Arrange
  var d = new Space("brave \n \n new\n world")
  // Assert
  strictEqual(d.get("brave"), "\n\nnew\nworld", "ml begin with 2 nl value correct")
  strictEqual(d.toString(), "brave \n \n new\n world\n", "multiline begins with 2 nl")

  // Arrange
  var e = new Space("brave new\n world\n ")
  // Assert
  strictEqual(e.get("brave"), "new\nworld\n", "ml value end with nl correct")
  strictEqual(e.toString(), "brave new\n world\n \n", "multiline ends with a nl")

  // Arrange
  var f = new Space("brave new\n world\n \n ")
  // Assert
  strictEqual(f.get("brave"), "new\nworld\n\n", "ml value end with 2 nl correct")
  strictEqual(f.toString(), "brave new\n world\n \n \n", "multiline ends with 2 nl")

  // Arrange
  var g = new Space()
  g.set("brave", "\nnew\nworld\n\n")
  // Assert
  strictEqual(g.get("brave"), "\nnew\nworld\n\n", "set ml works")
  strictEqual(g.toString(), "brave \n new\n world\n \n \n", "set ml works")
})

test("next", function() {
  // Arrange
  var a = new Space("john\n age 5\nsusy\n age 6\nbob\n age 10")

  // Assert
  strictEqual(a.next("john"), "susy")
  strictEqual(a.prev("john"), "bob")
  strictEqual(a.next("susy"), "bob")
  strictEqual(a.prev("susy"), "john")
  strictEqual(a.prev("bob"), "susy")
  strictEqual(a.next("bob"), undefined)
  strictEqual(a.next("foobar"), "john")
})

test("order", function() {
  // Arrange
  var a = new Space("john\n age 5\nsusy\n age 6\nbob\n age 10")
  var types = a.tableOfContents()

  // Assert
  strictEqual(types, "john susy bob", "order is preserved")
})

test("patch", function() {
  // Arrange
  var a = new Space("hello world")
  var b = new Space("hello mom")

  // Act
  a.patch(b)

  // Assert
  strictEqual(a.get("hello"), "mom")

  // Arrange
  var c = new Space("hello mom")
  c.set("hello", new Space("foo\n cell 123"))

  // Act
  a.patch(c)

  // Assert
  strictEqual(a.get("hello foo cell"), "123")

  // Arrange
  a = new Space("style\n background-color rgb(57, 112, 1)\n border 17px solid white\n color rgb(0, 0, 0)\n font-family Lato\n font-size 16px\n height 100\n left 379px\n top 200\n width 274px\n border-radius 35px\n")
  b = new Space("height 203\ntop 117\n")

  // Act
  a.get("style").patch(b)

  // Assert
  strictEqual(a.get("style height"), "203")
  strictEqual(a.get("style top"), "117")

  // Arrange
  a = new Space("background-color rgb(57, 112, 1)\nborder 17px solid white\ncolor rgb(0, 0, 0)\nfont-family Lato\nfont-size 16px\nheight 199px\nleft 379px\ntop 117px\nwidth 274px\nborder-radius 35px\n")
  b = new Space("height 202\ntop 117\n")

  // Act
  a.patch(b)

  // Assert
  strictEqual(a.get("height"), "202")
  strictEqual(a.get("top"), "117")

  // Arrange
  a = new Space("first John\nlast Doe")
  b = new Space("last\n 1 Doe\n 2 Smith")
  c = new Space("last Aaron")

  // Act
  a.patch(b)

  // Assert
  strictEqual(a.get("last 2"), "Smith", "test 2")

  // Act
  a.patch(c)

  // Assert
  strictEqual(a.get("last"), "Aaron")

  // Arrange
  var patch = new Space()
  patch.set("first", "Frank")
  patch.set("last", "Grimes")

  // Act
  a.patch(new Space(new Space(patch)))

  // Assert
  strictEqual(a.get("last"), "Grimes")
  strictEqual(a.get("first"), "Frank")

  // delete an element
  // Arange
  var page = new Space()
  page.set("text", new Space("content hello world"))

  // Assert
  strictEqual(page.length, 1)

  // Act
  page.patch(new Space("text "))

  // Assert
  strictEqual(page.length, 0, "item deleted")

  // Arrange
  var pages = new Space()
  pages.set("page1", new Space("text\n content hello world"))

  // Assert
  strictEqual(pages.get("page1").length, 1)

  // Act
  pages.get("page1").patch("text")

  // Assert
  strictEqual(pages.get("page1").length, 0)

  // Arrange
  a = new Space("property meta\n")
  b = new Space("content\n")

  // Act
  a.patch(b)

  // Assert
  strictEqual(a.length, 1, "patch okay")
  strictEqual(a.get("property"), "meta", "patch okay")

  // Arrange
  var space = new Space("meta\n property meta")
  patch = new Space("meta\n content")

  // Act
  space.patch(patch)

  // Assert
  strictEqual(space.get("meta property"), "meta", "patch okay")

  // Arrange
  a = new Space("hello world")

  // Act/Assert
  ok(a.patch(), "If nothing passed dont error.")
  ok(a.patch(""), "If nothing passed dont error.")
  ok(a.patch(false), "If nothing passed dont error.")
  strictEqual(a.toString(), "hello world\n")
})

test("pop", function() {
  // Arrange
  var a = new Space("john\n age 5\nsusy\n age 6\nbob\n age 10"),
      empty = new Space()

  // Assert
  strictEqual(a.length, 3)

  // Act/Assert
  strictEqual(a.pop().toString(), "bob\n age 10\n")
  strictEqual(a.length, 2)
  strictEqual(empty.pop(), null)
})

test("prepend", function() {
  // Arrange
  var a = new Space("hello world")
  // Act
  a.prepend("foo", "bar")
  // Assert
  strictEqual(a.toString(), "foo bar\nhello world\n")
})

test("prev", function() {
  // Arrange
  var a = new Space("john\n age 5\nsusy\n age 6\nbob\n age 10")
  // Assert
  strictEqual(a.next("john"), "susy")
  strictEqual(a.prev("john"), "bob")
  strictEqual(a.next("susy"), "bob")
  strictEqual(a.prev("susy"), "john")
  strictEqual(a.prev("bob"), "susy")
})

test("push", function() {
  // Arrange
  var a = new Space()

  // Act
  a.push("hello world")

  // Assert
  strictEqual(a.get("0"), "hello world")

  // Act
  a.push(new Space())

  // Assert
  ok(a.get("1") instanceof Space)
})

test("query", function() {
  // Arrange
  var string = new Space("user\n\
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
      content Hello world\n")

  var query = new Space("user\n name\n domains\n  test.test.com\n   pages\n    home\n     block1")

  // Act
  var result = string.getBySpace(query)

  // Assert
  ok(result instanceof Space, "Retrieve returns a space")
  strictEqual(result.length, 1, "1 root node")
  strictEqual(result.get("user name"), "Aristotle", "Name retrieved successfully")
  ok(typeof result.get("user pro") === "undefined", "Did not retrieve pro value")
  strictEqual(result.get("user domains test.test.com pages home block1 content"), "Hello world")
})

test("reload", function() {
  // Arrange
  var a = new Space("john\n age 5\nsusy\n age 6"),
      count = 0

  // Act
  ok(a.reload())

  // Assert
  strictEqual(a.length, 0, "empty reload cleared object")

  // Arrange
  a.on("reload", function() {
    count++
  })

  // Act
  a.reload("john 1")
  a.reload("john 2")

  // Assert
  strictEqual(a.length, 1)
  strictEqual(a.get("john"), "2")
  strictEqual(count, 2)
})

test("rename", function() {
  // Arrange
  var a = new Space("john\n age 5\nsusy\n age 6\ncandy bar\nx 123\ny 45\n"),
      originalLength = a.length,
      originalString = a.toString(),
      index = a.indexOf("john")

  // Assert
  strictEqual(index, 0, "index okay")

  // Act
  ok(a.rename("john", "breck") instanceof Space, "returns itself for chaining")
  a.rename("candy", "ice")

  // Assert
  index = a.indexOf("breck")
  strictEqual(index, 0, "index okay")
  strictEqual(a.get("breck age"), "5", "value okay")

  // Act
  a.rename("breck", "john")
  a.rename("ice", "candy")

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
})

test("renameAll", function() {
  // Arrange
  var space = new Space(testStrings.renameAll)

  // Assert
  strictEqual(space.toString().match(/first-name/g).length, 5)

  // Act
  space.renameAll("first-name", "firstName", true)

  // Assert
  strictEqual(space.toString().match(/firstName/g).length, 5)
})

test("renameObjects", function() {
  // Arrange
  var space = new Space(testStrings.renameObjects)

  // Act
  space.renameObjects("email")

  // Assert
  strictEqual(space.get("johndoe@email.com name"), "John Doe")
  strictEqual(space.get("maryjane@email.com name"), "Mary Jane")
})

test("reorder", function() {
  // Arrange
  var a = new Space("hello world\n")

  // Act
  a.set("hi", "mom")

  // Assert
  strictEqual(a.tableOfContents(), "hello hi", "order correct")

  // Act
  a.insert("yo", "pal", 0)

  // Assert
  strictEqual(a.tableOfContents(), "yo hello hi", "order correct")

  // Act
  a.insert("hola", "pal", 2)

  // Assert
  strictEqual(a.tableOfContents(), "yo hello hola hi", "order correct")

  // Act
  a.patchOrder("hello\nhi\nhola\nyo")
  // Assert
  strictEqual(a.tableOfContents(), "hello hi hola yo", "order correct")

  // Act
  a.patchOrder("yo\nhola\nhi\nhello")
  // Assert
  strictEqual(a.tableOfContents(), "yo hola hi hello", "order correct")
  strictEqual(a.get("yo"), "pal", "types okay")

  // Recursive
  // Arrange
  a = new Space("b\n content hi\n value foobar")
  var b = new Space("b\n value foobar\n content hi")
  // Assert
  strictEqual(a.diffOrder(b).toString(), "b\n value\n content\n", "diff order correct")
  strictEqual(a.patchOrder(a.diffOrder(b)).toString(), b.toString(), "recursive order patch")
})

test("replace", function() {
  // Arrange
  var space = new Space(testStrings.filter)

  // Act
  space.replace(/age/g, "currentAge")

  // Assert
  strictEqual(space.extract("currentAge").length, 4)
})

test("reverse", function() {
  // Arrange
  var space = new Space("hi mom\nhey sis\nhey dad")

  // Assert
  strictEqual(space.get("hey"), "dad")

  // Act
  space.reverse()

  // Assert
  strictEqual(space.toString(), "hey dad\nhey sis\nhi mom\n")
  strictEqual(space.get("hey"), "sis")
})

test("set", function() {
  // Arrange
  var space = new Space("hello world")

  // Assert
  strictEqual(space.get("hello"), "world")
  ok(space.set("hello", "mom") instanceof Space, "set should return instance so we can chain it")
  strictEqual(space.get("hello"), "mom")

  // Act
  space.set("boom", "")
  // Assert
  strictEqual(space.get("boom"), "", "empty string")

  // Act
  space.set("head style color", "blue")
  // Assert
  strictEqual(space.get("head style color"), "blue", "set should have worked")

  // Test dupes
  // Arrange
  space.append("hello", "bob")

  // Act
  space.set("hello", "tim")

  // Assert
  // TODO: should set(foo,bar) change all occurrences of foo? Or just the first one, like now?
  // Seems like it would make more sense to change all occurrences or change the last occurrences.
  strictEqual(space.get("hello"), "bob", "Expected set to change last occurrence of property.")

  // TEST INT SCENARIOS
  // Arrange
  space = new Space()

  // Act
  space.set(2, "hi")
  space.set(3, 3)
  // Assert
  strictEqual(space.get(2), "hi")
  strictEqual(space.get("2"), "hi")
  strictEqual(space.get("3"), 3)

  // TEST SPACEPATH SCENARIOS
  // Arrange
  space = new Space("style\n")
  // Act
  space.set("style color", "red")
  space.set("style width", "100")

  // Assert
  strictEqual(space.get("style color"), "red")
  strictEqual(space.get("style width"), "100")

  // TEST ORDERING
  // Arrange
  space = new Space("hello world\n")
  // Act
  space.set("hi", "mom")
  // Assert
  strictEqual(space.tableOfContents(), "hello hi", "order correct")

  // Act
  space.insert("yo", "pal", 0)
  // Assert
  strictEqual(space.tableOfContents(), "yo hello hi", "order correct")

  // Act
  space.insert("hola", "pal", 2)
  // Assert
  strictEqual(space.tableOfContents(), "yo hello hola hi", "order correct")

  // Arrange
  space = new Space()
  // Act
  space.set("hi", "hello world")
  space.set("yo", new Space("hello world"))
  // Assert
  notEqual(space.get("hi"), space.get("yo"))

  // Arrange
  space = new Space()

  // Act
  space.set("meta x", 123)
  space.set("meta y", 1235)
  space.set("meta c", 435)
  space.set("meta x", 1235123)

  // Assert
  strictEqual(space.get("meta c"), 435)

  // Arrange
  space = new Space("name John\nage\nfavoriteColors\n blue\n  blue1 1\n  blue2 2\n green\n red 1\n")

  // Act
  space.set("favoriteColors blue", "purple").toString()

  // Assert
  strictEqual(space.get("favoriteColors blue"), "purple")

  // Act
  space.set("     invalid", "test")
  space.set("  \n   invalid2", "test2")

  // Assert
  strictEqual(space.get("invalid"), "test", "Expected extra spaces in path to be sanitized")
  strictEqual(space.get("invalid2"), "test2", "Expected newlines in path to be sanitized")
})

test("shift", function() {
  // Arrange
  var space = new Space("john\n age 5\nsusy\n age 6\nbob\n age 10"),
      empty = new Space()
  // Act/Assert
  strictEqual(space.length, 3)
  strictEqual(space.shift().toString(), "john\n age 5\n")
  strictEqual(space.length, 2)
  strictEqual(empty.shift(), null)
})

test("sort", function() {
  // Arrange
  var space = new Space("john\n age 5\nsusy\n age 6\nbob\n age 10")
  // Assert
  strictEqual(space.tableOfContents(), "john susy bob")
  // Act
  space.sort(function(a, b) {
    return b.property < a.property
  })
  // Assert
  strictEqual(space.tableOfContents(), "bob john susy")
})

test("sortBy", function() {
  // Arrange
  var space = new Space("john\n age 5\nsusy\n age 6\nbob\n age 10\nsam\n age 21\nbrian\n age 6")
  // Assert
  strictEqual(space.tableOfContents(), "john susy bob sam brian")

  // Act
  space.sortBy("age")

  // Assert
  strictEqual(space.tableOfContents(), "bob sam john susy brian")

  // Act
  space.sortBy("age", parseFloat)

  // Assert
  strictEqual(space.tableOfContents(), "john susy brian bob sam")

  // Act
  space.sortBy("age", parseFloat)

  // Assert
  strictEqual(space.tableOfContents(), "john susy brian bob sam", "Expected stable sort")
})

test("split", function() {
  // Arrange
  var a = new Space(testStrings.splitTest)
  var b = new Space(testStrings.splitTest)
  var c = b.split("title", "post")
  // Assert
  strictEqual(a.split("foobar").length, 0)
  strictEqual(a.split("title").length, 3)
  strictEqual(a.split("title")[2].get("date"), "2/25/2016")
  ok(c instanceof Space)
  strictEqual(c.length, 3)
  strictEqual(c.get("post content"), "Hello earth")
})

test("toCsv", function() {
  // Arrange
  var a = new Space(testStrings.delimited)
  // Act/Assert
  strictEqual(a.toCsv(), testStrings.csv)
})

// Test this only in node.js
if (isNode) {
  asyncTest("toFile and fromFile", 7, function() {

    // Arrange
    var fs = require("fs"),
        obj = new Space("hello world"),
        filename = "toFileTest.space"

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

test("toggle", function() {
  // Arrange
  var a = new Space("on true")
  // Act
  a.toggle("on", "true", "false")
  // Assert
  strictEqual(a.get("on"), "false")
  // Act
  a.toggle("on", "true", "false")
  // Assert
  strictEqual(a.get("on"), "true")
})

test("toJavascript", function() {
  // Arrange
  var a = new Space("hello world")
  // Assert
  strictEqual(a.toJavascript(), "new Space(\"hello world\\n\")")

  // Arrange
  var b = new Space("hello \"world")
  // Assert
  strictEqual(b.toJavascript(), "new Space(\"hello \\\"world\\n\")")

  // Arrange
  var c = new Space("hello \"world\"")
  // Assert
  strictEqual(c.toJavascript(), "new Space(\"hello \\\"world\\\"\\n\")")

  // Arrange
  var d = new Space("hello \"world\"")
  // Assert
  strictEqual(d.toJavascript(), "new Space(\"hello \\\"world\\\"\\n\")")

  // Arrange
  var multiline = new Space("name John\nname John")
  // Assert
  strictEqual(multiline.toJavascript(true), "new Space(\"name John\\n\\\nname John\\n\\\n\")")
})

test("toJSON", function() {
  // Arrange
  var a = new Space("hello world")
  var b = new Space("foo bar")

  // Assert
  strictEqual(a.toJSON(), "{\"hello\":\"world\"}")

  // Act
  a.set("b", b)
  // Assert
  strictEqual(a.toJSON(), "{\"hello\":\"world\",\"b\":{\"foo\":\"bar\"}}")
})

test("toObject", function() {
  // Arrange
  var a = new Space("hello world")
  var b = new Space("foo bar")

  // Assert
  ok(typeof a.toObject() === "object")
  strictEqual(a.toObject()["hello"], "world")

  // Act
  a.set("b", b)
  // Assert
  strictEqual(a.toObject()["b"]["foo"], "bar")
})

test("toObject with types", function() {
  // Arrange/Act
  var sample = testStrings.json,
      a = new Space(sample),
      js = a.toObject(true),
      s = JSON.stringify(js, null, 2),
      samplejson = JSON.stringify(sample, null, 2)

  // Assert
  strictEqual(s, samplejson)
})

test("toQueryString", function() {
  // Arrange
  var a = new Space("name Breck")
  // Assert
  strictEqual(a.toQueryString(), "name=Breck")
  // Act
  a.set("city", "Brockton")
  // Assert
  strictEqual(a.toQueryString(), "name=Breck&city=Brockton")
  // Act
  a.set("city", "Brockton, MA")
  // Assert
  strictEqual(a.toQueryString(), "name=Breck&city=Brockton%2C%20MA")
})

test("toSsv", function() {
  var a = new Space(testStrings.delimited)
  // Assert
  strictEqual(a.toSsv(), testStrings.ssv)
})

test("toString", function() {
  // Arrange
  var space = new Space("hello world")
  // Assert
  strictEqual(space.toString(), "hello world\n", "Expected correct string.")
  // Act
  space.set("foo", "bar")
  // Assert
  strictEqual(space.toString(), "hello world\nfoo bar\n")

  // Arrange
  space = new Space("z-index 0")
  // Act
  space["z-index"] = 0
  // Assert
  strictEqual(space.toString(), "z-index 0\n")

  // Test empty values
  // Arrange
  space = new Space()

  // Act
  space.set("empty", "")
  space.set("undefined", undefined)
  space.set("null", null)
  // Assert
  strictEqual(space.toString(), "empty \nundefined undefined\nnull null\n")

  // Arrange
  var a = new Space("john\n age 5")
  // Assert
  strictEqual(a.toString(), "john\n age 5\n")
  ok(a.toString() != "john\n age 5")
  // Act
  a.set("multiline", "hello\nworld")
  // Assert
  strictEqual(a.toString(), "john\n age 5\nmultiline hello\n world\n")

  // Act
  a.set("other", "foobar")
  // Assert
  strictEqual(a.toString(), "john\n age 5\nmultiline hello\n world\nother foobar\n")

  // Arrange
  var b = new Space("a\n text \n  this is a multline string\n  and more")
  // Assert
  strictEqual(b.toString(), "a\n text \n  this is a multline string\n  and more\n")

  // Test setting an instance as a value in another instance
  // Act
  a.set("even_more", b)
  // Assert
  strictEqual(a.toString(), "john\n age 5\nmultiline hello\n world\nother foobar\neven_more\n a\n  text \n   this is a multline string\n   and more\n")
})

test("toTsv", function() {
  // Arrange
  var a = new Space(testStrings.delimited)
  // Assert
  strictEqual(a.toTsv(), testStrings.tsv)
})

test("toXML", function() {
  // Arrange
  var a = new Space(testStrings.toXml)
  // Assert
  strictEqual(a.toXML(), testStrings.toXmlResult)
  strictEqual(a.toXML(true), testStrings.toXmlPrettyResult)
})

test("toXMLWithAttributes", function() {
  // Arrange
  var a = new Space(testStrings.toXmlWithAttributes)
  // Assert
  strictEqual(a.toXMLWithAttributes(true), testStrings.toXmlWithAttributesResult)
})

test("trim", function() {
  // Arrange
  var space = new Space(testStrings.webpage)

  // Test deep
  // Act/Assert
  strictEqual(space.trim(true).toString(), testStrings.webpageTrimmed)

  // Arrange
  space = new Space(testStrings.webpage)

  // Test shallow
  // Act/Assert
  strictEqual(space.trim().toString(), testStrings.webpage.substr(5), "Expected almost same thing")
})

test("union", function() {
  // Arrange
  var a = new Space("maine me\nnew_york nyc\ncali ca")
  var b = new Space("maine me\nnew_york nyc\ncali ca")
  var c = new Space("maine me")
  var d = new Space("maine me\nflorida fl\ncali ca")

  // Act/Assert
  ok(Space.union(a, b), "a and b are same")
  strictEqual(Space.union(a, b).length, 3, "union should have 3 items")
  strictEqual(Space.union(a, c).length, 1, "union should have 1 item")
  ok(Space.union(a, c).toString() === c.toString(), "union should be equal to c")
  strictEqual(Space.union(a, b, c, d).length, 1, "union should take multiple params")
  strictEqual(Space.union(a, b, d).length, 2, "union should be 2 long")
  strictEqual(Space.union(d, a, b, c).length, 1, "union should 1 be long")

  // Arrange
  a = new Space("font-family Arial\nbackground red\ncolor blue\nwidth 10px")
  b = new Space("font-family Arial\nbackground green\ncolor blue\nwidth 10px")
  c = new Space("font-family Arial\nbackground orange\ncolor blue\nwidth 12px")
  d = new Space("font-family Arial\nbackground #aaa\ncolor blue\nwidth 12px")
  e = new Space("font-family Arial\nbackground #fff\ncolor blue\nwidth 121px")

  // Act
  var union = Space.union(a, b, c, d, e)
  // Assert
  strictEqual(union.length, 2, "should should have length 2")
  strictEqual(union.get("color"), "blue", "union should have color blue")
  strictEqual(union.get("font-family"), "Arial", "union should have font family arial")

  // Act
  union = Space.union.apply(a, [b, c, d, e])
  // Assert
  strictEqual(union.length, 2, "union should have length 2")
})

test("update", function() {
  // Arrange
  var space = new Space("hello world")

  // Act
  space.update(0, "hi", "mom")

  // Assert
  strictEqual(space.toString(), "hi mom\n")
  strictEqual(space.indexOf("hello"), -1)
  strictEqual(space.indexOf("hi"), 0)
  strictEqual(space.get("hello"), undefined)
})

test("url methods", function() {
  // Arrange
  var a = new Space("maine me\nnew_york nyc\ncali ca")
  var encoded = a.toURL()
  var b = new Space(decodeURIComponent(encoded))
  // Assert
  strictEqual(a.toString(), b.toString(), "toUrl worked")
})

test("web methods", function() {
  // Assert
  // TODO: write tests for node.js and browser.
  ok(Space.fromUrl)
  ok(Space.toUrl)
})

test("version", function() {
  // Assert
  ok(Space.version)
})
