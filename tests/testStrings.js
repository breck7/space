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

testStrings.webpage = multiline(function () {/*head
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

testStrings.webpageTrimmed = multiline(function () {/*body
 div
  class main
  content yo
 div
  class footer
  content hi
*/})

testStrings.toXml = multiline(function () {/*
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
*/})

testStrings.json2 = [{"id":755,"settings":"123"},{"id":756,"settings":"456"}]
testStrings.json2space = multiline(function () {/*docs
 0
  id 755
  settings 123
 1
  id 756
  settings 456
*/})

testStrings.every = "user\n\
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

testStrings.toXmlResult = "<html><head></head><body><div></div><div><class>main</class><content>yo</content>" +
  "</div><div><class>footer</class><content>hi</content></div></body></html>"

testStrings.toXmlPrettyResult = "<html>\n\
  <head></head>\n\
  <body>\n\
    <div></div>\n\
    <div>\n\
      <class>main</class>\n\
      <content>yo</content>\n\
    </div>\n\
    <div>\n\
      <class>footer</class>\n\
      <content>hi</content>\n\
    </div>\n\
  </body>\n\
</html>\n\
"

testStrings.toXmlWithAttributes = multiline(function () {/*html
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
*/})

testStrings.toXmlWithAttributesResult = "<html class=\"main\">\n\
  <head></head>\n\
  <body style=\"color: red;\">\n\
    <div class=\"main\">Hello world</div>\n\
  </body>\n\
</html>\n\
"

testStrings.splitTest = multiline(function () {/*
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
*/})

testStrings.heredoc = multiline(function () {/*
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
*/})

testStrings.delimited = multiline(function () {/*0
testStrings.delimited = multiline(function () {/*0
 id 1
 title Some book
 summary An expose, on the result of one "plus" one
1
 id 2
 title The answer, my friend, is...
 summary "Two"
*/})

testStrings.renameTest = multiline(function () {/*title b on GitHub
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
*/})

testStrings.csv = multiline(function () {/*id,title,summary
1,Some book,"An expose, on the result of one ""plus"" one"
2,"The answer, my friend, is...","""Two"""
*/})

testStrings.csvNoHeaders = multiline(function () {/*bob,12,red
mike,321,blue
al,1214,green
*/})

testStrings.ssv = multiline(function () {/*id title summary
1 "Some book" "An expose, on the result of one ""plus"" one"
2 "The answer, my friend, is..." """Two"""
*/})

testStrings.ssv = multiline(function () {/*id title summary
1 "Some book" "An expose, on the result of one ""plus"" one"
2 "The answer, my friend, is..." """Two"""
*/})

testStrings.renameObjects = multiline(function () {/*
0
 name John Doe
 email johndoe@email.com
1
 name Mary Jane
 email maryjane@email.com
*/})

testStrings.tsv = "id\ttitle\tsummary\n\
1\tSome book\t\"An expose, on the result of one \"\"plus\"\" one\"\n\
2\tThe answer, my friend, is...\t\"\"\"Two\"\"\"\n"

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

// Export for use in Node.js
if (typeof exports != 'undefined')
  module.exports = testStrings;
