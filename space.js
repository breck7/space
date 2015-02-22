/**
 * @param content any
 * @return space
 */
function Space(content) {
  this._pairs = []
  this._index = {}
  this._cache = {}
  this.events = {}
  this._load(content)
  return this
}

Space.version = '0.9.5'

/**
 * Delete items from an array
 *
 * @param array
 * @param indexes int|array<int>
 * @return Array of removed values
 */
Space.removeItems = function(array, indexes) {
  var removedValues = []

  if (typeof indexes === "number")
    indexes = [indexes]

  for (var i = indexes.length - 1; i >= 0 ; i--)
    removedValues.push(array.splice(indexes[i], 1))

  return removedValues
}

/**
 * @param property string
 * @return bool
 */
Space.isXPath = function(property) {
  return property.match(/ /)
}

/**
 * Takes all content from the start delimiter to the end delimiter,
 * turns it into a multiline string value, and removes all pairs including the
 * end delimiter.
 *
 * It will parse all heredocs encountered. If a start delimiter is found
 * without a matching end delimiter, all the content after the start
 * delimiter will be used as the heredoc.
 *
 * Returns a new Space object.
 *
 * @param start Delimiter at start of heredoc
 * @param start Delimiter at end of heredoc
 * @return space
 */
Space.fromHeredoc = function(content, start, end) {
  // Remove Windows newlines
  content = content.replace(/\n\r/g, '\n')

  var lines = content.split("\n"),
      startIndex = null,
      linesToDelete = [],
      startRegex = new RegExp("\^" + start + "(?: |$)"),
      linesLength = lines.length,
      startLength = start.length,
      endRegex = new RegExp("\^" + end);

  for (var i = 0; i < linesLength; i++) {
    if (startIndex === null) {
      if (lines[i].match(startRegex)) {
        startIndex = i
        // Make sure the key starts with a " " so its value is treated as a multiline
        // string.
        if (lines[i].length === startLength)
          lines[i] = lines[i] + " "
      } else {
        continue;
      }
    } else if (lines[i].match(endRegex)) {
      startIndex = null
      linesToDelete.push(i)
    } else {
      lines[i] = " " + lines[i]
    }
  }

  Space.removeItems(lines, linesToDelete)

  return new Space(lines.join("\n"))
}

/**
 * Node.js only
 *
 * Reads a file from disk and returns a space object synchronously or asynchronously.
 * If no callback is provided will return synchronously, otherwise asynchronously.
 *
 * @param string filepath
 * @param options object|function
 * @param callback function
 * @return space|null
 */
Space.fromFile = function(filepath, options, callback) {
  if (typeof require === 'undefined')
    throw new Error("fromFile only works with node.js")

  if (typeof fs === 'undefined')
    fs = require("fs")

  if (typeof options === 'function') {
    callback = options
    options = null
  }

  if (!options) {
    options = 'utf8'
  }

  if (!callback)
    return new Space(fs.readFileSync(filepath, options))

  return fs.readFile(filepath, options, function (err, data) {
    if (err)
      return callback(err)
    return callback(err, new Space(data))
  })
}

/**
 * @param str string The csv string to parse
 * @return space
 */
Space.fromCsv = function (str) {
  return Space.fromDelimiter(str, ",")
}

/**
 * @param str string The csv string to parse
 * @param delimiter string
 * @return space
 */
Space.fromDelimiter = function (str, delimiter) {
  var length = str.length,
      currentItem = "",
      currentPosition = 0,
      inQuote = false,
      rows = [[]],
      space = new Space(),
      currentRow = 0

  while (currentPosition < length) {
    var c = str[currentPosition]
    if (!inQuote) {
      if (c === delimiter) {
        rows[currentRow].push(currentItem)
        currentItem = ''
        if (str[currentPosition + 1] === '"') {
          inQuote = true
          currentPosition++
        }
      }
      else if (c === '\n') {
        rows[currentRow].push(currentItem)
        currentItem = ''
        currentRow++
        if (str[currentPosition + 1])
          rows[currentRow] = []
        if (str[currentPosition + 1] === '"') {
          inQuote = true
          currentPosition++
        }
      }
      else if (currentPosition === length - 1)
        rows[currentRow].push(currentItem + c)
      else
        currentItem += c
    } else {
      if (c !== '"')
        currentItem += c
      else if (str[currentPosition + 1] !== '"')
        inQuote = false
      else {
        currentItem += '"'
        currentPosition++ // Jump 2
      }
    }
    currentPosition++
  }

  // Strip any spaces from property names.
  // This makes the mapping not quite 1 to 1 if there are any spaces in prop names.
  for (var i = 0; i < rows[0].length; i++) {
    rows[0][i] = rows[0][i].replace(/ /g, '')
  }

  rows.forEach(function (row, index) {
    if (index === 0)
      return true

    var obj = new Space()
    rows[0].forEach(function (prop, i) {
      var v = row[i]
      if (v === '')
        return true

      obj.append(prop, v)
    })

    // Subtract 1 since header was row 0
    space.append(index - 1, obj)
  })

  return space
}

/**
 * Parses a simple space separated value "name age height\njoe 20 68"
 *
 * @param str string ssv string to parse
 * @return space
 */
Space.fromSsv = function (str) {
  return Space.fromDelimiter(str, " ")
}

/**
 * @param str string The tab string to parse
 * @return space
 */
Space.fromTsv = function (str) {
  return Space.fromDelimiter(str, "\t")
}

Space._parseXml2 = function (str) {
  var el = document.createElement('div')
  el.innerHTML = str
  return el 
}

Space._initializeXmlParser = function () {
  if (Space._parseXml)
    return

  if (typeof window.DOMParser !== "undefined") {
    Space._parseXml = function (xmlStr) {
      return (new window.DOMParser()).parseFromString(xmlStr, "text/xml")
    }
  }

  else if (typeof window.ActiveXObject !== "undefined" && new window.ActiveXObject("Microsoft.XMLDOM")) {
      Space._parseXml = function (xmlStr) {
          var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM")
          xmlDoc.async = "false"
          xmlDoc.loadXML(xmlStr)
          return xmlDoc
      }
  }

  else
    throw new Error("No XML parser found")
}

/**
 * @param str string The XML string to parse
 * @return space
 */
Space.fromXml = function (str) {
  Space._initializeXmlParser()
  var xml = Space._parseXml(str)

  try {
    return Space._fromXml(xml).get("children")
  }
  catch (e) {
    return Space._fromXml(Space._parseXml2(str)).get("children")
  }
  
}

Space._fromXml = function (xml) {
  var result = new Space(),
      children = new Space()

  // Set attributes
  if (xml.attributes) {
    for (var a = 0; a < xml.attributes.length; a++) {
      result.set(xml.attributes[a].name, xml.attributes[a].value)
    }
  }

  if (xml.data)
    children.push(xml.data)

  // Set content
  if (xml.childNodes && xml.childNodes.length > 0) {
    for (var i = 0; i < xml.childNodes.length; i++) {
      var child = xml.childNodes[i]

      if (child.tagName && child.tagName.match(/parsererror/i))
        throw new Error("Parse Error")

      if (child.childNodes.length > 0 && child.tagName)
        children.append(child.tagName, Space._fromXml(child))
      else if (child.tagName)
        children.append(child.tagName, new Space())
      else if (child.data) {
        var data = child.data.trim()
        if (data)
          children.push(data)
      }
    }
  }

  if (children.length() > 0)
    result.set("children", children)

  return result
}

