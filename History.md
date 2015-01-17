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

