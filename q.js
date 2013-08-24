//     q.js
//     (c) 2013 Kent C. Dodds
//     q.js may be freely distributed under the MIT license.
/*
 * Vernacular:
 *  Q: The race in Star Trek who had the power to do anything they wanted
 *  Magic Word: Keywords used to make a wish
 *  Wish: An action with a set of magic words
 */

;(function(global){

  var _wishes = {},
    _previousId = 0,
    _enteredMagicWords = {};
  
  function _getNextId() {
    return 'q-' + _previousId++;
  }
  
  function registerWish(magicWords, action, id) {
    if (!Array.isArray(magicWords)) {
      magicWords = [magicWords];
    }
    if (id === undefined) {
      id = _getNextId();
    }
    
    var qObj = {
      id: id,
      keywords: magicWords,
      action: action
    };
    _wishes[id] = qObj;
    return _wishes[id];
  }
  
  function getMatchingWishes(magicWord) {
    var matchingWishes = _enteredMagicWords[magicWord] || [];
    var otherMatchingWishes = _addOtherMatchingKeywords(matchingWishes, magicWord);
    var allIds = matchingWishes.concat(otherMatchingWishes);
    var matchingQObjs = [];
    for (var i = 0; i < allIds.length; i++) {
      matchingQObjs.push(_wishes[allIds[i]]);
    }
    return matchingQObjs;
  }
  
  function _addOtherMatchingKeywords(currentMatchingWishIds, givenMagicWord) {
    var otherMatchingWishIds = [];
    for (var wishId in _wishes) {
      if (currentMatchingWishIds.indexOf(wishId) == -1) {
        var wish =_wishes[wishId];
        if (_anyKeywordsMatch(wish.keywords, givenMagicWord)) {
          otherMatchingWishIds.push(wishId);
        }
      }
    }
    return otherMatchingWishIds;
  }

  function _anyKeywordsMatch(wishesMagicWords, givenMagicWord) {
    for (var i = 0; i < wishesMagicWords.length; i++) {
      if (_stringsMatch(wishesMagicWords[i], givenMagicWord)) {
        return true;
      }
    }
    return false;
  }
  
  function _stringsMatch(match, string) {
    string = string.toLowerCase();
    match = match.toLowerCase();
    for (var i = 0; i < match.length; i++) {
      var charNumber = 0;
      var matchChar = match[i];
      var found = false;
      for (var j = charNumber; j < string.length; j++) {
        var stringChar = string[j];
        if (stringChar == matchChar) {
          found = true;
          charNumber = j + 1;
          break;
        }
      }
      if (!found) {
        return false;
      }
    }
    return true;
  }
  
  function makeWish(id, magicWord) {
    _wishes[id].action();
    
    // Reset entered keywords order.
    _enteredMagicWords[magicWord] = _enteredMagicWords[magicWord] || [];
    var existingIndex = _enteredMagicWords[magicWord].indexOf(id);
    if (existingIndex != -1) {
      _enteredMagicWords[magicWord].splice(existingIndex, 1);
    }
    _enteredMagicWords[magicWord].unshift(id);
  }
  
  function setOptions(options) {
    _wishes = options.wishes || _wishes;
    _previousId = options.previousId || _previousId;
    _enteredMagicWords = options.enteredKeyWords || _enteredMagicWords;
  }
  
  global.q = registerWish;
  global.q.getMatchingWishes = getMatchingWishes;
  global.q.makeWish = makeWish;
  global.q.setOptions = setOptions;

})(this);
