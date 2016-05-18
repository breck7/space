"use strict";

QUnit.module("Space")
const isNode = typeof require !== "undefined"

const testStrings = {}

testStrings.renameAll = `first-name John
children
 child
  first-name Frank
  children
   child
    first-name mary
 child
  first-name Sue
  children
   child
    first-name Abe`

testStrings.mergeDuplicates = `file
 one
file
 two
file
 four`

testStrings.deleteDuplicates = `file one
file
 two
file
 four
`

testStrings.filter = `john
 age 21
 height 123
mairi
 age 3
 height 341
frank
 age 50
 height 423
bob
 age 21
 height 123
`

testStrings.group = `
0
 age 21
 count 2
1
 age 3
 count 1
2
 age 50
 count 1
`

testStrings.webpage = `head
body
 div
 div
 div
  class main
  content yo
 div
 div
  class footer
  content hi
`

testStrings.webpageTrimmed = `body
 div
  class main
  content yo
 div
  class footer
  content hi
`

testStrings.sortByMultiple = `
state
 name Error
 date 4/1/10
 key a
state
 name Success
 date 2/2/11
 key b
state
 name Error
 date 1/3/32
 key c
`

testStrings.json2 = [{"id":755,"settings":"123"},{"id":756,"settings":"456"}]
testStrings.json2space = `docs
 0
  id 755
  settings 123
 1
  id 756
  settings 456
`

testStrings.every = `user
name Aristotle
admin false
stage
 name home
 domain test.test.com
pro false
domains
 test.test.com
  images
  blocks
  users
  stage home
  pages
   home
    settings
     data
      title Hello, World
    block1
     content Hello world`

testStrings.toXml = `
html
 head
 body
  div
  div
   class main
   content yo
  div
   class footer
   content hi
`

testStrings.toXmlResult = "<html><head></head><body><div></div><div><class>main</class><content>yo</content>" +
  "</div><div><class>footer</class><content>hi</content></div></body></html>"

testStrings.toXmlPrettyResult = `<html>
  <head></head>
  <body>
    <div></div>
    <div>
      <class>main</class>
      <content>yo</content>
    </div>
    <div>
      <class>footer</class>
      <content>hi</content>
    </div>
  </body>
</html>
`

testStrings.toXmlWithAttributes = `html
 class main
 children
  head
  body
   style color: red;
   children
    div
     class main
     children
      0 Hello world
`

testStrings.toXmlWithAttributesResult = `<html class="main">
  <head></head>
  <body style="color: red;">
    <div class="main">Hello world</div>
  </body>
</html>
`

testStrings.fromDelimited = `foodName^weight^Pri
~Apple~^2.2^1
~Banana~^3.2^1`

testStrings.splitTest = `
thisWillBe ignored
title This is a test
content Hello world
date 2/25/2014
title This is not a test
content Hello planet
date 2/25/2015
title This is definitely a test
content Hello earth
date 2/25/2016
`

testStrings.heredoc = `
title This is a test
summary This is a multiline
 string with indentation.
body

This is a multiline string without indentation
==============================================

- When you want to write long things by hand and
  then later parse them.
- This is just an example of a workaround for what
  otherwise would be an annoying limitation in writing space
  objects by hand.
- The upside of this approach is you can still easily extract
  some structured information without having to structure the
  whole document. The downside is that treating the whole
  item as a space doc will include some nonsense.

It will parse fine but does require an operation to combine all of these
pairs.

In this case, we have:

- space.parseHeredoc("body", "endbody")
- space.createHeredoc("body", "endbody")

endbody
date 2/25/2014
`

testStrings.delimited = `0
 id 1
 title Some book
 summary An expose, on the result of one "plus" one
1
 id 2
 title The answer, my friend, is...
 summary "Two"
`

testStrings.renameTest = `title b on GitHub
description
hideLabels true
public true
arrangeables stargazers_count created_at forks_count open_issues_count language
aliases
 stargazers_count Stars
 created_at Created
 forks_count Forks
 language Language
 open_issues_count Issues
formats
 stargazers_count 0a
types
 language string
 created_at date
x language
y stargazers_counter
`

testStrings.csv = `id,title,summary
1,Some book,"An expose, on the result of one ""plus"" one"
2,"The answer, my friend, is...","""Two"""
`

testStrings.csvNoHeaders = `bob,12,red
mike,321,blue
al,1214,green
`

testStrings.toFixedWidth =
`name score color
 bob    12   red
mike   321  blue
  al  1214 green
`

testStrings.ssv = `id title summary
1 "Some book" "An expose, on the result of one ""plus"" one"
2 "The answer, my friend, is..." """Two"""
`

testStrings.ssvFixedColumnComment1 = "This is some comment with spaces"
testStrings.ssvFixedColumnComment2 = "Each row should be capped to 2 columns"
testStrings.ssvFixedColumns = `id comment
123 ${testStrings.ssvFixedColumnComment1}
456 ${testStrings.ssvFixedColumnComment2}
`

testStrings.ssvMissingColumns = `state abbreviation population
california ca 35000000
texas tx
washington wa 6000000`

testStrings.renameObjects = `
0
 name John Doe
 email johndoe@email.com
1
 name Mary Jane
 email maryjane@email.com
`

testStrings.newLines = `
tree
 palm
  green true

  location Cali
 pine

  location Maine
bush foo
`

testStrings.tsv = `id\ttitle\tsummary
1\tSome book\t\"An expose, on the result of one \"\"plus\"\" one\"
2\tThe answer, my friend, is...\t\"\"\"Two\"\"\"
`

testStrings.json = {
  "firstName": "John",
  "lastName": "Smith",
  "isAlive": true,
  "lowScore": 0,
  "lowestScore": -10,
  "age": 25,
  "height_cm": 167.6,
  "numbers": [12, 132.2, 312, true, null, false, {}, ""],
  "address": {
    "streetAddress": "21 2nd Street",
    "city": "New York",
    "state": "NY",
    "postalCode": "10021-3100",
    "blankString": ""
  },
  "phoneNumbers": [
    {
      "type": "home",
      "number": "212 555-1234"
    },
    {
      "type": "office",
      "number": "646 555-4567"
    }
  ],
  "spouse": null
}

test("Basic constructor tests", () => {
  // Assert
  ok(Space, "Space class should exist")
  ok(new Space() instanceof Space, "Space should return a space")

  // Arrange/Act
  const space = new Space("hello world")

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
  const space2 = new Space("foobar\n one 1")

  // Assert
  strictEqual(typeof space2.get("foobar"), "object", "Spaces should be objects")
  ok(space2.get("foobar") instanceof Space, "Nested spaces should be spaces")

  // Arrange
  const space3 = new Space("list\nsingle value")

  // Assert
  strictEqual(space3.length, 2, "Space should have 2 names")
  ok(space3.get("list") instanceof Space, "A name without a trailing space should be a space")

  // Arrange
  const space4 = new Space("body")

  // Assert
  ok(space4.get("body") instanceof Space, "A name without a trailing space should be a space")

  // Arrange
  const space5 = new Space({
    foobar: "hello"
  })

  // Assert
  strictEqual(space5.get("foobar"), "hello", "Spaces can be created from object literals")

  // Arrange
  const space6 = new Space({
    foobar: new Space("hello world")
  })

  // Assert
  strictEqual(space6.get("foobar hello"), "world", "Spaces can be created from objects mixed with spaces")

  // Arrange
  const space7 = new Space({
    foobar: {
      hello: {
        world: "success"
      }
    }
  })

  // Assert
  strictEqual(space7.get("foobar hello world"), "success", "Spaces can be created from deep objects")

  // Test multline creation
  // Arrange
  const spaceString = `user
name Aristotle
admin false
stage
name home
domain test.test.com
pro false
domains
 test.test.com
  images
  blocks
  users
  stage home
  pages
   home
    settings
     data
      title Hello, World
    block1
     content Hello world`
  const space8 = new Space(spaceString)

  // Assert
  strictEqual(space8.get("domains test.test.com pages home settings data title"), "Hello, World", "Multiline creation should be okay.")
})

test("append", () => {
  // Arrange
  const space = new Space("hello world")

  // Act
  space.append("foo", "bar")
  space.set("foo2", "bar")

  // Assert
  strictEqual(space.get("foo"), "bar")

  // Act
  space.append("foo", "two")

  // Assert
  strictEqual(space.length, 4)
})