/**
 * Node.js only
 *
 * Writes a space object to disk either synchronously or asynchronously.
 * If no callback is provided will return synchronously, otherwise asynchronously.
 *
 * @param string filepath
 * @param spaceObj space
 * @param options? object|function
 * @param callback? function
 * @param async? boolean Whether to force an async operation
 * @return Result of writeFile or writeFileSync
 */
Space.toFile = function(filepath, spaceObj, options, callback, async) {
  if (typeof require === 'undefined')
    throw new Error("toFile only works with node.js")

  if (typeof fs === 'undefined')
    fs = require("fs")

  if (typeof options === 'function') {
    callback = options
    options = null
  }

  if (!async && !callback)
    return fs.writeFileSync(filepath, spaceObj.toString(), options)

  return fs.writeFile(filepath, spaceObj.toString(), options, callback)
}

Space._ajaxRequest = function(url, callback, spaceObj) {
  var request = new XMLHttpRequest()
  
  request.onreadystatechange = function() {
      if (request.readyState == 4 && request.status == 200)
        callback(new Space(request.responseText))
      else if (request.readyState == 4)
        callback(null, "Error Code: " + request.status + ". " +  request.statusText)
  }
  
  request.open(spaceObj ? "POST" : "GET", url, true)
  if (spaceObj)
    request.setRequestHeader('Content-type', 'text/plain')
  request.send(spaceObj ? spaceObj.toString() : null)
}

Space._nodeRequest = function(url, callback, spaceObj) {
  if (typeof request === 'undefined')
    request = require('request')

  if (spaceObj) {
    var options = {
      url: url,
      method: "POST",
      headers: {
        contentType: "text/plain"
      },
      body: spaceObj.toString()
    }
    return request.post({url: url, formData: spaceObj.toString()}, callback)
  }

  return request.get(url, function (error, response, body) {
    if (error)
      return callback(null, error)
    callback(new Space(body))
  })
}

Space._isNode = function () {
  return typeof require !== 'undefined'
}

/**
 * Makes a get request to the provided url and calls a callback with (space object, error).
 *
 * @param string url
 * @param function callback
 */
Space.fromUrl = function(url, callback) {
  if (Space._isNode())
    Space._nodeRequest(url, callback)
  else
    Space._ajaxRequest(url, callback)
}

/**
 * Makes a post request to the provided url and calls a callback with (data, error).
 *
 * @param string url
 * @param space spaceObj
 * @param function callback
 */
Space.toUrl = function(url, spaceObj, callback) {
  if (Space._isNode())
    Space._nodeRequest(url, callback, spaceObj)
  else
    Space._ajaxRequest(url, callback, spaceObj)
}

/**
 * Removes the last node from an xpath and returns the previous nodes. If only
 * one node is left, returns ''.
 *
 * Examples: "us cali sf" returns "us cali". "sf" returns ""
 *
 * @param string Xpath
 * @return string Xpath
 */
Space.pathBranch = function(xpath) {
  var nodes = xpath.split(/ /g)
  if (nodes.length < 2)
    return ''
  nodes.pop()
  return nodes.join(' ')
}

/**
 * Returns the last node from an xpath.
 *
 * Examples: "us cali sf" returns "sf". "sf" returns "sf"
 *
 * @param string Xpath
 * @return string Xpath
 */
Space.pathLeaf = function(xpath) {
  var nodes = xpath.split(/ /g)
  if (nodes.length < 2)
    return xpath
  return nodes[nodes.length - 1]
}

/**
 * @param string
 * @param int
 * @return string
 */
Space.strRepeat = function(string, count) {
  var str = ''
  for (var i = 0; i < count; i++) {
    str += string
  }
  return str
}

/**
 * Return a new Space with the property/value pairs that all passed spaces contain.
 * todo: remove this?
 *
 * @param array Array of Spaces
 * @return space
 */
Space.union = function() {
  var union = Space.unionSingle(arguments[0], arguments[1]),
      argumentsLength = arguments.length
  for (var i = 0; i < argumentsLength; i++) {
    if (i === 1) continue // skip the first one
    union = Space.unionSingle(union, arguments[i])
    if (!union.length()) break
  }
  return union
}

/**
 * todo: remove?
 *
 * @param space
 * @return space
 */
Space.unionSingle = function(spaceA, spaceB) {
  var union = new Space()
  if (!(spaceB instanceof Space))
    return union
  spaceA.each(function(property, value) {
    if (value instanceof Space && spaceB._getValueByProperty(property) && spaceB._getValueByProperty(property) instanceof Space)
      union._setPair(property, Space.unionSingle(value, spaceB._getValueByProperty(property)))
    if (value === spaceB._getValueByProperty(property))
      union._setPair(property, value)
  })
  return union
}

/**
 * Add a property & value to the bottom of the space object.
 *
 * @param property string
 * @param value any
 * @return space this
 */
Space.prototype.append = function(property, value) {
  this._setPair(property, value)
  this.trigger('append', property, value)
  this.trigger('change')
  return this
}

/**
 * Deletes all data.
 *
 * @return space this
 */
Space.prototype._clear = function() {
  this._pairs = []
  this._index = {}
  this._cache = {}
  return this
}

/**
 * Deletes all data.
 *
 * @param space? any. Optionally pass new content to repopulate the object.
 * @return space this
 */
Space.prototype.clear = function(space) {
  if (this.isEmpty())
    return this
  this._clear()
  this.trigger('clear')
  if (space)
    this._load(space)
  this.trigger('change')
  return this
}

/**
 * Removes all listeners.
 *
 * @param eventName? string. Optionally pass an eventName to only remove those events.
 * @return space this
 */
Space.prototype.clearListeners = function(eventName) {
  if (eventName)
    delete this.events[eventName]
  else {
    for (var eventName in this.events) {
      if (this.events.hasOwnProperty(eventName))
        delete this.events[eventName]
    }
  }
  return this
}

/**
 * Returns a deep copied space.
 *
 * @return space
 */
Space.prototype.clone = function() {
  return new Space(this.toString())
}

/**
 * Append one space object to another.
 *
 * @param b space|string The object to append
 * @return space this
 */
Space.prototype.concat = function(b) {
  if (typeof b === 'string')
    b = new Space(b)
  var a = this
  b.each(function(property, value) {
    a.append(property, value)
  })
  return this
}

/**
 * Identical to append, except it fires a create event instead.
 * todo: remove this or append?
 *
 * @param property string
 * @param value any
 * @return space this
 */
Space.prototype.create = function(property, value) {
  this._setPair(property, value)
  this.trigger('create', property, value)
  this.trigger('change')
  return this
}

Space.prototype._delete = function(property) {
  if (typeof property === 'number')
    return this._deleteByIndex(property)
  else if (property.toString().match(/ /))
    return this._deleteByXPath(property)
  else
    return this._deleteByProperty(property)
}

