//     genie.js
//     (c) 2013 Kent C. Dodds
//     genie.js may be freely distributed under the MIT license.
/*
 * Vernacular:
 *  Genie: a spirit of Arabian folklore, as traditionally depicted
  *   imprisoned within a bottle or oil lamp, and capable of
   *  granting wishes when summoned.
 *  Magic Word: Keywords used to make a wish.
  *   The genie matches a given magic word to magic words for
   *  a wish to find the closeset match and executes the wishe's action
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
    
    var wish = {
      id: id,
      keywords: magicWords,
      action: action
    };
    _wishes[id] = wish;
    return _wishes[id];
  } 

  function deregisterWish(id) {
    // Check if it may be a wish object
    if (typeof id === 'object' && id.id) {
      id = id.id;
    }
    delete _wishes[id];
    for (var word in _enteredMagicWords) {
      if (_enteredMagicWords[word].indexOf(id) != -1) {
        _enteredMagicWords[word].splice(_enteredMagicWords[word].indexOf(id), 1);
      }
    }
  }
  
  function clearWishes() {
    _wishes = {};
    _enteredMagicWords = {};
  }
  
  function getMatchingWishes(magicWord) {
    var matchingWishIds = _enteredMagicWords[magicWord] || [];
    var otherMatchingWishId = _addOtherMatchingKeywords(matchingWishIds, magicWord);
    var allWishIds = matchingWishIds.concat(otherMatchingWishId);
    var matchingWishes = [];
    for (var i = 0; i < allWishIds.length; i++) {
      matchingWishes.push(_wishes[allWishIds[i]]);
    }
    return matchingWishes;
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
  
  function _stringsMatch(magicWord, givenMagicWord) {
    magicWord = magicWord.toLowerCase();
    givenMagicWord = givenMagicWord.toLowerCase();
    for (var i = 0; i < givenMagicWord.length; i++) {
      var charNumber = 0;
      var matchChar = givenMagicWord[i];
      var found = false;
      for (var j = charNumber; j < magicWord.length; j++) {
        var stringChar = magicWord[j];
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
    if (id === null || id === undefined) {
      var matchingWishes = getMatchingWishes(magicWord);
      if (matchingWishes.length > 0) {
        id = matchingWishes[0].id;
      }
    }
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
  
  global.genie = registerWish;
  global.genie.getMatchingWishes = getMatchingWishes;
  global.genie.makeWish = makeWish;
  global.genie.setOptions = setOptions;
  global.genie.deregisterWish = deregisterWish;
  global.genie.clearWishes = clearWishes;

})(this);
