/**
 * @name genie
 * @fileOverview A JavaScript library committed to improving
 * user experience by empowering users to interact with web
 * apps using the keyboard (better than cryptic shortcuts).
 *
 * http://www.github.com/kentcdodds/genie
 *
 * **Note:** This documentation was generated with
 * [autodocs](https://github.com/dtao/autodoc). Both autodocs and
 * this documentation are still under development. Any issues
 * you find about content can be assigned to
 * [genie issues](http://www.github.com/kentcdodds/genie)
 * any docs related issues can be assigned to
 * [autodocs issues](https://github.com/dtao/autodoc/issues).
 *
 * @license genie.js may be freely distributed under the MIT license.
 * @copyright (c) 2017 Kent C. Dodds
 * @author Kent C. Dodds <kent@doddsfamily.us>
 */

const genie = _passThrough(registerWish, {})
let _wishes = []
let _previousId = 0
let _enteredMagicWords = {}
const _defaultContext = ['universe']
let _originalMatchingAlgorithm = function _originalMatchingAlgorithm() {}
let _context = _defaultContext
const _pathContexts = []
let _previousContext = _defaultContext
let _enabled = true
let _returnOnDisabled = true
const _contextRegex = /\{\{(\d+)\}\}/g

/**
 * The _matchRankMap
 * @typedef {object} _matchRankMap
 * @property {number} equals - 5
 * @property {number} startsWith - 4
 * @property {number} wordStartsWith - 3
 * @property {number} contains - 2
 * @property {number} acronym - 1
 * @property {number} matches - 0
 * @property {number} noMatch - -1
 * @readonly
 * @private
 */
const _matchRankMap = {
  equals: 5,
  startsWith: 4,
  wordStartsWith: 3,
  contains: 2,
  acronym: 1,
  matches: 0,
  noMatch: -1,
}

/**
 * The context of a wish
 * @typedef {object} context
 * @property {Array.<string>} any
 * @property {Array.<string>} all
 * @property {Array.<string>} none
 * @public
 */

/**
 * Wish action callback definition
 * @callback WishAction
 * @param {wish} wish
 * @param {string} magicWord
 * @public
 */

/**
 * The wish object
 * @typedef {object} wish
 * @property {string} id - Unique identifier for the wish.
 * @property {context} context - The context of the wish. Can be given as a
 *   string or array. In which case it is assigned to the wish's context.any property.
 * @property {{timesMade: {total: number, magicWords: {string}}}} data - Any
 *   data you wish to associate with the wish.
 *   Genie adds a 'timesMade' property with total and magicWords
 *   properties to keep track of how often a wish is made with a
 *   given magicWord.
 * @property {Array.<string>} magicWords - Used to match this wish on genie.getMatchingWishes
 * @property {WishAction} action - The action to be performed when genie.makeWish is
 *    called with this wish.
 * @public
 */

/**
 * Wish Ids
 * @typedef {string|Array.<string>} wishIds
 * @public
 */

/**
 * A path context
 * @typedef {object} PathContext
 * @property {Array.<RegExp>} regexes
 * @property {Array.<string>} paths
 * @property {Array.<string>} contexts
 * @public
 */

/**
 * Letter in an entered magic words
 * @typedef {object} EnteredMagicLetter
 * @property {EnteredMagicLetter}
 * @property {Array.<string>} wishIds
 */

/**
 * The object used for genie's matching algorithm.
 * @typedef {object} EnteredMagicWords
 * @property {EnteredMagicLetter}
 * @property {Array.<string>} wishIds
 */

/**
 * **Note:** This is actually assigned to the `genie` variable, so
 * it is called like so: `genie({wish: object});`
 *
 * Creates and registers a new wish with the given pseudo wish(es).
 * @param {object|Array.<object>} wish pseudo wish(es)
 * @returns {wish|Array.<wish>} The registered wish or array of wishes.
 * @public
 */
function registerWish(wish) {
  if (_isArray(wish)) {
    const wishesRegistered = []
    _each(wish, w => {
      wishesRegistered.push(registerWish(w))
    })
    return wishesRegistered
  } else {
    const newWish = _createWish(wish)
    const existingWishIndex = _getWishIndexById(newWish.id)
    if (existingWishIndex < 0) {
      _wishes.push(newWish)
    } else {
      _wishes[existingWishIndex] = newWish
    }

    return newWish
  }
}

/**
 * Creates a new wish object.
 * @param {object} wish
 * @returns {wish} New wish object
 * @private
 */
function _createWish(wish) {
  const id = wish.id || `g-${_previousId++}`
  const newWish = {
    id,
    context: _createContext(wish.context),
    data: wish.data || {},
    magicWords: _arrayify(wish.magicWords),
    action: _createAction(wish.action),
  }
  newWish.data.timesMade = {
    total: 0,
    magicWords: {},
  }
  return newWish
}

/**
 * Transforms the given context to a context object.
 * @param {object|string|Array.<string>} context
 * @returns {context}
 * @private
 */
function _createContext(context) {
  let newContext = context || _defaultContext
  if (_isString(newContext) || _isArray(newContext)) {
    newContext = {
      any: _arrayify(newContext),
    }
  } else {
    newContext = _arrayizeContext(context)
  }
  return newContext
}

/**
 * Makes all the context properties arrays.
 * @param {object|string|Array.<string>} context
 * @returns {context}
 * @private
 */
function _arrayizeContext(context) {
  function checkAndAdd(type) {
    if (context[type]) {
      context[type] = _arrayify(context[type])
    }
  }
  checkAndAdd('all')
  checkAndAdd('any')
  checkAndAdd('none')
  return context
}

/**
 * Transforms the given action into an action
 * callback.
 * @param {Function|object|string} action
 * @returns {WishAction}
 * @private
 */
function _createAction(action) {
  if (_isString(action)) {
    action = {
      destination: action,
    }
  }
  if (_isObject(action)) {
    action = (function() {
      const openNewTab = action.openNewTab
      const destination = action.destination
      return function() {
        if (openNewTab) {
          window.open(destination, '_blank')
        } else {
          window.location.href = destination
        }
      }
    })()
  }

  return action
}

/**
 * Deregisters the given wish. Removes it from the registry
 *   and from the _enteredMagicWords map.
 * This will delete an _enteredMagicWords listing if this
 *   is the only wish in the list.
 * @param {object|string} wish The wish to deregister
 * @returns {wish} The deregistered wish
 * @public
 */
function deregisterWish(wish) {
  let indexOfWish = _wishes.indexOf(wish)
  if (!indexOfWish) {
    _each(_wishes, (aWish, index) => {
      // the given parameter could be an id.
      if (wish === aWish.id || wish.id === aWish.id) {
        indexOfWish = index
        wish = aWish
        return false
      }
    })
  }

  _wishes.splice(indexOfWish, 1)
  _removeWishIdFromEnteredMagicWords(wish.id)
  return wish
}