Space.prototype._deleteByIndex = function(index) {
  if (this._pairs[index] === undefined)
    return 0
  var removedPair = this._pairs.splice(index, 1),
      property = removedPair[0][0]
  
  this._index[property]--
  if (!this._index[property]) {
    delete this._cache[property];
    delete this._index[property];
  } else if (removedPair[0][1] !== this._cache[property]) {
    // If the removed value is not the cached value.
  } else {
    // There is an entry after this one
    var length = this.length()
    for (var i = index; i < length; i++) {
      if (this._pairs[i][0] === property) {
        this._cache[property] = this._pairs[i][1]
        break;
      }
    }
  }

  return 1
}

Space.prototype._deleteByProperty = function(property) {
  var index = this.indexOf(property)
  if (index === -1)
    return 0
  return this._deleteByIndex(index)
}

Space.prototype._deleteByXPath = function(xpath) {
  // Get parent
  var parts = xpath.split(/ /)
  var child = parts.pop()
  var parent = this.get(parts.join(' '))
  if (parent instanceof Space)
    return parent._delete(child)
  return 0
}

/**
 * If passed a string(or xpath), deletes the first matching pair.
 * If passed an int, deletes the pair at that index.
 *
 * @param property string|int|xpath
 * @return space this
 */
Space.prototype['delete'] = function(property) {
  if (this._delete(property))
    this.trigger('delete', property)
  this.trigger('change')
  return this
}

/**
 * Returns the difference between 2 spaces. The difference between 2 spaces is a space.
 *
 * b == a.patch(a.diff(b))
 *
 * todo: clean and refactor this.
 *
 * @param space The space to compare the instance against.
 * @return space
 */
Space.prototype.diff = function(space) {
  var diff = new Space()

  if (!(space instanceof Space))
    space = new Space(space)

  this.each(function(property, value) {
    var spaceValue = space._getValueByProperty(property)

    // Case: Deleted
    if (typeof spaceValue === 'undefined') {
      diff._setPair(property, '')
      return true
    }
    // Different Properties
    if (typeof(this._getValueByProperty(property)) !== typeof(spaceValue)) {
      if (typeof spaceValue === 'object')
        diff._setPair(property, new Space(spaceValue))

      // We treat a spaceValue of 1 equal to '1'
      else if (this._getValueByProperty(property) == spaceValue)
        return true
      else
        diff._setPair(property, spaceValue)
      return true
    }
    // Strings, floats, etc
    if (typeof(this._getValueByProperty(property)) !== 'object') {
      if (this._getValueByProperty(property) != spaceValue)
        diff._setPair(property, spaceValue)
      return true
    }
    // Both are Objects
    var sub_diff = this._getValueByProperty(property).diff(spaceValue)
    if (sub_diff.length())
      diff._setPair(property, sub_diff)
  })

  // Leftovers are Additions
  var me = this
  space.each(function(property, value) {
    if (me.has(property))
      return true
    if (typeof value !== 'object') {
      diff._setPair(property, value)
      return true
    } else if (value instanceof Space)
      diff._setPair(property, new Space(value))
    else
      diff._setPair(property, new Space(space))
  })
  return diff
}

/**
 * @param space
 * @return space Returns empty space if order is equal.
 */
Space.prototype.diffOrder = function(space) {
  if (!(space instanceof Space))
    space = new Space(space)
  
  var diff = new Space(),
      me = this

  space.each(function(property, value) {
    if (!(value instanceof Space) || !(me._getValueByProperty(property) instanceof Space))
      return true
    var childDiff = me._getValueByProperty(property).diffOrder(value)
    if (childDiff.isEmpty())
      return true
    diff._setPair(property, childDiff)
  })

  // Parent hasnt changed
  if (space.tableOfContents() === this.tableOfContents())
    return diff
    // Parent has changed
  space.each(function(property, value) {
    if (!diff.has(property))
      diff._setPair(property, new Space())
  })
  return diff
}

/**
 * Passes property, value, index to each pair.
 *
 * @param fn function
 * @return space this
 */
Space.prototype.each = function(fn) {
  var length = this._pairs.length
  for (var i = 0; i < length; i++) {
    if (fn.call(this, this._pairs[i][0], this._pairs[i][1], i) === false)
      return this
  }
  return this
}

/**
 * Returns a new space object with only the pairs that return true when
 * passed to the supplied filter function.
 *
 * @param fn function
 * @return space
 */
Space.prototype.filter = function(fn) {
  var result = new Space(),
      length = this._pairs.length
  for (var i = 0; i < length; i++) {
    if (fn.call(this, this._pairs[i][0], this._pairs[i][1], i) === true)
      result.append(this._pairs[i][0], this._pairs[i][1])
  }
  return result
}

/**
 * Does a recursive search finding all pairs that match the type and value
 * supplied
 *
 * @param typeTest string|int
 * @param valueTest string|int
 * @return space
 */
Space.prototype.find = function(typeTest, valueTest) {
  // for now assume string test
  // search this one
  var matches = new Space()
  if (this.get(typeTest) === valueTest)
    matches.push(this)
  this.each(function(property, value) {
    if (!(value instanceof Space))
      return true
    value
      .find(typeTest, valueTest)
      .each(function(k, v) {
        matches.push(v)
      })
  })
  return matches
}

/**
 * Return the first property/value pair as a space object.
 *
 * @return space
 */
Space.prototype.first = function() {
  if (!this.length())
    return new Space()
  var result = new Space().set(this._pairs[0][0], this._pairs[0][1])
  return result
}

/**
 * @return string
 */
Space.prototype.firstProperty = function() {
  if (!this.length())
    return null
  return this._pairs[0][0]
}

/**
 * @return any
 */
Space.prototype.firstValue = function() {
  if (!this.length())
    return null
  return this._pairs[0][1]
}

/**
 * @param fn function
 * @return space this
 */
Space.prototype.every = function(fn) {
  this.each(function(property, value, index) {
    fn.call(this, property, value, index)
    if (value instanceof Space)
      value.every(fn)
  })
  return this
}

/**
 * Search the space for a given path (xpath).
 *
 * @param string|int|space
 * @return any
 */
Space.prototype.get = function(query) {
  return this._getValueByString(query.toString())
}

/**
 * Get all pairs with a matching property as a space object.
 *
 * @param string|int|space
 * @return space
 */
Space.prototype.getAll = function(query) {
  var matches = new Space()
  this.each(function(property, value) {
    if (property !== query)
      return true
    matches.append(property, value)
  })
  return matches
}

/**
 * Get all pairs with a matching property as an array.
 *
 * @param string|int|space
 * @return array
 */
Space.prototype.getArray = function(query) {
  var matches = []
  this.each(function(property, value) {
    if (property !== query)
      return true
    matches.push(value)
  })
  return matches
}

/**
 * @param int
 * @return any
 */
Space.prototype.getByIndex = function(index) {
  return this._getValueByIndex(index)
}

/**
 * @param string
 * @return any
 */
Space.prototype.getByIndexPath = function(query) {
  var parts = query.split(/ /g)
  var first = parseFloat(parts.shift())
  if (parts.length === 0)
    return this._getValueByIndex(first)
  else
    return this._getValueByIndex(first).getByIndexPath(parts.join(' '))
}

/**
 * @param space
 * @return any
 */
Space.prototype.getBySpace = function(query) {
  return this._getValueBySpace(query)
}

/**
 * Returns a space object listing the pairs that
 * were created, updated, or deleted.
 *
 * ie: if object A is:
 *
 * name John
 * age 25
 * state California
 *
 * And object B is:
 *
 * name John
 * age 22
 * hometown Brockton
 *
 * Then A.getCud(B) would be:
 *
 * created
 *  hometown Brockton
 * updated
 *  age 22
 * deleted
 *  state
 *
 * @param space object b
 * @return space the cud diff
 */
