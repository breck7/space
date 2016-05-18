"use strict";

function Space(content) {
  this._load(content)
}

Space._setTokens = (lineChar, assignmentChar) => {
  Space._lineChar = lineChar || "\n"
  Space._lineRegex = new RegExp(Space._lineChar, "g")
  Space._assignmentChar = assignmentChar || " "
  Space._assignmentRegEx = new RegExp(Space._assignmentChar, "g")
}
Space._setTokens()

Space.version = "0.22.2"

Space._isSpacePath = property => property.indexOf(Space._assignmentChar) > -1

Space.fromHeredoc = (content, start, end) => {
  // Remove Windows newlines
  content = content.replace(/\r/g, "")

  const lines = content.split(Space._lineChar)
  const linesToDelete = []
  const startRegex = new RegExp("\^" + start + `(?:${Space._assignmentChar}|$)`)
  const linesLength = lines.length
  const startLength = start.length
  const endRegex = new RegExp("\^" + end)
  let startIndex = null

  for (let i = 0; i < linesLength; i++) {
    if (startIndex === null) {
      if (lines[i].match(startRegex)) {
        startIndex = i
        // Make sure the key starts with a " " so its value is treated as a multiline
        // string.
        if (lines[i].length === startLength)
          lines[i] = lines[i] + Space._assignmentChar
      } else
        continue
    } else if (lines[i].match(endRegex)) {
      startIndex = null
      linesToDelete.push(i)
    } else
      lines[i] = Space._assignmentChar + lines[i]
  }

  Space._removeItems(lines, linesToDelete)

  return new Space(lines.join(Space._lineChar))
}

Space.fromCsv = (str, hasHeaders) => {
  return Space.fromDelimiter(str, ",", hasHeaders)
}

Space.fromDelimiter = (str, delimiter, hasHeaders, sanitizeString, quoteChar) => {
  return Space._fromDelimiter(str, delimiter, hasHeaders, sanitizeString, quoteChar || `"`)
}