/**
 * Iterates through _enteredMagicWords and removes
 * all instances of this id. If this leaves the letter
 * empty it removes the letter.
 * @param {string} id
 * @private
 */
function _removeWishIdFromEnteredMagicWords(id) {
  function removeIdFromWishes(charObj, parent, charObjName) {
    _each(charObj, (childProp, propName) => {
      if (propName === 'wishes') {
        const index = childProp.indexOf(id)
        if (index !== -1) {
          childProp.splice(index, 1)
        }
        if (!childProp.length) {
          delete charObj[propName]
        }
      } else {
        removeIdFromWishes(childProp, charObj, propName)
      }
    })
    const keepCharObj = _getPropFromPosterity(charObj, 'wishes').length > 0
    if (!keepCharObj && parent && charObjName) {
      delete parent[charObjName]
    }
  }
  removeIdFromWishes(_enteredMagicWords)
}

/**
 * Convenience method which calls getWishesWithContext and passes the arguments
 *   which are passed to this function. Then deregisters each of these.
 * @param {string|Array.<string>} context The context the lookup
 * @param {string} [type='any'] 'all', 'any', or 'none' referring to the
 * context parameter
 * @param {string|Array.<string>} [wishContextTypes=['any', 'all', 'none']]
 * The type of wish contexts to compare
 * @returns {Array.<object>} the deregistered wishes.
 * @public
 */
function deregisterWishesWithContext(context, type, wishContextTypes) {
  const deregisteredWishes = getWishesWithContext(
    context,
    type,
    wishContextTypes,
  )
  _each(deregisteredWishes, (wish, i) => {
    deregisteredWishes[i] = deregisterWish(wish)
  })
  return deregisteredWishes
}

/**
 * Get wishes in a specific context. If no context
 *   is provided, all wishes are returned.
 *   Think of this as, if genie were in the given
 *   context, what would be returned if I called
 *   genie.getMatchingWishes()?
 * @param {string|Array.<string>} context The context(s)
 * to check wishes against.
 * @returns {Array.<wish>} The wish's which are in
 * the given context.
 * @public
 */
function getWishesInContext(context) {
  context = context || _defaultContext
  const wishesInContext = []
  _each(_wishes, wish => {
    if (
      _contextIsDefault(context) ||
      _contextIsDefault(wish.context) ||
      _wishInThisContext(wish, context)
    ) {
      wishesInContext.push(wish)
    }
  })
  return wishesInContext
}

/**
 * Get wishes which have {type} of {context} in their context.{wishContextType}
 * @param {string|Array.<string>} context The context the lookup
 * @param {string} [type='any'] 'all', 'any', or 'none' referring to the
 * context parameter
 * @param {string|Array.<string>} [wishContextTypes=['any', 'all', 'none']]
 * The type of wish contexts to compare
 * @returns {Array.<object>}
 * @public
 */
function getWishesWithContext(context, type, wishContextTypes) {
  const wishesWithContext = []
  type = type || 'any'
  _each(_wishes, wish => {
    const wishContext = _getWishContext(wish, wishContextTypes)

    if (
      !_isEmpty(wishContext) &&
      ((type === 'all' && _arrayContainsAll(wishContext, context)) ||
        (type === 'none' && _arrayContainsNone(wishContext, context)) ||
        (type === 'any' && _arrayContainsAny(wishContext, context)))
    ) {
      wishesWithContext.push(wish)
    }
  })
  return wishesWithContext
}

/**
 * Gets the wish context based on the wishContextTypes.
 * @param {object} wish
 * @param {string|Array.<string>} wishContextTypes
 * @returns {Array.<string>}
 * @private
 */
function _getWishContext(wish, wishContextTypes) {
  let wishContext = []
  wishContextTypes = wishContextTypes || ['all', 'any', 'none']

  wishContextTypes = _arrayify(wishContextTypes)
  _each(wishContextTypes, wishContextType => {
    if (wish.context[wishContextType]) {
      wishContext = wishContext.concat(wish.context[wishContextType])
    }
  })

  return wishContext
}

/**
 * Get a specific wish by an id.
 * If the id is an array, returns an array
 *   of wishes with the same order as the
 *   given array.
 * Note: If the id does not correspond to
 *   a registered wish, it will be undefined
 * @param {wishIds} id The id(s) to get wishes for
 * @returns {wish|Array.<wish>|null} The wish object(s)
 * @public
 */
function getWish(id) {
  if (_isArray(id)) {
    const wishes = []
    _each(_getWishIndexById(id), index => {
      wishes.push(_wishes[index])
    })
    return wishes
  } else {
    const index = _getWishIndexById(id)
    if (index > -1) {
      return _wishes[index]
    } else {
      return null
    }
  }
}

/**
 * Gets a wish from the _wishes array by its ID
 * @param {wishIds} id
 * @returns {wish|Array.<wish>}
 * @private
 */
function _getWishIndexById(id) {
  let wishIndex = -1
  if (_isArray(id)) {
    const wishIndexes = []
    _each(id, wishId => {
      wishIndexes.push(_getWishIndexById(wishId))
    })
    return wishIndexes
  } else {
    _each(_wishes, (aWish, index) => {
      if (aWish.id === id) {
        wishIndex = index
        return false
      }
    })
    return wishIndex
  }
}

/**
 * Sets genie's options to the default options
 * @returns {GenieOptions} Genie's old options
 * @public
 */
function reset() {
  const oldOptions = options()
  options({
    wishes: [],
    noWishMerge: true,
    previousId: 0,
    enteredMagicWords: {},
    context: _defaultContext,
    previousContext: _defaultContext,
    enabled: true,
  })
  return oldOptions
}

/**
 * Uses the given magic word to return an intelligently sorted
 *   list of wishes which are in context and match the magic word
 *   (based on their own magic words and genie's enteredMagicWords)
 * @param {?string} [magicWord=''] The magic word to match against
 * @returns {Array.<wish>} wishes The matching wishes.
 * @public
 */
function getMatchingWishes(magicWord) {
  magicWord = (_isNullOrUndefined(magicWord)
    ? ''
    : `${magicWord}`
  ).toLowerCase()
  const allWishIds = _getWishIdsInEnteredMagicWords(magicWord)
  const allWishes = getWish(allWishIds)
  const matchingWishes = _filterInContextWishes(allWishes)

  const otherMatchingWishIds = _sortWishesByMatchingPriority(
    _wishes,
    allWishIds,
    magicWord,
  )
  const otherWishes = getWish(otherMatchingWishIds)
  return matchingWishes.concat(otherWishes)
}

/**
 * Climbs down the chain with the _enteredMagicWords object to find
 *   where the word ends and then gets the 'wish' property from
 *   the posterity at that point in the _enteredMagicWords object.
 * @param {string} word
 * @returns {Array.<wish>}
 * @private
 */
function _getWishIdsInEnteredMagicWords(word) {
  const startingCharWishesObj = _climbDownChain(
    _enteredMagicWords,
    word.split(''),
  )
  if (startingCharWishesObj) {
    return _getPropFromPosterity(startingCharWishesObj, 'wishes', true)
  } else {
    return []
  }
}

