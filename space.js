/**
 * @param content any
 * @return space
 */
function Space(content) {
  return this._load(content)
}

Space.version = "0.19.11"

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
 * @param hasHeaders? boolean Default is true.
 * @param sanitizeString? boolean Whether to strip carriage returns
 * @return space
 */
Space.fromDelimiter = function (str, delimiter, hasHeaders, sanitizeString) {
  if (sanitizeString !== false && str.indexOf("\r") > -1)
    str = str.replace(/\r/g, "")

  var rows = [[]]
  var strHasQuotes = str.indexOf("\"") > -1

  if (strHasQuotes) {
    var length = str.length
    var currentItem = ""
    var inQuote = str.substr(0, 1) === "\""
    var currentPosition = inQuote ? 1 : 0
    var nextChar
    var isLastChar
    var currentRow = 0
    var c
    var nextCharIsQuote

    while (currentPosition < length) {
      c = str[currentPosition]
      isLastChar = currentPosition + 1 === length
      nextChar = str[currentPosition + 1]
      isNextCharAQuote = nextChar === "\""

      if (inQuote) {
        if (c !== "\"")
          currentItem += c
        // Both the current and next char are ", so the " is escaped
        else if (isNextCharAQuote) {
          currentItem += nextChar
          currentPosition++ // Jump 2
        }
        // If the current char is a " and the next char is not, it's the end of the quotes
        else {
          inQuote = false
          if (isLastChar)
            rows[currentRow].push(currentItem)
        }
      } else {
        if (c === delimiter) {
          rows[currentRow].push(currentItem)
          currentItem = ""
          if (isNextCharAQuote) {
            inQuote = true
            currentPosition++ // Jump 2
          }
        }
        else if (c === "\n") {
          rows[currentRow].push(currentItem)
          currentItem = ""
          currentRow++
          if (nextChar)
            rows[currentRow] = []
          if (isNextCharAQuote) {
            inQuote = true
            currentPosition++ // Jump 2
          }
        }
        else if (isLastChar)
          rows[currentRow].push(currentItem + c)
        else
          currentItem += c
      }
      currentPosition++
    }
  } else {
    var lines = str.split(/\n/g)
    var lineCount = lines.length
    for (var i = 0; i < lineCount; i++) {
      if (lines[i])
        rows[i] = lines[i].split(delimiter)
    }
  }

  var headerRow = rows[0]
  var numberOfColumns = headerRow.length
  hasHeaders = hasHeaders === false ? false : true

  if (hasHeaders) {
    // Strip any spaces from column names in the header row.
    // This makes the mapping not quite 1 to 1 if there are any spaces in prop names.
    for (var i = 0; i < numberOfColumns; i++) {
      headerRow[i] = headerRow[i].replace(/ /g, "")
    }
  } else {
    // If str has no headers, create them as 0,1,2,3
    headerRow = []
    for (var i = 0; i < numberOfColumns; i++) {
      headerRow.push(i)
    }
  }

  // Immediately ditch ref to str for GC
  str = null

  var result = new Space()
  var resultProps = []
  var resultValues = []
  var headerIndex = {}

  var type = {}
  type.properties = headerRow

  var rowCount = rows.length
  var rowIndex = 0
  for (var i = (hasHeaders ? 1 : 0); i < rowCount; i++) {
    var obj = new Space()

    obj.setWithType(type, rows[i])
    resultProps.push(rowIndex)
    resultValues.push(obj)
    rowIndex++
  }

  var collectionType = {}
  collectionType.properties = resultProps
  collectionType.index = resultProps // In this case index is identical to array
  result.setWithType(collectionType, resultValues)

  return result
}

/**
 * Initialize a space object from a Javascript array with a header like:
 *
 * [["name", "number"],
 *  ["breck", "17"]]
 *
 * @param rows (string|int[])[]
 * @return space
 */
