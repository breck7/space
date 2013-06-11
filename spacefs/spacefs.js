var Space = require('space'),
    fs = require('fs'),
    mime = require('mime'),
    Path = require('path')

var SpaceFS = {}

SpaceFS.isText = function (path) {
  if (path.match(/(makefile|\.(txt|js|html|css|json|htm|md|php|py|rb|haml|yaml|xml|gitignore|sql|h|c|csv|note|log|space))$/i))
      return true
  return !!mime.lookup(path).match(/^text\//)
}

SpaceFS.folderToSpace = function (path) {
  var space = new Space()
  var files = fs.readdirSync(path)
  for (var i in files) {
    var file = files[i]
    if (file === '.')
      continue
    if (file === '..')
      continue
    var xpath = file
    var filePath = path + '/' + file
    var stats = fs.statSync(filePath)
    if (stats.isDirectory()) {
      space.set(xpath, SpaceFS.folderToSpace(filePath))
      continue
    }
    // If text
    if (SpaceFS.isText(file))
      space.set(xpath, fs.readFileSync(filePath, 'utf8'))

    // Base64 encode it
    else
      space.set(xpath, fs.readFileSync(filePath).toString('base64'))
  }
  return space
}

SpaceFS.spaceToFolder = function (destination, space) {
  if (!fs.existsSync(destination))
    fs.mkdirSync(destination)
  space.each(function (key, value) {
    var path = destination + '/' + key
    if (value instanceof Space)
      SpaceFS.spaceToFolder(path, value)
    else if (SpaceFS.isText(key))
      fs.writeFileSync(path, value, 'utf8')
    else
      fs.writeFileSync(path, value, 'base64')
  })
}

// Resolve ~
SpaceFS.resolvePath = function (string) {
  if (string.substr(0,1) === '~')
    string = process.env.HOME + string.substr(1)
  return Path.resolve(string)
}

module.exports = SpaceFS





