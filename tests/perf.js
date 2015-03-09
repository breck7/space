QUnit.module("Space")

var isNode = typeof require !== "undefined",
    _chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz"

if (isNode) {
  var fs = require("fs"),
      speedcoach = require("./speedcoach")
}

var randomString = function(min, max) {
  var string = "",
      length = (Math.round(Math.random() * (max - min))) + min,
      randomNumber
  
  for (var i = 0; i < length; i++) {
    randomNumber = Math.floor(Math.random() * _chars.length)
    string += _chars.substring(randomNumber, randomNumber + 1)
  }
  
  return string
}

// Experimental method for quickly generating perf test data
var randomSpace = function (rows, depthOdds) {
  var space = new Space(),
      depthOdds = depthOdds || 0,
      property = "",
      value = ""

  while (rows > 0) {
    property = randomString(3, 6)

    // Nest
    if (depthOdds > Math.random())
      space.append(property, randomSpace(3, depthOdds))

    // Or set a leaf
    else {
      value = randomString(4, 8)
      space.append(property, value)
    }

    rows--
  }
  return space
}

test("start", function() {
  speedcoach("start")
  ok(true)
})

test("tests", function() {
  speedcoach("start tests")
  Space._load2 = false
  var a = randomSpace(10000, 0.2).toString()
  
  var t = new Date().getTime()
  var b = new Space(a)
  
  Space._load2 = true
  t = new Date().getTime()
  var c = new Space(a)

  Space._load2 = false
  t = new Date().getTime()
  var d = new Space(a)

  Space._load2 = true
  t = new Date().getTime()
  var e = new Space(a)

  var j = JSON.stringify(e.toObject())
  t = new Date().getTime()
  var m = JSON.parse(j)
  ok(true)
  speedcoach("end tests")
})

test("patch performance test", function() {
  // Arrange
  var space = new Space()

  // Act
  for (var i = 0; i < 1000; i++) {
    var patch = new Space()
    patch.set(Math.random(), new Space("foobar hello\nworld world\nnested\n element 1\n element2\n  foobar hi"))
    patch.set(Math.random(), "foobar")
    space.patch(patch)
  }

  // Assert
  strictEqual(space.length, 2000)
})

test("end", function() {
  speedcoach("end")
  speedcoach.print()
  ok(true)
})