test("at", () => {
  // Arrange
  const value = new Space("hello world\nhow are you\nhola friend")

  // Assert
  strictEqual(value.at(0), "world")
  strictEqual(value.at(1), "are you")
  strictEqual(value.at(2), "friend")
  strictEqual(value.at(3), undefined)
  strictEqual(value.at(-1), "friend")
})

test("clear", () => {
  // Arrange/Act
  const space = new Space("hello world")

  // Assert
  strictEqual(space.length, 1)
  ok(space.clear() instanceof Space, "clear should return this so its chainable")
  strictEqual(space.length, 0)

  // Arrange
  const space2 = new Space("hello world")

  // Act
  space2.clear("foo bar")

  // Assert
  ok(!space2.get("hello"))
  strictEqual(space2.get("foo"), "bar")
})

test("clone", () => {
  // Arrange/Act
  const a = new Space("hello world")
  const b = a.clone()

  // Assert
  strictEqual(b.get("hello"), "world")

  // Act
  b.set("hello", "mom")

  // Assert
  strictEqual(a.get("hello"), "world")

  // Arrange
  const c = a

  // Assert
  strictEqual(c.get("hello"), "world")

  // Act
  c.set("hello", "foo")

  // Assert
  strictEqual(a.get("hello"), "foo")

  // Arrange
  const d = c

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
  const e = a

  // Assert
  strictEqual(e.get("foobar 123"), "456")

  // Arrange
  const f = a.clone()

  // Assert
  strictEqual(f.get("foobar 123"), "456")

  // Act
  f.hi = "test"

  // Assert
  strictEqual(a.hi, undefined)
})

test("concat", () => {
  // Arrange
  const a = new Space("hello world")
  const b = new Space("hi mom")

  // Act
  a.concat(b)

  // Assert
  strictEqual(a.get("hi"), "mom")
})

test("decrement", () => {
  // Arrange
  const a = new Space("car\n count 2")

  // Act
  a.decrement("car count")

  // Assert
  strictEqual(a.get("car count"), 1)
})

test("deleteDuplicates", () => {
  // Arrange
  const value = new Space(testStrings.deleteDuplicates)

  // Assert
  strictEqual(value.length, 3)

  // Act
  value.deleteDuplicates()

  // Assert
  strictEqual(value.length, 1)
})

test("mergeDuplicates", () => {
  // Arrange
  const value = new Space(testStrings.mergeDuplicates)

  // Assert
  strictEqual(value.length, 3)

  // Act
  value.mergeDuplicates()

  // Assert
  strictEqual(value.length, 1)
  strictEqual(value.deepLength(), 4)
})

test("deepLength", () => {
  // Arrange
  const value = new Space("hello world\nhi mom")
  // Assert
  strictEqual(value.deepLength(), 2)

  // Arrange
  const value2 = new Space(testStrings.renameAll)
  // Assert
  strictEqual(value2.deepLength(), 12)

  // Arrange
  const value3 = new Space("hello world\nhi mom\n how are you")
  // Assert
  strictEqual(value3.deepLength(), 2)
})

test("delete", () => {
  // Arrange
  const space = new Space()
  space.set("name", "Breck")

  // Assert
  strictEqual(space.get("name"), "Breck", "name is set")
  strictEqual(space.length, 1, "length okay")

  // Act
  space.delete("name")

  // Assert
  strictEqual(space.get("name"), undefined, "name is gone")
  strictEqual(space.length, 0, "length okay")

  // Act
  space.set("name", "Breck")
  space.set("age", "100")
  space.set("table", "true")
  space.delete("age")

  // Assert
  strictEqual(space.get("age"), undefined, "age is gone")
  strictEqual(space.length, 2, "expected 2 elements remaining")

  // Test deep delete
  // Arrange
  const space2 = new Space()
  space2.set("earth north_america united_states california san_francisco", "mission")

  // Assert
  ok(space2.get("earth north_america united_states california") instanceof Space)
  strictEqual(space2.get("earth north_america united_states california san_francisco"), "mission", "neighborhood is set")
  strictEqual(space2.get("earth north_america united_states california").length, 1, "length okay")
  strictEqual(space2.length, 1, "length okay")

  // Act
  const deleteResult = space2.delete("earth north_america united_states california san_francisco")

  // Assert
  ok(deleteResult instanceof Space, "returns space")
  strictEqual(space2.get("earth north_america united_states california san_francisco"), undefined, "neighborhood is gone")

  // Test deleting a non-existant property
  // Arrange
  const space3 = new Space("property meta\n")

  // Act
  space3.delete("content")

  // Assert
  strictEqual(space3.get("property"), "meta", "delete a non existing entry works")

  // Delete a property that has multiple matches
  // Arrange
  const space4 = new Space("time 123\ntime 456")

  // Assert
  strictEqual(space4.length, 2)

  // Act
  space4.delete("time")

  // Assert
  strictEqual(space4.length, 0)
})

test("delete at", () => {
  // Arrange
  const space = new Space()

  // Act/Assert
  ok(space.deleteAt(2))

  // Arrange
  const space2 = new Space("hi\nhello world")

  // Act
  space2.deleteAt(1)

  // Assert
  strictEqual(space2.toString(), "hi\n")

  // Act
  space2.deleteAt(0)

  // Assert
  strictEqual(space2.length, 0)

  // Arrange
  space2.reload("name bob\nage 30\nheight 21")

  // Assert
  strictEqual(space2.length, 3)

  // Act
  space2.deleteAt([0,2,4])

  // Assert
  strictEqual(space2.length, 1)
  strictEqual(space2.get("age"), "30")
})

test("duplicate properties", () => {
  // Arrange
  const space = new Space("time 123\ntime 456")

  // Assert
  strictEqual(space.length, 2)
  strictEqual(space.toString(), "time 123\ntime 456\n")
})

test("diff of subclasses", () => {
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

  const a = new Space("hello world")
  const b = new Space("hello mom")
  const c = new Space("first John")

  // Assert
  strictEqual(a.diff(b).toString(), "hello mom\n")
  ok(a.diff(c) instanceof Space, "diff is a space")
  strictEqual(a.diff(c).get("hello"), "")
  strictEqual(a.diff(c).toString(), "hello \nfirst John\n")
  strictEqual(a.diff(c).get("first"), "John")

  // Arrange
  const a2 = new Space("hi 1")
  const b2 = new Space("hi 1")

  // Act
  const diff = a2.diff(b2)

  // Assert
  ok(diff instanceof Space, "diff is a space")
  strictEqual(diff.toString(), "", "No difference")

  // Arrange
  const a3 = new Space("hi 1")
  const b3 = new Space()

  // Act
  b3.set("hi", 1)

  // Assert
  strictEqual(a3.diff(b3).toString(), "")

  // Arrange
  const d = new Space()
  const e = new Space("z-index 0")
  const patch = d.diff(e)

  // Assert
  strictEqual(patch.toString(), "z-index 0\n")

  // Act
  e["z-index"] = 0
  const patch2 = d.diff(e)

  // Assert
  strictEqual(patch2.toString(), "z-index 0\n")

  // Arrange
  const page = new Page("body\n b1\n  content hi")
  const page4 = new Page()
  const page2 = new Page("body\n b1\n  content hi")
  const block = new Block("foobar")
  const block2 = new Block("b2")

  // Assert
  strictEqual(page4.toString(), "", "No properties in new instance")
  ok(block instanceof Space, "block is instance of Space")
  ok(block instanceof Block, "block is instance of Block")
  strictEqual(block.id, "foobar", "id is set")
  strictEqual(block2.id, "b2", "id is set")

  // Act
  const diff2 = block.diff(block2)

  // Assert
  strictEqual(diff2.length, 0, "Difference between 2 spaces should not check privates.")

  // Act
  const diff3 = block2.diff(block)

  // Assert
  strictEqual(diff3.length, 0, "Difference between 2 spaces should not check privates.")
  ok(page instanceof Space, "page is instance of Space")
  ok(page instanceof Space, "page is instance of Page")
  ok(page.length, "page has 1 name/value")

  // Act
  page.set("body foobar", block)
  page2.set("body foobar", block2)
  const diff4 = page.diff(page2)

  // Assert
  strictEqual(page.toString(), page2.toString(), "Pages should be equal")
  strictEqual(diff4.length, 0, "Difference between 2 composites should not check privates in sub parts.")
  ok(page.get("body foobar") instanceof Block, "block1 is instance of Block")

  // Arrange
  const page3 = new Page("body\n b1\n  content hibob")

  // Act
  const diff5 = page3.diff(page2)

  // Assert
  ok(diff5.get("body foobar") instanceof Space, "block1 in page3 diff is instance of space")
  ok(!diff5.get("body foobar id"), "id did not get set")
})