Space.prototype.getCud = function(space) {
  var diff = new Space('created\nupdated\ndeleted\n')
  if (!(space instanceof Space))
    space = new Space(space)
  var subject = this
  space.each(function(property, value) {
    if (subject.get(property) === undefined)
      diff.set('created ' + property, value)
    else if (subject.get(property).toString() !== value.toString())
      diff.set('updated ' + property, value)
  })
  this.each(function(property, value) {
    if (space.get(property) === undefined)
      diff.set('deleted ' + property, new Space())
  })
  return diff
}

/**
 * @param int
 * @return The matching value
 */
Space.prototype._getValueByIndex = function(index) {
  // Passing -1 gets the last item, et cetera
  if (index < 0)
    index = this.length() + index
  if (this._pairs[index])
    return this._pairs[index][1]
  return undefined
}

Space.prototype._getValueByProperty = function(property) {
  return this._cache[property]
  /*
  this._pairs.forEach(function(pair, index) {
    if (pair[0] === property) {
      result = pair[1]
      return false
    }
  })
  return result
  */
}

Space.prototype._getPropertyByIndex = function(index) {
  // Passing -1 gets the last item, et cetera
  var length = this.length()
  if (index < 0)
    index = length + index
  if (index >= length)
    return undefined
  return this._pairs[index][0]
}

/**
 * Returns a shallow array of all the properties.
 *
 * @return array<string>
 */
Space.prototype.getProperties = function() {
  var types = []
  this._pairs.forEach(function(pair, index) {
    types.push(pair[0])
  })
  return types
}

/**
 * Search the space for a given path (xpath).
 *
 * @param string
 * @return any The matching value
 */
Space.prototype._getValueByString = function(xpath) {

  if (!xpath)
    return undefined

  var value = this._getValueByProperty(xpath)
  if (value)
    return value

  if (value === "" || value === 0 || value === false)
    return value

  if (!xpath.match(/ /))
    return undefined

  var parts = xpath.split(/ /g),
      current = parts.shift()

  // Not set
  if (!this.has(current))
    return undefined

  if (this._getValueByProperty(current) instanceof Space)
    return this._getValueByProperty(current).get(parts.join(' '))

  else
    return undefined
}

/**
 * Recursively retrieve properties.
 *
 * @param space
 * @return space
 */
Space.prototype._getValueBySpace = function(space) {
  var result = new Space()

  var me = this
  space.each(function(property, v) {
    var value = me._getValueByProperty(property)

    // If this doesnt have that property, continue
    if (typeof value === 'undefined')
      return true

    // If the request is a leaf or empty space, set
    if (!(space._getValueByProperty(property) instanceof Space) || !space._getValueByProperty(property).length()) {
      result._setPair(property, value)
      return true
    }

    // Else the request is a space with types, make sure the subject is a space
    if (!(value instanceof Space))
      return true

    // Now time to recurse
    result._setPair(property, value._getValueBySpace(space._getValueByProperty(property)))
  })
  return result
}

/**
 * Experimental.
 *
 * @param debug bool
 * @return string
 */
Space.prototype.getTokens = function(debug) {
  var string = this.toString()
  var mode = 'K'
  var tokens = ''
  var escapeLength = 1
  var escaping = 0
  var stringLength = string.length
  for (var i = 0; i < stringLength - 1; i++) {
    var character = string.substr(i, 1)

    if (escaping > 0) {
      // skip over the escaped spaces
      tokens += 'E'
      escaping--
      continue
    }

    if (character !== ' ' && character !== '\n') {
      if (mode === 'N')
        mode = 'K'
      tokens += mode
      continue
    }

    if (character === ' ') {
      if (mode === 'V') {
        tokens += mode
        continue
      } else if (mode === 'K') {
        tokens += 'S'
        mode = 'V'
        continue
      }
      // KEY hunt mode
      else {
        escapeLength++
        tokens += 'N'
        continue
      }
    }

    //  else its a newline
    if (mode === 'K') {
      mode = 'N'
      escapeLength = 1
      tokens += 'N'
      continue
    } else if (mode === 'V') {
      // if is escaped
      if (string.substr(i + 1, escapeLength) === Space.strRepeat(' ', escapeLength)) {
        tokens += 'V'
        escaping = escapeLength
        continue
      }

      // else not escaped
      mode = 'N'
      escapeLength = 1
      tokens += 'N'
      continue
    }
  }
  return tokens
}

/**
 * Experimental
 *
 * @return string
 */
Space.prototype.getTokensConcise = function() {
  // http://stackoverflow.com/questions/7780794/javascript-regex-remove-duplicate-characters
  return this.getTokens().replace(/[^\w\s]|(.)(?=\1)/gi, "")
}

/**
 * Returns a shallow array of all the values.
 *
 * @return array<any>
 */
Space.prototype.getValues = function() {
  var values = []
  this._pairs.forEach(function(pair, index) {
    values.push(pair[1])
  })
  return values
}

/**
 * @param string
 * @return bool
 */
Space.prototype.has = function(property) {
  return !!this._getValueByProperty(property)
}

// Experimental
Space.prototype.__height = function() {
  return this.toString().match(/\n/g).length
}

/**
 * Return first occurence of property in object
 *
 * @param string
 * @return int
 */
Space.prototype.indexOf = function(property) {
  if (!this._index[property])
    return -1;
  var length = this.length()
  for (var i = 0; i < length; i++) {
    if (this._pairs[i][0] === property)
      return i
  }
  return -1
}

/**
 * Insert a property value pair at a specific index.
 *
 * @param string
 * @param value any
 * @param index? int
 * @return space this
 */
Space.prototype.insert = function(property, value, index) {
  this._setPair(property, value, index)
  return this
}

/**
 * Does the length of the object === 0.
 *
 * @return bool
 */
Space.prototype.isEmpty = function() {
  return this.length() === 0
}

/**
 * Does a deep check of whether the object has only unique types
 *
 * @return bool
 */
Space.prototype.isASet = function() {
  var result = true,
      set = {}

  this.each(function(property, value) {
    if (set[property]) {
      result = false
      return false
    }
    set[property] = true
    if (value instanceof Space) {
      if (value.isASet())
        return true
      result = false
      return false
    }
  })
  return result
}

Space.prototype._typeCount = function() {
  var count = this.length()
  this.each(function(property, value) {
    if (value instanceof Space)
      count += value._typeCount()
  })
  return count
}

/**
 * Return the last property/value pair as a space object.
 *
 * @return space
 */
Space.prototype.last = function() {
  if (!this.length())
    return new Space()
  var lastIndex = this.length() - 1
  var result = new Space().set(this._pairs[lastIndex][0], this._pairs[lastIndex][1])
  return result
}

/**
 * @return string
 */
Space.prototype.lastProperty = function() {
  if (!this.length())
    return null
  var lastIndex = this.length() - 1
  return this._pairs[lastIndex][0]
}

/**
 * @return any
 */
Space.prototype.lastValue = function() {
  if (!this.length())
    return null
  var lastIndex = this.length() - 1
  return this._pairs[lastIndex][1]
}

/**
 * @return int
 */
