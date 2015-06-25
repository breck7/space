/**
 * @param content any
 * @return space
 */
function Space(content) {
  // string[]
  this._clearProperties()

  // any[]
  this._values = []

  // StringMap<int> {property: index}
  this._cache = {}

  return this._load(content)
}

Space.version = "0.15.0"

/**
 * @param property string
 * @return bool
 */
Space._isSpacePath = function(property) {
  return property.indexOf(" ") > -1
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
  content = content.replace(/\n\r/g, "\n")

  var lines = content.split("\n")
  var startIndex = null
  var linesToDelete = []
  var startRegex = new RegExp("\^" + start + "(?: |$)")
  var linesLength = lines.length
  var startLength = start.length
  var endRegex = new RegExp("\^" + end)

  for (var i = 0; i < linesLength; i++) {
    if (startIndex === null) {
      if (lines[i].match(startRegex)) {
        startIndex = i
        // Make sure the key starts with a " " so its value is treated as a multiline
        // string.
        if (lines[i].length === startLength)
          lines[i] = lines[i] + " "
      } else
        continue
    } else if (lines[i].match(endRegex)) {
      startIndex = null
      linesToDelete.push(i)
    } else
      lines[i] = " " + lines[i]
  }

  Space._removeItems(lines, linesToDelete)

  return new Space(lines.join("\n"))
}

/**
 * @param str string The csv string to parse
 * @param hasHeaders boolean Default is true.
 * @return space
 */
Space.fromCsv = function (str, hasHeaders) {
  return Space.fromDelimiter(str, ",", hasHeaders)
}

/**
 * @param str string The csv string to parse
 * @param delimiter string
 * @param hasHeaders boolean Default is true.
 * @return space
 */
Space.fromDelimiter = function (str, delimiter, hasHeaders) {
  var length = str.length
  var currentItem = ""
  var inQuote = str.substr(0, 1) === "\""
  var currentPosition = inQuote ? 1 : 0
  var rows = [[]]
  var space = new Space()
  var currentRow = 0

  hasHeaders = hasHeaders !== false

  while (currentPosition < length) {
    var c = str[currentPosition]
    if (!inQuote) {
      if (c === delimiter) {
        rows[currentRow].push(currentItem)
        currentItem = ""
        if (str[currentPosition + 1] === "\"") {
          inQuote = true
          currentPosition++
        }
      }
      else if (c === "\n") {
        rows[currentRow].push(currentItem)
        currentItem = ""
        currentRow++
        if (str[currentPosition + 1])
          rows[currentRow] = []
        if (str[currentPosition + 1] === "\"") {
          inQuote = true
          currentPosition++
        }
      }
      else if (currentPosition === length - 1)
        rows[currentRow].push(currentItem + c)
      else
        currentItem += c
    } else {
      if (c !== "\"")
        currentItem += c
      else if (str[currentPosition + 1] !== "\"") {
        inQuote = false
        if (currentPosition + 1 === length)
          rows[currentRow].push(currentItem)
      }
      else {
        currentItem += "\""
        currentPosition++ // Jump 2
      }
    }
    currentPosition++
  }

  var headerRow = rows[0]
  var numberOfColumns = headerRow.length

  if (!hasHeaders) {
    // If str has no headers, create them as 0,1,2,3
    headerRow = []
    for (var i = 0; i < numberOfColumns; i++) {
      headerRow.push(i)
    }
  } else {
    // Strip any spaces from column names in the header row.
    // This makes the mapping not quite 1 to 1 if there are any spaces in prop names.
    for (var i = 0; i < numberOfColumns; i++) {
      headerRow[i] = headerRow[i].replace(/ /g, "")
    }
  }

  rows.forEach(function (row, index) {
    // Skip header row
    if (index === 0 && hasHeaders)
      return true

    var obj = new Space()
    headerRow.forEach(function (prop, i) {
      var v = row[i]
      if (v === "")
        return true

      obj.append(prop, v)
    })

    // Subtract 1 since header was row 0
    space.append(hasHeaders ? index - 1 : index, obj)
  })

  return space
}

/**
 * Parses a simple space separated value "name age height\njoe 20 68"
 *
 * @param str string ssv string to parse
 * @param hasHeaders boolean Default is true.
 * @return space
 */
Space.fromSsv = function (str, hasHeaders) {
  return Space.fromDelimiter(str, " ", hasHeaders)
}

/**
 * @param str string The tab string to parse
 * @param hasHeaders boolean Default is true.
 * @return space
 */
Space.fromTsv = function (str, hasHeaders) {
  return Space.fromDelimiter(str, "\t", hasHeaders)
}

Space._parseXml2 = function (str) {
  var el = document.createElement("div")
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
  var result = new Space()
  var children = new Space()

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

  if (children.length > 0)
    result.set("children", children)

  return result
}

Space._pairToString = function(property, value, spaces) {
  // Set up the property part of the property/value pair
  var string = Space._strRepeat(" ", spaces) + property

  // If the value is a space, concatenate it
  if (value instanceof Space)
    return string + "\n" + value._toString(spaces + 1)

  value = value.toString()

  // multiline string
  if (value.indexOf("\n") > -1)
    return string + " " + value.replace(/\n/g, "\n" + Space._strRepeat(" ", spaces + 1)) + "\n"

  // Plain string
  return string + " " + value + "\n"
}