test("diff between a blank property/value and empty object", () => {
  // Arrange
  const a = new Space("hi ")
  const b = new Space("hi\n")

  // Assert
  strictEqual(a.get("hi"), "", "hi is equal to empty string")
  ok(b.get("hi") instanceof Space, "b is instance of space")
  strictEqual(typeof a.get("hi"), "string")
  strictEqual(typeof b.get("hi"), "object")
  notStrictEqual(a.get("hi"), b.get("hi"))
  strictEqual(a.toString(), "hi \n", "a should be a property with empty string value")
  strictEqual(b.toString(), "hi\n")
})

test("each", () => {
  // Arrange
  const value = new Space("hello world\nhi mom")
  var count = 0
  var result = ""

  // Act/Assert
  strictEqual(value.each(function (property, value) {
    result += property.toUpperCase()
    result += value.toUpperCase()
    result += this.length
  }).length, 2, "test chaining")
  strictEqual(result, "HELLOWORLD2HIMOM2")

  // Test that returning false breaks out of each
  // Arrange
  const value2 = new Space("hello world\nhi mom")

  // Act
  value2.each((property, value) => {
    count++
    if (property === "hello")
      return false
  })
  // Assert
  strictEqual(count, 1)

  // Arrange
  const space = new Space("hello world\nhi world")
  var i = 0

  // Act
  space.each((property, value, index) => {
    i = i + index
  })

  // Assert
  strictEqual(i, 1, "index worked")

  // Test recursion
  // Arrange
  const space2 = new Space(testStrings.webpage)
  count = 0

  // Act
  space2.each(() => {
    count++
  }, true)

  // Assert
  strictEqual(count, 11)

  // Test reverse
  // Arrange
  const space3 = new Space("1 1\n2 2\n")
  result = ""

  // Act
  space3.each((k, v) => {
    result += k
  }, undefined, true)

  // Assert
  strictEqual(result, "21")
})

test("every", () => {
  // Arrange
  var everyCount = 0
  var everyLeafCount = 0
  const everyObj = new Space(testStrings.every)
  const leafsOnlyObj = new Space(testStrings.every)

  // Act
  everyObj.every(function (property, value){
    this.rename(property, property.toUpperCase())
    everyCount++
  })
  leafsOnlyObj.everyLeaf(function (property, value) {
    this.rename(property, property.toUpperCase())
    everyLeafCount++
  })

  // Assert
  strictEqual(everyCount, 20, "Expected every fn to execute 20 times.")
  strictEqual(everyObj.get("DOMAINS TEST.TEST.COM PAGES HOME SETTINGS").toString(), "DATA\n TITLE Hello, World\n")
  strictEqual(everyLeafCount, 8, "Expected every leaf fn to execute 8 times.")
  strictEqual(leafsOnlyObj.get("domains test.test.com pages home settings data TITLE").toString(), "Hello, World")
})

test("extract", () => {
  // Arrange
  const value = new Space(testStrings.filter)

  // Act
  const result = value.extract("age")

  // Assert
  strictEqual(result.length, 4)
  strictEqual(result.get("age"), "21")
})

test("filter", () => {
  // Arrange
  const value = new Space(testStrings.filter)
  var c = 0

  // Act
  value.filter((property, value) => {
    return parseFloat(value.get("age")) > 22
  }).each(() => {
    c++
  })

  // Assert
  strictEqual(c, 1, "filter worked")

  // Arrange
  const filterInPlace = new Space(testStrings.filter)

  // Act
  filterInPlace.filter((k, v, i) => { return v.get("age") === "50"}, true)

  // Assert
  strictEqual(filterInPlace.length, 1)
})

test("find", () => {
  // Arrange
  const a = new Space("john\n age 5\nsusy\n age 6\nbob\n age 6\n color blue")

  // Act/Assert
  strictEqual(a.find("age", "5").length, 1)
  strictEqual(a.find("age", "6").length, 2)
  strictEqual(a.find("age", "6").find("color", "blue").length, 1)

  // Test modifying find results
  // Arrange
  const john = a.find("age", "5").at(0)

  // Act
  john.set("age", "6")

  // Assert
  strictEqual(a.find("age", "6").length, 3)
})

test("first", () => {
  // Arrange
  const value = new Space("hello world\nhi mom")

  // Assert
  strictEqual(value.at(0), "world")

  // Arrange
  const value2 = new Space("hello world\nhi mom")

  // Assert
  strictEqual(value2.pairAt(0).toString(), "hello world\n")
})

test("firstProperty", () => {
  // Arrange
  const value = new Space("hello world\nhi mom")

  // Assert
  strictEqual(value.propertyAt(0), "hello")
})

test("firstValue", () => {
  // Arrange
  const value = new Space("hello world\nhi mom")

  // Assert
  strictEqual(value.at(0), "world")
})

test("format", () => {
  // Arrange
  const str = "Hi {firstName} {lastName}! I hope you are enjoying the weather in {address city}!"
  const person = new Space("firstName Tom\nlastName B\naddress\n city Boston")

  // Act
  const result = person.format(str)

  // Assert
  strictEqual(result, "Hi Tom B! I hope you are enjoying the weather in Boston!")
})

test("fromArrayWithHeader", () => {
  // Arrange
  const data = [["name", "team"], ["tom", "ne"], ["kap", "sf"]]
  const testCase = Space.fromArrayWithHeader(data)

  // Act
  const data2 = testCase.toArrayWithHeader()
  const testCase2 = Space.fromArrayWithHeader(data2)

  // Assert
  strictEqual(testCase.get("1 name"), "kap")
  strictEqual(testCase2.get("1 name"), "kap")
  strictEqual(testCase2.get("1 color"), undefined)

  // Act
  testCase.set("1 color", "red")

  // Assert
  strictEqual(testCase.get("1 color"), "red")

  // Try with flattenTypes
  // Assert
  strictEqual(testCase.toArrayWithHeader()[0].length, 2, "Should be two properties")

  // Act
  testCase.flattenTypes()

  // Assert
  strictEqual(testCase.toArrayWithHeader()[0].length, 3, "Should be three properties")
})

test("fromCsv", () => {
  // Arrange/Act
  const space = Space.fromCsv(testStrings.csv)
  const withQuotes = Space.fromCsv("\"Date\",\"Age\"\n\"123\",\"345\"")

  // Assert
  strictEqual(space.toString(), testStrings.delimited)
  strictEqual(space.toCsv(), testStrings.csv, "Expected toCsv to output same data as fromCsv")

  // Arrange
  const space2 = Space.fromCsv("Age,Birth Place,Country\n12,Brockton,USA")

  // Assert
  strictEqual(space2.length, 1)
  strictEqual(space2.at(0).get("Country"), "USA")

  // Arrange
  const space3 = Space.fromCsv("")

  // Assert
  strictEqual(space3.toString(), "", "Expected empty string to be handled correctly")

  // Assert
  strictEqual(withQuotes.get("0 Date"), "123", "Expected quotes to be handled properly")

  // Arrange
  const space4 = Space.fromCsv("height\n\"32,323\"")

  // Assert
  strictEqual(space4.get("0 height"), "32,323")

  // Test quote escaping
  // Arrange
  const csvWithQuotes = "name,favoriteChar\nbob,\"\"\".\""

  // Act
  const space5 = Space.fromCsv(csvWithQuotes)

  // Assert
  strictEqual(space5.toString(), "0\n name bob\n favoriteChar \".\n", "Four double quotes should return one double quote")

  // Test \r characters
  // Arrange
  const csv = "name,age\r\njoe,21\r\nbill,32\r\n"

  // Act
  const testCase = Space.fromCsv(csv)

  // Assert
  strictEqual(testCase.get("1 age"), "32")

    // Act
  testCase.get("1").delete("name")

  // Assert
  strictEqual(testCase.get("0").toString(), "name joe\nage 21\n", "property change should not affect other objects")
  strictEqual(testCase.get("1 name"), undefined, "property should be gone")
})

test("fromCsv no headers", () => {
  // Arrange
  const a = Space.fromCsv(testStrings.csvNoHeaders, false)

  // Assert
  strictEqual(a.length, 3)
  strictEqual(a.get("1 2"), "blue")
})