/**
 * Returns a filtered array of the wishes which are in context.
 * @param {Array.<wish>} wishes - the wishes to filter
 * @returns {Array.<wish>} wishes - the wishes which are in context
 * @private
 */
function _filterInContextWishes(wishes) {
  const inContextWishes = []
  _each(wishes, wish => {
    if (wish && _wishInContext(wish)) {
      inContextWishes.push(wish)
    }
  })
  return inContextWishes
}

/**
 * Climbs down an object's properties based on the given
 * array of properties. (obj[props[0]][props[1]][props[2]] etc.)
 * @param {*} obj - the object to climb down.
 * @param {Array.<string>} props - the ordered list of properties
 * to climb down with
 * @returns {*}
 * @private
 * @examples
 * _climbDownChain({a: { b: {c: {d: 'hello'}}}}, ['a', 'b', 'c', 'd']) // => 'hello'
 */
function _climbDownChain(obj, props) {
  let finalObj = obj
  props = _arrayify(props)
  const madeItAllTheWay = _each(props, prop => {
    if (finalObj.hasOwnProperty(prop)) {
      finalObj = finalObj[prop]
      return true
    } else {
      return false
    }
  })
  if (madeItAllTheWay) {
    return finalObj
  } else {
    return null
  }
}

/**
 * Iterates through all child properties of the given object
 *   and if it has the given property, it will add that property
 *   to the array that's returned at the end.
 * @param {*} objToStartWith
 * @param {string} prop
 * @param {boolean} [unique=false]
 * @returns {Array.<object>}
 * @private
 * @examples
 * _getPropFromPosterity({a: {p: 1, b: {p: 2}}}, 'p') // => [1,2]
 */
function _getPropFromPosterity(objToStartWith, prop, unique) {
  let values = []
  function loadValues(obj) {
    if (obj[prop]) {
      const propsToAdd = _arrayify(obj[prop])
      _each(propsToAdd, propToAdd => {
        if (!unique || !_contains(values, propToAdd)) {
          values.push(propToAdd)
        }
      })
    }
    _each(obj, (oProp, oPropName) => {
      if (oPropName !== prop && !_isPrimitive(oProp)) {
        values = values.concat(loadValues(oProp))
      }
    })
  }
  loadValues(objToStartWith)
  return values
}

/**
 * A matchPriority for a wish
 * @typedef {object} MatchPriority
 * @property {number} matchType - based on _matchRankMap
 * @property {number} magicWordIndex - the index of the magic word
 *   in the wish's array of magic words.
 */

/**
 * Takes the given wishes and sorts them by how well they match the givenMagicWord.
 * The wish must be in context, and they follow the order defined in the
 * {@link "#_matchRankMap"}
 * @param {*} wishes
 * @param {Array.<string>} currentMatchingWishIds
 * @param givenMagicWord
 * @returns {Array.<string>}
 * @private
 */
function _sortWishesByMatchingPriority(
  wishes,
  currentMatchingWishIds,
  givenMagicWord,
) {
  const matchPriorityArrays = []
  let returnedIds = []

  _each(
    wishes,
    wish => {
      if (_wishInContext(wish)) {
        const matchPriority = _bestMagicWordsMatch(
          wish.magicWords,
          givenMagicWord,
        )
        _maybeAddWishToMatchPriorityArray(
          wish,
          matchPriority,
          matchPriorityArrays,
          currentMatchingWishIds,
        )
      }
    },
    true,
  )

  _each(
    matchPriorityArrays,
    matchTypeArray => {
      if (matchTypeArray) {
        _each(matchTypeArray, magicWordIndexArray => {
          if (magicWordIndexArray) {
            returnedIds = returnedIds.concat(magicWordIndexArray)
          }
        })
      }
    },
    true,
  )
  return returnedIds
}

/**
 * Gets the best magic words match of the wish's magic words
 * @param {string|Array.<string>} wishesMagicWords
 * @param {string} givenMagicWord
 * @returns {MatchPriority}
 * @private
 */
function _bestMagicWordsMatch(wishesMagicWords, givenMagicWord) {
  const bestMatch = {
    matchType: _matchRankMap.noMatch,
    magicWordIndex: -1,
  }
  _each(wishesMagicWords, (wishesMagicWord, index) => {
    const matchRank = _stringsMatch(wishesMagicWord, givenMagicWord)
    if (matchRank > bestMatch.matchType) {
      bestMatch.matchType = matchRank
      bestMatch.magicWordIndex = index
    }
    return bestMatch.matchType !== _matchRankMap.equals
  })
  return bestMatch
}

/**
 * Gives a _matchRankMap score based on
 * how well the two strings match.
 * @param {string} magicWord
 * @param {string} givenMagicWord
 * @returns {number}
 * @private
 */
function _stringsMatch(magicWord, givenMagicWord) {
  /* jshint maxcomplexity:8 */
  magicWord = `${magicWord}`.toLowerCase()

  // too long
  if (givenMagicWord.length > magicWord.length) {
    return _matchRankMap.noMatch
  }

  // equals
  if (magicWord === givenMagicWord) {
    return _matchRankMap.equals
  }

  // starts with
  if (magicWord.indexOf(givenMagicWord) === 0) {
    return _matchRankMap.startsWith
  }

  // word starts with
  if (magicWord.indexOf(` ${givenMagicWord}`) !== -1) {
    return _matchRankMap.wordStartsWith
  }

  // contains
  if (magicWord.indexOf(givenMagicWord) !== -1) {
    return _matchRankMap.contains
  } else if (givenMagicWord.length === 1) {
    // If the only character in the given magic word
    //   isn't even contained in the magic word, then
    //   it's definitely not a match.
    return _matchRankMap.noMatch
  }

  // acronym
  if (_getAcronym(magicWord).indexOf(givenMagicWord) !== -1) {
    return _matchRankMap.acronym
  }

  return _stringsByCharOrder(magicWord, givenMagicWord)
}

/**
 * Generates an acronym for a string.
 *
 * @param {string} string
 * @returns {string}
 * @private
 * @examples
 * _getAcronym('i love candy') // => 'ilc'
 * _getAcronym('water-fall in the spring-time') // => 'wfitst'
 */
function _getAcronym(string) {
  let acronym = ''
  const wordsInString = string.split(' ')
  _each(wordsInString, wordInString => {
    const splitByHyphenWords = wordInString.split('-')
    _each(splitByHyphenWords, splitByHyphenWord => {
      acronym += splitByHyphenWord.substr(0, 1)
    })
  })
  return acronym
}

/**
 * Returns a _matchRankMap.matches or noMatch score based on whether
 * the characters in the givenMagicWord are found in order in the
 * magicWord
 * @param {string} magicWord
 * @param {string} givenMagicWord
 * @returns {number}
 * @private
 */
