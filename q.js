//     q.js
//     (c) 2013 Kent C. Dodds
//     q.js may be freely distributed under the MIT license.

;(function(global){

  var _qObjs = {},
    _previousId = 0,
    _enteredKeywords = {};
  
  function _getNextId() {
    return 'q-' + _previousId++;
  }
  
  function registerAction(keywords, action, id) {
    if (!Array.isArray(keywords)) {
      keywords = [keywords];
    }
    if (id === undefined) {
      id = _getNextId();
    }
    
    var qObj = {
      id: id,
      keywords: keywords,
      action: action
    };
    _qObjs[id] = qObj;
    return _qObjs[id];
  }
  
  function getMatchingActions(keyword) {
    var matchingQObjIds = _enteredKeywords[keyword] || [];
    var otherMatchingQObjIds = _addOtherMatchingKeywords(matchingQObjIds, keyword);
    var allIds = matchingQObjIds.concat(otherMatchingQObjIds);
    var matchingQObjs = [];
    for (var i = 0; i < allIds.length; i++) {
      matchingQObjs.push(_qObjs[allIds[i]]);
    }
    return matchingQObjs;
  }
  
  function _addOtherMatchingKeywords(currentMatchingQObjIds, keyword) {
    var otherMatchingQObjIds = [];
    for (var prop in _qObjs) {
      if (currentMatchingQObjIds.indexOf(prop) == -1) {
        var qObj =_qObjs[prop];
        if (_anyKeywordsMatch(qObj.keywords, keyword)) {
          otherMatchingQObjIds.push(prop);
        }
      }
    }
    return otherMatchingQObjIds;
  }

  function _anyKeywordsMatch(keywords, keyword) {
    for (var i = 0; i < keywords.length; i++) {
      if (_stringsMatch(keywords[i], keyword)) {
        return true;
      }
    }
    return false;
  }
  
  function _stringsMatch(match, string) {
    string = string.toLowerCase();
    match = string.toLowerCase();
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
  
  function executeAction(id, keyword) {
    _qObjs[id].action();
    
    // Reset entered keywords order.
    _enteredKeywords[keyword] = _enteredKeywords[keyword] || [];
    var existingIndex = _enteredKeywords[keyword].indexOf(id);
    if (existingIndex != -1) {
      _enteredKeywords[keyword].splice(existingIndex, 1);
    }
    _enteredKeywords[keyword].unshift(id);
  }
  
  function setOptions(options) {
    _qObjs = options.qObjs || _qObjs;
    _previousId = options.previousId || _previousId;
    _enteredKeywords = options.enteredKeywords || _enteredKeywords;
  }
  
  global.q = registerAction;
  global.q.getMatchingActions = getMatchingActions;
  global.q.executeAction = executeAction;
  global.q.setOptions = setOptions;

})(this);