test("fromDelimited", () => {
  // Arrange
  const a = Space.fromDelimiter(testStrings.fromDelimited, "^", undefined, undefined, "~")

  // Assert
  strictEqual(a.length, 2)
  strictEqual(a.get("0 weight"), "2.2")
  strictEqual(a.get("1 foodName"), "Banana")
})

test("fromHeredoc", () => {
  // Arrange
  const doc = new Space(testStrings.heredoc)

  // Assert
  strictEqual(doc.length, 15)

  // Act
  const parsedDoc = Space.fromHeredoc(testStrings.heredoc, "body", "endbody")

  // Assert
  strictEqual(parsedDoc.length, 4)
})

test("fromSsv", () => {
  // Arrange/Act
  const a = Space.fromSsv(testStrings.ssv)

  // Assert
  strictEqual(a.toString(), testStrings.delimited)
  strictEqual(a.toSsv(), testStrings.ssv)

  // Arrange/Act
  const fixedCol = Space.fromSsv(testStrings.ssvFixedColumns)

  // Assert
  strictEqual(fixedCol.at(0).get("comment"), testStrings.ssvFixedColumnComment1)
  strictEqual(fixedCol.at(1).get("comment"), testStrings.ssvFixedColumnComment2)
  strictEqual(fixedCol.at(1).length, 2)

  // Arrange/Act
  const missingCols = Space.fromSsv(testStrings.ssvMissingColumns)

  // Assert
  strictEqual(missingCols.at(0).length, 3)
  strictEqual(missingCols.at(1).length, 3)
  strictEqual(missingCols.at(2).length, 3)
})

test("fromTsv", () => {
  // Arrange/Act
  const a = Space.fromTsv(testStrings.tsv)

  // Assert
  strictEqual(a.toString(), testStrings.delimited, "From TSV worked")
  strictEqual(a.toTsv(), testStrings.tsv, "ToTsv Worked")

  // Test simple path
  // Act
  const b = Space.fromTsv("color\tage\theight\nred\t2\t23")

  // Assert
  strictEqual(b.get("0 age"), "2")
  strictEqual(b.get("0 height"), "23")
})

if (!isNode) {
  test("fromXml", () => {
    // Arrange/Act
    const a = Space.fromXml(testStrings.toXmlWithAttributesResult)

    // Assert
    strictEqual(a.toString(), testStrings.toXmlWithAttributes)
  })
}

test("get", () => {
  // Arrange
  const space = new Space("hello world")

  // Assert
  strictEqual(space.get("hello"), "world")

  // Act
  // Test get with ints
  space.set("2", "hi")

  // Assert
  strictEqual(space.get("2"), "hi", "Expected int strings to work.")

  // Assert
  // Test get with invalid values
  strictEqual(new Space().get("some"), undefined)
  strictEqual(new Space().get("some long path"), undefined)
  strictEqual(space.get(), undefined)
  strictEqual(space.get(null), undefined)
  strictEqual(space.get(""), undefined)

  // Test get with duplicate properties
  // Arrange
  const space2 = new Space("height 45px\nheight 50px\nwidth 56px")

  // Assert
  strictEqual(space2.length, 3)

  // Act/Assert
  // When getting a duplicate property last item should win
  strictEqual(space2.get("height"), "50px", "Expected to get last value in instance with duplicate property.")

  // todo: remove ability of get to take non-strings
  // Arrange
  const spaceWithNumbers = new Space("1 bob\n0 brenda")

  // Act/Assert
  strictEqual(spaceWithNumbers.get(0), "brenda")
  strictEqual(spaceWithNumbers.get(1), "bob")
})

test("getAll", () => {
  // Arrange
  const value = new Space("hello world\nhello world")
  var each = ""

  // Assert
  ok(value.getAll("hello") instanceof Space)
  strictEqual(value.getAll("hello").length, 2)

  // Act
  value.getAll("hello").each((k, v) => {
    each += "a"
  })

  // Assert
  strictEqual(each, "aa")
})

test("getArray", () => {
  // Test dupes
  // Arrange
  const spaceWithDupe = "height 45px\nheight 50px\nwidth 56px"
  const value = new Space(spaceWithDupe)
  const spaceWithoutDupe = new Space("height 25px")

  // Assert
  strictEqual(value.getArray("height").length, 2)
  strictEqual(value.getArray("height")[1], "50px")
  strictEqual(spaceWithoutDupe.getArray("height").length, 1)
  strictEqual(spaceWithoutDupe.getArray("height")[0], "25px")
  strictEqual(spaceWithoutDupe.getArray("width").length, 0)

  // Test recursive
  // Arrange
  const html = new Space("html\n table\n  table\n   id 2")

  // Act
  const result = html.getArray("table", true)

  // Assert
  strictEqual(result.length, 2)
})

test("getColumn", () => {
  // Arrange
  const collection = new Space(testStrings.json2space)

  // Act
  const results = collection.get("docs").getColumn("settings")

  // Assert
  strictEqual(results.join(""), "123456")
})

test("get expecting a branch but hitting a leaf", () => {
  // Arrange
  const value = new Space("posts leaf")

  // Assert
  strictEqual(undefined, value.get("posts branch"))
})

test("getIndex", () => {
  // Arrange
  const space = new Space("r1\n name bob\nr2\n name joe")
  const child0 = space.get("r1")
  const child1 = space.get("r2")

  // Act/Assert
  strictEqual(child0.getIndex(), 0, "Has correct index")
  strictEqual(child1.getIndex(), 1, "Has correct index")
})

test("getPath", () => {
  // Arrange
  const space = new Space(testStrings.every)
  const parent = space.get("domains test.test.com pages home settings")
  const child = space.get("domains test.test.com pages home settings data")
  const simple = new Space("foo bar")

  // Assert
  strictEqual(child.getPath(), "domains test.test.com pages home settings data")
  strictEqual(child.getRoot(), space)
  strictEqual(simple.getRoot(), simple)
  strictEqual(child.getParent(), parent)
})

test("getTypeIndex", () => {
  // Arrange
  const space = new Space(testStrings.filter)

  // Act
  const typeIndex = space.getTypeIndex()

  // Act/Assert
  strictEqual(Object.keys(typeIndex).length, 1, "Has correct number of keys")
  strictEqual(typeIndex["age height"].properties[1], "height", "Type is correct")
})

test("getUnionType", () => {
  // Arrange
  const space = new Space(testStrings.filter)

  // Act
  const type = space.getUnionType().properties
  space.set("frank weight", 12)
  const type2 = space.getUnionType().properties

  // Assert
  strictEqual(type.length, 2, "Original type has correct number of properties")
  strictEqual(type2.length, 3, "New type has correct number of properties")
  strictEqual(type2[2], "weight", "New type is correct")
})

test("getValues", () => {
  // Arrange
  const html = new Space("h1 hello world\nh1 hello world")

  // Assert
  strictEqual(html.getValues().join("\n"), "hello world\nhello world")
})

test("grab", () => {
  // Arrange
  const sample = new Space(testStrings.json)

  // Act
  const bundle = sample.grab(["firstName", "lastName"])

  // Assert
  strictEqual(bundle.length, 2)
  strictEqual(bundle.get("lastName"), "Smith")
})

test("group", () => {
  // Arrange
  const value = new Space(testStrings.filter)

  // Act
  const result = value.group("age", (group, member) => {
    group.set("age", member.get("age"))
    group.increment("count")
  })

  // Assert
  strictEqual(result.length, 3)
  strictEqual(result.toString(), new Space(testStrings.group).toString())

  // Act
  const result2 = value.group("age")

  // Assert
  strictEqual(result2.length, 3)

  // Act
  const result3 = value.group("age", (group, member, key) => {
    group.set(key, member)
  })

  // Assert
  strictEqual(result3.get("1 mairi age"), "3")

  // Test grouping by multiple properties
  // Act
  const result4 = value.group(["age", "height"], (group, member) => {
    group.set("age", member.get("age"))
    group.set("height", member.get("height"))
  })

  // Assert
  strictEqual(result4.length, 3)
  strictEqual(result4.at(0).get("age"), "21")
})

test("has", () => {
  // Arrange
  const space = new Space("hello world\nnested\nfoo ")

  // Assert
  strictEqual(space.has("hello"), true)
  strictEqual(space.has("world"), false)
  strictEqual(space.has("foo"), true)
  strictEqual(space.has("nested"), true)
})

test("html dsl", () => {
  // Arrange
  const html = new Space("h1 hello world\nh1 hello world")
  var page = ""

  // Act
  html.every((property, value) => {
    page += "<" + property + ">" + value + "</" + property + ">"
  })

  // Assert
  strictEqual(page, "<h1>hello world</h1><h1>hello world</h1>")
})