function _stringsByCharOrder(magicWord, givenMagicWord) {
  let charNumber = 0

  function _findMatchingCharacter(matchChar, string) {
    let found = false
    for (let j = charNumber; j < string.length; j++) {
      const stringChar = string[j]
      if (stringChar === matchChar) {
        found = true
        charNumber = j + 1
        break
      }
    }
    return found
  }

  for (let i = 0; i < givenMagicWord.length; i++) {
    const matchChar = givenMagicWord[i]
    const found = _findMatchingCharacter(matchChar, magicWord)
    if (!found) {
      return _matchRankMap.noMatch
    }
  }
  return _matchRankMap.matches
}

/**
 * If the wish has a matchType which is not equal to the _matchRankMap.noMatch
 * and it is not contained in the currentMatchingWishIds, then it is added to
 * the matchPriorityArrays based on the matchPriority.
 * @param {wish} wish
 * @param {MatchPriority} matchPriority
 * @param {Array.<Array>} matchPriorityArrays
 * @param {wishIds} currentMatchingWishIds
 * @private
 */
function _maybeAddWishToMatchPriorityArray(
  wish,
  matchPriority,
  matchPriorityArrays,
  currentMatchingWishIds,
) {
  const indexOfWishInCurrent = currentMatchingWishIds.indexOf(wish.id)
  if (matchPriority.matchType !== _matchRankMap.noMatch) {
    if (indexOfWishInCurrent === -1) {
      _getMatchPriorityArray(matchPriorityArrays, matchPriority).push(wish.id)
    }
  } else if (indexOfWishInCurrent !== -1) {
    // remove current matching wishIds if it doesn't match
    currentMatchingWishIds.splice(indexOfWishInCurrent, 1)
  }
}

/**
 * Creates a spot in the given array for the matchPriority
 * @param {Array.<Array>} arry
 * @param {MatchPriority} matchPriority
 * @returns {Array.<string>}
 * @private
 */
function _getMatchPriorityArray(arry, matchPriority) {
  arry[matchPriority.matchType] = arry[matchPriority.matchType] || []
  const matchTypeArray = arry[matchPriority.matchType]
  const matchPriorityArray = (matchTypeArray[matchPriority.magicWordIndex] =
    matchTypeArray[matchPriority.magicWordIndex] || [])
  return matchPriorityArray
}

/**
 * Take the given wish/wish id and call it's action
 *   method if it is in context.
 * @param {wish|string} [wish] If null, then the first wish
 * to come back from getMatchingWishes(magicWord) will be made.
 * @param {string} magicWord The words to match the wish to.
 * This is used for
 *  1. Getting a wish if none is provided
 *  2. Passed as an argument to `wish.action`
 *  3. Updating the enteredMagicWords to improve future matching
 * @returns {wish} The wish which was made.
 * @public
 */
function makeWish(wish, magicWord) {
  magicWord = (!!magicWord ? `${magicWord}` : '').toLowerCase()
  wish = _convertToWishObjectFromNullOrId(wish, magicWord)

  if (!_wishCanBeMade(wish)) {
    return null
  }

  _executeWish(wish, magicWord)

  if (!_isNullOrUndefined(magicWord)) {
    _updateEnteredMagicWords(wish, magicWord)
  }
  return wish
}

/**
 * Convert the given wish argument to a valid wish object.
 *   It could be an ID, or null.
 * @param {wish|string} [wish] An id, wish object, or null.
 * @param {string} magicWord Used if wish is null to lookup
 * the nearest matching wish to be used.
 * @returns {wish} The wish object
 * @private
 */
function _convertToWishObjectFromNullOrId(wish, magicWord) {
  let wishObject = wish
  // Check if it may be a wish object
  if (!_isObject(wishObject)) {
    wishObject = getWish(wish)
  }
  if (_isNullOrUndefined(wishObject)) {
    const matchingWishes = getMatchingWishes(magicWord)
    if (matchingWishes.length > 0) {
      wishObject = matchingWishes[0]
    }
  }
  return wishObject
}

/** A wish is non-executable if it
 *   - doesn't exist
 *   - doesn't have an action
 *   - wish is not in context
 * @param {wish} wish The wish to check
 * @returns {boolean} Whether the wish can be made.
 * @private
 * @examples
 * _wishCanBeMade(null) // => false
 * _wishCanBeMade(undefined) // => false
 * _wishCanBeMade({}) // => false
 * _wishCanBeMade({action: function(){}}) // => false
 * _wishCanBeMade({action: function(){}, context: {any:'universe'}}) // => true
 */
function _wishCanBeMade(wish) {
  return !!wish && !_isNullOrUndefined(wish.action) && _wishInContext(wish)
}

/**
 * Calls the wish's action with the wish and
 *   magic word as the parameters and iterates
 *   the timesMade properties.
 *
 * @param {wish} wish
 * @param {string} magicWord
 * @private
 */
function _executeWish(wish, magicWord) {
  wish.action(wish, magicWord)
  const timesMade = wish.data.timesMade
  timesMade.total++
  timesMade.magicWords[magicWord] = timesMade.magicWords[magicWord] || 0
  timesMade.magicWords[magicWord]++
}

/**
 * Returns true if the given context is the default context.
 * @param {string|Array.<string>|context} context
 * @returns {boolean} contextIsDefault
 * @private
 * @examples
 * _contextIsDefault(_defaultContext[0]) // => true
 * _contextIsDefault(_defaultContext) // => true
 * _contextIsDefault(_defaultContext.concat(['1', '2', '3'])) // => true
 * _contextIsDefault('something else') // => false
 */
function _contextIsDefault(context) {
  if (!_isObject(context)) {
    context = _arrayify(context)
  }
  if (_isArray(context) && context.length === 1) {
    return context[0] === _defaultContext[0]
  } else if (context.any && context.any.length === 1) {
    return context.any[0] === _defaultContext[0]
  } else {
    return false
  }
}

/**
 * There are a few ways for a wish to be in context:
 *  1. Genie's context is equal to the default context
 *  2. The wish's context is equal to the default context
 *  3. The wish's context is equal to genie's context
 *  4. The wish is _wishInThisContext(_context)
 * @param {wish} wish
 * @returns {boolean} wishInContext
 * @private
 */
function _wishInContext(wish) {
  return (
    _contextIsDefault(_context) ||
    _contextIsDefault(wish.context) ||
    wish.context === _context ||
    _wishInThisContext(wish, _context)
  )
}

/**
 * This will get the any, all, and none constraints for the
 *   wish's context. If a constraint is not present, it is
 *   considered passing. The exception being if the wish has
 *   no context (each context property is not present). In
 *   this case, it is not in context.
 * These things must be true for the wish to be in the given context:
 *  1. any: genie's context contains any of these.
 *  2. all: genie's context contains all of these.
 *  3. none: genie's context contains none of these.
 *
 * @param {wish} wish
 * @param {string|Array.<string>} theContexts
 * @returns {boolean} wishInThisContext
 * @private
 */