Space.prototype.length = function() {
  return this._pairs.length
}

Space._load2 = true

Space.prototype._load = function(content) {

  // Load from string
  if (typeof content === 'string') {
    if (!content.length)
      return this

    if (Space._load2)
      this._loadFromString2(content)

    else
      this._loadFromString(content)      

    return this
  }

  // Load from Space object
  if (content instanceof Space) {
    var me = this
    content.each(function(property, value) {
      me._setPair(property, value)
    })
    return this
  }

  // Load from object
  if (content instanceof Array)
    this._loadFromArray(content)
  else
    this._loadFromObject(content)
}

Space.prototype._loadFromArray = function(array) {
  for (var i in array) {
    this._loadPair(i.toString(), array[i])
  }
}

Space.prototype._loadPair = function(property, value) {
  if (value === null)
    this._setPair(property, "null")
  else if (value === undefined)
    this._setPair(property, "")
  else if (!(typeof value === "object"))
    this._setPair(property, value.toString())
  else if (value instanceof Date)
    this._setPair(property, value.getTime().toString())
  else
    this._setPair(property, new Space(value))
}

Space.prototype._loadFromObject = function(content) {
  for (var property in content) {
    // In case hasOwnProperty has been overwritten we
    // call the original
    if (!Object.prototype.hasOwnProperty.call(content, property))
      continue
    this._loadPair(property, content[property])
  }
}

/**
 * Construct the Space from a string.
 *
 * @param string
 * @return space
 */
Space.prototype._loadFromString2 = function(string) {
  var currentProperty = '',
      currentValue = '',
      inProperty = '',
      inValue = '',
      spaceCount = 0,
      maxOpenDepth = 0,
      wasNewLine = false,
      objects = {0 : this},
      valueSpaceCount = 0,
      spacesToGo = 0,
      started = false,
      stringLength = string.length

  for (var i = 0; i < stringLength; i++) {
    var c = string[i]

    if (c === '\r')
      continue

    if (!started && (c === '\n' || c === ' '))
      continue
    else if (!started) {
      inProperty = true
      started = true
    }

    if (inProperty) {
      if (c === ' ') {
        inProperty = false
        inValue = true

        if (spaceCount >= maxOpenDepth)
          valueSpaceCount = maxOpenDepth
        else
          valueSpaceCount = spaceCount
      } else if (c === '\n') {
        inProperty = false
        
        // this handles extra spaces
        if (spaceCount >= maxOpenDepth)
          spaceCount = maxOpenDepth
        else
          maxOpenDepth = spaceCount
        
        maxOpenDepth = spaceCount + 1
        objects[maxOpenDepth] = new Space()
        objects[spaceCount]._setPair(currentProperty, objects[maxOpenDepth])
        spaceCount = 0
        // it's either an empty space or a space with pairs
        // and it could be the end of a space
        currentProperty = ''
      } else {
        currentProperty += c
      }
    } else if (inValue) {
      if (spacesToGo && c === ' ') {
        spaceCount++
        spacesToGo--
      } else if (spacesToGo) {
        // Ran out of space. We hit a property
        objects[valueSpaceCount]._setPair(currentProperty, currentValue.substr(0, currentValue.length - 1))
        currentValue = ''
        inProperty = true
        inValue = false
        currentProperty = c
        spacesToGo = 0
      } else if (c === '\n') {
        // it's either the end of the pair or it's part of a multiline
        // it may be the end of a space
        spacesToGo = valueSpaceCount + 1
        spaceCount = 0
        if (i !== string.length - 1)
          currentValue += c
      } else {
        currentValue += c
      }
    } else if (c === '\n') {
      // ignore blank lines
      
    } else if (c === ' ') {
      spaceCount++
    } else {
      inProperty = true
      currentProperty = c
    }
  }

  // If it ends on a space
  if (inProperty)
    objects[spaceCount]._setPair(currentProperty, new Space())

  if (inValue)
    objects[valueSpaceCount]._setPair(currentProperty, currentValue)

  return this;
}

/**
 * Construct the Space from a string.
 *
 * @param string
 * @return space
 */
Space.prototype._loadFromString = function(string) {
  // Space always start on a property. Eliminate whitespace at beginning of string
  string = string.replace(/^\s*/, '')

  /* Eliminate Windows \r characters.*/
  string = string.replace("\r", "")

  /* Eliminate newlines at end of string.*/
  //  string = string.replace(/\n[\n ]*$/, '')

  /** Space doesn't have useless lines*/
  string = string.replace(/\n\n+/, '\n')

  // Workaround for browsers without negative look ahead
  /*
  var spaces_without_delimiter = string.split(/\n([^ ])/),
      spaces = [spaces_without_delimiter[0]]
  
  // Now we recombine spaces.
  for (var i = 1; i < spaces_without_delimiter.length; i = i + 2) {
    spaces.push(spaces_without_delimiter[i] + spaces_without_delimiter[i+1])
  }
  */
  var spaces = string.split(/\n(?! )/g),
      matches
  for (var i in spaces) {
    var space = spaces[i]
    if (matches = space.match(/^([^ ]+)(\n|$)/)) // Space
      this._setPair(matches[1], new Space(space.substr(matches[1].length).replace(/\n /g, '\n')))
    else if (matches = space.match(/^([^ ]+) /)) // Leaf
      this._setPair(matches[1], space.substr(matches[1].length + 1).replace(/\n /g, '\n'))
  }
  return this
}

/**
 * Apply a fn to every property in this instance and rename the
 * property to the return value of the fn.
 *
 * @param fn (prop: string) => string
 * @param deep boolean Whether to recurse. Default is false.
 * @return this
 */
Space.prototype.map = function(propertiesFn, valuesFn, deep, inPlace) {
  if (!inPlace)
    return new Space(this).map(propertiesFn, valuesFn, deep)

  this._index = {}
  this._cache = {}
  var length = this._pairs.length
  for (var i = 0; i < length; i++) {

    if (propertiesFn)
      this._pairs[i][0] = propertiesFn(this._pairs[i][0])
    if (!(this._pairs[i][1] instanceof Space) && valuesFn)
      this._pairs[i][1] = valuesFn(this._pairs[i][1])
    else if (deep && this._pairs[i][1] instanceof Space)
      this._pairs[i][1].map(propertiesFn, valuesFn, deep, inPlace)
    
    this._updateCache(this._pairs[i][0], this._pairs[i][1])
  }
  return this
}

/**
 * Return the next property in the Space, given a property.
 *
 * @param property string
 * @return string
 */
Space.prototype.next = function(property) {
  var index = this.indexOf(property)
  var next = index + 1
  return this._getPropertyByIndex(next)
}

/**
 * @param eventName string
 * @param fn function
 * @return this
 */
Space.prototype.off = function(eventName, fn) {
  if (!this.events[eventName])
    return true
  for (var i in this.events[eventName]) {
    if (this.events[eventName][i] === fn)
      this.events[eventName].splice(i, 1)
  }
  return this
}

Space.prototype._objectCount = function() {
  var count = 0
  this.each(function(property, value) {
    if (value instanceof Space)
      count += 1 + value._objectCount()
  })
  return count
}

/**
 * @param eventName string
 * @param fn function
 * @return this
 */
Space.prototype.on = function(eventName, fn) {
  if (!this.events[eventName])
    this.events[eventName] = []
  this.events[eventName].push(fn)
  return this
}

