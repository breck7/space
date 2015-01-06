var testStrings = {}
var multiline = function (fn) {
	return fn.toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1];
}

testStrings.renameAll = multiline(function () {/*
first-name John
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
    first-name Abe      
*/})

testStrings.filter = multiline(function () {/*
john
 age 21
mairi
 age 3
frank
 age 50
bob
 age 21
*/})

testStrings.getByIndexPath = multiline(function () {/*
head
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
*/})

testStrings.shapes = multiline(function () {/*V
OV
OV
 OV
 OV
 OV
  O[]
  O[]
 OV
 OV
  O[]
  O[]
*/})

testStrings.transposeData = multiline(function () {/*
entry
 name SimHighSchool
 youtube http://www.youtube.com/watch?v=12345
 description SimHighSchool lorem ipsum lorem ipsum lorem ipsum.
 website http://simhighschool.com
 leader John Doe
 email johndoe@gmail.com
 phone 123-123-1234
 member Jill Smith jill@gmail.com
 member Luke Johnson luke@gmail.com
entry
 name SimHighSchool2
 youtube http://www.youtube.com/watch?v=123456
 description SimHighSchool2 lorem ipsum lorem ipsum lorem ipsum.
 website http://simhighschool2.com
 leader John Doe
 email johndoe@gmail.com
 phone 123-123-1234
 member Jill Smith jill@gmail.com
 member Luke Johnson luke@gmail.com
*/})

testStrings.transposeTemplate = multiline(function () {/*
h1 name
p description
p
 a
  href website
  content website
iframe
 width 420
 height 315
 src youtube
 frameborder 0
 allowfullscreen
*/})

testStrings.transposeExpected = multiline(function () {/*h1 SimHighSchool
p SimHighSchool lorem ipsum lorem ipsum lorem ipsum.
p
 a
  href http://simhighschool.com
  content http://simhighschool.com
iframe
 width 420
 height 315
 src http://www.youtube.com/watch?v=12345
 frameborder 0
 allowfullscreen
h1 SimHighSchool2
p SimHighSchool2 lorem ipsum lorem ipsum lorem ipsum.
p
 a
  href http://simhighschool2.com
  content http://simhighschool2.com
iframe
 width 420
 height 315
 src http://www.youtube.com/watch?v=123456
 frameborder 0
 allowfullscreen*/})

// Export for use in Node.js
if (typeof exports != 'undefined')
  module.exports = testStrings;