test("increment", () => {
  // Arrange
  const a = new Space("car\n count 2")

  // Act
  a.increment("car count")

  // Assert
  strictEqual(a.get("car count"), 3)

  // Act
  a.increment("car count", 10)

  // Assert
  strictEqual(a.get("car count"), 13)

  // Act
  a.increment("truck count")

  // Assert
  strictEqual(a.get("truck count"), 1)
})

test("indexOf", () => {
  // Arrange
  const space = new Space("hello world")

  // Assert
  strictEqual(space.indexOf("hello"), 0)
  strictEqual(space.indexOf("hello2"), -1)

  // Act
  space.set("color", "")

  // Assert
  strictEqual(space.indexOf("color"), 1)

  // Act
  space.append("hello", "world")

  // Assert
  strictEqual(space.indexOf("hello"), 0)
  strictEqual(space.indexOf("hello", true), 2)
})

test("insert", () => {
  // Arrange
  const space = new Space("hello world")

  // Act
  space.insert("hi", "mom", 0)

  // Assert
  strictEqual(space.indexOf("hi"), 0, "Expected hi at position 0")

  // Insert using an index longer than the current object
  // Act
  space.insert("test", "dad", 10)

  // Assert
  strictEqual(space.at(2), "dad", "Expected insert at int greater than length to append")
  strictEqual(space.length, 3)

  // Insert using a negative index
  // Act
  space.insert("test2", "sister", -1)

  // Assert
  strictEqual(space.at(2), "sister")
  strictEqual(space.at(3), "dad")
})

test("isEmpty", () => {
  // Arrange
  const a = new Space()
  const b = new Space("john\n age 5\nsusy\n age 6\nbob\n age 10")

  // Assert
  strictEqual(a.isEmpty(), true)
  strictEqual(b.isEmpty(), false)
})

test("isFlat", () => {
  // Arrange/Act/Assert
  ok(!new Space(testStrings.renameAll).isFlat())
  ok(!new Space(testStrings.filter).isFlat())
  ok(new Space(testStrings.splitTest).isFlat())
  ok(new Space("foo bar"))
  ok(new Space(""))
})

test("isStringMap", () => {
  // Arrange
  const a = new Space("john\n age 5\nsusy\n age 6\nbob\n age 10")

  // Assert
  strictEqual(a.isStringMap(), true)
  strictEqual(a.isStringMap(true), true)

  // Act
  a.get("john").append("age", "4")

  // Assert
  strictEqual(a.isStringMap(true), false)

  // Arrange
  const b = new Space("john\n age 5\nsusy\n age 6\njohn\n age 10")

  // Assert
  strictEqual(b.isStringMap(), false)
})

test("last", () => {
  // Arrange
  const value = new Space("hello world\nhi mom")
  // Assert
  strictEqual(value.at(-1), "mom")

  // Arrange
  const value2 = new Space("hello world\nhi mom")
  // Assert
  strictEqual(value2.pairAt(-1).toString(), "hi mom\n")
})

test("lastProperty", () => {
  // Arrange
  const value = new Space("hello world\nhi mom")
  // Assert
  strictEqual(value.propertyAt(-1), "hi")
})

test("lastValue", () => {
  // Arrange
  const value = new Space("hello world\nhi mom")
  // Assert
  strictEqual(value.valueAt(-1), "mom")
})

test("loadFromArray", () => {
  // Arrange
  const a = new Space([1, 2, 3])
  // Assert
  strictEqual(a.toString(), "0 1\n1 2\n2 3\n")

  // Arrange
  const b = new Space({
    data: [{
      charge: 1
    }, {
      charge: 2
    }]
  })

  // Assert
  strictEqual(b.toString(), "data\n 0\n  charge 1\n 1\n  charge 2\n")
})

test("loadFromObject", () => {
  // Arrange
  const space = new Space(testStrings.json)
  const date = new Date()
  const time = date.getTime()
  const spaceWithDate = new Space({ name: "John", date: date})

  // Assert
  strictEqual(space.get("lowestScore"), -10)
  strictEqual(spaceWithDate.get("date"), time.toString())

  // Arrange
  // For now loading from a date just runs toString on date
  const spaceFromDate = new Space(new Date())
  const spaceWithFn = new Space(() => {})

  // Assert
  ok(spaceFromDate.length > 0)
  ok(spaceWithFn.length > 0)

  // Test against object with circular references
  // Arrange
  const a = {foo : "1"}
  const b = {bar: "2", ref: a}

  // Act
  // Create circular reference
  a.c = b
  const space2 = new Space(a)

  // Assert
  strictEqual(space2.get("c bar"), "2")
  strictEqual(space2.get("c ref"), undefined)

  // Arrange
  const space3 = new Space()
  space3.set("docs", testStrings.json2)

  // Assert
  strictEqual(space3.toString(), testStrings.json2space)
})

test("loadFromSpace", () => {
  // Arrange
  const a = new Space("foo\n bar bam")
  const b = new Space(a)

  // Assert
  strictEqual(a.get("foo bar"), "bam")
  strictEqual(b.get("foo bar"), "bam")

  // Act
  a.set("foo bar", "wham")

  // Assert
  strictEqual(a.get("foo bar"), "wham")
  strictEqual(b.get("foo bar"), "bam")
})

test("loadFromString", () => {
  // Arrange
  const a = new Space("text \n this is a string\n and more")

  // Assert
  strictEqual(a.get("text"), "\nthis is a string\nand more")

  // Arrange
  const b = new Space("a\n text \n  this is a string\n  and more")

  // Assert
  strictEqual(b.get("a text"), "\nthis is a string\nand more")
  strictEqual(b.toString(), "a\n text \n  this is a string\n  and more\n")

  // Arrange
  const string = "first_name John\nlast_name Doe\nchildren\n 1\n  first_name Joe\n  last_name Doe\n  children\n   1\n    first_name Joe Jr.\n    last_name Doe\n    age 12\ncolors\n blue\n red\nbio \n Hello this is\n my multline\n biography\n \n Theres a blank line in there as well\n \n \n Two blank lines above this one.\ncode <p></p>\n"
  const c = new Space(string)

  // Assert
  strictEqual(c.get("children 1 children 1 age"), "12")
  strictEqual(c.toString().length, string.length)
  strictEqual(c.toString(), string)

  // Arrange
  const d = new Space("\n\na b\n")

  // Assert
  strictEqual(d.toString(), "a b\n", "Expected extra newlines at start of string to be trimmed")

  // Arrange
  const e = new Space("a b\n\nb c\n")
  // Assert
  strictEqual(e.toString(), "a b\nb c\n", "Expected extra newlines in middle of string to be trimmed")

  // Arrange
  const f = new Space("a b\n\n\n")
  // Assert
  strictEqual(f.toString(), "a b\n", "Expected extra newlines at end of string to be trimmed")

  // Arrange
  const g = new Space("hi\n     somewhat invalid")
  // Assert
  strictEqual(g.get("hi somewhat"), "invalid")

  const testCase = new Space(testStrings.newLines)
  strictEqual(testCase.toString().split("\n").length, 8, "All blank lines are removed")
})

test("loadFromString extra spaces", () => {
  // Arrange
  const d = new Space("one\ntwo\n  three\n    four\nfive six")
  // Assert
  strictEqual(d.length, 3)
})

test("map properties", () => {
  // Arrange
  const foo = new Space("hello world\nfoo bar")

  // Act
  foo.map((v) => { return v.toUpperCase()}, null, null, true)

  // Assert
  strictEqual(foo.toString(), "HELLO world\nFOO bar\n")

  // Act
  foo.set("some deep object", "bam")

  // Assert
  strictEqual(foo.get("some deep object"), "bam")

  // Act
  foo.map((v) => { return v.toUpperCase()}, null, null, true)

  // Assert
  strictEqual(foo.get("some deep object"), undefined, "expected object not to be there")
  strictEqual(foo.get("SOME deep object"), "bam", "expected path to be changed")

  // Act
  foo.map((v) => { return v.toUpperCase()}, null, true, true)

  // Assert
  ok(!foo.get("SOME deep object"), "expected path to be changed recursively")
  strictEqual(foo.get("SOME DEEP OBJECT"), "bam", "expected recursive map to work")
})

