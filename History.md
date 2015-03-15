0.11.1 / 2015-03-15
===================
- Added reverse method

0.11.0 / 2015-03-15
===================
- 20% mem perf improvement by creating less arrays.
- BREAKING CHANGE: Sort method now passes a and b as {property:string,value:any}, not [string, any]

0.10.5 / 2015-03-15
===================
- Added deep param to each
- Fixed reference bug when initializing new instances from other instances

0.10.4 / 2015-03-15
===================
- Made events a getter and now only initialize the events object when needed to save mem. About 5% mem improvement and significantly less objects created on heap.

0.10.3 / 2015-03-15
===================
- Added hasHeaders param to from delimited methods

0.10.2 / 2015-03-12
===================
- Added trim() method to remove empty properties
- Fixed bug in toString method which printed empty lines for null or undefined values

0.10.1 / 2015-03-08
===================
- BREAKING CHANGE: get(property: string) now returns the **last** matching pair and not the first.
- Minor code cleanup and additional tests.

0.9.9 / 2015-03-08
==================
- Code pruning and cleanup. Removed methods marked "experimental" and removes spacefs.

0.9.8 / 2015-02-25
==================
- Bug fix in the load2 parsing algo

0.9.7 / 2015-02-22
==================
- Fixed type error when passing undefined to get
- BREAKING CHANGE: Renamed isASet to isStringMap
- Added isFlat method

0.9.6 / 2015-02-22
==================
- BREAKING CHANGE: turned length() into a getter. To migrate simply replace all calls to length() with length

0.9.5 / 2015-02-22
==================
- Added pretty param to toJSON
- Updated github links

0.9.4 / 2015-02-22
==================
- Fixed bug in rename method where renames of non-existing entities corrupted object.

0.9.3 / 2015-02-22
==================
- Merged mapValues and mapProperties methods into one map method with params and
  added an inplace flag
- Added fromXml method

0.9.2 / 2015-02-18
==================
- MapValues method

0.9.1 / 2015-02-18
==================
- Added toXml method
- Removed the "propertyName?" property from the fromCsv and similar methods. Now use
  the row index as the property name.
- Added mapProperties method
- Fixed a bug where overwriting a pair was not updating cache
- Minor tweaks and improvements

0.9.0 / 2015-02-17
==================
- BREAKING CHANGE: passing in arrays to create new Space instances will now set
the property names to "0 1 2 3...N" instead of "item item item..." This makes it
easier to go from JSON => Space => JSON. This reverts the change introduced in 0.7.0,
which was a bad idea.
- Added guessTypes parameter to the toJSON and toObject methods for turning
space objects into JS objects with type information. Result is better JSON => Space => JSON
flows.

0.8.12 / 2015-02-01
===================
- Added optional parameter to fromDelimited methods to set row property name in returned object.

0.8.11 / 2015-01-31
===================
- Added option to split to allow for returning Space object in addition to array
- Added toCsv, toSsv, toTsv, and toDelimited methods
- Added perf stubs
- Slight performance improvements

0.8.8 / 2015-01-17
==================
- Added fromFile, toFile, fromUrl, and toUrl methods

0.8.7 / 2015-01-09
==================
- Added fromHeredoc method
- Miscellaneous fixes and cleanup

0.8.6 / 2015-01-06
==================
- Added split method

0.8.5 / 2015-01-06
==================
- Added getArray method

0.8.4 / 2013-12-22
==================
- Bug fix in getCud method

0.8.3 / 2013-12-09
==================
- Performance improvement

0.8.2 / 2013-12-08
==================
- Added renameAll method

0.8.1 / 2013-12-07
==================
- Added getValues method

0.8.0 / 2013-11-19
==================
- BREAKING CHANGE: firstType is now firstProperty, getTypes is now getProperties, lastType is now lastProperty
- Renamed "Type/Types/type" to "Property/Properties/property". Thanks to @jyxt for calling me on that bad name :)

0.7.3 / 2013-11-15
==================
- Fixed bug in each method where the index was a typeof string instead of number.

0.7.2 / 2013-11-15
==================
- Delete methods refactor

0.7.1 / 2013-11-15
==================
- Passing an int to .delete() now deletes the pair with that numeric index.

0.7.0 / 2013-11-15
==================
- BREAKING CHANGE: when parsing JSON/Arrays, we no longer set the key/type as "0..1..2..". Instead, we set type as "item"

0.6.0 / 2013-11-14
==================
- BREAKING CHANGE: firstKey() is now firstType()
- BREAKING CHANGE: getKeys() is now getTypes()
- renamed all occurrences of key/Key to type/Types.
- updated version.js to support passing a v#.

0.5.15 / 2013-11-13
===================
- ran beautify

0.5.14 / 2013-11-13
===================
- added beautify command
- fixed 'make version' to update space.js as well

0.5.13 / 2013-11-13
===================
- added History.md
- added version.js and 'make version' command
- added toggle method
