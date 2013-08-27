//     genie.js
//     (c) 2013 Kent C. Dodds
//     genie.js may be freely distributed under the MIT license.
//     http://www.github.com/kentcdodds/genie.git
//     See README.md

;(function(global){

  var _wishes = {},
    _previousId = 0,
    _enteredMagicWords = {};
  
  function _getNextId() {
    return 'q-' + _previousId++;
  }
  
  function registerWish(magicWords, action, data, id) {
    if (!Array.isArray(magicWords)) {
      // If they passed an object instead.
      if (typeof magicWords === 'object') {
        return registerWish(magicWords.magicWords, magicWords.action, magicWords.data, magicWords.id);
      } else {
        magicWords = [magicWords];
      }
    }
    if (id === undefined) {
      id = _getNextId();
    }
    
    var wish = {
      id: id,
      data: data,
      magicWords: magicWords,
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
    var wish = _wishes[id];
    delete _wishes[id];
    for (var word in _enteredMagicWords) {
      if (_enteredMagicWords[word].indexOf(id) != -1) {
        _enteredMagicWords[word].splice(_enteredMagicWords[word].indexOf(id), 1);
      }
    }
    return wish;
  }
  
  function clearWishes() {
    _wishes = {};
    _enteredMagicWords = {};
  }
  
  function getMatchingWishes(magicWord) {
    var matchingWishIds = _enteredMagicWords[magicWord] || [];
    var otherMatchingWishId = _addOtherMatchingMagicWords(matchingWishIds, magicWord);
    var allWishIds = matchingWishIds.concat(otherMatchingWishId);
    var matchingWishes = [];
    for (var i = 0; i < allWishIds.length; i++) {
      matchingWishes.push(_wishes[allWishIds[i]]);
    }
    return matchingWishes;
  }
  
  function _addOtherMatchingMagicWords(currentMatchingWishIds, givenMagicWord) {
    var otherMatchingWishIds = [];
    for (var wishId in _wishes) {
      if (currentMatchingWishIds.indexOf(wishId) == -1) {
        var wish =_wishes[wishId];
        if (_anyMagicWordsMatch(wish.magicWords, givenMagicWord)) {
          otherMatchingWishIds.push(wishId);
        }
      }
    }
    return otherMatchingWishIds;
  }

  function _anyMagicWordsMatch(wishesMagicWords, givenMagicWord) {
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
    if (givenMagicWord.length > magicWord.length) {
      return false;
    }
    if (magicWord.indexOf(givenMagicWord) != -1) {
      return true;
    } else if (givenMagicWord.length == 1) {
      return false;
    }
    var charNumber = 0;
    for (var i = 0; i < givenMagicWord.length; i++) {
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
    // Check if it may be a wish object
    if (typeof id === 'object' && id.id) {
      id = id.id;
    }
    if (id === null || id === undefined) {
      var matchingWishes = getMatchingWishes(magicWord);
      if (matchingWishes.length > 0) {
        id = matchingWishes[0].id;
      }
    }
    if (_wishes[id] && _wishes[id].action) {
      _wishes[id].action(_wishes[id]);
    }
    
    if (magicWord !== undefined) {
      // Reset entered magicWords order.
      _enteredMagicWords[magicWord] = _enteredMagicWords[magicWord] || [];
      var arry = _enteredMagicWords[magicWord];
      var existingIndex = arry.indexOf(id);
      if (existingIndex != -1) {
        // If it already exists, remove it before re-adding it in the correct spot
        arry.splice(existingIndex, 1);
      }
      if (existingIndex != 1 && arry.length > 0) {
        // If it's not "on deck" then put it in the first slot and set the King of the Hill to be the id to go first.
        var first = arry[0];
        arry[0] = id;
        id = first;
      }
      arry.unshift(id);
    }
  }
  
  function options(options) {
    if (options) {
      _wishes = options.wishes || _wishes;
      _previousId = options.previousId || _previousId;
      _enteredMagicWords = options.enteredKeyWords || _enteredMagicWords;
    }
    return {
      wishes: _wishes,
      previousId: _previousId,
      enteredMagicWords: _enteredMagicWords
    };
  }
  
  global.genie = registerWish;
  global.genie.getMatchingWishes = getMatchingWishes;
  global.genie.makeWish = makeWish;
  global.genie.options = options;
  global.genie.deregisterWish = deregisterWish;
  global.genie.clearWishes = clearWishes;

})(this);