test("map values", () => {
  // Arrange
  const foo = new Space("hello    world   \nfoo    bar  ")

  // Act
  foo.map(null, (v) => { return v.trim()}, null, true)

  // Assert
  strictEqual(foo.toString(), "hello world\nfoo bar\n")

  // Act
  foo.set("some deep object", "    bam   ")

  // Assert
  strictEqual(foo.get("some deep object"), "    bam   ")

  // Act
  foo.map(null, (v) => { return v.trim()}, true, true)

  // Assert
  strictEqual(foo.get("some deep object"), "bam")
})

test("multiline", () => {
  // Arrange
  const a = new Space("my multiline\n string")
  // Assert
  strictEqual(a.get("my"), "multiline\nstring")

  // Arrange
  const a2 = new Space("my \n \n multiline\n string")
  // Assert
  strictEqual(a2.get("my"), "\n\nmultiline\nstring")

  // Arrange
  const b = new Space("brave new\n world")
  // Assert
  strictEqual(b.get("brave"), "new\nworld", "ml value correct")
  strictEqual(b.toString(), "brave new\n world\n", "multiline does not begin with nl")

  // Arrange
  const c = new Space("brave \n new\n world")
  // Assert
  strictEqual(c.get("brave"), "\nnew\nworld", "ml begin with nl value correct")
  strictEqual(c.toString(), "brave \n new\n world\n", "multiline begins with nl")

  // Arrange
  const d = new Space("brave \n \n new\n world")
  // Assert
  strictEqual(d.get("brave"), "\n\nnew\nworld", "ml begin with 2 nl value correct")
  strictEqual(d.toString(), "brave \n \n new\n world\n", "multiline begins with 2 nl")

  // Arrange
  const e = new Space("brave new\n world\n ")
  // Assert
  strictEqual(e.get("brave"), "new\nworld\n", "ml value end with nl correct")
  strictEqual(e.toString(), "brave new\n world\n \n", "multiline ends with a nl")

  // Arrange
  const f = new Space("brave new\n world\n \n ")
  // Assert
  strictEqual(f.get("brave"), "new\nworld\n\n", "ml value end with 2 nl correct")
  strictEqual(f.toString(), "brave new\n world\n \n \n", "multiline ends with 2 nl")

  // Arrange
  const g = new Space()
  g.set("brave", "\nnew\nworld\n\n")
  // Assert
  strictEqual(g.get("brave"), "\nnew\nworld\n\n", "set ml works")
  strictEqual(g.toString(), "brave \n new\n world\n \n \n", "set ml works")
})

test("nest", () => {
  // Arrange
  const value = new Space("hello world\nhi earth")

  // Act
  value.nest("greetings")

  // Assert
  strictEqual(value.get("greetings hello"), "world")
  strictEqual(value.get("greetings hi"), "earth")
  strictEqual(value.toString(), "greetings\n hello world\n hi earth\n")
})

test("next", () => {
  // Arrange
  const a = new Space("john\n age 5\nsusy\n age 6\nbob\n age 10")

  // Assert
  strictEqual(a.next("john"), "susy")
  strictEqual(a.prev("john"), "bob")
  strictEqual(a.next("susy"), "bob")
  strictEqual(a.prev("susy"), "john")
  strictEqual(a.prev("bob"), "susy")
  strictEqual(a.next("bob"), undefined)
  strictEqual(a.next("foobar"), "john")
})

test("order", () => {
  // Arrange
  const a = new Space("john\n age 5\nsusy\n age 6\nbob\n age 10")
  const types = a.tableOfContents()

  // Assert
  strictEqual(types, "john susy bob", "order is preserved")
})

test("patch", () => {
  // Arrange
  const a = new Space("hello world")
  const b = new Space("hello mom")

  // Act
  a.patch(b)

  // Assert
  strictEqual(a.get("hello"), "mom")

  // Arrange
  const c = new Space("hello mom")
  c.set("hello", new Space("foo\n cell 123"))

  // Act
  a.patch(c)

  // Assert
  strictEqual(a.get("hello foo cell"), "123")

  // Arrange
  const a2 = new Space("style\n background-color rgb(57, 112, 1)\n border 17px solid white\n color rgb(0, 0, 0)\n font-family Lato\n font-size 16px\n height 100\n left 379px\n top 200\n width 274px\n border-radius 35px\n")
  const b2 = new Space("height 203\ntop 117\n")

  // Act
  a2.get("style").patch(b2)

  // Assert
  strictEqual(a2.get("style height"), "203")
  strictEqual(a2.get("style top"), "117")

  // Arrange
  const a3 = new Space("background-color rgb(57, 112, 1)\nborder 17px solid white\ncolor rgb(0, 0, 0)\nfont-family Lato\nfont-size 16px\nheight 199px\nleft 379px\ntop 117px\nwidth 274px\nborder-radius 35px\n")
  const b3 = new Space("height 202\ntop 117\n")

  // Act
  a3.patch(b3)

  // Assert
  strictEqual(a3.get("height"), "202")
  strictEqual(a3.get("top"), "117")

  // Arrange
  const a4 = new Space("first John\nlast Doe")
  const b4 = new Space("last\n 1 Doe\n 2 Smith")
  const c4 = new Space("last Aaron")

  // Act
  a4.patch(b4)

  // Assert
  strictEqual(a4.get("last 2"), "Smith", "test 2")

  // Act
  a4.patch(c4)

  // Assert
  strictEqual(a4.get("last"), "Aaron")

  // Arrange
  const patch = new Space()
  patch.set("first", "Frank")
  patch.set("last", "Grimes")

  // Act
  a4.patch(new Space(new Space(patch)))

  // Assert
  strictEqual(a4.get("last"), "Grimes")
  strictEqual(a4.get("first"), "Frank")

  // delete an element
  // Arange
  const page = new Space()
  page.set("text", new Space("content hello world"))

  // Assert
  strictEqual(page.length, 1)

  // Act
  page.patch(new Space("text "))

  // Assert
  strictEqual(page.length, 0, "item deleted")

  // Arrange
  const pages = new Space()
  pages.set("page1", new Space("text\n content hello world"))

  // Assert
  strictEqual(pages.get("page1").length, 1)

  // Act
  pages.get("page1").patch("text")

  // Assert
  strictEqual(pages.get("page1").length, 0)

  // Arrange
  const a5 = new Space("property meta\n")
  const b5 = new Space("content\n")

  // Act
  a5.patch(b5)

  // Assert
  strictEqual(a5.length, 1, "patch okay")
  strictEqual(a5.get("property"), "meta", "patch okay")

  // Arrange
  const space = new Space("meta\n property meta")
  const patch2 = new Space("meta\n content")

  // Act
  space.patch(patch2)

  // Assert
  strictEqual(space.get("meta property"), "meta", "patch okay")

  // Arrange
  const a6 = new Space("hello world")

  // Act/Assert
  ok(a6.patch(), "If nothing passed dont error.")
  ok(a6.patch(""), "If nothing passed dont error.")
  ok(a6.patch(false), "If nothing passed dont error.")
  strictEqual(a6.toString(), "hello world\n")
})

test("pop", () => {
  // Arrange
  const a = new Space("john\n age 5\nsusy\n age 6\nbob\n age 10")
  const empty = new Space()

  // Assert
  strictEqual(a.length, 3)

  // Act/Assert
  strictEqual(a.pop().toString(), "bob\n age 10\n")
  strictEqual(a.length, 2)
  strictEqual(empty.pop(), null)
})

test("prepend", () => {
  // Arrange
  const a = new Space("hello world")
  // Act
  a.prepend("foo", "bar")
  // Assert
  strictEqual(a.toString(), "foo bar\nhello world\n")
})

test("prev", () => {
  // Arrange
  const a = new Space("john\n age 5\nsusy\n age 6\nbob\n age 10")
  // Assert
  strictEqual(a.next("john"), "susy")
  strictEqual(a.prev("john"), "bob")
  strictEqual(a.next("susy"), "bob")
  strictEqual(a.prev("susy"), "john")
  strictEqual(a.prev("bob"), "susy")
})

test("push", () => {
  // Arrange
  const a = new Space()

  // Act
  a.push("hello world")

  // Assert
  strictEqual(a.get("0"), "hello world")

  // Act
  a.push(new Space())

  // Assert
  ok(a.get("1") instanceof Space)
})