function _wishInThisContext(wish, theContexts) {
  const any = wish.context.any || []
  const all = wish.context.all || []
  const none = wish.context.none || []

  const containsAny = _isEmpty(any) || _arrayContainsAny(theContexts, any)
  const containsAll =
    theContexts.length >= all.length && _arrayContainsAll(theContexts, all)
  const wishNoneContextNotContainedInContext = _arrayContainsNone(
    theContexts,
    none,
  )

  const wishContextConstraintsMet =
    containsAny && containsAll && wishNoneContextNotContainedInContext

  return wishContextConstraintsMet
}

/**
 * Updates the _enteredMagicWords map. Steps:
 *  1. Get or create a spot for the magic word in the map.
 *  2. If the wish is the first element in the map already,
 *    do nothing. (return)
 *  3. If the wish already exists in the map, remove it.
 *  4. If the wish was not already the second element,
 *    set is as the second element. If it was, set it
 *    as the first element.
 * @param {wish} wish
 * @param {string} magicWord
 * @private
 */
function _updateEnteredMagicWords(wish, magicWord) {
  // Reset entered magicWords order.
  const spotForWishes = _createSpotInEnteredMagicWords(
    _enteredMagicWords,
    magicWord,
  )
  spotForWishes.wishes = spotForWishes.wishes || []
  const existingIndex = spotForWishes.wishes.indexOf(wish.id)
  if (existingIndex !== 0) {
    _repositionWishIdInEnteredMagicWordsArray(
      wish.id,
      spotForWishes.wishes,
      existingIndex,
    )
  }
}

/**
 * Recursively creates a new object property if one does not exist
 * for each character in the chars string.
 * @param {object} spot
 * @param {string} chars
 * @returns {object} - the final object.
 * @private
 */
function _createSpotInEnteredMagicWords(spot, chars) {
  const firstChar = chars.substring(0, 1)
  const remainingChars = chars.substring(1)
  const nextSpot = (spot[firstChar] = spot[firstChar] || {})
  if (remainingChars) {
    return _createSpotInEnteredMagicWords(nextSpot, remainingChars)
  } else {
    return nextSpot
  }
}

/**
 * Updates the order of wish ids based on "king of the hill"
 *   and "on deck" concepts. Meaning, for a wish to be placed
 *   in front, it needs to be "on deck" which is the second
 *   position. If it is not already on deck then it will be
 *   placed in the second position. If it is on deck then it
 *   will replace the king of the hill and the king of the hill
 *   will be placed in the second position (on deck).
 * @param {string} id
 * @param {Array} arry
 * @param {number} existingIndex
 * @private
 */
function _repositionWishIdInEnteredMagicWordsArray(id, arry, existingIndex) {
  if (existingIndex !== -1) {
    // If it already exists, remove it before re-adding it in the correct spot
    arry.splice(existingIndex, 1)
  }
  if (existingIndex !== 1 && arry.length > 0) {
    // If it's not "on deck" then put it in the first slot and set the King of the Hill to be the id to go first.
    const first = arry[0]
    arry[0] = id
    id = first
  }
  arry.unshift(id)
}

/**
 * Gets the context paths that should be added based on the
 *   given path and the context paths that should be removed
 *   based ont he given path
 * @param {string} path
 * @returns {{add: Array, remove: Array}}
 * @private
 */
function _getContextsFromPath(path) {
  const allContexts = {
    add: [],
    remove: [],
  }
  _each(_pathContexts, pathContext => {
    let contextAdded = false
    const contexts = pathContext.contexts
    const regexes = pathContext.regexes
    const paths = pathContext.paths

    _each(regexes, regex => {
      regex.lastIndex = 0
      const matches = regex.exec(path)
      if (matches && matches.length > 0) {
        const contextsToAdd = []
        _each(contexts, context => {
          const replacedContext = context.replace(
            _contextRegex,
            (match, group) => {
              return matches[group]
            },
          )
          contextsToAdd.push(replacedContext)
        })
        allContexts.add = allContexts.add.concat(contextsToAdd)
        contextAdded = true
      }
      return !contextAdded
    })

    if (!contextAdded) {
      _each(paths, pathToTry => {
        if (path === pathToTry) {
          allContexts.add = allContexts.add.concat(contexts)
          contextAdded = true
        }
        return !contextAdded
      })
      if (!contextAdded) {
        allContexts.remove = allContexts.remove.concat(contexts)
      }
    }
  })
  return allContexts
}

/**
 * Gets all the pathContext.contexts that are regex contexts and matches
 *   those to genie's contexts. Returns all the matching contexts.
 * @returns {Array}
 * @private
 */
function _getContextsMatchingRegexPathContexts() {
  const regexContexts = []
  _each(_pathContexts, pathContext => {
    const contexts = pathContext.contexts

    _each(contexts, context => {
      if (_contextRegex.test(context)) {
        // context string is a regex context
        const replaceContextRegex = context.replace(_contextRegex, '.+?')

        _each(_context, currentContext => {
          if (new RegExp(replaceContextRegex).test(currentContext)) {
            regexContexts.push(currentContext)
          }
        })
      }
    })
  })
  return regexContexts
}

// Helpers //
/**
 * returns the obj in array form if it is not one already
 * @param {*} obj
 * @returns {Array.<*>}
 * @private
 * @examples
 * _arrayify('hello') // => ['hello']
 * _arrayify() // => []
 * _arrayify(['you', 'rock']) // => ['you', 'rock']
 * _arrayify({x: 3, y: 'sup'}) // => [{x: 3, y: 'sup'}]
 */
function _arrayify(obj) {
  if (!obj) {
    return []
  } else if (_isArray(obj)) {
    return obj
  } else {
    return [obj]
  }
}

/**
 * Adds items to the arry from the obj only if it
 *   is not in the arry already
 * @param {Array.<*>} arry
 * @param {*|Array.<*>} obj
 * @returns {Array.<*>} arry
 * @private
 * @examples
 * _addUniqueItems(1, 2) // => [1,2]
 * _addUniqueItems(1, [2,3]) // => [1,2,3]
 * _addUniqueItems([1,2], 3) // => [1,2,3]
 * _addUniqueItems([1,2], [3,4]) // => [1,2,3,4]
 * _addUniqueItems([1,2], [3,1]) // => [1,2,3]
 * _addUniqueItems([1,2], [1,2]) // => [1,2]
 * _addUniqueItems([1,2], [1,2]) // => [1,2]
 * _addUniqueItems([1,2,3], [1,2,1,2,3]) // => [1,2,3]
 */
function _addUniqueItems(arry, obj) {
  obj = _arrayify(obj)
  arry = _arrayify(arry)
  _each(obj, o => {
    if (arry.indexOf(o) < 0) {
      arry.push(o)
    }
  })
  return arry
}

