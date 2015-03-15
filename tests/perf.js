QUnit.module("Space")

var isNode = typeof require !== "undefined",
    _chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz"

if (isNode) {
  var fs = require("fs"),
      speedcoach = require("./speedcoach")
}

function getRandomString (min, max) {
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
function getRandomSpace (rows, depthOdds) {
  var space = new Space(),
      depthOdds = depthOdds || 0,
      property = "",
      value = ""

  while (rows > 0) {
    property = getRandomString(3, 6)

    // Nest
    if (depthOdds > Math.random())
      space.append(property, getRandomSpace(3, depthOdds))

    // Or set a leaf
    else {
      value = getRandomString(4, 8)
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

test("load by string speed and mem tests", function() {
  speedcoach("start speed and mem tests")
  var str = getRandomSpace(10000, 0.2).toString()
  
  Space._load2 = false
  var a = new Space(str)
  var a2 = new Space(str)
  var a3 = new Space(str)
  
  Space._load2 = true
  var b = new Space(str)
  var b2 = new Space(str)
  var b3 = new Space(str)

  // Test json for comparison
  var jso = JSON.stringify(a.toObject())
  var parsed = JSON.parse(jso)
  speedcoach("end speed and mem tests")
  ok(true)
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