test("query", () => {
  // Arrange
  const string = new Space(`user
 name Aristotle
 admin false
 stage
  name home
  domain test.test.com
 pro false
 domains
  test.test.com
   images
   blocks
   users
   stage home
   pages
    home
     settings
      data
       title Hello, World
     block1
      content Hello world`)

  const query = new Space("user\n name\n domains\n  test.test.com\n   pages\n    home\n     block1")

  // Act
  const result = string.getBySpace(query)

  // Assert
  ok(result instanceof Space, "Retrieve returns a space")
  strictEqual(result.length, 1, "1 root node")
  strictEqual(result.get("user name"), "Aristotle", "Name retrieved successfully")
  ok(typeof result.get("user pro") === "undefined", "Did not retrieve pro value")
  strictEqual(result.get("user domains test.test.com pages home block1 content"), "Hello world")
})

test("reload", () => {
  // Arrange
  const a = new Space("john\n age 5\nsusy\n age 6")

  // Act
  ok(a.reload())

  // Assert
  strictEqual(a.length, 0, "empty reload cleared object")

  // Act
  a.reload("john 1")
  a.reload("john 2")

  // Assert
  strictEqual(a.length, 1)
  strictEqual(a.get("john"), "2")
})

test("rename", () => {
  // Arrange
  const a = new Space("john\n age 5\nsusy\n age 6\ncandy bar\nx 123\ny 45\n")
  const originalLength = a.length
  const originalString = a.toString()
  const index = a.indexOf("john")

  // Assert
  strictEqual(index, 0, "index okay")

  // Act
  ok(a.rename("john", "breck") instanceof Space, "returns itself for chaining")
  a.rename("candy", "ice")

  // Assert
  const index2 = a.indexOf("breck")
  strictEqual(index2, 0, "index okay")
  strictEqual(a.get("breck age"), "5", "value okay")

  // Act
  a.rename("breck", "john")
  a.rename("ice", "candy")

  // Assert
  strictEqual(a.length, originalLength, "Length unchanged")
  strictEqual(a.toString(), originalString, "String unchanged")

  // Arrange
  const b = new Space(testStrings.renameTest)
  const originalString2 = b.toString()

  // Act
  b.rename("dimensions", "columns")

  // Assert
  strictEqual(b.toString(), originalString2)
})

test("renameAll", () => {
  // Arrange
  const space = new Space(testStrings.renameAll)

  // Assert
  strictEqual(space.toString().match(/first-name/g).length, 5)

  // Act
  space.rename("first-name", "firstName", true, true)

  // Assert
  strictEqual(space.toString().match(/firstName/g).length, 5)
})

test("renameObjects", () => {
  // Arrange
  const space = new Space(testStrings.renameObjects)

  // Act
  space.renameObjects("email")

  // Assert
  strictEqual(space.get("johndoe@email.com name"), "John Doe")
  strictEqual(space.get("maryjane@email.com name"), "Mary Jane")
})

test("reorder", () => {
  // Arrange
  const a = new Space("hello world\n")

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
})

test("replace", () => {
  // Arrange
  const space = new Space(testStrings.filter)

  // Act
  space.replace(/age/g, "currentAge")

  // Assert
  strictEqual(space.extract("currentAge").length, 4)
})

test("reverse", () => {
  // Arrange
  const space = new Space("hi mom\nhey sis\nhey dad")

  // Assert
  strictEqual(space.get("hey"), "dad")

  // Act
  space.reverse()

  // Assert
  strictEqual(space.toString(), "hey dad\nhey sis\nhi mom\n")
  strictEqual(space.get("hey"), "sis")

  // Test reverse when using internal types

  // Arrange
  const space2 = Space.fromCsv("name,age\nbill,20\nmike,40\ntim,30")

  // Act
  space2.at(0).reverse()

  // Assert
  strictEqual(space2.at(0).propertyAt(0), "age", "Expected reversed properties")
  strictEqual(space2.at(1).propertyAt(0), "name", "Expected unchanged properties")
})

test("set", () => {
  // Arrange
  const space = new Space("hello world")

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
  const space2 = new Space()

  // Act
  space2.set(2, "hi")
  space2.set(3, 3)
  // Assert
  strictEqual(space2.get("2"), "hi")
  strictEqual(space2.get("2"), "hi")
  strictEqual(space2.get("3"), 3)

  // TEST SPACEPATH SCENARIOS
  // Arrange
  const space3 = new Space("style\n")
  // Act
  space3.set("style color", "red")
  space3.set("style width", "100")

  // Assert
  strictEqual(space3.get("style color"), "red")
  strictEqual(space3.get("style width"), "100")

  // TEST ORDERING
  // Arrange
  const space4 = new Space("hello world\n")
  // Act
  space4.set("hi", "mom")
  // Assert
  strictEqual(space4.tableOfContents(), "hello hi", "order correct")

  // Act
  space4.insert("yo", "pal", 0)
  // Assert
  strictEqual(space4.tableOfContents(), "yo hello hi", "order correct")

  // Act
  space4.insert("hola", "pal", 2)
  // Assert
  strictEqual(space4.tableOfContents(), "yo hello hola hi", "order correct")

  // Arrange
  const space5 = new Space()
  // Act
  space5.set("hi", "hello world")
  space5.set("yo", new Space("hello world"))
  // Assert
  notEqual(space5.get("hi"), space5.get("yo"))

  // Arrange
  const space6 = new Space()

  // Act
  space6.set("meta x", 123)
  space6.set("meta y", 1235)
  space6.set("meta c", 435)
  space6.set("meta x", 1235123)

  // Assert
  strictEqual(space6.get("meta c"), 435)

  // Arrange
  const space7 = new Space("name John\nage\nfavoriteColors\n blue\n  blue1 1\n  blue2 2\n green\n red 1\n")

  // Act
  space7.set("favoriteColors blue", "purple").toString()

  // Assert
  strictEqual(space7.get("favoriteColors blue"), "purple")

  // Act
  space7.set("     invalid", "test")
  space7.set("  \n   invalid2", "test2")

  // Assert
  strictEqual(space7.get("invalid"), "test", "Expected extra spaces in path to be sanitized")
  strictEqual(space7.get("invalid2"), "test2", "Expected newlines in path to be sanitized")
})

test("shift", () => {
  // Arrange
  const space = new Space("john\n age 5\nsusy\n age 6\nbob\n age 10")
  const empty = new Space()
  // Act/Assert
  strictEqual(space.length, 3)
  strictEqual(space.shift().toString(), "john\n age 5\n")
  strictEqual(space.length, 2)
  strictEqual(empty.shift(), null)
})

test("sort", () => {
  // Arrange
  const space = new Space("john\n age 5\nsusy\n age 6\nbob\n age 10")
  // Assert
  strictEqual(space.tableOfContents(), "john susy bob")
  // Act
  space.sort((a, b) => {
    return b.property < a.property
  })
  // Assert
  strictEqual(space.tableOfContents(), "bob john susy")
})

test("sortBy", () => {
  // Arrange
  const space = new Space("john\n age 5\nsusy\n age 6\nbob\n age 10\nsam\n age 21\nbrian\n age 6")
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

  // Sort by multiple properties
  // Arrange
  const space2 = new Space(testStrings.sortByMultiple)

  // Act
  space2.sortBy(["name", "date"])

  // Assert
  strictEqual(space2.getColumn("key").join(""), "cab")

  // Act
  space2.sortBy(["name", "key"])

  // Assert
  strictEqual(space2.getColumn("key").join(""), "acb")
})

test("split", () => {
  // Arrange
  const a = new Space(testStrings.splitTest)
  const b = new Space(testStrings.splitTest)
  const c = b.split("title", "post")
  // Assert
  strictEqual(a.split("foobar").length, 0)
  strictEqual(a.split("title").length, 3)
  strictEqual(a.split("title")[2].get("date"), "2/25/2016")
  ok(c instanceof Space)
  strictEqual(c.length, 3)
  strictEqual(c.get("post content"), "Hello earth")
})

test("tokens", () => {
  // Arrange
  const test = `person
 name Breck
 country USA
 books
  one SICP
  two Pragmatic
 num 12
 multiline this is a string
  over multiple lines.
     and this one has extra indents
 num 12
`
  const a = new Space(test)
  const test2 = `person;=name=Breck;=country=USA;=books;==one=SICP;==two=Pragmatic;=num=12;=multiline=this is a string
over multiple lines.
   and this one has extra indents;=num=12;`

  // Act
  Space._setTokens(";", "=")

  // Assert
  strictEqual(a.toString(), test2)

  // Act
  const b = new Space(test2)

  // Assert
  strictEqual(a.toString(), b.toString())

  // Act
  Space._setTokens()

  // Assert
  strictEqual(b.toString(), test)
})

