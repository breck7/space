#!/usr/bin/env node
var Space = require('space'),
    fs = require('fs'),
    mime = require('mime'),
    Path = require('path')

var isText = function (path) {
  if (path.match(/(makefile|\.(txt|js|html|css|json|htm|md|php|py|rb|haml|yaml|xml|gitignore|sql|h|c|csv|note|log|space))$/i))
      return true
  return mime.lookup(path).match(/^text\//)
}

var folderToSpace = function (path, prefix) {
  var space = new Space()
  var files = fs.readdirSync(path)
  prefix = (prefix ? prefix + ' ' : '')
  for (var i in files) {
    var file = files[i]
    if (file === '.')
      continue
    if (file === '..')
      continue
    var xpath = prefix + file
    var filePath = path + '/' + file
    var stats = fs.statSync(filePath)
    if (stats.isDirectory()) {
      space.set(xpath, folderToSpace(filePath, xpath))
      continue
    }
    // If text
    if (isText(file))
      space.set(xpath, fs.readFileSync(filePath, 'utf8'))

    // Base64 encode it
    else
      space.set(xpath, fs.readFileSync(filePath).toString('base64'))
  }
  return space
}

var spaceToFolder = function (root, space) {
  fs.mkdirSync(root)
  space.each(function (key, value) {
    var path = root + key
    if (value instanceof Space)
      spaceToFolder(path, value)
    else if (isText(key))
      fs.writeFileSync(path, value, 'utf8')
    else
      fs.writeFileSync(path, value, 'base64')
  })
}

if (process.argv.length < 3) {
  console.log('Usage: space someFolder [destination] OR space someFile.space [destination]')
  process.exit()
}

// Resolve ~
function resolvePath (string) {
  if (string.substr(0,1) === '~')
    string = process.env.HOME + string.substr(1)
  return Path.resolve(string)
}

var arg1 = resolvePath(process.argv[2])
var arg2 = null
if (process.argv.length > 3)
  arg2 = process.argv[3]

// FolderToSpace
if (arg1.match(/\.space$/)) {
  
  var folderName = arg1.replace(/\.space$/, '')
  var space = fs.readFileSync(arg1, 'utf8')
  var path = arg2 || ''
  spaceToFolder(path + folderName, space)

}

// SpaceToFolder
else {
  var folder = Path.dirname(arg1)
  var filename = arg2 || Path.basename(arg1) + '.space'
  var space = folderToSpace(arg1)
  fs.writeFileSync(filename, space.toString(), 'utf8')
}