Space.prototype._patch = function(patch) {

  if (!(patch instanceof Space))
    patch = new Space(patch)

  var me = this
  patch.each(function(property, patchValue) {

    // If patch value is a string, doesnt matter what property subject is.
    if (typeof patchValue === 'string') {
      if (patchValue === '')
        me._delete(property)
      else
        me.set(property, patchValue, null, true)
      return true
    }

    // If patch value is an int, doesnt matter what property subject is.
    if (typeof patchValue === 'number') {
      me.set(property, patchValue, null, true)
      return true
    }

    // If its an empty space, delete patch.
    if (patchValue instanceof Space && !patchValue.length()) {
      me._delete(property)
      return true
    }

    // If both subject value and patch value are Spaces, do a recursive patch.
    if (me._getValueByProperty(property) instanceof Space) {
      me._getValueByProperty(property)._patch(patchValue)
      return true
    }

    // Final case. Do a deep copy of space.
    me.set(property, new Space(patchValue), null, true)

  })

  return this
}

/**
 * Apply a patch to the Space instance.
 *
 * @param patch space|string
 * @return space
 */
Space.prototype.patch = function(patch) {
  // todo, don't trigger patch if no change
  this._patch(patch)
  this.trigger('patch', patch)
  this.trigger('change')
  return this
}

/**
 * Change the order of the types
 * @param space space|any
 * @return space this
 */
Space.prototype._patchOrder = function(space) {

  if (!(space instanceof Space))
    space = new Space(space)

  var me = this
  var copy = this.clone()
  me._clear()
  space.each(function(property, value) {
    me._setPair(property, copy.get(property))
    // Recurse
    if (value instanceof Space && value.length() && copy._getValueByProperty(property) instanceof Space)
      me._getValueByProperty(property)._patchOrder(value)
  })
  return this
}

/**
 * Apply an order patch to the Space instance.
 *
 * @param space space|string The order patch
 * @return space
 */
Space.prototype.patchOrder = function(space) {
  // todo: don't trigger event if no change
  this._patchOrder(space)
  this.trigger('patchOrder', space)
  this.trigger('change')
  return this
}

/**
 * Remove the last item from the object and return the pair as a new space object.
 *
 * @return space
 */
Space.prototype.pop = function() {
  if (!this.length())
    return null
  var result = new Space()
  var property = this._getPropertyByIndex(-1)
  var value = this._getValueByProperty(property)
  result.set(property, value)
  this._delete(property)
  return result
}

/**
 * Add a new pair to the beginning of an object.
 *
 * @param property string
 * @param value any
 * @return space
 */
Space.prototype.prepend = function(property, value) {
  return this._setPair(property, value, 0)
}

/**
 * Return the previous property in the Space, given a property.
 *
 * @param name string
 * @return string
 */
Space.prototype.prev = function(name) {
  var index = this.indexOf(name)
  var prev = index - 1
  return this._getPropertyByIndex(prev)
}

/**
 * Push a value to the space object and set its property to this.length() + 1
 *
 * @param value any
 * @return this
 */
Space.prototype.push = function(value) {
  var i = this.length()
  while (this.get(i.toString())) {
    i++
  }
  this._setPair(i.toString(), value)
  return this
}

Space.prototype._rename = function(oldName, newName) {
  var index = this.indexOf(oldName)
  if (index === -1)
    return this
  this._setPair(newName, this._getValueByProperty(oldName), index, true)
  return this
}

/**
 * Clear the content of the object and load the passed content.
 *
 * @param space|string
 * @return space this
 */
Space.prototype.reload = function(content) {
  // todo, don't trigger patch if no change
  this._pairs = []
  this._index = {}
  this._cache = {}
  this._load(content)
  this.trigger('reload')
  return this
}

/**
 * Rename the first occurence of a property.
 *
 * @param oldName string
 * @param newName string
 * @return space this
 */
Space.prototype.rename = function(oldName, newName) {
  this._rename(oldName, newName)
  if (oldName !== newName)
    this.trigger('rename', oldName, newName)
  this.trigger('change')
  return this
}

/**
 * Rename all occurences of a property recursively.
 *
 * @param oldName string
 * @param newName string
 * @param recursive bool Default is false
 * @return space this
 */
Space.prototype.renameAll = function(oldName, newName, recursive) {
  this.each(function (key, value, index) {
    if (key === oldName)
      this._setPair(newName, value, index, true)
    if (recursive && value instanceof Space)
      value.renameAll(oldName, newName, recursive)
  })
  return this
}

/**
 * Set a property/value pair.
 *
 * @param property string Can be an xpath
 * @param value any
 * @param index? int
 * @return space this
 */
Space.prototype.set = function(property, value, index, noEvents) {
  property = property.toString()
  if (Space.isXPath(property))
    this._setByXPath(property, value)
  else {
    var indexOfProperty = this.indexOf(property)
    if (indexOfProperty > -1)
      this._setPair(property, value, indexOfProperty, true)
    else
      this._setPair(property, value, index)
  }
  if (!noEvents) {
    this.trigger('set', property, value, index)
    this.trigger('change')
  }
  return this
}

/**
 * Pass an index path like "1 0 4" to deep set a prop/value.
 *
 * @param query string
 * @param any
 * @return space this
 */
Space.prototype.setByIndexPath = function(query, value) {
  if (!Space.isXPath(query)) {
    var i = parseFloat(query)
    this.update(i, this._getPropertyByIndex(i), value)
    return this
  }
  var branch = Space.pathBranch(query)
  var space = this.getByIndexPath(branch)
  if (!space)
    return this
  var property = parseFloat(Space.pathLeaf(query))
  space.update(property, space._getPropertyByIndex(property), value)
  return this
}

Space.prototype._setByXPath = function(path, value) {
  if (!path)
    return null
  var generations = path.toString().split(/ /g)
  var currentContext = this
  var currentPath
  var index
  var generationsLength = generations.length
  for (var i = 0; i < generationsLength; i++) {
    currentPath = generations[i]
    var isLeaf = (i === (generations.length - 1))
    // If path is already set, continue
    if (!isLeaf && currentContext._getValueByProperty(currentPath) instanceof Space) {
      currentContext = currentContext.get(currentPath)
      continue
    }

    var newValue
    // Leaf
    if (isLeaf)
      newValue = value
    else
      newValue = new Space()

    // update pair
    if (currentContext.has(currentPath)) {
      var index = currentContext.indexOf(currentPath)
      currentContext._setPair(currentPath, newValue, index, true)
    } else
      currentContext._setPair(currentPath, newValue)
    currentContext = currentContext.get(currentPath)
  }
  return this
}

Space.prototype._setPair = function(property, value, index, overwrite) {
  property = property.toString()
  if (index === undefined)
    this._pairs.push([property, value])
  else if (overwrite && this._pairs[index]) {
    var overwrittenProperty = this._pairs.splice(index, 1, [property, value])[0][0]
    this._index[overwrittenProperty]--
    if (this._index[overwrittenProperty] === 0)
      delete this._cache[overwrittenProperty]
  }
  else
    this._pairs.splice(index, 0, [property, value])

  this._updateCache(property, value, index)
}