test("toCsv", () => {
  // Arrange
  const a = new Space(testStrings.delimited)
  // Act/Assert
  strictEqual(a.toCsv(), testStrings.csv, "Expected correct csv")
})

test("toggle", () => {
  // Arrange
  const a = new Space("on true")
  // Act
  a.toggle("on", "true", "false")
  // Assert
  strictEqual(a.get("on"), "false")
  // Act
  a.toggle("on", "true", "false")
  // Assert
  strictEqual(a.get("on"), "true")
  // Arrange
  const length = a.length
  // Act
  a.toggle("color", "blue")
  // Assert
  strictEqual(a.get("color"), "blue")
  // Act
  a.toggle("color", "blue")
  // Assert
  strictEqual(a.get("color"), undefined)
  strictEqual(a.length, length)
})

test("toFixedWidth", () => {
  // Arrange
  const a = Space.fromCsv("name,score,color\n" + testStrings.csvNoHeaders)
  // Act/Assert
  strictEqual(a.toFixedWidth(), testStrings.toFixedWidth, "Expected correct spacing")

  // Arrange
  const b = Space.fromCsv("name\njoe\nfrankenstein")
  // Act/Assert
  strictEqual(b.toFixedWidth(1), "n\nj\nf\n", "Expected max width to be enforced")
})

test("toJavascript", () => {
  // Arrange
  const a = new Space("hello world")
  // Assert
  strictEqual(a.toJavascript(), "new Space(\"hello world\\n\")")

  // Arrange
  const b = new Space("hello \"world")
  // Assert
  strictEqual(b.toJavascript(), "new Space(\"hello \\\"world\\n\")")

  // Arrange
  const c = new Space("hello \"world\"")
  // Assert
  strictEqual(c.toJavascript(), "new Space(\"hello \\\"world\\\"\\n\")")

  // Arrange
  const d = new Space("hello \"world\"")
  // Assert
  strictEqual(d.toJavascript(), "new Space(\"hello \\\"world\\\"\\n\")")

  // Arrange
  const multiline = new Space("name John\nname John")
  // Assert
  strictEqual(multiline.toJavascript(true), `new Space(\`name John
name John
\`)`)
})

test("toJSON", () => {
  // Arrange
  const a = new Space("hello world")
  const b = new Space("foo bar")

  // Assert
  strictEqual(a.toJSON(), "{\"hello\":\"world\"}")

  // Act
  a.set("b", b)
  // Assert
  strictEqual(a.toJSON(), "{\"hello\":\"world\",\"b\":{\"foo\":\"bar\"}}")
})

test("toObject", () => {
  // Arrange
  const a = new Space("hello world")
  const b = new Space("foo bar")

  // Assert
  ok(typeof a.toObject() === "object")
  strictEqual(a.toObject()["hello"], "world")

  // Act
  a.set("b", b)
  // Assert
  strictEqual(a.toObject()["b"]["foo"], "bar")
})

test("toObject with types", () => {
  // Arrange/Act
  const sample = testStrings.json
  const a = new Space(sample)
  const js = a.toObject(true)
  const s = JSON.stringify(js, null, 2)
  const samplejson = JSON.stringify(sample, null, 2)

  // Assert
  strictEqual(s, samplejson)
})

test("toQueryString", () => {
  // Arrange
  const a = new Space("name Breck")
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

test("toSsv", () => {
  const a = new Space(testStrings.delimited)
  // Assert
  strictEqual(a.toSsv(), testStrings.ssv)
})

test("toString", () => {
  // Arrange
  const space = new Space("hello world")
  // Assert
  strictEqual(space.toString(), "hello world\n", "Expected correct string.")
  // Act
  space.set("foo", "bar")
  // Assert
  strictEqual(space.toString(), "hello world\nfoo bar\n")

  // Arrange
  const space2 = new Space("z-index 0")
  // Act
  space2["z-index"] = 0
  // Assert
  strictEqual(space2.toString(), "z-index 0\n")

  // Test empty values
  // Arrange
  const space3 = new Space()

  // Act
  space3.set("empty", "")
  space3.set("undefined", undefined)
  space3.set("null", null)
  // Assert
  strictEqual(space3.toString(), "empty \nundefined undefined\nnull null\n")

  // Arrange
  const a = new Space("john\n age 5")
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
  const b = new Space("a\n text \n  this is a multline string\n  and more")
  // Assert
  strictEqual(b.toString(), "a\n text \n  this is a multline string\n  and more\n")

  // Test setting an instance as a value in another instance
  // Act
  a.set("even_more", b)
  // Assert
  strictEqual(a.toString(), "john\n age 5\nmultiline hello\n world\nother foobar\neven_more\n a\n  text \n   this is a multline string\n   and more\n")
})

test("toTsv", () => {
  // Arrange
  const a = new Space(testStrings.delimited)
  // Assert
  strictEqual(a.toTsv(), testStrings.tsv)
})

test("toXML", () => {
  // Arrange
  const a = new Space(testStrings.toXml)
  // Assert
  strictEqual(a.toXML(), testStrings.toXmlResult)
  strictEqual(a.toXML(true), testStrings.toXmlPrettyResult)
})

test("toXMLWithAttributes", () => {
  // Arrange
  const a = new Space(testStrings.toXmlWithAttributes)
  // Assert
  strictEqual(a.toXMLWithAttributes(true), testStrings.toXmlWithAttributesResult)
})

test("trim", () => {
  // Arrange
  const space = new Space(testStrings.webpage)

  // Test deep
  // Act/Assert
  strictEqual(space.trim(true).toString(), testStrings.webpageTrimmed)

  // Arrange
  const space2 = new Space(testStrings.webpage)

  // Test shallow
  // Act/Assert
  strictEqual(space2.trim().toString(), testStrings.webpage.substr(5), "Expected almost same thing")
})

test("union", () => {
  // Arrange
  const a = new Space("maine me\nnew_york nyc\ncali ca")
  const b = new Space("maine me\nnew_york nyc\ncali ca")
  const c = new Space("maine me")
  const d = new Space("maine me\nflorida fl\ncali ca")

  // Act/Assert
  ok(Space.union(a, b), "a and b are same")
  strictEqual(Space.union(a, b).length, 3, "union should have 3 items")
  strictEqual(Space.union(a, c).length, 1, "union should have 1 item")
  ok(Space.union(a, c).toString() === c.toString(), "union should be equal to c")
  strictEqual(Space.union(a, b, c, d).length, 1, "union should take multiple params")
  strictEqual(Space.union(a, b, d).length, 2, "union should be 2 long")
  strictEqual(Space.union(d, a, b, c).length, 1, "union should 1 be long")

  // Arrange
  const a2 = new Space("font-family Arial\nbackground red\ncolor blue\nwidth 10px")
  const b2 = new Space("font-family Arial\nbackground green\ncolor blue\nwidth 10px")
  const c2 = new Space("font-family Arial\nbackground orange\ncolor blue\nwidth 12px")
  const d2 = new Space("font-family Arial\nbackground #aaa\ncolor blue\nwidth 12px")
  const e2 = new Space("font-family Arial\nbackground #fff\ncolor blue\nwidth 121px")

  // Act
  const union = Space.union(a2, b2, c2, d2, e2)
  // Assert
  strictEqual(union.length, 2, "should should have length 2")
  strictEqual(union.get("color"), "blue", "union should have color blue")
  strictEqual(union.get("font-family"), "Arial", "union should have font family arial")

  // Act
  const union2 = Space.union.apply(a2, [b2, c2, d2, e2])
  // Assert
  strictEqual(union2.length, 2, "union should have length 2")
})

test("update", () => {
  // Arrange
  const space = new Space("hello world")

  // Act
  space.update(0, "hi", "mom")

  // Assert
  strictEqual(space.toString(), "hi mom\n")
  strictEqual(space.indexOf("hello"), -1)
  strictEqual(space.indexOf("hi"), 0)
  strictEqual(space.get("hello"), undefined)
})

test("url methods", () => {
  // Arrange
  const a = new Space("maine me\nnew_york nyc\ncali ca")
  const encoded = a.toURL()
  const b = new Space(decodeURIComponent(encoded))
  // Assert
  strictEqual(a.toString(), b.toString(), "toUrl worked")
})

test("windows return chars", () => {
  // Arrange
  const space = new Space("one\n\r\n\rtwo\n\r\n\r\n\rthree")

  // Assert
  strictEqual(space.length, 3)
})

test("version", () => {
  // Assert
  ok(Space.version)
})
