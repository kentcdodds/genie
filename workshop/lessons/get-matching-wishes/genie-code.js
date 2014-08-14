// Get Matching Wishes
function register(magicWords, type) {
  // Note: you can put whatever you want in data.
  return genie({
    magicWords: magicWords,
    action: function() {},
    data: {
      type: type
    }
  });
}

var equal = register('wish', 'equal');
var magicWordStartsWith = register('Wishing you were somehow here again...', 'starts with');
var wordStartsWith = register('I wish you were here', 'word starts with');
var contains = register('hashtagwishing', 'contains');
var acronym = register('What is so hilarious?', 'acronym');
var matches = register('I want a city street home', 'matches');

function makeAndPrint(wish, magicWord, note) {
  var log = '\n\n';
  if (wish) {
    log += 'Making ' + wish.data.type + ' wish and ';
    genie.makeWish(wish, magicWord);
  }
  console.log(log + 'getting matching wishes with magic word "' + magicWord + '":');
  var matchingWishes = genie.getMatchingWishes(magicWord);
  for (var i = 0; i < matchingWishes.length; i++) {
    console.log('  ' + (i + 1) + '. ' + matchingWishes[i].magicWords + ' - ' + matchingWishes[i].data.type);
  }
  console.log('\nNotice that ' + note);
}

console.log('This is the normal case:');
makeAndPrint(null, 'wish', 'they are in the expected order');
makeAndPrint(contains, 'wish', 'the contains wish is the "King of the Hill"');
makeAndPrint(acronym, 'wish', 'the contains wish is still the "King of the Hill", but the acronym wish is now "On Deck"');
makeAndPrint(acronym, 'wish', 'the acronym wish is the "King of the Hill", and now the contains wish is now "On Deck"');
makeAndPrint(null, 'wi', 'even though "wi" was never used to make a wish, genie is predicting that the priority lies with the same as "wish"');
makeAndPrint(matches, 'wi', 'the matches wish is first, then the other two, then the rest.');

console.log('\n\nAdding another wish with multiple magic words.');

var equal2 = register(['no-match', 'wish'], 'equal2');
makeAndPrint(null, 'wish', 'even though equal2 was registered after equal, equal comes before equal2 because equal2\'s matching magicWord is the second in the array');

console.log('\n\nIn case you\'re interested, this is what genie\'s entered magic words looks like:');
console.log(JSON.stringify(genie.options().enteredMagicWords, null, 2));