Space.prototype._updateCache = function(property, value, index) {
  var currentCount = this._index[property]
  if (!currentCount)
    this._cache[property] = value
  else if (index !== undefined) {
    // Scroll through and see if there is already an entry in the cache
    for (var i = 0; i < index; i++) {
      if (this._pairs[i][0] === property)
        break;
    }
    // This is the new first value
    if (i === index)
      this._cache[property] = value
  }

  this._index[property] = currentCount ? currentCount + 1 : 1
}

/**
 * Remove the top element from the object
 *
 * @return space The deleted value
 */
Space.prototype.shift = function() {
  if (!this.length())
    return null
  var property = this._getPropertyByIndex(0)
  var result = new Space()
  result.set(property, this.get(property))
  this._deleteByIndex(0)
  return result
}

/**
 * @param fn function
 * @return space this
 */
Space.prototype.sort = function(fn) {
  this._pairs = this._pairs.sort(fn)
  return this
}

/**
 * Splits an object into an array of objects. Everytime the passed
 * property is encountered, a new object is created with that pair as the
 * first pair in the new object. The search begins on the first occurence
 * of the passed delimiter. Any preceding items will be ignored.
 *
 * @param delimiter string
 * @param propertyName? If provided will return space object with each entry nested under this name.
 * @return array|space Of space objects or space object with nested entries
 */
Space.prototype.split = function(delimiter, propertyName) {
  var matches = propertyName ? new Space() : [],
      currentItem = null

  this.each(function(property, value) {
    if (property === delimiter) {
      // Insert the previous item if we had created one.
      if (currentItem)
        propertyName ? matches.append(propertyName, currentItem) : matches.push(currentItem)
      currentItem = new Space()
    }

    if (!currentItem)
      return true

    // Todo: we probably need to do a deep clone of value
    currentItem.append(property, value)
  })

  if (currentItem)
    propertyName ? matches.append(propertyName, currentItem) : matches.push(currentItem)

  return matches
}

/**
 * For a space object like this:
 * name John
 * age 12
 * hometown Brockton
 *
 * The TOC is equal to "name age hometown"
 * todo: make nested TOC?
 * todo: remove?
 *
 * @return string
 */
Space.prototype.tableOfContents = function() {
  return this.getProperties().join(' ')
}

/**
 * Experimental.
 * @return string
 */
Space.prototype.toBinary = function() {
  var binary = ''
  var str = this.toString()
  for (var i = 0; i < str.length; i++) {
    var bits = parseFloat(str.substr(i, 1).charCodeAt(0)).toString(2)
    while (bits.length < 8) {
      bits = '0' + bits
    }
    binary += bits
  }
  return binary.replace(/0/g, '-').replace(/1/g, '|')
}

/**
 * Experimental.
 * @return string
 */
Space.prototype.toBinaryMatrixString = function() {
  var str = ''
  var matrix = this.toDecimalMatrix()
  matrix.forEach(function(row, i) {
    row.forEach(function(c, j) {
      var bits = c.toString(2)
      while (bits.length < 8) {
        bits = '0' + bits
      }
      str += bits
    })
    str += '\n'
  })
  return str
}

/**
 * Experimental. Very inefficient. If useful speed & trim it up.
 * @return array
 */
Space.prototype.toColumns = function() {
  var thisString = this.toString(),
      str = '',
      cols = [],
      col = 0,
      maxLength = 0,
      extras = 0,
      rows = 0,
      thisStringLength = thisString.length

  for (var i = 0; i < thisStringLength; i++) {
    var c = thisString[i]
    if (c === "\n") {
      // Fill extra whitespace for this row
      while (col < maxLength) {
        cols[col] += " "
        col++
      }
      col = 0
      rows++
      continue
    }
    if (!cols[col]) {
      cols[col] = ""
      for (var r = 0; r < rows; r++) {
        // Fill extra whitespace in previous rows
        cols[col] += " "
      }
    }
    cols[col] += c
    col++
    if (col > maxLength)
      maxLength = col
  }
  return cols
}

Space.prototype.toCsv = function() {
  return this.toDelimited(",")
}

/**
 * Experimental.
 * @return array
 */
Space.prototype.toDecimalMatrix = function() {
  var width = this.__width()
  var lines = this.toString().replace(/\n$/, '').split(/\n/g)
  var matrix = []
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i]
    var row = []
    var length = line.length
    for (var c = 0; c < width; c++) {
      if (c < length)
        row.push(line.substr(c, 1).charCodeAt(0))
      else
        row.push(0)
    }
    matrix.push(row)
  }
  return matrix
}

/**
 * Experimental.
 * @return string
 */
Space.prototype.toDecimalMatrixString = function() {
  var str = ''
  var matrix = this.toDecimalMatrix()
  matrix.forEach(function(row, i) {
    var first = ''
    row.forEach(function(c, j) {
      str = str + first
      if (c < 10)
        str += '00' + c
      else if (c > 9 && c < 100)
        str += '0' + c
      else
        str += c
      first = ' '
    })
    str += '\n'
  })
  return str
}

/**
 * @param delimiter string
 * @param header? Array like ["name", "city", "state", "country", "income"]
 * @return string
 */
