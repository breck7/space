var isNode = typeof require !== "undefined"
var _chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz"

if (isNode) {
  Space = require("../space.js")
  speedcoach = require("./speedcoach")
} else {
  global = {}
  global.gc = function () {}
}

function getRandomString (min, max) {
  var string = ""
  var length = (Math.round(Math.random() * (max - min))) + min
  var randomNumber

  for (var i = 0; i < length; i++) {
    randomNumber = Math.floor(Math.random() * _chars.length)
    string += _chars.substring(randomNumber, randomNumber + 1)
  }

  return string
}

function getRandomSpace (rows, depthOdds) {
  var space = new Space()
  var depthOdds = depthOdds || 0
  var property = ""
  var value = ""

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

speedcoach("start")

global.gc()
speedcoach("new spaceFromRandomStringWithNesting")
var spaceFromRandomStringWithNesting = getRandomSpace(10000, 0.2)
console.log("spaceFromRandomStringWithNesting deepLength: " + spaceFromRandomStringWithNesting.deepLength())

global.gc()
speedcoach("spaceFromRandomStringWithNesting.toString()")
var spaceFromRandomStringWithNestingToString = spaceFromRandomStringWithNesting.toString()
console.log("spaceFromRandomStringWithNestingToString length: " + spaceFromRandomStringWithNestingToString.length)

global.gc()
speedcoach("new spaceFromRandomStringWithoutNesting")
var spaceFromRandomStringWithoutNesting = getRandomSpace(10000, 0)
console.log("spaceFromRandomStringWithoutNesting deepLength: " + spaceFromRandomStringWithoutNesting.deepLength())

global.gc()
speedcoach("spaceFromRandomStringWithoutNesting.toString()")
var spaceFromRandomStringWithoutNestingToString = spaceFromRandomStringWithoutNesting.toString()
console.log("spaceFromRandomStringWithoutNestingToString length: " + spaceFromRandomStringWithoutNestingToString.length)

global.gc()
speedcoach("create repeatingSpaceString of root length 100K by repeating simple 9line space object with 2 levels of nesting")
var tinyStr = "country US\npopulation 300M\nneighbors\n country\n  name Canada\n  pop 50M\n country\n  name Mexico\n  pop 150M\n"
var repeatingSpaceString = ""
for (var i = 0; i < 100000; i++) {
 repeatingSpaceString += tinyStr
}
console.log("repeatingSpaceString length: " + repeatingSpaceString.length)

global.gc()
speedcoach("create space from repeatingSpaceString")
var repeatingSpace = new Space(repeatingSpaceString)
console.log("repeatingSpace deepLength: " + repeatingSpace.deepLength())

global.gc()
speedcoach("test each from repeatingSpace")
var leafCount = 0
repeatingSpace.each(function (){leafCount++}, true)

global.gc()
speedcoach("create jsonFromRepeatingSpace")
var jsonFromRepeatingSpace = repeatingSpace.toJSON()
console.log("jsonFromRepeatingSpace length: " + jsonFromRepeatingSpace.length)

global.gc()
speedcoach("create spaceFromJson")
var spaceFromJson = new Space(jsonFromRepeatingSpace)
console.log("spaceFromJson string deepLength: " + spaceFromJson.deepLength())

global.gc()
speedcoach("end")

if (isNode)
  console.log(speedcoach.getCsv())
else
  document.write("<pre>" + speedcoach.getCsv() + "</pre>")