/**
 * Removes all instances of items in the given obj
 *   from the given arry.
 * @param {Array.<*>} arry
 * @param {*|Array.<*>} obj
 * @returns {Array.<*>} arry
 * @private
 * @examples
 * _removeItems(1, 2) // => [1]
 * _removeItems(1, [2,3]) // => [1]
 * _removeItems([1,2], 3) // => [1,2]
 * _removeItems([1,2], [3,4]) // => [1,2]
 * _removeItems([1,2], [3,1]) // => [2]
 * _removeItems([1,2], [1,2]) // => []
 * _removeItems([1,2,1,2,3], [2,3]) // => [1,1]
 */
function _removeItems(arry, obj) {
  arry = _arrayify(arry)
  obj = _arrayify(obj)
  let i = 0

  while (i < arry.length) {
    if (_contains(obj, arry[i])) {
      arry.splice(i, 1)
    } else {
      i++
    }
  }
  return arry
}

/**
 * Returns true if arry1 contains any of arry2's elements
 * @param {*|Array.<*>} arry1
 * @param {*|Array.<*>} arry2
 * @returns {boolean}
 * @private
 * @examples
 * _arrayContainsAny(1, 2) // => false
 * _arrayContainsAny([1], 2) // => false
 * _arrayContainsAny(1, [2]) // => false
 * _arrayContainsAny([2], [2]) // => true
 * _arrayContainsAny([1,2], [2]) // => true
 */
function _arrayContainsAny(arry1, arry2) {
  arry1 = _arrayify(arry1)
  arry2 = _arrayify(arry2)
  for (let i = 0; i < arry2.length; i++) {
    if (_contains(arry1, arry2[i])) {
      return true
    }
  }
  return false
}

/**
 * Returns true if arry1 does not contain any of arry2's elements
 * @param {*|Array.<*>} arry1
 * @param {*|Array.<*>} arry2
 * @returns {boolean}
 * @private
 */
function _arrayContainsNone(arry1, arry2) {
  arry1 = _arrayify(arry1)
  arry2 = _arrayify(arry2)
  for (let i = 0; i < arry2.length; i++) {
    if (_contains(arry1, arry2[i])) {
      return false
    }
  }
  return true
}

/**
 * Returns true if arry1 contains all of arry2's elements
 * @param {*|Array.<*>} arry1
 * @param {*|Array.<*>} arry2
 * @returns {boolean}
 * @private
 */
function _arrayContainsAll(arry1, arry2) {
  arry1 = _arrayify(arry1)
  arry2 = _arrayify(arry2)
  for (let i = 0; i < arry2.length; i++) {
    if (!_contains(arry1, arry2[i])) {
      return false
    }
  }
  return true
}

/**
 * Whether an object has an index in an array
 * @param {Array.<*>} arry
 * @param {*} obj
 * @returns {boolean}
 * @private
 */
function _contains(arry, obj) {
  return arry.indexOf(obj) > -1
}

/**
 * Whether the given object is empty.
 * @param obj
 * @returns {boolean}
 * @private
 * @examples
 * _isEmpty() // => true
 * _isEmpty(null) // => true
 * _isEmpty(undefined) // => true
 * _isEmpty('') // => true
 * _isEmpty({}) // => true
 * _isEmpty([]) // => true
 * _isEmpty(1) // => false
 * _isEmpty('a') // => false
 * _isEmpty(['a', 'b']) // => false
 * _isEmpty({a: 'b'}) // => false
 */
function _isEmpty(obj) {
  if (_isNullOrUndefined(obj)) {
    return true
  } else if (_isArray(obj)) {
    return obj.length === 0
  } else if (_isString(obj)) {
    return obj === ''
  } else if (_isPrimitive(obj)) {
    return false
  } else if (_isObject(obj)) {
    return Object.keys(obj).length < 1
  } else {
    return false
  }
}
/**
 * @callback eachCallback
 * @param {*} item - the current array item
 * @param {number|string} indexOrName - the index or property name of the item
 * @param {Array.<*>} array - the whole array
 */

/**
 * Iterates through each own property of obj and calls the fn on it.
 *   If obj is an array: fn(val, index, obj)
 *   If obj is an obj: fn(val, propName, obj)
 * @param {object|Array.<*>} obj - the object or array to iterate through
 * @param {Function} fn - the function called each iteration.
 * @param {boolean} [reverse=false] - whether to iterate
 * through the array in reverse order.
 * @returns {boolean} - whether the loop broke early
 * @private
 * @examples
 * _each({a: 1, b: 'hello'}, callback) // => calls callback 2 times
 * _each([1,2], callback) // => calls callback 2 times
 * _each([], callback) // => calls callback 0 times
 */
function _each(obj, fn, reverse) {
  if (_isPrimitive(obj)) {
    obj = _arrayify(obj)
  }
  if (_isArray(obj)) {
    return _eachArray(obj, fn, reverse)
  } else {
    return _eachProperty(obj, fn)
  }
}

/**
 * If reverse is true, calls _eachArrayReverse(arry, fn)
 *   otherwise calls _eachArrayForward(arry, fn)
 * @param {Array.<*>} arry
 * @param {eachCallback} fn
 * @param {boolean} [reverse=false] - whether to iterate
 * through the array in reverse order.
 * @returns {boolean} - whether the loop broke early
 * @private
 */
function _eachArray(arry, fn, reverse) {
  if (reverse === true) {
    return _eachArrayReverse(arry, fn)
  } else {
    return _eachArrayForward(arry, fn)
  }
}

/**
 * Iterates through the array and calls the given function
 *   in reverse order.
 * @param {Array.<*>} arry
 * @param {eachCallback} fn
 * @returns {boolean} - whether the loop broke early
 * @private
 */
function _eachArrayReverse(arry, fn) {
  let ret = true
  for (let i = arry.length - 1; i >= 0; i--) {
    ret = fn(arry[i], i, arry)
    if (ret === false) {
      break
    }
  }
  return ret
}

/**
 * Iterates through the array and calls the given function
 * @param {Array.<*>} arry
 * @param {Function} fn
 * @returns {boolean} - whether the loop broke early
 * @private
 */
function _eachArrayForward(arry, fn) {
  let ret = true
  for (let i = 0; i < arry.length; i++) {
    ret = fn(arry[i], i, arry)
    if (ret === false) {
      break
    }
  }
  return ret
}

/**
 * Iterates through each property and calls the callback
 * if the object hasOwnProperty.
 * @param {object} obj
 * @param {Function} fn
 * @returns {boolean}
 * @private
 */
function _eachProperty(obj, fn) {
  let ret = true
  for (const prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      ret = fn(obj[prop], prop, obj)
      if (ret === false) {
        break
      }
    }
  }
  return ret
}

/**
 * @param {*} obj
 * @returns {boolean}
 * @private
 * @examples
 * _isArray([1]) // => true
 * _isArray({x: 1}) // => false
 * _isArray() // => false
 */
function _isArray(obj) {
  return obj instanceof Array
}