Space._fromDelimiter = (str, delimiter, hasHeaders, sanitizeString, quote) => {
  if (sanitizeString !== false && str.indexOf("\r") > -1)
    str = str.replace(/\r/g, "")

  const rows = [[]]
  const strHasQuotes = str.indexOf(quote) > -1
  const newLine = "\n"

  if (strHasQuotes) {
    const length = str.length
    let currentItem = ""
    let inQuote = str.substr(0, 1) === quote
    let currentPosition = inQuote ? 1 : 0
    let nextChar
    let isLastChar
    let currentRow = 0
    let c
    let isNextCharAQuote

    while (currentPosition < length) {
      c = str[currentPosition]
      isLastChar = currentPosition + 1 === length
      nextChar = str[currentPosition + 1]
      isNextCharAQuote = nextChar === quote

      if (inQuote) {
        if (c !== quote)
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
        else if (c === newLine) {
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
    const lines = str.split(newLine)
    const lineCount = lines.length
    for (let i = 0; i < lineCount; i++) {
      if (lines[i])
        rows[i] = lines[i].split(delimiter)
    }
  }

  const numberOfColumns = rows[0].length
  hasHeaders = hasHeaders === false ? false : true
  const headerRow = hasHeaders ? rows[0] : []

  if (hasHeaders) {
    // Strip any spaces from column names in the header row.
    // This makes the mapping not quite 1 to 1 if there are any spaces in prop names.
    for (let i = 0; i < numberOfColumns; i++) {
      headerRow[i] = headerRow[i].replace(Space._assignmentRegEx, "")
    }
  } else {
    // If str has no headers, create them as 0,1,2,3
    for (let i = 0; i < numberOfColumns; i++) {
      headerRow.push(i)
    }
  }

  // Immediately ditch ref to str for GC
  str = null

  const result = new Space()
  const resultProps = []
  const resultValues = []
  const headerIndex = {}

  const type = {
    properties: headerRow
  }

  const rowCount = rows.length
  let rowIndex = 0
  for (let i = (hasHeaders ? 1 : 0); i < rowCount; i++) {
    const obj = new Space()
    let row = rows[i]
    // If the row contains too many columns, shift the extra columns onto the last one.
    // This allows you to not have to escape delimiter characters in the final column.
    if (row.length > numberOfColumns) {
      row[numberOfColumns - 1] = row.slice(numberOfColumns - 1).join(delimiter)
      row = row.slice(0, numberOfColumns)
    } else if (row.length < numberOfColumns) {
      // If the row is missing columns add empty columns until it is full.
      // This allows you to make including delimiters for empty ending columns in each row optional.
      while (row.length < numberOfColumns) {
        row.push("")
      }
    }

    obj.setWithType(type, row)
    resultProps.push(rowIndex)
    resultValues.push(obj)
    rowIndex++
  }

  const collectionType = {
    properties: resultProps,
    index: resultProps  // In this case index is identical to array
  }
  result.setWithType(collectionType, resultValues)

  return result
}

Space.fromArrayWithHeader = rows => {
  if (!rows.length)
    return new Space()

  const length = rows.length
  const indexes = []
  const childrenArray = []
  const rowType = {
    properties: rows[0]
  }

  for (let i = 1; i < length; i++) {
    const obj = new Space()
    obj.setWithType(rowType, rows[i])

    childrenArray.push(obj)
    indexes.push(i - 1)
  }
  const collectionType = {
    properties: indexes,
    index: indexes
  }

  return new Space().setWithType(collectionType, childrenArray)
}

Space.fromSsv = (str, hasHeaders) => {
  return Space.fromDelimiter(str, " ", hasHeaders)
}

Space.fromTsv = (str, hasHeaders) => {
  return Space.fromDelimiter(str, "\t", hasHeaders)
}

Space.makeIndex = (properties, index, startAt) => {
  const length = properties.length
  index = index || {}
  startAt = startAt || 0

  for (let i = startAt || 0; i < length; i++) {
    index[properties[i]] = i
  }

  return index
}

Space._parseXml2 = str => {
  const el = document.createElement("div")
  el.innerHTML = str
  return el
}

Space._initializeXmlParser = () => {
  if (Space._parseXml)
    return
  const windowObj = window

  if (typeof windowObj.DOMParser !== "undefined")
    Space._parseXml = xmlStr => (new windowObj.DOMParser()).parseFromString(xmlStr, "text/xml")

  else if (typeof windowObj.ActiveXObject !== "undefined" && new windowObj.ActiveXObject("Microsoft.XMLDOM")) {
      Space._parseXml = xmlStr => {
          const xmlDoc = new windowObj.ActiveXObject("Microsoft.XMLDOM")
          xmlDoc.async = "false"
          xmlDoc.loadXML(xmlStr)
          return xmlDoc
      }
  }

  else
    throw new Error("No XML parser found")
}

Space.fromXml = str => {
  Space._initializeXmlParser()
  const xml = Space._parseXml(str)

  try {
    return Space._fromXml(xml).get("children")
  }
  catch (e) {
    return Space._fromXml(Space._parseXml2(str)).get("children")
  }

}

Space._fromXml = xml => {
  const result = new Space()
  const children = new Space()

  // Set attributes
  if (xml.attributes) {
    for (let a = 0; a < xml.attributes.length; a++) {
      result.set(xml.attributes[a].name, xml.attributes[a].value)
    }
  }

  if (xml.data)
    children.push(xml.data)

  // Set content
  if (xml.childNodes && xml.childNodes.length > 0) {
    for (let i = 0; i < xml.childNodes.length; i++) {
      const child = xml.childNodes[i]

      if (child.tagName && child.tagName.match(/parsererror/i))
        throw new Error("Parse Error")

      if (child.childNodes.length > 0 && child.tagName)
        children.append(child.tagName, Space._fromXml(child))
      else if (child.tagName)
        children.append(child.tagName, new Space())
      else if (child.data) {
        const data = child.data.trim()
        if (data)
          children.push(data)
      }
    }
  }

  if (children.length > 0)
    result.set("children", children)

  return result
}

Space._pairToString = (property, value, spaces) => {
  const ac = Space._assignmentChar
  const lc = Space._lineChar
  // Set up the property part of the property/value pair
  const string = Space._strRepeat(ac, spaces) + property

  // If the value is a space, concatenate it
  if (value instanceof Space)
    return string + lc + value._toString(spaces + 1)

  value = value.toString()

  // multiline string
  if (value.indexOf(lc) > -1)
    return string + ac + value.replace(Space._lineRegex, lc + Space._strRepeat(ac, spaces + 1)) + lc

  // Plain string
  return string + ac + value + lc
}

Space._removeItems = (array, indexes) => {
  const removedValues = []

  if (typeof indexes === "number")
    indexes = [indexes]

  for (let i = indexes.length - 1; i >= 0 ; i--)
    removedValues.push(array.splice(indexes[i], 1))

  return removedValues
}

Space._strRepeat = (string, count) => {
  let str = ""
  for (let i = 0; i < count; i++) {
    str += string
  }
  return str
}

Space.union = function () {
  const argumentsLength = arguments.length
  let union = Space._unionSingle(arguments[0], arguments[1])

  for (let i = 0; i < argumentsLength; i++) {
    if (i === 1) continue // skip the first one
    union = Space._unionSingle(union, arguments[i])
    if (!union.length)
      break
  }
  return union
}

Space._unionSingle = (spaceA, spaceB) => {
  const union = new Space()

  if (!(spaceB instanceof Space))
    return union

  spaceA.each((property, value) => {
    const spaceBValue = spaceB._getValueByProperty(property)
    if (value instanceof Space && spaceBValue && spaceBValue instanceof Space)
      union._setPair(property, Space._unionSingle(value, spaceB._getValueByProperty(property)))
    if (value === spaceBValue)
      union._setPair(property, value)
  })
  return union
}

Space.prototype.append = function(property, value) {
  this._setPair(property, value)
  return this
}

Space.prototype.at = function(index) {
  return this._getValueAt(index)
}

Space.prototype._clear = function() {
  delete this._properties
  delete this._values
  delete this._index
  delete this._type
  return this
}

Space.prototype.clear = function(space) {
  if (this.isEmpty())
    return this
  this._clear()
  if (space)
    this._load(space)
  return this
}

Space.prototype.clone = function() {
  return new Space(this.toString())
}

Space.prototype.concat = function(b) {
  if (typeof b === "string")
    b = new Space(b)
  const a = this
  b.each((property, value) => {
    a.append(property, value)
  })
  return this
}

Space.prototype.deleteDuplicates = function(recursive) {
  const matches = {} // StringMap<int>

  const me = this
  this.each((property, value, index) => {
    const isDupe = matches[property] !== undefined
    if (isDupe) {
      me._deleteByIndex(index)
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
  const values = this._getValues()
  if (values[index] === undefined)
    return 0

  this._deleteProperty(index)
  values.splice(index, 1)
  delete this._index
  return 1
}

Space.prototype._deleteByIndexes = function (indexesToDelete) {
  const length = indexesToDelete.length
  const values = this._getValues()

  for (let i = length - 1; i >= 0 ; i--) {
    this._deleteProperty(indexesToDelete[i])
    values.splice(indexesToDelete[i], 1)
  }

  delete this._index
  return this
}

Space.prototype._deleteByProperty = function(property) {
  const index = this.indexOf(property)
  return index === -1 ? 0 : this._deleteByIndex(index)
}

Space.prototype._deleteBySpacePath = function(spacePath) {
  // Get parent
  const parts = spacePath.split(Space._assignmentChar)
  const child = parts.pop()
  const parent = this.get(parts.join(Space._assignmentChar))

  return parent instanceof Space ? parent._delete(child) : 0
}

Space.prototype._deleteProperty = function(index) {
  this._dropType()
  return this._getProperties().splice(index, 1)
}

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

Space.prototype.decrement = function(path, amount) {
  return this.increment(path, amount || -1)
}

Space.prototype.deepLength = function() {
  let length = 0

  this.every(() => {
    length++
  })
  return length
}

Space.prototype["delete"] = function(property) {
  while (this._delete(property)) {
  }
  return this
}

Space.prototype.deleteAt = function(index) {
  let somethingChanged = false
  if (typeof index === "number")
    somethingChanged = this._deleteByIndex(index)
  else if (index && index.length)
    somethingChanged = this._deleteByIndexes(index)
  return this
}

Space.prototype.diff = function(space) {
  const diff = new Space()

  if (!(space instanceof Space))
    space = new Space(space)

  const me = this
  this.each((property, value) => {
    const spaceValue = space._getValueByProperty(property)

    // Case: Deleted
    if (spaceValue === undefined) {
      diff._setPair(property, "")
      return true
    }
    const thisValue = me._getValueByProperty(property)
    const typeofSpaceValue = typeof(spaceValue)
    const typeofThisValue = typeof(thisValue)

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
    const sub_diff = thisValue.diff(spaceValue)
    if (sub_diff.length)
      diff._setPair(property, sub_diff)
  })

  // Leftovers are Additions
  space.each((property, value) => {
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

Space.prototype.each = function(fn, deep, reverse) {
  const length = this.length
  const properties = this._getProperties()
  const values = this._getValues()

  if (!reverse) {
    for (let i = 0; i < length; i++) {
      if (deep && values[i] instanceof Space)
        values[i].each(fn, deep)
      if (fn.call(this, properties[i], values[i], i) === false)
        return this
    }
  } else {
    for (let i = length - 1; i >= 0; i--) {
      if (deep && values[i] instanceof Space)
        values[i].each(fn, deep)
      if (fn.call(this, properties[i], values[i], i) === false)
        return this
    }
  }
  return this
}

Space.prototype.every = function(fn) {
  this._every(fn)
  return this
}

Space.prototype._every = function(fn, leafsOnly) {
  let result = true

  this.each((property, value, index) => {
    const isSpace = value instanceof Space
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

Space.prototype.extract = function (properties) {
  const props = properties.split(Space._assignmentChar)
  const propKey = {}
  const matches = new Space()

  props.forEach(val => propKey[val] = true)

  this._extract(propKey, matches)
  return matches
}

Space.prototype._extract = function (propKey, matches) {
  this.each((property, value) => {
    if (propKey[property])
      matches.append(property, value)
    else if (value instanceof Space)
      value._extract(propKey, matches)
  })
}

Space.prototype.everyLeaf = function(fn) {
  this._every(fn, true)
  return this
}

Space.prototype.filter = function(fn, inPlace) {
  if (inPlace)
    return this._filterInPlace(fn)
  const result = new Space()
  const length = this.length
  const properties = this._getProperties()
  const values = this._getValues()

  for (let i = 0; i < length; i++) {
    if (fn.call(this, properties[i], values[i], i) === true)
      result.append(properties[i], values[i])
  }
  return result
}

Space.prototype._filterInPlace = function(fn) {
  this._dropType()
  const properties = this._getProperties()
  const values = this._getValues()

  for (let i = this.length - 1; i >= 0 ; i--) {
    if (fn.call(this, properties[i], values[i], i) !== true) {
      properties.splice(i, 1)
      values.splice(i, 1)
    }
  }

  delete this._index
  return this
}

Space.prototype.find = function(property, value) {
  // for now assume string test
  // search this one
  const matches = new Space()
  if (this.get(property) === value)
    matches.push(this)
  this.each((prop, val) => {
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

Space.prototype.flattenTypes = function () {
  const unionType = this.getUnionType()
  this.each((k, v) => {
    if (v instanceof Space)
      v.setType(unionType)
  })
  return this
}

Space.prototype.format = function(str) {
  const that = this
  return str.replace(/{([^\}]+)}/g, (match, path) => {
    const value = that.get(path)
    return value !== undefined ? value : ""
  })
}

Space.prototype.get = function(spacePath) {
  if (spacePath === undefined || spacePath === null)
    return undefined
  return this._getValueByString(spacePath.toString())
}

Space.prototype.getAll = function(query) {
  const matches = new Space()
  this.each((property, value) => {
    if (property !== query)
      return true
    matches.append(property, value)
  })
  return matches
}

Space.prototype.getArray = function(query, recursive) {
  const matches = []
  this._getArray(query, recursive === undefined ? true : recursive, matches)
  return matches
}

Space.prototype._getArray = function(query, recursive, matches) {
  this.each((property, value) => {
    if (property === query)
      matches.push(value)
    if (recursive && value instanceof Space)
      value._getArray(query, true, matches)
  })
}

Space.prototype.getColumn = function(path) {
  const arr = []
  this.each((k, v) => {
    if (v instanceof Space)
      arr.push(v.get(path))
  })
  return arr
}

Space.prototype.getIndex = function() {
  const parent = this.getParent()
  const that = this
  let index
  if (!parent)
    return -1
  parent.each((k, v, i) => {
    if (v === that) {
      index = i
      return false
    }
  })
  return index
}

Space.prototype.getParent = function() {
  return this._parent || null
}

Space.prototype.getPath = function() {
  let parent = this._parent
  let child = this
  let path = ""
  let first = ""

  while (parent) {
    parent.each((k, v) => {
      if (v === child) {
        path = k + first + path
        first = Space._assignmentChar
        return false
      }
    })
    child = parent
    parent = parent._parent
  }
  return path
}

Space.prototype.getRoot = function() {
  let parent = this._parent

  if (!parent)
    return this
  while (parent._parent) {
    parent = parent._parent
  }
  return parent || this
}

Space.prototype.getBySpace = function(query) {
  return this._getValueBySpace(query)
}

Space.prototype._getCachedValue = function(property) {
  return this._getValues()[this._getIndex()[property]]
}

Space.prototype._getValueAt = function(index) {
  // Passing -1 gets the last item, et cetera
  if (index < 0)
    index = this.length + index
  return this._getValues()[index]
}

Space.prototype._getValueByProperty = function(property) {
  return this._getCachedValue(property)
}

Space.prototype._getPropertyByIndex = function(index) {
  // Passing -1 gets the last item, et cetera
  const length = this.length

  if (index < 0)
    index = length + index
  if (index >= length)
    return undefined
  return this._getProperties()[index]
}

Space.prototype.getProperties = function() {
  return this._getProperties().slice(0)
}

Space.prototype.getType = function () {
  if (this._type)
    return this._type

  this._type = {properties: this._properties || []}
  this._type.index = Space.makeIndex(this._properties)

  delete this._properties
  delete this._index

  return this._type
}

Space.prototype.getTypeIndex = function() {
  const index = {}
  this.each((k, v, i) => {
    if (!(v instanceof Space))
      return true
    const type = v.getType()

    if (type.key === undefined)
      type.key = type.properties.join(Space._assignmentChar)

    const typeInIndex = index[type.key]

    // If it's not in the index yet add it
    if (!typeInIndex)
      index[type.key] = type
    // If it's a dupe remove the reference to the second occurrence
    else if (typeInIndex && (typeInIndex !== type))
      v._type = typeInIndex
  })
  return index
}

Space.prototype.getUnionType = function () {
  if (!this.length)
    return {properties: []}

  const typeIndex = this.getTypeIndex()
  const keys = Object.keys(typeIndex)
  // If there's only one type return that
  if (keys.length === 1)
    return typeIndex[keys[0]]

  const index = {}
  const props = []
  const type = {properties: props, index: index}

  // Remove dupes
  const properties = keys.join(Space._assignmentChar).split(Space._assignmentChar)
  const length = properties.length
  for (let i = 0; i < length; i++) {
    if (index[properties[i]] === undefined) {
      props.push(properties[i])
      index[properties[i]] = props.length
    }
  }

  return type
}

Space.prototype._getValueByString = function(spacePath) {
  const value = this._getValueByProperty(spacePath)

  if (value)
    return value

  if (value === "" || value === 0 || value === false)
    return value

  if (!Space._isSpacePath(spacePath))
    return undefined

  const parts = spacePath.split(Space._assignmentChar)
  const current = parts.shift()

  // Not set
  if (!this.has(current))
    return undefined

  const currentValue = this._getValueByProperty(current)

  if (currentValue instanceof Space)
    return this._getValueByProperty(current).get(parts.join(Space._assignmentChar))

  else
    return undefined
}

Space.prototype._getValueBySpace = function(space) {
  const result = new Space()
  const me = this

  space.each((property, v) => {
    const value = me._getValueByProperty(property)

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

Space.prototype._getValues = function() {
  if (!this._values)
    this._values = []
  return this._values
}

Space.prototype.getValues = function() {
  return this._getValues().slice(0)
}

Space.prototype.grab = function (properties) {
  const result = new Space()
  const that = this

  properties.forEach(prop => {
    const value = that.get(prop)
    if (value)
      result.set(prop, value)
  })

  return result
}

Space.prototype.group = function(path, fn) {
  if (typeof path === "string")
    path = [path]
  const result = new Space()
  const groups = {}
  this.each((k, v, i) => {
    if (!(v instanceof Space))
      return true
    const groupKey = v.grab(path)
    if (!groups[groupKey]) {
      groups[groupKey] = new Space()
      result.push(groups[groupKey])
    }
    if (fn)
      fn(groups[groupKey], v, k, i)
  })
  return result
}

Space.prototype.has = function(property) {
  return this._getIndex()[property] !== undefined
}

Space.prototype.increment = function(path, amount) {
  amount = amount || 1
  let value = this.get(path)
  if (value === undefined)
    value = 0

  this.set(path, parseFloat(value) + amount)
  return this
}

Space.prototype.indexOf = function(property, last) {
  if (!this.has(property))
    return -1

  const length = this.length
  const properties = this._getProperties()

  if (!last) {
    for (let i = 0; i < length; i++) {
      if (properties[i] === property)
        return i
    }
  } else {
    for (let i = length - 1; i >= 0; i--) {
      if (properties[i] === property)
        return i
    }
  }
  return -1
}

Space.prototype.insert = function(property, value, index) {
  this._setPair(property, value, index)
  return this
}

Space.prototype.isEmpty = function() {
  return this.length === 0
}

Space.prototype.isFlat = function() {
  const length = this.length
  const values = this._getValues()

  for (let i = 0; i < length; i++) {
    if (values[i] instanceof Space)
      return false
  }
  return true
}

Space.prototype.isStringMap = function(deep) {
  const length = this.length
  const map = {}
  const properties = this._getProperties()
  const values = this._getValues()
  let property
  let value

  for (let i = 0; i < length; i++) {
    property = properties[i]
    if (map[property])
      return false
    map[property] = true
    if (!deep)
      continue
    value = values[i]
    if (!(value instanceof Space))
      continue
    if (!value.isStringMap())
      return false
  }
  return true
}

Object.defineProperty(Space.prototype, "length", {
    get: function length() {
      return this._getValues().length
    }
})

Space.prototype._load = function(content, root) {
  if (!content)
    return this

  // Load from string
  if (typeof content === "string")
    return this._loadFromString(this._sanitizeString(content))

  // Load from Space object
  if (content instanceof Space) {
    const me = this
    content.each((property, value) => {
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
  for (let property in content) {
    if (!content.hasOwnProperty(property))
      continue
    // Todo: wrap the below line in a try/catch to handle errors thrown
    // in situations like new Space($("body")), as well at a levels param?
    this._loadPair(property, content[property], root)
  }

  return this
}

Space.prototype._loadPair = function(property, value, root) {
  const type = typeof value
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
  const startingDelimiters = new RegExp(`^(${Space._assignmentChar}|${Space._lineChar}|${Space._assignmentChar})*`)
  // Currently space always start on a property. Eliminate delimiters at beginning of string
  string = string.replace(startingDelimiters, "")

  /* Currently we eliminate Windows \r characters.*/
  string = string.replace(/\r/g, "")

  /** Currently we strip extra line chars */
  const extraLineChars = new RegExp(`${Space._lineChar}${Space._lineChar}+`, "g")
  string = string.replace(extraLineChars, Space._lineChar)

  return string
}

Space.prototype._loadFromString = function(string) {
  // Split string on line char but not line char followed by assignment char
  const lc = Space._lineChar
  const ac = Space._assignmentChar
  const reg = new RegExp(`${lc}(?!${ac})`, "g")
  const spaceRegex = new RegExp(`^([^${ac}]+)(${lc}|$)`)
  const leafRegex = new RegExp(`^([^${ac}]+)${ac}`)
  const lineAndAssignment = new RegExp(`${lc}${ac}`, "g")
  const lineAndAssignments = new RegExp(`^${lc}${ac}+`)
  const pairs = string.split(reg)
  const length = pairs.length

  for (let i = 0; i < length; i++) {
    let pair = pairs[i]
    let matches

    // Nested Space Node
    if (matches = pair.match(spaceRegex)) {
      this._setPair(matches[1], new Space()._loadFromString(
        pair.substr(matches[1].length)
            .replace(lineAndAssignment, lc)
            .replace(lineAndAssignments, lc)))
    }
    // Leaf Node
    else if (matches = pair.match(leafRegex)) {
      this._setPair(matches[1], pair.substr(matches[1].length + 1).replace(lineAndAssignment, lc))
    }
  }
  return this
}

Space.prototype._makeIndex = function(startAt) {
  if (!this._index || !startAt)
    this._index = {}
  return Space.makeIndex(this._getProperties(), this._index, startAt)
}

Space.prototype.map = function(propertiesFn, valuesFn, deep, inPlace) {
  if (!inPlace)
    return new Space(this).map(propertiesFn, valuesFn, deep)

  const length = this.length
  const values = this._getValues()
  let properties = this._getProperties()

  for (let i = 0; i < length; i++) {
    const oldName = properties[i]
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

Space.prototype.mergeDuplicates = function() {
  const matches = {}
  const indexesToDelete = []
  const me = this

  this.each((key, value, index) => {
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
  const newSpace = new Space()

  newSpace.set(property, this)
  return this.reload(newSpace.toString())
}

Space.prototype.next = function(property) {
  return this._getPropertyByIndex(this.indexOf(property) + 1)
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

  const me = this
  patch.each((property, patchValue) => {
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

Space.prototype.patch = function(patch) {
  return this._patch(patch)
}

Space.prototype.pop = function() {
  if (!this.length)
    return null

  const result = new Space()
  const property = this._getPropertyByIndex(-1)
  const value = this._getValueByProperty(property)

  result.set(property, value)
  this._deleteByIndex(this.length - 1)
  return result
}

Space.prototype.prepend = function(property, value) {
  return this._setPair(property, value, 0)
}

Space.prototype.prev = function(name) {
  return this._getPropertyByIndex(this.indexOf(name) - 1)
}

Space.prototype.propertyAt = function(index) {
  if (!this.length)
    return undefined
  // Passing -1 gets the last item, et cetera
  if (index < 0)
    index = this.length + index
  return this._getProperties()[index]
}

Space.prototype.push = function(value) {
  let i = this.length

  while (this.get(i.toString())) {
    i++
  }
  this._setPair(i.toString(), value)
  return this
}

Space.prototype.reload = function(content) {
  delete this._properties
  delete this._values
  delete this._index
  delete this._type
  this._load(content)
  return this
}

Space.prototype._rename = function(oldName, newName) {
  const index = this.indexOf(oldName)

  if (index === -1)
    return this
  this._setPair(newName, this._getValueByProperty(oldName), index, true)
  return this
}

Space.prototype.rename = function(oldName, newName, renameAll, recursive) {
  if (renameAll)
    return this._renameAll(oldName, newName, recursive)
  this._rename(oldName, newName)
  return this
}

Space.prototype._renameAll = function(oldName, newName, recursive) {
  this.each((key, value, index) => {
    if (key === oldName)
      this._setPair(newName, value, index, true)
    if (recursive && value instanceof Space)
      value._renameAll(oldName, newName, recursive)
  })
  return this
}

Space.prototype.renameObjects = function (property) {
  this.each((prop, value, index) => {
    if (!(value instanceof Space))
      return true
    const newKey = value.get(property)

    this._setProperty(index, newKey)
    value["delete"](property)
  })
  delete this._index
  return this
}

Space.prototype.replace = function (search, replacement) {
  return this.reload(this.toString().replace(search, replacement))
}

Space.prototype.reverse = function () {
  this._reverseProperties()
  this._getValues().reverse()
  delete this._index
  return this
}

/**
 * Set a property/value pair.
 *
 * @param property string Can be a spacePath
 * @param value any
 * @param index? int
 * @return space this
 */
Space.prototype.set = function(property, value, index) {
  property = property.toString()
  if (Space._isSpacePath(property))
    this._setBySpacePath(property, value)
  else if (index)
    this._setPair(property, value, index)
  else if (this.has(property))
    this._setPair(property, value, this.indexOf(property), true)
  else
    this._setPair(property, value)

  return this
}

Space.prototype.setType = function(type) {
  if (this._type === type)
    return this
  if (!this._values)
    return this.setWithType(type)

  const newProps = type.properties
  const newVals = []
  const that = this

  newProps.forEach(function (columnName) {
    newVals.push(that.get(columnName))
  })

  return this.setWithType(type, newVals)
}

Space.prototype._setBySpacePath = function(path, value) {
  const generations = path.replace(Space._lineRegex, "").split(Space._assignmentChar).filter(c => c.length > 0)
  const generationsLength = generations.length
  let currentContext = this
  let currentPath
  let index
  let isLeaf
  let newValue

  for (let i = 0; i < generationsLength; i++) {
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
  property = property.toString()
  if (!property)
    return

  const length = this.length
  const valueType = typeof value
  const values = this._getValues()
  let isSpace = value instanceof Space

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

Space.prototype.shift = function() {
  if (!this.length)
    return null
  const property = this._getPropertyByIndex(0)
  const result = new Space()

  result.set(property, this.get(property))
  this._deleteByIndex(0)
  return result
}

Space.prototype.sort = function(fn) {
  const sortable = []
  const properties = this._getProperties()
  const length = this.length
  const values = this._getValues()

  for (let i = 0; i < length; i++) {
    sortable.push({property: properties[i], value: values[i], index: i})
  }

  sortable.sort(fn)

  this._clear()
  for (let i = 0; i < length; i++) {
    this._setPair(sortable[i].property, sortable[i].value)
  }
  return this
}

Space.prototype.sortBy = function (propertyOrProps, parseFnOrFns) {
  propertyOrProps = propertyOrProps instanceof Array ? propertyOrProps : [propertyOrProps]
  parseFnOrFns = parseFnOrFns instanceof Array ? parseFnOrFns : [parseFnOrFns]

  const propertiesLength = propertyOrProps.length
  this.sort((pairA, pairB) => {
    const pairAIsSpace = pairA.value instanceof Space
    const pairBIsSpace = pairB.value instanceof Space

    if (!pairBIsSpace && !pairAIsSpace)
      return 0
    else if (!pairAIsSpace)
      return -1
    else if (!pairBIsSpace)
      return 1

    for (let i = 0; i < propertiesLength; i++) {
      const property = propertyOrProps[i]
      const parseFn = parseFnOrFns[i]

      let av = pairA.value.get(property)
      let bv = pairB.value.get(property)

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

Space.prototype.split = function(delimiter, propertyName) {
  const matches = propertyName ? new Space() : []
  let currentItem = null

  this.each((property, value) => {
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

Space.prototype.tableOfContents = function() {
  return this.getProperties().join(Space._assignmentChar)
}

Space.prototype.toCsv = function() {
  return this.toDelimited(",")
}

Space.prototype.toDelimited = function(delimiter, header) {
  const regex = new RegExp(`(\\n|\\"|\\${delimiter})`)
  const cellFn = (str, row, column) => {
        // No escaping necessary
        if (!str.match(regex))
          return str

        // Surround the str with "" and replace any " with ""
        return `"` + str.replace(/\"/g, `""`) + `"`
      }
  header = header || this.getUnionType().properties
  return this._toDelimited(delimiter, header, cellFn)
}

Space.prototype._toDelimited = function(delimiter, header, cellFn) {
  const rows = []

  // Build the header row
  let str = header.map((columnName, i) => cellFn(columnName, 0, i)).join(delimiter) + "\n"

  this.each((property, row, rowNumber) => {
    //  We expect value to be an instance of space
    if (!(row instanceof Space))
      return true

    let rowStr = header.map((columnName, i) =>
      cellFn( (row.get(columnName) || "").toString(), rowNumber + 1, i)
    ).join(delimiter)

    str += rowStr + "\n"
  })
  return str
}

Space.prototype.toArrayWithHeader = function (type) {
  if (!this.length)
    return []
  const values = this._getValues()
  if (!type) {
    // Get first type.
    this.each((k, v) => {
      type = v instanceof Space && v.getType()
      if (type)
        return false
    })
    if (!type)
      return []
  }

  const length = this.length
  const result = [type.properties]
  for (let i = 0; i < length; i++) {
    if (values[i]._type === type)
      result.push(values[i]._getValues())
  }
  return result
}

Space.prototype.toFixedWidth = function(maxWidth) {
  maxWidth = maxWidth || 100
  const header = this.getUnionType().properties
  const widths = header.map(col => col.length > maxWidth ? maxWidth : col.length)

  this.each((k, v) => {
    if (!(v instanceof Space))
      return true
    header.forEach((col, i) => {
      const cellValue = v.get(col)
      if (!cellValue)
        return true
      const length = cellValue.toString().length
      if (length > widths[i])
        widths[i] = length > maxWidth ? maxWidth : length
    })
  })
  const cellFn = (cellText, row, col) => {
    const width = widths[col]
    // Strip newlines in fixedWidth output
    const cellValue = cellText.toString().replace(/\n/g, "\\n")
    const cellLength = cellValue.length
    if (cellLength > width) {
      return cellValue.substr(0, width)
    }
    return Space._strRepeat(" ", width - cellLength) + cellValue
  }
  return this._toDelimited(" ", header, cellFn)
}

Space.prototype.toggle = function(property, value1, value2) {
  const current = this.get(property)

  if (current === value1) {
    if (value2 === undefined)
      this.delete(property)
    else
      this.set(property, value2)
  }
  else
    this.set(property, value1)
  return this
}

Space.prototype.toJavascript = function(backticks) {
  if (backticks)
    return `new Space(\`${this.toString().replace(/\`/g, "\\`")}\`)`

  return `new Space("${this.toString().replace(/\"/g, `\\"`).replace(/\n/g, "\\n")}")`
}

Space.prototype.toJSON = function(guessTypes, pretty) {
  return JSON.stringify(this.toObject(guessTypes), null, pretty ? " " : null)
}

Space.prototype._toObjectWithTypes = function() {
  const properties = this.getProperties()
  let convertToArray = properties.length > 0
  let next = 0

  properties.forEach(v => {
    if (v !== next.toString())
      convertToArray = false
    next++
  })

  const obj = convertToArray ? [] : {}

  this.each((property, value) => {
    let v
    if (value instanceof Space)
      v = value._toObjectWithTypes()
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

    if (convertToArray)
      obj.push(v)
    else
      obj[property] = v
  })
  return obj
}

Space.prototype.toObject = function(guessTypes) {
  if (guessTypes)
    return this._toObjectWithTypes()

  const obj = {}
  this.each((property, value) => {
    if (value instanceof Space)
      obj[property] = value.toObject()
    else
      obj[property] = value
  })
  return obj
}

Space.prototype.toQueryString = function() {
  let string = ""
  let first = ""

  this.each((property, value) => {
    string += first + encodeURIComponent(property) + "=" + encodeURIComponent(value)
    first = "&"
  })
  return string
}

Space.prototype.toSsv = function() {
  return this.toDelimited(" ")
}

Space.prototype.toString = function() {
  return this._toString(0)
}

Space.prototype._toString = function(spaces) {
  const properties = this._getProperties()
  const length = this.length
  const values = this._getValues()
  let string = ""

  for (let i = 0; i < length; i++) {
    string += Space._pairToString(properties[i], values[i], spaces)
  }

  return string
}

Space.prototype.toTsv = function() {
  return this.toDelimited("\t")
}

Space.prototype.toURL = function() {
  return encodeURIComponent(this.toString())
}

Space.prototype.toXML = function(pretty) {
  return this._toXML(pretty ? 0 : -1)
}

Space.prototype._toXML = function(spaceCount) {
  const spaces = spaceCount === -1 ? "" : Space._strRepeat(" ", spaceCount)
  let xml = ""

  this.each((property, value) => {
    xml += spaces + "<" + property + ">"
    if (!(value instanceof Space))
      xml += value
    else if (value.length > 0)
      xml += (spaceCount === -1 ? "" : "\n") + value._toXML(spaceCount > -1 ? spaceCount + 2 : -1) + spaces

    xml += "</" + property + ">" + (spaceCount === -1 ? "" : "\n")
  })
  return xml
}

Space.prototype.toXMLWithAttributes = function(pretty) {
  return this.at(0)._toXMLWithAttributes(this.propertyAt(0), pretty ? 0 : -1)
}

Space.prototype._toXMLWithAttributes = function(property, spaceCount) {
  const spaces = spaceCount === -1 ? "" : Space._strRepeat(" ", spaceCount)
  const children = this.get("children")
  let xml = ""
  let attributesStr = ""
  let contentStr = ""

  this.each((prop, value) => {
    if (prop === "children")
      return true
    if (value && value.replace)
      attributesStr += " " + prop + "=\"" + value.replace("\"", "\\\"") + "\""
    else
      attributesStr += " " + prop
  })

  if (children) {
    children.each((prop, value) => {
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

Space.prototype.trim = function(recursive) {
  const indexesToDelete = [] // int[]
  this.each((property, value, index) => {
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

Space.prototype.update = function(index, property, value) {
  this._setPair(property, value, index, true)
  return this
}

Space.prototype.valueAt = function(index) {
  return this.at(index)
}

// Export Space for use in Node.js
if (typeof exports !== "undefined")
  module.exports = Space;