/**
 * Delete items from an array
 *
 * @param array
 * @param indexes int|int[]
 * @return Array of removed values
 */
Space._removeItems = function(array, indexes) {
  var removedValues = []

  if (typeof indexes === "number")
    indexes = [indexes]

  for (var i = indexes.length - 1; i >= 0 ; i--)
    removedValues.push(array.splice(indexes[i], 1))

  return removedValues
}

/**
 * @param string
 * @param int
 * @return string
 */
Space._strRepeat = function(string, count) {
  var str = ""
  for (var i = 0; i < count; i++) {
    str += string
  }
  return str
}

/**
 * Return a new Space with the property/value pairs that all passed spaces contain.
 * todo: deprecate this?
 *
 * @param array Array of Spaces
 * @return space
 */
Space.union = function() {
  var union = Space._unionSingle(arguments[0], arguments[1])
  var argumentsLength = arguments.length

  for (var i = 0; i < argumentsLength; i++) {
    if (i === 1) continue // skip the first one
    union = Space._unionSingle(union, arguments[i])
    if (!union.length)
      break
  }
  return union
}

/**
 * @param space
 * @param space
 * @return space
 */
Space._unionSingle = function(spaceA, spaceB) {
  var union = new Space()

  if (!(spaceB instanceof Space))
    return union

  spaceA.each(function(property, value) {
    var spaceBValue = spaceB._getValueByProperty(property)
    if (value instanceof Space && spaceBValue && spaceBValue instanceof Space)
      union._setPair(property, Space._unionSingle(value, spaceB._getValueByProperty(property)))
    if (value === spaceBValue)
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
  return this.trigger("append", property, value).trigger("change")
}

/**
 * Deletes all data.
 *
 * @return space this
 */
Space.prototype._clear = function() {
  this._clearProperties()
  this._values = []
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
  this.trigger("clear")
  if (space)
    this._load(space)
  this.trigger("change")
  return this
}

/**
 * Removes all listeners.
 *
 * @param eventName? string. Optionally pass an eventName to only remove those events.
 * @return space this
 */
Space.prototype.clearListeners = function(eventName) {
  if (!this._events)
    return this
  if (eventName)
    delete this._events[eventName]
  else {
    for (var eventName in this._events) {
      if (this._events.hasOwnProperty(eventName))
        delete this._events[eventName]
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
  if (typeof b === "string")
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
  return this.trigger("create", property, value).trigger("change")
}

/**
 * Removes duplicate properties. Keeps the last occurence.
 *
 * @return space this
 */
Space.prototype.deleteDuplicates = function(recursive) {
  var matches = {} // StringMap<int>

  this.each(function (property, value, index) {
    var isDupe = matches[property] !== undefined
    if (isDupe) {
      this._deleteByIndex(index)
      return true
    }
    matches[property] = true
    if (recursive && value instanceof Space)
      value.deleteDuplicates(recursive)
  }, null, true)

  return this
}

Space.prototype._delete = function(property) {
  if (typeof property === "number")
    return this._deleteByIndex(property)
  else if (Space._isSpacePath(property.toString()))
    return this._deleteBySpacePath(property)
  else
    return this._deleteByProperty(property)
}

Space.prototype._deleteByIndex = function(index) {
  if (this._values[index] === undefined)
    return 0

  this._deleteProperty(index)
  this._values.splice(index, 1)
  this._reindex()
  return 1
}

Space.prototype._deleteByIndexes = function (indexesToDelete) {
  var length = indexesToDelete.length

  for (var i = length - 1; i >= 0 ; i--) {
    this._deleteProperty(indexesToDelete[i])
    this._values.splice(indexesToDelete[i], 1)
  }

  this._reindex()
  return this
}

Space.prototype._deleteByProperty = function(property) {
  var index = this.indexOf(property)
  return index === -1 ? 0 : this._deleteByIndex(index)
}

Space.prototype._deleteBySpacePath = function(spacePath) {
  // Get parent
  var parts = spacePath.split(/ /)
  var child = parts.pop()
  var parent = this.get(parts.join(" "))

  return parent instanceof Space ? parent._delete(child) : 0
}

Space.prototype._deleteProperty = function(index) {
  this._properties.splice(index, 1)
  return this._getProperties()
}

Space.prototype._getProperties = function() {
  return this._properties
}

Space.prototype._insertProperty = function (index, property) {
  this._properties.splice(index, 0, property)
}

Space.prototype._setProperty = function(index, property) {
  this._properties[index] = property
  return this._getProperties()
}

Space.prototype._clearProperties = function() {
  this._properties = []
}

Space.prototype._reverseProperties = function() {
  this._properties.reverse()
}

/**
 * Deletes a pair(s) from the instance.
 *
 * If passed a string(or spacePath), deletes the first matching pair.
 * If passed an int, deletes the pair at that index.
 *
 * @param property string|int|spacePath
 * @return space this
 */
Space.prototype["delete"] = function(property) {
  var somethingChanged = false

  while (this._delete(property)) {
    somethingChanged = true
  }
  return somethingChanged ? this.trigger("delete", property).trigger("change") : this
}

/**
 * Returns the difference between 2 spaces. The difference between 2 spaces is a space.
 *
 * b == a.patch(a.diff(b))
 *
 * todo: clean and refactor this to return line based diffs.
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
    if (spaceValue === undefined) {
      diff._setPair(property, "")
      return true
    }
    var thisValue = this._getValueByProperty(property)
    var typeofSpaceValue = typeof(spaceValue)
    var typeofThisValue = typeof(thisValue)

    // Different Properties
    if (typeofThisValue !== typeofSpaceValue) {
      if (typeofSpaceValue === "object")
        diff._setPair(property, new Space(spaceValue))

      // We treat a spaceValue of 1 equal to "1"
      else if (thisValue == spaceValue)
        return true
      else
        diff._setPair(property, spaceValue)
      return true
    }
    // Strings, floats, etc
    if (typeofThisValue !== "object") {
      if (thisValue !== spaceValue)
        diff._setPair(property, spaceValue)
      return true
    }
    // Both are Objects
    var sub_diff = thisValue.diff(spaceValue)
    if (sub_diff.length)
      diff._setPair(property, sub_diff)
  })

  // Leftovers are Additions
  var me = this
  space.each(function(property, value) {
    if (me.has(property))
      return true
    if (typeof value !== "object") {
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
 * Return the number of pairs in the object including all nested pairs.
 *
 * @return number
 */
Space.prototype.deepLength = function() {
  var length = 0

  this.every(function () {
    length++
  })
  return length
}

/**
 * Passes property, value, index to each pair.
 *
 * @param fn function
 * @param deep boolean Whether to apply fn recursively. Default is false
 * @param reverse boolean Set to true to iterate from bottom to top.
 * @return space this
 */
Space.prototype.each = function(fn, deep, reverse) {
  var length = this.length
  var properties = this._getProperties()

  if (!reverse) {
    for (var i = 0; i < length; i++) {
      if (deep && this._values[i] instanceof Space)
        this._values[i].each(fn, deep)
      if (fn.call(this, properties[i], this._values[i], i) === false)
        return this
    }
  } else {
    for (var i = length - 1; i >= 0; i--) {
      if (deep && this._values[i] instanceof Space)
        this._values[i].each(fn, deep)
      if (fn.call(this, properties[i], this._values[i], i) === false)
        return this
    }
  }
  return this
}

/**
 * @return StringMap<function[]> Event listeners
 */
Object.defineProperty(Space.prototype, "events", {
    get: function events() {
      return this._events || {}
    }
})

/**
 * Apply a function to every line in the instance.
 *
 * If fn returns false the method will immediately return.
 *
 * @param fn (property: string, value: string, index: int) => boolean|void
 * @return space this
 */
Space.prototype.every = function(fn) {
  this._every(fn)
  return this
}

Space.prototype._every = function(fn, leafsOnly) {
  var result = true

  this.each(function(property, value, index) {
    var isSpace = value instanceof Space
    if (!isSpace || !leafsOnly)
      result = fn.call(this, property, value, index)
    if (result === false)
      return false
    if (isSpace)
      result = value._every(fn, leafsOnly)
    return result
  })
  return result
}

/**
 * Scan the entire object and return a new space instance composed of
 * every pair where the key matches one of the passed properties.
 *
 * @param string Space delimited string of properties. i.e. "date name pageviews"
 * @return space
 */
Space.prototype.extract = function (properties) {
  var props = properties.split(" ")
  var propKey = {}
  var matches = new Space()

  props.forEach(function (val) {
    propKey[val] = true
  })

  this._extract(propKey, matches)
  return matches
}

Space.prototype._extract = function (propKey, matches) {
  this.each(function (property, value) {
    if (propKey[property])
      matches.append(property, value)
    else if (value instanceof Space)
      value._extract(propKey, matches)
  })
}

/**
 * Apply a function to every leaf in the instance.
 *
 * If fn returns false the method will immediately return.
 *
 * @param fn (property: string, value: string, index: int) => boolean|void
 * @return space this
 */
Space.prototype.everyLeaf = function(fn) {
  this._every(fn, true)
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
  var result = new Space()
  var length = this.length
  var properties = this._getProperties()

  for (var i = 0; i < length; i++) {
    if (fn.call(this, properties[i], this._values[i], i) === true)
      result.append(properties[i], this._values[i])
  }
  return result
}

/**
 * Does a recursive search and returns a space object containing
 * space objects that have a pair where:
 *  property === propertyTest && value === valueTest
 *
 * @param propertyTest string|int
 * @param valueTest string|int
 * @return space
 */
Space.prototype.find = function(propertyTest, valueTest) {
  // for now assume string test
  // search this one
  var matches = new Space()
  if (this.get(propertyTest) === valueTest)
    matches.push(this)
  this.each(function(property, value) {
    if (!(value instanceof Space))
      return true
    value
      .find(propertyTest, valueTest)
      .each(function(k, v) {
        matches.push(v)
      })
  })
  return matches
}

/**
 * Return the first property/value pair as a space object.
 * Returns an empty space instance if current instance is empty.
 *
 * @return space
 */
Space.prototype.first = function() {
  if (!this.length)
    return new Space()
  return new Space().set(this._getProperties()[0], this._values[0])
}

/**
 * @return string
 */
Space.prototype.firstProperty = function() {
  return this.length ? this._getProperties()[0] : undefined
}

/**
 * @return string|space|undefined
 */
Space.prototype.firstValue = function() {
  return this.length ? this._values[0] : undefined
}

/**
 * Search the space for a given path (spacePath).
 *
 * @param string|int|space
 * @return string|space|undefined
 */
Space.prototype.get = function(query) {
  if (query === undefined || query === null)
    return undefined
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
 * @param index int
 * @return string|space|undefined
 */
Space.prototype.getByIndex = function(index) {
  return this._getValueByIndex(index)
}

/**
/**
 * @return space Or null if there is no parent
 */
Space.prototype.getParent = function() {
  return this._parent || null
}

/**
 * @return string Space path to this instance if it has a parent
 */
Space.prototype.getPath = function() {
  var parent = this._parent
  var path = ""
  var child = this
  var first = ""

  while (parent) {
    parent.each(function (k, v) {
      if (v === child) {
        path = k + first + path
        first = " "
        return false
      }
    })
    child = parent
    parent = parent._parent
  }
  return path
}

/**
 * @return space
 */
Space.prototype.getRoot = function() {
  var parent = this._parent

  if (!parent)
    return this
  while (parent._parent) {
    parent = parent._parent
  }
  return parent || this
}

/**
 * @param query space
 * @return any
 */
Space.prototype.getBySpace = function(query) {
  return this._getValueBySpace(query)
}

Space.prototype._getCachedValue = function(property) {
  return this._values[this._cache[property]]
}

/**
 * @param int
 * @return The matching value
 */
Space.prototype._getValueByIndex = function(index) {
  // Passing -1 gets the last item, et cetera
  if (index < 0)
    index = this.length + index
  return this._values[index]
}

/**
 *
 * @param property string
 * @return string|space|undefined
 */
Space.prototype._getValueByProperty = function(property) {
  return this._getCachedValue(property)
}

Space.prototype._getPropertyByIndex = function(index) {
  // Passing -1 gets the last item, et cetera
  var length = this.length

  if (index < 0)
    index = length + index
  if (index >= length)
    return undefined
  return this._getProperties()[index]
}

/**
 * Returns a shallow array of all the properties.
 *
 * @return string[array]
 */
Space.prototype.getProperties = function() {
  return this._getProperties().slice(0)
}

/**
 * Search the space for a given path (spacePath).
 *
 * @param spacePath string
 * @return any The matching value
 */
Space.prototype._getValueByString = function(spacePath) {
  if (!spacePath)
    return undefined

  var value = this._getValueByProperty(spacePath)

  if (value)
    return value

  if (value === "" || value === 0 || value === false)
    return value

  if (!Space._isSpacePath(spacePath))
    return undefined

  var parts = spacePath.split(/ /g)
  var current = parts.shift()

  // Not set
  if (!this.has(current))
    return undefined

  var currentValue = this._getValueByProperty(current)

  if (currentValue instanceof Space)
    return this._getValueByProperty(current).get(parts.join(" "))

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
    if (typeof value === "undefined")
      return true

    // If the request is a leaf or empty space, set
    if (!(space._getValueByProperty(property) instanceof Space) || !space._getValueByProperty(property).length) {
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
 * Returns a shallow array of all the values.
 *
 * @return any[]
 */
Space.prototype.getValues = function() {
  return this._values.slice(0)
}

/**
 * Returns a boolean indicating whether the instance has a property named "property".
 *
 * Returns true if the instance has a property even if the value is empty.
 *
 * @param string
 * @return bool
 */
Space.prototype.has = function(property) {
  return this._getValueByProperty(property) !== undefined
}

/**
 * Return first occurrence of property in object
 *
 * @param property string
 * @param last boolean Set to true to return the last occurrence of property.
 * @return int
 */
Space.prototype.indexOf = function(property, last) {
  if (!this.has(property))
    return -1

  var length = this.length
  var properties = this._getProperties()

  if (!last) {
    for (var i = 0; i < length; i++) {
      if (properties[i] === property)
        return i
    }
  } else {
    for (var i = length - 1; i >= 0; i--) {
      if (properties[i] === property)
        return i
    }
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
  return this.length === 0
}

/**
 * Whether this instance has any nested space objects.
 *
 * @return bool
 */
Space.prototype.isFlat = function() {
  var length = this.length

  for (var i = 0; i < length; i++) {
    if (this._values[i] instanceof Space)
      return false
  }
  return true
}

/**
 * Check whether the object has only unique properties.
 *
 * @param deep bool Whether to search recursively. Default is false.
 * @return bool
 */
Space.prototype.isStringMap = function(deep) {
  var length = this.length
  var map = {}
  var property
  var value
  var properties = this._getProperties()

  for (var i = 0; i < length; i++) {
    property = properties[i]
    if (map[property])
      return false
    map[property] = true
    if (!deep)
      continue
    value = this._values[i]
    if ((!value instanceof Space))
      continue
    if (!value.isStringMap())
      return false
  }
  return true
}

/**
 * Return the last property/value pair as a space object.
 *
 * @return space
 */
Space.prototype.last = function() {
  if (!this.length)
    return new Space()
  var lastIndex = this.length - 1
  return new Space().set(this._getProperties()[lastIndex], this._values[lastIndex])
}

/**
 * @return string
 */
Space.prototype.lastProperty = function() {
  if (!this.length)
    return null
  return this._getProperties()[this.length - 1]
}

/**
 * @return any
 */
Space.prototype.lastValue = function() {
  if (!this.length)
    return null
  return this._values[this.length - 1]
}

/**
 * @return int
 */
Object.defineProperty(Space.prototype, "length", {
    get: function length() {
      return this._values.length
    }
})

Space._load2 = false

/**
 * @param content any
 * @param root? array
 * @return this
 */
Space.prototype._load = function(content, root) {
  if (!content)
    return this

  // Load from string
  if (typeof content === "string")
    return Space._load2 ? this._loadFromString2(content) : this._loadFromString(this._sanitizeString(content))

  // Load from Space object
  if (content instanceof Space) {
    var me = this
    content.each(function(property, value) {
      if (value instanceof Space)
        me._setPair(property, value.clone())
      else
        me._setPair(property, value)
    })
    return this
  }

  // Loading from a Date or function is weird. Nevertheless, if it happens turn content into a string.
  if (content instanceof Date || typeof content === "function")
    return this._load(content.toString())

  // If we load from object, create an array of inserted objects to avoid circular loops
  if (!root)
    root = [content]

  return this._loadFromObject(content, root)
}

Space.prototype._loadFromObject = function(content, root) {
  for (var property in content) {
    if (!content.hasOwnProperty(property))
      continue
    // Todo: wrap the below line in a try/catch to handle errors thrown
    // in situations like new Space($("body")), as well at a levels param?
    this._loadPair(property, content[property], root)
  }

  return this
}

Space.prototype._loadPair = function(property, value, root) {
  var type = typeof value
  if (value === null)
    this._setPair(property, "null")
  else if (value === undefined)
    this._setPair(property, "")
  else if (type !== "object")
    this._setPair(property, value)
  else if (value instanceof Date)
    this._setPair(property, value.getTime().toString())
  else if (value instanceof Space)
    this._setPair(property, value.clone())
  else if (type === "function")
    this._setPair(property, value.toString())
  else if (root.indexOf(value) === -1) {
    root.push(value)
    this._setPair(property, new Space()._load(value, root))
  }
}

/**
 * Construct the Space from a string.
 *
 * @param string
 * @return space
 */
Space.prototype._loadFromString2 = function(string) {
  var currentProperty = ""
  var currentValue = ""
  var inProperty = ""
  var inValue = ""
  var spaceCount = 0
  var maxOpenDepth = 0
  var wasNewLine = false
  var objects = {0 : this}
  var valueSpaceCount = 0
  var spacesToGo = 0
  var started = false
  var stringLength = string.length

  for (var i = 0; i < stringLength; i++) {
    var c = string[i]

    if (c === "\r")
      continue

    if (!started && (c === "\n" || c === " "))
      continue
    else if (!started) {
      inProperty = true
      started = true
    }

    if (inProperty) {
      if (c === " ") {
        inProperty = false
        inValue = true

        if (spaceCount >= maxOpenDepth)
          valueSpaceCount = maxOpenDepth
        else
          valueSpaceCount = spaceCount
      } else if (c === "\n") {
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
        // it is either an empty space or a space with pairs
        // and it could be the end of a space
        currentProperty = ""
      } else {
        currentProperty += c
      }
    } else if (inValue) {
      if (spacesToGo && c === " ") {
        spaceCount++
        spacesToGo--
      } else if (spacesToGo) {
        // Ran out of space. We hit a property
        objects[valueSpaceCount]._setPair(currentProperty, currentValue.substr(0, currentValue.length - 1))
        currentValue = ""
        inProperty = true
        inValue = false
        currentProperty = c
        spacesToGo = 0
      } else if (c === "\n") {
        // it is either the end of the pair or it is part of a multiline
        // it may be the end of a space
        spacesToGo = valueSpaceCount + 1
        spaceCount = 0
        // Advance to the next non-newline
        while (string[i + 1] === "\n") {
          i++
        }
        if (i !== string.length - 1)
          currentValue += c
      } else {
        currentValue += c
      }
    } else if (c === "\n") {
      // ignore blank lines

    } else if (c === " ") {
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

Space.prototype._sanitizeString = function(string) {
  // Space always start on a property. Eliminate whitespace at beginning of string
  string = string.replace(/^\s*/, "")

  /* Eliminate Windows \r characters.*/
  string = string.replace(/\r/g, "")

  /** Space does not have useless lines*/
  string = string.replace(/\n\n+/, "\n")

  return string
}

/**
 * Construct the Space from a string.
 *
 * @param string
 * @return space
 */
Space.prototype._loadFromString = function(string) {
  var pairs = string.split(/\n(?! )/g)
  var length = pairs.length
  var matches
  var pair

  for (var i = 0; i < length; i++) {
    pair = pairs[i]
    if (matches = pair.match(/^([^ ]+)(\n|$)/)) // Space
      this._setPair(matches[1], new Space()._loadFromString(pair.substr(matches[1].length).replace(/\n /g, "\n").replace(/^\n +/, "\n")))
    else if (matches = pair.match(/^([^ ]+) /)) // Leaf
      this._setPair(matches[1], pair.substr(matches[1].length + 1).replace(/\n /g, "\n"))
  }
  return this
}

/**
 * Apply a function(s) to every property and value in this instance and rename the
 * property to the return value of the propertiesFn and set the value to the
 * return value of the valuesFn.
 *
 * @param fn (prop: string) => string
 * @param fn (value: any, newPropertyName: string, oldPropertyName: string) => string
 * @param deep boolean Whether to recurse. Default is false.
 * @param inPlace boolean Whether to return a new object or change the current. Default is false
 * @return this
 */
Space.prototype.map = function(propertiesFn, valuesFn, deep, inPlace) {
  if (!inPlace)
    return new Space(this).map(propertiesFn, valuesFn, deep)

  var length = this.length
  var properties = this._getProperties()

  for (var i = 0; i < length; i++) {
    var oldName = properties[i]
    if (propertiesFn)
      properties = this._setProperty(i, propertiesFn(oldName))
    if (deep && this._values[i] instanceof Space)
      this._values[i].map(propertiesFn, valuesFn, deep, inPlace)
    else if (valuesFn)
      this._values[i] = valuesFn(this._values[i], properties[i], oldName)
  }
  this._reindex()
  return this
}

/**
 * Merges child space instances with the same property.
 *
 * Does not touch child pairs if the value is not a space instance.
 *
 * @return space this
 */
Space.prototype.mergeDuplicates = function() {
  var matches = {}
  var indexesToDelete = []
  var me = this

  this.each(function (key, value, index) {
    if (!(value instanceof Space))
      return true

    if (matches[key] === undefined)
      matches[key] = index
    else {
      value.each(function (k, v) {
        me.getByIndex(matches[key]).set(k, v)
      })
      indexesToDelete.push(index)
    }
  })

  return this._deleteByIndexes(indexesToDelete)
}

/**
 * Return a new space instance which has one property/value. The
 * property is the one passed. The value is the current instance.
 *
 * @param property string
 * @return space This
 */
Space.prototype.nest = function(property) {
  var newSpace = new Space()

  newSpace.set(property, this)
  return this.reload(newSpace.toString())
}

/**
 * Return the next property in the Space, given a property.
 *
 * @param property string
 * @return string
 */
Space.prototype.next = function(property) {
  return this._getPropertyByIndex(this.indexOf(property) + 1)
}

/**
 * @param eventName string
 * @param fn function
 * @return this
 */
Space.prototype.off = function(eventName, fn) {
  if (!this._events || !this._events[eventName])
    return this
  for (var i in this._events[eventName]) {
    if (this._events[eventName][i] === fn)
      this._events[eventName].splice(i, 1)
  }
  return this
}

/**
 * @param eventName string
 * @param fn function
 * @return this
 */
Space.prototype.on = function(eventName, fn) {
  // We only create the events map when a listener is first set. Otherwise
  // there is no need for it.
  // StringMap<function[]> Event listeners
  if (!this._events)
    this._events = {}
  if (!this._events[eventName])
    this._events[eventName] = []
  this._events[eventName].push(fn)
  return this
}

Space.prototype._patch = function(patch) {
  if (!(patch instanceof Space))
    patch = new Space(patch)

  var me = this
  patch.each(function(property, patchValue) {
    // If patch value is a string, doesnt matter what property subject is.
    if (typeof patchValue === "string") {
      if (patchValue === "")
        me._delete(property)
      else
        me.set(property, patchValue, null, true)
      return true
    }

    // If patch value is an int, doesnt matter what property subject is.
    if (typeof patchValue === "number") {
      me.set(property, patchValue, null, true)
      return true
    }

    // If its an empty space, delete patch.
    if (patchValue instanceof Space && !patchValue.length) {
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
  this._patch(patch)
  // todo, do not trigger patch if no change
  return this.trigger("patch", patch).trigger("change")
}

/**
 * Remove the last item from the object and return the pair as a new space object.
 *
 * @return space
 */
Space.prototype.pop = function() {
  if (!this.length)
    return null

  var result = new Space()
  var property = this._getPropertyByIndex(-1)
  var value = this._getValueByProperty(property)

  result.set(property, value)
  this._deleteByIndex(this.length - 1)
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
  return this._getPropertyByIndex(this.indexOf(name) - 1)
}

/**
 * Push a value to the space object and set its property to this.length + 1
 *
 * @param value any
 * @return this
 */
Space.prototype.push = function(value) {
  var i = this.length

  while (this.get(i.toString())) {
    i++
  }
  this._setPair(i.toString(), value)
  return this
}

/**
 * Clear the content of the object and load the passed content.
 *
 * @param space|string
 * @return space this
 */
Space.prototype.reload = function(content) {
  // todo, do not trigger patch if no change
  this._clearProperties()
  this._values = []
  this._cache = {}
  this._load(content)
  this.trigger("reload")
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
 * Rename the first (or all) occurrence(s) of a property.
 *
 * @param oldName string
 * @param newName string
 * @param renameAll boolean Set to true to rename all occurrences of property.
 * @param recursive boolean Set to true to rename all occurrences of property recursively.
 * @return space this
 */
Space.prototype.rename = function(oldName, newName, renameAll, recursive) {
  if (renameAll)
    return this._renameAll(oldName, newName, recursive)
  this._rename(oldName, newName)
  if (oldName !== newName)
    this.trigger("rename", oldName, newName)
  this.trigger("change")
  return this
}

Space.prototype._renameAll = function(oldName, newName, recursive) {
  this.each(function (key, value, index) {
    if (key === oldName)
      this._setPair(newName, value, index, true)
    if (recursive && value instanceof Space)
      value._renameAll(oldName, newName, recursive)
  })
  return this
}

/**
 * Iterate through instance and if the value is a Space instance
 * rename its property to a value within that instance.
 *
 * For example:
 *
 * 0
 *  name John Doe
 *  email johndoe@email.com
 *
 * space.renameObjects("email")
 *
 * transforms this into:
 *
 * johndoe@email.com
 *  name John Doe
 *
 * @param string property
 * @return this
 */
Space.prototype.renameObjects = function (property) {
  this.each(function (prop, value, index) {
    if (!(value instanceof Space))
      return true
    var newKey = value.get(property)

    this._setProperty(index, newKey)
    value["delete"](property)
  })
  this._reindex()
  return this
}

/**
 * Treat the instance as a string and reload it after the replace operation.
 *
 * @param search string|regex Search string
 * @param replacement string Replacement string
 * @return this
 */
Space.prototype.replace = function (search, replacement) {
  return this.reload(this.toString().replace(search, replacement))
}

/**
 * Does a shallow reverse of the instance.
 *
 * @return space this
 */
Space.prototype.reverse = function () {
  this._reverseProperties()
  this._values.reverse()
  this._reindex()
  return this
}

/**
 * Set a property/value pair.
 *
 * @param property string Can be a spacePath
 * @param value any
 * @param index? int
 * @param noEvents? By default set triggers "set" and "change" events unless this is set to true.
 * @return space this
 */
Space.prototype.set = function(property, value, index, noEvents) {
  property = property.toString()
  if (Space._isSpacePath(property))
    this._setBySpacePath(property, value)
  else if (index)
    this._setPair(property, value, index)
  else if (this.has(property))
    this._setPair(property, value, this.indexOf(property), true)
  else
    this._setPair(property, value)

  if (!noEvents)
    this.trigger("set", property, value, index).trigger("change")
  return this
}

Space.prototype._sanitizeSpacePath = function(path) {
  return path.toString().replace(/\n/g, "").replace(/^ +/, "").replace(/  /g, "")
}

Space.prototype._setBySpacePath = function(path, value) {
  // Sanitize path
  path = path ? this._sanitizeSpacePath(path) : false

  if (!path)
    return null

  var generations = path.split(/ /g)
  var currentContext = this
  var currentPath
  var index
  var isLeaf
  var newValue
  var generationsLength = generations.length

  for (var i = 0; i < generationsLength; i++) {
    currentPath = generations[i]
    isLeaf = (i === (generations.length - 1))

    // If path is already set, continue
    if (!isLeaf && currentContext._getValueByProperty(currentPath) instanceof Space) {
      currentContext = currentContext.get(currentPath)
      continue
    }

    // Leaf
    newValue = isLeaf ? value : new Space()

    // update pair
    if (currentContext.has(currentPath)) {
      index = currentContext.indexOf(currentPath)
      currentContext._setPair(currentPath, newValue, index, true)
    } else
      currentContext._setPair(currentPath, newValue)
    currentContext = currentContext.get(currentPath)
  }
  return this
}

/**
 * @param property string
 * @param value string|space
 * @param index int
 * @param overwrite boolean
 * @return void
 */
Space.prototype._setPair = function(property, value, index, overwrite) {
  // Sanitize property
  // property = property.toString().replace(/( |\n)/g, "")
  property = property.toString()
  if (!property)
    return

  var length = this.length
  var isSpace = value instanceof Space
  var valueType = typeof value

  if (!isSpace && valueType === "object" && value) {
    value = new Space(value)
    isSpace = true
  }

  if (valueType !== "string" && valueType !== "number" && !isSpace)
    value = String(value)

  if (isSpace)
    value._parent = this

  if (index === undefined || index >= length) {
    // If index is not provided or invalid perform an append
    this._setProperty(length, property)
    this._values.push(value)

    // It's an append so we don't need to reindex the whole object so return early
    this._cache[property] = length
    return
  } else if (overwrite && index >= 0) {
    // Perform an update
    this._setProperty(index, property)
    this._values[index] = value
  } else {
    // Perform an insert
    this._insertProperty(index, property)
    this._values.splice(index, 0, value)
  }

  this._reindex(index)
}

Space.prototype._reindex = function(startAt) {
  var length = this.length
  var properties = this._getProperties()

  startAt = startAt || 0
  if (!startAt)
    this._cache = {}
  for (var i = startAt; i < length; i++) {
    this._cache[properties[i]] = i
  }
}

/**
 * Remove the top element from the object
 *
 * @return space The deleted value
 */
Space.prototype.shift = function() {
  if (!this.length)
    return null
  var property = this._getPropertyByIndex(0)
  var result = new Space()

  result.set(property, this.get(property))
  this._deleteByIndex(0)
  return result
}

/**
 * Sorts the instance using the passed comparison function.
 *
 * Pair Interface:
 * { property: string, value: any}
 *
 * @param fn (pairA: Pair, pairB: Pair) => <-1|0|1>
 * @return space this
 */
Space.prototype.sort = function(fn) {
  var sortable = []
  var properties = this._getProperties()
  var length = this.length

  for (var i = 0; i < length; i++) {
    sortable.push({property: properties[i], value: this._values[i], index: i})
  }

  sortable.sort(fn)

  this._clear()
  for (var i = 0; i < length; i++) {
    this._setPair(sortable[i].property, sortable[i].value)
  }
  return this
}

/**
 * Useful for sorting a collection of space objects.
 *
 * For example:
 *
 * john
 *  age 20
 * mary
 *  age 24
 *
 * space.sortBy("age")
 *
 * Performs a stable sort.
 *
 * @param property string Space path to sort on.
 * @param parseFn? (value: any) => any Function to run each value through before comparison.
 * @return space this
 */
Space.prototype.sortBy = function (property, parseFn) {
  // todo: if I had a reference to the parent object here, I could
  // create a stable sort
  // javascript sort is not necessarily stable
  this.sort(function(pairA, pairB) {
    var pairAIsSpace = pairA.value instanceof Space
    var pairBIsSpace = pairB.value instanceof Space

    if (!pairBIsSpace && !pairAIsSpace)
      return 0
    else if (!pairAIsSpace)
      return -1
    else if (!pairBIsSpace)
      return 1

    var av = pairA.value.get(property)
    var bv = pairB.value.get(property)

    if (parseFn) {
      av = parseFn(av)
      bv = parseFn(bv)
    }

    if (av === bv)
      return 0
    else if (av > bv)
      return 1
    return -1
  })
  return this
}

/**
 * Splits an object into an array of objects. Everytime the passed
 * property is encountered, a new object is created with that pair as the
 * first pair in the new object. The search begins on the first occurrence
 * of the passed delimiter. Any preceding items will be ignored.
 *
 * @param delimiter string
 * @param propertyName? If provided will return space object with each entry nested under this name.
 * @return array|space Of space objects or space object with nested entries
 */
Space.prototype.split = function(delimiter, propertyName) {
  var matches = propertyName ? new Space() : []
  var currentItem = null

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
  return this.getProperties().join(" ")
}

Space.prototype.toCsv = function() {
  return this.toDelimited(",")
}

/**
 * @param delimiter string
 * @param header? Array like ["name", "city", "state", "country", "income"]
 * @return string
 */
Space.prototype.toDelimited = function(delimiter, header) {
  var str = ""
  var regex = new RegExp("(\\n|\\\"|\\" + delimiter + ")")
  var escapeFunction = function (str) {
        // No escaping necessary
        if (!str.match(regex))
          return str

        // Surround the str with "" and replace any " with ""
        return "\"" + str.replace(/\"/g, "\"\"") + "\""
      }
  var rows = []
  var header = header || []
  var headerIndex = {}

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
 * @param property string|int|spacePath
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
  var str = "new Space(\"" + this.toString().replace(/\n/g, "\\n").replace(/\"/g, "\\\"") + "\")"

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
  var properties = this.getProperties()
  var isArray = properties.length > 0
  var next = 0

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
    else if (typeof value === "number" || value.match(/^[\-\.]?[0-9]+[0-9\.]*$/))
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
 * Note: native JS objects cannot have dupe keys while space instances can. It
 * may be prudent to use the isStringMap method to ensure you toObject returns what
 * you'd expect.
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
  var string = ""
  var first = ""

  this.each(function(property, value) {
    string += first + encodeURIComponent(property) + "=" + encodeURIComponent(value)
    first = "&"
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
Space.prototype.toString = function() {
  return this._toString(0)
}

Space.prototype._toString = function(spaces) {
  var string = ""
  var properties = this._getProperties()
  var length = this.length

  for (var i = 0; i < length; i++) {
    string += Space._pairToString(properties[i], this._values[i], spaces)
  }

  return string
}

/**
 * @return string
 */
Space.prototype.toTsv = function() {
  return this.toDelimited("\t")
}

/**
 * Returns instance as URI encoded string for use in URLs.
 *
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
  var xml = ""
  var spaces = spaceCount === -1 ? "" : Space._strRepeat(" ", spaceCount)

  this.each(function(property, value) {
    xml += spaces + "<" + property + ">"
    if (!(value instanceof Space))
      xml += value
    else if (value.length > 0)
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
  var xml = ""
  var spaces = spaceCount === -1 ? "" : Space._strRepeat(" ", spaceCount)
  var attributesStr = ""
  var contentStr = ""
  var children = this.get("children")

  this.each(function (prop, value) {
    if (prop === "children")
      return true
    if (value && value.replace)
      attributesStr += " " + prop + "=\"" + value.replace("\"", "\\\"") + "\""
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

/**
 * @param eventName string
 * @return this
 */
Space.prototype.trigger = function(eventName) {
  if (!this._events || !this._events[eventName])
    return this
  var args = Array.prototype.slice.call(arguments)

  for (var i in this._events[eventName]) {
    this._events[eventName][i].apply(this, args.slice(1))
  }
  return this
}

/**
 * Remove any property whose value is an empty string or empty
 *
 * @param recursive Whether to trim deep. Default is false.
 * @return this
 */
Space.prototype.trim = function(recursive) {
  var indexesToDelete = [] // int[]
  this.each(function (property, value, index) {
    if (value instanceof Space) {
      if (recursive)
        value.trim(recursive)
      if (value.length === 0)
        indexesToDelete.push(index)
    } else if (!value) {
      indexesToDelete.push(index)
    }
  })

  return this._deleteByIndexes(indexesToDelete)
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

// Export Space for use in Node.js
if (typeof exports !== "undefined")
  module.exports = Space;