/**
 * @param {*} obj
 * @returns {boolean}
 * @private
 * @examples
 * _isString('') // => true
 * _isString({}) // => false
 * _isString([]) // => false
 * _isString(1) // => false
 * _isString(true) // => false
 */
function _isString(obj) {
  return typeof obj === 'string'
}

/**
 * @param {*} obj
 * @returns {boolean}
 * @private
 * @examples
 * _isObject({}) // => true
 * _isObject([]) // => true
 * _isObject(1) // => false
 * _isObject('a') // => false
 * _isObject(true) // => false
 */
function _isObject(obj) {
  return typeof obj === 'object'
}

/**
 * @param {*} obj
 * @returns {boolean}
 * @private
 * @examples
 * _isPrimitive('string') // => true
 * _isPrimitive(1) // => true
 * _isPrimitive(true) // => true
 * _isPrimitive(undefined) // => true
 * _isPrimitive(null) // => false
 * _isPrimitive({}) // => false
 * _isPrimitive([]) // => false
 */
function _isPrimitive(obj) {
  switch (typeof obj) {
    case 'string':
    case 'number':
    case 'boolean':
    case 'undefined':
      return true
    default:
      return false
  }
}

/**
 * @param {*|Array.<*>} obj
 * @returns {boolean}
 * @private
 * @examples
 * _isUndefined() // => true
 * _isUndefined(undefined) // => true
 * _isUndefined(null) // => false
 * _isUndefined({}) // => false
 * _isUndefined(1) // => false
 * _isUndefined(false) // => false
 * _isUndefined('defined') // => false
 * _isUndefined('defined') // => false
 * _isUndefined(['defined', undefined]) // => true
 * _isUndefined([undefined, undefined]) // => true
 */
function _isUndefined(obj) {
  if (_isArray(obj)) {
    return !_each(obj, o => {
      return !_isUndefined(o)
    })
  } else {
    return typeof obj === 'undefined'
  }
}

/**
 * @param {*} obj
 * @returns {boolean}
 * @private
 * @examples
 * _isNull(null) // => true
 * _isNull() // => false
 * _isNull(1) // => false
 * _isNull('hello') // => false
 * _isNull(true) // => false
 * _isNull(['hello', null]) // => true
 * _isNull([null, null]) // => true
 */
function _isNull(obj) {
  if (_isArray(obj)) {
    return !_each(obj, o => {
      return !_isNull(o)
    })
  } else {
    return obj === null
  }
}

/**
 * @param {*} obj
 * @returns {boolean}
 * @private
 * _isNullOrUndefined(null) // => true
 * _isNullOrUndefined() // => true
 * _isNullOrUndefined(undefined) // => true
 * _isNullOrUndefined(1) // => false
 * _isNullOrUndefined({}) // => false
 * _isNullOrUndefined('hello') // => false
 * _isNullOrUndefined(true) // => false
 * _isNullOrUndefined(['hello', null]) // => true
 * _isNullOrUndefined([undefined, null]) // => true
 * _isNullOrUndefined(false) // => false
 * _isNullOrUndefined('defined') // => false
 * _isNullOrUndefined('defined') // => false
 * _isNullOrUndefined(['defined', undefined]) // => true
 * _isNullOrUndefined([null, undefined]) // => true
 */
function _isNullOrUndefined(obj) {
  return _isNull(obj) || _isUndefined(obj)
}

/**
 * @typedef {object} GenieOptions
 * @property {Array.<wish>} wishes - All wishes registered with genie
 * @property {number} previousId - The number used to generate an
 * id for a newly registered wish
 * @property {object} enteredMagicWords - An exploded object of letters
 * to wishes and letters.
 * @property {Array.<string>} context - an array of all of genie's current contexts
 * @property {Array.<string>} previousContext - genie's most recent context
 * @property {boolean} enabled - whether genie is enabled
 * @property {boolean} returnOnDisabled - whether genie will return an
 * empty object when it is disabled.
 * @public
 */

/**
 * An api into genie's options
 * The opts argument can have the properties of GenieOptions
 * as well as the following property:
 *  - noWishMerge: boolean - Using this will simply assign the
 *    given wishes to genie's _wishes variable. If falsy, then
 *    genie.mergeWishes is called with the wishes.
 *
 * @param {object} [opts] - if not given, simply returns the options
 * @returns {GenieOptions}
 * @public
 */
function options(opts) {
  /* jshint maxcomplexity:8 */
  if (opts) {
    _updateWishesWithOptions(opts)
    _previousId = isNaN(opts.previousId) ? _previousId : opts.previousId
    _enteredMagicWords = opts.enteredMagicWords || _enteredMagicWords
    _context = opts.context || _context
    _previousContext = opts.previousContext || _previousContext
    _enabled = opts.enabled || _enabled
    _returnOnDisabled = opts.returnOnDisabled || _returnOnDisabled
  }
  return {
    wishes: _wishes,
    previousId: _previousId,
    enteredMagicWords: _enteredMagicWords,
    context: _context,
    previousContext: _previousContext,
    enabled: _enabled,
    returnOnDisabled: _returnOnDisabled,
  }
}

/**
 * This will override the matching algorithm ({@link #getMatchingWishes})
 *   You wont need to change how you interface with
 *   {@link #getMatchingWishes} at all by using this.
 * @param fn {Function} The new function. Should accept wishes array,
 *   magicWord string, and enteredMagicWords object.
 * @public
 */
function overrideMatchingAlgorithm(fn) {
  genie.getMatchingWishes = _passThrough(magicWord => {
    return fn(_wishes, magicWord, _context, _enteredMagicWords)
  }, [])
}

/**
 * This will set the matching algorithm back to the original
 * @returns {Function} The old matching algorithm
 * @public
 */
function restoreMatchingAlgorithm() {
  const oldMatchingAlgorithm = genie.getMatchingWishes
  genie.getMatchingWishes = _originalMatchingAlgorithm
  return oldMatchingAlgorithm
}

/**
 * If wishes are present, will update them based on options given.
 * @param {object} opts
 * @private
 */
function _updateWishesWithOptions(opts) {
  if (opts.wishes) {
    if (opts.noWishMerge) {
      _wishes = opts.wishes
    } else {
      mergeWishes(opts.wishes)
    }
  }
}

/**
 * Merges the given wishes with genie's current wishes.
 * Iterates through the wishes: If the wish does not have
 *   an action, and the wish's id is registered with genie,
 *   genie will assign the registered wish's action to
 *   the new wish's action property.
 *   Next, if the new wish has an action, it is registered
 *   with genie based on its wishId
 * @param {Array.<wish>} wishes Array of wish objects
 * @returns {Array.<wish>} All of genie's wishes
 * @public
 */
function mergeWishes(wishes) {
  _each(wishes, newWish => {
    let wishIndex = -1
    let existingWish = null
    _each(_wishes, (aWish, aWishIndex) => {
      if (aWish.id === newWish.id) {
        existingWish = aWish
        wishIndex = aWishIndex
        return false
      }
    })
    if (!newWish.action && existingWish) {
      newWish.action = existingWish.action
    }
    if (newWish.action) {
      _wishes[wishIndex] = newWish
    }
  })
  return _wishes
}

