/**
 * @param string
 */
function speedcoach(mark) {
  if (!speedcoach.on)
    return this
  if (speedcoach.isNode) {
    var mem = process.memoryUsage()
    speedcoach.marks.push([mark, new Date().getTime(), [mem.rss, mem.heapTotal, mem.heapUsed]])
  }
  else
    speedcoach.marks.push([mark, new Date().getTime()])

  return this
}

speedcoach.isNode = false
speedcoach.on = true

if (typeof require !== "undefined") {
  speedcoach.isNode = true
}

speedcoach.marks = []

/*
interface TestResult {
  name: string,

  // In bytes
  memoryIncrease: number,

  // In milliseconds
  elapsedTime: number
}
*/

/**
 * @return array<TestResult[]>
 */
speedcoach._getTestResults = function () {
  var times = ""
  var testResults = []
  var length = speedcoach.marks.length

  speedcoach.marks.forEach(function (currentTest, index, tests) {
    if (index + 1 >= length)
      return false

    var nextTest = tests[index + 1] // array

    var testName = currentTest[0] // string
    var elapsedTime = nextTest[1] - currentTest[1] // number
    var memoryIncrease = "" // string|number

    if (speedcoach.isNode)
      memoryIncrease = nextTest[2][0] - currentTest[2][0]

    testResults.push({
      elapsedTime: elapsedTime,
      memoryIncrease: memoryIncrease,
      name: testName
    })
  })

  return testResults
}

/**
 * @param chronological Whether to sort by order. (Default is sort by consumption)
 * @return string
 */
speedcoach.times = function (chronological) {
  var times = "",
      spans = [],
      sorted

  speedcoach.marks.forEach(function (element, index, list) {
    if (index + 1 >= list.length)
      return false
    var next = list[index + 1]
    // Marks and time
    var entry = [element[0] + " to " + next[0], next[1] - element[1]]
    // Mem
    if (speedcoach.isNode)
      entry.push(next[2][0] - element[2][0])
    spans.push(entry)
  })

  if (chronological) {
    sorted = spans
  } else {
    var sorted = spans.sort(function(a,b){
      return (a > b ? 1 : null) || (a < b ? -1 : 0)
    }).reverse()
  }

  sorted.forEach(function (element) {
    var mem = ""
    if (speedcoach.isNode)
      mem = " +" + (element[2]/1000000).toFixed(2) + "mb "
    times += (element[1]/1000).toFixed(2) + "s " + element[0] + mem + "\n"
  })

  return times
}

/**
 * @param dontClear Set to true to not clear the marks
 * @param chronological Whether to sort by order. (Default is sort by consumption)
 * @return string
 */
speedcoach.print = function (dontClear, chronological) {
  var data = "\n" + speedcoach.times(chronological),
      clear = !dontClear

  if (!speedcoach.on)
    return;

  if (console.debug)
    console.debug(data)
  else
    console.log(data)

  if (clear)
    speedcoach.marks = []

  return data
}

/**
 * Returns csv in format seconds,megabytes,name like "0.21,4.12,Some test"
 *
 * @return string
 */
speedcoach.getCsv = function () {
  var testResults = speedcoach._getTestResults()
  var csv = "seconds,megabytes,name\n"

  testResults.forEach(function (result) {
    csv += (result.elapsedTime/1000).toFixed(2) + ","

    if (speedcoach.isNode)
      csv += (result.memoryIncrease/1000000).toFixed(2) + ","

    csv += result.name + "\n"
  })

  return csv
}

// Export Space for use in Node.js
if (speedcoach.isNode)
  module.exports = speedcoach;