Space.fromArrayWithHeader = function (rows) {
  if (!rows.length)
    return new Space()

  var length = rows.length
  var indexes = []
  var childrenArray = []
  var rowType = {}
  rowType.properties = rows[0]

  for (var i = 1; i < length; i++) {
    var obj = new Space()
    obj.setWithType(rowType, rows[i])

    childrenArray.push(obj)
    indexes.push(i - 1)
  }
  var collectionType = {}
  collectionType.properties = indexes
  collectionType.index = indexes

  return new Space().setWithType(collectionType, childrenArray)
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

/**
 * Iterates over an array of strings
 *
 * @param properties string[] Array of properties to build index from
 * @param index? Optional existing object to use for index
 * @param startAt? int Optionally only (re)index part of the array.
 * @return StringMap<int> For example: {name: 0, age: 1}
 */
Space.makeIndex = function (properties, index, startAt) {
  var length = properties.length
  index = index || {}
  startAt = startAt || 0

  for (var i = startAt || 0; i < length; i++) {
    index[properties[i]] = i
  }

  return index
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

Space.prototype._append = function(property, value) {
  this._setPair(property, value)
}

/**
 * Add a property & value to the bottom of the space object.
 *
 * @param property string
 * @param value any
 * @return space this
 */
Space.prototype.append = function(property, value) {
  this._append(property, value)
  return this.trigger("append", property, value).trigger("change")
}

/**
 * Return the value at a position.
 *
 * @param index int
 * @return string|space|undefined
 */
Space.prototype.at = function(index) {
  return this._getValueAt(index)
}

/**
 * Deletes all data.
 *
 * @return space this
 */
Space.prototype._clear = function() {
  delete this._properties
  delete this._values
  delete this._index
  delete this._type
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
  if (Space._isSpacePath(property))
    return this._deleteBySpacePath(property)
  else
    return this._deleteByProperty(property)
}

Space.prototype._deleteByIndex = function(index) {
  var values = this._getValues()
  if (values[index] === undefined)
    return 0

  this._deleteProperty(index)
  values.splice(index, 1)
  delete this._index
  return 1
}

Space.prototype._deleteByIndexes = function (indexesToDelete) {
  var length = indexesToDelete.length
  var values = this._getValues()

  for (var i = length - 1; i >= 0 ; i--) {
    this._deleteProperty(indexesToDelete[i])
    values.splice(indexesToDelete[i], 1)
  }

  delete this._index
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
  this._dropType()
  return this._getProperties().splice(index, 1)
}

// this._type allows for more efficient storing of identical types
Space.prototype._dropType = function() {
  if (!this._type)
    return;
  this._properties = this._type.properties.slice()
  delete this._type
}

Space.prototype._getProperties = function() {
  if (this._type)
    return this._type.properties
  if (!this._properties)
    this._properties = []
  return this._properties
}

Space.prototype._insertProperty = function (index, property) {
  this._dropType()
  this._getProperties().splice(index, 0, property)
}

Space.prototype._setProperty = function(index, property) {
  this._dropType()
  this._getProperties()[index] = property
  return this._getProperties()
}

Space.prototype._reverseProperties = function() {
  this._dropType()
  this._getProperties().reverse()
}

/**
 * Decreases the count of path by 1 or by a custom amount.
 *
 * @param path string
 * @param amount? number Defaults to -1
 * @return this
 */
Space.prototype.decrement = function(path, amount) {
  return this.increment(path, amount || -1)
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
 * Deletes a pair(s) from the instance.
 *
 * Deletes all matching pairs.
 *
 * @param property string|spacePath
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
 * Deletes a pair(s) from the instance at the passed index.
 *
 * If passed an array, deletes all items in that array.
 *
 * @param index int|int[]
 * @return space this
 */
Space.prototype.deleteAt = function(index) {
  var somethingChanged = false
  if (typeof index === "number")
    somethingChanged = this._deleteByIndex(index)
  else if (index && index.length)
    somethingChanged = this._deleteByIndexes(index)
  return somethingChanged ? this.trigger("delete", index).trigger("change") : this
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
  var values = this._getValues()

  if (!reverse) {
    for (var i = 0; i < length; i++) {
      if (deep && values[i] instanceof Space)
        values[i].each(fn, deep)
      if (fn.call(this, properties[i], values[i], i) === false)
        return this
    }
  } else {
    for (var i = length - 1; i >= 0; i--) {
      if (deep && values[i] instanceof Space)
        values[i].each(fn, deep)
      if (fn.call(this, properties[i], values[i], i) === false)
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
 * Returns a space object with only the pairs that return true when
 * passed to the supplied filter function. Returns new object unless inPlace param is true.
 *
 * @param fn function
 * @param inPlace? boolean Default is false. Pass true to edit this instance.
 * @return space
 */
Space.prototype.filter = function(fn, inPlace) {
  if (inPlace)
    return this._filterInPlace(fn)
  var result = new Space()
  var length = this.length
  var properties = this._getProperties()
  var values = this._getValues()

  for (var i = 0; i < length; i++) {
    if (fn.call(this, properties[i], values[i], i) === true)
      result._append(properties[i], values[i])
  }
  return result
}

Space.prototype._filterInPlace = function(fn) {
  this._dropType()
  var properties = this._getProperties()
  var values = this._getValues()

  for (var i = this.length - 1; i >= 0 ; i--) {
    if (fn.call(this, properties[i], values[i], i) !== true) {
      properties.splice(i, 1)
      values.splice(i, 1)
    }
  }

  delete this._index
  return this
}

/**
 * Does a recursive search and returns a numbered space instance containing
 * instances where instance.get(property) === value
 *
 * @param property string|int
 * @param value string|int
 * @return space A new ordered space instance containing matching instances by reference.
 */
Space.prototype.find = function(property, value) {
  // for now assume string test
  // search this one
  var matches = new Space()
  if (this.get(property) === value)
    matches.push(this)
  this.each(function(prop, val) {
    if (!(val instanceof Space))
      return true
    val
      .find(property, value)
      .each(function(k, v) {
        matches.push(v)
      })
  })
  return matches
}

/**
 * Set all child instances to the union type.
 *
 * @return space this
 */
Space.prototype.flattenTypes = function () {
  var unionType = this.getUnionType()
  this.each(function (k, v) {
    if (v instanceof Space)
      v.setType(unionType)
  })
  return this
}

/**
 * Fills out the passed string with values from the current instance.
 *
 * @param str string
 * @return string
 */
Space.prototype.format = function(str) {
  var that = this
  return str.replace(/{([^\}]+)}/g, function(match, path) {
    var value = that.get(path)
    return value !== undefined ? value : ""
  })
}

/**
 * Returns the value stored at the passed path. If there are multiple matches
 * returns the last match. If there are no matches returns undefined.
 *
 * todo: don't handle non string inputs or handle them differently.
 *
 * @param spacePath string
 * @return string|space|undefined
 */
Space.prototype.get = function(spacePath) {
  if (spacePath === undefined || spacePath === null)
    return undefined
  return this._getValueByString(spacePath.toString())
}

/**
 * Get all pairs with a matching property as a space object.
 *
 * @param query? string|int|space
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
 * @param query string|int|space
 * @param recursive? Whether to do a recursive search. Default is true
 * @return array
 */
Space.prototype.getArray = function(query, recursive) {
  var matches = []
  this._getArray(query, recursive === undefined ? true : recursive, matches)
  return matches
}

Space.prototype._getArray = function(query, recursive, matches) {
  this.each(function(property, value) {
    if (property === query)
      matches.push(value)
    if (recursive && value instanceof Space)
      value._getArray(query, true, matches)
  })
}

/**
 * Iterates over the space objects in the instance and for each gets the passed
 * path and returns an array with the results.
 *
 * @param path string
 * @return any[]
 */
Space.prototype.getColumn = function(path) {
  var arr = []
  this.each(function (k, v) {
    if (v instanceof Space)
      arr.push(v.get(path))
  })
  return arr
}

/**
 * @return int Returns index of this object in its parent or -1 if it's a root object.
 */
Space.prototype.getIndex = function() {
  var parent = this.getParent()
  var that = this
  var index
  if (!parent)
    return -1
  parent.each(function (k, v, i) {
    if (v === that) {
      index = i
      return false
    }
  })
  return index
}

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
  return this._getValues()[this._getIndex()[property]]
}

/**
 * @param int
 * @return The matching value
 */
Space.prototype._getValueAt = function(index) {
  // Passing -1 gets the last item, et cetera
  if (index < 0)
    index = this.length + index
  return this._getValues()[index]
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
 * Gets the type for an instance. If not set, will initialize it.
 *
 * @return Type
 */
Space.prototype.getType = function () {
  if (this._type)
    return this._type

  this._type = {properties: this._properties || []}
  this._type.index = Space.makeIndex(this._properties)

  delete this._properties
  delete this._index

  return this._type
}

/**
 * Returns a StringMap of all types in this instance.
 *
 * Example return value: {"name age": Type, "color height weight" : Type}
 *
 * This method also sets a type on every instance and removes individual property
 * arrays and caches as it goes, freeing up memory.
 *
 * @return StringMap<Type>
 */
Space.prototype.getTypeIndex = function() {
  var index = {}
  this.each(function (k, v, i) {
    if (!(v instanceof Space))
      return true
    var type = v.getType()

    if (type.key === undefined)
      type.key = type.properties.join(" ")

    var typeInIndex = index[type.key]

    // If it's not in the index yet add it
    if (!typeInIndex)
      index[type.key] = type
    // If it's a dupe remove the reference to the second occurrence
    else if (typeInIndex && (typeInIndex !== type))
      v._type = typeInIndex
  })
  return index
}

/**
 * Return a Type that is a union of all child types.
 *
 * Note: treats all sub types as a set, so order is not necessarily respected and
 * properties occur only once.
 *
 * @return type
 */
Space.prototype.getUnionType = function () {
  if (!this.length)
    return {properties: []}

  var typeIndex = this.getTypeIndex()
  var keys = Object.keys(typeIndex)
  // If there's only one type return that
  if (keys.length === 1)
    return typeIndex[keys[0]]

  var index = {}
  var props = []
  var type = {properties: props, index: index}

  // Remove dupes
  var properties = keys.join(" ").split(/ /g)
  var length = properties.length
  for (var i = 0; i < length; i++) {
    if (index[properties[i]] === undefined) {
      props.push(properties[i])
      index[properties[i]] = props.length
    }
  }

  return type
}

/**
 * Search the space for a given path (spacePath).
 *
 * @param spacePath string
 * @return any The matching value
 */
Space.prototype._getValueByString = function(spacePath) {
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

Space.prototype._getIndex = function() {
  // StringMap<int> {property: index}
  // When there are multiple values with the same property, _index stores the last value.
  return (this._type && this._type.index) || this._index || this._makeIndex()
}

/**
 * @return any[]
 */
Space.prototype._getValues = function() {
  if (!this._values)
    this._values = []
  return this._values
}

/**
 * Returns a shallow array of all the values.
 *
 * @return any[]
 */
Space.prototype.getValues = function() {
  return this._getValues().slice(0)
}

/**
 * Grab multiple properties from the instance and return a new space instance containing
 * just the desired properties.
 *
 * @param string[] Array of properties to grab. i.e. ["date", "name", "pageviews"]
 * @return space
 */
Space.prototype.grab = function (properties) {
  var result = new Space()
  var that = this

  properties.forEach(function (prop) {
    var value = that.get(prop)
    if (value)
      result.set(prop, value)
  })

  return result
}

/**
 * A method for reducing a collection into groups.
 *
 * Returns a new collection of one instance for each unique value of "path".
 *
 * The passed callback will get called for each child instance. The first parameter
 * to callback is the result group.
 *
 * @param path string|string[]
 * @param fn? (group?: space, member?: space, memberKey?: string, memberIndex?: int):void
 * @return space
 */
Space.prototype.group = function(path, fn) {
  if (typeof path === "string")
    path = [path]
  var result = new Space()
  var groups = {}
  this.each(function (k, v, i) {
    if (!(v instanceof Space))
      return true
    var groupKey = v.grab(path)
    if (!groups[groupKey]) {
      groups[groupKey] = new Space()
      result.push(groups[groupKey])
    }
    if (fn)
      fn(groups[groupKey], v, k, i)
  })
  return result
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
  return this._getIndex()[property] !== undefined
}

/**
 * Increases the count of path by 1 or by a custom amount.
 *
 * @param path string
 * @param amount? number Defaults to 1
 * @return this
 */
Space.prototype.increment = function(path, amount) {
  amount = amount || 1
  var value = this.get(path)
  if (value === undefined)
    value = 0

  this.set(path, parseFloat(value) + amount)
  return this
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
  var values = this._getValues()

  for (var i = 0; i < length; i++) {
    if (values[i] instanceof Space)
      return false
  }
  return true
}

/**
 * Check whether the object has only unique properties (is a set).
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
  var values = this._getValues()

  for (var i = 0; i < length; i++) {
    property = properties[i]
    if (map[property])
      return false
    map[property] = true
    if (!deep)
      continue
    value = values[i]
    if ((!value instanceof Space))
      continue
    if (!value.isStringMap())
      return false
  }
  return true
}

/**
 * @return int
 */
Object.defineProperty(Space.prototype, "length", {
    get: function length() {
      return this._getValues().length
    }
})

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
    return this._loadFromString(this._sanitizeString(content))

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

Space.prototype._sanitizeString = function(string) {
  // Space always start on a property. Eliminate whitespace at beginning of string
  string = string.replace(/^\s*/, "")

  /* Eliminate Windows \r characters.*/
  string = string.replace(/\r/g, "")

  /** Space does not have useless lines*/
  string = string.replace(/\n\n+/g, "\n")

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

Space.prototype._makeIndex = function(startAt) {
  if (!this._index || !startAt)
    this._index = {}
  return Space.makeIndex(this._getProperties(), this._index, startAt)
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
  var values = this._getValues()

  for (var i = 0; i < length; i++) {
    var oldName = properties[i]
    if (propertiesFn)
      properties = this._setProperty(i, propertiesFn(oldName))
    if (deep && values[i] instanceof Space)
      values[i].map(propertiesFn, valuesFn, deep, inPlace)
    else if (valuesFn)
      values[i] = valuesFn(values[i], properties[i], oldName)
  }
  delete this._index
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
        me.at(matches[key]).set(k, v)
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

/**
 * Return the property/value pair at passed index as a space object.
 *
 * @param index int
 * @return space
 */
Space.prototype.pairAt = function(index) {
  if (!this.length)
    return new Space()
  return new Space().set(this.propertyAt(index), this.at(index))
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
 * Returns property at passed position
 *
 * @param index int
 * @return string|undefined
 */
Space.prototype.propertyAt = function(index) {
  if (!this.length)
    return undefined
  // Passing -1 gets the last item, et cetera
  if (index < 0)
    index = this.length + index
  return this._getProperties()[index]
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
  delete this._properties
  delete this._values
  delete this._index
  delete this._type
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
  delete this._index
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
  this._getValues().reverse()
  delete this._index
  return this
}

Space.prototype._sanitizeSpacePath = function(path) {
  return path.toString().replace(/\n/g, "").replace(/^ +/, "").replace(/  /g, "")
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

/**
 * Changes the type of the instance
 *
 * @param type type
 * @return this
 */
Space.prototype.setType = function(type) {
  if (this._type === type)
    return this
  if (!this._values)
    return this.setWithType(type)

  var newProps = type.properties
  var newVals = []
  var that = this

  newProps.forEach(function (columnName) {
    newVals.push(that.get(columnName))
  })

  return this.setWithType(type, newVals)
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
  var values = this._getValues()

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
    values.push(value)

    // If we have a cache this is an append so update the cache with minimal work
    if (this._index)
      this._index[property] = length
    return
  } else if (overwrite && index >= 0) {
    // Perform an update
    this._setProperty(index, property)
    values[index] = value
  } else {
    // Perform an insert
    this._insertProperty(index, property)
    values.splice(index, 0, value)
  }

  // If we have a cache update it with minimal work
  if (this._index)
    this._makeIndex(index)
}

/**
 * A faster and more memory efficient way to set values on an instance.
 *
 * Note that type is getting set by reference so if type changes this
 * instance will be affected. Usually negatively :). Use with caution.
 *
 * @param type {properties: string[], index?: StringMap<int>}
 * @param values any[]
 * @return space this
 */
Space.prototype.setWithType = function (type, values) {
  // Clear first if this is not a new object.
  if (this._values)
    this._clear()

  // If index is not provided initialize it
  if (!type.index)
    type.index = Space.makeIndex(type.properties)

  this._type = type
  this._values = values
  return this
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
  var values = this._getValues()

  for (var i = 0; i < length; i++) {
    sortable.push({property: properties[i], value: values[i], index: i})
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
 * @param propertyOrProps string|string[] Space path to sort on.
 * @param parseFnOrFns? (value: any)=>any|(value: any)=>any[] Function to run each value through before comparison.
 * @return space this
 */
Space.prototype.sortBy = function (propertyOrProps, parseFnOrFns) {
  propertyOrProps = propertyOrProps instanceof Array ? propertyOrProps : [propertyOrProps]
  parseFnOrFns = parseFnOrFns instanceof Array ? parseFnOrFns : [parseFnOrFns]

  var propertiesLength = propertyOrProps.length
  this.sort(function(pairA, pairB) {
    var pairAIsSpace = pairA.value instanceof Space
    var pairBIsSpace = pairB.value instanceof Space

    if (!pairBIsSpace && !pairAIsSpace)
      return 0
    else if (!pairAIsSpace)
      return -1
    else if (!pairBIsSpace)
      return 1

    for (i = 0; i < propertiesLength; i++) {
      var property = propertyOrProps[i]
      var parseFn = parseFnOrFns[i]

      var av = pairA.value.get(property)
      var bv = pairB.value.get(property)

      if (parseFn) {
        av = parseFn(av)
        bv = parseFn(bv)
      }

      if (av > bv)
        return 1
      else if (av < bv)
        return -1
    }
    return 0
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
        if (!str.match(regex)) return str

        // Surround the str with "" and replace any " with ""
        return "\"" + str.replace(/\"/g, "\"\"") + "\""
      }
  var rows = []
  var header = header || this.getUnionType().properties

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
 * Return this instance as a JS array in the shape of a CSV file.
 *
 * @param type? Type to get the header for. If not passed the first type will be used.
 * @return (string|int[])[]
 */
Space.prototype.toArrayWithHeader = function (type) {
  if (!this.length)
    return []
  var values = this._getValues()
  if (!type) {
    // Get first type.
    this.each(function (k, v) {
      type = v instanceof Space && v.getType()
      if (type)
        return false
    })
    if (!type)
      return []
  }

  var length = this.length
  var result = [type.properties]
  for (var i = 0; i < length; i++) {
    if (values[i]._type === type)
      result.push(values[i]._getValues())
  }
  return result
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
  var values = this._getValues()

  for (var i = 0; i < length; i++) {
    string += Space._pairToString(properties[i], values[i], spaces)
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
  return this.at(0)._toXMLWithAttributes(this.propertyAt(0), pretty ? 0 : -1)
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

/**
 * Alias of "at"
 *
 * @param index int
 * @return string|space|undefined
 */
Space.prototype.valueAt = function(index) {
  return this.at(index)
}

// Export Space for use in Node.js
if (typeof exports !== "undefined")
  module.exports = Space;