Space.prototype.toDelimited = function(delimiter, header) {
  var str = "",
      regex = new RegExp("(\\n|\\\"|\\" + delimiter + ")"),
      escapeFunction = function (str) {
        // No escaping necessary
        if (!str.match(regex))
          return str

        // Surround the str with "" and replace any " with ""
        return "\"" + str.replace(/\"/g, '""') + "\""
      },
      rows = [],
      header = header || [],
      headerIndex = {}

  // If header not provided, build it
  if (!header.length) {
    this.each(function (property, row) {
      //  We expect value to be an instance of space
      if (!(row instanceof Space))
        return true

      row.each(function (column, value) {
        if (headerIndex[column])
          return true

        header.push(column)
        headerIndex[column] = true
      })
    })
  }

  // Build the header row
  header.forEach(function (columnName) {
    str += delimiter + escapeFunction(columnName)
  })

  str = str.substr(1) + "\n" // Chop the first comma and add newline

  this.each(function (property, row) {
      //  We expect value to be an instance of space
      if (!(row instanceof Space))
        return true

      var rowStr = ""

      header.forEach(function (columnName) {
          var v = row.get(columnName) || ""
          rowStr += delimiter + escapeFunction(v.toString())
      })

      str += rowStr.substr(1) + "\n" // Chop the first comma and add newline
    })
  return str
}

/**
 * Toggle a property between two values.
 *
 * @param property string|int|xpath
 * @param value1 any
 * @param value2 any
 * @return space this
 */
Space.prototype.toggle = function(property, value1, value2) {
  var current = this.get(property)
  if (current === value1)
    this.set(property, value2)
  else
    this.set(property, value1)
  return this
}

/**
 * Return executable javascript code.
 *
 * @param multiline? bool Whether to return the code on more than one line. Default is false.
 * @return string
 */
Space.prototype.toJavascript = function(multiline) {
  var str = 'new Space(\'' + this.toString().replace(/\n/g, '\\n').replace(/\'/g, '\\\'') + '\')'
  if (multiline)
    return str.replace(/\\n/g, "\\n\\\n")
  return str
}

/**
 * Return JSON
 *
 * Note: when guessTypes is true, toJSON will never return empty arrays, only
 * empty objects, if one is encountered. Handle appropriately.
 *
 * @param guessTypes? Whether to scan for arrays and numbers and convert to predicted type.
 * @param pretty? Whether to pretty print the returned JSON.
 * @return string JSON
 */
Space.prototype.toJSON = function(guessTypes, pretty) {
  return JSON.stringify(this.toObject(guessTypes), null, pretty ? " " : null)
}

Space.prototype._toObject = function() {
  var properties = this.getProperties(),
      isArray = properties.length > 0,
      next = 0

  properties.forEach(function (v) {
    if (v !== next.toString())
      isArray = false
    next++
  })

  var obj = isArray ? [] : {}

  this.each(function(property, value) {
    var v
    if (value instanceof Space)
      v = value._toObject()
    else if (value === "false")
      v = false
    else if (value === "true")
      v = true
    else if (value === "null")
      v = null
    else if (value.match(/^[\-\.]?[0-9]+[0-9\.]*$/))
      v = parseFloat(value)
    else
      v = value

    if (isArray)
      obj.push(v)
    else
      obj[property] = v
  })
  return obj
}

/**
 * Returns a regular javascript object
 *
 * Note: when guessTypes is true, toJSON will never return empty arrays, only
 * empty objects, if one is encountered. Handle appropriately.
 *
 * @param guessTypes? Whether to scan for arrays and numbers and convert to predicted type.
 * @return object
 */
Space.prototype.toObject = function(guessTypes) {
  if (guessTypes)
    return this._toObject()

  var obj = {}
  this.each(function(property, value) {
    if (value instanceof Space)
      obj[property] = value.toObject()
    else
      obj[property] = value
  })
  return obj
}

/**
 * Returns something like name=John&age=23
 *
 * @return string
 */
Space.prototype.toQueryString = function() {
  var string = '',
      first = ''

  this.each(function(property, value) {
    string += first + encodeURIComponent(property) + '=' + encodeURIComponent(value)
    first = '&'
  })
  return string
}

/**
 * Experimental
 */
Space.prototype.toShapes = function(spaces) {
  spaces = spaces || 0
  var string = 'V\n'
  // Iterate over each property
  this.each(function(property, value) {

    // If property value is undefined
    if (typeof value === 'undefined') {
      string += '\n'
      return true
    }

    // Set up the property part of the property/value pair
    string += Space.strRepeat(' ', spaces) + 'O'

    // If the value is a space, concatenate it
    if (value instanceof Space)
      string += value.toShapes(spaces + 1)

    // If an object (other than class of space) snuck in there
    else if (typeof value === 'object')
      string += new Space(value).toShapes(spaces + 1)

    // dont put a blank string on a blank value.
    else if (value.toString() === '')
      string += ' \n'

    // Plain string
    else
      string += '[]' + '\n'
  })

  return string
}

/**
 * @return string
 */
Space.prototype.toSsv = function() {
  return this.toDelimited(" ")
}

/**
 * @return string
 */
Space.prototype.toString = function(spaces) {
  spaces = spaces || 0
  var string = ''
  // Iterate over each property
  this.each(function(property, value) {

    // If property value is undefined
    if (typeof value === 'undefined') {
      string += '\n'
      return true
    }

    // Set up the property part of the property/value pair
    string += Space.strRepeat(' ', spaces) + property

    // If the value is a space, concatenate it
    if (value instanceof Space)
      string += '\n' + value.toString(spaces + 1)

    // If an object (other than class of space) snuck in there
    else if (typeof value === 'object')
      string += '\n' + new Space(value).toString(spaces + 1)

    // dont put a blank string on a blank value.
    else if (value.toString() === '')
      string += ' \n'

    // multiline string
    else if (value.toString().match(/\n/))
      string += ' ' + value.toString().replace(/\n/g, '\n' + Space.strRepeat(' ', spaces + 1)) + '\n'

    // Plain string
    else
      string += ' ' + value.toString() + '\n'

  })

  return string
}

/**
 * @return string
 */
Space.prototype.toTsv = function() {
  return this.toDelimited("\t")
}

/**
 * @return string
 */
Space.prototype.toURL = function() {
  return encodeURIComponent(this.toString())
}

/**
 * @param pretty? boolean 
 * @return string
 */
Space.prototype.toXML = function(pretty) {
  return this._toXML(pretty ? 0 : -1)
}

Space.prototype._toXML = function(spaceCount) {
  var xml = "",
      spaces = spaceCount === -1 ? "" : Space.strRepeat(" ", spaceCount)
  
  this.each(function(property, value) {
    xml += spaces + "<" + property + ">"
    if (!(value instanceof Space))
      xml += value
    else if (value.length() > 0)
      xml += (spaceCount === -1 ? "" : "\n") + value._toXML(spaceCount > -1 ? spaceCount + 2 : -1) + spaces

    xml += "</" + property + ">" + (spaceCount === -1 ? "" : "\n")
  })
  return xml
}

/**
 * @param pretty? boolean 
 * @return string
 */
Space.prototype.toXMLWithAttributes = function(pretty) {
  return this.firstValue()._toXMLWithAttributes(this.firstProperty(), pretty ? 0 : -1)
}

Space.prototype._toXMLWithAttributes = function(property, spaceCount) {
  var xml = "",
      spaces = spaceCount === -1 ? "" : Space.strRepeat(" ", spaceCount),
      attributesStr = "",
      contentStr = "",
      children = this.get("children")

  this.each(function (prop, value) {
    if (prop === "children")
      return true
    if (value && value.replace)
      attributesStr += " " + prop + "=\"" + value.replace('"', '\\"') + "\"" 
    else
      attributesStr += " " + prop
  })

  if (children) {
    children.each(function (prop, value) {
      if (value instanceof Space)
        contentStr += (spaceCount === -1 ? "" : "\n") + value._toXMLWithAttributes(prop, spaceCount > -1 ? spaceCount + 2 : -1) + spaces
      else
        contentStr += value
      if (prop === "children")
        return true
    })
  }

  xml += spaces + "<" + property + attributesStr + ">" + contentStr +
         "</" + property + ">" + (spaceCount === -1 || !contentStr? "" : "\n")
  return xml
}

Space.prototype.__transpose = function(templateString) {
  var result = ''
  this.each(function(property, value) {
    var template = new Space(templateString.toString())
    template.every(function(k, xpath, index) {
      if (value._getValueByProperty(xpath))
        this._setPair(k, value._getValueByProperty(xpath), index, true)
    })
    result += template.toString()
  })
  return new Space(result)
}

/**
 * @param eventName string
 */
Space.prototype.trigger = function(eventName) {
  if (!this.events[eventName])
    return true
  var args = Array.prototype.slice.call(arguments)
  for (var i in this.events[eventName]) {
    this.events[eventName][i].apply(this, args.slice(1))
  }
}

/**
 * @param index int
 * @param property any
 * @param value any
 * @return space this
 */
Space.prototype.update = function(index, property, value) {
  this._setPair(property, value, index, true)
  return this
}

Space.prototype.wrap = function(property) {
  var newSpace = new Space()
  newSpace.set(property, this)
  return this.reload(newSpace.toString())
}

Space.prototype.__width = function() {
  var lines = this.toString().split(/\n/g)
  var width = 0
  lines.forEach(function(str, property) {
    if (str.length > width)
      width = str.length
  })
  return width
}

// Export Space for use in Node.js
if (typeof exports !== 'undefined')
  module.exports = Space;