/**
 * Set's then returns genie's current context.
 * If no context is provided, simply acts as getter.
 * If a context is provided, genie's previous context
 *   is set to the context before it is assigned
 *   to the given context.
 * @param {string|Array.<string>} newContext The context to set genie's context to.
 * @returns {Array.<string>} The new context
 * @public
 */
function context(newContext) {
  if (!_isUndefined(newContext)) {
    _previousContext = _context
    if (!_isArray(newContext)) {
      newContext = [newContext]
    }
    _context = newContext
  }
  return _context
}

/**
 * Adds the new context to genie's current context.
 * Genie's context will maintain uniqueness, so don't
 *   worry about overloading genie's context with
 *   duplicates.
 * @param {string|Array.<string>} newContext The context to add
 * @returns {Array} Genie's new context
 * @public
 */
function addContext(newContext) {
  if (newContext && newContext.length) {
    _previousContext = _context
    _addUniqueItems(_context, newContext)
  }
  return _context
}

/**
 * Removes the given context
 * @param {string|Array.<string>} contextToRemove The context to remove
 * @returns {Array.<string>} Genie's new context
 * @public
 */
function removeContext(contextToRemove) {
  if (contextToRemove && contextToRemove.length) {
    _previousContext = _context
    _removeItems(_context, contextToRemove)
    if (_isEmpty(context)) {
      _context = _defaultContext
    }
  }
  return _context
}

/**
 * Changes genie's context to _previousContext
 * @returns {Array.<string>} The new context
 * @public
 */
function revertContext() {
  return context(_previousContext)
}

/**
 * Changes context to _defaultContext
 * @returns {Array.<string>} The new context
 * @public
 */
function restoreContext() {
  return context(_defaultContext)
}

/**
 * Updates genie's context based on the given path
 * @param {string} path the path to match
 * @param {boolean} [noDeregister] Do not deregister wishes
 *   which are no longer in context
 * @returns {Array.<string>} The new context
 * @public
 */
function updatePathContext(path, noDeregister) {
  if (path) {
    const allContexts = _getContextsFromPath(path)
    const contextsToAdd = allContexts.add
    let contextsToRemove = _getContextsMatchingRegexPathContexts()
    contextsToRemove = contextsToRemove.concat(allContexts.remove)

    removeContext(contextsToRemove)

    if (!noDeregister) {
      // There's no way to prevent users of genie from adding wishes that already exist in genie
      //   so we're completely removing them here
      deregisterWishesWithContext(contextsToRemove)
    }

    addContext(contextsToAdd)
  }
  return _context
}

/**
 * Add a path context to genie's pathContexts
 * @param {Array.<PathContext>} pathContexts The path context to add
 * @returns {Array.<PathContext>} The new path contexts
 * @public
 */
function addPathContext(pathContexts) {
  _each(pathContexts, pathContext => {
    if (pathContext.paths) {
      pathContext.paths = _arrayify(pathContext.paths)
    }

    if (pathContext.regexes) {
      pathContext.regexes = _arrayify(pathContext.regexes)
    }

    if (pathContext.contexts) {
      pathContext.contexts = _arrayify(pathContext.contexts)
    }
  })
  _addUniqueItems(_pathContexts, pathContexts)
  return _pathContexts
}

/**
 * Removes the given path contexts from genie's path contexts
 * @param {Array.<PathContext>} pathContext - The path context
 * object to remove. Must be equal to the object that was added
 * previously. No support for ids etc.
 * @returns {Array.<PathContext>} Genie's new path context
 * @public
 */
function removePathContext(pathContext) {
  _removeItems(_pathContexts, pathContext)
  return _pathContexts
}

/**
 * Set/get genie's enabled state
 * @param {boolean} [newState] The new state for `enabled`
 * @returns {boolean} Genie's enabled state
 * @public
 */
function enabled(newState) {
  if (newState !== undefined) {
    _enabled = newState
  }
  return _enabled
}

/**
 * Set/get genie's returnOnDisabled state
 * This defines whether genie will return an empty
 *   object when it is disabled. Useful for when you
 *   want to disable genie, but don't want to do
 *   null checks in your code everywhere you use genie.
 * @param {boolean} [newState] The new state for `returnOnDisabled`
 * @returns {boolean} Genie's returnOnDisabled state
 * @public
 */
function returnOnDisabled(newState) {
  if (newState !== undefined) {
    _returnOnDisabled = newState
  }
  return _returnOnDisabled
}

/**
 * Used to hijack public api functions for the
 *   enabled feature
 * @param {Function} fn
 * @param {*} emptyRetObject
 * @returns {Function}
 * @private
 */
function _passThrough(fn, emptyRetObject) {
  // eslint-disable-next-line babel/no-invalid-this
  const _thusly = this
  return function hijackedFunction() {
    if (_enabled || fn === enabled) {
      // eslint-disable-next-line prefer-rest-params
      return fn.apply(_thusly, arguments)
    } else if (_returnOnDisabled) {
      return emptyRetObject
    } else {
      return null
    }
  }
}

genie.deregisterWish = _passThrough(deregisterWish, {})
genie.deregisterWishesWithContext = _passThrough(
  deregisterWishesWithContext,
  [],
)
genie.getMatchingWishes = _passThrough(getMatchingWishes, [])
genie.overrideMatchingAlgorithm = _passThrough(overrideMatchingAlgorithm, {})
genie.restoreMatchingAlgorithm = _passThrough(restoreMatchingAlgorithm, {})
genie.getWishesInContext = _passThrough(getWishesInContext, [])
genie.getWishesWithContext = _passThrough(getWishesWithContext, [])
genie.getWish = _passThrough(getWish, {})
genie.makeWish = _passThrough(makeWish, {})
genie.reset = _passThrough(reset, {})
genie.options = _passThrough(options, {})
genie.mergeWishes = _passThrough(mergeWishes, {})
genie.context = _passThrough(context, [])
genie.addContext = _passThrough(addContext, [])
genie.removeContext = _passThrough(removeContext, [])
genie.revertContext = _passThrough(revertContext, [])
genie.restoreContext = _passThrough(restoreContext, [])
genie.updatePathContext = _passThrough(updatePathContext, [])
genie.addPathContext = _passThrough(addPathContext, [])
genie.removePathContext = _passThrough(removePathContext, [])
genie.enabled = _passThrough(enabled, false)
genie.returnOnDisabled = _passThrough(returnOnDisabled, true)
genie.version = '0.4.0'

_originalMatchingAlgorithm = genie.getMatchingWishes

export default genie

// TODO: enable all of these rules...
/*
eslint
  valid-jsdoc:0,
  no-shadow:0,
  func-names:0,
  consistent-return:0,
  complexity:[2, 10],
  no-multi-assign:0,
  no-negated-condition:0
*/
