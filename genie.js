//     genie.js
//     (c) 2013 Kent C. Dodds
//     genie.js may be freely distributed under the MIT license.
//     http://www.github.com/kentcdodds/genie.git
//     See README.md

;(function(global){

  var _wishes = {},
    _previousId = 0,
    _enteredMagicWords = {},
    _context = 'universe'
    _previousContext = 'universe';
  
  function _getNextId() {
    return 'g-' + _previousId++;
  }
  
  function registerWish(magicWords, action, context, data, id) {
    if (!Array.isArray(magicWords)) {
      // If they passed an object instead.
      if (typeof magicWords === 'object') {
        return registerWish(magicWords.magicWords, magicWords.action, magicWords.context, magicWords.data, magicWords.id);
      } else {
        magicWords = [magicWords];
      }
    }
    if (id === undefined) {
      id = _getNextId();
    }

    // Verify none of the magic words are objects
    for (var i = 0; i < magicWords.length; i++) {
      if (typeof magicWords[i] === 'object') {
        throw 'Cannot make an object a magic word!\n' + JSON.stringify(magicWords, null, 2);
      }
    }
    
    var wish = {
      id: id,
      context: context || 'universe',
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
    var otherMatchingWishId, allWishIds, matchingWishes, i; //Hoist-it!
    if (magicWord === undefined) {
      magicWord = '';
    } else if (magicWord === null) {
      return [];
    } else if (typeof magicWord === 'object') {
      throw 'Cannot match wishes to an object!\n' + JSON.stringify(magicWord, null, 2);
    }
    
    allWishIds = _enteredMagicWords[magicWord] || [];
    
    otherMatchingWishId = _getOtherMatchingMagicWords(allWishIds, magicWord);
    allWishIds = allWishIds.concat(otherMatchingWishId);
    
    matchingWishes = [];
    for (i = 0; i < allWishIds.length; i++) {
      matchingWishes.push(_wishes[allWishIds[i]]);
    }
    return matchingWishes;
  }
  
  function _getOtherMatchingMagicWords(currentMatchingWishIds, givenMagicWord) {
    var containsMagicWordWishIds = [];
    var acronymMagicWordWishIds = [];
    var otherMatchingWishIds = [];
    for (var wishId in _wishes) {
      if (currentMatchingWishIds.indexOf(wishId) == -1) {
        var wish =_wishes[wishId];
        if (wish.context === _context) {
          var matchType = _bestMagicWordsMatch(wish.magicWords, givenMagicWord);
          switch (matchType) {
            case 'contains':
              containsMagicWordWishIds.push(wishId);
              break;
            case 'acronym':
              acronymMagicWordWishIds.push(wishId);
              break;
            case 'matches':
              otherMatchingWishIds.push(wishId);
              break;
            case '':
              break; // no match
          }
        }
      }
    }
    return containsMagicWordWishIds.concat(acronymMagicWordWishIds).concat(otherMatchingWishIds);
  }

  function _bestMagicWordsMatch(wishesMagicWords, givenMagicWord) {
    var bestMatch = '';
    for (var i = 0; i < wishesMagicWords.length; i++) {
      var matchType = _stringsMatch(wishesMagicWords[i], givenMagicWord);
      if ((matchType === 'contains')
        || (matchType === 'acronym' && (bestMatch === '' || bestMatch === 'matches'))
        || (matchType === 'matches' && bestMatch === '')) {
        bestMatch = matchType;
      }
      if (bestMatch === 'contains') {
        break;
      }
    }
    return bestMatch;
  }
  
  function _stringsMatch(magicWord, givenMagicWord) {
    var magicWordWords, splitByHyphen, acronym = '';
    
    magicWord = ('' + magicWord).toLowerCase();
    givenMagicWord = ('' + givenMagicWord).toLowerCase();
    
    // too long
    if (givenMagicWord.length > magicWord.length) {
      return '';
    }
    
    // contains
    if (magicWord.indexOf(givenMagicWord) != -1) {
      return 'contains';
    } else if (givenMagicWord.length == 1) {
      return '';
    }
    
    // acronym
    magicWordWords = magicWord.split(' ');
    for (var i = 0; i < magicWordWords.length; i++) {
      splitByHyphen = magicWordWords[i].split('-');
      for (var j = 0; j < splitByHyphen.length; j++) {
        acronym += splitByHyphen[j].substr(0, 1);
      }
    }
    if (acronym.indexOf(givenMagicWord) != -1) {
      return 'acronym';
    }
    
    return _stringsByCharOrder(magicWord, givenMagicWord);
  }
  
  function _stringsByCharOrder(magicWord, givenMagicWord) {
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
        return '';
      }
    }
    return 'matches';
  }
  
  function makeWish(wish, magicWord) {
    var id, arry, existingIndex, first, matchingWishes;
    // Check if it may be a wish object
    if (typeof wish !== 'object') {
      wish = _wishes[wish];
    }
    if (wish === null || wish === undefined) {
      matchingWishes = getMatchingWishes(magicWord);
      if (matchingWishes.length > 0) {
        wish = matchingWishes[0];
      }
    }

    /* Don't execute the wish and return null if it:
     *   - doesn't exist
     *   - isn't in the registry
     *   - doesn't have an action
     *   - context doesn't match the current context
     */
    if (!wish || !_wishes[wish.id] || !wish.action || wish.context !== _context) {
      return null;
    }

    wish.action(wish);

    if (magicWord !== undefined) {
      // Reset entered magicWords order.
      _enteredMagicWords[magicWord] = _enteredMagicWords[magicWord] || [];
      id = wish.id;
      arry = _enteredMagicWords[magicWord];
      existingIndex = arry.indexOf(id);
      if (existingIndex != -1) {
        // If it already exists, remove it before re-adding it in the correct spot
        arry.splice(existingIndex, 1);
      }
      if (existingIndex != 1 && arry.length > 0) {
        // If it's not "on deck" then put it in the first slot and set the King of the Hill to be the id to go first.
        first = arry[0];
        arry[0] = id;
        id = first;
      }
      arry.unshift(id);
    }
    return wish;
  }
  
  function options(options) {
    if (options) {
      _wishes = options.wishes || _wishes;
      _previousId = options.previousId || _previousId;
      _enteredMagicWords = options.enteredKeyWords || _enteredMagicWords;
      _context = options.context || _context;
      _previousContext = options.previousContext || _previousContext;
    }
    return {
      wishes: _wishes,
      previousId: _previousId,
      enteredMagicWords: _enteredMagicWords,
      contexts: _context,
      previousContext: _previousContext
    };
  }

  function context(newContext) {
    if (newContext) {
      _previousContext = _context;
      _context = newContext;
    }
    return _context;
  }

  function revertContext() {
    return context(_previousContext);
  }

  function restoreContext() {
    return context('universe');
  }
  
  global.genie = registerWish;
  global.genie.getMatchingWishes = getMatchingWishes;
  global.genie.makeWish = makeWish;
  global.genie.options = options;
  global.genie.deregisterWish = deregisterWish;
  global.genie.clearWishes = clearWishes;
  global.genie.context = context;
  global.genie.revertContext = revertContext;
  global.genie.restoreContext = restoreContext;

})(this);
